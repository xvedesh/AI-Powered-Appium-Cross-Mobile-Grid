require('ts-node/register/transpile-only');

const analyzer = require('./postRunAIAnalyzer.ts');

module.exports = {
  runPostRunAIAnalysis: analyzer.runPostRunAIAnalysis
};

if (require.main === module) {
  analyzer.runPostRunAIAnalysis().catch((error) => {
    console.error('>>> [POST-RUN AI ERROR]:', error);
    process.exitCode = 1;
  });
}
