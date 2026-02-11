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
    chrome.storage.sync.get(['showBadge'], function(data) {
        const showBadge = data.showBadge !== false;
        if (!showBadge) {
            chrome.action.setBadgeText({ tabId, text: '' });
            return;
        }
        if (!isSearchableUrl(url)) {
            chrome.action.setBadgeText({ tabId, text: '' });
            return;
        }
        const domainAndPath = getDomainAndPath(url);
        const requestUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(domainAndPath)}&page=0&hitsPerPage=20`;
        fetch(requestUrl)
            .then(res => res.ok ? res.json() : Promise.reject(new Error('API error')))
            .then(json => {
                let count = 0;
                const norm = (u) => {
                    try { const x = new URL(u); return (x.origin + x.pathname).replace(/\/$/, ''); } catch (_) { return u; }
                };
                const pageNorm = norm(url);
                if (json.hits && json.hits.length) {
                    for (const hit of json.hits) {
                        if (hit.url && pageNorm === norm(hit.url)) count++;
                    }
                }
                chrome.action.setBadgeText({ tabId, text: count > 0 ? String(count) : '' });
                if (count > 0) chrome.action.setBadgeBackgroundColor({ tabId, color: '#28a745' });
            })
            .catch(() => chrome.action.setBadgeText({ tabId, text: '' }));
    });
}

function scheduleBadgeUpdate(tabId, url) {
    if (badgeDebounceTimer) clearTimeout(badgeDebounceTimer);
    badgeDebounceTimer = setTimeout(() => updateBadgeForTab(tabId, url), BADGE_DEBOUNCE_MS);
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab && tab.url) scheduleBadgeUpdate(tab.id, tab.url);
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab && tab.url) scheduleBadgeUpdate(tabId, tab.url);
});

// Context menu: Search on Hacker News (for links)
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: 'hnpes-search-link',
        title: 'Search on Hacker News',
        contexts: ['link']
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'hnpes-search-link' && info.linkUrl) {
        const targetUrl = chrome.runtime.getURL('search.html?url=' + encodeURIComponent(info.linkUrl));
        chrome.tabs.create({ url: targetUrl });
    }
});

// Page indicator: inject content script when option is on and page was submitted to HN
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status !== 'complete' || !tab || !tab.url) return;
    chrome.storage.sync.get(['showPageIndicator'], function(data) {
        if (data.showPageIndicator !== true) return;
        if (!isSearchableUrl(tab.url)) return;
        const domainAndPath = getDomainAndPath(tab.url);
        const requestUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(domainAndPath)}&page=0&hitsPerPage=5`;
        fetch(requestUrl)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(json => {
                if (!json.hits || !json.hits.length) return;
                const norm = (u) => {
                    try { const x = new URL(u); return (x.origin + x.pathname).replace(/\/$/, ''); } catch (_) { return u; }
                };
                const pageNorm = norm(tab.url);
                const hit = json.hits.find(h => h.url && norm(h.url) === pageNorm);
                if (!hit) return;
                const payload = { hnUrl: 'https://news.ycombinator.com/item?id=' + hit.objectID, title: hit.title || 'Hacker News' };
                chrome.scripting.executeScript({
                    target: { tabId },
                    func: function(p) { window.__hnpesBannerArgs = p; },
                    args: [payload]
                }).then(function() {
                    return chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
                }).catch(() => {});
            })
            .catch(() => {});
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'getTabUrl') {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs && tabs.length > 0) {
                sendResponse({ url: tabs[0].url, title: tabs[0].title || '' });
            } else {
                sendResponse({ url: '', title: '' });
            }
        });
        return true;
    } else if (request.message === 'clearCache') {
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function(tab) {
                chrome.tabs.sendMessage(tab.id, { message: 'clearCache' }).catch(() => {});
            });
        });
    } else if (request.message === 'setBadge') {
        const { tabId, count } = request;
        if (tabId != null) {
            chrome.action.setBadgeText({ tabId, text: count > 0 ? String(count) : '' });
            if (count > 0) chrome.action.setBadgeBackgroundColor({ tabId, color: '#28a745' });
        }
    }
});
