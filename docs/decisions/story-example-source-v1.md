# 원본 예시 작품 변환 v1

- 결정일: 2026-09-09, EX-01 사용자 요청.
- 원본: pinky-ne-site-publish의 worker/story-data/stories.js와 해당 모듈이 참조하는 승인 대본.
- 기준 커밋: df00a622848182c7d2ef0b0a4731b8b64d237082.

첫 화면의 선택 테마에 따라 토끼와 자라 또는 옹고집전 전체 예시를 독립 스냅숏으로 재생한다.
기존 사용자 편집본·적용본과 이어 쓰기 템플릿은 덮어쓰지 않는다. 예시는 처음 요청할 때 불러온다.

scripts/generate-story-examples.mjs가 원본 route를 장, beat를 컷으로 변환하고 원본 선택지와
합류/결말 연결을 보존한다. 원본의 단일 행동 3개는 문구를 담은 해설 컷과 다음 컷 연결로
옮겨 서비스의 2/3개 선택지 계약을 유지한다. 분기 질문도 별도 해설 컷으로 보존한다.
기존 STORY_ASSETS의 sourcePath로 배경과 인물을 연결하며 이미지를 새로 복제하지 않는다.

기본 원본 경로는 /Volumes/WAN2/apps/pinky-ne-site-publish이며 다른 위치에서는
STORY_SOURCE_ROOT 환경 변수로 지정한다. 다음 명령은 저장소 루트에서 실행한다.

```sh
node --experimental-strip-types --experimental-loader=./tests/node-types-loader.mjs scripts/generate-story-examples.mjs
```

산출물 app/story-examples.generated.json은 직접 수정하지 않는다. 갱신 시 원본 커밋,
missingAssets가 빈 배열인지, 대사·연결 일치와 양 작품 재생을 확인하고 npm test를 실행한다.
실서비스 실행에는 원본 저장소나 외부 서버 연결이 필요하지 않다.
