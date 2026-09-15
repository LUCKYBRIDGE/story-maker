# 옹고집전 원작 읽기 — 컷별 비주얼 설계·제작 목록

기준: GitHub main 5310509, 2026-09-15. 대본·화자·장/컷 순서와 ID는 불변.

## 확정 방식

2026-09-15 사용자 후속 결정: **글상자 + 인물 없는 배경 + 좌우 캐릭터의 분리 배치**를 원작 읽기 전체에 적용한다. 올인원 삽화는 별도 보관하고 원작 읽기/카탈로그에 연결하지 않는다. 기존 공통 플레이어의 두 인물 무대를 유지한다.

기존 화풍은 세밀한 윤곽선·부드러운 채색과 친근한 약 4등신이다. 기준 인물은 real-consistent-pixel의 파란 도포·보라 띠·검은 갓. 가짜는 같은 파란 계열을 쓰고 갈색 double·유령·현대 각색 집단 CG는 제외한다. 새 변형은 기준 인물과 같은 얼굴·체격·의상을 참조한다. 어머니·승려·도승은 각각 신규 기준 모델을 잠근다.

같은 장소의 배경을 유지하며 인물·자세로 박자를 바꾼다. 첫 대면은 충격/앉은 가짜, 절정은 분노/침착, 추방 후에는 좋은 옷→헤진 옷→고개 숙임으로 이어진다. 문전박대는 초반 왼쪽 문 안/후반 오른쪽 문 안으로 반전한다. 차가운 방과 따뜻한 창호 밖, 닫힌 대문과 열린 대문을 대응시킨다. 짚 인형·부적도 투명 자산이며 배경과 분리한다.

## 71컷 사전 분류·배치

A 기존 그대로 / B 재배치 / C 새 포즈 / D 새 인물 / E 특수 투명 자산 / F 새 배경. G(올인원 CG)는 이번 적용에서 제외. 파일 stem에 기존 asset ID 규칙을 적용한다.

