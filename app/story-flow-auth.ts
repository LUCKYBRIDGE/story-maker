import type { StoryFlow } from "./story-flow";
import type { StoryProject } from "./story-data";

export const TEACHER_PASSCODE = "WAN";
const STORAGE_KEY = "storygame:teacher_passcode_unlocked";

/**
 * 교사 승인 코드("WAN") 일치 여부를 대소문자/공백 무관하게 검증합니다.
 */
export function verifyTeacherPasscode(input: string): boolean {
  if (!input) return false;
  return input.trim().toUpperCase() === TEACHER_PASSCODE;
}

/**
 * 현재 브라우저 세션에서 교사 승인 코드가 이미 인증되었는지 확인합니다.
 */
export function isTeacherPasscodeUnlocked(): boolean {
  if (typeof window === "undefined" || !window.sessionStorage) return false;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * 교사 승인 코드를 세션에 기록하여 잠금을 해제합니다.
 */
export function unlockTeacherPasscode(): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // 세션 스토리지 접근 제한 환경 무시
  }
}

/**
 * 테스트 및 초기화용 잠금 함수입니다.
 */
export function lockTeacherPasscode(): void {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // 세션 스토리지 접근 제한 환경 무시
  }
}

/**
 * 이야기 내에 선택지(choice) 컷이 몇 개 존재하는지 계산합니다.
 */
export function countChoiceCuts(project: StoryProject, excludeLineId?: string): number {
  return project.lines.filter(
    (line) => line.flow?.type === "choice" && line.id !== excludeLineId,
  ).length;
}

/**
 * 새로운 선택지 컷 생성이 허용되는지 검사합니다.
 * 기본 정책: 이야기당 최대 1번만 선택지 허용. 승인 시 무제한.
 */
export function canCreateChoice(
  project: StoryProject,
  currentLineId: string,
  unlocked = isTeacherPasscodeUnlocked(),
): { allowed: boolean; reason?: string } {
  if (unlocked) {
    return { allowed: true };
  }

  const otherChoices = countChoiceCuts(project, currentLineId);
  if (otherChoices >= 1) {
    return {
      allowed: false,
      reason:
        "선택지를 너무 많이 늘리면 갈래가 복잡해져서 이야기를 완성하기 어려워져요. 기본적으로 한 이야기당 딱 한 번만 선택지를 만들 수 있어요. 더 많은 선택지를 만들려면 선생님 승인 코드가 필요해요.",
    };
  }

  return { allowed: true };
}

/**
 * 세 번째 선택지 추가 또는 3갈래 생성이 허용되는지 검사합니다.
 * 기본 정책: 선택지는 최대 2개까지만 허용. 승인 시 3개 허용.
 */
export function canAddThirdOption(
  flow?: StoryFlow,
  unlocked = isTeacherPasscodeUnlocked(),
): { allowed: boolean; reason?: string } {
  if (unlocked) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason:
      "이야기 완성을 돕기 위해 기본적으로는 두 갈래(2개 선택지)까지만 권장해요. 세 갈래 이상 만들려면 선생님 승인 코드가 필요해요.",
  };
}
