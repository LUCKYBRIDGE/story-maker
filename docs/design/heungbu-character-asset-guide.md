# 흥부와 놀부 캐릭터 자산 제작 및 프롬프트 가이드

> 이 문서는 기존 「선녀와 나무꾼」, 「옹고집전」의 화풍 DNA와 규격을 100% 계승하여,
> 「흥부와 놀부」 277컷에 필요한 캐릭터 이미지를 한 번에 생성·배치하기 위한 실전 제작 파일입니다.

---

## 1. 이미지 표준 규격 (ADR 준수)

- **해상도**: `800 × 1200 px`
- **배경**: **투명 배경 (Transparent PNG / WebP)**
- **구도**: 전신 스탠딩 (Full body standing), 좌우 중심 `x = 400px` (±12px)
- **발 바닥선**: 발의 가장 낮은 지점이 **`y = 1149 px`** 에 접지 (하단 50px 여백)
- **머리 여백**: 머리/상투 위쪽으로 **`120 ~ 180 px`** 여백 유지
- **화풍**: 한국 전래동화 그림책 스타일, 먹색 클린 잉크선, 은은한 한지 종이 질감, 수채화/과슈 워시 채색, 5.5등신

---

## 2. 프로덕션 25종 캐릭터 자산 현황 (100% 실사용 매핑 완료)

| 자산 ID | 파일명 | 인물 / 감정·상황 | 높이 | 접지(y) | top | left |
|---|---|---|---|---|---|---|
| `heungbu.character.heungbu-default` | `heungbu.character.heungbu-default.webp` | 성인 흥부 (기본 온화형) | 1000px | 1149 | 150 | 160 |
| `heungbu.character.heungbu-young` | `heungbu.character.heungbu-young.webp` | 소년 흥부 (1장 소년기 회상 전용) | 900px | 1149 | 250 | 225 |
| `heungbu.character.nolbu-default` | `heungbu.character.nolbu-default.webp` | 성인 놀부 (장부와 정면) | 1000px | 1149 | 150 | 79 |
| `heungbu.character.nolbu-young` | `heungbu.character.nolbu-young.webp` | 소년 놀부 (1장 소년기 회상 전용) | 910px | 1149 | 240 | 225 |
| `heungbu.character.wife-heungbu` | `heungbu.character.wife-heungbu.webp` | 흥부 아내 (20대 단정·자애) | 949px | 1148 | 200 | 206 |
| `heungbu.character.wife-nolbu` | `heungbu.character.wife-nolbu.webp` | 놀부 아내 (30대 단아·단호) | 960px | 1149 | 190 | 202 |
| `heungbu.character.heungbu-pleading` | `heungbu.character.heungbu-pleading.webp` | 흥부 (간절함·애원·가슴 졸임) | 1000px | 1149 | 150 | 139 |
| `heungbu.character.heungbu-happy` | `heungbu.character.heungbu-happy.webp` | 흥부 (기쁨·환대·활짝 웃음) | 1000px | 1149 | 150 | 103 |
| `heungbu.character.nolbu-angry` | `heungbu.character.nolbu-angry.webp` | 놀부 (호통·냉정·경고) | 1000px | 1149 | 150 | 35 |
| `heungbu.character.nolbu-remorse` | `heungbu.character.nolbu-remorse.webp` | 놀부 (몰락·참회·부끄러움) | 1000px | 1149 | 150 | 230 |
| `heungbu.character.wife-heungbu-worried` | `heungbu.character.wife-heungbu-worried.webp` | 흥부 아내 (근심·걱정·가슴앓이) | 950px | 1149 | 200 | 210 |
| `heungbu.character.wife-nolbu-shocked` | `heungbu.character.wife-nolbu-shocked.webp` | 놀부 아내 (경악·당황·입 가림) | 960px | 1149 | 190 | 161 |
| `heungbu.character.children` | `heungbu.character.children.webp` | 아이들 남매 (흥부/놀부 자녀) | 880px | 1149 | 270 | 92 |
| `heungbu.character.swallow` | `heungbu.character.swallow.webp` | 제비 (박씨 물고 횃대에 앉은 제비) | 900px | 1149 | 250 | 98 |
| `heungbu.character.neighbor` | `heungbu.character.neighbor.webp` | 이웃 농부 (곡식 나눔) | 1000px | 1149 | 150 | 221 |
| `heungbu.character.heungbu-thinking` | `heungbu.character.heungbu-thinking.webp` | 흥부 (생각·망설임·고민) | 998px | 1149 | 152 | 223 |
| `heungbu.character.heungbu-working` | `heungbu.character.heungbu-working.webp` | 흥부 (소매 걷고 일하기·농사·수리) | 1001px | 1149 | 149 | 159 |
| `heungbu.character.heungbu-swallow-care` | `heungbu.character.heungbu-swallow-care.webp` | 흥부 (다친 제비 부목 치료) | 1001px | 1149 | 149 | 234 |
| `heungbu.character.heungbu-gourd-saw` | `heungbu.character.heungbu-gourd-saw.webp` | 흥부 (박 톱질하기) | 956px | 1149 | 194 | 91 |
| `heungbu.character.heungbu-sharing` | `heungbu.character.heungbu-sharing.webp` | 흥부 (곡식 자루 건네기·나눔) | 998px | 1149 | 152 | 208 |
| `heungbu.character.nolbu-thinking` | `heungbu.character.nolbu-thinking.webp` | 놀부 (고민·질투·계산) | 1001px | 1149 | 149 | 232 |
| `heungbu.character.nolbu-swallow-holding` | `heungbu.character.nolbu-swallow-holding.webp` | 놀부 (손 안의 제비와 양심의 갈등) | 998px | 1149 | 152 | 218 |
| `heungbu.character.nolbu-ruined-seated` | `heungbu.character.nolbu-ruined-seated.webp` | 놀부 (마당에 주저앉아 멍하니 허탈) | 758px | 1149 | 392 | 104 |
| `heungbu.character.nolbu-working` | `heungbu.character.nolbu-working.webp` | 놀부 (괭이 들고 밭일·재기) | 1031px | 1150 | 120 | 38 |
| `heungbu.character.nolbu-sharing` | `heungbu.character.nolbu-sharing.webp` | 놀부 (반쪽 떡 건네기·화해와 성장) | 999px | 1149 | 151 | 73 |

