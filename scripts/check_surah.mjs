import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(__dirname, '../constants/verses.ts');
const content = fs.readFileSync(filePath, 'utf8');

const titles = content.match(/title: '([^']+)'/g).map(t => t.split("'")[1]);
const orders = content.match(/order: (\d+)/g).map(t => parseInt(t.split(' ')[1], 10));

const surahMap = {
  'الفاتحة': 1, 'البقرة': 2, 'قريش': 106, 'النصر': 110, 'الإخلاص': 112,
};

function extractSurahNum(title) {
  const parenMatch = title.match(/\(([^)]+)\s+\d/);
  if (parenMatch) {
    const name = parenMatch[1].trim();
    if (surahMap[name]) return surahMap[name];
  }
  for (const [name, num] of Object.entries(surahMap)) {
    if (title.includes(`سورة ${name}`) || title === `سورة ${name}`) return num;
  }
  if (title === 'سورة الفاتحة') return 1;
  if (title.includes('سورة ')) {
    const suraName = title.replace('سورة ', '');
    if (surahMap[suraName]) return surahMap[suraName];
  }
  return 999;
}

titles.forEach((t, i) => {
  const num = extractSurahNum(t);
  if (t.includes('قريش') || t.includes('النصر') || t.includes('الإخلاص')) {
    console.log(`Order ${orders[i]}: "${t}" -> surah num ${num}, shouldRemove: ${num >= 78 && num <= 112}`);
  }
});
