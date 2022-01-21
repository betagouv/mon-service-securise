import $homologations from './modules/elementsDom/homologations.js';

$(() => {
  const ajouteConteneursHomologationDans = (placeholder, donneesHomologations) => {
    const $conteneurHomologations = $(placeholder);
    const $conteneursHomologation = $homologations(donneesHomologations);

    $conteneurHomologations.prepend($conteneursHomologation);
  };

  axios.get('/api/homologations', { headers: { 'x-id-utilisateur': '456' } })
    .then((reponse) => ajouteConteneursHomologationDans('.homologations', reponse.data.homologations));
});
