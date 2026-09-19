/** 컷별 배경·왼쪽 인물·오른쪽 인물. 대본은 story-classic-heungbu.ts에서 관리한다.
 * 7개 장 125컷의 정격 서사에 맞추어 정규화된 15종 인물 및 전통 배경을 매핑한다.
 */

const cottage = "seonnyeo.background.BG04-cottage-day";
const autumn = "seonnyeo.background.BG06-cottage-autumn";
const snowCottage = "seonnyeo.background.BG05-cottage-snow";
const room = "seonnyeo.background.BG09-room-day";

const nolbuHouse = "onggojib.background.classic-closed-house";
const nolbuGate = "onggojib.background.classic-gate-threshold";
const nolbuYard = "onggojib.background.spring-courtyard-pixel";
const nolbuRoom = "onggojib.background.warm-room-pixel";
const villageRoad = "onggojib.background.snow-village-road-pixel";
const emptyHouse = "onggojib.background.classic-open-house-empty";

const heungbuDefault = "heungbu.character.heungbu-default";
const heungbuPleading = "heungbu.character.heungbu-pleading";
const heungbuHappy = "heungbu.character.heungbu-happy";

const nolbuDefault = "heungbu.character.nolbu-default";
const nolbuAngry = "heungbu.character.nolbu-angry";
const nolbuRemorse = "heungbu.character.nolbu-remorse";

const wifeHeungbu = "heungbu.character.wife-heungbu";
const wifeHeungbuWorried = "heungbu.character.wife-heungbu-worried";

const wifeNolbu = "heungbu.character.wife-nolbu";
const wifeNolbuShocked = "heungbu.character.wife-nolbu-shocked";

const children = "heungbu.character.children";
const swallow = "heungbu.character.swallow";
const neighbor = "heungbu.character.neighbor";

