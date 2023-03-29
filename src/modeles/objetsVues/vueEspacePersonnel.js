const parOrganisationsResponsables = (services) => {
  const parOrganisations = services
    .filter((service) => Array.isArray(service.organisationsResponsables))
    .flatMap((service) => service.organisationsResponsables
      .map(((organisation) => ({ organisation, id: service.id }))))
    .reduce((acc, courant) => {
      acc[courant.organisation] ||= [];
      acc.set(
        courant.organisation,
        [...(acc.has(courant.organisation) ? acc.get(courant.organisation) : []), courant.id]
      );
      return acc;
    }, new Map());
  return [...parOrganisations.keys()]
    .map((nomOrganisation) => (
      { nom: nomOrganisation, idServices: parOrganisations.get(nomOrganisation) }
    ));
};

const donnees = (services) => {
  const donneesServices = { services: [] };
  donneesServices.services = services
    .map((service) => ({
      ...service.toJSON(),
      organisationsResponsables: service.descriptionService?.organisationsResponsables,
    }));

  donneesServices.donneesFiltres = {
    parOrganisationsResponsables: parOrganisationsResponsables(donneesServices.services),
  };
  donneesServices.services = donneesServices.services
    .map(({ organisationsResponsables, ...autresDonnees }) => autresDonnees);

  return donneesServices;
};

module.exports = { donnees };
