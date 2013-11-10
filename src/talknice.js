;(function (window) {

  var getValue = function getValue(obj, prop) {
    var alias, key;

    if (typeof prop === 'string') {
      return [prop, getValueFromPath(obj, prop)];

    } else {

      for (key in prop) {
        alias = prop[key];
        break;
      }

      return [alias, getValueFromPath(obj, key)];
    }
  };

  var getValueFromPath = function getValueFromPath(obj, prop) {
    var ctx  = obj,
        path = prop.split('.'),
        len  = path.length;

    for (var i = 0; i < len; i++) {
      if (!(ctx = ctx[path[i]])) { return null; }
    }

    return ctx;
  };

  var setValue = function setValue(obj, prop, val) {
    var ctx  = obj,
        path = prop.split('.'),
        len  = path.length;

    for (var i = 0; i < len; i++) {
      ctx = ctx[path[i]] = i + 1 < len ? {} : val;
    }
  };

  var Talknice = {

    parser: function parser(config) {

      if (!config) { config = {}; }

      return function parse(obj) {

        if (!obj) { return {}; }

        if (!config.attrs) { return obj; }

        var out   = {},
            props = config.attrs || [],
            len   = props.length;

        for (var i = 0; i < len; i++) {
          var result;
          result = getValue(obj, props[i]);
          setValue(out, result[0], result[1]);
        }

        return out;
      };
    }
  };

  window.Talknice = Talknice;

})(this);
