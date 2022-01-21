const $homologationExistante = (donneesHomologation) => $(`
<a class="homologation existante" href="/homologation/${donneesHomologation.id}">
  <div>${donneesHomologation.nomService}</div>
</a>
`);

const $ajoutNouvelleHomologation = () => $(`
<a class="nouvelle homologation" href="/homologation/creation">
  <div class="icone-ajout"></div>
  <div>Créer un nouveau projet d'homologation</div>
</a>
`);

const $homologations = (donneesHomologations) => donneesHomologations.reduce(
  ($acc, donneesHomologation) => {
    const $conteneurHomologation = $homologationExistante(donneesHomologation);
    return $acc.append($conteneurHomologation);
  }, $(document.createDocumentFragment())
)
  .append($ajoutNouvelleHomologation());

export default $homologations;
