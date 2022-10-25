$(() => {
  const creeBoutonConnexion = () => $(`
<a href="/inscription" class="inscription">Inscription</a>
<a href="/connexion" class="connexion">Connexion</a>
  `);

  const creeConteneurUtilisateurCourant = (donneesUtilisateur) => $(`
<div class='nom-utilisateur-courant'>${donneesUtilisateur.prenomNom}</div>
  `);

  const creeMenu = () => $(`
<div class="menu">
  <a href="/espacePersonnel">Mon espace personnel</a>
  <a href="/utilisateur/edition">Mettre à jour mon profil</a>
  <a href="/connexion">Me déconnecter</a>
</div>
  `);

  const ajouteUtilisateurCourantDans = (selecteur, donneesUtilisateur) => {
    const $conteneur = $(selecteur);
    const $infosUtilisateurCourant = creeConteneurUtilisateurCourant(donneesUtilisateur);
    const $deconnexion = creeMenu();
    $deconnexion.toggle();

    $conteneur.on('click', () => {
      $deconnexion.toggle();
    });

    $conteneur.append($infosUtilisateurCourant, $deconnexion);
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
