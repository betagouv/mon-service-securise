import { UUID } from '../typesBasiques.js';
import { AdaptateurUUID } from '../adaptateurs/adaptateurUUID.js';

type DepotDonneesBrouillonService = {
  nouveauBrouillonService: (
    idUtilisateur: UUID,
    nomService: string
  ) => Promise<void>;
};

type PersistanceBrouillonService = {
  ajouteBrouillonService: (
    idUtilisateur: UUID,
    brouillon: { id: UUID; nomService: string }
  ) => Promise<void>;
};

const creeDepot = ({
  persistance,
  adaptateurUUID,
}: {
  persistance: PersistanceBrouillonService;
  adaptateurUUID: AdaptateurUUID;
}): DepotDonneesBrouillonService => {
  const nouveauBrouillonService = async (
    idUtilisateur: UUID,
    nomService: string
  ) => {
    const idBrouillon = adaptateurUUID.genereUUID();

    await persistance.ajouteBrouillonService(idUtilisateur, {
      id: idBrouillon,
      nomService,
    });
  };

  return { nouveauBrouillonService };
};

export { creeDepot };
