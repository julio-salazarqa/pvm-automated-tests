const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const outputDir = path.join(__dirname, 'AIM-TestCases');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

console.log('=== MANUAL TEST CASE SAVER ===\n');
console.log('This tool will help you save test cases as .txt files.\n');
console.log('Instructions:');
console.log('1. Open a test case in your browser (click on the Key)');
console.log('2. Go to Test Script tab');
console.log('3. Copy all the content (Ctrl+A, Ctrl+C)');
console.log('4. Come back here and follow the prompts\n');
console.log('─'.repeat(70));
console.log('\n');

let testCaseCount = 0;

function askForTestCase() {
  rl.question('Enter Test Case Key (e.g., XPM-T4436) or "exit" to finish: ', (key) => {
    if (key.toLowerCase() === 'exit' || key.toLowerCase() === 'q') {
      console.log(`\n✅ Saved ${testCaseCount} test cases to: ${outputDir}`);
      rl.close();
      return;
    }

    if (!key.trim()) {
      console.log('⚠️  Please enter a valid test case key\n');
      askForTestCase();
      return;
    }

    const testKey = key.trim();

    rl.question('Enter Test Case Name (brief description): ', (name) => {
      const testName = name.trim() || testKey;

      console.log('\nNow paste the Test Script content (Ctrl+V), then press Enter twice:\n');

      let content = '';
      let emptyLineCount = 0;

      const contentReader = () => {
        rl.question('', (line) => {
          if (line === '') {
            emptyLineCount++;
            if (emptyLineCount >= 2) {
              // Two empty lines = done
              saveTestCase(testKey, testName, content);
              emptyLineCount = 0;
              content = '';
              console.log('\n');
              askForTestCase();
              return;
            }
          } else {
            emptyLineCount = 0;
          }
          content += line + '\n';
          contentReader();
        });
      };

      contentReader();
    });
  });
}

function saveTestCase(key, name, content) {
  // Create filename
  let fileName = `${key} - ${name}`
    .replace(/[<>:"/\\|?*\r\n\t]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 150);

  const filePath = path.join(outputDir, `${fileName}.txt`);

  const fileContent = `Test Case: ${key}\n` +
                    `Name: ${name}\n` +
                    `Saved: ${new Date().toLocaleString()}\n\n` +
                    `${'='.repeat(70)}\n` +
                    `TEST SCRIPT\n` +
                    `${'='.repeat(70)}\n\n` +
                    content.trim();

  fs.writeFileSync(filePath, fileContent, 'utf-8');
  testCaseCount++;
  console.log(`✅ Saved: ${fileName}.txt (${testCaseCount} total)`);
}

// Start the process
askForTestCase();
