const expect = require('expect.js');
const EvenementProfilUtilisateurModifie = require('../../../src/modeles/journalMSS/evenementProfilUtilisateurModifie');
const {
  ErreurUtilisateurManquant,
} = require('../../../src/modeles/journalMSS/erreurs');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');

describe('Un événement de profil utilisateur modifié', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("chiffre l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementProfilUtilisateurModifie(
      unUtilisateur().avecId('abc').construis(),
      null,
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateur).to.be('ABC');
  });

  describe("lorsque les détails de l'entité lui sont passés", () => {
    const entite = {
      estServicePublic: false,
      estFiness: false,
      estEss: true,
      estEntrepreneurIndividuel: false,
      estAssociation: false,
      categorieEntreprise: null,
      activitePrincipale: '68.20B',
      trancheEffectifSalarie: null,
      natureJuridique: '6540',
      sectionActivitePrincipale: 'L',
      anneeTrancheEffectifSalarie: null,
      commune: '33376',
      departement: '33',
    };

    it("consigne les détails dans l'évènement", () => {
      const evenement = new EvenementProfilUtilisateurModifie(
        unUtilisateur().avecId('abc').quiDependDu('33').construis(),
        entite,
        { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
      );

      expect(evenement.donnees.entite).to.eql(entite);
    });

    it('sait se convertir en JSON', () => {
      const evenement = new EvenementProfilUtilisateurModifie(
        unUtilisateur().avecId('abc').quiDependDu('33').construis(),
        entite,
        { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
      );

      expect(evenement.toJSON()).to.eql({
        type: 'PROFIL_UTILISATEUR_MODIFIE',
        donnees: {
          idUtilisateur: 'ABC',
          roles: [],
          departementOrganisation: '33',
          estimationNombreServices: {
            borneBasse: 1,
            borneHaute: 10,
          },
          entite,
        },
        date: '17/11/2022',
      });
    });
  });

  describe("lorsque les détails de l'entité ne lui sont pas passés", () => {
    it("consigne le département de l'entité de l'utilisateur", () => {
      const evenement = new EvenementProfilUtilisateurModifie(
        unUtilisateur().avecId('abc').quiDependDu('33').construis(),
        null,
        { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
      );

      expect(evenement.donnees.departementOrganisation).to.equal('33');
    });

    it('sait se convertir en JSON', () => {
      const evenement = new EvenementProfilUtilisateurModifie(
        unUtilisateur().avecId('abc').quiDependDu('33').construis(),
        null,
        { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
      );

      expect(evenement.toJSON()).to.eql({
        type: 'PROFIL_UTILISATEUR_MODIFIE',
        donnees: {
          idUtilisateur: 'ABC',
          roles: [],
          departementOrganisation: '33',
          estimationNombreServices: {
            borneBasse: 1,
            borneHaute: 10,
          },
          entite: {},
        },
        date: '17/11/2022',
      });
    });
  });

  it("utilise les données reçues pour déterminer le(s) rôle(s) de l'utilisateur", () => {
    const utilisateurRssi = unUtilisateur()
      .avecPostes(['RSSI', 'DPO', 'Maire'])
      .construis();
    const evenement = new EvenementProfilUtilisateurModifie(
      utilisateurRssi,
      null,
      {
        adaptateurChiffrement: hacheEnMajuscules,
      }
    );

    expect(evenement.toJSON().donnees.roles).to.eql(['RSSI', 'DPO', 'Maire']);
  });

  it("exige que l'utilisateur soit renseigné", (done) => {
    try {
      new EvenementProfilUtilisateurModifie(null, null, {
        adaptateurChiffrement: hacheEnMajuscules,
      });

      done(
        Error("L'instanciation de l'événement aurait dû lever une exception")
      );
    } catch (e) {
      expect(e).to.be.an(ErreurUtilisateurManquant);
      done();
    }
  });
});
