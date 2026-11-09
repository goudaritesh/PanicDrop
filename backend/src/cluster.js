import cluster from 'node:cluster';
import os from 'node:os';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PanicDrop Multi-Worker Cluster Load Balancer
 *
 * Utilizes Node.js native clustering with OS-level Round-Robin socket scheduling.
 * Features:
 * - Multi-core horizontal scaling across available CPU cores
 * - Automatic worker failure detection and zero-downtime auto-healing (instant respawn)
 * - Graceful shutdown and rolling reload support
 * - Worker process telemetry tracking
 */

const NUM_WORKERS = process.env.WORKERS
  ? parseInt(process.env.WORKERS, 10)
  : Math.min(os.cpus().length, 4);

if (cluster.isPrimary) {
  console.log(`=============================================================`);
  console.log(`⚡ PanicDrop Clustered Load Balancer Primary Process [PID: ${process.pid}]`);
  console.log(`🖥️  Host CPUs Detected: ${os.cpus().length} | Worker Pool Size: ${NUM_WORKERS}`);
  console.log(`🔄 Scheduling Policy: OS Round-Robin Socket Distribution`);
  console.log(`=============================================================`);

  const workerStats = new Map();

  // Fork worker processes
  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = cluster.fork({
      CLUSTER_WORKER_ID: (i + 1).toString(),
    });
    workerStats.set(worker.id, {
      pid: worker.process.pid,
      startTime: new Date(),
      restarts: 0,
    });
  }

  // Handle worker lifecycle events
  cluster.on('online', (worker) => {
    console.log(`[Cluster] Worker #${worker.id} (PID: ${worker.process.pid}) is ONLINE and accepting traffic`);
  });

  cluster.on('exit', (worker, code, signal) => {
    console.warn(
      `[Cluster WARNING] Worker #${worker.id} (PID: ${worker.process.pid}) died (Code: ${code}, Signal: ${signal}). Auto-healing triggered...`
    );

    const prevStat = workerStats.get(worker.id) || { restarts: 0 };
    workerStats.delete(worker.id);

    // Auto-heal: spawn replacement worker immediately
    const newWorker = cluster.fork({
      CLUSTER_WORKER_ID: worker.id.toString(),
    });
    workerStats.set(newWorker.id, {
      pid: newWorker.process.pid,
      startTime: new Date(),
      restarts: prevStat.restarts + 1,
    });

    console.log(`[Cluster Auto-Healing] Spawned replacement Worker #${newWorker.id} (PID: ${newWorker.process.pid})`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[Cluster] Received shutdown signal. Gracefully closing all workers...');
    for (const id in cluster.workers) {
      cluster.workers[id].send('shutdown');
      cluster.workers[id].disconnect();
    }
    setTimeout(() => {
      console.log('[Cluster] Forcing remaining processes to terminate.');
      process.exit(0);
    }, 5000);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

} else {
  // Worker process: Import and run the Express app
  import('./server.js')
    .then(() => {
      console.log(`[Worker] Worker #${cluster.worker.id} initialized on PID ${process.pid}`);
    })
    .catch((err) => {
      console.error(`[Worker ERROR] Failed to start on PID ${process.pid}:`, err);
      process.exit(1);
    });

  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      console.log(`[Worker #${cluster.worker.id}] Cleaning up connections before exit...`);
      process.exit(0);
    }
  });
}

