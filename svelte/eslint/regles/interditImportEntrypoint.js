import { estImportEntrypoint } from './nomenclature.js';

const estImportDeTypeSeul = (node) =>
  node.importKind === 'type' ||
  node.exportKind === 'type' ||
  (node.specifiers?.length > 0 &&
    node.specifiers.every((specifier) => specifier.importKind === 'type'));

export const interditImportEntrypoint = {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Interdit d'importer un entrypoint `lib/<nom>/<nom>.ts` : importé, il redeviendrait un module partagé à nom stable, non hashé et mal caché.",
    },
    schema: [],
    messages: {
      importEntrypoint:
        '`{{ source }}` est un entrypoint (`lib/<nom>/<nom>.ts`) : il ne doit jamais être importé. Déplace le code partagé dans un module dédié du dossier (ex. `<nom>.utils.ts`).',
    },
  },

  create(context) {
    const verifie = (node) => {
      const source = node.source?.value;
      if (typeof source !== 'string') return;
      if (!estImportEntrypoint(context.filename, source)) return;
      if (estImportDeTypeSeul(node)) return;

      context.report({
        node,
        messageId: 'importEntrypoint',
        data: { source },
      });
    };

    return {
      ImportDeclaration: verifie,
      ImportExpression: verifie,
      ExportNamedDeclaration: verifie,
      ExportAllDeclaration: verifie,
    };
  },
};
