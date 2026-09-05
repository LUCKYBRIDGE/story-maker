# 캐릭터 기준본·앵커 Audit

- 명령: `npm run assets:audit`
- 입력 지문: `43cb9456e7c83dcc086e115897b4eee0cdd716d650ff2fec3f5c6822dec9ec49`
- 검사 대상: 등록 자산 70개 + 후보 18개 = 88개
- 기준: 800×1200, 알파 26/255 이상, groundY=1149
- 원칙: 이 보고서는 이미지를 읽기만 하며 자동 보정·덮어쓰기를 하지 않습니다.

## 자동 허용 범위

| 항목 | 자동 통과 | 수동 검토 | 범위 초과 시 |
|---|---:|---:|---|
| 발 바닥선 | ±3px | 4~6px | 평행이동 가능 여부 확인 |
| 몸통 중심 | ±12px | 13~20px | 평행이동 가능 여부 확인 |
| 눈높이·어깨선 | ±12px | 13~24px | 기준본 재생성 검토 |
| 중심 신체 높이 | ±3% | 3~5% | 머리/몸 기준점 확인 |
| 머리/몸 비율 | ±3% | 3~5% | 기준본 재생성 검토 |

## 판정 요약

| 판정 | 수 |
|---|---:|
| KEEP | 15 |
| NORMALIZE-TRANSLATE | 1 |
| NORMALIZE-UNIFORM-SCALE | 0 |
| MANUAL-REVIEW | 71 |
| REFERENCE-REMAKE | 0 |
| REJECT | 0 |
| LEGACY | 1 |

`MANUAL-REVIEW`는 실패가 아니라 안전장치입니다. 카툰의 눈·어깨·머리 경계는 자동 인식으로 확정하지 않고 사람이 기준점을 승인해야 합니다.

## 우선 검토 신호

