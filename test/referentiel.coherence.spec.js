const expect = require('expect.js');
const { creeReferentiel } = require('../src/referentiel');
const { Rubriques } = require('../src/modeles/autorisations/gestionDroits');

describe('Les données réelles du référentiel', () => {
  let referentiel;
  beforeEach(() => {
    referentiel = creeReferentiel();
  });

  describe('sur les actions de saisie', () => {
    it('référencent des rubriques de droits existantes', () => {
      const actions = referentiel.actionsSaisie();

      Object.entries(actions).forEach(([id, details]) => {
        const rubrique = details.rubriqueDroit;
        try {
          expect(Rubriques).to.have.key(rubrique);
        } catch (_) {
          expect().fail(
            `L'action de saisie '${id}' référence la rubrique '${rubrique}' qui n'existe pas.`
          );
        }
      });
    });
  });
});
