import ActionAbstraite from './Action.mjs';

class ActionSuppression extends ActionAbstraite {
  constructor(tableauDesServices) {
    super('#contenu-suppression', tableauDesServices);
    this.appliqueContenu({
      titre: 'Supprimer',
      texteSimple: 'Effacer toutes les données du service sélectionné.',
      texteMultiple: 'Effacer toutes les données des services sélectionnés.',
    });
  }

  initialise() {
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

    const { nomDuService, servicesSelectionnes } = this.tableauDesServices;
    const nbServicesSelectionnes = servicesSelectionnes.size;
    if (nbServicesSelectionnes === 1) {
      const idSelectionne = servicesSelectionnes.keys().next().value;
      $('#nombre-service-suppression').html(
        `le service <strong>${nomDuService(idSelectionne)}</strong> `
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

  execute() {
    const $actionSuppression = $('#action-suppression');
    const motDePasseChallenge = $('#mot-de-passe-challenge-suppression').val();

    $actionSuppression.hide();
    this.basculeLoader(true);

    const suppressions = [...this.tableauDesServices.servicesSelectionnes].map(
      (idService) =>
        axios.delete(`/api/service/${idService}`, {
          data: { motDePasseChallenge },
        })
    );

    return Promise.all(suppressions)
      .then(() => {
        this.tableauDesServices.servicesSelectionnes.clear();
        this.tableauDesServices.recupereServices();
      })
      .catch((exc) => {
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