---

## 3. 프로덕션 전용 배경 및 사건 삽화 자산 (17종, 100% 외래 배경 배제)

| 자산 ID | 파일명 | 해상도 | 역할 | 용도 및 설명 |
|---|---|---|---|---|
| `heungbu.poster.art` | `heungbu.poster.art.webp` | 940 × 1672 | 포스터 | 서재 화면 대표 포스터 아트 (초가집 앞의 흥부 가족과 놀부, 박씨를 문 제비) |
| `heungbu.background.nolbu-mansion` | `heungbu.background.nolbu-mansion.webp` | 1600 × 900 | 풍경 | 놀부네 기와집 대문과 마당, 곳간 (2장, 4장, 8장, 10장) |
| `heungbu.background.heungbu-gourd-roof` | `heungbu.background.heungbu-gourd-roof.webp` | 1600 × 900 | 풍경 | 박 열린 흥부 초가지붕과 마당 (7장 박 타기, 표지) |
| `heungbu.background.village-road-childhood` | `heungbu.background.village-road-childhood.webp` | 1600 × 900 | 장면 | 어린 시절 가을 시골 마을길 (1장 소년기 회상) |
| `heungbu.background.family-storehouse-yard` | `heungbu.background.family-storehouse-yard.webp` | 1600 × 900 | 장면 | 부모님 집 곳간과 마당 (2장 곳간 앞 두 형제) |
| `heungbu.background.family-room` | `heungbu.background.family-room.webp` | 1600 × 900 | 장면 | 전통 한옥 실내 (3장 분가 의논, 5a장 흥부 집 안, 12a장 겨울 실내) |
| `heungbu.background.poor-house-winter` | `heungbu.background.poor-house-winter.webp` | 1600 × 900 | 장면 | 가난한 흥부네 겨울 초가집 (4장, 5b장, 11장, 12b장) |
| `heungbu.background.spring-field` | `heungbu.background.spring-field.webp` | 1600 × 900 | 장면 | 봄 농사 밭과 일터 (5a장 놀부 밭, 12a장/12b장 공동 경작지) |
| `heungbu.background.heungbu-swallow-eaves` | `heungbu.background.heungbu-swallow-eaves.webp` | 1600 × 900 | 장면 | 흥부네 초가집 제비 둥지 처마 (6장 제비 치료, 7장 제비 귀환) |
| `heungbu.background.nolbu-swallow-eaves` | `heungbu.background.nolbu-swallow-eaves.webp` | 1600 × 900 | 장면 | 놀부네 기와 처마와 제비 둥지 (8장 처마 살핌, 9장 제비 갈등) |
| `heungbu.background.nolbu-ruined-yard` | `heungbu.background.nolbu-ruined-yard.webp` | 1600 × 900 | 장면 | 박 재앙 후 처마와 담장이 무너진 마당 (10장 후반, 11장) |
| `heungbu.background.two-houses-path` | `heungbu.background.two-houses-path.webp` | 1600 × 900 | 장면 | 두 형제의 집 사이에 자연스럽게 난 흙길 (12b장 결말) |
| `heungbu.background.family-dinner-night` | `heungbu.background.family-dinner-night.webp` | 1600 × 900 | 장면 | 밤늦게 등불 켜진 따뜻한 방 (4장, 7장, 11장, 12b장 밥상) |
| `heungbu.scene.gourd-treasure-burst` | `heungbu.scene.gourd-treasure-burst.webp` | 1600 × 900 | 사건 삽화 | 쩍! 박이 갈라지며 금은보화와 비단이 쏟아져 나오는 순간 (7-06~07) |
| `heungbu.scene.nolbu-broken-goods` | `heungbu.scene.nolbu-broken-goods.webp` | 1600 × 900 | 사건 삽화 | 놀부 첫 박에서 헌 헝겊과 깨진 사기그릇이 터져 나오는 장면 (10-04~05) |
| `heungbu.scene.nolbu-goblin-chaos` | `heungbu.scene.nolbu-goblin-chaos.webp` | 1600 × 900 | 사건 삽화 | 둘째 박에서 도깨비들이 튀어나와 갓을 뺏고 마당을 휘젓는 장면 (10-09~11) |
| `heungbu.scene.nolbu-storm-collapse` | `heungbu.scene.nolbu-storm-collapse.webp` | 1600 × 900 | 사건 삽화 | 마지막 박에서 거센 물과 폭풍우가 쏟아져 기와집 한쪽이 무너지는 장면 (10-14~15) |

