/** 컷별 왼쪽 인물·오른쪽 인물.
 * 흥부와 놀부의 성장, 갈등, 화해의 드라마를 12종 정규화 자산(기본 6종 + 감정·상황 6종)으로 연출한다.
 */
const heungbuDefault = "heungbu.character.heungbu-default";
const heungbuYoung = "heungbu.character.heungbu-young";
const nolbuDefault = "heungbu.character.nolbu-default";
const nolbuYoung = "heungbu.character.nolbu-young";
const wifeHeungbu = "heungbu.character.wife-heungbu";
const wifeNolbu = "heungbu.character.wife-nolbu";
const heungbuPleading = "heungbu.character.heungbu-pleading";
const heungbuHappy = "heungbu.character.heungbu-happy";
const nolbuAngry = "heungbu.character.nolbu-angry";
const nolbuRemorse = "heungbu.character.nolbu-remorse";
const wifeHeungbuWorried = "heungbu.character.wife-heungbu-worried";
const wifeNolbuShocked = "heungbu.character.wife-nolbu-shocked";
const children = "heungbu.character.children";
const swallow = "heungbu.character.swallow";
const neighbor = "heungbu.character.neighbor";
const heungbuThinking = "heungbu.character.heungbu-thinking";
const heungbuWorking = "heungbu.character.heungbu-working";
const heungbuSwallowCare = "heungbu.character.heungbu-swallow-care";
const heungbuGourdSaw = "heungbu.character.heungbu-gourd-saw";
const heungbuSharing = "heungbu.character.heungbu-sharing";
const nolbuThinking = "heungbu.character.nolbu-thinking";
const nolbuSwallowHolding = "heungbu.character.nolbu-swallow-holding";
const nolbuRuinedSeated = "heungbu.character.nolbu-ruined-seated";
const nolbuWorking = "heungbu.character.nolbu-working";
const nolbuSharing = "heungbu.character.nolbu-sharing";

