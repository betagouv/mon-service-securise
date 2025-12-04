import ConstructeurEvenementCompletudeServiceModifiee from './constructeurEvenementCompletudeServiceModifiee.js';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';
import {
  unService,
  unServiceV2,
} from '../../constructeurs/constructeurService.js';
import Mesures from '../../../src/modeles/mesures.js';
import uneDescriptionValide from '../../constructeurs/constructeurDescriptionService.js';
import { creeReferentielVide } from '../../../src/referentiel.js';

describe('Un événement de complétude modifiée', () => {
  const unEvenement = () =>
    new ConstructeurEvenementCompletudeServiceModifiee();

  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur?.toUpperCase(),
  };

  describe('qui traite un service v1', () => {
    it("chiffre l'identifiant du service qui lui est donné", () => {
      const evenement = unEvenement()
        .avecIdService('abc')
        .quiChiffreAvec(hacheEnMajuscules)
        .construis()
        .toJSON();

      expect(evenement.donnees.idService).toBe('ABC');
    });

    it('complète avec le niveau de sécurité minimal', () => {
      const referentiel = creeReferentielVide();
      const service = unService()
        .avecDescription(uneDescriptionValide(referentiel).deNiveau2().donnees)
        .construis();

      const evenement = unEvenement().avecService(service).construis().toJSON();

      expect(evenement.donnees.niveauSecuriteMinimal).toBe('niveau2');
    });

    it("sait se convertir en JSON sans dévoiler le SIRET de l'organisation responsable", () => {
      const referentiel = creeReferentielVide();
      referentiel.recharge({
        categoriesMesures: { gouvernance: 'Gouvernance' },
        indiceCyber: { noteMax: 5 },
        prioritesMesures: { p1: {} },
        mesures: { mesureA: {} },
        statutsMesures: { fait: 'Faite', enCours: 'Partielle' },
      });
      const mesuresPersonnalises = {
        mesureA: { categorie: 'gouvernance' },
      };
      const mesures = new Mesures(
        {
          mesuresGenerales: [
            {
              id: 'mesureA',
              statut: 'fait',
              priorite: 'p1',
              echeance: '2024-09-13',
            },
          ],
        },
        referentiel,
        mesuresPersonnalises
      );
      const service = unService(referentiel)
        .avecId('ABC')
        .avecMesures(mesures)
        .avecDescription({
          delaiAvantImpactCritique: 'uneHeure',
          localisationDonnees: 'uneLocalisation',
          donneesCaracterePersonnel: ['donnee A', 'donnee B'],
          donneesSensiblesSpecifiques: ['donneeSensible A'],
          fonctionnalites: ['reseauSocial'],
          fonctionnalitesSpecifiques: ['feature A', 'feature B'],
          provenanceService: 'developpement',
          statutDeploiement: 'unStatutDeploiement',
          typeService: ['applicationMobile'],
          nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
          pointsAcces: ['point A', 'point B'],
          organisationResponsable: { siret: '12345' },
          niveauSecurite: 'niveau3',
        })
        .construis();
      const detailsOrganisationResponsable = {
        estServicePublic: false,
        estFiness: false,
        estEss: true,
        estEntrepreneurIndividuel: false,
        estAssociation: false,
        categorieEntreprise: null,
        activitePrincipale: '68.20B',
        trancheEffectifSalarie: null,
        natureJuridique: '6540',
        sectionActivitePrincipale: 'L',
        anneeTrancheEffectifSalarie: null,
        commune: '33376',
        departement: '33',
      };

      const evenement = unEvenement()
        .avecService(service)
        .deLOrganisation(detailsOrganisationResponsable)
        .quiChiffreAvec(hacheEnMajuscules)
        .quiAEuLieuLe('08/03/2024')
        .construis();

      expect(evenement.toJSON()).toEqual({
        type: 'COMPLETUDE_SERVICE_MODIFIEE',
        donnees: {
          idService: 'ABC',
          nombreTotalMesures: 1,
          nombreMesuresCompletes: 1,
          detailMesures: [
            {
              idMesure: 'mesureA',
              statut: 'fait',
              priorite: 'p1',
              echeance: '2024-09-13',
              nbResponsables: 0,
            },
          ],
          detailIndiceCyber: [
            { categorie: 'total', indice: 5 },
            { categorie: 'gouvernance', indice: 5 },
          ],
          versionIndiceCyber: 'v2',
          nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
          typeService: ['applicationMobile'],
          provenanceService: 'developpement',
          statutDeploiement: 'unStatutDeploiement',
          pointsAcces: 2,
          fonctionnalites: ['reseauSocial'],
          fonctionnalitesSpecifiques: 2,
          donneesCaracterePersonnel: ['donnee A', 'donnee B'],
          donneesSensiblesSpecifiques: 1,
          localisationDonnees: 'uneLocalisation',
          delaiAvantImpactCritique: 'uneHeure',
          niveauSecurite: 'niveau3',
          niveauSecuriteMinimal: 'niveau2',
        },
        date: '08/03/2024',
      });
    });

    it("range les données de l'indice cyber par catégorie", () => {
      const referentiel = creeReferentielVide();
      referentiel.recharge({
        mesures: { mesureA: {} },
        categoriesMesures: { gouvernance: 'Gouvernance' },
        statutsMesures: { fait: 'Faite', enCours: 'Partielle' },
        indiceCyber: { noteMax: 5 },
      });
      const mesuresPersonnalises = { mesureA: { categorie: 'gouvernance' } };
      const mesures = new Mesures(
        { mesuresGenerales: [{ id: 'mesureA', statut: 'fait' }] },
        referentiel,
        mesuresPersonnalises
      );
      const service = unService(referentiel).avecMesures(mesures).construis();
      const evenement = unEvenement().avecService(service).construis().toJSON();

      expect(evenement.donnees.detailIndiceCyber).toEqual([
        { categorie: 'total', indice: 5 },
        { categorie: 'gouvernance', indice: 5 },
      ]);
    });

    it("utilise des bornes à « 1 » pour les services dont le nombre d'organisations utilisatrices est à « 0 »", () => {
      const evenement = unEvenement()
        .avecNombreOrganisationsUtilisatricesInconnu()
        .construis()
        .toJSON();

      expect(evenement.donnees.nombreOrganisationsUtilisatrices).toEqual({
        borneBasse: 1,
        borneHaute: 1,
      });
    });

    it('exige que le service soit renseigné', () => {
      expect(() => {
        unEvenement().sans('service').construis();
      }).toThrowError(ErreurDonneeManquante);
    });
  });

  describe('qui traite un service v2', () => {
    it('lève une exception sur la conversion en JSON', () => {
      const serviceV2 = unServiceV2().construis();
      expect(() =>
        unEvenement().avecService(serviceV2).construis().toJSON()
      ).toThrowError();
    });
  });
});
