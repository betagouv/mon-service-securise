import lanceDecompteDeconnexion from './modules/deconnexion.js';

class ErreurConversionNumerique extends Error {}

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
    $conteneur.css('cursor', 'pointer');
  };

  const ajouteBoutonConnexionDans = (selecteur) => {
    const $conteneur = $(selecteur);
    const $bouton = creeBoutonConnexion();
    $conteneur.append($bouton);
  };

  axios.get('/api/utilisateurCourant')
    .then((reponse) => {
      ajouteUtilisateurCourantDans('.utilisateur-courant', reponse.data.utilisateur);
      const duree = parseInt(reponse.data.dureeSession, 10);
      if (!duree) {
        return Promise.reject(new ErreurConversionNumerique());
      }

      return lanceDecompteDeconnexion(duree);
    })
    .catch((erreur) => {
      if (erreur instanceof ErreurConversionNumerique) {
        /* eslint-disable no-console */
        console.warn("Impossible d'initialiser la modale de déconnexion, causé par une erreur pendant la conversion du délai de déconnexion");
        /* eslint-enable no-console */
      } else {
        ajouteBoutonConnexionDans('.utilisateur-courant');
      }
    });
});
