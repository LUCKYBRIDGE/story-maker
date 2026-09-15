# 토끼전 원작 읽기 시각 설계

기준: GitHub main `f96059d`, 5장 56컷(11/12/11/12/10). 대본·화자·순서·ID 보존. A=그대로 사용, B=기존 자산의 배치/표정 수정, C=임시 재사용, D=신규 필요. 평가는 컷 전체이며 A 자산도 B/D 컷에 재사용한다.

## 현재 자산 진단

- A 자산: 병든 용왕, 기본·놀람·의심·생각·설명 토끼, 결심·제안·지친 별주부, 빈 들판·물가·용궁 대전. 실제 그림을 대조해 사용. `dragonking-unified`도 실제로 병든 이미지이므로 건강한 왕으로 단정하지 않는다. 병든 포즈 ID로 후반 연결을 통일한다.
- B: 미등장 인물 제거, 처음 만나는 인물의 방향과 표정, 마지막 토끼 제거. 각 컷에는 명시적 자산을 넣고 장 기본 캐릭터를 비워 빈 슬롯의 상속을 차단한다.
- C: 1-05 도사 방문은 별도 캐릭터 없이 병든 왕과 해설. 어류 의관을 도사로 잘못 대입하지 않는다.
- D: 이동용으로 연결된 `bg-flashback-rescue`는 실제 그림이 용궁 실내여서 바다 이동을 전달하지 못한다. 기존 특수 CG의 자라는 관복 없는 동물 형태로 기준 캐릭터와 달라 재사용하지 않는다. 기본 물가에는 작은 자라가 들어 있어 별도 배우와 중복을 피한다.
- 신하 배경은 무기/포박/공포 없이 조심스러운 수궁 문관들만 표현한다. 장기 묘사·화해·각색 결말 CG를 넣지 않는다.

## 생성 전 필요 자산표 (최초 검토)

|우선순위|자산 ID (`rabbit-turtle.` 접두사)|종류|사용 컷|기존 대체 가능성|신규 이유|
|---|---|---|---|---|---|
|필수|character.classic-riding|분리형 두 인물|3-03~08, 5-03~06|낮음|등에 탄 이동, 왕복 재사용|
|필수|background.classic-escape|상황 CG|5-07|낮음|탈출 동작|
|높음|character.classic-turtle-portrait|전신|1-11, 2-02~05|낮음|초상화 탐색|
|높음|background.classic-sea|배경|3-03~06, 5-05~06|낮음|수면과 멀어진 육지|
|높음|background.classic-underwater|배경|3-07, 5-03~04|낮음|수중 이동|
|높음|background.classic-palace-vista|배경|1-01, 3-08|중간|아름다운 용궁 외경|
|높음|background.classic-court|군중 배경|1-06~09, 3-09/11, 4-01~04|중간|머뭇거림과 신하들의 시선|
|높음|character.classic-rabbit-laugh|전신|4-06~08|중간|두려움에서 능청스러운 웃음|
|높음|background.classic-shore-reveal|상황 CG|5-08~09|낮음|육지와 물속의 안전한 거리|

## 최종 제작 방식 — 사용자 후속 결정

2026-09-15 사용자 지시: 이번 원작은 글상자 + 배경 + 좌우(이동 묶음은 중앙)의 분리 캐릭터 방식으로 통일. 최초 제작한 탈출/대치 올인원 CG는 `work/story-assets/rabbit-classic-art/`에 따로 보관하고, public 카탈로그와 원작 컷에서 제외한다. 기존 대본과 저장 형식은 유지한다.

최종 신규 연결 대상은 배경 4종 + 독립 캐릭터 6종(합계 10종)이다. 군중 배경에는 조연 신하만 포함하고 용왕/토끼/별주부는 별도 자산으로 배치한다.

