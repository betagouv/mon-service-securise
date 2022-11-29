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

    it('sert un fichier de type pdf', (done) => {
      axios.get('http://localhost:1234/pdf/456/annexeRisques.pdf')
        .then((pdf) => {
          expect(pdf.headers['content-type']).to.contain('application/pdf');
          done();
        })
        .catch(done);
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

    it('utilise les informations de niveaux de gravité du référentiel', (done) => {
      testeur.adaptateurPdf().genereAnnexeRisques = (donnees) => {
        expect(donnees.niveauxGravite).to.contain(niveauxGravite.critique);
        return Promise.resolve('Pdf annexes risques');
      };

      axios.get('http://localhost:1234/pdf/456/annexeRisques.pdf')
        .then(() => done())
        .catch(done);
    });

    it('ignore le niveaux de gravité non concerné', (done) => {
      testeur.adaptateurPdf().genereAnnexeRisques = (donnees) => {
        expect(donnees.niveauxGravite.map((niveaux) => niveaux.description)).to.not.contain('Non concerné');
        return Promise.resolve('Pdf annexes risques');
      };

      axios.get('http://localhost:1234/pdf/456/annexeRisques.pdf')
        .then(() => done())
        .catch(done);
    });

    it('trie les niveaux de gravité par position décroissante', (done) => {
      testeur.adaptateurPdf().genereAnnexeRisques = (donnees) => {
        const positions = donnees.niveauxGravite.map((niveaux) => niveaux.position);
        expect(positions[0]).to.equal(4);
        expect(positions[1]).to.equal(3);
        return Promise.resolve('Pdf annexes risques');
      };

      axios.get('http://localhost:1234/pdf/456/annexeRisques.pdf')
        .then(() => done())
        .catch(done);
    });
  });
});
