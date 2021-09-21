const expect = require('expect.js');

const { ErreurLocalisationDonneesInvalide } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const CaracteristiquesComplementaires = require('../../src/modeles/caracteristiquesComplementaires');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');

describe("L'ensemble des caractéristiques complémentaires", () => {
  let referentiel;

  beforeEach(() => (referentiel = Referentiel.creeReferentiel({
    localisationsDonnees: {
      france: { description: 'Quelque part en France' },
    },
  })));

  it('connaît ses constituants', () => {
    const caracteristiques = new CaracteristiquesComplementaires({
      presentation: 'Une présentation',
      structureDeveloppement: 'Une structure',
      hebergeur: 'Un hébergeur',
      localisationDonnees: 'france',
      entitesExternes: [{ nom: 'Un nom', role: 'Un rôle' }],
    }, referentiel);

    expect(caracteristiques.presentation).to.equal('Une présentation');
    expect(caracteristiques.structureDeveloppement).to.equal('Une structure');
    expect(caracteristiques.hebergeur).to.equal('Un hébergeur');
    expect(caracteristiques.localisationDonnees).to.equal('france');
    expect(caracteristiques.nombreEntitesExternes()).to.equal(1);
  });

  it('sait décrire la localisation des données', () => {
    const caracteristiques = new CaracteristiquesComplementaires({
      localisationDonnees: 'france',
    }, referentiel);

    expect(caracteristiques.descriptionLocalisationDonnees()).to.equal('Quelque part en France');
  });

  it("retourne une valeur d'hébergeur par défaut", () => {
    const caracteristiques = new CaracteristiquesComplementaires();
    expect(caracteristiques.descriptionHebergeur()).to.equal('Hébergeur non renseigné');
  });

  it('sait se présenter au format JSON', () => {
    const caracteristiques = new CaracteristiquesComplementaires({
      presentation: 'Une présentation',
      structureDeveloppement: 'Une structure',
      hebergeur: 'Un hébergeur',
      localisationDonnees: 'france',
      entitesExternes: [{ nom: 'Une entité', role: 'Un rôle' }],
    }, referentiel);

    expect(caracteristiques.toJSON()).to.eql({
      presentation: 'Une présentation',
      structureDeveloppement: 'Une structure',
      hebergeur: 'Un hébergeur',
      localisationDonnees: 'france',
      entitesExternes: [{ nom: 'Une entité', role: 'Un rôle' }],
    });
  });

  it('presente un JSON partiel si certaines caractéristiques ne sont pas définies', () => {
    const caracteristiques = new CaracteristiquesComplementaires({
      presentation: 'Une présentation',
      hebergeur: '',
    });

    expect(caracteristiques.toJSON()).to.eql({
      presentation: 'Une présentation',
      hebergeur: '',
      entitesExternes: [],
    });
  });

  it('valide la localisation des données si elle est présente', (done) => {
    try {
      new CaracteristiquesComplementaires({ localisationDonnees: 'localisationInvalide' }, referentiel);
      done('La création des caractéristiques aurait dû lever une ErreurLocalisationDonneesInvalide');
    } catch (e) {
      expect(e).to.be.a(ErreurLocalisationDonneesInvalide);
      expect(e.message).to.equal('La localisation des données "localisationInvalide" est invalide');
      done();
    }
  });

  it('détermine le statut de saisie', () => {
    const caracteristiques = new CaracteristiquesComplementaires({ presentation: 'Une présentation' });
    expect(caracteristiques.statutSaisie()).to.equal(InformationsHomologation.A_COMPLETER);
  });
});
