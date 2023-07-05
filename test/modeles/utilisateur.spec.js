const expect = require('expect.js');

const {
  ErreurDepartementInconnu,
  ErreurEmailManquant,
  ErreurProprieteManquante,
} = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const Utilisateur = require('../../src/modeles/utilisateur');

describe('Un utilisateur', () => {
  describe("sur demande d'un profil complet ou non", () => {
    it('considère le profil « complet » dès lors que le nom est renseigné', () => {
      const utilisateur = new Utilisateur({
        nom: 'Dupont',
        email: 'jean.dupont@mail.fr',
      });
      expect(utilisateur.profilEstComplet()).to.be(true);
    });

    it("considère le profil « incomplet » si le nom n'est pas renseigné", () => {
      const utilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr' });
      expect(utilisateur.profilEstComplet()).to.be(false);
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

  it('sait se convertir en JSON', () => {
    const utilisateur = new Utilisateur({
      id: '123',
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@mail.fr',
      telephone: '0100000000',
      motDePasse: 'XXX',
      postes: ['RSSI', 'Maire'],
      nomEntitePublique: 'Ville de Paris',
      departementEntitePublique: '75',
      infolettreAcceptee: true,
    });

    expect(utilisateur.toJSON()).to.eql({
      id: '123',
      cguAcceptees: false,
      prenomNom: 'Jean Dupont',
      telephone: '0100000000',
      initiales: 'JD',
      postes: ['RSSI', 'Maire'],
      posteDetaille: 'RSSI et Maire',
      nomEntitePublique: 'Ville de Paris',
      departementEntitePublique: '75',
      profilEstComplet: true,
      infolettreAcceptee: true,
    });
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

    adaptateurJWT.genereToken = (idUtilisateur, cguAcceptees, callback) => {
      expect(idUtilisateur).to.equal('123');
      expect(cguAcceptees).to.be(false);

      let aucuneErreur;
      callback(aucuneErreur, 'un jeton');
    };

    utilisateur.genereToken((erreur, token) => {
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
      'nomEntitePublique',
      'departementEntitePublique',
      'infolettreAcceptee',
      'postes.*',
    ];
    expect(Utilisateur.nomsProprietesBase()).to.eql(nomsProprietes);
  });

  describe("sur une demande de validation des données d'un utilisateur", () => {
    let donnees;
    const referentiel = Referentiel.creeReferentiel({
      departements: [
        { nom: 'Ain', code: '01' },
        { nom: 'Paris', code: '75' },
      ],
    });

    const verifiePresencePropriete = (clef, nom, done) => {
      delete donnees[clef];
      try {
        Utilisateur.valideDonnees(donnees, referentiel);
        done(
          `La validation des données d'un utilisateur sans ${nom} aurait du lever une erreur de propriété manquante`
        );
      } catch (error) {
        expect(error).to.be.a(ErreurProprieteManquante);
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
        nomEntitePublique: 'Ville de Paris',
        departementEntitePublique: '75',
        infolettreAcceptee: true,
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
        Utilisateur.valideDonnees(donnees, referentiel, true);
        done();
      } catch (erreur) {
        let messageEchec = `La validation des données d'un utilisateur existant sans email n'aurait pas du lever d'erreur : ${erreur.message}`;
        if (erreur instanceof ErreurProprieteManquante) {
          messageEchec =
            "La validation des données d'un utilisateur existant sans email n'aurait pas du lever d'erreur de propriété manquante";
        }
        done(messageEchec);
      }
    });

    it("exige que le nom de l'entité publique soit renseigné", (done) => {
      verifiePresencePropriete(
        'nomEntitePublique',
        "nom de l'entité publique",
        done
      );
    });

    it('exige que le département soit renseigné', (done) => {
      verifiePresencePropriete(
        'departementEntitePublique',
        "département de l'entité publique",
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

    it('exige un département présent dans le référentiel', (done) => {
      donnees.departementEntitePublique = 'codeDepartementInconnu';
      try {
        Utilisateur.valideDonnees(donnees, referentiel);
        done(
          "La validation des données d'un utilisateur avec un département hors référentiel aurait du lever une erreur"
        );
      } catch (error) {
        expect(error).to.be.a(ErreurDepartementInconnu);
        expect(error.message).to.equal(
          'Le département identifié par "codeDepartementInconnu" n\'est pas répertorié'
        );
        done();
      }
    });
  });
});
