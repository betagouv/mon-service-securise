const expect = require('expect.js');

const { unDossier } = require('../constructeurs/constructeurDossier');
const donneesReferentiel = require('../../donneesReferentiel');
const Dossier = require('../../src/modeles/dossier');
const Referentiel = require('../../src/referentiel');
const {
  ErreurDossierDejaFinalise,
  ErreurDossierNonFinalisable,
  ErreurDossierEtapeInconnue,
} = require('../../src/erreurs');

describe("Un dossier d'homologation", () => {
  const referentiel = Referentiel.creeReferentielVide();

  beforeEach(() =>
    referentiel.recharge({
      echeancesRenouvellement: { unAn: {} },
      documentsHomologation: { decision: {} },
      statutsAvisDossierHomologation: { favorable: {} },
    })
  );

  it('sait se convertir en JSON', () => {
    const dossier = new Dossier(
      {
        id: '123',
        decision: { dateHomologation: '2022-12-01', dureeValidite: 'unAn' },
        autorite: { nom: 'Jean Courage', fonction: 'Responsable' },
        dateTelechargement: { date: '2023-01-01T00:00:00.000Z' },
        avecAvis: true,
        avis: [
          {
            collaborateurs: ['Jean Dupond'],
            dureeValidite: 'unAn',
            statut: 'favorable',
          },
        ],
        avecDocuments: true,
        documents: ['unDocument'],
        finalise: true,
      },
      referentiel
    );

    expect(dossier.toJSON()).to.eql({
      id: '123',
      decision: { dateHomologation: '2022-12-01', dureeValidite: 'unAn' },
      autorite: { nom: 'Jean Courage', fonction: 'Responsable' },
      dateTelechargement: { date: '2023-01-01T00:00:00.000Z' },
      avecAvis: true,
      avis: [
        {
          collaborateurs: ['Jean Dupond'],
          dureeValidite: 'unAn',
          statut: 'favorable',
        },
      ],
      avecDocuments: true,
      documents: ['unDocument'],
      finalise: true,
    });
  });

  it('est non-finalisé par défaut', () => {
    const dossier = new Dossier({ id: '123' }, referentiel);
    expect(dossier.finalise).to.be(false);
  });

  describe("sur demande d'enregistrement de l'autorité d'homolgation", () => {
    it('jette une erreur si le dossier est déjà finalisé', () => {
      const dossierFinalise = new Dossier({ finalise: true });

      expect(() =>
        dossierFinalise.enregistreAutoriteHomologation('Jean Dupond', 'RSSI')
      ).to.throwError((e) => expect(e).to.be.an(ErreurDossierDejaFinalise));
    });

    it("met à jour l'autorité d'homologation avec les données fournies", () => {
      const dossier = new Dossier();

      dossier.enregistreAutoriteHomologation('Jean Dupond', 'RSSI');

      expect(dossier.autorite.nom).to.equal('Jean Dupond');
      expect(dossier.autorite.fonction).to.equal('RSSI');
    });
  });

  describe("sur demande d'enregistrement de la décision d'homologation", () => {
    it('jette une erreur si le dossier est déjà finalisé', () => {
      const dossierFinalise = new Dossier({ finalise: true });

      expect(() =>
        dossierFinalise.enregistreDecision(new Date(), 'unAn')
      ).to.throwError((e) => expect(e).to.be.an(ErreurDossierDejaFinalise));
    });

    it('met à jour la décision du dossier avec les informations fournies', () => {
      const dossier = new Dossier();
      const maintenant = new Date();

      dossier.enregistreDecision(maintenant, 'unAn');

      expect(dossier.decision.dateHomologation).to.equal(maintenant);
      expect(dossier.decision.dureeValidite).to.equal('unAn');
    });
  });

  describe("sur demande d'enregistrement d'une date de téléchargement", () => {
    it('jette une erreur si le dossier est déjà finalisé', () => {
      const dossierFinalise = new Dossier({ finalise: true });

      expect(() =>
        dossierFinalise.enregistreDateTelechargement('decision', new Date())
      ).to.throwError((e) => expect(e).to.be.an(ErreurDossierDejaFinalise));
    });

    it("met à jour la date de téléchargement des documents d'homologation avec la date fournie", () => {
      const dossier = new Dossier();
      const maintenant = new Date();

      dossier.enregistreDateTelechargement(maintenant);

      expect(dossier.dateTelechargement.date).to.equal(maintenant);
    });
  });

  describe("sur demande d'enregistrement des avis", () => {
    it('jette une erreur si le dossier est déjà finalisé', () => {
      const dossierFinalise = new Dossier({ finalise: true });

      expect(() => dossierFinalise.enregistreAvis([])).to.throwError((e) =>
        expect(e).to.be.an(ErreurDossierDejaFinalise)
      );
    });

    it('remplace les avis par ceux fournis', () => {
      const dossier = new Dossier({}, referentiel);
      const avisComplet = {
        collaborateurs: ['Jean Dupond'],
        statut: 'favorable',
        dureeValidite: 'unAn',
      };

      dossier.enregistreAvis([avisComplet]);

      expect(dossier.avis.avis[0].toJSON()).to.eql(avisComplet);
      expect(dossier.avis.avecAvis).to.be(true);
    });
  });

  describe('sur demande de déclaration sans avis', () => {
    it('jette une erreur si le dossier est déjà finalisé', () => {
      const dossierFinalise = new Dossier({ finalise: true });

      expect(() => dossierFinalise.declareSansAvis()).to.throwError((e) =>
        expect(e).to.be.an(ErreurDossierDejaFinalise)
      );
    });

    it('efface les avis existants', () => {
      const dossier = new Dossier(
        {
          avis: [
            {
              collaborateurs: ['Jean Dupond'],
              statut: 'favorable',
              dureeValidite: 'unAn',
            },
          ],
          avecAvis: true,
        },
        referentiel
      );

      dossier.declareSansAvis();

      expect(dossier.avis.avecAvis).to.be(false);
      expect(dossier.avis.avis).to.eql([]);
    });
  });

  describe("sur demande d'enregistrement des documents", () => {
    it('jette une erreur si le dossier est déjà finalisé', () => {
      const dossierFinalise = new Dossier({ finalise: true });

      expect(() => dossierFinalise.enregistreDocuments([])).to.throwError((e) =>
        expect(e).to.be.an(ErreurDossierDejaFinalise)
      );
    });

    it('remplace les documents par ceux fournis', () => {
      const dossier = new Dossier({}, referentiel);
      const documents = ['unDocument'];

      dossier.enregistreDocuments(documents);

      expect(dossier.documents.documents).to.eql(documents);
      expect(dossier.documents.avecDocuments).to.be(true);
    });
  });

  describe('sur demande de déclaration sans document', () => {
    it('jette une erreur si le dossier est déjà finalisé', () => {
      const dossierFinalise = new Dossier({ finalise: true });

      expect(() => dossierFinalise.declareSansDocument()).to.throwError((e) =>
        expect(e).to.be.an(ErreurDossierDejaFinalise)
      );
    });

    it('efface les documents existants', () => {
      const dossier = new Dossier(
        { documents: ['unDocument'], avecDocuments: true },
        referentiel
      );

      dossier.declareSansDocument();

      expect(dossier.documents.avecDocuments).to.be(false);
      expect(dossier.documents.documents).to.eql([]);
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

      const etapes = ['decision', 'dateTelechargement', 'autorite'];
      const dossier = new Dossier();
      etapes.forEach((etape) => {
        dossier[etape] = { ...bouchonneEtape(etape) };
      });

      dossier.estComplet();

      expect(etapesInterrogees).to.eql(etapes);
    });
  });

  describe('sur demande du caractère actif du dossier', () => {
    beforeEach(() => {
      referentiel.recharge({
        echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
        statutsAvisDossierHomologation: { favorable: {} },
      });
    });

    it("retourne `false` si le dossier n'est pas finalisé", () => {
      const dossier = unDossier(referentiel).quiEstActif().construit();
      expect(dossier.estActif()).to.equal(false);
    });

    it("retourne `false` si la date du jour n'est pas comprise entre la date d'homologation et la prochaine date d'homologation", () => {
      const dossier = unDossier(referentiel)
        .quiEstComplet()
        .quiEstExpire()
        .construit();
      expect(dossier.estActif()).to.equal(false);
    });

    it("retourne `true` si la date du jour est la date d'homologation", () => {
      const aujourdhui = new Date();
      const adaptateurHorloge = { maintenant: () => aujourdhui };
      const dossierPremierJourActif = unDossier(referentiel, adaptateurHorloge)
        .quiEstComplet()
        .avecDateHomologation(aujourdhui)
        .construit();
      expect(dossierPremierJourActif.estActif()).to.equal(true);
    });

    it("retourne `true` si la date du jour est comprise entre la date d'homologation et la prochaine date d'homologation", () => {
      const dossierActifDepuis10Jours = unDossier(referentiel)
        .quiEstComplet()
        .quiEstActif(10)
        .construit();
      expect(dossierActifDepuis10Jours.estActif()).to.equal(true);
    });

    it("retourne `true` si la date du jour est la date dernière date d'homologation", () => {
      const adaptateurHorloge = { maintenant: () => new Date('2024-01-01') };
      const dossierDernierJourActif = unDossier(referentiel, adaptateurHorloge)
        .quiEstComplet()
        .avecDateHomologation(new Date('2023-01-01'))
        .construit();
      expect(dossierDernierJourActif.estActif()).to.equal(true);
    });
  });

  describe('sur demande de finalisation du dossier', () => {
    it("jette une erreur contenant la liste des étapes incomplètes si le dossier n'est pas complet", () => {
      referentiel.recharge({ documentsHomologation: { unDocument: {} } });
      const dossier = new Dossier({}, referentiel);

      expect(() => dossier.enregistreFinalisation()).to.throwError((e) => {
        expect(e).to.be.an(ErreurDossierNonFinalisable);
        expect(e.message).to.equal(
          'Ce dossier comporte des étapes incomplètes.'
        );
        expect(e.etapesIncompletes).to.eql([
          'decision',
          'dateTelechargement',
          'autorite',
          'avis',
          'documents',
        ]);
      });
    });

    it("enregistre la finalisation s'il est complet", () => {
      referentiel.recharge({
        echeancesRenouvellement: { unAn: {} },
        documentsHomologation: { decision: {} },
        statutsAvisDossierHomologation: { favorable: {} },
      });
      const dossierComplet = unDossier(referentiel)
        .quiEstComplet()
        .quiEstNonFinalise()
        .construit();

      dossierComplet.enregistreFinalisation();
      expect(dossierComplet.finalise).to.be(true);
    });
  });

  describe("sur demande de l'étape courante", () => {
    beforeEach(() => {
      referentiel.recharge({
        echeancesRenouvellement: { unAn: {} },
        // Ici, on référence la PROD à dessein, car on veut s'assurer que le code de `Dossier`
        // et les données du référentiel sont synchronisées.
        etapesParcoursHomologation:
          donneesReferentiel.etapesParcoursHomologation,
        statutsAvisDossierHomologation: { favorable: {} },
      });
    });

    it("renvoie la première etape si le dossier vient d'être créé", () => {
      const nouveauDossier = new Dossier({}, referentiel);

      expect(nouveauDossier.etapeCourante()).to.equal('autorite');
    });

    it("renvoie l'étape « Récapitulatif » si toutes les étapes précédentes sont complètes", () => {
      const dossierComplet = unDossier(referentiel).quiEstComplet().construit();

      expect(dossierComplet.etapeCourante()).to.equal('recapitulatif');
    });

    it("renvoie l'étape qui suit la dernière étape complète", () => {
      const etapeUneComplete = unDossier(referentiel)
        .avecAutorite('Jean', 'RSSI')
        .construit();

      expect(etapeUneComplete.etapeCourante()).to.equal('avis');
    });

    it('jette une erreur si les données du référentiel et les propriété du dossier ne correspondent pas', () => {
      referentiel.recharge({
        echeancesRenouvellement: { unAn: {} },
        etapesParcoursHomologation: [
          { numero: 1, libelle: 'Étape inconnue', id: 'etapeInconnue' },
        ],
        statutsAvisDossierHomologation: { favorable: {} },
      });

      const dossierDesynchronise = new Dossier({}, referentiel);

      expect(() => dossierDesynchronise.etapeCourante()).to.throwError((e) => {
        expect(e).to.be.an(ErreurDossierEtapeInconnue);
        expect(e.etapeInconnue).to.equal('etapeInconnue');
      });
    });
  });

  describe("sur demande d'une expiration survenant prochainement", () => {
    it("retourne 'true' si le dossier va bientôt expirer", () => {
      referentiel.recharge({
        echeancesRenouvellement: {
          sixMois: { nbMoisDecalage: 6, nbMoisBientotExpire: 2 },
        },
        statutsAvisDossierHomologation: { favorable: {} },
      });
      const dossierExpirantDans30Jours = unDossier(referentiel)
        .quiEstComplet()
        .quiVaExpirer(30, 'sixMois')
        .construit();

      expect(dossierExpirantDans30Jours.estBientotExpire()).to.be(true);
    });

    it("retourne 'false' si le dossier ne va pas bientôt expirer", () => {
      referentiel.recharge({
        echeancesRenouvellement: {
          sixMois: { nbMoisDecalage: 6, nbMoisBientotExpire: 1 },
        },
        statutsAvisDossierHomologation: { favorable: {} },
      });
      const dossierExpirantDans60Jours = unDossier(referentiel)
        .quiEstComplet()
        .quiVaExpirer(60, 'sixMois')
        .construit();

      expect(dossierExpirantDans60Jours.estBientotExpire()).to.be(false);
    });
  });

  describe("sur demande d'expiration", () => {
    beforeEach(() => {
      referentiel.recharge({
        echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
        statutsAvisDossierHomologation: { favorable: {} },
      });
    });

    it("retourne 'true' si le dossier est expiré", () => {
      const dossierExpire = unDossier(referentiel)
        .quiEstComplet()
        .quiEstExpire()
        .construit();

      expect(dossierExpire.estExpire()).to.be(true);
    });

    it("retourne 'false' si le dossier n'est pas expiré", () => {
      const dossierActif = unDossier(referentiel)
        .quiEstComplet()
        .quiEstActif()
        .construit();

      expect(dossierActif.estExpire()).to.be(false);
    });
  });
});
