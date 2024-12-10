import ActionAbstraite from './Action.mjs';

class ActionSuppressionDossierCourant extends ActionAbstraite {
  constructor() {
    super('#contenu-suppression-dossier-courant');
    this.appliqueContenu({
      titre: 'Supprimer',
      texteSimple: "Effacer toutes les données du projet d'homologation.",
      texteMultiple: '',
    });
  }

  initialise() {
    super.initialise();
    $('#action-suppression-dossier-courant').show();
    const champConfirmation = $('#confirmation-suppression');
    champConfirmation.val('');
    champConfirmation.removeClass('touche');
  }

  // eslint-disable-next-line consistent-return
  async execute({ idService }) {
    const $actionSuppression = $('#action-suppression-dossier-courant');

    if (!this.formulaireEstValide) return Promise.reject();

    $actionSuppression.hide();
    this.basculeLoader(true);

    await axios.delete(`/api/service/${idService}/homologation/dossierCourant`);
  }
}

export default ActionSuppressionDossierCourant;
