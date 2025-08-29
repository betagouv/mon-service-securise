import expect from 'expect.js';
import * as depotDonneesSuperviseurs from '../../src/depots/depotDonneesSuperviseurs.js';
import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import fauxAdaptateurRechercheEntreprise from '../mocks/adaptateurRechercheEntreprise.js';
import Superviseur from '../../src/modeles/superviseur.js';
import Entite from '../../src/modeles/entite.js';

describe('Le dépôt de données des superviseurs', () => {
  let depot;
  let adaptateurPersistance;
  let adaptateurRechercheEntite;

  beforeEach(() => {
    adaptateurRechercheEntite = fauxAdaptateurRechercheEntreprise();
    adaptateurPersistance = unePersistanceMemoire().construis();
    depot = depotDonneesSuperviseurs.creeDepot({ adaptateurPersistance });
  });

  it('délègue à la persistance la lecture des superviseurs concernés par un siret', async () => {
    let siretRecu;
    adaptateurPersistance.lisSuperviseursConcernes = async (siret) => {
      siretRecu = siret;
    };

    await depot.lisSuperviseurs('SIRET');

    expect(siretRecu).to.eql('SIRET');
  });

  it("complète les informations de l'organisation responsable et délègue à la persistance l'ajout d'établissements supervisés", async () => {
    adaptateurRechercheEntite.rechercheOrganisations = async () => [
      {
        nom: 'MonEntite',
        departement: '75',
        siret: 'SIRET-123',
      },
    ];
    let idSuperviseurRecu;
    let entiteRecue;
    adaptateurPersistance.ajouteEntiteAuSuperviseur = async (
      idSuperviseur,
      entite
    ) => {
      idSuperviseurRecu = idSuperviseur;
      entiteRecue = entite;
    };
    depot = depotDonneesSuperviseurs.creeDepot({
      adaptateurPersistance,
      adaptateurRechercheEntite,
    });

    await depot.ajouteSiretAuSuperviseur('US1', 'SIRET-123');

    expect(idSuperviseurRecu).to.eql('US1');
    expect(entiteRecue.nom).to.eql('MonEntite');
    expect(entiteRecue.departement).to.eql('75');
    expect(entiteRecue.siret).to.eql('SIRET-123');
  });

  it("délègue à la persistance la vérification qu'un utilisateur est superviseur", async () => {
    let idRecu;
    adaptateurPersistance.estSuperviseur = async (idUtilisateur) => {
      idRecu = idUtilisateur;
    };

    await depot.estSuperviseur('U1');

    expect(idRecu).to.eql('U1');
  });

  it('délègue à la persistance la lecture des données du superviseur et retourne un superviseur', async () => {
    let idRecu;
    adaptateurPersistance.superviseur = async (idUtilisateur) => {
      idRecu = idUtilisateur;
      return { idUtilisateur, entitesSupervisees: [{ nom: 'NomEntite' }] };
    };

    const superviseur = await depot.superviseur('U1');

    expect(idRecu).to.eql('U1');
    expect(superviseur).to.be.a(Superviseur);
    expect(superviseur.entitesSupervisees[0]).to.be.an(Entite);
    expect(superviseur.entitesSupervisees[0].nom).to.be('NomEntite');
  });

  it("délègue à la persistance la révocation d'un superviseur", async () => {
    let idRecu;
    adaptateurPersistance.revoqueSuperviseur = async (idUtilisateur) => {
      idRecu = idUtilisateur;
    };

    await depot.revoqueSuperviseur('U1');

    expect(idRecu).to.eql('U1');
  });
});
