import {
  AudienceCible,
  CategorieDonneesTraitees,
  DureeDysfonctionnementAcceptable,
  NiveauSecurite,
  OuvertureSysteme,
  questionsV2,
  VolumetrieDonneesTraitees,
} from '../../../donneesReferentielMesuresV2.js';

export type NiveauCriticite = 1 | 2 | 3 | 4;
export type NiveauExposition = 1 | 2 | 3 | 4;

export function criticiteMaxDeDonneesTraitees(
  categories: CategorieDonneesTraitees[]
) {
  return Math.max(
    ...categories.map((c) => questionsV2.categorieDonneesTraitees[c].criticite)
  ) as NiveauCriticite;
}

export function criticiteDeDisponibilite(
  disponibilite: DureeDysfonctionnementAcceptable
) {
  return questionsV2.dureeDysfonctionnementAcceptable[disponibilite]
    .criticite as NiveauCriticite;
}

export function criticiteOuverture(ouvertureSysteme: OuvertureSysteme) {
  return questionsV2.ouvertureSysteme[ouvertureSysteme]
    .criticite as NiveauCriticite;
}

export const matriceCriticiteVolumetrieDonneesTraitees: NiveauCriticite[][] = [
  [1, 1, 2, 2],
  [1, 1, 2, 3],
  [1, 2, 3, 4],
  [1, 2, 4, 4],
];

export const matriceCriticiteAudienceCibleDisponibilite: NiveauCriticite[][] = [
  [1, 1, 2, 3],
  [1, 1, 2, 3],
  [1, 1, 3, 4],
  [1, 1, 3, 4],
];

export const criticiteVolumetrieDonneesTraitees = (
  volumetrie: VolumetrieDonneesTraitees,
  categories: CategorieDonneesTraitees[],
  autresDonneesTraitees: string[]
): NiveauCriticite => {
  const criticiteVolumetrie: NiveauCriticite =
    questionsV2.volumetrieDonneesTraitees[volumetrie].criticite;

  const criticiteDonnees: NiveauCriticite[] = categories.map(
    (c) => questionsV2.categorieDonneesTraitees[c].criticite
  );
  if (autresDonneesTraitees.length > 0) {
    criticiteDonnees.push(1);
  }
  return criticiteDonnees
    .map(
      (criticite) =>
        matriceCriticiteVolumetrieDonneesTraitees[criticiteVolumetrie - 1][
          criticite - 1
        ]
    )
    .reduce((c1, c2) => Math.max(c1, c2) as NiveauCriticite, 1);
};

export const criticiteDisponibiliteEtAudienceCible = (
  disponibilite: DureeDysfonctionnementAcceptable,
  audienceCible: AudienceCible
): NiveauCriticite => {
  const criticiteAudienceCible =
    questionsV2.audienceCible[audienceCible].criticite;
  const criticiteDisponibilite = criticiteDeDisponibilite(disponibilite);
  return matriceCriticiteAudienceCibleDisponibilite[criticiteAudienceCible - 1][
    criticiteDisponibilite - 1
  ];
};

export const matriceExposition: NiveauExposition[][] = [[1, 2, 2, 3]];

export const niveauExposition = (
  ouvertureSysteme: OuvertureSysteme
): NiveauExposition =>
  matriceExposition[0][criticiteOuverture(ouvertureSysteme) - 1];

export const matriceBesoinsSecuriteCriticiteExposition: NiveauSecurite[][] = [
  ['niveau1', 'niveau1', 'niveau1', 'niveau2'],
  ['niveau1', 'niveau1', 'niveau2', 'niveau2'],
  ['niveau2', 'niveau2', 'niveau3', 'niveau3'],
  ['niveau2', 'niveau3', 'niveau3', 'niveau3'],
];

export type PourCalculNiveauSecurite = {
  volumetrie: VolumetrieDonneesTraitees;
  categories: CategorieDonneesTraitees[];
  autresDonneesTraitees: string[];
  disponibilite: DureeDysfonctionnementAcceptable;
  audienceCible: AudienceCible;
  ouvertureSysteme: OuvertureSysteme;
};

export const niveauSecuriteRequis = ({
  volumetrie,
  categories,
  autresDonneesTraitees,
  ouvertureSysteme,
  audienceCible,
  disponibilite,
}: PourCalculNiveauSecurite): NiveauSecurite => {
  const criticiteDonnees = criticiteVolumetrieDonneesTraitees(
    volumetrie,
    categories,
    autresDonneesTraitees
  );
  const criticiteDisponibilite = criticiteDisponibiliteEtAudienceCible(
    disponibilite,
    audienceCible
  );
  const criticiteGenerale = Math.max(criticiteDonnees, criticiteDisponibilite);
  const exposition = niveauExposition(ouvertureSysteme);
  return matriceBesoinsSecuriteCriticiteExposition[criticiteGenerale - 1][
    exposition - 1
  ];
};
