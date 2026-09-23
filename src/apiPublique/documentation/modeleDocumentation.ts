import type {
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  ReferenceObject,
  ResponseObject,
  SchemaObject,
  SchemaObjectType,
  SecuritySchemeObject,
} from 'openapi3-ts/oas31';

type SchemaOuReference = SchemaObject | ReferenceObject;

export type LigneChamp = {
  nom: string;
  type: string;
  requis: string;
  description: string;
};

export type LigneParametre = LigneChamp & { emplacement: string };

export type Reponse = {
  statut: string;
  description: string;
  lignes: LigneChamp[];
  exemple?: string;
};

export type Operation = {
  id: string;
  methode: string;
  chemin: string;
  resume: string;
  description?: string;
  parametres: LigneParametre[];
  reponses: Reponse[];
};

export type Groupe = { id: string; nom: string; operations: Operation[] };

export type SchemaDocumente = {
  id: string;
  nom: string;
  lignes: LigneChamp[];
  exemple?: string;
};

export type Authentification = {
  nom: string;
  type: string;
  description: string;
};

export type ModeleDocumentation = {
  titre: string;
  version: string;
  description?: string;
  serveurs: string[];
  authentifications: Authentification[];
  groupes: Groupe[];
  schemas: SchemaDocumente[];
};

const METHODES = ['get', 'post', 'put', 'patch', 'delete'] as const;
const PROFONDEUR_MAX = 4;
const GROUPE_SANS_TAG = 'Autres';

const enSlug = (texte: string) =>
  texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const estReference = (objet: object): objet is ReferenceObject =>
  '$ref' in objet && typeof objet.$ref === 'string';

const nomDeReference = (reference: ReferenceObject) =>
  reference.$ref.split('/').pop() ?? '';

const typesDe = (schema: SchemaObject): SchemaObjectType[] => {
  if (Array.isArray(schema.type)) return schema.type;
  return schema.type ? [schema.type] : [];
};

const sansNull = (schema: SchemaObject): SchemaOuReference => {
  const variantes = schema.anyOf ?? schema.oneOf;
  if (!variantes) return schema;
  const nonNulles = variantes.filter(
    (variante) => estReference(variante) || variante.type !== 'null'
  );
  return nonNulles.length === 1 ? nonNulles[0] : schema;
};

const contraintesDe = (schema: SchemaObject): string[] => {
  const contraintes: string[] = [];
  const { minLength, maxLength, minimum, maximum, pattern } = schema;
  if (minLength !== undefined && minLength === maxLength)
    contraintes.push(`${minLength} caractères`);
  else {
    if (minLength !== undefined) contraintes.push(`min. ${minLength} car.`);
    if (maxLength !== undefined) contraintes.push(`max. ${maxLength} car.`);
  }
  if (minimum !== undefined) contraintes.push(`≥ ${minimum}`);
  if (maximum !== undefined) contraintes.push(`≤ ${maximum}`);
  if (pattern) contraintes.push(`motif ${pattern}`);
  if (schema.default !== undefined)
    contraintes.push(`défaut : ${JSON.stringify(schema.default)}`);
  return contraintes;
};

const avecContraintes = (
  description: string | undefined,
  schema: SchemaOuReference
) =>
  [description, ...(estReference(schema) ? [] : contraintesDe(schema))]
    .filter(Boolean)
    .join(' · ');

const exempleParDefautDeChaine = (format?: string) => {
  switch (format) {
    case 'email':
      return 'utilisateur@example.com';
    case 'date-time':
      return '2026-01-01T12:00:00Z';
    case 'date':
      return '2026-01-01';
    case 'uuid':
      return '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    default:
      return 'texte';
  }
};

