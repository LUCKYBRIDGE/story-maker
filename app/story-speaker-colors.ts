// Light/dark pairs identify speakers without changing dialogue body text.
const SPEAKER_COLORS = [
  ["#f5ca83", "#795019"], ["#9ad8ed", "#1f6379"], ["#d9b9f5", "#69428b"],
  ["#a8ddb6", "#30683e"], ["#f3b9cd", "#873c58"], ["#bfcaf9", "#465997"],
] as const;
function colorIndex(name: string): number {
  let hash = 0;
  for (const character of name.normalize("NFC").trim()) hash = (Math.imul(hash, 31) + character.codePointAt(0)!) >>> 0;
  return hash % SPEAKER_COLORS.length;
}
export function speakerColor(name: string, paper = false, names: string[] = []): string {
  const normalize = (text: string) => text.normalize("NFC").trim();
  const occupied = new Set<number>();
  const assigned = new Map<string, number>();
  for (const speaker of [...new Set([...names,name].map(normalize).filter(Boolean))].sort()) {
    let index = colorIndex(speaker);
    for (let attempt=0; attempt<SPEAKER_COLORS.length && occupied.has(index); attempt++) index=(index+1)%SPEAKER_COLORS.length;
    assigned.set(speaker,index); occupied.add(index);
  }
  return SPEAKER_COLORS[assigned.get(normalize(name)) ?? colorIndex(name)][paper ? 1 : 0];
}
