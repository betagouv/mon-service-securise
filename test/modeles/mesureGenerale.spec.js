const expect = require('expect.js');

const {
  ErreurMesureInconnue,
  ErreurStatutMesureInvalide,
  ErreurPrioriteMesureInvalide,
  ErreurEcheanceMesureInvalide,
} = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const MesureGenerale = require('../../src/modeles/mesureGenerale');
const InformationsService = require('../../src/modeles/informationsService');

describe('Une mesure de sécurité', () => {
  let referentiel;

  beforeEach(
    () =>
      (referentiel = Referentiel.creeReferentiel({
        mesures: {
          identifiantMesure: { description: 'Une description' },
          identifiantMesureIndispensable: {
            description: 'Cette mesure est indispensable',
            indispensable: true,
          },
        },
      }))
  );

  it('sait se décrire', () => {
    referentiel.enrichis({ prioritesMesures: { p3: {} } });
    const mesure = new MesureGenerale(
      {
        id: 'identifiantMesure',
        statut: MesureGenerale.STATUT_FAIT,
        modalites: "Des modalités d'application",
        priorite: 'p3',
        echeance: '01/01/2023',
        responsables: ['unIdUtilisateur', 'unAutreIdUtilisateur'],
      },
      referentiel
    );

    expect(mesure.id).to.equal('identifiantMesure');
    expect(mesure.statut).to.equal(MesureGenerale.STATUT_FAIT);
    expect(mesure.modalites).to.equal("Des modalités d'application");
    expect(mesure.priorite).to.equal('p3');
    expect(mesure.echeance).to.eql(new Date('01/01/2023'));
    expect(mesure.responsables).to.eql([
      'unIdUtilisateur',
      'unAutreIdUtilisateur',
    ]);
    expect(mesure.toJSON()).to.eql({
      id: 'identifiantMesure',
      statut: MesureGenerale.STATUT_FAIT,
      modalites: "Des modalités d'application",
      priorite: 'p3',
      echeance: new Date('01/01/2023'),
      responsables: ['unIdUtilisateur', 'unAutreIdUtilisateur'],
    });
  });

  it('vérifie que la mesure est bien répertoriée', () => {
    try {
      new MesureGenerale(
        { id: 'identifiantInconnu', statut: MesureGenerale.STATUT_FAIT },
        referentiel
      );
      expect.fail('La création de la mesure aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.a(ErreurMesureInconnue);
      expect(e.message).to.equal(
        'La mesure "identifiantInconnu" n\'est pas répertoriée'
      );
    }
  });

  it('vérifie la nature du statut', () => {
    try {
      new MesureGenerale(
        { id: 'identifiantMesure', statut: 'statutInvalide' },
        referentiel
      );
      expect.fail('La création de la mesure aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.a(ErreurStatutMesureInvalide);
      expect(e.message).to.equal('Le statut "statutInvalide" est invalide');
    }
  });

  it('vérifie la valeur de la priorité', () => {
    referentiel.enrichis({ prioritesMesures: {} });
    try {
      new MesureGenerale(
        { id: 'identifiantMesure', priorite: 'prioriteInvalide' },
        referentiel
      );
      expect().fail('La création de la mesure aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.a(ErreurPrioriteMesureInvalide);
      expect(e.message).to.equal('La priorité "prioriteInvalide" est invalide');
    }
  });

  it("vérifie la valeur de l'échéance", () => {
    try {
      new MesureGenerale(
        { id: 'identifiantMesure', echeance: 'pasUneDate' },
        referentiel
      );
      expect().fail('La création de la mesure aurait dû lever une exception');
    } catch (e) {
      expect(e).to.be.a(ErreurEcheanceMesureInvalide);
      expect(e.message).to.equal('L\'échéance "pasUneDate" est invalide');
    }
  });

  it('connaît sa description', () => {
    expect(referentiel.mesures().identifiantMesure.description).to.equal(
      'Une description'
    );

    const mesure = new MesureGenerale(
      { id: 'identifiantMesure', statut: 'fait' },
      referentiel
    );
    expect(mesure.descriptionMesure()).to.equal('Une description');
  });

  it("sait si elle est indispensable selon l'ANSSI", () => {
    expect(
      referentiel.mesures().identifiantMesureIndispensable.indispensable
    ).to.be(true);

    const mesureIndispensable = new MesureGenerale(
      { id: 'identifiantMesureIndispensable', statut: 'fait' },
      referentiel
    );
    expect(mesureIndispensable.estIndispensable()).to.be(true);
  });

  it('sait si elle est seulement recommandée', () => {
    expect(
      referentiel.mesures().identifiantMesure.indispensable
    ).to.not.be.ok();

    const mesure = new MesureGenerale(
      { id: 'identifiantMesure', statut: 'fait' },
      referentiel
    );
    expect(mesure.estRecommandee()).to.be(true);
  });

  it('peut être rendue indispensable, même si le référentiel dit le contraire', () => {
    expect(referentiel.mesureIndispensable('identifiantMesure')).to.be(false);

    const mesure = new MesureGenerale(
      { id: 'identifiantMesure', statut: 'fait', rendueIndispensable: true },
      referentiel
    );
    expect(mesure.estIndispensable()).to.be(true);
  });

  it('sait si son statut est renseigné', () => {
    const mesure = new MesureGenerale(
      { id: 'identifiantMesure', statut: 'fait' },
      referentiel
    );
    expect(mesure.statutRenseigne()).to.be(true);
  });

  it('connait sa priorité', () => {
    referentiel.enrichis({ prioritesMesures: { p2: {} } });
    const mesure = new MesureGenerale(
      { id: 'identifiantMesure', priorite: 'p2' },
      referentiel
    );

    expect(mesure.priorite).to.eql('p2');
  });

  it('ne tient pas compte du champ priorite pour déterminer le statut de saisie', () => {
    const mesure = new MesureGenerale(
      {
        id: 'identifiantMesure',
        statut: MesureGenerale.STATUT_FAIT,
        modalites: "Des modalités d'application",
      },
      referentiel
    );

    expect(mesure.statutSaisie()).to.equal(InformationsService.COMPLETES);
  });

  it("persiste sa date d'échéance au format ISO en UTC", () => {
    const janvierNonIso = '01/23/2024 10:00Z';
    const avecEcheance = new MesureGenerale(
      { id: 'identifiantMesure', echeance: janvierNonIso },
      referentiel
    );

    const persistance = avecEcheance.donneesSerialisees();

    expect(persistance.echeance).to.be('2024-01-23T10:00:00.000Z');
  });

  it('conserve une echeance vide', () => {
    const mesure = new MesureGenerale(
      {
        id: 'identifiantMesure',
        statut: MesureGenerale.STATUT_FAIT,
        echeance: '',
      },
      referentiel
    );

    expect(mesure.echeance).to.be('');
  });
});
