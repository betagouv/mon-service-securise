import Profil from '../../../src/modeles/profils/profil.js';

describe('Un profil', () => {
  describe('lorsque les règles ne sont pas définies', () => {
    it('affirme toujours que les clés répondes aux règles du profil', () => {
      expect(new Profil([], {}).estProfil(['achat', 'banque'])).toBe(true);
    });
  });

  describe('lorsque les règles ont été définies', () => {
    it('renseigne négativement quand les clés ne répondent pas aux critères de présences', () => {
      const profil = new Profil([{ presence: ['achat'], absence: [] }], {});

      const estProfil = profil.estProfil(['banque']);

      expect(estProfil).toBe(false);
    });

    it('renseigne positivement quand les clés répondent aux critères de présences', () => {
      const profil = new Profil([{ presence: ['achat'], absence: [] }], {});

      const estProfil = profil.estProfil(['banque', 'achat']);

      expect(estProfil).toBe(true);
    });

    it("renseigne négativement quand les clés ne répondent pas aux critères d'absences", () => {
      const profil = new Profil([{ absence: ['achat'], presence: [] }], {});

      const estProfil = profil.estProfil(['achat']);

      expect(estProfil).toBe(false);
    });

    it("renseigne positivement quand les clés répondent aux critères d'absences", () => {
      const profil = new Profil([{ absence: ['achat'], presence: [] }], {});

      const estProfil = profil.estProfil(['banque']);

      expect(estProfil).toBe(true);
    });

    it('renseigne négativement quand aucunes des règles sont conformes', () => {
      const profil = new Profil(
        [
          { presence: ['achat'], absence: [] },
          { presence: ['compte'], absence: [] },
        ],
        {}
      );

      const estProfil = profil.estProfil(['banque']);

      expect(estProfil).toBe(false);
    });

    it('renseigne positivement quand au moins une règle est conforme', () => {
      const profil = new Profil(
        [
          { presence: ['achat'], absence: [] },
          { presence: ['banque'], absence: [] },
        ],
        {}
      );

      const estProfil = profil.estProfil(['banque']);

      expect(estProfil).toBe(true);
    });
  });

  describe('sur une demandes de mesures à ajouter', () => {
    it('ne renvoie aucune mesure quand les règles ne sont pas satisfaites', () => {
      const profil = new Profil([{ presence: ['achat'], absence: [] }], {
        ajouter: ['analyseProtectionDonnees'],
      });

      const mesures = profil.mesuresAAjouter(['banque']);

      expect(mesures).toHaveLength(0);
    });

    it('renvoie les mesures à ajouter quand les règles sont satisfaites', () => {
      const profil = new Profil([{ presence: ['achat'], absence: [] }], {
        ajouter: ['analyseProtectionDonnees'],
      });

      const mesures = profil.mesuresAAjouter(['achat']);

      expect(mesures).toEqual(['analyseProtectionDonnees']);
    });

    it("renvoie aucune mesure à ajouter quand le profil n'a pas de mesures à ajouter", () => {
      const profil = new Profil([{ presence: ['achat'], absence: [] }], {});

      const mesures = profil.mesuresAAjouter(['achat']);

      expect(mesures).toHaveLength(0);
    });
  });

  describe('sur une demandes de mesures à retirer', () => {
    it('ne renvoie aucune mesure quand les règles ne sont pas satisfaites', () => {
      const profil = new Profil([{ presence: ['achat'], absence: [] }], {
        retirer: ['analyseProtectionDonnees'],
      });

      const mesures = profil.mesuresARetirer(['banque']);

      expect(mesures).toHaveLength(0);
    });

    it('renvoie les mesures à ajouter quand les règles sont satisfaites', () => {
      const profil = new Profil([{ presence: ['achat'], absence: [] }], {
        retirer: ['analyseProtectionDonnees'],
      });

      const mesures = profil.mesuresARetirer(['achat']);

      expect(mesures).toEqual(['analyseProtectionDonnees']);
    });

    it("renvoie aucune mesure à ajouter quand le profil n'a pas de mesures à ajouter", () => {
      const profil = new Profil([{ presence: ['achat'], absence: [] }], {});

      const mesures = profil.mesuresARetirer(['achat']);

      expect(mesures).toHaveLength(0);
    });
  });
});
