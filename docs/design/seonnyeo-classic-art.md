# 선녀와 나무꾼 원작읽기 연출

대본 기준은 사용자 제공 6장·83컷이며 `app/story-classic-seonnyeo.ts`에서 관리한다.
컷별 배치의 기준은 `app/story-classic-seonnyeo-art.ts`다. 분기형 놀스토리의 사건·대본을 원작에 섞지 않는다.

## 장면 원칙

- 기존 선녀·나무꾼과 계곡·집·마당을 재사용한다. 다른 작품의 인물을 대역으로 넣지 않는다.
- 목욕 장면은 인체 노출 없이 연못 풍경·벗어 놓은 날개옷과 서술로 전달한다.
- 날개옷을 입을 때 선녀복으로 바꾸며, 승천 후에는 선녀 슬롯을 비운다.
- 하늘나라에는 별도 배경을 사용해 지상의 집과 구별한다.
- 사슴·사냥꾼·어머니·두 아이는 전용 투명 자산으로 표시한다. 사슴은 사냥꾼이 등장한 컷에서 숨겨 보이지 않게 한다.
- 두 아이는 성인 키의 62%, 사슴은 72%로 표시한다. 원본 그림의 가로세로 비율은 보존한다.
- 사용자 생성 이미지 14종으로 날개옷·출생·승천·두레박·용마·호박죽 사고·낙마·노년·수탉 장면을 표시한다. 컷별 연결은 배치 파일을 기준으로 한다.
- 용마를 타는 장면에 서 있는 나무꾼을 대역으로 배치하지 않는다.
- 새 인물은 기존 나무꾼을 그림체 참고로 생성했다. 기존 선녀·나무꾼 파일은 수정하지 않는다. 배경과 인물은 기존 플레이어처럼 분리한다.

## 추가 배경 제작 기록

- 파일: [`seonnyeo.background.classic-sky-realm.webp`](../../public/story-assets/seonnyeo.background.classic-sky-realm.webp)
- 도구: 내장 imagegen, PNG 결과를 WebP quality 88로 저장.
- 스타일 참고: `public/story-assets/BG04-cottage-day.webp`. 참고용이며 기존 파일은 수정하지 않았다.
- 확인: 인물·글자 없는 구름 위 누각과 빈 전경. 하늘나라 대화와 재회 장면에 사용.
- 등록 원본: `public/story-assets/seonnyeo-classic-manifest.json`; `npm run assets:catalog`로 카탈로그 재생성.

사용한 프롬프트:

> Use case: illustration-story. Create a wide 16:9 background asset for a Korean traditional fairy tale reading game, the heavenly realm above the clouds in Seonnyeo and the Woodcutter. Match the supplied reference's painterly hand-painted Korean storybook animation background style, rich natural textures and gentle colors. Reference is style only; replace earthly cottage with a serene traditional Korean pavilion far in the background, pale jade stone terrace across lower foreground, layers of luminous white clouds and soft blue sky, distant floating mountain silhouettes. Eye-level stage composition with ample empty space for separately rendered characters. No people, no animals, no text, no watermark, no interface, no modern objects. One full image, not panels.

## 추가 인물 4종

| 파일 접미사 (`seonnyeo.character.classic-…webp`) | 인물 | 배치 |
|---|---|---|
| deer | 사슴 | 1장 구조·보은, 3장 회상, 4장 하늘길 안내 |
| hunter | 사냥꾼 | 1장 5~7컷. 숨어 있는 사슴은 표시하지 않음 |
| mother | 어머니 | 1장 도입, 6장 재회·음식 권유 |
| children | 두 아이 | 3장 둘째 출생 뒤, 4장 떠남, 5장 재회 |

모두 `public/story-assets/`에 저장. `seonnyeo-classic-manifest.json`이 등록 원본이다.
800×1200 투명 WebP, 알파 10% 기준 발선 y=1149, 머리 여백 149px. 위치와 균일 크기만 정규화했으며 부분 변형·배경 제거는 하지 않았다.
그림체 비교 기준과 원본·정규화본·측정치는 로컬 `work/story-assets/seonnyeo-classic-art/`에 보존한다. 신규 인물은 이 버전을 기준본으로 삼으며 후속 포즈는 같은 얼굴·의복·비율을 유지한다.

### 인물 프롬프트 (내장 imagegen)

공통 프롬프트 및 개별 요청을 이어 붙여 생성했다. 참고 이미지는 `public/story-assets/M02-neutral.png`이며 그림체 참고용이다.

#### deer

> Use case: illustration-story. Create ONE isolated full-body game character sprite on a genuinely transparent alpha background, no backdrop, no floor, no cast shadow, no checkerboard painted into image, no words. Portrait 2:3 canvas. Subject entirely visible, generous margins on all sides. Match reference hand-painted Korean storybook animation style, soft natural colors, clean gentle outlines, NOT pixel art or chibi. Three-quarter view facing left. Reference is style only; do not copy the referenced man's identity for this new character. A small Korean sika deer, warm brown coat with subtle cream spots, slim legs, small antlers, alert ears and gentle anxious eyes, standing naturally on all four hooves with head turned up as if asking for help. One deer, no human, no clothing.

#### hunter

