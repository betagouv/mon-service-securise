const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');
const Homologation = require('../../src/modeles/homologation');
const MesureGenerale = require('../../src/modeles/mesureGenerale');
const Utilisateur = require('../../src/modeles/utilisateur');

describe('Une homologation', () => {
  it('connaît le nom du service', () => {
    const homologation = new Homologation({
      id: '123', idUtilisateur: '456', descriptionService: { nomService: 'Super Service' },
    });

    expect(homologation.nomService()).to.equal('Super Service');
  });

  it('connaît ses contributrices et contributeurs', () => {
    const homologation = new Homologation({
      id: '123',
      contributeurs: [{ id: '456', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' }],
    });

    const { contributeurs } = homologation;
    expect(contributeurs.length).to.equal(1);

    const contributeur = contributeurs[0];
    expect(contributeur).to.be.an(Utilisateur);
    expect(contributeur.id).to.equal('456');
  });

  it('connaît son créateur', () => {
    const homologation = new Homologation({
      id: '123', createur: { id: '456', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' },
    });

    const { createur } = homologation;
    expect(createur).to.be.an(Utilisateur);
    expect(createur.id).to.equal('456');
  });

  it('sait se convertir en JSON', () => {
    const homologation = new Homologation({
      id: '123',
      createur: { id: '456', prenom: 'Bruno', nom: 'Dumans', email: 'bruno.dumans@mail.fr' },
      descriptionService: { nomService: 'Super Service' },
      contributeurs: [{ id: '999', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' }],
    });

    expect(homologation.toJSON()).to.eql({
      id: '123',
      nomService: 'Super Service',
      createur: { id: '456', cguAcceptees: false, prenomNom: 'Bruno Dumans', initiales: 'BD' },
      contributeurs: [{ id: '999', cguAcceptees: false, prenomNom: 'Jean Dupont', initiales: 'JD' }],
    });
  });

  it('sait décrire le type service', () => {
    const referentiel = Referentiel.creeReferentiel({
      typesService: {
        unType: { description: 'Un type' },
        unAutre: { description: 'Un autre' },
      },
    });
    const homologation = new Homologation({
      id: '123',
      idUtilisateur: '456',
      descriptionService: { nomService: 'nom', typeService: ['unType', 'unAutre'] },
    }, referentiel);

    expect(homologation.descriptionTypeService()).to.equal('Un type, Un autre');
  });

  it("se comporte correctement si le type service n'est pas présente", () => {
    const homologation = new Homologation({ id: '123' });
    expect(homologation.descriptionTypeService()).to.equal('Type de service non renseignée');
  });

  it('connaît la cartographie de ses acteurs et parties prenantes', () => {
    const homologation = new Homologation({
      id: '123',
      cartographieActeurs: {
        autoriteHomologation: 'Jean Dupont',
        fonctionAutoriteHomologation: 'Maire',
        delegueProtectionDonnees: 'Rémi Fassol',
        piloteProjet: 'Sylvie Martin',
        expertCybersecurite: 'Anna Dubreuil',
        partiesPrenantes: [
          { type: 'Hebergement', nom: 'Hébergeur' },
          { type: 'DeveloppementFourniture', nom: 'Une structure' },
        ],
      },
    });

    expect(homologation.autoriteHomologation()).to.equal('Jean Dupont');
    expect(homologation.fonctionAutoriteHomologation()).to.equal('Maire');
    expect(homologation.delegueProtectionDonnees()).to.equal('Rémi Fassol');
    expect(homologation.piloteProjet()).to.equal('Sylvie Martin');
    expect(homologation.expertCybersecurite()).to.equal('Anna Dubreuil');
    expect(homologation.hebergeur()).to.equal('Hébergeur');
    expect(homologation.structureDeveloppement()).to.equal('Une structure');
  });

  it('connaît ses risques spécifiques', () => {
    const homologation = new Homologation({
      id: '123',
      risquesSpecifiques: [{ description: 'Un risque' }],
    });

    expect(homologation.risquesSpecifiques().nombre()).to.equal(1);
  });

  it('connaît ses mesures spécifiques', () => {
    const homologation = new Homologation({
      id: '123',
      mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
    });

    expect(homologation.mesuresSpecifiques().nombre()).to.equal(1);
  });

  it("sait décrire l'équipe de préparation du dossier", () => {
    const homologation = new Homologation({
      id: '123',
      cartographieActeurs: { piloteProjet: 'Sylvie Martin' },
    });

    expect(homologation.descriptionEquipePreparation()).to.equal(
      'Sylvie Martin (fonction non renseignée)'
    );
  });

  it("sait décrire l'autorité d'homologation", () => {
    const homologation = new Homologation({
      id: '123',
      cartographieActeurs: {
        autoriteHomologation: 'Jean Dupont', fonctionAutoriteHomologation: 'Maire',
      },
    });

    expect(homologation.descriptionAutoriteHomologation()).to.equal('Jean Dupont (Maire)');
  });

  it('décrit son expiration', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { unAn: { expiration: 'Dans un an' } },
    });

    const homologation = new Homologation({
      id: '123',
      avisExpertCyber: { dateRenouvellement: 'unAn' },
    }, referentiel);

    expect(homologation.descriptionExpiration()).to.equal('Dans un an');
  });

  describe('sur demande de statistiques sur les mesures associées', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { une: 'catégorie 1', deux: 'catégorie 2' },
      mesures: { id1: { categorie: 'une' }, id2: { categorie: 'une' }, id3: { categorie: 'deux' } },
    });

    const moteur = { mesures: () => referentiel.mesures() };

    it('fait la somme des mesures mises en oeuvre pour une catégorie donnée', () => {
      const homologation = new Homologation({
        id: '123', mesuresGenerales: [{ id: 'id1', statut: 'fait' }, { id: 'id2', statut: 'fait' }],
      }, referentiel, moteur);
      const stats = homologation.statistiquesMesures().toJSON();
      expect(stats).to.eql({ une: { retenues: 2, misesEnOeuvre: 2 } });
    });

    it('ajoute les mesures planifiées à la somme des mesures retenues', () => {
      const homologation = new Homologation({
        id: '123', mesuresGenerales: [{ id: 'id1', statut: 'fait' }, { id: 'id2', statut: 'planifie' }],
      }, referentiel, moteur);
      const stats = homologation.statistiquesMesures().toJSON();
      expect(stats).to.eql({ une: { retenues: 2, misesEnOeuvre: 1 } });
    });

    it('ne tient pas compte des mesures non retenues', () => {
      const homologation = new Homologation({
        id: '123', mesuresGenerales: [{ id: 'id1', statut: 'planifie' }, { id: 'id2', statut: 'nonRetenu' }],
      }, referentiel, moteur);
      const stats = homologation.statistiquesMesures().toJSON();
      expect(stats).to.eql({ une: { retenues: 1, misesEnOeuvre: 0 } });
    });

    it('classe les statistiques par catégorie de mesure', () => {
      const homologation = new Homologation({
        id: '123', mesuresGenerales: [{ id: 'id1', statut: 'nonRetenu' }, { id: 'id3', statut: 'fait' }],
      }, referentiel, moteur);
      const stats = homologation.statistiquesMesures().toJSON();
      expect(stats).to.eql({ deux: { retenues: 1, misesEnOeuvre: 1 } });
    });
  });

  describe('sur évaluation du statut de saisie des mesures', () => {
    const referentiel = Referentiel.creeReferentiel({ mesures: { m1: {}, m2: {} } });
    const moteur = { mesures: () => ({ m1: {}, m2: {} }) };

    it('détecte que la liste des mesures reste à saisir', () => {
      const homologation = new Homologation({ id: '123' });
      expect(homologation.statutSaisie('mesures')).to.equal(InformationsHomologation.A_SAISIR);
    });

    it('détecte que la liste des mesures est à compléter', () => {
      const homologation = new Homologation({
        mesuresGenerales: [{ id: 'm1', statut: MesureGenerale.STATUT_FAIT }],
      }, referentiel, moteur);

      expect(homologation.statutSaisie('mesures')).to.equal(InformationsHomologation.A_COMPLETER);
    });

    it('détecte que la liste des mesures est complète', () => {
      const homologation = new Homologation({
        mesuresGenerales: [
          { id: 'm1', statut: MesureGenerale.STATUT_FAIT },
          { id: 'm2', statut: MesureGenerale.STATUT_NON_RETENU },
        ],
      }, referentiel, moteur);

      expect(homologation.statutSaisie('mesures')).to.equal(InformationsHomologation.COMPLETES);
    });
  });

  describe('sur évaluation du statut de saisie des risques', () => {
    it('détecte que la liste des risques reste à vérifier', () => {
      const homologation = new Homologation({ id: '123' });
      expect(homologation.statutSaisie('risques')).to.equal(InformationsHomologation.A_SAISIR);
    });
  });
});
