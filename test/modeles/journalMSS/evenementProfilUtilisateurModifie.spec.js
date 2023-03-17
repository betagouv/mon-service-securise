const expect = require('expect.js');
const EvenementProfilUtilisateurModifie = require('../../../src/modeles/journalMSS/evenementProfilUtilisateurModifie');
const { ErreurIdentifiantUtilisateurManquant } = require('../../../src/modeles/journalMSS/erreurs');

describe('Un événement de profil utilisateur modifié', () => {
  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("chiffre l'identifiant de l'utilisateur qui lui est donné", () => {
    const evenement = new EvenementProfilUtilisateurModifie(
      { idUtilisateur: 'abc' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON().donnees.idUtilisateur).to.be('ABC');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementProfilUtilisateurModifie(
      { idUtilisateur: 'abc', departementEntitePublique: '33' },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).to.eql({
      type: 'PROFIL_UTILISATEUR_MODIFIE',
      donnees: { idUtilisateur: 'ABC', departementOrganisation: '33', roles: [] },
      date: '17/11/2022',
    });
  });

  describe("utilise les données reçues pour déterminer le(s) rôle(s) de l'utilisateur", () => {
    it('se base sur le champ `rssi` pour indiquer le rôle « RSSI »', () => {
      const utilisateurRssi = { idUtilisateur: 'abc', rssi: true };
      const evenement = new EvenementProfilUtilisateurModifie(
        utilisateurRssi,
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      expect(evenement.toJSON().donnees.roles).to.eql(['RSSI']);
    });

    it('se base sur le champ `delegueProtectionDonnees` pour indiquer le rôle « DPO »', () => {
      const utilisateurDpo = { idUtilisateur: 'abc', delegueProtectionDonnees: true };
      const evenement = new EvenementProfilUtilisateurModifie(
        utilisateurDpo,
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      expect(evenement.toJSON().donnees.roles).to.eql(['DPO']);
    });
  });

  it("exige que l'identifiant utilisateur soit renseigné", (done) => {
    try {
      new EvenementProfilUtilisateurModifie(
        { },
        { adaptateurChiffrement: hacheEnMajuscules }
      );

      done(Error("L'instanciation de l'événement aurait dû lever une exception"));
    } catch (e) {
      expect(e).to.be.an(ErreurIdentifiantUtilisateurManquant);
      done();
    }
  });
});
