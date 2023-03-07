const expect = require('expect.js');

const Homologation = require('../../../src/modeles/homologation');
const Referentiel = require('../../../src/referentiel');
const VueAnnexePDFRisques = require('../../../src/modeles/objetsVues/vueAnnexePDFRisques');

describe("L'objet de vue des descriptions des risques", () => {
  const donneesReferentiel = {
    niveauxGravite: {
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
    },
    risques: { unRisque: { description: 'Une description' } },
  };

  const referentiel = Referentiel.creeReferentiel(donneesReferentiel);

  const homologation = new Homologation({
    id: '123',
    idUtilisateur: '456',
    descriptionService: { nomService: 'Nom Service' },
    risquesGeneraux: [{ id: 'unRisque', niveauGravite: 'grave' }],
  }, referentiel);

  describe('avec des informations de niveaux de gravité dans le référentiel', () => {
    it('utilise les informations du référentiel', () => {
      const vueAnnexePDFRisques = new VueAnnexePDFRisques(homologation, referentiel);

      const donnees = vueAnnexePDFRisques.donnees();

      expect(donnees).to.have.key('niveauxGravite');
      const niveauCritique = donnees.niveauxGravite.find((niveau) => niveau.identifiant === 'critique');
      expect(niveauCritique).to.eql({ identifiant: 'critique', ...donneesReferentiel.niveauxGravite.critique });
    });

    it('ignore le niveau de gravité non concerné', () => {
      const vueAnnexePDFRisques = new VueAnnexePDFRisques(homologation, referentiel);

      const { niveauxGravite } = vueAnnexePDFRisques.donnees();

      expect(niveauxGravite.length).to.equal(2);
      expect(niveauxGravite.map((niveaux) => niveaux.description)).to.not.contain('Non concerné');
    });

    it('trie les niveaux de gravité par position décroissante', () => {
      const vueAnnexePDFRisques = new VueAnnexePDFRisques(homologation, referentiel);

      const { niveauxGravite } = vueAnnexePDFRisques.donnees();

      const positions = niveauxGravite.map((niveaux) => niveaux.position);
      expect(positions[0]).to.equal(4);
      expect(positions[1]).to.equal(3);
    });
  });

  it('ajoute le nom du service', () => {
    const vueAnnexePDFRisques = new VueAnnexePDFRisques(homologation);

    const donnees = vueAnnexePDFRisques.donnees();

    expect(donnees).to.have.key('nomService');
    expect(donnees.nomService).to.equal('Nom Service');
  });

  it('ajoute les risques par niveau de gravité', () => {
    const vueAnnexePDFRisques = new VueAnnexePDFRisques(homologation);

    const donnees = vueAnnexePDFRisques.donnees();

    expect(donnees).to.have.key('risquesParNiveauGravite');
    expect(donnees.risquesParNiveauGravite).to.have.key('grave');
    expect(donnees.risquesParNiveauGravite.grave.length).to.equal(1);
    expect(donnees.risquesParNiveauGravite.grave[0].description).to.equal('Une description');
  });

  it('ajoute le référentiel complet', () => {
    const vueAnnexePDFRisques = new VueAnnexePDFRisques(homologation, referentiel);

    const donnees = vueAnnexePDFRisques.donnees();

    expect(donnees).to.have.key('referentiel');
    expect(donnees.referentiel).to.eql(referentiel);
  });
});
