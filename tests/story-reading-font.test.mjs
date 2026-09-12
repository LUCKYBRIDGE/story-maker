import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clampReadingFontOffset,
  dialogueFontCandidates,
  readingHistoryFontSize,
} from '../app/story-reading-font.ts';

test('대사 자동 맞춤은 2px 단계의 제한된 글씨 범위를 사용한다', () => {
  assert.deepEqual(dialogueFontCandidates(0), [36, 34, 32, 30, 28]);
  assert.deepEqual(dialogueFontCandidates(2), [38, 36, 34, 32, 30]);
  assert.deepEqual(dialogueFontCandidates(-2), [34, 32, 30, 28, 26]);
  assert.deepEqual(dialogueFontCandidates(99), [40, 38, 36, 34, 32]);
  assert.deepEqual(dialogueFontCandidates(-99), [32, 30, 28, 26, 24]);
});

test('가-/가+ 기준 이동은 안전 범위와 지난 기록의 안정된 크기를 유지한다', () => {
  assert.equal(clampReadingFontOffset(3), 4);
  assert.equal(clampReadingFontOffset(-3), -2);
  assert.equal(clampReadingFontOffset(20), 4);
  assert.equal(clampReadingFontOffset(-20), -4);
  assert.equal(readingHistoryFontSize(0), 32);
  assert.equal(readingHistoryFontSize(2), 34);
  assert.equal(readingHistoryFontSize(-2), 30);
});
