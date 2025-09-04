import { DonneesChiffrees, UUID } from '../typesBasiques.js';
import { AdaptateurUUID } from '../adaptateurs/adaptateurUUID.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import { ErreurBrouillonInexistant } from '../erreurs.js';
import { DepotDonneesService } from './depotDonneesService.interface.js';

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
  finaliseBrouillonService: (
    idUtilisateur: UUID,
    idBrouillon: UUID
  ) => Promise<UUID>;
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
  depotDonneesService,
}: {
  persistance: PersistanceBrouillonService;
  adaptateurUUID: AdaptateurUUID;
  adaptateurChiffrement: AdaptateurChiffrement;
  depotDonneesService: DepotDonneesService;
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

  const finaliseBrouillonService = async (
    idUtilisateur: UUID,
    idBrouillon: UUID
  ) => {
    const tousLesBrouillons =
      await persistance.lisBrouillonsService(idUtilisateur);
    const leBrouillon = tousLesBrouillons.find((b) => b.id === idBrouillon);

    if (!leBrouillon) throw new ErreurBrouillonInexistant();

    const idService = await depotDonneesService.nouveauService(
      idUtilisateur,
      leBrouillon.donnees
    );
    return idService;
  };

  return {
    finaliseBrouillonService,
    nouveauBrouillonService,
    lisBrouillonsService,
  };
};

export { creeDepot };
