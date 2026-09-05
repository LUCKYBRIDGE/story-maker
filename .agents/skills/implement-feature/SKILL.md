---
name: implement-feature
description: 최소 변경(Surgical Edit) 원칙 기반 안전 구현 및 즉시 빌드 검증 스킬
---
# 🔨 Implement Feature (안전 구현 & 빌드 검증)

## 1. 목적 (Purpose)
기존 아키텍처와 코드를 100% 존중하며 최소한의 정밀한 변경(Surgical Edit)으로 기능을 구현하고, 단계마다 즉시 빌드 무결성을 검증합니다.

## 2. 핵심 원칙 (Core Rules)
- **Zero-Assumption**: 수정 전 기존 구현과 인터페이스를 완벽히 파악
- **Preserve Working Code**: 정상 동작하는 기존 기능 및 주석 훼손 금지
- **Incremental Verification**: 실행 환경에 맞는 가장 좁은 검증을 먼저 고정. GitHub 연결 Chat은 테스트를 추가·수정하고 PR CI 결과를 확인하며, Work/로컬은 카드가 요구하는 실제 환경 검증만 실행
- **Clean Git Scope**: 작업 대상 외 불필요한 파일 변경 배제


## 3. 실행 환경
- C1/C2 작업은 가능한 한 Chat에서 구현하고 GitHub diff/CI를 완료 증거로 사용합니다.
- W1/W2 작업도 코드는 Chat이 기본 소유하며, 브라우저·IME·기기 증거만 Work/로컬에 handoff합니다.
- Chat이 로컬 명령을 실행했다고 주장하거나, Work가 CI에서 이미 통과한 동일 검사를 관례적으로 반복하지 않습니다.
