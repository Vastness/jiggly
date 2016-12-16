
var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar');
var CLIEngine = require('eslint').CLIEngine;

var debug = require('debug')('zcyjiggly:eslint');

var config = require('../config');

var eslintConfig = JSON.parse(fs.readFileSync('/Users/yunuo/Workspace/zcy/experts-web/.eslintrc', 'utf8'));
debug(eslintConfig)
var cli = new CLIEngine(eslintConfig);
var eslintPath = path.resolve('/Users/yunuo/Workspace/zcy/experts-web/app');
// var eslintPath = path.resolve(process.cwd(), config.eslint);
chokidar.watch(eslintPath, {
  ignored: '/*.{hbs|scss}/',
  awaitWriteFinish: true
}).on('change', function(filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return;
  }

  var report = cli.executeOnFiles([config.eslint]);
  debug(report)
})