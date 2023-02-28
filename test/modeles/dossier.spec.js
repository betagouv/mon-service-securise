const expect = require('expect.js');

const { unDossier } = require('../constructeurs/constructeurDossier');
const Dossier = require('../../src/modeles/dossier');
const Referentiel = require('../../src/referentiel');
const { ErreurDossierDejaFinalise } = require('../../src/erreurs');

describe("Un dossier d'homologation", () => {
  const referentiel = Referentiel.creeReferentielVide();

  beforeEach(() => referentiel.recharge({
    echeancesRenouvellement: { unAn: {} },
    documentsHomologation: { decision: {} },
  }));

  it('sait se convertir en JSON', () => {
    const dossier = new Dossier({
      id: '123',
      decision: { dateHomologation: '2022-12-01', dureeValidite: 'unAn' },
      autorite: { nom: 'Jean Courage', fonction: 'Responsable' },
      datesTelechargements: { decision: '2023-01-01T00:00:00.000Z' },
      finalise: true,
    },
    referentiel);

    expect(dossier.toJSON()).to.eql({
      id: '123',
      decision: { dateHomologation: '2022-12-01', dureeValidite: 'unAn' },
      autorite: { nom: 'Jean Courage', fonction: 'Responsable' },
      datesTelechargements: { decision: '2023-01-01T00:00:00.000Z' },
      finalise: true,
    });
  });

  it('est non-finalisé par défaut', () => {
    const dossier = new Dossier({ id: '123' }, referentiel);
    expect(dossier.finalise).to.be(false);
  });

  describe("sur demande d'enregistrement d'une date de téléchargement", () => {
    it('jette une erreur si le dossier est déjà finalisé', () => {
      const dossierFinalise = new Dossier({ finalise: true });

      expect(() => dossierFinalise.enregistreDateTelechargement('decision', new Date()))
        .to.throwError((e) => expect(e).to.be.an(ErreurDossierDejaFinalise));
    });

    it('met à jour la date de téléchargement du document concerné avec la date fournie', () => {
      const dossier = new Dossier();
      const maintenant = new Date();

      dossier.enregistreDateTelechargement('decision', maintenant);

      expect(dossier.datesTelechargements.decision).to.equal(maintenant);
    });
  });

  describe('sur vérification que ce dossier est complet', () => {
    it('demande à chaque étape si elle est complète', () => {
      const etapesInterrogees = [];
      const bouchonneEtape = (etape) => ({
        estComplete: () => {
          etapesInterrogees.push(etape);
          return true;
        },
      });

      const dossier = new Dossier();
      dossier.decision = { ...bouchonneEtape('decision') };
      dossier.datesTelechargements = { ...bouchonneEtape('datesTelechargements') };

      dossier.estComplet();

      expect(etapesInterrogees).to.eql(['decision', 'datesTelechargements']);
    });
  });

  describe('sur demande du caractère actif du dossier', () => {
    it("retourne `false` si le dossier n'est pas complet", () => {
      const dossier = unDossier().sansDecision().construit();
      expect(dossier.estActif()).to.equal(false);
    });

    it("retourne `false` si la date du jour n'est pas comprise entre la date d'homologation et la prochaine date d'homologation", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } } });
      const dossier = unDossier(referentiel)
        .quiEstComplet()
        .quiEstExpire()
        .construit();
      expect(dossier.estActif()).to.equal(false);
    });

    it("retourne `true` si la date du jour est la date d'homologation", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } } });
      const aujourdhui = new Date();
      const adaptateurHorloge = { maintenant: () => aujourdhui };
      const dossierPremierJourActif = unDossier(referentiel, adaptateurHorloge)
        .quiEstComplet()
        .avecDateHomologation(aujourdhui)
        .construit();
      expect(dossierPremierJourActif.estActif()).to.equal(true);
    });

    it("retourne `true` si la date du jour est comprise entre la date d'homologation et la prochaine date d'homologation", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } } });
      const dossierActifDepuis10Jours = unDossier(referentiel)
        .quiEstComplet()
        .quiEstActif(10)
        .construit();
      expect(dossierActifDepuis10Jours.estActif()).to.equal(true);
    });

    it("retourne `true` si la date du jour est la date dernière date d'homologation", () => {
      referentiel.recharge({ echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } } });
      const adaptateurHorloge = { maintenant: () => new Date('2024-01-01') };
      const dossierDernierJourActif = unDossier(referentiel, adaptateurHorloge)
        .quiEstComplet()
        .avecDateHomologation(new Date('2023-01-01'))
        .construit();
      expect(dossierDernierJourActif.estActif()).to.equal(true);
    });
  });
});
