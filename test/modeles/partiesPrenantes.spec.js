const expect = require('expect.js');

const InformationsHomologation = require('../../src/modeles/informationsHomologation');
const PartiesPrenantes = require('../../src/modeles/partiesPrenantes');
const Hebergement = require('../../src/modeles/partiesPrenantes/hebergement');

describe("L'ensemble des parties prenantes", () => {
  it('connaît ses constituants', () => {
    const partiesPrenantes = new PartiesPrenantes({
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

    expect(partiesPrenantes.autoriteHomologation).to.equal('Jean Dupont');
    expect(partiesPrenantes.fonctionAutoriteHomologation).to.equal('Maire');
    expect(partiesPrenantes.delegueProtectionDonnees).to.equal('Rémi Fassol');
    expect(partiesPrenantes.fonctionDelegueProtectionDonnees).to.equal('DSI');
    expect(partiesPrenantes.piloteProjet).to.equal('Sylvie Martin');
    expect(partiesPrenantes.fonctionPiloteProjet).to.equal('Responsable métier');
    expect(partiesPrenantes.expertCybersecurite).to.equal('Anna Dubreuil');
    expect(partiesPrenantes.fonctionExpertCybersecurite).to.equal('RSSI');
    expect(partiesPrenantes.acteursHomologation.item(0).role).to.equal('DSI');
    expect(partiesPrenantes.acteursHomologation.item(0).nom).to.equal('John');
    expect(partiesPrenantes.acteursHomologation.item(0).fonction).to.equal('Maire');
    expect(partiesPrenantes.partiesPrenantes.items[0]).to.be.an(Hebergement);
    expect(partiesPrenantes.partiesPrenantes.items[0].nom).to.equal('hébergeur');

    expect(partiesPrenantes.toJSON()).to.eql({
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
      const partiesPrenantes = new PartiesPrenantes({
        piloteProjet: 'Sylvie Martin',
        expertCybersecurite: 'Anna Dubreuil',
      });

      expect(partiesPrenantes.descriptionEquipePreparation()).to.equal(
        'Sylvie Martin (fonction non renseignée), Anna Dubreuil (fonction non renseignée)'
      );
    });

    it("ne parle pas du responsable du projet si l'information est inexistante", () => {
      const partiesPrenantes = new PartiesPrenantes({ expertCybersecurite: 'Anna Dubreuil' });

      expect(partiesPrenantes.descriptionEquipePreparation()).to.equal(
        'Anna Dubreuil (fonction non renseignée)'
      );
    });

    it("ne parle pas de l'expert cyber si l'information est inexistante", () => {
      const partiesPrenantes = new PartiesPrenantes({ piloteProjet: 'Sylvie Martin' });

      expect(partiesPrenantes.descriptionEquipePreparation()).to.equal(
        'Sylvie Martin (fonction non renseignée)'
      );
    });

    it('retourne une valeur par défaut', () => {
      const partiesPrenantes = new PartiesPrenantes();
      expect(partiesPrenantes.descriptionEquipePreparation()).to.equal('Information non renseignée');
    });
  });

  describe("sur une interrogation sur l'autorité d'homologation", () => {
    it("présente les informations relatives à l'autorité d'homologation", () => {
      const partiesPrenantes = new PartiesPrenantes({
        autoriteHomologation: 'Jean Dupont',
        fonctionAutoriteHomologation: 'Maire',
      });

      expect(partiesPrenantes.descriptionAutoriteHomologation()).to.equal('Jean Dupont (Maire)');
    });

    it("ne mentionne pas la fonction de l'autorité d'homologation si info inexistante", () => {
      const partiesPrenantes = new PartiesPrenantes({
        autoriteHomologation: 'Jean Dupont',
      });

      expect(partiesPrenantes.descriptionAutoriteHomologation()).to.equal(
        'Jean Dupont (fonction non renseignée)'
      );
    });

    it("ne mentionne pas l'autorité d'homologation si info inexistante", () => {
      const partiesPrenantes = new PartiesPrenantes({ fonctionAutoriteHomologation: 'Maire' });
      expect(partiesPrenantes.descriptionAutoriteHomologation()).to.equal(
        'Information non renseignée'
      );
    });
  });

  it('présente les informations relatives au pilote projet', () => {
    const partiesPrenantes = new PartiesPrenantes({
      piloteProjet: 'Jean Dupont',
      fonctionPiloteProjet: 'Expert métier',
    });

    expect(partiesPrenantes.descriptionPiloteProjet()).to.equal('Jean Dupont (Expert métier)');
  });

  it("présente les informations relatives à l'expert cybersécurité", () => {
    const partiesPrenantes = new PartiesPrenantes({
      expertCybersecurite: 'Jean Dupont',
      fonctionExpertCybersecurite: 'RSSI',
    });

    expect(partiesPrenantes.descriptionExpertCybersecurite()).to.equal('Jean Dupont (RSSI)');
  });

  it('présente les informations relatives au ou à la déléguée à la protection des données', () => {
    const partiesPrenantes = new PartiesPrenantes({
      delegueProtectionDonnees: 'Jean Dupont',
      fonctionDelegueProtectionDonnees: 'DSI',
    });

    expect(partiesPrenantes.descriptionDelegueProtectionDonnees()).to.equal('Jean Dupont (DSI)');
  });

  describe("sur une demande de description de l'hébergeur", () => {
    it("présente le nom de l'hébergement", () => {
      const partiesPrenantes = new PartiesPrenantes({ partiesPrenantes: [{ type: 'Hebergement', nom: 'Un hébergeur' }] });

      expect(partiesPrenantes.descriptionHebergeur()).to.equal('Un hébergeur');
    });

    it("retourne une valeur par défaut lorsque l'hébergement n'est pas présent", () => {
      const partiesPrenantes = new PartiesPrenantes();

      expect(partiesPrenantes.descriptionHebergeur()).to.equal('Hébergeur non renseigné');
    });
  });

  it('détermine le statut de saisie', () => {
    const partiesPrenantes = new PartiesPrenantes();
    expect(partiesPrenantes.statutSaisie()).to.equal(InformationsHomologation.A_SAISIR);
  });

  describe('sur une demande de description de la structure ayant réalisé le développement', () => {
    it('présente le nom de la structure', () => {
      const partiesPrenantes = new PartiesPrenantes({ partiesPrenantes: [{ type: 'DeveloppementFourniture', nom: 'Une structure' }] });

      expect(partiesPrenantes.descriptionStructureDeveloppement()).to.equal('Une structure');
    });

    it("reste robuste lorsque la structure n'est pas présent", () => {
      const partiesPrenantes = new PartiesPrenantes();

      expect(partiesPrenantes.descriptionStructureDeveloppement()).to.equal('');
    });
  });
});
