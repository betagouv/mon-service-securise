import type { EtapeService } from '../menuNavigationService/menuNavigationService.d';
import TableauDesMesures from '../tableauDesMesures/TableauDesMesures.svelte';
import type { Component } from 'svelte';
import DecrireV2 from '../decrireV2/DecrireV2.svelte';
import Risques from '../risques/Risques.svelte';

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
  descriptionService: {
    titre: 'Récapitulatif',
    sousTitre:
      'Cette page présente les informations clés du service. Toute modification de certaines données peut entraîner une réévaluation automatique des besoins de sécurité et modifier les mesures de protection nécessaires.',
    composant: DecrireV2,
  },
  risques: {
    titre: 'Risques de sécurité',
    sousTitre:
      'Réalisez une première analyse de risque grâce aux risques courants suggérés par l’ANSSI et/ou recensez les risques identifiés dans le cadre d’une analyse de risque plus approfondie.',
    composant: Risques,
  },
};
