---
name: plan-feature
description: 사전 기획, 요구사항 분석, 리스크 평가 및 마일스톤 분해 스킬
---
# 📐 Plan Feature (사전 기획 & 리스크 분석)

## 1. 목적 (Purpose)
새로운 기능 구현 전, 명확한 요구사항 정의, 아키텍처 영향도 분석, 위험 요소 사전 식별을 통해 실패 없는 안전한 개발 경로를 수립합니다.

## 2. 실행 절차 (Execution Workflow)
1. **요구사항 분해**: 사용자 스토리 및 인수 조건(Acceptance Criteria) 도출
2. **영향도 분석**: 기존 컴포넌트, 모듈, 데이터 흐름 간 의존성 검토
3. **리스크 평가**: 성능 병목, 브레이킹 체인지, 보안 취약점 사전 차단
4. **Surgical Slice 분할**: 독립 검증이 가능한 최소 단위의 작업 계획 수립
5. **Definition of Done (DoD) 설정**: C1/C2/W1/W2 실행 등급과 필요한 G/A/B/D 증거를 명시


## 3. 실행 등급
계획 단계에서 `docs/operations/chat-first-development.md`를 기준으로 작업을 C1, C2, W1, W2 중 하나로 분류합니다. 실제 환경이 필요하지 않은 작업을 Work로 보내지 않고, W1/W2도 설계·코드·CI는 가능한 한 Chat이 담당합니다.