| 컷 | 기준 대본 도입 | 분류 | 배경 | 왼쪽 | 오른쪽 | 연출 |
|---|---|---|---|---|---|---|
| 1-01 | 옛날 어느 고을에 옹고집이라는 큰 부자가 살았다. 넓은 논밭과 커… | B/F | closed-house | real-consistent-pixel | — | 닫힌 대문·곳간 배경과 거만한 옹고집 |
| 1-02 | 가을이면 새로 거둔 곡식 자루가 곳간 안에 층층이 들어찼다. 그러… | B/F | closed-house | real-consistent-pixel | — | 닫힌 대문·곳간 배경과 거만한 옹고집 |
| 1-03 | 아이들이 며칠째 제대로 먹지 못했습니다. 곡식 한 됫박만 빌려주시… | B/F | gate-threshold | real-consistent-pixel | worker-asking-v2-pixel | 문 안 왼쪽 주인·문 밖 오른쪽 청원자 |
| 1-04 | 내가 애써 모은 곡식을 왜 남의 집 걱정에 내놓아야 하나? 갚겠다… | B/F | gate-threshold | real-angry-pixel | worker-asking-v2-pixel | 문 안 왼쪽 주인·문 밖 오른쪽 청원자 |
| 1-05 | 옹고집은 마을 사람이 보는 앞에서 곳간 문을 굳게 잠갔다. 안에는… | B/F | closed-house | real-consistent-pixel | worker-asking-v2-pixel | 닫힌 대문·곳간 배경과 거만한 옹고집 |
| 1-06 | 집안사람들에게도 인색하기는 마찬가지였다. 어느 날 하인이 곡식 자… | B | spring-courtyard-pixel | real-consistent-pixel | servant-household-pixel | 하인과 주인 |
| 1-07 | 눈을 어디에 두고 일하는 게냐? 한 톨이라도 허투루 버리면 그만큼… | A | spring-courtyard-pixel | real-angry-pixel | servant-household-pixel | 꾸짖는 손 |
| 1-08 | 같은 집에는 나이 많은 어머니도 살고 있었다. 추운 겨울날에도 어… | F/D | cold-room | — | classic-mother | 회청색 방, 몸을 웅크린 어머니 |
| 1-09 | 오늘은 바람이 유난히 차구나. 아궁이에 장작을 몇 개만 더 넣어 … | D | cold-room | — | classic-mother | 어머니에게 시선 집중 |
| 1-10 | 장작도 모두 돈입니다. 벌써 불을 땠는데 또 넣을 필요가 있겠습니… | D | cold-room | real-consistent-pixel | classic-mother | 부유한 아들과 추운 어머니 |
| 1-11 | 곳간에는 곡식이 가득하고 마당에는 장작이 쌓여 있었지만 옹고집의 … | B/F | closed-house | real-consistent-pixel | — | 닫힌 대문·곳간 배경과 거만한 옹고집 |
| 2-01 | 어느 날, 수행길에 오른 한 승려가 옹고집의 집 앞에 이르렀다. … | B/F/D | gate-threshold | real-consistent-pixel | classic-monk | 승려가 대문 밖에서 합장 |
| 2-02 | 지나는 길에 시주를 청합니다. 많지 않아도 좋으니 곡식 한 줌 나… | B/F/D | gate-threshold | real-consistent-pixel | classic-monk | 차분히 시주를 청함 |
| 2-03 | 오늘은 곡식을 달라는 사람이 둘이나 되는군. 우리 집이 누구든 찾… | B/F/D | gate-threshold | real-angry-pixel | classic-monk | 주인의 거절 |
| 2-04 | 곡식 한 줌이면 충분합니다. 먼 길을 가는 데 요긴히 쓰겠습니다.… | B/F/D | gate-threshold | real-consistent-pixel | classic-monk | 한 줌의 곡식을 거듭 청함 |
| 2-05 | 내놓을 것은 없소. 아직도 여기 서 있느냐? 어서 대문 밖으로 내… | B/F/D | gate-threshold | real-angry-pixel | classic-monk | 옹고집의 내보내라는 명령 |
| 2-06 | 하인들은 주인의 눈치를 보며 승려를 거칠게 대문 밖으로 몰아냈다.… | B/F/D/C | gate-threshold | classic-servant-usher | classic-monk | 하인이 문 밖으로 내보내는 손짓 |
| 2-07 | 승려는 산중에 있는 스승을 찾아가 옹고집의 일을 이야기했다. 이야… | D/F | hermitage | classic-monk | classic-master | 산중 스승과 제자 |
| 2-08 | 말로 일러서는 깨닫지 못할 사람이로구나. 그렇다면 다른 방법이 있… | D/F | hermitage | classic-monk | classic-master | 생각에 잠긴 도승 |
| 2-09 | 도승은 마른 풀과 짚을 가져와 사람의 몸처럼 엮기 시작했다. 팔과… | B/F/C/E | hermitage | classic-master-talisman | classic-straw-bound | 도승과 풀·짚 몸, 이마에 붙은 부적 |
| 2-10 | 도승이 주문을 외우자 축 늘어져 있던 짚 인형이 천천히 허리를 폈… | B/F/D/E | hermitage | classic-master | classic-straw-rising | 도승과 일어나며 사람으로 변하는 짚 |
| 2-11 | 잠시 뒤 눈썹과 수염, 옷차림과 목소리까지 옹고집과 꼭 같은 사람… | D/F | hermitage | classic-master | double-blue-gentle-consistent-pixel | 기준 옹고집과 같은 얼굴·파란 옷 |
| 2-12 | 가짜 옹고집이 대문에 이르자 하인은 조금도 의심하지 않고 주인에게… | B/F/C | gate-threshold | classic-servant-door | double-blue-gentle-consistent-pixel | 문을 열고 집주인으로 맞이하는 하인 |
| 3-01 | 가짜 옹고집은 사랑방에 앉아 장부를 살피고 하인들에게 일을 시켰다… | B/C | spring-room-pixel | servant-household-pixel | classic-double-seated | 장부를 보는 가짜와 하인 |
| 3-02 | 얼마 뒤 밖에 나갔던 진짜 옹고집이 돌아왔다. 사랑방 문을 연 그… | B/C | spring-room-pixel | classic-shocked | classic-double-seated | 선 진짜의 놀람과 앉은 가짜 |
| 3-03 | 이게 무슨 일이냐? 네가 누구인데 내 얼굴을 하고 내 방에 앉아 … | B | spring-room-pixel | real-angry-pixel | double-blue-gentle-consistent-pixel | 두 사람 동일 의복·체격 |
| 3-04 | 그 말은 내가 해야겠군. 남의 집에 들어와 내 얼굴을 흉내 내며 … | B | spring-room-pixel | real-angry-pixel | double-blue-gentle-consistent-pixel | 가짜는 악당 표정 금지 |
| 3-05 | 두 사람이 마주 서자 집안사람들은 입을 다물지 못했다. 키도 같고… | B/C | spring-room-pixel | classic-shocked | double-blue-gentle-consistent-pixel | 같은 얼굴·같은 옷의 둘 |
| 3-06 | 두 분을 이렇게 마주 보고도 어느 분이 진짜인지 모르겠습니다. 무… | B | spring-room-pixel | real-consistent-pixel | wife-concerned-pixel | 아내의 질문 |
| 3-07 | 좋소! 무엇이든 물어보시오. 내 집 일을 내가 모를 리 없지 않소… | B | spring-room-pixel | real-angry-pixel | wife-concerned-pixel | 진짜의 자신감 |
| 3-08 | 그러면 지난해 사랑채 지붕을 고칠 때 비가 새기 시작한 곳이 어디… | B | spring-room-pixel | real-consistent-pixel | wife-concerned-pixel | 동쪽 처마 질문 |
| 3-09 | 동쪽 처마였소. 비가 온 다음 날 하인들을 불러 기와를 갈았지.… | B | spring-room-pixel | real-consistent-pixel | wife-concerned-pixel | 기억의 답변 |
| 3-10 | 동쪽 처마였소. 기와를 갈고도 품삯이 아깝다며 내가 일꾼들과 한참… | B | spring-room-pixel | wife-concerned-pixel | double-blue-gentle-consistent-pixel | 침착한 같은 답 |
| 3-11 | 집안사람들의 표정이 굳어졌다. 하인이 곳간 열쇠를 어디에 두었느냐… | B/C | spring-room-pixel | classic-pointing | classic-pointing | 두 사람이 같은 방향의 작은 문갑을 가리킴 |
| 3-12 | 진짜 옹고집은 질문이 이어질수록 더욱 성을 냈다. 그러나 가짜 옹… | B/C | spring-room-pixel | real-angry-pixel | classic-double-seated | 격앙된 진짜와 앉은 가짜 |
| 3-13 | 가족도 하인도 끝내 어느 쪽이 진짜인지 가리지 못했다. 결국 두 … | B | spring-courtyard-pixel | real-angry-pixel | double-blue-gentle-consistent-pixel | 관가로 향하는 두 사람 |
| 4-01 | 두 옹고집이 나란히 관가에 들어서자 사또도 한동안 말을 잇지 못했… | B | magistrate-yard-pixel | real-consistent-pixel | double-blue-gentle-consistent-pixel | 관가에 나란한 두 옹고집 |
| 4-02 | 세상에 이런 일이 다 있구나. 얼굴로 가릴 수 없다면 두 사람이 … | B | magistrate-yard-pixel | real-consistent-pixel | magistrate-pixel | 사또 질문 |
| 4-03 | 사또는 먼저 조상의 이름과 집안 내력을 물었다. 진짜 옹고집은 자… | B | magistrate-yard-pixel | real-consistent-pixel | magistrate-pixel | 진짜의 서두름 |
| 4-04 | 그런데 가짜 옹고집 역시 같은 대답을 했다. 어느 조상을 어디에 … | B | magistrate-yard-pixel | double-blue-gentle-consistent-pixel | magistrate-pixel | 가짜의 침착함 |
| 4-05 | 저자가 미리 알아낸 것이 분명합니다! 그런 것만으로 나를 가짜라 … | B | magistrate-yard-pixel | real-angry-pixel | magistrate-pixel | 다급한 손짓 |
| 4-06 | 아직 끝나지 않았다. 그렇다면 집안의 족보와 전답 문서는 어디에 … | B/F | court-records | real-consistent-pixel | magistrate-pixel | 문서 놓인 관가에서 질문 |
| 4-07 | 가짜 옹고집은 족보와 문서가 놓인 곳을 막힘없이 말했다. 관가의 … | B/F | court-records | double-blue-gentle-consistent-pixel | magistrate-pixel | 문서 대조와 가짜의 태연함 |
| 4-08 | 사또는 다시 가족과 하인들에게 물었다. 그러나 늘 함께 살아온 사… | B | magistrate-yard-pixel | wife-concerned-pixel | servant-household-pixel | 판단하지 못한 가족과 하인 |
| 4-09 | 진짜 옹고집은 억울한 마음에 목소리가 점점 커졌다. 이미 대답한 … | B | magistrate-yard-pixel | real-angry-pixel | double-blue-gentle-consistent-pixel | 진짜의 격앙과 가짜의 침착함을 같은 화면에 |
| 4-10 | 반면 가짜 옹고집은 흔들리지 않았다. 자신의 집과 조상과 살림을 … | B | magistrate-yard-pixel | double-blue-gentle-consistent-pixel | magistrate-pixel | 차분한 가짜 |
| 4-11 | 사또도 끝내 다른 방법을 찾지 못했다. 집안 내력과 족보, 문서의… | B | magistrate-yard-pixel | double-blue-gentle-consistent-pixel | magistrate-command-pixel | 가짜를 인정하는 사또 판결 |
| 4-12 | 내가 옹고집인데 내가 가짜라니! 내 얼굴도, 내 집도, 내 재산도… | C | magistrate-yard-pixel | classic-shocked | posol-pixel | 아직 좋은 옷, 충격으로 벌어진 손 |
| 5-01 | 포졸들은 계속 소리치는 옹고집을 관가 밖으로 내보냈다. 사람들은 … | C | magistrate-yard-pixel | classic-shocked | posol-pixel | 쫓겨남, 아직 의복 멀쩡함 |
| 5-02 | 옹고집은 분을 참지 못하고 자기 집으로 달려갔다. 하지만 늘 다른… | B/F/C | gate-outside | classic-shocked | — | 닫힌 대문 바깥으로 뒤바뀐 위치 |
| 5-03 | 문을 열어라! 내가 이 집 주인이다! 너희가 나를 몰라본다고 이 … | B/F | gate-outside | real-angry-pixel | — | 열리지 않는 문에 외침 |
| 5-04 | 옹고집은 손이 아플 만큼 대문을 두드렸다. 하지만 문은 열리지 않… | B/F/C | gate-outside | classic-shocked | — | 문 앞의 상실감 |
| 5-05 | 처음 며칠 동안 옹고집은 만나는 사람마다 세상이 잘못되었다고 말했… | A | snow-village-road-pixel | real-exiled-consistent-pixel | — | 원망하며 움츠린 몸 |
| 5-06 | 그러는 사이 가지고 있던 돈마저 떨어졌다. 좋은 옷은 먼지투성이가… | A | snow-village-road-pixel | real-exiled-consistent-pixel | — | 헤진 옷, 굶주림 |
| 5-07 | 먹다 남은 밥이라도 조금 나누어 주시오. 며칠째 제대로 먹지 못했… | B/F | poor-threshold | real-exiled-pleading-v2-pixel | worker-asking-v2-pixel | 문 밖 왼쪽 옹고집·안 오른쪽 마을 사람, 초반 반전 |
| 5-08 | 우리 집 형편도 넉넉하지 않습니다. 미안하지만 다른 데 알아보시오… | B/F | poor-threshold | real-exiled-pleading-v2-pixel | worker-asking-v2-pixel | 문 밖 왼쪽 옹고집·안 오른쪽 마을 사람, 초반 반전 |
| 5-09 | 옹고집은 문 앞에서 발끈했다. 세상 인심이 어쩌다 이렇게 야박해졌… | B/F | poor-threshold | real-exiled-consistent-pixel | — | 원망하며 움츠림 |
| 5-10 | ‘다른 데 알아보게.’ 얼마 전 자신이 곡식을 구하러 온 사람에게… | B/F/C | poor-threshold | classic-worn-reflection | — | 자신의 말을 떠올리며 손을 내림 |
| 5-11 | 그날 밤 옹고집은 어느 집 처마 아래에서 찬바람을 피했다. 창호지… | B/F/C | eaves | classic-worn-reflection | — | 차가운 바깥과 따뜻한 창호, 어머니를 회상 |
| 5-12 | 옹고집은 자신이 내쫓았던 승려를 생각했다. 그 승려라면 이 이상한… | C/F | hermitage | classic-worn-reflection | — | 산중을 찾음, 옷이 갑자기 회복되지 않음 |
| 6-01 | 산길을 한참 오른 끝에 옹고집은 마침내 도승을 만났다. 옹고집은 … | C/D | hermitage | classic-worn-reflection | classic-master | 도승 앞 낮아진 어깨 |
| 6-02 | 처음에는 제 집과 재산을 되찾을 생각뿐이었습니다. 그런데 제가 쫓… | C/D | hermitage | classic-worn-reflection | classic-master | 부끄러움과 솔직함 |
| 6-03 | 도승은 한동안 옹고집을 바라보았다. 옹고집은 변명하지 않고 고개를… | C/D | hermitage | classic-worn-reflection | classic-master | 고개 숙임 |
| 6-04 | 이제 돌아갈 때가 되었구나.… | C/D | hermitage | classic-worn-reflection | classic-master | 도승의 허락 |
| 6-05 | 도승은 품에서 작은 부적 한 장을 꺼내 옹고집에게 건넸다. 그리고… | B/F/D/C/E | hermitage | classic-talisman | classic-master | 같은 부적을 받은 초라한 옹고집 |
| 6-06 | 옹고집은 다시 자기 집 대문 앞에 섰다. 이번에는 문을 마구 두드… | B/F/C | gate-threshold | classic-worn-reflection | classic-servant-door | 돌아온 주인에게 문을 여는 하인 |
| 6-07 | 또 왔느냐? 관가에서도 이미 끝난 일을 무슨 까닭으로 다시 찾아온… | C/B | spring-room-pixel | classic-worn-reflection | double-blue-gentle-consistent-pixel | 초라한 진짜와 여유 있는 가짜 |
| 6-08 | 옹고집이 부적을 꺼내자 가짜 옹고집의 모습이 흔들렸다. 수염과 얼… | B/C/E | spring-room-pixel | classic-talisman | classic-straw-return | 부적을 든 진짜와 굳어 풀·짚으로 흩어지는 가짜 |
| 6-09 | 그제야 가족과 하인들은 모든 일을 깨달았다. 옹고집은 다시 자기 … | D | warm-room-pixel | classic-worn-reflection | classic-mother | 어머니를 먼저 찾음 |
| 6-10 | 옹고집은 아궁이에 불을 넉넉히 지피고 어머니의 끼니를 살폈다. 곡… | B/C | warm-room-pixel | real-resolve-consistent-pixel | classic-mother-warm | 차분한 아들과 온기를 되찾은 어머니 |
| 6-11 | 처음에는 사람들도 그의 변화를 쉽게 믿지 않았다. 하지만 한 계절… | B/F | open-house-empty | real-resolve-consistent-pixel | worker-asking-v2-pixel | 열린 곳간·대문과 마주 서는 이웃 |

