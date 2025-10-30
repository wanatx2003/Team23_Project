const fs = require('fs');
const path = require('path');

function readSummary(p) {
  try {
    const content = fs.readFileSync(p, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

function sumMetrics(sum, metrics) {
  for (const key of ['lines', 'statements', 'functions', 'branches']) {
    if (!sum[key]) sum[key] = { total: 0, covered: 0, pct: 0 };
    sum[key].total += metrics[key].total || 0;
    sum[key].covered += metrics[key].covered || 0;
  }
}

function computePct(sum) {
  for (const key of ['lines', 'statements', 'functions', 'branches']) {
    const s = sum[key];
    s.pct = s.total > 0 ? Number(((s.covered / s.total) * 100).toFixed(2)) : 100;
  }
}

const serverSummaryPath = path.join(__dirname, '..', 'server', 'coverage', 'coverage-summary.json');
const clientSummaryPath = path.join(__dirname, '..', 'client', 'coverage', 'coverage-summary.json');

const server = readSummary(serverSummaryPath);
const client = readSummary(clientSummaryPath);

if (!server && !client) {
  console.error('No coverage summaries found. Run server and client tests with coverage first.');
  process.exit(2);
}

const combined = {};
if (server && server.total) sumMetrics(combined, server.total);
if (client && client.total) sumMetrics(combined, client.total);
computePct(combined);

const out = {
  total: combined,
  sources: {
    server: server ? server.total : null,
    client: client ? client.total : null
  }
};

const outPath = path.join(__dirname, '..', 'coverage');
if (!fs.existsSync(outPath)) fs.mkdirSync(outPath);
fs.writeFileSync(path.join(outPath, 'coverage-summary.json'), JSON.stringify(out, null, 2));

console.log('\nCombined coverage summary:');
for (const key of ['lines', 'statements', 'functions', 'branches']) {
  const s = out.total[key];
  console.log(`${key.padEnd(11)} : ${s.covered}/${s.total} (${s.pct}%)`);
}

console.log(`\nWrote combined summary to ${path.join(outPath, 'coverage-summary.json')}`);

if (!server) console.log('\nNote: server coverage not found. Run `npm --prefix server test`');
if (!client) console.log('\nNote: client coverage not found. Run `npm --prefix client test -- --coverage --watchAll=false`');
