/* eslint-disable max-classes-per-file */
const expect = require('expect.js');

const InformationsHomologation = require('../../src/modeles/informationsHomologation');
const ListeItems = require('../../src/modeles/listeItems');

const elles = it;

class AgregatAvecStatutSaisieDetermine extends InformationsHomologation {
  constructor(donnees) {
    super({ proprietesAtomiquesFacultatives: ['statut'] });
    this.renseigneProprietes(donnees);
  }

  statutSaisie() {
    return this.statut;
  }
}

class Agregats extends ListeItems {
  constructor(donnees) {
    super(AgregatAvecStatutSaisieDetermine, { items: Object.values(donnees)[0] });
  }
}

describe("Les informations d'une homologation", () => {
  describe('sur demande du statut de saisie des propriétés atomiques', () => {
    elles('retournent `COMPLETES` quand aucune propriété atomique requise', () => {
      const objetMetier = new InformationsHomologation({ proprietesAtomiquesFacultatives: ['prop'] });
      objetMetier.renseigneProprietes({ prop: 'valeur' });

      expect(objetMetier.statutSaisieProprietesAtomiques())
        .to.equal(InformationsHomologation.COMPLETES);
    });
  });

  describe('sur demande du statut de saisie des agrégats', () => {
    let objetMetier;

    beforeEach(() => (
      objetMetier = new InformationsHomologation({
        listesAgregats: { agregats1: Agregats, agregats2: Agregats },
      })
    ));

    elles('retournent `COMPLETES` si tous les agrégats ont pour statut `COMPLETES`', () => {
      objetMetier.renseigneProprietes({
        agregats1: [{ statut: InformationsHomologation.COMPLETES }],
        agregats2: [{ statut: InformationsHomologation.COMPLETES }],
      });

      expect(objetMetier.statutSaisieAgregats()).to.equal(InformationsHomologation.COMPLETES);
    });

    elles("retournent `A_SAISIR` si aucun agrégat n'est saisi", () => {
      objetMetier.renseigneProprietes({ agregats1: [], agregats2: [] });
      expect(objetMetier.statutSaisieAgregats()).to.equal(InformationsHomologation.A_SAISIR);
    });

    elles("retournent `COMPLETES` s'il y a au moins un agrégat saisi et si aucun n'est à compléter", () => {
      objetMetier.renseigneProprietes({
        agregats1: [{ statut: InformationsHomologation.COMPLETES }],
        agregats2: [],
      });

      expect(objetMetier.statutSaisieAgregats()).to.equal(InformationsHomologation.COMPLETES);
    });

    elles('retournent `A_COMPLETER` si au moins un des agrégats a pour statut `A_COMPLETER`', () => {
      objetMetier.renseigneProprietes({
        agregats1: [{ statut: InformationsHomologation.A_COMPLETER }],
        agregats2: [{ statut: InformationsHomologation.COMPLETES }],
      });

      expect(objetMetier.statutSaisieAgregats()).to.equal(InformationsHomologation.A_COMPLETER);
    });
  });

  describe('sur demande du statut de saisie', () => {
    let objetMetier;

    beforeEach(() => (
      objetMetier = new InformationsHomologation({
        proprietesAtomiquesRequises: ['propriete', 'autrePropriete'],
        listesAgregats: { agregats: Agregats },
      })
    ));

    elles('retournent `A_COMPLETER` si les agrégats ont pour statut `A_COMPLETER`', () => {
      objetMetier.renseigneProprietes({
        agregats: [{ statut: InformationsHomologation.A_COMPLETER }],
      });
      expect(objetMetier.statutSaisie()).to.equal(InformationsHomologation.A_COMPLETER);
    });

    elles('retournent `COMPLETES` si toutes les informations ont été saisies', () => {
      objetMetier.renseigneProprietes({
        propriete: 'valeur',
        autrePropriete: 'autre valeur',
        agregats: [{ statut: InformationsHomologation.COMPLETES }],
      });
      expect(objetMetier.statutSaisie()).to.equal(InformationsHomologation.COMPLETES);
    });

    elles('retournent `A_COMPLETER` si les agrégats sont saisis mais pas les propriétés atomiques', () => {
      objetMetier.renseigneProprietes({
        agregats: [{ statut: InformationsHomologation.COMPLETES }],
      });
      expect(objetMetier.statutSaisie()).to.equal(InformationsHomologation.A_COMPLETER);
    });

    elles('retournent `A_COMPLETER` si les proprietes atomiques ne sont pas toutes saisies', () => {
      objetMetier.renseigneProprietes({ propriete: 'valeur' });
      expect(objetMetier.statutSaisie()).to.equal(InformationsHomologation.A_COMPLETER);
    });

    elles('retournent `A_SAISIR` si aucune information saisie', () => {
      objetMetier.renseigneProprietes({});
      expect(objetMetier.statutSaisie()).to.equal(InformationsHomologation.A_SAISIR);
    });
  });
});
