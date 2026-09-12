import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import test from 'node:test';
test('화면 설정은 손상된 값에서 복구하고 안전한 범위를 유지한다',()=>{
 const values=JSON.parse(execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
 import {parseDisplaySettings} from './app/story-display-settings.ts';
 console.log(JSON.stringify([parseDisplaySettings(null),parseDisplaySettings('{broken'),parseDisplaySettings(JSON.stringify({version:1,dialoguePercent:100,characterScales:{'옹고집전:아이':5,'옹고집전:옹고집':900,bad:'x'}})),parseDisplaySettings(JSON.stringify({version:1,dialoguePercent:45,characterScales:{'옹고집전:아이':80}}))]));`],{encoding:'utf8'}));
 assert.deepEqual(values[0],{dialoguePercent:35,characterScales:{}});
 assert.deepEqual(values[1],values[0]);
 assert.deepEqual(values[2],{dialoguePercent:60,characterScales:{'옹고집전:아이':40,'옹고집전:옹고집':140}});
 assert.deepEqual(values[3],{dialoguePercent:45,characterScales:{'옹고집전:아이':80}});
});
