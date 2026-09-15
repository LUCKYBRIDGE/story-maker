"use client";

import { useState } from "react";
import { StoryBookPlayback } from "../../components/StoryBookPlayback";
import { ONGGOJIB_CLASSIC_READING } from "../../story-classic-onggojib";
import type {
  StoryRevisionResponse,
  StoryRevisionResponses,
} from "../../story-revision-cycle";

function returnToLibrary() {
  const target = window.location.pathname.replace(
    /\/classic\/onggojib(?:\.html|\/)?$/,
    "/",
  );
  window.location.assign(target || "/");
}

export default function OnggojibClassicReadingPage() {
  const [index, setIndex] = useState(0);
  const [revisionResponses, setRevisionResponses] =
    useState<StoryRevisionResponses>({});

  const respond = (promptId: string, response: StoryRevisionResponse) => {
    setRevisionResponses((current) => ({ ...current, [promptId]: response }));
  };

  return (
    <StoryBookPlayback
      project={ONGGOJIB_CLASSIC_READING}
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
