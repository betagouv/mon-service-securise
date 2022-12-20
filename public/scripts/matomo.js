(() => {
  window._paq = window._paq || [];
  const { _paq } = window;

  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  _paq.push(['setTrackerUrl', '/bibliotheques/evenementMatomo']);
  _paq.push(['setSiteId', '273']);

  const g = document.createElement('script');
  g.async = true;
  g.src = '/bibliotheques/piwik.js';

  const premierScript = document.getElementsByTagName('script')[0];
  premierScript.parentNode.insertBefore(g, premierScript);
})();
