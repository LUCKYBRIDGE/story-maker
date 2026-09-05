"use client";

import {
  storyRevisionPrompts,
  storyRevisionResponseKey,
  storyRevisionResponseLabel,
  type StoryRevisionResponse,
  type StoryRevisionResponses,
} from "../story-revision-cycle";
import type { StoryProject } from "../story-data";
import {
  getUnlinkedStagesAndChapters,
  mapStageToStructureLabel,
} from "../story-stages";

export interface StoryRevisionCheckProps {
  project: StoryProject;
  responses: StoryRevisionResponses;
  onResponse: (promptId: string, response: StoryRevisionResponse) => void;
  title: string;
  description: string;
  onEdit?: () => void;
}

export function StoryRevisionCheck({
  project,
  responses,
  onResponse,
  title,
  description,
  onEdit,
}: StoryRevisionCheckProps) {
  const prompts = storyRevisionPrompts(project.planning.structureMode);
  const stageAnalysis = getUnlinkedStagesAndChapters(
    project.chapters,
    project.planning.structureMode,
  );

  return (
    <section className="story-revision-check" aria-label="고쳐쓰기 자기 점검">
      <header>
        <div>
          <span className="eyebrow">정답을 고르는 활동이 아니에요</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {onEdit && (
          <button className="primary-button" type="button" onClick={onEdit}>
            편집으로 돌아가 고치기
          </button>
        )}
      </header>
      {stageAnalysis.unlinkedStages.length > 0 && (
        <div className="revision-stage-notice">
          <strong>💡 이야기 단계 점검</strong>
          <p>
            현재 {stageAnalysis.unlinkedStages.map((k) => mapStageToStructureLabel(k, project.planning.structureMode)).join(", ")} 단계가 어느 장에도 연결되지 않았어요. 이야기 구성을 더 명확히 다듬고 싶다면 [구상 &gt; 장의 흐름]에서 단계를 연결해 보세요.
          </p>
        </div>
      )}
      <ol>
        {prompts.map((prompt) => {
          const key = storyRevisionResponseKey({
            projectId: project.id,
            structureMode: project.planning.structureMode,
            promptId: prompt.id,
          });
          const response = responses[key];
          return (
            <li key={prompt.id}>
              <div>
                <strong>{prompt.title}</strong>
                <p>{prompt.question}</p>
              </div>
              <div className="story-revision-actions">
                <span aria-live="polite">
                  {storyRevisionResponseLabel(response)}
                </span>
                <button
                  type="button"
                  className={response === "checked" ? "active" : ""}
                  aria-pressed={response === "checked"}
                  onClick={() => onResponse(prompt.id, "checked")}
                >
                  확인함
                </button>
                <button
                  type="button"
                  className={response === "later" ? "active" : ""}
                  aria-pressed={response === "later"}
                  onClick={() => onResponse(prompt.id, "later")}
                >
                  나중에 볼래요
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
