import { STORY_ASSETS } from '../story-assets.ts';

export type ShortStoryPage = { id: string; order: number; title: string; text: string; backgroundId: string; leftAssetId: string; rightAssetId: string };
export type ShortStoryProject = {
  id: string; title: string; description: string; authorDisplayName: string;
  source?: { kind: 'original' | 'preset'; presetId?: string };
  cover: { backgroundId: string; characterId: string; authorNote: string };
  pages: ShortStoryPage[]; updatedAt: string;
};
export const newPage = (): ShortStoryPage => ({ id: crypto.randomUUID(), order: 1, title: '', text: '', backgroundId: '', leftAssetId: '', rightAssetId: '' });
export const newShortStory = (): ShortStoryProject => ({ id: crypto.randomUUID(), title: '나의 짧은 이야기', description: '', authorDisplayName: '', source: { kind: 'original' }, cover: { backgroundId: '', characterId: '', authorNote: '' }, pages: [newPage()], updatedAt: new Date().toISOString() });
export function normalizePages(pages: ShortStoryPage[]) { return pages.map((page, index) => ({ ...page, order: index + 1 })); }
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string';
const asset = (id: unknown, type: 'character' | 'background') => id === '' || text(id) && STORY_ASSETS.some(a => a.id === id && a.type === type);
/** Strict boundary: reject unsupported data rather than losing fields on a future-version import. */
export function parseShortStory(value: unknown): ShortStoryProject {
  if (!record(value) || !text(value.id) || !value.id || !['title','description','authorDisplayName','updatedAt'].every(k => text(value[k])) || !Number.isFinite(Date.parse(value.updatedAt as string))) throw Error('숏스토리의 제목과 저장 정보를 확인해 주세요.');
  const cover = value.cover;
  if (!record(cover) || !asset(cover.backgroundId, 'background') || !asset(cover.characterId, 'character') || !text(cover.authorNote)) throw Error('표지의 그림 정보를 확인해 주세요.');
  if (value.source !== undefined && (!record(value.source) || !['original','preset'].includes(String(value.source.kind)) || (value.source.presetId !== undefined && !text(value.source.presetId)))) throw Error('숏스토리의 출처 정보를 확인해 주세요.');
  if (!Array.isArray(value.pages) || !value.pages.length) throw Error('장면이 한 쪽 이상 필요해요.');
  const ids = new Set();
  for (const [i, p] of value.pages.entries()) {
    if (!record(p) || !text(p.id) || !p.id || ids.has(p.id) || p.order !== i + 1 || !text(p.title) || !text(p.text) || !asset(p.backgroundId, 'background') || !asset(p.leftAssetId, 'character') || !asset(p.rightAssetId, 'character')) throw Error(`${i + 1}쪽의 순서·글·그림 정보를 확인해 주세요.`);
    ids.add(p.id);
  }
  return structuredClone(value) as ShortStoryProject;
}
