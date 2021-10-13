const expect = require('expect.js');
const bcrypt = require('bcrypt');

const DepotDonnees = require('../src/depotDonnees');
const {
  ErreurEmailManquant,
  ErreurNomServiceManquant,
  ErreurUtilisateurExistant,
} = require('../src/erreurs');
const Referentiel = require('../src/referentiel');
const AdaptateurPersistanceMemoire = require('../src/adaptateurs/adaptateurPersistanceMemoire');
const AvisExpertCyber = require('../src/modeles/avisExpertCyber');
const CaracteristiquesComplementaires = require('../src/modeles/caracteristiquesComplementaires');
const Homologation = require('../src/modeles/homologation');
const InformationsGenerales = require('../src/modeles/informationsGenerales');
const Mesure = require('../src/modeles/mesure');
const PartiesPrenantes = require('../src/modeles/partiesPrenantes');
const RisqueGeneral = require('../src/modeles/risqueGeneral');
const Utilisateur = require('../src/modeles/utilisateur');

describe('Le dépôt de données persistées en mémoire', () => {
  describe('quand il est vide', () => {
    it('ne retourne aucune homologation pour un utilisateur donné', (done) => {
      DepotDonnees.creeDepotVide()
        .then((depot) => depot.homologations('456'))
        .then((hs) => expect(hs).to.eql([]))
        .then(() => done())
        .catch(done);
    });

    it('ne retourne rien si on cherche une homologation à partir de son identifiant', (done) => {
      DepotDonnees.creeDepotVide()
        .then((depot) => depot.homologation('123'))
        .then((h) => expect(h).to.be(undefined))
        .then(() => done())
        .catch(done);
    });

    it('ne retourne rien si on cherche un utilisateur à partir de son identifiant', (done) => {
      DepotDonnees.creeDepotVide()
        .then((depot) => depot.utilisateur('456'))
        .then((u) => expect(u).to.be(undefined))
        .then(() => done())
        .catch(done);
    });

    it("n'authentifie pas l'utilisateur", (done) => {
      DepotDonnees.creeDepotVide()
        .then((depot) => depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345'))
        .then((utilisateur) => expect(utilisateur).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });

  it("connaît toutes les homologations d'un utilisateur donné", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', idUtilisateur: '456', informationsGenerales: { nomService: 'Super Service' } },
        { id: '789', idUtilisateur: '999', informationsGenerales: { nomService: 'Autre service' } },
      ],
    });

    const depot = DepotDonnees.creeDepot({ adaptateurPersistance, referentiel: 'Le référentiel' });
    depot.homologations('456')
      .then((homologations) => {
        expect(homologations.length).to.equal(1);
        expect(homologations[0]).to.be.a(Homologation);
        expect(homologations[0].id).to.equal('123');
        expect(homologations[0].referentiel).to.equal('Le référentiel');
        done();
      })
      .catch(done);
  });

  it('peut retrouver une homologation à partir de son identifiant', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '789', idUtilisateur: '999', informationsGenerales: { nomService: 'nom' } },
      ],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance, referentiel: 'Le référentiel' });

    depot.homologation('789')
      .then((homologation) => {
        expect(homologation).to.be.a(Homologation);
        expect(homologation.id).to.equal('789');
        expect(homologation.referentiel).to.equal('Le référentiel');
        done();
      })
      .catch(done);
  });

  it('renseigne les mesures associées à une homologation', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [{
        id: '123',
        informationsGenerales: { nomService: 'Un service' },
        mesures: [{ id: 'identifiantMesure', statut: 'fait' }],
      }],
    });
    const referentiel = Referentiel.creeReferentiel({ mesures: { identifiantMesure: {} } });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance, referentiel });

    depot.homologation('123')
      .then(({ mesures }) => {
        expect(mesures.nombre()).to.equal(1);

        const mesure = mesures.item(0);
        expect(mesure).to.be.a(Mesure);
        expect(mesure.id).to.equal('identifiantMesure');
        done();
      })
      .catch(done);
  });

  it('sait associer une mesure à une homologation', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', informationsGenerales: { nomService: 'Un service' } },
      ],
    });
    const referentiel = Referentiel.creeReferentiel({ mesures: { identifiantMesure: {} } });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance, referentiel });
    const mesure = new Mesure({ id: 'identifiantMesure', statut: Mesure.STATUT_FAIT }, referentiel);

    depot.ajouteMesureAHomologation('123', mesure)
      .then(() => depot.homologation('123'))
      .then(({ mesures }) => {
        expect(mesures.nombre()).to.equal(1);
        expect(mesures.item(0).id).to.equal('identifiantMesure');
        done();
      })
      .catch(done);
  });

  it("met à jour les données de la mesure si elle est déjà associée à l'homologation", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        {
          id: '123',
          informationsGenerales: { nomService: 'nom' },
          mesures: [{ id: 'identifiantMesure', statut: Mesure.STATUT_PLANIFIE }],
        },
      ],
    });
    const referentiel = Referentiel.creeReferentiel({ mesures: { identifiantMesure: {} } });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance, referentiel });

    const mesure = new Mesure({ id: 'identifiantMesure', statut: Mesure.STATUT_FAIT }, referentiel);
    depot.ajouteMesureAHomologation('123', mesure)
      .then(() => depot.homologation('123'))
      .then(({ mesures }) => {
        expect(mesures.nombre()).to.equal(1);
        expect(mesures.item(0).statut).to.equal(Mesure.STATUT_FAIT);
        done();
      })
      .catch(done);
  });

  describe("sur demande de mise à jour des infos générales d'une homologation", () => {
    it("met à jour les informations générales d'une homologation", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [
          { id: '123', informationsGenerales: { nomService: 'Super Service' } },
        ],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      const infos = new InformationsGenerales({ nomService: 'Nouveau Nom' });
      depot.ajouteInformationsGeneralesAHomologation('123', infos)
        .then(() => depot.homologation('123'))
        .then(({ informationsGenerales }) => {
          expect(informationsGenerales.nomService).to.equal('Nouveau Nom');
          done();
        })
        .catch(done);
    });

    it('lève une exception si le nom du service est absent', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [
          { id: '123', informationsGenerales: { nomService: 'Super Service' } },
        ],
      });

      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      const infos = new InformationsGenerales({ nomService: '' });
      depot.ajouteInformationsGeneralesAHomologation('123', infos)
        .then(() => done(
          'La mise à jour des informations générales aurait dû lever une exception'
        ))
        .catch((e) => {
          expect(e).to.be.an(ErreurNomServiceManquant);
          expect(e.message).to.equal('Le nom du service ne peut pas être vide');
          done();
        })
        .catch(done);
    });
  });

  it('sait associer des caractéristiques complémentaires à une homologation', (done) => {
    const referentiel = Referentiel.creeReferentiel({ localisationsDonnees: { france: {} } });
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', informationsGenerales: { nomService: 'nom' } },
      ],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance, referentiel });

    const caracteristiques = new CaracteristiquesComplementaires({
      localisationDonnees: 'france',
    }, referentiel);

    depot.ajouteCaracteristiquesAHomologation('123', caracteristiques)
      .then(() => depot.homologation('123'))
      .then(({ caracteristiquesComplementaires }) => {
        expect(caracteristiquesComplementaires.localisationDonnees).to.equal('france');
        done();
      })
      .catch(done);
  });

  it("met à jour les caractéristiques si elles existent déjà pour l'homologation", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [{
        id: '123',
        informationsGenerales: { nomService: 'nom' },
        caracteristiquesComplementaires: { presentation: 'Une présentation' },
      }],
    });
    const referentiel = Referentiel.creeReferentiel({ localisationsDonnees: { france: {} } });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance, referentiel });

    const caracteristiques = new CaracteristiquesComplementaires({
      localisationDonnees: 'france',
    }, referentiel);
    depot.ajouteCaracteristiquesAHomologation('123', caracteristiques)
      .then(() => depot.homologation('123'))
      .then(({ caracteristiquesComplementaires }) => {
        expect(caracteristiquesComplementaires.presentation).to.equal('Une présentation');
        expect(caracteristiquesComplementaires.localisationDonnees).to.equal('france');
        done();
      })
      .catch(done);
  });

  it('sait associer des parties prenantes à une homologation', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', informationsGenerales: { nomService: 'nom' } },
      ],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    const pp = new PartiesPrenantes({ autoriteHomologation: 'Jean Dupont' });
    depot.ajoutePartiesPrenantesAHomologation('123', pp)
      .then(() => depot.homologation('123'))
      .then(({ partiesPrenantes }) => {
        expect(partiesPrenantes.autoriteHomologation).to.equal('Jean Dupont');
        done();
      })
      .catch(done);
  });

  it('sait associer un risque à une homologation', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', informationsGenerales: { nomService: 'nom' } },
      ],
    });
    const referentiel = Referentiel.creeReferentiel({ risques: { unRisque: {} } });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance, referentiel });

    const risque = new RisqueGeneral({ id: 'unRisque', commentaire: 'Un commentaire' }, referentiel);
    depot.ajouteRisqueAHomologation('123', risque)
      .then(() => depot.homologation('123'))
      .then(({ risques }) => {
        expect(risques.risques.nombre()).to.equal(1);
        expect(risques.risques.item(0)).to.be.a(RisqueGeneral);
        expect(risques.risques.item(0).id).to.equal('unRisque');
        done();
      })
      .catch(done);
  });

  it('sait marquer une liste de risques comme vérifiée', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [{ id: '123' }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    depot.homologation('123')
      .then(({ risques }) => expect(risques.verifies()).to.be(false))
      .then(() => depot.marqueRisquesCommeVerifies('123'))
      .then(() => depot.homologation('123'))
      .then(({ risques }) => {
        expect(risques.verifies()).to.be(true);
        done();
      })
      .catch(done);
  });

  it("sait associer un avis d'expert cyber à une homologation", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', informationsGenerales: { nomService: 'nom' } },
      ],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    const avisExpert = new AvisExpertCyber({ avis: AvisExpertCyber.FAVORABLE });
    depot.ajouteAvisExpertCyberAHomologation('123', avisExpert)
      .then(() => depot.homologation('123'))
      .then(({ avisExpertCyber }) => {
        expect(avisExpertCyber.favorable()).to.be(true);
        done();
      })
      .catch(done);
  });

  describe("quand il reçoit une demande d'enregistrement d'une nouvelle homologation", () => {
    const adaptateurUUID = { genereUUID: () => {} };
    let depot;

    beforeEach(() => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [],
      });
      depot = DepotDonnees.creeDepot({ adaptateurPersistance, adaptateurUUID });
    });

    it('ajoute la nouvelle homologation au dépôt', (done) => {
      depot.homologations('123')
        .then((homologations) => expect(homologations.length).to.equal(0))
        .then(() => depot.nouvelleHomologation('123', { nomService: 'Super Service' }))
        .then(() => depot.homologations('123'))
        .then((homologations) => {
          expect(homologations.length).to.equal(1);
          expect(homologations[0].informationsGenerales.nomService).to.equal('Super Service');
          done();
        })
        .catch(done);
    });

    it("génère un UUID pour l'homologation créée", (done) => {
      adaptateurUUID.genereUUID = () => '11111111-1111-1111-1111-111111111111';

      depot.nouvelleHomologation('123', { nomService: 'Super Service' })
        .then((idHomologation) => expect(idHomologation).to.equal(
          '11111111-1111-1111-1111-111111111111'
        ))
        .then(() => depot.homologations('123'))
        .then((homologations) => {
          expect(homologations[0].id).to.equal('11111111-1111-1111-1111-111111111111');
          done();
        })
        .catch(done);
    });

    it('lève une exception si le nom du service est manquant', (done) => {
      depot.nouvelleHomologation('123', { nomService: '' })
        .then(() => done("La création de l'homologation aurait dû lever une exception"))
        .catch((e) => expect(e).to.be.an(ErreurNomServiceManquant))
        .then(() => done())
        .catch(done);
    });
  });

  it("retourne l'utilisateur authentifié", (done) => {
    const adaptateurJWT = {};

    bcrypt.hash('mdp_12345', 10)
      .then((hash) => {
        const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{
            id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: hash,
          }],
        });
        const depot = DepotDonnees.creeDepot({ adaptateurJWT, adaptateurPersistance });

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
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurJWT, adaptateurPersistance });

    depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345')
      .then((utilisateur) => expect(typeof utilisateur).to.be('undefined'))
      .then(() => depot.metsAJourMotDePasse('123', 'mdp_12345'))
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
      })
      .then(() => depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345'))
      .then((utilisateur) => expect(utilisateur.id).to.equal('123'))
      .then(() => done())
      .catch(done);
  });

  it("retient qu'un utilisateur accepte les CGU", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    depot.utilisateur('123')
      .then((utilisateur) => {
        expect(utilisateur.accepteCGU()).to.be(false);
        return utilisateur;
      })
      .then(depot.valideAcceptationCGUPourUtilisateur)
      .then(() => depot.utilisateur('123'))
      .then((utilisateur) => expect(utilisateur.accepteCGU()).to.be(true))
      .then(() => done())
      .catch(done);
  });

  it('sait si un utilisateur existe', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    depot.utilisateurExiste('123')
      .then((utilisateurExiste) => expect(utilisateurExiste).to.be(true))
      .then(() => depot.utilisateurExiste('999'))
      .then((utilisateurExiste) => expect(utilisateurExiste).to.be(false))
      .then(() => done())
      .catch(done);
  });

  it("retourne l'utilisateur associé à un identifiant donné", (done) => {
    const adaptateurJWT = 'Un adaptateur';
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurJWT, adaptateurPersistance });

    depot.utilisateur('123')
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
        done();
      })
      .catch(done);
  });

  it("retourne l'utilisateur associé à un identifiant reset de mot de passe", (done) => {
    const adaptateurJWT = 'Un adaptateur';
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', idResetMotDePasse: '999',
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurJWT, adaptateurPersistance });

    depot.utilisateurAFinaliser('999')
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
        done();
      })
      .catch(done);
  });

  describe("sur réception d'une demande d'enregistrement d'un nouvel utilisateur", () => {
    const adaptateurJWT = 'Un adaptateur';
    let depot;

    describe("quand l'utilisateur n'existe pas déjà", () => {
      let adaptateurPersistance;

      beforeEach(() => {
        let compteurId = 0;
        const adaptateurUUID = { genereUUID: () => { compteurId += 1; return `${compteurId}`; } };
        adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [],
        });
        depot = DepotDonnees.creeDepot({ adaptateurJWT, adaptateurPersistance, adaptateurUUID });
      });

      it("lève une exception et n'enregistre pas l'utilisateur si l'email n'est pas renseigné", (done) => {
        let utilisateurCree = false;
        adaptateurPersistance.ajouteUtilisateur = () => Promise.resolve(utilisateurCree = true);

        depot.nouvelUtilisateur({ prenom: 'Jean', nom: 'Dupont' })
          .then(() => done("La création de l'utilisateur aurait dû lever une ErreurEmailManquant"))
          .catch((erreur) => {
            expect(erreur).to.be.a(ErreurEmailManquant);
            expect(utilisateurCree).to.be(false);
            done();
          })
          .catch(done);
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
        depot.utilisateur('1')
          .then((u) => expect(u).to.be(undefined))
          .then(() => depot.nouvelUtilisateur({ prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' }))
          .then(() => depot.utilisateur('1'))
          .then((utilisateur) => {
            expect(utilisateur).to.be.an(Utilisateur);
            expect(utilisateur.idResetMotDePasse).to.equal('2');
            expect(utilisateur.prenom).to.equal('Jean');
            expect(utilisateur.nom).to.equal('Dupont');
            expect(utilisateur.email).to.equal('jean.dupont@mail.fr');
            expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);
            done();
          })
          .catch(done);
      });
    });

    describe("quand l'utilisateur existe déjà", () => {
      it('lève une `ErreurUtilisateurExistant`', (done) => {
        const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
          utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        });
        depot = DepotDonnees.creeDepot({ adaptateurPersistance });

        depot.nouvelUtilisateur({ email: 'jean.dupont@mail.fr' })
          .then(() => done('Une exception aurait dû être levée.'))
          .catch((e) => expect(e).to.be.a(ErreurUtilisateurExistant))
          .then(() => done())
          .catch(done);
      });
    });

    it('supprime un identifiant de reset de mot de passe', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr', idResetMotDePasse: '999' }],
      });
      depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.utilisateur('123')
        .then((utilisateur) => {
          expect(utilisateur.idResetMotDePasse).to.equal('999');
          depot.supprimeIdResetMotDePassePourUtilisateur(utilisateur);
        })
        .then(() => depot.utilisateur('123'))
        .then((utilisateur) => expect(utilisateur.idResetMotDePasse).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });

  describe('Sur demande réinitialisation du mot de passe', () => {
    it("ajoute un identifiant de reset de mot de passe à l'utilisateur", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
      });
      const adaptateurUUID = { genereUUID: () => '11111111-1111-1111-1111-111111111111' };
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.utilisateur('123')
        .then((u) => expect(u.idResetMotDePasse).to.be(undefined))
        .then(() => depot.reinitialiseMotDePasse('jean.dupont@mail.fr'))
        .then((u) => expect(u.idResetMotDePasse).to.equal('11111111-1111-1111-1111-111111111111'))
        .then(() => done())
        .catch(done);
    });

    it("échoue silencieusement si l'utilisateur est inconnu", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.reinitialiseMotDePasse('jean.dupont@mail.fr')
        .then((u) => expect(u).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });

  it('supprime une homologation avec un identifiant donné', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
      homologations: [
        { id: '123', idUtilisateur: '999', informationsGenerales: { nomService: 'Un service' } },
      ],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    depot.supprimeHomologation('123')
      .then(depot.homologation('123'))
      .then((h) => expect(h).to.be(undefined))
      .then(() => done())
      .catch(done);
  });

  describe("Sur demande de suppression d'un utilisateur", () => {
    it("supprime les homologations associées à l'utilisateur", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [
          { id: '123', idUtilisateur: '999', informationsGenerales: { nomService: 'Un service' } },
        ],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.supprimeUtilisateur('999')
        .then(() => depot.homologation('123'))
        .then((h) => expect(h).to.be(undefined))
        .then(() => done())
        .catch(done);
    });

    it("supprime l'utilisateur", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.supprimeUtilisateur('999')
        .then(() => depot.utilisateur('999'))
        .then((u) => expect(u).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });
});
