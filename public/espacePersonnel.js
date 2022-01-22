$(() => {
  const creeConteneurHomologation = (donneesHomologation) => $(`
<a class="homologation existante" href="/homologation/${donneesHomologation.id}">
  <div>${donneesHomologation.nomService}</div>
</a>
  `);

  const creeConteneursHomologation = (donneesHomologations) => donneesHomologations.reduce(
    ($acc, donneesHomologation) => {
      const $conteneurHomologation = creeConteneurHomologation(donneesHomologation);
      return $acc.append($conteneurHomologation);
    }, $(document.createDocumentFragment())
  );

  const ajouteConteneursHomologationDans = (placeholder, donneesHomologations) => {
    const $conteneurHomologations = $(placeholder);
    const $conteneursHomologation = creeConteneursHomologation(donneesHomologations);

    $conteneurHomologations.prepend($conteneursHomologation);
  };

  axios.get('/api/homologations', { headers: { 'x-id-utilisateur': '456' } })
    .then((reponse) => ajouteConteneursHomologationDans('.homologations', reponse.data.homologations));
});
