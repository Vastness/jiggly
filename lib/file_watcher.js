var fs = require('fs');
var _ = require('lodash');
var chokidar = require('chokidar');

var config = require('./config');
var dataProvider = require('./data_provider');
var partialRegister = require('./handlebars/partial_register');

/**
 * watch templates components directory
 */
chokidar.watch(config.componentsHome).on('change', function(filePath) {
  if (!fs.existsSync(filePath)
  || fs.statSync(filePath).isDirectory()
  // if not *templates，do not reload
  || !/\S*\/(all_templates|other_templates|templates)\/\w+.hbs$/.test(filePath)
  ) {
    return;
  }

  try {
    partialRegister.registerTemplateComp(filePath);
    // console.log('[component Reload] ' + filePath);
  } catch (error) {
    console.log('component Reload Error] ' + filePath + ' - ' + error);
  }
});

/**
 * watch views directory
 */
chokidar.watch(config.viewsHome).on('change', function(filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return;
  }
  try {
    partialRegister.registerLayout(filePath);
    // console.log('[Layout Reload] ' + filePath);
  } catch (error) {
    console.log('Layout Reload Error] ' + filePath + ' - ' + error);
  }
});

/**
 * watch test data
 */
chokidar.watch(config.dataFiles).on('change', function(dataFilePath) {
  dataProvider.reloadDataFile(dataFilePath)
    .then(function() {
      console.log('[Data Reload] ' + dataFilePath);
    })
    .catch(function(error) {
      console.log('[Data Reload Error] ' + dataFilePath + ' - ' + error);
    });
});
