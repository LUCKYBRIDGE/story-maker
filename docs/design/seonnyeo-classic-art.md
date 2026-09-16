# 선녀와 나무꾼 원작읽기 연출

대본 기준은 사용자 제공 6장·83컷이며 `app/story-classic-seonnyeo.ts`에서 관리한다.
컷별 배치의 기준은 `app/story-classic-seonnyeo-art.ts`다. 분기형 놀스토리의 사건·대본을 원작에 섞지 않는다.

## 장면 원칙

- 기존 선녀·나무꾼과 계곡·집·마당을 재사용한다. 다른 작품의 인물을 대역으로 넣지 않는다.
- 목욕 장면은 빈 연못 풍경과 서술로 전달한다.
- 날개옷을 입을 때 선녀복으로 바꾸며, 승천 후에는 선녀 슬롯을 비운다.
- 하늘나라에는 별도 배경을 사용해 지상의 집과 구별한다.
- 사슴·사냥꾼·어머니·두 아이는 전용 투명 자산으로 표시한다. 사슴은 사냥꾼이 등장한 컷에서 숨겨 보이지 않게 한다.
- 두 아이는 성인 키의 62%, 사슴은 72%로 표시한다. 원본 그림의 가로세로 비율은 보존한다.
- 아직 미제작인 두레박·용마·수탉과 결합 동작(날개옷을 든 나무꾼, 아이를 안은 선녀, 낙마·호박죽)은 남은 제작 범위다. 2026-09-16 내장 생성 도구가 계정 한도 오류를 반환하여 제작하지 못했다. 빈 배경만으로 전체 시각화가 완료됐다고 간주하지 않는다.
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
