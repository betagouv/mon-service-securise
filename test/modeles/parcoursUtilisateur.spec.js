const expect = require('expect.js');

const ParcoursUtilisateur = require('../../src/modeles/parcoursUtilisateur');
const Referentiel = require('../../src/referentiel');

describe('Un parcours utilisateur', () => {
  it('sait se convertir en JSON', () => {
    const unParcours = new ParcoursUtilisateur({
      idUtilisateur: '456',
      dateDerniereConnexion: '2023-01-01',
    });

    expect(unParcours.toJSON()).to.eql({
      idUtilisateur: '456',
      dateDerniereConnexion: '2023-01-01',
    });
  });

  it("sait enregistrer une date de dernière connexion en utilisant l'adaptateur horloge", () => {
    const dateDeConnexion = new Date();
    const adaptateurHorloge = {
      maintenant: () => dateDeConnexion,
    };
    const unParcours = new ParcoursUtilisateur(
      {
        idUtilisateur: '456',
        dateDerniereConnexion: '2023-01-01',
      },
      adaptateurHorloge
    );

    unParcours.enregistreDerniereConnexionMaintenant();
    expect(unParcours.toJSON().dateDerniereConnexion).to.equal(
      dateDeConnexion.toISOString()
    );
  });

  describe('sur demande de recupération de nouvelle fonctionnalité', () => {
    it("ne retourne pas de nouvelle fonctionnalité si aucune n'est présente dans le référentiel", () => {
      const referentiel = Referentiel.creeReferentielVide({
        nouvellesFonctionnalites: [],
      });
      const unParcours = new ParcoursUtilisateur({}, referentiel);
      expect(unParcours.recupereNouvelleFonctionnalite()).to.be(undefined);
    });

    it("ne retourne pas de nouvelle fonctionnalité si aucune n'est apparue depuis la dernière connexion", () => {
      const referentiel = Referentiel.creeReferentiel({
        nouvellesFonctionnalites: [
          { id: 'nouveautéDansLePassé', dateDeDeploiement: '2022-01-01' },
        ],
      });
      const unParcours = new ParcoursUtilisateur(
        { dateDerniereConnexion: '2023-01-01' },
        referentiel
      );
      expect(unParcours.recupereNouvelleFonctionnalite()).to.be(undefined);
    });

    it('ne retourne pas de nouvelle fonctionnalité si elle est dans le futur', () => {
      const referentiel = Referentiel.creeReferentiel({
        nouvellesFonctionnalites: [
          { id: 'nouveauté1Février', dateDeDeploiement: '2023-02-01' },
        ],
      });
      const adaptateurHorloge = {
        maintenant: () => new Date('2023-01-15'),
      };
      const unParcours = new ParcoursUtilisateur(
        { dateDerniereConnexion: '2023-01-01' },
        referentiel,
        adaptateurHorloge
      );
      expect(unParcours.recupereNouvelleFonctionnalite()).to.be(undefined);
    });

    it("retourne l'identifiant de la nouvelle fonctionnalité si elle est apparue entre la dernière connexion et aujourd'hui", () => {
      const referentiel = Referentiel.creeReferentiel({
        nouvellesFonctionnalites: [
          { id: 'nouveauté15Janvier', dateDeDeploiement: '2023-01-15' },
        ],
      });
      const adaptateurHorloge = {
        maintenant: () => new Date('2023-02-01'),
      };
      const unParcours = new ParcoursUtilisateur(
        { dateDerniereConnexion: '2023-01-01' },
        referentiel,
        adaptateurHorloge
      );
      expect(unParcours.recupereNouvelleFonctionnalite()).to.be(
        'nouveauté15Janvier'
      );
    });
  });
});
