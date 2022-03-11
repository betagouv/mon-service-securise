const expect = require('expect.js');

const InformationsHomologation = require('../../src/modeles/informationsHomologation');
const Hebergement = require('../../src/modeles/partiesPrenantes/hebergement');
const RolesResponsabilites = require('../../src/modeles/rolesResponsabilites');

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

    expect(rolesResponsabilites.autoriteHomologation).to.equal('Jean Dupont');
    expect(rolesResponsabilites.fonctionAutoriteHomologation).to.equal('Maire');
    expect(rolesResponsabilites.delegueProtectionDonnees).to.equal('Rémi Fassol');
    expect(rolesResponsabilites.fonctionDelegueProtectionDonnees).to.equal('DSI');
    expect(rolesResponsabilites.piloteProjet).to.equal('Sylvie Martin');
    expect(rolesResponsabilites.fonctionPiloteProjet).to.equal('Responsable métier');
    expect(rolesResponsabilites.expertCybersecurite).to.equal('Anna Dubreuil');
    expect(rolesResponsabilites.fonctionExpertCybersecurite).to.equal('RSSI');
    expect(rolesResponsabilites.acteursHomologation.item(0).role).to.equal('DSI');
    expect(rolesResponsabilites.acteursHomologation.item(0).nom).to.equal('John');
    expect(rolesResponsabilites.acteursHomologation.item(0).fonction).to.equal('Maire');
    expect(rolesResponsabilites.partiesPrenantes.items[0]).to.be.an(Hebergement);
    expect(rolesResponsabilites.partiesPrenantes.items[0].nom).to.equal('hébergeur');

    expect(rolesResponsabilites.toJSON()).to.eql({
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

  describe("sur interrogation sur l'équipe de préparation du dossier", () => {
    it("retourne les noms du pilote du projet de l'expert cybersécurité", () => {
      const rolesResponsabilites = new RolesResponsabilites({
        piloteProjet: 'Sylvie Martin',
        expertCybersecurite: 'Anna Dubreuil',
      });

      expect(rolesResponsabilites.descriptionEquipePreparation()).to.equal(
        'Sylvie Martin (fonction non renseignée), Anna Dubreuil (fonction non renseignée)'
      );
    });

    it("ne parle pas du responsable du projet si l'information est inexistante", () => {
      const rolesResponsabilites = new RolesResponsabilites({ expertCybersecurite: 'Anna Dubreuil' });

      expect(rolesResponsabilites.descriptionEquipePreparation()).to.equal(
        'Anna Dubreuil (fonction non renseignée)'
      );
    });

    it("ne parle pas de l'expert cyber si l'information est inexistante", () => {
      const rolesResponsabilites = new RolesResponsabilites({ piloteProjet: 'Sylvie Martin' });

      expect(rolesResponsabilites.descriptionEquipePreparation()).to.equal(
        'Sylvie Martin (fonction non renseignée)'
      );
    });

    it('retourne une valeur par défaut', () => {
      const rolesResponsabilites = new RolesResponsabilites();
      expect(rolesResponsabilites.descriptionEquipePreparation()).to.equal('Information non renseignée');
    });
  });

  describe("sur une interrogation sur l'autorité d'homologation", () => {
    it("présente les informations relatives à l'autorité d'homologation", () => {
      const rolesResponsabilites = new RolesResponsabilites({
        autoriteHomologation: 'Jean Dupont',
        fonctionAutoriteHomologation: 'Maire',
      });

      expect(rolesResponsabilites.descriptionAutoriteHomologation()).to.equal('Jean Dupont (Maire)');
    });

    it("ne mentionne pas la fonction de l'autorité d'homologation si info inexistante", () => {
      const rolesResponsabilites = new RolesResponsabilites({
        autoriteHomologation: 'Jean Dupont',
      });

      expect(rolesResponsabilites.descriptionAutoriteHomologation()).to.equal(
        'Jean Dupont (fonction non renseignée)'
      );
    });

    it("ne mentionne pas l'autorité d'homologation si info inexistante", () => {
      const rolesResponsabilites = new RolesResponsabilites({ fonctionAutoriteHomologation: 'Maire' });
      expect(rolesResponsabilites.descriptionAutoriteHomologation()).to.equal(
        'Information non renseignée'
      );
    });
  });

  it('présente les informations relatives au pilote projet', () => {
    const rolesResponsabilites = new RolesResponsabilites({
      piloteProjet: 'Jean Dupont',
      fonctionPiloteProjet: 'Expert métier',
    });

    expect(rolesResponsabilites.descriptionPiloteProjet()).to.equal('Jean Dupont (Expert métier)');
  });

  it("présente les informations relatives à l'expert cybersécurité", () => {
    const rolesResponsabilites = new RolesResponsabilites({
      expertCybersecurite: 'Jean Dupont',
      fonctionExpertCybersecurite: 'RSSI',
    });

    expect(rolesResponsabilites.descriptionExpertCybersecurite()).to.equal('Jean Dupont (RSSI)');
  });

  it('présente les informations relatives au ou à la déléguée à la protection des données', () => {
    const rolesResponsabilites = new RolesResponsabilites({
      delegueProtectionDonnees: 'Jean Dupont',
      fonctionDelegueProtectionDonnees: 'DSI',
    });

    expect(rolesResponsabilites.descriptionDelegueProtectionDonnees()).to.equal('Jean Dupont (DSI)');
  });

  describe("sur une demande de description de l'hébergeur", () => {
    it("présente le nom de l'hébergement", () => {
      const rolesResponsabilites = new RolesResponsabilites({ partiesPrenantes: [{ type: 'Hebergement', nom: 'Un hébergeur' }] });

      expect(rolesResponsabilites.descriptionHebergeur()).to.equal('Un hébergeur');
    });

    it("retourne une valeur par défaut lorsque l'hébergement n'est pas présent", () => {
      const rolesResponsabilites = new RolesResponsabilites();

      expect(rolesResponsabilites.descriptionHebergeur()).to.equal('Hébergeur non renseigné');
    });
  });

  it('détermine le statut de saisie', () => {
    const rolesResponsabilites = new RolesResponsabilites();
    expect(rolesResponsabilites.statutSaisie()).to.equal(InformationsHomologation.A_SAISIR);
  });

  describe('sur une demande de description de la structure ayant réalisé le développement', () => {
    it('présente le nom de la structure', () => {
      const rolesResponsabilites = new RolesResponsabilites({ partiesPrenantes: [{ type: 'DeveloppementFourniture', nom: 'Une structure' }] });

      expect(rolesResponsabilites.descriptionStructureDeveloppement()).to.equal('Une structure');
    });

    it("reste robuste lorsque la structure n'est pas présent", () => {
      const rolesResponsabilites = new RolesResponsabilites();

      expect(rolesResponsabilites.descriptionStructureDeveloppement()).to.equal('');
    });
  });
});
