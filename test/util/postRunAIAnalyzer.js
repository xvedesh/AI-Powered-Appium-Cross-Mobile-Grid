const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const crypto = require('crypto');

const reportDir = path.resolve(process.cwd(), process.env.ERROR_SHOTS_DIR || path.join('test', 'errorShots'));
const postRunLogPath = path.join(reportDir, 'post-run-ai.log');
const allureDir = path.resolve(process.cwd(), process.env.ALLURE_RESULTS_DIR || 'allure-results');
const allureReportDir = path.resolve(process.cwd(), process.env.ALLURE_REPORT_DIR || 'allure-report');
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

function appendLog(message) {
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFileSync(postRunLogPath, line);
}

function injectDiagnosisToAllure(manifest, diagnosis) {
  if (!fs.existsSync(allureDir)) {
    return false;
  }

  const resultFiles = fs
    .readdirSync(allureDir)
    .filter((name) => name.endsWith('-result.json'))
    .map((name) => path.join(allureDir, name));

  let targetResultPath = null;
  let targetResult = null;

  for (const filePath of resultFiles) {
    let json;
    try {
      json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      continue;
    }

    if (json.name === manifest.test) {
      if (!targetResult || (json.stop || 0) > (targetResult.stop || 0)) {
        targetResult = json;
        targetResultPath = filePath;
      }
    }
  }

  if (!targetResult || !targetResultPath) {
    return false;
  }

  const source = `${crypto.randomUUID()}-attachment.txt`;
  const sourcePath = path.join(allureDir, source);
  fs.writeFileSync(sourcePath, diagnosis || 'AI Analysis returned empty response.');

  targetResult.steps = targetResult.steps || [];
  targetResult.steps = targetResult.steps.filter((step) => step.name !== 'AI Failure Diagnosis (Post-Run)');
  targetResult.steps.push({
    name: 'AI Failure Diagnosis (Post-Run)',
    status: 'passed',
    stage: 'finished',
    start: Date.now(),
    stop: Date.now(),
    attachments: [
      {
        name: 'AI Failure Diagnosis',
        source,
        type: 'text/plain'
      }
    ]
  });

  fs.writeFileSync(targetResultPath, JSON.stringify(targetResult));
  return true;
}

async function analyzeFailure(errorMessage, xmlPath, screenshotPath) {
  if (!openai) return 'AI Analysis skipped: OPENAI_API_KEY is not set.';

  try {
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8').slice(0, 4000);
    const screenshotBase64 = fs.readFileSync(screenshotPath, { encoding: 'base64' });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a Senior SDET AI Assistant. Diagnose test failures using XML and screenshot.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                `The automation test failed with error: "${errorMessage}".\n` +
                'Analyze XML and screenshot, identify root cause, and provide a concise fix.'
            },
            {
              type: 'text',
              text: `XML Page Source:\n---\n${xmlContent}\n---`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${screenshotBase64}`,
                detail: 'low'
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    return response.choices?.[0]?.message?.content || 'AI Analysis returned empty response.';
  } catch (error) {
    return `AI Error: ${error.message}`;
  }
}

async function run() {
  if (!fs.existsSync(reportDir)) {
    return;
  }

  appendLog('Post-run AI analyzer started.');
  const files = fs.readdirSync(reportDir).filter((name) => name.endsWith('_manifest.json'));
  let processed = 0;

  for (const fileName of files) {
    const manifestPath = path.join(reportDir, fileName);
    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    } catch {
      continue;
    }

    if (manifest.aiStatus === 'done' && manifest.aiDiagnosis) {
      continue;
    }

    const xmlPath = manifest.files?.xmlSource;
    const screenshotPath = manifest.files?.screenshot;
    if (!xmlPath || !screenshotPath || !fs.existsSync(xmlPath) || !fs.existsSync(screenshotPath)) {
      manifest.aiStatus = 'error';
      manifest.aiDiagnosis = 'AI Error: XML or screenshot file is missing.';
      manifest.aiCompletedAt = new Date().toISOString();
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      processed += 1;
      continue;
    }

    const diagnosis = await analyzeFailure(manifest.error || 'Unknown Error', xmlPath, screenshotPath);
    manifest.aiStatus = diagnosis.startsWith('AI Error:') ? 'error' : 'done';
    manifest.aiDiagnosis = diagnosis;
    manifest.aiCompletedAt = new Date().toISOString();
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    const injected = injectDiagnosisToAllure(manifest, diagnosis);
    appendLog(
      injected
        ? `AI diagnosis added to Allure for test "${manifest.test}".`
        : `AI diagnosis saved, but matching Allure result was not found for "${manifest.test}".`
    );
    processed += 1;
  }

  if (processed > 0) {
    const readyMessage =
      `Report is ready to generate, execute 'npx allure generate "${allureDir}" --clean -o "${allureReportDir}"' and then 'npx allure open "${allureReportDir}"'.`;
    appendLog(`Updated ${processed} manifest(s) in ${reportDir}.`);
    appendLog(readyMessage);
    console.log(`>>> [POST-RUN AI]: ${readyMessage}`);
  } else {
    appendLog('No pending manifests found. Nothing to analyze.');
  }
}

run().catch((error) => {
  appendLog(`POST-RUN AI ERROR: ${error.message}`);
  console.error('>>> [POST-RUN AI ERROR]:', error);
});
