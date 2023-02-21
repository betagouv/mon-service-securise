const expect = require('expect.js');

const Dossier = require('../../src/modeles/dossier');
const Referentiel = require('../../src/referentiel');

describe("Un dossier d'homologation", () => {
  const referentiel = Referentiel.creeReferentielVide();

  beforeEach(() => referentiel.recharge({ echeancesRenouvellement: { unAn: {} } }));

  it('sait se convertir en JSON', () => {
    const dossier = new Dossier({ id: '123',
      decision: {
        dateHomologation: '2022-12-01',
        dureeValidite: 'unAn',
      },
      autorite: {
        nom: 'Jean Courage',
        fonction: 'Responsable',
      },
      finalise: true },
    referentiel);

    const jsonDossier = { id: '123',
      decision: {
        dateHomologation: '2022-12-01',
        dureeValidite: 'unAn',
      },
      autorite: {
        nom: 'Jean Courage',
        fonction: 'Responsable',
      },
      finalise: true };
    expect(dossier.toJSON()).to.eql(jsonDossier);
  });

  it('est non-finalisé par défaut', () => {
    const dossier = new Dossier({ id: '123' }, referentiel);
    expect(dossier.finalise).to.be(false);
  });

  describe('sur vérification que ce dossier est complet', () => {
    it("retourne le caractère de l'étape date", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: {} } });
      const dossierComplet = new Dossier({ decision: { dateHomologation: '2022-11-27', dureeValidite: 'unAn' } }, referentiel);
      expect(dossierComplet.estComplet()).to.be(true);
    });
  });

  describe('sur demande du caractère actif du dossier', () => {
    it("retourne `false` si le dossier n'est pas complet", () => {
      const adaptateurHorloge = { maintenant: () => new Date(2023, 1, 1) };
      const dossier = new Dossier({ id: '2', finalise: true, decision: { dateHomologation: '2023-01-01' } }, referentiel, adaptateurHorloge);
      expect(dossier.estActif()).to.equal(false);
    });

    it("retourne `false` si la date du jour n'est pas comprise entre la date d'homologation et la prochaine date d'homologation", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } } });
      const adaptateurHorloge = { maintenant: () => new Date(2025, 1, 1) };
      const dossier = new Dossier({ id: '2', finalise: true, decision: { dateHomologation: '2023-01-01', dureeValidite: 'unAn' } }, referentiel, adaptateurHorloge);
      expect(dossier.estActif()).to.equal(false);
    });

    it("retourne `true` si la date du jour est la date d'homologation", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } } });
      const adaptateurHorloge = { maintenant: () => new Date(2023, 1, 1) };
      const dossier = new Dossier({ id: '2', finalise: true, decision: { dateHomologation: '2023-01-01', dureeValidite: 'unAn' } }, referentiel, adaptateurHorloge);
      expect(dossier.estActif()).to.equal(true);
    });

    it("retourne `true` si la date du jour est comprise entre la date d'homologation et la prochaine date d'homologation", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } } });
      const adaptateurHorloge = { maintenant: () => new Date(2023, 2, 1) };
      const dossier = new Dossier({ id: '2', finalise: true, decision: { dateHomologation: '2023-01-01', dureeValidite: 'unAn' } }, referentiel, adaptateurHorloge);
      expect(dossier.estActif()).to.equal(true);
    });

    it("retourne `true` si la date du jour est la date dernière date d'homologation", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } } });
      const adaptateurHorloge = { maintenant: () => new Date(2024, 1, 1) };
      const dossier = new Dossier({ id: '2', finalise: true, decision: { dateHomologation: '2023-01-01', dureeValidite: 'unAn' } }, referentiel, adaptateurHorloge);
      expect(dossier.estActif()).to.equal(false);
    });
  });
});
