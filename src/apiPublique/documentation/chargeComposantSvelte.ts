import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';
import type { Component } from 'svelte';

// Le module compilé est importé depuis une URL `data:`, qui n'a pas d'emplacement
// sur le disque : ses imports doivent donc être résolus en URLs absolues au préalable.
const avecImportsResolus = (code: string, urlFichier: URL) =>
  code.replace(/from '([^']+)'/g, (_, specificateur: string) => {
    const urlAbsolue = specificateur.startsWith('.')
      ? new URL(specificateur, urlFichier).href
      : import.meta.resolve(specificateur);
    return `from '${urlAbsolue}'`;
  });

const enUrlData = (code: string) =>
  `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;

export const chargeComposantSvelte = async (
  urlFichier: URL
): Promise<Component> => {
  const source = await readFile(urlFichier, 'utf8');
  const { js } = compile(source, {
    filename: fileURLToPath(urlFichier),
    generate: 'server',
    css: 'injected',
  });

  const module = await import(
    enUrlData(avecImportsResolus(js.code, urlFichier))
  );
  return module.default;
};