---

## 3. 공통 스타일 베이스 프롬프트 (모든 프롬프트에 적용)

```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style, warm emotional aesthetic. Clean delicate dark sepia ink outlines, soft watercolor and gouache washes with subtle traditional Hanji paper texture, gentle earthy tones, 5.5-head friendly proportion, clear innocent Korean facial features with dark eyes, full body standing pose, grounded firmly on floor, isolated on pure white background, no floor shadows.
```

---

## 3. 캐릭터별 복사용 프롬프트 목록

### [흥부 세트]

#### 1) 흥부 - 기본형 (온화한 미소)
- **파일명**: `heungbu.character.heungbu-default.webp`
- **사용 장**: 1장~3장, 11장~12장 일상 대화
- **프롬프트**:
```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style. Full body standing of Heungbu, a gentle and kind Korean peasant man in his early 30s. Soft smiling face, warm dark eyes, topknot (sangtu) with a white cloth headband. Wearing humble off-white cotton hanbok (baji jeogori) and a light brown hemp vest, straw sandals. Clean dark sepia ink lineart, soft watercolor wash, Hanji texture, pure white background, no shadows.
```

#### 2) 흥부 - 겨울 누더기 (고개 숙인 부탁)
- **파일명**: `heungbu.character.heungbu-poor-winter.webp`
- **사용 장**: 4장, 5A장, 5B장 (시련과 고난)
- **프롬프트**:
```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style. Full body standing of Heungbu looking cold, hungry, and troubled. Modest pleading posture with hands clasped together, slightly bowed head, furrowed brows. Wearing thin, worn-out patched hemp clothing tied with a straw rope belt, shiver posture in winter chill. Clean dark sepia ink lineart, soft watercolor wash, Hanji texture, pure white background, no shadows.
```

