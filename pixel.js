// Meta Pixel: measures visits from our Facebook/Instagram ads. Website only, never in the app.
// Deliberately not loaded on confirmed.html: Supabase puts auth tokens in that page's URL,
// and the pixel reports the full URL to Meta.
(function () {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', '964608549501462');
  fbq('track', 'PageView');

  // Every App Store button counts as a Lead: the conversion ads can optimize for.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="apps.apple.com"]');
    if (!a) return;
    fbq('track', 'Lead', { content_name: 'App Store' });
    // The pixel sends through an image request, which leaving the page can cancel.
    // Hold same-tab navigation briefly so the event gets out.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    e.preventDefault();
    setTimeout(function () { location.href = a.href; }, 300);
  }, true);
})();