## 별도 보관 삽화

앞서 제작한 올인원 삽화 21종은 로컬 작업 자료의 기존 보관 위치인 `work/story-assets/archive/onggojib-classic-art/`에 원본 PNG와 목록을 보관한다. 이 경로는 저장소 기본 규칙상 Git에서 제외되며 앱 배포·자료 카탈로그에 포함하지 않는다. 생성 원본은 Codex 생성 이미지 폴더에도 보존한다.

## 제작 목록·프롬프트·검수

최종 자산별 경로·참조 모델·사용 컷과 검수 결과는 아래에서 관리한다. 실행 상태와 QA 결과는 개발 상태표에서 관리한다.

### 채택 자산 25종

모든 배경은 인물이 없는 별도 배경이며, 16개 캐릭터/특수 자산은 실제 알파를 가진 800×1200 WebP다. 캐릭터는 균일 확대·축소와 이동만 적용했고 바닥선 y=1149, 아래 50px 여백을 맞췄다. 앉은 자세는 720px, 돌아간 짚 더미는 480px의 가시 높이로 낮춰 선 인물과 구별한다. 머리·몸을 따로 늘리거나 CSS 자산별 보정은 하지 않았다.

원본 PNG, 제작 프롬프트와 균일 변환 수치는 `work/story-assets/onggojib-classic-art/`에 보존한다(Git 제외). 최종 파일과 카탈로그 원본은 아래 경로로 Git에 포함한다. 모든 자산은 다른 컷에 개별 재사용할 수 있다. 부적 없는 짚 몸은 후속 편집용 추가 자료로 보관한다.

