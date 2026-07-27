# 놀퀴즈 스토리 스튜디오 Agent Rules

## Project State
- `incubating`

## Scope
- 학생이 웹 편집기 또는 구글 시트에서 장면, 등장인물, 대사를 쉽게 정하고 즉시 플레이할 수 있는 한국어 스토리게임 스튜디오를 소유한다.
- 첫 버전의 최우선 기준은 짧은 첫 사용 안내만 보고 5분 안에 첫 플레이 가능한 챕터를 완성할 수 있는 쉬운 웹 편집, 선택형 시트 템플릿, 직관적인 이야기 순서, 클릭·터치 중심 플레이 조작이다.
- 웹 편집을 기본으로 제공하고 작품 데이터는 브라우저에 자동 저장한다. Excel과 Google 시트는 같은 공통 작품 양식을 사용하며, 사용자가 버튼을 눌렀을 때만 저장하거나 불러오는 스냅숏 방식으로 다룬다.
- 제작 진입과 핵심 저장·복구에는 자체 회원가입, Google 로그인, OAuth 권한 연결을 요구하지 않는다. 공개 Google 시트는 읽기 전용으로 불러오고 웹에서 Google Drive로 직접 저장하지 않는다.
- 성공한 플레이 버전과 편집본은 브라우저에 보관하고 `.xlsx` 파일로 내보내거나 다시 불러올 수 있게 설계한다.
- 학생용 AI 생성 UI는 두지 않고, 외부 AI 제작은 개발자·교사가 `docs/developer-ai-story-authoring.md`와 공식 시트 템플릿으로 예시 작품 초안을 만드는 별도 작업으로만 다룬다.
- 교사 계정, 여러 기기의 실시간 공동 편집, 학급 관리 기능은 첫 버전 범위 밖이다.
- 주변 WAN 프로젝트와 기존 Unity WebGL 배포본은 수정하지 않는다.
- Canonical absolute project path: `/Users/baekjiyun/Desktop/WAN/apps/storygame`.

## Source Of Truth
- 제품·데이터·이미지 정책의 현재 기준: `docs/storygame-detailed-design.md`.
- 앱 진입점: `app/page.tsx`.
- 학생용 편집·플레이 로직: `app/StoryStudio.tsx`.
- 전역 시각 시스템: `app/globals.css`.
- 기본 예시 이야기와 데이터 타입: `app/story-data.ts`.
- `dist/`, `.vinext/`, `.wrangler/`는 생성 결과이며 `npm run build`로 다시 만든다.
- 현재 콘텐츠와 화면은 MVP 초안이며, 사용자 승인 전까지 정식 교육 콘텐츠로 간주하지 않는다.

## Run And Verify
- Install: `npm install`
- Dev: `npm run dev`
- Targeted checks: `npm run check`
- Build: `npm run build`
- Full release gate: `npm run check && npm run build`
- Target visible flow: 활동지에서 이야기 구상 → 웹에서 편집하거나 Excel·공개 Google 시트 작품을 불러오기 → 화자·챕터·장면·표정·배경 입력 → `플레이에 적용` → 처음부터 또는 원하는 챕터부터 플레이 → 필요할 때 Excel로 버전 저장.
- Representative viewports: desktop 1440×900, tablet landscape 1024×768, tablet portrait 768×1024, mobile portrait 390×844, mobile landscape 844×390.

## Change Safety
- 학생 이름, 학교명, 연락처 등 개인정보를 기본 데이터·로그·배포물에 넣지 않는다.
- 서버 저장과 웹 이미지 업로드는 별도 승인 전까지 추가하지 않는다.
- Google 로그인, OAuth, Google 시트 자동 생성, 웹에서 Google 시트로 쓰기, 실시간 연동을 추가하지 않는다. 붙여 넣은 공개 시트 주소는 읽기 전용으로 다룬다.
- 자동 저장 데이터 구조를 바꿀 때는 이전 버전을 안전하게 무시하거나 마이그레이션한다.
- 새 의존성, 서버 저장, 인증, 외부 API, 데이터베이스는 명시적 승인 없이 추가하지 않는다.
- 핵심 흐름을 숨기는 복잡한 설정, 좌표 입력, 웹 안의 스프레드시트형 편집 UI를 도입하지 않는다.
- 편집 버튼은 영향을 주는 작품·챕터·장면 가까이에 두고, 글 입력보다 보조 설정이 먼저 눈에 띄거나 모바일 키보드를 가리는 구조를 도입하지 않는다.

## Git And Release
- 이 디렉터리가 독립적인 canonical checkout이며 기본 브랜치는 `main`이다.
- No remote yet.
- 로컬 검증 후 Sites의 비공개 소유자 전용 배포를 우선한다.
- 공개 공유, 원격 저장소 생성, 원격 푸시는 사용자 승인 없이 수행하지 않는다.
