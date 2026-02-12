/* global importScripts, ext */
if (typeof importScripts !== 'undefined' && typeof ext === 'undefined') {
    importScripts('compat.js');
}

// Badge debounce: avoid calling API on every tab update
let badgeDebounceTimer = null;
const BADGE_DEBOUNCE_MS = 500;

function isSearchableUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const u = url.trim().toLowerCase();
    return u.startsWith('http://') || u.startsWith('https://');
}

function getDomainAndPath(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname + parsed.pathname;
    } catch (_) {
        return '';
    }
}

function updateBadgeForTab(tabId, url) {
    if (!tabId || !url) return;
    ext.storage.sync.get(['showBadge'], function(data) {
        const showBadge = data.showBadge !== false;
        if (!showBadge) {
            ext.action.setBadgeText({ tabId, text: '' });
            return;
        }
        if (!isSearchableUrl(url)) {
            ext.action.setBadgeText({ tabId, text: '' });
            return;
        }
        const domainAndPath = getDomainAndPath(url);
        const requestUrl = 'https://hn.algolia.com/api/v1/search?query=' + encodeURIComponent(domainAndPath) + '&page=0&hitsPerPage=20';
        fetch(requestUrl)
            .then(function(res) { return res.ok ? res.json() : Promise.reject(new Error('API error')); })
            .then(function(json) {
                var count = 0;
                var norm = function(u) {
                    try { var x = new URL(u); return (x.origin + x.pathname).replace(/\/$/, ''); } catch (_) { return u; }
                };
                var pageNorm = norm(url);
                if (json.hits && json.hits.length) {
                    for (var i = 0; i < json.hits.length; i++) {
                        var hit = json.hits[i];
                        if (hit.url && pageNorm === norm(hit.url)) count++;
                    }
                }
                ext.action.setBadgeText({ tabId, text: count > 0 ? String(count) : '' });
                if (count > 0) ext.action.setBadgeBackgroundColor({ tabId, color: '#28a745' });
            })
            .catch(function() { ext.action.setBadgeText({ tabId, text: '' }); });
    });
}

function scheduleBadgeUpdate(tabId, url) {
    if (badgeDebounceTimer) clearTimeout(badgeDebounceTimer);
    badgeDebounceTimer = setTimeout(function() { updateBadgeForTab(tabId, url); }, BADGE_DEBOUNCE_MS);
}

ext.tabs.onActivated.addListener(function(activeInfo) {
    ext.tabs.get(activeInfo.tabId, function(tab) {
        if (tab && tab.url) scheduleBadgeUpdate(tab.id, tab.url);
    });
});

ext.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab && tab.url) scheduleBadgeUpdate(tabId, tab.url);
});

// Context menu: Search on Hacker News (for links)
ext.runtime.onInstalled.addListener(function() {
    ext.contextMenus.create({
        id: 'hnpes-search-link',
        title: 'Search on Hacker News',
        contexts: ['link']
    });
});

ext.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'hnpes-search-link' && info.linkUrl) {
        var targetUrl = ext.runtime.getURL('search.html?url=' + encodeURIComponent(info.linkUrl));
        ext.tabs.create({ url: targetUrl });
    }
});

// Page indicator: inject content script when option is on and page was submitted to HN
ext.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status !== 'complete' || !tab || !tab.url) return;
    ext.storage.sync.get(['showPageIndicator'], function(data) {
        if (data.showPageIndicator !== true) return;
        if (!isSearchableUrl(tab.url)) return;
        var domainAndPath = getDomainAndPath(tab.url);
        var requestUrl = 'https://hn.algolia.com/api/v1/search?query=' + encodeURIComponent(domainAndPath) + '&page=0&hitsPerPage=5';
        fetch(requestUrl)
            .then(function(res) { return res.ok ? res.json() : Promise.reject(); })
            .then(function(json) {
                if (!json.hits || !json.hits.length) return;
                var norm = function(u) {
                    try { var x = new URL(u); return (x.origin + x.pathname).replace(/\/$/, ''); } catch (_) { return u; }
                };
                var pageNorm = norm(tab.url);
                var hit = null;
                for (var j = 0; j < json.hits.length; j++) {
                    if (json.hits[j].url && norm(json.hits[j].url) === pageNorm) { hit = json.hits[j]; break; }
                }
                if (!hit) return;
                var payload = { hnUrl: 'https://news.ycombinator.com/item?id=' + hit.objectID, title: hit.title || 'Hacker News' };
                ext.scripting.executeScript({
                    target: { tabId: tabId },
                    func: function(p) { window.__hnpesBannerArgs = p; },
                    args: [payload]
                }).then(function() {
                    return ext.scripting.executeScript({ target: { tabId: tabId }, files: ['content.js'] });
                }).catch(function() {});
            })
            .catch(function() {});
    });
});

ext.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'getTabUrl') {
        ext.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs.length > 0) {
                sendResponse({ url: tabs[0].url, title: tabs[0].title || '' });
            } else {
                sendResponse({ url: '', title: '' });
            }
        });
        return true;
    } else if (request.message === 'clearCache') {
        ext.tabs.query({}, function(tabs) {
            tabs.forEach(function(tab) {
                ext.tabs.sendMessage(tab.id, { message: 'clearCache' }).catch(function() {});
            });
        });
    } else if (request.message === 'setBadge') {
        var tabId = request.tabId;
        var count = request.count;
        if (tabId != null) {
            ext.action.setBadgeText({ tabId: tabId, text: count > 0 ? String(count) : '' });
            if (count > 0) ext.action.setBadgeBackgroundColor({ tabId: tabId, color: '#28a745' });
        }
    }
});
