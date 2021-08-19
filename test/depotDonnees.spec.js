const expect = require('expect.js');
const bcrypt = require('bcrypt');

const DepotDonnees = require('../src/depotDonnees');
const { ErreurNomServiceManquant, ErreurUtilisateurExistant } = require('../src/erreurs');
const Referentiel = require('../src/referentiel');
const AvisExpertCyber = require('../src/modeles/avisExpertCyber');
const CaracteristiquesComplementaires = require('../src/modeles/caracteristiquesComplementaires');
const Homologation = require('../src/modeles/homologation');
const InformationsGenerales = require('../src/modeles/informationsGenerales');
const Mesure = require('../src/modeles/mesure');
const PartiesPrenantes = require('../src/modeles/partiesPrenantes');
const Risque = require('../src/modeles/risque');
const Utilisateur = require('../src/modeles/utilisateur');

describe('Le dépôt de données', () => {
  describe('quand il est vide', () => {
    it('ne retourne aucune homologation pour un utilisateur donné', () => {
      const depot = DepotDonnees.creeDepotVide();
      expect(depot.homologations('456')).to.eql([]);
    });

    it('ne retourne rien si on cherche une homologation à partir de son identifiant', () => {
      const depot = DepotDonnees.creeDepotVide();
      expect(depot.homologation('123')).to.be(undefined);
    });

    it('ne retourne rien si on cherche un utilisateur à partir de son identifiant', () => {
      const depot = DepotDonnees.creeDepotVide();
      expect(depot.utilisateur('456')).to.be(undefined);
    });

    it("n'authentifie pas l'utilisateur", (done) => {
      const depot = DepotDonnees.creeDepotVide();
      depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345')
        .then((utilisateur) => {
          expect(utilisateur).to.be(undefined);
          done();
        })
        .catch(done);
    });
  });

  it("connaît toutes les homologations d'un utilisateur donné", () => {
    const depot = DepotDonnees.creeDepot({
      homologations: [
        { id: '123', idUtilisateur: '456', informationsGenerales: { nomService: 'Super Service' } },
        { id: '789', idUtilisateur: '999', informationsGenerales: { nomService: 'Autre service' } },
      ],
    }, { referentiel: 'Le référentiel' });

    const homologations = depot.homologations('456');
    expect(homologations.length).to.equal(1);
    expect(homologations[0]).to.be.a(Homologation);
    expect(homologations[0].id).to.equal('123');
    expect(homologations[0].referentiel).to.equal('Le référentiel');
  });

  it('peut retrouver une homologation à partir de son identifiant', () => {
    const depot = DepotDonnees.creeDepot({
      homologations: [
        { id: '789', idUtilisateur: '999', informationsGenerales: { nomService: 'nom' } },
      ],
    }, { referentiel: 'Le référentiel' });

    const homologation = depot.homologation('789');
    expect(homologation).to.be.a(Homologation);
    expect(homologation.id).to.equal('789');
    expect(homologation.referentiel).to.equal('Le référentiel');
  });

  it('renseigne les mesures associées à une homologation', () => {
    const referentiel = Referentiel.creeReferentiel({ mesures: { identifiantMesure: {} } });
    const depot = DepotDonnees.creeDepot({
      homologations: [{
        id: '123',
        informationsGenerales: { nomService: 'Un service' },
        mesures: [{ id: 'identifiantMesure', statut: 'fait' }],
      }],
    }, { referentiel });

    const { mesures } = depot.homologation('123');
    expect(mesures.length).to.equal(1);

    const mesure = mesures[0];
    expect(mesure).to.be.a(Mesure);
    expect(mesure.id).to.equal('identifiantMesure');
  });

  it('sait associer une mesure à une homologation', () => {
    const referentiel = Referentiel.creeReferentiel({ mesures: { identifiantMesure: {} } });
    const depot = DepotDonnees.creeDepot({
      homologations: [
        { id: '123', informationsGenerales: { nomService: 'Un service' } },
      ],
    }, { referentiel });

    const mesure = new Mesure({ id: 'identifiantMesure', statut: 'fait' }, referentiel);
    depot.ajouteMesureAHomologation('123', mesure);

    const { mesures } = depot.homologation('123');
    expect(mesures.length).to.equal(1);
    expect(mesures[0].id).to.equal('identifiantMesure');
  });

  it("met à jour les données de la mesure si elle est déjà associée à l'homologation", () => {
    const referentiel = Referentiel.creeReferentiel({ mesures: { identifiantMesure: {} } });
    const depot = DepotDonnees.creeDepot({
      homologations: [
        {
          id: '123',
          informationsGenerales: { nomService: 'nom' },
          mesures: [{ id: 'identifiantMesure', statut: Mesure.STATUT_PLANIFIE }],
        },
      ],
    }, { referentiel });

    const mesure = new Mesure({ id: 'identifiantMesure', statut: Mesure.STATUT_FAIT }, referentiel);
    depot.ajouteMesureAHomologation('123', mesure);

    const { mesures } = depot.homologation('123');
    expect(mesures.length).to.equal(1);
    expect(mesures[0].statut).to.equal(Mesure.STATUT_FAIT);
  });

  describe("sur demande de mise à jour des infos générales d'une homologation", () => {
    it("met à jour les informations générales d'une homologation", () => {
      const depot = DepotDonnees.creeDepot({
        homologations: [
          { id: '123', informationsGenerales: { nomService: 'Super Service' } },
        ],
      });

      const infos = new InformationsGenerales({ nomService: 'Nouveau Nom' });
      depot.ajouteInformationsGeneralesAHomologation('123', infos);

      const { informationsGenerales } = depot.homologation('123');
      expect(informationsGenerales.nomService).to.equal('Nouveau Nom');
    });

    it('lève une exception si le nom du service est absent', (done) => {
      const depot = DepotDonnees.creeDepot({
        homologations: [
          { id: '123', informationsGenerales: { nomService: 'Super Service' } },
        ],
      });

      const infos = new InformationsGenerales({ nomService: '' });
      try {
        depot.ajouteInformationsGeneralesAHomologation('123', infos);
        done('La mise à jour des informations générales aurait dû lever une exception');
      } catch (e) {
        expect(e).to.be.an(ErreurNomServiceManquant);
        expect(e.message).to.equal('Le nom du service ne peut pas être vide');
        done();
      }
    });
  });

  it('sait associer des caractéristiques complémentaires à une homologation', () => {
    const referentiel = Referentiel.creeReferentiel({ localisationsDonnees: { france: {} } });
    const depot = DepotDonnees.creeDepot({ homologations: [
      { id: '123', informationsGenerales: { nomService: 'nom' } },
    ] }, { referentiel });

    const caracteristiques = new CaracteristiquesComplementaires({
      localisationDonnees: 'france',
    }, referentiel);
    depot.ajouteCaracteristiquesAHomologation('123', caracteristiques);

    const { caracteristiquesComplementaires } = depot.homologation('123');
    expect(caracteristiquesComplementaires.localisationDonnees).to.equal('france');
  });

  it("met à jour les caractéristiques si elles existent déjà pour l'homologation", () => {
    const referentiel = Referentiel.creeReferentiel({ localisationsDonnees: { france: {} } });
    const depot = DepotDonnees.creeDepot({
      homologations: [{
        id: '123',
        informationsGenerales: { nomService: 'nom' },
        caracteristiquesComplementaires: { presentation: 'Une présentation' },
      }],
    }, { referentiel });

    const caracteristiques = new CaracteristiquesComplementaires({
      localisationDonnees: 'france',
    }, referentiel);
    depot.ajouteCaracteristiquesAHomologation('123', caracteristiques);

    const { caracteristiquesComplementaires } = depot.homologation('123');
    expect(caracteristiquesComplementaires.presentation).to.equal('Une présentation');
    expect(caracteristiquesComplementaires.localisationDonnees).to.equal('france');
  });

  it('sait associer des parties prenantes à une homologation', () => {
    const depot = DepotDonnees.creeDepot({ homologations: [
      { id: '123', informationsGenerales: { nomService: 'nom' } },
    ] });
    const pp = new PartiesPrenantes({ autoriteHomologation: 'Jean Dupont' });
    depot.ajoutePartiesPrenantesAHomologation('123', pp);

    const { partiesPrenantes } = depot.homologation('123');
    expect(partiesPrenantes.autoriteHomologation).to.equal('Jean Dupont');
  });

  it("met à jour les parties prenantes si elles existent déjà pour l'homologation", () => {
    const depot = DepotDonnees.creeDepot({
      homologations: [{
        id: '123',
        informationsGenerales: { nomService: 'nom' },
        partiesPrenantes: { autoriteHomologation: 'Jean Dupont' },
      }],
    });

    const pp = new PartiesPrenantes({ fonctionAutoriteHomologation: 'Maire' });
    depot.ajoutePartiesPrenantesAHomologation('123', pp);

    const { partiesPrenantes } = depot.homologation('123');
    expect(partiesPrenantes.autoriteHomologation).to.equal('Jean Dupont');
    expect(partiesPrenantes.fonctionAutoriteHomologation).to.equal('Maire');
  });

  it('sait associer un risque à une homologation', () => {
    const referentiel = Referentiel.creeReferentiel({ risques: { unRisque: {} } });
    const depot = DepotDonnees.creeDepot({ homologations: [
      { id: '123', informationsGenerales: { nomService: 'nom' } },
    ] }, { referentiel });
    const risque = new Risque({ id: 'unRisque', commentaire: 'Un commentaire' }, referentiel);
    depot.ajouteRisqueAHomologation('123', risque);

    const { risques } = depot.homologation('123');
    expect(risques.length).to.equal(1);
    expect(risques[0]).to.be.a(Risque);
    expect(risques[0].id).to.equal('unRisque');
  });

  it("sait associer un avis d'expert cyber à une homologation", () => {
    const depot = DepotDonnees.creeDepot({ homologations: [
      { id: '123', informationsGenerales: { nomService: 'nom' } },
    ] });
    const avisExpert = new AvisExpertCyber({ avis: AvisExpertCyber.FAVORABLE });
    depot.ajouteAvisExpertCyberAHomologation('123', avisExpert);

    const { avisExpertCyber } = depot.homologation('123');
    expect(avisExpertCyber.favorable()).to.be(true);
  });

  it("retourne l'utilisateur authentifié", (done) => {
    const adaptateurJWT = {};

    bcrypt.hash('mdp_12345', 10)
      .then((hash) => {
        const depot = DepotDonnees.creeDepot({
          utilisateurs: [{
            id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: hash,
          }],
        }, { adaptateurJWT });

        return depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345');
      })
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);

        done();
      })
      .catch(done);
  });

  it("mets à jour le mot de passe d'un utilisateur", (done) => {
    const adaptateurJWT = {};
    const depot = DepotDonnees.creeDepot({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    }, { adaptateurJWT });

    depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345')
      .then((utilisateur) => expect(typeof utilisateur).to.be('undefined'))
      .then(() => depot.metsAJourMotDePasse('123', 'mdp_12345'))
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
      })
      .then(() => depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345'))
      .then((utilisateur) => {
        expect(utilisateur.id).to.equal('123');
        done();
      })
      .catch(done);
  });

  it("retient qu'un utilisateur accepte les CGU", () => {
    const depot = DepotDonnees.creeDepot({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    });

    let utilisateur = depot.utilisateur('123');
    expect(utilisateur.accepteCGU()).to.be(false);

    utilisateur = depot.valideAcceptationCGUPourUtilisateur(utilisateur);
    expect(utilisateur.accepteCGU()).to.be(true);
  });

  it('sait si un utilisateur existe', () => {
    const depot = DepotDonnees.creeDepot({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    });

    expect(depot.utilisateurExiste('123')).to.be(true);
    expect(depot.utilisateurExiste('999')).to.be(false);
  });

  it("retourne l'utilisateur associé à un identifiant donné", () => {
    const adaptateurJWT = 'Un adaptateur';
    const depot = DepotDonnees.creeDepot({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    }, { adaptateurJWT });

    const utilisateur = depot.utilisateur('123');
    expect(utilisateur).to.be.an(Utilisateur);
    expect(utilisateur.id).to.equal('123');
    expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
  });

  it("retourne l'utilisateur associé à un identifiant reset de mot de passe", () => {
    const adaptateurJWT = 'Un adaptateur';
    const depot = DepotDonnees.creeDepot({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', idResetMotDePasse: '999',
      }],
    }, { adaptateurJWT });

    const utilisateur = depot.utilisateurAFinaliser('999');
    expect(utilisateur).to.be.an(Utilisateur);
    expect(utilisateur.id).to.equal('123');
    expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
  });

  describe("quand il reçoit une demande d'enregistrement d'une nouvelle homologation", () => {
    const adaptateurUUID = { genereUUID: () => {} };
    let depot;

    beforeEach(() => {
      depot = DepotDonnees.creeDepot({ homologations: [] }, { adaptateurUUID });
    });

    it('ajoute la nouvelle homologation au dépôt', () => {
      expect(depot.homologations('123').length).to.equal(0);

      depot.nouvelleHomologation('123', { nomService: 'Super Service' });

      const homologations = depot.homologations('123');
      expect(homologations.length).to.equal(1);
      expect(homologations[0].informationsGenerales.nomService).to.equal('Super Service');
    });

    it("génère un UUID pour l'homologation créée", () => {
      adaptateurUUID.genereUUID = () => '11111111-1111-1111-1111-111111111111';

      const idHomologation = depot.nouvelleHomologation('123', { nomService: 'Super Service' });
      expect(idHomologation).to.equal('11111111-1111-1111-1111-111111111111');

      const homologations = depot.homologations('123');
      expect(homologations[0].id).to.equal('11111111-1111-1111-1111-111111111111');
    });

    it('lève une exception si le nom du service est manquant', (done) => {
      try {
        depot.nouvelleHomologation('123', { nomService: '' });
        done("La création de l'homologation aurait dû lever une exception");
      } catch (e) {
        expect(e).to.be.an(ErreurNomServiceManquant);
        done();
      }
    });
  });

  describe("sur réception d'une demande d'enregistrement d'un nouvel utilisateur", () => {
    const adaptateurJWT = 'Un adaptateur';
    let depot;

    describe("quand l'utilisateur n'existe pas déjà", () => {
      beforeEach(() => {
        let compteurId = 0;
        const adaptateurUUID = { genereUUID: () => { compteurId += 1; return `${compteurId}`; } };
        depot = DepotDonnees.creeDepot({ utilisateurs: [] }, { adaptateurJWT, adaptateurUUID });
      });

      it('génère un UUID pour cet utilisateur', (done) => {
        depot.nouvelUtilisateur({ prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' })
          .then((utilisateur) => {
            expect(utilisateur.id).to.equal('1');
            done();
          })
          .catch(done);
      });

      it('ajoute le nouvel utilisateur au dépôt', (done) => {
        expect(depot.utilisateur('1')).to.be(undefined);

        depot.nouvelUtilisateur({ prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' })
          .then(() => {
            const utilisateurCree = depot.utilisateur('1');
            expect(utilisateurCree).to.be.an(Utilisateur);
            expect(utilisateurCree.idResetMotDePasse).to.equal('2');
            expect(utilisateurCree.prenom).to.equal('Jean');
            expect(utilisateurCree.nom).to.equal('Dupont');
            expect(utilisateurCree.email).to.equal('jean.dupont@mail.fr');
            expect(utilisateurCree.adaptateurJWT).to.equal(adaptateurJWT);
            done();
          })
          .catch(done);
      });
    });

    describe("quand l'utilisateur existe déjà", () => {
      it('lève une `ErreurUtilisateurExistant`', (done) => {
        depot = DepotDonnees.creeDepot({
          utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        });

        try {
          depot.nouvelUtilisateur({ email: 'jean.dupont@mail.fr' });
          done('Une exception aurait dû être levée.');
        } catch (e) {
          expect(e).to.be.a(ErreurUtilisateurExistant);
          done();
        }
      });
    });

    it('supprime un identifiant de reset de mot de passe', () => {
      depot = DepotDonnees.creeDepot({
        utilisateurs: [{ id: '123', idResetMotDePasse: '999' }],
      });

      let utilisateur = depot.utilisateur('123');
      expect(utilisateur.idResetMotDePasse).to.equal('999');

      utilisateur = depot.supprimeIdResetMotDePassePourUtilisateur(utilisateur);
      expect(utilisateur.idResetMotDePasse).to.be(undefined);
    });
  });
});