|최종 자산|종류|사용 컷|이유|
|---|---|---|---|
|`rabbit-turtle.background.classic-sea`|배경|3-03, 3-04, 3-05, 3-06, 5-05, 5-06|멀어진 육지|
|`rabbit-turtle.background.classic-underwater`|배경|3-07, 5-03, 5-04|산호 사이 이동|
|`rabbit-turtle.background.classic-palace-vista`|배경|1-01, 3-08|외경|
|`rabbit-turtle.background.classic-court`|배경|1-06, 1-07, 1-08, 1-09, 3-09, 3-11, 4-01, 4-02, 4-03, 4-04|머뭇거리는 신하들|
|`rabbit-turtle.character.classic-turtle-portrait`|전신 캐릭터|1-11, 2-02, 2-03, 2-04, 2-05|토끼 초상화를 듦|
|`rabbit-turtle.character.classic-riding`|여러 인물 캐릭터|3-03, 3-04, 3-05, 3-06, 3-07, 3-08, 5-03, 5-04, 5-05, 5-06|등에 타고 이동|
|`rabbit-turtle.character.classic-rabbit-laugh`|전신 캐릭터|4-06, 4-07, 4-08|능청스러운 웃음|
|`rabbit-turtle.character.classic-rabbit-leap`|전신 캐릭터|5-07|등에서 뛰어내림|
|`rabbit-turtle.character.classic-rabbit-rock`|전신 캐릭터|5-08, 5-09|바위 위에서 밝히는 꾀|
|`rabbit-turtle.character.classic-turtle-water`|상반신 캐릭터|5-07, 5-08, 5-09|물가에서 올려다봄|

## 56컷 전체 배치표

현재/최종 값은 `배경 / 왼쪽 / 오른쪽`. ID에서 `rabbit-turtle.background.` 또는 `rabbit-turtle.character.`를 생략했다. `—`는 인물 없음. 이동 묶음은 코드상 왼쪽 슬롯에 들어가지만 배우가 하나인 그룹이므로 중앙 배치한다.

