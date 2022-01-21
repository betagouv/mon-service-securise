const $homologationExistante = (donneesHomologation) => $(`
<a class="homologation existante" href="/homologation/${donneesHomologation.id}">
  <div>${donneesHomologation.nomService}</div>
</a>
`);

const $homologations = (donneesHomologations) => donneesHomologations.reduce(
  ($acc, donneesHomologation) => {
    const $conteneurHomologation = $homologationExistante(donneesHomologation);
    return $acc.append($conteneurHomologation);
  }, $(document.createDocumentFragment())
);

export default $homologations;
