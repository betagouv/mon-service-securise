$(() => {
  const creeBoutonConnexion = () => $(
    '<a href="/connexion" class="connexion">Connexion</a>'
  );

  const creeConteneurUtilisateurCourant = (donneesUtilisateur) => $(`
<span class='nom-utilisateur-courant'>${donneesUtilisateur.prenomNom}</span>
<img src="/statique/assets/images/icone_fleche_bas.svg">
  `);

  const creeLienDeconnexion = () => $(
    '<a href="/connexion" class="deconnexion">Me déconnecter</a>'
  );

  const ajouteUtilisateurCourantDans = (selecteur, donneesUtilisateur) => {
    const $conteneur = $(selecteur);
    const $infosUtilisateurCourant = creeConteneurUtilisateurCourant(donneesUtilisateur);
    const $deconnexion = creeLienDeconnexion();
    $deconnexion.toggle();

    $conteneur.click(() => {
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
