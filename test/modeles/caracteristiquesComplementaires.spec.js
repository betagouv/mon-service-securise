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
      entitesExternes: [{ nom: 'Un nom' }],
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
      entitesExternes: [{ nom: 'Une entité', contact: 'jean.dupont@mail.fr', acces: 'Accès administrateur' }],
    }, referentiel);

    expect(caracteristiques.toJSON()).to.eql({
      presentation: 'Une présentation',
      structureDeveloppement: 'Une structure',
      hebergeur: 'Un hébergeur',
      localisationDonnees: 'france',
      entitesExternes: [{ nom: 'Une entité', contact: 'jean.dupont@mail.fr', acces: 'Accès administrateur' }],
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

  describe('sur demande du statut de saisie', () => {
    describe("quand aucune entité externe n'a été saisie", () => {
      it('détermine le statut de saisie de manière standard', () => {
        const caracteristiques = new CaracteristiquesComplementaires({ presentation: 'Une présentation' });
        expect(caracteristiques.statutSaisie()).to.equal(InformationsHomologation.A_COMPLETER);
      });
    });

    describe("quand au moins une entité externe n'a été que partiellement saisie", () => {
      it('a pour statut de saisie A_COMPLETER', () => {
        const caracteristiques = new CaracteristiquesComplementaires({
          presentation: 'Une présentation',
          structureDeveloppement: 'Une structure',
          hebergeur: 'Un hébergeur',
          localisationDonnees: 'france',
          entitesExternes: [{ nom: 'Un nom, mais pas de contact' }],
        }, referentiel);

        expect(caracteristiques.statutSaisie()).to.equal(InformationsHomologation.A_COMPLETER);
      });
    });

    describe('quand toutes les entités externes sont complètement saisies', () => {
      it('a pour statut COMPLETES si tous les autres champs sont remplis', () => {
        const caracteristiques = new CaracteristiquesComplementaires({
          presentation: 'Une présentation',
          structureDeveloppement: 'Une structure',
          hebergeur: 'Un hébergeur',
          localisationDonnees: 'france',
          entitesExternes: [{ nom: 'Un nom', contact: 'Une adresse' }],
        }, referentiel);

        expect(caracteristiques.statutSaisie()).to.equal(InformationsHomologation.COMPLETES);
      });

      it("a pour statut A_COMPLETER si un des autres champs n'est pas saisi", () => {
        const caracteristiques = new CaracteristiquesComplementaires({
          presentation: 'Une présentation',
          entitesExternes: [{ nom: 'Un nom', contact: 'Une adresse' }],
        });

        expect(caracteristiques.statutSaisie()).to.equal(InformationsHomologation.A_COMPLETER);
      });
    });
  });
});
