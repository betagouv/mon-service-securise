/**
 * Documents de référence ANSSI liés aux mesures MSS
 *
 * Ce fichier associe chaque mesure MSS aux guides et recommandations ANSSI
 * dont les règles techniques couvrent les objectifs de la mesure.
 *
 * Source : corrélation sémantique entre les 62 mesures MSS et 841 règles
 * extraites de 17 documents de référence ANSSI, réalisée dans le cadre
 * de l'homologation du SI du SDIS 25.
 *
 * Les documents sont classés par pertinence (nombre de règles liées).
 *
 * Licence : Apache 2.0
 * Contributeur : SDIS 25 (Service Départemental d'Incendie et de Secours du Doubs)
 */
import { IdMesureV2 } from './donneesReferentielMesuresV2.js';

export type DocumentReferenceANSSI = {
  /** Code interne du document (ex: D18, D24) */
  code: string;
  /** Titre complet du guide ANSSI */
  titre: string;
  /** URL vers la publication sur cyber.gouv.fr */
  url: string;
};

export type DocumentsReferenceParMesure = Partial<
  Record<IdMesureV2, DocumentReferenceANSSI[]>
>;

/**
 * Mapping mesures MSS → documents ANSSI de référence.
 *
 * Chaque entrée liste les guides ANSSI dont les règles techniques
 * sont pertinentes pour évaluer la mesure correspondante.
 *
 * Les mesures sans entrée n'ont pas de document ANSSI directement lié
 * (mesures organisationnelles, RGPD pures, etc.).
 */
