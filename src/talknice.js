/*!
 * Talknice 0.1.0 <http://github.com/mexpolk/talknice>
 * Copyright 2013 Ivan Torres
 * Released under the MIT license.
 */
(function () {

  'use strict';

  var root = this;

  // Utility functions

  /**
   * Gets the first property name of an object.
   *
   * @private
   * @name getKey
   * @param {Object} obj any object.
   * @returns {String} the name of the first property name.
   * @example
   *
   * getKey({name: 'a', alias: 'b'});
   * // => 'name'
   *
   */
  function getKey(obj) {
    var key;

    if (Object.keys) {
      return Object.keys(obj)[0];
    } else {
      for (key in obj) { break; }
      return key;
    }
  }

  /**
   * Checks if the passed object is an array.
   *
   * @private
   * @name isArray
   * @param {Object} obj any object.
   * @returns {boolean} returns true if the object is an array.
   * @example
   *
   * isArray([]);
   * // => true
   *
   * isArray({});
   * // => false
   *
   */
  function isArray(obj) {
    return (obj instanceof Array);
  }

  /**
   * Checks if the passed object is a function.
   *
   * @private
   * @name isFunction
   * @param {Object} obj any object.
   * @returns {boolean} returns true if the object is a function.
   * @example
   *
   * isFunction(function () {});
   * // => true
   *
   */
  function isFunction(obj) {
    return (typeof obj == 'function');
  }

  /**
   * Checks if the passed object is an Object.
   *
   * NOTE: Returns false if the passed object is an Array.
   *
   * @private
   * @name {Object} obj any object.
   * @returns {boolean} returns true if the object is an object.
   * @example
   *
   * isObject({})
   * // => true
   *
   * isObject([])
   * // => false
   *
   */
  function isObject(obj) {
    return (typeof obj == 'object' && !isArray(obj));
  }

  /**
   * Checks if the passed object is a Srting.
   *
   * @private
   * @name {Object} obj any object.
   * @returns {boolean} returns true if the object is a string.
   * @example
   *
   * isString('')
   * // => true
   *
   */
  function isString(obj) {
    return (typeof obj == 'string');
  }

  // Parser

  /**
   * Parses an object.
   *
   * @private
   * @name parseElement
   * @param {Object} config the parser configuration
   * @param {Object} obj the object to be parsed
   * @returns {Object} The parsed object
   */
  function parseElement(config, obj) {
    var result = {};

    for (var i = config.properties.length - 1; i >= 0; i--) {
      var property = config.properties[i];
      setValue(result, property, getValue(obj, property));
    }

    return result;
  }

  /**
   * Calls the parser `parseElement` on an object or on an array of objects.
   *
   * @private
   * @name parseObject
   * @param {Object} config the parser configuration.
   * @param {Object} obj the object to be parsed.
   * @returns {Object} The parsed object or array.
   */
  function parseObject(config, obj) {
    var result = null;

    if (isArray(obj)) {
      result = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        result.push(parseElement(config, obj[i]));
      }
    } else {
      result = parseElement(config, obj);
    }

    return result;
  }

  /**
   * Gets property value from the source object.
   *
   * @private
   * @name getValue
   * @param {Object} obj source object to extract property from.
   * @param {Object} property property configuration.
   * @returns {*} returns the value of the property
   * @example
   *
   * // Simple property:
   * var property = { name: 'email', ... },
   *     obj      = { email: 'name@example.com', ... };
   *
   * getValue(obj, property)
   * // => 'name@example.com'
   *
   * // Walking nested properties:
   * var property = { name: 'author.email', ... },
   *     obj      = { user: { email: 'name@example.com' }, ... };
   *
   * getValue(obj, property)
   * // => 'name@example.com'
   *
   * // Returns `null` instead of `undefined` when properties don't exist:
   * var property = { name: 'author.email', ... }
   *     obj      = {};
   *
   * getValue(obj, property)
   * // => null
   *
   */
  function getValue(obj, property) {
    var path = property.name.split('.'),
        ctx  = obj;

    for (var i = 0, len = path.length; i < len; i++) {
      ctx = ctx[path[i]] || null;
      if (!ctx) { break; }
    }

    return ctx;
  }

  /**
   * Sets property value on target object.
   *
   * @private
   * @name setValue
   * @param {Object} obj target object.
   * @param {Object} property property to be set.
   * @param {*} value value for the property to be set.
   * @example
   *
   * // Simple property:
   *
   * var property = { alias: 'email' },
   *     value = 'name@example.com',
   *     obj = {};
   *
   * setValue(obj, property, value);
   * // obj => { email: 'name@example.com' }
   *
   * // Nested property:
   *
   * var property = { alias: 'user.email' },
   *     value = 'name@example.com',
   *     obj = {};
   *
   * setValue(obj, property, value);
   * // obj => { user: { email: 'name@example.com' } }
   *
   */
  function setValue(obj, property, value) {
    var path = property.alias.split('.'),
        len  = path.length,
        ctx  = obj;

    for (var i = 0; i < len - 1; i++) {
      if (!ctx[path[i]]) { ctx[path[i]] = {}; }
      ctx = ctx[path[i]];
    }

    ctx[path[len - 1]] = value;
  }

  /**
   * Normalizes parser configuration of properties.
   *
   * @private
   * @name initProperties
   * @param {Object} config parser configuration.
   * @example
   *
   * config.properties = [
   *   'name',
   *   { 'address.city': 'city' },
   *   { 'address.street': 'street' }
   * ]
   *
   * initProperties(config)
   * // config.properties => [
   * //   { name: 'name', alias: 'name' }
   * //   { name: 'address.city', alias: 'city' },
   * //   { name: 'address.street', alias: 'street' }
   * // ]
   *
   */
  function initProperties(config) {
    var name,
        property,
        properties = [],
        val;

    if (!config.properties) {
      config.properties = [];
      return;
    }

    for (var i = config.properties.length - 1; i >= 0; i--) {

      property = config.properties[i];

      // Simple property: no configuration object, just a string,
      // with the name of the property.
      //
      // In this case we build a configuration object from scratch
      //
      // Example:
      //
      //   ['name', 'email']
      //
      if (isString(property)) {

        property = {
          name: property,
          alias: property
        };

      // Property configuration is an object
      } else {

        // The property is expressed in it's simple object form,
        // in this case we complement the configuration object
        //
        // Example:
        //
        //   [
        //     { fullName: 'name' },
        //     { mail: 'email' }
        //   ]
        //
        if (Object.keys(property).length == 1 && getKey(property) !== 'name') {
          name = getKey(property),
          val  = property[name];

          if (isString(val)) {
            property = { name: name, alias: val };
          } else {
            property      = val;
            property.name = name;
          }
        }

        // Once the property configuration is initialized
        // make sure the alias is set
        if (!property.alias) {
          property.alias = property.name;
        }
      }

      properties.push(property);
    }

    config.properties = properties;
  }

  /**
   * @name Parser
   * @constructor
   */
  function Parser(config) {
    this.config = config || {};
    initProperties(this.config);
  }

  /**
   * Reverse operation of parser (compose).
   *
   * @method compose
   */
  Parser.prototype.compose = function compose(data) {
    // TODO: Implementation
    return null;
  };

  /**
   * `parser` wrapper method.
   *
   * @method parse
   */
  Parser.prototype.parse = function parse(data) {
    if (!data) {
      return null;
    }

    return parseObject(this.config, data);
  };

  /**
   * @module Talknice
   */
  var Talknice = {
    parser: function parser(config) {
      return (new Parser(config));
    }
  };

  if (typeof define == 'function' && define.amd) {
    define(function () {
      return Talknice;
    });
  } else if (typeof module == 'object' && module.exports) {
    module.exports = Talknice;
  } else {
    root.Talknice = Talknice;
  }

}).call(this);
