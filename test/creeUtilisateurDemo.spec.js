const expect = require('expect.js');
const { exec } = require('child_process');

describe("Le script de création d'un utilisateur de Démo", () => {
  it('se lance correctement', () => {
    const variablesEnvironnement =
      'CREATION_UTILISATEUR_DEMO=true ' +
      'EMAIL_UTILISATEUR_DEMO=jean.dujardin@beta.gouv.fr ' +
      'MOT_DE_PASSE_UTILISATEUR_DEMO=UnMotDePasse';

    exec(
      `${variablesEnvironnement} node creeUtilisateurDemo.js`,
      (erreur, sortie) => {
        if (erreur) {
          expect().fail(erreur);
        } else {
          expect(sortie).to.be('Utilisateur de démonstration créé !\n');
        }
      }
    );
  });
});
