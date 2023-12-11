const expect = require('expect.js');
const objetGetMesures = require('../../../src/modeles/objetsApi/objetGetMesures');
const { unService } = require('../../constructeurs/constructeurService');
const Mesures = require('../../../src/modeles/mesures');
const referentiel = require('../../../src/referentiel');

describe("L'objet d'API de `GET /mesures`", () => {
  it('interroge le moteur de règles pour obtenir les mesures personnalisées', async () => {
    let descriptionRecue;

    const moteurRegles = {
      mesures: (descriptionService) => {
        descriptionRecue = descriptionService;
        return {};
      },
    };

    objetGetMesures.donnees(
      unService().avecNomService('un service').construis(),
      moteurRegles
    );

    expect(descriptionRecue.nomService).to.equal('un service');
  });

  it('associe les statuts et commentaires des mesures générales du service aux mesures personnalisées', async () => {
    const service = unService()
      .avecMesures(
        new Mesures(
          {
            mesuresGenerales: [
              { id: 'mesureA', statut: 'fait', modalites: 'un commentaire' },
            ],
          },
          referentiel.creeReferentiel({ mesures: { mesureA: {} } })
        )
      )
      .construis();

    const moteurRegles = {
      mesures: () => ({ mesureA: { description: 'Mesure A' } }),
    };

    const resultat = objetGetMesures.donnees(service, moteurRegles);

    expect(resultat.mesuresGenerales.mesureA).to.eql({
      description: 'Mesure A',
      statut: 'fait',
      modalites: 'un commentaire',
    });
  });

  it('ne pollue pas les mesures personnalisée avec des mesures inexistantes sur le service (undefined)', async () => {
    const service = unService()
      .avecMesures(new Mesures({ mesuresGenerales: [] }))
      .construis();

    const moteurRegles = {
      mesures: () => ({ mesureA: { description: 'Mesure A' } }),
    };

    const resultat = objetGetMesures.donnees(service, moteurRegles);

    expect(resultat.mesuresGenerales.mesureA).to.eql({
      description: 'Mesure A',
    });
  });

  it('fait passe plat sur les mesures spécifiques du service', async () => {
    const service = unService()
      .avecMesures(
        new Mesures({
          mesuresGenerales: [],
          mesuresSpecifiques: [{ description: 'une mesure' }],
        })
      )
      .construis();

    const moteurRegles = {
      mesures: () => ({}),
    };

    const resultat = objetGetMesures.donnees(service, moteurRegles);

    expect(resultat.mesuresSpecifiques).to.eql([{ description: 'une mesure' }]);
  });
});
