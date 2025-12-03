import { unePersistanceMemoire } from '../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import * as DepotDonneesActivitesMesure from '../../src/depots/depotDonneesActivitesMesure.js';
import ActiviteMesure, {
  TypeActiviteMesure,
} from '../../src/modeles/activiteMesure.js';
import { PersistanceActiviteMesure } from '../../src/depots/depotDonneesActivitesMesure.js';
import { unUUID } from '../constructeurs/UUID.js';
import { SimulationMigrationReferentiel } from '../../src/moteurRegles/simulationMigration/simulationMigrationReferentiel.ts';

describe('Le dépôt de données des activités de mesure', () => {
  let adaptateurPersistance: PersistanceActiviteMesure;

  const depot = () =>
    DepotDonneesActivitesMesure.creeDepot({ adaptateurPersistance });

  describe('sur ajout d’une activité', () => {
    it("ajoute l'activité", () => {
      adaptateurPersistance = unePersistanceMemoire().construis();
      let activiteAjouteeAPersistance = false;
      let idServiceActivite;
      let idActeurActivite;
      let idMesureActivite;
      let typeActivite;
      let typeMesureActivite;
      let detailsActivite;
      adaptateurPersistance.ajouteActiviteMesure = async (
        idActeur,
        idService,
        idMesure,
        type,
        typeMesure,
        details
      ) => {
        activiteAjouteeAPersistance = true;
        idServiceActivite = idService;
        idActeurActivite = idActeur;
        idMesureActivite = idMesure;
        typeActivite = type;
        typeMesureActivite = typeMesure;
        detailsActivite = details;
      };
      const activite = new ActiviteMesure({
        idService: unUUID('1'),
        idActeur: unUUID('A'),
        type: 'miseAJourStatut',
        typeMesure: 'generale',
        details: { nouveauStatut: 'fait' },
        idMesure: 'audit',
      });

      depot().ajouteActiviteMesure(activite);

      expect(activiteAjouteeAPersistance).toBe(true);
      expect(idServiceActivite).toBe(unUUID('1'));
      expect(idActeurActivite).toBe(unUUID('A'));
      expect(idActeurActivite).toBe(unUUID('A'));
      expect(typeActivite).toBe('miseAJourStatut');
      expect(detailsActivite).toEqual({ nouveauStatut: 'fait' });
      expect(idMesureActivite).toEqual('audit');
      expect(typeMesureActivite).toEqual('generale');
    });
  });

  describe('sur lecture des activités', () => {
    it('lit les activités depuis la persistance', async () => {
      adaptateurPersistance = unePersistanceMemoire()
        .avecUneActiviteMesure({
          idService: unUUID('1'),
          idActeur: '',
          idMesure: unUUID('M'),
          date: '',
          type: 'ajoutPriorite',
        })
        .construis();

      const activites = await depot().lisActivitesMesure(
        unUUID('1'),
        unUUID('M')
      );

      expect(activites.length).toBe(1);
      expect(activites[0].type).toBe('ajoutPriorite');
    });

    it('lit uniquement les activités de la mesure et du service demandés', async () => {
      adaptateurPersistance = unePersistanceMemoire()
        .avecUneActiviteMesure({
          idService: unUUID('2'),
          idMesure: 'intrusion',
        })
        .avecUneActiviteMesure({ idService: unUUID('3'), idMesure: 'audit' })
        .construis();

      const activites = await depot().lisActivitesMesure(unUUID('2'), 'audit');

      expect(activites.length).toBe(0);
    });

    it('convertit la date en objet', async () => {
      adaptateurPersistance = unePersistanceMemoire()
        .avecUneActiviteMesure({
          idService: unUUID('2'),
          idMesure: 'audit',
          date: '2024-08-30 14:17:14.051990 +00:00',
        })
        .construis();

      const activites = await depot().lisActivitesMesure(unUUID('2'), 'audit');

      expect(activites[0].date).toBeTypeOf('object');
      expect(activites[0].date.getTime()).toBe(
        new Date('2024-08-30T14:17:14.051990Z').getTime()
      );
    });

    it('tri les activités par date', async () => {
      adaptateurPersistance = unePersistanceMemoire()
        .avecUneActiviteMesure({
          idService: unUUID('1'),
          idMesure: unUUID('M'),
          date: '2024-09-02 07:30:59.983586 +00:00',
          type: 'ajoutStatut',
        })
        .avecUneActiviteMesure({
          idService: unUUID('1'),
          idMesure: unUUID('M'),
          date: '2024-09-03 07:30:59.983586 +00:00',
          type: 'ajoutPriorite',
        })
        .construis();

      const activites = await depot().lisActivitesMesure(
        unUUID('1'),
        unUUID('M')
      );

      expect(activites[0].type).toBe('ajoutPriorite');
      expect(activites[1].type).toBe('ajoutStatut');
    });
  });

  describe("sur demande de migration des activites d'un service", () => {
    it('transforme les activités pour utiliser les identifiants V2 équivalents', async () => {
      const idService = unUUID('s');
      const idMesure = unUUID('m');
      const idMesureV2 = unUUID('2');
      const donneesActiviteMesure = {
        idService,
        idActeur: unUUID('a'),
        typeMesure: 'generale' as 'generale' | 'specifique',
        type: 'ajoutPriorite' as TypeActiviteMesure,
        details: {},
      };

      const simulation = {
        idService: () => idService,
        activitesMesures: () => [
          new ActiviteMesure({
            ...donneesActiviteMesure,
            idMesure: idMesureV2,
          }),
        ],
      };

      adaptateurPersistance = unePersistanceMemoire()
        .avecUneActiviteMesure({
          ...donneesActiviteMesure,
          idMesure,
        })
        .construis();

      await depot().migreActivitesMesuresVersV2(
        simulation as unknown as SimulationMigrationReferentiel
      );

      const activitesMesureV2 = await depot().lisActivitesMesure(
        idService,
        idMesureV2
      );
      expect(activitesMesureV2[0].idMesure).toBe(idMesureV2);
    });
  });
});
