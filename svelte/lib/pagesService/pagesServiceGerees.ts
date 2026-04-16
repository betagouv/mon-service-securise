import type { EtapeService } from '../menuNavigationService/menuNavigationService.d';

const enEtape = <T extends EtapeService>(arr: readonly T[]) => arr;

export const pagesServiceGerees = enEtape([
  'mesures',
  'descriptionService',
  'risques',
  'rolesResponsabilites',
] as const);

export type PageServiceGeree = (typeof pagesServiceGerees)[number];
