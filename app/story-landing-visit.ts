/** Browser preference only; never part of a student project or exported file. */
export const LANDING_VISIT_KEY = "storygame:landing-visit:v1";
export const LANDING_VERSION = 1;
type StorageProvider = () => Pick<Storage, "getItem" | "setItem">;

export function loadLandingVisit(storage: StorageProvider): boolean {
  try {
    const value = JSON.parse(storage().getItem(LANDING_VISIT_KEY) ?? "null");
    return value?.visited === true && value.landingVersion === LANDING_VERSION;
  } catch { return false; }
}

export function markLandingVisited(storage: StorageProvider): void {
  try {
    storage().setItem(LANDING_VISIT_KEY, JSON.stringify({ visited: true, landingVersion: LANDING_VERSION }));
  } catch { /* Optional preference: blocked storage must not block entry. */ }
}
