"use client";

import { useState } from "react";
import { StoryBookPlayback } from "../../components/StoryBookPlayback";
import { SEONNYEO_CLASSIC_READING } from "../../story-classic-seonnyeo";
import type {
  StoryRevisionResponse,
  StoryRevisionResponses,
} from "../../story-revision-cycle";

function returnToLibrary() {
  // A full document navigation does not reliably run React unmount cleanup.
  // Re-enter through the cover so durable reading progress is offered before playback autosaves.
  try {
    for (const key of ["storygame:book-phase:v1", "storygame:reading-path:v1"]) {
      const saved = JSON.parse(sessionStorage.getItem(key) ?? "null");
      if (saved?.projectId === SEONNYEO_CLASSIC_READING.id) sessionStorage.removeItem(key);
    }
  } catch { /* Session storage is optional; durable bookmarks remain untouched. */ }

  const target = window.location.pathname.replace(
    /\/classic\/seonnyeo(?:\.html|\/)?$/,
    "/",
  );
  window.location.assign(target || "/");
}

export default function SeonnyeoClassicReadingPage() {
  const [index, setIndex] = useState(0);
  const [revisionResponses, setRevisionResponses] =
    useState<StoryRevisionResponses>({});

  const respond = (promptId: string, response: StoryRevisionResponse) => {
    setRevisionResponses((current) => ({ ...current, [promptId]: response }));
  };

  return (
    <StoryBookPlayback
      project={SEONNYEO_CLASSIC_READING}
      startIndex={index}
      onIndexChange={setIndex}
      onBack={returnToLibrary}
      returnLabel="서재로 돌아가기"
      isExample
      revisionResponses={revisionResponses}
      onRevisionResponse={respond}
    />
  );
}
