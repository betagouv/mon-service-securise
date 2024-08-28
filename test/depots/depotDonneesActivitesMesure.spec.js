const expect = require('expect.js');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const DepotDonneesActivitesMesure = require('../../src/depots/depotDonneesActivitesMesure');
const ActiviteMesure = require('../../src/modeles/activiteMesure');
const { unService } = require('../constructeurs/constructeurService');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');

describe('Le dépôt de données des activités de mesure', () => {
  describe('sur ajout d’une activité', () => {
    it("ajoute l'activité", () => {
      const adaptateurPersistance = unePersistanceMemoire().construis();
      let activiteAjouteeAPersistance = false;
      let idServiceActivite;
      let idActeurActivite;
      let typeActivite;
      let detailsActivite;
      adaptateurPersistance.ajouteActiviteMesure = (
        idActeur,
        idService,
        // eslint-disable-next-line no-unused-vars
        idMesure,
        type,
        details
      ) => {
        activiteAjouteeAPersistance = true;
        idServiceActivite = idService;
        idActeurActivite = idActeur;
        typeActivite = type;
        detailsActivite = details;
      };
      const depot = DepotDonneesActivitesMesure.creeDepot({
        adaptateurPersistance,
      });
      const service = unService().avecId(987).construis();
      const acteur = unUtilisateur().avecId(654).construis();
      const activite = new ActiviteMesure({
        service,
        acteur,
        type: 'statutMisAJour',
        details: { nouveauStatut: 'fait' },
      });

      depot.ajouteActiviteMesure(activite);

      expect(activiteAjouteeAPersistance).to.be(true);
      expect(idServiceActivite).to.be(987);
      expect(idActeurActivite).to.be(654);
      expect(typeActivite).to.be('statutMisAJour');
      expect(detailsActivite).to.eql({ nouveauStatut: 'fait' });
    });
  });
});
