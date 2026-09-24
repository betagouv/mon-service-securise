import Evenement, { Hacheur } from './evenement.js';
import Service from '../service.js';
import RisqueGeneral from '../risqueGeneral.js';
import RisqueSpecifique from '../risqueSpecifique.js';

type Donnees = { service: Service };

const donneesPertinentesRisqueGeneral = ({
  id,
  niveauGravite,
  niveauVraisemblance,
}: RisqueGeneral) => ({ id, niveauGravite, niveauVraisemblance });

const donneesPertinentesRisqueSpecifique = ({
  id,
  niveauGravite,
  niveauVraisemblance,
  categories,
}: RisqueSpecifique) => ({
  id,
  niveauGravite,
  niveauVraisemblance,
  categories,
});

class EvenementRisquesServiceModifies extends Evenement<Donnees> {
  protected override typeEvenement() {
    return 'RISQUES_SERVICE_MODIFIES';
  }

  protected override proprietesRequises(): (keyof Donnees)[] {
    return ['service'];
  }

  protected override donneesAConsigner({ service }: Donnees, hache: Hacheur) {
    return {
      idService: hache(service.id),
      risquesGeneraux: service
        .risquesGeneraux()
        .items.map(donneesPertinentesRisqueGeneral),
      risquesSpecifiques: service
        .risquesSpecifiques()
        .items.map(donneesPertinentesRisqueSpecifique),
    };
  }
}

export default EvenementRisquesServiceModifies;