|컷|현재 배경 / 왼쪽 / 오른쪽|평가·조치|최종 배경 / 왼쪽 / 오른쪽|올인원 CG|연출|
|---|---|---|---|---|---|
|1-01|rabbit-turtle-bg-palace / turtle-unified-720x900 / dragonking-sick-elder-attached|D · 신규+재배치|classic-palace-vista / — / —|없음|용궁 외경, 인물 도입 전|
|1-02|rabbit-turtle-bg-palace / turtle-unified-720x900 / dragonking-sick-elder-attached|B · 수정|rabbit-turtle-bg-palace / — / dragonking-sick-elder-attached|없음|병든 용왕 단독|
|1-03|rabbit-turtle-bg-palace / turtle-unified-720x900 / dragonking-sick-elder-attached|B · 수정|rabbit-turtle-bg-palace / — / dragonking-sick-elder-attached|없음|병든 용왕의 호소|
|1-04|rabbit-turtle-bg-palace / turtle-unified-720x900 / dragonking-sick-elder-attached|B · 수정|rabbit-turtle-bg-palace / palace-physician-worried / dragonking-sick-elder-attached|없음|의원과 병든 용왕|
|1-05|rabbit-turtle-bg-palace / turtle-unified-720x900 / dragonking-sick-elder-attached|C · 수정|rabbit-turtle-bg-palace / — / dragonking-sick-elder-attached|없음|도사는 해설로 전달, 의관을 도사로 대체하지 않음|
|1-06|rabbit-turtle-bg-palace / turtle-unified-720x900 / dragonking-sick-elder-attached|D · 신규+재배치|classic-court / — / dragonking-sick-elder-attached|없음|육지행 질문과 신하들|
|1-07|rabbit-turtle-bg-palace / turtle-unified-720x900 / dragonking-sick-elder-attached|D · 신규+재배치|classic-court / — / dragonking-sick-elder-attached|없음|시선을 피하는 신하들|
|1-08|rabbit-turtle-bg-palace / turtle-unified-720x900 / dragonking-sick-elder-attached|D · 신규+재배치|classic-court / — / dragonking-sick-elder-attached|없음|망설임 유지|
|1-09|rabbit-turtle-bg-palace / turtle-unified-720x900 / dragonking-sick-elder-attached|D · 신규+재배치|classic-court / — / dragonking-sick-elder-attached|없음|용왕의 재촉|
|1-10|rabbit-turtle-bg-palace / turtle-unified-720x900 / dragonking-sick-elder-attached|B · 수정|rabbit-turtle-bg-palace / turtle-resolve / dragonking-sick-elder-attached|없음|나서는 별주부|
|1-11|rabbit-turtle-bg-palace / turtle-unified-720x900 / dragonking-sick-elder-attached|D · 신규+재배치|rabbit-turtle-bg-palace / classic-turtle-portrait / dragonking-sick-elder-attached|없음|초상화 전달|
|2-01|rabbit-turtle-bg-shore / rabbit-white-unified-720x900 / turtle-unified-720x900|B · 수정|rabbit-turtle-bg-shore-escape / — / turtle-resolve|없음|빈 물가에 별주부 단독|
|2-02|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|rabbit-turtle-bg-grassland / — / classic-turtle-portrait|없음|초상화와 낯선 육지|
|2-03|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|rabbit-turtle-bg-grassland / — / classic-turtle-portrait|없음|초상화를 들고 탐색|
|2-04|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|rabbit-turtle-bg-grassland / — / classic-turtle-portrait|없음|그림과 짐승을 비교|
|2-05|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / classic-turtle-portrait|없음|처음 토끼 등장|
|2-06|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-unified-720x900|B · 수정|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-offer|없음|서로 마주 보고 인사|
|2-07|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-unified-720x900|B · 수정|rabbit-turtle-bg-grassland / rabbit-suspicious / turtle-offer|없음|토끼의 경계|
|2-08|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-unified-720x900|B · 수정|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-offer|없음|용궁 설명|
|2-09|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-unified-720x900|B · 수정|rabbit-turtle-bg-grassland / rabbit-suspicious / turtle-offer|없음|토끼의 의심|
|2-10|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-unified-720x900|B · 수정|rabbit-turtle-bg-grassland / rabbit-thinking / turtle-offer|없음|설득에 귀 기울임|
|2-11|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-unified-720x900|B · 수정|rabbit-turtle-bg-grassland / rabbit-thinking / turtle-resolve|없음|토끼가 고민|
|2-12|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-unified-720x900|B · 수정|rabbit-turtle-bg-grassland / rabbit-speaking-truth / turtle-resolve|없음|용궁행 결정|
|3-01|rabbit-turtle-bg-shore / rabbit-white-unified-720x900 / turtle-unified-720x900|B · 수정|rabbit-turtle-bg-shore-escape / rabbit-suspicious / turtle-resolve|없음|물가에서 멈춤|
|3-02|rabbit-turtle-bg-shore / rabbit-white-unified-720x900 / turtle-unified-720x900|B · 수정|rabbit-turtle-bg-shore-escape / rabbit-suspicious / turtle-offer|없음|등에 타라는 제안|
|3-03|rabbit-turtle-bg-flashback-rescue / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|classic-sea / classic-riding / —|없음|등에 타고 바다로|
|3-04|rabbit-turtle-bg-flashback-rescue / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|classic-sea / classic-riding / —|없음|돌아보는 토끼의 불안|
|3-05|rabbit-turtle-bg-flashback-rescue / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|classic-sea / classic-riding / —|없음|멀어진 육지|
|3-06|rabbit-turtle-bg-flashback-rescue / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|classic-sea / classic-riding / —|없음|이동 연속성|
|3-07|rabbit-turtle-bg-flashback-rescue / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|classic-underwater / classic-riding / —|없음|산호와 물고기|
|3-08|rabbit-turtle-bg-flashback-rescue / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|classic-palace-vista / classic-riding / —|없음|용궁 첫 발견|
|3-09|rabbit-turtle-bg-palace / rabbit-white-unified-720x900 / dragonking-unified-720x900|D · 신규+재배치|classic-court / rabbit-white-unified-720x900 / dragonking-sick-elder-attached|없음|신하들의 시선과 병든 왕|
|3-10|rabbit-turtle-bg-palace / rabbit-white-unified-720x900 / dragonking-unified-720x900|B · 수정|rabbit-turtle-bg-palace / rabbit-speaking-truth / dragonking-sick-elder-attached|없음|토끼의 인사|
|3-11|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|D · 신규+재배치|classic-court / rabbit-shocked / dragonking-sick-elder-attached|없음|붙잡으라는 명령에 놀람|
|4-01|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|D · 신규+재배치|classic-court / rabbit-shocked / dragonking-sick-elder-attached|없음|충격|
|4-02|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|D · 신규+재배치|classic-court / rabbit-shocked / dragonking-sick-elder-attached|없음|사실 확인|
|4-03|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|D · 신규+재배치|classic-court / rabbit-shocked / dragonking-sick-elder-attached|없음|병을 고치려는 왕|
|4-04|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|D · 신규+재배치|classic-court / rabbit-shocked / dragonking-sick-elder-attached|없음|신하들 사이 갇힘, 무기 없이 긴장|
|4-05|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|B · 수정|rabbit-turtle-bg-palace / rabbit-thinking / dragonking-sick-elder-attached|없음|생각에 집중|
|4-06|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|D · 신규+재배치|rabbit-turtle-bg-palace / classic-rabbit-laugh / dragonking-sick-elder-attached|없음|두려움을 감추고 웃음|
|4-07|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|D · 신규+재배치|rabbit-turtle-bg-palace / classic-rabbit-laugh / dragonking-sick-elder-attached|없음|용왕이 웃는 이유를 물음|
|4-08|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|D · 신규+재배치|rabbit-turtle-bg-palace / classic-rabbit-laugh / dragonking-sick-elder-attached|없음|능청스러운 답변|
|4-09|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|B · 수정|rabbit-turtle-bg-palace / rabbit-speaking-truth / dragonking-sick-elder-attached|없음|용왕의 의문|
|4-10|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|B · 수정|rabbit-turtle-bg-palace / rabbit-speaking-truth / dragonking-sick-elder-attached|없음|간은 시각화하지 않고 말로만 설명|
|4-11|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|B · 수정|rabbit-turtle-bg-palace / rabbit-thinking / dragonking-sick-elder-attached|없음|용왕의 반응을 살핌|
|4-12|rabbit-turtle-bg-palace-trap / rabbit-white-unified-720x900 / dragonking-unified-720x900|B · 수정|rabbit-turtle-bg-palace / rabbit-speaking-truth / dragonking-sick-elder-attached|없음|육지로 보내 달라는 제안|
|5-01|rabbit-turtle-bg-palace / rabbit-white-unified-720x900 / dragonking-unified-720x900|B · 수정|rabbit-turtle-bg-palace / rabbit-thinking / dragonking-sick-elder-attached|없음|용왕의 마음이 흔들림|
|5-02|rabbit-turtle-bg-palace / rabbit-white-unified-720x900 / dragonking-unified-720x900|B · 수정|rabbit-turtle-bg-palace / turtle-resolve / dragonking-sick-elder-attached|없음|별주부에게 내리는 명령|
|5-03|rabbit-turtle-bg-flashback-rescue / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|classic-underwater / classic-riding / —|없음|다시 등에 타고 출발|
|5-04|rabbit-turtle-bg-flashback-rescue / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|classic-underwater / classic-riding / —|없음|산호 사이 귀환|
|5-05|rabbit-turtle-bg-shore / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|classic-sea / classic-riding / —|없음|수면과 먼 육지|
|5-06|rabbit-turtle-bg-shore / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|classic-sea / classic-riding / —|없음|물가에 가까이 가 달라는 요청|
|5-07|rabbit-turtle-bg-shore / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|rabbit-turtle-bg-shore-escape / classic-rabbit-leap / classic-turtle-water|없음|분리된 도약 토끼와 물가 별주부|
|5-08|rabbit-turtle-bg-shore / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|rabbit-turtle-bg-shore-escape / classic-rabbit-rock / classic-turtle-water|없음|바위 소품 포함 토끼와 물가 별주부를 좌우 분리 배치|
|5-09|rabbit-turtle-bg-shore / rabbit-white-unified-720x900 / turtle-unified-720x900|D · 신규+재배치|rabbit-turtle-bg-shore-escape / classic-rabbit-rock / classic-turtle-water|없음|바위 소품 포함 토끼와 물가 별주부를 좌우 분리 배치|
|5-10|rabbit-turtle-bg-grassland / rabbit-white-unified-720x900 / turtle-unified-720x900|B · 수정|rabbit-turtle-bg-shore-escape / — / turtle-tired|없음|토끼 없는 빈 물가, 홀로 돌아가는 여운|

