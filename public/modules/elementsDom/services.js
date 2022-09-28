const $modaleNouveauContributeur = () => $(`
<div class="rideau">
  <div class="modale">
    <div class="fermeture-modale"></div>
    <div class="contenu-modale">
      <h1>Ajout de contributeurs</h1>
      <label for="emailContributeur">Inviter un nouveau contributeur</label>
      <div class="nouveau-contributeur">
        <div class="icone-enveloppe"></div>
        <input id="emailContributeur"
               name="emailContributeur"
               placeholder="ex. jean.dupont@mail.fr">
        <input id="idService" name="idService" type="hidden">
      </div>
      <div class="confirmation">
        <a class="bouton" id="nouveau-contributeur">Envoyer</a>
      </div>
    </div>
  </div>
</div>
`);

const $serviceExistant = (donneesService, idUtilisateur, classeNouveauContributeur) => {
  const utilisateurCourantPeutAjouterContributeurs = () => {
    const idContributeurs = donneesService.contributeurs.map((c) => c.id);

    return !idContributeurs.includes(idUtilisateur);
  };

  const descriptionContributeur = (donneesContributeur, proprietaire) => {
    let resultat = donneesContributeur.prenomNom;
    if (donneesContributeur.id === idUtilisateur) resultat += ' (vous)';
    if (proprietaire) resultat += '\nPropriétaire';
    return resultat;
  };

  const $pastille = (classePastille, donneesUtilisateur, proprietaire = false) => $(`
<div class="${classePastille}" title="${descriptionContributeur(donneesUtilisateur, proprietaire)}">
  <div class="initiales">${donneesUtilisateur.initiales}</div>
</div>
    `);

  const classePastilles = 'pastilles';

  const $element = $(`
<a class="service" href="/homologation/${donneesService.id}">
  <div class="titre-service">${donneesService.nomService}</div>
  <div class="contributeurs">
    <p>Contributeurs</p>
    <div class="${classePastilles}"></div>
  </div>
</a>
  `);

  if (utilisateurCourantPeutAjouterContributeurs()) {
    $(`.${classePastilles}`, $element).append($(`
<div class="${classeNouveauContributeur}" data-id-service="${donneesService.id}"></div>
    `));
  }

  $(`.${classePastilles}`, $element).append($pastille('pastille createur', donneesService.createur, true));

  donneesService.contributeurs.forEach((donneesContributeur) => {
    const classePastilleContributeur = (
      `pastille contributeur ${donneesContributeur.cguAcceptees ? 'valide' : 'en-attente'}`
    );

    $(`.${classePastilles}`, $element).append($pastille(classePastilleContributeur, donneesContributeur));
  });

  return $element;
};

const $nouveauService = () => $(`
<a class="nouveau service" href="/homologation/creation">
  <div class="icone-ajout"></div>
  <div>Nouveau service</div>
</a>
`);

const $services = (donneesServices, idUtilisateur, classeNouveauContributeur) => (
  donneesServices.reduce(($acc, donneesService) => {
    const $service = $serviceExistant(
      donneesService,
      idUtilisateur,
      classeNouveauContributeur,
    );
    return $acc.append($service);
  }, $(document.createDocumentFragment()))
    .append($nouveauService())
);

export { $services, $modaleNouveauContributeur };
