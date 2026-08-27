const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname,port=Number(process.env.PORT||8000),model=process.env.OPENAI_MODEL||'gpt-5.4-mini';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.md':'text/markdown; charset=utf-8'};
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data))}
function body(req){return new Promise((resolve,reject)=>{let data='';req.on('data',c=>{data+=c;if(data.length>20000)reject(new Error('요청이 너무 큽니다.'))});req.on('end',()=>{try{resolve(JSON.parse(data||'{}'))}catch{reject(new Error('JSON 형식이 올바르지 않습니다.'))}});req.on('error',reject)})}
async function review(req,res){
  if(!process.env.OPENAI_API_KEY)return json(res,503,{error:'OPENAI_API_KEY 환경변수가 설정되지 않았습니다.'});
  try{
    const {question='',answer='',keywords=[]}=await body(req);
    if(typeof answer!=='string'||answer.trim().length<5)return json(res,400,{error:'검토할 영어 답변이 너무 짧습니다.'});
    const schema={type:'object',additionalProperties:false,properties:{verdict:{type:'string'},relevance:{type:'string'},logic:{type:'string'},corrections:{type:'array',items:{type:'object',additionalProperties:false,properties:{original:{type:'string'},corrected:{type:'string'},reasonKo:{type:'string'}},required:['original','corrected','reasonKo']}},minimalRevision:{type:'string'},naturalAnswer:{type:'string'}},required:['verdict','relevance','logic','corrections','minimalRevision','naturalAnswer']};
    const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model,store:false,instructions:'당신은 TOEIC Speaking 입문자의 영어 답변 코치입니다. 질문 관련성, 선택-이유-결과 논리, 문법과 자연스러움을 평가하세요. 설명은 간결한 한국어로 작성하세요. 학습자의 원래 표현을 최대한 유지한 최소 수정 답변과 더 자연스러운 추천 답변을 구분하세요.',input:`질문: ${question}\n핵심어: ${keywords.join(', ')}\n학습자 답변: ${answer}`,text:{format:{type:'json_schema',name:'toeic_speaking_review',strict:true,schema}},max_output_tokens:800})});
    const data=await response.json();
    if(!response.ok)return json(res,response.status,{error:data?.error?.message||'OpenAI API 요청에 실패했습니다.'});
    const outputText=data.output_text||data.output?.flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text;
    if(!outputText)throw new Error('AI 응답에서 결과를 찾지 못했습니다.');
    return json(res,200,JSON.parse(outputText));
  }catch(error){return json(res,500,{error:error.message||'AI 첨삭 중 오류가 발생했습니다.'})}
}
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(req.method==='POST'&&url.pathname==='/api/review')return review(req,res);
  if(req.method!=='GET')return json(res,405,{error:'허용되지 않은 요청입니다.'});
  const name=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1)),file=path.resolve(root,name);
  if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory())return json(res,404,{error:'파일을 찾을 수 없습니다.'});
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);
}).listen(port,()=>console.log(`토스 로직 노트: http://localhost:${port}\nAI 모델: ${model}`));
