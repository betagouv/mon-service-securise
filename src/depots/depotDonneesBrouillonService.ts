import { DonneesChiffrees, UUID } from '../typesBasiques.js';
import { AdaptateurUUID } from '../adaptateurs/adaptateurUUID.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';

export type DepotDonneesBrouillonService = {
  nouveauBrouillonService: (
    idUtilisateur: UUID,
    nomService: string
  ) => Promise<void>;
};

type PersistanceBrouillonService = {
  ajouteBrouillonService: (
    id: UUID,
    idUtilisateur: UUID,
    donnees: DonneesChiffrees
  ) => Promise<void>;
};

const creeDepot = ({
  persistance,
  adaptateurUUID,
  adaptateurChiffrement,
}: {
  persistance: PersistanceBrouillonService;
  adaptateurUUID: AdaptateurUUID;
  adaptateurChiffrement: AdaptateurChiffrement;
}): DepotDonneesBrouillonService => {
  const nouveauBrouillonService = async (
    idUtilisateur: UUID,
    nomService: string
  ) => {
    const idBrouillon = adaptateurUUID.genereUUID();

    const donneesChiffrees = await adaptateurChiffrement.chiffre({
      nomService,
    });

    await persistance.ajouteBrouillonService(
      idBrouillon,
      idUtilisateur,
      donneesChiffrees
    );
  };

  return { nouveauBrouillonService };
};

export { creeDepot };