| Asset ID | 최종 파일 | 사용 컷 | 기준 모델/관계 | 검수 |
|---|---|---|---|---|
| `onggojib.background.classic-closed-house` | [WebP](../../public/story-assets/onggojib.background.classic-closed-house.webp) | 1-01, 1-02, 1-05, 1-11 | 기존 조선시대 공간·채색 | KEEP · 인물 없음/공간 확인 |
| `onggojib.background.classic-cold-room` | [WebP](../../public/story-assets/onggojib.background.classic-cold-room.webp) | 1-08, 1-09, 1-10 | 기존 조선시대 공간·채색 | KEEP · 인물 없음/공간 확인 |
| `onggojib.background.classic-hermitage` | [WebP](../../public/story-assets/onggojib.background.classic-hermitage.webp) | 2-07, 2-08, 2-09, 2-10, 2-11, 5-12, 6-01, 6-02, 6-03, 6-04, 6-05 | 기존 조선시대 공간·채색 | KEEP · 인물 없음/공간 확인 |
| `onggojib.background.classic-gate-threshold` | [WebP](../../public/story-assets/onggojib.background.classic-gate-threshold.webp) | 1-03, 1-04, 2-01, 2-02, 2-03, 2-04, 2-05, 2-06, 2-12, 6-06 | 기존 조선시대 공간·채색 | KEEP · 인물 없음/공간 확인 |
| `onggojib.background.classic-poor-threshold` | [WebP](../../public/story-assets/onggojib.background.classic-poor-threshold.webp) | 5-07, 5-08, 5-09, 5-10 | 기존 조선시대 공간·채색 | KEEP · 인물 없음/공간 확인 |
| `onggojib.background.classic-gate-outside` | [WebP](../../public/story-assets/onggojib.background.classic-gate-outside.webp) | 5-02, 5-03, 5-04 | 기존 조선시대 공간·채색 | KEEP · 인물 없음/공간 확인 |
| `onggojib.background.classic-eaves` | [WebP](../../public/story-assets/onggojib.background.classic-eaves.webp) | 5-11 | 기존 조선시대 공간·채색 | KEEP · 인물 없음/공간 확인 |
| `onggojib.background.classic-open-house-empty` | [WebP](../../public/story-assets/onggojib.background.classic-open-house-empty.webp) | 6-11 | 기존 조선시대 공간·채색 | KEEP · 인물 없음/공간 확인 |
| `onggojib.background.classic-court-records` | [WebP](../../public/story-assets/onggojib.background.classic-court-records.webp) | 4-06, 4-07 | 기존 조선시대 공간·채색 | KEEP · 인물 없음/공간 확인 |
| `onggojib.character.classic-mother` | [WebP](../../public/story-assets/onggojib.character.classic-mother.webp) | 1-08, 1-09, 1-10, 6-09 | 신규 기준 모델 | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-monk` | [WebP](../../public/story-assets/onggojib.character.classic-monk.webp) | 2-01, 2-02, 2-03, 2-04, 2-05, 2-06, 2-07, 2-08 | 신규 기준 모델 | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-master` | [WebP](../../public/story-assets/onggojib.character.classic-master.webp) | 2-07, 2-08, 2-10, 2-11, 6-01, 6-02, 6-03, 6-04, 6-05 | 신규 기준 모델 | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-shocked` | [WebP](../../public/story-assets/onggojib.character.classic-shocked.webp) | 3-02, 3-05, 4-12, 5-01, 5-02, 5-04 | real-consistent-pixel + 파란 가짜 | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-worn-reflection` | [WebP](../../public/story-assets/onggojib.character.classic-worn-reflection.webp) | 5-10, 5-11, 5-12, 6-01, 6-02, 6-03, 6-04, 6-06, 6-07, 6-09 | real-consistent-pixel + 파란 가짜 | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-straw-bound` | [WebP](../../public/story-assets/onggojib.character.classic-straw-bound.webp) | 2-09 | classic-straw-bound + 파란 옹고집 | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-straw-rising` | [WebP](../../public/story-assets/onggojib.character.classic-straw-rising.webp) | 2-10 | classic-straw-bound + 파란 옹고집 | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-talisman` | [WebP](../../public/story-assets/onggojib.character.classic-talisman.webp) | 6-05, 6-08 | real-consistent-pixel + 파란 가짜 | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-double-seated` | [WebP](../../public/story-assets/onggojib.character.classic-double-seated.webp) | 3-01, 3-02, 3-12 | real-consistent-pixel + 파란 가짜 | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-pointing` | [WebP](../../public/story-assets/onggojib.character.classic-pointing.webp) | 3-11 | real-consistent-pixel + 파란 가짜 | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-servant-door` | [WebP](../../public/story-assets/onggojib.character.classic-servant-door.webp) | 2-12, 6-06 | servant-household-pixel | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-servant-usher` | [WebP](../../public/story-assets/onggojib.character.classic-servant-usher.webp) | 2-06 | servant-household-pixel | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-mother-warm` | [WebP](../../public/story-assets/onggojib.character.classic-mother-warm.webp) | 6-10 | classic-mother | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-master-talisman` | [WebP](../../public/story-assets/onggojib.character.classic-master-talisman.webp) | 2-09 | classic-master | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-straw-return` | [WebP](../../public/story-assets/onggojib.character.classic-straw-return.webp) | 6-08 | classic-straw-bound + 파란 옹고집 | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |
| `onggojib.character.classic-straw-bare` | [WebP](../../public/story-assets/onggojib.character.classic-straw-bare.webp) | 후속 편집용 추가 자료 | classic-straw-bound + 파란 옹고집 | NORMALIZE-UNIFORM-SCALE · 실제 알파/전신 확인 |

