import {
  ConfigurationSelectionVecteurs,
  ReglesDeSelection,
  SelectionVecteurs,
} from '../../../src/moteurRisques/v2/selectionVecteurs.ts';
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

  const configurationVecteurs = (
    surcharge: Partial<ConfigurationSelectionVecteurs>
  ) => ({
    V1: { presentInitialement: false, regles: {} },
    V2: { presentInitialement: false, regles: {} },
    V3: { presentInitialement: false, regles: {} },
    V4: { presentInitialement: false, regles: {} },
    V5: { presentInitialement: false, regles: {} },
    V6: { presentInitialement: false, regles: {} },
    V7: { presentInitialement: false, regles: {} },
    V8: { presentInitialement: false, regles: {} },
    V9: { presentInitialement: false, regles: {} },
    V10: { presentInitialement: false, regles: {} },
    V11: { presentInitialement: false, regles: {} },
    V12: { presentInitialement: false, regles: {} },
    V13: { presentInitialement: false, regles: {} },
    V14: { presentInitialement: false, regles: {} },
    ...surcharge,
  });

  describe('applique la présence initiale', () => {
    it('par défaut : sait appliquer la présence initiale de chaque vecteur', () => {
      const s = new SelectionVecteurs(
        configurationVecteurs({
          V1: { presentInitialement: true, regles: {} },
        })
      );

      const resultat = s.selectionnePourService(unServiceNiveau1());

      expect(resultat).toContain('V1');
    });

    it("par défaut : sait appliquer l'absence initiale de chaque vecteur", () => {
      const s = new SelectionVecteurs(
        configurationVecteurs({
          V1: { presentInitialement: false, regles: {} },
        })
      );

      const resultat = s.selectionnePourService(unServiceNiveau1());
      expect(resultat).not.toContain('V1');
    });
  });

  describe('connaît les modificateurs liés au niveau de sécurité', () => {
    it("sait ajouter un vecteur si le niveau de sécurité du service l'exige", () => {
      const s = new SelectionVecteurs(
        configurationVecteurs({
          V1: {
            presentInitialement: false,
            regles: { niveauSecurite: { niveau1: 'Ajouter' } },
          },
        })
      );

      const resultatNiveau1 = s.selectionnePourService(unServiceNiveau1());
      expect(resultatNiveau1).toContain('V1');

      const resultatNiveau2 = s.selectionnePourService(unServiceNiveau2());
      expect(resultatNiveau2).not.toContain('V1');
    });

    it("sait retirer un vecteur si le niveau de sécurité du service l'exige", () => {
      const s = new SelectionVecteurs(
        configurationVecteurs({
          V1: {
            presentInitialement: true, // Absent initialiement
            regles: { niveauSecurite: { niveau2: 'Retirer' } },
          },
        })
      );

      const resultatNiveau1 = s.selectionnePourService(unServiceNiveau1());
      expect(resultatNiveau1).toContain('V1');

      const resultatNiveau2 = s.selectionnePourService(unServiceNiveau2());
      expect(resultatNiveau2).not.toContain('V1');
    });
  });

  describe('connaît les modificateurs liés aux autres propriétés du service', () => {
    it("sait ajouter un vecteur si une propriété du service l'exige : par exemple la présence de POSTES DE TRAVAIL dans les spécificités projet", () => {
      const s = new SelectionVecteurs(
        configurationVecteurs({
          V1: {
            presentInitialement: false,
            regles: { specificitesProjet: { postesDeTravail: 'Ajouter' } },
          },
        })
      );

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
      const s = new SelectionVecteurs(
        configurationVecteurs({
          V1: {
            presentInitialement: true, // Présent par défaut
            regles: { specificitesProjet: { postesDeTravail: 'Retirer' } },
          },
        })
      );

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
    const s = new SelectionVecteurs(
      configurationVecteurs({
        V1: {
          presentInitialement: false,
          regles: {
            niveauSecurite: { niveau1: 'Retirer' },
            specificitesProjet: { postesDeTravail: 'Ajouter' },
          },
        },
      })
    );

    const resultat = s.selectionnePourService(
      uneDescriptionDeNiveauDeSecuriteEstime1()
        .avecSpecificitesProjet(['postesDeTravail'])
        .construis()
    );

    expect(resultat).not.toContain('V1');
  });

  it('sait raisonner sur plusieurs vecteurs', () => {
    const s = new SelectionVecteurs(
      configurationVecteurs({
        V1: {
          presentInitialement: false,
          regles: {
            niveauSecurite: { niveau1: 'Ajouter' },
          },
        },
        V2: {
          presentInitialement: false,
          regles: {
            specificitesProjet: { postesDeTravail: 'Ajouter' },
          },
        },
      })
    );

    const resultat = s.selectionnePourService(
      uneDescriptionDeNiveauDeSecuriteEstime1()
        .avecSpecificitesProjet(['postesDeTravail'])
        .construis()
    );

    expect(resultat).toContain('V1');
    expect(resultat).toContain('V2');
  });

  describe('pour les cas métier', () => {
    // Ce type force une paire "règle + modificateur" cohérente
    type UneRegle = {
      [K in keyof ReglesDeSelection]: {
        regle: K;
        modificateur: keyof NonNullable<ReglesDeSelection[K]>;
        service: DescriptionServiceV2;
      };
    }[keyof ReglesDeSelection];

    const casDeTests: Array<NonNullable<UneRegle>> = [
      {
        // Effet : Basique
        regle: 'niveauSecurite',
        modificateur: 'niveau1',
        service: uneDescriptionDeNiveauDeSecuriteEstime1().construis(),
      },
      {
        // Effet : Modéré
        regle: 'niveauSecurite',
        modificateur: 'niveau2',
        service: uneDescriptionDeNiveauDeSecuriteEstime2().construis(),
      },
      {
        // Effet : Postes de travail,
        regle: 'specificitesProjet',
        modificateur: 'postesDeTravail',
        service: uneDescriptionV2Valide()
          .avecSpecificitesProjet(['postesDeTravail'])
          .construis(),
      },
      {
        // Effet : Accès physiques,
        regle: 'specificitesProjet',
        modificateur: 'accesPhysiqueAuxSallesTechniques',
        service: uneDescriptionV2Valide()
          .avecSpecificitesProjet(['accesPhysiqueAuxSallesTechniques'])
          .construis(),
      },
      {
        // Effet : IaaS / PaaS,
        regle: 'typeHebergement',
        modificateur: 'cloud',
        service: uneDescriptionV2Valide()
          .avecTypeHebergement('cloud')
          .construis(),
      },
      {
        // Effet : SaaS,
        regle: 'typeHebergement',
        modificateur: 'saas',
        service: uneDescriptionV2Valide()
          .avecTypeHebergement('saas')
          .construis(),
      },
      {
        // Effet : Admin tech externalisé,
        regle: 'activitesExternalisees',
        modificateur: 'administrationTechnique',
        service: uneDescriptionV2Valide()
          .quiExternalise(['administrationTechnique'])
          .construis(),
      },
      {
        // Effet : Développement externalisé,
        regle: 'activitesExternalisees',
        modificateur: 'developpementLogiciel',
        service: uneDescriptionV2Valide()
          .quiExternalise(['developpementLogiciel'])
          .construis(),
      },
      {
        // Effet : Ouv +++,
        regle: 'ouvertureSysteme',
        modificateur: 'internePlusTiers',
        service: uneDescriptionV2Valide()
          .avecOuvertureSysteme('internePlusTiers')
          .construis(),
      },
      {
        // Effet : Ouv ++++,
        regle: 'ouvertureSysteme',
        modificateur: 'accessibleSurInternet',
        service: uneDescriptionV2Valide()
          .avecOuvertureSysteme('accessibleSurInternet')
          .construis(),
      },
      {
        // Effet : Dispo +++,
        regle: 'dureeDysfonctionnementAcceptable',
        modificateur: 'moinsDe12h',
        service: uneDescriptionV2Valide()
          .avecDureeDysfonctionnementAcceptable('moinsDe12h')
          .construis(),
      },
      {
        // Effet : Dispo ++++
        regle: 'dureeDysfonctionnementAcceptable',
        modificateur: 'moinsDe4h',
        service: uneDescriptionV2Valide()
          .avecDureeDysfonctionnementAcceptable('moinsDe4h')
          .construis(),
      },
    ];

    it.each(casDeTests)(
      'sait appliquer le modificateur $regle -> $modificateur',
      ({ regle, modificateur, service }) => {
        const s = new SelectionVecteurs(
          configurationVecteurs({
            V1: {
              presentInitialement: false,
              regles: {
                [regle]: { [modificateur]: 'Ajouter' },
              },
            },
          })
        );

        const resultat = s.selectionnePourService(service);

        expect(resultat).toContain('V1');
      }
    );
  });
});
