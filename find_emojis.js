const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let filesToProcess = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      filesToProcess = filesToProcess.concat(walkDir(fullPath));
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      filesToProcess.push(fullPath);
    }
  }
  return filesToProcess;
}

const allJsxFiles = walkDir('app');
const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

for (const file of allJsxFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(emojiRegex);
  if (matches) {
    console.log(`Found emojis in ${file}: ${[...new Set(matches)].join(' ')}`);
  }
}
