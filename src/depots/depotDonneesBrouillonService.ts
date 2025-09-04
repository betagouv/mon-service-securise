import { DonneesChiffrees, UUID } from '../typesBasiques.js';
import { AdaptateurUUID } from '../adaptateurs/adaptateurUUID.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';

export type DonneesBrouillonService = {
  nomService: string;
};

export type BrouillonService = DonneesBrouillonService & {
  id: UUID;
};

export type DepotDonneesBrouillonService = {
  nouveauBrouillonService: (
    idUtilisateur: UUID,
    nomService: string
  ) => Promise<UUID>;
  lisBrouillonsService: (idUtilisateur: UUID) => Promise<BrouillonService[]>;
};

type PersistanceBrouillonService = {
  ajouteBrouillonService: (
    id: UUID,
    idUtilisateur: UUID,
    donnees: DonneesChiffrees
  ) => Promise<void>;
  lisBrouillonsService: (
    idUtilisateur: UUID
  ) => Promise<{ id: UUID; idUtilisateur: UUID; donnees: DonneesChiffrees }[]>;
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

    return idBrouillon;
  };

  const lisBrouillonsService = async (idUtilisateur: UUID) => {
    const donneesBrouillons =
      await persistance.lisBrouillonsService(idUtilisateur);

    return Promise.all(
      donneesBrouillons.map(async ({ donnees, id }) => ({
        id,
        ...(await adaptateurChiffrement.dechiffre<DonneesBrouillonService>(
          donnees
        )),
      }))
    );
  };

  return { nouveauBrouillonService, lisBrouillonsService };
};

export { creeDepot };
