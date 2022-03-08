const expect = require('expect.js');

const CaracteristiquesComplementaires = require('../../src/modeles/caracteristiquesComplementaires');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');

describe("L'ensemble des caractéristiques complémentaires", () => {
  it('connaît ses constituants', () => {
    const caracteristiques = new CaracteristiquesComplementaires({
      entitesExternes: [{ nom: 'Un nom' }],
    });

    expect(caracteristiques.nombreEntitesExternes()).to.equal(1);
  });

  it('sait se présenter au format JSON', () => {
    const caracteristiques = new CaracteristiquesComplementaires({
      entitesExternes: [{ nom: 'Une entité', contact: 'jean.dupont@mail.fr', acces: 'Accès administrateur' }],
    });

    expect(caracteristiques.toJSON()).to.eql({
      entitesExternes: [{ nom: 'Une entité', contact: 'jean.dupont@mail.fr', acces: 'Accès administrateur' }],
    });
  });

  describe('sur demande du statut de saisie', () => {
    describe("quand aucune entité externe n'a été saisie", () => {
      it('détermine le statut de saisie de manière standard', () => {
        const caracteristiques = new CaracteristiquesComplementaires({});
        expect(caracteristiques.statutSaisie()).to.equal(InformationsHomologation.A_SAISIR);
      });
    });

    describe("quand au moins une entité externe n'a été que partiellement saisie", () => {
      it('a pour statut de saisie A_COMPLETER', () => {
        const caracteristiques = new CaracteristiquesComplementaires({
          entitesExternes: [{ nom: 'Un nom, mais pas de contact' }],
        });

        expect(caracteristiques.statutSaisie()).to.equal(InformationsHomologation.A_COMPLETER);
      });
    });

    describe('quand toutes les entités externes sont complètement saisies', () => {
      it('a pour statut COMPLETES si tous les autres champs sont remplis', () => {
        const caracteristiques = new CaracteristiquesComplementaires({
          entitesExternes: [{ nom: 'Un nom', contact: 'Une adresse' }],
        });

        expect(caracteristiques.statutSaisie()).to.equal(InformationsHomologation.COMPLETES);
      });

      it('a pour statut COMPLETES même si les autres champs ne sont pas saisis', () => {
        const caracteristiques = new CaracteristiquesComplementaires({
          entitesExternes: [{ nom: 'Un nom', contact: 'Une adresse' }],
        });

        expect(caracteristiques.statutSaisie()).to.equal(InformationsHomologation.COMPLETES);
      });
    });
  });
});
