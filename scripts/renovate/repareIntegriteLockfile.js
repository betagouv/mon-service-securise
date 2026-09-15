/* eslint-disable no-console */
// Renovate régénère parfois pnpm-lock.yaml pour des dépendances déclarées par
// URL de tarball (ex. xlsx depuis cdn.sheetjs.com, absente du registre npm)
// sans recalculer leur `integrity`. Ce script recalcule et réinjecte le
// checksum manquant après chaque mise à jour de lockfile par Renovate
// (voir postUpgradeTasks dans .github/renovate.json).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const cheminPackageJson = new URL('../../package.json', import.meta.url);
const cheminLockfile = new URL('../../pnpm-lock.yaml', import.meta.url);

const motifResolutionSansIntegrite = (url) => {
  const urlEchappee = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`resolution: \\{tarball: ${urlEchappee}\\}`);
};

const packageJson = JSON.parse(readFileSync(cheminPackageJson, 'utf8'));
const toutesLesDependances = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

const contenuLockfileInitial = readFileSync(cheminLockfile, 'utf8');

const urlsATarballSansIntegrite = Object.values(toutesLesDependances)
  .filter((version) => /^https?:\/\//.test(version))
  .filter((url) =>
    motifResolutionSansIntegrite(url).test(contenuLockfileInitial)
  );

if (urlsATarballSansIntegrite.length === 0) {
  process.exit(0);
}

const reparations = await Promise.all(
  urlsATarballSansIntegrite.map(async (url) => {
    console.log(`Checksum manquant pour ${url}, recalcul en cours…`);
    const reponse = await fetch(url);
    if (!reponse.ok) {
      throw new Error(
        `Impossible de télécharger ${url} (HTTP ${reponse.status})`
      );
    }
    const tarball = Buffer.from(await reponse.arrayBuffer());
    const integrite = `sha512-${createHash('sha512').update(tarball).digest('base64')}`;
    return { url, integrite };
  })
);

const contenuLockfileRepare = reparations.reduce(
  (contenu, { url, integrite }) => {
    console.log(`Checksum rétabli pour ${url}.`);
    return contenu.replace(
      motifResolutionSansIntegrite(url),
      `resolution: {integrity: ${integrite}, tarball: ${url}}`
    );
  },
  contenuLockfileInitial
);

writeFileSync(cheminLockfile, contenuLockfileRepare);