#### 3) 흥부 - 제비를 품은 손길 (명주실 치료)
- **파일명**: `heungbu.character.heungbu-holding-swallow.webp`
- **사용 장**: 6장 (제비가 머문 집)
- **프롬프트**:
```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style. Full body standing of Heungbu gently cupping a tiny injured baby swallow in both hands with immense care. Looking down with a tender, compassionate smile, soft eyes. Wearing humble peasant hanbok with a brown vest, topknot. Clean dark sepia ink lineart, soft watercolor wash, Hanji texture, pure white background, no shadows.
```

#### 4) 흥부 - 톱질하는 모습 (박 타기)
- **파일명**: `heungbu.character.heungbu-sawing.webp`
- **사용 장**: 7장 (박이 열리던 날)
- **프롬프트**:
```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style. Full body of Heungbu dynamically pulling a large two-man traditional wood saw with both hands, working hard, sweat on brow, hopeful and excited bright facial expression. Rolled-up sleeves, peasant hanbok, topknot. Clean dark sepia ink lineart, soft watercolor wash, Hanji texture, pure white background, no shadows.
```

#### 5) 흥부 - 비단옷 부농 (형을 환대하는 모습)
- **파일명**: `heungbu.character.heungbu-prosperous.webp`
- **사용 장**: 11장, 12A/12B장 (뒤바뀐 문 앞, 엔딩)
- **프롬프트**:
```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style. Full body standing of Heungbu as a prosperous and generous patriarch in his mid-30s. Warm open-hearted welcoming posture with arms gently opened, dignified yet deeply humble warm smile. Wearing a fine light jade-green silk hanbok coat (durumagi) and neat black headband. Clean dark sepia ink lineart, soft watercolor wash, Hanji texture, pure white background, no shadows.
```

---

### [놀부 세트]

#### 6) 놀부 - 기본형 (장부와 깐깐한 계산)
- **파일명**: `heungbu.character.nolbu-default.webp`
- **사용 장**: 1장~4장 (곳간과 계약)
- **프롬프트**:
```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style. Full body standing of Nolbu, a shrewd and calculating Korean landlord in his mid-30s. Sharp observant gaze, dignified posture holding a traditional ledger book in one hand, other hand tucked behind back. Wearing a fine dark navy sleeveless coat (gwaeja) over clean greyish-blue hanbok robes, neatly groomed topknot. Clean dark sepia ink lineart, soft watercolor wash, Hanji texture, pure white background, no shadows.
```

#### 7) 놀부 - 제비를 노려보는 욕심 (갈등과 탐욕)
- **파일명**: `heungbu.character.nolbu-plotting.webp`
- **사용 장**: 9장 (같아 보이는 방법)
- **프롬프트**:
```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style. Full body standing of Nolbu looking up with a conflicted, cunning, and greedy expression. One hand reaching up toward the eaves, suspicious and restless body posture. Fine navy hanbok vest, topknot. Clean dark sepia ink lineart, soft watercolor wash, Hanji texture, pure white background, no shadows.
```

