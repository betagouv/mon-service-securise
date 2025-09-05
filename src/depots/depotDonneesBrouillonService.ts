import { DonneesChiffrees, UUID } from '../typesBasiques.js';
import { AdaptateurUUID } from '../adaptateurs/adaptateurUUID.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import { ErreurBrouillonInexistant } from '../erreurs.js';
import { DepotDonneesService } from './depotDonneesService.interface.js';
import { VersionService } from '../modeles/versionService.js';

export type DonneesBrouillonService = {
  nomService: string;
};

class BrouillonService {
  readonly nomService: string;

  constructor(
    readonly id: UUID,
    donnees: DonneesBrouillonService
  ) {
    this.nomService = donnees.nomService;
  }

  enDonneesDescriptionServiceV2() {
    return { nomService: this.nomService, versionService: VersionService.v2 };
  }
}

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
  supprimeBrouillonService: (idBrouillon: UUID) => Promise<void>;
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
      donneesBrouillons.map(async ({ id, donnees }) => {
        const donneesEnClair =
          await adaptateurChiffrement.dechiffre<DonneesBrouillonService>(
            donnees
          );
        return new BrouillonService(id, donneesEnClair);
      })
    );
  };

  const finaliseBrouillonService = async (
    idUtilisateur: UUID,
    idBrouillon: UUID
  ) => {
    const tousLesBrouillons =
      await persistance.lisBrouillonsService(idUtilisateur);

    const persiste = tousLesBrouillons.find((b) => b.id === idBrouillon);
    if (!persiste) throw new ErreurBrouillonInexistant();

    const donneesEnClair =
      await adaptateurChiffrement.dechiffre<DonneesBrouillonService>(
        persiste.donnees
      );
    const b = new BrouillonService(idBrouillon, donneesEnClair);

    const idService = await depotDonneesService.nouveauService(
      idUtilisateur,
      b.enDonneesDescriptionServiceV2()
    );

    await persistance.supprimeBrouillonService(idBrouillon);

    return idService;
  };

  return {
    finaliseBrouillonService,
    nouveauBrouillonService,
    lisBrouillonsService,
  };
};

export { creeDepot };
