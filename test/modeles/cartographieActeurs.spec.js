const expect = require('expect.js');

const InformationsHomologation = require('../../src/modeles/informationsHomologation');
const Hebergement = require('../../src/modeles/partiesPrenantes/hebergement');
const CartographieActeurs = require('../../src/modeles/cartographieActeurs');

describe('La cartographie des acteurs', () => {
  it('connaît ses constituants', () => {
    const cartographieActeurs = new CartographieActeurs({
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

    expect(cartographieActeurs.autoriteHomologation).to.equal('Jean Dupont');
    expect(cartographieActeurs.fonctionAutoriteHomologation).to.equal('Maire');
    expect(cartographieActeurs.delegueProtectionDonnees).to.equal('Rémi Fassol');
    expect(cartographieActeurs.fonctionDelegueProtectionDonnees).to.equal('DSI');
    expect(cartographieActeurs.piloteProjet).to.equal('Sylvie Martin');
    expect(cartographieActeurs.fonctionPiloteProjet).to.equal('Responsable métier');
    expect(cartographieActeurs.expertCybersecurite).to.equal('Anna Dubreuil');
    expect(cartographieActeurs.fonctionExpertCybersecurite).to.equal('RSSI');
    expect(cartographieActeurs.acteursHomologation.item(0).role).to.equal('DSI');
    expect(cartographieActeurs.acteursHomologation.item(0).nom).to.equal('John');
    expect(cartographieActeurs.acteursHomologation.item(0).fonction).to.equal('Maire');
    expect(cartographieActeurs.partiesPrenantes.items[0]).to.be.an(Hebergement);
    expect(cartographieActeurs.partiesPrenantes.items[0].nom).to.equal('hébergeur');

    expect(cartographieActeurs.toJSON()).to.eql({
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
      const cartographieActeurs = new CartographieActeurs({
        piloteProjet: 'Sylvie Martin',
        expertCybersecurite: 'Anna Dubreuil',
      });

      expect(cartographieActeurs.descriptionEquipePreparation()).to.equal(
        'Sylvie Martin (fonction non renseignée), Anna Dubreuil (fonction non renseignée)'
      );
    });

    it("ne parle pas du responsable du projet si l'information est inexistante", () => {
      const cartographieActeurs = new CartographieActeurs({ expertCybersecurite: 'Anna Dubreuil' });

      expect(cartographieActeurs.descriptionEquipePreparation()).to.equal(
        'Anna Dubreuil (fonction non renseignée)'
      );
    });

    it("ne parle pas de l'expert cyber si l'information est inexistante", () => {
      const cartographieActeurs = new CartographieActeurs({ piloteProjet: 'Sylvie Martin' });

      expect(cartographieActeurs.descriptionEquipePreparation()).to.equal(
        'Sylvie Martin (fonction non renseignée)'
      );
    });

    it('retourne une valeur par défaut', () => {
      const cartographieActeurs = new CartographieActeurs();
      expect(cartographieActeurs.descriptionEquipePreparation()).to.equal('Information non renseignée');
    });
  });

  describe("sur une interrogation sur l'autorité d'homologation", () => {
    it("présente les informations relatives à l'autorité d'homologation", () => {
      const cartographieActeurs = new CartographieActeurs({
        autoriteHomologation: 'Jean Dupont',
        fonctionAutoriteHomologation: 'Maire',
      });

      expect(cartographieActeurs.descriptionAutoriteHomologation()).to.equal('Jean Dupont (Maire)');
    });

    it("ne mentionne pas la fonction de l'autorité d'homologation si info inexistante", () => {
      const cartographieActeurs = new CartographieActeurs({
        autoriteHomologation: 'Jean Dupont',
      });

      expect(cartographieActeurs.descriptionAutoriteHomologation()).to.equal(
        'Jean Dupont (fonction non renseignée)'
      );
    });

    it("ne mentionne pas l'autorité d'homologation si info inexistante", () => {
      const cartographieActeurs = new CartographieActeurs({ fonctionAutoriteHomologation: 'Maire' });
      expect(cartographieActeurs.descriptionAutoriteHomologation()).to.equal(
        'Information non renseignée'
      );
    });
  });

  it('présente les informations relatives au pilote projet', () => {
    const cartographieActeurs = new CartographieActeurs({
      piloteProjet: 'Jean Dupont',
      fonctionPiloteProjet: 'Expert métier',
    });

    expect(cartographieActeurs.descriptionPiloteProjet()).to.equal('Jean Dupont (Expert métier)');
  });

  it("présente les informations relatives à l'expert cybersécurité", () => {
    const cartographieActeurs = new CartographieActeurs({
      expertCybersecurite: 'Jean Dupont',
      fonctionExpertCybersecurite: 'RSSI',
    });

    expect(cartographieActeurs.descriptionExpertCybersecurite()).to.equal('Jean Dupont (RSSI)');
  });

  it('présente les informations relatives au ou à la déléguée à la protection des données', () => {
    const cartographieActeurs = new CartographieActeurs({
      delegueProtectionDonnees: 'Jean Dupont',
      fonctionDelegueProtectionDonnees: 'DSI',
    });

    expect(cartographieActeurs.descriptionDelegueProtectionDonnees()).to.equal('Jean Dupont (DSI)');
  });

  describe("sur une demande de description de l'hébergeur", () => {
    it("présente le nom de l'hébergement", () => {
      const cartographieActeurs = new CartographieActeurs({ partiesPrenantes: [{ type: 'Hebergement', nom: 'Un hébergeur' }] });

      expect(cartographieActeurs.descriptionHebergeur()).to.equal('Un hébergeur');
    });

    it("retourne une valeur par défaut lorsque l'hébergement n'est pas présent", () => {
      const cartographieActeurs = new CartographieActeurs();

      expect(cartographieActeurs.descriptionHebergeur()).to.equal('Hébergeur non renseigné');
    });
  });

  it('détermine le statut de saisie', () => {
    const cartographieActeurs = new CartographieActeurs();
    expect(cartographieActeurs.statutSaisie()).to.equal(InformationsHomologation.A_SAISIR);
  });

  describe('sur une demande de description de la structure ayant réalisé le développement', () => {
    it('présente le nom de la structure', () => {
      const cartographieActeurs = new CartographieActeurs({ partiesPrenantes: [{ type: 'DeveloppementFourniture', nom: 'Une structure' }] });

      expect(cartographieActeurs.descriptionStructureDeveloppement()).to.equal('Une structure');
    });

    it("reste robuste lorsque la structure n'est pas présent", () => {
      const cartographieActeurs = new CartographieActeurs();

      expect(cartographieActeurs.descriptionStructureDeveloppement()).to.equal('');
    });
  });

  describe("sur une demande de description des acteurs de l'homologation", () => {
    it("intègre l'autorité d'homologation", () => {
      const cartographieActeurs = new CartographieActeurs({
        autoriteHomologation: 'Jean Dupont', fonctionAutoriteHomologation: 'Maire',
      });

      const acteursHomologations = cartographieActeurs.descriptionActeursHomologation();
      expect(acteursHomologations).to.eql([{ role: "Autorité d'homologation", description: 'Jean Dupont (Maire)' }]);
    });

    it('intègre le ou la spécialiste cybersécurité', () => {
      const cartographieActeurs = new CartographieActeurs({
        expertCybersecurite: 'John Dupond', fonctionExpertCybersecurite: 'Spécialiste',
      });

      const acteursHomologations = cartographieActeurs.descriptionActeursHomologation();
      expect(acteursHomologations).to.eql([{ role: 'Spécialiste cybersécurité', description: 'John Dupond (Spécialiste)' }]);
    });

    it('intègre le délégué ou la délégué à la protection des données à caractère personnel', () => {
      const cartographieActeurs = new CartographieActeurs({
        delegueProtectionDonnees: 'Marie Age', fonctionDelegueProtectionDonnees: 'Déléguée',
      });

      const acteursHomologations = cartographieActeurs.descriptionActeursHomologation();
      expect(acteursHomologations).to.eql([{ role: 'Délégué(e) à la protection des données à caractère personnel', description: 'Marie Age (Déléguée)' }]);
    });

    it('intègre le ou la responsable métier du projet', () => {
      const cartographieActeurs = new CartographieActeurs({
        piloteProjet: 'Otto Graf', fonctionPiloteProjet: 'Pilote',
      });

      const acteursHomologations = cartographieActeurs.descriptionActeursHomologation();
      expect(acteursHomologations).to.eql([{ role: 'Responsable métier du projet', description: 'Otto Graf (Pilote)' }]);
    });

    it('intègre les acteurs spécifiques', () => {
      const cartographieActeurs = new CartographieActeurs({
        acteursHomologation: [
          { role: 'Rôle dans le projet', nom: 'Sandra Nicouverture', fonction: 'Fonction' },
        ],
      });

      const acteursHomologations = cartographieActeurs.descriptionActeursHomologation();
      expect(acteursHomologations).to.eql([{ role: 'Rôle dans le projet', description: 'Sandra Nicouverture (Fonction)' }]);
    });

    it('intègre les acteurs spécifiques sans les fonctions si elles ne sont pas présentes', () => {
      const cartographieActeurs = new CartographieActeurs({
        acteursHomologation: [
          { role: 'Rôle dans le projet', nom: 'Yamamoto Kaderate' },
        ],
      });

      const acteursHomologations = cartographieActeurs.descriptionActeursHomologation();
      expect(acteursHomologations).to.eql([{ role: 'Rôle dans le projet', description: 'Yamamoto Kaderate' }]);
    });

    it("n'intègre pas les acteurs non renseignés", () => {
      const cartographieActeurs = new CartographieActeurs({});

      expect(cartographieActeurs.descriptionActeursHomologation()).to.have.length(0);
    });
  });
});
