import $homologations from './modules/elementsDom/homologations.js';

$(() => {
  const ajouteConteneursHomologationDans = (placeholder, donneesHomologations, idUtilisateur) => {
    const $conteneurHomologations = $(placeholder);
    const $conteneursHomologation = $homologations(donneesHomologations, idUtilisateur);

    $conteneurHomologations.prepend($conteneursHomologation);
  };

  axios.get('/api/utilisateurCourant')
    .then((reponse) => reponse.data.utilisateur.id)
    .then((idUtilisateur) => axios
      .get('/api/homologations')
      .then((reponse) => ajouteConteneursHomologationDans(
        '.homologations',
        reponse.data.homologations,
        idUtilisateur,
      )));
});
