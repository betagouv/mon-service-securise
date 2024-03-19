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
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateur).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementProfilUtilisateurModifie(
      unUtilisateur().avecId('abc').quiDependDu('33').construis(),
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'PROFIL_UTILISATEUR_MODIFIE',
      donnees: {
        idUtilisateur: 'ABC',
        departementOrganisation: '33',
        roles: [],
      },
      date: '17/11/2022',
    });
  });

  it("utilise les données reçues pour déterminer le(s) rôle(s) de l'utilisateur", () => {
    const utilisateurRssi = unUtilisateur()
      .avecPostes(['RSSI', 'DPO', 'Maire'])
      .construis();
    const evenement = new EvenementProfilUtilisateurModifie(utilisateurRssi, {
      adaptateurChiffrement: hacheEnMajuscules,
    });

    expect(evenement.toJSON().donnees.roles).to.eql(['RSSI', 'DPO', 'Maire']);
  });

  it("exige que l'utilisateur soit renseigné", (done) => {
    try {
      new EvenementProfilUtilisateurModifie(null, {
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
