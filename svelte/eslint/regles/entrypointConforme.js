import { estFichierEntrypoint } from './nomenclature.js';

export const entrypointConforme = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Un entrypoint `lib/<nom>/<nom>.ts` est un pur script de montage : il monte un composant Svelte et n’exporte rien d’autre que son app par défaut.',
    },
    schema: [],
    messages: {
      exportInterdit:
        'Un entrypoint `lib/<nom>/<nom>.ts` ne doit rien exporter (hormis son app par défaut) afin de ne pas poser problème pour la mise en cache. Déplace cet export dans un module dédié du dossier.',
      mountManquant:
        'Ce fichier suit la nomenclature entrypoint `lib/<nom>/<nom>.ts` mais ne monte aucun composant (`mount` de svelte). Renomme-le ou déplace-le s’il s’agit d’un module partagé.',
    },
  },

  create(context) {
    if (!estFichierEntrypoint(context.filename)) return {};

    let importeMount = false;

    return {
      ImportDeclaration(node) {
        const depuisSvelte = node.source.value === 'svelte';
        const importeLeMount = node.specifiers.some(
          (specifier) => specifier.imported?.name === 'mount'
        );
        if (depuisSvelte && importeLeMount) importeMount = true;
      },

      ExportNamedDeclaration(node) {
        context.report({ node, messageId: 'exportInterdit' });
      },

      ExportAllDeclaration(node) {
        context.report({ node, messageId: 'exportInterdit' });
      },

      'Program:exit'(node) {
        if (!importeMount) context.report({ node, messageId: 'mountManquant' });
      },
    };
  },
};
