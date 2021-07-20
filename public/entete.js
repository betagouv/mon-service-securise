$(() => {
  const creeBoutonConnexion = () => $(`
<a href="/inscription" class="inscription">Inscription</a>
<a href="/connexion" class="connexion">Connexion</a>
  `);

  const creeConteneurUtilisateurCourant = (donneesUtilisateur) => $(`
<span class='nom-utilisateur-courant'>${donneesUtilisateur.prenomNom}</span>
<img src="/statique/assets/images/icone_fleche_bas.svg">
  `);

  const creeMenu = () => $(`
<div class="menu">
  <a href="/homologations">Mes homologations</a>
  <a href="/connexion">Me déconnecter</a>
</div>
  `);

  const ajouteUtilisateurCourantDans = (selecteur, donneesUtilisateur) => {
    const $conteneur = $(selecteur);
    const $infosUtilisateurCourant = creeConteneurUtilisateurCourant(donneesUtilisateur);
    const $deconnexion = creeMenu();
    $deconnexion.toggle();

    $conteneur.click(() => {
      $deconnexion.toggle();
    });

    $conteneur.append($infosUtilisateurCourant, $deconnexion);
    $conteneur.css('cursor', 'pointer');
  };

  const ajouteBoutonConnexionDans = (selecteur) => {
    const $conteneur = $(selecteur);
    const $bouton = creeBoutonConnexion();
    $conteneur.append($bouton);
  };

  axios.get('/api/utilisateurCourant')
    .then((reponse) => ajouteUtilisateurCourantDans('.utilisateur-courant', reponse.data.utilisateur))
    .catch(() => ajouteBoutonConnexionDans('.utilisateur-courant'));
});
