const expect = require('expect.js');
const { creeDepot } = require('../../src/depots/depotDonneesSelsDeHachage');
const {
  ErreurHashDeSelInvalide,
  ErreurSelManquant,
  ErreurVersionSelInvalide,
  ErreurValeurSelIncoherente,
} = require('../../src/erreurs');

describe('Le dépôt de sels de hachage', () => {
  describe('sur vérification de cohérence des sels', () => {
    it('jette une erreur si un sel est invalide', async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [{ version: 1, sel: 'unAutreSel' }],
        }),
      };
      const adaptateurPersistance = {
        tousLesSelsDeHachage: async () => [
          { version: 1, empreinte: 'sel-crypte' },
        ],
      };
      const adaptateurChiffrement = {
        compareBCrypt: async () => false,
      };

      const depot = creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        adaptateurEnvironnement,
      });

      try {
        await depot.verifieLaCoherenceDesSels();
        expect().fail('La méthode aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurHashDeSelInvalide);
        expect(e.message).to.be(
          'La version 1 du sel de la config a une valeur différente de celle déjà appliquée.'
        );
      }
    });

    it("jette une erreur si le deuxième sel est invalide, peu importe l'ordre", async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [
            { version: 2, sel: 'unAutreSel' },
            { version: 1, sel: 'sel' },
          ],
        }),
      };
      const adaptateurPersistance = {
        tousLesSelsDeHachage: async () => [
          { version: 1, empreinte: 'sel-crypte' },
          { version: 2, empreinte: 'sel2-crypte' },
        ],
      };
      const adaptateurChiffrement = {
        compareBCrypt: async (selEnClair) => selEnClair !== 'unAutreSel',
      };

      const depot = creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        adaptateurEnvironnement,
      });

      try {
        await depot.verifieLaCoherenceDesSels();
        expect().fail('La méthode aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurHashDeSelInvalide);
        expect(e.message).to.be(
          'La version 2 du sel de la config a une valeur différente de celle déjà appliquée.'
        );
      }
    });

    it('ne fait rien si tous les sels sont valides', async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [{ version: 1, sel: 'sel' }],
        }),
      };
      const adaptateurPersistance = {
        tousLesSelsDeHachage: async () => [
          { version: 1, empreinte: 'sel-crypte' },
        ],
      };
      const adaptateurChiffrement = {
        compareBCrypt: async () => true,
      };

      const depot = creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        adaptateurEnvironnement,
      });

      const resultat = await depot.verifieLaCoherenceDesSels();
      expect(resultat).to.be(undefined);
    });

    it("jette une erreur si un sel n'est pas présent dans la persistance", async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [
            { version: 1, sel: 'sel1' },
            { version: 2, sel: 'sel2' },
          ],
        }),
      };
      const adaptateurPersistance = {
        tousLesSelsDeHachage: async () => [{ version: 2, sel: 'sel2-crypte' }],
      };
      const adaptateurChiffrement = {
        compareBCrypt: async () => true,
      };

      const depot = creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        adaptateurEnvironnement,
      });

      try {
        await depot.verifieLaCoherenceDesSels();
        expect().fail('La méthode aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurSelManquant);
        expect(e.message).to.be(
          'La version 1 du sel noté dans la config est manquante dans la persistance.'
        );
      }
    });

    it("jette une erreur si un sel de la persistance n'est pas présent dans la config", async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [{ version: 2, sel: 'sel2' }],
        }),
      };
      const adaptateurPersistance = {
        tousLesSelsDeHachage: async () => [
          { version: 1, sel: 'sel1-crypte' },
          { version: 2, sel: 'sel2-crypte' },
        ],
      };
      const adaptateurChiffrement = {
        compareBCrypt: async () => true,
      };

      const depot = creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        adaptateurEnvironnement,
      });

      try {
        await depot.verifieLaCoherenceDesSels();
        expect().fail('La méthode aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurSelManquant);
        expect(e.message).to.be(
          'La version 1 du sel déjà appliquée est manquante dans la config.'
        );
      }
    });

    it("jette une erreur si aucun sel n'est présent dans la config", async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [],
        }),
      };

      const depot = creeDepot({
        adaptateurEnvironnement,
      });

      try {
        await depot.verifieLaCoherenceDesSels();
        expect().fail('La méthode aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurSelManquant);
        expect(e.message).to.be('Aucun sel de hachage dans la config.');
      }
    });
  });

  describe('sur vérification de cohérence des sels avant migration', () => {
    it("jette une erreur si plus d'un nouveau sel est présent dans la configuration", async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [
            { version: 1 },
            { version: 2 },
            { version: 3 },
          ],
        }),
      };
      const adaptateurPersistance = {
        tousLesSelsDeHachage: async () => [{ version: 1 }],
      };

      const depot = creeDepot({
        adaptateurPersistance,
        adaptateurEnvironnement,
      });

      try {
        await depot.verifieLaCoherenceDesSelsAvantMigration();
        expect().fail('La méthode aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurSelManquant);
        expect(e.message).to.be("Plus d'un sel à migrer.");
      }
    });

    it("jette une erreur si aucun nouveau sel n'est présent dans la configuration", async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [{ version: 1 }],
        }),
      };
      const adaptateurPersistance = {
        tousLesSelsDeHachage: async () => [{ version: 1 }],
      };

      const depot = creeDepot({
        adaptateurPersistance,
        adaptateurEnvironnement,
      });

      try {
        await depot.verifieLaCoherenceDesSelsAvantMigration();
        expect().fail('La méthode aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurSelManquant);
        expect(e.message).to.be(
          'Aucun nouveau sel présent dans la configuration. La migration ne peut pas être effectuée.'
        );
      }
    });

    it('jette une erreur si la version du nouveau sel ne correspond pas au paramètre reçu', async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [{ version: 1 }, { version: 2 }],
        }),
      };
      const adaptateurPersistance = {
        tousLesSelsDeHachage: async () => [{ version: 1 }],
      };

      const depot = creeDepot({
        adaptateurPersistance,
        adaptateurEnvironnement,
      });

      try {
        await depot.verifieLaCoherenceDesSelsAvantMigration(3);
        expect().fail('La méthode aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurVersionSelInvalide);
        expect(e.message).to.be(
          'La version v3 est incompatible avec la configuration actuelle.'
        );
      }
    });

    it('jette une erreur si la valeur du nouveau sel ne correspond pas au paramètre reçu', async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [
            { version: 1 },
            { version: 2, sel: 'un sel' },
          ],
        }),
      };
      const adaptateurPersistance = {
        tousLesSelsDeHachage: async () => [{ version: 1 }],
      };

      const depot = creeDepot({
        adaptateurPersistance,
        adaptateurEnvironnement,
      });

      try {
        await depot.verifieLaCoherenceDesSelsAvantMigration(2, 'un autre sel');
        expect().fail('La méthode aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurValeurSelIncoherente);
        expect(e.message).to.be(
          'La valeur du sel est incohérente avec la configuration actuelle.'
        );
      }
    });

    it('jette une erreur si les précédents sels appliqués ne sont pas cohérents avec la config', async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [
            { version: 1, sel: 'unAutreSel' },
            { version: 2, sel: 'un nouveau sel' },
          ],
        }),
      };
      const adaptateurPersistance = {
        tousLesSelsDeHachage: async () => [
          { version: 1, empreinte: 'sel-crypte' },
        ],
      };
      const adaptateurChiffrement = {
        compareBCrypt: async () => false,
      };

      const depot = creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        adaptateurEnvironnement,
      });

      try {
        await depot.verifieLaCoherenceDesSelsAvantMigration(
          2,
          'un nouveau sel'
        );
        expect().fail('La méthode aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurHashDeSelInvalide);
        expect(e.message).to.be(
          'La version 1 du sel de la config a une valeur différente de celle déjà appliquée.'
        );
      }
    });

    it('ne fait rien si tout est cohérent', async () => {
      const adaptateurEnvironnement = {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [
            { version: 1, sel: 'sel' },
            { version: 2, sel: 'un nouveau sel' },
          ],
        }),
      };
      const adaptateurPersistance = {
        tousLesSelsDeHachage: async () => [
          { version: 1, empreinte: 'sel-crypte' },
        ],
      };
      const adaptateurChiffrement = {
        compareBCrypt: async () => true,
      };

      const depot = creeDepot({
        adaptateurChiffrement,
        adaptateurPersistance,
        adaptateurEnvironnement,
      });

      try {
        await depot.verifieLaCoherenceDesSelsAvantMigration(
          2,
          'un nouveau sel'
        );
      } catch (e) {
        expect().fail(e);
      }
    });
  });
});