### 제작 프롬프트

공통 조건: 기존 옹고집전 기준 모델 참조, 조선시대 복장·친근한 비율·세밀한 윤곽과 채색 유지. 배경은 인물과 글자 없는 공간, 캐릭터는 실제 투명 배경의 독립 전신. 아래는 채택본의 제작 지시다.

<details><summary>closed-house</summary>

Reference-matched Korean classic story pixel art; separate reusable background or transparent full-body sprite.

</details>

<details><summary>cold-room</summary>

Reference-matched Korean classic story pixel art; separate reusable background or transparent full-body sprite.

</details>

<details><summary>hermitage</summary>

Reference-matched Korean classic story pixel art; separate reusable background or transparent full-body sprite.

</details>

<details><summary>gate-threshold</summary>

Remove ALL PEOPLE completely and reconstruct the empty scenery beneath. Preserve threshold near center: LEFT inside manor with grain sacks, RIGHT outside winter village. Empty game background for separately overlaid sprites. No figures, faces, shadows of people. Keep architecture/color/style.

</details>

<details><summary>poor-threshold</summary>

Remove BOTH PEOPLE entirely reconstructing empty scenery. Preserve LEFT cold winter lane and RIGHT modest house open doorway, middle threshold boundary. No grain stockpile. Empty background, no figures or person shadows. Preserve color, architecture, camera; no furniture in front of sprite positions.

