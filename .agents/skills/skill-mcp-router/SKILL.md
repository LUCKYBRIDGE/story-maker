---
name: skill-mcp-router
description: 지능형 도구 및 스킬 자동 라우팅 스킬
---
# 🧭 Skill & MCP Router (지능형 도구 자동 라우터)

## 1. 목적 (Purpose)
사용자의 요청 성격(기획, 구현, 디버깅, 리뷰, 브라우저 테스트 등)을 분석하여 최적의 스킬과 MCP 도구를 자동으로 선택하고 연계합니다.

## 2. 라우팅 매트릭스
- **새로운 기능 기획** ──► `plan-feature`
- **코드 구현** ──► `implement-feature` + `tdd-test-generator`
- **오류 해결** ──► `debug`
- **품질 검증** ──► `code-review`
- **UI/E2E 검증** ──► `Puppeteer MCP` / `Chrome DevTools`
