const expect = require('expect.js');

const Mesure = require('../../src/modeles/mesure');
const {
  ErreurPrioriteMesureInvalide,
  ErreurEcheanceMesureInvalide,
} = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');

const elle = it;

describe('Une mesure', () => {
  describe('sur demande des statuts possibles', () => {
    elle('retourne les statuts avec `fait` en premier par défaut', () => {
      expect(Mesure.statutsPossibles()).to.eql([
        'fait',
        'enCours',
        'nonFait',
        'aLancer',
      ]);
    });

    elle(
      'peut retourner les statuts avec `fait` en dernier si on le spécifie',
      () => {
        const statutFaitALaFin = true;
        expect(Mesure.statutsPossibles(statutFaitALaFin)).to.eql([
          'enCours',
          'nonFait',
          'aLancer',
          'fait',
        ]);
      }
    );
  });

  elle("ne tient pas compte du statut s'il n'est pas renseigné", (done) => {
    try {
      Mesure.valide({ statut: undefined });
      done();
    } catch {
      done(
        "La validation de la mesure sans statut n'aurait pas dû lever d'exception."
      );
    }
  });

  describe('sur une interrogation de statut renseigné', () => {
    elle(
      'répond favorablement quand le statut est dans les statuts concernés',
      () => {
        expect(Mesure.statutRenseigne('fait')).to.be(true);
      }
    );

    elle("répond défavorablement quand le statut n'est pas renseigné", () => {
      expect(Mesure.statutRenseigne()).to.be(false);
    });
  });

  describe('sur validation de la priorite', () => {
    it("ne valide pas si la priorité n'est pas dans le référentiel", () => {
      const referentiel = Referentiel.creeReferentielVide();
      referentiel.enrichis({ prioritesMesures: {} });

      try {
        Mesure.valide({ priorite: 'inconnue' }, referentiel);
        expect().fail('L’appel aurait dû lancer une exception');
      } catch (e) {
        expect(e).to.be.an(ErreurPrioriteMesureInvalide);
        expect(e.message).to.be('La priorité "inconnue" est invalide');
      }
    });

    it('valide la priorité si elle est dans le référentiel', () => {
      const referentiel = Referentiel.creeReferentielVide();
      referentiel.enrichis({
        prioritesMesures: { p1: { libelleCourt: '', libelleComplet: '' } },
      });

      Mesure.valide({ priorite: 'p1' }, referentiel);
    });
  });

  describe("sur validation de l'échéance", () => {
    it("ne valide pas si l'échéance n'est pas une date valide", () => {
      try {
        Mesure.valide(
          { echeance: 'pasunedate' },
          Referentiel.creeReferentielVide()
        );
        expect().fail('L’appel aurait dû lancer une exception');
      } catch (e) {
        expect(e).to.be.an(ErreurEcheanceMesureInvalide);
        expect(e.message).to.be('L\'échéance "pasunedate" est invalide');
      }
    });

    it("valide si l'échéance est une date valide", () => {
      Mesure.valide(
        { echeance: '08/25/2024' },
        Referentiel.creeReferentielVide()
      );
    });
  });
});