</details>

<details><summary>gate-outside</summary>

Remove the ONE MAN entirely and reconstruct closed gate and stone pavement behind him. Keep outside-of-manor view, dusk, closed imposing wooden gates, winter road. Empty background only, no people or person shadows. Same camera/color.

</details>

<details><summary>eaves</summary>

Remove the ONE crouching man completely and reconstruct wooden wall/foundation beneath him. Preserve cold blue snowy outside, deep sheltering eaves, warm glowing paper window to RIGHT. Empty stage background for transparent person in LEFT foreground. No people/person shadows.

</details>

<details><summary>open-house-empty</summary>

Remove ALL PEOPLE, every figure in foreground and distant gate road, completely. Preserve open doors, architecture, open grain store on left, firewood, warm right room, spring leaves and golden welcoming atmosphere. EMPTY reusable background to overlay separate sprites. No figures or person shadows.

</details>

<details><summary>court-records</summary>

Same Joseon magistrate court with NO PEOPLE. Add a traditional low wooden records desk on raised central porch, with open genealogy volume and two rolled land documents, visible enough to indicate examination. Keep left/right courtyard foreground open for sprites. No legible text. Preserve exact architecture/style/perspective and snow.

</details>

<details><summary>classic-mother</summary>

Reference-matched Korean classic story pixel art; separate reusable background or transparent full-body sprite.