const construisLecteurDeSchemas = (
  composants: Record<string, SchemaOuReference>
) => {
  const resous = (schema: SchemaOuReference): SchemaObject => {
    if (!estReference(schema)) return schema;
    const cible = composants[nomDeReference(schema)] ?? {};
    return estReference(cible) ? {} : cible;
  };

  const libelleDeType = (schema: SchemaOuReference): string => {
    if (estReference(schema)) return nomDeReference(schema);
    if (schema.enum)
      return schema.enum.map((valeur) => JSON.stringify(valeur)).join(' | ');
    if (schema.const !== undefined) return JSON.stringify(schema.const);
    if (schema.anyOf || schema.oneOf)
      return (schema.anyOf ?? schema.oneOf ?? [])
        .map(libelleDeType)
        .join(' | ');
    if (schema.allOf) return schema.allOf.map(libelleDeType).join(' & ');

    const libelle = typesDe(schema)
      .map((type) => {
        if (type === 'array')
          return `${schema.items ? libelleDeType(schema.items) : 'unknown'}[]`;
        if (type === 'string' && schema.format)
          return `string (${schema.format})`;
        return type;
      })
      .join(' | ');
    return libelle || 'unknown';
  };

  const decris = (schema: SchemaOuReference) =>
    avecContraintes(schema.description ?? resous(schema).description, schema);

  const aplatis = (
    schema: SchemaOuReference,
    prefixe = '',
    profondeur = 0,
    referencesVues = new Set<string>()
  ): LigneChamp[] => {
    if (profondeur > PROFONDEUR_MAX) return [];
    const nom = estReference(schema) ? nomDeReference(schema) : undefined;
    if (nom && referencesVues.has(nom)) return [];
    const referencesSuivies = nom
      ? new Set(referencesVues).add(nom)
      : referencesVues;
    const resolu = resous(estReference(schema) ? schema : sansNull(schema));

    if (resolu.type === 'array' && resolu.items)
      return aplatis(
        resolu.items,
        `${prefixe}[]`,
        profondeur + 1,
        referencesSuivies
      );
    if (!resolu.properties) return [];

    const requis = new Set(resolu.required ?? []);
    return Object.entries(resolu.properties).flatMap(([cle, propriete]) => {
      const nomComplet = prefixe ? `${prefixe}.${cle}` : cle;
      const ligne: LigneChamp = {
        nom: nomComplet,
        type: libelleDeType(propriete),
        requis: requis.has(cle) ? 'Oui' : 'Non',
        description: decris(propriete),
      };
      return [
        ligne,
        ...aplatis(propriete, nomComplet, profondeur + 1, referencesSuivies),
      ];
    });
  };

  const exempleDe = (
    schema: SchemaOuReference,
    profondeur = 0,
    referencesVues = new Set<string>()
  ): unknown => {
    if (profondeur > PROFONDEUR_MAX) return null;
    if (estReference(schema)) {
      const nom = nomDeReference(schema);
      if (referencesVues.has(nom)) return {};
      return exempleDe(
        composants[nom] ?? {},
        profondeur,
        new Set(referencesVues).add(nom)
      );
    }
    if (schema.example !== undefined) return schema.example;
    if (schema.examples?.length) return schema.examples[0];
    if (schema.default !== undefined) return schema.default;
    if (schema.enum) return schema.enum[0];
    if (schema.const !== undefined) return schema.const;
    if (schema.anyOf || schema.oneOf)
      return exempleDe(sansNull(schema), profondeur + 1, referencesVues);
    if (schema.allOf)
      return Object.assign(
        {},
        ...schema.allOf.map((partie) =>
          exempleDe(partie, profondeur + 1, referencesVues)
        )
      );

    const type = typesDe(schema).find((t) => t !== 'null');
    switch (type) {
      case 'object':
        return Object.fromEntries(
          Object.entries(schema.properties ?? {}).map(([cle, propriete]) => [
            cle,
            exempleDe(propriete, profondeur + 1, referencesVues),
          ])
        );
      case 'array':
        return schema.items
          ? [exempleDe(schema.items, profondeur + 1, referencesVues)]
          : [];
      case 'string':
        return exempleParDefautDeChaine(schema.format);
      case 'integer':
      case 'number':
        return schema.minimum ?? 0;
      case 'boolean':
        return true;
      default:
        return null;
    }
  };

  const exempleJson = (schema?: SchemaOuReference) =>
    schema ? JSON.stringify(exempleDe(schema), null, 2) : undefined;

  return { libelleDeType, aplatis, exempleJson };
};

const decrisAuthentification = (
  nom: string,
  schema: SecuritySchemeObject
): Authentification => ({
  nom,
  type: schema.type === 'http' ? `HTTP ${schema.scheme}` : schema.type,
  description: schema.description ?? '',
});

