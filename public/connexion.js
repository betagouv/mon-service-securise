import brancheChampsMotDePasse from './modules/interactions/brancheChampsMotDePasse.mjs';

$(() => {
  const $inputs = $('input');
  const $erreur = $('.message-erreur');
  const $form = $('#connexion');

  const rendsAffichageNeutre = () => {
    $erreur.hide();
  };
  const afficheAlerte = () => {
    $erreur.show();
  };
  rendsAffichageNeutre();
  $inputs.addClass('intouche');
  $inputs.on('input', rendsAffichageNeutre);

  $form.on('submit', (e) => {
    e.preventDefault();
    const login = $('#login').val();
    const motDePasse = $('#mot-de-passe').val();
    axios
      .post('/api/token', { login, motDePasse })
      .then((reponse) => {
        const { nouvelleFonctionnalite } = reponse.data;
        let url = '/tableauDeBord';
        if (nouvelleFonctionnalite)
          url += `?nouvelleFonctionnalite=${nouvelleFonctionnalite}`;
        window.location = url;
      })
      .catch((error) => {
        if (error.response.status === 401) {
          afficheAlerte();
        }
      });
  });

  brancheChampsMotDePasse($form);
});
