document.addEventListener('DOMContentLoaded', () => {
  const { tokenDonneesInvite } = JSON.parse(
    document.getElementById('tokenDonneesInvite').innerText
  );

  if (tokenDonneesInvite) {
    window.location = `/creation-compte?token=${tokenDonneesInvite}`;
  } else {
    const { urlRedirection } = JSON.parse(
      document.getElementById('url-redirection').innerText
    );
    window.location = urlRedirection ?? '/tableauDeBord';
  }
});
