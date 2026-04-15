# BiveMap (바이브맵) - 상세 UI 명세 마스터 인덱스

본 문서는 프론트엔드 AI 에이전트가 코딩을 즉시 시작할 수 있도록 컴포넌트 단위로 구조화하고 분할된 **상세 UI 명세서(Detailed UI Specification)** 입니다. 디자인 시스템, 요소별 렌더링 규칙, 유저 상호작용(Interaction) 시나리오가 완벽히 명시되어 있습니다.

## UI 컴포넌트별 상세 문서 목록

1. [글로벌 레이아웃 및 디자인 시스템 (Layout & Design System)](./01_layout_system.md)
   - 색상 토큰(CSS Variables), 테마, 전체 스플릿 뷰 / 모바일 바텀시트 반응형 구조.
2. [마인드맵 캔버스 및 노드 (Canvas & Nodes)](./02_canvas_and_nodes.md)
   - React Flow 배경 프레임워크, 노드 스타일링, 아이콘 시스템, 우측 하단 미니맵, 호버 플로팅(퀵 메뉴), 포커스 모드 토글 로직.
3. [만능 옴니 서치바 체계 (Omni-Bar & Ingestion)](./03_omni_bar.md)
   - 상단 검색창 컴포넌트 로직, URL/텍스트 붙여넣기 분기 처리 시스템, 캔버스 바탕화면 냅다 드래그 앤 드롭 파일 업로드 이벤트 명세.
4. [JARVIS 사이드바 챗봇 (JARVIS Sidebar)](./04_jarvis_sidebar.md)
   - 유리창(Glassmorphism) 기반 우측 사이드 패널 액션, RAG 대화창 로직, 컨텍스트 타겟팅 표시, 타이핑 애니메이션 및 모바일 스와이프 로직.

*이전 단계 문서 참조: [기획 아키텍처 PRD (Product Requirements Doc)](../prd/index.md)*
