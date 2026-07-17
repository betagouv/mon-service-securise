import {
  tronqueMetaDescription,
  retireEmojisEnTete,
} from '../../src/http/aidesVues.js';

describe('Les aides de vues', () => {
  describe('sur troncature de la méta-description', () => {
    it('laisse une description courte inchangée', () => {
      expect(tronqueMetaDescription('Une description courte')).toEqual(
        'Une description courte'
      );
    });

    it('tronque une description trop longue avec une ellipse', () => {
      const longue = 'mot '.repeat(60).trim();

      const resultat = tronqueMetaDescription(longue, 160);

      expect(resultat.length).toBeLessThan(162);
      expect(resultat.slice(-1)).toEqual('…');
    });

    it("ne coupe pas au milieu d'un mot et n'a pas d'espace avant l'ellipse", () => {
      const longue = `${'MonServiceSécurisé '.repeat(20)}fin`;

      const resultat = tronqueMetaDescription(longue, 160);

      expect(resultat).not.toContain(' …');
      expect(resultat.slice(-1)).toEqual('…');
    });
  });

  describe('sur retrait des emojis en tête', () => {
    it('retire un emoji en tête de chaîne', () => {
      expect(retireEmojisEnTete('📝 Mon titre')).toEqual('Mon titre');
    });

    it('retire plusieurs emojis en tête de chaîne', () => {
      expect(retireEmojisEnTete('🤩🎉 Mon titre')).toEqual('Mon titre');
    });

    it('laisse un titre sans emoji inchangé', () => {
      expect(retireEmojisEnTete('Mon titre')).toEqual('Mon titre');
    });

    it('conserve les emojis qui ne sont pas en tête', () => {
      expect(retireEmojisEnTete('Mon titre 📝')).toEqual('Mon titre 📝');
    });
  });
});
