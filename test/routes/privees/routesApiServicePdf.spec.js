const expect = require('expect.js');
const axios = require('axios');

const testeurMSS = require('../testeurMSS');
const {
  verifieNomFichierServi,
  verifieTypeFichierServiEstPDF,
  verifieTypeFichierServiEstZIP,
} = require('../../aides/verifieFichierServi');
const { unDossier } = require('../../constructeurs/constructeurDossier');
const Homologation = require('../../../src/modeles/homologation');
const Referentiel = require('../../../src/referentiel');
const {
  Permissions,
  Rubriques,
} = require('../../../src/modeles/autorisations/gestionDroits');
const { unService } = require('../../constructeurs/constructeurService');

const { LECTURE } = Permissions;
const { SECURISER, RISQUES, DECRIRE, HOMOLOGUER } = Rubriques;

describe('Le serveur MSS des routes /api/service/:id/pdf/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/api/service/:id/pdf/annexes.pdf`', () => {
    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [
          { niveau: LECTURE, rubrique: DECRIRE },
          { niveau: LECTURE, rubrique: SECURISER },
          { niveau: LECTURE, rubrique: RISQUES },
        ],
        'http://localhost:1234/api/service/456/pdf/annexes.pdf',
        done
      );
    });

    it('sert un fichier de type pdf', (done) => {
      verifieTypeFichierServiEstPDF(
        'http://localhost:1234/api/service/456/pdf/annexes.pdf',
        done
      );
    });

    it('utilise un adaptateur de pdf pour la génération', async () => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereAnnexes = async () => {
        adaptateurPdfAppele = true;
        return 'Pdf annexes';
      };

      await axios.get('http://localhost:1234/api/service/456/pdf/annexes.pdf');

      expect(adaptateurPdfAppele).to.be(true);
    });
  });

  describe('quand requête GET sur `/api/service/:id/pdf/dossierDecision.pdf`', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
      statutsAvisDossierHomologation: { favorable: {} },
    });

    beforeEach(() => {
      const homologationARenvoyer = new Homologation(
        {
          id: '456',
          descriptionService: { nomService: 'un service' },
          dossiers: [
            unDossier(referentiel)
              .quiEstActif()
              .avecAutorite('Jean Dupond', 'RSSI')
              .avecAvis([
                {
                  collaborateurs: ['Jean Dupond'],
                  dureeValidite: 'unAn',
                  statut: 'favorable',
                },
              ])
              .avecDocuments(['unDocument']).donnees,
          ],
        },
        referentiel
      );
      homologationARenvoyer.mesures.indiceCyber = () => 3.5;
      testeur.middleware().reinitialise({ homologationARenvoyer });
    });

    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          [{ niveau: LECTURE, rubrique: HOMOLOGUER }],
          'http://localhost:1234/api/service/456/pdf/dossierDecision.pdf',
          done
        );
    });

    it('recherche le dossier courant correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheDossierCourant(
          'http://localhost:1234/api/service/456/pdf/dossierDecision.pdf',
          done
        );
    });

    it('sert un fichier de type pdf', (done) => {
      verifieTypeFichierServiEstPDF(
        'http://localhost:1234/api/service/456/pdf/dossierDecision.pdf',
        done
      );
    });

    it('utilise un adaptateur de pdf pour la génération', async () => {
      let donneesDossier;

      testeur.adaptateurPdf().genereDossierDecision = async (donnees) => {
        donneesDossier = donnees;

        return 'Pdf dossier décision';
      };

      await axios.get(
        'http://localhost:1234/api/service/456/pdf/dossierDecision.pdf'
      );

      expect(donneesDossier.nomService).to.equal('un service');
      expect(donneesDossier.nomPrenomAutorite).to.equal('Jean Dupond');
      expect(donneesDossier.fonctionAutorite).to.equal('RSSI');
      expect(donneesDossier.avis).to.eql([
        {
          collaborateurs: ['Jean Dupond'],
          dureeValidite: 'unAn',
          statut: 'favorable',
        },
      ]);
      expect(donneesDossier.documents).to.eql(['unDocument']);
    });
  });

  describe('quand requête GET sur `/api/service/:id/pdf/syntheseSecurite.pdf`', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { uneCategorie: {} },
      localisationsDonnees: { uneLocalisation: { description: 'France' } },
      statutsDeploiement: {
        unStatutDeploiement: { description: 'Statut de déploiement' },
      },
      typesService: { unType: { description: 'Type de service' } },
      statutsMesures: { fait: 'Fait' },
      mesures: { uneMesure: { categorie: 'uneCategorie' } },
      reglesPersonnalisation: { mesuresBase: ['uneMesure'] },
    });
    const homologationARenvoyer = new Homologation({ id: '456' }, referentiel);

    beforeEach(() => {
      testeur.middleware().reinitialise({ homologationARenvoyer });
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [
          { niveau: LECTURE, rubrique: SECURISER },
          { niveau: LECTURE, rubrique: DECRIRE },
        ],
        'http://localhost:1234/api/service/456/pdf/syntheseSecurite.pdf',
        done
      );
    });

    it('sert un fichier de type pdf', (done) => {
      verifieTypeFichierServiEstPDF(
        'http://localhost:1234/api/service/456/pdf/syntheseSecurite.pdf',
        done
      );
    });

    it('utilise un adaptateur de pdf pour la génération', async () => {
      let donneesSynthese;
      testeur.adaptateurPdf().genereSyntheseSecurite = async (donnees) => {
        donneesSynthese = donnees;

        return 'Pdf synthèse sécurité';
      };

      await axios.get(
        'http://localhost:1234/api/service/456/pdf/syntheseSecurite.pdf'
      );

      expect(donneesSynthese.service).to.eql(homologationARenvoyer);
      expect(donneesSynthese.referentiel).to.eql(testeur.referentiel());
    });
  });

  describe('quand requête GET sur `/api/service/:id/pdf/documentsHomologation.zip`', () => {
    const referentiel = Referentiel.creeReferentielVide();
    const homologationARenvoyer = new Homologation(
      {
        id: '456',
        descriptionService: { nomService: 'un service' },
        dossiers: [unDossier(referentiel).donnees],
      },
      referentiel
    );
    homologationARenvoyer.mesures.indiceCyber = () => 3.5;
    homologationARenvoyer.documentsPdfDisponibles = () => [
      'annexes',
      'syntheseSecurite',
      'dossierDecision',
    ];

    beforeEach(() => {
      testeur.middleware().reinitialise({ homologationARenvoyer });
    });

    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
          [],
          'http://localhost:1234/api/service/456/pdf/documentsHomologation.zip',
          done
        );
    });

    it('sert un fichier de type zip', (done) => {
      verifieTypeFichierServiEstZIP(
        'http://localhost:1234/api/service/456/pdf/documentsHomologation.zip',
        done
      );
    });

    it('sert un fichier dont le nom contient la date du jour en format court', (done) => {
      testeur.adaptateurHorloge().maintenant = () => new Date(2023, 0, 28);

      verifieNomFichierServi(
        'http://localhost:1234/api/service/456/pdf/documentsHomologation.zip',
        'MSS_decision_20230128.zip',
        done
      );
    });

    it("utilise le middleware de chargement de l'autorisation", (done) => {
      testeur
        .middleware()
        .verifieChargementDesAutorisations(
          'http://localhost:1234/api/service/456/pdf/documentsHomologation.zip',
          done
        );
    });

    it("ajoute dans l'archive zip seulement les documents indiqués par le service", async () => {
      const serviceUnSeulDocument = unService().construis();
      serviceUnSeulDocument.documentsPdfDisponibles = () => ['annexes'];

      testeur
        .middleware()
        .reinitialise({ homologationARenvoyer: serviceUnSeulDocument });

      let fichiersZipes;
      testeur.adaptateurPdf().genereAnnexes = async () => 'PDF A';
      testeur.adaptateurPdf().genereSyntheseSecurite = async () => {
        throw new Error('Ce document ne devrait pas être généré');
      };
      testeur.adaptateurPdf().genereDossierDecision = async () => {
        throw new Error('Ce document ne devrait pas être généré');
      };
      testeur.adaptateurZip().genereArchive = async (fichiers) => {
        fichiersZipes = fichiers;
      };

      await axios.get(
        'http://localhost:1234/api/service/456/pdf/documentsHomologation.zip'
      );

      expect(fichiersZipes.length).to.be(1);
      expect(fichiersZipes[0]).to.eql({ nom: 'Annexes.pdf', buffer: 'PDF A' });
    });

    it("utilise un adaptateur d'horloge pour la génération du nom", async () => {
      let adaptateurHorlogeAppele = false;
      testeur.adaptateurHorloge().maintenant = () => {
        adaptateurHorlogeAppele = true;
        return new Date();
      };

      await axios.get(
        'http://localhost:1234/api/service/456/pdf/documentsHomologation.zip'
      );
      expect(adaptateurHorlogeAppele).to.be(true);
    });
  });

  describe('quand requête GET sur `/api/service/:id/archive/tamponHomologation.zip`', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { unAn: {} },
      statutsAvisDossierHomologation: { favorable: {} },
    });
    const serviceARenvoyer = unService(referentiel)
      .avecId('456')
      .avecNomService('un service')
      .avecDossiers([
        unDossier(referentiel).quiEstComplet().quiEstActif(60).donnees,
      ])
      .construis();

    beforeEach(() => {
      testeur
        .middleware()
        .reinitialise({ homologationARenvoyer: serviceARenvoyer });
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        [
          { niveau: LECTURE, rubrique: HOMOLOGUER },
          { niveau: LECTURE, rubrique: DECRIRE },
        ],
        'http://localhost:1234/api/service/456/archive/tamponHomologation.zip',
        done
      );
    });

    it('sert un fichier de type zip', (done) => {
      verifieTypeFichierServiEstZIP(
        'http://localhost:1234/api/service/456/archive/tamponHomologation.zip',
        done
      );
    });

    it("sert un fichier qui porte le nom de l'archive", (done) => {
      testeur.adaptateurHorloge().maintenant = () => new Date(2023, 0, 28);

      verifieNomFichierServi(
        'http://localhost:1234/api/service/456/archive/tamponHomologation.zip',
        'MSS_tampon_homologation.zip',
        done
      );
    });

    it("retourne une erreur HTTP 422 si le service n'a pas d'homologation active", (done) => {
      const serviceSansDossierActif = unService(referentiel)
        .avecId('456')
        .avecNomService('un service')
        .avecDossiers([])
        .construis();
      testeur
        .middleware()
        .reinitialise({ homologationARenvoyer: serviceSansDossierActif });

      testeur.verifieRequeteGenereErreurHTTP(
        422,
        "Le service n'a pas d'homologation active",
        {
          method: 'get',
          url: 'http://localhost:1234/api/service/456/archive/tamponHomologation.zip',
        },
        done
      );
    });

    it('utilise un adaptateur Pdf pour la génération des fichiers', async () => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereTamponHomologation = () => {
        adaptateurPdfAppele = true;
        return [];
      };

      await axios.get(
        'http://localhost:1234/api/service/456/archive/tamponHomologation.zip'
      );
      expect(adaptateurPdfAppele).to.be(true);
    });

    it("utilise un adaptateur Zip pour l'archivage des fichiers", async () => {
      let adaptateurZipAppele = false;
      testeur.adaptateurZip().genereArchive = () => {
        adaptateurZipAppele = true;
        return [];
      };

      await axios.get(
        'http://localhost:1234/api/service/456/archive/tamponHomologation.zip'
      );
      expect(adaptateurZipAppele).to.be(true);
    });
  });
});
