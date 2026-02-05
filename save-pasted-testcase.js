const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'paste-testcase-here.txt');
const outputDir = path.join(__dirname, 'AIM-TestCases');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
  console.log('📁 Created directory: AIM-TestCases\n');
}

// Read pasted content
const content = fs.readFileSync(inputFile, 'utf-8');

// Extract the pasted part (after the separator line)
const lines = content.split('\n');
let startIndex = 0;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('[PASTE HERE]')) {
    startIndex = i + 1;
    break;
  }
}

if (startIndex === 0 || startIndex >= lines.length) {
  console.log('❌ No content found. Please paste content after [PASTE HERE] line.');
  process.exit(1);
}

const pastedContent = lines.slice(startIndex).join('\n').trim();

if (pastedContent.length < 10) {
  console.log('❌ Content too short. Please paste the full test case content.');
  process.exit(1);
}

// Try to extract test case key from first lines
let testKey = '';
let testName = '';

const firstLines = pastedContent.split('\n').slice(0, 10);
for (const line of firstLines) {
  const match = line.match(/XPM-T\d+/);
  if (match) {
    testKey = match[0];
    // Try to get the name from the same line or next lines
    testName = line.replace(testKey, '').trim();
    if (!testName) {
      // Try next line
      const lineIndex = firstLines.indexOf(line);
      if (lineIndex + 1 < firstLines.length) {
        testName = firstLines[lineIndex + 1].trim();
      }
    }
    break;
  }
}

if (!testKey) {
  console.log('❌ Could not find test case key (XPM-T####). Make sure the key is in the pasted content.');
  process.exit(1);
}

// Create filename
let fileName = testName
  ? `${testKey} - ${testName}`
  : testKey;

fileName = fileName
  .replace(/[<>:"/\\|?*\r\n\t]/g, '-')
  .replace(/\s+/g, ' ')
  .trim()
  .substring(0, 150);

const filePath = path.join(outputDir, `${fileName}.txt`);

// Save file
const fileContent = `Test Case: ${testKey}\n` +
                  `Name: ${testName || 'N/A'}\n` +
                  `Saved: ${new Date().toLocaleString()}\n\n` +
                  `${'='.repeat(70)}\n` +
                  `TEST SCRIPT CONTENT\n` +
                  `${'='.repeat(70)}\n\n` +
                  pastedContent;

fs.writeFileSync(filePath, fileContent, 'utf-8');

console.log('✅ SUCCESS!\n');
console.log(`Test Case: ${testKey}`);
console.log(`File: ${fileName}.txt`);
console.log(`Location: ${outputDir}\n`);

// Clear the paste file for next use
const resetContent = `=== PASTE TEST CASE CONTENT HERE ===

Instructions:
1. Replace everything below this line with the test case content
2. Make sure the first line has the test case KEY (e.g., XPM-T4436)
3. Save this file (Ctrl+S)
4. Run: node save-pasted-testcase.js
5. Repeat for each test case

────────────────────────────────────────────────────────────────────────

[PASTE HERE]
`;

fs.writeFileSync(inputFile, resetContent, 'utf-8');
console.log('📝 paste-testcase-here.txt has been reset for next test case.\n');
console.log('Ready for next test case!');
