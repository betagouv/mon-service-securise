/* eslint-disable max-classes-per-file */
import expect from 'expect.js';

import InformationsService from '../../src/modeles/informationsService.js';
import ElementsConstructibles from '../../src/modeles/elementsConstructibles.js';

const elles = it;

class AgregatAvecStatutSaisieDetermine extends InformationsService {
  constructor(donnees) {
    super({ proprietesAtomiquesFacultatives: ['statut'] });
    this.renseigneProprietes(donnees);
  }

  statutSaisie() {
    return this.statut;
  }
}

class Agregats extends ElementsConstructibles {
  constructor(donnees) {
    super(AgregatAvecStatutSaisieDetermine, {
      items: Object.values(donnees)[0],
    });
  }
}

describe("Les informations d'une homologation", () => {
  describe('sur demande du statut de saisie des propriétés atomiques', () => {
    elles(
      'retournent `COMPLETES` quand aucune propriété atomique requise',
      () => {
        const objetMetier = new InformationsService({
          proprietesAtomiquesFacultatives: ['prop'],
        });
        objetMetier.renseigneProprietes({ prop: 'valeur' });

        expect(objetMetier.statutSaisieProprietesAtomiques()).to.equal(
          InformationsService.COMPLETES
        );
      }
    );
  });

  describe('sur demande du statut de saisie des agrégats', () => {
    let objetMetier;

    beforeEach(
      () =>
        (objetMetier = new InformationsService({
          listesAgregats: { agregats1: Agregats, agregats2: Agregats },
        }))
    );

    elles(
      'retournent `COMPLETES` si tous les agrégats ont pour statut `COMPLETES`',
      () => {
        objetMetier.renseigneProprietes({
          agregats1: [{ statut: InformationsService.COMPLETES }],
          agregats2: [{ statut: InformationsService.COMPLETES }],
        });

        expect(objetMetier.statutSaisieAgregats()).to.equal(
          InformationsService.COMPLETES
        );
      }
    );

    elles("retournent `A_SAISIR` si aucun agrégat n'est saisi", () => {
      objetMetier.renseigneProprietes({ agregats1: [], agregats2: [] });
      expect(objetMetier.statutSaisieAgregats()).to.equal(
        InformationsService.A_SAISIR
      );
    });

    elles(
      "retournent `COMPLETES` s'il y a au moins un agrégat saisi et si aucun n'est à compléter",
      () => {
        objetMetier.renseigneProprietes({
          agregats1: [{ statut: InformationsService.COMPLETES }],
          agregats2: [],
        });

        expect(objetMetier.statutSaisieAgregats()).to.equal(
          InformationsService.COMPLETES
        );
      }
    );

    elles(
      'retournent `A_COMPLETER` si au moins un des agrégats a pour statut `A_COMPLETER`',
      () => {
        objetMetier.renseigneProprietes({
          agregats1: [{ statut: InformationsService.A_COMPLETER }],
          agregats2: [{ statut: InformationsService.COMPLETES }],
        });

        expect(objetMetier.statutSaisieAgregats()).to.equal(
          InformationsService.A_COMPLETER
        );
      }
    );
  });

  describe('sur demande du statut de saisie', () => {
    let objetMetier;

    beforeEach(
      () =>
        (objetMetier = new InformationsService({
          proprietesAtomiquesRequises: ['propriete', 'autrePropriete'],
          listesAgregats: { agregats: Agregats },
        }))
    );

    elles(
      'retournent `A_COMPLETER` si les agrégats ont pour statut `A_COMPLETER`',
      () => {
        objetMetier.renseigneProprietes({
          agregats: [{ statut: InformationsService.A_COMPLETER }],
        });
        expect(objetMetier.statutSaisie()).to.equal(
          InformationsService.A_COMPLETER
        );
      }
    );

    elles(
      'retournent `COMPLETES` si toutes les informations ont été saisies',
      () => {
        objetMetier.renseigneProprietes({
          propriete: 'valeur',
          autrePropriete: 'autre valeur',
          agregats: [{ statut: InformationsService.COMPLETES }],
        });
        expect(objetMetier.statutSaisie()).to.equal(
          InformationsService.COMPLETES
        );
      }
    );

    elles(
      'retournent `A_COMPLETER` si les agrégats sont saisis mais pas les propriétés atomiques',
      () => {
        objetMetier.renseigneProprietes({
          agregats: [{ statut: InformationsService.COMPLETES }],
        });
        expect(objetMetier.statutSaisie()).to.equal(
          InformationsService.A_COMPLETER
        );
      }
    );

    elles(
      'retournent `A_COMPLETER` si les proprietes atomiques ne sont pas toutes saisies',
      () => {
        objetMetier.renseigneProprietes({ propriete: 'valeur' });
        expect(objetMetier.statutSaisie()).to.equal(
          InformationsService.A_COMPLETER
        );
      }
    );

    elles('retournent `A_SAISIR` si aucune information saisie', () => {
      objetMetier.renseigneProprietes({});
      expect(objetMetier.statutSaisie()).to.equal(InformationsService.A_SAISIR);
    });
  });
});
