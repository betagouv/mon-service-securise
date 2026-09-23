import Service from '../../modeles/service.js';
import RisqueGeneral from '../../modeles/risqueGeneral.js';
import RisqueSpecifique from '../../modeles/risqueSpecifique.js';
import { TousReferentiels } from '../../referentiel.interface.js';
import { IdRisque } from '../../referentiel.types.js';
import {
  ReponseRisquesApiPublique,
  RisqueApiPublique,
} from '../schemas/risques.schema.js';

type Categories = RisqueApiPublique['categories'];
type NiveauGravite = RisqueApiPublique['niveauGravite'];
type NiveauVraisemblance = RisqueApiPublique['niveauVraisemblance'];

type Evaluation = {
  niveauGravite?: string;
  niveauVraisemblance?: string;
  commentaire?: string;
};

const evaluation = ({
  niveauGravite,
  niveauVraisemblance,
  commentaire,
}: Evaluation) => ({
  niveauGravite: (niveauGravite || null) as NiveauGravite,
  niveauVraisemblance: (niveauVraisemblance || null) as NiveauVraisemblance,
  commentaire: commentaire || null,
});

const risquesV1 = (service: Service): RisqueApiPublique[] => {
  const { referentiel } = service;
  const risquesEvalues: RisqueGeneral[] = service.risques.risquesGeneraux.items;
  const evaluationDe = (id: string) => risquesEvalues.find((r) => r.id === id);

  const generaux = Object.keys(referentiel.risques())
    .filter((id) => !evaluationDe(id)?.desactive)
    .map((id) => ({
      id,
      origine: 'referentielV1' as const,
      intitule: referentiel.descriptionRisque(id as IdRisque),
      categories: [...referentiel.categoriesRisque(id as IdRisque)],
      ...evaluation(evaluationDe(id) ?? {}),
    }));

  const specifiques = service.risques.risquesSpecifiques.items.map(
    (risque: RisqueSpecifique) => ({
      id: risque.id,
      origine: 'utilisateur' as const,
      intitule: risque.intitule,
      categories: risque.categories as Categories,
      ...evaluation(risque),
    })
  );

  return [...generaux, ...specifiques];
};

const idDepuisPosition = (
  niveaux: Record<string, { position: number }>,
  position: number
) =>
  Object.entries(niveaux).find(
    ([, niveau]) => niveau.position === position
  )?.[0];

type RisqueV2Serialise = {
  id: string;
  intitule: string;
  categories: string[];
  gravite: number;
  vraisemblance: number;
  commentaire?: string;
  desactive?: boolean;
};

const risquesV2 = (service: Service): RisqueApiPublique[] => {
  const { referentiel }: { referentiel: TousReferentiels } = service;
  const { risques, risquesSpecifiques } = service.risquesV2!.toJSON() as {
    risques: RisqueV2Serialise[];
    risquesSpecifiques: RisqueV2Serialise[];
  };

  const enRisqueApiPublique =
    (origine: RisqueApiPublique['origine']) =>
    (risque: RisqueV2Serialise): RisqueApiPublique => ({
      id: risque.id,
      origine,
      intitule: risque.intitule,
      categories: risque.categories as Categories,
      ...evaluation({
        niveauGravite: idDepuisPosition(
          referentiel.niveauxGravite(),
          risque.gravite
        ),
        niveauVraisemblance: idDepuisPosition(
          referentiel.niveauxVraisemblance(),
          risque.vraisemblance
        ),
        commentaire: risque.commentaire,
      }),
    });

  return [
    ...risques
      .filter((risque) => !risque.desactive)
      .map(enRisqueApiPublique('referentielV2')),
    ...risquesSpecifiques.map(enRisqueApiPublique('utilisateur')),
  ];
};

export const serialiseRisquesPourAPIPublique = (
  service: Service,
  { avecRisquesV2 }: { avecRisquesV2: boolean }
): ReponseRisquesApiPublique => ({
  donnees: avecRisquesV2 ? risquesV2(service) : risquesV1(service),
});
