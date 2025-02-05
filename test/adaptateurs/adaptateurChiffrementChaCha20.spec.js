const expect = require('expect.js');
const {
  adaptateurChiffrementChaCha20,
} = require('../../src/adaptateurs/adaptateurChiffrementChaCha20');

describe("L'adaptateur qui chiffre et déchiffre avec l'algorithme ChaCha20", () => {
  it("retrouve la données d'origine", async () => {
    const adaptateur = adaptateurChiffrementChaCha20({
      adaptateurEnvironnement: {
        chiffrement: () => ({
          cleChaCha20Hex: () =>
            'f1e2d3c4b5a6978877665544332211ffeeddccbbaa9988776655443322110000',
        }),
      },
    });

    const utilisateur = {
      nom: 'Toto',
      prenom: 'Poum',
      id: 12043,
    };
    process.env.CHIFFREMENT_CLE_CHACHA20 = 'toto';

    const utilisateurChiffre = await adaptateur.chiffre(utilisateur);
    const utilisateurDechiffre = await adaptateur.dechiffre(utilisateurChiffre);

    expect(utilisateurDechiffre).to.eql(utilisateur);
  });
});
