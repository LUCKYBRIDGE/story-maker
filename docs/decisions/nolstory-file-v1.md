# `.nolstory` 파일 v1

2026-09-10. 제품 범위는 `docs/storygame-detailed-design.md`의 사용자 확정 계약을 따른다.
구현 기준은 `app/story-file.ts`, 검증은 `tests/story-file.test.mjs`다.

- UTF-8 JSON 단일 파일, 확장자 `.nolstory`, MIME `application/vnd.nolstory+json`, 최대 10MB.
- `manifest`: `format: "nolstory"`, `version: 1`, `kind: "project" | "shared"`,
  UTC ISO `exportedAt`, `appVersion`. 알 수 없는 버전·루트 첨부 필드는 거부한다.
- project: `draft`와 `playback`은 현재 StoryDocumentEnvelope다. 둘의 작품 ID가 같아야 하며,
  적용본이 없는 `playback: null`과 실제 빈 적용본을 구분한다. 출처와 편집 메모를 보존한다.
- shared: `story`는 적용한 읽기 버전, `sharing`은 `allowRemix`(기본 false)와
  `authorDisplayName`이다. 내보낼 때 창작 계획·메모·컷 작업 노트·시트 주소를 제외한다.
  작품 출처와 읽기 내용은 보존한다. 빈 작품과 잘못된 컷 연결은 공유 파일로 열지 않는다.
- `assets`는 실제 사용한 내장 이미지 ID의 중복 없는 `{kind: "builtin", id}` 목록이다.
  이미지 종류와 카탈로그 존재 여부를 확인한다. 현재 커스텀 파일 첨부·경로·URL 이미지·스크립트는
  지원하지 않는다. 파일에서 코드를 실행하거나 외부 자산을 가져오지 않는다.
- 새 project 가져오기는 최대 두 작품 정책을 적용한다. 같은 ID는 날짜와 무관하게
  **기기 작품 유지 / 파일 버전으로 교체**를 선택한다. 교체 전 현재 편집본을 checkpoint로 남기고,
  편집본·적용본·선택 ID를 한 번에 저장한다. 저장 실패 시 기존 작품을 덮어쓰지 않는다.
- 읽기는 편집 슬롯을 쓰지 않는다. 열린 shared 파일은 현재 세션의 서재·공유 목록에 표시되며,
  새 접속에서는 파일을 다시 열어야 한다. 서버 보관을 암시하지 않는다.
- 저장 실패 시에도 메모리의 최신 편집본과 마지막 저장 성공 적용본을 다운로드할 수 있다.
- Excel의 선택 행 `작품 출처 정보`는 StorySource를 JSON 값으로 왕복한다. 이전 양식에
  이 행이 없거나 비어 있으면 출처 미상으로 유지한다. 잘못된 값은 위치와 수정 안내를 반환한다.
  Excel의 기존 새 ID 및 공개 시트의 동일 시트 ID 정책은 바꾸지 않는다.

공유 snapshot과 고쳐쓰기는 아래 SP-D 계약을 따른다.

## 공유본과 고쳐쓰기 계약 (SP-D)

`app/story-publication.ts`는 제출 서버와 분리된 도메인 계약이다.

- Publication은 적용본에서 만든 독립 shared 파일 snapshot과 ID·생성 시각·fingerprint를
  가진다. 복제 후 전체를 동결하므로 원래 편집본을 바꾸거나 snapshot 내부를 변경할 수 없다.
- fingerprint는 SHA-256과 정렬된 읽기 내용으로 계산한다. 제목·소개·표지·장 제목·무대 자산·
  대본·화자·효과·선택 문구·도착 컷을 포함한다. 작품/장/컷/선택 ID, 저장 시간,
  창작 메모와 UI 위치는 제외한다. 연결은 정렬된 컷 인덱스로 비교한다.
  유사도·저작권·저자 인증을 의미하지 않는다.
- Submission은 publicationId와 상태를 별도로 가진다. draft→pending,
  pending→needs_changes/approved/rejected, needs_changes→pending만 허용한다.
  승인·거절은 해당 snapshot의 최종 상태이며 새 내용은 새 snapshot을 만든다.
  이 함수는 서버 검수 권한을 부여하지 않으며 실제 제출 동작은 제공하지 않는다.
- 조회 계약은 baseStoryId/schoolId/sourceKind의 AND 조건이다. 실제 온라인 목록·학교 데이터가
  없으므로 제품 화면은 준비 중으로 안내한다. 학교 정보를 작품이나 파일에서 자동 추정하지 않는다.
- 고쳐쓰기 함수는 allowRemix를 검사하고 원본과 다른 새 ID를 요구한다. 원제·표시 저자·
  원본 fingerprint를 sharedFile 또는 publication 출처로 기록한다. 이후 생성은 중앙 repository의
  두 작품 제한과 저장 실패 보호를 따른다. 원본 공유 파일과 snapshot은 바꾸지 않는다.
- 파일 미리보기와 세션 공유 목록에서 허용된 작품만 고쳐쓰기 조작을 제공한다.
  읽기는 슬롯 없이 가능하고, 고쳐쓰기는 빈 편집 슬롯이 있어야 한다.

## 복수 화자 호환 (SP-E)

컷은 기존 `speakerName` 주 화자와 선택적 `coSpeakerNames: string[]` 추가 화자를 보관한다.
추가 필드가 없는 이전 문서는 단일 화자로 읽는다. 화면은 중복·빈 이름을 제거해 주 화자부터
표시하며 해설에는 화자를 표시하지 않는다. 컷 꾸미기에서 추가 화자를 선택한다.
Excel의 기존 화자 열은 주 화자를 유지하고 선택 열 `함께 말하는 화자`는 JSON 문자열 배열을
왕복한다. 이전 양식에 이 열이 없어도 정상이며 잘못된 목록은 오류 위치를 안내한다.
공유 파일과 fingerprint는 복수 화자를 포함한다. 이미지 위치·화자 이름은 독립적이다.
