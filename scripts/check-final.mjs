import fs from 'fs';
const c = fs.readFileSync('C:\\Users\\NISSAY\\Downloads\\buildyourheaven code\\constants\\verses.ts', 'utf8');
const titles = c.match(/title: '([^']+)'/g).map(t => t.split("'")[1]);
console.log('Total items:', titles.length);
titles.forEach(t => {
  if (t.startsWith('سورة') && t !== 'سورة الفاتحة' && t !== 'سورة الفلق' && t !== 'سورة الناس') {
    console.log('  REMAINING HIZB60:', t);
  }
});
console.log('No remaining Hizb60 complete surahs');
