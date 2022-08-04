const expect = require('expect.js');

const { ErreurDepartementInconnu, ErreurEmailManquant, ErreurProprieteManquante } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const Utilisateur = require('../../src/modeles/utilisateur');

describe('Un utilisateur', () => {
  describe('sur demande de ses initiales', () => {
    it('renvoie les initiales du prénom et du nom', () => {
      const utilisateur = new Utilisateur({ prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr' });
      expect(utilisateur.initiales()).to.equal('JD');
    });

    it('reste robuste en cas de prénom ou de nom absent', () => {
      const utilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr' });
      expect(utilisateur.initiales()).to.equal('…');
    });
  });

  describe('sur demande du « prénom / nom »', () => {
    it('reste robuste si le nom est absent', () => {
      const utilisateur = new Utilisateur({ prenom: 'Jean', email: 'jean.dupont@mail.fr' });
      expect(utilisateur.prenomNom()).to.equal('Jean');
    });

    it('reste robuste si le prénom est absent', () => {
      const utilisateur = new Utilisateur({ nom: 'Dupont', email: 'jean.dupont@mail.fr' });
      expect(utilisateur.prenomNom()).to.equal('Dupont');
    });

    it("retourne l'email si le prénom et le nom sont absents", () => {
      const utilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr' });
      expect(utilisateur.prenomNom()).to.equal('jean.dupont@mail.fr');
    });
  });

  it('sait se convertir en JSON', () => {
    const utilisateur = new Utilisateur({
      id: '123',
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'jean.dupont@mail.fr',
      telephone: '0100000000',
      motDePasse: 'XXX',
      poste: 'RSSI',
      rssi: true,
      delegueProtectionDonnees: false,
      nomEntitePublique: 'Ville de Paris',
      departementEntitePublique: '75',
    });

    expect(utilisateur.toJSON()).to.eql({
      id: '123',
      cguAcceptees: false,
      prenomNom: 'Jean Dupont',
      telephone: '0100000000',
      initiales: 'JD',
      poste: 'RSSI',
      rssi: true,
      delegueProtectionDonnees: false,
      nomEntitePublique: 'Ville de Paris',
      departementEntitePublique: '75',
    });
  });

  it('sait générer son JWT', (done) => {
    const adaptateurJWT = {};
    const utilisateur = new Utilisateur({
      id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', cguAcceptees: false,
    }, adaptateurJWT);

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
    const utilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr', cguAcceptees: true });
    expect(utilisateur.accepteCGU()).to.be(true);

    const autreUtilisateur = new Utilisateur({ email: 'jean.dupont@mail.fr' });
    expect(autreUtilisateur.accepteCGU()).to.be(false);
  });

  it("exige que l'adresse électronique soit renseignée", (done) => {
    try {
      new Utilisateur({ prenom: 'Jean', nom: 'Dupont' });
      done("La création de l'utilisateur aurait dû lever une ErreurEmailManquant");
    } catch (e) {
      expect(e).to.be.a(ErreurEmailManquant);
      done();
    }
  });

  it('connaît sa date de création', () => {
    const dateCreation = new Date(2000, 1, 1, 12, 0);
    const utilisateur = new Utilisateur({ dateCreation, prenom: 'Jean', nom: 'Dupont', email: 'email' }, {});

    expect(utilisateur.dateCreation).to.be.ok();
    expect(utilisateur.dateCreation).to.eql(dateCreation);
  });
  describe("sur une demande de validation pour la création d'un nouvel utilisateur", () => {
    let donnees;
    const referentiel = Referentiel.creeReferentiel({ departements: [
      { nom: 'Ain', code: '01', codeRegion: '84' },
      { nom: 'Paris', code: '75', codeRegion: '11' },
    ] });

    const verifiePresencePropriete = (clef, nom, done) => {
      delete donnees[clef];
      try {
        Utilisateur.valideCreationNouvelUtilisateur(donnees, referentiel);
        done(`La validation de la création d'un nouvel utilisateur sans ${nom} aurait du lever une erreur de propriété manquante`);
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
        rssi: true,
        delegueProtectionDonnees: false,
        nomEntitePublique: 'Ville de Paris',
        departementEntitePublique: '75',
      };
    });

    it('exige que le prénom soit renseigné', (done) => {
      verifiePresencePropriete('prenom', 'prénom', done);
    });

    it('exige que le nom soit renseigné', (done) => {
      verifiePresencePropriete('nom', 'nom', done);
    });

    it("exige que l'e-mail soit renseigné", (done) => {
      verifiePresencePropriete('email', 'e-mail', done);
    });

    it("exige que le nom de l'entité publique soit renseigné", (done) => {
      verifiePresencePropriete('nomEntitePublique', "nom de l'entité publique", done);
    });

    it('exige que le département soit renseigné', (done) => {
      verifiePresencePropriete('departementEntitePublique', "département de l'entité publique", done);
    });

    it("exige que l'information de RSSI soit renseigné", (done) => {
      verifiePresencePropriete('rssi', 'RSSI', done);
    });

    it("exige que l'information de délégué à la protection des données soit renseigné", (done) => {
      verifiePresencePropriete('delegueProtectionDonnees', 'délégué à la protection des données', done);
    });

    it('exige un département présent dans le référentiel', (done) => {
      donnees.departementEntitePublique = 'codeDepartementInconnu';
      try {
        Utilisateur.valideCreationNouvelUtilisateur(donnees, referentiel);
        done("La validation de la création d'un nouvel utilisateur avec un département hors référentiel aurait du lever une erreur");
      } catch (error) {
        expect(error).to.be.a(ErreurDepartementInconnu);
        expect(error.message).to.equal("Le département identifié par \"codeDepartementInconnu\" n'est pas répertorié");
        done();
      }
    });
  });

  it('connaît la liste des noms de ses propriétés de base', () => {
    const nomsProprietes = [
      'prenom',
      'nom',
      'email',
      'telephone',
      'cguAcceptees',
      'poste',
      'rssi',
      'delegueProtectionDonnees',
      'nomEntitePublique',
      'departementEntitePublique',
    ];
    expect(Utilisateur.nomsProprietesBase()).to.eql(nomsProprietes);
  });
});
