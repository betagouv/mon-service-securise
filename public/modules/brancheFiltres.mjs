const cacheTousLesServices = () => $('.service[data-id]').hide();
const afficheTousLesServices = () => $('.service[data-id]').show();
const afficheLeService = (id) => $(`.service[data-id=${id}]`).show();

const idServicesAAfficher = (donneesFiltres, organisations) => {
  const ids = organisations.map((organisation) => donneesFiltres.get(organisation))
    .filter((idServices) => Array.isArray(idServices))
    .sort((idServices1, idServices2) => idServices1.length - idServices2.length);

  return ids
    .reduce((acc, idServices) => acc.filter(
      (idService) => idServices.includes(idService)
    ), ids.length > 0 ? ids[0] : []);
};

const comportementAuChangement = (donneesFiltres) => (donnees) => {
  if (donnees.length === 0) {
    afficheTousLesServices();
    return;
  }

  cacheTousLesServices();

  idServicesAAfficher(donneesFiltres, donnees).forEach((idService) => {
    afficheLeService(idService);
  });
};

const brancheFiltres = (donnees) => {
  const donneesFiltres = donnees.parOrganisationsResponsables
    .reduce((acc, { nom, idServices }) => {
      acc.set(nom, idServices);
      return acc;
    }, new Map());

  $('#filtre').selectize({
    plugins: ['remove_button'],
    options: [...donneesFiltres.keys()].map((organisation) => ({ valeur: organisation })),
    valueField: 'valeur',
    labelField: 'valeur',
    searchField: 'valeur',
    render: {
      item: (item) => `<div class="item">${item.valeur}</div>`,
      option: (option) => `<div class="option">${option.valeur}</div>`,
    },
    sortField: [{ field: 'valeur', direction: 'asc' }],
    onChange: comportementAuChangement(donneesFiltres),
  });
};

export default brancheFiltres;
export { idServicesAAfficher };
