const expect = require('expect.js');
const bcrypt = require('bcrypt');

const DepotDonnees = require('../src/depotDonnees');
const {
  ErreurAutorisationExisteDeja,
  ErreurEmailManquant,
  ErreurHomologationInexistante,
  ErreurNomServiceDejaExistant,
  ErreurNomServiceManquant,
  ErreurUtilisateurExistant,
  ErreurUtilisateurInexistant,
} = require('../src/erreurs');
const AdaptateurPersistanceMemoire = require('../src/adaptateurs/adaptateurPersistanceMemoire');
const AutorisationContributeur = require('../src/modeles/autorisations/autorisationContributeur');
const AutorisationCreateur = require('../src/modeles/autorisations/autorisationCreateur');
const AvisExpertCyber = require('../src/modeles/avisExpertCyber');
const CaracteristiquesComplementaires = require('../src/modeles/caracteristiquesComplementaires');
const DescriptionService = require('../src/modeles/descriptionService');
const Homologation = require('../src/modeles/homologation');
const MesureGenerale = require('../src/modeles/mesureGenerale');
const MesureSpecifique = require('../src/modeles/mesureSpecifique');
const MesuresSpecifiques = require('../src/modeles/mesuresSpecifiques');
const PartiesPrenantes = require('../src/modeles/partiesPrenantes');
const RisqueGeneral = require('../src/modeles/risqueGeneral');
const RisqueSpecifique = require('../src/modeles/risqueSpecifique');
const RisquesSpecifiques = require('../src/modeles/risquesSpecifiques');
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
        { id: '123', descriptionService: { nomService: 'Super Service' } },
        { id: '789', descriptionService: { nomService: 'Autre service' } },
      ],
      utilisateurs: [
        { id: '456', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' },
      ],
      autorisations: [
        { idUtilisateur: '456', idHomologation: '123', type: 'createur' },
        { idUtilisateur: '999', idHomologation: '789', type: 'createur' },
      ],
    });

    const depot = DepotDonnees.creeDepot({ adaptateurPersistance, referentiel: 'Le référentiel' });
    depot.homologations('456')
      .then((homologations) => {
        expect(homologations.length).to.equal(1);
        expect(homologations[0]).to.be.a(Homologation);
        expect(homologations[0].id).to.equal('123');
        expect(homologations[0].referentiel).to.equal('Le référentiel');

        expect(homologations[0].createur).to.be.ok();
        expect(homologations[0].createur.id).to.equal('456');
        done();
      })
      .catch(done);
  });

  it("vérifie que l'utilisateur a accès à l'homologation", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      autorisations: [
        { idUtilisateur: '456', idHomologation: '123', type: 'createur' },
      ],
    });

    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });
    depot.accesAutorise('456', '123')
      .then((accesAutorise) => expect(accesAutorise).to.be(true))
      .then(() => depot.accesAutorise('456', '999'))
      .then((accesAutorise) => expect(accesAutorise).to.be(false))
      .then(() => done())
      .catch(done);
  });

  it('peut retrouver une homologation à partir de son identifiant', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '789', idUtilisateur: '999', descriptionService: { nomService: 'nom' } },
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

  it("associe ses contributeurs à l'homologation", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{ id: '111', email: 'createur@mail.fr' }, { id: '999', email: 'contributeur@mail.fr' }],
      homologations: [
        { id: '789', descriptionService: { nomService: 'nom' } },
      ],
      autorisations: [
        { idHomologation: '789', idUtilisateur: '111', type: 'createur' },
        { idHomologation: '789', idUtilisateur: '999', type: 'contributeur' },
      ],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance, referentiel: 'Le référentiel' });

    depot.homologation('789')
      .then((homologation) => {
        const { contributeurs } = homologation;
        expect(contributeurs.length).to.equal(1);
        expect(contributeurs[0].id).to.equal('999');
        done();
      })
      .catch(done);
  });

  it('sait associer une mesure spécifique à une homologation', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', descriptionService: { nomService: 'nom' } },
      ],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    const mesures = new MesuresSpecifiques({ mesuresSpecifiques: [{ description: 'Une mesure spécifique' }] });
    depot.remplaceMesuresSpecifiquesPourHomologation('123', mesures)
      .then(() => depot.homologation('123'))
      .then(({ mesures: { mesuresSpecifiques } }) => {
        expect(mesuresSpecifiques.nombre()).to.equal(1);
        expect(mesuresSpecifiques.item(0)).to.be.a(MesureSpecifique);
        expect(mesuresSpecifiques.item(0).description).to.equal('Une mesure spécifique');
        done();
      })
      .catch(done);
  });

  describe('concernant les mesures générales', () => {
    let valideMesure;

    before(() => {
      valideMesure = MesureGenerale.valide;
      MesureGenerale.valide = () => {};
    });

    after(() => (MesureGenerale.valide = valideMesure));

    it('renseigne les mesures associées à une homologation', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [{
          id: '123',
          descriptionService: { nomService: 'Un service' },
          mesuresGenerales: [{ id: 'identifiantMesure', statut: 'fait' }],
        }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.homologation('123')
        .then(({ mesures: { mesuresGenerales } }) => {
          expect(mesuresGenerales.nombre()).to.equal(1);

          const mesure = mesuresGenerales.item(0);
          expect(mesure).to.be.a(MesureGenerale);
          expect(mesure.id).to.equal('identifiantMesure');
          done();
        })
        .catch(done);
    });

    it('sait associer une mesure à une homologation', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [
          { id: '123', descriptionService: { nomService: 'Un service' } },
        ],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });
      const mesure = new MesureGenerale({ id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT });

      depot.ajouteMesureGeneraleAHomologation('123', mesure)
        .then(() => depot.homologation('123'))
        .then(({ mesures: { mesuresGenerales } }) => {
          expect(mesuresGenerales.nombre()).to.equal(1);
          expect(mesuresGenerales.item(0).id).to.equal('identifiantMesure');
          done();
        })
        .catch(done);
    });

    it("met à jour les données de la mesure si elle est déjà associée à l'homologation", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [
          {
            id: '123',
            descriptionService: { nomService: 'nom' },
            mesures: [{ id: 'identifiantMesure', statut: MesureGenerale.STATUT_PLANIFIE }],
          },
        ],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      const mesure = new MesureGenerale({ id: 'identifiantMesure', statut: MesureGenerale.STATUT_FAIT });
      depot.ajouteMesureGeneraleAHomologation('123', mesure)
        .then(() => depot.homologation('123'))
        .then(({ mesures: { mesuresGenerales } }) => {
          expect(mesuresGenerales.nombre()).to.equal(1);
          expect(mesuresGenerales.item(0).statut).to.equal(MesureGenerale.STATUT_FAIT);
          done();
        })
        .catch(done);
    });
  });

  describe("sur demande de mise à jour de la description du service d'une homologation", () => {
    it("met à jour la description du service d'une homologation", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        autorisations: [{ idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [{ id: '123', descriptionService: { nomService: 'Super Service' } }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      const description = new DescriptionService({ nomService: 'Nouveau Nom' });
      depot.ajouteDescriptionServiceAHomologation('999', '123', description)
        .then(() => depot.homologation('123'))
        .then(({ descriptionService }) => {
          expect(descriptionService.nomService).to.equal('Nouveau Nom');
          done();
        })
        .catch(done);
    });

    it('lève une exception si le nom du service est absent', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        autorisations: [{ idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [{ id: '123', descriptionService: { nomService: 'Super Service' } }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      const description = new DescriptionService({ nomService: '' });
      depot.ajouteDescriptionServiceAHomologation('999', '123', description)
        .then(() => done(
          'La mise à jour de la description du service aurait dû lever une exception'
        ))
        .catch((e) => {
          expect(e).to.be.an(ErreurNomServiceManquant);
          expect(e.message).to.equal('Le nom du service ne peut pas être vide');
          done();
        })
        .catch(done);
    });

    it("ne détecte pas de doublon sur le nom de service pour l'homologation en cours de mise à jour", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        autorisations: [{ idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [
          { id: '123', descriptionService: { nomService: 'Super Service', presenceResponsable: 'non' } },
        ],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      const description = new DescriptionService({ nomService: 'Super Service', presenceResponsable: 'oui' });
      depot.ajouteDescriptionServiceAHomologation('999', '123', description)
        .then(() => depot.homologation('123'))
        .then(({ descriptionService }) => {
          expect(descriptionService.presenceResponsable).to.equal('oui');
          done();
        })
        .catch(done);
    });
  });

  it('sait associer des caractéristiques complémentaires à une homologation', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', descriptionService: { nomService: 'nom' } },
      ],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    const caracteristiques = new CaracteristiquesComplementaires({
      entitesExternes: [{ nom: 'Un nom', contact: 'Une adresse' }],
    });

    depot.ajouteCaracteristiquesAHomologation('123', caracteristiques)
      .then(() => depot.homologation('123'))
      .then(({ caracteristiquesComplementaires }) => {
        expect(caracteristiquesComplementaires.entitesExternes.item(0).nom).to.equal('Un nom');
        done();
      })
      .catch(done);
  });

  it("met à jour les caractéristiques si elles existent déjà pour l'homologation", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [{
        id: '123',
        descriptionService: { nomService: 'nom' },
        caracteristiquesComplementaires: { entitesExternes: [] },
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    const caracteristiques = new CaracteristiquesComplementaires({
      entitesExternes: [{ nom: 'Un nom', contact: 'Une adresse' }],
    });
    depot.ajouteCaracteristiquesAHomologation('123', caracteristiques)
      .then(() => depot.homologation('123'))
      .then(({ caracteristiquesComplementaires }) => {
        expect(caracteristiquesComplementaires.entitesExternes.item(0).nom).to.equal('Un nom');
        expect(caracteristiquesComplementaires.entitesExternes.item(0).contact).to.equal('Une adresse');
        done();
      })
      .catch(done);
  });

  it('met à jour les parties prenantes avec les parties prenantes spécifiques', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [{
        id: '123',
        descriptionService: { nomService: 'nom' },
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    const entitesExternes = [{ nom: 'nom', contact: 'contact', acces: 'acces' }];

    depot.ajoutePartiesPrenantesSpecifiquesAHomologation('123', entitesExternes)
      .then(() => depot.homologation('123'))
      .then(({ partiesPrenantes }) => {
        expect(partiesPrenantes.partiesPrenantes.item(0).nom).to.equal('nom');
        expect(partiesPrenantes.partiesPrenantes.item(0).natureAcces).to.equal('acces');
        expect(partiesPrenantes.partiesPrenantes.item(0).pointContact).to.equal('contact');
        done();
      })
      .catch(done);
  });

  it('conserve les anciennes parties prenantes lors de la mise à jour avec les parties prenantes spécifiques', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [{
        id: '123',
        descriptionService: { nomService: 'nom' },
        partiesPrenantes: { partiesPrenantes: [{ type: 'Hebergement', nom: 'hébergeur' }] },
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    depot.ajoutePartiesPrenantesSpecifiquesAHomologation('123', [{ nom: 'nom' }])
      .then(() => depot.homologation('123'))
      .then(({ partiesPrenantes }) => {
        expect(partiesPrenantes.partiesPrenantes.tous()).to.have.length(2);
        expect(partiesPrenantes.partiesPrenantes.specifiques()[0].nom).to.equal('nom');
        done();
      })
      .catch(done);
  });

  it('écrase les anciennes parties prenantes spécifique lors de la mise à jour de celles-ci dans les parties prenantes', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [{
        id: '123',
        descriptionService: { nomService: 'nom' },
        partiesPrenantes: { partiesPrenantes: [{ type: 'PartiePrenanteSpecifique', nom: 'ancien nom' }] },
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    depot.ajoutePartiesPrenantesSpecifiquesAHomologation('123', [{ nom: 'nom' }])
      .then(() => depot.homologation('123'))
      .then(({ partiesPrenantes }) => {
        expect(partiesPrenantes.partiesPrenantes.nombre()).to.equal(1);
        expect(partiesPrenantes.partiesPrenantes.item(0).nom).to.equal('nom');
        done();
      })
      .catch(done);
  });

  it('ne met pas à jour les parties prenantes avec des entités externes vides', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [{
        id: '123',
        descriptionService: { nomService: 'nom' },
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    depot.ajoutePartiesPrenantesSpecifiquesAHomologation('123', [])
      .then(() => depot.homologation('123'))
      .then(({ partiesPrenantes }) => {
        expect(partiesPrenantes.partiesPrenantes.nombre()).to.equal(0);
        done();
      })
      .catch(done);
  });

  it('sait associer des parties prenantes à une homologation', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', descriptionService: { nomService: 'nom' } },
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

  it('sait enregistrer les parties prenantes en rôles et responsabilités', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [{
        id: '123',
        descriptionService: { nomService: 'nom' },
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    const partiesPrenantes = new PartiesPrenantes({ autoriteHomologation: 'Jean Dupont' });
    depot.ajoutePartiesPrenantesAHomologation('123', partiesPrenantes)
      .then(() => depot.homologation('123'))
      .then(({ rolesResponsabilites }) => {
        expect(rolesResponsabilites).to.be.ok();
        expect(rolesResponsabilites.autoriteHomologation).to.equal('Jean Dupont');
        done();
      })
      .catch(done);
  });

  it('met à jour les caractéristiques complémentaires avec les entités externes', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [{
        id: '123',
        descriptionService: { nomService: 'nom' },
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    depot.ajouteEntitesExternesAHomologation('123', [{ nom: 'Un nom', contact: 'jean.dupont@mail.fr', acces: 'Accès administrateur' }])
      .then(() => depot.homologation('123'))
      .then(({ caracteristiquesComplementaires }) => {
        expect(caracteristiquesComplementaires.entitesExternes.item(0).nom).to.equal('Un nom');
        expect(caracteristiquesComplementaires.entitesExternes.item(0).contact).to.equal('jean.dupont@mail.fr');
        expect(caracteristiquesComplementaires.entitesExternes.item(0).acces).to.equal('Accès administrateur');
        done();
      })
      .catch(done);
  });

  describe('concernant les risques généraux', () => {
    let valideRisque;

    before(() => {
      valideRisque = RisqueGeneral.valide;
      RisqueGeneral.valide = () => {};
    });

    after(() => (RisqueGeneral.valide = valideRisque));

    it('sait associer un risque général à une homologation', (done) => {
      RisqueGeneral.valide = () => {};

      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        homologations: [
          { id: '123', descriptionService: { nomService: 'nom' } },
        ],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      const risque = new RisqueGeneral({ id: 'unRisque', commentaire: 'Un commentaire' });
      depot.ajouteRisqueGeneralAHomologation('123', risque)
        .then(() => depot.homologation('123'))
        .then(({ risques }) => {
          expect(risques.risquesGeneraux.nombre()).to.equal(1);
          expect(risques.risquesGeneraux.item(0)).to.be.a(RisqueGeneral);
          expect(risques.risquesGeneraux.item(0).id).to.equal('unRisque');
          done();
        })
        .catch(done);
    });
  });

  it('sait associer un risque spécifique à une homologation', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', descriptionService: { nomService: 'nom' } },
      ],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    const risque = new RisquesSpecifiques({ risquesSpecifiques: [{ description: 'Un risque' }] });
    depot.remplaceRisquesSpecifiquesPourHomologation('123', risque)
      .then(() => depot.homologation('123'))
      .then(({ risques: { risquesSpecifiques } }) => {
        expect(risquesSpecifiques.nombre()).to.equal(1);
        expect(risquesSpecifiques.item(0)).to.be.a(RisqueSpecifique);
        expect(risquesSpecifiques.item(0).description).to.equal('Un risque');
        done();
      })
      .catch(done);
  });

  it('supprime les risques spécifiques précédemment associés', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [{
        id: '123',
        descriptionService: { nomService: 'nom' },
        risquesSpecifiques: [{ description: 'Un ancien risque' }],
      }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    const risques = new RisquesSpecifiques({ risquesSpecifiques: [{ description: 'Un nouveau risque' }] });
    depot.remplaceRisquesSpecifiquesPourHomologation('123', risques)
      .then(() => depot.homologation('123'))
      .then(({ risques: { risquesSpecifiques } }) => {
        expect(risquesSpecifiques.nombre()).to.equal(1);
        expect(risquesSpecifiques.item(0)).to.be.a(RisqueSpecifique);
        expect(risquesSpecifiques.item(0).description).to.equal('Un nouveau risque');
        done();
      })
      .catch(done);
  });

  it("sait associer un avis d'expert cyber à une homologation", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      homologations: [
        { id: '123', descriptionService: { nomService: 'nom' } },
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
    const adaptateurUUID = { genereUUID: () => 'unUUID' };
    let depot;

    beforeEach(() => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        homologations: [],
        autorisations: [],
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
          expect(homologations[0].descriptionService.nomService).to.equal('Super Service');
          done();
        })
        .catch(done);
    });

    it("déclare un accès entre l'utilisateur et l'homologation", (done) => {
      depot.autorisations('123')
        .then((as) => expect(as.length).to.equal(0))
        .then(() => depot.nouvelleHomologation('123', { nomService: 'SuperService' }))
        .then(() => depot.autorisations('123'))
        .then((as) => {
          expect(as.length).to.equal(1);
          const autorisation = as[0];
          expect(autorisation).to.be.an(AutorisationCreateur);
          expect(autorisation.idHomologation).to.equal('unUUID');
          expect(autorisation.idUtilisateur).to.equal('123');
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

    it('lève une exception si le nom du service existe déjà pour une autre homologation', (done) => {
      depot.nouvelleHomologation('123', { nomService: 'Un nom' })
        .then(() => depot.nouvelleHomologation('123', { nomService: 'Un nom' }))
        .then(() => done("La création de l'homologation aurait dû lever une exception"))
        .catch((e) => {
          expect(e).to.be.an(ErreurNomServiceDejaExistant);
          expect(e.message).to.equal('Le nom du service "Un nom" existe déjà pour une autre homologation');
          done();
        })
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

  it("met à jour le mot de passe d'un utilisateur", (done) => {
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

  describe('sur demande de mise à jour des informations du profil utilisateur', () => {
    let depot;

    beforeEach(() => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' }],
      });

      depot = DepotDonnees.creeDepot({ adaptateurPersistance });
    });

    it('met les informations à jour', (done) => {
      depot.metsAJourUtilisateur('123', { prenom: 'Jérôme', nom: 'Dubois' })
        .then(() => depot.utilisateur('123'))
        .then((u) => {
          expect(u.prenom).to.equal('Jérôme');
          expect(u.nom).to.equal('Dubois');
          done();
        })
        .catch(done);
    });

    it('ignore les demandes de changement de mot de passe', (done) => {
      depot.metsAJourMotDePasse('123', 'mdp_12345')
        .then(() => depot.metsAJourUtilisateur('123', { nom: 'Dubois', motDePasse: 'non pris en compte' }))
        .then(() => depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345'))
        .then((u) => {
          if (!u) throw new Error("Le dépôt aurait dû authentifier l'utilisateur avec le mot de passe inchangé");

          expect(u.id).to.equal('123');
          done();
        })
        .catch(done);
    });
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

  describe('sur vérification existence homologation avec un nom de service donné', () => {
    it('détecte existence homologation', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        homologations: [{
          id: '789', descriptionService: { nomService: 'Un service existant' },
        }],
        autorisations: [{ idUtilisateur: '123', idHomologation: '789', type: 'createur' }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.homologationExiste('123', 'Un nom de service')
        .then((homologationExiste) => expect(homologationExiste).to.be(false))
        .then(() => depot.homologationExiste('123', 'Un service existant'))
        .then((homologationExiste) => expect(homologationExiste).to.be(true))
        .then(() => done())
        .catch(done);
    });

    it("ne considère que les homologations de l'utilisateur donné", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '123', email: 'jean.dupont@mail.fr' },
          { id: '456', email: 'sylvie.martin@mail.fr' },
        ],
        homologations: [{
          id: '789', idUtilisateur: '123', descriptionService: { nomService: 'Un service existant' },
        }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.homologationExiste('456', 'Un service existant')
        .then((homologationExiste) => expect(homologationExiste).to.be(false))
        .then(() => done())
        .catch(done);
    });

    it("ne considère pas l'homologation en cours de mise à jour", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '123', email: 'jean.dupont@mail.fr' }],
        homologations: [
          { id: '888', descriptionService: { nomService: 'Un service existant' } },
          { id: '999', descriptionService: { nomService: 'Un nom de service' } },
        ],
        autorisations: [
          { idUtilisateur: '123', idHomologation: '888', type: 'createur' },
          { idUtilisateur: '123', idHomologation: '999', type: 'createur' },
        ],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.homologationExiste('123', 'Un service existant', '888')
        .then((homologationExiste) => expect(homologationExiste).to.be(false))
        .then(() => depot.homologationExiste('123', 'Un service existant', '999'))
        .then((homologationExiste) => expect(homologationExiste).to.be(true))
        .then(() => done())
        .catch(done);
    });
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
        { id: '123', idUtilisateur: '999', descriptionService: { nomService: 'Un service' } },
      ],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    depot.supprimeHomologation('123')
      .then(depot.homologation('123'))
      .then((h) => expect(h).to.be(undefined))
      .then(() => done())
      .catch(done);
  });

  describe("sur demande de suppression d'un utilisateur", () => {
    it("supprime les homologations associées à l'utilisateur", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
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
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.supprimeUtilisateur('999')
        .then(() => depot.utilisateur('999'))
        .then((u) => expect(u).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });

  describe("Sur demande de transfert des autorisations d'un utilisateur à un autre", () => {
    it("vérifie que l'utilisateur source existe", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({});
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.transfereAutorisations('999', '000')
        .then(() => done('Le transfert aurait dû lever une erreur'))
        .catch((erreur) => {
          expect(erreur).to.be.a(ErreurUtilisateurInexistant);
          expect(erreur.message).to.equal("L'utilisateur \"999\" n'existe pas");
          done();
        })
        .catch(done);
    });

    it("vérifie que l'utilisateur cible existe", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.transfereAutorisations('999', '000')
        .then(() => done('Le transfert aurait dû lever une erreur'))
        .catch((erreur) => {
          expect(erreur).to.be.a(ErreurUtilisateurInexistant);
          expect(erreur.message).to.equal("L'utilisateur \"000\" n'existe pas");
          done();
        })
        .catch(done);
    });

    it('effectue le transfert', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', email: 'jean.dupont@mail.fr' },
          { id: '000', email: 'autre.utilisateur@mail.fr' },
        ],
        homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.transfereAutorisations('999', '000')
        .then(() => depot.autorisations('999'))
        .then((as) => expect(as.length).to.equal(0))
        .then(() => depot.autorisations('000'))
        .then((as) => {
          expect(as.length).to.equal(1);
          expect(as[0]).to.be.an(AutorisationCreateur);
          expect(as[0].idHomologation).to.equal('123');
          done();
        })
        .catch(done);
    });
  });

  describe("sur recherche d'une autorisation", () => {
    it("retourne l'autorisation persistée", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
        homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

      depot.autorisation('456')
        .then((a) => {
          expect(a).to.be.an(AutorisationCreateur);
          expect(a.id).to.equal('456');
          expect(a.idUtilisateur).to.equal('999');
          expect(a.idHomologation).to.equal('123');
          done();
        })
        .catch(done);
    });

    it("retourne `undefined` si l'autorisation est inexistante", (done) => {
      DepotDonnees.creeDepotVide()
        .then((depot) => depot.autorisation('123'))
        .then((autorisation) => expect(autorisation).to.be(undefined))
        .then(() => done())
        .catch(done);
    });
  });

  it('sait si une autorisation existe', (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
      homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
      autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });

    depot.autorisationExiste('999', '123')
      .then((existe) => expect(existe).to.be(true))
      .then(() => depot.autorisationExiste('999', '000'))
      .then((existe) => expect(existe).to.be(false))
      .then(() => depot.autorisationExiste('000', '123'))
      .then((existe) => expect(existe).to.be(false))
      .then(() => done())
      .catch(done);
  });

  describe("sur demande d'ajout d'un contributeur à une homologation", () => {
    const adaptateurUUID = { genereUUID: () => {} };

    it('lève une erreur si le contributeur est inexistant', (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', email: 'jean.dupont@mail.fr' },
        ],
        homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.ajouteContributeurAHomologation('000', '123')
        .then(() => done("L'ajout aurait du lever une erreur"))
        .catch((erreur) => {
          expect(erreur).to.be.a(ErreurUtilisateurInexistant);
          expect(erreur.message).to.equal("Le contributeur \"000\" n'existe pas");
          done();
        })
        .catch(done);
    });

    it("lève une erreur si l'homologation est inexistante", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', email: 'jean.dupont@mail.fr' },
          { id: '000', email: 'contributeur@mail.fr' },
        ],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.ajouteContributeurAHomologation('000', '123')
        .then(() => done("L'ajout aurait du lever une erreur"))
        .catch((erreur) => {
          expect(erreur).to.be.a(ErreurHomologationInexistante);
          expect(erreur.message).to.equal("L'homologation \"123\" n'existe pas");
          done();
        })
        .catch(done);
    });

    it("lève une erreur si l'autorisation existe déjà", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', email: 'jean.dupont@mail.fr' },
        ],
        homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
      });
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.ajouteContributeurAHomologation('999', '123')
        .then(() => done("L'ajout aurait du lever une erreur"))
        .catch((erreur) => {
          expect(erreur).to.be.a(ErreurAutorisationExisteDeja);
          expect(erreur.message).to.equal("L'autorisation existe déjà");
          done();
        })
        .catch(done);
    });

    it("persiste l'autorisation", (done) => {
      const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
        utilisateurs: [
          { id: '999', email: 'jean.dupont@mail.fr' },
          { id: '000', email: 'contributeur@mail.fr' },
        ],
        homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
        autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
      });
      adaptateurUUID.genereUUID = () => '789';
      const depot = DepotDonnees.creeDepot({ adaptateurPersistance, adaptateurUUID });

      depot.ajouteContributeurAHomologation('000', '123')
        .then(() => depot.autorisation('789'))
        .then((a) => {
          expect(a).to.be.a(AutorisationContributeur);
          expect(a.idHomologation).to.equal('123');
          expect(a.idUtilisateur).to.equal('000');
          done();
        })
        .catch(done);
    });
  });

  it("connaît l'autorisation pour un utilisateur et une homologation donnée", (done) => {
    const adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
      homologations: [{ id: '123', descriptionService: { nomService: 'Un service' } }],
      autorisations: [{ id: '456', idUtilisateur: '999', idHomologation: '123', type: 'createur' }],
    });
    const depot = DepotDonnees.creeDepot({ adaptateurPersistance });
    depot.autorisationPour('999', '123')
      .then((a) => {
        expect(a).to.be.an(AutorisationCreateur);
        expect(a.id).to.equal('456');
        done();
      })
      .catch(done);
  });
});
