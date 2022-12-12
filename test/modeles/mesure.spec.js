const expect = require('expect.js');

const Mesure = require('../../src/modeles/mesure');

const elle = it;

describe('Une mesure', () => {
  describe('sur demande des statuts possibles', () => {
    elle('retourne les statuts avec `fait` en premier par défaut', () => {
      expect(Mesure.statutsPossibles()).to.eql(['fait', 'enCours', 'nonFait']);
    });

    elle('peut retourner les statuts avec `fait` en dernier si on le spécifie', () => {
      const statutFaitALaFin = true;
      expect(Mesure.statutsPossibles(statutFaitALaFin)).to.eql(['enCours', 'nonFait', 'fait']);
    });
  });

  elle("ne tient pas compte du statut s'il n'est pas renseigné", (done) => {
    try {
      Mesure.valide({ statut: undefined });
      done();
    } catch {
      done("La validation de la mesure sans statut n'aurait pas dû lever d'exception.");
    }
  });

  describe('sur une interrogation de statut renseigné', () => {
    elle('répond favorablement quand le statut est dans les statuts concernés', () => {
      expect(Mesure.statutRenseigne('fait')).to.be(true);
    });

    elle("répond défavorablement quand le statut n'est pas renseigné", () => {
      expect(Mesure.statutRenseigne()).to.be(false);
    });
  });
});
