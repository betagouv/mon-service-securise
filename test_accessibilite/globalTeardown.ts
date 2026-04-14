import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

type NoeudAxe = {
  html: string;
  failureSummary?: string;
};

type ViolationAxe = {
  id: string;
  description: string;
  help: string;
  helpUrl: string;
  impact: string;
  nodes: NoeudAxe[];
};

type EntreeViolations = {
  url: string;
  violations: ViolationAxe[];
};

type OccurrenceParPage = {
  url: string;
  noeuds: string[];
};

type ViolationAgregee = {
  id: string;
  description: string;
  help: string;
  helpUrl: string;
  impact: string;
  occurrences: OccurrenceParPage[];
};

const ORDRE_IMPACT: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

const EMOJI_IMPACT: Record<string, string> = {
  critical: '🔴',
  serious: '🟠',
  moderate: '🟡',
  minor: '🔵',
};

const LIBELLE_IMPACT: Record<string, string> = {
  critical: 'critique',
  serious: 'sérieux',
  moderate: 'modéré',
  minor: 'mineur',
};

const lireViolations = (fichier: string): EntreeViolations[] => {
  if (!existsSync(fichier)) return [];
  return readFileSync(fichier, 'utf-8')
    .split('\n')
    .filter(Boolean)
    .map((ligne) => JSON.parse(ligne) as EntreeViolations);
};

const agreger = (entrees: EntreeViolations[]): ViolationAgregee[] => {
  const parId = new Map<string, ViolationAgregee>();
  // eslint-disable-next-line no-restricted-syntax
  for (const { url, violations } of entrees) {
    // eslint-disable-next-line no-restricted-syntax
    for (const v of violations) {
      if (!parId.has(v.id)) {
        parId.set(v.id, {
          id: v.id,
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          impact: v.impact,
          occurrences: [],
        });
      }
      parId.get(v.id)!.occurrences.push({
        url,
        noeuds: v.nodes.map((n) => n.html),
      });
    }
  }
  return [...parId.values()].sort(
    (a, b) => (ORDRE_IMPACT[a.impact] ?? 99) - (ORDRE_IMPACT[b.impact] ?? 99)
  );
};

const genererMarkdown = (
  violations: ViolationAgregee[],
  date: string
): string => {
  const compteParImpact = violations.reduce<Record<string, number>>(
    (acc, v) => {
      // eslint-disable-next-line no-param-reassign
      acc[v.impact] = (acc[v.impact] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const lignesSommaire = Object.entries(ORDRE_IMPACT)
    .filter(([impact]) => compteParImpact[impact])
    .map(([impact]) => {
      const emoji = EMOJI_IMPACT[impact] ?? '';
      const libelle = LIBELLE_IMPACT[impact] ?? impact;
      return `| ${emoji} ${libelle} | ${compteParImpact[impact]} |`;
    });

  const sommaire =
    lignesSommaire.length > 0
      ? `| Impact | Nombre |\n|--------|--------|\n${lignesSommaire.join('\n')}`
      : 'Aucune violation. ✅';

  const sections = violations
    .map((v) => {
      const emoji = EMOJI_IMPACT[v.impact] ?? '';
      const pages = v.occurrences
        .map(({ url, noeuds }) => {
          const snippets = noeuds
            .map((n) => `  \`\`\`html\n  ${n}\n  \`\`\``)
            .join('\n');
          return `- \`${url}\`\n${snippets}`;
        })
        .join('\n');

      return `### ${emoji} \`${v.id}\` — ${v.help}

> ${v.description}

[Documentation](${v.helpUrl})

**Pages concernées (${v.occurrences.length}) :**

${pages}`;
    })
    .join('\n\n---\n\n');

  const messageVide =
    violations.length === 0 ? '\nAucune violation détectée. ✅\n' : '';

  return `# Rapport d'accessibilité — MonServiceSécurisé

Généré le ${date}

## Résumé

${sommaire}
${messageVide}
${
  violations.length > 0
    ? `## Violations

${sections}`
    : ''
}`;
};

export default async () => {
  const fichierViolations = 'test_accessibilite/rapport/violations.jsonl';
  const dossier = 'test_accessibilite/rapport';
  const fichierRapport = `${dossier}/rapport-accessibilite.md`;

  const entrees = lireViolations(fichierViolations);
  const violations = agreger(entrees);
  const date = new Date().toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  mkdirSync(dossier, { recursive: true });
  writeFileSync(fichierRapport, genererMarkdown(violations, date));
};
