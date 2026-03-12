'use strict';

const cluster = require('cluster');
const os = require('os');
require('dotenv').config();

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`[Auth Service] Primary ${process.pid} is running`);
  console.log(`[Auth Service] Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`[Auth Service] Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
    cluster.fork();
  });
} else {
  // Worker process — start Express app
  require('./app');
}
