import TableauDesMesures from '../tableauDesMesures/TableauDesMesures.svelte';
import type { Component } from 'svelte';
import DecrireV2 from '../decrireV2/DecrireV2.svelte';
import Risques from '../risques/Risques.svelte';
import { type PageServiceGeree } from './pagesServiceGerees';
import ContactsUtiles from './pages/contactsUtiles/ContactsUtiles.svelte';
import IndiceCyber from './pages/indiceCyber/IndiceCyber.svelte';
import Homologuer from './pages/homologuer/Homologuer.svelte';

/* eslint-disable @typescript-eslint/no-explicit-any */
type DonneesPage = {
  titre: string;
  sousTitre: string;
  composant: Component<any>;
};

export const metadonneesPages: Record<PageServiceGeree, DonneesPage> = {
  mesures: {
    titre: 'Sécuriser',
    sousTitre:
      "Réalisez les mesures de securité, évaluez vos risques et suivez la progression de l'indice cyber",
    composant: TableauDesMesures,
  },
  indiceCyber: {
    titre: 'Sécuriser',
    sousTitre:
      "Réalisez les mesures de securité, évaluez vos risques et suivez la progression de l'indice cyber",
    composant: IndiceCyber,
  },
  risques: {
    titre: 'Sécuriser',
    sousTitre:
      "Réalisez les mesures de securité, évaluez vos risques et suivez la progression de l'indice cyber",
    composant: Risques,
  },
  descriptionService: {
    titre: 'Récapitulatif',
    sousTitre:
      'Cette page présente les informations clés du service. Toute modification de certaines données peut entraîner une réévaluation automatique des besoins de sécurité et modifier les mesures de protection nécessaires.',
    composant: DecrireV2,
  },
  rolesResponsabilites: {
    titre: 'Contacts utiles',
    sousTitre:
      'Enregistrez les coordonnées des personnes importantes pour le service',
    composant: ContactsUtiles,
  },
  dossiers: {
    titre: 'Homologuer',
    sousTitre:
      "Générer un dossier et un projet de décision d'homologation pour se mettre en conformité avec la réglementation",
    composant: Homologuer,
  },
};
