import { type Autorisation } from './autorisation.js';

export const Permissions = {
  ECRITURE: 2,
  LECTURE: 1,
  INVISIBLE: 0,
};

export const Rubriques = {
  DECRIRE: 'DECRIRE',
  SECURISER: 'SECURISER',
  HOMOLOGUER: 'HOMOLOGUER',
  RISQUES: 'RISQUES',
  CONTACTS: 'CONTACTS',
} as const;

const { LECTURE } = Permissions;
const { CONTACTS, SECURISER, RISQUES, HOMOLOGUER, DECRIRE } = Rubriques;

export type Rubrique = keyof typeof Rubriques;
export type NiveauPermission = (typeof Permissions)[keyof typeof Permissions];
export type Droits = Record<Rubrique, NiveauPermission>;
export type DroitsAvecEstProprietaire = Droits & { estProprietaire?: boolean };

type ConfigurationDroitsRoute = {
  rubrique: Rubrique;
  route: string;
  niveau: NiveauPermission;
};

export const premiereRouteDisponible = (
  autorisation: Autorisation,
  routesPersonnalisees: ConfigurationDroitsRoute[] = []
) => {
  const routesParDefaut: ConfigurationDroitsRoute[] = [
    { rubrique: DECRIRE, route: '/descriptionService', niveau: LECTURE },
    { rubrique: SECURISER, route: '/mesures', niveau: LECTURE },
    { rubrique: HOMOLOGUER, route: '/dossiers', niveau: LECTURE },
    { rubrique: RISQUES, route: '/risques', niveau: LECTURE },
    { rubrique: CONTACTS, route: '/rolesResponsabilites', niveau: LECTURE },
  ];

  return [...routesPersonnalisees, ...routesParDefaut].find(
    ({ niveau, rubrique }) => autorisation.aLaPermission(niveau, rubrique)
  )?.route;
};

export const tousDroitsEnEcriture = (): Droits =>
  Object.values(Rubriques).reduce(
    (droits, rubrique) => ({ ...droits, [rubrique]: Permissions.ECRITURE }),
    {} as Droits
  );

export const verifieCoherenceDesDroits = (
  droits: DroitsAvecEstProprietaire
) => {
  if (droits.estProprietaire) return true;

  return Object.entries(droits).every(([rubrique, niveau]) => {
    const rubriqueExiste = Object.values(Rubriques).includes(
      rubrique as Rubrique
    );
    const niveauExiste = Object.values(Permissions).includes(
      niveau as NiveauPermission
    );
    return rubriqueExiste && niveauExiste;
  });
};
