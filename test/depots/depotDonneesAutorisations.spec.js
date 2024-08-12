const expect = require('expect.js');
const { depotVide } = require('./depotVide');
const DepotDonneesAutorisations = require('../../src/depots/depotDonneesAutorisations');
const DepotDonneesServices = require('../../src/depots/depotDonneesServices');
const DepotDonneesUtilisateurs = require('../../src/depots/depotDonneesUtilisateurs');
const {
  ErreurAutorisationExisteDeja,
  ErreurAutorisationInexistante,
  ErreurServiceInexistant,
  ErreurUtilisateurInexistant,
  ErreurSuppressionImpossible,
} = require('../../src/erreurs');
const {
  unePersistanceMemoire,
} = require('../constructeurs/constructeurAdaptateurPersistanceMemoire');
const {
  Rubriques,
  Permissions,
} = require('../../src/modeles/autorisations/gestionDroits');
const {
  uneAutorisation,
} = require('../constructeurs/constructeurAutorisation');
const {
  EvenementAutorisationsServiceModifiees,
} = require('../../src/bus/evenementAutorisationsServiceModifiees');
const { fabriqueBusPourLesTests } = require('../bus/aides/busPourLesTests');
const fauxAdaptateurChiffrement = require('../mocks/adaptateurChiffrement');

const { DECRIRE, SECURISER, HOMOLOGUER, CONTACTS, RISQUES } = Rubriques;
const { ECRITURE, LECTURE } = Permissions;

