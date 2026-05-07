import * as depotDonneesSuperviseurs from '../../src/depots/depotDonneesSuperviseurs.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import Superviseur from '../../src/modeles/superviseur.js';
import Entite from '../../src/modeles/entite.js';
import { DepotDonneesSuperviseurs } from '../../src/depots/depotDonneesSuperviseurs.interface.ts';
import { AdaptateurPersistance } from '../../src/adaptateurs/adaptateurPersistance.interface.ts';
import { AdaptateurRechercheEntreprise } from '../../src/adaptateurs/adaptateurRechercheEntreprise.interface.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { unAdaptateurChiffrementQuiWrap } from '../mocks/adaptateurChiffrementQuiWrap.ts';

describe('Le dépôt de données des superviseurs', () => {
  let depot: DepotDonneesSuperviseurs;
  let adaptateurPersistance: AdaptateurPersistance;
  let adaptateurRechercheEntite: AdaptateurRechercheEntreprise;
  const adaptateurChiffrement = unAdaptateurChiffrementQuiWrap();

  beforeEach(() => {
    adaptateurRechercheEntite = fauxAdaptateurRechercheEntreprise();
    adaptateurPersistance =
      unePersistanceMemoire().construis() as AdaptateurPersistance;
    depot = depotDonneesSuperviseurs.creeDepot({
      adaptateurPersistance,
      adaptateurRechercheEntite,
      adaptateurChiffrement,
    });
  });

  it('délègue à la persistance la lecture des superviseurs concernés par un siret en le hashant', async () => {
    let siretRecu;
    adaptateurPersistance.lisSuperviseursConcernes = async (siret) => {
      siretRecu = siret;
    };

    await depot.lisSuperviseurs('SIRET');

    expect(siretRecu).toEqual('SIRET-haché256');
  });

  it("complète les informations de l'organisation responsable et délègue à la persistance la sauvegarde des entites chiffrées", async () => {
    adaptateurRechercheEntite.rechercheOrganisations = async () => [
      {
        nom: 'MonEntite',
        departement: '75',
        siret: 'SIRET-123',
      },
    ];
    let idSuperviseurRecu;
    let donneesChiffreesRecues;
    let siretHashRecu;
    adaptateurPersistance.ajouteEntiteAuSuperviseur = async (
      idSuperviseur,
      siretHash,
      donneesChiffrees
    ) => {
      idSuperviseurRecu = idSuperviseur;
      siretHashRecu = siretHash;
      donneesChiffreesRecues = donneesChiffrees;
    };
    depot = depotDonneesSuperviseurs.creeDepot({
      adaptateurPersistance,
      adaptateurRechercheEntite,
      adaptateurChiffrement,
    });

    await depot.ajouteSiretAuSuperviseur(unUUID('1'), 'SIRET-123');

    expect(idSuperviseurRecu).toEqual(unUUID('1'));
    expect(siretHashRecu).toEqual('SIRET-123-haché256');
    expect(donneesChiffreesRecues).toEqual({
      chiffre: true,
      coffreFort: {
        nom: 'MonEntite',
        departement: '75',
        siret: 'SIRET-123',
      },
    });
  });

  it("délègue à la persistance la vérification qu'un utilisateur est superviseur", async () => {
    let idRecu;
    adaptateurPersistance.estSuperviseur = async (idUtilisateur) => {
      idRecu = idUtilisateur;
      return true;
    };

    await depot.estSuperviseur(unUUID('1'));

    expect(idRecu).toEqual(unUUID('1'));
  });

  it('délègue à la persistance la lecture des données du superviseur et retourne un superviseur déchiffré', async () => {
    let idRecu;
    adaptateurPersistance.superviseur = async (idUtilisateur) => {
      idRecu = idUtilisateur;
      return {
        idUtilisateur,
        donnees: [await adaptateurChiffrement.chiffre({ nom: 'NomEntite' })],
      };
    };

    const superviseur = await depot.superviseur(unUUID('1'));

    expect(idRecu).toEqual(unUUID('1'));
    expect(superviseur).toBeInstanceOf(Superviseur);
    expect(superviseur!.entitesSupervisees[0]).toBeInstanceOf(Entite);
    expect(superviseur!.entitesSupervisees[0].nom).toBe('NomEntite');
  });

  it("délègue à la persistance la révocation d'un superviseur", async () => {
    let idRecu;
    adaptateurPersistance.revoqueSuperviseur = async (idUtilisateur) => {
      idRecu = idUtilisateur;
    };

    await depot.revoqueSuperviseur(unUUID('1'));

    expect(idRecu).toEqual(unUUID('1'));
  });
});
