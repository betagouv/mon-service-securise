const expect = require('expect.js');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const DepotDonneesActivitesMesure = require('../../src/depots/depotDonneesActivitesMesure');
const ActiviteMesure = require('../../src/modeles/activiteMesure');

describe('Le dépôt de données des activités de mesure', () => {
  let adaptateurPersistance;

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
      let detailsActivite;
      adaptateurPersistance.ajouteActiviteMesure = (
        idActeur,
        idService,
        idMesure,
        type,
        details
      ) => {
        activiteAjouteeAPersistance = true;
        idServiceActivite = idService;
        idActeurActivite = idActeur;
        idMesureActivite = idMesure;
        typeActivite = type;
        detailsActivite = details;
      };
      const activite = new ActiviteMesure({
        idService: 987,
        idActeur: 654,
        type: 'statutMisAJour',
        details: { nouveauStatut: 'fait' },
        idMesure: 'audit',
      });

      depot().ajouteActiviteMesure(activite);

      expect(activiteAjouteeAPersistance).to.be(true);
      expect(idServiceActivite).to.be(987);
      expect(idActeurActivite).to.be(654);
      expect(typeActivite).to.be('statutMisAJour');
      expect(detailsActivite).to.eql({ nouveauStatut: 'fait' });
      expect(idMesureActivite).to.eql('audit');
    });
  });

  describe('sur lecture des activités', () => {
    it('lit les activités depuis la persistance', async () => {
      adaptateurPersistance = unePersistanceMemoire()
        .avecUneActiviteMesure({
          idService: 'S1',
          idActeur: '',
          idMesure: 'm1',
          date: '',
          type: 'ajoutPriorite',
        })
        .construis();

      const activites = await depot().lisActivitesMesure('S1', 'm1');

      expect(activites.length).to.be(1);
      expect(activites[0].type).to.be('ajoutPriorite');
    });

    it('lit uniquement les activités de la mesure et du service demandés', async () => {
      adaptateurPersistance = unePersistanceMemoire()
        .avecUneActiviteMesure({ idService: 'SA', idMesure: 'intrusion' })
        .avecUneActiviteMesure({ idService: 'SB', idMesure: 'audit' })
        .construis();

      const activites = await depot().lisActivitesMesure('SA', 'audit');

      expect(activites.length).to.be(0);
    });

    it('convertit la date en objet', async () => {
      adaptateurPersistance = unePersistanceMemoire()
        .avecUneActiviteMesure({
          idService: 'SA',
          idMesure: 'audit',
          date: '2024-08-30 14:17:14.051990 +00:00',
        })
        .construis();

      const activites = await depot().lisActivitesMesure('SA', 'audit');

      expect(activites[0].date).to.be.an('object');
      expect(activites[0].date.getTime()).to.be(
        new Date('2024-08-30T14:17:14.051990Z').getTime()
      );
    });

    it('tri les activités par date', async () => {
      adaptateurPersistance = unePersistanceMemoire()
        .avecUneActiviteMesure({
          idService: 'S1',
          idMesure: 'm1',
          date: '2024-09-02 07:30:59.983586 +00:00',
          type: 'ajoutStatut',
        })
        .avecUneActiviteMesure({
          idService: 'S1',
          idMesure: 'm1',
          date: '2024-09-03 07:30:59.983586 +00:00',
          type: 'ajoutPriorite',
        })
        .construis();

      const activites = await depot().lisActivitesMesure('S1', 'm1');

      expect(activites[0].type).to.be('ajoutPriorite');
      expect(activites[1].type).to.be('ajoutStatut');
    });
  });
});
