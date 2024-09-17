const expect = require('expect.js');

const {
  ErreurEmailManquant,
  ErreurDonneesObligatoiresManquantes,
} = require('../../src/erreurs');
const Utilisateur = require('../../src/modeles/utilisateur');
const {
  fabriqueAdaptateurMailMemoire,
} = require('../../src/adaptateurs/adaptateurMailMemoire');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');

describe('Un utilisateur', () => {
  describe("sur demande d'un profil complet ou non", () => {
    it("considère le profil « complet » et sans champ manquant dès lors que le nom et le siret de l'entite sont renseignés", () => {
      const utilisateur = new Utilisateur({
        nom: 'Dupont',
        email: 'jean.dupont@mail.fr',
        entite: { siret: '12345' },
        estimationNombreServices: { borneBasse: '1', borneHaute: '10' },
      });
      expect(utilisateur.completudeProfil().estComplet).to.be(true);
      expect(utilisateur.completudeProfil().champsNonRenseignes).to.eql([]);
    });

    it("considère le profil « incomplet » à cause du nom, du SIRET et de l'estimation du nombre de services manquants s'ils ne sont pas renseignés", () => {
      const utilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr' });
      expect(utilisateur.completudeProfil().estComplet).to.be(false);
      expect(utilisateur.completudeProfil().champsNonRenseignes).to.eql([
        'nom',
        'siret',
        'estimationNombreServices',
      ]);
    });

    it("considère le profil « incomplet » à cause du SIRET manquant si le SIRET de l'entité n'est pas renseigné", () => {
      const utilisateur = new Utilisateur({
        nom: 'Dupont',
        email: 'jean.dupont@mail.fr',
        estimationNombreServices: { borneBasse: '1', borneHaute: '10' },
      });
      expect(utilisateur.completudeProfil().estComplet).to.be(false);
      expect(utilisateur.completudeProfil().champsNonRenseignes).to.eql([
        'siret',
      ]);
    });

    it("considère le profil « incomplet » à cause de l'estimation du nombre de services manquante si les bornes sont égales à zéro", () => {
      const utilisateur = new Utilisateur({
        nom: 'Dupont',
        email: 'jean.dupont@mail.fr',
        entite: { siret: '12345' },
        estimationNombreServices: { borneBasse: '0', borneHaute: '0' },
      });
      expect(utilisateur.completudeProfil().estComplet).to.be(false);
      expect(utilisateur.completudeProfil().champsNonRenseignes).to.eql([
        'estimationNombreServices',
      ]);
    });
  });

  describe('sur demande de ses initiales', () => {
    it('renvoie les initiales du prénom et du nom', () => {
      const utilisateur = new Utilisateur({
        prenom: 'Jean',
        nom: 'Dupont',
        email: 'jean.dupont@mail.fr',
      });
      expect(utilisateur.initiales()).to.equal('JD');
    });

    it('reste robuste en cas de prénom ou de nom absent', () => {
      const utilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr' });
      expect(utilisateur.initiales()).to.equal('');
    });
  });

  describe('sur demande du « prénom / nom »', () => {
    it('reste robuste si le nom est absent', () => {
      const utilisateur = new Utilisateur({
        prenom: 'Jean',
        email: 'jean.dupont@mail.fr',
      });
      expect(utilisateur.prenomNom()).to.equal('Jean');
    });

    it('reste robuste si le prénom est absent', () => {
      const utilisateur = new Utilisateur({
        nom: 'Dupont',
        email: 'jean.dupont@mail.fr',
      });
      expect(utilisateur.prenomNom()).to.equal('Dupont');
    });

    it("retourne l'email si le prénom et le nom sont absents", () => {
      const utilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr' });
      expect(utilisateur.prenomNom()).to.equal('jean.dupont@mail.fr');
    });
  });

  it('combine toutes les informations de postes sur demande de son poste détaillé', () => {
    const toutEnMemeTemps = new Utilisateur({
      email: 'jean.dupont@mail.fr',
      postes: ['RSSI', 'DPO', 'Maire'],
    });

    expect(toutEnMemeTemps.posteDetaille()).to.eql('RSSI, DPO et Maire');
  });

  it('sait générer son JWT', (done) => {
    const adaptateurJWT = {};
    const utilisateur = new Utilisateur(
      {
        id: '123',
        prenom: 'Jean',
        nom: 'Dupont',
        email: 'jean.dupont@mail.fr',
        cguAcceptees: false,
      },
      { adaptateurJWT }
    );

    adaptateurJWT.genereToken = (
      idUtilisateur,
      cguAcceptees,
      source,
      callback
    ) => {
      expect(idUtilisateur).to.equal('123');
      expect(cguAcceptees).to.be(false);
      expect(source).to.be('source');

      let aucuneErreur;
      callback(aucuneErreur, 'un jeton');
    };

    utilisateur.genereToken('source', (erreur, token) => {
      if (erreur) done(erreur);
      expect(token).to.equal('un jeton');

      done();
    });
  });

  it('sait détecter si les conditions générales ont été acceptées', () => {
    const utilisateur = new Utilisateur({
      email: 'jean.dupont@mail.fr',
      cguAcceptees: true,
    });
    expect(utilisateur.accepteCGU()).to.be(true);

    const autreUtilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr' });
    expect(autreUtilisateur.accepteCGU()).to.be(false);
  });

  it('sait détecter si le transactionnel a été acceptée', () => {
    const utilisateur = new Utilisateur({
      email: 'jean.dupont@mail.fr',
      transactionnelAccepte: true,
    });
    expect(utilisateur.accepteTransactionnel()).to.be(true);

    const autreUtilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr' });
    expect(autreUtilisateur.accepteTransactionnel()).to.be(false);
  });

  it("sait détecter si l'infolettre a été acceptée", () => {
    const utilisateur = new Utilisateur({
      email: 'jean.dupont@mail.fr',
      infolettreAcceptee: true,
    });
    expect(utilisateur.accepteInfolettre()).to.be(true);

    const autreUtilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr' });
    expect(autreUtilisateur.accepteInfolettre()).to.be(false);
  });

  it("exige que l'adresse électronique soit renseignée", (done) => {
    try {
      new Utilisateur({ prenom: 'Jean', nom: 'Dupont' });
      done(
        "La création de l'utilisateur aurait dû lever une ErreurEmailManquant"
      );
    } catch (e) {
      expect(e).to.be.a(ErreurEmailManquant);
      done();
    }
  });

  it('connaît sa date de création', () => {
    const dateCreation = new Date(2000, 1, 1, 12, 0);
    const utilisateur = new Utilisateur({
      dateCreation,
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'email',
    });

    expect(utilisateur.dateCreation).to.be.ok();
    expect(utilisateur.dateCreation).to.eql(dateCreation);
  });

  it('connaît la liste des noms de ses propriétés de base', () => {
    const nomsProprietes = [
      'prenom',
      'nom',
      'email',
      'telephone',
      'cguAcceptees',
      'infolettreAcceptee',
      'transactionnelAccepte',
      'postes.*',
      'estimationNombreServices.*',
    ];
    expect(Utilisateur.nomsProprietesBase()).to.eql(nomsProprietes);
  });

  describe("sur une demande de validation des données d'un utilisateur", () => {
    let donnees;

    const verifiePresencePropriete = (clef, nom, done) => {
      if (clef.includes('.')) {
        const clefs = clef.split('.');
        delete donnees[clefs[0]][clefs[1]];
      } else {
        delete donnees[clef];
      }
      try {
        Utilisateur.valideDonnees(donnees);
        done(
          `La validation des données d'un utilisateur sans ${nom} aurait du lever une erreur de donnée manquante`
        );
      } catch (error) {
        expect(error).to.be.a(ErreurDonneesObligatoiresManquantes);
        expect(error.message).to.equal(`La propriété "${clef}" est requise`);
        done();
      }
    };

    beforeEach(() => {
      donnees = {
        prenom: 'Sandy',
        nom: 'Ferrance',
        email: 'sandy.ferrance@domaine.co',
        postes: ['RSSI'],
        entite: {
          siret: '7524242424',
        },
        estimationNombreServices: {
          borneBasse: 1,
          borneHaute: 10,
        },
        infolettreAcceptee: true,
        transactionnelAccepte: true,
      };
    });

    it('exige que le prénom soit renseigné', (done) => {
      verifiePresencePropriete('prenom', 'prénom', done);
    });

    it('exige que le nom soit renseigné', (done) => {
      verifiePresencePropriete('nom', 'nom', done);
    });

    it("exige que l'e-mail soit renseigné quand l'utilisateur est inexistant", (done) => {
      verifiePresencePropriete('email', 'e-mail', done);
    });

    it("n'exige pas que l'e-mail soit renseigné quand l'utilisateur existe déjà", (done) => {
      delete donnees.email;
      try {
        Utilisateur.valideDonnees(donnees, true);
        done();
      } catch (erreur) {
        let messageEchec = `La validation des données d'un utilisateur existant sans email n'aurait pas du lever d'erreur : ${erreur.message}`;
        if (erreur instanceof ErreurDonneesObligatoiresManquantes) {
          messageEchec =
            "La validation des données d'un utilisateur existant sans email n'aurait pas du lever d'erreur de propriété manquante";
        }
        done(messageEchec);
      }
    });

    it("exige que le SIRET de l'entité soit renseigné", (done) => {
      verifiePresencePropriete('entite.siret', "SIRET de l'entité", done);
    });

    it("exige que l'estimation du nombre de services soit renseignée", (done) => {
      verifiePresencePropriete(
        'estimationNombreServices',
        'Estimation du nombre de services',
        done
      );
    });

    it('exige que les postes soient renseignés', (done) => {
      verifiePresencePropriete('postes', 'Postes', done);
    });

    it("exige que l'information d'acceptation de l'infolettre soit renseignée", (done) => {
      verifiePresencePropriete(
        'infolettreAcceptee',
        'infolettre acceptée',
        done
      );
    });
  });

  describe('sur demande de changement de ses préférences de communication', () => {
    let adaptateurEmail;

    beforeEach(() => {
      adaptateurEmail = fabriqueAdaptateurMailMemoire();
    });

    const jeanDupont = () => unUtilisateur().avecEmail('jean.dupont@mail.fr');

    it("s'inscrit à l'infolettre s'il passe de « non » à « oui » sur ce canal de communication", async () => {
      let inscriptionEffectuee;
      adaptateurEmail.inscrisInfolettre = async (email) => {
        inscriptionEffectuee = email;
      };
      adaptateurEmail.desinscrisInfolettre = async () => {
        throw new Error('Ce test ne devrait pas déclencher de désinscription');
      };

      const refusait = jeanDupont().quiRefuseInfolettre().construis();
      await refusait.changePreferencesCommunication(
        { infolettreAcceptee: true },
        adaptateurEmail
      );

      expect(inscriptionEffectuee).to.be('jean.dupont@mail.fr');
    });

    it("se désinscrit de l'infolettre s'il passe de « oui » à « non » sur ce canal de communication ", async () => {
      let desinscriptionEffectuee;
      adaptateurEmail.desinscrisInfolettre = async (email) => {
        desinscriptionEffectuee = email;
      };
      adaptateurEmail.inscrisInfolettre = async () => {
        throw new Error("Ce test ne devrait pas déclencher d'inscription");
      };

      const acceptait = jeanDupont().quiAccepteInfolettre().construis();
      await acceptait.changePreferencesCommunication(
        { infolettreAcceptee: false },
        adaptateurEmail
      );

      expect(desinscriptionEffectuee).to.be('jean.dupont@mail.fr');
    });

    it("s'inscrit aux emails transactionnels s'il passe de « non » à « oui » sur ce canal de communications", async () => {
      let inscriptionEffectuee;
      adaptateurEmail.inscrisEmailsTransactionnels = async (email) => {
        inscriptionEffectuee = email;
      };
      adaptateurEmail.desinscrisEmailsTransactionnels = async () => {
        throw new Error('Ce test ne devrait pas déclencher de désinscription');
      };

      const refusait = jeanDupont()
        .quiRefuseEmailsTransactionnels()
        .construis();

      await refusait.changePreferencesCommunication(
        { transactionnelAccepte: true },
        adaptateurEmail
      );

      expect(inscriptionEffectuee).to.be('jean.dupont@mail.fr');
    });

    it("se déinscrit des emails transactionnels s'il passe de « oui » à « non » sur ce canal de communications", async () => {
      let desinscriptionEffectuee;
      adaptateurEmail.desinscrisEmailsTransactionnels = async (email) => {
        desinscriptionEffectuee = email;
      };
      adaptateurEmail.inscrisEmailsTransactionnels = async () => {
        throw new Error("Ce test ne devrait pas déclencher d'inscription");
      };

      const acceptait = jeanDupont()
        .quiAccepteEmailsTransactionnels()
        .construis();

      await acceptait.changePreferencesCommunication(
        { transactionnelAccepte: false },
        adaptateurEmail
      );

      expect(desinscriptionEffectuee).to.be('jean.dupont@mail.fr');
    });

    it('sait dire si un utilisateur a toutes les informations fournies par AgentConnect', () => {
      const utilisateurComplet = unUtilisateur()
        .avecEmail('jean.dujardin@beta.gouv.fr')
        .quiSAppelle('Jean Dujardin')
        .quiTravaillePourUneEntiteAvecSiret('unSIRET')
        .construis();
      const utilisateurIncomplet = unUtilisateur().construis();

      expect(utilisateurComplet.aLesInformationsAgentConnect()).to.be(true);
      expect(utilisateurIncomplet.aLesInformationsAgentConnect()).to.be(false);
    });
  });
});
