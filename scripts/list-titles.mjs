import fs from 'fs';
const c = fs.readFileSync('C:\\Users\\NISSAY\\Downloads\\buildyourheaven code\\constants\\verses.ts', 'utf8');
const titles = c.match(/title: '([^']+)'/g).map(t => t.split("'")[1]);
const orders = c.match(/order: (\d+)/g).map(t => t.split(' ')[1]);
for (let i = 0; i < titles.length; i++) {
  console.log(orders[i] + ': ' + titles[i]);
}
