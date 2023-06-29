const expect = require('expect.js');

const { unDossier } = require('../constructeurs/constructeurDossier');
const donneesReferentiel = require('../../donneesReferentiel');
const Dossier = require('../../src/modeles/dossier');
const Referentiel = require('../../src/referentiel');
const {
  ErreurDossierDejaFinalise,
  ErreurDossierNonFinalisable,
  ErreurDossierNonFinalise,
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
        archive: true,
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
      archive: true,
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

  describe("sur demande du statut de l'homologation du dossier", () => {
    beforeEach(() => {
      referentiel.recharge({
        echeancesRenouvellement: {
          unAn: { nbMoisDecalage: 12, nbMoisBientotExpire: 2 },
        },
        statutsAvisDossierHomologation: { favorable: {} },
      });
    });

    it("est « Non réalisée » si le dossier n'est pas finalisé", () => {
      const nonFinalise = unDossier(referentiel)
        .quiEstNonFinalise()
        .construit();

      expect(nonFinalise.statutHomologation()).to.be('nonRealisee');
    });

    it('est « Bientôt activée » si le dossier est finalisé avec une date de début dans le futur', () => {
      const maintenantPremierJuin = {
        maintenant: () => new Date('2023-06-01'),
      };
      const actifLeDeuxJuin = unDossier(referentiel, maintenantPremierJuin)
        .quiEstComplet()
        .avecDateHomologation(new Date('2023-06-02'))
        .construit();

      expect(actifLeDeuxJuin.statutHomologation()).to.be('bientotActivee');
    });

    it('est « Bientôt expirée » si le dossier est finalisé avec une date de fin qui est proche', () => {
      const maintenantPremierJuin = {
        maintenant: () => new Date('2023-06-01'),
      };
      const expireDansDixJours = unDossier(referentiel, maintenantPremierJuin)
        .quiEstComplet()
        .avecDecision('2022-06-11', 'unAn')
        .construit();

      expect(expireDansDixJours.statutHomologation()).to.be('bientotExpiree');
    });

    it("est « Activée » si le dossier est finalisé et que sa période d'homologation couvre la date du jour", () => {
      const maintenantPremierJuin = {
        maintenant: () => new Date('2023-06-01'),
      };
      const actifAnneeComplete = unDossier(referentiel, maintenantPremierJuin)
        .quiEstComplet()
        .avecDecision('2023-01-01', 'unAn')
        .construit();

      expect(actifAnneeComplete.statutHomologation()).to.be('activee');
    });

    it("est « Expirée » si le dossier est finalisé et que sa date de fin d'homologation est passée", () => {
      const maintenantPremierJuin = {
        maintenant: () => new Date('2023-06-01'),
      };
      const finiDepuis2022 = unDossier(referentiel, maintenantPremierJuin)
        .quiEstComplet()
        .avecDecision('2021-06-15', 'unAn')
        .construit();

      expect(finiDepuis2022.statutHomologation()).to.be('expiree');
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
      const nonFinalise = unDossier(referentiel)
        .quiEstNonFinalise()
        .construit();

      expect(nonFinalise.estActif()).to.equal(false);
    });

    it('retourne `false` si le dossier est archivé', () => {
      const dossierArchive = unDossier(referentiel).quiEstArchive().construit();
      expect(dossierArchive.estActif()).to.equal(false);
    });

    it('retourne `true` si le dossier est finalisé sans être archivé', () => {
      const dossierFinaliseNonArchive = unDossier(referentiel)
        .quiEstComplet()
        .nonArchive()
        .construit();

      expect(dossierFinaliseNonArchive.estActif()).to.equal(true);
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
    it("retourne 'true' si la date de fin tombe dans le « bientôt expiré » associé à la durée d'homologation", () => {
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

    it("retourne 'false' si la date de fin est postérieure « bientôt expiré » associé à la durée d'homologation", () => {
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

    it("retourne 'false' si la date de fin est déjà passée", () => {
      referentiel.recharge({
        echeancesRenouvellement: {
          unAn: { nbMoisDecalage: 12, nbMoisBientotExpire: 2 },
        },
        statutsAvisDossierHomologation: { favorable: {} },
      });
      const maintenantPremierJuin = {
        maintenant: () => new Date('2023-06-01'),
      };
      const dejaExpire = unDossier(referentiel, maintenantPremierJuin)
        .quiEstComplet()
        .avecDecision('2020-01-10', 'unAn')
        .construit();

      expect(dejaExpire.estBientotExpire()).to.be(false);
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

  describe("sur demande d'archivage", () => {
    it("archive le dossier s'il est finalisé", () => {
      const dossierFinalise = unDossier(referentiel)
        .quiEstComplet()
        .construit();

      expect(dossierFinalise.archive).to.be(undefined);
      dossierFinalise.enregistreArchivage();
      expect(dossierFinalise.archive).to.be(true);
    });

    it("jette une erreur s'il n'est pas finalisé", () => {
      const dossierFinalise = unDossier(referentiel)
        .quiEstNonFinalise()
        .construit();

      expect(() => dossierFinalise.enregistreArchivage()).to.throwError((e) => {
        expect(e).to.be.an(ErreurDossierNonFinalise);
        expect(dossierFinalise.archive).to.be(undefined);
      });
    });
  });
});
