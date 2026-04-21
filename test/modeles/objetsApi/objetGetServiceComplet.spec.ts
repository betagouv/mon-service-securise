import { unServiceV2 } from '../../constructeurs/constructeurService.js';
import { ObjetGetServiceComplet } from '../../../src/modeles/objetsApi/objetGetServiceComplet.ts';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import {
  Permissions,
  Rubriques,
  tousDroitsEnEcriture,
} from '../../../src/modeles/autorisations/gestionDroits.ts';
import { creeReferentielV2 } from '../../../src/referentielV2.ts';

describe("Sur demande de la représentation API complète d'un service", () => {
  const autorisationProprietaire = uneAutorisation()
    .deProprietaire('U1', 'S1')
    .construis();
  const referentiel = creeReferentielV2();

  describe('concernant la description du service', () => {
    it('retourne la représentation JSON de la description', () => {
      const serviceV2 = unServiceV2().avecNomService('Mon service').construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisationProprietaire,
        referentiel
      ).donnees();

      expect(donnees.descriptionService!.nomService).toBe('Mon service');
    });

    it('ne retourne pas la représentation de la description si les droits sont insuffisants', () => {
      const serviceV2 = unServiceV2().avecNomService('Mon service').construis();
      const autorisation = uneAutorisation()
        .avecDroits({
          ...tousDroitsEnEcriture(),
          [Rubriques.DECRIRE]: Permissions.INVISIBLE,
        })
        .construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisation,
        referentiel
      ).donnees();

      expect(donnees.descriptionService).toBeUndefined();
    });
  });

  describe('concernant la liste des mesures du service', () => {
    it('retourne la représentation JSON des mesures', () => {
      const serviceV2 = unServiceV2().construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisationProprietaire,
        referentiel
      ).donnees();

      expect(donnees.mesures!.mesuresGenerales).toBeDefined();
      expect(donnees.mesures!.mesuresSpecifiques).toBeDefined();
    });

    it('ne retourne pas la représentation des mesures si les droits sont insuffisants', () => {
      const serviceV2 = unServiceV2().avecNomService('Mon service').construis();
      const autorisation = uneAutorisation()
        .avecDroits({
          ...tousDroitsEnEcriture(),
          [Rubriques.SECURISER]: Permissions.INVISIBLE,
        })
        .construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisation,
        referentiel
      ).donnees();

      expect(donnees.mesures).toBeUndefined();
    });
  });

  describe('concernant les risques V1 du service', () => {
    it('retourne la représentation JSON des risques', () => {
      const serviceV2 = unServiceV2().construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisationProprietaire,
        referentiel
      ).donnees();

      expect(donnees.risques!.risquesGeneraux).toHaveLength(7);
      expect(donnees.risques!.risquesGeneraux[0].id).toBe(
        'indisponibiliteService'
      );
      expect(donnees.risques!.risquesSpecifiques).toEqual([]);
    });

    it('ne retourne pas la représentation des risques si les droits sont insuffisants', () => {
      const serviceV2 = unServiceV2().construis();
      const autorisation = uneAutorisation()
        .avecDroits({
          ...tousDroitsEnEcriture(),
          [Rubriques.RISQUES]: Permissions.INVISIBLE,
        })
        .construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisation,
        referentiel
      ).donnees();

      expect(donnees.risques).toBeUndefined();
    });
  });

  describe('concernant les contacts utiles du service', () => {
    it('retourne la représentation JSON des contacts utiles', () => {
      const serviceV2 = unServiceV2().construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisationProprietaire,
        referentiel
      ).donnees();

      expect(donnees.contactsUtiles).toBeDefined();
    });

    it('ne retourne pas la représentation des contacts utiles si les droits sont insuffisants', () => {
      const serviceV2 = unServiceV2().construis();
      const autorisation = uneAutorisation()
        .avecDroits({
          ...tousDroitsEnEcriture(),
          [Rubriques.CONTACTS]: Permissions.INVISIBLE,
        })
        .construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisation,
        referentiel
      ).donnees();

      expect(donnees.contactsUtiles).toBeUndefined();
    });
  });

  describe("concernant les données d'indice cyber", () => {
    it('retourne la représentation JSON des indices cyber', () => {
      const serviceV2 = unServiceV2().construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisationProprietaire,
        referentiel
      ).donnees();

      expect(donnees.indicesCyber).toBeDefined();
      expect(donnees.indicesCyber).toEqual({
        indiceCyberAnssi: {
          total: 0,
          gouvernance: 0,
          protection: 0,
          resilience: 0,
          defense: 0,
        },
        indiceCyberPersonnalise: {
          total: 0,
          gouvernance: 0,
          protection: 0,
          resilience: 0,
          defense: 0,
        },
        referentielsMesureConcernes: expect.any(String),
        nombreMesuresSpecifiques: 0,
        nombreMesuresNonFait: 0,
        tranches: {
          indiceCyber: {
            valeurs: expect.any(Object),
            descriptions: expect.any(Array),
          },
          indiceCyberPersonnalise: {
            valeurs: expect.any(Object),
            descriptions: expect.any(Array),
          },
        },
      });
    });

    it('ne retourne pas la représentation des indices cyber si les droits sont insuffisants', () => {
      const serviceV2 = unServiceV2().construis();
      const autorisation = uneAutorisation()
        .avecDroits({
          ...tousDroitsEnEcriture(),
          [Rubriques.SECURISER]: Permissions.INVISIBLE,
        })
        .construis();

      const donnees = new ObjetGetServiceComplet(
        serviceV2,
        autorisation,
        referentiel
      ).donnees();

      expect(donnees.indicesCyber).toBeUndefined();
    });
  });
});
