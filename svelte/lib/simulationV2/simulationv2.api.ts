import type { UUID } from '../typesBasiquesSvelte';
import type { BrouillonIncomplet } from '../creationV2/creationV2.types';
import type { MiseAJour } from '../creationV2/creationV2.api';
import type { IdNiveauDeSecurite } from '../ui/types';
import type { NiveauSecurite } from '../../../donneesReferentielMesuresV2';
import type { DetailMesure } from '../../../src/moteurRegles/simulationMigration/simulationMigrationReferentiel.types';
import { creeFileMisesAJour } from '../ui/stores/fileMisesAJour.store';
import { toasterStore } from '../ui/stores/toaster.store';
import { isAxiosError } from 'axios';

type Simulation = BrouillonIncomplet;

export type ResumeEvolutions = {
  evolutionIndiceCyber: {
    v1: number;
    v2: number;
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
export type DetailStatutEvolutionMesure = DetailMesure['detailStatut'];

export const lisSimulation = async (idService: UUID): Promise<Simulation> =>
  (
    await axios.get<Simulation>(
      `/api/service/${idService}/simulation-migration-referentiel`
    )
  ).data;

const appliqueLaMiseAJour = async (idService: UUID, donnees: MiseAJour) => {
  const misesAJour = Object.entries(donnees);
  for (let i = 0; i < misesAJour.length; i++) {
    const [proprieteMiseAJour, valeurMiseAJour] = misesAJour[i];
    await axios.put(
      `/api/service/${idService}/simulation-migration-referentiel/${proprieteMiseAJour}`,
      { [proprieteMiseAJour]: valeurMiseAJour }
    );
  }
};

export const fileMAJSimulation = creeFileMisesAJour(() =>
  toasterStore.erreur('Une erreur est survenue', 'Merci de recharger la page')
);

export const metsAJourSimulation = async (
  idService: UUID,
  donnees: MiseAJour
) => {
  await fileMAJSimulation.ajoute(() => appliqueLaMiseAJour(idService, donnees));
};

export const niveauSecuriteMinimalRequis = async (
  idService: UUID
): Promise<IdNiveauDeSecurite> => {
  await fileMAJSimulation.attendsLaFin();

  try {
    return (
      await axios.get<{ niveauDeSecuriteMinimal: NiveauSecurite }>(
        `/api/service/${idService}/simulation-migration-referentiel/niveauSecuriteRequis`
      )
    ).data.niveauDeSecuriteMinimal as IdNiveauDeSecurite;
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 422) {
      toasterStore.erreur(
        'Une erreur est survenue',
        'Merci de recharger la page'
      );
    }
    throw e;
  }
};

export const lisEvolutionMesures = async (
  idService: UUID
): Promise<ResumeEvolutions> =>
  (
    await axios.get<ResumeEvolutions>(
      `/api/service/${idService}/simulation-migration-referentiel/evolution-mesures`
    )
  ).data as ResumeEvolutions;

export const finaliseMigration = async (idService: UUID) => {
  await fileMAJSimulation.attendsLaFin();
  await axios.post(
    `/api/service/${idService}/simulation-migration-referentiel/finalise`
  );
};
