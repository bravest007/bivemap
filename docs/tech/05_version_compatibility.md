# BiveMap 기술 스택 및 버전 매트릭스 (Version Matrix)

이 문서는 BiveMap 시스템이 완벽하게 결함 없이 작동하는 **'Golden Master' 버전 명세**입니다.
이후 개발 서버 이동이나 재설치 시, 모듈들의 자동(음성적) 업데이트로 인해 시스템 아키텍처가 붕괴되는 것을 방지하기 위해 작성되었습니다.

> [!WARNING]
> 아래 명시된 패키지들은 버전 업데이트 시 하위 호환성을 보장하지 않을 수 있습니다. 특히 Vercel AI SDK와 Next.js는 `package.json`에서 자동 업데이트(`^`) 기호를 모두 삭제(Pinned)하여 강제로 고정시켰습니다.

## 🛠️ Core Version Matrix (고정 버전)

| 패키지 명 | 고정 버전 (Strict Pinned) | 목적 및 비고 |
| --- | --- | --- |
| **Next.js** | `16.2.3` | App Router (BiveMap 풀스택 관장) |
| **React** / **React DOM** | `19.2.4` | 클라이언트 UI 구축 및 React Compiler 대응 |
| **ai** (Vercel AI SDK Core) | `6.0.161` | 제미나이 언어 모델 스트리밍, `parts` 형식 파싱 |
| **@ai-sdk/react** | `3.0.163` | UI 훅 (`useChat`). 버전에 따라 반환 함수(`append` 등)가 완전히 다름에 주의 |
| **@ai-sdk/google** | `3.0.63` | 구글 제미나이 연결용 브릿지 모듈 |
| **@xyflow/react** | `12.10.2` | 마인드맵 노드 및 엣지 렌더링. 무한 렌더 트리거 방지 적용됨 |
| **@supabase/supabase-js** | `2.103.0` | 뇌(Database) 및 벡터(Vector) 통신 연결 |
| **zustand** | `5.0.12` | 노드 상태 및 자비스 포커싱(RAG) 전역 상태 관리 |

## ⚠️ 업데이트 주의 사항 체계

1. **AI SDK 계열 (`ai`, `@ai-sdk/react`)**
   - Vercel AI SDK는 내부 메서드명이 하루아침에 바뀌는 경우가 빈번합니다 (예: `toDataStreamResponse` 👉 `toTextStreamResponse`, `append` 👉 `sendMessage` 제거/변경). 
   - 절대 `npm install ai@latest` 등을 무작정 실행하지 마십시오.

2. **Supabase (DB 통신)**
   - Supabase 클라이언트는 마인드맵의 Embedding 검색 함수 (`match_nodes`)와 짝을 이룹니다. SDK 업데이트 시 Postgres 접속 스키마가 바뀔 수 있으니 업데이트 시 테스트가 필수적입니다.

3. **React Flow (`@xyflow/react`)**
   - 캔버스 줌인/줌아웃 인터랙션 및 `useSyncExternalStore` Hook 관련 패치가 포함되어 있습니다. 타 버전으로 이동 시 'Rules of Hooks' 위반 증상이 재발할 가능성이 존재합니다.

## ✨ Package.json 락다운 (Lockdown) 정책
현재 프로젝트의 `package.json`은 모든 주요 라이브러리의 버전 앞 `^`(캐럿) 기호를 **삭제** 처리하여, `npm install`이나 CI/CD 배포 시 예상치 못한 부차적 업데이트가 일어나는 것을 기술적으로 전면 차단했습니다.