## 표시·검증 계약

- StoryBookPlayback → StoryPlayer → StoryStage 경로 보존. 일반 배경은 기존 crop 안전 전환, 군중처럼 의미를 가진 배경은 contain 전체 표시를 유지한다.
- 그룹 배우 한 개만 있는 이동 컷은 중앙 배치하고 두 화자가 함께 있는 그룹 전체를 듣는 인물처럼 어둡게 만들지 않는다. 좌우 단독 캐릭터의 기존 화자 강조는 유지한다.
- 1장: 외경 → 병든 왕/의원 → 신하들 → 초상화. 2장: 물가 → 별주부 단독 탐색 → 토끼 발견/첫 대화. 3장: 물가 → 수면 → 수중 → 용궁. 4장: 충격 → 생각 → 능청스러운 웃음/설명. 5장: 용궁 → 수중/수면 → 탈출 → 안전한 거리 → 별주부 단독.
- 1-05의 도사는 별도 그림으로 표현하지 않는 C 수준 재사용이다. 대본을 수정하거나 의관을 도사로 오인시키지 않는다.
- 대본·화자·순서·ID 해시를 main f96059d와 대조한다. 1365×900, 820×1180, 390×844에서 56컷 전수 이동과 주요 10장면 스크린샷을 확인한다.
- 신규 인물 6종은 실제 알파와 경계 여백을 자동 검사했다. 일반 선 자세(초상화 별주부·웃는 토끼)는 800×1200, 발선 y=1149로 정렬했다. 도약·수영·바위 소품은 동작을 보존한 균일 축소만 적용했다. 기존 기준본과 비교표·실제 좌우 무대로 얼굴·의상·색상·몸 비율을 육안 검수했다.
- 사용자 허용을 받아 로컬 Vision의 전경 마스크로 배경만 제거했다. 바위·물결이 누락된 부분은 원본에서 복원했다. 원본과 정규화 중간 PNG를 보존하고 최종 WebP를 인코딩했다.
- 용궁 외경은 지붕 전체를 보존하도록 scene/contain으로 표시한다. 신하 배경도 전체 표시한다. 모바일은 기존 전체 표시와 흐린 여백을 유지해 캐릭터가 배경 프레임 하단 여백까지 내려올 수 있다.

