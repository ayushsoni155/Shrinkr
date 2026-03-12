'use strict';

const cluster = require('cluster');
const os = require('os');
require('dotenv').config();

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`[URL Service] Primary ${process.pid} running — forking ${numCPUs} workers`);
    for (let i = 0; i < numCPUs; i++) cluster.fork();
    cluster.on('exit', (worker, code, signal) => {
        console.log(`[URL Service] Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
        cluster.fork();
    });
} else {
    require('./app');
}
