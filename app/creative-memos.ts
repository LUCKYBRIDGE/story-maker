export type CreativeMemoKind =
  | "free"
  | "character"
  | "relationship"
  | "place"
  | "event";

export type CreativeMemoFieldSource = "default" | "recommended" | "custom";

export type CreativeMemoField = {
  id: string;
  label: string;
  value: string;
  order: number;
  source: CreativeMemoFieldSource;
};

export type CreativeMemo = {
  id: string;
  kind: CreativeMemoKind;
  title: string;
  linkedChapterId?: string;
  linkedLineId?: string;
  fields: CreativeMemoField[];
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type CreativeMemoTemplate = {
  kind: Exclude<CreativeMemoKind, "free">;
  title: string;
  description: string;
  defaultFields: string[];
  recommendedFields: string[];
};

export const CREATIVE_MEMO_TEMPLATES: CreativeMemoTemplate[] = [
  {
    kind: "character",
    title: "인물 알아보기",
    description: "한 인물이 바라는 것과 달라지는 점을 생각해요.",
    defaultFields: ["인물 이름", "이야기에서 맡은 역할", "이 인물이 바라는 것"],
    recommendedFields: [
      "성격",
      "잘하는 것",
      "어려워하는 것",
      "두려워하는 것",
      "과거의 중요한 일",
      "다른 인물과의 관계",
      "말버릇",
      "숨기고 있는 것",
      "마지막에 달라지는 점",
    ],
  },
  {
    kind: "relationship",
    title: "인물 관계",
    description: "두 인물이 서로에게 어떤 마음인지 살펴봐요.",
    defaultFields: ["첫 번째 인물", "두 번째 인물", "지금 두 인물의 관계"],
    recommendedFields: [
      "서로에게 바라는 것",
      "갈등하는 까닭",
      "오해하고 있는 것",
      "함께 겪은 중요한 일",
      "관계가 달라지는 계기",
      "마지막 관계",
    ],
  },
  {
    kind: "place",
    title: "장소·세계",
    description: "이야기가 펼쳐질 곳의 느낌과 규칙을 정해요.",
    defaultFields: ["장소 이름", "장소의 분위기", "이곳에서 일어날 일"],
    recommendedFields: [
      "시간",
      "날씨",
      "이 세계의 규칙",
      "중요한 물건",
      "위험한 요소",
      "인물에게 특별한 까닭",
      "소리·냄새·빛",
      "이전 장소와 다른 점",
    ],
  },
  {
    kind: "event",
    title: "사건·갈등",
    description: "사건을 움직이는 바람과 방해를 연결해요.",
    defaultFields: ["무슨 일이 생기는가", "누가 무엇을 원하는가", "무엇이 방해하는가"],
    recommendedFields: [
      "인물이 할 수 있는 선택",
      "가장 큰 위험",
      "뜻밖의 변화",
      "사건의 결과",
      "다음 사건으로 이어지는 일",
    ],
  },
];

const KIND_LABELS: Record<CreativeMemoKind, string> = {
  free: "자유 메모",
  character: "인물",
  relationship: "관계",
  place: "장소·세계",
  event: "사건·갈등",
};

const SOURCE_LABELS: Record<CreativeMemoFieldSource, string> = {
  default: "기본",
  recommended: "추천",
  custom: "직접 추가",
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createCreativeMemoField(
  label: string,
  source: CreativeMemoFieldSource,
  order: number,
): CreativeMemoField {
  return {
    id: makeId("memo-field"),
    label,
    value: "",
    order,
    source,
  };
}

function isMemoKind(value: unknown): value is CreativeMemoKind {
  return ["free", "character", "relationship", "place", "event"].includes(
    String(value),
  );
}

function isFieldSource(value: unknown): value is CreativeMemoFieldSource {
  return ["default", "recommended", "custom"].includes(String(value));
}

export function creativeMemoKindLabel(kind: CreativeMemoKind) {
  return KIND_LABELS[kind];
}

export function creativeMemoKindFromLabel(value: string): CreativeMemoKind {
  const normalized = value.trim();
  const matched = (Object.entries(KIND_LABELS) as Array<
    [CreativeMemoKind, string]
  >).find(([, label]) => label === normalized);
  if (matched) return matched[0];
  if (["자유", "free"].includes(normalized.toLowerCase())) return "free";
  if (["인물 알아보기", "character"].includes(normalized.toLowerCase())) {
    return "character";
  }
  if (["인물 관계", "relationship"].includes(normalized.toLowerCase())) {
    return "relationship";
  }
  if (["장소", "place"].includes(normalized.toLowerCase())) return "place";
  if (["사건", "event"].includes(normalized.toLowerCase())) return "event";
  return "free";
}

export function creativeMemoSourceLabel(source: CreativeMemoFieldSource) {
  return SOURCE_LABELS[source];
}

export function creativeMemoSourceFromLabel(
  value: string,
): CreativeMemoFieldSource {
  const normalized = value.trim();
  const matched = (Object.entries(SOURCE_LABELS) as Array<
    [CreativeMemoFieldSource, string]
  >).find(([, label]) => label === normalized);
  if (matched) return matched[0];
  if (normalized.toLowerCase() === "recommended") return "recommended";
  if (normalized.toLowerCase() === "custom") return "custom";
  return "default";
}

export function createCreativeMemo(
  kind: CreativeMemoKind,
  order: number,
): CreativeMemo {
  const now = new Date().toISOString();
  const labels =
    kind === "free"
      ? ["내용"]
      : CREATIVE_MEMO_TEMPLATES.find((template) => template.kind === kind)
          ?.defaultFields ?? [];
  return {
    id: makeId("memo"),
    kind,
    title: "",
    fields: labels.map((label, index) =>
      createCreativeMemoField(label, "default", index + 1),
    ),
    order,
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeCreativeMemos(value: unknown): CreativeMemo[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((memo): memo is Record<string, unknown> => Boolean(memo && typeof memo === "object"))
    .map((memo, memoIndex) => {
      const kind = isMemoKind(memo.kind) ? memo.kind : "free";
      const createdAt =
        typeof memo.createdAt === "string" && memo.createdAt
          ? memo.createdAt
          : new Date(0).toISOString();
      const rawFields = Array.isArray(memo.fields) ? memo.fields : [];
      const fields = rawFields
        .filter(
          (field): field is Record<string, unknown> =>
            Boolean(field && typeof field === "object"),
        )
        .map((field, fieldIndex) => ({
          id:
            typeof field.id === "string" && field.id
              ? field.id
              : `${String(memo.id || `memo-${memoIndex + 1}`)}-field-${fieldIndex + 1}`,
          label: typeof field.label === "string" ? field.label : "항목",
          value: typeof field.value === "string" ? field.value : "",
          order:
            typeof field.order === "number" && Number.isFinite(field.order)
              ? field.order
              : fieldIndex + 1,
          source: isFieldSource(field.source) ? field.source : "custom",
        }))
        .sort((a, b) => a.order - b.order)
        .map((field, index) => ({ ...field, order: index + 1 }));
      return {
        id:
          typeof memo.id === "string" && memo.id
            ? memo.id
            : `memo-${memoIndex + 1}`,
        kind,
        title: typeof memo.title === "string" ? memo.title : "",
        linkedChapterId:
          typeof memo.linkedChapterId === "string"
            ? memo.linkedChapterId
            : undefined,
        linkedLineId:
          typeof memo.linkedLineId === "string" ? memo.linkedLineId : undefined,
        fields,
        order:
          typeof memo.order === "number" && Number.isFinite(memo.order)
            ? memo.order
            : memoIndex + 1,
        createdAt,
        updatedAt:
          typeof memo.updatedAt === "string" && memo.updatedAt
            ? memo.updatedAt
            : createdAt,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((memo, index) => ({ ...memo, order: index + 1 }));
}

export function creativeMemoDisplayTitle(memo: CreativeMemo) {
  const target = memo.fields.find((field) => field.value.trim())?.value.trim();
  return memo.title.trim() || target || `${creativeMemoKindLabel(memo.kind)} 메모`;
}

export function creativeMemoExcerpt(memo: CreativeMemo) {
  return (
    memo.fields
      .map((field) => field.value.trim())
      .filter(Boolean)
      .join(" · ") || "아직 쓴 내용이 없어요."
  );
}
