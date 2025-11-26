import type { UUID } from '../typesBasiquesSvelte';
import type { BrouillonIncomplet } from '../creationV2/creationV2.types';
import type { MiseAJour } from '../creationV2/creationV2.api';
import type { IdNiveauDeSecurite } from '../ui/types';
import type { NiveauSecurite } from '../../../donneesReferentielMesuresV2';
import type { DetailMesure } from '../../../src/moteurRegles/simulationMigration/simulationMigrationReferentiel.types';

type Simulation = BrouillonIncomplet;

export type ResumeEvolutions = {
  indiceCyberV1: {
    total: number;
    max: number;
  };
  evolutionMesures: {
    nbMesuresInchangees: number;
    nbMesuresModifiees: number;
    nbMesuresSupprimees: number;
    nbMesures: number;
    nbMesuresAjoutees: number;
    detailsMesures: DetailMesure[];
  };
};

export type StatutEvolutionMesure = DetailMesure['statut'];

export const lisSimulation = async (idService: UUID): Promise<Simulation> =>
  (
    await axios.get<Simulation>(
      `/api/service/${idService}/simulation-migration-referentiel`
    )
  ).data;

export const metsAJourSimulation = async (
  idService: UUID,
  donnees: MiseAJour
) => {
  const misesAJour = Object.entries(donnees);
  for (let i = 0; i < misesAJour.length; i++) {
    const [proprieteMiseAJour, valeurMiseAJour] = misesAJour[i];
    await axios.put(
      `/api/service/${idService}/simulation-migration-referentiel/${proprieteMiseAJour}`,
      { [proprieteMiseAJour]: valeurMiseAJour }
    );
  }
};

export const niveauSecuriteMinimalRequis = async (
  idService: UUID
): Promise<IdNiveauDeSecurite> =>
  (
    await axios.get<{ niveauDeSecuriteMinimal: NiveauSecurite }>(
      `/api/service/${idService}/simulation-migration-referentiel/niveauSecuriteRequis`
    )
  ).data.niveauDeSecuriteMinimal as IdNiveauDeSecurite;

export const lisEvolutionMesures = async (
  idService: UUID
): Promise<ResumeEvolutions> =>
  (
    await axios.get<ResumeEvolutions>(
      `/api/service/${idService}/simulation-migration-referentiel/evolution-mesures`
    )
  ).data as ResumeEvolutions;
