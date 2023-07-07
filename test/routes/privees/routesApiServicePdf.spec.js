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

describe('Le serveur MSS des routes /api/service/:id/pdf/*', () => {
  const testeur = testeurMSS();

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/api/service/:id/pdf/annexes.pdf`', () => {
    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
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

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereAnnexes = () => {
        adaptateurPdfAppele = true;
        return Promise.resolve('Pdf annexes');
      };

      axios
        .get('http://localhost:1234/api/service/456/pdf/annexes.pdf')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch(done);
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

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereDossierDecision = (donnees) => {
        adaptateurPdfAppele = true;
        expect(donnees.nomService).to.equal('un service');
        expect(donnees.nomPrenomAutorite).to.equal('Jean Dupond');
        expect(donnees.fonctionAutorite).to.equal('RSSI');
        expect(donnees.avis).to.eql([
          {
            collaborateurs: ['Jean Dupond'],
            dureeValidite: 'unAn',
            statut: 'favorable',
          },
        ]);
        expect(donnees.documents).to.eql(['unDocument']);
        return Promise.resolve('Pdf dossier décision');
      };

      axios
        .get('http://localhost:1234/api/service/456/pdf/dossierDecision.pdf')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
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
      mesures: { uneMesure: { categorie: 'uneCategorie' } },
      reglesPersonnalisation: { mesuresBase: ['uneMesure'] },
    });
    const homologationARenvoyer = new Homologation({ id: '456' }, referentiel);

    beforeEach(() => {
      testeur.middleware().reinitialise({ homologationARenvoyer });
    });

    it('recherche le service correspondant', (done) => {
      testeur
        .middleware()
        .verifieRechercheService(
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

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereSyntheseSecurite = (donnees) => {
        adaptateurPdfAppele = true;
        expect(donnees.service).to.eql(homologationARenvoyer);
        expect(donnees.referentiel).to.eql(testeur.referentiel());
        return Promise.resolve('Pdf synthèse sécurité');
      };

      axios
        .get('http://localhost:1234/api/service/456/pdf/syntheseSecurite.pdf')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
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

    describe("conditionne les documents présents dans l'archive ZIP à l'état du service", () => {
      it("en fournissant 3 documents si le service a un dossier d'homologation courant", (done) => {
        let adaptateurZipAppele = false;
        testeur.adaptateurPdf().genereAnnexes = () => Promise.resolve('PDF A');
        testeur.adaptateurPdf().genereSyntheseSecurite = () =>
          Promise.resolve('PDF B');
        testeur.adaptateurPdf().genereDossierDecision = () =>
          Promise.resolve('PDF C');
        testeur.adaptateurZip().genereArchive = (fichiers) => {
          expect(fichiers.length).to.be(3);
          expect(fichiers[0]).to.eql({ nom: 'Annexes.pdf', buffer: 'PDF A' });
          expect(fichiers[1]).to.eql({
            nom: 'SyntheseSecurite.pdf',
            buffer: 'PDF B',
          });
          expect(fichiers[2]).to.eql({
            nom: 'DossierDecison.pdf',
            buffer: 'PDF C',
          });
          adaptateurZipAppele = true;
        };

        axios
          .get(
            'http://localhost:1234/api/service/456/pdf/documentsHomologation.zip'
          )
          .then(() => {
            expect(adaptateurZipAppele).to.be(true);
            done();
          })
          .catch((e) => done(e.response?.data || e));
      });

      it("en fournissant 2 documents si le service n'a pas de dossier d'homologation courant", (done) => {
        const homologationSansDossier = new Homologation(
          {
            id: '456',
            descriptionService: { nomService: 'un service' },
            dossiers: [],
          },
          referentiel
        );

        testeur
          .middleware()
          .reinitialise({ homologationARenvoyer: homologationSansDossier });

        let adaptateurZipAppele = false;
        testeur.adaptateurPdf().genereAnnexes = () => Promise.resolve('PDF A');
        testeur.adaptateurPdf().genereSyntheseSecurite = () =>
          Promise.resolve('PDF B');
        testeur.adaptateurPdf().genereDossierDecision = () =>
          Promise.reject(new Error('Ce document ne devrait pas être généré'));
        testeur.adaptateurZip().genereArchive = (fichiers) => {
          expect(fichiers.length).to.be(2);
          expect(fichiers[0]).to.eql({ nom: 'Annexes.pdf', buffer: 'PDF A' });
          expect(fichiers[1]).to.eql({
            nom: 'SyntheseSecurite.pdf',
            buffer: 'PDF B',
          });
          adaptateurZipAppele = true;
        };
        axios
          .get(
            'http://localhost:1234/api/service/456/pdf/documentsHomologation.zip'
          )
          .then(() => {
            expect(adaptateurZipAppele).to.be(true);
            done();
          })
          .catch((e) => done(e.response?.data || e));
      });
    });

    it("utilise un adaptateur d'horloge pour la génération du nom", (done) => {
      let adaptateurHorlogeAppele = false;
      testeur.adaptateurHorloge().maintenant = () => {
        adaptateurHorlogeAppele = true;
        return new Date();
      };

      axios
        .get(
          'http://localhost:1234/api/service/456/pdf/documentsHomologation.zip'
        )
        .then(() => {
          expect(adaptateurHorlogeAppele).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });
  });
});