## 제작 원본과 프롬프트

내장 ImageGen을 사용했다. 생성 원본과 올인원 참고본은 작업 폴더에 보존하고 배포 경로에는 최종 분리 자산만 둔다. 캐릭터 기준은 rabbit-thinking, turtle-resolve, dragonking-recovered-unified-720x900이며 신규 용왕은 생성하지 않았다. 주요 배경 기준은 bg-palace와 bg-shore-discussion이다.

### 실제 최초 제작 프롬프트

내장 ImageGen 사용. 기존 모델·배경 참조 경로는 저장소 public/story-assets 기준. 아래는 실제 사용한 프롬프트다.

#### classic-turtle-portrait

Use case: illustration-story. Create ONE isolated full-body character asset on genuine transparent alpha background, portrait 800x1200 composition. Reference 1 is the EXACT turtle character identity and style. Reference 2 is the rabbit to DRAW ON A PAPER PORTRAIT only. Keep turtle face, eye size, green coloring, dark segmented shell, blue and gold Korean official robe, dark purple ties, blue cap and gold badge, pouch, same head-to-body proportion and body scale. Change ONLY arm pose: turtle holding an open small vertical paper picture in both hands in front of his chest, looking attentively at the picture. Paper clearly shows a simple recognizable portrait of the reference rabbit's two long ears, round eyes and face, no text. Turtle faces slightly left as reference, both feet visible on common baseline, entire full body. Keep body centered x400, feet end y1149, hat around y150, generous transparent borders. Detailed hand-painted storybook linework matching reference, not pixelated, no new outfit, no photorealism, no 3D, no background, no ground shadow, no checkerboard.

