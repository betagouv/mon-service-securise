const metEnFormeContributeur = (contributeur, estProprietaire) =>
  `<li>
    <div class='contenu-nom-prenom'>
      <div class='initiale ${
        estProprietaire ? 'proprietaire' : 'contributeur'
      }'>${contributeur.initiales}</div>
      <div class='nom-prenom-poste'>
        <div class='nom-contributeur'>${contributeur.prenomNom}</div>
        <div class='poste-contributeur'>${contributeur.poste || '…'}</div>
      </div>
    </div>
    <div class='role ${estProprietaire ? 'proprietaire' : 'contributeur'}'>${
    estProprietaire ? 'Propriétaire' : 'Contributeur'
  }</div>
  </li>`;

class ActionContributeurs {
  constructor(tableauDesServices) {
    this.tableauDesServices = tableauDesServices;
    this.titre = 'Contributeurs';
    this.texteSimple =
      'Gérer la liste des personnes invitées à contribuer au service sélectionné.';
  }

  initialise(...args) {
    const [idService] = args;
    const service = this.tableauDesServices.donneesDuService(idService);
    const $listeContributeurs = $('#liste-contributeurs');

    $listeContributeurs.empty();
    $listeContributeurs.append(metEnFormeContributeur(service.createur, true));
    service.contributeurs.forEach((contributeur) => {
      $listeContributeurs.append(metEnFormeContributeur(contributeur, false));
    });
  }
}

export default ActionContributeurs;
