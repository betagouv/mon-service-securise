const $modaleNouveauContributeur = () => $(`
<div class="rideau">
  <div class="modale">
    <div class="fermeture-modale"></div>
    <div class="contenu-modale">
      <h1>Ajout de contributeurs</h1>
      <label for="emailContributeur">Inviter un nouveau contributeur</label>
      <div class="consigne">Cette personne doit déjà avoir un compte MonServiceSécurisé</div>
      <div class="nouveau-contributeur">
        <div class="icone-enveloppe"></div>
        <input id="emailContributeur"
               name="emailContributeur"
               placeholder="ex. jean.dupont@mail.fr">
        <input id="idHomologation" name="idHomologation" type="hidden">
      </div>
      <div class="confirmation">
        <a class="bouton" id="nouveau-contributeur">Envoyer</a>
      </div>
    </div>
  </div>
</div>
`);

const $homologationExistante = (donneesHomologation, idUtilisateur, classeNouveauContributeur) => {
  const utilisateurCourantPeutAjouterContributeurs = () => {
    const idContributeurs = donneesHomologation.contributeurs.map((c) => c.id);

    return !idContributeurs.includes(idUtilisateur);
  };

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

  if (utilisateurCourantPeutAjouterContributeurs()) {
    $(`.${classePastillesContributeurs}`, $element).append($(`
<div class="${classeNouveauContributeur}" data-id-homologation="${donneesHomologation.id}"></div>
    `));
  }

  donneesHomologation.contributeurs.forEach((donneesContributeur) => {
    const classePastilleContributeur = (
      `pastille-contributeur ${donneesContributeur.cguAcceptees ? 'valide' : 'en-attente'}`
    );

    $(`.${classePastillesContributeurs}`, $element).append($(`
<div class="${classePastilleContributeur}" title="${descriptionContributeur(donneesContributeur)}">
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

const $homologations = (donneesHomologations, idUtilisateur, classeNouveauContributeur) => (
  donneesHomologations.reduce(($acc, donneesHomologation) => {
    const $homologation = $homologationExistante(
      donneesHomologation,
      idUtilisateur,
      classeNouveauContributeur,
    );
    return $acc.append($homologation);
  }, $(document.createDocumentFragment()))
    .append($ajoutNouvelleHomologation())
);

export { $homologations, $modaleNouveauContributeur };
