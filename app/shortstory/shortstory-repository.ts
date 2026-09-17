import { parseShortStory, type ShortStoryProject } from './shortstory-data';
export const SHORTSTORY_KEY = 'storygame:shortstories:v1';
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>;
/** Re-read at each write; unrelated works are retained and stale edits cannot overwrite newer ones. */
export function readShortStories(storage: Storage): ShortStoryProject[] {
  const raw = storage.getItem(SHORTSTORY_KEY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (data.version !== 1 || !Array.isArray(data.projects)) throw Error('보관함을 읽지 못했어요. 기존 데이터는 보존했어요.');
  const projects = data.projects.map(parseShortStory);
  if (new Set(projects.map((p: ShortStoryProject) => p.id)).size !== projects.length) throw Error('보관함의 작품 ID가 겹쳐요. 원본은 보존했어요.');
  return projects;
}
export function saveShortStory(storage: Storage, project: ShortStoryProject, expected?: string): ShortStoryProject[] {
  const valid = parseShortStory(project), projects = readShortStories(storage);
  const old = projects.find(p => p.id === valid.id);
  if ((expected !== undefined && !old) || (old && JSON.stringify(old) !== expected)) throw Error('다른 창에서 이 작품을 변경했어요. 작업 파일을 저장한 뒤 다시 열어 주세요.');
  const next = [...projects.filter(p => p.id !== valid.id), valid];
  storage.setItem(SHORTSTORY_KEY, JSON.stringify({ version: 1, projects: next }));
  return next;
}
export function removeShortStory(storage: Storage, project: ShortStoryProject) {
  const projects = readShortStories(storage);
  if (JSON.stringify(projects.find(p => p.id === project.id)) !== JSON.stringify(project)) throw Error('다른 창에서 작품이 바뀌었어요. 다시 열어 확인해 주세요.');
  const next = projects.filter(p => p.id !== project.id);
  storage.setItem(SHORTSTORY_KEY, JSON.stringify({ version: 1, projects: next })); return next;
}
