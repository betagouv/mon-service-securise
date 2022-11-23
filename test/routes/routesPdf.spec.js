const expect = require('expect.js');
const axios = require('axios');

const testeurMSS = require('./testeurMSS');

describe('Le serveur MSS des routes /pdf/*', () => {
  const testeur = testeurMSS();

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
      axios.get('http://localhost:1234/pdf/456/annexeMesures.pdf')
        .then((pdf) => {
          expect(pdf.headers['content-type']).to.contain('application/pdf');
          done();
        })
        .catch(done);
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
});