</details>

<details><summary>classic-monk</summary>

Reference-matched Korean classic story pixel art; separate reusable background or transparent full-body sprite.

</details>

<details><summary>classic-master</summary>

Reference-matched Korean classic story pixel art; separate reusable background or transparent full-body sprite.

</details>

<details><summary>classic-shocked</summary>

Reference-matched Korean classic story pixel art; separate reusable background or transparent full-body sprite.

</details>

<details><summary>classic-worn-reflection</summary>

Reference-matched Korean classic story pixel art; separate reusable background or transparent full-body sprite.

</details>

<details><summary>classic-straw-bound</summary>

Production isolated transparent PNG game sprite, 2:3 portrait canvas. ONLY ONE woven dry-grass and straw human-shaped DOLL, no monk/person/background. Doll has round bound straw head, stocky torso, two limp arms and two legs, slouched posture before coming alive. Golden straw and binding cords match scene reference exactly. NO skin, eyes, face, hat or blue clothing yet. Small pale-yellow paper with red spiral seal attached on face. Full doll, upright slumped silhouette designed as independent transparent character sprite, size/proportions matching Onggojib. No mat, no straw scattered outside doll. Match existing illustrated Korean folktale detailed outlines/soft shading and friendly about 4-head body proportions. True alpha transparency, no background, no shadow, no glow, no text. Entire object/hat/head/hands/feet inside safe margins, centered body, generous 10% top and 5% bottom margins. ONE independently reusable asset only. Asset classic-straw-bound.

</details>

<details><summary>classic-straw-rising</summary>

Production isolated transparent PNG game sprite, 2:3 portrait canvas. ONLY the ONE half-transformed straw Onggojib character from scene, remove ALL setting and monk. Exact Onggojib face emerging from golden straw at cheeks, black gat, torso becoming blue robe purple belt; two arms and lower legs still bound golden grass. Paper red-spiral talisman on forehead. Full body upright waking slowly, neutral serene not scary, no floating rings, no glowing haze. Transparent standalone sprite, same face/head/body proportions as intact Onggojib. Match existing illustrated Korean folktale detailed outlines/soft shading and friendly about 4-head body proportions. True alpha transparency, no background, no shadow, no glow, no text. Entire object/hat/head/hands/feet inside safe margins, centered body, generous 10% top and 5% bottom margins. ONE independently reusable asset only. Asset classic-straw-rising.

</details>

<details><summary>classic-talisman</summary>

Production isolated transparent PNG game sprite, 2:3 portrait canvas. EDIT ONE worn real Onggojib only. Same exact face, worn black gat, ragged dusty blue robe, purple belt and proportions. Quiet resolved expression, holding up ONE small pale-yellow rectangular paper talisman with a red spiral at chest level toward RIGHT, other hand relaxed. Full body isolated transparent sprite. No monk, doll, second person, floor or backdrop. No smile. Keep worn identity and clothing precisely. Match existing illustrated Korean folktale detailed outlines/soft shading and friendly about 4-head body proportions. True alpha transparency, no background, no shadow, no glow, no text. Entire object/hat/head/hands/feet inside safe margins, centered body, generous 10% top and 5% bottom margins. ONE independently reusable asset only. Asset classic-talisman.

</details>

<details><summary>classic-double-seated</summary>

