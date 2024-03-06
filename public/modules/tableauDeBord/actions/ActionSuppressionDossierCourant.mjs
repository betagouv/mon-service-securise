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
    const $msgErreurChallenge = $(
      '#mot-de-passe-challenge-suppression-dossier-courant ~ .message-erreur-specifique'
    );
    const $champChallenge = $(
      '#mot-de-passe-challenge-suppression-dossier-courant'
    );
    $msgErreurChallenge.hide();
    $champChallenge.val('');

    $champChallenge.off('input');
    $champChallenge.on('input', () => $msgErreurChallenge.hide());
  }

  // eslint-disable-next-line consistent-return
  async execute({ idService }) {
    const $actionSuppression = $('#action-suppression-dossier-courant');
    const motDePasseChallenge = $(
      '#mot-de-passe-challenge-suppression-dossier-courant'
    ).val();

    if (!this.formulaireEstValide) return Promise.reject();

    $actionSuppression.hide();
    this.basculeLoader(true);

    try {
      await axios.delete(
        `/api/service/${idService}/homologation/dossierCourant`,
        {
          data: { motDePasseChallenge },
        }
      );
    } catch (e) {
      if (e.response.status === 401) {
        const $msgErreurChallenge = $(
          '#mot-de-passe-challenge-suppression-dossier-courant ~ .message-erreur-specifique'
        );
        $msgErreurChallenge.show();
        $actionSuppression.show();
        this.basculeLoader(false);

        throw e;
      }
    }
  }
}

export default ActionSuppressionDossierCourant;
