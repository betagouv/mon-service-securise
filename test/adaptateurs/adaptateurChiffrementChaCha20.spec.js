import expect from 'expect.js';
import { adaptateurChiffrementChaCha20 } from '../../src/adaptateurs/adaptateurChiffrementChaCha20.js';

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

    const utilisateurChiffre = await adaptateur.chiffre(utilisateur);
    const utilisateurDechiffre = await adaptateur.dechiffre(utilisateurChiffre);

    expect(utilisateurDechiffre).to.eql(utilisateur);
  });

  it('retourne un objet contenant les metadonnées', async () => {
    const adaptateur = adaptateurChiffrementChaCha20({
      adaptateurEnvironnement: {
        chiffrement: () => ({
          cleChaCha20Hex: () =>
            'f1e2d3c4b5a6978877665544332211ffeeddccbbaa9988776655443322110000',
        }),
      },
    });

    const utilisateurChiffre = await adaptateur.chiffre({ nom: 'Jean' });

    const chaineHexaDeDouzeOctets = /^[0-9a-fA-F]{24}$/;
    const chaineHexaDeSeizeOctets = /^[0-9a-fA-F]{32}$/;

    expect(utilisateurChiffre.iv).to.match(chaineHexaDeDouzeOctets);
    expect(utilisateurChiffre.aad).to.match(chaineHexaDeSeizeOctets);
    expect(utilisateurChiffre.donnees).to.be.an('string');
    expect(utilisateurChiffre.tag).to.match(chaineHexaDeSeizeOctets);
  });
});
