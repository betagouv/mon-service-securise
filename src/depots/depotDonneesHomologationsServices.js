const depotDonneesServices = require('./depotDonneesServices');

const creeDepot = (config = {}) => {
  const depotServices = depotDonneesServices.creeDepot(config);

  return {
    ajouteAvisExpertCyberAHomologation: depotServices.ajouteAvisExpertCyberAService,
    ajouteDescriptionServiceAHomologation: depotServices.ajouteDescriptionServiceAService,
    ajouteDossierCourantSiNecessaire: depotServices.ajouteDossierCourantSiNecessaire,
    ajouteMesuresAHomologation: depotServices.ajouteMesuresAService,
    ajouteRisqueGeneralAHomologation: depotServices.ajouteRisqueGeneralAService,
    ajouteRolesResponsabilitesAHomologation: depotServices.ajouteRolesResponsabilitesAService,
    dupliqueHomologation: depotServices.dupliqueService,
    finaliseDossier: depotServices.finaliseDossier,
    homologation: depotServices.service,
    homologationExiste: depotServices.serviceExiste,
    homologations: depotServices.services,
    enregistreDossierCourant: depotServices.enregistreDossierCourant,
    nouvelleHomologation: depotServices.nouveauService,
    remplaceRisquesSpecifiquesPourHomologation: depotServices.remplaceRisquesSpecifiquesPourService,
    supprimeHomologation: depotServices.supprimeService,
    supprimeHomologationsCreeesPar: depotServices.supprimeServicesCreesPar,
    toutesHomologations: depotServices.tousServices,
    trouveIndexDisponible: depotServices.trouveIndexDisponible,
  };
};

module.exports = { creeDepot };
