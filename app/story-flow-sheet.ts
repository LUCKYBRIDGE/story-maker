import { isStoryFlow, type StoryFlow } from "./story-flow";

export const STORY_FLOW_COLUMNS = ["진행 방식", "다음 도착 컷", ...[1, 2, 3].flatMap(i => [`선택 ${i} ID`, `선택 ${i} 문구`, `선택 ${i} 도착 컷`])];
const encodeTarget = (id: string | null) => id === null ? "끝" : id ? `컷:${id}` : "";
const decodeTarget = (value: string) => value === "끝" ? null : value.startsWith("컷:") ? value.slice(2) : value;

export function storyFlowCells(flow?: StoryFlow): string[] {
  if (!flow) return STORY_FLOW_COLUMNS.map(() => "");
  return [flow.type === "choice" ? "선택" : "연결", flow.type === "goto" ? encodeTarget(flow.targetLineId) : "",
    ...[0, 1, 2].flatMap(i => {
      const option = flow.type === "choice" ? flow.options[i] : undefined;
      return option ? [option.id, option.label, encodeTarget(option.targetLineId)] : ["", "", ""];
    })];
}

export function parseStoryFlowCells(cells: string[], lineId: string): StoryFlow | undefined {
  if (cells.every(cell => !cell.trim())) return undefined;
  const [mode, target] = cells;
  let flow: StoryFlow;
  if (mode === "연결" && cells.slice(2).every(cell => !cell.trim())) {
    flow = { type: "goto", targetLineId: decodeTarget(target.trim()) };
  } else if (mode === "선택" && !target.trim()) {
    const options = [0, 1, 2].map(i => cells.slice(2 + i * 3, 5 + i * 3));
    if (!options[2].some(cell => cell.trim())) options.pop();
    flow = { type: "choice", options: options.map(([id, label, target], index) => ({ id: id.trim() || `${lineId}-choice-${index + 1}`, label, targetLineId: decodeTarget(target.trim()) })) };
  } else throw new Error("진행 방식은 ‘선택’ 또는 ‘연결’로 입력해 주세요. 선택과 다음 도착 컷을 함께 쓰지 않아요.");
  if (!isStoryFlow(flow)) throw new Error("선택지는 2개 또는 3개로 입력하고 선택 ID가 겹치지 않게 해 주세요.");
  return flow;
}
