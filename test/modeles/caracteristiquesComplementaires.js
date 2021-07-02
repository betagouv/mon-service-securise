const expect = require('expect.js');

const { ErreurLocalisationDonneesInvalide } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const CaracteristiquesComplementaires = require('../../src/modeles/caracteristiquesComplementaires');

describe("L'ensemble des caractéristiques complémentaires", () => {
  let referentiel;

  beforeEach(() => (referentiel = Referentiel.creeReferentiel({
    localisationsDonnees: {
      france: { description: 'France' },
    },
  })));

  it('connaît ses constituants', () => {
    const caracteristiques = new CaracteristiquesComplementaires({
      presentation: 'Une présentation',
      structureDeveloppement: 'Une structure',
      hebergeur: 'Un hébergeur',
      localisationDonnees: 'france',
    }, referentiel);

    expect(caracteristiques.presentation).to.equal('Une présentation');
    expect(caracteristiques.structureDeveloppement).to.equal('Une structure');
    expect(caracteristiques.hebergeur).to.equal('Un hébergeur');
    expect(caracteristiques.localisationDonnees).to.equal('france');
  });

  it('sait se présenter au format JSON', () => {
    const caracteristiques = new CaracteristiquesComplementaires({
      presentation: 'Une présentation',
      structureDeveloppement: 'Une structure',
      hebergeur: 'Un hébergeur',
      localisationDonnees: 'france',
    }, referentiel);

    expect(caracteristiques.toJSON()).to.eql({
      presentation: 'Une présentation',
      structureDeveloppement: 'Une structure',
      hebergeur: 'Un hébergeur',
      localisationDonnees: 'france',
    });
  });

  it('presente un JSON partiel si certaines caractéristiques ne sont pas définies', () => {
    const caracteristiques = new CaracteristiquesComplementaires({
      presentation: 'Une présentation',
    }, referentiel);

    expect(caracteristiques.toJSON()).to.eql({ presentation: 'Une présentation' });
  });

  it('valide la localisation des données', (done) => {
    try {
      new CaracteristiquesComplementaires({ localisationDonnees: 'localisationInvalide' }, referentiel);
      done('La création des caractéristiques aurait dû lever une ErreurLocalisationDonneesInvalide');
    } catch (e) {
      expect(e).to.be.a(ErreurLocalisationDonneesInvalide);
      expect(e.message).to.equal('La localisation des données "localisationInvalide" est invalide');
      done();
    }
  });

  it("ne lève pas d'erreur si la localisation des données est absente", () => {
    const caracteristiques = new CaracteristiquesComplementaires({
      presentation: 'Une présentation',
    }, referentiel);
    expect(caracteristiques.presentation).to.equal('Une présentation');
  });
});
