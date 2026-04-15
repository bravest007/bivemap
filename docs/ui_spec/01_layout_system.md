# 1. 글로벌 레이아웃 및 디자인 시스템

[<- UI 명세 마스터 인덱스로 돌아가기](./index.md)

이 문서는 모든 UI 컴포넌트가 따르게 될 기본 CSS 토큰(디자인 시스템)과 화면 레이아웃 규칙을 정의합니다. 코딩 시 해당 값들을 Global scope로 빼내어 재사용성을 최적화합니다.

## 1.1. 디자인 시스템 (Vanilla CSS Variables)
복잡한 외부 css-in-js 툴을 배제하고 순수 CSS의 Custom Properties만으로 통일된 사이버펑크+다크 글래스모피즘 분위기를 무겁지 않게 연출합니다.

- **Background Colors**:
  - `--bg-obsidian`: `#050505` (마인드맵 캔버스의 절대적인 짙은 바탕 배경색)
  - `--bg-panel-glass`: `rgba(20, 20, 20, 0.6)` (사이드바, 모달, 검색창용 반투명 배경)
- **Primary / Accent Colors**:
  - `--accent-cyan`: `#00F3FF` (활성화된 노드 라인, 핑/하일라이트 효과, 포커싱 타겟팅 테두리)
  - `--accent-purple`: `#B537F2` (AI 제너레이션 텍스트, JARVIS 시스템 강조 색상)
- **Borders & Shadows**:
  - `--border-glass`: `1px solid rgba(255, 255, 255, 0.1)` (모든 반투명 패널 및 노드의 미세한 서리가 낀 듯한 1px 윤곽선)
  - `--shadow-neon`: `0 0 15px rgba(0, 243, 255, 0.3)` (검색된 활성 노드의 빛이 번져 반사 효과를 내는 Shadow)
- **Blur**:
  - `--backdrop-blur`: `backdrop-filter: blur(12px)` (투명 UI 뒤쪽에 지나가는 마인드맵 라인들을 흐릿하게 블러시켜 글씨의 가독성 분리)

## 1.2. 싱글 페이지 (SPA) 레이아웃 구조
App Router 최상단 `page.tsx` 한 곳에서 렌더링 구획을 완전히 분할(Split)하여 각 패널끼리 전역 상태 변수만 다루고 화면 리로딩은 철저히 통제합니다.

- **`<RootContainer>`**: 윈도우 화면(100vw, 100vh)을 100% 꽉 채우는 부모 컨테이너. 스크롤바 자체가 아예 생기지 않도록 `overflow: hidden` 처리 필수.
- **`<MapCanvasOverlay>`**: `position: absolute`, `z-index: 10`. 화면 전경 100%로 바탕화면처럼 덮는 거대한 캔버스 뷰포트 영역.
- **`<OmniSearchBar>`**: `position: absolute`, `top: 24px`, `left: 50%`, `transform: translateX(-50%)`, `z-index: 50`. (데스크탑 기준 중앙 상단에 떠 있게 고정, 위로 포개어 배치).
- **`<JarvisSidebar>`**: `position: absolute`, `right: 0`, `top: 0`, `width: 30%` (max-width 약 420px), `height: 100vh`, `z-index: 40`. 우측 벽면에 바짝 붙어있는 고정 패널.

## 1.3. 반응형 분기 (Responsive breakpoints CSS)
- **`@media (max-width: 768px)` (Mobile / 태블릿 모드)**:
  - `<JarvisSidebar>`는 우측 고정이 해제되고 화면 바깥쪽(`bottom: -100%`)으로 숨겨짐 대신, 우측 하단에 조그마한 플로팅 챗봇 버튼 활성화.
  - 이 챗봇 버튼을 터치하면 패널이 아래쪽 화면 외곽에서 위로 슬라이딩해 올라오는 바텀 시트 모달(`BottomSheet`, `height: 60vh`) 구조로 변환되어 `z-index: 60`을 먹고 최상단에서 절반만 가리게 덮음.
  - `<OmniSearchBar>`는 화면 정중앙 상단에 있으나 폭(width)이 전체의 90% 공간을 전부 차지하도록 확장.