describe('Le dépôt de données des autorisations', () => {
  const creeDepot = (
    adaptateurPersistance,
    adaptateurUUID,
    busEvenements,
    depotServices
  ) =>
    DepotDonneesAutorisations.creeDepot({
      adaptateurPersistance,
      adaptateurUUID,
      depotServices:
        depotServices ||
        DepotDonneesServices.creeDepot({
          adaptateurChiffrement: fauxAdaptateurChiffrement(),
          adaptateurPersistance,
        }),
      depotUtilisateurs: DepotDonneesUtilisateurs.creeDepot({
        adaptateurPersistance,
      }),
      busEvenements: busEvenements ?? fabriqueBusPourLesTests(),
    });

  describe("sur demande de validation d'autorisation d'accès", () => {
    it("retourne `false` si aucune n'autorisation n'existe pour cet utilisateur et ce service", async () => {
      const depot = creeDepot(unePersistanceMemoire().construis());

      const accesAutorise123 = await depot.accesAutorise('456', '123');

      expect(accesAutorise123).to.be(false);
    });

    it('retourne `true` si le niveau de permission est suffisant pour cette rubrique', async () => {
      const avecDroitEcriture = unePersistanceMemoire()
        .ajouteUneAutorisation(
          uneAutorisation()
            .deProprietaire('456', '123')
            .avecDroits({ [DECRIRE]: ECRITURE }).donnees
        )
        .construis();

      const depot = creeDepot(avecDroitEcriture);

      const accesAutoriseEnLecture = await depot.accesAutorise('456', '123', {
        [DECRIRE]: LECTURE,
      });

      expect(accesAutoriseEnLecture).to.be(true);
    });

    it("retourne `false` si le niveau de permission n'est pas suffisant pour cette rubrique", async () => {
      const avecDroitLecture = unePersistanceMemoire()
        .ajouteUneAutorisation(
          uneAutorisation()
            .deContributeur('456', '123')
            .avecDroits({ [DECRIRE]: LECTURE }).donnees
        )
        .construis();
      const depot = creeDepot(avecDroitLecture);

      const accesAutoriseEnEcriture = await depot.accesAutorise('456', '123', {
        [DECRIRE]: ECRITURE,
      });

      expect(accesAutoriseEnEcriture).to.be(false);
    });
  });

  describe("sur recherche d'une autorisation", () => {
    it("retourne l'autorisation persistée", async () => {
      const adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur({ id: '999', email: 'jean.dupont@mail.fr' })
        .ajouteUnService({
          id: '123',
          descriptionService: { nomService: 'Un service' },
        })
        .ajouteUneAutorisation(
          uneAutorisation().avecId('456').deProprietaire('999', '123').donnees
        )
        .construis();

      const depot = creeDepot(adaptateurPersistance);

      const a = await depot.autorisation('456');

      expect(a.estProprietaire).to.be(true);
      expect(a.id).to.equal('456');
      expect(a.idUtilisateur).to.equal('999');
      expect(a.idService).to.equal('123');
    });

    it("retourne `undefined` si l'autorisation est inexistante", async () => {
      const depot = await depotVide();
      const autorisation = await depot.autorisation('123');
      expect(autorisation).to.be(undefined);
    });
  });

  describe("sur demande d'ajout d'un contributeur à un service", () => {
    const adaptateurUUID = { genereUUID: () => {} };

    it('lève une erreur si le contributeur est inexistant', async () => {
      const adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur({ id: '999', email: 'jean.dupont@mail.fr' })
        .ajouteUnService({
          id: '123',
          descriptionService: { nomService: 'Un service' },
        })
        .ajouteUneAutorisation(
          uneAutorisation().avecId('456').deProprietaire('999', '123').donnees
        )
        .construis();

      const depot = creeDepot(adaptateurPersistance);

      try {
        await depot.ajouteContributeurAuService(
          uneAutorisation().deContributeur('000', '123').construis()
        );
        expect().to.fail("L'ajout aurait du lever une erreur");
      } catch (erreur) {
        expect(erreur).to.be.a(ErreurUtilisateurInexistant);
        expect(erreur.message).to.equal('Le contributeur "000" n\'existe pas');
      }
    });

    it('lève une erreur si le service est inexistant', async () => {
      const adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur({ id: '999', email: 'jean.dupont@mail.fr' })
        .ajouteUnUtilisateur({ id: '000', email: 'contributeur@mail.fr' })
        .construis();

      const depot = creeDepot(adaptateurPersistance);

      try {
        await depot.ajouteContributeurAuService(
          uneAutorisation().deContributeur('000', '123').construis()
        );
        expect().to.fail("L'ajout aurait du lever une erreur");
      } catch (erreur) {
        expect(erreur).to.be.a(ErreurServiceInexistant);
        expect(erreur.message).to.equal('Le service "123" n\'existe pas');
      }
    });

    it("lève une erreur si l'autorisation existe déjà", async () => {
      const adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur({ id: '999', email: 'jean.dupont@mail.fr' })
        .ajouteUnService({
          id: '123',
          descriptionService: { nomService: 'Un service' },
        })
        .ajouteUneAutorisation(
          uneAutorisation().avecId('456').deProprietaire('999', '123').donnees
        )
        .construis();

      const depot = creeDepot(adaptateurPersistance);

      try {
        await depot.ajouteContributeurAuService(
          uneAutorisation().deContributeur('999', '123').construis()
        );
        expect().to.fail("L'ajout aurait du lever une erreur");
      } catch (erreur) {
        expect(erreur).to.be.a(ErreurAutorisationExisteDeja);
        expect(erreur.message).to.equal("L'autorisation existe déjà");
      }
    });

    it("persiste l'autorisation", async () => {
      const adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnUtilisateur({ id: '999', email: 'jean.dupont@mail.fr' })
        .ajouteUnUtilisateur({ id: '000', email: 'contributeur@mail.fr' })
        .ajouteUnService({
          id: '123',
          descriptionService: { nomService: 'Un service' },
        })
        .ajouteUneAutorisation(
          uneAutorisation().avecId('456').deContributeur('999', '123').donnees
        )
        .construis();

      adaptateurUUID.genereUUID = () => '789';
      const depot = creeDepot(adaptateurPersistance, adaptateurUUID);

      await depot.ajouteContributeurAuService(
        uneAutorisation()
          .deContributeur('000', '123')
          .avecTousDroitsEcriture()
          .construis()
      );

      const a = await depot.autorisation('789');

      expect(a.estProprietaire).to.be(false);
      expect(a.idService).to.equal('123');
      expect(a.idUtilisateur).to.equal('000');
      expect(a.droits).to.eql({
        [DECRIRE]: ECRITURE,
        [SECURISER]: ECRITURE,
        [HOMOLOGUER]: ECRITURE,
        [RISQUES]: ECRITURE,
        [CONTACTS]: ECRITURE,
      });
    });

    it("publie sur le bus d'événements les autorisations complètes après mise à jour", async () => {
      const adaptateurPersistance = unePersistanceMemoire()
        .ajouteUnService({ id: '123', descriptionService: { nomService: 'X' } })
        .ajouteUnUtilisateur({ id: '999', email: 'jean.dupont@mail.fr' })
        .ajouteUneAutorisation(
          uneAutorisation().avecId('456').deProprietaire('999', '123').donnees
        )
        .ajouteUnUtilisateur({ id: '000', email: 'contributeur@mail.fr' })
        .construis();

      const bus = fabriqueBusPourLesTests();
      const depot = creeDepot(adaptateurPersistance, undefined, bus);

      await depot.ajouteContributeurAuService(
        uneAutorisation()
          .deContributeur('000', '123')
          .avecTousDroitsEcriture()
          .construis()
      );

      expect(
        bus.aRecuUnEvenement(EvenementAutorisationsServiceModifiees)
      ).to.be(true);

      const recu = bus.recupereEvenement(
        EvenementAutorisationsServiceModifiees
      );
      expect(recu.idService).to.be('123');
      expect(recu.autorisations).to.eql([
        { idUtilisateur: '999', droit: 'PROPRIETAIRE' },
        { idUtilisateur: '000', droit: 'ECRITURE' },
      ]);
    });
  });

  it("connaît l'autorisation pour un utilisateur et un service donné", async () => {
    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnUtilisateur({ id: '999', email: 'jean.dupont@mail.fr' })
      .ajouteUnService({
        id: '123',
        descriptionService: { nomService: 'Un service' },
      })
      .ajouteUneAutorisation(
        uneAutorisation().avecId('456').deProprietaire('999', '123').donnees
      )
      .construis();

    const depot = creeDepot(adaptateurPersistance);

    const a = await depot.autorisationPour('999', '123');

    expect(a.estProprietaire).to.be(true);
    expect(a.id).to.equal('456');
  });

  it('sait si une autorisation existe', async () => {
    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnUtilisateur({ id: '999', email: 'jean.dupont@mail.fr' })
      .ajouteUnService({
        id: '123',
        descriptionService: { nomService: 'Un service' },
      })
      .ajouteUneAutorisation(
        uneAutorisation().avecId('456').deProprietaire('999', '123').donnees
      )
      .construis();

    const depot = creeDepot(adaptateurPersistance);

    const existe123 = await depot.autorisationExiste('999', '123');
    expect(existe123).to.be(true);

    const existe000 = await depot.autorisationExiste('999', '000');
    expect(existe000).to.be(false);

    const existeInconnu = await depot.autorisationExiste('000', '123');
    expect(existeInconnu).to.be(false);
  });

  describe("sur demande de suppression d'un contributeur", () => {
    it("vérifie que l'autorisation de contribution existe", async () => {
      const sansAutorisations = unePersistanceMemoire().construis();

      const depot = creeDepot(sansAutorisations);

      try {
        await depot.supprimeContributeur('000', 'ABC', '123');
        expect().to.fail('La demande aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurAutorisationInexistante);
        expect(e.message).to.equal(
          'L\'utilisateur "000" n\'est pas contributeur du service "ABC"'
        );
      }
    });

    it("empêche l'utilisateur de supprimer sa propre autorisation", async () => {
      const autorisationPour123 = unePersistanceMemoire()
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('123', 'ABC').donnees
        )
        .construis();
      const depot = creeDepot(autorisationPour123);

      try {
        await depot.supprimeContributeur('123', 'ABC', '123');
        expect().to.fail('La demande aurait dû lever une erreur');
      } catch (e) {
        expect(e).to.be.an(ErreurSuppressionImpossible);
        expect(e.message).to.equal(
          'L\'utilisateur "123" ne peut pas supprimer sa propre autorisation'
        );
      }
    });

    it('supprime le contributeur', async () => {
      const avecUneAutorisation = unePersistanceMemoire()
        .ajouteUneAutorisation(
          uneAutorisation().deContributeur('U1', 'S1').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U2', 'S1').donnees
        )
        .construis();

      const depot = creeDepot(avecUneAutorisation);

      const avant = await depot.autorisationPour('U1', 'S1');
      expect(avant).not.to.be(undefined);

      await depot.supprimeContributeur('U1', 'S1', 'U2');

      const apres = await depot.autorisationPour('U1', 'S1');
      expect(apres).to.be(undefined);
    });

    it('demande au dépôt données service de supprimer le contributeur', async () => {
      const avecUneAutorisation = unePersistanceMemoire()
        .ajouteUneAutorisation(
          uneAutorisation().deContributeur('U1', 'S1').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().deProprietaire('U2', 'S1').donnees
        )
        .construis();

      let idServiceRecu;
      let idUtilisateurRecu;
      const depotServices = {
        supprimeContributeur: async (idService, idUtilisateur) => {
          idServiceRecu = idService;
          idUtilisateurRecu = idUtilisateur;
        },
      };
      const depot = creeDepot(
        avecUneAutorisation,
        {},
        fabriqueBusPourLesTests(),
        depotServices
      );

      await depot.supprimeContributeur('U1', 'S1', 'U2');

      expect(idServiceRecu).to.be('S1');
      expect(idUtilisateurRecu).to.be('U1');
    });

    it("publie les autorisations à jour sur le bus d'événements", async () => {
      const bus = fabriqueBusPourLesTests();
      const avecDeuxExistantes = unePersistanceMemoire()
        .ajouteUneAutorisation(
          uneAutorisation().avecId('A1').deProprietaire('U1', 'S1').donnees
        )
        .ajouteUneAutorisation(
          uneAutorisation().avecId('A2').deProprietaire('U2', 'S1').donnees
        )
        .construis();
      const depot = creeDepot(avecDeuxExistantes, null, bus);

      await depot.supprimeContributeur('U1', 'S1', 'U2');

      expect(
        bus.recupereEvenement(EvenementAutorisationsServiceModifiees)
      ).to.eql({
        idService: 'S1',
        autorisations: [{ droit: 'PROPRIETAIRE', idUtilisateur: 'U2' }],
      });
    });
  });

  it('connaît toutes les autorisations pour un service donné', async () => {
    const adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnUtilisateur({ id: '888' })
      .ajouteUnUtilisateur({ id: '999' })
      .ajouteUnService({
        id: '123',
        descriptionService: { nomService: 'Un service' },
      })
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire('888', '123').donnees
      )
      .ajouteUneAutorisation(
        uneAutorisation().deContributeur('999', '123').donnees
      )
      .construis();

    const depot = creeDepot(adaptateurPersistance);

    const a = await depot.autorisationsDuService('123');

    expect(a.length).to.be(2);
    expect(a[0].estProprietaire).to.be(true);
    expect(a[1].estProprietaire).to.be(false);
  });

  describe("sur demande de sauvegarde d'une autorisation", () => {
    it('persiste les données', async () => {
      const enEcriture = uneAutorisation()
        .avecId('uuid-a')
        .deContributeur('123', '999')
        .avecTousDroitsEcriture();
      const depot = creeDepot(
        unePersistanceMemoire()
          .ajouteUneAutorisation(enEcriture.donnees)
          .construis()
      );

      const avant = await depot.autorisation('uuid-a');
      expect(avant.droits.HOMOLOGUER).to.be(ECRITURE);

      avant.appliqueDroits({ HOMOLOGUER: LECTURE });

      await depot.sauvegardeAutorisation(avant);

      const apres = await depot.autorisation('uuid-a');
      expect(apres.droits.HOMOLOGUER).to.be(LECTURE);
    });

    it("publie les autorisations à jour sur le bus d'événements", async () => {
      const bus = fabriqueBusPourLesTests();
      const avecUneExistante = unePersistanceMemoire()
        .ajouteUneAutorisation(
          uneAutorisation().avecId('A1').deProprietaire('U1', 'S1').donnees
        )
        .construis();
      const depot = creeDepot(avecUneExistante, null, bus);

      const ecriturePourU2 = uneAutorisation()
        .deContributeur('U2', 'S1')
        .avecTousDroitsEcriture()
        .construis();
      await depot.sauvegardeAutorisation(ecriturePourU2);

      expect(
        bus.recupereEvenement(EvenementAutorisationsServiceModifiees)
      ).to.eql({
        idService: 'S1',
        autorisations: [
          { droit: 'PROPRIETAIRE', idUtilisateur: 'U1' },
          { droit: 'ECRITURE', idUtilisateur: 'U2' },
        ],
      });
    });
  });
});
