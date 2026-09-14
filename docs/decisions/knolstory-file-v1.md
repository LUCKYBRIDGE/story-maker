# `.knolstory` 파일 v1

2026-09-14 사용자 결정으로 파일 형식 및 공식 영문 명칭을 `nolstory`에서 `knolstory`로 전환한다.
제품 범위는 `docs/storygame-detailed-design.md`의 사용자 확정 계약을 따른다.
구현 기준은 `app/story-file.ts`, 검증은 `tests/story-file.test.mjs`다.

## 핵심 사양

- UTF-8 JSON 단일 파일, 기본 확장자 `.knolstory`, MIME `application/vnd.knolstory+json`, 최대 10MB.
- `manifest`: `format: "knolstory"`, `version: 1`, `kind: "project" | "shared"`,
  UTC ISO `exportedAt`, `appVersion`. 알 수 없는 버전·루트 첨부 필드는 거부한다.
- project: `draft`와 `playback`은 현재 StoryDocumentEnvelope다. 둘의 작품 ID가 같아야 하며,
  적용본이 없는 `playback: null`과 실제 빈 적용본을 구분한다. 출처와 편집 메모를 보존한다.
- shared: `story`는 적용한 읽기 버전, `sharing`은 `allowRemix`(기본 false)와
  `authorDisplayName`이다. 내보낼 때 창작 계획·메모·컷 작업 노트·시트 주소를 제외한다.
  작품 출처와 읽기 내용은 보존한다. 빈 작품과 잘못된 컷 연결은 공유 파일로 열지 않는다.
- `assets`는 실제 사용한 내장 이미지 ID의 중복 없는 `{kind: "builtin", id}` 목록이다.
  이미지 종류와 카탈로그 존재 여부를 확인한다. 현재 커스텀 파일 첨부·경로·URL 이미지·스크립트는
  지원하지 않는다. 파일에서 코드를 실행하거나 외부 자산을 가져오지 않는다.

## 하위 호환성 계약 (학생 작품 보존)

1. **파일 읽기/불러오기**:
   - 확장자 `.knolstory`와 레거시 `.nolstory`를 모두 허용한다 (`accept=".knolstory,.nolstory"`).
   - MIME 타입 `application/vnd.knolstory+json`, `application/vnd.nolstory+json`, `application/json`, `application/octet-stream`, `text/plain`을 수용한다.
   - `manifest.format`이 `"knolstory"` 또는 `"nolstory"`인 경우 모두 정상적으로 파싱하여 연다.
2. **신규 내보내기**:
   - 신규 다운로드 및 편집 백업 파일은 `format: "knolstory"`, 확장자 `.knolstory`, MIME `application/vnd.knolstory+json`으로 생성한다.
3. **코드 별칭(Aliases)**:
   - `parseNolstoryFile`, `createNolstoryProject`, `createNolstoryShared`, `encodeNolstoryFile`, `readNolstoryFile`, `downloadNolstoryFile` 및 관련 타입을 별칭으로 유지하여 기존 코드 및 외부 도구와의 호환을 보장한다.

## 공유본과 고쳐쓰기 계약 (SP-D)

`app/story-publication.ts`는 제출 서버와 분리된 도메인 계약이다.

- Publication은 적용본에서 만든 독립 shared 파일 snapshot과 ID·생성 시각·fingerprint를
  가진다. 복제 후 전체를 동결하므로 원래 편집본을 바꾸거나 snapshot 내부를 변경할 수 없다.
- fingerprint는 SHA-256과 정렬된 읽기 내용으로 계산한다. 제목·소개·표지·장 제목·무대 자산·
  대본·화자·효과·선택 문구·도착 컷을 포함한다. 작품/장/컷/선택 ID, 저장 시간,
  창작 메모와 UI 위치는 제외한다. 연결은 정렬된 컷 인덱스로 비교한다.
- 고쳐쓰기 함수는 allowRemix를 검사하고 원본과 다른 새 ID를 요구한다. 원제·표시 저자·
  원본 fingerprint를 sharedFile 또는 publication 출처로 기록한다.

## 복수 화자 호환 (SP-E)

컷은 기존 `speakerName` 주 화자와 선택적 `coSpeakerNames: string[]` 추가 화자를 보관한다.
추가 필드가 없는 이전 문서는 단일 화자로 읽는다. 화면은 중복·빈 이름을 제거해 주 화자부터
표시하며 해설에는 화자를 표시하지 않는다.
공유 파일과 fingerprint는 복수 화자를 포함한다.
