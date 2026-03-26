import MesuresGenerales, {
  DonneesMesuresGenerales,
} from '../../src/modeles/mesuresGenerales.js';
import { creeReferentiel, creeReferentielVide } from '../../src/referentiel.js';
import MesureGenerale from '../../src/modeles/mesureGenerale.js';
import { Referentiel } from '../../src/referentiel.interface.ts';

const { A_SAISIR, COMPLETES, A_COMPLETER } = MesuresGenerales;

describe('La liste des mesures générales', () => {
  let referentiel: Referentiel;

  beforeEach(() => {
    referentiel = creeReferentielVide();
  });

  describe("sur demande de mise à jour d'une mesure", () => {
    beforeEach(() => {
      referentiel = creeReferentiel({
        // @ts-expect-error identifiant de mesure factice
        mesures: { m1: {} },
      });
    });

    it("insère la mesure si elle n'existe pas", () => {
      const donnees = { mesuresGenerales: [] };
      const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

      mesuresGenerales.metsAJourMesure(
        new MesureGenerale({ id: 'm1', statut: 'fait' }, referentiel)
      );

      expect(mesuresGenerales.toutes().length).toEqual(1);
      expect(mesuresGenerales.toutes()[0].id).toEqual('m1');
      expect(mesuresGenerales.toutes()[0].statut).toEqual('fait');
    });

    it('met à jour la mesure si elle existe déjà', () => {
      const donnees: DonneesMesuresGenerales<'m1'> = {
        mesuresGenerales: [{ id: 'm1', statut: 'fait' }],
      };
      const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

      mesuresGenerales.metsAJourMesure(
        new MesureGenerale({ id: 'm1', statut: 'aLancer' }, referentiel)
      );

      expect(mesuresGenerales.toutes().length).toEqual(1);
      expect(mesuresGenerales.toutes()[0].id).toEqual('m1');
      expect(mesuresGenerales.toutes()[0].statut).toEqual('aLancer');
    });
  });

  it("est à saisir quand rien n'est saisi", () => {
    const donnees: DonneesMesuresGenerales<''> = { mesuresGenerales: [] };
    const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

    expect(mesuresGenerales.statutSaisie()).toEqual(A_SAISIR);
  });

  it('est complète quand les mesures sont complètes', () => {
    referentiel = creeReferentiel();
    // @ts-expect-error on utilise un identifiant de mesure factice
    referentiel.recharge({ mesures: { mesure: {} } });

    const donnees: DonneesMesuresGenerales<'mesure'> = {
      mesuresGenerales: [{ id: 'mesure', statut: 'fait' }],
    };
    const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

    expect(mesuresGenerales.statutSaisie()).toEqual(COMPLETES);
  });

  it('est à compléter quand toutes les mesures ne sont pas complètes', () => {
    // @ts-expect-error identifiant de mesure factice
    referentiel = creeReferentiel({ mesures: { mesure: {} } });

    const donnees: DonneesMesuresGenerales<'mesure'> = {
      mesuresGenerales: [{ id: 'mesure' }],
    };
    const mesuresGenerales = new MesuresGenerales(donnees, referentiel);

    expect(mesuresGenerales.statutSaisie()).toEqual(A_COMPLETER);
  });

  describe('sur une demande de mesures par statut', () => {
    beforeEach(() => {
      referentiel = creeReferentiel({
        mesures: {
          // @ts-expect-error on utilise des idMesure factices
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

      expect(mesures.parStatutEtCategorie().fait).toBeDefined();
    });

    it('regroupe par catégorie les mesures', () => {
      const mesures = new MesuresGenerales(
        { mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] },
        referentiel
      );

      expect(mesures.parStatutEtCategorie().fait.categorie1.length).toEqual(1);
    });

    it("ajoute l'importance de la mesure", () => {
      const mesures = new MesuresGenerales(
        { mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] },
        referentiel
      );

      expect(
        mesures.parStatutEtCategorie().fait.categorie1[0].indispensable
      ).toBe(true);
    });

    it('ajoute la description de la mesure', () => {
      const mesures = new MesuresGenerales(
        { mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] },
        referentiel
      );

      expect(
        mesures.parStatutEtCategorie().fait.categorie1[0].description
      ).toEqual('Mesure une');
    });

    it('ajoute les modalités de la mesure', () => {
      const donnees: DonneesMesuresGenerales<'mesure1'> = {
        mesuresGenerales: [
          {
            id: 'mesure1',
            statut: 'fait',
            modalites: 'Modalités de la mesure',
          },
        ],
      };
      const mesures = new MesuresGenerales(donnees, referentiel);

      expect(
        mesures.parStatutEtCategorie().fait.categorie1[0].modalites
      ).toEqual('Modalités de la mesure');
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

      expect(Object.keys(mesures.parStatutEtCategorie())).toEqual([
        'enCours',
        'nonFait',
        'aLancer',
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
      ).toEqual('Mesure deux');
    });
  });
});
