const expect = require('expect.js');

const MesuresGenerales = require('../../src/modeles/mesuresGenerales');
const Referentiel = require('../../src/referentiel');

const { A_SAISIR, COMPLETES, A_COMPLETER } = MesuresGenerales;

describe('La liste des mesures générales', () => {
  let referentiel;

  beforeEach(
    () =>
      (referentiel = {
        identifiantsCategoriesMesures: () => [],
        identifiantsMesures: () => [],
        mesures: () => ({}),
        mesure: () => ({}),
      })
  );

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
      const mesures = new MesuresGenerales(
        { mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] },
        referentiel
      );

      expect(mesures.parStatutEtCategorie().fait).to.be.ok();
    });

    it('regroupe par catégorie les mesures', () => {
      const mesures = new MesuresGenerales(
        { mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] },
        referentiel
      );

      expect(mesures.parStatutEtCategorie().fait.categorie1.length).to.equal(1);
    });

    it("ajoute l'importance de la mesure", () => {
      const mesures = new MesuresGenerales(
        { mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] },
        referentiel
      );

      expect(
        mesures.parStatutEtCategorie().fait.categorie1[0].indispensable
      ).to.be(true);
    });

    it('ajoute la description de la mesure', () => {
      const mesures = new MesuresGenerales(
        { mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] },
        referentiel
      );

      expect(
        mesures.parStatutEtCategorie().fait.categorie1[0].description
      ).to.equal('Mesure une');
    });

    it('ajoute les modalités de la mesure', () => {
      const mesuresGenerales = [
        { id: 'mesure1', statut: 'fait', modalites: 'Modalités de la mesure' },
      ];
      const mesures = new MesuresGenerales({ mesuresGenerales }, referentiel, [
        'mesure1',
      ]);

      expect(
        mesures.parStatutEtCategorie().fait.categorie1[0].modalites
      ).to.equal('Modalités de la mesure');
    });

    it('ordonne les statuts comme attendu', () => {
      const mesures = new MesuresGenerales(
        {
          mesuresGenerales: [
            { id: 'mesure1', statut: 'fait' },
            { id: 'mesure2', statut: 'nonFait' },
            { id: 'mesure3', statut: 'enCours' },
          ],
        },
        referentiel
      );

      expect(Object.keys(mesures.parStatutEtCategorie())).to.eql([
        'enCours',
        'nonFait',
        'fait',
      ]);
    });

    it('retourne les mesures indispensables avant les mesures recommandées', () => {
      const mesures = new MesuresGenerales(
        {
          mesuresGenerales: [
            { id: 'mesure1', statut: 'fait' },
            { id: 'mesure2', statut: 'fait' },
            { id: 'mesure3', statut: 'fait' },
          ],
        },
        referentiel
      );

      expect(
        mesures.parStatutEtCategorie().fait.categorie1[2].description
      ).to.equal('Mesure deux');
    });
  });
});
