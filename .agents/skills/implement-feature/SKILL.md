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


## 3. 실행 주도권
- `docs/operations/github-first-hybrid-development.md`를 기준으로 Chat Lead / Work Lead / Joint를 선택합니다.
- GitHub 정보와 자동 검증이 중심이면 Chat이 주도합니다.
- 실제 브라우저·런타임·로컬 파일·자산의 반복 피드백이 중심이면 Work가 직접 구현을 주도할 수 있습니다.
- 누가 수정하든 같은 branch/PR에 commit·push하여 GitHub를 공유 기준선으로 유지합니다.
- 완료 증거는 주도권과 별개로 G/A/B/D 중 필요한 것만 수집하며 자동 검사를 관례적으로 중복하지 않습니다.
