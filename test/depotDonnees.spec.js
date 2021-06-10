const expect = require('expect.js');
const bcrypt = require('bcrypt');

const DepotDonnees = require('../src/depotDonnees');
const Homologation = require('../src/modeles/homologation');
const Utilisateur = require('../src/modeles/utilisateur');

describe('Le dépôt de données', () => {
  describe('quand il est vide', () => {
    it('ne retourne aucune homologation pour un utilisateur donné', () => {
      const depot = DepotDonnees.creeDepotVide();
      expect(depot.homologations('456')).to.eql([]);
    });

    it('ne retourne rien si on cherche une homologation à partir de son identifiant', () => {
      const depot = DepotDonnees.creeDepotVide();
      expect(depot.homologation('123')).to.be(undefined);
    });

    it("n'authentifie pas l'utilisateur", (done) => {
      const depot = DepotDonnees.creeDepotVide();
      depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345')
        .then((utilisateur) => {
          expect(utilisateur).to.be(undefined);
          done();
        })
        .catch((error) => done(error));
    });
  });

  it("connaît toutes les homologations d'un utilisateur donné", () => {
    const depot = DepotDonnees.creeDepot({
      homologations: [
        { id: '123', idUtilisateur: '456', nomService: 'Super Service' },
        { id: '789', idUtilisateur: '999', nomService: 'Un autre service' },
      ],
    });

    const homologations = depot.homologations('456');
    expect(homologations.length).to.equal(1);
    expect(homologations[0]).to.be.a(Homologation);
    expect(homologations[0].id).to.equal('123');
  });

  it('peut retrouver une homologation à partir de son identifiant', () => {
    const depot = DepotDonnees.creeDepot({
      homologations: [
        { id: '789', idUtilisateur: '999', nomService: 'Un autre service' },
      ],
    });

    const homologation = depot.homologation('789');
    expect(homologation).to.be.a(Homologation);
    expect(homologation.id).to.equal('789');
  });

  it("retourne l'utilisateur authentifié", (done) => {
    const adaptateurJWT = {};

    bcrypt.hash('mdp_12345', 10)
      .then(async (hash) => {
        const depot = DepotDonnees.creeDepot({
          utilisateurs: [{
            id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: hash,
          }],
        }, adaptateurJWT);

        return depot.utilisateurAuthentifie('jean.dupont@mail.fr', 'mdp_12345');
      })
      .then((utilisateur) => {
        expect(utilisateur).to.be.an(Utilisateur);
        expect(utilisateur.id).to.equal('123');
        expect(utilisateur.adaptateurJWT).to.equal(adaptateurJWT);

        done();
      })
      .catch((error) => done(error));
  });

  it("retourne l'utilisateur associé à un identifiant donné", () => {
    const fauxAdaptateurJWT = 'Un adaptateur';
    const depot = DepotDonnees.creeDepot({
      utilisateurs: [{
        id: '123', prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@mail.fr', motDePasse: 'XXX',
      }],
    }, fauxAdaptateurJWT);

    const utilisateur = depot.utilisateur('123');
    expect(utilisateur).to.be.an(Utilisateur);
    expect(utilisateur.id).to.equal('123');
    expect(utilisateur.adaptateurJWT).to.equal(fauxAdaptateurJWT);
  });

  describe("quand il reçoit une demande d'enregistrement d'une nouvelle homologation", () => {
    const adaptateurUUID = { genereUUID: () => {} };
    let depot;

    beforeEach(() => {
      depot = DepotDonnees.creeDepot({ homologations: [] }, "Pas besoin d'adaptateur JWT", adaptateurUUID);
    });

    it('ajoute la nouvelle homologation au dépôt', () => {
      expect(depot.homologations('123').length).to.equal(0);

      depot.nouvelleHomologation('123', { nomService: 'Super Service' });

      const homologations = depot.homologations('123');
      expect(homologations.length).to.equal(1);
      expect(homologations[0].nomService).to.equal('Super Service');
    });

    it("génère un UUID pour l'homologation créée", () => {
      adaptateurUUID.genereUUID = () => '11111111-1111-1111-1111-111111111111';

      const idHomologation = depot.nouvelleHomologation('123', { nomService: 'Super Service' });
      expect(idHomologation).to.equal('11111111-1111-1111-1111-111111111111');

      const homologations = depot.homologations('123');
      expect(homologations[0].id).to.equal('11111111-1111-1111-1111-111111111111');
    });
  });
});
