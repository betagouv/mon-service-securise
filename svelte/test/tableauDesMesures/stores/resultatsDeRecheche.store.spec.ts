import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import { resultatsDeRecherche } from '../../../lib/tableauDesMesures/stores/resultatsDeRecherche.store';
import { mesures } from '../../../lib/tableauDesMesures/stores/mesures.store';
import { rechercheParPriorite } from '../../../lib/tableauDesMesures/stores/rechercheParPriorite.store';
import { rechercheMesMesures } from '../../../lib/tableauDesMesures/stores/rechercheMesMesures.store';
import { rechercheParReferentielExterne } from '../../../lib/tableauDesMesures/stores/rechercheParReferentielExterne.store';
import { type PrioriteMesure, Referentiel } from '../../../lib/ui/types.d';
import type {
  Contributeur,
  MesureGenerale,
} from '../../../lib/tableauDesMesures/tableauDesMesures.d';
import { contributeurs } from '../../../lib/tableauDesMesures/stores/contributeurs.store';

const creeMesureGenerale = ({
  priorite = 'p1',
  responsables = [],
  mesuresReferentielsExternes,
}: {
  priorite?: PrioriteMesure;
  responsables?: string[];
  mesuresReferentielsExternes?: MesureGenerale['mesuresReferentielsExternes'];
}): MesureGenerale => ({
  categorie: 'Protection',
  indispensable: true,
  descriptionLongue: '',
  referentiel: Referentiel.ANSSI,
  description: '',
  identifiantNumerique: '000',
  priorite,
  responsables,
  mesuresReferentielsExternes,
});

const creeContributeur = (contributeur: {
  id: string;
  utilisateurCourant: boolean;
}): Contributeur => ({
  estUtilisateurCourant: contributeur.utilisateurCourant,
  id: contributeur.id,
  initiales: 'FB',
  prenomNom: '',
  poste: '',
});

describe('Le store dérivé des résultats de recherche de mesure', () => {
  beforeEach(() => {
    rechercheParPriorite.set([]);
    rechercheMesMesures.set(false);
    rechercheParReferentielExterne.set([]);
  });

  describe("sur application d'un filtre de priorité", () => {
    it('conserve uniquement les mesures correspondantes', () => {
      const uneMesure = creeMesureGenerale({ priorite: 'p1' });
      mesures.reinitialise({
        mesuresGenerales: { uneMesure },
        mesuresSpecifiques: [],
      });
      rechercheParPriorite.set(['p2']);

      const { mesuresGenerales } = get(resultatsDeRecherche);

      expect(Object.keys(mesuresGenerales).length).toBe(0);
    });
  });

  describe("sur application d'un filtre `Mes mesures`", () => {
    beforeEach(() => {
      contributeurs.reinitialise([
        creeContributeur({ id: 'moi', utilisateurCourant: true }),
      ]);
    });

    it('ne conserve pas une mesure générale sans responsable', () => {
      const uneMesure = creeMesureGenerale({ responsables: [] });
      mesures.reinitialise({
        mesuresGenerales: { uneMesure },
        mesuresSpecifiques: [],
      });
      rechercheMesMesures.set(true);

      const { mesuresGenerales } = get(resultatsDeRecherche);

      expect(Object.keys(mesuresGenerales).length).toBe(0);
    });

    it('conserve une mesure générale dont je suis responsable', () => {
      const uneMesure = creeMesureGenerale({ responsables: ['moi'] });
      mesures.reinitialise({
        mesuresGenerales: { uneMesure },
        mesuresSpecifiques: [],
      });
      rechercheMesMesures.set(true);

      const { mesuresGenerales } = get(resultatsDeRecherche);

      expect(Object.keys(mesuresGenerales).length).toBe(1);
    });

    it('ne conserve pas une mesure générale dont je ne suis pas responsable', () => {
      const uneMesure = creeMesureGenerale({ responsables: ['pasmoi'] });
      mesures.reinitialise({
        mesuresGenerales: { uneMesure },
        mesuresSpecifiques: [],
      });
      rechercheMesMesures.set(true);

      const { mesuresGenerales } = get(resultatsDeRecherche);

      expect(Object.keys(mesuresGenerales).length).toBe(0);
    });
  });

  describe("quand le filtre `Mes mesures` n'est pas coché", () => {
    it('conserve toutes les mesures', () => {
      const uneMesure = creeMesureGenerale({ responsables: [] });
      mesures.reinitialise({
        mesuresGenerales: { uneMesure },
        mesuresSpecifiques: [],
      });
      rechercheMesMesures.set(false);

      const { mesuresGenerales } = get(resultatsDeRecherche);

      expect(Object.keys(mesuresGenerales).length).toBe(1);
    });
  });

  describe("sur application d'un filtre de référentiel externe", () => {
    it('conserve une mesure liée au référentiel externe sélectionné', () => {
      const uneMesure = creeMesureGenerale({
        mesuresReferentielsExternes: { ReCyf: [{ id: 'recyf-1' }] },
      });
      mesures.reinitialise({
        mesuresGenerales: { uneMesure },
        mesuresSpecifiques: [],
      });
      rechercheParReferentielExterne.set(['ReCyf']);

      const { mesuresGenerales } = get(resultatsDeRecherche);

      expect(Object.keys(mesuresGenerales).length).toBe(1);
    });

    it('ne conserve pas une mesure sans lien avec le référentiel externe', () => {
      const uneMesure = creeMesureGenerale({
        mesuresReferentielsExternes: { ReCyf: [] },
      });
      mesures.reinitialise({
        mesuresGenerales: { uneMesure },
        mesuresSpecifiques: [],
      });
      rechercheParReferentielExterne.set(['ReCyf']);

      const { mesuresGenerales } = get(resultatsDeRecherche);

      expect(Object.keys(mesuresGenerales).length).toBe(0);
    });

    it('ne conserve pas une mesure dépourvue de référentiels externes', () => {
      const uneMesure = creeMesureGenerale({});
      mesures.reinitialise({
        mesuresGenerales: { uneMesure },
        mesuresSpecifiques: [],
      });
      rechercheParReferentielExterne.set(['ReCyf']);

      const { mesuresGenerales } = get(resultatsDeRecherche);

      expect(Object.keys(mesuresGenerales).length).toBe(0);
    });

    it('conserve toutes les mesures quand aucun référentiel externe n’est sélectionné', () => {
      const uneMesure = creeMesureGenerale({});
      mesures.reinitialise({
        mesuresGenerales: { uneMesure },
        mesuresSpecifiques: [],
      });
      rechercheParReferentielExterne.set([]);

      const { mesuresGenerales } = get(resultatsDeRecherche);

      expect(Object.keys(mesuresGenerales).length).toBe(1);
    });
  });
});
