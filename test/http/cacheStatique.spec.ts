import { enTeteCachePourFichierStatique } from '../../src/http/cacheStatique.js';

describe("L'en-tête de cache pour un fichier statique", () => {
  it('rend un cache long et immuable pour un bundle Svelte', () => {
    const enTete = enTeteCachePourFichierStatique(
      '/public/composants-svelte/connexion.js',
      'no-store'
    );

    expect(enTete).toEqual('public, max-age=31536000, immutable');
  });

  it('rend la politique par défaut pour tout autre fichier', () => {
    const enTete = enTeteCachePourFichierStatique(
      '/public/assets/styles/mss.css',
      'public, max-age=86400'
    );

    expect(enTete).toEqual('public, max-age=86400');
  });
});
