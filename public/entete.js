$(() => {
  const creeBoutonConnexion = () => $(
    '<a href="/connexion" class="connexion">Connexion</a>'
  );

  const creeConteneurUtilisateurCourant = (donneesUtilisateur) => $(
    `<div class='nom-utilisateur-courant'>${donneesUtilisateur.prenomNom}</div>`
  );

  const ajouteUtilisateurCourantDans = (selecteur, donneesUtilisateur) => {
    const $conteneur = $(selecteur);
    const $infosUtilisateurCourant = creeConteneurUtilisateurCourant(donneesUtilisateur);
    $conteneur.append($infosUtilisateurCourant);
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
