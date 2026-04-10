import type { AxeResults, Result } from 'axe-core';

export const messageDErreur = (problemes: Result[]) =>
  `${JSON.stringify(
    problemes.map(({ id, description, nodes }) => ({
      id,
      description,
      nodes: nodes.map((n) => n.html),
    })),
    null,
    2
  )}\n n'est pas vide.`;

export const problemesSerieux = (resultats: AxeResults) =>
  resultats.violations.filter((v) => v.impact === 'serious');
