/** 컷별 왼쪽 인물·오른쪽 인물.
 * 흥부와 놀부의 성장, 갈등, 화해의 드라마를 9종 정규화 자산(기본 6종 + 감정·상황 3종)으로 연출한다.
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

// [leftActorId, rightActorId]
export const HEUNGBU_ACTORS: Record<string, readonly (readonly [string, string])[]> = {
  // 1장: 반쪽짜리 떡 (13컷) - 소년기 회상
  "chapter-1": [
    [heungbuYoung, nolbuYoung], // 1: 해설
    [heungbuYoung, nolbuYoung], // 2: 해설
    [heungbuYoung, ""],         // 3: 흥부
    [heungbuYoung, ""],         // 4: 아이
    [heungbuYoung, ""],         // 5: 해설
    ["", nolbuYoung],          // 6: 놀부
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
    [heungbuDefault, nolbuDefault], // 5: 흥부
    [heungbuDefault, nolbuDefault], // 6: 놀부
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
    [heungbuDefault, wifeHeungbu],  // 1: 해설
    [heungbuDefault, wifeHeungbu],  // 2: 해설
    [heungbuDefault, wifeHeungbu],  // 3: 아이 1
    [heungbuDefault, wifeHeungbu],  // 4: 아이 2
    [heungbuDefault, wifeHeungbu],  // 5: 흥부
    [heungbuDefault, wifeHeungbu],  // 6: 해설
    [heungbuDefault, wifeHeungbu],  // 7: 흥부 아내
    [heungbuDefault, wifeHeungbu],  // 8: 흥부
    [heungbuDefault, wifeHeungbu],  // 9: 흥부 아내
    [heungbuPleading, wifeHeungbu], // 10: 흥부 ("아버지, 내일은 밥 많이 먹어도 돼요?" 에 대답 못함)
    [heungbuPleading, wifeHeungbu], // 11: 막내
    [heungbuPleading, wifeHeungbu], // 12: 흥부
    [heungbuDefault, nolbuDefault], // 13: 해설 (놀부 집 찾아감)
    [heungbuDefault, nolbuDefault], // 14: 놀부 ("겨울을 날 곡식은 빌려주마...")
    [heungbuDefault, nolbuAngry],   // 15: 놀부 ("그리고 내가 빌려주는 곡식만큼은 남에게 나누지 마...")
    [heungbuPleading, nolbuAngry],  // 16: 흥부 ("그것까지 형이 정해야 해?")
    [heungbuPleading, nolbuAngry],  // 17: 놀부 ("네가 따로 번 것까지 간섭하겠다는 게 아니야...")
    [heungbuPleading, nolbuAngry],  // 18: 해설 ("흥부는 반박하려다 입을 다물었다...")
    [heungbuPleading, nolbuAngry],  // 19: 놀부 ("……이번에도 내가 네 뒤를 치우는 것 같아서 그렇다.")
    [heungbuPleading, wifeHeungbu], // 20: 해설 (집으로 돌아와 가족에게 이야기)
    [heungbuPleading, wifeHeungbu], // 21: 흥부 아내 ("어느 쪽이든 쉽지는 않겠네요.")
    [heungbuPleading, wifeHeungbu], // 22: 해설 ("흥부 가족은 오래 의논했다.")
    [heungbuDefault, wifeHeungbu],  // 23: 해설 (선택지)
  ],

  // 5a장: 빌린 곡식 (19컷) - 분기 A
  "chapter-5a": [
    [heungbuDefault, nolbuDefault], // 1: 해설
    [heungbuDefault, nolbuDefault], // 2: 놀부
    [heungbuDefault, nolbuDefault], // 3: 흥부
    [heungbuDefault, nolbuDefault], // 4: 해설
    [heungbuDefault, nolbuDefault], // 5: 해설
    [heungbuDefault, nolbuDefault], // 6: 흥부
    [heungbuDefault, nolbuDefault], // 7: 놀부
    [heungbuDefault, nolbuDefault], // 8: 해설
    [heungbuDefault, nolbuDefault], // 9: 해설
    [heungbuDefault, nolbuAngry],   // 10: 놀부 ("아직 빚도 다 안 갚았는데 또 그러냐?")
    [heungbuPleading, nolbuAngry],  // 11: 흥부 ("형에게 빌린 곡식은 안 건드렸어...")
    [heungbuPleading, nolbuAngry],  // 12: 놀부 ("그래도 계산은 하고 살아.")
    [heungbuDefault, nolbuDefault], // 13: 흥부 ("그건 해 볼게.")
    [heungbuDefault, nolbuDefault], // 14: 해설
    [heungbuPleading, nolbuDefault], // 15: 흥부 ("형이 도와준 건 정말 고마워...")
    [heungbuPleading, nolbuDefault], // 16: 흥부 ("그런데 우리 집 일은 우리도 정해 볼게.")
    [heungbuDefault, nolbuAngry],   // 17: 해설 (놀부는 못마땅한 얼굴...)
    [heungbuDefault, wifeHeungbu],  // 18: 해설
    [heungbuDefault, wifeHeungbu],  // 19: 해설
  ],

  // 5b장: 빈손의 겨울 (17컷) - 분기 B
  "chapter-5b": [
    [heungbuDefault, wifeHeungbu],  // 1: 해설
    [heungbuDefault, wifeHeungbu],  // 2: 해설
    [heungbuDefault, wifeHeungbu],  // 3: 해설
    [heungbuDefault, wifeHeungbu],  // 4: 흥부 아내
    [heungbuDefault, wifeHeungbu],  // 5: 흥부
    [heungbuDefault, wifeHeungbu],  // 6: 흥부 아내
    [heungbuDefault, wifeHeungbu],  // 7: 해설
    [heungbuDefault, ""],          // 8: 해설
    [heungbuDefault, ""],          // 9: 해설
    [heungbuDefault, ""],          // 10: 흥부
    [heungbuDefault, ""],          // 11: 해설
    [heungbuDefault, ""],          // 12: 흥부
    [heungbuDefault, ""],          // 13: 이웃
    [heungbuDefault, wifeHeungbu],  // 14: 해설
    [heungbuDefault, wifeHeungbu],  // 15: 해설
    [heungbuDefault, wifeHeungbu],  // 16: 해설
    [heungbuDefault, wifeHeungbu],  // 17: 해설
  ],

  // 6장: 제비가 머문 집 (15컷) - 제비 치료
  "chapter-6": [
    [heungbuDefault, wifeHeungbu],  // 1: 해설
    [heungbuDefault, wifeHeungbu],  // 2: 해설
    [heungbuDefault, wifeHeungbu],  // 3: 아이
    [heungbuDefault, wifeHeungbu],  // 4: 흥부
    [heungbuDefault, wifeHeungbu],  // 5: 해설
    [heungbuDefault, wifeHeungbu],  // 6: 해설
    [heungbuDefault, wifeHeungbu],  // 7: 흥부
    [heungbuDefault, wifeHeungbu],  // 8: 흥부 아내
    [heungbuDefault, wifeHeungbu],  // 9: 흥부
    [heungbuDefault, wifeHeungbu],  // 10: 해설
    [heungbuDefault, wifeHeungbu],  // 11: 해설
    [heungbuDefault, wifeHeungbu],  // 12: 흥부 아내
    [heungbuDefault, wifeHeungbu],  // 13: 흥부
    [heungbuDefault, wifeHeungbu],  // 14: 해설
    [heungbuDefault, wifeHeungbu],  // 15: 해설
  ],

  // 7장: 박이 열리던 날 (18컷) - 박 타기
  "chapter-7": [
    [heungbuDefault, wifeHeungbu],  // 1: 해설
    [heungbuDefault, wifeHeungbu],  // 2: 아이들
    [heungbuDefault, wifeHeungbu],  // 3: 막내
    [heungbuHappy, wifeHeungbu],    // 4: 흥부 ("흥부가 첫 번째 박에 톱을 댔다.")
    [heungbuHappy, wifeHeungbu],    // 5: 흥부 아내
    [heungbuHappy, wifeHeungbu],    // 6: 해설 ("쩍! 박이 갈라지자 곡식과 비단이...")
    [heungbuHappy, wifeHeungbu],    // 7: 흥부 ("세상에…….")
    [heungbuHappy, wifeHeungbu],    // 8: 해설
    [heungbuHappy, wifeHeungbu],    // 9: 아이들
    [heungbuHappy, wifeHeungbu],    // 10: 흥부 ("흥부는 말을 멈추고...")
    [heungbuHappy, wifeHeungbu],    // 11: 흥부 아내 ("……우선 우리끼리 의논할까?")
    [heungbuDefault, wifeHeungbu],  // 12: 해설
    [heungbuDefault, wifeHeungbu],  // 13: 해설
    [heungbuDefault, wifeHeungbu],  // 14: 흥부 아내
    [heungbuDefault, wifeHeungbu],  // 15: 흥부
    [heungbuHappy, wifeHeungbu],    // 16: 해설 ("그 뒤 흥부는 이웃을 도왔다...")
    [heungbuHappy, wifeHeungbu],    // 17: 해설
    [heungbuHappy, wifeHeungbu],    // 18: 해설
  ],

  // 8장: 놀부에게 생긴 불편한 마음 (11컷) - 놀부 집
  "chapter-8": [
    [nolbuDefault, wifeNolbu],  // 1: 해설
    [nolbuDefault, wifeNolbu],  // 2: 해설
    [nolbuDefault, wifeNolbu],  // 3: 해설
    [nolbuDefault, wifeNolbu],  // 4: 놀부 아내
    [nolbuDefault, wifeNolbu],  // 5: 놀부
    [nolbuDefault, wifeNolbu],  // 6: 놀부 아내
    [nolbuDefault, wifeNolbu],  // 7: 해설
    [nolbuDefault, wifeNolbu],  // 8: 놀부
    [nolbuDefault, wifeNolbu],  // 9: 놀부 아내
    [nolbuDefault, wifeNolbu],  // 10: 놀부
    [nolbuDefault, wifeNolbu],  // 11: 해설
  ],

  // 9장: 같아 보이는 방법 (13컷) - 놀부의 집착과 제비 다리
  "chapter-9": [
    [nolbuDefault, ""], // 1: 해설
    [nolbuDefault, ""], // 2: 놀부
    [nolbuDefault, ""], // 3: 해설
    [nolbuDefault, ""], // 4: 놀부
    [nolbuDefault, ""], // 5: 해설
    [nolbuDefault, ""], // 6: 해설
    [nolbuDefault, ""], // 7: 놀부
    [nolbuDefault, ""], // 8: 해설
    [nolbuDefault, ""], // 9: 해설
    [nolbuDefault, ""], // 10: 놀부
    [nolbuDefault, ""], // 11: 해설
    [nolbuDefault, ""], // 12: 놀부
    [nolbuDefault, ""], // 13: 해설
  ],

  // 10장: 다른 박 (19컷) - 놀부네 몰락
  "chapter-10": [
    [nolbuDefault, wifeNolbu], // 1: 해설
    [nolbuDefault, wifeNolbu], // 2: 놀부
    [nolbuDefault, wifeNolbu], // 3: 해설
    [nolbuDefault, wifeNolbu], // 4: 해설
    [nolbuAngry, wifeNolbu],   // 5: 놀부 ("뭐야, 이게!")
    [nolbuAngry, wifeNolbu],   // 6: 아이들
    [nolbuAngry, wifeNolbu],   // 7: 놀부 아내
    [nolbuAngry, wifeNolbu],   // 8: 놀부 ("첫 번째가 잘못된 거야. 다음 박이 진짜겠지.")
    [nolbuAngry, wifeNolbu],   // 9: 해설 ("도깨비들이 튀어나왔다...")
    [nolbuAngry, wifeNolbu],   // 10: 놀부 ("내 갓! 거기 서!")
    [nolbuAngry, wifeNolbu],   // 11: 해설
    [nolbuDefault, wifeNolbu], // 12: 놀부 아내
    [nolbuDefault, wifeNolbu], // 13: 해설
    [nolbuAngry, wifeNolbu],   // 14: 놀부 ("하나만 더.")
    [nolbuDefault, wifeNolbu], // 15: 해설
    [nolbuDefault, wifeNolbu], // 16: 해설
    [nolbuDefault, wifeNolbu], // 17: 놀부
    [nolbuDefault, wifeNolbu], // 18: 해설
    [nolbuDefault, wifeNolbu], // 19: 해설
  ],

  // 11장: 뒤바뀐 문 앞 (28컷) - 선택의 순간
  "chapter-11": [
    [heungbuDefault, nolbuDefault], // 1: 해설 (놀부네 사정)
    [heungbuDefault, nolbuDefault], // 2: 해설 (찾아가 봄)
    [heungbuDefault, wifeHeungbu],  // 3: 해설 (집으로 돌아옴)
    [heungbuDefault, wifeHeungbu],  // 4: 흥부
    [heungbuDefault, wifeHeungbu],  // 5: 해설
    [heungbuDefault, wifeHeungbu],  // 6: 흥부
    [heungbuDefault, wifeHeungbu],  // 7: 해설 (온 가족 모임)
    [heungbuDefault, wifeHeungbu],  // 8: 첫째
    [heungbuDefault, wifeHeungbu],  // 9: 둘째
    [heungbuDefault, wifeHeungbu],  // 10: 흥부 아내
    [heungbuDefault, wifeHeungbu],  // 11: 흥부 아내
    [heungbuDefault, wifeHeungbu],  // 12: 해설
    [heungbuDefault, wifeHeungbu],  // 13: 해설
    [heungbuDefault, nolbuDefault], // 14: 해설 (다시 놀부 찾아감)
    [heungbuDefault, nolbuDefault], // 15: 놀부
    [heungbuDefault, nolbuDefault], // 16: 흥부
    [heungbuDefault, nolbuDefault], // 17: 놀부
    [heungbuDefault, nolbuDefault], // 18: 흥부
    [heungbuDefault, nolbuDefault], // 19: 해설
    [heungbuDefault, nolbuDefault], // 20: 놀부
    [heungbuDefault, nolbuDefault], // 21: 흥부
    [heungbuDefault, nolbuDefault], // 22: 놀부
    [heungbuDefault, nolbuDefault], // 23: 놀부
    [heungbuDefault, nolbuDefault], // 24: 해설
    [heungbuDefault, nolbuDefault], // 25: 흥부
    [heungbuDefault, nolbuDefault], // 26: 흥부
    [heungbuDefault, nolbuDefault], // 27: 해설
    [heungbuDefault, nolbuDefault], // 28: 해설 (선택지 컷)
  ],

  // 12a장: 함께 짓는 밭 (39컷) - 결말 A
  "chapter-12a": [
    [heungbuDefault, nolbuDefault], // 1: 해설
    [heungbuDefault, nolbuDefault], // 2: 놀부
    [heungbuDefault, nolbuDefault], // 3: 흥부
    ["", wifeNolbu],               // 4: 놀부 아내
    [heungbuDefault, nolbuDefault], // 5: 해설
    [heungbuDefault, nolbuDefault], // 6: 놀부
    [heungbuDefault, nolbuDefault], // 7: 흥부
    [heungbuDefault, nolbuDefault], // 8: 놀부
    [heungbuDefault, nolbuDefault], // 9: 해설
    [heungbuDefault, nolbuDefault], // 10: 흥부
    [heungbuDefault, nolbuDefault], // 11: 놀부
    [heungbuDefault, nolbuDefault], // 12: 흥부
    [heungbuDefault, nolbuDefault], // 13: 해설
    [heungbuDefault, nolbuDefault], // 14: 놀부
    [heungbuDefault, nolbuDefault], // 15: 해설
    [heungbuDefault, nolbuDefault], // 16: 놀부
    [heungbuDefault, nolbuDefault], // 17: 흥부
    [heungbuDefault, nolbuDefault], // 18: 해설
    [heungbuDefault, nolbuDefault], // 19: 흥부
    [heungbuDefault, nolbuDefault], // 20: 놀부
    [heungbuHappy, nolbuDefault],   // 21: 해설 ("둘은 잠시 노려보다 함께 웃었다.")
    [heungbuDefault, nolbuDefault], // 22: 해설
    [heungbuDefault, nolbuDefault], // 23: 해설
    [heungbuHappy, nolbuDefault],   // 24: 흥부 ("형. 저 밭은 같이 해 볼래?")
    [heungbuDefault, nolbuDefault], // 25: 놀부
    [heungbuHappy, nolbuDefault],   // 26: 흥부 ("형은 계획 세우는 건 잘하고...")
    [heungbuDefault, nolbuDefault], // 27: 놀부
    [heungbuDefault, nolbuDefault], // 28: 해설
    [heungbuDefault, nolbuDefault], // 29: 해설
    [heungbuDefault, nolbuDefault], // 30: 놀부
    [heungbuHappy, nolbuDefault],   // 31: 해설
    [heungbuHappy, nolbuDefault],   // 32: 흥부 ("우리 두 집 겨울 몫이랑...")
    [heungbuDefault, nolbuDefault], // 33: 놀부
    [heungbuDefault, nolbuDefault], // 34: 해설
    [heungbuHappy, nolbuDefault],   // 35: 흥부 ("그건 왜?")
    [heungbuDefault, nolbuDefault], // 36: 놀부
    [heungbuDefault, nolbuDefault], // 37: 해설
    [heungbuHappy, nolbuDefault],   // 38: 놀부 ("왜? 나도 반은 줄 줄 안다.")
    [heungbuHappy, nolbuDefault],   // 39: 해설 ("흥부가 웃음을 터뜨렸다.")
  ],

  // 12b장: 두 집 사이의 길 (33컷) - 결말 B
  "chapter-12b": [
    [heungbuDefault, nolbuDefault], // 1: 해설
    [heungbuDefault, nolbuDefault], // 2: 놀부
    [heungbuDefault, nolbuDefault], // 3: 흥부
    [heungbuDefault, nolbuDefault], // 4: 흥부
    [heungbuDefault, nolbuDefault], // 5: 해설
    [heungbuDefault, nolbuDefault], // 6: 놀부
    [heungbuDefault, nolbuDefault], // 7: 흥부
    [heungbuDefault, nolbuDefault], // 8: 해설
    [heungbuDefault, nolbuDefault], // 9: 해설
    [heungbuDefault, nolbuDefault], // 10: 해설
    [heungbuDefault, nolbuDefault], // 11: 해설
    [nolbuDefault, wifeNolbu],      // 12: 놀부 아내
    [nolbuDefault, wifeNolbu],      // 13: 놀부
    [nolbuDefault, wifeNolbu],      // 14: 놀부 아내
    [heungbuDefault, nolbuDefault], // 15: 해설
    [heungbuDefault, nolbuDefault], // 16: 흥부
    [heungbuDefault, nolbuDefault], // 17: 놀부
    [heungbuDefault, nolbuDefault], // 18: 흥부
    [heungbuDefault, nolbuDefault], // 19: 놀부
    [heungbuDefault, nolbuDefault], // 20: 해설
    [heungbuDefault, nolbuDefault], // 21: 흥부
    [heungbuDefault, nolbuDefault], // 22: 해설
    [heungbuDefault, nolbuDefault], // 23: 해설
    [heungbuDefault, nolbuDefault], // 24: 해설
    [heungbuDefault, nolbuDefault], // 25: 흥부
    [heungbuDefault, nolbuDefault], // 26: 놀부
    [heungbuHappy, nolbuDefault],   // 27: 흥부 ("그럼?")
    [heungbuHappy, nolbuDefault],   // 28: 놀부 ("같이 먹자고.")
    [heungbuHappy, nolbuDefault],   // 29: 해설 ("흥부가 문을 활짝 열었다.")
    [heungbuHappy, nolbuDefault],   // 30: 해설 ("놀부는 아무 말 없이 떡을 반으로...")
    [heungbuHappy, nolbuDefault],   // 31: 해설 ("흥부는 그 떡을 잠시 바라보다가 웃었다.")
    [heungbuDefault, nolbuDefault], // 32: 해설
    [heungbuDefault, nolbuDefault], // 33: 해설
  ],
};