#### classic-riding

Use case: illustration-story. ONE reusable transparent group character asset, landscape 1536x1024, true transparent alpha. Reference 1 is EXACT rabbit identity, reference 2 EXACT turtle identity. Depict the rabbit seated securely astride the turtle's shell while the turtle swims horizontally LEFT, head raised and both front arms extended in a gentle swimming stroke. Rabbit holds shell edge with paws, legs astride shell, ears completely visible, glances back right slightly worried but composed. Turtle still wears exact blue-gold official robe, cap with gold badge, purple ties, little pouch; shell remains dark brown segmented, face same green and eyes identical. Rabbit same warm gray-brown fur cream belly long ears pink nose, same head-body proportions and no clothes. Keep both original identities, expressive storybook brushwork and crisp contours. Clear believable contact between rabbit seat and turtle shell; no floating rider. Whole group centered and occupies only central 70% width, 75% height with transparent margin all around. No water, no waves, no shadow, no environment, no checkerboard, no text, no realistic animals, no extra limbs, no elongated ears, no 3D. This cutout must work over a sea surface OR underwater background.

#### classic-rabbit-laugh

Use case: illustration-story. ONE isolated full-body character asset, genuine transparent alpha, portrait 800x1200. Use reference as exact character model. Change only facial expression and hands: rabbit laughing knowingly to conceal fear, eyes smiling, small open cheerful mouth, one paw lightly against belly and other lifted in conversational gesture. Face three-quarter RIGHT. Keep original warm gray-brown color, cream belly, pink triangular nose, same exact ear length/shape, eye size, head/body proportions, feet/body pose and brushwork. Match body height/face size of reference, body center x400 and feet end y1149; entire ears within canvas with at least 120px top margin. This is witty and theatrical, not sinister or smug cruelty. No organs, no clothing, no background or shadow, no checkerboard, no text, no 3D.

#### classic-sea

Use case illustration-story. Create a 16:9 landscape environmental background for a Korean children's storybook game. Match the reference's richly detailed painted fantasy brushwork, fine visible texture and crisp environmental details, no 3D. This scene is OUTDOORS at the blue ocean surface, low gently rippling blue-turquoise water across foreground, distant small Korean pine-covered hills and shore on horizon in the upper third, softly golden morning sky, calm wonder. Reserve a broad open area of ocean in lower center for separately overlaid rabbit riding turtle. No people, no turtles, no rabbits, no boats, no palace, no writing, no props or modern objects. Bright enough for reading, subtle sense of distance, not a storm, not sunset orange everywhere. Natural wide establishing view, no blur.

#### classic-underwater

Use case illustration-story. Create ONE 16:9 landscape underwater environmental background for Korean children's storybook game, matching reference's detailed hand-painted fantasy rendering and blue palette. Wide open underwater passage with layered red and turquoise coral on both lower sides, small schools of colorful fish farther back, clear cyan light shafts from distant surface above, deeper cobalt depth beyond. Leave center spacious for separately overlaid two-character riding group. NO architecture or palace yet; this is the journey before palace is revealed. No humans, no turtle, no rabbit, no text, no bubbles obscuring center, no 3D, no heavily blurred background. Luminous welcoming wonder with sense of descending into deep sea.

#### classic-palace-vista

