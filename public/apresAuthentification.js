document.addEventListener('DOMContentLoaded', () => {
  const { tokenDonneesInvite } = JSON.parse(
    document.getElementById('tokenDonneesInvite').innerText
  );

  const doitTerminerSonInscription = tokenDonneesInvite !== undefined;
  if (doitTerminerSonInscription) {
    window.location = `/creation-compte?token=${tokenDonneesInvite}`;
    return;
  }

  const { urlRedirection } = JSON.parse(
    document.getElementById('url-redirection').innerText
  );
  window.location = urlRedirection ?? '/tableauDeBord';
});
