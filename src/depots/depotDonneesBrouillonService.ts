import { DonneesChiffrees, UUID } from '../typesBasiques.js';
import { AdaptateurUUID } from '../adaptateurs/adaptateurUUID.js';
import { AdaptateurChiffrement } from '../adaptateurs/adaptateurChiffrement.interface.js';
import { ErreurBrouillonInexistant } from '../erreurs.js';
import { DepotDonneesService } from './depotDonneesService.interface.js';
import {
  BrouillonService,
  DonneesBrouillonService,
} from '../modeles/brouillonService.js';

export type DepotDonneesBrouillonService = {
  nouveauBrouillonService: (
    idUtilisateur: UUID,
    nomService: string
  ) => Promise<UUID>;
  lisBrouillonsService: (idUtilisateur: UUID) => Promise<BrouillonService[]>;
  lisBrouillonService: (
    idUtilisateur: UUID,
    idBrouillon: UUID
  ) => Promise<BrouillonService>;
  finaliseBrouillonService: (
    idUtilisateur: UUID,
    idBrouillon: UUID
  ) => Promise<UUID>;
  sauvegardeBrouillonService: (
    idUtilisateur: UUID,
    brouillon: BrouillonService
  ) => Promise<void>;
  supprimeBrouillonService: (idBrouillon: UUID) => Promise<void>;
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
  sauvegardeBrouillonService: (
    idBrouillon: UUID,
    idUtilisateur: UUID,
    donneesChiffrees: DonneesChiffrees
  ) => Promise<void>;
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

  const lisBrouillonService = async (
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
    return new BrouillonService(idBrouillon, donneesEnClair);
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
      b.enDonneesCreationServiceV2()
    );

    await persistance.supprimeBrouillonService(idBrouillon);

    return idService;
  };

  const sauvegardeBrouillonService = async (
    idUtilisateur: UUID,
    brouillon: BrouillonService
  ) => {
    const donneesChiffrees = await adaptateurChiffrement.chiffre(
      brouillon.donneesAPersister()
    );

    await persistance.sauvegardeBrouillonService(
      brouillon.id,
      idUtilisateur,
      donneesChiffrees
    );
  };

  const supprimeBrouillonService = async (idBrouillon: UUID) =>
    persistance.supprimeBrouillonService(idBrouillon);

  return {
    finaliseBrouillonService,
    nouveauBrouillonService,
    lisBrouillonService,
    lisBrouillonsService,
    sauvegardeBrouillonService,
    supprimeBrouillonService,
  };
};

export { creeDepot };
