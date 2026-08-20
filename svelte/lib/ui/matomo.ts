export const trackDansMatomo = (
  url: string,
  urlPrecedente: string,
  titrePage: string
) => {
  const sansIdService = (u: string) =>
    u.replace(
      /\/service\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//,
      '/service/{ID}/'
    );
  const urlCompleteSansId = (u: string) =>
    window.location.origin + sansIdService(u) + window.location.search;

  window._paq = window._paq || [];
  const { _paq } = window;

  _paq.push(['setReferrerUrl', urlCompleteSansId(urlPrecedente)]);
  _paq.push(['setCustomUrl', urlCompleteSansId(url)]);
  _paq.push(['setDocumentTitle', titrePage]);
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
};
