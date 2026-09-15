import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

test('reading progress manages per-project auto-save and manual slots 1-3 with isolated storage and safe fallback', () => {
  const script = `
    import {
      loadProjectReadingProgress,
      saveReadingProgressSlot,
      deleteReadingProgressSlot,
      getLatestReadingSaveSlot,
      clearProjectReadingProgress,
      findSafeTargetIndex,
      formatSavedDate,
      STORY_READING_PROGRESS_STORAGE_KEY,
      READING_SAVE_SLOT_LABELS
    } from './app/story-reading-progress.ts';

    const memory = new Map();
    const mockStorage = () => ({
      getItem: (k) => memory.get(k) ?? null,
      setItem: (k, v) => memory.set(k, String(v)),
      removeItem: (k) => memory.delete(k)
    });

    // 1. Initial state: nothing stored
    const initial = loadProjectReadingProgress('proj-rabbit', mockStorage);

    // 2. Save auto slot
    const autoSlot = {
      slotId: 'auto',
      slotLabel: '자동저장 1',
      index: 5,
      lineId: 'line-5',
      chapterTitle: '제1장. 용궁의 위기',
      cutNumber: 6,
      totalCuts: 40,
      dialoguePreview: '토끼의 간을 구해오너라!',
      speakerName: '용왕',
      history: [{ lineId: 'line-1' }, { lineId: 'line-3', choiceLabel: '출발하기' }],
      savedAt: '2026-09-15T10:00:00.000Z'
    };
    saveReadingProgressSlot('proj-rabbit', autoSlot, mockStorage);

    // 3. Save manual-1 slot
    const manual1Slot = {
      slotId: 'manual-1',
      slotLabel: '수동저장 1',
      index: 12,
      lineId: 'line-12',
      chapterTitle: '제2장. 육지로 간 자라',
      cutNumber: 13,
      totalCuts: 40,
      dialoguePreview: '토끼 선생, 나와 함께 용궁에 가지 않겠소?',
      speakerName: '자라',
      history: [{ lineId: 'line-1' }],
      savedAt: '2026-09-15T10:15:00.000Z'
    };
    saveReadingProgressSlot('proj-rabbit', manual1Slot, mockStorage);

    // 4. Save manual-2 slot for another project (isolation test)
    saveReadingProgressSlot('proj-onggojib', {
      slotId: 'manual-1',
      slotLabel: '수동저장 1',
      index: 20,
      lineId: 'ong-20',
      chapterTitle: '제3장. 두 명의 옹고집',
      cutNumber: 21,
      totalCuts: 71,
      dialoguePreview: '내가 진짜 옹고집이다!',
      history: [],
      savedAt: '2026-09-15T11:00:00.000Z'
    }, mockStorage);

    const rabbitProgress = loadProjectReadingProgress('proj-rabbit', mockStorage);
    const onggojibProgress = loadProjectReadingProgress('proj-onggojib', mockStorage);

    // 5. getLatestReadingSaveSlot should pick manual-1 for rabbit (10:15 > 10:00)
    const latestRabbit = getLatestReadingSaveSlot(rabbitProgress);

    // 6. Delete manual-1 from rabbit
    deleteReadingProgressSlot('proj-rabbit', 'manual-1', mockStorage);
    const rabbitAfterDelete = loadProjectReadingProgress('proj-rabbit', mockStorage);
    const latestAfterDelete = getLatestReadingSaveSlot(rabbitAfterDelete);

    // 7. findSafeTargetIndex test
    const dummyLines = [
      { id: 'line-0' }, { id: 'line-1' }, { id: 'line-moved' }, { id: 'line-5' }
    ];
    // Exact index matches
    const exactMatch = findSafeTargetIndex(dummyLines, { index: 3, lineId: 'line-5' });
    // Line moved to another index
    const movedMatch = findSafeTargetIndex(dummyLines, { index: 1, lineId: 'line-moved' });
    // Line removed entirely
    const removedFallback = findSafeTargetIndex(dummyLines, { index: 99, lineId: 'line-deleted' });

    // 8. Corrupt storage test
    memory.set(STORY_READING_PROGRESS_STORAGE_KEY, '{ invalid json');
    const corruptLoaded = loadProjectReadingProgress('proj-rabbit', mockStorage);

    // 9. Date formatting
    const formatted = formatSavedDate('2026-09-15T15:30:00.000Z');

    console.log(JSON.stringify({
      initialNull: initial === null,
      rabbitSlotCount: Object.keys(rabbitProgress.slots).length,
      rabbitHasAuto: Boolean(rabbitProgress.slots.auto),
      rabbitHasManual1: Boolean(rabbitProgress.slots['manual-1']),
      onggojibSlotCount: Object.keys(onggojibProgress.slots).length,
      latestRabbitSlotId: latestRabbit?.slotId,
      rabbitAfterDeleteCount: Object.keys(rabbitAfterDelete.slots).length,
      latestAfterDeleteSlotId: latestAfterDelete?.slotId,
      exactMatch,
      movedMatch,
      removedFallback,
      corruptLoadedNull: corruptLoaded === null,
      formattedValid: typeof formatted === 'string' && formatted.length > 0
    }));
  `;

  const output = execFileSync(process.execPath, [
    '--disable-warning=ExperimentalWarning',
    '--experimental-strip-types',
    '--input-type=module',
    '-e',
    script
  ], { encoding: 'utf8' });

  const result = JSON.parse(output.trim());
  assert.equal(result.initialNull, true);
  assert.equal(result.rabbitSlotCount, 2);
  assert.equal(result.rabbitHasAuto, true);
  assert.equal(result.rabbitHasManual1, true);
  assert.equal(result.onggojibSlotCount, 1);
  assert.equal(result.latestRabbitSlotId, 'manual-1');
  assert.equal(result.rabbitAfterDeleteCount, 1);
  assert.equal(result.latestAfterDeleteSlotId, 'auto');
  assert.equal(result.exactMatch, 3);
  assert.equal(result.movedMatch, 2);
  assert.equal(result.removedFallback, 3);
  assert.equal(result.corruptLoadedNull, true);
  assert.equal(result.formattedValid, true);
});

