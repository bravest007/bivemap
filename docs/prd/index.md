# BiveMap (바이브맵) - 마스터 PRD 인덱스

이 문서는 BiveMap 프로젝트의 전체 제품 요구사항 문서(PRD)를 가리키는 진입점입니다. 향후 AI 에이전트의 컨텍스트 윈도우(Context Window)를 효율적으로 관리하고 토큰 소모를 줄이기 위해, PRD는 논리적 단위로 분할되어 상호 참조 가능하도록 작성되었습니다.

## 문서 목록

1. [개요 및 타깃 사용자 (Overview & Users)](./01_overview_and_users.md)
   - 프로젝트 이름, 목적, 배경 및 페르소나
2. [핵심 기능 명세 (Core Features)](./02_core_features.md)
   - MVP 4대 핵심 기능 (마인드맵, 자비스 챗봇, 주입기, 검색) 상세 시나리오
3. [요구사항 및 기술 제약 (Requirements & Tech Specs)](./03_requirements_and_tech.md)
   - 퍼포먼스, 아키텍처 요구사항
   - Vercel, Gemini, Supabase 및 **로컬 로딩 최적화/데이터베이스 하이브리드 설계안**
   - 개발 완료 성공 기준 (DoD)
4. [UI 명세 및 사이트맵 (UI Sitemap & Specs)](./04_ui_sitemap.md)
   - 전역 공통 요소, 화면 목록, 트리 구조 이동 흐름 명세