- `work/story-assets/candidates/character-emotion-additions/rabbit/rabbit-happy.webp`: 몸 중심을 21.28px 평행이동하는 보정 후보입니다.
- `work/story-assets/candidates/character-emotion-additions/rabbit/rabbit-worried.webp`: 동적 외곽을 줄인 몸 중심이 기준본과 18.99px 차이 납니다. / 동적 외곽을 줄인 중심 신체 높이가 기준본과 -4.09% 차이 납니다.
- `public/story-assets/rabbit-turtle.character.rabbit-guilty-escape.webp`: 몸 중심을 -31.97px 평행이동하는 보정 후보입니다. / 동적 외곽을 줄인 중심 신체 높이가 기준본과 3.14% 차이 납니다.
- `public/story-assets/rabbit-turtle.character.rabbit-speaking-truth.webp`: 몸 중심을 -22.23px 평행이동하는 보정 후보입니다.
- `work/story-assets/candidates/character-emotion-additions/turtle/turtle-default.webp`: 동적 외곽을 줄인 몸 중심이 기준본과 -17.21px 차이 납니다.
- `public/story-assets/rabbit-turtle.character.turtle-ashamed.webp`: 동적 외곽을 줄인 몸 중심이 기준본과 -18.69px 차이 납니다.
- `public/story-assets/rabbit-turtle.character.turtle-offer.webp`: 몸 중심을 -46.06px 평행이동하는 보정 후보입니다.
- `public/story-assets/rabbit-turtle.character.turtle-tired.webp`: 동적 외곽을 줄인 몸 중심이 기준본과 -17.5px 차이 납니다.
- `public/story-assets/rabbit-turtle.character.turtle-unified-720x900.webp`: 동적 외곽을 줄인 몸 중심이 기준본과 -16.16px 차이 납니다.
- `public/story-assets/rabbit-turtle.character.dragonking-command.webp`: 몸 중심을 -39.48px 평행이동하는 보정 후보입니다.
- `public/story-assets/rabbit-turtle.character.dragonking-command-attached.webp`: 동적 외곽을 줄인 중심 신체 높이가 기준본과 -3.14% 차이 납니다.
- `public/story-assets/rabbit-turtle.character.dragonking-critical-attached.webp`: 동적 외곽을 줄인 중심 신체 높이가 기준본과 4.94% 차이 납니다.
- `public/story-assets/rabbit-turtle.character.dragonking-critical-worse-attached.webp`: 중심 신체 높이가 5.16% 달라 눈·머리 기준점 확인이 필요합니다.
- `public/story-assets/rabbit-turtle.character.dragonking-sick-elder-attached.webp`: 몸 중심을 -24.26px 평행이동하는 보정 후보입니다.
- `public/story-assets/rabbit-turtle.character.dragonking-unified-720x900.webp`: 몸 중심을 -24.26px 평행이동하는 보정 후보입니다.
- `public/story-assets/rabbit-turtle.character.dragonking-young-attached.webp`: 중심 신체 높이가 -7.52% 달라 눈·머리 기준점 확인이 필요합니다.
- `public/story-assets/rabbit-turtle.character.dragonking-young-unified-720x900.webp`: 중심 신체 높이가 -7.52% 달라 눈·머리 기준점 확인이 필요합니다.
- `public/story-assets/rabbit-turtle.character.palace-physician-worried.webp`: 동적 외곽을 줄인 중심 신체 높이가 기준본과 -4.76% 차이 납니다.
- `work/story-assets/candidates/shrimp-clerk-emotions/shrimp-clerk-serious-report.webp`: 몸 중심을 23.55px 평행이동하는 보정 후보입니다.
- `public/story-assets/onggojib.character.real-angry-pixel.webp`: 동적 외곽을 줄인 몸 중심이 기준본과 14.39px 차이 납니다.
- `public/story-assets/onggojib.character.real-borrowed-consistent-pixel.webp`: 발선이 기준에서 -6px 차이 나 수동 확인이 필요합니다.
- `public/story-assets/onggojib.character.real-exiled-consistent-pixel.webp`: 발선을 8px 평행이동하면 기준에 맞출 수 있습니다.
- `public/story-assets/onggojib.character.real-resolve-consistent-pixel.webp`: 발선이 기준에서 -6px 차이 나 수동 확인이 필요합니다. / 동적 외곽을 줄인 몸 중심이 기준본과 13.3px 차이 납니다.
- `public/story-assets/onggojib.character.real-resolve-pixel.webp`: 동적 외곽을 줄인 몸 중심이 기준본과 14.64px 차이 납니다.
- `public/story-assets/onggojib.character.double-blue-firm-consistent-pixel.webp`: 몸 중심을 45.62px 평행이동하는 보정 후보입니다.
- `public/story-assets/onggojib.character.double-blue-firm-pixel.webp`: 몸 중심을 46.59px 평행이동하는 보정 후보입니다.
- `public/story-assets/onggojib.character.double-blue-offering-pixel.webp`: 몸 중심을 21.8px 평행이동하는 보정 후보입니다.
- `public/story-assets/onggojib.character.double-gentle-pixel.webp`: 몸 중심을 21.01px 평행이동하는 보정 후보입니다.
- `public/story-assets/onggojib.character.double-pixel.webp`: 몸 중심을 57.77px 평행이동하는 보정 후보입니다.
- `public/story-assets/onggojib.character.double-real-source-pixel.webp`: 몸 중심을 57.26px 평행이동하는 보정 후보입니다.
- `public/story-assets/onggojib.character.wife-concerned-pixel.webp`: 몸 중심을 -49.4px 평행이동하는 보정 후보입니다.
- `public/story-assets/onggojib.character.servant-injured-pixel.webp`: 동적 외곽을 줄인 몸 중심이 기준본과 15.22px 차이 납니다.
- `public/story-assets/onggojib.character.worker-asking-v2-pixel.webp`: 몸 중심을 40.32px 평행이동하는 보정 후보입니다.
- `public/story-assets/onggojib.character.worker-woodcutter-pixel.webp`: 몸 중심을 20.33px 평행이동하는 보정 후보입니다.
- `public/story-assets/onggojib.character.second-child-hesitant-pixel.webp`: 동적 외곽을 줄인 몸 중심이 기준본과 13.67px 차이 납니다.
- `public/story-assets/onggojib.character.second-child-pixel.webp`: 발선이 기준에서 -6px 차이 나 수동 확인이 필요합니다.
- `public/story-assets/onggojib.character.youngest-child-pixel.webp`: 발선을 8px 평행이동하면 기준에 맞출 수 있습니다.
- `public/story-assets/onggojib.character.group-fake-servant-worker-payment-pixel.webp`: 중심 신체 높이가 -30.21% 달라 눈·머리 기준점 확인이 필요합니다. / 여러 인물 또는 합성 포즈라 단일 인물 자동 비율 판정을 적용하지 않습니다.
- `public/story-assets/onggojib.character.group-fake-wife-entering-pixel.webp`: 몸 중심 차이 -42.35px를 평행이동만으로 안전하게 해결할 수 없습니다. / 중심 신체 높이가 -15.11% 달라 눈·머리 기준점 확인이 필요합니다. / 여러 인물 또는 합성 포즈라 단일 인물 자동 비율 판정을 적용하지 않습니다.
- `public/story-assets/onggojib.character.group-fake-worker-reward-pixel.webp`: 중심 신체 높이가 -7.34% 달라 눈·머리 기준점 확인이 필요합니다. / 여러 인물 또는 합성 포즈라 단일 인물 자동 비율 판정을 적용하지 않습니다.
- `public/story-assets/onggojib.character.group-real-ghost-servant-pass-pixel.webp`: 몸 중심 차이 24.6px를 평행이동만으로 안전하게 해결할 수 없습니다. / 동적 외곽을 줄인 중심 신체 높이가 기준본과 -4.15% 차이 납니다. / 여러 인물 또는 합성 포즈라 단일 인물 자동 비율 판정을 적용하지 않습니다.

