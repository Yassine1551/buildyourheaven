import fs from 'fs';
const content = fs.readFileSync('constants/verses.ts', 'utf8');

// Fix: decrement IDs 96-101 → 95-100 and orders 96-101 → 95-100
// Do it in ascending order to avoid double-replacement
let fixed = content;
for (let i = 96; i <= 101; i++) {
  const j = i - 1;
  // Only replace when it's a standalone id or order (not part of a larger number)
  const idRegex = new RegExp(`(?<=')${i}(?=')`, 'g');
  fixed = fixed.replace(idRegex, String(j));
  const orderRegex = new RegExp(`(?<=order: )${i}(?!\\d)`, 'g');
  fixed = fixed.replace(orderRegex, String(j));
}

fs.writeFileSync('constants/verses.ts', fixed);
console.log('Fixed IDs and orders 96-101 → 95-100');
