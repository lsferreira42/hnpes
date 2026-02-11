(function() {
    var args = window.__hnpesBannerArgs;
    if (!args || !args.hnUrl) return;
    var hnUrl = args.hnUrl;
    var key = 'hnpes-banner-dismissed-' + hnUrl;
    if (sessionStorage.getItem(key)) return;
    var banner = document.createElement('div');
    banner.id = 'hnpes-discussed-banner';
    banner.setAttribute('role', 'banner');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#ff6600;color:#fff;padding:8px 16px;font-family:system-ui,sans-serif;font-size:14px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,.2);';
    var link = document.createElement('a');
    link.href = hnUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'This page was discussed on Hacker News →';
    link.style.color = '#fff';
    link.style.textDecoration = 'underline';
    banner.appendChild(link);
    var dismiss = document.createElement('button');
    dismiss.textContent = 'Dismiss';
    dismiss.setAttribute('aria-label', 'Dismiss banner');
    dismiss.style.cssText = 'background:rgba(255,255,255,.3);border:none;color:#fff;padding:4px 10px;cursor:pointer;border-radius:4px;margin-left:12px;';
    dismiss.addEventListener('click', function() {
        sessionStorage.setItem(key, '1');
        banner.remove();
    });
    banner.appendChild(dismiss);
    document.documentElement.insertBefore(banner, document.documentElement.firstChild);
})();