export const HEUNGBU_CLASSIC_ART: readonly (readonly (readonly [string, string, string])[])[] = [
  // 1장: 쫓겨난 흥부 (14컷)
  [
    [nolbuYard, heungbuDefault, nolbuDefault],     // 1: 옛날 어느 마을에 놀부와 흥부 형제
    [nolbuHouse, "", nolbuAngry],                  // 2: 놀부는 자기 재산을 몹시 아꼈다
    [cottage, heungbuDefault, ""],                 // 3: 흥부는 성품이 달랐다
    [nolbuYard, heungbuDefault, nolbuDefault],     // 4: 부모가 세상을 떠났다
    [nolbuHouse, "", nolbuDefault],                // 5: 놀부는 재산을 거의 모두 자기 것으로 삼았다
    [nolbuGate, heungbuPleading, nolbuDefault],    // 6: 흥부: 형님 작은 집과 밭이라도
    [nolbuGate, heungbuPleading, nolbuAngry],      // 7: 놀부: 내 재산을 왜 너에게
    [nolbuGate, heungbuPleading, nolbuAngry],      // 8: 흥부: 몸 붙여 살 곳만이라도
    [nolbuGate, heungbuPleading, nolbuAngry],      // 9: 놀부: 내 집에서 나가거라
    [villageRoad, heungbuDefault, wifeHeungbuWorried], // 10: 흥부는 아내와 아이들을 데리고 집을 떠났다
    [villageRoad, heungbuDefault, wifeHeungbuWorried], // 11: 흥부 아내: 어디에서 살아야 하지요?
    [villageRoad, heungbuPleading, wifeHeungbuWorried], // 12: 흥부: 비바람 피할 곳부터 마련합시다
    [cottage, heungbuDefault, wifeHeungbu],        // 13: 마을 한쪽에 허름한 집을 마련했다
    [cottage, heungbuDefault, nolbuDefault],       // 14: 형제의 삶은 다른 길로 흘러가기 시작했다
  ],

  // 2장: 빈 쌀독 (16컷)
  [
    [cottage, heungbuDefault, ""],                 // 1: 흥부는 일거리를 가리지 않았다
    [cottage, "", wifeHeungbu],                    // 2: 흥부 아내도 온종일 일했다
    [room, heungbuDefault, wifeHeungbuWorried],    // 3: 곡식독은 자주 바닥을 드러냈다
    [room, heungbuDefault, children],              // 4: 아이: 오늘 저녁엔 밥을 먹을 수 있어요?
    [room, heungbuPleading, children],             // 5: 흥부: 조금만 기다리거라
    [villageRoad, heungbuPleading, ""],            // 6: 흥부는 놀부의 집으로 향했다
    [nolbuGate, heungbuPleading, nolbuDefault],    // 7: 흥부: 쌀을 조금만 빌려주십시오
    [nolbuGate, heungbuPleading, nolbuAngry],      // 8: 놀부: 또 얻어먹으러 왔느냐
    [nolbuGate, heungbuPleading, nolbuAngry],      // 9: 흥부: 아이들 한 끼 먹일 만큼만
    [nolbuGate, heungbuPleading, nolbuAngry],      // 10: 놀부: 한 톨도 줄 수 없다
    [nolbuHouse, heungbuPleading, ""],             // 11: 흥부는 쌀 한 줌 얻지 못하고 쫓겨났다
    [villageRoad, heungbuDefault, ""],             // 12: 일거리를 찾아 이 마을 저 마을을 다녔다
    [villageRoad, heungbuDefault, neighbor],       // 13: 마을 사람: 대신 벌을 받아 주면
    [villageRoad, heungbuPleading, ""],            // 14: 도착했을 때는 이미 일이 끝난 뒤였다
    [snowCottage, heungbuPleading, ""],            // 15: 흥부: 오늘도 빈손이구나
    [cottage, heungbuDefault, wifeHeungbu],        // 16: 추운 겨울이 지나고 따뜻한 봄이 왔다
  ],

  // 3장: 다친 제비 (17컷)
  [
    [cottage, "", swallow],                        // 1: 제비들이 처마 밑에 둥지를 틀었다
    [cottage, heungbuDefault, swallow],            // 2: 새끼 제비들이 태어났다
    [cottage, children, swallow],                  // 3: 아이: 제비가 또 먹이를 물고 왔어요
    [cottage, heungbuDefault, children],           // 4: 흥부: 새끼들을 키우느라 바쁘겠구나
    [cottage, heungbuDefault, ""],                 // 5: 처마 밑에서 툭 하는 소리가 났다
    [cottage, children, swallow],                  // 6: 아이: 새끼 제비가 떨어졌어요
    [cottage, heungbuPleading, swallow],           // 7: 새끼 제비는 한쪽 다리를 다쳤다
    [cottage, heungbuPleading, swallow],           // 8: 흥부: 이 조그만 것이 얼마나 아플까
    [cottage, heungbuDefault, swallow],            // 9: 나뭇조각을 다친 다리에 대고 묶어 주었다
    [cottage, heungbuDefault, swallow],            // 10: 흥부: 조금만 참고 있어라
    [cottage, heungbuHappy, swallow],              // 11: 며칠 지나자 제비의 다리가 나았다
    [autumn, heungbuDefault, ""],                  // 12: 가을이 찾아오자 제비들은 남쪽으로 떠났다
    [cottage, "", swallow],                        // 13: 이듬해 봄 제비 한 마리가 마당 위를 돌았다
    [cottage, heungbuDefault, swallow],            // 14: 제비는 작은 씨앗 하나를 떨어뜨렸다
    [cottage, heungbuDefault, wifeHeungbu],        // 15: 흥부 아내: 지난해 다리를 고쳐 준 제비일까요?
    [cottage, heungbuHappy, wifeHeungbu],          // 16: 흥부: 박이라도 만들 수 있으니 심어 봅시다
    [autumn, heungbuHappy, wifeHeungbu],           // 17: 지붕 위에는 커다란 박들이 주렁주렁 열렸다
  ],

  // 4장: 흥부가 박을 타다 (18컷)
  [
    [autumn, heungbuDefault, wifeHeungbuWorried],  // 1: 박들이 익었으나 살림은 여전히 어려웠다
    [autumn, heungbuPleading, wifeHeungbuWorried], // 2: 흥부 아내: 집에 쌀이 한 톨도 없어요
    [autumn, heungbuPleading, wifeHeungbuWorried], // 3: 흥부: 박 속을 긁어 죽을 끓여 봅시다
    [autumn, heungbuDefault, wifeHeungbu],         // 4: 가장 잘 익은 박 하나를 내려놓았다
    [autumn, heungbuDefault, wifeHeungbu],         // 5: 슬근슬근 슥삭슥삭 박을 타기 시작했다
    [autumn, heungbuDefault, children],            // 6: 아이: 안에서 무슨 소리가 나는 것 같아요
    [autumn, heungbuHappy, wifeHeungbu],           // 7: 첫 번째 박에서 쌀과 곡식이 와르르 나왔다
    [autumn, heungbuHappy, wifeHeungbu],           // 8: 흥부 아내: 세상에 쌀이에요
    [autumn, heungbuHappy, wifeHeungbu],           // 9: 흥부: 아이들이 배를 곯지 않아도 되겠소
    [autumn, heungbuHappy, wifeHeungbu],           // 10: 두 번째 박에서는 돈과 귀한 물건들이 나왔다
    [autumn, heungbuHappy, children],              // 11: 아이: 반짝반짝하는 것이 나와요
    [autumn, heungbuHappy, wifeHeungbu],           // 12: 세 번째 박에서도 살림살이와 재물이 이어졌다
    [autumn, heungbuHappy, wifeHeungbu],           // 13: 흥부 아내: 제비가 은혜를 갚으러 왔나 봐요
    [autumn, heungbuHappy, wifeHeungbu],           // 14: 흥부: 이런 일이 생길 줄 몰랐소
    [nolbuYard, heungbuHappy, wifeHeungbu],        // 15: 흥부는 가족이 지낼 새 집과 곳간을 마련했다
    [nolbuYard, heungbuDefault, ""],               // 16: 흥부는 어렵게 살던 때를 잊지 않았다
    [nolbuYard, heungbuHappy, wifeHeungbu],        // 17: 흥부: 어려운 사람 사정을 잊지 말고 삽시다
    [nolbuHouse, "", nolbuDefault],                // 18: 소식이 놀부의 귀에도 들어갔다
  ],

  // 5장: 놀부와 제비 (19컷)
  [
    [nolbuRoom, "", nolbuAngry],                   // 1: 놀부: 흥부가 큰돈을 벌었단 말이냐?
    [villageRoad, "", nolbuDefault],               // 2: 놀부는 흥부 집을 찾아갔다
    [nolbuYard, heungbuDefault, nolbuDefault],     // 3: 허름한 집 대신 넉넉한 새집이 서 있었다
    [nolbuYard, heungbuDefault, nolbuDefault],     // 4: 놀부: 무슨 일을 했기에 부자가 되었느냐?
    [nolbuYard, heungbuDefault, nolbuDefault],     // 5: 흥부: 다친 제비를 고쳐 주었더니 박씨를 주었습니다
    [nolbuYard, heungbuHappy, nolbuDefault],       // 6: 흥부: 그 박을 탔더니 곡식과 재물이 나왔습니다
    [nolbuYard, heungbuDefault, nolbuDefault],     // 7: 놀부: 제비 다리 고쳐 준 것이 전부라고?
    [nolbuYard, heungbuDefault, nolbuDefault],     // 8: 흥부: 보답을 바라고 도와준 것은 아니었습니다
    [nolbuYard, "", nolbuDefault],                 // 9: 놀부 머릿속엔 박 속의 재물만 가득했다
    [nolbuRoom, "", nolbuDefault],                 // 10: 놀부: 제비 한 마리면 되는 일이었군
    [nolbuYard, swallow, nolbuDefault],            // 11: 처마의 제비 둥지를 날마다 살폈다
    [nolbuYard, swallow, nolbuAngry],              // 12: 새끼 제비들은 탈 없이 자랐고 놀부는 조급해졌다
    [nolbuYard, "", nolbuAngry],                   // 13: 놀부: 언제 박씨를 얻는단 말이냐
    [nolbuYard, swallow, nolbuAngry],              // 14: 새끼 제비를 잡아 일부러 다리를 다치게 했다
    [nolbuYard, wifeNolbuShocked, nolbuAngry],     // 15: 놀부 아내: 멀쩡한 제비를 왜 다치게 해요?
    [nolbuYard, wifeNolbuShocked, nolbuAngry],     // 16: 놀부: 다시 고쳐 주면 되지 않소
    [nolbuYard, swallow, nolbuDefault],            // 17: 다리를 묶어 주고 다음 봄을 기다렸다
    [nolbuYard, swallow, nolbuDefault],            // 18: 이듬해 봄 제비가 박씨를 떨어뜨렸다
    [nolbuYard, "", nolbuDefault],                 // 19: 놀부: 흥부보다 몇 배는 더 큰 부자가 되어 보자
  ],

  // 6장: 놀부가 박을 타다 (22컷)
  [
    [autumn, wifeNolbu, nolbuDefault],             // 1: 가을이 되자 큼직한 박들이 열렸다
    [autumn, "", nolbuDefault],                    // 2: 놀부: 금은보화가 얼마나 많이 들어 있을까
    [autumn, wifeNolbu, nolbuDefault],             // 3: 가장 큰 박부터 내려놓고 톱을 잡았다
    [autumn, "", nolbuDefault],                    // 4: 놀부: 금도 좋고 은도 좋다 나오너라
    [autumn, wifeNolbu, nolbuDefault],             // 5: 슥삭슥삭 톱질 끝에 첫 번째 박이 갈라졌다
    [nolbuYard, neighbor, nolbuAngry],             // 6: 험상궂은 사람들이 우르르 튀어나왔다
    [nolbuYard, neighbor, nolbuAngry],             // 7: 놀부: 너희는 누구냐 내 보물은 어디 있느냐
    [nolbuYard, neighbor, nolbuAngry],             // 8: 사람들이 빚과 값을 내놓으라며 재물을 챙겼다
    [nolbuYard, wifeNolbuShocked, nolbuAngry],     // 9: 놀부 아내: 재산이 늘기는커녕 줄고 있잖아요
    [nolbuYard, wifeNolbuShocked, nolbuAngry],     // 10: 놀부: 다음 박엔 틀림없이 보물이 있을 거요
    [nolbuYard, neighbor, nolbuAngry],             // 11: 두 번째 박에서도 시끌벅적한 무리가 나왔다
    [nolbuYard, neighbor, nolbuAngry],             // 12: 세 번째 박에서도 또 다른 사람들이 몰려나왔다
    [nolbuYard, wifeNolbuShocked, nolbuAngry],     // 13: 놀부 아내: 이제 그만 타요 버립시다
    [nolbuYard, wifeNolbuShocked, nolbuAngry],     // 14: 놀부: 안 되오 마지막 박에 보물이 있을 거요
    [nolbuYard, wifeNolbuShocked, nolbuAngry],     // 15: 놀부는 손해를 보고도 멈추지 않았다
    [nolbuYard, wifeNolbuShocked, nolbuAngry],     // 16: 탈 때마다 돈과 곡식이 사라지고 살림이 망가졌다
    [emptyHouse, wifeNolbuShocked, nolbuRemorse],  // 17: 마지막 박에서 더러운 것들이 쏟아져 나왔다
    [emptyHouse, "", nolbuRemorse],                // 18: 놀부: 아이고 내 재산 내 집 이게 무슨 일이냐
    [emptyHouse, wifeNolbuShocked, nolbuRemorse],  // 19: 살림은 하루아침에 엉망이 되고 말았다
    [emptyHouse, nolbuRemorse, ""],                // 20: 행동을 따라 해도 처음부터 두 행동은 같지 않았다
    [emptyHouse, nolbuRemorse, ""],                // 21: 흥부는 도왔고 놀부는 제비를 다치게 했다
    [emptyHouse, nolbuRemorse, ""],                // 22: 모든 것을 잃은 놀부는 텅 빈 마당에 주저앉았다
  ],

  // 7장: 다시 만난 형제 (19컷)
  [
    [nolbuYard, heungbuDefault, wifeHeungbu],      // 1: 흥부는 놀부가 재산을 잃었다는 소식을 들었다
    [nolbuYard, heungbuDefault, wifeHeungbuWorried], // 2: 흥부 아내: 마음이 편하지만은 않겠어요
    [nolbuYard, heungbuDefault, wifeHeungbuWorried], // 3: 흥부: 그대로 모른 척할 수는 없구려
    [villageRoad, heungbuDefault, ""],             // 4: 흥부는 먹을 것과 옷가지를 챙겨 찾아갔다
    [emptyHouse, heungbuDefault, nolbuRemorse],    // 5: 놀부는 텅 빈 집터에 힘없이 앉아 있었다
    [emptyHouse, heungbuDefault, nolbuRemorse],    // 6: 놀부: 무엇 하러 왔느냐 볼 낯도 없구나
    [emptyHouse, heungbuDefault, nolbuRemorse],    // 7: 흥부: 우선 일어나십시오 배부터 채우고
    [emptyHouse, heungbuDefault, nolbuRemorse],    // 8: 놀부: 네가 굶을 때 쌀 한 줌 주지 않았다
    [emptyHouse, heungbuDefault, nolbuRemorse],    // 9: 놀부: 그런데 네가 가장 먼저 찾아오는구나
    [emptyHouse, heungbuDefault, nolbuRemorse],    // 10: 놀부는 자신이 했던 일들을 떠올렸다
    [emptyHouse, heungbuDefault, nolbuRemorse],    // 11: 놀부: 흥부야 내가 잘못했다
    [emptyHouse, heungbuHappy, nolbuRemorse],      // 12: 흥부: 앞으로 살아가는 모습은 바꿀 수 있습니다
    [emptyHouse, heungbuHappy, nolbuRemorse],      // 13: 흥부는 곡식과 재물을 나누어 주었다
    [nolbuYard, heungbuDefault, nolbuDefault],     // 14: 놀부도 재산만 움켜쥐고 살지 않으려 했다
    [nolbuYard, heungbuDefault, nolbuDefault],     // 15: 형제는 서로의 집을 오가기 시작했다
    [cottage, heungbuDefault, swallow],            // 16: 제비 한 마리에서 시작된 일은 삶을 바꾸어 놓았다
    [nolbuYard, heungbuHappy, nolbuDefault],       // 17: 흥부는 복을 얻었고 놀부는 가진 것을 잃었다
    [nolbuYard, heungbuHappy, nolbuDefault],       // 18: 그러나 흥부가 손을 내밀고 다시 형제로 살게 되었다
    [nolbuYard, heungbuHappy, nolbuDefault],       // 19: 흥부와 놀부는 서로 도우며 오래도록 화목하게 살았다
  ],
];
