module.exports = {
  skipFiles: ['test/', 'node_modules/'],
  configureYulOptimizer: true,
  istanbulReporter: ['html', 'lcov', 'text', 'json'],
};
