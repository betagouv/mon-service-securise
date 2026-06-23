(() => {
  if (localStorage.getItem('optOutMatomo') !== 'true') {
    window._paq = window._paq || [];
    const { _paq } = window;

    const url = window.location.pathname.replace(
      /\/service\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//,
      '/service/{ID}/'
    );
    _paq.push([
      'setCustomUrl',
      window.location.origin + url + window.location.search,
    ]);

    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    _paq.push(['setTrackerUrl', '/bibliotheques/evenementMatomo']);
    _paq.push(['setSiteId', $('#script-matomo').data('id-matomo')]);

    const g = document.createElement('script');
    g.async = true;
    g.src = '/bibliotheques/matomo.js';

    const premierScript = document.getElementsByTagName('script')[0];
    premierScript.parentNode.insertBefore(g, premierScript);
  }
})();
