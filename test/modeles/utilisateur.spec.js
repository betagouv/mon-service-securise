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

  it('connaît ses initiales', () => {
    const jeanDupont = new Utilisateur({
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@mail.fr',
    });
    expect(jeanDupont.initiales()).to.equal('JD');
  });

  it('connaît son « prénom / nom »', () => {
    const jeanDupont = new Utilisateur({
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@mail.fr',
    });
    expect(jeanDupont.prenomNom()).to.equal('Jean Dupont');
  });

  it('combine toutes les informations de postes sur demande de son poste détaillé', () => {
    const toutEnMemeTemps = new Utilisateur({
      email: 'jean.dupont@mail.fr',
      postes: ['RSSI', 'DPO', 'Maire'],
    });

    expect(toutEnMemeTemps.posteDetaille()).to.eql('RSSI, DPO et Maire');
  });

  describe('concernant la génération de son token JWT', () => {
    const adaptateurJWT = {
      genereToken: (idUtilisateur, cguAcceptees, source, estInvite) => ({
        idUtilisateur,
        cguAcceptees,
        source,
        estInvite,
      }),
    };

    it('sait générer son JWT', () => {
      const jean = new Utilisateur(
        { id: '123', email: 'jean.dupont@mail.fr', cguAcceptees: 'v1' },
        { adaptateurJWT, cguActuelles: 'v1' }
      );

      const token = jean.genereToken('source');

      expect(token.idUtilisateur).to.be('123');
      expect(token.cguAcceptees).to.be(true);
      expect(token.estInvite).to.be(false);
      expect(token.source).to.be('source');
    });

    it('indique des CGU non-acceptées si ce ne sont pas les CGU *actuelles* qui ont été acceptées', () => {
      const accepteOsboletes = new Utilisateur(
        { id: '123', email: 'a@b.fr', cguAcceptees: 'v1.0' },
        { cguActuelles: 'v2.0', adaptateurJWT }
      );
      const tokenAvecObsoletes = accepteOsboletes.genereToken('');
      expect(tokenAvecObsoletes.cguAcceptees).to.be(false);
    });

    it("indique qu'il s'agit d'un invité si les CGU n'ont jamais été acceptées (i.e. `cguAcceptees` est `undefined`)", () => {
      const jamaisAcceptees = new Utilisateur(
        { id: '123', email: 'a@b.fr', cguAcceptees: undefined },
        { cguActuelles: 'v1.0', adaptateurJWT }
      );
      const tokenInvite = jamaisAcceptees.genereToken('');
      expect(tokenInvite.estInvite).to.be(true);
    });
  });

  it('sait détecter si les conditions générales actuelles ont été acceptées', () => {
    const accepteLesActuelles = new Utilisateur(
      { email: 'jean.dupont@mail.fr', cguAcceptees: 'v1.0' },
      { cguActuelles: 'v1.0' }
    );
    expect(accepteLesActuelles.accepteCGU()).to.be(true);

    const jamaisAcceptees = new Utilisateur(
      { email: 'jean.dupont@mail.fr' },
      { cguActuelles: 'v1.0' }
    );
    expect(jamaisAcceptees.accepteCGU()).to.be(false);

    const accepteObsoletes = new Utilisateur(
      { email: 'jean.dupont@mail.fr', cguAcceptees: 'v1.0' },
      { cguActuelles: 'v1.1-8' }
    );
    expect(accepteObsoletes.accepteCGU()).to.be(false);
  });

  it("est considéré comme « invité » s'il n'a aucune version de CGU acceptée (i.e. les CGU acceptées sont `undefined`)", () => {
    const unInvite = new Utilisateur({
      email: 'jean.dupont@mail.fr',
      cguAcceptees: undefined,
    });

    expect(unInvite.estUnInvite()).to.be(true);
  });

  it("n'est plus un invité dès lors qu'une version de CGU a été acceptée, même s'il s'agit de CGU osbolètes", () => {
    const accepteObsolete = new Utilisateur(
      { email: 'jean.dupont@mail.fr', cguAcceptees: 'v1' },
      { cguActuelles: 'v2' }
    );

    expect(accepteObsolete.estUnInvite()).to.be(false);
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