## 기준본·전체 Pose 비교

| 판정 | 출처 | 위치 묶음 | 파일·Pose | 발선 Δ | 몸 중심 Δ | 중심 신체 높이 Δ | 눈높이 Δ | 머리/몸 Δ | 판정 이유 |
|---|---|---|---|---:|---:|---:|---:|---:|---|
| MANUAL-REVIEW | 후보 | 토끼 · 중간 회갈색 | `work/story-assets/candidates/character-emotion-additions/rabbit/rabbit-default.webp` · 기본 후보 | 0px | -3.82px | +0.1% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 토끼 · 중간 회갈색 | `work/story-assets/candidates/character-emotion-additions/rabbit/rabbit-happy.webp` · 기쁨 후보 | 0px | -21.28px | -1.26% | — | — | 몸 중심을 21.28px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 토끼 · 중간 회갈색 | `work/story-assets/candidates/character-emotion-additions/rabbit/rabbit-worried.webp` · 걱정 후보 | 0px | +18.99px | -4.09% | — | — | 동적 외곽을 줄인 몸 중심이 기준본과 18.99px 차이 납니다. / 동적 외곽을 줄인 중심 신체 높이가 기준본과 -4.09% 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 토끼 · 중간 회갈색 | `public/story-assets/rabbit-turtle.character.rabbit-guilty-escape.webp` · 미안해서 도망 | 0px | +31.97px | +3.14% | — | — | 몸 중심을 -31.97px 평행이동하는 보정 후보입니다. / 동적 외곽을 줄인 중심 신체 높이가 기준본과 3.14% 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 토끼 · 중간 회갈색 | `public/story-assets/rabbit-turtle.character.rabbit-herb-bundle.webp` · 약초 꾸러미 | 0px | -5.64px | +0.42% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 토끼 · 중간 회갈색 | `public/story-assets/rabbit-turtle.character.rabbit-shocked.webp` · 놀람 | 0px | -3.25px | +0.42% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 토끼 · 중간 회갈색 | `public/story-assets/rabbit-turtle.character.rabbit-speaking-truth.webp` · 진실을 말함 | 0px | +22.23px | +1.68% | — | — | 몸 중심을 -22.23px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 토끼 · 중간 회갈색 | `public/story-assets/rabbit-turtle.character.rabbit-suspicious.webp` · 의심 | 0px | +8.77px | +1.78% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| KEEP | 등록 | 토끼 · 중간 회갈색 | `public/story-assets/rabbit-turtle.character.rabbit-thinking.webp` · 생각 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| LEGACY | 등록 | 토끼 · 중간 회갈색 | `public/story-assets/rabbit-turtle.character.rabbit-white-unified-720x900.webp` · 기본 | — | — | — | — | — | 사용하지 않는 이전 자산으로 보관합니다. |
| MANUAL-REVIEW | 후보 | 자라 · 기본 의상 | `work/story-assets/candidates/character-emotion-additions/turtle/turtle-default.webp` · 기본 후보 | 0px | -17.21px | -0.94% | — | — | 동적 외곽을 줄인 몸 중심이 기준본과 -17.21px 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 자라 · 기본 의상 | `work/story-assets/candidates/character-emotion-additions/turtle/turtle-happy.webp` · 기쁨 후보 | 0px | -4.86px | -0.31% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 자라 · 기본 의상 | `work/story-assets/candidates/character-emotion-additions/turtle/turtle-surprised.webp` · 놀람 후보 | 0px | -3.35px | -0.1% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 자라 · 기본 의상 | `public/story-assets/rabbit-turtle.character.turtle-ashamed.webp` · 부끄러움 | 0px | -18.69px | +1.57% | — | — | 동적 외곽을 줄인 몸 중심이 기준본과 -18.69px 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 자라 · 기본 의상 | `public/story-assets/rabbit-turtle.character.turtle-herb-bundle.webp` · 약초 꾸러미 | 0px | -7.69px | +0.63% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 자라 · 기본 의상 | `public/story-assets/rabbit-turtle.character.turtle-offer.webp` · 제안 | 0px | +46.06px | +0.1% | — | — | 몸 중심을 -46.06px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| KEEP | 등록 | 자라 · 기본 의상 | `public/story-assets/rabbit-turtle.character.turtle-resolve.webp` · 결심 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| MANUAL-REVIEW | 등록 | 자라 · 기본 의상 | `public/story-assets/rabbit-turtle.character.turtle-tired.webp` · 지침 | 0px | -17.5px | +1.68% | — | — | 동적 외곽을 줄인 몸 중심이 기준본과 -17.5px 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 자라 · 기본 의상 | `public/story-assets/rabbit-turtle.character.turtle-unified-720x900.webp` · 기본 | -2px | -16.16px | +0.21% | — | — | 동적 외곽을 줄인 몸 중심이 기준본과 -16.16px 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 어린 자라 · 회상 | `public/story-assets/rabbit-turtle.character.turtle-child-flashback.webp` · 회상 | 0px | +7.47px | +1.54% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| KEEP | 등록 | 어린 자라 · 회상 | `public/story-assets/rabbit-turtle.character.turtle-child-unified-720x900.webp` · 기본 | -3px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| MANUAL-REVIEW | 후보 | 용왕 · 동일 인물 비율 | `work/story-assets/candidates/character-emotion-additions/dragonking/dragonking-happy.webp` · 기쁨 후보 | 0px | +2.52px | +0.11% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 용왕 · 동일 인물 비율 | `work/story-assets/candidates/character-emotion-additions/dragonking/dragonking-surprised.webp` · 놀람 후보 | 0px | -5.86px | +0.56% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 용왕 · 동일 인물 비율 | `work/story-assets/candidates/character-emotion-additions/dragonking/dragonking-worried.webp` · 걱정 후보 | 0px | -0.21px | +0.67% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 용왕 · 동일 인물 비율 | `public/story-assets/rabbit-turtle.character.dragonking-command.webp` · 명령 | 0px | +39.48px | -0.34% | — | — | 몸 중심을 -39.48px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 용왕 · 동일 인물 비율 | `public/story-assets/rabbit-turtle.character.dragonking-command-attached.webp` · 엄한 명령 | 0px | -3.18px | -3.14% | — | — | 동적 외곽을 줄인 중심 신체 높이가 기준본과 -3.14% 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 용왕 · 동일 인물 비율 | `public/story-assets/rabbit-turtle.character.dragonking-critical-attached.webp` · 위독 | 0px | -0.59px | +4.94% | — | — | 동적 외곽을 줄인 중심 신체 높이가 기준본과 4.94% 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 용왕 · 동일 인물 비율 | `public/story-assets/rabbit-turtle.character.dragonking-critical-worse-attached.webp` · 매우 위독 | 0px | +0.89px | +5.16% | — | — | 중심 신체 높이가 5.16% 달라 눈·머리 기준점 확인이 필요합니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| KEEP | 등록 | 용왕 · 동일 인물 비율 | `public/story-assets/rabbit-turtle.character.dragonking-recovered-unified-720x900.webp` · 회복 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| MANUAL-REVIEW | 등록 | 용왕 · 동일 인물 비율 | `public/story-assets/rabbit-turtle.character.dragonking-sick-elder-attached.webp` · 병든 모습 | 0px | +24.26px | +1.12% | — | — | 몸 중심을 -24.26px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 용왕 · 동일 인물 비율 | `public/story-assets/rabbit-turtle.character.dragonking-unified-720x900.webp` · 기본 | 0px | +24.26px | +1.12% | — | — | 몸 중심을 -24.26px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 용왕 · 동일 인물 비율 | `public/story-assets/rabbit-turtle.character.dragonking-young-attached.webp` · 기본 | -2px | -7.38px | -7.52% | — | — | 중심 신체 높이가 -7.52% 달라 눈·머리 기준점 확인이 필요합니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 용왕 · 동일 인물 비율 | `public/story-assets/rabbit-turtle.character.dragonking-young-unified-720x900.webp` · 전신 | -2px | -7.38px | -7.52% | — | — | 중심 신체 높이가 -7.52% 달라 눈·머리 기준점 확인이 필요합니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 의관 · 청록 의상 | `work/story-assets/candidates/character-emotion-additions/physician/physician-happy.webp` · 기쁨 후보 | 0px | +0.07px | +0.2% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 의관 · 청록 의상 | `work/story-assets/candidates/character-emotion-additions/physician/physician-serious.webp` · 진지함 후보 | 0px | +9.3px | -1.11% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 의관 · 청록 의상 | `work/story-assets/candidates/character-emotion-additions/physician/physician-surprised.webp` · 놀람 후보 | 0px | -2.14px | +0.3% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 의관 · 청록 의상 | `public/story-assets/rabbit-turtle.character.palace-physician-worried.webp` · 걱정 | 0px | -0.99px | -4.76% | — | — | 동적 외곽을 줄인 중심 신체 높이가 기준본과 -4.76% 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| KEEP | 등록 | 의관 · 청록 의상 | `public/story-assets/rabbit-turtle.character.physician-unified-720x900.webp` · 기본 | -3px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| KEEP | 후보 | 새우 문관 · 자주색 관복 후보 | `work/story-assets/candidates/shrimp-clerk-emotions/shrimp-clerk-default.webp` · 기본 후보 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| MANUAL-REVIEW | 후보 | 새우 문관 · 자주색 관복 후보 | `work/story-assets/candidates/shrimp-clerk-emotions/shrimp-clerk-happy.webp` · 기쁨 후보 | 0px | +1.28px | +2.2% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 새우 문관 · 자주색 관복 후보 | `work/story-assets/candidates/shrimp-clerk-emotions/shrimp-clerk-sad-apologetic.webp` · 슬픔·사과 후보 | 0px | -0.31px | +1.85% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 새우 문관 · 자주색 관복 후보 | `work/story-assets/candidates/shrimp-clerk-emotions/shrimp-clerk-serious-report.webp` · 진지한 보고 후보 | 0px | -23.55px | +0.12% | — | — | 몸 중심을 23.55px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 새우 문관 · 자주색 관복 후보 | `work/story-assets/candidates/shrimp-clerk-emotions/shrimp-clerk-surprised.webp` · 놀람 후보 | 0px | -3.07px | +0.12% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 후보 | 새우 문관 · 자주색 관복 후보 | `work/story-assets/candidates/shrimp-clerk-emotions/shrimp-clerk-worried.webp` · 걱정 후보 | 0px | +4.79px | -0.12% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 진짜 옹고집 | `public/story-assets/onggojib.character.real-angry-pixel.webp` · 분노 | 0px | +14.39px | -0.21% | — | — | 동적 외곽을 줄인 몸 중심이 기준본과 14.39px 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 진짜 옹고집 | `public/story-assets/onggojib.character.real-borrowed-consistent-pixel.webp` · 빌린 옷 | -6px | +4.47px | -1.05% | — | — | 발선이 기준에서 -6px 차이 나 수동 확인이 필요합니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 진짜 옹고집 | `public/story-assets/onggojib.character.real-borrowed-pixel.webp` · 빌린 옷 | 0px | +2.97px | 0% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| KEEP | 등록 | 진짜 옹고집 | `public/story-assets/onggojib.character.real-consistent-pixel.webp` · 이어지는 모습 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| MANUAL-REVIEW | 등록 | 진짜 옹고집 | `public/story-assets/onggojib.character.real-exiled-consistent-pixel.webp` · 쫓겨남 | -8px | +0.51px | -1.26% | — | — | 발선을 8px 평행이동하면 기준에 맞출 수 있습니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 진짜 옹고집 | `public/story-assets/onggojib.character.real-exiled-pixel.webp` · 쫓겨남 | 0px | +5.82px | +1.37% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 진짜 옹고집 | `public/story-assets/onggojib.character.real-exiled-pleading-v2-pixel.webp` · 쫓겨나 애원 | 0px | -0.44px | -0.74% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 진짜 옹고집 | `public/story-assets/onggojib.character.real-pixel.webp` · 기본 | 0px | +5.1px | 0% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 진짜 옹고집 | `public/story-assets/onggojib.character.real-remorse-consistent-pixel.webp` · 후회 | 0px | +11.96px | +0.74% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 진짜 옹고집 | `public/story-assets/onggojib.character.real-remorse-pixel.webp` · 후회 | 0px | -2.33px | +1.69% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 진짜 옹고집 | `public/story-assets/onggojib.character.real-resolve-consistent-pixel.webp` · 결심 | -6px | +13.3px | -0.84% | — | — | 발선이 기준에서 -6px 차이 나 수동 확인이 필요합니다. / 동적 외곽을 줄인 몸 중심이 기준본과 13.3px 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 진짜 옹고집 | `public/story-assets/onggojib.character.real-resolve-pixel.webp` · 결심 | -2px | +14.64px | +1.48% | — | — | 동적 외곽을 줄인 몸 중심이 기준본과 14.64px 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 가짜 옹고집 | `public/story-assets/onggojib.character.double-blue-firm-consistent-pixel.webp` · 단호 | 0px | -45.62px | -0.41% | — | — | 몸 중심을 45.62px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 가짜 옹고집 | `public/story-assets/onggojib.character.double-blue-firm-pixel.webp` · 단호 | -3px | -46.59px | -2.06% | — | — | 몸 중심을 46.59px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| KEEP | 등록 | 가짜 옹고집 | `public/story-assets/onggojib.character.double-blue-gentle-consistent-pixel.webp` · 온화 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| MANUAL-REVIEW | 등록 | 가짜 옹고집 | `public/story-assets/onggojib.character.double-blue-gentle-pixel.webp` · 온화 | 0px | -2.31px | -1.96% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 가짜 옹고집 | `public/story-assets/onggojib.character.double-blue-offering-consistent-pixel.webp` · 건넴 | 0px | -0.91px | -1.55% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 가짜 옹고집 | `public/story-assets/onggojib.character.double-blue-offering-pixel.webp` · 건넴 | 0px | -21.8px | -1.34% | — | — | 몸 중심을 21.8px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 가짜 옹고집 | `public/story-assets/onggojib.character.double-gentle-pixel.webp` · 온화 | 0px | -21.01px | -1.86% | — | — | 몸 중심을 21.01px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 가짜 옹고집 | `public/story-assets/onggojib.character.double-pixel.webp` · 기본 | 0px | -57.77px | -1.96% | — | — | 몸 중심을 57.77px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 가짜 옹고집 | `public/story-assets/onggojib.character.double-real-source-pixel.webp` · 정체가 드러남 | 0px | -57.26px | -2.06% | — | — | 몸 중심을 57.26px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 옹고집의 아내 | `public/story-assets/onggojib.character.wife-concerned-pixel.webp` · 걱정 | 0px | +49.4px | -0.7% | — | — | 몸 중심을 -49.4px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| KEEP | 등록 | 옹고집의 아내 | `public/story-assets/onggojib.character.wife-pixel.webp` · 기본 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| MANUAL-REVIEW | 등록 | 옹고집의 아내 | `public/story-assets/onggojib.character.wife-resolved-pixel.webp` · 결심 | 0px | +10.92px | +0.3% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 옹고집의 하인 | `public/story-assets/onggojib.character.servant-household-pixel.webp` · 집안일 | -3px | +5.85px | -1.44% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 옹고집의 하인 | `public/story-assets/onggojib.character.servant-injured-pixel.webp` · 다침 | 0px | +15.22px | -0.83% | — | — | 동적 외곽을 줄인 몸 중심이 기준본과 15.22px 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| KEEP | 등록 | 옹고집의 하인 | `public/story-assets/onggojib.character.servant-pixel.webp` · 기본 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| MANUAL-REVIEW | 등록 | 일꾼 | `public/story-assets/onggojib.character.worker-asking-v2-pixel.webp` · 부탁 | 0px | -40.32px | 0% | — | — | 몸 중심을 40.32px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 일꾼 | `public/story-assets/onggojib.character.worker-woodcutter-pixel.webp` · 나무꾼 | -3px | -20.33px | -0.1% | — | — | 몸 중심을 20.33px 평행이동하는 보정 후보입니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| KEEP | 등록 | 일꾼 | `public/story-assets/onggojib.character.worker-woodcutter-v2-pixel.webp` · 나무꾼 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| MANUAL-REVIEW | 등록 | 둘째 아이 | `public/story-assets/onggojib.character.second-child-hesitant-pixel.webp` · 망설임 | 0px | +13.67px | +1.64% | — | — | 동적 외곽을 줄인 몸 중심이 기준본과 13.67px 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 둘째 아이 | `public/story-assets/onggojib.character.second-child-pixel.webp` · 기본 | -6px | 0px | 0% | — | — | 발선이 기준에서 -6px 차이 나 수동 확인이 필요합니다. |
| MANUAL-REVIEW | 등록 | 막내 아이 | `public/story-assets/onggojib.character.youngest-child-cautious-pixel.webp` · 조심 | 0px | +0.33px | +1.29% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| NORMALIZE-TRANSLATE | 등록 | 막내 아이 | `public/story-assets/onggojib.character.youngest-child-pixel.webp` · 기본 | -8px | 0px | 0% | — | — | 발선을 8px 평행이동하면 기준에 맞출 수 있습니다. |
| MANUAL-REVIEW | 등록 | 사또 | `public/story-assets/onggojib.character.magistrate-command-pixel.webp` · 명령 | 0px | +2.41px | +0.1% | — | — | 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. |
| KEEP | 등록 | 사또 | `public/story-assets/onggojib.character.magistrate-pixel.webp` · 기본 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| KEEP | 등록 | 아이 | `public/story-assets/onggojib.character.child-pixel.webp` · 기본 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| KEEP | 등록 | 낯선 사람 | `public/story-assets/onggojib.character.stranger-hidden-pixel.webp` · 정체를 숨김 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| KEEP | 등록 | 포졸 | `public/story-assets/onggojib.character.posol-pixel.webp` · 기본 | 0px | 0px | 0% | — | — | 자동 측정 항목이 허용 범위 안에 있습니다. |
| MANUAL-REVIEW | 등록 | 옹고집전 여러 인물 | `public/story-assets/onggojib.character.group-fake-child-story-pixel.webp` · 가짜 아이 이야기 | 0px | 0px | 0% | — | — | 여러 인물 또는 합성 포즈라 단일 인물 자동 비율 판정을 적용하지 않습니다. |
| MANUAL-REVIEW | 등록 | 옹고집전 여러 인물 | `public/story-assets/onggojib.character.group-fake-servant-worker-payment-pixel.webp` · 가짜 하인과 일꾼에게 품삯 | 0px | -2.88px | -30.21% | — | — | 중심 신체 높이가 -30.21% 달라 눈·머리 기준점 확인이 필요합니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. / 여러 인물 또는 합성 포즈라 단일 인물 자동 비율 판정을 적용하지 않습니다. |
| MANUAL-REVIEW | 등록 | 옹고집전 여러 인물 | `public/story-assets/onggojib.character.group-fake-wife-entering-pixel.webp` · 가짜 아내 등장 | 0px | -42.35px | -15.11% | — | — | 몸 중심 차이 -42.35px를 평행이동만으로 안전하게 해결할 수 없습니다. / 중심 신체 높이가 -15.11% 달라 눈·머리 기준점 확인이 필요합니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. / 여러 인물 또는 합성 포즈라 단일 인물 자동 비율 판정을 적용하지 않습니다. |
| MANUAL-REVIEW | 등록 | 옹고집전 여러 인물 | `public/story-assets/onggojib.character.group-fake-worker-reward-pixel.webp` · 가짜 일꾼에게 보상 | 0px | +2.28px | -7.34% | — | — | 중심 신체 높이가 -7.34% 달라 눈·머리 기준점 확인이 필요합니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. / 여러 인물 또는 합성 포즈라 단일 인물 자동 비율 판정을 적용하지 않습니다. |
| MANUAL-REVIEW | 등록 | 옹고집전 여러 인물 | `public/story-assets/onggojib.character.group-real-ghost-servant-pass-pixel.webp` · 진짜 옹고집과 하인 | 0px | +24.6px | -4.15% | — | — | 몸 중심 차이 24.6px를 평행이동만으로 안전하게 해결할 수 없습니다. / 동적 외곽을 줄인 중심 신체 높이가 기준본과 -4.15% 차이 납니다. / 카툰 얼굴·눈·어깨는 안정적으로 자동 인식할 수 없어 수동 기준점 승인이 필요합니다. / 여러 인물 또는 합성 포즈라 단일 인물 자동 비율 판정을 적용하지 않습니다. |

## 해석과 다음 작업 경계

- `NORMALIZE-TRANSLATE`: 비율을 바꾸지 않고 평행이동으로 발선 또는 중심을 맞출 수 있는 후보입니다.
- `NORMALIZE-UNIFORM-SCALE`: 수동 머리/몸 기준점이 같은 비율임을 확인한 경우에만 균일 확대·축소합니다.
- `REFERENCE-REMAKE`: 머리/몸 비율 또는 눈높이 차이로 부분 변형 없이 해결하기 어려운 후보입니다.
- `LEGACY`: 삭제하지 않고 보관하지만 신규 기본·감정 세트에는 사용하지 않습니다.
- 귀·더듬이·뿔·관모·펼친 손·소품은 행별 알파 폭 임곗값으로 중심 신체 시작점에서 줄였으며, 이 외곽만으로 전체 크기를 판정하지 않습니다.
- A1-02에서는 수동 기준점을 승인한 뒤 Audit을 다시 실행하고, 통과한 후보만 등록하거나 1:1 교체합니다.
