
var _ = require('lodash');
var moment = require('moment');
var handlebars = require('handlebars');

var debug = require('debug')('zcyjiggly:helpers');

require('./i18n_helpers');

// handlebars.registerHelper('helperMissing', function() {
//   console.info('missing helper', arguments)
//   return 'missing helper';
// });

handlebars.registerHelper('equals', function(a, b, options) {
  if (a == b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper('lt', function(a, b, options) {
  if (a < b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper('gt', function(a, b, options) {
  if (parseFloat(a) > parseFloat(b)) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper('and', function(a, b, options) {
  if (a && b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper('neither', function(a, b, options) {
  if (!a && !b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper('mod', function(a, b, options) {
  if (!a || !b) {
    return options.inverse(this);
  }
  if ((a + 1) % b !== 0) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
});

handlebars.registerHelper('of', function(a, b, options) {
  if (!a || !b) {
    return options.inverse(this);
  }
  var values = b.split(',');
  if (_.includes(values, a.toString())) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper('formatDate', function(date, type, options) {
  if (!date) {
    return;
  }
  switch (type) {
    case 'gmt':
      return moment(parseInt(date)).format('EEE MMM DD HH:mm:ss Z YYYY');
    case 'day':
      return moment(parseInt(date)).format('YYYY-MM-DD');
    case 'minute':
      return moment(parseInt(date)).format('YYYY-MM-DD HH:mm');
    default:
      if (typeof type === 'string') {
        return moment(parseInt(date)).format(type);
      } else {
        return moment(parseInt(date)).format('YYYY-MM-DD HH:mm:ss');
      }
  }
});

handlebars.registerHelper('json', function(json, options) {
  return JSON.stringify(json || this);
});

handlebars.registerHelper('size', function(a, options) {
  if (!a) {
    return 0;
  }
  if (a.length) {
    if (_.isFunction(a.length)) {
      return a.length();
    }
    return a.length;
  }
  if (a.size) {
    if (_.isFunction(a.size)) {
      return a.size();
    }
    return a.size;
  }
  return 0;
});

handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
  var isTrue = (function() {
    switch (operator) {
      case '==':
        return v1 == v2;
      case '!=':
        return v1 != v2;
      case '===':
        return v1 === v2;
      case '!==':
        return v1 !== v2;
      case '&&':
        return v1 && v2;
      case '||':
        return v1 || v2;
      case '<':
        return v1 < v2;
      case '<=':
        return v1 <= v2;
      case '>':
        return v1 > v2;
      case '>=':
        return v1 >= v2;
      default:
        return eval('' + v1 + operator + v2);
    }
  })();
  if (isTrue) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper('or', function(/* any, any, ..., options */) {
  var argLength = arguments.length - 1;
  var options = arguments[argLength];
  var success = false;
  var i = 0;
  while (i < argLength) {
    if (arguments[i]) {
      success = true;
      break;
    }
    i++;
  }
  if (success) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

handlebars.registerHelper('add', function(a, b) {
  return a + b;
});

handlebars.registerHelper('subtract', function(a, b) {
  return a - b;
});

handlebars.registerHelper('divide', function(a, b) {
  return a / b;
});

handlebars.registerHelper('multiply', function(a, b) {
  return a * b;
});