Use case illustration-story. Create ONE 16:9 landscape illustration of a magnificent Korean underwater dragon palace seen from OUTSIDE at a distance. Reference is its existing INTERIOR and determines blue stone, gold ornamental motifs, luminous cyan, painterly fantasy style. Wide symmetrical multi-roof Korean palace with sweeping eaves, pearl-lit pillars and glowing ornate gate in middle distance, approachable and beautiful, coral gardens and tiny colorful fish framing sides. Foreground open blue seabed/passage, top luminous water with rays. Palace fully visible with roofs well inside canvas, central 70% safe area, no clipped eaves. No characters, no king, no rabbit or turtle, no boats, no modern architecture, no writing. Detailed crisp texture consistent with reference, not photorealistic and not 3D.

#### classic-court

Use case: illustration-story. Edit reference palace interior into ONE reusable 16:9 crowd background. Preserve the palace's exact blue stone pillars, architecture, floor, ornamental cyan glowing central gate and hand-painted textured style. Add a small group of 5 adult sea court ministers (fish, shrimp, crab types) in modest muted Korean robes, standing well BACK near the central doorway and middle-distance pillars, visible within central 65% of image. They are hesitant, heads lowered, paws/hands folded, avoiding volunteering. No king, no turtle, no rabbit. Leave both foreground left and foreground right EMPTY for separate large character overlays. Ministers modest scale (each 20-25% image height), no sinister expressions. This same background also shows courtiers silently watching a visitor later. Bright readable cyan-gold light. No weapons, chains, cages, violence, speech balloons, writing, blur, photorealism or 3D.

#### classic-escape

Use case illustration-story. ONE full scene CG, landscape 16:9 Korean children's storybook, detailed painterly fantasy. Reference 1 exact gray-brown rabbit model; reference 2 exact green turtle official model (blue-gold robe, purple ties, pouch, blue official cap, brown segmented shell). Reference 3 shore environment style only. Moment: rabbit has JUST LEAPT OFF the turtle's back onto dry land LEFT; rabbit is midair above a low dry rock near left-center, reaching forward, hind legs just extended, full ears and paws visible. Turtle in shallow water at right-center, still swimming posture, head turned surprised toward rabbit, same official clothing, body partly in water and shell visible. Clear daylight with warm afternoon shore and pine forest left, blue sea right. One rabbit, one turtle, NO duplicate actors. Action entirely within central 65% width and middle 65% height with generous edge safety. Rabbit's full body must not overlap turtle head. Believable anatomy, restrained happy escape not battle. No organ imagery, no violence, no modern items, no writing, no speech balloons, no 3D, no photorealistic animals, no blur. Distinct land-water boundary and splash under turtle, crisp detailed foreground.

#### classic-shore-reveal

Use case illustration-story. Edit this full scene into the very next moment, same exact two characters and shoreline, ONE 16:9 storybook illustration. Rabbit now stands securely with both feet ON the dry rock at left-center and turns RIGHT to address the turtle, smiling knowingly with one paw raised in a conversational gesture. Same exact reference gray-brown fur, face, ears length, head-body proportion. Turtle remains in the water at right-center in same blue-and-gold Korean robe and cap, same brown segmented shell and green face; he looks up toward rabbit, mildly bewildered, hands raised asking a question. Preserve clear physical gap and dry land vs water; turtle cannot reach rabbit. Preserve same detailed hand-painted style, pine forest, warm sunlight, blue water, framing. All ears and bodies clear inside image. No jumping now, no other characters, no handshake, no friendship/reconciliation, no organs, no violence, no writing, no 3D. This depicts the rabbit safely revealing his trick, not an alternate happy ending.

## 최종 파일과 재현

최종 자산은 모두 `public/story-assets/<asset id>.webp`에 저장한다. 카탈로그 원본은 `public/story-assets/rabbit-classic-manifest.json`, 등록 재생성은 `npm run assets:catalog`, 연결 원본은 `app/story-classic-rabbit-art.ts`다. 전체 그림에 주인공이 들어간 CG는 원작에 연결하지 않는다.

