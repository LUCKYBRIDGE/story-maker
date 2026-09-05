---
name: debug
description: Root Cause 분석, 가설 검증 및 자가 치유(Self-Healing) 스킬
---
# 🔍 Debug & Self-Healing (원인 분석 & 자가 치유)

## 1. 목적 (Purpose)
버그 발생 시 표면적 증상 땜질을 지양하고, 근본 원인(Root Cause)을 체계적으로 추적하여 3단계 자가 치유 루프로 해결합니다.

## 2. 3단계 자가 치유 프로토콜 (Self-Healing Loop)
```text
[오류 관측 & 로그/재현 추적] ─► [근본 원인 가설 수립] ─► [최소 정밀 수정] ─► [CI/실환경 재검증]
                                                                │
                                                [Exit Code == 0] ▼
                                                    [자가 치유 완료]
```
- **3회 제한 원칙**: 동일 오류에 대해 3회 연속 실패 시 무리한 수정을 중단하고 상세 원인을 사용자에게 에스컬레이션.


## 3. 증거 위치
- CI 실패는 GitHub Actions job/step/log를 Chat이 직접 읽고 최소 수정합니다.
- 실제 브라우저·IME·기기에서만 재현되는 실패는 Work가 재현 조건과 증거를 보고하고 Chat이 수정하는 것이 기본입니다.
- Work가 로컬에서 수정해야 하는 경우 같은 branch에 즉시 commit·push하여 PR을 다시 공유 기준선으로 만듭니다.
