import { readFileSync, writeFileSync } from 'fs';

const SURAH_MAP = {
  'الفاتحة': 1,
  'البقرة': 2,
  'آل عمران': 3,
  'النساء': 4,
  'الأنعام': 6,
  'الأعراف': 7,
  'الأنفال': 8,
  'يونس': 10,
  'هود': 11,
  'إبراهيم': 14,
  'النحل': 16,
  'الإسراء': 17,
  'الكهف': 18,
  'مريم': 19,
  'طه': 20,
  'الأنبياء': 21,
  'الحج': 22,
  'المؤمنون': 23,
  'النور': 24,
  'الفرقان': 25,
  'النمل': 27,
  'القصص': 28,
  'الروم': 30,
  'لقمان': 31,
  'السجدة': 32,
  'الأحزاب': 33,
  'يس': 36,
  'الصافات': 37,
  'الزمر': 39,
  'غافر': 40,
  'فصلت': 41,
  'الشورى': 42,
  'الفتح': 48,
  'الحجرات': 49,
  'النجم': 53,
  'الحديد': 57,
  'الحشر': 59,
  'الصف': 61,
  'الجمعة': 62,
  'التغابن': 64,
  'الطلاق': 65,
  'الملك': 67,
  'الحاقة': 69,
  'نوح': 71,
  'الجن': 72,
  'المزمل': 73,
  'الإنسان': 76,
  'الانشقاق': 84,
  'الفلق': 113,
  'الناس': 114,
};

let content = readFileSync('constants/verses.ts', 'utf8');

const itemRegex = /\{\s*\n\s*id:\s*'(\d+)',\s*\n\s*title:\s*'([^']*)',\s*\n\s*verses:\s*'([^']*)',\s*\n\s*virtue:\s*'([^']*)',\s*\n\s*order:\s*(\d+)\s*\n\s*\}/g;
let items = [];
let match;
while ((match = itemRegex.exec(content)) !== null) {
  items.push({
    id: match[1],
    title: match[2],
    verses: match[3],
    virtue: match[4],
    order: parseInt(match[5])
  });
}

function parseSurahAyah(title) {
  // Try to extract surah name from parentheses: ... (اسم السورة أرقام)
  const parenMatch = title.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const inside = parenMatch[1].trim();
    // Inside paren could be like "البقرة 1-5" or "آل عمران 59-61" etc.
    const parts = inside.split(' ');
    // Surah name could be 1-2 words
    for (let i = 1; i <= Math.min(3, parts.length); i++) {
      const surahName = parts.slice(0, i).join(' ');
      const surahNum = SURAH_MAP[surahName];
      if (surahNum) {
        const ayahPart = parts.slice(i).join(' ');
        const ayahMatch = ayahPart.match(/(\d+)/);
        const startAyah = ayahMatch ? parseInt(ayahMatch[1]) : 1;
        return { surah: surahNum, ayah: startAyah };
      }
    }
  }

  // For items like "سورة الفاتحة", "سورة الفلق", "سورة الناس"
  const suraMatch = title.match(/سورة\s+(\S+)/);
  if (suraMatch) {
    const surahNum = SURAH_MAP[suraMatch[1]];
    if (surahNum) return { surah: surahNum, ayah: 1 };
  }

  // Fallback: search for any surah name in the title
  for (const [name, num] of Object.entries(SURAH_MAP)) {
    if (title.includes(name)) {
      const ayahMatch = title.match(/(\d+)/);
      return { surah: num, ayah: ayahMatch ? parseInt(ayahMatch[1]) : 1 };
    }
  }

  console.log('Could not parse:', title);
  return { surah: 999, ayah: 999 };
}

// Parse and log for verification
items.forEach(item => {
  const { surah, ayah } = parseSurahAyah(item.title);
  console.log(`${item.order}: ${item.title.padEnd(50)} → surah ${surah}, ayah ${ayah}`);
});

// Sort by surah number, then starting ayah number
items.sort((a, b) => {
  const sa = parseSurahAyah(a.title);
  const sb = parseSurahAyah(b.title);
  if (sa.surah !== sb.surah) return sa.surah - sb.surah;
  return sa.ayah - sb.ayah;
});

console.log('\n=== SORTED ORDER ===');
items.forEach((item, idx) => {
  const { surah, ayah } = parseSurahAyah(item.title);
  console.log(`${idx + 1}: ${item.title.padEnd(50)} → surah ${surah}, ayah ${ayah}`);
  item.order = idx + 1;
  item.id = String(idx + 1);
});

// Rebuild file
let newContent = `export interface VerseItem {
  id: string;
  title: string;
  verses: string;
  virtue: string;
  order: number;
}

export const versesData: VerseItem[] = [
`;

items.forEach((item, idx) => {
  newContent += `{
    id: '${item.id}',
    title: '${item.title.replace(/'/g, "\\'")}',
    verses: '${item.verses.replace(/'/g, "\\'")}',
    virtue: '${item.virtue.replace(/'/g, "\\'")}',
    order: ${item.order}
  }`;
  if (idx < items.length - 1) {
    newContent += ',\n';
  } else {
    newContent += '\n';
  }
});

newContent += `];\n`;

writeFileSync('constants/verses.ts', newContent, 'utf8');
console.log('\nDone! File rewritten with Mushaf order.');
