import tableauDesServices from './tableauDesServices.mjs';
import registreDesActions from './registreActions.mjs';

const gestionnaireBarreOutils = {
  afficheOutils: () => {
    const selection = [...tableauDesServices.servicesSelectionnes];
    const estSelectionMultiple = selection.length > 1;
    const seulementProprietaire = selection
      .map((idService) =>
        tableauDesServices.donnees.find((service) => service.id === idService)
      )
      .every((service) => service.estProprietaire);
    const aDesDocuments =
      selection.length !== 1
        ? false
        : tableauDesServices.donnees.find(
            (service) => service.id === selection[0]
          )?.documentsPdfDisponibles.length;

    const appliqueVisibilite = (action) => {
      const doitMasquer = !registreDesActions[action].estDisponible({
        aDesDocuments,
        estSelectionMultiple,
        seulementProprietaire,
      });
      const $action = $(`.action[data-action="${action}"`);
      $action.toggleClass('inactif', doitMasquer);
    };

    Object.keys(registreDesActions).forEach(appliqueVisibilite);
  },
};

export default gestionnaireBarreOutils;
