const expect = require('expect.js');
const { unService } = require('../../constructeurs/constructeurService');
const EvenementRisquesServiceModifies = require('../../../src/modeles/journalMSS/evenementRisquesServiceModifies');
const {
  ErreurServiceManquant,
} = require('../../../src/modeles/journalMSS/erreurs');
const Risques = require('../../../src/modeles/risques');
const Referentiel = require('../../../src/referentiel');

describe('Un événement de risques modifiés', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };
  let referentiel;

  beforeEach(() => {
    referentiel = Referentiel.creeReferentiel({
      risques: { R1: {} },
      niveauxGravite: { moyen: {}, minime: {} },
      vraisemblancesRisques: { probable: {}, improbable: {} },
    });
  });

  it("chiffre l'identifiant du service qui lui est donné", () => {
    const evenement = new EvenementRisquesServiceModifies(
      { service: unService().avecId('abc').construis() },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    const json = evenement.toJSON();

    expect(json.donnees.idService).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const risquesGeneraux = [
      { id: 'R1', niveauGravite: 'moyen', niveauVraisemblance: 'probable' },
    ];
    const risquesSpecifiques = [
      {
        id: 'RS1',
        niveauGravite: 'minime',
        niveauVraisemblance: 'improbable',
        categories: ['disponibilité'],
      },
    ];
    const service = unService(referentiel)
      .avecId('ABC')
      .avecRisques(
        new Risques({ risquesGeneraux, risquesSpecifiques }, referentiel)
      )
      .construis();

    const evenement = new EvenementRisquesServiceModifies(
      { service },
      { date: '30/10/2024', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'RISQUES_SERVICE_MODIFIES',
      donnees: {
        idService: 'ABC',
        risquesGeneraux: [
          { id: 'R1', niveauGravite: 'moyen', niveauVraisemblance: 'probable' },
        ],
        risquesSpecifiques: [
          {
            id: 'RS1',
            niveauGravite: 'minime',
            niveauVraisemblance: 'improbable',
            categories: ['disponibilité'],
          },
        ],
      },
      date: '30/10/2024',
    });
  });

  it('exige que le service soit renseigné', () => {
    expect(
      () =>
        new EvenementRisquesServiceModifies({
          service: undefined,
        })
    ).to.throwException((e) => {
      expect(e).to.be.an(ErreurServiceManquant);
    });
  });

  it("n'envoie que les données pertinentes du risque général", () => {
    const risquesGeneraux = [
      { id: 'R1', commentaire: 'des données hyper sensibles' },
    ];
    const service = unService(referentiel)
      .avecRisques(new Risques({ risquesGeneraux }, referentiel))
      .construis();

    const evenement = new EvenementRisquesServiceModifies({ service });

    expect(evenement.toJSON().donnees.risquesGeneraux).to.eql([
      {
        id: 'R1',
        niveauGravite: undefined,
        niveauVraisemblance: undefined,
      },
    ]);
  });

  it("n'envoie que les données pertinentes du risque spécifique", () => {
    const risquesSpecifiques = [
      {
        id: 'RS1',
        intitule: 'mon titre',
        description: 'des données sensibles',
        commentaire: 'des données hyper sensibles',
      },
    ];
    const service = unService(referentiel)
      .avecRisques(new Risques({ risquesSpecifiques }, referentiel))
      .construis();

    const evenement = new EvenementRisquesServiceModifies({ service });

    expect(evenement.toJSON().donnees.risquesSpecifiques).to.eql([
      {
        id: 'RS1',
        niveauGravite: undefined,
        niveauVraisemblance: undefined,
        categories: [],
      },
    ]);
  });
});
