---
name: tdd-test-generator
description: TDD 선행 테스트 케이스 생성 및 엣지 케이스 도출 스킬
---
# 🧪 TDD Test Generator (선행 테스트 & 엣지 케이스 생성)

## 1. 목적 (Purpose)
구현에 앞서 실패하는 테스트(Red)를 먼저 설계하여 요구사항의 모호성을 제거하고 엣지 케이스를 사전에 커버합니다.

## 2. 테스트 작성 가이드
1. 정상 경로(Happy Path) 검증
2. 경계값(Boundary Value) 및 비정상 입력(Invalid Input) 검증
3. 비동기/네트워크 실패 시나리오 검증
4. 테스트 독립성(Isolation) 유지
