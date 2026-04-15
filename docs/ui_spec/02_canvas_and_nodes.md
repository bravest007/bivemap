# 2. 마인드맵 캔버스 및 노드 (Canvas & Nodes)

[<- UI 명세 마스터 인덱스로 돌아가기](./index.md)

React Flow 기반의 대용량 무한 렌더러 로직과 각 노드 컴포넌트의 작동 및 조작(인터랙션) 명세서입니다.

## 2.1. 맵 엔진 캔버스 영역 (`<MapCanvasOverlay>`)
- **React Flow 설정 요소**:
  - 한도 없는 Pan(이동) & Zoom(확대/축소) 통제 (`minZoom: 0.1, maxZoom: 4`).
  - **퍼포먼스 튜닝**: Viewport 밖 화면에 안 보이는 수천 개의 노드는 렌더링하지 않도록 가상화(Virtualization) 로직 강제 활성화 필수적용.
  - 캔버스의 Background는 무지(Solid Obsidian) 위를 지원, 라인(Edge 연결선)은 딱딱한 직선이 아닌 부드러운 커브 형태 채택.
- **드래그 앤 드롭 존 발동 (`<MapDropZone>`)**:
  - `<MapCanvasOverlay>` 컴포넌트를 둘러싸고 최상단 div 에 `onDragOver`, `onDrop` 브라우저 리스너 부착. 유저가 화면 어디로든 로컬 경로의 파일/이미지를 마우스로 끌고오면 화면이 전체적으로 살짝 `--accent-cyan` 빛으로 암전 점멸하며 드롭다운 유도 파티클이 뜨고, 손을 놓는 즉시 `uploadFileHandler(file)` 호출.
- **미니맵 컴포넌트 부착 (`<Minimap>`)**:
  - `position: absolute`, `bottom: 24px`, 데스크탑 JARVIS 패널 바깥쪽 여백 위치에 놓을 것 (`right: calc(30% + 24px)`).
  - ReactFlow 기본 제공 라이브러리인 `<MiniMap>` 을 상속받아, `--bg-panel-glass` 테마 컬러 속성을 덧씌워 화면 구조에 동화(Blend) 시킴.

## 2.2. 유기적 지식 노드 UI (`<OrganicNode>`)
- **버튼 외형 디자인 (Pill-shape 알약형태)**: `borderRadius: 24px`, `--bg-panel-glass` 배경, 패딩은 작고 타이트하게 `padding: 8px 16px`.
- **컴포넌트 구조 배치도**: 
  - `좌측`: [동적 카테고리 아이콘] (예: ⚡ 프롬프트, 🎥 비디오 AI 등 AI 기반 매핑 아이콘)
  - `중앙`: 짧은 요약 텍스트 라벨 (Title)
- **Interaction (인터랙션 조작 시나리오)**:
  - **Hover (마우스 오버)**: 테두리 선이 평범한 유리에서 `--accent-cyan` 빛으로 미세하게 변환되며 조명 발광. 마우스 커서는 포인터.
  - **Click (단순 클릭 선택 시)**: 전역 상태 값 `isSelected` true 전환됨 -> 이는 곧바로 자식 상태 전파되어 우측 JARVIS 패널 최상단 헤더에 "해당 노드가 현재 챗봇의 대화 타겟임" 이라고 칩(Chip)이 박힘.
  - **[신규 고도화] Hover 퀵 메뉴 플로팅 (`<QuickActionMenu>`)**: 마우스 오버 후 노드 우측 공간에 30px 크기의 작은 둥근 플로팅 UI 활성화 (버튼 배열: `[복사 아이콘]`, `[자비스 묻기 아이콘]`, `[포커스 모드 켜기 아이콘]`). 마우스가 노드 밖으로 도망가면 0.2초 여유 타임아웃을 거친 후 Fade-out 사라짐.

## 2.3. 포커스 모드 로직 (Focus Mode Controller)
- **조작**: 유저가 특정 노드를 선택한 뒤 `[퀵 메뉴 -> 포커스 아이콘]` 을 클릭하거나 단축키(스페이스바 등) 입력 시 즉각 발동.
- **렌더링 변화**: 전역 상태 변수 `isFocusMode = true` 전환. 이에 따라 컴포넌트 렌더 로직 대폭 분기:
  1. 선택되지 않은 타 브랜치 소속 노드들과 백그라운드 캔버스 라인(Edge)들은 투명도(opacity)가 `0.1`로 암전 시각 소거 처리됨.
  2. 우측 `<JarvisSidebar>` 및 상단 `<OmniSearchBar>` 패널 들은 `display:none` 처리되거나 우측으로 Slide-out 숨김 애니메이션되어 캔버스 방해 제거.
  3. 엔진의 `fitBounds()` 함수를 활용하여 선택한 노드의 트리(Branch)만 화면 한가운데 정중앙으로 자동 로밍(Pan) 및 줌인.
