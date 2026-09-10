/** Provenance travels with the editable project. Absence means an unknown legacy origin. */
export type StorySource =
  | { kind: "blank" }
  | { kind: "baseEdition"; baseStoryId: string; baseEditionId: string }
  | { kind: "publication"; publicationId: string; originalTitle: string; originalAuthorDisplayName: string; originalFingerprint: string }
  | { kind: "sharedFile"; originalTitle: string; originalAuthorDisplayName: string; originalFingerprint: string };

export function isStorySource(value: unknown): value is StorySource {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  const text = (key: string) => typeof v[key] === "string";
  const nonempty = (key: string) => text(key) && (v[key] as string).trim().length > 0;
  if (v.kind === "blank") return true;
  if (v.kind === "baseEdition") return nonempty("baseStoryId") && nonempty("baseEditionId");
  if (v.kind !== "publication" && v.kind !== "sharedFile") return false;
  return (v.kind !== "publication" || nonempty("publicationId")) && text("originalTitle") &&
    text("originalAuthorDisplayName") && nonempty("originalFingerprint");
}
