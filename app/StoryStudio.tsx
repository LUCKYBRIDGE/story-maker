"use client";

import {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ModalDialog } from "./components/ModalDialog";
import {
  StudioApplyDock,
  StudioPrimaryNav,
  StudioShell,
  type StudioWorkspaceMode,
} from "./components/StudioShell";
import { StartScreen, type EntryLocalDraftStatus } from "./components/StartScreen";
import { StoryEntryDialog } from "./components/StoryEntryDialog";
import {
  StoryPlanScreen,
  STORY_STRUCTURE_OPTIONS,
  chapterArcLabel,
} from "./components/StoryPlanScreen";
import {
  canonicalizeStoryStageKeys,
  formatStoryStageLabels,
} from "./story-stages";
import { ScriptScreen } from "./components/ScriptScreen";
import { unique } from "./components/SceneThumbnail";
import { CreativeMemoEditor } from "./components/CreativeMemoEditor";
import { SceneFocusEditor, ImageField } from "./components/SceneFocusEditor";
import { StoryPlayer } from "./components/StoryPlayer";
import {
  ImportIssuesDialog,
  ImportConfirmationDialog,
} from "./components/ImportPreviewDialog";
import {
  MemoPopup,
  memoResultScope,
  type MemoSection,
  type MemoScope,
  type MemoWindowSize,
  type MemoSearchResult,
} from "./components/MemoPopup";
import { AddSpeaker, ResourcePool, assetName } from "./components/ResourceWidgets";
import { STORY_ASSETS, type StoryAsset } from "./story-assets";
import {
  cloneProject,
  createBlankProject,
  DEFAULT_PROJECT,
  ONGGOJIB_CONTINUATION_TEMPLATE,
  RABBIT_TURTLE_CONTINUATION_TEMPLATE,
  RABBIT_TURTLE_CONTINUATION_TEMPLATE_2,
  type Chapter,
  type StoryLine,
  type StoryProject,
} from "./story-data";
import {
  extractSheetId,
  fetchSheetSnapshot,
  importStoryProject,
} from "./story-sheet";
import {
  StoryImportError,
  type StoryImportIssue,
  type StoryImportSource,
} from "./story-import";
import {
  createCreativeMemo,
  createCreativeMemoField,
  creativeMemoDisplayTitle,
  creativeMemoKindLabel,
  type CreativeMemo,
  type CreativeMemoFieldSource,
  type CreativeMemoKind,
} from "./creative-memos";
import {
  creativeMemoChapterTargets,
  creativeMemoLineTargets,
  resolveCreativeMemoLink,
  resolveCreativeMemoReturnLocation,
  setCreativeMemoChapterLink,
  setCreativeMemoLineLink,
} from "./creative-memo-commands";
import {
  createLocalStoryProjectRepository,
  createStoryProjectSaveQueue,
  type StoryProjectRepository,
  type StoryProjectSaveQueue,
  type StoryProjectSaveResult,
  type StoryProjectSaveStatus,
} from "./story-project-repository";
import {
  createStoryProjectCheckpointRepository,
  type StoryCheckpointReason,
  type StoryProjectCheckpoint,
  type StoryProjectCheckpointRepository,
} from "./story-project-checkpoints";
import {
  createStoryLine,
  deleteStoryLine,
  duplicateStoryLine,
  moveStoryLine,
  moveStoryChapter,
  type StoryLineCommandFailureCode,
} from "./story-commands";
import {
  clampStoryEditorTextSelection,
  newStoryEditorLineLocation,
  resolveStoryEditorLocation,
  resolvePlayedCutLocation,
  type PlayedStoryCut,
  transitionStoryEditorView,
  type StoryEditorLocation,
  type StoryEditorTextSelection,
  type StoryEditorView,
} from "./story-editor-location";
import {
  findStoryApplyIssues,
  getStoryApplyIssueNavigation,
  type StoryApplyIssue,
} from "./story-apply-issues";
import {
  normalizeStoryRevisionResponses,
  setStoryRevisionResponse,
  storyRevisionResponseKey,
  type StoryRevisionResponse,
  type StoryRevisionResponses,
} from "./story-revision-cycle";
import {
  createStoryPlaybackContext,
  INITIAL_STORY_STUDIO_PLAYER_STATE,
  storyStudioPlayerReducer,
} from "./story-studio-player-state";
import {
  findFirstStoryLineIndexForChapter,
  resolveActiveProjectForDraft,
  selectStoryEditorSelection,
  selectStoryPlayerPosition,
} from "./story-studio-selectors";
import {
  loadStudioUiSession,
  resolveStudioUiSession,
  saveStudioUiSession,
  type StudioUiSession,
} from "./story-studio-ui-session";

type WorkspaceMode = StudioWorkspaceMode;
type PlanningView = "story" | "chapters";
type EditorMode = "chapter" | "scene";
type ImageView = "text" | "small";
type UpdateMode = "sheet" | "draft" | "excel";
type CreatorAccess = "none" | "local";
type StoryEditorRestoreRequest = {
  location: StoryEditorLocation;
  scrollY?: number;
  selection?: StoryEditorTextSelection;
};
type StudioReturnOrigin = {
  focusButtonLabel?: string;
  session: StudioUiSession;
  fromHome: boolean;
  scrollY: number;
  selection?: StoryEditorTextSelection;
};
type MemoReturnOrigin = {
  workspaceMode: WorkspaceMode;
  planningView: PlanningView;
  location: StoryEditorLocation;
  scrollY?: number;
};

const BACKUP_KEY = "storygame:backup:v1";
const FAVORITES_KEY = "storygame:asset-favorites:v1";
const RECENTS_KEY = "storygame:asset-recents:v1";
const REVISION_RESPONSES_KEY = "storygame:revision-responses:v1";

function projectContent(project: StoryProject) {
  return JSON.stringify({ ...project, updatedAt: "" });
}

function findContinuationPoint(
  project: StoryProject,
): NonNullable<StoryProject["continuation"]> | null {
  if (
    project.continuation &&
    project.chapters.some(
      (chapter) => chapter.id === project.continuation?.chapterId,
    ) &&
    project.lines.some((line) => line.id === project.continuation?.lineId)
  ) {
    return project.continuation;
  }

  const continuationChapter = project.chapters
    .slice()
    .sort((a, b) => a.order - b.order)
    .find((chapter) => chapter.title.includes("이어 쓰기"));
  const continuationLine = project.lines
    .filter((line) => line.chapterId === continuationChapter?.id)
    .sort((a, b) => a.order - b.order)[0];

  return continuationChapter && continuationLine
    ? {
        chapterId: continuationChapter.id,
        lineId: continuationLine.id,
        label: continuationChapter.summary || "이어서 쓸 첫 컷",
      }
    : null;
}