export const documentsReferenceANSSI: DocumentsReferenceParMesure = {
  // ── Gouvernance ──────────────────────────────────────────────────

  'RECENSEMENT.2': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
  ],

  'RECENSEMENT.3': [
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D38',
      titre:
        'Recommandations pour la définition d\u2019une politique de filtrage réseau',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-definition-dune-politique-de-filtrage-reseau',
    },
  ],

  'PSSI.5': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
  ],

  'CONFORMITE.1': [
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
  ],

  'ECOSYSTEME.2': [
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
  ],

  'ECOSYSTEME.6': [
    {
      code: 'D27',
      titre:
        'Recommandations de sécurité pour la journalisation',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-pour-la-journalisation',
    },
  ],

  'CONTRAT.1': [
    {
      code: 'D15',
      titre: 'Recommandations relatives à ACME',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-lacme',
    },
    {
      code: 'D25',
      titre:
        'Recommandations pour la mise en œuvre d\u2019un site web',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-mise-en-oeuvre-dun-site-web',
    },
    {
      code: 'D24',
      titre:
        'Recommandations pour la configuration d\u2019un pare-feu Stormshield',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-configuration-dun-pare-feu-stormshield',
    },
    {
      code: 'D39',
      titre: 'Recommandations de sécurité relatives au Wi-Fi',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-au-wi-fi',
    },
    {
      code: 'D22',
      titre: 'Mécanismes cryptographiques',
      url: 'https://cyber.gouv.fr/publications/mecanismes-cryptographiques',
    },
  ],

  // ── Protection ──────────────────────────────────────────────────

  'DEV.1': [
    {
      code: 'D19',
      titre:
        'Recommandations pour l\u2019interconnexion de systèmes d\u2019information',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-linterconnexion-de-systemes-dinformation',
    },
    {
      code: 'D25',
      titre:
        'Recommandations pour la mise en œuvre d\u2019un site web',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-mise-en-oeuvre-dun-site-web',
    },
    {
      code: 'D24',
      titre:
        'Recommandations pour la configuration d\u2019un pare-feu Stormshield',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-configuration-dun-pare-feu-stormshield',
    },
    {
      code: 'D39',
      titre: 'Recommandations de sécurité relatives au Wi-Fi',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-au-wi-fi',
    },
    {
      code: 'D22',
      titre: 'Mécanismes cryptographiques',
      url: 'https://cyber.gouv.fr/publications/mecanismes-cryptographiques',
    },
    {
      code: 'D38',
      titre:
        'Recommandations pour la définition d\u2019une politique de filtrage réseau',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-definition-dune-politique-de-filtrage-reseau',
    },
  ],

  'RH.4': [
    {
      code: 'D33',
      titre:
        'Recommandations de configuration d\u2019un système GNU/Linux',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-configuration-dun-systeme-gnulinux',
    },
    {
      code: 'D25',
      titre:
        'Recommandations pour la mise en œuvre d\u2019un site web',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-mise-en-oeuvre-dun-site-web',
    },
    {
      code: 'D24',
      titre:
        'Recommandations pour la configuration d\u2019un pare-feu Stormshield',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-configuration-dun-pare-feu-stormshield',
    },
    {
      code: 'D20',
      titre: 'Recommandations relatives au DNS',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-au-dns',
    },
    {
      code: 'D37',
      titre:
        'Recommandations de nettoyage d\u2019une politique de filtrage réseau',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-nettoyage-dune-politique-de-filtrage-reseau',
    },
    {
      code: 'D21',
      titre:
        'Recommandations relatives à l\u2019authentification multifacteur et aux mots de passe',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-a-lauthentification-multifacteur-et-aux-mots-de-passe',
    },
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
  ],

  'CARTO.2': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D26',
      titre: 'Recommandations relatives à OpenID Connect',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-a-openid-connect',
    },
  ],

  'MCO_MCS.1': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D26',
      titre: 'Recommandations relatives à OpenID Connect',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-a-openid-connect',
    },
    {
      code: 'D21',
      titre:
        'Recommandations relatives à l\u2019authentification multifacteur et aux mots de passe',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-a-lauthentification-multifacteur-et-aux-mots-de-passe',
    },
    {
      code: 'D39',
      titre: 'Recommandations de sécurité relatives au Wi-Fi',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-au-wi-fi',
    },
  ],

  'MALWARE.4': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D34',
      titre:
        'Recommandations relatives au cloisonnement système',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-au-cloisonnement-systeme',
    },
  ],

  'MCO_MCS.3': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D26',
      titre: 'Recommandations relatives à OpenID Connect',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-a-openid-connect',
    },
    {
      code: 'D38',
      titre:
        'Recommandations pour la définition d\u2019une politique de filtrage réseau',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-definition-dune-politique-de-filtrage-reseau',
    },
    {
      code: 'D39',
      titre: 'Recommandations de sécurité relatives au Wi-Fi',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-au-wi-fi',
    },
  ],

  'MCO_MCS.5': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D26',
      titre: 'Recommandations relatives à OpenID Connect',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-a-openid-connect',
    },
  ],

  'MCO_MCS.6': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D26',
      titre: 'Recommandations relatives à OpenID Connect',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-a-openid-connect',
    },
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
  ],

  'MCO_MCS.7': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D33',
      titre:
        'Recommandations de configuration d\u2019un système GNU/Linux',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-configuration-dun-systeme-gnulinux',
    },
    {
      code: 'D26',
      titre: 'Recommandations relatives à OpenID Connect',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-a-openid-connect',
    },
  ],

  'MCO_MCS.10': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D15',
      titre: 'Recommandations relatives à ACME',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-lacme',
    },
    {
      code: 'D33',
      titre:
        'Recommandations de configuration d\u2019un système GNU/Linux',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-configuration-dun-systeme-gnulinux',
    },
    {
      code: 'D25',
      titre:
        'Recommandations pour la mise en œuvre d\u2019un site web',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-mise-en-oeuvre-dun-site-web',
    },
    {
      code: 'D24',
      titre:
        'Recommandations pour la configuration d\u2019un pare-feu Stormshield',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-configuration-dun-pare-feu-stormshield',
    },
    {
      code: 'D20',
      titre: 'Recommandations relatives au DNS',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-au-dns',
    },
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
  ],

  'MCO_MCS.11': [
    {
      code: 'D33',
      titre:
        'Recommandations de configuration d\u2019un système GNU/Linux',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-configuration-dun-systeme-gnulinux',
    },
    {
      code: 'D34',
      titre:
        'Recommandations relatives au cloisonnement système',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-au-cloisonnement-systeme',
    },
  ],

  'MALWARE.5': [
    {
      code: 'D19',
      titre:
        'Recommandations pour l\u2019interconnexion de systèmes d\u2019information',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-linterconnexion-de-systemes-dinformation',
    },
    {
      code: 'D33',
      titre:
        'Recommandations de configuration d\u2019un système GNU/Linux',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-configuration-dun-systeme-gnulinux',
    },
    {
      code: 'D24',
      titre:
        'Recommandations pour la configuration d\u2019un pare-feu Stormshield',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-configuration-dun-pare-feu-stormshield',
    },
    {
      code: 'D20',
      titre: 'Recommandations relatives au DNS',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-au-dns',
    },
    {
      code: 'D34',
      titre:
        'Recommandations relatives au cloisonnement système',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-au-cloisonnement-systeme',
    },
    {
      code: 'D37',
      titre:
        'Recommandations de nettoyage d\u2019une politique de filtrage réseau',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-nettoyage-dune-politique-de-filtrage-reseau',
    },
    {
      code: 'D38',
      titre:
        'Recommandations pour la définition d\u2019une politique de filtrage réseau',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-definition-dune-politique-de-filtrage-reseau',
    },
  ],

  'MALWARE.6': [
    {
      code: 'D20',
      titre: 'Recommandations relatives au DNS',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-au-dns',
    },
  ],

  'MCO_MCS.14': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D33',
      titre:
        'Recommandations de configuration d\u2019un système GNU/Linux',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-configuration-dun-systeme-gnulinux',
    },
    {
      code: 'D21',
      titre:
        'Recommandations relatives à l\u2019authentification multifacteur et aux mots de passe',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-a-lauthentification-multifacteur-et-aux-mots-de-passe',
    },
  ],

  'MCO_MCS.15': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D21',
      titre:
        'Recommandations relatives à l\u2019authentification multifacteur et aux mots de passe',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-a-lauthentification-multifacteur-et-aux-mots-de-passe',
    },
  ],

  'MCO_MCS.16': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D33',
      titre:
        'Recommandations de configuration d\u2019un système GNU/Linux',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-configuration-dun-systeme-gnulinux',
    },
    {
      code: 'D25',
      titre:
        'Recommandations pour la mise en œuvre d\u2019un site web',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-mise-en-oeuvre-dun-site-web',
    },
    {
      code: 'D28',
      titre:
        'Recommandations de sécurité relatives au reconditionnement',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-au-reconditionnement',
    },
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
  ],

  'DONNEES.1': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
  ],

  'DONNEES.2': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D33',
      titre:
        'Recommandations de configuration d\u2019un système GNU/Linux',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-configuration-dun-systeme-gnulinux',
    },
    {
      code: 'D25',
      titre:
        'Recommandations pour la mise en œuvre d\u2019un site web',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-mise-en-oeuvre-dun-site-web',
    },
    {
      code: 'D28',
      titre:
        'Recommandations de sécurité relatives au reconditionnement',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-au-reconditionnement',
    },
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
  ],

  // ── Défense ─────────────────────────────────────────────────────

  'RGPD.2': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D24',
      titre:
        'Recommandations pour la configuration d\u2019un pare-feu Stormshield',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-configuration-dun-pare-feu-stormshield',
    },
    {
      code: 'D27',
      titre:
        'Recommandations de sécurité pour la journalisation',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-pour-la-journalisation',
    },
  ],

  'RGPD.3': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D24',
      titre:
        'Recommandations pour la configuration d\u2019un pare-feu Stormshield',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-configuration-dun-pare-feu-stormshield',
    },
    {
      code: 'D27',
      titre:
        'Recommandations de sécurité pour la journalisation',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-pour-la-journalisation',
    },
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
  ],

  'RGPD.4': [
    {
      code: 'D18',
      titre:
        'Recommandations de sécurité relatives à Active Directory',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-relatives-active-directory',
    },
    {
      code: 'D27',
      titre:
        'Recommandations de sécurité pour la journalisation',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-pour-la-journalisation',
    },
  ],

  'RGPD.5': [
    {
      code: 'D27',
      titre:
        'Recommandations de sécurité pour la journalisation',
      url: 'https://cyber.gouv.fr/publications/recommandations-de-securite-pour-la-journalisation',
    },
  ],

  'RGPD.6': [
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
    {
      code: 'D38',
      titre:
        'Recommandations pour la définition d\u2019une politique de filtrage réseau',
      url: 'https://cyber.gouv.fr/publications/recommandations-pour-la-definition-dune-politique-de-filtrage-reseau',
    },
  ],

  // ── Résilience ──────────────────────────────────────────────────

  'PHYS.1': [
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
  ],

  'PHYS.2': [
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
  ],

  'CLOISON.1': [
    {
      code: 'D20',
      titre: 'Recommandations relatives au DNS',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-au-dns',
    },
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
  ],

  'CLOISON.2': [
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
  ],

  'CLOISON.3': [
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
  ],

  'CLOISON.4': [
    {
      code: 'D14',
      titre: 'Recommandations relatives aux sauvegardes',
      url: 'https://cyber.gouv.fr/publications/recommandations-relatives-aux-sauvegardes',
    },
  ],
};
