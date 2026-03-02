import InformationsService from '../../src/modeles/informationsService.js';
import Hebergement from '../../src/modeles/partiesPrenantes/hebergement.js';
import RolesResponsabilites from '../../src/modeles/rolesResponsabilites.js';

describe("L'ensemble des rôles et responsabilités", () => {
  it('connaît ses constituants', () => {
    const rolesResponsabilites = new RolesResponsabilites({
      autoriteHomologation: 'Jean Dupont',
      delegueProtectionDonnees: 'Rémi Fassol',
      fonctionDelegueProtectionDonnees: 'DSI',
      fonctionAutoriteHomologation: 'Maire',
      piloteProjet: 'Sylvie Martin',
      fonctionPiloteProjet: 'Responsable métier',
      expertCybersecurite: 'Anna Dubreuil',
      fonctionExpertCybersecurite: 'RSSI',
      acteursHomologation: [{ role: 'DSI', nom: 'John', fonction: 'Maire' }],
      partiesPrenantes: [{ type: 'Hebergement', nom: 'hébergeur' }],
    });

    expect(rolesResponsabilites.autoriteHomologation).toEqual('Jean Dupont');
    expect(rolesResponsabilites.fonctionAutoriteHomologation).toEqual('Maire');
    expect(rolesResponsabilites.delegueProtectionDonnees).toEqual(
      'Rémi Fassol'
    );
    expect(rolesResponsabilites.fonctionDelegueProtectionDonnees).toEqual(
      'DSI'
    );
    expect(rolesResponsabilites.piloteProjet).toEqual('Sylvie Martin');
    expect(rolesResponsabilites.fonctionPiloteProjet).toEqual(
      'Responsable métier'
    );
    expect(rolesResponsabilites.expertCybersecurite).toEqual('Anna Dubreuil');
    expect(rolesResponsabilites.fonctionExpertCybersecurite).toEqual('RSSI');
    expect(rolesResponsabilites.acteursHomologation.item(0).role).toEqual(
      'DSI'
    );
    expect(rolesResponsabilites.acteursHomologation.item(0).nom).toEqual(
      'John'
    );
    expect(rolesResponsabilites.acteursHomologation.item(0).fonction).toEqual(
      'Maire'
    );
    expect(rolesResponsabilites.partiesPrenantes.items[0]).toBeInstanceOf(
      Hebergement
    );
    expect(rolesResponsabilites.partiesPrenantes.items[0].nom).toEqual(
      'hébergeur'
    );

    expect(rolesResponsabilites.toJSON()).toEqual({
      autoriteHomologation: 'Jean Dupont',
      fonctionAutoriteHomologation: 'Maire',
      delegueProtectionDonnees: 'Rémi Fassol',
      fonctionDelegueProtectionDonnees: 'DSI',
      piloteProjet: 'Sylvie Martin',
      fonctionPiloteProjet: 'Responsable métier',
      expertCybersecurite: 'Anna Dubreuil',
      fonctionExpertCybersecurite: 'RSSI',
      acteursHomologation: [{ role: 'DSI', nom: 'John', fonction: 'Maire' }],
      partiesPrenantes: [{ type: 'Hebergement', nom: 'hébergeur' }],
    });
  });

  it('présente les informations relatives au ou à la déléguée à la protection des données', () => {
    const rolesResponsabilites = new RolesResponsabilites({
      delegueProtectionDonnees: 'Jean Dupont',
      fonctionDelegueProtectionDonnees: 'DSI',
    });

    expect(rolesResponsabilites.descriptionDelegueProtectionDonnees()).toEqual(
      'Jean Dupont (DSI)'
    );
  });

  describe("sur une demande de description de l'hébergeur", () => {
    it("présente le nom de l'hébergement", () => {
      const rolesResponsabilites = new RolesResponsabilites({
        partiesPrenantes: [{ type: 'Hebergement', nom: 'Un hébergeur' }],
      });

      expect(rolesResponsabilites.descriptionHebergeur()).toEqual(
        'Un hébergeur'
      );
    });

    it("retourne une valeur par défaut lorsque l'hébergement n'est pas présent", () => {
      const rolesResponsabilites = new RolesResponsabilites();

      expect(rolesResponsabilites.descriptionHebergeur()).toEqual(
        'Hébergeur non renseigné'
      );
    });
  });

  it('détermine le statut de saisie', () => {
    const rolesResponsabilites = new RolesResponsabilites();
    expect(rolesResponsabilites.statutSaisie()).toEqual(
      InformationsService.A_SAISIR
    );
  });

  describe('sur une demande de description de la structure ayant réalisé le développement', () => {
    it('présente le nom de la structure', () => {
      const rolesResponsabilites = new RolesResponsabilites({
        partiesPrenantes: [
          { type: 'DeveloppementFourniture', nom: 'Une structure' },
        ],
      });

      expect(rolesResponsabilites.descriptionStructureDeveloppement()).toEqual(
        'Une structure'
      );
    });

    it("reste robuste lorsque la structure n'est pas présent", () => {
      const rolesResponsabilites = new RolesResponsabilites();

      expect(rolesResponsabilites.descriptionStructureDeveloppement()).toEqual(
        ''
      );
    });
  });
});