> Use case: illustration-story. Create ONE isolated full-body game character sprite on a genuinely transparent alpha background, no backdrop, no floor, no cast shadow, no checkerboard painted into image, no words. Portrait 2:3 canvas. Subject entirely visible, generous margins on all sides. Match reference hand-painted Korean storybook animation style, soft natural colors, clean gentle outlines, NOT pixel art or chibi. Three-quarter view facing left. Reference is style only; do not copy the referenced man's identity for this new character. An adult Korean mountain hunter of a traditional folktale, lean weathered man about 45 with a short moustache, dark blue-grey simple jeogori and dark trousers, worn straw shoes, tied hair under a brown cloth headband. Holds an unstrung wooden hunting bow lowered harmlessly at his side, a small quiver on his back, questioning expression, other hand lightly raised. Entire feet and bow visible. Normal adult proportions like reference, head about one sixth of body height.

#### mother

> Use case: illustration-story. Create ONE isolated full-body game character sprite on a genuinely transparent alpha background, no backdrop, no floor, no cast shadow, no checkerboard painted into image, no words. Portrait 2:3 canvas. Subject entirely visible, generous margins on all sides. Match reference hand-painted Korean storybook animation style, soft natural colors, clean gentle outlines, NOT pixel art or chibi. Three-quarter view facing left. Reference is style only; do not copy the referenced man's identity for this new character. An elderly Korean peasant mother, about 70, warm wrinkled face, silver-grey hair in a neat low bun, cream jeogori with faded dusty mauve ribbon and muted slate-blue chima, simple straw shoes. She smiles with relief and extends her hands a little to welcome her grown son. Slightly stooped but full standing body, normal adult proportions, no child or other person.

#### children

> Use case: illustration-story. Create ONE isolated full-body game character sprite on a genuinely transparent alpha background, no backdrop, no floor, no cast shadow, no checkerboard painted into image, no words. Portrait 2:3 canvas. Subject entirely visible, generous margins on all sides. Match reference hand-painted Korean storybook animation style, soft natural colors, clean gentle outlines, NOT pixel art or chibi. Three-quarter view facing left. Reference is style only; do not copy the referenced man's identity for this new character. Exactly two young Korean siblings standing side by side holding hands, older child around 4 in a muted ochre jeogori with blue trousers, younger child around 2 in a pale peach jeogori with dusty rose trousers. Both have short dark hair, round but not exaggerated heads, simple cloth shoes, friendly natural expressions. Entire two small bodies visible, ages visibly different, unified pair sprite, no adults.

## 사용자 제공 사건 이미지 14종 (2026-09-16)

사용자가 ChatGPT에서 생성해 `outputs/seonnyeo-image-prompts/references/`에 제공했다.
원본 PNG는 수정하지 않았다. 기존 나무꾼·지상/천상 선녀·어머니·아이를 참고한 얼굴,
의복과 색감, 손발, 투명 배경을 비교 검수했다. 1024×1536 PNG를 원본에서 균일 축소·평행이동해
800×1200 투명 WebP로 한 번 인코딩했다. 배경 제거·비균일 변형·부분 신체 보정은 하지 않았다.
아래 파일은 모두 `public/story-assets/seonnyeo.character.classic-<접미사>.webp`다.

| 제공 파일 번호 | 접미사 | 사용 사건 |
|---|---|---|
| 01 | wing-robe | 연못가의 날개옷 |
| 02 | woodcutter-holding-robe | 날개옷을 집어 들고 선녀에게 보여 줌 |
| 03 | fairy-carrying-children | 두 아이와 승천, 하늘나라 재회 |
| 04 | heavenly-bucket | 하늘에서 내려오는 두레박 |
| 05 | woodcutter-in-bucket | 두레박 탑승·상승 |
| 06 | celestial-horse | 선녀가 마련한 용마와 금기 |
| 07 | woodcutter-riding-horse | 지상 귀환·말 위에서 어머니와 대화 |
| 08 | mother-offering-porridge | 어머니의 호박죽 권유 |
| 09 | horse-startled-by-porridge | 등에 죽이 쏟아져 놀란 용마 |
| 10 | woodcutter-fallen | 낙마한 나무꾼 |
| 11 | celestial-horse-departing | 나무꾼을 남기고 떠나는 용마 |
| 12 | rooster-calling-sky | 하늘을 향해 우는 수탉 |
| 13 | woodcutter-aged | 세월이 흐른 뒤의 나무꾼 |
| 14 | fairy-holding-first-baby | 첫째 출생 |

12번 원본명 `12-rooster-calling-sk.png`, 13번 `13-woodcutter-age.png`는 그대로 보존하고
등록 이름만 의도한 전체 이름으로 정리했다. 원본 14종 약 24MB를 배포용 합계 약 1.8MB로 줄였다.
알파 10% 기준 하단 y=1149±3, 좌우 30px 이상 여백을 검사한다. 앉거나 넘어진 동작과 소품은
선 자세의 머리 높이를 강제하지 않는다. 수탉은 성인보다 작게 표시하며, 결합 그림에는 별도 동일
인물을 중복 배치하지 않는다. 오른쪽을 향한 새 나무꾼·용마는 방향 정보를 명시해 대화 상대를 바라본다.

탑승 결합 그림은 말까지 포함한 전체 키를 성인 단독의 1.4배로 표시한다.
아이를 안은 선녀와 탑승 인물은 성인 슬롯 폭을 사용해 작은 화면에서도 같은 인물의 키가 유지된다.

특수 사건용 이미지이므로 자산 선택기에서는 `추가 자료`로 등록한다. 단독 탑승 장면은 기존
결합 인물 중앙 배치 기능을 사용한다. 비교표·정규화 PNG·변환 측정치는 로컬
`work/story-assets/seonnyeo-upload-review/`에 보존한다. 검증 결과와 GitHub 상태는 개발 상태표에서 관리한다.
