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
- **Incremental Verification**: 변경 직후 즉시 `npm run build` / 테스트 실행
- **Clean Git Scope**: 작업 대상 외 불필요한 파일 변경 배제
