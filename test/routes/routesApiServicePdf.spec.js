const expect = require('expect.js');
const axios = require('axios');

const testeurMSS = require('./testeurMSS');
const { unDossier } = require('../constructeurs/constructeurDossier');
const Homologation = require('../../src/modeles/homologation');
const Referentiel = require('../../src/referentiel');

describe('Le serveur MSS des routes /api/service/:id/pdf/*', () => {
  const testeur = testeurMSS();

  const verifieTypeFichierServiEstPDF = (url, done) => axios.get(url)
    .then((reponse) => expect(reponse.headers['content-type']).to.contain('application/pdf'))
    .then(() => done())
    .catch(done);

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/api/service/:id/pdf/annexes.pdf`', () => {
    beforeEach(() => {
      testeur.adaptateurPdf().genereAnnexes = () => Promise.resolve('Pdf annexes');
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/api/service/456/pdf/annexes.pdf',
        done,
      );
    });

    it('sert un fichier de type pdf', (done) => {
      verifieTypeFichierServiEstPDF('http://localhost:1234/api/service/456/pdf/annexes.pdf', done);
    });

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereAnnexes = () => {
        adaptateurPdfAppele = true;
        return Promise.resolve('Pdf annexes');
      };

      axios.get('http://localhost:1234/api/service/456/pdf/annexes.pdf')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/api/service/:id/pdf/annexes`', () => {
    beforeEach(() => {
      testeur.adaptateurPdfHtml().genereAnnexes = () => Promise.resolve('Pdf annexes');
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/api/service/456/pdf/annexes',
        done,
      );
    });

    it('sert un fichier PDF', (done) => {
      verifieTypeFichierServiEstPDF('http://localhost:1234/api/service/456/pdf/annexes', done);
    });

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdfHtml().genereAnnexes = () => {
        adaptateurPdfAppele = true;
        return Promise.resolve('Pdf annexes');
      };

      axios.get('http://localhost:1234/api/service/456/pdf/annexes')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/api/service/:id/pdf/dossierDecision.pdf`', () => {
    const referentiel = Referentiel
      .creeReferentiel({ echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } } });

    beforeEach(() => {
      testeur.adaptateurPdf().genereDossierDecision = () => Promise.resolve('Pdf decision');
      testeur.middleware().reinitialise({
        homologationARenvoyer: new Homologation({
          id: '456',
          descriptionService: { nomService: 'un service' },
          dossiers: [unDossier(referentiel).quiEstActif().avecAutorite('Jean Dupond', 'RSSI').donnees],
        }, referentiel),
      });
    });

    it('recherche le service correspondant', (done) => {
      testeur.middleware().verifieRechercheService(
        'http://localhost:1234/api/service/456/pdf/dossierDecision.pdf',
        done,
      );
    });

    it('sert un fichier de type pdf', (done) => {
      verifieTypeFichierServiEstPDF('http://localhost:1234/api/service/456/pdf/dossierDecision.pdf', done);
    });

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereDossierDecision = (donnees) => {
        adaptateurPdfAppele = true;
        expect(donnees.nomService).to.equal('un service');
        expect(donnees.nomPrenomAutorite).to.equal('Jean Dupond');
        expect(donnees.fonctionAutorite).to.equal('RSSI');
        return Promise.resolve('Pdf dossier décision');
      };

      axios.get('http://localhost:1234/api/service/456/pdf/dossierDecision.pdf')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("reste robuste en cas d'échec de génération de pdf", (done) => {
      testeur.adaptateurPdf().genereDossierDecision = () => Promise.reject();

      axios.get('http://localhost:1234/api/service/456/pdf/dossierDecision.pdf')
        .then(() => done('La génération aurait dû lever une erreur'))
        .catch((e) => {
          expect(e.response.status).to.equal(424);
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/api/service/:id/pdf/dossierDecision`', () => {
    beforeEach(() => {
      testeur.adaptateurPdfHtml().genereDossierDecision = () => Promise.resolve('Pdf decision');
    });

    it('sert un fichier PDF', (done) => {
      verifieTypeFichierServiEstPDF('http://localhost:1234/api/service/456/pdf/dossierDecision', done);
    });

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdfHtml().genereDossierDecision = () => {
        adaptateurPdfAppele = true;
        return Promise.resolve('Pdf dossier décision');
      };

      axios.get('http://localhost:1234/api/service/456/pdf/dossierDecision')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch((e) => done(e.response?.data || e));
    });

    it("reste robuste en cas d'échec de génération de pdf", (done) => {
      testeur.adaptateurPdfHtml().genereDossierDecision = () => Promise.reject();

      axios.get('http://localhost:1234/api/service/456/pdf/dossierDecision')
        .then(() => done('La génération aurait dû lever une erreur'))
        .catch((e) => {
          expect(e.response.status).to.equal(424);
          done();
        })
        .catch(done);
    });
  });
});
