const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');
const DepotDonneesServices = require('../../src/depots/depotDonneesServices');
const Service = require('../../src/modeles/service');

describe('Le dépôt de données des services', () => {
  it('peut retrouver un service à partir de son identifiant', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      services: [
        { id: '789', descriptionService: { nomService: 'nom' } },
      ],
    });
    const referentiel = Referentiel.creeReferentielVide();
    const depot = DepotDonneesServices.creeDepot({ adaptateurPersistance, referentiel });

    depot.service('789')
      .then((service) => {
        expect(service).to.be.a(Service);
        expect(service.id).to.equal('789');
        expect(service.referentiel).to.equal(referentiel);
        done();
      })
      .catch(done);
  });
});
