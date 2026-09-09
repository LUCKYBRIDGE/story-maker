"use client";

import { useState } from "react";
import { ModalDialog } from "./ModalDialog";
import type { ExistingStoryPlacement } from "../story-flow";
import type { StoryLine, StoryProject } from "../story-data";
import { findStoryFlowIssues, orderedStoryFlowLines, type StoryChoice, type StoryFlow } from "../story-flow";
import {
  canCreateChoice,
  canAddThirdOption,
  isTeacherPasscodeUnlocked,
  unlockTeacherPasscode,
  verifyTeacherPasscode,
  countChoiceCuts,
} from "../story-flow-auth";

type Props = {
  project: StoryProject;
  line: StoryLine;
  onChange: (flow: StoryFlow | undefined) => void;
  onCreateBranches?: (count: 2 | 3, existingPlacement: ExistingStoryPlacement) => void;
  onOpenLine?: (line: StoryLine) => void;
};

export function StoryFlowEditor({ project, line, onChange, onCreateBranches, onOpenLine }: Props) {
  const [pendingCount, setPendingCount] = useState<2 | 3 | null>(null);
  const [existingPlacement, setExistingPlacement] = useState<ExistingStoryPlacement>("join");
  const [teacherUnlocked, setTeacherUnlocked] = useState(() => isTeacherPasscodeUnlocked());
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
  const [passcodeReason, setPasscodeReason] = useState("");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const lines = orderedStoryFlowLines(project);
  const flow = line.flow;
  const sourceIndex = lines.findIndex(item => item.id === line.id);
  const oldNextId = flow?.type === "goto" ? flow.targetLineId : lines[sourceIndex + 1]?.id;
  const oldNext = lines.find(item => item.id === oldNextId);

  function requestProtectedAction(reason: string, action: () => void) {
    if (teacherUnlocked || isTeacherPasscodeUnlocked()) {
      action();
      return;
    }
    setPasscodeReason(reason);
    setPasscodeInput("");
    setPasscodeError("");
    setPendingAction(() => action);
    setPasscodeModalOpen(true);
  }

  function handlePasscodeSubmit(event?: React.FormEvent) {
    if (event) event.preventDefault();
    if (verifyTeacherPasscode(passcodeInput)) {
      unlockTeacherPasscode();
      setTeacherUnlocked(true);
      setPasscodeModalOpen(false);
      const action = pendingAction;
      setPendingAction(null);
      action?.();
    } else {
      setPasscodeError("승인 코드가 올바르지 않아요. 선생님께 확인해 주세요.");
    }
  }

  function prepareBranches(count: 2 | 3) {
    if (count === 3) {
      const check = canAddThirdOption(flow, teacherUnlocked);
      if (!check.allowed) {
        requestProtectedAction(check.reason || "", () => executePrepareBranches(3));
        return;
      }
    }
    const choiceCheck = canCreateChoice(project, line.id, teacherUnlocked);
    if (!choiceCheck.allowed) {
      requestProtectedAction(choiceCheck.reason || "", () => executePrepareBranches(count));
      return;
    }
    executePrepareBranches(count);
  }

  function executePrepareBranches(count: 2 | 3) {
    if (oldNext) { setExistingPlacement("join"); setPendingCount(count); }
    else onCreateBranches?.(count, "join");
  }

  function handleFlowTypeSelect(newType: string) {
    if (newType === "linear") {
      onChange(undefined);
    } else if (newType === "goto") {
      onChange({ type: "goto", targetLineId: null });
    } else if (newType === "choice") {
      const check = canCreateChoice(project, line.id, teacherUnlocked);
      if (!check.allowed) {
        requestProtectedAction(check.reason || "", () => {
          onChange({ type: "choice", options: [1, 2].map(i => ({ id: `${line.id}-choice-${i}`, label: "", targetLineId: "" })) });
        });
        return;
      }
      onChange({ type: "choice", options: [1, 2].map(i => ({ id: `${line.id}-choice-${i}`, label: "", targetLineId: "" })) });
    }
  }

  function handleAddThirdOption() {
    if (flow?.type !== "choice") return;
    if (flow.options.length === 2) {
      const check = canAddThirdOption(flow, teacherUnlocked);
      if (!check.allowed) {
        requestProtectedAction(check.reason || "", () => {
          onChange({
            ...flow,
            options: [...flow.options, { id: `${line.id}-choice-${crypto.randomUUID()}`, label: "", targetLineId: "" }],
          });
        });
        return;
      }
      onChange({
        ...flow,
        options: [...flow.options, { id: `${line.id}-choice-${crypto.randomUUID()}`, label: "", targetLineId: "" }],
      });
    } else {
      onChange({ ...flow, options: flow.options.slice(0, 2) });
    }
  }

  const issues = findStoryFlowIssues(project).filter(issue => issue.lineId === line.id);
  const label = (target: StoryLine) => {
    const chapter = project.chapters.find(chapter => chapter.id === target.chapterId);
    return `${chapter?.order}장 ${chapter?.title} · ${target.order}컷 — ${target.text.slice(0, 32) || "아직 글이 없어요"}`;
  };
  function targetSelect(value: string | null, onSelect: (id: string | null) => void, name: string) {
    return <label className="field"><span>{name}</span><select aria-label={name} value={value === null ? "end" : value ? `cut:${value}` : ""}
      onChange={event => onSelect(event.target.value === "end" ? null : event.target.value.slice(4))}>
      <option value="">도착 컷을 골라 주세요</option><option value="end">이야기 끝</option>
      {lines.filter(target => target.id !== line.id).map(target => <option key={target.id} value={`cut:${target.id}`}>{label(target)}</option>)}
    </select></label>;
  }
  function changeOption(index: number, patch: Partial<StoryChoice>) {
    if (flow?.type !== "choice") return;
    onChange({ ...flow, options: flow.options.map((option, i) => i === index ? { ...option, ...patch } : option) });
  }

  const otherChoiceCount = countChoiceCuts(project, line.id);

  return <details className="story-flow-editor" key={line.id} open={flow ? true : undefined}>
    <summary>선택지·다음 흐름 {flow?.type === "choice" ? `· ${flow.options.length}갈래` : flow ? "· 연결 있음" : "설정"}</summary>
    <p>이 컷을 읽은 뒤 어디로 갈지 정해요. 여러 갈래에서 같은 컷을 고르면 그곳에서 이야기가 합쳐져요.</p>

    {teacherUnlocked ? (
      <p className="story-flow-auth-status unlocked" style={{ color: "var(--color-success, #16a34a)", fontSize: "13px", fontWeight: 500 }}>
        🔓 선생님 승인 완료: 선택지를 자유롭게 추가하고 확장할 수 있어요.
      </p>
    ) : otherChoiceCount >= 1 && flow?.type !== "choice" ? (
      <p className="story-flow-auth-status locked" style={{ color: "var(--color-text-muted, #6b7280)", fontSize: "13px" }}>
        💡 선택지는 완결을 돕기 위해 이야기당 1번(2개 선택지)으로 권장돼요 (더 추가하려면 승인 코드 필요).
      </p>
    ) : null}

    <label className="field"><span>이 컷 다음에는</span><select aria-label="이 컷 다음에는" value={flow?.type ?? "linear"}
      onChange={event => handleFlowTypeSelect(event.target.value)}>
      <option value="linear">순서대로 다음 컷</option><option value="choice">선택지로 갈라지기</option><option value="goto">다른 컷에 연결 / 이야기 끝</option>
    </select></label>
    {flow?.type !== "choice" && onCreateBranches && <div className="story-flow-actions">
      <button type="button" onClick={() => prepareBranches(2)}>두 갈래 만들기</button>
      <button type="button" onClick={() => prepareBranches(3)}>세 갈래 만들기</button>
      <small>갈래별 장과 ‘다시 만나는 이야기’ 장을 준비해요. 내용은 직접 써 주세요.</small>
    </div>}
    {flow?.type === "choice" && <>
      <div className="story-flow-options">{flow.options.map((option, index) => <fieldset key={option.id}>
        <legend>선택지 {index + 1}</legend>
        <label className="field"><span>선택지 {index + 1} 문구</span><input value={option.label} onChange={event => changeOption(index, { label: event.target.value })} /></label>
        {targetSelect(option.targetLineId, targetLineId => changeOption(index, { targetLineId }), `선택지 ${index + 1} 도착 컷`)}
        {onOpenLine && option.targetLineId && <button type="button" onClick={() => { const target = lines.find(line => line.id === option.targetLineId); if (target) onOpenLine(target); }}>갈래 {index + 1} 쓰러 가기</button>}
      </fieldset>)}</div>
      <button type="button" onClick={handleAddThirdOption}>{flow.options.length === 2 ? "세 번째 선택지 추가" : "세 번째 선택지 제거"}</button>
      <small>선택지를 제거해도 갈래의 장과 글은 보관돼요.</small>
    </>}
    {flow?.type === "goto" && targetSelect(flow.targetLineId, targetLineId => onChange({ ...flow, targetLineId }), "다음 도착 컷")}

    {passcodeModalOpen && <ModalDialog overlayClassName="nolstory-studio-backdrop is-open" dialogClassName="nolstory-studio-modal" label="선생님 승인 코드 입력" onClose={() => setPasscodeModalOpen(false)}>
      <h2>선생님 승인 코드 입력</h2>
      <p>{passcodeReason || "선택지를 더 추가하거나 세 갈래 이상 만들려면 선생님 승인 코드가 필요해요."}</p>
      <div style={{ margin: "14px 0", padding: "12px", background: "var(--color-bg-subtle, #f3f4f6)", borderRadius: "8px", fontSize: "14px", lineHeight: "1.5" }}>
        💡 <strong>이야기 완성 팁</strong>: 선택지가 없어도 하나의 완결된 멋진 이야기를 만들 수 있어요! 선택지가 너무 많아지면 갈래가 복잡해져서 결말을 맺기 어려워져요.
      </div>
      <form onSubmit={handlePasscodeSubmit}>
        <label className="field">
          <span>선생님 승인 코드</span>
          <input
            type="password"
            autoFocus
            placeholder="승인 코드"
            value={passcodeInput}
            onChange={event => {
              setPasscodeInput(event.target.value);
              if (passcodeError) setPasscodeError("");
            }}
          />
        </label>
        {passcodeError && <p className="story-flow-warning" role="alert">{passcodeError}</p>}
        <div className="story-flow-actions" style={{ marginTop: "16px" }}>
          <button type="button" onClick={() => setPasscodeModalOpen(false)}>돌아가기 (한 갈래로 쓰기)</button>
          <button type="submit" style={{ fontWeight: "bold" }}>승인하고 계속하기</button>
        </div>
      </form>
    </ModalDialog>}

    {pendingCount && <ModalDialog overlayClassName="nolstory-studio-backdrop is-open" dialogClassName="nolstory-studio-modal" label="기존 뒷이야기 연결" onClose={() => setPendingCount(null)}>
      <h2>먼저 쓴 뒷이야기를 어디에 연결할까요?</h2>
      <p>기존 글과 컷은 그대로 보관하고 연결만 바꿔요.</p>
      <p>이어질 첫 컷: {oldNext ? label(oldNext) : "없음"}</p>
      <label className="field"><span>기존 뒷이야기 연결</span><select value={String(existingPlacement)} onChange={event => setExistingPlacement(event.target.value === "join" ? "join" : Number(event.target.value) as 0 | 1 | 2)}>
        <option value="join">모든 갈래가 합쳐진 뒤</option>
        {Array.from({length:pendingCount}, (_, index) => <option key={index} value={index}>선택지 {index + 1}의 줄거리로</option>)}
      </select></label>
      <p>{existingPlacement === "join" ? "각 갈래와 합류할 새 장을 준비하고, 합류 다음에 기존 뒷이야기를 이어요." : "고른 선택지는 기존 뒷이야기로 바로 이어져요. 나머지 갈래와 합류할 장은 새로 준비해요. 기존 결말 연결은 유지하며, 나중에 원하는 컷에서 합류하도록 바꿀 수 있어요."}</p>
      <div className="story-flow-actions"><button type="button" onClick={() => setPendingCount(null)}>취소</button><button type="button" onClick={() => { onCreateBranches?.(pendingCount, existingPlacement); setPendingCount(null); }}>연결하고 갈래 만들기</button></div>
    </ModalDialog>}
    {issues.map((issue, index) => <p className="story-flow-warning" role="status" key={index}>{issue.message}</p>)}
  </details>;
}

