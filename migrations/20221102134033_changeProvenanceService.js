const PROVENANCES = ['developpement', 'achat', 'outilExistant'];

const reduitProvenance = (provenances) => {
  if (!provenances) {
    return undefined;
  }

  if (!(provenances instanceof Array)) {
    return undefined;
  }

  if (provenances.length === 1 && PROVENANCES.includes(provenances[0])) {
    return provenances[0];
  }

  if (provenances.length > 1 && (
    provenances.every((provenance) => PROVENANCES.includes(provenance))
  )) {
    return 'outilExistant';
  }

  return undefined;
};

const developpeProvenance = (provenance) => {
  if (!provenance) {
    return undefined;
  }
  if (provenance === 'outilExistant') {
    return ['developpement', 'achat'];
  }
  return PROVENANCES.includes(provenance) ? [provenance] : [];
};

const changementDescriptionService = (changeProvenance) => (knex) => knex('homologations')
  .then((lignes) => {
    const misesAJour = lignes
      .filter(({ donnees }) => donnees?.descriptionService)
      .map(({ id, donnees: { descriptionService, ...autresDonnees } }) => {
        descriptionService.provenanceService = changeProvenance(
          descriptionService.provenanceService
        );
        return knex('homologations')
          .where({ id })
          .update({ donnees: { descriptionService, ...autresDonnees } });
      });
    return Promise.all(misesAJour);
  });

exports.up = changementDescriptionService(reduitProvenance);

exports.down = changementDescriptionService(developpeProvenance);

exports.reduitProvenance = reduitProvenance;
exports.developpeProvenance = developpeProvenance;
