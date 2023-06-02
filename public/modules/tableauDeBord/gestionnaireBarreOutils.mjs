import tableauDesServices from './tableauDesServices.mjs';
import registreDesActions from './registreActions.mjs';

const gestionnaireBarreOutils = {
  afficheOutils: () => {
    const selection = [...tableauDesServices.servicesSelectionnes];
    const estSelectionMultiple = selection.length > 1;
    const seulementCreateur = selection
      .map((idService) =>
        tableauDesServices.donnees.find((service) => service.id === idService)
      )
      .every((service) => service.estCreateur);

    const appliqueVisibilite = (action) => {
      const doitMasquer = !registreDesActions[action].estDisponible({
        estSelectionMultiple,
        seulementCreateur,
      });
      const $action = $(`.action[data-action="${action}"`);
      $action.toggleClass('inactif', doitMasquer);
    };

    Object.keys(registreDesActions).forEach(appliqueVisibilite);
  },
};

export default gestionnaireBarreOutils;
