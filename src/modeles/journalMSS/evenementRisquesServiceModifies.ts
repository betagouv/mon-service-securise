import { ErreurServiceManquant } from './erreurs.js';
import Evenement from './evenement.js';
import Service from '../service.js';
import RisqueGeneral from '../risqueGeneral.js';
import RisqueSpecifique from '../risqueSpecifique.js';

class EvenementRisquesServiceModifies extends Evenement {
  constructor({ service }: { service: Service }, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    if (!service) throw new ErreurServiceManquant();

    const donneesPerninentesRisqueGeneral = (risqueGeneral: RisqueGeneral) => {
      const { niveauGravite, id, niveauVraisemblance } = risqueGeneral;
      return { id, niveauGravite, niveauVraisemblance };
    };

    const donneesPerninentesRisqueSpecifique = (
      risqueSpecifique: RisqueSpecifique
    ) => {
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

export default EvenementRisquesServiceModifies;
