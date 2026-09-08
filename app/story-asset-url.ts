const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 정적 에셋 경로(예: /story-assets/..., /templates/...)에
 * 배포 환경(GitHub Pages 등)의 basePath 접두사를 안전하게 부착합니다.
 */
export function resolveAssetUrl(src: string | undefined | null): string {
  if (!src) return "";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    (BASE_PATH && src.startsWith(BASE_PATH))
  ) {
    return src;
  }
  if (src.startsWith("/")) {
    return `${BASE_PATH}${src}`;
  }
  return src;
}
