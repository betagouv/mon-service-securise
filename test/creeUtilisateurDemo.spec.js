const expect = require('expect.js');
const { execSync } = require('child_process');

describe("Le script de création d'un utilisateur de Démo", () => {
  it('se lance correctement', function lanceCommande() {
    this.timeout(10000);
    const variablesEnvironnement = [
      'CREATION_UTILISATEUR_DEMO=true',
      'EMAIL_UTILISATEUR_DEMO=jean.dujardin@beta.gouv.fr',
      'MOT_DE_PASSE_UTILISATEUR_DEMO=UnMotDePasse',
      'NODE_ENV=TEST',
    ].join(' ');

    try {
      const sortie = execSync(
        `${variablesEnvironnement} node creeUtilisateurDemo.js`
      );

      expect(sortie.toString()).to.be('Utilisateur de démonstration créé !\n');
    } catch (e) {
      expect().fail(e.message);
    }
  });
});