ONE independently reusable game character sprite. Same EXACT man blue robe purple sash black gat and face, sitting comfortably cross-legged on small plain blue cushion holding an open account book in lap. Neutral composed relaxed expression, no villain smile. No desk or floor. Maintain SAME head/body proportions even when seated, do not enlarge head. Full seated body from hat to tucked feet, lower total body height naturally. Transparent reusable ONE character. Exact existing Korean folktale illustration style, clean dark outlines, soft detailed shading, friendly four-head proportion. FULL body/object within spacious 2:3 portrait canvas, no cropping. Transparent background REQUIRED: real RGBA alpha channel, NOT a drawn checkerboard. No background, glow, shadow, extra people, scene, words. Asset classic-double-seated.

</details>

<details><summary>classic-pointing</summary>

ONE independently reusable game character sprite. Same exact man, face and proportions and blue/purple robe black hat. Calm explaining pose, eyes looking slightly RIGHT, ONE arm points gently down toward RIGHT with extended index finger, other hand loose at waist. Neutral face NOT angry. Full body isolated, no objects. Will be used for identical doubles pointing to same box. Exact existing Korean folktale illustration style, clean dark outlines, soft detailed shading, friendly four-head proportion. FULL body/object within spacious 2:3 portrait canvas, no cropping. Transparent background REQUIRED: real RGBA alpha channel, NOT a drawn checkerboard. No background, glow, shadow, extra people, scene, words. Asset classic-pointing.

</details>

<details><summary>classic-servant-door</summary>

ONE independently reusable game character sprite. Same exact young clean-shaven servant face/body/clothes. OPENING A DOOR pose: body slightly sideways toward LEFT, left-facing hand raised at chest height fingers curled to pull an unseen door handle toward himself, other open hand indicates entry toward RIGHT, weight shifted back in a small natural step. Warm attentive expression. No physical door, handle, frame or scenery rendered, ONLY servant action sprite to overlay gate backgrounds. Full figure. Exact existing Korean folktale illustration style, clean dark outlines, soft detailed shading, friendly four-head proportion. FULL body/object within spacious 2:3 portrait canvas, no cropping. Transparent background REQUIRED: real RGBA alpha channel, NOT a drawn checkerboard. No background, glow, shadow, extra people, scene, words. Asset classic-servant-door.

</details>

<details><summary>classic-servant-usher</summary>

ONE independently reusable game character sprite. Same exact young CLEAN SHAVEN household servant, gray-brown short robe, cream trousers, straw shoes and topknot/headband. Body slightly turned toward RIGHT, right-facing arm extends open palm ushering visitor toward exit, other hand at chest, apologetic hesitant expression. No beard, patches, bag, weapon, door or other person. Full body independent sprite. Exact existing Korean folktale illustration style, clean dark outlines, soft detailed shading, friendly four-head proportion. FULL body/object within spacious 2:3 portrait canvas, no cropping. Transparent background REQUIRED: real RGBA alpha channel, NOT a drawn checkerboard. No background, glow, shadow, extra people, scene, words. Asset classic-servant-usher.

</details>

<details><summary>classic-mother-warm</summary>

ONE independently reusable game character sprite. Same exact elderly mother face/gray bun, cream jeogori dusty mauve skirt, SAME head/body size. Change only expression and pose to restored warmth: shoulders relaxed, hands resting loosely together at abdomen instead of clutching cold sleeves, small grateful smile, gently left-facing. Full standing figure identical clothing, no tray or blanket, no background. Exact existing Korean folktale illustration style, clean dark outlines, soft detailed shading, friendly four-head proportion. FULL body/object within spacious 2:3 portrait canvas, no cropping. Transparent background REQUIRED: real RGBA alpha channel, NOT a drawn checkerboard. No background, glow, shadow, extra people, scene, words. Asset classic-mother-warm.

</details>

<details><summary>classic-master-talisman</summary>

Make a new pose of this ONE same elderly monk. Gentle right-facing action, one arm extended forward pressing a small pale-yellow paper with red spiral in the air, other hand supports wrist. Same face, bald head, gray beard, gray robe and ochre wrap. Full body. Output a transparent-background isolated sprite with genuine PNG alpha transparency, just like input. No scenery or other object except paper.

</details>

<details><summary>classic-straw-return</summary>

This same straw doll has now collapsed lifelessly into a low heap: remove paper completely, fold legs under slumped torso with bowed round straw head and loose binding cords. Only ordinary straw no skin/clothing/hat. Entire low bundle isolated, true transparent alpha background like input, no checkerboard or shadows.

</details>

<details><summary>classic-straw-bare</summary>

Remove ONLY yellow paper talisman from this exact straw doll, replace its area with same woven grass. Keep body shape/proportions. No facial features. True transparent alpha background like input. No checkerboard, shadow, backdrop. Entire isolated sprite.

</details>
