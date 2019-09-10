var fs = require('fs');

//require all the models
var routes = {};
var sails = require('sails');
var names = fs.readdirSync(`${sails.config.appPath}/api/routes/`);

names.forEach(name => {
  if (!name.match(/\.js$/)) { return; }
  if (name === 'index.js') { return; }
  let route = require('./' + name);

  routes = { ...routes, ...route };
});
module.exports = routes;