|파일|용량|
|---|---|
|[rabbit-turtle.background.classic-sea.webp](../../public/story-assets/rabbit-turtle.background.classic-sea.webp)|407 KiB|
|[rabbit-turtle.background.classic-underwater.webp](../../public/story-assets/rabbit-turtle.background.classic-underwater.webp)|439 KiB|
|[rabbit-turtle.background.classic-palace-vista.webp](../../public/story-assets/rabbit-turtle.background.classic-palace-vista.webp)|558 KiB|
|[rabbit-turtle.background.classic-court.webp](../../public/story-assets/rabbit-turtle.background.classic-court.webp)|357 KiB|
|[rabbit-turtle.character.classic-turtle-portrait.webp](../../public/story-assets/rabbit-turtle.character.classic-turtle-portrait.webp)|130 KiB|
|[rabbit-turtle.character.classic-riding.webp](../../public/story-assets/rabbit-turtle.character.classic-riding.webp)|159 KiB|
|[rabbit-turtle.character.classic-rabbit-laugh.webp](../../public/story-assets/rabbit-turtle.character.classic-rabbit-laugh.webp)|97 KiB|
|[rabbit-turtle.character.classic-rabbit-leap.webp](../../public/story-assets/rabbit-turtle.character.classic-rabbit-leap.webp)|115 KiB|
|[rabbit-turtle.character.classic-rabbit-rock.webp](../../public/story-assets/rabbit-turtle.character.classic-rabbit-rock.webp)|138 KiB|
|[rabbit-turtle.character.classic-turtle-water.webp](../../public/story-assets/rabbit-turtle.character.classic-turtle-water.webp)|176 KiB|

원본·분리·정렬 기록: `work/story-assets/rabbit-classic-art/normalization.json`과 `comparison.png`. 올인원 보관: `classic-escape-all-in-one.webp`, `classic-shore-reveal-all-in-one.webp`(같은 로컬 작업 폴더, 배포 제외).


## 분리 자산 후속 제작 지시(요약)

- `classic-rabbit-leap`: 기준 토끼의 귀·얼굴·털색·비율을 유지하고 왼쪽으로 뛰는 전신만 분리. 장면 배경과 별주부는 포함하지 않음.
- `classic-rabbit-rock`: 같은 토끼가 작은 마른 바위 위에서 오른쪽을 향해 말하는 자세. 바위는 안전한 육지라는 의미를 전달하는 부속 소품으로 함께 보존.
- `classic-turtle-water`: 기준 관복·관모·등껍질을 유지한 별주부가 물가에서 놀라 올려다보는 자세. 작은 물결 소품을 보존하고 배경은 투명화.
- 세 자산 모두 생성본을 육안 대조한 뒤 사용자 허용에 따라 로컬 배경 제거. 제거 과정에서 사라진 바위/물결은 생성본의 원래 픽셀로 복원. 인물 형태·색감 변경 없이 균일 크기와 위치만 정렬.

## 화면 증거와 회귀 방법

주요 장면 10개(전체 컷 번호 2, 15, 17, 26, 31, 34, 39, 50, 53, 55)의 글상자 포함 화면:

- [데스크톱 1365×900](../qa/evidence/RT-ART-01-key-scenes-1365.png)
- [태블릿 820×1180](../qa/evidence/RT-ART-01-key-scenes-820.png)
- [모바일 390×844](../qa/evidence/RT-ART-01-key-scenes-390.png)

`npm run build:github` 후 `QA_SUITES=classic-reading,rabbit-art,story-flow,pinky-examples node tests/browser/run-smoke.mjs`로 정적 산출물을 검증한다. `rabbit-art`는 56컷×3화면을 모두 이동하며 이미지 로드/배치, 글상자 경계, 중앙 이동 캐릭터, 탈출과 마지막 단독 귀환을 검사한다. 자산 불변/대본 해시/투명도·발선 검사는 `tests/rabbit-classic-art.test.mjs`에 유지한다. 현재 완료 증거는 개발 상태표에서 관리한다.
