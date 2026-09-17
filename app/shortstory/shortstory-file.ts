import { parseShortStory, type ShortStoryProject } from './shortstory-data';
export const MAX_SHORTSTORY_BYTES = 10 * 1024 * 1024;
export function encodeShortStory(project: ShortStoryProject) {
  const text = JSON.stringify({ manifest: { format: 'shortstory', version: 1, kind: 'project' }, project: parseShortStory(project) });
  if (new TextEncoder().encode(text).length > MAX_SHORTSTORY_BYTES) throw Error('작업 파일은 10MB 이하로 저장할 수 있어요.');
  return text;
}
export function decodeShortStory(text: string) {
  if (new TextEncoder().encode(text).length > MAX_SHORTSTORY_BYTES) throw Error('파일은 10MB 이하로 열 수 있어요.');
  let data;
  try { data = JSON.parse(text); } catch { throw Error('파일 내용을 읽지 못했어요. 원래 작업 파일을 다시 선택해 주세요.'); }
  if (data?.manifest?.format !== 'shortstory' || data.manifest.version !== 1 || data.manifest.kind !== 'project') throw Error('지원하지 않는 숏스토리 작업 파일 버전이에요.');
  return parseShortStory(data.project);
}
export function downloadFile(content: BlobPart, title: string, extension: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a'); a.href = url;
  a.download = `${(title || '제목 없는 이야기').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0,80)}.${extension}`;
  a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadShortStory(project: ShortStoryProject) { downloadFile(encodeShortStory(project), project.title, 'shortstory'); }
