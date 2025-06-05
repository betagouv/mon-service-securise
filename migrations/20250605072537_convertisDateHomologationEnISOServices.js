const { chaineDateFrEnChaineDateISO } = require('../src/utilitaires/date');
const {
  fabriqueAdaptateurChiffrement,
} = require('../src/adaptateurs/fabriqueAdaptateurChiffrement');

const { chiffre, dechiffre } = fabriqueAdaptateurChiffrement();

const estDateEnFrancais = (chaineDate) =>
  /[0-9]{2}\/[0-9]{2}\/[0-9]{4}/.test(chaineDate);

exports.up = async (knex) => {
  await knex.transaction(async (trx) => {
    const services = await trx('services');

    const maj = services.map(async ({ id, donnees }) => {
      const donneesServiceDechiffrees = await dechiffre(donnees);

      if (!donneesServiceDechiffrees.dossiers) return null;

      const nouveauxDossiers = donneesServiceDechiffrees.dossiers.map(
        (dossier) => {
          const nouveauDossier = { ...dossier };
          if (
            dossier.decision?.dateHomologation &&
            estDateEnFrancais(dossier.decision.dateHomologation)
          )
            nouveauDossier.decision = {
              ...nouveauDossier.decision,
              dateHomologation: chaineDateFrEnChaineDateISO(
                nouveauDossier.decision.dateHomologation
              ),
            };

          if (
            dossier.dateTelechargement?.date &&
            estDateEnFrancais(dossier.dateTelechargement.date)
          )
            nouveauDossier.dateTelechargement = {
              ...nouveauDossier.dateTelechargement,
              date: chaineDateFrEnChaineDateISO(
                nouveauDossier.dateTelechargement.date
              ),
            };

          return nouveauDossier;
        }
      );

      const donneesServiceChiffrees = await chiffre({
        ...donneesServiceDechiffrees,
        dossiers: nouveauxDossiers,
      });

      return trx('services')
        .where({ id })
        .update({ donnees: donneesServiceChiffrees });
    });

    await Promise.all(maj.filter((m) => !!m));
  });
};

// On ne sait pas dire quels dossiers avaient une date en "Français" erronée
exports.down = async () => {};
