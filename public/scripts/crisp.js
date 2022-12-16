// Script obtenu sur https://app.crisp.chat/settings/websites/ > « Intégrations » > « HTML »
window.$crisp = [];
window.CRISP_WEBSITE_ID = '83715488-f261-43fe-806b-519f8611e146';
function activeCrisp() {
  const d = document;
  const s = d.createElement('script');
  s.src = 'https://client.crisp.chat/l.js';
  s.async = 1;
  d.getElementsByTagName('head')[0].appendChild(s);
}
activeCrisp();
