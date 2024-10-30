const { ErreurServiceManquant } = require('./erreurs');
const Evenement = require('./evenement');

class EvenementRisquesServiceModifies extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);
    const { service } = donnees;

    if (!service) throw new ErreurServiceManquant();

    const donneesPerninentesRisqueGeneral = (risqueGeneral) => {
      const { niveauGravite, id, niveauVraisemblance } = risqueGeneral;
      return { id, niveauGravite, niveauVraisemblance };
    };

    const donneesPerninentesRisqueSpecifique = (risqueSpecifique) => {
      const { niveauGravite, id, niveauVraisemblance, categories } =
        risqueSpecifique;
      return { id, niveauGravite, niveauVraisemblance, categories };
    };

    super(
      'RISQUES_SERVICE_MODIFIES',
      {
        idService: adaptateurChiffrement.hacheSha256(service.id),
        risquesGeneraux: service
          .risquesGeneraux()
          .items.map(donneesPerninentesRisqueGeneral),
        risquesSpecifiques: service
          .risquesSpecifiques()
          .items.map(donneesPerninentesRisqueSpecifique),
      },
      date
    );
  }
}

module.exports = EvenementRisquesServiceModifies;
