import { describe, it } from 'vitest';
import type {
  Risque,
  RisqueSpecifiqueV2,
  TousRisques,
} from '../../lib/risquesV2/risquesV2';
import { risquesAppliques } from '../../lib/risquesV2/risquesAppliques';
import type { ReferentielVecteursRisque } from '../../lib/risques/risques';

describe('La méthode qui trouve les risques appliqués', () => {
  const vecteurs: ReferentielVecteursRisque = {
    V1: {
      intitule: "Compromission d'un poste de travail utilisateur",
      description: '… description … le poste de travail …',
      exemple: '… exemple  … le poste de travail …',
      intitulesObjectifsVises: {
        OV2: 'pour récupérer ou falsifier des informations',
      },
    },
    V2: {
      intitule: "Compromission de ressources d'administration internes",
      description: '… description … une ressource utilisée …',
      exemple: '… exemple … une ressource utilisée …',
      intitulesObjectifsVises: {
        OV1: 'pour défigurer le service',
        OV2: 'pour récupérer ou falsifier des informations',
        OV3: "pour rendre indisponible l'activité du service",
        OV4: 'pour envoyer des mails altérés',
      },
    },
  };

  const unRisqueSpecifiqueVecteur2Objectif3: RisqueSpecifiqueV2 = {
    identifiantNumerique: 'RS1',
    idModele: 'V2OV3',
    vraisemblanceBrute: 1,
    vraisemblance: 1,
    graviteBrute: 1,
    gravite: 1,
    intitule: 'intitule',
    categories: [],
    id: '2c8facfc-bf10-45aa-949c-4f8d8231d818',
    description: 'desc',
  };

  const unRisquePourVecteur2EtObjectifs2Et3: Risque = {
    id: 'R2',
    idsObjectifsVises: ['OV2', 'OV3'],
    idVecteur: 'V2',
    categories: [],
    description: '',
    exemple: '',
    gravite: 1,
    graviteCalculee: 1,
    intitule: '',
    mesuresAssociees: [],
    vraisemblance: 1,
  };

  it('trouve un risque spécifique associé', () => {
    const tousRisques: TousRisques = {
      risques: [],
      risquesBruts: [],
      risquesCibles: [],
      risquesSpecifiques: [unRisqueSpecifiqueVecteur2Objectif3],
    };

    const appliques = risquesAppliques(tousRisques, vecteurs);

    expect(appliques).toEqual({
      V1: {
        V1OV2: undefined,
      },
      V2: {
        V2OV1: undefined,
        V2OV2: undefined,
        V2OV3: {
          type: 'specifique',
          ...unRisqueSpecifiqueVecteur2Objectif3,
        },
        V2OV4: undefined,
      },
    });
  });

  it('trouve un risque ANSSI associé', () => {
    const tousRisques: TousRisques = {
      risques: [unRisquePourVecteur2EtObjectifs2Et3],
      risquesBruts: [],
      risquesCibles: [],
      risquesSpecifiques: [],
    };

    const appliques = risquesAppliques(tousRisques, vecteurs);

    expect(appliques).toEqual({
      V1: {
        V1OV2: undefined,
      },
      V2: {
        V2OV1: undefined,
        V2OV2: {
          type: 'ANSSI',
          ...unRisquePourVecteur2EtObjectifs2Et3,
        },
        V2OV3: {
          type: 'ANSSI',
          ...unRisquePourVecteur2EtObjectifs2Et3,
        },
        V2OV4: undefined,
      },
    });
  });
});
