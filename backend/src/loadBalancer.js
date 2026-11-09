import http from 'node:http';
import { URL } from 'node:url';

/**
 * PanicDrop Standalone Reverse Proxy Load Balancer
 *
 * Distributes incoming HTTP traffic across multiple backend instances
 * using Round-Robin with active health checks and automatic failover.
 *
 * Features:
 * - Round-Robin request forwarding
 * - Health-checking probe loop with automated instance eviction and restoration
 * - Dynamic request latency measurement
 * - Zero external dependencies (uses native Node.js http)
 * - Administrative status endpoint at /api/lb/status
 */

const LB_PORT = process.env.LB_PORT ? parseInt(process.env.LB_PORT, 10) : 8000;

// Configurable pool of backend target instances
const TARGET_POOL = (process.env.TARGET_SERVERS || 'http://127.0.0.1:5000,http://127.0.0.1:5001')
  .split(',')
  .map((urlStr, index) => {
    const parsed = new URL(urlStr.trim());
    return {
      id: index + 1,
      target: urlStr.trim(),
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 80,
      healthy: true,
      lastCheck: null,
      totalRequests: 0,
      failedRequests: 0,
      avgLatencyMs: 0,
    };
  });

let currentIndex = 0;

/**
 * Select the next healthy backend instance using Round-Robin.
 */
const getNextHealthyTarget = () => {
  const healthyTargets = TARGET_POOL.filter((t) => t.healthy);
  if (healthyTargets.length === 0) return null;

  currentIndex = (currentIndex + 1) % healthyTargets.length;
  return healthyTargets[currentIndex];
};

/**
 * Active Health Check Loop
 * Probes each backend target's /api/health endpoint every 5 seconds.
 */
const probeTargetHealth = (target) => {
  const req = http.request(
    {
      hostname: target.host,
      port: target.port,
      path: '/api/health',
      method: 'GET',
      timeout: 2500,
    },
    (res) => {
      const isOk = res.statusCode >= 200 && res.statusCode < 300;
      target.lastCheck = new Date();
      if (isOk !== target.healthy) {
        target.healthy = isOk;
        console.log(`[Load Balancer] Target ${target.target} status changed -> ${isOk ? 'HEALTHY' : 'DOWN'}`);
      }
    }
  );

  req.on('error', () => {
    target.lastCheck = new Date();
    if (target.healthy) {
      target.healthy = false;
      console.warn(`[Load Balancer ALERT] Target ${target.target} unreachable -> Marked DOWN`);
    }
  });

  req.on('timeout', () => {
    req.destroy();
    target.healthy = false;
  });

  req.end();
};

setInterval(() => {
  TARGET_POOL.forEach(probeTargetHealth);
}, 5000);

// Initial probe
TARGET_POOL.forEach(probeTargetHealth);

/**
 * Forward an HTTP request to the selected backend instance.
 */
const forwardRequest = (target, clientReq, clientRes) => {
  const start = process.hrtime();
  target.totalRequests++;

  const proxyOptions = {
    hostname: target.host,
    port: target.port,
    path: clientReq.url,
    method: clientReq.method,
    headers: {
      ...clientReq.headers,
      'x-forwarded-for': clientReq.socket.remoteAddress || '',
      'x-forwarded-host': clientReq.headers.host || '',
      'x-forwarded-proto': 'http',
      'x-load-balancer': `PanicDrop-LB-${target.id}`,
    },
  };

  const proxyReq = http.request(proxyOptions, (proxyRes) => {
    const diff = process.hrtime(start);
    const latency = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
    target.avgLatencyMs = target.avgLatencyMs === 0 ? parseFloat(latency) : ((target.avgLatencyMs + parseFloat(latency)) / 2).toFixed(1);

    clientRes.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'x-load-balanced-by': `PanicDrop-LB-Instance-${target.id}`,
      'x-upstream-target': target.target,
      'x-upstream-latency': `${latency}ms`,
    });

    proxyRes.pipe(clientRes);
  });

  proxyReq.on('error', (err) => {
    target.failedRequests++;
    console.error(`[Load Balancer ERROR] Failed to proxy request to ${target.target}:`, err.message);

    // Try failover to another healthy node
    const failoverTarget = getNextHealthyTarget();
    if (failoverTarget && failoverTarget.id !== target.id) {
      console.log(`[Load Balancer Failover] Retrying request on healthy target ${failoverTarget.target}`);
      return forwardRequest(failoverTarget, clientReq, clientRes);
    }

    clientRes.writeHead(502, { 'Content-Type': 'application/json' });
    clientRes.end(
      JSON.stringify({
        success: false,
        error: 'Bad Gateway - No healthy upstream backend targets available',
      })
    );
  });

  clientReq.pipe(proxyReq);
};

// Create the Load Balancer HTTP Server
const server = http.createServer((req, res) => {
  // Administrative load balancer status endpoint
  if (req.url === '/api/lb/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify(
        {
          success: true,
          loadBalancer: {
            port: LB_PORT,
            algorithm: 'Round-Robin with Active Health Checks',
            healthyNodes: TARGET_POOL.filter((t) => t.healthy).length,
            totalNodes: TARGET_POOL.length,
            targetPool: TARGET_POOL,
          },
        },
        null,
        2
      )
    );
  }

  const target = getNextHealthyTarget();
  if (!target) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        success: false,
        message: '503 Service Unavailable: All backend servers are currently offline or probing.',
      })
    );
  }

  forwardRequest(target, req, res);
});

server.listen(LB_PORT, () => {
  console.log(`=============================================================`);
  console.log(`🌐 PanicDrop Reverse Proxy Load Balancer Running on Port ${LB_PORT}`);
  console.log(`📊 Load Balancer Status API: http://localhost:${LB_PORT}/api/lb/status`);
  console.log(`🎯 Registered Upstream Targets: ${TARGET_POOL.map((t) => t.target).join(', ')}`);
  console.log(`=============================================================`);
});

export default server;
