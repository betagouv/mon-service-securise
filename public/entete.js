import brancheMenuSandwich from './modules/interactions/brancheMenuSandwich.js';

$(() => {
  const creeBoutonConnexion = () =>
    $(`
<a href="/inscription" class="inscription">Inscription</a>
<a href="/connexion" class="connexion">Connexion</a>
  `);

  const creeConteneurUtilisateurCourant = (donneesUtilisateur) =>
    $(`
<div class='nom-utilisateur-courant'>${donneesUtilisateur.prenomNom}</div>
  `);

  const creeMenu = (sourceAuthentification) =>
    $(`
<div class="menu">
  <a href="/tableauDeBord">Mon tableau de bord</a>
  <a href="/profil">Mettre à jour mon profil</a>
  ${
    sourceAuthentification === 'MSS'
      ? '<a href="/motDePasse/edition">Changer mon mot de passe</a>'
      : ''
  }
</div>
  `);

  const deconnexion = () =>
    '<a class="deconnexion" href="/deconnexion">Se déconnecter</a>';

  const ajouteUtilisateurCourantDans = (
    selecteur,
    { utilisateur: donneesUtilisateur, sourceAuthentification }
  ) => {
    const $conteneur = $(selecteur);

    const $identiteUtilisateur =
      creeConteneurUtilisateurCourant(donneesUtilisateur);
    const $menu = creeMenu(sourceAuthentification);
    $menu.toggle();

    $conteneur.on('click', () => $menu.toggle());

    $conteneur.append($identiteUtilisateur, $menu);
    $(deconnexion()).insertAfter($conteneur);
  };

  const ajouteBoutonConnexionDans = (selecteur) => {
    const $conteneur = $(selecteur);
    const $bouton = creeBoutonConnexion();
    $conteneur.append($bouton);
  };

  brancheMenuSandwich();

  axios
    .get('/api/utilisateurCourant')
    .then((reponse) =>
      ajouteUtilisateurCourantDans('.utilisateur-courant', reponse.data)
    )
    .catch(() => ajouteBoutonConnexionDans('.utilisateur-courant'));
});
