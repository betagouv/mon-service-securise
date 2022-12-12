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
