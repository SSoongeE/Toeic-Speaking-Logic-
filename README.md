# 토스 로직 노트

한국어 4단 논리 → 단계별 영어 힌트 → 영어 답변 → 규칙 기반 점검 → 복습 흐름의 토익스피킹 연습 앱입니다.

## 실행

`index.html`을 브라우저에서 열면 됩니다. 설치, npm, API 키가 필요 없습니다. 마이크 녹음은 보안 정책상 localhost 또는 HTTPS에서 가장 안정적입니다.

```powershell
python -m http.server 8000
```

이후 `http://localhost:8000`을 엽니다. 답변과 진도는 브라우저 localStorage에만 저장됩니다. 자동 점검은 AI나 공식 점수 예측이 아닌 제한적인 규칙 검사입니다.

## OpenAI AI 첨삭 실행

API 키는 `index.html`에 입력하지 말고 환경변수로만 설정합니다. PowerShell에서 앱 폴더로 이동한 뒤 실행하세요.

```powershell
$env:OPENAI_API_KEY="본인의 OpenAI API 키"
& "C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" .\server.js
```

그 후 브라우저에서 `http://localhost:8000`을 엽니다. 영어 답변이 7단어 이상이고 입력이 1.5초 동안 멈추면 AI 첨삭이 자동으로 실행됩니다. 기본 모델은 `gpt-5.4-mini`이며 필요하면 `OPENAI_MODEL` 환경변수로 변경할 수 있습니다.

API 요청은 사용량에 따라 비용이 발생합니다. 입력한 영어 질문과 답변은 첨삭을 위해 OpenAI API로 전송됩니다.
