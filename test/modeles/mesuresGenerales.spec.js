const expect = require('expect.js');

const MesuresGenerales = require('../../src/modeles/mesuresGenerales');

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

      const stats = mesuresGenerales.statistiques(['id1', 'id2', 'id3']).toJSON();
      expect(stats.une.retenues).to.equal(2);
      expect(stats.une.misesEnOeuvre).to.equal(2);
    });

    it('initialise les catégories sans mesure renseignée', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id1', statut: 'fait' }]);

      const stats = mesuresGenerales.statistiques(['id1', 'id2', 'id3']).toJSON();
      expect(stats.deux.retenues).to.equal(0);
      expect(stats.deux.misesEnOeuvre).to.equal(0);
    });

    it('ajoute les mesures en cours à la somme des mesures retenues', () => {
      const mesuresGenerales = creeMesuresGenerales([
        { id: 'id1', statut: 'fait' },
        { id: 'id2', statut: 'enCours' },
      ]);

      const stats = mesuresGenerales.statistiques(['id1', 'id2', 'id3']).toJSON();
      expect(stats.une.retenues).to.equal(2);
      expect(stats.une.misesEnOeuvre).to.equal(1);
    });

    it('ne tient pas compte des mesures non retenues', () => {
      const mesuresGenerales = creeMesuresGenerales([
        { id: 'id1', statut: 'enCours' },
        { id: 'id2', statut: 'nonRetenu' },
      ]);

      const stats = mesuresGenerales.statistiques(['id1', 'id2', 'id3']).toJSON();
      expect(stats.une.retenues).to.equal(1);
      expect(stats.une.misesEnOeuvre).to.equal(0);
    });

    it('classe les statistiques par catégorie de mesure', () => {
      const mesuresGenerales = creeMesuresGenerales([
        { id: 'id1', statut: 'nonRetenu' },
        { id: 'id3', statut: 'fait' },
      ]);

      const stats = mesuresGenerales.statistiques(['id1', 'id2', 'id3']).toJSON();
      expect(stats.deux.retenues).to.equal(1);
      expect(stats.deux.misesEnOeuvre).to.equal(1);
    });

    it('calcule le nombre total de mesures indispensables personnalisées', () => {
      const mesuresGenerales = creeMesuresGenerales([]);

      const stats = mesuresGenerales.statistiques(['id1', 'id2', 'id3']).toJSON();
      expect(stats.une.totalIndispensables).to.equal(1);
      expect(stats.deux.totalIndispensables).to.equal(0);
    });

    it('ignore les mesures indispensables non personnalisées', () => {
      const mesuresGenerales = creeMesuresGenerales([]);

      const stats = mesuresGenerales.statistiques(['id2', 'id3']).toJSON();
      expect(stats.une.totalIndispensables).to.equal(0);
    });

    it('calcule le nombre total de mesures recommandées personnalisées', () => {
      const mesuresGenerales = creeMesuresGenerales([]);

      const stats = mesuresGenerales.statistiques(['id1', 'id2', 'id3']).toJSON();
      expect(stats.une.totalRecommandees).to.equal(1);
      expect(stats.deux.totalRecommandees).to.equal(1);
    });

    it('calcule le nombre de mesures indispensables faites', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id1', statut: 'fait' }]);

      const stats = mesuresGenerales.statistiques(['id1', 'id2']).toJSON();
      expect(stats.une.indispensablesFaites).to.equal(1);
      expect(stats.deux.indispensablesFaites).to.equal(0);
    });

    it('calcule le nombre de mesures indispensables non faites', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id1', statut: 'nonFait' }]);

      const stats = mesuresGenerales.statistiques(['id1']).toJSON();
      expect(stats.une.indispensablesNonFaites).to.equal(1);
    });

    it('calcule le nombre de mesures indispensables en cours', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id1', statut: 'enCours' }]);

      const stats = mesuresGenerales.statistiques(['id1']).toJSON();
      expect(stats.une.indispensablesEnCours).to.equal(1);
    });

    it('calcule le nombre de mesures recommandées faites', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id3', statut: 'fait' }]);

      const stats = mesuresGenerales.statistiques(['id1', 'id2', 'id3']).toJSON();
      expect(stats.une.recommandeesFaites).to.equal(0);
      expect(stats.deux.recommandeesFaites).to.equal(1);
    });

    it('calcule le nombre de mesures recommandées en cours', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id2', statut: 'enCours' }]);

      const stats = mesuresGenerales.statistiques(['id2']).toJSON();
      expect(stats.une.recommandeesEnCours).to.equal(1);
    });

    it('calcule le nombre de mesures recommandées non faites', () => {
      const mesuresGenerales = creeMesuresGenerales([{ id: 'id2', statut: 'nonFait' }]);

      const stats = mesuresGenerales.statistiques(['id2']).toJSON();
      expect(stats.une.recommandeesNonFaites).to.equal(1);
    });
  });
});