test('reading progress supports all 4 slots (auto, manual-1, manual-2, manual-3) and handles storage exceptions gracefully', () => {
  const script = `
    import {
      loadProjectReadingProgress,
      saveReadingProgressSlot,
      clearProjectReadingProgress,
      getLatestReadingSaveSlot,
      READING_SAVE_SLOT_LABELS,
      READING_SAVE_SLOT_IDS
    } from './app/story-reading-progress.ts';

    const memory = new Map();
    const mockStorage = () => ({
      getItem: (k) => memory.get(k) ?? null,
      setItem: (k, v) => memory.set(k, String(v)),
      removeItem: (k) => memory.delete(k)
    });

    // Save all 4 slots
    saveReadingProgressSlot('p1', {
      slotId: 'auto', slotLabel: '자동저장 1', index: 1, lineId: 'l1',
      cutNumber: 2, totalCuts: 10, dialoguePreview: '컷 2 대사',
      history: [], savedAt: '2026-09-15T12:00:00.000Z'
    }, mockStorage);

    saveReadingProgressSlot('p1', {
      slotId: 'manual-1', slotLabel: '수동저장 1', index: 3, lineId: 'l3',
      cutNumber: 4, totalCuts: 10, dialoguePreview: '컷 4 대사',
      history: [], savedAt: '2026-09-15T12:05:00.000Z'
    }, mockStorage);

    saveReadingProgressSlot('p1', {
      slotId: 'manual-2', slotLabel: '수동저장 2', index: 5, lineId: 'l5',
      cutNumber: 6, totalCuts: 10, dialoguePreview: '컷 6 대사',
      history: [], savedAt: '2026-09-15T12:10:00.000Z'
    }, mockStorage);

    saveReadingProgressSlot('p1', {
      slotId: 'manual-3', slotLabel: '수동저장 3', index: 7, lineId: 'l7',
      cutNumber: 8, totalCuts: 10, dialoguePreview: '컷 8 대사',
      history: [], savedAt: '2026-09-15T12:15:00.000Z'
    }, mockStorage);

    const full = loadProjectReadingProgress('p1', mockStorage);
    const slotCount = Object.keys(full.slots).length;
    const latestBeforeOverwrite = getLatestReadingSaveSlot(full);

    // Overwrite manual-1 with latest time
    saveReadingProgressSlot('p1', {
      slotId: 'manual-1', slotLabel: '수동저장 1', index: 9, lineId: 'l9',
      cutNumber: 10, totalCuts: 10, dialoguePreview: '컷 10 대사 (최종)',
      history: [], savedAt: '2026-09-15T12:30:00.000Z'
    }, mockStorage);

    const updated = loadProjectReadingProgress('p1', mockStorage);
    const latestAfterOverwrite = getLatestReadingSaveSlot(updated);

    // Storage throw exception (e.g. quota exceeded or disabled storage)
    const errorStorage = () => { throw new Error('QuotaExceededError'); };
    const safeSave = saveReadingProgressSlot('p1', {
      slotId: 'manual-2', slotLabel: '수동저장 2', index: 2, lineId: 'l2',
      cutNumber: 3, totalCuts: 10, dialoguePreview: '오류 테스트',
      history: [], savedAt: '2026-09-15T13:00:00.000Z'
    }, errorStorage);
    const safeLoad = loadProjectReadingProgress('p1', errorStorage);

    // Clear project progress
    clearProjectReadingProgress('p1', mockStorage);
    const cleared = loadProjectReadingProgress('p1', mockStorage);

    console.log(JSON.stringify({
      slotCount,
      all4Present: READING_SAVE_SLOT_IDS.every(id => Boolean(full.slots[id])),
      latestBeforeId: latestBeforeOverwrite?.slotId,
      latestAfterId: latestAfterOverwrite?.slotId,
      overwrittenCutNumber: updated.slots['manual-1']?.cutNumber,
      safeSaveFailedGracefully: safeSave === false,
      safeLoadNullGracefully: safeLoad === null,
      cleared: cleared === null
    }));
  `;

  const output = execFileSync(process.execPath, [
    '--disable-warning=ExperimentalWarning',
    '--experimental-strip-types',
    '--input-type=module',
    '-e',
    script
  ], { encoding: 'utf8' });

  const result = JSON.parse(output.trim());
  assert.equal(result.slotCount, 4);
  assert.equal(result.all4Present, true);
  assert.equal(result.latestBeforeId, 'manual-3');
  assert.equal(result.latestAfterId, 'manual-1');
  assert.equal(result.overwrittenCutNumber, 10);
  assert.equal(result.safeSaveFailedGracefully, true);
  assert.equal(result.safeLoadNullGracefully, true);
  assert.equal(result.cleared, true);
});

