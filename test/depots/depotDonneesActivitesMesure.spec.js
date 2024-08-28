const expect = require('expect.js');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const DepotDonneesActivitesMesure = require('../../src/depots/depotDonneesActivitesMesure');
const ActiviteMesure = require('../../src/modeles/activiteMesure');
const { unService } = require('../constructeurs/constructeurService');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const MesureGenerale = require('../../src/modeles/mesureGenerale');
const Referentiel = require('../../src/referentiel');

describe('Le dépôt de données des activités de mesure', () => {
  describe('sur ajout d’une activité', () => {
    it("ajoute l'activité", () => {
      const adaptateurPersistance = unePersistanceMemoire().construis();
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
      const depot = DepotDonneesActivitesMesure.creeDepot({
        adaptateurPersistance,
      });
      const referentiel = Referentiel.creeReferentiel({
        mesures: { audit: { categorie: 'gouvernance' } },
      });
      const service = unService().avecId(987).construis();
      const acteur = unUtilisateur().avecId(654).construis();
      const activite = new ActiviteMesure({
        service,
        acteur,
        type: 'statutMisAJour',
        details: { nouveauStatut: 'fait' },
        mesure: new MesureGenerale({ id: 'audit' }, referentiel),
      });

      depot.ajouteActiviteMesure(activite);

      expect(activiteAjouteeAPersistance).to.be(true);
      expect(idServiceActivite).to.be(987);
      expect(idActeurActivite).to.be(654);
      expect(typeActivite).to.be('statutMisAJour');
      expect(detailsActivite).to.eql({ nouveauStatut: 'fait' });
      expect(idMesureActivite).to.eql('audit');
    });
  });
});
