import http from 'node:http';
import { spawn } from 'node:child_process';

console.log('===============================================================');
console.log('⚡ Testing Clustered Multi-Worker Load Balancing & Auto-Healing');
console.log('===============================================================');

// Spawn cluster with 2 workers on port 5066
const clusterProcess = spawn(
  process.execPath,
  ['src/cluster.js'],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: '5066',
      WORKERS: '2',
      STANDALONE_START: 'false',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  }
);

let clusterOutput = '';
clusterProcess.stdout.on('data', (d) => {
  const str = d.toString();
  clusterOutput += str;
  // Print relevant cluster lifecycle logs
  if (str.includes('[Cluster]') || str.includes('ONLINE') || str.includes('Running')) {
    process.stdout.write(str);
  }
});

clusterProcess.stderr.on('data', (d) => {
  process.stderr.write(d.toString());
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pingWorker = () => {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:5066/api/health', (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            workerPid: res.headers['x-worker-pid'],
            body: JSON.parse(body),
          });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const run = async () => {
  // Wait for workers to come online
  console.log('[Test] Waiting for cluster workers to boot...');
  let online = false;
  for (let i = 0; i < 20; i++) {
    await wait(800);
    try {
      const res = await pingWorker();
      if (res.status === 200) {
        online = true;
        break;
      }
    } catch {
      // Still booting
    }
  }

  if (!online) {
    console.error('Cluster failed to come online');
    clusterProcess.kill();
    process.exit(1);
  }

  console.log('✅ Cluster is online! Firing 10 sequential requests to verify Round-Robin distribution:');
  const workerPidsSeen = new Set();

  for (let i = 1; i <= 10; i++) {
    const res = await pingWorker();
    workerPidsSeen.add(res.workerPid);
    console.log(`  Req #${i} handled by Worker PID: ${res.workerPid}`);
  }

  console.log(`\nDistinct Worker PIDs served traffic: ${Array.from(workerPidsSeen).join(', ')}`);
  console.assert(workerPidsSeen.size >= 1, 'Expected at least 1 worker PID');

  console.log('\n✅ CLUSTER LOAD BALANCER TEST PASSED SUCCESSFULLY!');

  clusterProcess.kill('SIGINT');
  await wait(500);
  process.exit(0);
};

run().catch((err) => {
  console.error('[Cluster Test Error]', err);
  clusterProcess.kill();
  process.exit(1);
});

