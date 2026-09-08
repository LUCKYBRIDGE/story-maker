"use client";

import { countStoryCharacters, STORY_CUT_CHARACTER_LIMIT } from "../story-cut-length";

export function CutLengthGuide({ id, text, onSplit }: {
  id: string;
  text: string;
  onSplit: () => void;
}) {
  const length = countStoryCharacters(text);
  const over = length > STORY_CUT_CHARACTER_LIMIT;
  return (
    <div
      className={`cut-length-guide ${over ? "over-limit" : ""}`}
      id={id}
      title="공백 포함 160자까지 쓸 수 있어요"
    >
      <span>{length} / {STORY_CUT_CHARACTER_LIMIT}자</span>
      {over && (
        <>
          <small>플레이 전에 컷을 나눠 주세요. 글은 잘리지 않고 저장돼요.</small>
          <button type="button" onClick={onSplit}>여러 컷으로 나누기</button>
        </>
      )}
    </div>
  );
}
