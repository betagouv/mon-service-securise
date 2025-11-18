import { adaptateurChiffrementChaCha20 } from '../../src/adaptateurs/adaptateurChiffrementChaCha20.js';

describe("L'adaptateur qui chiffre et déchiffre avec l'algorithme ChaCha20", () => {
  it("retrouve la données d'origine", async () => {
    const adaptateur = adaptateurChiffrementChaCha20({
      adaptateurEnvironnement: {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [],
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

    const utilisateurChiffre = await adaptateur.chiffre(utilisateur);
    const utilisateurDechiffre = await adaptateur.dechiffre(utilisateurChiffre);

    expect(utilisateurDechiffre).toEqual(utilisateur);
  });

  it('retourne un objet contenant les metadonnées', async () => {
    const adaptateur = adaptateurChiffrementChaCha20({
      adaptateurEnvironnement: {
        chiffrement: () => ({
          tousLesSelsDeHachage: () => [],
          cleChaCha20Hex: () =>
            'f1e2d3c4b5a6978877665544332211ffeeddccbbaa9988776655443322110000',
        }),
      },
    });

    const utilisateurChiffre = await adaptateur.chiffre({ nom: 'Jean' });

    const chaineHexaDeDouzeOctets = /^[0-9a-fA-F]{24}$/;
    const chaineHexaDeSeizeOctets = /^[0-9a-fA-F]{32}$/;

    expect(utilisateurChiffre.iv).toMatch(chaineHexaDeDouzeOctets);
    expect(utilisateurChiffre.aad).toMatch(chaineHexaDeSeizeOctets);
    expect(utilisateurChiffre.donnees).toBeTypeOf('string');
    expect(utilisateurChiffre.tag).toMatch(chaineHexaDeSeizeOctets);
  });
});
