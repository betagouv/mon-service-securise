const expect = require('expect.js');
const { unUtilisateur } = require('../constructeurs/constructeurUtilisateur');
const ServiceProfilAnssi = require('../../src/profilAnssi/serviceProfilAnssi');

describe('Le Service chargé de communiquer avec MonProfilAnssi', () => {
  describe('sur demande de synchronisation du profil utilisateur', () => {
    const utilisateurDansMSS = unUtilisateur()
      .avecId('U1')
      .quiSAppelle('Jeanne Dupont')
      .quiTravaillePour({ nom: 'ANSSI', departement: '75', siret: '12345' })
      .avecTelephone('0102030405')
      .avecPostes(['RSSI'])
      .avecEmail('jeanne.dupont@mail.com')
      .construis();
    let depotDonnees;
    let adaptateurProfilAnssi;

    beforeEach(() => {
      depotDonnees = {
        utilisateur: async () => utilisateurDansMSS,
        metsAJourUtilisateur: async () => {},
      };
      adaptateurProfilAnssi = {
        recupere: async () => {},
      };
    });

    it('mets à jour les données de MSS', async () => {
      const profilAnssi = {
        nom: 'Dupont2',
        prenom: 'Jeanne2',
        telephone: '01020304052',
        domainesSpecialite: ['RSSI2'],
        organisation: {
          nom: 'ANSSI2',
          departement: '752',
          siret: '123452',
        },
      };
      let idRecu;
      let donneesRecues;
      let emailRecu;
      depotDonnees.metsAJourUtilisateur = async (id, donnees) => {
        idRecu = id;
        donneesRecues = donnees;
      };
      adaptateurProfilAnssi.recupere = async (email) => {
        emailRecu = email;
        return profilAnssi;
      };

      const service = new ServiceProfilAnssi({
        depotDonnees,
        adaptateurProfilAnssi,
      });

      await service.synchroniseProfilUtilisateur('U1');

      expect(emailRecu).to.be('jeanne.dupont@mail.com');
      expect(idRecu).to.be('U1');
      expect(donneesRecues).to.eql({
        nom: 'Dupont2',
        prenom: 'Jeanne2',
        telephone: '01020304052',
        postes: ['RSSI2'],
        entite: {
          nom: 'ANSSI2',
          departement: '752',
          siret: '123452',
        },
      });
    });

    it('ne mets pas à jour les données de MSS si le profil est identique', async () => {
      const profilAnssi = {
        nom: 'Dupont',
        prenom: 'Jeanne',
        telephone: '0102030405',
        domainesSpecialite: ['RSSI'],
        organisation: {
          nom: 'ANSSI',
          departement: '75',
          siret: '12345',
        },
      };
      let miseAJourFaite = false;
      depotDonnees.metsAJourUtilisateur = async () => {
        miseAJourFaite = true;
      };
      adaptateurProfilAnssi.recupere = async () => profilAnssi;

      const service = new ServiceProfilAnssi({
        depotDonnees,
        adaptateurProfilAnssi,
      });

      await service.synchroniseProfilUtilisateur('U1');

      expect(miseAJourFaite).to.be(false);
    });

    it('ne mets pas à jour les données de MSS si des données optionnelles ne sont pas présentes dans MPA', async () => {
      const profilAnssi = {
        nom: 'Dupont2',
        prenom: 'Jeanne2',
        domainesSpecialite: ['RSSI', 'DPO'],
      };
      let donneesRecues;
      depotDonnees.metsAJourUtilisateur = async (_, donnees) => {
        donneesRecues = donnees;
      };
      adaptateurProfilAnssi.recupere = async () => profilAnssi;

      const service = new ServiceProfilAnssi({
        depotDonnees,
        adaptateurProfilAnssi,
      });

      await service.synchroniseProfilUtilisateur('U1');

      expect(donneesRecues).to.eql({
        nom: 'Dupont2',
        prenom: 'Jeanne2',
        postes: ['RSSI', 'DPO'],
      });
    });

    it('ne fait rien si MPA ne retourne rien', async () => {
      let methodeAppelee = false;
      depotDonnees.metsAJourUtilisateur = async () => {
        methodeAppelee = true;
      };
      adaptateurProfilAnssi.recupere = async () => undefined;

      const service = new ServiceProfilAnssi({
        depotDonnees,
        adaptateurProfilAnssi,
      });

      await service.synchroniseProfilUtilisateur('U1');

      expect(methodeAppelee).to.be(false);
    });
  });
});
