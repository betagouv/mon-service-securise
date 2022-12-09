const expect = require('expect.js');
const axios = require('axios');

const testeurMSS = require('./testeurMSS');

describe('Le serveur MSS des routes /pdf/*', () => {
  const testeur = testeurMSS();

  const verifieTypeFichierServiEstPDF = (url, done) => axios.get(url)
    .then((reponse) => expect(reponse.headers['content-type']).to.contain('application/pdf'))
    .then(() => done())
    .catch(done);

  beforeEach(testeur.initialise);

  afterEach(testeur.arrete);

  describe('quand requête GET sur `/pdf/:id/annexeMesures.pdf`', () => {
    beforeEach(() => {
      testeur.adaptateurPdf().genereAnnexeMesures = () => Promise.resolve('Pdf annexe mesures');
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/pdf/456/annexeMesures.pdf',
        done,
      );
    });

    it('sert un fichier de type pdf', (done) => {
      verifieTypeFichierServiEstPDF('http://localhost:1234/pdf/456/annexeMesures.pdf', done);
    });

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereAnnexeMesures = () => {
        adaptateurPdfAppele = true;
        return Promise.resolve('Pdf annexes mesures');
      };

      axios.get('http://localhost:1234/pdf/456/annexeMesures.pdf')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/pdf/:id/annexeRisques.pdf`', () => {
    const niveauxGravite = {
      nonConcerne: {
        position: 0,
        couleur: 'blanc',
        description: 'Non concerné',
        descriptionLongue: '',
        nonConcerne: true,
      },
      grave: {
        position: 3,
        couleur: 'orange',
        description: 'Grave',
        descriptionLongue: 'Niveaux de gravité grave',
      },
      critique: {
        position: 4,
        couleur: 'rouge',
        description: 'Critique',
        descriptionLongue: 'Niveaux de gravité critique',
      },
    };

    beforeEach(() => {
      testeur.adaptateurPdf().genereAnnexeRisques = () => Promise.resolve('Pdf annexe risques');
      testeur.referentiel().recharge({ niveauxGravite });
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/pdf/456/annexeRisques.pdf',
        done,
      );
    });

    it('sert un fichier de type pdf', (done) => {
      verifieTypeFichierServiEstPDF('http://localhost:1234/pdf/456/annexeRisques.pdf', done);
    });

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereAnnexeRisques = () => {
        adaptateurPdfAppele = true;
        return Promise.resolve('Pdf annexes risques');
      };

      axios.get('http://localhost:1234/pdf/456/annexeRisques.pdf')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch(done);
    });
  });

  describe('quand requête GET sur `/pdf/:id/annexes.pdf`', () => {
    beforeEach(() => {
      testeur.adaptateurPdf().genereAnnexes = () => Promise.resolve('Pdf annexes');
    });

    it("recherche l'homologation correspondante", (done) => {
      testeur.middleware().verifieRechercheHomologation(
        'http://localhost:1234/pdf/456/annexes.pdf',
        done,
      );
    });

    it('sert un fichier de type pdf', (done) => {
      verifieTypeFichierServiEstPDF('http://localhost:1234/pdf/456/annexes.pdf', done);
    });

    it('utilise un adaptateur de pdf pour la génération', (done) => {
      let adaptateurPdfAppele = false;
      testeur.adaptateurPdf().genereAnnexes = () => {
        adaptateurPdfAppele = true;
        return Promise.resolve('Pdf annexes');
      };

      axios.get('http://localhost:1234/pdf/456/annexes.pdf')
        .then(() => {
          expect(adaptateurPdfAppele).to.be(true);
          done();
        })
        .catch(done);
    });
  });
});
