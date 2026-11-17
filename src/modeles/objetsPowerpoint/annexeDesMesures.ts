import Service from '../service.js';
import { IdMesureV1 } from '../../../donneesConversionReferentielMesures.js';
import { IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';
import { IdCategorieMesure } from '../../referentiel.types.js';

type IdMesure = IdMesureV1 & IdMesureV2;

const STATUTS_DE_L_ANNEXE = [
  'fait',
  'enCours',
  'aLancer',
  'sansStatut',
] as const;

export type StatutDeLAnnexe = (typeof STATUTS_DE_L_ANNEXE)[number];

export type MesureDeLAnnexe = {
  description: string;
  categorie: string;
  criticite: string;
  referentiel: string;
};

export type MesuresDUnStatut = {
  statut: StatutDeLAnnexe;
  mesures: MesureDeLAnnexe[];
};

type MesureRangee = { statut?: string; mesure: MesureDeLAnnexe };

type MesurePersonnalisee = { indispensable?: boolean };

const mesuresGenerales = ({
  referentiel,
  mesures,
}: Service): MesureRangee[] => {
  const mesuresPersonnalisees = mesures.mesuresPersonnalisees as Record<
    string,
    MesurePersonnalisee
  >;
  const idsApplicables = Object.keys(mesuresPersonnalisees);
  return (Object.keys(referentiel.mesures()) as IdMesure[])
    .filter((id) => idsApplicables.includes(id))
    .map((id) => {
      const {
        description,
        categorie,
        indispensable,
        referentiel: source,
      } = referentiel.mesure(id);
      const estIndispensable =
        !!indispensable || mesuresPersonnalisees[id].indispensable;
      return {
        statut: mesures.mesuresGenerales.avecId(id)?.statut,
        mesure: {
          description,
          categorie: referentiel.descriptionCategorie(
            categorie as IdCategorieMesure
          ),
          criticite: estIndispensable ? 'Indispensable' : 'Recommandée',
          referentiel: source ?? '',
        },
      };
    });
};

const mesuresSpecifiques = ({
  referentiel,
  mesures,
}: Service): MesureRangee[] =>
  mesures.mesuresSpecifiques
    .toutes()
    .map(({ description, statut, categorie }) => ({
      statut,
      mesure: {
        description,
        categorie: referentiel.descriptionCategorie(
          categorie as IdCategorieMesure
        ),
        criticite: '',
        referentiel: 'Mesures ajoutées',
      },
    }));

const statutDansLAnnexe = (statut?: string) => statut ?? 'sansStatut';

export const annexeDesMesures = (service: Service): MesuresDUnStatut[] => {
  const mesuresRangees = [
    ...mesuresGenerales(service),
    ...mesuresSpecifiques(service),
  ];
  return STATUTS_DE_L_ANNEXE.map((statut) => ({
    statut,
    mesures: mesuresRangees
      .filter(
        (mesureRangee) => statutDansLAnnexe(mesureRangee.statut) === statut
      )
      .map(({ mesure }) => mesure),
  })).filter(({ mesures }) => mesures.length > 0);
};
