#!/usr/bin/env node
import { execSync } from "node:child_process";

function run(cmd, fallback = "") {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
  } catch {
    return fallback;
  }
}

const branch = run("git rev-parse --abbrev-ref HEAD", "unknown");
const localCommit = run("git log -1 --format=\"%h (%s)\"", "none");
const localHash = run("git rev-parse HEAD", "");

// Fetch latest remote tracking info silently if network allows (timeout 3s)
try {
  execSync("git fetch origin --quiet", { timeout: 3000, stdio: "ignore" });
} catch {
  // offline or timeout, continue with cached tracking info
}

const remoteHash = run("git rev-parse origin/main", "");
const remoteCommit = run("git log -1 --format=\"%h (%s)\" origin/main", "none");

let syncStatus = "unknown";
if (localHash && remoteHash) {
  if (localHash === remoteHash) {
    syncStatus = "동기화 완료 (In-Sync: local HEAD == origin/main)";
  } else {
    const behind = run(`git rev-list --count ${localHash}..${remoteHash}`, "0");
    const ahead = run(`git rev-list --count ${remoteHash}..${localHash}`, "0");
    syncStatus = `불일치 (Ahead: ${ahead}, Behind: ${behind})`;
  }
}

const statusShort = run("git status -s", "");
const dirtyFiles = statusShort ? statusShort.split("\n").filter(Boolean) : [];
const workTreeStatus = dirtyFiles.length === 0 
  ? "깨끗함 (Clean, 0 files)" 
  : `미커밋 변경 ${dirtyFiles.length}개:\n    ` + dirtyFiles.slice(0, 5).join("\n    ") + (dirtyFiles.length > 5 ? `\n    ... 외 ${dirtyFiles.length - 5}개` : "");

// Check GitHub PR via gh CLI
const openPRs = run("gh pr list --state open --limit 3 --json number,title,headRefName", "");
let prSummary = "열린 PR 없음";
if (openPRs && openPRs !== "[]") {
  try {
    const parsed = JSON.parse(openPRs);
    if (parsed.length > 0) {
      prSummary = parsed.map((p) => `#${p.number} [${p.headRefName}] ${p.title}`).join("\n    ");
    }
  } catch {
    prSummary = openPRs;
  }
}

console.log(`
==============================================================
 📖 storygame 로컬 ↔ GitHub 최신 동기화 현황 (Fast Check)
==============================================================
• 로컬 브랜치   : ${branch}
• 로컬 HEAD     : ${localCommit}
• 원격 main HEAD: ${remoteCommit}
• 동기화 상태   : ${syncStatus}
• 작업 트리     : ${workTreeStatus}
• 열린 GitHub PR: ${prSummary}
• 최근 검증 기록: STATUS.md 참조 (이 명령은 테스트를 실행하지 않음)
==============================================================
💡 AI 세션 팁: 이 출력값만으로 현재 저장소 상태를 즉시 파악할 수 있으며,
   대형 상태 문서를 반복 조회하지 않아도 되어 토큰을 대폭 절약할 수 있습니다.
==============================================================
`);
