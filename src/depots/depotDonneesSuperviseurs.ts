import { AdaptateurPersistance } from '../adaptateurs/adaptateurPersistance.interface.js';
import { UUID } from '../typesBasiques.js';

const creeDepot = ({
  adaptateurPersistance,
}: {
  adaptateurPersistance: AdaptateurPersistance;
}) => {
  const revoqueSuperviseur = async (idUtilisateur: UUID) =>
    adaptateurPersistance.revoqueSuperviseur(idUtilisateur);

  return {
    revoqueSuperviseur,
  };
};

export { creeDepot };