const construisAuthentifications = (
  document: OpenAPIObject
): Authentification[] =>
  Object.entries(document.components?.securitySchemes ?? {}).flatMap(
    ([nom, schema]) =>
      estReference(schema) ? [] : [decrisAuthentification(nom, schema)]
  );

export const construisModeleDocumentation = (
  document: OpenAPIObject
): ModeleDocumentation => {
  const composants = document.components?.schemas ?? {};
  const lecteur = construisLecteurDeSchemas(composants);

  const resousParametre = (
    parametre: ParameterObject | ReferenceObject
  ): ParameterObject | undefined => {
    if (!estReference(parametre)) return parametre;
    const cible = document.components?.parameters?.[nomDeReference(parametre)];
    return cible && !estReference(cible) ? cible : undefined;
  };

  const construisParametres = (
    parametres: (ParameterObject | ReferenceObject)[]
  ): LigneParametre[] =>
    parametres
      .map(resousParametre)
      .filter((parametre) => parametre !== undefined)
      .map((parametre) => ({
        nom: parametre.name,
        emplacement: parametre.in,
        type: lecteur.libelleDeType(parametre.schema ?? {}),
        requis: parametre.required ? 'Oui' : 'Non',
        description: avecContraintes(
          parametre.description,
          parametre.schema ?? {}
        ),
      }));

  const resousReponse = (
    reponse: ResponseObject | ReferenceObject
  ): ResponseObject | undefined => {
    if (!estReference(reponse)) return reponse;
    const cible = document.components?.responses?.[nomDeReference(reponse)];
    return cible && !estReference(cible) ? cible : undefined;
  };

  const construisReponses = (
    reponses: Record<string, ResponseObject | ReferenceObject>
  ): Reponse[] =>
    Object.entries(reponses).flatMap(([statut, reponseOuReference]) => {
      const reponse = resousReponse(reponseOuReference);
      if (!reponse) return [];
      const schema = reponse.content?.['application/json']?.schema;
      return [
        {
          statut,
          description: reponse.description,
          lignes: schema ? lecteur.aplatis(schema) : [],
          exemple: lecteur.exempleJson(schema),
        },
      ];
    });

  const construisOperation = (
    methode: (typeof METHODES)[number],
    chemin: string,
    element: PathItemObject,
    operation: OperationObject
  ): Operation => ({
    id: `operation-${enSlug(`${methode} ${chemin}`)}`,
    methode: methode.toUpperCase(),
    chemin,
    resume: operation.summary ?? `${methode.toUpperCase()} ${chemin}`,
    description: operation.description,
    parametres: construisParametres([
      ...(element.parameters ?? []),
      ...(operation.parameters ?? []),
    ]),
    reponses: construisReponses(operation.responses ?? {}),
  });

  const operationsParGroupe = new Map<string, Operation[]>();
  Object.entries<PathItemObject>(document.paths ?? {}).forEach(
    ([chemin, element]) => {
      METHODES.forEach((methode) => {
        const operation = element[methode];
        if (!operation) return;

        const vue = construisOperation(methode, chemin, element, operation);
        const tags = operation.tags?.length
          ? operation.tags
          : [GROUPE_SANS_TAG];
        tags.forEach((tag) =>
          operationsParGroupe.set(tag, [
            ...(operationsParGroupe.get(tag) ?? []),
            vue,
          ])
        );
      });
    }
  );

  const groupes = [...operationsParGroupe].map(([nom, operations]) => ({
    id: `groupe-${enSlug(nom)}`,
    nom,
    operations,
  }));

  const schemas = Object.keys(composants).map((nom) => {
    const reference = { $ref: `#/components/schemas/${nom}` };
    return {
      id: `schema-${enSlug(nom)}`,
      nom,
      lignes: lecteur.aplatis(reference),
      exemple: lecteur.exempleJson(reference),
    };
  });

  return {
    titre: document.info.title,
    version: document.info.version,
    description: document.info.description,
    serveurs: (document.servers ?? []).map((serveur) => serveur.url),
    authentifications: construisAuthentifications(document),
    groupes,
    schemas,
  };
};
