import brancheChampsMotDePasse from './modules/interactions/brancheChampsMotDePasse.mjs';

$(() => {
  const $inputs = $('input');
  const $erreur = $('.message-erreur');
  const $form = $('#connexion');
  const { urlRedirection } = JSON.parse($('#url-redirection').text());

  const rendsAffichageNeutre = () => {
    $erreur.hide();
  };
  const afficheAlerte = () => {
    $erreur.show();
  };
  rendsAffichageNeutre();
  $inputs.on('input', rendsAffichageNeutre);

  $form.on('submit', (e) => {
    e.preventDefault();
    const login = $('#login').val();
    const motDePasse = $('#mot-de-passe').val();
    axios
      .post('/api/token', { login, motDePasse })
      .then(() => (window.location = urlRedirection ?? '/tableauDeBord'))
      .catch((error) => {
        if (error.response.status === 401) {
          afficheAlerte();
        }
      });
  });

  const brancheRedirectionAgentConnect = () => {
    const query = new URLSearchParams(window.location.search);

    if (query.has('urlRedirection')) {
      const $lienConnexion = $('.agentconnect-button');
      const lienActuel = $lienConnexion.attr('href');
      const lienAvecRedirection = `${lienActuel}?urlRedirection=${query.get(
        'urlRedirection'
      )}`;

      $lienConnexion.attr('href', lienAvecRedirection);
    }
  };

  brancheChampsMotDePasse($form);
  brancheRedirectionAgentConnect();
});
