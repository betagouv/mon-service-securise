const $homologationExistante = (donneesHomologation, idUtilisateur) => {
  const descriptionContributeur = (donneesContributeur) => {
    let resultat = donneesContributeur.prenomNom;
    if (donneesContributeur.id === idUtilisateur) resultat += ' (vous)';
    return resultat;
  };

  const classePastillesContributeurs = 'pastilles-contributeurs';

  const $element = $(`
<a class="homologation existante" href="/homologation/${donneesHomologation.id}">
  <div class="titre-homologation">${donneesHomologation.nomService}</div>
  <div class="contributeurs">
    <p>Contributeurs</p>
    <div class="${classePastillesContributeurs}"></div>
  </div>
</a>
  `);

  donneesHomologation.contributeurs.forEach((donneesContributeur) => {
    $(`.${classePastillesContributeurs}`, $element).append($(`
<div class="pastille-contributeur" title="${descriptionContributeur(donneesContributeur)}">
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

const $homologations = (donneesHomologations, idUtilisateur) => (
  donneesHomologations
    .reduce(($acc, donneesHomologation) => {
      const $homologation = $homologationExistante(
        donneesHomologation,
        idUtilisateur,
      );
      return $acc.append($homologation);
    }, $(document.createDocumentFragment()))
    .append($ajoutNouvelleHomologation())
);

export default $homologations;
