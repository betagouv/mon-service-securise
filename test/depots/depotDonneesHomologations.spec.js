const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');
const DepotDonneesHomologations = require('../../src/depots/depotDonneesHomologations');
const Homologation = require('../../src/modeles/homologation');

describe('Le dépôt de données des homologations', () => {
  it('peut retrouver une homologation à partir de son identifiant', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '789', descriptionService: { nomService: 'nom' } },
      ],
    });
    const referentiel = Referentiel.creeReferentielVide();
    const depot = DepotDonneesHomologations.creeDepot({ adaptateurPersistance, referentiel });

    depot.homologation('789')
      .then((homologation) => {
        expect(homologation).to.be.a(Homologation);
        expect(homologation.id).to.equal('789');
        expect(homologation.referentiel).to.equal(referentiel);
        done();
      })
      .catch(done);
  });
});
