const expect = require('expect.js');

const MesuresGenerales = require('../../src/modeles/mesuresGenerales');
const Referentiel = require('../../src/referentiel');

const { A_SAISIR, COMPLETES, A_COMPLETER } = MesuresGenerales;

describe('La liste des mesures générales', () => {
  let referentiel;

  beforeEach(() => (referentiel = {
    identifiantsCategoriesMesures: () => [],
    identifiantsMesures: () => [],
    mesures: () => ({}),
    mesure: () => ({}),
  }));

  it("est à saisir quand rien n'est saisi", () => {
    const donnees = { mesuresGenerales: [] };
    const mesuresGenerales = new MesuresGenerales(donnees);

    expect(mesuresGenerales.statutSaisie()).to.equal(A_SAISIR);
  });

  it('est complète quand les mesures sont complètes', () => {
    referentiel.identifiantsMesures = () => ['mesure'];

    const donnees = { mesuresGenerales: [{ id: 'mesure', statut: 'fait' }] };
    const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

    expect(mesuresGenerales.statutSaisie()).to.equal(COMPLETES);
  });

  it('est à compléter quand toutes les mesures ne sont pas complètes', () => {
    referentiel.identifiantsMesures = () => ['mesure'];

    const donnees = { mesuresGenerales: [{ id: 'mesure' }] };
    const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

    expect(mesuresGenerales.statutSaisie()).to.equal(A_COMPLETER);
  });

  describe('sur demande de statistiques sur les mesures', () => {
    const creeMesuresGenerales = (donneesMesures) => (
      new MesuresGenerales({ mesuresGenerales: donneesMesures }, referentiel)
    );

    beforeEach(() => {
      referentiel.identifiantsCategoriesMesures = () => ['une', 'deux'];
      referentiel.mesures = () => ({
        id1: { categorie: 'une', indispensable: true },
        id2: { categorie: 'une' },
        id3: { categorie: 'deux' },
      });
      referentiel.identifiantsMesures = () => Object.keys(referentiel.mesures());
      referentiel.mesure = (identifiant) => referentiel.mesures()[identifiant];
    });

    it('fait la somme des mesures mises en oeuvre pour une catégorie donnée', () => {
      const mesuresGenerales = creeMesuresGenerales([
        { id: 'id1', statut: 'fait' },
        { id: 'id2', statut: 'fait' },
      ]);

      const stats = mesuresGenerales.statistiques({ id1: {}, id2: {}, id3: {} }).toJSON();
      expect(stats.une.retenues).to.equal(2);
      expect(stats.une.misesEnOeuvre).to.equal(2);
    });

    it('initialise les catégories sans mesure renseignée', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id1', statut: 'fait' }]);

      const stats = mesuresGenerales.statistiques({ id1: {}, id2: {}, id3: {} }).toJSON();
      expect(stats.deux.retenues).to.equal(0);
      expect(stats.deux.misesEnOeuvre).to.equal(0);
    });

    it('ajoute les mesures en cours à la somme des mesures retenues', () => {
      const mesuresGenerales = creeMesuresGenerales([
        { id: 'id1', statut: 'fait' },
        { id: 'id2', statut: 'enCours' },
      ]);

      const stats = mesuresGenerales.statistiques({ id1: {}, id2: {}, id3: {} }).toJSON();
      expect(stats.une.retenues).to.equal(2);
      expect(stats.une.misesEnOeuvre).to.equal(1);
    });

    it('ne tient pas compte des mesures non retenues', () => {
      const mesuresGenerales = creeMesuresGenerales([
        { id: 'id1', statut: 'enCours' },
        { id: 'id2', statut: 'nonRetenu' },
      ]);

      const stats = mesuresGenerales.statistiques({ id1: {}, id2: {}, id3: {} }).toJSON();
      expect(stats.une.retenues).to.equal(1);
      expect(stats.une.misesEnOeuvre).to.equal(0);
    });

    it('classe les statistiques par catégorie de mesure', () => {
      const mesuresGenerales = creeMesuresGenerales([
        { id: 'id1', statut: 'nonRetenu' },
        { id: 'id3', statut: 'fait' },
      ]);

      const stats = mesuresGenerales.statistiques({ id1: {}, id2: {}, id3: {} }).toJSON();
      expect(stats.deux.retenues).to.equal(1);
      expect(stats.deux.misesEnOeuvre).to.equal(1);
    });

    it('calcule le nombre total de mesures indispensables personnalisées', () => {
      const mesuresGenerales = creeMesuresGenerales([]);

      const stats = mesuresGenerales.statistiques({ id1: {}, id2: {}, id3: {} }).toJSON();
      expect(stats.une.indispensables.total).to.equal(1);
      expect(stats.deux.indispensables.total).to.equal(0);
    });

    it('tient compte des mesures rendues indispensables', () => {
      const mesuresGenerales = creeMesuresGenerales([]);

      const stats = mesuresGenerales.statistiques({ id2: { indispensable: true } }).toJSON();
      expect(stats.une.indispensables.total).to.equal(1);
    });

    it('ignore les mesures indispensables non personnalisées', () => {
      const mesuresGenerales = creeMesuresGenerales([]);

      const stats = mesuresGenerales.statistiques({ id2: {}, id3: {} }).toJSON();
      expect(stats.une.indispensables.total).to.equal(0);
    });

    it('calcule le nombre total de mesures recommandées personnalisées', () => {
      const mesuresGenerales = creeMesuresGenerales([]);

      const stats = mesuresGenerales.statistiques({ id1: {}, id2: {}, id3: {} }).toJSON();
      expect(stats.une.recommandees.total).to.equal(1);
      expect(stats.deux.recommandees.total).to.equal(1);
    });

    it('calcule le nombre de mesures indispensables faites', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id1', statut: 'fait' }]);

      const stats = mesuresGenerales.statistiques({ id1: {}, id2: {} }).toJSON();
      expect(stats.une.indispensables.fait).to.equal(1);
      expect(stats.deux.indispensables.fait).to.equal(0);
    });

    it('tient compte des mesures faites rendues indispensables', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id2', statut: 'fait' }]);

      const stats = mesuresGenerales.statistiques({ id2: { indispensable: true } }).toJSON();
      expect(stats.une.indispensables.fait).to.equal(1);
    });

    it('calcule le nombre de mesures indispensables en cours', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id1', statut: 'enCours' }]);

      const stats = mesuresGenerales.statistiques({ id1: {}, id2: {} }).toJSON();
      expect(stats.une.indispensables.enCours).to.equal(1);
      expect(stats.deux.indispensables.enCours).to.equal(0);
    });

    it('calcule le nombre de mesures indispensables non faites', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id1', statut: 'nonFait' }]);

      const stats = mesuresGenerales.statistiques({ id1: {}, id2: {} }).toJSON();
      expect(stats.une.indispensables.nonFait).to.equal(1);
      expect(stats.deux.indispensables.nonFait).to.equal(0);
    });

    it('calcule le nombre de mesures recommandées faites', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id3', statut: 'fait' }]);

      const stats = mesuresGenerales.statistiques({ id1: {}, id2: {}, id3: {} }).toJSON();
      expect(stats.une.recommandees.fait).to.equal(0);
      expect(stats.deux.recommandees.fait).to.equal(1);
    });
  });

  describe('sur une demande de mesures par statut', () => {
    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        mesures: {
          mesure1: {
            description: 'Mesure une',
            categorie: 'categorie1',
            indispensable: true,
          },
          mesure2: {
            description: 'Mesure deux',
            categorie: 'categorie1',
            indispensable: false,
          },
          mesure3: {
            description: 'Mesure trois',
            categorie: 'categorie1',
            indispensable: true,
          },
        },
      });
    });

    it('regroupe par statut les mesures', () => {
      const mesures = new MesuresGenerales({ mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] }, referentiel);

      expect(mesures.parStatut().fait).to.be.ok();
    });

    it('regroupe par catégorie les mesures', () => {
      const mesures = new MesuresGenerales({ mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] }, referentiel);

      expect(mesures.parStatut().fait.categorie1.length).to.equal(1);
    });

    it("ajoute l'importance de la mesure", () => {
      const mesures = new MesuresGenerales({ mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] }, referentiel);

      expect(mesures.parStatut().fait.categorie1[0].indispensable).to.be(true);
    });

    it('ajoute la description de la mesure', () => {
      const mesures = new MesuresGenerales({ mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] }, referentiel);

      expect(mesures.parStatut().fait.categorie1[0].description).to.equal('Mesure une');
    });

    it('ajoute les modalités de la mesure', () => {
      const mesuresGenerales = [{ id: 'mesure1', statut: 'fait', modalites: 'Modalités de la mesure' }];
      const mesures = new MesuresGenerales({ mesuresGenerales }, referentiel, ['mesure1']);

      expect(mesures.parStatut().fait.categorie1[0].modalites).to.equal('Modalités de la mesure');
    });

    it('retourne les mesures indispensables avant les mesures recommandées', () => {
      const mesures = new MesuresGenerales({ mesuresGenerales: [
        { id: 'mesure1', statut: 'fait' },
        { id: 'mesure2', statut: 'fait' },
        { id: 'mesure3', statut: 'fait' },
      ] }, referentiel);

      expect(mesures.parStatut().fait.categorie1[2].description).to.equal('Mesure deux');
    });
  });
});