// [leftActorId, rightActorId]
export const HEUNGBU_ACTORS: Record<string, readonly (readonly [string, string])[]> = {
  // 1장: 반쪽짜리 떡 (13컷) - 소년기 회상
  "chapter-1": [
    [heungbuYoung, nolbuYoung], // 1: 해설
    [heungbuYoung, nolbuYoung], // 2: 해설
    [heungbuYoung, children],   // 3: 흥부
    [heungbuYoung, children],   // 4: 아이 ("배가 고파서…….")
    [heungbuYoung, children],   // 5: 해설
    [heungbuYoung, nolbuYoung], // 6: 놀부
    [heungbuYoung, nolbuYoung], // 7: 흥부
    [heungbuYoung, nolbuYoung], // 8: 해설
    [heungbuYoung, nolbuYoung], // 9: 흥부
    [heungbuYoung, nolbuYoung], // 10: 놀부
    [heungbuYoung, nolbuYoung], // 11: 흥부
    [heungbuYoung, nolbuYoung], // 12: 놀부
    [heungbuYoung, nolbuYoung], // 13: 해설
  ],

  // 2장: 곳간 앞의 두 형제 (13컷) - 청년기 과도기
  "chapter-2": [
    [heungbuDefault, nolbuDefault], // 1: 해설
    [heungbuDefault, nolbuDefault], // 2: 해설
    [heungbuDefault, nolbuAngry],   // 3: 놀부 ("그거 어디 가져가?")
    [heungbuPleading, nolbuAngry],  // 4: 흥부 ("김 서방네. 며칠째 죽만 먹고 산대.")
    [heungbuPleading, nolbuAngry],  // 5: 놀부 ("그건 내년에 심을 씨앗이야.")
    [heungbuPleading, nolbuAngry],  // 6: 흥부 ("그래도 우리한테는 아직 있잖아.")
    [heungbuPleading, nolbuAngry],  // 7: 놀부 ("그 '우리'에는 나도 있어.")
    [heungbuPleading, nolbuAngry],  // 8: 흥부 ("눈앞에서 굶는 사람을 그냥 보고 있으라고?")
    [heungbuPleading, nolbuDefault], // 9: 아버지
    [heungbuDefault, nolbuDefault], // 10: 해설
    [heungbuDefault, nolbuDefault], // 11: 어머니
    [heungbuDefault, nolbuDefault], // 12: 해설
    [heungbuDefault, nolbuDefault], // 13: 해설
  ],

  // 3장: 각자의 몫 (16컷) - 분가
  "chapter-3": [
    [heungbuDefault, nolbuDefault], // 1: 해설
    [heungbuDefault, nolbuDefault], // 2: 놀부
    [heungbuDefault, nolbuDefault], // 3: 흥부
    [heungbuDefault, nolbuDefault], // 4: 놀부
    [heungbuDefault, wifeHeungbu],  // 5: 흥부 아내
    [heungbuDefault, wifeHeungbu],  // 6: 흥부 아내
    [heungbuDefault, nolbuDefault], // 7: 해설
    [heungbuDefault, nolbuDefault], // 8: 놀부
    [heungbuDefault, nolbuDefault], // 9: 흥부
    [heungbuDefault, nolbuDefault], // 10: 놀부
    [heungbuDefault, nolbuDefault], // 11: 해설
    [heungbuDefault, nolbuAngry],   // 12: 놀부 ("넌 늘 마음 가는 대로 했지...")
    [heungbuPleading, nolbuAngry],  // 13: 흥부 ("형은 왜 내가 한 일을 전부 철없는 짓처럼 말해?")
    [heungbuPleading, nolbuAngry],  // 14: 놀부 ("철없는 짓이라고 한 게 아니야! 뒷일도 생각하라는 거야!")
    [heungbuDefault, wifeHeungbu],  // 15: 해설
    [heungbuDefault, wifeHeungbu],  // 16: 해설
  ],

  // 4장: 겨울 문턱 (23컷) - 흥부 집 겨울과 놀부 집 찾아감
  "chapter-4": [
    [heungbuDefault, wifeHeungbu],        // 1: 해설
    [heungbuDefault, children],           // 2: 아이 1 ("아버지! 제 밥이 형 것보다 적어요!")
    [heungbuDefault, children],           // 3: 아이 2 ("네 그릇이 작은 거야!")
    [heungbuDefault, children],           // 4: 흥부 ("싸우지 마라. 아버지 것 조금씩 줄게.")
    [heungbuDefault, wifeHeungbu],        // 5: 흥부 아내
    [heungbuDefault, wifeHeungbu],        // 6: 해설
    [heungbuDefault, wifeHeungbuWorried], // 7: 흥부 아내
    [heungbuDefault, wifeHeungbuWorried], // 8: 흥부 아내 ("최 서방네 도운 건 나도 찬성이었어요...")
    [heungbuDefault, children],           // 9: 해설 ("쌀독의 바닥이 보이기 시작했다...")
    [heungbuPleading, children],          // 10: 막내 ("아버지, 내일은 밥 많이 먹어도 돼요?")
    [heungbuThinking, children],          // 11: 해설 ("흥부는 바로 대답하지 못했다...")
    [heungbuThinking, wifeHeungbuWorried],// 12: 흥부 아내 ("놀부 형님께 가 보는 건 어때요?...")
    [heungbuDefault, nolbuDefault],       // 13: 해설 (놀부 집 찾아감)
    [heungbuDefault, nolbuDefault],       // 14: 놀부 ("겨울을 날 곡식은 빌려주마...")
    [heungbuDefault, nolbuAngry],         // 15: 놀부 ("그리고 내가 빌려주는 곡식만큼은 남에게 나누지 마...")
    [heungbuPleading, nolbuAngry],        // 16: 흥부 ("그것까지 형이 정해야 해?")
    [heungbuPleading, nolbuAngry],        // 17: 놀부 ("네가 따로 번 것까지 간섭하겠다는 게 아니야...")
    [heungbuPleading, nolbuAngry],        // 18: 해설 ("흥부는 반박하려다 입을 다물었다...")
    [heungbuPleading, nolbuAngry],        // 19: 놀부 ("……이번에도 내가 네 뒤를 치우는 것 같아서 그렇다.")
    [heungbuPleading, wifeHeungbuWorried],// 20: 해설 (집으로 돌아와 가족에게 이야기)
    [heungbuPleading, wifeHeungbuWorried],// 21: 흥부 아내 ("어느 쪽이든 쉽지는 않겠네요.")
    [heungbuThinking, wifeHeungbuWorried],// 22: 해설 ("흥부 가족은 오래 의논했다.")
    [heungbuThinking, wifeHeungbu],       // 23: 해설 (선택지)
  ],

  // 5a장: 빌린 곡식 (19컷) - 분기 A
  "chapter-5a": [
    [heungbuDefault, children],     // 1: 해설 (곡식 자루가 들어옴)
    [heungbuDefault, children],     // 2: 막내 ("이제 밥 많이 먹어도 돼요?")
    [heungbuDefault, children],     // 3: 흥부 ("한꺼번에는 안 돼...")
    [heungbuDefault, wifeHeungbu],  // 4: 해설 (부부가 함께 겨울 곡식 나눔)
    [heungbuWorking, nolbuDefault], // 5: 해설 (봄이 되자 놀부 밭에서 일함)
    [heungbuDefault, nolbuDefault], // 6: 흥부
    [heungbuDefault, nolbuDefault], // 7: 놀부
    [heungbuThinking, nolbuDefault],// 8: 해설
    [heungbuDefault, nolbuDefault], // 9: 해설
    [heungbuDefault, nolbuAngry],   // 10: 놀부 ("아직 빚도 다 안 갚았는데 또 그러냐?")
    [heungbuPleading, nolbuAngry],  // 11: 흥부 ("형에게 빌린 곡식은 안 건드렸어...")
    [heungbuPleading, nolbuAngry],  // 12: 놀부 ("그래도 계산은 하고 살아.")
    [heungbuDefault, nolbuDefault], // 13: 흥부 ("그건 해 볼게.")
    [heungbuWorking, nolbuDefault], // 14: 해설
    [heungbuPleading, nolbuDefault], // 15: 흥부 ("형이 도와준 건 정말 고마워...")
    [heungbuPleading, nolbuDefault], // 16: 흥부 ("그런데 우리 집 일은 우리도 정해 볼게.")
    [heungbuDefault, nolbuAngry],   // 17: 해설 (놀부는 못마땅한 얼굴...)
    [heungbuDefault, wifeHeungbu],  // 18: 해설
    [heungbuDefault, wifeHeungbu],  // 19: 해설
  ],

  // 5b장: 빈손의 겨울 (17컷) - 분기 B
  "chapter-5b": [
    [heungbuDefault, wifeHeungbuWorried], // 1: 해설
    [heungbuDefault, wifeHeungbuWorried], // 2: 해설
    [heungbuDefault, wifeHeungbuWorried], // 3: 해설
    [heungbuDefault, wifeHeungbuWorried], // 4: 흥부 아내 ("형님이 안 빌려주실 줄 알았어요.")
    [heungbuPleading, wifeHeungbuWorried],// 5: 흥부
    [heungbuPleading, wifeHeungbuWorried],// 6: 흥부 아내 ("그래도 아이들한테는 뭐라고 해요?")
    [heungbuThinking, wifeHeungbuWorried],// 7: 해설
    [heungbuDefault, neighbor],           // 8: 해설 (어려운 이웃을 만남)
    [heungbuDefault, neighbor],           // 9: 해설
    [heungbuWorking, neighbor],           // 10: 흥부 ("집 지붕이 많이 샌다고 들었어요...")
    [heungbuDefault, neighbor],           // 11: 해설 (이웃이 곡식 한 말을 가져옴)
    [heungbuDefault, neighbor],           // 12: 흥부 ("이건 안 주셔도 돼요.")
    [heungbuDefault, neighbor],           // 13: 이웃 ("자네가 나를 도왔으니 나도 자네를 돕는 거지.")
    [heungbuDefault, wifeHeungbuWorried], // 14: 해설
    [heungbuDefault, wifeHeungbuWorried], // 15: 해설
    [heungbuDefault, wifeHeungbuWorried], // 16: 해설
    [heungbuDefault, wifeHeungbuWorried], // 17: 해설
  ],

  // 6장: 제비가 머문 집 (15컷) - 제비 치료
  "chapter-6": [
    [heungbuDefault, wifeHeungbu],    // 1: 해설
    [children, swallow],              // 2: 아이 ("아버지! 여기 와 봐요!")
    [heungbuDefault, swallow],        // 3: 해설 ("새끼 제비 한 마리가 둥지 아래로...")
    [heungbuSwallowCare, swallow],    // 4: 흥부 ("살릴 수 있는지 한번 해 보자.")
    [heungbuSwallowCare, swallow],    // 5: 해설
    [heungbuDefault, wifeHeungbu],    // 6: 흥부 ("여보, 남은 헝겊 조금 써도 될까?")
    [heungbuDefault, wifeHeungbu],    // 7: 흥부 아내
    [heungbuDefault, wifeHeungbu],    // 8: 흥부
    [heungbuDefault, children],       // 9: 해설 ("아이들이 웃었다...")
    [heungbuDefault, children],       // 10: 흥부 ("그건 제비보다 크잖아.")
    [heungbuSwallowCare, swallow],    // 11: 해설 ("가족은 함께 작은 부목을 만들고...")
    [heungbuHappy, swallow],          // 12: 해설 ("얼마 뒤 제비는 다시 하늘로 날아올랐다.")
    [heungbuHappy, wifeHeungbu],      // 13: 흥부 아내
    [heungbuHappy, wifeHeungbu],      // 14: 흥부
    [heungbuHappy, wifeHeungbu],      // 15: 해설
  ],

  // 7장: 박이 열리던 날 (18컷) - 박 타기
  "chapter-7": [
    [heungbuDefault, swallow],      // 1: 해설 ("제비가 다시 찾아왔다. 부리에는 작은 박씨...")
    [children, swallow],            // 2: 아이들 ("작년에 그 제비다!")
    [heungbuDefault, wifeHeungbu],  // 3: 해설 ("흥부 가족은 박씨를 심었다...")
    [heungbuGourdSaw, children],    // 4: 흥부 ("흥부가 첫 번째 박에 톱을 댔다.")
    [heungbuGourdSaw, children],    // 5: 막내 ("아버지, 빨리요!")
    [heungbuHappy, wifeHeungbu],    // 6: 해설 ("쩍! 박이 갈라지자...")
    [heungbuHappy, wifeHeungbu],    // 7: 흥부 ("세상에…….")
    [heungbuThinking, wifeHeungbu], // 8: 해설
    [heungbuSharing, wifeHeungbu],  // 9: 흥부 ("어려운 사람들에게 나눠 주면—")
    [heungbuSharing, wifeHeungbu],  // 10: 흥부
    [heungbuHappy, wifeHeungbu],    // 11: 흥부 아내
    [heungbuDefault, wifeHeungbu],  // 12: 해설
    [heungbuDefault, wifeHeungbu],  // 13: 해설
    [heungbuDefault, wifeHeungbu],  // 14: 흥부 아내
    [heungbuDefault, wifeHeungbu],  // 15: 흥부
    [heungbuHappy, wifeHeungbu],    // 16: 해설
    [heungbuThinking, wifeHeungbu], // 17: 해설
    [heungbuHappy, wifeHeungbu],    // 18: 해설
  ],

  // 8장: 놀부에게 생긴 불편한 마음 (11컷) - 놀부 집
  "chapter-8": [
    [nolbuDefault, wifeNolbu],  // 1: 해설
    [nolbuDefault, wifeNolbu],  // 2: 해설
    [nolbuDefault, wifeNolbu],  // 3: 해설
    [nolbuDefault, wifeNolbu],  // 4: 놀부 아내
    [nolbuThinking, wifeNolbu], // 5: 놀부
    [nolbuDefault, wifeNolbu],  // 6: 놀부 아내
    [nolbuDefault, wifeNolbu],  // 7: 해설
    [nolbuThinking, wifeNolbu], // 8: 놀부
    [nolbuDefault, wifeNolbu],  // 9: 놀부 아내
    [nolbuThinking, wifeNolbu], // 10: 놀부
    [nolbuDefault, wifeNolbu],  // 11: 해설
  ],

  // 9장: 같아 보이는 방법 (13컷) - 놀부의 집착과 제비 다리
  "chapter-9": [
    [swallow, nolbuDefault],        // 1: 해설
    [swallow, nolbuThinking],       // 2: 놀부 ("흥부한테는 잘도 생기더니.")
    [swallow, nolbuDefault],        // 3: 해설
    [swallow, nolbuThinking],       // 4: 놀부 ("내가 무슨 생각을 하는 거야.")
    [swallow, nolbuDefault],        // 5: 해설
    [swallow, nolbuDefault],        // 6: 해설
    [swallow, nolbuThinking],       // 7: 놀부 ("이건 아니지.")
    [swallow, nolbuSwallowHolding], // 8: 해설
    [swallow, nolbuSwallowHolding], // 9: 해설
    [swallow, nolbuSwallowHolding], // 10: 놀부 ("금방 고쳐 줄 거야.")
    [swallow, nolbuSwallowHolding], // 11: 해설
    [swallow, nolbuRemorse],        // 12: 놀부 ("이제 흥부하고 똑같이 한 거야.")
    [swallow, nolbuRemorse],        // 13: 해설
  ],

  // 10장: 다른 박 (19컷) - 놀부네 몰락
  "chapter-10": [
    [nolbuDefault, wifeNolbu],             // 1: 해설
    [nolbuDefault, wifeNolbu],             // 2: 놀부
    [nolbuDefault, wifeNolbu],             // 3: 해설
    [nolbuDefault, wifeNolbu],             // 4: 해설
    [nolbuAngry, wifeNolbuShocked],        // 5: 놀부 ("뭐야, 이게!")
    [children, wifeNolbuShocked],          // 6: 아이들 ("무서워요, 어머니!")
    [nolbuAngry, wifeNolbuShocked],        // 7: 놀부 아내 ("이제 그만해요.")
    [nolbuAngry, wifeNolbuShocked],        // 8: 놀부 ("첫 번째가 잘못된 거야. 다음 박이 진짜겠지.")
    [nolbuAngry, wifeNolbuShocked],        // 9: 해설 ("도깨비들이 튀어나왔다...")
    [nolbuAngry, wifeNolbuShocked],        // 10: 놀부 ("내 갓! 거기 서!")
    [nolbuAngry, wifeNolbuShocked],        // 11: 해설
    [nolbuAngry, wifeNolbuShocked],        // 12: 놀부 아내 ("정말 그만해요.")
    [nolbuAngry, wifeNolbuShocked],        // 13: 해설
    [nolbuAngry, wifeNolbuShocked],        // 14: 놀부 ("하나만 더.")
    [nolbuRemorse, wifeNolbuShocked],      // 15: 해설 ("마지막 박... 집 한쪽이 무너졌다.")
    [nolbuRuinedSeated, wifeNolbuShocked], // 16: 해설 ("놀부는 엉망이 된 마당 한가운데 주저앉았다.")
    [nolbuRuinedSeated, wifeNolbuShocked], // 17: 놀부 ("왜 흥부하고 다른 거야…….")
    [nolbuRuinedSeated, wifeNolbuShocked], // 18: 해설
    [nolbuRuinedSeated, ""],               // 19: 해설 ("자기 손 안에서 떨던 작은 제비였다.")
  ],

  // 11장: 뒤바뀐 문 앞 (28컷) - 선택의 순간
  "chapter-11": [
    [heungbuDefault, nolbuRuinedSeated],  // 1: 해설 (놀부네 사정)
    [heungbuThinking, nolbuRuinedSeated], // 2: 해설 (찾아가 봄)
    [heungbuThinking, wifeHeungbu],       // 3: 해설 (집으로 돌아옴)
    [heungbuThinking, wifeHeungbu],       // 4: 흥부
    [heungbuThinking, wifeHeungbu],       // 5: 해설
    [heungbuThinking, wifeHeungbu],       // 6: 흥부
    [children, wifeHeungbu],              // 7: 해설 (온 가족 모임)
    [children, wifeHeungbu],              // 8: 첫째
    [children, wifeHeungbu],              // 9: 둘째
    [children, wifeHeungbuWorried],       // 10: 흥부 아내 ("솔직히 말하면 나도 바로 같이 살자고 하기는 어렵네요.")
    [children, wifeHeungbuWorried],       // 11: 흥부 아내 ("그래도 형님이 잘못했다고 형님네 아이들까지...")
    [heungbuThinking, wifeHeungbu],       // 12: 해설
    [heungbuThinking, wifeHeungbu],       // 13: 해설
    [heungbuDefault, nolbuRuinedSeated],  // 14: 해설 (다시 놀부 찾아감)
    [heungbuDefault, nolbuRuinedSeated],  // 15: 놀부 ("구경 왔냐?")
    [heungbuDefault, nolbuRemorse],       // 16: 흥부
    [heungbuDefault, nolbuRemorse],       // 17: 놀부 ("그럼 돈 주러 왔어?")
    [heungbuDefault, nolbuRemorse],       // 18: 흥부
    [heungbuDefault, nolbuRemorse],       // 19: 해설
    [heungbuDefault, nolbuRuinedSeated],  // 20: 놀부 ("내가 고를 처지냐?")
    [heungbuDefault, nolbuRemorse],       // 21: 흥부
    [heungbuDefault, nolbuRuinedSeated],  // 22: 놀부 ("아이들 생각하면 당장 지낼 지붕은 필요하다.")
    [heungbuDefault, nolbuRemorse],       // 23: 놀부 ("그런데 다시 네 집에 들어가는 게 맞는지…… 나도 모르겠다.")
    [heungbuDefault, nolbuRuinedSeated],  // 24: 해설 ("놀부는 도움을 받아야 한다는 사실도... 모두 불편해했다.")
    [heungbuDefault, nolbuRemorse],       // 25: 흥부
    [heungbuDefault, nolbuRemorse],       // 26: 흥부
    [heungbuDefault, nolbuRemorse],       // 27: 해설
    [heungbuDefault, nolbuRemorse],       // 28: 해설 (선택지 컷)
  ],

  // 12a장: 함께 짓는 밭 (39컷) - 결말 A
  "chapter-12a": [
    [heungbuDefault, nolbuRemorse], // 1: 해설
    [heungbuDefault, nolbuRemorse], // 2: 놀부 ("내가 네 집에 얹혀살게 될 줄은 몰랐다.")
    [heungbuDefault, nolbuDefault], // 3: 흥부
    [heungbuDefault, wifeNolbu],   // 4: 놀부 아내
    [heungbuDefault, nolbuDefault], // 5: 해설
    [heungbuDefault, nolbuDefault], // 6: 놀부
    [heungbuDefault, nolbuDefault], // 7: 흥부
    [heungbuDefault, nolbuDefault], // 8: 놀부
    [heungbuThinking, nolbuThinking], // 9: 해설
    [heungbuDefault, nolbuDefault], // 10: 흥부
    [heungbuDefault, nolbuDefault], // 11: 놀부
    [heungbuDefault, nolbuDefault], // 12: 흥부
    [heungbuDefault, nolbuDefault], // 13: 해설
    [heungbuDefault, nolbuDefault], // 14: 놀부
    [heungbuDefault, nolbuDefault], // 15: 해설
    [heungbuDefault, nolbuDefault], // 16: 놀부
    [heungbuDefault, nolbuDefault], // 17: 흥부
    [heungbuThinking, nolbuDefault],// 18: 해설
    [heungbuDefault, nolbuDefault], // 19: 흥부
    [heungbuDefault, nolbuDefault], // 20: 놀부
    [heungbuHappy, nolbuDefault],   // 21: 해설 ("둘은 잠시 노려보다 함께 웃었다.")
    [heungbuDefault, nolbuDefault], // 22: 해설
    [heungbuDefault, nolbuDefault], // 23: 해설
    [heungbuWorking, nolbuDefault], // 24: 흥부 ("형. 저 밭은 같이 해 볼래?")
    [heungbuDefault, nolbuDefault], // 25: 놀부
    [heungbuWorking, nolbuDefault], // 26: 흥부 ("형은 계획 세우는 건 잘하고...")
    [heungbuWorking, nolbuWorking], // 27: 놀부
    [heungbuWorking, nolbuWorking], // 28: 해설
    [heungbuWorking, nolbuWorking], // 29: 해설
    [heungbuWorking, nolbuWorking], // 30: 놀부
    [heungbuWorking, nolbuWorking], // 31: 해설
    [heungbuSharing, nolbuWorking], // 32: 흥부 ("우리 두 집 겨울 몫이랑...")
    [heungbuSharing, nolbuWorking], // 33: 놀부
    [heungbuSharing, nolbuWorking], // 34: 해설
    [heungbuHappy, nolbuWorking],   // 35: 흥부 ("그건 왜?")
    [heungbuHappy, nolbuSharing],   // 36: 놀부
    [heungbuDefault, nolbuSharing], // 37: 해설
    [heungbuHappy, nolbuSharing],   // 38: 놀부 ("왜? 나도 반은 줄 줄 안다.")
    [heungbuHappy, nolbuSharing],   // 39: 해설 ("흥부가 웃음을 터뜨렸다.")
  ],

  // 12b장: 두 집 사이의 길 (33컷) - 결말 B
  "chapter-12b": [
    [heungbuDefault, nolbuRemorse], // 1: 해설
    [heungbuDefault, nolbuRemorse], // 2: 놀부
    [heungbuDefault, nolbuDefault], // 3: 흥부
    [heungbuDefault, nolbuDefault], // 4: 흥부
    [heungbuDefault, nolbuRemorse], // 5: 해설
    [heungbuDefault, nolbuRemorse], // 6: 놀부 ("……따로 시작해 보겠다.")
    [heungbuWorking, nolbuRemorse], // 7: 흥부
    [heungbuWorking, nolbuWorking], // 8: 해설
    [heungbuDefault, nolbuWorking], // 9: 해설
    [heungbuDefault, nolbuWorking], // 10: 해설
    [heungbuDefault, nolbuWorking], // 11: 해설
    [nolbuRemorse, wifeNolbu],      // 12: 놀부 아내
    [nolbuRemorse, wifeNolbu],      // 13: 놀부 ("동생한테 또 손 벌리는 것 같잖아.")
    [nolbuRemorse, wifeNolbu],      // 14: 놀부 아내
    [heungbuDefault, nolbuWorking], // 15: 해설
    [heungbuDefault, nolbuWorking], // 16: 흥부
    [heungbuDefault, nolbuWorking], // 17: 놀부 ("……내일 시간 있냐?")
    [heungbuDefault, nolbuWorking], // 18: 흥부
    [heungbuDefault, nolbuWorking], // 19: 놀부 ("밭에 물이 찼다. 혼자 하기는 좀 많아서.")
    [heungbuThinking, nolbuWorking],// 20: 해설
    [heungbuThinking, nolbuWorking],// 21: 흥부
    [heungbuWorking, nolbuWorking], // 22: 해설
    [heungbuWorking, nolbuWorking], // 23: 해설
    [heungbuDefault, nolbuSharing], // 24: 해설
    [heungbuDefault, nolbuSharing], // 25: 흥부
    [heungbuDefault, nolbuSharing], // 26: 놀부 ("아니다.")
    [heungbuHappy, nolbuSharing],   // 27: 흥부 ("그럼?")
    [heungbuHappy, nolbuSharing],   // 28: 놀부 ("같이 먹자고.")
    [heungbuHappy, nolbuSharing],   // 29: 해설 ("흥부가 문을 활짝 열었다.")
    [heungbuHappy, nolbuSharing],   // 30: 해설 ("놀부는 아무 말 없이 떡을 반으로...")
    [heungbuHappy, nolbuSharing],   // 31: 해설 ("흥부는 그 떡을 잠시 바라보다가 웃었다.")
    [heungbuDefault, nolbuSharing], // 32: 해설
    [heungbuDefault, nolbuSharing], // 33: 해설
  ],
};
