const expect = require('expect.js');

const Profil = require('../../../src/modeles/profils/profil');

describe('Un profil', () => {
  describe('lorsque les règles ne sont pas définies', () => {
    it('affirme toujours que les clés répondes aux règles du profil', () => {
      expect(new Profil().estProfil(['clé 1', 'clé 2'])).to.be(true);
    });
  });

  describe('lorsque les règles ont été définies', () => {
    it('renseigne négativement quand les clés ne répondent pas aux critères de présences', () => {
      const profil = new Profil({ presence: ['cleUne'] });

      const estProfil = profil.estProfil(['cle']);

      expect(estProfil).to.be(false);
    });

    it('renseigne positivement quand les clés répondent aux critères de présences', () => {
      const profil = new Profil({ presence: ['cleUne'] });

      const estProfil = profil.estProfil(['cle', 'cleUne']);

      expect(estProfil).to.be(true);
    });

    it("renseigne négativement quand les clés ne répondent pas aux critères d'absences", () => {
      const profil = new Profil({ absence: ['cleUne'] });

      const estProfil = profil.estProfil(['cleUne']);

      expect(estProfil).to.be(false);
    });

    it("renseigne positivement quand les clés répondent aux critères d'absences", () => {
      const profil = new Profil({ absence: ['cleUne'] });

      const estProfil = profil.estProfil(['cle']);

      expect(estProfil).to.be(true);
    });
  });

  describe('sur une demandes de mesures à ajouter', () => {
    it('ne renvoie aucune mesure quand les règles ne sont pas satisfaites', () => {
      const profil = new Profil({ presence: ['cleUne'] }, { ajouter: ['mesure'] });

      const mesures = profil.mesuresAAjouter(['cle']);

      expect(mesures).to.be.empty();
    });

    it('renvoie les mesures à ajouter quand les règles sont satisfaites', () => {
      const profil = new Profil({ presence: ['cleUne'] }, { ajouter: ['mesure'] });

      const mesures = profil.mesuresAAjouter(['cleUne']);

      expect(mesures).to.eql(['mesure']);
    });

    it("renvoie aucune mesure à ajouter quand le profil n'a pas de mesures à ajouter", () => {
      const profil = new Profil({ presence: ['cleUne'] });

      const mesures = profil.mesuresAAjouter(['cleUne']);

      expect(mesures).to.be.empty();
    });
  });

  describe('sur une demandes de mesures à retirer', () => {
    it('ne renvoie aucune mesure quand les règles ne sont pas satisfaites', () => {
      const profil = new Profil({ presence: ['cleUne'] }, { retirer: ['mesure'] });

      const mesures = profil.mesuresARetirer(['cle']);

      expect(mesures).to.be.empty();
    });

    it('renvoie les mesures à ajouter quand les règles sont satisfaites', () => {
      const profil = new Profil({ presence: ['cleUne'] }, { retirer: ['mesure'] });

      const mesures = profil.mesuresARetirer(['cleUne']);

      expect(mesures).to.eql(['mesure']);
    });

    it("renvoie aucune mesure à ajouter quand le profil n'a pas de mesures à ajouter", () => {
      const profil = new Profil({ presence: ['cleUne'] });

      const mesures = profil.mesuresARetirer(['cleUne']);

      expect(mesures).to.be.empty();
    });
  });
});