export function StoryStudio() {
  const [draft, setDraft] = useState<StoryProject>(() =>
    cloneProject(DEFAULT_PROJECT),
  );
  const [active, setActive] = useState<StoryProject>(() =>
    cloneProject(DEFAULT_PROJECT),
  );
  const [creatorAccess, setCreatorAccess] = useState<CreatorAccess>("none");
  const [playerUi, dispatchPlayerUi] = useReducer(
    storyStudioPlayerReducer,
    INITIAL_STORY_STUDIO_PLAYER_STATE,
  );
  const { view, playIndex } = playerUi;
  const [workspaceMode, setWorkspaceMode] =
    useState<WorkspaceMode>("create");
  const [planningView, setPlanningView] =
    useState<PlanningView>("story");
  const [editorMode, setEditorMode] = useState<EditorMode>("chapter");
  const [imageView, setImageView] = useState<ImageView>("text");
  const [selectedChapterId, setSelectedChapterId] = useState(
    DEFAULT_PROJECT.chapters[0].id,
  );
  const [selectedLineId, setSelectedLineId] = useState(
    DEFAULT_PROJECT.lines[0].id,
  );
  const [projectToolsOpen, setProjectToolsOpen] = useState(false);
  const [mobileProjectOpen, setMobileProjectOpen] = useState(false);
  const [mobileEditorToolsOpen, setMobileEditorToolsOpen] = useState(false);
  const [memoPopupOpen, setMemoPopupOpen] = useState(false);
  const [memoWindowSize, setMemoWindowSize] =
    useState<MemoWindowSize>("compact");
  const [memoSearch, setMemoSearch] = useState("");
  const [memoScope, setMemoScope] = useState<MemoScope>("all");
  const [creativeMemoCreatorStep, setCreativeMemoCreatorStep] = useState<
    "choice" | "template" | null
  >(null);
  const [selectedCreativeMemoId, setSelectedCreativeMemoId] = useState<
    string | null
  >(null);
  const [memoSectionsOpen, setMemoSectionsOpen] = useState<
    Record<MemoSection, boolean>
  >({
    story: true,
    structure: false,
    details: false,
    creative: true,
    chapter: true,
    scene: true,
  });
  const [chapterResourcesOpen, setChapterResourcesOpen] = useState(false);
  const [sceneSettingsOpen, setSceneSettingsOpen] = useState(false);
  const [favoriteAssets, setFavoriteAssets] = useState<string[]>([]);
  const [recentAssets, setRecentAssets] = useState<string[]>([]);
  const [notice, setNotice] = useState(
    "예시 이야기가 준비되어 있어요. 대사를 고쳐 새 이야기를 만들어 보세요.",
  );
  const [busy, setBusy] = useState<UpdateMode | null>(null);
  const [busyStep, setBusyStep] = useState("");
  const [blankConfirmOpen, setBlankConfirmOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [localDraftStatus, setLocalDraftStatus] = useState<EntryLocalDraftStatus>("checking");
  const [entryChoiceLabel, setEntryChoiceLabel] = useState("");
  const entryChoiceRef = useRef<(() => void) | null>(null);
  const [backupFound, setBackupFound] = useState(false);
  const [entryBusy, setEntryBusy] = useState(false);
  const [entryNotice, setEntryNotice] = useState("");
  const [saveStatus, setSaveStatus] =
    useState<StoryProjectSaveStatus>("idle");
  const [checkpoints, setCheckpoints] = useState<StoryProjectCheckpoint[]>([]);
  const [undoDelete, setUndoDelete] = useState<{
    project: StoryProject;
    description: string;
    location: StoryEditorLocation;
  } | null>(null);
  const [editorRestoreRequest, setEditorRestoreRequest] =
    useState<StoryEditorRestoreRequest | null>(null);
  const [applyIssuesVisible, setApplyIssuesVisible] = useState(false);
  const [highlightedApplyIssueId, setHighlightedApplyIssueId] = useState("");
  const [applyIssueFocusRequest, setApplyIssueFocusRequest] =
    useState<StoryApplyIssue | null>(null);
  const [importIssues, setImportIssues] = useState<{
    open: boolean;
    issues: StoryImportIssue[];
    source?: StoryImportSource;
  }>({ open: false, issues: [], source: "excel" });
  const [importConfirmation, setImportConfirmation] = useState<{
    open: boolean;
    project: StoryProject | null;
    fileName?: string;
  }>({ open: false, project: null, fileName: "" });
  const [revisionResponses, setRevisionResponses] =
    useState<StoryRevisionResponses>({});
  const updateController = useRef<AbortController | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);
  const projectRepositoryRef = useRef<StoryProjectRepository | null>(null);
  const checkpointRepositoryRef =
    useRef<StoryProjectCheckpointRepository | null>(null);
  const saveQueueRef = useRef<StoryProjectSaveQueue | null>(null);
  const chapterViewportRef = useRef<{
    chapterId: string;
    lineId: string;
    scrollY: number;
    selection?: StoryEditorTextSelection;
  } | null>(null);
  const sceneCardRefs = useRef(new Map<string, HTMLElement>());
  const lineBodyRefs = useRef(new Map<string, HTMLTextAreaElement>());
  const speakerNameRefs = useRef(new Map<string, HTMLSelectElement>());
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const applyIssueHighlightTimerRef = useRef<number | null>(null);
  const memoReturnOriginRef = useRef<MemoReturnOrigin | null>(null);
  const playerReturnLocationRef = useRef<StudioReturnOrigin | null>(null);
  const homeReturnOriginRef = useRef<StudioReturnOrigin | null>(null);
  const mountedRef = useRef(false);

  function projectRepository() {
    if (!projectRepositoryRef.current) {
      projectRepositoryRef.current = createLocalStoryProjectRepository({
        storage: {
          getItem: (key) => window.localStorage.getItem(key),
          setItem: (key, value) => window.localStorage.setItem(key, value),
        },
      });
    }
    return projectRepositoryRef.current;
  }

  function saveActiveProject(project: StoryProject): StoryProjectSaveResult {
    return projectRepository().saveActive(project);
  }

  function checkpointRepository() {
    if (!checkpointRepositoryRef.current) {
      checkpointRepositoryRef.current = createStoryProjectCheckpointRepository({
        storage: {
          getItem: (key) => window.localStorage.getItem(key),
          setItem: (key, value) => window.localStorage.setItem(key, value),
        },
      });
    }
    return checkpointRepositoryRef.current;
  }

  useEffect(() => {
    mountedRef.current = true;
    const flushPendingSave = () => saveQueueRef.current?.flush();
    window.addEventListener("pagehide", flushPendingSave);
    return () => {
      mountedRef.current = false;
      window.removeEventListener("pagehide", flushPendingSave);
      flushPendingSave();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (applyIssueHighlightTimerRef.current !== null) {
        window.clearTimeout(applyIssueHighlightTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const repository = projectRepository();
        const savedCheckpoints = checkpointRepository().list();
        const savedDraft = repository.loadDraft();
        const savedActive = repository.loadActive();
        if (savedCheckpoints.ok) {
          setCheckpoints(savedCheckpoints.checkpoints);
        } else {
          setNotice(savedCheckpoints.message);
        }
        const savedDraftProject = savedDraft.ok && savedDraft.project
          ? cloneProject(savedDraft.project)
          : null;
        const savedActiveProject = savedActive.ok && savedActive.project
          ? cloneProject(savedActive.project)
          : null;
        if (savedDraftProject) {
          setDraft(savedDraftProject);
          setLocalDraftStatus("available");
          const session = resolveStudioUiSession(
            savedDraftProject, loadStudioUiSession(() => window.localStorage),
          );
          setWorkspaceMode(session.workspaceMode);
          setPlanningView(session.planningView);
          setSelectedChapterId(session.location.chapterId);
          setSelectedLineId(session.location.lineId);
          setEditorMode(session.location.view);
          if (
            savedDraft.ok &&
            savedDraft.project &&
            savedDraft.migrationError
          ) {
            setNotice(savedDraft.migrationError);
          }
        } else if (!savedDraft.ok) {
          setNotice(savedDraft.message);
          setEntryNotice(savedDraft.message);
          setLocalDraftStatus("failed");
        } else {
          setLocalDraftStatus("missing");
        }
        if (savedDraftProject) {
          const activeResolution = resolveActiveProjectForDraft({
            draft: savedDraftProject,
            active: savedActiveProject,
          });
          setActive(activeResolution.project);
          if (activeResolution.usedFallback) {
            const activeSave = repository.saveActive(activeResolution.project);
            if (savedActiveProject || !activeSave.ok) {
              setNotice(
                activeSave.ok
                  ? "다른 작품의 플레이 버전은 열지 않았어요. 이 작품을 적용한 뒤 플레이하세요."
                  : activeSave.message,
              );
            }
          }
        } else if (savedActiveProject) {
          setActive(savedActiveProject);
          if (
            savedActive.ok &&
            savedActive.project &&
            savedActive.migrationError
          ) {
            setNotice(savedActive.migrationError);
          }
        } else if (!savedActive.ok) {
          setNotice(savedActive.message);
        }
        setBackupFound(Boolean(localStorage.getItem(BACKUP_KEY)));
        setFavoriteAssets(
          JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]") as string[],
        );
        setRecentAssets(
          JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]") as string[],
        );
        setRevisionResponses(
          normalizeStoryRevisionResponses(
            JSON.parse(localStorage.getItem(REVISION_RESPONSES_KEY) ?? "{}"),
          ),
        );
      } catch {
        setNotice("이 기기의 이전 저장을 읽지 못해 예시 이야기로 시작했어요.");
        setEntryNotice("이 기기의 저장을 읽지 못했어요. 원본은 자동으로 덮어쓰지 않았어요.");
        setLocalDraftStatus("failed");
      } finally {
        setHydrated(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated || creatorAccess !== "local") return;
    if (!saveQueueRef.current) {
      saveQueueRef.current = createStoryProjectSaveQueue({
        repository: projectRepository(),
        onStatusChange: (status) => {
          if (!mountedRef.current) return;
          setSaveStatus(status);
          if (status === "failed") {
            setNotice(
              "기기에 저장하지 못했어요. Excel로 저장해 작품을 보관해 주세요.",
            );
          }
        },
      });
    }
    saveQueueRef.current.schedule(draft);
  }, [draft, hydrated, creatorAccess]);

  useEffect(() => {
    if (!hydrated || creatorAccess !== "local" || view !== "studio") return;
    saveStudioUiSession(() => window.localStorage, resolveStudioUiSession(draft, {
      version: 1, projectId: draft.id, workspaceMode, planningView,
      location: { chapterId: selectedChapterId, lineId: selectedLineId, view: editorMode, focusTarget: "none" },
    }));
  }, [draft, hydrated, creatorAccess, view, workspaceMode, planningView, selectedChapterId, selectedLineId, editorMode]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteAssets));
    } catch { /* Optional preferences must not block opening a story. */ }
  }, [favoriteAssets, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(recentAssets));
    } catch { /* Optional preferences must not block opening a story. */ }
  }, [recentAssets, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        REVISION_RESPONSES_KEY,
        JSON.stringify(revisionResponses),
      );
    } catch {}
  }, [hydrated, revisionResponses]);

  useEffect(() => {
    if (!memoPopupOpen) return;
    function closeMemoPopup(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMemoPopupOpen(false);
        setMemoSearch("");
        const origin = memoReturnOriginRef.current;
        memoReturnOriginRef.current = null;
        if (!origin) return;
        const resolved = resolveCreativeMemoReturnLocation({
          chapters: draft.chapters,
          lines: draft.lines,
          location: origin.location,
        });
        setWorkspaceMode(origin.workspaceMode);
        setPlanningView(origin.planningView);
        setSelectedChapterId(resolved.location.chapterId);
        setSelectedLineId(resolved.location.lineId);
        setEditorMode(resolved.location.view);
        if (origin.workspaceMode === "create") {
          setEditorRestoreRequest({
            location: resolved.location,
            scrollY: resolved.usedFallback ? undefined : origin.scrollY,
          });
        }
        setNotice(
          resolved.usedFallback
            ? "기록하던 컷이 바뀌어 가장 가까운 곳으로 돌아왔어요."
            : "메모를 닫고 기록하던 컷으로 돌아왔어요.",
        );
      }
    }
    window.addEventListener("keydown", closeMemoPopup);
    return () => window.removeEventListener("keydown", closeMemoPopup);
  }, [draft.chapters, draft.lines, memoPopupOpen]);

  useEffect(() => {
    if (!selectedCreativeMemoId) return;
    function closeCreativeMemoEditor(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedCreativeMemoId(null);
    }
    window.addEventListener("keydown", closeCreativeMemoEditor);
    return () => window.removeEventListener("keydown", closeCreativeMemoEditor);
  }, [selectedCreativeMemoId]);

  const {
    orderedDraftLines,
    selectedChapter,
    selectedChapterLines,
    selectedLine,
    selectedLineIndex,
    selectedStoryLineIndex,
    sortedChapters,
  } = selectStoryEditorSelection({
    project: draft,
    selectedChapterId,
    selectedLineId,
  });
  useEffect(() => {
    if (!editorRestoreRequest) return;
    const request = editorRestoreRequest;
    const frame = window.requestAnimationFrame(() => {
      const lineBody = lineBodyRefs.current.get(request.location.lineId);
      const sceneCard = sceneCardRefs.current.get(request.location.lineId);
      const target = lineBody ?? sceneCard;
      if (request.scrollY !== undefined) {
        window.scrollTo({ top: request.scrollY, behavior: "auto" });
      } else {
        target?.scrollIntoView({ block: "center", behavior: "auto" });
      }
      if (request.location.focusTarget === "line-body" && lineBody) {
        lineBody.focus({ preventScroll: true });
        const selection = clampStoryEditorTextSelection(
          request.selection,
          lineBody.value.length,
        );
        if (selection) {
          lineBody.setSelectionRange(selection.start, selection.end);
        }
      }
      setEditorRestoreRequest(null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [editorRestoreRequest]);
  useEffect(() => {
    if (!applyIssueFocusRequest) return;
    const issue = applyIssueFocusRequest;
    let secondFrame: number | null = null;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const target =
          issue.field === "title"
            ? titleInputRef.current
            : issue.lineId
              ? speakerNameRefs.current.get(issue.lineId)
              : undefined;
        target?.scrollIntoView({ block: "center", behavior: "auto" });
        target?.focus({ preventScroll: true });
        setApplyIssueFocusRequest(null);
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== null) window.cancelAnimationFrame(secondFrame);
    };
  }, [applyIssueFocusRequest, editorMode, planningView, selectedLineId, workspaceMode]);
  const applyIssues = useMemo(() => findStoryApplyIssues(draft), [draft]);
  const highlightedApplyIssue = applyIssues.find(
    (issue) => issue.id === highlightedApplyIssueId,
  );
  const hasUnappliedChanges = useMemo(
    () => projectContent(draft) !== projectContent(active),
    [active, draft],
  );

  const orderedCreativeMemos = draft.creativeMemos
    .slice()
    .sort((a, b) => a.order - b.order);
  const selectedCreativeMemo = orderedCreativeMemos.find(
    (memo) => memo.id === selectedCreativeMemoId,
  );
  const creativeMemoLinkChapters = creativeMemoChapterTargets(draft.chapters);
  const selectedCreativeMemoLineTargets = selectedCreativeMemo
    ? creativeMemoLineTargets({
        chapters: draft.chapters,
        lines: draft.lines,
        chapterId: selectedCreativeMemo.linkedChapterId ?? "",
      })
    : [];
  const selectedCreativeMemoLinkResolution = selectedCreativeMemo
    ? resolveCreativeMemoLink({
        memo: selectedCreativeMemo,
        chapters: draft.chapters,
        lines: draft.lines,
      })
    : null;
  const continuationPoint = findContinuationPoint(draft);
  const isAtContinuationPoint =
    continuationPoint?.chapterId === selectedChapter?.id &&
    continuationPoint?.lineId === selectedLine?.id;
  const selectedStructure =
    STORY_STRUCTURE_OPTIONS.find(
      (option) => option.mode === draft.planning.structureMode,
    ) ?? STORY_STRUCTURE_OPTIONS[0];
  const filledMemoCount = [
    draft.planning.premise,
    draft.planning.material,
    draft.planning.theme,
    draft.planning.mainCharacter,
    draft.planning.mainGoal,
    draft.planning.centralProblem,
    draft.planning.stakes,
    draft.planning.endingChange,
    draft.planning.characterNotes,
    draft.planning.worldNotes,
    draft.planning.mood,
    draft.planning.openQuestions,
    draft.planning.freeNotes,
    ...selectedStructure.steps.map((step) => draft.planning[step.key]),
    ...draft.chapters.flatMap((chapter) => [
      chapter.summary,
      chapter.purpose,
      chapter.mood,
      chapter.keyEvents,
      chapter.nextChapterIdea,
    ]),
    ...draft.lines.flatMap((line) => [
      line.purposeNote,
      line.emotionNote,
      line.directionNote,
    ]),
    ...draft.creativeMemos.flatMap((memo) => [
      memo.title,
      ...memo.fields.map((field) => field.value),
    ]),
  ].filter((value) => value?.trim()).length;
  const memoSearchResults: MemoSearchResult[] = [
    {
      id: "story-premise",
      section: "story",
      label: "한 줄 이야기",
      context: "전체 이야기",
      content: draft.planning.premise,
      fieldId: "memo-field-story-premise",
    },
    {
      id: "story-material",
      section: "story",
      label: "이야기 소재",
      context: "전체 이야기",
      content: draft.planning.material,
      fieldId: "memo-field-story-material",
    },
    {
      id: "story-theme",
      section: "story",
      label: "이야기 주제",
      context: "전체 이야기",
      content: draft.planning.theme,
      fieldId: "memo-field-story-theme",
    },
    {
      id: "story-main-character",
      section: "story",
      label: "핵심 인물",
      context: "전체 이야기",
      content: draft.planning.mainCharacter,
      fieldId: "memo-field-story-main-character",
    },
    {
      id: "story-main-goal",
      section: "story",
      label: "주인공이 바라는 것",
      context: "전체 이야기",
      content: draft.planning.mainGoal,
      fieldId: "memo-field-story-main-goal",
    },
    {
      id: "story-central-problem",
      section: "story",
      label: "주요 갈등",
      context: "전체 이야기",
      content: draft.planning.centralProblem,
      fieldId: "memo-field-story-central-problem",
    },
    {
      id: "story-stakes",
      section: "story",
      label: "실패하면 생기는 일",
      context: "전체 이야기",
      content: draft.planning.stakes,
      fieldId: "memo-field-story-stakes",
    },
    {
      id: "story-ending-change",
      section: "story",
      label: "마지막에 달라지는 점",
      context: "전체 이야기",
      content: draft.planning.endingChange,
      fieldId: "memo-field-story-ending-change",
    },
    ...selectedStructure.steps.map(
      (step): MemoSearchResult => ({
        id: `structure-${step.key}`,
        section: "structure",
        label: step.label,
        context: selectedStructure.title,
        content: draft.planning[step.key],
        fieldId: `memo-field-structure-${step.key}`,
      }),
    ),
    {
      id: "details-characters",
      section: "details",
      label: "인물 설정",
      context: "인물·배경·추가 메모",
      content: draft.planning.characterNotes,
      fieldId: "memo-field-details-characters",
    },
    {
      id: "details-world",
      section: "details",
      label: "배경·세계 설정",
      context: "인물·배경·추가 메모",
      content: draft.planning.worldNotes,
      fieldId: "memo-field-details-world",
    },
    {
      id: "details-mood",
      section: "details",
      label: "전체 분위기",
      context: "인물·배경·추가 메모",
      content: draft.planning.mood,
      fieldId: "memo-field-details-mood",
    },
    {
      id: "details-questions",
      section: "details",
      label: "아직 정하지 못한 것",
      context: "인물·배경·추가 메모",
      content: draft.planning.openQuestions,
      fieldId: "memo-field-details-questions",
    },
    {
      id: "details-free",
      section: "details",
      label: "자유 창작 메모",
      context: "인물·배경·추가 메모",
      content: draft.planning.freeNotes,
      fieldId: "memo-field-details-free",
    },
    ...orderedCreativeMemos.flatMap((memo) => {
      const fields =
        memo.fields.length > 0
          ? memo.fields
          : [
              {
                id: "title",
                label: "메모 제목",
                value: memo.title,
              },
            ];
      return fields.map(
        (field): MemoSearchResult => ({
          id: `creative-${memo.id}-${field.id}`,
          section: "creative",
          scope: memo.kind,
          label: field.label || "이름 없는 항목",
          context: `${creativeMemoKindLabel(memo.kind)} · ${creativeMemoDisplayTitle(memo)}`,
          content: field.value,
          fieldId: `creative-memo-field-${memo.id}-${field.id}`,
          memoId: memo.id,
        }),
      );
    }),
    ...sortedChapters.flatMap((chapter) =>
      [
        ["summary", "이번 장에서 달라지는 일", chapter.summary],
        ["purpose", "이 장의 역할", chapter.purpose],
        ["mood", "분위기·감정 흐름", chapter.mood],
        ["keyEvents", "꼭 들어갈 사건", chapter.keyEvents],
        ["nextChapterIdea", "다음 장으로 이어질 일", chapter.nextChapterIdea],
      ].map(
        ([field, label, content]): MemoSearchResult => ({
          id: `chapter-${chapter.id}-${field}`,
          section: "chapter",
          label,
          context: `${chapter.order}. ${chapter.title || "제목 없는 장"}`,
          content,
          fieldId: `memo-field-chapter-${chapter.id}-${field}`,
          chapterId: chapter.id,
        }),
      ),
    ),
    ...orderedDraftLines.flatMap((line) => {
      const chapter = draft.chapters.find(
        (candidate) => candidate.id === line.chapterId,
      );
      const context = `${chapter?.order ?? ""}. ${
        chapter?.title || "제목 없는 장"
      } · 컷 ${line.order}`;
      return [
        ["purposeNote", "이 컷의 역할", line.purposeNote],
        ["emotionNote", "인물의 감정", line.emotionNote],
        ["directionNote", "연출 메모", line.directionNote],
      ].map(
        ([field, label, content]): MemoSearchResult => ({
          id: `scene-${line.id}-${field}`,
          section: "scene",
          label,
          context,
          content,
          fieldId: `memo-field-scene-${line.id}-${field}`,
          chapterId: line.chapterId,
          lineId: line.id,
        }),
      );
    }),
  ];
  const normalizedMemoSearch = memoSearch.trim().toLocaleLowerCase("ko-KR");
  const filteredMemoSearchResults = memoSearchResults.filter((result) => {
    if (memoScope !== "all" && memoResultScope(result) !== memoScope) {
      return false;
    }
    if (!normalizedMemoSearch) return false;
    return [result.label, result.context, result.content]
      .join(" ")
      .toLocaleLowerCase("ko-KR")
      .includes(normalizedMemoSearch);
  });
  const storyChecklist = [
    { label: "이야기 제목", ready: Boolean(draft.title.trim()) },
    {
      label: "소재·주제",
      ready: Boolean(
        draft.planning.material.trim() && draft.planning.theme.trim(),
      ),
    },
    {
      label: "핵심 인물",
      ready: Boolean(draft.planning.mainCharacter.trim()),
    },
    {
      label: "바라는 것",
      ready: Boolean(draft.planning.mainGoal.trim()),
    },
    {
      label: "주요 갈등",
      ready: Boolean(draft.planning.centralProblem.trim()),
    },
    {
      label: `${selectedStructure.shortTitle} 줄거리`,
      ready: selectedStructure.steps.every(
        (step) => draft.planning[step.key].trim(),
      ),
    },
    { label: "장", ready: draft.chapters.length > 0 },
  ];
  const readyStoryItems = storyChecklist.filter((item) => item.ready).length;

  function updatePlanning(
    changes: Partial<StoryProject["planning"]>,
  ) {
    setDraft((project) => ({
      ...project,
      planning: { ...project.planning, ...changes },
    }));
  }

  function setMemoSectionOpen(section: MemoSection, open: boolean) {
    setMemoSectionsOpen((current) =>
      current[section] === open ? current : { ...current, [section]: open },
    );
  }

  function closeAllMemoSections() {
    setMemoSectionsOpen({
      story: false,
      structure: false,
      details: false,
      creative: false,
      chapter: false,
      scene: false,
    });
  }

  function memoScopeAllowsSection(section: MemoSection) {
    if (memoScope === "all") return true;
    if (["story", "structure", "details"].includes(section)) {
      return memoScope === "story";
    }
    if (section === "creative") {
      return ["free", "character", "relationship", "place", "event"].includes(
        memoScope,
      );
    }
    return memoScope === section;
  }

  function openVisibleMemoSections() {
    setMemoSectionsOpen((current) => ({
      story: memoScopeAllowsSection("story") || current.story,
      structure: memoScopeAllowsSection("structure") || current.structure,
      details: memoScopeAllowsSection("details") || current.details,
      creative: memoScopeAllowsSection("creative") || current.creative,
      chapter: memoScopeAllowsSection("chapter") || current.chapter,
      scene: memoScopeAllowsSection("scene") || current.scene,
    }));
  }

  function openMemoSearchResult(result: MemoSearchResult) {
    if (result.memoId) {
      setSelectedCreativeMemoId(result.memoId);
    } else if (result.lineId) {
      const line = draft.lines.find((candidate) => candidate.id === result.lineId);
      if (line) {
        setWorkspaceMode("create");
        requestStoryEditorRestore({
          chapterId: line.chapterId,
          lineId: line.id,
          view: "scene",
          focusTarget: "none",
        });
      }
    } else if (result.chapterId) {
      selectChapter(result.chapterId);
    }
    setMemoScope(memoResultScope(result));
    setMemoSectionOpen(result.section, true);
    setMemoSearch("");
    window.setTimeout(() => {
      document.getElementById(result.fieldId)?.focus();
    }, 0);
  }

  function addCreativeMemo(kind: CreativeMemoKind) {
    const memo = createCreativeMemo(kind, draft.creativeMemos.length + 1);
    setDraft((project) => ({
      ...project,
      creativeMemos: [...project.creativeMemos, memo],
    }));
    setCreativeMemoCreatorStep(null);
    setSelectedCreativeMemoId(memo.id);
  }

  function updateCreativeMemo(
    memoId: string,
    updater: (memo: CreativeMemo) => CreativeMemo,
  ) {
    setDraft((project) => ({
      ...project,
      creativeMemos: project.creativeMemos.map((memo) =>
        memo.id === memoId
          ? { ...updater(memo), updatedAt: new Date().toISOString() }
          : memo,
      ),
    }));
  }

  function addCreativeMemoField(
    memoId: string,
    label: string,
    source: CreativeMemoFieldSource,
  ) {
    updateCreativeMemo(memoId, (memo) => ({
      ...memo,
      fields: [
        ...memo.fields,
        createCreativeMemoField(label, source, memo.fields.length + 1),
      ],
    }));
  }

  function moveCreativeMemoField(
    memoId: string,
    fieldId: string,
    direction: -1 | 1,
  ) {
    updateCreativeMemo(memoId, (memo) => {
      const fields = memo.fields.slice().sort((a, b) => a.order - b.order);
      const index = fields.findIndex((field) => field.id === fieldId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= fields.length) {
        return memo;
      }
      [fields[index], fields[targetIndex]] = [fields[targetIndex], fields[index]];
      return {
        ...memo,
        fields: fields.map((field, fieldIndex) => ({
          ...field,
          order: fieldIndex + 1,
        })),
      };
    });
  }

  function deleteCreativeMemo(memoId: string) {
    if (!window.confirm("이 창작 메모를 삭제할까요? 삭제한 직후에는 되돌릴 수 있어요.")) {
      return;
    }
    if (!prepareDeleteUndo("창작 메모")) return;
    setDraft((project) => ({
      ...project,
      creativeMemos: project.creativeMemos
        .filter((memo) => memo.id !== memoId)
        .map((memo, index) => ({ ...memo, order: index + 1 })),
    }));
    setSelectedCreativeMemoId(null);
    setNotice("창작 메모를 삭제했어요. 바로 되돌릴 수 있어요.");
  }

  function deleteCreativeMemoField(memoId: string, fieldId: string) {
    if (!prepareDeleteUndo("창작 메모 항목")) return;
    updateCreativeMemo(memoId, (memo) => ({
      ...memo,
      fields: memo.fields
        .filter((field) => field.id !== fieldId)
        .map((field, index) => ({ ...field, order: index + 1 })),
    }));
    setNotice("창작 메모 항목을 삭제했어요. 바로 되돌릴 수 있어요.");
  }

  function openChapterPlan(chapterId: string) {
    selectChapter(chapterId);
    setPlanningView("chapters");
  }

  function openChapterWriter(chapterId: string) {
    selectChapter(chapterId);
    setWorkspaceMode("create");
    setEditorMode("chapter");
  }

  function updateChapter(chapterId: string, changes: Partial<Chapter>) {
    setDraft((project) => ({
      ...project,
      chapters: project.chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, ...changes } : chapter,
      ),
    }));
  }

  function updateLine(lineId: string, changes: Partial<StoryLine>) {
    setDraft((project) => ({
      ...project,
      lines: project.lines.map((line) =>
        line.id === lineId ? { ...line, ...changes } : line,
      ),
    }));
  }

  function copySceneStaging(sourceLineId: string) {
    if (!selectedLine || !selectedChapter) return;
    const sourceLine = draft.lines.find((line) => line.id === sourceLineId);
    const sourceChapter = draft.chapters.find(
      (chapter) => chapter.id === sourceLine?.chapterId,
    );
    if (!sourceLine || !sourceChapter) return;

    const copiedStaging = {
      leftAssetId: sourceLine.leftAssetId || sourceChapter.leftAssetId,
      rightAssetId: sourceLine.rightAssetId || sourceChapter.rightAssetId,
      backgroundId: sourceLine.backgroundId || sourceChapter.backgroundId,
    };
    const copiedCharacterIds = [
      copiedStaging.leftAssetId,
      copiedStaging.rightAssetId,
    ].filter(Boolean);
    const copiedBackgroundIds = [copiedStaging.backgroundId].filter(Boolean);

    setDraft((project) => ({
      ...project,
      chapters: project.chapters.map((chapter) =>
        chapter.id === selectedChapter.id
          ? {
              ...chapter,
              characterAssetIds: unique([
                ...chapter.characterAssetIds,
                ...copiedCharacterIds,
              ]),
              backgroundAssetIds: unique([
                ...chapter.backgroundAssetIds,
                ...copiedBackgroundIds,
              ]),
            }
          : chapter,
      ),
      lines: project.lines.map((line) =>
        line.id === selectedLine.id ? { ...line, ...copiedStaging } : line,
      ),
    }));
    setNotice(
      `${sourceChapter.order}. ${sourceChapter.title || "이름 없는 장"} · 컷 ${sourceLine.order}의 이미지 배치를 가져왔어요. 현재 글상자 내용은 그대로예요.`,
    );
  }

  function changeLineType(lineId: string, type: StoryLine["type"]) {
    if (!selectedChapter) return;
    const firstSpeaker =
      selectedChapter.chapterSpeakerNames[0] ??
      draft.speakerNames[0] ??
      "주인공";
    setDraft((project) => ({
      ...project,
      speakerNames:
        type === "dialogue"
          ? unique([...project.speakerNames, firstSpeaker])
          : project.speakerNames,
      chapters: project.chapters.map((chapter) =>
        chapter.id === selectedChapter.id && type === "dialogue"
          ? {
              ...chapter,
              chapterSpeakerNames: unique([
                ...chapter.chapterSpeakerNames,
                firstSpeaker,
              ]),
            }
          : chapter,
      ),
      lines: project.lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              type,
              speaker: type === "narration" ? "narration" : "left",
              speakerName: type === "narration" ? "해설" : firstSpeaker,
            }
          : line,
      ),
    }));
  }

  function selectChapter(chapterId: string) {
    setSelectedChapterId(chapterId);
    const firstLine = draft.lines
      .filter((line) => line.chapterId === chapterId)
      .sort((a, b) => a.order - b.order)[0];
    setSelectedLineId(firstLine?.id ?? "");
  }

  function selectStoryLine(line: StoryLine) {
    setSelectedChapterId(line.chapterId);
    setSelectedLineId(line.id);
  }

  function requestStoryEditorRestore(
    location: StoryEditorLocation,
    {
      chapters = draft.chapters,
      lines = draft.lines,
      scrollY,
      selection,
    }: {
      chapters?: Chapter[];
      lines?: StoryLine[];
      scrollY?: number;
      selection?: StoryEditorTextSelection;
    } = {},
  ) {
    const resolved = resolveStoryEditorLocation({
      chapters,
      lines,
      location,
    }).location;
    setSelectedChapterId(resolved.chapterId);
    setSelectedLineId(resolved.lineId);
    setEditorMode(resolved.view);
    setEditorRestoreRequest({ location: resolved, scrollY, selection });
  }

  function currentStoryEditorLocation(): StoryEditorLocation {
    return {
      chapterId: selectedChapter?.id ?? selectedChapterId,
      lineId: selectedLine?.id ?? selectedLineId,
      view: editorMode,
      focusTarget: "none",
    };
  }

  function currentLineBodySelection(lineId: string) {
    const lineBody = lineBodyRefs.current.get(lineId);
    return lineBody
      ? { start: lineBody.selectionStart, end: lineBody.selectionEnd }
      : undefined;
  }

  function openMemoPopup() {
    if (!memoPopupOpen) {
      memoReturnOriginRef.current = {
        workspaceMode,
        planningView,
        location: currentStoryEditorLocation(),
        scrollY:
          workspaceMode === "create" && editorMode === "chapter"
            ? window.scrollY
            : undefined,
      };
    }
    setMemoPopupOpen(true);
  }

  function returnFromMemoPopup() {
    setMemoPopupOpen(false);
    setMemoSearch("");
    const origin = memoReturnOriginRef.current;
    memoReturnOriginRef.current = null;
    if (!origin) return;

    const resolved = resolveCreativeMemoReturnLocation({
      chapters: draft.chapters,
      lines: draft.lines,
      location: origin.location,
    });
    setWorkspaceMode(origin.workspaceMode);
    setPlanningView(origin.planningView);
    if (origin.workspaceMode === "create") {
      requestStoryEditorRestore(resolved.location, {
        scrollY: resolved.usedFallback ? undefined : origin.scrollY,
      });
    } else {
      setSelectedChapterId(resolved.location.chapterId);
      setSelectedLineId(resolved.location.lineId);
      setEditorMode(resolved.location.view);
    }
    setNotice(
      resolved.usedFallback
        ? "기록하던 컷이 바뀌어 가장 가까운 곳으로 돌아왔어요."
        : "메모를 닫고 기록하던 컷으로 돌아왔어요.",
    );
  }

  function switchStoryEditorView(view: StoryEditorView) {
    if (view === editorMode) return;
    const current = currentStoryEditorLocation();
    if (editorMode === "chapter") {
      chapterViewportRef.current = {
        chapterId: current.chapterId,
        lineId: current.lineId,
        scrollY: window.scrollY,
        selection: currentLineBodySelection(current.lineId),
      };
    }
    const rememberedViewport = chapterViewportRef.current;
    const scrollY =
      view === "chapter" &&
      rememberedViewport?.chapterId === current.chapterId &&
      rememberedViewport.lineId === current.lineId
        ? rememberedViewport.scrollY
        : undefined;
    const selection =
      currentLineBodySelection(current.lineId) ??
      (view === "chapter" &&
      rememberedViewport?.chapterId === current.chapterId &&
      rememberedViewport.lineId === current.lineId
        ? rememberedViewport.selection
        : undefined);
    requestStoryEditorRestore(
      transitionStoryEditorView({ location: current, view }),
      { scrollY, selection },
    );
  }

  function openStoryEditorScene(line: StoryLine) {
    const selection = currentLineBodySelection(line.id);
    chapterViewportRef.current = {
      chapterId: line.chapterId,
      lineId: line.id,
      scrollY: window.scrollY,
      selection,
    };
    requestStoryEditorRestore(
      {
        chapterId: line.chapterId,
        lineId: line.id,
        view: "scene",
        focusTarget: "line-body",
      },
      { selection },
    );
  }

  function highlightApplyIssue(issueId: string) {
    if (applyIssueHighlightTimerRef.current !== null) {
      window.clearTimeout(applyIssueHighlightTimerRef.current);
    }
    setHighlightedApplyIssueId(issueId);
    applyIssueHighlightTimerRef.current = window.setTimeout(() => {
      setHighlightedApplyIssueId("");
      applyIssueHighlightTimerRef.current = null;
    }, 2400);
  }

  function moveToApplyIssue(issue: StoryApplyIssue) {
    const navigation = getStoryApplyIssueNavigation(issue);
    highlightApplyIssue(issue.id);
    setApplyIssuesVisible(true);
    if (navigation.workspace === "plan") {
      setWorkspaceMode("plan");
      setPlanningView("story");
      setMobileProjectOpen(true);
    } else {
      setWorkspaceMode("create");
      if (navigation.lineId && navigation.chapterId) {
        requestStoryEditorRestore({
          chapterId: navigation.chapterId,
          lineId: navigation.lineId,
          view: navigation.view ?? "scene",
          focusTarget: navigation.focus === "line-body" ? "line-body" : "none",
        });
      } else {
        if (navigation.chapterId) {
          setSelectedChapterId(navigation.chapterId);
          setSelectedLineId("");
        }
        setEditorMode(navigation.view ?? "chapter");
      }
    }
    if (navigation.focus === "speaker") setSceneSettingsOpen(true);
    if (navigation.focus === "title" || navigation.focus === "speaker") {
      setApplyIssueFocusRequest(issue);
    }
    setNotice("고칠 곳으로 이동했어요. 안내를 읽고 학생 작품을 직접 고쳐 보세요.");
  }

  function moveThroughStory(direction: -1 | 1) {
    const nextLine = orderedDraftLines[selectedStoryLineIndex + direction];
    if (nextLine) openStoryEditorScene(nextLine);
  }

  function editStoryFromBeginning() {
    const firstLine = orderedDraftLines[0];
    if (!firstLine) return;
    setWorkspaceMode("create");
    setEditorMode("scene");
    selectStoryLine(firstLine);
    setSceneSettingsOpen(false);
    setNotice(
      "첫 컷부터 차례로 읽고 고칠 수 있어요. ‘다음 컷’을 누르면 장을 넘어 계속 이어집니다.",
    );
  }

  function returnToContinuationPoint() {
    if (!continuationPoint) return;
    const continuationLine = draft.lines.find(
      (line) => line.id === continuationPoint.lineId,
    );
    if (!continuationLine) return;
    setWorkspaceMode("create");
    setEditorMode("scene");
    selectStoryLine(continuationLine);
    setSceneSettingsOpen(false);
    setNotice(
      `${continuationPoint.label} 컷으로 돌아왔어요. 여기서부터 이야기를 이어 써 보세요.`,
    );
  }

  function addChapter() {
    const id = `chapter-${Date.now()}`;
    const chapter: Chapter = {
      id,
      order: draft.chapters.length + 1,
      title: "",
      summary: "",
      purpose: "",
      mood: "",
      keyEvents: "",
      nextChapterIdea: "",
      storyStageKeys: [],
      chapterSpeakerNames: [],
      characterAssetIds: [],
      backgroundAssetIds: [],
      backgroundId: "",
      leftAssetId: "",
      rightAssetId: "",
    };
    setDraft((project) => ({
      ...project,
      chapters: [...project.chapters, chapter],
    }));
    setPlanningView("chapters");
    setSelectedChapterId(id);
    setSelectedLineId("");
    setMemoPopupOpen(true);
  }

  function removeChapter(chapterId: string) {
    const sceneCount = draft.lines.filter(
      (line) => line.chapterId === chapterId,
    ).length;
    if (
      !window.confirm(
        sceneCount > 0
          ? `이 장과 컷 ${sceneCount}개를 함께 삭제할까요?`
          : "이 장을 삭제할까요?",
      )
    ) {
      return;
    }
    if (!prepareDeleteUndo(sceneCount > 0 ? "장과 컷" : "장")) return;
    const remaining = sortedChapters.filter((chapter) => chapter.id !== chapterId);
    setDraft((project) => ({
      ...project,
      chapters: project.chapters.filter((chapter) => chapter.id !== chapterId),
      lines: project.lines.filter((line) => line.chapterId !== chapterId),
    }));
    selectChapter(remaining[0]?.id ?? "");
    setNotice("장을 삭제했어요. 현재 플레이는 아직 그대로이고 바로 되돌릴 수 있어요.");
  }

  function reportStoryLineCommandFailure(code: StoryLineCommandFailureCode) {
    setNotice(
      code === "duplicate-id"
        ? "새 컷 ID가 이미 있어요. 다시 시도해 주세요."
        : code === "cannot-move"
          ? "더 이상 이 방향으로 컷을 옮길 수 없어요."
          : "바꾸려는 컷을 찾지 못했어요.",
    );
  }

  function addLine(type: StoryLine["type"], openScene = false) {
    if (!selectedChapter) return;
    const firstSpeaker =
      selectedChapter.chapterSpeakerNames[0] ??
      draft.speakerNames[0] ??
      "주인공";
    const command = createStoryLine({
      lines: draft.lines,
      chapterId: selectedChapter.id,
      createId: () => `line-${Date.now()}`,
      insertAfterLineId:
        openScene && selectedLine?.chapterId === selectedChapter.id
          ? selectedLine.id
          : undefined,
      line: {
        type,
        speaker: type === "narration" ? "narration" : "left",
        speakerName: type === "narration" ? "해설" : firstSpeaker,
        text: "",
        leftAssetId: "",
        rightAssetId: "",
        backgroundId: "",
        purposeNote: "",
        emotionNote: "",
        directionNote: "",
      },
    });
    if (!command.ok) {
      reportStoryLineCommandFailure(command.code);
      return;
    }
    setDraft((project) => ({
      ...project,
      speakerNames:
        type === "dialogue"
          ? unique([...project.speakerNames, firstSpeaker])
          : project.speakerNames,
      chapters: project.chapters.map((chapter) =>
        chapter.id === selectedChapter.id && type === "dialogue"
          ? {
              ...chapter,
              chapterSpeakerNames: unique([
                ...chapter.chapterSpeakerNames,
                firstSpeaker,
              ]),
            }
          : chapter,
      ),
      lines: command.lines,
    }));
    requestStoryEditorRestore(
      newStoryEditorLineLocation({
        chapterId: selectedChapter.id,
        lineId: command.selectedLineId ?? "",
        view: openScene ? "scene" : "chapter",
      }),
      { lines: command.lines },
    );
  }

  function removeLine(lineId: string) {
    if (!window.confirm("이 컷을 삭제할까요?")) return;
    const command = deleteStoryLine({ lines: draft.lines, lineId });
    if (!command.ok) {
      reportStoryLineCommandFailure(command.code);
      return;
    }
    if (
      !prepareDeleteUndo("컷", {
        chapterId: selectedChapter?.id ?? selectedChapterId,
        lineId,
        view: editorMode,
        focusTarget: "line-body",
      })
    ) return;
    setDraft((project) => ({
      ...project,
      lines: command.lines,
    }));
    requestStoryEditorRestore({
      ...currentStoryEditorLocation(),
      lineId: command.selectedLineId ?? "",
      focusTarget: command.selectedLineId ? "line-body" : "none",
    }, { lines: command.lines });
    setNotice("컷을 삭제했어요. 바로 되돌릴 수 있어요.");
  }

  function moveLine(lineId: string, direction: -1 | 1) {
    const command = moveStoryLine({ lines: draft.lines, lineId, direction });
    if (!command.ok) {
      reportStoryLineCommandFailure(command.code);
      return;
    }
    setDraft((project) => ({ ...project, lines: command.lines }));
    requestStoryEditorRestore(
      {
        ...currentStoryEditorLocation(),
        lineId: command.selectedLineId ?? "",
        focusTarget: "line-body",
      },
      { lines: command.lines },
    );
  }

  function duplicateLine(lineId: string) {
    const command = duplicateStoryLine({
      lines: draft.lines,
      lineId,
      createId: () => `line-${Date.now()}`,
    });
    if (!command.ok) {
      reportStoryLineCommandFailure(command.code);
      return;
    }
    setDraft((project) => ({ ...project, lines: command.lines }));
    requestStoryEditorRestore(
      newStoryEditorLineLocation({
        chapterId: selectedChapter?.id ?? selectedChapterId,
        lineId: command.selectedLineId ?? "",
        view: editorMode,
      }),
      { lines: command.lines },
    );
    setNotice("컷을 복제했어요.");
  }

  function addSpeaker(name: string, assignToSelectedScene = true) {
    if (!selectedChapter) return;
    setDraft((project) => ({
      ...project,
      speakerNames: unique([...project.speakerNames, name]),
      chapters: project.chapters.map((chapter) =>
        chapter.id === selectedChapter.id
          ? {
              ...chapter,
              chapterSpeakerNames: unique([
                ...chapter.chapterSpeakerNames,
                name,
              ]),
            }
          : chapter,
      ),
      lines: project.lines.map((line) =>
        assignToSelectedScene && line.id === selectedLine?.id
          ? { ...line, speakerName: name }
          : line,
      ),
    }));
    setNotice(`화자 ‘${name}’을(를) 이 장에 추가했어요.`);
  }

  function addAssetToChapter(assetId: string, type: StoryAsset["type"]) {
    if (!selectedChapter || !assetId) return;
    updateChapter(
      selectedChapter.id,
      type === "character"
        ? {
            characterAssetIds: unique([
              ...selectedChapter.characterAssetIds,
              assetId,
            ]),
          }
        : {
            backgroundAssetIds: unique([
              ...selectedChapter.backgroundAssetIds,
              assetId,
            ]),
          },
    );
    setRecentAssets((current) =>
      [assetId, ...current.filter((id) => id !== assetId)].slice(0, 24),
    );
  }

  function removeAsset(assetId: string, type: StoryAsset["type"]) {
    if (!selectedChapter) return;
    const usedInLines = selectedChapterLines.some((line) =>
      type === "character"
        ? line.leftAssetId === assetId || line.rightAssetId === assetId
        : line.backgroundId === assetId,
    );
    const usedAsDefault =
      type === "character"
        ? selectedChapter.leftAssetId === assetId ||
          selectedChapter.rightAssetId === assetId
        : selectedChapter.backgroundId === assetId;
    if (usedInLines || usedAsDefault) {
      setNotice(
        `‘${assetName(assetId)}’은(는) 현재 컷에서 사용 중이라 먼저 다른 이미지로 바꿔야 해요.`,
      );
      return;
    }
    updateChapter(
      selectedChapter.id,
      type === "character"
        ? {
            characterAssetIds: selectedChapter.characterAssetIds.filter(
              (id) => id !== assetId,
            ),
          }
        : {
            backgroundAssetIds: selectedChapter.backgroundAssetIds.filter(
              (id) => id !== assetId,
            ),
          },
    );
  }

  function toggleFavorite(assetId: string) {
    setFavoriteAssets((current) =>
      current.includes(assetId)
        ? current.filter((id) => id !== assetId)
        : [...current, assetId],
    );
  }

  function backupDraft(
    reason: Exclude<StoryCheckpointReason, "before-restore">,
  ) {
    const checkpoint = checkpointRepository().create(reason, draft);
    if (!checkpoint.ok) {
      setNotice(checkpoint.message);
      if (creatorAccess === "none") setEntryNotice(checkpoint.message);
      return false;
    }
    setCheckpoints(checkpoint.checkpoints);
    setBackupFound(true);
    return true;
  }

  function prepareDeleteUndo(
    description: string,
    location: StoryEditorLocation = currentStoryEditorLocation(),
  ) {
    if (!backupDraft("before-delete")) return false;
    setUndoDelete({ project: cloneProject(draft), description, location });
    return true;
  }

  function applyRestoredDraft(project: StoryProject) {
    setDraft(cloneProject(project));
    setSelectedChapterId(project.chapters[0]?.id ?? "");
    setSelectedLineId(project.lines[0]?.id ?? "");
  }

  function restoreBackup() {
    const latestCheckpoint = checkpoints[0];
    if (latestCheckpoint) {
      if (
        !window.confirm(
          "최근 저장본으로 돌아갈까요? 지금 편집본은 새 복구 기록으로 남아요.",
        )
      ) {
        return;
      }
      const restored = checkpointRepository().restore(latestCheckpoint.id, draft);
      if (!restored.ok) {
        setNotice(restored.message);
        return;
      }
      applyRestoredDraft(restored.project);
      setCheckpoints(restored.checkpoints);
      setUndoDelete(null);
      setNotice("최근 저장본으로 복구했어요. 방금 편집한 내용도 복구 기록에 남아 있어요.");
      return;
    }
    try {
      const saved = localStorage.getItem(BACKUP_KEY);
      if (!saved) {
        setNotice("복구할 직전 편집본이 없어요.");
        return;
      }
      if (!backupDraft("before-reset")) return;
      applyRestoredDraft(JSON.parse(saved) as StoryProject);
      setUndoDelete(null);
      setNotice("이전 직전 편집본으로 복구했어요. 방금 편집한 내용도 복구 기록에 남아 있어요.");
    } catch {
      setNotice("직전 편집본을 읽지 못했어요. 저장한 Excel을 열어 주세요.");
    }
  }

  function undoLastDeletion() {
    if (!undoDelete) return;
    if (!backupDraft("before-reset")) return;
    const restoredProject = cloneProject(undoDelete.project);
    const restoredLocation = resolveStoryEditorLocation({
      chapters: restoredProject.chapters,
      lines: restoredProject.lines,
      location: undoDelete.location,
    });
    applyRestoredDraft(restoredProject);
    requestStoryEditorRestore(restoredLocation.location, {
      chapters: restoredProject.chapters,
      lines: restoredProject.lines,
    });
    setUndoDelete(null);
    setNotice(`${undoDelete.description} 삭제를 되돌렸어요.`);
  }

  async function applyDraft() {
    if (applyIssues.length > 0) {
      setApplyIssuesVisible(true);
      setNotice(
        `플레이에 적용하기 전에 고칠 곳이 ${applyIssues.length}개 있어요. 아래 안내를 눌러 이동해 보세요.`,
      );
      return;
    }
    const controller = new AbortController();
    updateController.current = controller;
    setBusy("draft");
    try {
      setBusyStep("플레이에 표시할 내용 확인 중");
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(resolve, 280);
        controller.signal.addEventListener("abort", () => {
          window.clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
      if (!backupDraft("before-play-apply")) return;
      setBusyStep("새 플레이 버전 만드는 중");
      const updated = cloneProject({
        ...draft,
        updatedAt: new Intl.DateTimeFormat("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      });
      setActive(updated);
      const activeSave = saveActiveProject(updated);
      setApplyIssuesVisible(false);
      setNotice(
        activeSave.ok
          ? `플레이 적용 완료 · 장 ${updated.chapters.length}개 · 컷 ${updated.lines.length}개`
          : activeSave.message,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("적용을 중지했어요. 직전 플레이는 그대로예요.");
      } else {
        setNotice(
          error instanceof Error
            ? error.message
            : "플레이에 적용하지 못했어요.",
        );
      }
    } finally {
      updateController.current = null;
      setBusy(null);
      setBusyStep("");
    }
  }

  function confirmImport() {
    const imported = importConfirmation.project;
    if (!imported) return;
    if (!backupDraft("before-import")) return;
    const activeResolution = resolveActiveProjectForDraft({ draft: imported, active });
    const activeSave = activeResolution.usedFallback
      ? projectRepository().saveActive(activeResolution.project)
      : null;
    setActive(activeResolution.project);
    setDraft(imported);
    setLocalDraftStatus("available");
    setSelectedChapterId(imported.chapters[0]?.id ?? "");
    setSelectedLineId(imported.lines[0]?.id ?? "");
    setCreatorAccess("local");
    setWorkspaceMode("create");
    setEntryNotice("");
    setNotice(
      activeSave && !activeSave.ok
        ? activeSave.message
        : importConfirmation.fileName
        ? `‘${importConfirmation.fileName}’을 편집본으로 열었어요.`
        : "작품을 편집본으로 열었어요.",
    );
    setImportConfirmation({ open: false, project: null });
  }

  async function updateFromSheet(sourceUrl = draft.sheetUrl) {
    if (busy) return;
    const sheetId = extractSheetId(sourceUrl);
    if (!sheetId) {
      setNotice("Google 시트의 공유 주소를 확인해 주세요.");
      if (creatorAccess === "none") setEntryNotice("Google 시트의 공유 주소를 확인해 주세요.");
      return;
    }
    const controller = new AbortController();
    updateController.current = controller;
    setBusy("sheet");
    try {
      setBusyStep("공개 Google 시트를 읽는 중");
      const snapshot = await fetchSheetSnapshot(sheetId, controller.signal);
      setBusyStep("장·컷·이미지 연결 확인 중");
      const result = importStoryProject(snapshot, sourceUrl);
      if (!result.ok) {
        setImportIssues({ open: true, issues: result.issues, source: "sheet" });
        return;
      }
      setImportConfirmation({
        open: true,
        project: result.project,
        fileName: "Google 시트",
      });
    } catch (error) {
      if (error instanceof StoryImportError) {
        setImportIssues({ open: true, issues: error.issues, source: "sheet" });
      } else if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("시트 불러오기를 중지했어요.");
      } else {
        const msg =
          error instanceof Error ? error.message : "시트를 읽지 못했어요.";
        setImportIssues({
          open: true,
          issues: [
            {
              severity: "error",
              source: "sheet",
              sheet: "연결 오류",
              row: 1,
              column: "공개 권한",
              value: sourceUrl,
              message: msg,
              fix: "Google 시트의 공유 권한이 ‘링크가 있는 모든 사용자 — 뷰어’인지 확인하거나, Excel 파일(.xlsx)로 다운로드해 불러오세요.",
            },
          ],
          source: "sheet",
        });
      }
    } finally {
      updateController.current = null;
      setBusy(null);
      setBusyStep("");
    }
  }

  async function openExcelFile(file?: File) {
    if (!file || busy || !hydrated) return;
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      const message = "`.xlsx` 형식의 Excel 파일을 골라 주세요.";
      if (creatorAccess === "none") setEntryNotice(message);
      else setNotice(message);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      const message = "파일이 15MB보다 커요. 이미지가 들어 있지 않은 작품 파일인지 확인해 주세요.";
      if (creatorAccess === "none") setEntryNotice(message);
      else setNotice(message);
      return;
    }
    const controller = new AbortController();
    updateController.current = controller;
    setBusy("excel");
    setEntryBusy(true);
    try {
      setBusyStep("Excel 파일을 이 기기에서 읽는 중");
      const { readStoryWorkbook } = await import("./story-workbook");
      const snapshot = await readStoryWorkbook(file);
      if (controller.signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      const result = importStoryProject(snapshot, "");
      if (!result.ok) {
        setImportIssues({ open: true, issues: result.issues, source: "excel" });
        return;
      }
      setImportConfirmation({
        open: true,
        project: result.project,
        fileName: file.name,
      });
    } catch (error) {
      if (error instanceof StoryImportError) {
        setImportIssues({ open: true, issues: error.issues, source: "excel" });
      } else {
        const message =
          error instanceof Error
            ? error.message
            : "Excel 파일을 읽지 못했어요.";
        setImportIssues({
          open: true,
          issues: [
            {
              severity: "error",
              source: "excel",
              sheet: "파일 오류",
              row: 1,
              column: "파일 형식",
              value: file.name,
              message,
              fix: "정상적인 .xlsx 파일인지 확인하고, 손상되지 않은 양식 파일을 다시 선택해 주세요.",
            },
          ],
          source: "excel",
        });
      }
    } finally {
      updateController.current = null;
      setBusy(null);
      setBusyStep("");
      setEntryBusy(false);
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  }

  async function saveExcelFile() {
    const controller = new AbortController();
    updateController.current = controller;
    setBusy("excel");
    try {
      setBusyStep("창작 메모와 작품 내용 저장 중");
      const { downloadStoryWorkbook } = await import("./story-workbook");
      await downloadStoryWorkbook(draft, STORY_ASSETS);
      if (controller.signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      setNotice("현재 편집본과 창작 메모를 Excel로 저장했어요.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Excel로 저장하지 못했어요.",
      );
    } finally {
      updateController.current = null;
      setBusy(null);
      setBusyStep("");
    }
  }

  function startBlankProject() {
    const blank = createBlankProject();
    const blankActive = cloneProject(blank);
    if (!backupDraft("before-reset")) return;
    setDraft(blank);
    setLocalDraftStatus("available");
    setActive(blankActive);
    const activeSave = saveActiveProject(blankActive);
    setSelectedChapterId("");
    setSelectedLineId("");
    setWorkspaceMode("plan");
    setPlanningView("story");
    setEditorMode("chapter");
    setMobileProjectOpen(false);
    setMobileEditorToolsOpen(false);
    setSceneSettingsOpen(false);
    setCreatorAccess("local");
    setBlankConfirmOpen(false);
    setNotice(
      activeSave.ok
        ? "빈 작품을 열었어요. 구상부터 시작하거나 바로 장을 만드세요."
        : activeSave.message,
    );
  }

  function startContinuationTemplate(
    source: StoryProject,
    continuationChapterId: string,
    continuationLineId: string,
    message: string,
  ) {
    const template = cloneProject(source);
    const playableLines = template.lines.filter((line) => line.text.trim());
    const playableStart = cloneProject({
      ...template,
      chapters: template.chapters.filter((chapter) =>
        playableLines.some((line) => line.chapterId === chapter.id),
      ),
      lines: playableLines,
    });
    if (!backupDraft("before-template")) return;
    setDraft(template);
    setLocalDraftStatus("available");
    setActive(playableStart);
    const activeSave = saveActiveProject(playableStart);
    setSelectedChapterId(continuationChapterId);
    setSelectedLineId(continuationLineId);
    setWorkspaceMode("create");
    setEditorMode("scene");
    setMobileProjectOpen(false);
    setMobileEditorToolsOpen(false);
    setSceneSettingsOpen(false);
    setMemoPopupOpen(false);
    setChapterResourcesOpen(false);
    setCreatorAccess("local");
    setNotice(activeSave.ok ? message : activeSave.message);
  }

  function startRabbitTurtleContinuation1() {
    startContinuationTemplate(
      RABBIT_TURTLE_CONTINUATION_TEMPLATE,
      "continuation-chapter-2",
      "continuation-line-6",
      "토끼와 자라가 만난 다음 컷을 열었어요. 자라의 첫 말부터 이어 써 보세요.",
    );
  }

  function startRabbitTurtleContinuation2() {
    startContinuationTemplate(
      RABBIT_TURTLE_CONTINUATION_TEMPLATE_2,
      "palace-continuation-chapter-2",
      "palace-continuation-line-7",
      "용궁에 묶인 토끼의 다음 컷을 열었어요. 토끼의 첫 말부터 이어 써 보세요.",
    );
  }

  function startOnggojibContinuation() {
    startContinuationTemplate(
      ONGGOJIB_CONTINUATION_TEMPLATE,
      "onggojib-continuation",
      "onggojib-continuation-line-1",
      "아내가 가짜 옹고집을 선택한 다음 컷을 열었어요. 선택 뒤 첫 반응부터 이어 써 보세요.",
    );
  }

  function requestBlankProject() {
    const hasContent =
      Boolean(draft.title.trim()) ||
      draft.chapters.length > 0 ||
      draft.lines.length > 0;
    if (hasContent) setBlankConfirmOpen(true);
    else startBlankProject();
  }

  function requestEntryChoice(label: string, action: () => void) {
    if (!hydrated || busy) return;
    if (localDraftStatus === "available" || localDraftStatus === "failed") {
      entryChoiceRef.current = action;
      setEntryChoiceLabel(label);
    } else {
      action();
    }
  }

  function cancelEntryChoice() {
    entryChoiceRef.current = null;
    setEntryChoiceLabel("");
  }

  function chooseRevisionResponse(
    project: StoryProject,
    promptId: string,
    response: StoryRevisionResponse,
  ) {
    const key = storyRevisionResponseKey({
      projectId: project.id,
      structureMode: project.planning.structureMode,
      promptId,
    });
    setRevisionResponses((current) =>
      setStoryRevisionResponse({ responses: current, key, response }),
    );
  }

  function captureStudioReturnOrigin(): StudioReturnOrigin {
    const location = currentStoryEditorLocation();
    const input = lineBodyRefs.current.get(location.lineId);
    return {
      session: resolveStudioUiSession(draft, {
        version: 1, projectId: draft.id, workspaceMode, planningView, location,
      }),
      fromHome: creatorAccess === "none", scrollY: window.scrollY,
      focusButtonLabel: document.activeElement instanceof HTMLButtonElement
        ? document.activeElement.textContent?.trim() : undefined,
      selection: input ? { start: input.selectionStart, end: input.selectionEnd } : undefined,
    };
  }

  function restoreStudioSession(origin: StudioReturnOrigin | null) {
    const session = resolveStudioUiSession(draft,
      origin?.session ?? loadStudioUiSession(() => window.localStorage));
    const samePosition = origin?.session.projectId === draft.id &&
      origin.session.location.chapterId === session.location.chapterId &&
      origin.session.location.lineId === session.location.lineId;
    setWorkspaceMode(session.workspaceMode);
    setPlanningView(session.planningView);
    requestStoryEditorRestore({
      ...session.location,
      focusTarget: session.workspaceMode === "create" && session.location.lineId ? "line-body" : "none",
    }, {
      scrollY: samePosition ? origin.scrollY : undefined,
      selection: samePosition ? origin.selection : undefined,
    });
  }

  function returnHome() {
    if (busy) return;
    const origin = captureStudioReturnOrigin();
    homeReturnOriginRef.current = origin;
    saveStudioUiSession(() => window.localStorage, origin.session);
    saveQueueRef.current?.schedule(draft);
    const saved = saveQueueRef.current?.flush();
    setLocalDraftStatus("available");
    setEntryNotice(saved && !saved.ok
      ? "기기에 저장하지 못했어요. 이 창에서는 이어할 수 있지만, 닫기 전에 Excel로 보관해 주세요."
      : "만들던 이야기는 그대로 있어요. 이어만들기로 돌아갈 수 있어요.");
    setProjectToolsOpen(false);
    setMemoPopupOpen(false);
    setSelectedCreativeMemoId(null);
    setCreatorAccess("none");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function resumeStudio() {
    if (localDraftStatus !== "available" || busy) return;
    setCreatorAccess("local");
    restoreStudioSession(homeReturnOriginRef.current);
    homeReturnOriginRef.current = null;
    setNotice("만들던 이야기와 작업 위치를 이어서 엽니다.");
  }

  function openPlay(index = 0, kind: "student" | "example" = "student") {
    playerReturnLocationRef.current = captureStudioReturnOrigin();
    const project = kind === "example" ? DEFAULT_PROJECT
      : resolveActiveProjectForDraft({ draft, active }).project;
    dispatchPlayerUi({ type: "open", index,
      context: createStoryPlaybackContext(kind, project) });
  }

  function restorePlayerOriginFocus(origin: StudioReturnOrigin) {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: origin.scrollY, behavior: "auto" });
      const button = Array.from(document.querySelectorAll<HTMLButtonElement>("button"))
        .find((candidate) => candidate.textContent?.trim() === origin.focusButtonLabel);
      button?.focus({ preventScroll: true });
    });
  }

  function returnFromPlayer() {
    dispatchPlayerUi({ type: "close" });
    const origin = playerReturnLocationRef.current;
    playerReturnLocationRef.current = null;
    if (!origin) return;
    if (origin.fromHome) {
      restorePlayerOriginFocus(origin);
      return;
    }
    if (origin.session.projectId !== draft.id ||
      (origin.session.location.lineId && !resolvePlayedCutLocation(draft, {
        projectId: origin.session.projectId, lineId: origin.session.location.lineId,
      }))) {
      showSafePlayerReturn("플레이 전 작업 위치가 바뀌었어요. 이야기 구성에서 고칠 장을 다시 골라 주세요.");
      return;
    }
    restoreStudioSession(origin);
    if (origin.session.workspaceMode === "plan") restorePlayerOriginFocus(origin);
    setNotice("플레이하기 전 작업하던 곳으로 돌아왔어요.");
  }

  function showSafePlayerReturn(message: string) {
    setWorkspaceMode("plan");
    setPlanningView("chapters");
    setNotice(message);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      document.querySelector<HTMLElement>(".creator-primary-nav button")?.focus();
    });
  }

  function editPlayedCut(cut: PlayedStoryCut) {
    const context = playerUi.context;
    if (!context || context.kind !== "student") return;
    const playing = selectStoryPlayerPosition(context.project, playIndex);
    const location = context.project.id === cut.projectId && playing.line?.id === cut.lineId
      ? resolvePlayedCutLocation(draft, cut) : null;
    dispatchPlayerUi({ type: "close" });
    playerReturnLocationRef.current = null;
    if (!location) {
      showSafePlayerReturn(draft.id !== cut.projectId
        ? "다른 작품의 컷이라 열지 않았어요. 이야기 구성에서 고칠 장을 골라 주세요."
        : "재생한 컷이 편집본에 없어요. 이야기 구성에서 고칠 장을 다시 골라 주세요.");
      return;
    }
    setWorkspaceMode("create");
    requestStoryEditorRestore(location);
    setNotice("방금 재생한 컷을 열었어요. 고친 글은 플레이에 적용하면 보여요.");
  }

  function playSelectedChapter() {
    if (!selectedChapter) return;
    const { lines } = selectStoryPlayerPosition(
      resolveActiveProjectForDraft({ draft, active }).project, 0);
    const index = findFirstStoryLineIndexForChapter({
      lines,
      chapterId: selectedChapter.id,
    });
    if (index < 0) {
      setNotice("이 장은 아직 플레이에 적용한 컷이 없어요. 컷을 쓰고 적용해 주세요.");
      return;
    }
    openPlay(index);
  }

  if (view === "play" && playerUi.context) {
    const context = playerUi.context;
    return (
      <StoryPlayer
        project={context.project}
        startIndex={playIndex}
        isExample={context.kind === "example"}
        onEditCut={context.kind === "student" ? editPlayedCut : undefined}
        onIndexChange={(index) =>
          dispatchPlayerUi({ type: "change-index", index })
        }
        onBack={returnFromPlayer}
        revisionResponses={revisionResponses}
        onRevisionResponse={(promptId, response) =>
          context.kind === "student" && chooseRevisionResponse(context.project, promptId, response)
        }
      />
    );
  }

  if (creatorAccess === "none") {
    return (
      <>
        <StartScreen
          entryBusy={entryBusy}
          localDraftStatus={localDraftStatus}
          entryNotice={entryNotice}
          busy={Boolean(busy)}
          busyStep={busyStep}
          onStartBlank={() => requestEntryChoice("빈 이야기", startBlankProject)}
          onOpenExcelFile={openExcelFile}
          onOpenGoogleSheet={updateFromSheet}
          onStartRabbitTurtleContinuation1={() => requestEntryChoice("토끼와 자라 · 땅에서 만난 뒤", startRabbitTurtleContinuation1)}
          onStartRabbitTurtleContinuation2={() => requestEntryChoice("토끼와 자라 · 용궁에 묶인 토끼", startRabbitTurtleContinuation2)}
          onStartOnggojibContinuation={() => requestEntryChoice("옹고집전 · 아내의 선택 이후", startOnggojibContinuation)}
          onResumeSavedDraft={resumeStudio}
          onPlayExample={() => openPlay(0, "example")}
          onAbortUpdate={() => updateController.current?.abort()}
        />
        <StoryEntryDialog
          open={Boolean(entryChoiceLabel)}
          choiceLabel={entryChoiceLabel}
          localDraftStatus={localDraftStatus}
          onCancel={cancelEntryChoice}
          onConfirm={() => {
            const action = entryChoiceRef.current;
            cancelEntryChoice();
            action?.();
          }}
        />
        <ImportIssuesDialog
          open={importIssues.open}
          issues={importIssues.issues}
          source={importIssues.source}
          onClose={() => setImportIssues({ open: false, issues: [] })}
        />
        <ImportConfirmationDialog
          open={importConfirmation.open}
          project={importConfirmation.project}
          fileName={importConfirmation.fileName}
          onConfirm={confirmImport}
          onCancel={() => setImportConfirmation({ open: false, project: null })}
        />
      </>
    );
  }

  const currentLocation = selectedChapter
    ? `${selectedChapter.order}장 〈${
        selectedChapter.title || "제목 없음"
      }〉${
        selectedLine
          ? ` › ${selectedLineIndex + 1}컷/${selectedChapterLines.length} › ${
              editorMode === "scene"
                ? selectedLine.type === "narration"
                  ? "해설 컷 편집"
                  : `${selectedLine.speakerName || "화자 없음"}의 대사 편집`
                : "이 장 대본"
            }`
          : ""
      }`
    : "아직 장이 없어요";

  return (
    <StudioShell
      currentLocation={currentLocation}
      saveStatus={saveStatus}
      busy={Boolean(busy)}
      projectToolsOpen={projectToolsOpen}
      onReturnHome={returnHome}
      onToggleProjectTools={() =>
        setProjectToolsOpen((current) => !current)
      }
    >

      <button
        className="mobile-panel-toggle project-info-toggle"
        aria-expanded={mobileProjectOpen}
        onClick={() => setMobileProjectOpen((current) => !current)}
      >
        <span>
          <strong>작품 제목·소개</strong>
          <small>
            {draft.title || "제목 없음"} · 장 {draft.chapters.length} · 컷{" "}
            {draft.lines.length}
          </small>
        </span>
        <b>{mobileProjectOpen ? "접기" : "펼치기"}</b>
      </button>

      <section
        className={`creator-project-bar ${
          mobileProjectOpen ? "mobile-open" : ""
        }`}
      >
        <label>
          <span>이야기 제목</span>
          <input
            ref={titleInputRef}
            className={
              highlightedApplyIssueId === "missing-title"
                ? "issue-target-highlight"
                : undefined
            }
            value={draft.title}
            onChange={(event) =>
              setDraft((project) => ({ ...project, title: event.target.value }))
            }
            placeholder="우리 이야기의 제목"
          />
        </label>
        <label>
          <span>작품 소개</span>
          <input
            value={draft.description}
            onChange={(event) =>
              setDraft((project) => ({
                ...project,
                description: event.target.value,
              }))
            }
            placeholder="이 이야기를 한 문장으로 소개해 보세요."
          />
        </label>
        <div className="project-counts">
          <span>장 {draft.chapters.length}</span>
          <span>컷 {draft.lines.length}</span>
        </div>
      </section>

      {projectToolsOpen && (
        <section
          id="studio-project-tools"
          className="project-tools"
          aria-label="파일과 복구"
        >
          <div>
            <span className="eyebrow">파일·복구</span>
            <h2>작품을 불러오거나 따로 보관하기</h2>
            <p>평소에는 닫아 두고 이야기 쓰기에 집중할 수 있어요.</p>
          </div>
          <div className="project-tool-actions">
            <button onClick={() => excelInputRef.current?.click()}>
              Excel에서 불러오기
            </button>
            <button onClick={saveExcelFile}>Excel로 저장</button>
            <a
              href="/templates/놀퀴즈_스토리_템플릿.xlsx"
              download
            >
              빈 양식 받기
            </a>
            {(checkpoints.length > 0 || backupFound) && (
              <button onClick={restoreBackup}>방금 전으로 복구</button>
            )}
            <button className="danger-link" onClick={requestBlankProject}>
              새 작품 시작
            </button>
          </div>
          <div className="google-tool-row">
            <input
              type="url"
              value={draft.sheetUrl}
              onChange={(event) =>
                setDraft((project) => ({
                  ...project,
                  sheetUrl: event.target.value,
                  sheetEditable: false,
                }))
              }
              placeholder="공개 Google 시트 주소"
              aria-label="공개 Google 시트 주소"
            />
            <button onClick={() => updateFromSheet()}>시트에서 불러오기</button>
          </div>
          <p>
            복구 기록은 이 기기에서만 남아요. 브라우저 데이터를 지우거나 기기를
            바꾸면 되찾을 수 없으니 중요한 작품은 Excel로 따로 보관해 주세요.
          </p>
          <input
            ref={excelInputRef}
            hidden
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => openExcelFile(event.target.files?.[0])}
          />
        </section>
      )}

      <p className="creator-notice" role="status">
        {notice}
      </p>

      {applyIssuesVisible && applyIssues.length > 0 && (
        <section
          className="story-apply-issues"
          role="alert"
          aria-label="플레이 적용 전 고칠 곳"
        >
          <div className="story-apply-issues-heading">
            <div>
              <span>플레이에 적용하기 전</span>
              <strong>고칠 곳 {applyIssues.length}개</strong>
            </div>
            <small>문제를 누르면 직접 고칠 입력칸으로 이동해요.</small>
          </div>
          <ol>
            {applyIssues.map((issue) => (
              <li key={issue.id}>
                <button
                  type="button"
                  className={
                    highlightedApplyIssueId === issue.id ? "active" : ""
                  }
                  onClick={() => moveToApplyIssue(issue)}
                >
                  <span>
                    {highlightedApplyIssueId === issue.id
                      ? "지금 고치는 문제"
                      : "고칠 곳으로 이동"}
                  </span>
                  <strong>{issue.message}</strong>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      {undoDelete && (
        <section className="creator-undo" role="status">
          <span>{undoDelete.description}을(를) 방금 삭제했어요.</span>
          <button type="button" onClick={undoLastDeletion}>
            방금 삭제 되돌리기
          </button>
        </section>
      )}

      {continuationPoint && workspaceMode === "create" && (
        <section
          className="continuation-edit-bar"
          aria-label="이어쓰기 편집 안내"
        >
          <div>
            <span className="eyebrow">이어쓰기 작품</span>
            <strong>
              앞이야기도 고치고, 이어 쓸 곳으로 돌아올 수 있어요.
            </strong>
            <small>
              준비된 컷도 내 이야기의 일부예요. 처음부터 차례로 읽으며
              대사와 해설을 바꿔 보세요.
            </small>
          </div>
          <div>
            <button onClick={editStoryFromBeginning}>
              처음부터 읽고 고치기
            </button>
            <button
              className={isAtContinuationPoint ? "active" : ""}
              onClick={returnToContinuationPoint}
            >
              이어 쓸 곳으로
            </button>
          </div>
        </section>
      )}

      <StudioPrimaryNav
        workspaceMode={workspaceMode}
        canPlay={active.lines.length > 0}
        onWorkspaceModeChange={setWorkspaceMode}
        onPlay={() => openPlay(0)}
      />

      {workspaceMode === "plan" ? (
        <StoryPlanScreen
          draft={draft}
          planningView={planningView}
          onPlanningViewChange={setPlanningView}
          readyStoryItems={readyStoryItems}
          storyChecklist={storyChecklist}
          selectedStructure={selectedStructure}
          onUpdatePlanning={updatePlanning}
          onTitleChange={(title) =>
            setDraft((project) => ({ ...project, title }))
          }
          onDescriptionChange={(description) =>
            setDraft((project) => ({ ...project, description }))
          }
          creativeMemoCreatorStep={creativeMemoCreatorStep}
          setCreativeMemoCreatorStep={setCreativeMemoCreatorStep}
          orderedCreativeMemos={orderedCreativeMemos}
          onAddCreativeMemo={addCreativeMemo}
          onOpenCreativeMemo={(id) => setSelectedCreativeMemoId(id)}
          onDeleteCreativeMemo={deleteCreativeMemo}
          sortedChapters={sortedChapters}
          selectedChapter={selectedChapter ?? null}
          selectedChapterLines={selectedChapterLines}
          continuationPoint={continuationPoint}
          onAddChapter={addChapter}
          onRemoveChapter={removeChapter}
          onMoveChapter={(chapterId, direction) => {
            setDraft(project => {
              const result = moveStoryChapter({ chapters: project.chapters, chapterId, direction });
              return result.ok ? { ...project, chapters: result.chapters } : project;
            });
          }}
          onUpdateChapter={updateChapter}
          onOpenChapterPlan={openChapterPlan}
          onOpenChapterWriter={openChapterWriter}
          onSwitchToCreate={() => setWorkspaceMode("create")}
          favoriteAssets={favoriteAssets}
          recentAssets={recentAssets}
          onToggleFavorite={toggleFavorite}
          onAddAssetToChapter={(id, type) => addAssetToChapter(id, type)}
          onRemoveAssetFromChapter={(id, type) => removeAsset(id, type)}
          onAddSpeaker={addSpeaker}
        />
      ) : (
        <section className="making-workspace">
          <header
            className={`making-toolbar ${
              mobileEditorToolsOpen ? "mobile-open" : ""
            }`}
          >
            <button
              className="mobile-panel-toggle editor-tools-toggle"
              aria-expanded={mobileEditorToolsOpen}
              onClick={() => setMobileEditorToolsOpen((current) => !current)}
            >
              <span>
                <strong>편집 방법</strong>
                <small>
                  {editorMode === "chapter" ? "이 장 대본" : "컷 꾸미기"} ·{" "}
                  {imageView === "text" ? "글만" : "작은 그림"}
                </small>
              </span>
              <b>{mobileEditorToolsOpen ? "접기" : "펼치기"}</b>
            </button>
            <div className="editor-mode-switch" aria-label="편집 화면 선택">
              <button
                className={editorMode === "chapter" ? "active" : ""}
                onClick={() => switchStoryEditorView("chapter")}
              >
                <strong>이 장 대본</strong>
                <small>컷을 이어 읽으며 써요</small>
              </button>
              <button
                className={editorMode === "scene" ? "active" : ""}
                onClick={() => switchStoryEditorView("scene")}
                disabled={!selectedLine}
              >
                <strong>컷 꾸미기</strong>
                <small>인물과 배경까지 꾸며요</small>
              </button>
            </div>
            <div className="location-pill">
              <span>지금 고치는 곳</span>
              <strong>{currentLocation}</strong>
            </div>
            <label className="view-setting">
              <span>보기 설정</span>
              <select
                value={imageView}
                onChange={(event) =>
                  setImageView(event.target.value as ImageView)
                }
              >
                <option value="text">글만 보기</option>
                <option value="small">작은 그림 함께 보기</option>
              </select>
            </label>
            <button
              className={`memo-popup-toggle ${
                memoPopupOpen ? "active" : ""
              }`}
              aria-haspopup="dialog"
              aria-expanded={memoPopupOpen}
              onClick={() =>
                memoPopupOpen ? returnFromMemoPopup() : openMemoPopup()
              }
            >
              <strong>창작 메모</strong>
              <small>
                {filledMemoCount}개 · {memoPopupOpen ? "닫기" : "찾아보기"}
              </small>
            </button>
          </header>

          {selectedChapter ? (
            <div className="making-layout">
              <aside className="chapter-rail">
                <div className="chapter-rail-heading">
                  <div>
                    <span className="eyebrow">이야기 순서</span>
                    <strong>장(場)</strong>
                  </div>
                  <button onClick={addChapter} aria-label="장 추가">
                    +
                  </button>
                </div>
                {sortedChapters.map((chapter, chapterIndex) => {
                  const chapterKeys = canonicalizeStoryStageKeys(chapter.storyStageKeys);
                  const arcLabel =
                    continuationPoint?.chapterId === chapter.id
                      ? "이어쓰기"
                      : formatStoryStageLabels(
                          chapterKeys,
                          selectedStructure.mode,
                          chapterArcLabel(
                            chapterIndex,
                            sortedChapters.length,
                            selectedStructure.steps,
                          ),
                        );
                  return (
                    <button
                      key={chapter.id}
                      className={
                        chapter.id === selectedChapter.id ? "active" : ""
                      }
                      onClick={() => selectChapter(chapter.id)}
                    >
                      <span>{chapter.order}</span>
                      <div>
                        <strong>
                          {chapter.title || `${chapter.order}장`}
                        </strong>
                        <small>
                          {arcLabel} ·{" "}
                          {
                            draft.lines.filter(
                              (line) => line.chapterId === chapter.id,
                            ).length
                          }
                          개 컷
                        </small>
                      </div>
                    </button>
                  );
                })}
              </aside>

              <div className="mobile-chapter-picker">
                <label>
                  <span>장 선택</span>
                  <select
                    value={selectedChapter.id}
                    onChange={(event) => selectChapter(event.target.value)}
                  >
                    {sortedChapters.map((chapter) => (
                      <option value={chapter.id} key={chapter.id}>
                        {chapter.order}장. {chapter.title || "제목 없음"}
                      </option>
                    ))}
                  </select>
                </label>
                <button onClick={addChapter}>+ 장</button>
              </div>

              <section className="editor-main">
                <header className="chapter-editor-heading">
                  <div>
                    <span className="eyebrow">
                      {selectedChapter.order}장
                    </span>
                    <h1>{selectedChapter.title || "제목 없는 장"}</h1>
                    <p>
                      컷 {selectedChapterLines.length}개 · 대사{" "}
                      {
                        selectedChapterLines.filter(
                          (line) => line.type === "dialogue",
                        ).length
                      }
                      개 · 해설{" "}
                      {
                        selectedChapterLines.filter(
                          (line) => line.type === "narration",
                        ).length
                      }
                      개
                    </p>
                  </div>
                  <div>
                    <button
                      className="quiet-button"
                      onClick={() =>
                        setChapterResourcesOpen((current) => !current)
                      }
                    >
                      장의 자료 {chapterResourcesOpen ? "닫기" : "설정"}
                    </button>
                    <button
                      className="ghost-button"
                      onClick={playSelectedChapter}
                      disabled={
                        !active.lines.some(
                          (line) => line.chapterId === selectedChapter.id,
                        )
                      }
                    >
                      이 장부터 보기
                    </button>
                  </div>
                </header>

                <section className="chapter-context-strip">
                  <div>
                    <span>이번 장에서 달라지는 일</span>
                    <strong>
                      {selectedChapter.summary ||
                        "이 장에서 생길 가장 중요한 변화를 적어 보세요."}
                    </strong>
                  </div>
                  <b aria-hidden="true">→</b>
                  <div>
                    <span>그 결과 다음에 생기는 일</span>
                    <strong>
                      {selectedChapter.nextChapterIdea ||
                        "다음 사건으로 이어질 내용을 정해 보세요."}
                    </strong>
                  </div>
                </section>

                {chapterResourcesOpen && (
                  <section className="chapter-resource-panel">
                    <div className="panel-title">
                      <div>
                        <span className="eyebrow">장의 자료</span>
                        <h2>이 장에서 사용할 것만 고르기</h2>
                      </div>
                      <button
                        className="quiet-button"
                        onClick={() => setChapterResourcesOpen(false)}
                      >
                        닫기
                      </button>
                    </div>
                    <section className="resource-pool">
                      <div className="resource-pool-heading">
                        <strong>화자 이름</strong>
                        <span>{selectedChapter.chapterSpeakerNames.length}개</span>
                      </div>
                      <div className="resource-chip-list">
                        {selectedChapter.chapterSpeakerNames.map((name) => (
                          <span className="resource-chip" key={name}>
                            {name}
                          </span>
                        ))}
                        {selectedChapter.chapterSpeakerNames.length === 0 && (
                          <span className="empty-resource-copy">
                            아직 고른 화자가 없어요.
                          </span>
                        )}
                      </div>
                      <AddSpeaker
                        onAdd={(name) => addSpeaker(name, false)}
                      />
                    </section>
                    <ResourcePool
                      title="캐릭터 이미지"
                      type="character"
                      ids={selectedChapter.characterAssetIds}
                      favoriteIds={favoriteAssets}
                      recentIds={recentAssets}
                      onToggleFavorite={toggleFavorite}
                      onAdd={(id) => addAssetToChapter(id, "character")}
                      onRemove={(id) => removeAsset(id, "character")}
                    />
                    <ResourcePool
                      title="장소·배경"
                      type="background"
                      ids={selectedChapter.backgroundAssetIds}
                      favoriteIds={favoriteAssets}
                      recentIds={recentAssets}
                      onToggleFavorite={toggleFavorite}
                      onAdd={(id) => addAssetToChapter(id, "background")}
                      onRemove={(id) => removeAsset(id, "background")}
                    />
                    <div className="chapter-default-grid">
                      <ImageField
                        label="장의 기본 배경"
                        type="background"
                        value={selectedChapter.backgroundId}
                        allowedIds={selectedChapter.backgroundAssetIds}
                        favoriteIds={favoriteAssets}
                        recentIds={recentAssets}
                        onToggleFavorite={toggleFavorite}
                        onUse={(id) => addAssetToChapter(id, "background")}
                        onChange={(backgroundId) =>
                          updateChapter(selectedChapter.id, { backgroundId })
                        }
                      />
                      <ImageField
                        label="기본 왼쪽 이미지"
                        type="character"
                        value={selectedChapter.leftAssetId}
                        allowedIds={selectedChapter.characterAssetIds}
                        favoriteIds={favoriteAssets}
                        recentIds={recentAssets}
                        onToggleFavorite={toggleFavorite}
                        onUse={(id) => addAssetToChapter(id, "character")}
                        onChange={(leftAssetId) =>
                          updateChapter(selectedChapter.id, { leftAssetId })
                        }
                      />
                      <ImageField
                        label="기본 오른쪽 이미지"
                        type="character"
                        value={selectedChapter.rightAssetId}
                        allowedIds={selectedChapter.characterAssetIds}
                        favoriteIds={favoriteAssets}
                        recentIds={recentAssets}
                        onToggleFavorite={toggleFavorite}
                        onUse={(id) => addAssetToChapter(id, "character")}
                        onChange={(rightAssetId) =>
                          updateChapter(selectedChapter.id, { rightAssetId })
                        }
                      />
                    </div>
                  </section>
                )}

                {editorMode === "chapter" ? (
                  <ScriptScreen
                    draft={draft}
                    selectedChapter={selectedChapter}
                    selectedChapterLines={selectedChapterLines}
                    selectedLine={selectedLine}
                    selectedLineIndex={selectedLineIndex}
                    imageView={imageView}
                    highlightedApplyIssue={highlightedApplyIssue}
                    revisionResponses={revisionResponses}
                    onChooseRevisionResponse={(promptId, response) =>
                      chooseRevisionResponse(draft, promptId, response)
                    }
                    onSelectLine={(lineId) => setSelectedLineId(lineId)}
                    onChangeLineType={(lineId, type) =>
                      changeLineType(lineId, type)
                    }
                    onUpdateLine={(lineId, patch) =>
                      updateLine(lineId, patch)
                    }
                    onOpenStoryEditorScene={(line) =>
                      openStoryEditorScene(line)
                    }
                    onMoveLine={(lineId, delta) =>
                      moveLine(lineId, delta)
                    }
                    onDuplicateLine={(lineId) =>
                      duplicateLine(lineId)
                    }
                    onRemoveLine={(lineId) =>
                      removeLine(lineId)
                    }
                    onAddLine={(type) => addLine(type)}
                    sceneCardRefs={sceneCardRefs}
                    speakerNameRefs={speakerNameRefs}
                    lineBodyRefs={lineBodyRefs}
                  />
                ) : selectedLine ? (
                  <SceneFocusEditor
                    draft={draft}
                    selectedChapter={selectedChapter}
                    selectedChapterLines={selectedChapterLines}
                    selectedLine={selectedLine}
                    selectedLineIndex={selectedLineIndex}
                    selectedStoryLineIndex={selectedStoryLineIndex}
                    orderedDraftLines={orderedDraftLines}
                    sceneSettingsOpen={sceneSettingsOpen}
                    onSetSceneSettingsOpen={setSceneSettingsOpen}
                    highlightedApplyIssue={highlightedApplyIssue}
                    favoriteAssets={favoriteAssets}
                    recentAssets={recentAssets}
                    onToggleFavorite={toggleFavorite}
                    onAddAssetToChapter={addAssetToChapter}
                    onMoveThroughStory={moveThroughStory}
                    onChangeLineType={changeLineType}
                    onUpdateLine={updateLine}
                    onAddSpeaker={addSpeaker}
                    onCopySceneStaging={copySceneStaging}
                    onSwitchStoryEditorView={switchStoryEditorView}
                    onAddLine={addLine}
                    lineBodyRefs={lineBodyRefs}
                    speakerNameRefs={speakerNameRefs}
                  />
                ) : (
                  <div className="empty-creator-state">
                    <h2>집중해서 편집할 컷이 없어요</h2>
                    <p>빈 대사 또는 해설 컷을 만들면 바로 커서가 놓입니다.</p>
                    <div>
                      <button
                        className="primary-button"
                        onClick={() => addLine("dialogue", true)}
                      >
                        + 대사 컷
                      </button>
                      <button
                        className="ghost-button"
                        onClick={() => addLine("narration", true)}
                      >
                        + 해설 컷
                      </button>
                    </div>
                  </div>
                )}
              </section>
              {memoPopupOpen && (
                <MemoPopup
                  draft={draft}
                  currentLocation={currentLocation}
                  memoWindowSize={memoWindowSize}
                  onSetMemoWindowSize={setMemoWindowSize}
                  onReturnFromMemoPopup={returnFromMemoPopup}
                  memoSearch={memoSearch}
                  onSetMemoSearch={setMemoSearch}
                  memoScope={memoScope}
                  onSetMemoScope={setMemoScope}
                  normalizedMemoSearch={normalizedMemoSearch}
                  filteredMemoSearchResults={filteredMemoSearchResults}
                  onOpenMemoSearchResult={openMemoSearchResult}
                  onOpenVisibleMemoSections={openVisibleMemoSections}
                  onCloseAllMemoSections={closeAllMemoSections}
                  memoSectionsOpen={memoSectionsOpen}
                  onSetMemoSectionOpen={setMemoSectionOpen}
                  memoScopeAllowsSection={memoScopeAllowsSection}
                  selectedStructure={selectedStructure}
                  selectedChapter={selectedChapter}
                  selectedLine={selectedLine}
                  selectedLineIndex={selectedLineIndex}
                  orderedCreativeMemos={orderedCreativeMemos}
                  onUpdatePlanning={updatePlanning}
                  onUpdateChapter={updateChapter}
                  onUpdateLine={updateLine}
                  onSelectCreativeMemoId={setSelectedCreativeMemoId}
                />
              )}
            </div>
          ) : (
            <section className="empty-creator-state no-chapter">
              <span>1</span>
              <h1>첫 장부터 시작하세요</h1>
              <p>
                구상 화면에서 계획해도 되고, 바로 빈 컷을 만들어 써도 돼요.
              </p>
              <div>
                <button
                  className="ghost-button"
                  onClick={() => setWorkspaceMode("plan")}
                >
                  구상부터 하기
                </button>
                <button className="primary-button" onClick={addChapter}>
                  + 첫 장 만들기
                </button>
              </div>
            </section>
          )}
        </section>
      )}

      {hasUnappliedChanges && (
        <div className={workspaceMode === "plan" ? "plan-apply-container" : undefined}>
          <StudioApplyDock onApply={applyDraft} />
        </div>
      )}

      <footer className="creator-footer">
        <span>기본 제공 이미지 © 놀퀴즈</span>
        <span>토끼와 자라·옹고집전 이미지는 학생 작품 제작에 사용 가능</span>
      </footer>

      {blankConfirmOpen && (
        <ModalDialog
          overlayClassName="blank-confirm-overlay"
          dialogClassName="blank-confirm-dialog"
          label="빈 작품 시작 확인"
          onClose={() => setBlankConfirmOpen(false)}
        >
          <span className="blank-confirm-mark">새 작품</span>
          <h2>완전히 빈 작품을 시작할까요?</h2>
          <p>현재 편집본은 직전 편집본으로 백업한 뒤 새 작품을 엽니다.</p>
          <div>
            <button
              className="ghost-button"
              onClick={() => setBlankConfirmOpen(false)}
            >
              아니요, 돌아가기
            </button>
            <button className="danger-button" onClick={startBlankProject}>
              빈 작품 열기
            </button>
          </div>
        </ModalDialog>
      )}

      {hydrated &&
        selectedCreativeMemo &&
        createPortal(
          <div className="creative-memo-editor-overlay" role="presentation">
            <CreativeMemoEditor
              memo={selectedCreativeMemo}
              chapterTargets={creativeMemoLinkChapters}
              lineTargets={selectedCreativeMemoLineTargets}
              linkResolution={
                selectedCreativeMemoLinkResolution ?? {
                  status: "unlinked",
                  label: "아직 연결한 장이나 컷이 없어요.",
                }
              }
              onClose={() => setSelectedCreativeMemoId(null)}
              onChapterLinkChange={(chapterId) =>
                updateCreativeMemo(selectedCreativeMemo.id, (memo) =>
                  setCreativeMemoChapterLink(memo, chapterId),
                )
              }
              onLineLinkChange={(lineId) =>
                updateCreativeMemo(selectedCreativeMemo.id, (memo) =>
                  setCreativeMemoLineLink({
                    memo,
                    chapters: draft.chapters,
                    lines: draft.lines,
                    lineId,
                  }),
                )
              }
              onTitleChange={(value) =>
                updateCreativeMemo(selectedCreativeMemo.id, (memo) => ({
                  ...memo,
                  title: value,
                }))
              }
              onFieldChange={(fieldId, value) =>
                updateCreativeMemo(selectedCreativeMemo.id, (memo) => ({
                  ...memo,
                  fields: memo.fields.map((field) =>
                    field.id === fieldId ? { ...field, value } : field,
                  ),
                }))
              }
              onAddField={(label, source) =>
                addCreativeMemoField(selectedCreativeMemo.id, label, source)
              }
              onMoveField={(fieldId, direction) =>
                moveCreativeMemoField(
                  selectedCreativeMemo.id,
                  fieldId,
                  direction,
                )
              }
              onDeleteField={(fieldId) =>
                deleteCreativeMemoField(selectedCreativeMemo.id, fieldId)
              }
              onDeleteMemo={() => deleteCreativeMemo(selectedCreativeMemo.id)}
            />
          </div>,
          document.body,
        )}

      {busy && (
        <div className="update-overlay" role="dialog" aria-modal="true">
          <div className="update-card">
            <span className="update-spinner" aria-hidden="true" />
            <span className="eyebrow">
              {busy === "sheet"
                ? "Google 시트 불러오기"
                : busy === "excel"
                  ? "Excel 작업"
                  : "플레이 적용"}
            </span>
            <h2>{busyStep}</h2>
            <p>완료될 때까지 다른 조작을 잠시 멈춥니다.</p>
            <button
              className="stop-button"
              onClick={() => updateController.current?.abort()}
            >
              업데이트 강제 중지
            </button>
          </div>
        </div>
      )}

      <ImportIssuesDialog
        open={importIssues.open}
        issues={importIssues.issues}
        source={importIssues.source}
        onClose={() => setImportIssues({ open: false, issues: [] })}
      />
      <ImportConfirmationDialog
        open={importConfirmation.open}
        project={importConfirmation.project}
        fileName={importConfirmation.fileName}
        onConfirm={confirmImport}
        onCancel={() => setImportConfirmation({ open: false, project: null })}
      />
    </StudioShell>
  );
}
