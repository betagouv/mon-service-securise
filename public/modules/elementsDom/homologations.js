const $homologationExistante = (donneesHomologation) => {
  const $element = $(`
<a class="homologation existante" href="/homologation/${donneesHomologation.id}">
  <div class="titre-homologation">${donneesHomologation.nomService}</div>
  <div class="contributeurs">
    <p>Contributeurs</p>
    <div class="pastilles-contributeurs">
    </div>
  </div>
</a>
  `);

  donneesHomologation.contributeurs.forEach((donneesContributeur) => {
    $('.pastilles-contributeurs', $element).append($(`
<div class="pastille-contributeur" title="${donneesContributeur.prenomNom}">
  <div class="initiales">${donneesContributeur.initiales}</div>
</div>
    `));
  });

  return $element;
};

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
