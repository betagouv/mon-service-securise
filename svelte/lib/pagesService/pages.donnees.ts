import type { EtapeService } from '../menuNavigationService/menuNavigationService.d';
import TableauDesMesures from '../tableauDesMesures/TableauDesMesures.svelte';
import type { Component } from 'svelte';

/* eslint-disable @typescript-eslint/no-explicit-any */
type DonneesPage = {
  titre: string;
  sousTitre: string;
  composant: Component<any>;
};

export const metadonneesPages: Partial<Record<EtapeService, DonneesPage>> = {
  mesures: {
    titre: 'Sécuriser',
    sousTitre:
      'Mettez en œuvre, en équipe, les mesures de sécurité adaptées à votre service',
    composant: TableauDesMesures,
  },
};
