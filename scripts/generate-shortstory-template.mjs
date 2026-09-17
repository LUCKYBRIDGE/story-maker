import { mkdir } from 'node:fs/promises';
import { createShortWorkbook } from '../app/shortstory/shortstory-workbook.ts';
import { rabbitShortStory } from '../app/shortstory/shortstory-presets.ts';
await mkdir('public/templates', {recursive:true});
await createShortWorkbook(rabbitShortStory()).xlsx.writeFile('public/templates/shortstory-template.xlsx');
console.log('숏스토리 Excel 양식 생성: public/templates/shortstory-template.xlsx');