export function StoryFlowOverview({ project, onOpenLine }: { project: StoryProject; onOpenLine: (line: StoryLine) => void }) {
  const lines = orderedStoryFlowLines(project);
  const connected = lines.filter(line => line.flow);
  if (!connected.length) return null;
  const name = (id: string | null) => {
    if (id === null) return "이야기 끝";
    const line = lines.find(line => line.id === id);
    const chapter = project.chapters.find(chapter => chapter.id === line?.chapterId);
    return line ? `${chapter?.title} · ${line.order}컷` : "도착 컷 미정";
  };
  return <details className="story-flow-overview"><summary>이야기 갈래와 합류 한눈에 보기</summary>
    <p>연결이 없는 컷은 다음 순서로 이어져요. 제목을 누르면 그 컷을 고칠 수 있어요.</p>
    <ol>{connected.map(line => <li key={line.id}><button type="button" onClick={() => onOpenLine(line)}>{name(line.id)}</button>
      <ul>{line.flow?.type === "choice" ? line.flow.options.map(option => <li key={option.id}>{option.label || "문구 미정"} → {name(option.targetLineId)}</li>) : <li>→ {name(line.flow?.type === "goto" ? line.flow.targetLineId : null)}</li>}</ul>
    </li>)}</ol>
  </details>;
}
