/*
    remoteStorage client API:
    
    getCurrentWebRoot:  function ()
    getListing:         function (path, cb, context)
    getMedia:           function (path, cb, context)
    getObject:          function (path, cb, context)
    getState:           function (path)
    on:                 function (eventType, cb, context)
    remove:             function (path)
    storeMedia:         function (mimeType, path, data)
    storeObject:        function (type, path, obj)
    sync:               function (path, switchVal)
*/

RemoteStore = (function() {
  if (!window.localStorage || !window.remoteStorage) return null;
  
  var ITEM_TYPE = 'password-gen-params';
  
  remoteStorage.defineModule('vault', function(client) {
    // Dummy saved data
    window.rs = client;
    client.storeObject('password-gen-params', 'global', {length: 16});
    client.storeObject('password-gen-params', 'services/google', {length: 20, symbol: 0, space: 0});
    client.storeObject('password-gen-params', 'services/twitter', {length: 10, repeat: 2, upper: 3});
    
    var store = {
      clear: function(callback, context) {
        var keys = client.getListing('');
        for (var i = 0, n = keys.length; i < n; i++) client.remove(keys[i]);
        callback.call(context, null);
      },
      
      load: function(callback, context) {
        var config = {global: {}, services: {}},
            global, keys, key, object;
        
        if (global = client.getObject('global')) {
          delete global['@type'];
          config.global = global;
        }
        
        keys = client.getListing('services/');
        for (var i = 0, n = keys.length; i < n; i++) {
          key    = keys[i];
          object = client.getObject('services/' + key);
          delete object['@type'];
          config.services[key] = object;
        }
        callback.call(context, null, config);
      },
      
      dump: function(config, callback, context) {
        if (config.global) client.storeObject(ITEM_TYPE, 'global', config.global);
        if (config.services) {
          for (var key in config.services)
            client.storeObject(ITEM_TYPE, 'services/' + key, config.services[key]);
        }
        callback.call(context, null);
      }
    };
    
    return {name: 'vault', exports: store};
  });
  
  remoteStorage.loadModule('vault');
  return remoteStorage.vault;
})();

