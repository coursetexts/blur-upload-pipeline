const path = require('path');
const { workerData } = require('worker_threads');
const v8 = require('v8');
 
// Log initial worker memory
console.log('Worker initial memory:', {
  heapLimit: `${Math.round(v8.getHeapStatistics().heap_size_limit / 1024 / 1024)} MB`
});

require('ts-node').register();
console.log('ts-node registered, about to require worker file');

try {
  require(path.resolve(__dirname, workerData.path.replace('.ts', '.js')));
  console.log('Worker file loaded successfully');
} catch (error) {
  console.error('Error loading worker file:', error);
  process.exit(1);
}