import { ObjetGetContactsUtiles } from '../../../src/modeles/objetsApi/objetGetContactsUtiles.ts';
import { unService } from '../../constructeurs/constructeurService.js';

describe("Sur demande de la représentation API des contacts utiles d'un service", () => {
  it('retourne la représentation', () => {
    const service = unService()
      .avecContactsUtiles({
        autoriteHomologation: 'autorité',
        fonctionAutoriteHomologation: 'fonction autorité',
        expertCybersecurite: 'expert',
        fonctionExpertCybersecurite: 'fonction expert',
        delegueProtectionDonnees: 'délégué',
        fonctionDelegueProtectionDonnees: 'fonction délégué',
        piloteProjet: 'pilote',
        fonctionPiloteProjet: 'fonction pilote',
        acteursHomologation: [
          { role: 'acteur', nom: 'nom', fonction: 'fonction' },
        ],
        partiesPrenantes: [
          {
            nom: 'nomHebergement',
            natureAcces: 'natureHebergement',
            pointContact: 'pointHebergement',
            type: 'Hebergement',
          },
          {
            nom: 'nomMaintenanceService',
            natureAcces: 'natureMaintenanceService',
            pointContact: 'pointMaintenanceService',
            type: 'MaintenanceService',
          },
          {
            nom: 'nomDeveloppementFourniture',
            natureAcces: 'natureDeveloppementFourniture',
            pointContact: 'pointDeveloppementFourniture',
            type: 'DeveloppementFourniture',
          },
          {
            nom: 'nomSecuriteService',
            natureAcces: 'natureSecuriteService',
            pointContact: 'pointSecuriteService',
            type: 'SecuriteService',
          },
          {
            type: 'PartiePrenanteSpecifique',
            nom: 'nom',
            natureAcces: 'nature',
            pointContact: 'point',
          },
        ],
      })
      .construis();

    const donnees = new ObjetGetContactsUtiles(service).donnees();

    expect(donnees).toEqual({
      autoriteHomologation: { nom: 'autorité', fonction: 'fonction autorité' },
      expertCybersecurite: { nom: 'expert', fonction: 'fonction expert' },
      delegueProtectionDonnees: {
        nom: 'délégué',
        fonction: 'fonction délégué',
      },
      piloteProjet: { nom: 'pilote', fonction: 'fonction pilote' },
      acteursHomologation: [
        { role: 'acteur', nom: 'nom', fonction: 'fonction' },
      ],
      partiesPrenantesSpecifiques: [
        {
          nom: 'nom',
          natureAcces: 'nature',
          pointContact: 'point',
        },
      ],
      partiesPrenantes: {
        Hebergement: {
          nom: 'nomHebergement',
          natureAcces: 'natureHebergement',
          pointContact: 'pointHebergement',
        },
        DeveloppementFourniture: {
          nom: 'nomDeveloppementFourniture',
          natureAcces: 'natureDeveloppementFourniture',
          pointContact: 'pointDeveloppementFourniture',
        },
        MaintenanceService: {
          nom: 'nomMaintenanceService',
          natureAcces: 'natureMaintenanceService',
          pointContact: 'pointMaintenanceService',
        },
        SecuriteService: {
          nom: 'nomSecuriteService',
          natureAcces: 'natureSecuriteService',
          pointContact: 'pointSecuriteService',
        },
      },
    });
  });
});
