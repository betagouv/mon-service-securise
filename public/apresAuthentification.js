import lisDonneesPartagees from './modules/donneesPartagees.mjs';

document.addEventListener('DOMContentLoaded', () => {
  const { tokenDonneesInvite } = lisDonneesPartagees('tokenDonneesInvite');

  const doitTerminerSonInscription = tokenDonneesInvite !== undefined;
  if (doitTerminerSonInscription) {
    window.location = `/creation-compte?token=${tokenDonneesInvite}`;
    return;
  }

  const { urlRedirection } = lisDonneesPartagees('url-redirection');
  const estAdmin = lisDonneesPartagees('utilisateur-admin');
  const estSuperviseur = lisDonneesPartagees('utilisateur-superviseur');

  let urlParDefaut = '/tableauDeBord';
  if (estSuperviseur && !estAdmin) {
    urlParDefaut = '/admin/entites';
  }

  window.location = urlRedirection ?? urlParDefaut;
});
