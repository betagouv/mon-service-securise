(() => {
  window._mtm = window._mtm || [];
  const { _mtm } = window;

  _mtm.push({ 'mtm.startTime': new Date().getTime(), event: 'mtm.Start' });

  const g = document.createElement('script');
  g.async = true;
  g.src = '/bibliotheques/matomo-tag-manager.js';

  const premierScript = document.getElementsByTagName('script')[0];
  premierScript.parentNode.insertBefore(g, premierScript);
})();
