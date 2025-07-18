import { Worker } from 'node:worker_threads';
import * as path from 'path';
import * as v8 from 'v8';
import express from 'express';
import basicAuth from 'express-basic-auth';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

// Generate Prisma client at startup
try {
  console.log('Generating Prisma client...');
  execSync('npx prisma generate --schema ./prisma/schema.prisma', { stdio: 'inherit' });
  console.log('Prisma client generated successfully');
} catch (error) {
  console.error('Failed to generate Prisma client:', error);
  process.exit(1);
}

// Log main thread memory before starting worker
console.log('Main thread memory before worker:', {
  heapLimit: `${Math.round(v8.getHeapStatistics().heap_size_limit / 1024 / 1024)} MB`
});

// Start the worker
const worker = new Worker(path.resolve(__dirname, './worker.js'), {
  workerData: {
    path: './youtube-worker.js'
  }
});

console.log('Worker started with conservative memory limits');

// Send a message to the worker to start processing
worker.postMessage('start');

// Listen for messages from the worker
worker.on('message', (message) => {
  console.log('Message from worker:', message);
});

// Handle errors in the worker
worker.on('error', (error) => {
  console.error('Worker error:', error);
  console.log('Main thread memory at error:', {
    heapLimit: `${Math.round(v8.getHeapStatistics().heap_size_limit / 1024 / 1024)} MB`
  });
});

// Handle worker exit
worker.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Worker stopped with exit code ${code}`);
  } else {
    console.log('Worker stopped gracefully.');
  }
});

const app = express();
const port = process.env.PORT || 3000;

const auth = basicAuth({
    users: { 'uptimerobot': process.env.HEALTH_CHECK_PASSWORD },
    challenge: true
});

app.use('/health', auth);
app.use('/worker-status', auth);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Worker status endpoint
app.get('/worker-status', (req, res) => {
  const { exec } = require('child_process');
  exec('PM2_HOME=/opt/pm2 pm2 jlist', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to get worker status' });
    }
    try {
      const processes = JSON.parse(stdout);
      const workerStatus = processes.find(p => p.name === 'youtube-worker');
      res.json({
        status: workerStatus ? 'running' : 'stopped',
        uptime: workerStatus?.pm2_env?.pm_uptime || 0,
        memory: workerStatus?.monit?.memory || 0,
        cpu: workerStatus?.monit?.cpu || 0
      });
    } catch (e) {
      res.status(500).json({ error: 'Failed to parse worker status' });
    }
  });
});

app.listen(port, () => {
  console.log(`Health check server running on port ${port}`);
});