#### 8) 놀부 - 몰락과 망연자실 (주저앉은 반성)
- **파일명**: `heungbu.character.nolbu-ruined.webp`
- **사용 장**: 10장, 11장 (다른 박, 뒤바뀐 문 앞)
*(옹고집전의 `classic-worn-reflection` 오마주)*
- **프롬프트**:
```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style. Full body standing of Nolbu completely ruined and devastated. Head bowed low in deep shame and despair, hands clasped humbly in front. Disheveled crooked traditional hat (gat), torn and dirty tattered blue durumagi coat, worn-out shoes. Remorseful and sorrowful expression. Clean dark sepia ink lineart, soft watercolor wash, Hanji texture, pure white background, no shadows.
```

#### 9) 놀부 - 반쪽 떡을 내미는 화해 (엔딩 B)
- **파일명**: `heungbu.character.nolbu-sharing-cake.webp`
- **사용 장**: 12A장, 12B장 (함께 짓는 밭, 두 집 사이의 길)
- **프롬프트**:
```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style. Full body standing of Nolbu in his late 30s, matured and reformed. Shy yet genuine gentle smile, hands holding out a halved traditional rice cake wrapped in hemp cloth toward the viewer. Wearing simple, honest working peasant hanbok. Clean dark sepia ink lineart, soft watercolor wash, Hanji texture, pure white background, no shadows.
```

---

### [가족 및 조연]

#### 10) 흥부 아내 - 온화한 내조 (아기를 안은 모습)
- **파일명**: `heungbu.character.wife-heungbu.webp`
- **사용 장**: 3장~7장, 11장
- **프롬프트**:
```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style. Full body standing of Heungbu's wife, a gentle and resilient Korean peasant woman in her late 20s. Warm motherly smile, calm affectionate eyes, carrying a sleeping baby bundled in a quilted cloth wrap on her back or gently in front. Wearing modest ivory jeogori jacket and faded indigo skirt, braided bun (jjokmeori) with a wooden pin. Clean dark sepia ink lineart, soft watercolor wash, Hanji texture, pure white background, no shadows.
```

#### 11) 놀부 아내 - 단호한 조언자
- **파일명**: `heungbu.character.wife-nolbu.webp`
- **사용 장**: 8장, 10장, 12장
- **프롬프트**:
```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style. Full body standing of Nolbu's wife, an articulate and sensible Korean lady in her 30s. Firm, dignified posture with arms lightly folded, intelligent and poised expression speaking advice. Wearing a fine plum-purple jeogori and navy skirt, neat traditional hair. Clean dark sepia ink lineart, soft watercolor wash, Hanji texture, pure white background, no shadows.
```

#### 12) 아이들 (흥부네 남매)
- **파일명**: `heungbu.character.children.webp`
- **사용 장**: 1장, 4장, 7장, 12장
*(선녀와 나무꾼의 `classic-children` 오마주)*
- **프롬프트**:
```text
Korean traditional folk tale picture book illustration, classic Korean children's storybook style. Full body of two adorable Korean children (an 8-year-old boy and a 6-year-old girl) holding hands together. Cute expressive dark eyes, bright innocent smiles, 3.5-head cute proportions. Wearing simple traditional children's hanbok (yellow ochre jacket and blue baggy pants for boy, soft pink jacket and mauve bloomers for girl). Clean dark sepia ink lineart, soft watercolor wash, Hanji texture, pure white background, no shadows.
```

---

## 4. 저장 및 자동 적용 위치

생성된 이미지 파일은 아래 폴더에 해당 파일명으로 저장하면 시스템에 바로 연결할 수 있습니다:
- **저장 경로**: `/Volumes/WAN2/apps/story-maker/public/story-assets/`
- 파일이 해당 경로에 들어오면, `app/story-assets.ts`에 ID 등록 후 277컷에 즉시 좌·우 배치됩니다.
