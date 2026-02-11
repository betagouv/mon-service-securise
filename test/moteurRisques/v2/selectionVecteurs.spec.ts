import { SelectionVecteurs } from '../../../src/moteurRisques/v2/selectionVecteurs.ts';
import { DescriptionServiceV2 } from '../../../src/modeles/descriptionServiceV2.ts';
import {
  uneDescriptionDeNiveauDeSecuriteEstime1,
  uneDescriptionDeNiveauDeSecuriteEstime2,
  uneDescriptionV2Valide,
} from '../../constructeurs/constructeurDescriptionServiceV2.ts';

describe('La sélection des vecteurs', () => {
  const unServiceNiveau1 = (): DescriptionServiceV2 =>
    uneDescriptionDeNiveauDeSecuriteEstime1().construis();

  const unServiceNiveau2 = (): DescriptionServiceV2 =>
    uneDescriptionDeNiveauDeSecuriteEstime2().construis();

  describe('applique la présence initiale', () => {
    it('par défaut : sait appliquer la présence initiale de chaque vecteur', () => {
      const s = new SelectionVecteurs({
        V1: { presentInitialement: true, regles: {} },
      });

      const resultat = s.selectionnePourService(unServiceNiveau1());

      expect(resultat).toContain('V1');
    });

    it("par défaut : sait appliquer l'absence initiale de chaque vecteur", () => {
      const s = new SelectionVecteurs({
        V1: { presentInitialement: false, regles: {} },
      });

      const resultat = s.selectionnePourService(unServiceNiveau1());
      expect(resultat).not.toContain('V1');
    });
  });

  describe('connaît les modificateurs liés au niveau de sécurité', () => {
    it("sait ajouter un vecteur si le niveau de sécurité du service l'exige", () => {
      const s = new SelectionVecteurs({
        V1: {
          presentInitialement: false,
          regles: { niveauSecurite: { niveau1: 'Ajouter' } },
        },
      });

      const resultatNiveau1 = s.selectionnePourService(unServiceNiveau1());
      expect(resultatNiveau1).toContain('V1');

      const resultatNiveau2 = s.selectionnePourService(unServiceNiveau2());
      expect(resultatNiveau2).not.toContain('V1');
    });

    it("sait retirer un vecteur si le niveau de sécurité du service l'exige", () => {
      const s = new SelectionVecteurs({
        V1: {
          presentInitialement: true, // Absent initialiement
          regles: { niveauSecurite: { niveau2: 'Retirer' } },
        },
      });

      const resultatNiveau1 = s.selectionnePourService(unServiceNiveau1());
      expect(resultatNiveau1).toContain('V1');

      const resultatNiveau2 = s.selectionnePourService(unServiceNiveau2());
      expect(resultatNiveau2).not.toContain('V1');
    });
  });

  describe('connaît les modificateurs liés aux autres propriétés du service', () => {
    it("sait ajouter un vecteur si une propriété du service l'exige : par exemple la présence de POSTES DE TRAVAIL dans les spécificités projet", () => {
      const s = new SelectionVecteurs({
        V1: {
          presentInitialement: false,
          regles: { specificitesProjet: { postesDeTravail: 'Ajouter' } },
        },
      });

      const resultatSans = s.selectionnePourService(
        uneDescriptionV2Valide().avecSpecificitesProjet([]).construis()
      );
      expect(resultatSans).not.toContain('V1');

      const resultatAvec = s.selectionnePourService(
        uneDescriptionV2Valide()
          .avecSpecificitesProjet(['postesDeTravail'])
          .construis()
      );
      expect(resultatAvec).toContain('V1');
    });

    it("sait retirer un vecteur si une propriété du service l'exige : par exemple la présence de POSTES DE TRAVAIL dans les spécificités projet", () => {
      const s = new SelectionVecteurs({
        V1: {
          presentInitialement: true, // Présent par défaut
          regles: { specificitesProjet: { postesDeTravail: 'Retirer' } },
        },
      });

      const resultatSans = s.selectionnePourService(
        uneDescriptionV2Valide().avecSpecificitesProjet([]).construis()
      );
      expect(resultatSans).toContain('V1');

      const resultatAvec = s.selectionnePourService(
        uneDescriptionV2Valide()
          .avecSpecificitesProjet(['postesDeTravail'])
          .construis()
      );
      expect(resultatAvec).not.toContain('V1');
    });
  });

  it("dans tous les cas : priorise le modificateur « Retirer » s'il est présent", () => {
    const s = new SelectionVecteurs({
      V1: {
        presentInitialement: false,
        regles: {
          niveauSecurite: { niveau1: 'Retirer' },
          specificitesProjet: { postesDeTravail: 'Ajouter' },
        },
      },
    });

    const resultat = s.selectionnePourService(
      uneDescriptionDeNiveauDeSecuriteEstime1()
        .avecSpecificitesProjet(['postesDeTravail'])
        .construis()
    );

    expect(resultat).not.toContain('V1');
  });
});
