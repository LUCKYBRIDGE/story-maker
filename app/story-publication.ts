import { lineSpeakerNames } from "./story-speakers";
import { cloneProject, type StoryProject } from "./story-data";
import { orderedStoryFlowLines, storyFlowTargets } from "./story-flow";
import { createNolstoryShared, encodeNolstoryFile, type NolstorySharedFile } from "./story-file";
import type { StorySource } from "./story-source";

// This is an exact reading-content comparison, not similarity or proof of authorship.
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).filter(([,v]) => v !== undefined).sort(([a],[b]) => a < b ? -1 : a > b ? 1 : 0).map(([k,v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
  return JSON.stringify(value);
}
export async function storyFingerprint(project: StoryProject): Promise<string> {
  const lines = orderedStoryFlowLines(project);
  const targets = (index: number) => storyFlowTargets(lines, index).map(id => id === null ? null : lines.findIndex(line => line.id === id));
  const content = {
    title: project.title, description: project.description, cover: project.cover ?? null,
    chapters: [...project.chapters].sort((a,b) => a.order-b.order).map(chapter => ({
      title: chapter.title, backgroundId: chapter.backgroundId, leftAssetId: chapter.leftAssetId, rightAssetId: chapter.rightAssetId,
      lines: lines.flatMap((line,index) => line.chapterId !== chapter.id ? [] : [{
        type: line.type, speaker: line.speaker, speakerNames: lineSpeakerNames(line), text: line.text,
        backgroundId: line.backgroundId, leftAssetId: line.leftAssetId, rightAssetId: line.rightAssetId,
        effect: line.effect ?? null, targets: targets(index),
        choices: line.flow?.type === "choice" ? line.flow.options.map(option => option.label) : null,
      }]),
    })),
  };
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical(content)));
  return `sha256:${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2,"0")).join("")}`;
}
export type SubmissionStatus = "draft" | "pending" | "needs_changes" | "approved" | "rejected";
export type Publication = {
  id: string; createdAt: string; fingerprint: string;
  baseStoryId?: string; schoolId?: string; sourceKind?: StorySource["kind"];
  file: NolstorySharedFile;
};
export type PublicationQuery = {baseStoryId?: string; schoolId?: string; sourceKind?: StorySource["kind"]};
export type Submission = {publicationId: string; status: SubmissionStatus};
function freeze<T>(value: T): T {
  if (value && typeof value === "object") {Object.values(value).forEach(freeze);Object.freeze(value);}
  return value;
}
export async function createPublication(project: StoryProject, options: {id: string; allowRemix: boolean; now?: string; schoolId?: string}): Promise<Publication> {
  if (!options.id.trim()) throw new Error("공유본 ID가 필요해요.");
  const now = options.now ?? new Date().toISOString();
  const file = createNolstoryShared(project, options.allowRemix, now);
  encodeNolstoryFile(file);
  return freeze({id:options.id, createdAt:now, fingerprint:await storyFingerprint(file.story.project),
    ...(project.source?.kind === "baseEdition" ? {baseStoryId:project.source.baseStoryId} : {}),
    ...(options.schoolId ? {schoolId:options.schoolId} : {}),
    ...(project.source ? {sourceKind:project.source.kind} : {}), file});
}
export function queryPublications(items: readonly Publication[], query: PublicationQuery = {}): Publication[] {
  return items.filter(item => (!query.baseStoryId || item.baseStoryId === query.baseStoryId) &&
    (!query.schoolId || item.schoolId === query.schoolId) && (!query.sourceKind || item.sourceKind === query.sourceKind));
}
export function transitionSubmission(submission: Submission, status: SubmissionStatus): Submission {
  const allowed: Record<SubmissionStatus, SubmissionStatus[]> = {draft:["pending"],pending:["needs_changes","approved","rejected"],needs_changes:["pending"],approved:[],rejected:[]};
  if (!allowed[submission.status].includes(status)) throw new Error("허용되지 않는 제출 상태 변경이에요.");
  return {...submission,status};
}
export async function remixSharedFile(file: NolstorySharedFile, id: string, publicationId?: string): Promise<StoryProject> {
  if (!file.sharing.allowRemix) throw new Error("지은이가 고쳐 쓰기를 허용하지 않은 작품이에요.");
  encodeNolstoryFile(file);
  if (!id.trim() || id === file.story.project.id) throw new Error("고쳐 쓸 작품은 새 ID가 필요해요.");
  const project = cloneProject(file.story.project);
  const original = {originalTitle:project.title, originalAuthorDisplayName:file.sharing.authorDisplayName, originalFingerprint:await storyFingerprint(project)};
  project.id = id;
  project.source = publicationId ? {kind:"publication",publicationId,...original} : {kind:"sharedFile",...original};
  project.updatedAt = new Date().toISOString();
  return project;
}
