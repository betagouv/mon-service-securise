import ActionAbstraite from './Action.mjs';

class ActionSuppression extends ActionAbstraite {
  constructor() {
    super('#contenu-suppression');
    this.appliqueContenu({
      titre: 'Supprimer',
      texteSimple: 'Effacer toutes les données du service sélectionné.',
      texteMultiple: 'Effacer toutes les données des services sélectionnés.',
    });
  }

  initialise({ nomDuService, nbServicesSelectionnes }) {
    super.initialise();
    $('#action-suppression').show();
    const $msgErreurChallenge = $(
      '#mot-de-passe-challenge-suppression ~ .message-erreur-specifique'
    );
    const $champChallenge = $('#mot-de-passe-challenge-suppression');
    $msgErreurChallenge.hide();
    $champChallenge.val('');

    $champChallenge.off('input');
    $champChallenge.on('input', () => $msgErreurChallenge.hide());

    if (nbServicesSelectionnes === 1) {
      $('#nombre-service-suppression').html(
        `le service <strong>${nomDuService}</strong> `
      );
    } else {
      $('#nombre-service-suppression').html(
        `<strong>les ${nbServicesSelectionnes} services sélectionnés</strong> `
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ seulementCreateur }) {
    return seulementCreateur;
  }

  execute({ idServices }) {
    const $actionSuppression = $('#action-suppression');
    const motDePasseChallenge = $('#mot-de-passe-challenge-suppression').val();

    if (!this.formulaireEstValide) return Promise.reject();

    $actionSuppression.hide();
    this.basculeLoader(true);

    const suppressions = idServices.map((idService) =>
      axios.delete(`/api/service/${idService}`, {
        data: { motDePasseChallenge },
      })
    );

    return Promise.all(suppressions).catch((exc) => {
      if (exc.response.status === 401) {
        const $msgErreurChallenge = $(
          '#mot-de-passe-challenge-suppression ~ .message-erreur-specifique'
        );
        $msgErreurChallenge.show();
        $actionSuppression.show();
        this.basculeLoader(false);

        throw exc;
      }
    });
  }
}

export default ActionSuppression;
