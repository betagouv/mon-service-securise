import { pathToFileURL } from 'node:url';
import { render } from 'svelte/server';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { chargeComposantSvelte } from './chargeComposantSvelte.js';
import { construisModeleDocumentation } from './modeleDocumentation.js';

const UI_KIT_VERSION = '1.60.9';

export const SOURCES_EXTERNES = {
  uiKit: `https://lab-anssi-ui-kit-prod-s3-assets.cellar-c2.services.clever-cloud.com/${UI_KIT_VERSION}/`,
  uiKitAssets:
    'https://lab-anssi-ui-kit-prod-s3-assets.cellar-c2.services.clever-cloud.com/',
};

export const SCRIPT_UI_KIT = `${SOURCES_EXTERNES.uiKit}lab-anssi-ui-kit.iife.js`;
const styles = (urlBaseMss: string) => [
  `${SOURCES_EXTERNES.uiKit}dsfr-variables.css`,
  `${SOURCES_EXTERNES.uiKit}lab-anssi-theme.mss.css`,
  `${urlBaseMss}/statique/assets/styles/fonts.css`,
];

// Le composant est lu depuis les sources, à partir de la racine du projet,
// comme les vues Pug : `tsc` ne copie pas les fichiers `.svelte` dans `dist/`.
const Documentation = await chargeComposantSvelte(
  pathToFileURL('src/apiPublique/documentation/Documentation.svelte')
);

const echappeHtml = (texte: string) =>
  texte.replace(
    /[&<>"']/g,
    (caractere) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[caractere] ?? caractere
  );

export const pageDocumentation = (
  document: OpenAPIObject,
  { urlBaseMss }: { urlBaseMss: string }
) => {
  const modele = construisModeleDocumentation(document);
  const { head, body } = render(Documentation, {
    props: { modele, urlBaseMss },
  });

  return `<!doctype html>
<html lang="fr" data-fr-scheme="light">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${echappeHtml(modele.titre)}</title>
    <link rel="icon" href="${urlBaseMss}/statique/assets/images/favicons/favicon.ico">
${styles(urlBaseMss)
  .map((style) => `    <link rel="stylesheet" href="${style}">`)
  .join('\n')}
    <script src="${SCRIPT_UI_KIT}" defer></script>
    ${head}
  </head>
  <body data-themeable="true">
    ${body}
  </body>
</html>
`;
};
