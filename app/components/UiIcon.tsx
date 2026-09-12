/** Functional icons share one stroke; story ornaments remain screen-specific. */
export function UiIcon({ name }: { name: "hint" | "close" | "back" | "book" }) {
  return <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === "hint" ? <><path d="M9 18h6M10 21h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z" /></>
      : name === "book" ? <path d="M12 5C8 2 4 3 2 4v16c3-2 7-1 10 1 3-2 7-3 10-1V4c-2-1-6-2-10 1Zm0 0v16" />
      : name === "close" ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="m12 5-7 7 7 7M5 12h15" />}
  </svg>;
}
