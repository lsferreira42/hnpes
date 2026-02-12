/**
 * HNPES – compatibility layer for Chrome (chrome.*) and Firefox (browser.*).
 * Use globalThis.ext in service worker, window.ext in pages.
 */
(function(global) {
    'use strict';
    if (typeof browser !== 'undefined') {
        var b = browser;
        global.ext = {
            storage: {
                sync: {
                    get: function(keys, cb) {
                        b.storage.sync.get(keys).then(cb || function() {}).catch(function() {
                            if (cb) cb({});
                        });
                    },
                    set: function(obj, cb) {
                        b.storage.sync.set(obj).then(function() {
                            if (cb) cb();
                        }).catch(function() {
                            if (cb) cb();
                        });
                    }
                },
                local: {
                    get: function(keys, cb) {
                        b.storage.local.get(keys).then(cb || function() {}).catch(function() {
                            if (cb) cb({});
                        });
                    },
                    set: function(obj, cb) {
                        b.storage.local.set(obj).then(function() {
                            if (cb) cb();
                        }).catch(function() {
                            if (cb) cb();
                        });
                    },
                    remove: function(key, cb) {
                        b.storage.local.remove(key).then(function() {
                            if (cb) cb();
                        }).catch(function() {
                            if (cb) cb();
                        });
                    },
                    clear: function(cb) {
                        b.storage.local.clear().then(function() {
                            if (cb) cb();
                        }).catch(function() {
                            if (cb) cb();
                        });
                    }
                }
            },
            tabs: {
                query: function(q, cb) {
                    b.tabs.query(q).then(cb || function() {}).catch(function() {
                        if (cb) cb([]);
                    });
                },
                get: function(id, cb) {
                    b.tabs.get(id).then(cb || function() {}).catch(function() {
                        if (cb) cb(null);
                    });
                },
                create: function(opts) {
                    b.tabs.create(opts);
                },
                sendMessage: b.tabs.sendMessage.bind(b.tabs),
                onActivated: b.tabs.onActivated,
                onUpdated: b.tabs.onUpdated
            },
            runtime: {
                sendMessage: function(msg, cb) {
                    var p = b.runtime.sendMessage(msg);
                    if (cb) p.then(cb).catch(function() {
                        if (cb) cb({});
                    });
                },
                getURL: b.runtime.getURL.bind(b.runtime),
                openOptionsPage: b.runtime.openOptionsPage ? b.runtime.openOptionsPage.bind(b.runtime) : function() {
                    b.tabs.create({ url: b.runtime.getURL('options.html') });
                },
                onInstalled: b.runtime.onInstalled,
                onMessage: b.runtime.onMessage
            },
            action: b.action || b.browserAction,
            contextMenus: b.contextMenus,
            scripting: b.scripting,
            permissions: b.permissions
        };
    } else {
        global.ext = typeof chrome !== 'undefined' ? chrome : {};
    }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window);
