import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { unUUID } from '../../constructeurs/UUID.ts';
import { TousReferentiels } from '../../../src/referentiel.interface.ts';
import { DepotDonnees } from '../../../src/depotDonnees.interface.ts';
import { creeDepot } from '../../../src/depotDonnees.ts';
import * as adaptateurEnvironnement from '../../../src/adaptateurs/adaptateurEnvironnement.js';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';
import fauxAdaptateurRechercheEntreprise from '../../mocks/adaptateurRechercheEntreprise.js';
import { fabriqueBusPourLesTests } from '../../bus/aides/busPourLesTests.js';
import BusEvenements from '../../../src/bus/busEvenements.js';
import * as Referentiel from '../../../src/referentiel.ts';
import { fabriqueAdaptateurHorloge } from '../../../src/adaptateurs/adaptateurHorloge.ts';
import { SourceTachesProfil } from '../../../src/notifications/sources/sourceTachesProfil.ts';

describe('Les notifications de tâche profil', () => {
  let referentiel: TousReferentiels;
  let depotDonnees: DepotDonnees;

  const unReferentiel = (donnees: Record<string, unknown>) =>
    // @ts-expect-error On force des valeurs de test
    Referentiel.creeReferentiel(donnees);

  const laSource = () =>
    new SourceTachesProfil(
      referentiel,
      depotDonnees,
      fabriqueAdaptateurHorloge()
    );

  beforeEach(() => {
    referentiel = unReferentiel({
      tachesCompletudeProfil: [],
    });
    depotDonnees = creeDepot({
      adaptateurEnvironnement,
      referentielV2: creeReferentielV2(),
      serviceCgu: { versionActuelle: () => '1' },
      adaptateurRechercheEntite: fauxAdaptateurRechercheEntreprise(),
      busEvenements: fabriqueBusPourLesTests() as unknown as BusEvenements,
    });

    depotDonnees.utilisateur = async () =>
      unUtilisateur()
        .quiSAppelle('Jean Dujardin')
        .quiSEstInscritLe('2020-01-01')
        .construis();
  });

  it("utilise le dépôt de données pour récupérer l'utilisateur", async () => {
    let idRecu;
    depotDonnees.utilisateur = async (idUtilisateur) => {
      idRecu = idUtilisateur;
      return unUtilisateur().avecId(idUtilisateur).construis();
    };

    await laSource().notificationsPour(unUUID('U1'));

    expect(idRecu).toBe(unUUID('U1'));
  });

  it("reste robuste si l'utilisateur est introuvable", async () => {
    depotDonnees.utilisateur = async () => undefined;

    const taches = await laSource().notificationsPour(unUUID('U1'));

    expect(taches).toBeInstanceOf(Array);
  });

  it("renvoie un tableau vide si le profil de l'utilisateur est complet", async () => {
    depotDonnees.utilisateur = async () =>
      unUtilisateur()
        .quiSAppelle('Jean Valjean')
        .quiTravaillePourUneEntiteAvecSiret('12345')
        .construis();

    const taches = await laSource().notificationsPour(unUUID('U1'));

    expect(taches.length).toBe(0);
  });

  describe("lorsque le SIRET de l'utilisateur est manquant", () => {
    beforeEach(() => {
      depotDonnees.utilisateur = async () =>
        unUtilisateur()
          .quiSAppelle('Jeanine Valjean')
          .quiTravaillePourUneEntiteAvecSiret(null)
          .construis();
    });

    it('renvoie la notification correspondant au champ non renseigné du profil', async () => {
      referentiel = unReferentiel({
        tachesCompletudeProfil: [
          {
            id: 'siret',
            entete: 'Complétez votre profil',
            titre: 'Des Explications',
          },
        ],
      });

      const taches = await laSource().notificationsPour(unUUID('U1'));

      expect(taches.length).toBe(1);
      expect(taches[0].titre).toBe('Complétez votre profil');
      expect(taches[0].sousTitre).toBe('Des Explications');
      expect(taches[0].statutLecture).toBe('nonLue');
      expect(taches[0].canalDiffusion).toBe('centreNotifications');
    });

    it("reste robuste si les données d'une tâche sont absentes du référentiel", async () => {
      const taches = await laSource().notificationsPour(unUUID('U1'));

      expect(taches.length).toBe(0);
    });

    it("indique qu'une tâche de profil n'est pas supprimable", async () => {
      referentiel = unReferentiel({
        tachesCompletudeProfil: [
          {
            id: 'siret',
            entete: 'Complétez votre profil',
            titre: 'Des Explications',
          },
        ],
      });

      const taches = await laSource().notificationsPour(unUUID('U1'));

      expect(taches[0].supprimable).toBe(false);
    });
  });

  describe("lorsque l'utilisateur vient d'être invité, donc son profil a plein de champs non renseignés", () => {
    it('renvoie uniquement la notification « globale » de profil à mettre à jour', async () => {
      depotDonnees.utilisateur = async () =>
        unUtilisateur().quiNAPasRempliSonProfil().construis();
      referentiel = unReferentiel({
        tachesCompletudeProfil: [
          { id: 'profil', titre: 'Titre tâche' },
          { id: 'siret', titre: 'Titre tâche' },
        ],
      });

      const taches = await laSource().notificationsPour(unUUID('U1'));

      expect(taches.length).toBe(1);
      expect(taches[0].id).toBe('profil');
      expect(taches[0].canalDiffusion).toBe('centreNotifications');
    });
  });
});
