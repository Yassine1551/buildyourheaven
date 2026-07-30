import fs from 'fs';
import path from 'path';

const filePath = path.resolve('constants/verses.ts');
let content = fs.readFileSync(filePath, 'utf8');

const newItem = `  {
    id: 'V67',
    title: 'آية داود وإلانة الحديد (سبأ 10-12)',
    verses: 'وَلَقَدْ آتَيْنَا دَاوُودَ مِنَّا فَضْلًا ۖ يَا جِبَالُ أَوِّبِي مَعَهُ وَالطَّيْرَ ۖ وَأَلَنَّا لَهُ الْحَدِيدَ ﴿10﴾ أَنِ اعْمَلْ سَابِغَاتٍ وَقَدِّرْ فِي السَّرْدِ ۖ وَاعْمَلُوا صَالِحًا ۖ إِنِّي بِمَا تَعْمَلُونَ بَصِيرٌ ﴿11﴾ وَلِسُلَيْمَانَ الرِّيحَ غُدُوُّهَا شَهْرٌ وَرَوَاحُهَا شَهْرٌ ۖ وَأَسَلْنَا لَهُ عَيْنَ الْقِطْرِ ۖ وَمِنَ الْجِنِّ مَن يَعْمَلُ بَيْنَ يَدَيْهِ بِإِذْنِ رَبِّهِ ۖ وَمَن يَزِغْ مِنْهُمْ عَنْ أَمْرِنَا نُذِقْهُ مِنْ عَذَابِ السَّعِيرِ ﴿12﴾',
    virtue: 'آيات تسليط الضوء على نعمة الله على داود وسليمان، إلانة الحديد وتسخير الجن، والتحذير من عذاب السعير.',
    order: V67
  },
`;

// Insert after item 66 (the last الأحزاب item)
const insertMarker = `    order: 66\n  },\n{`;
content = content.replace(insertMarker, `    order: 66\n  },\n${newItem}{`);

// Now renumber all IDs and orders from 67 through 100
// We need to find and replace patterns like id: '67' → id: '68', order: 67 → order: 68, etc.
for (let i = 100; i >= 67; i--) {
  // Replace id: 'i' → id: 'i+1' (only if it's a standalone id field)
  const idRegex = new RegExp(`id: '${i}'`, 'g');
  content = content.replace(idRegex, `id: '${i + 1}'`);
  
  // Replace order: i → order: i+1
  const orderRegex = new RegExp(`order: ${i}(?!\\d)`, 'g');
  content = content.replace(orderRegex, `order: ${i + 1}`);
}

// Now fix the placeholder items (V67 → 67)
content = content.replace(/'V67'/g, "'67'");
content = content.replace(/order: V67/g, 'order: 67');

fs.writeFileSync(filePath, content);
console.log('Done! Inserted سبأ 10-12 and renumbered from 67 onward.');
