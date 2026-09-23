import Service from '../../modeles/service.js';
import Dossier from '../../modeles/dossier.js';
import { dateEnIso } from '../../utilitaires/date.js';
import {
  HomologationApiPublique,
  ReponseHomologationApiPublique,
} from '../schemas/homologation.schema.js';

const serialiseHomologation = (dossier: Dossier): HomologationApiPublique => {
  const { dateHomologation, dureeValidite } = dossier.decision;

  return {
    statut: dossier.statutHomologation() as HomologationApiPublique['statut'],
    dateDecision: dateEnIso(dateHomologation),
    dureeValidite: dureeValidite!,
    dateEcheance: dateEnIso(dossier.dateProchaineHomologation().toISOString()),
  };
};

export const serialiseHomologationPourAPIPublique = (
  service: Service
): ReponseHomologationApiPublique => {
  const dossierActif: Dossier | undefined = service.dossiers.dossierActif();

  return { enCours: dossierActif ? serialiseHomologation(dossierActif) : null };
};
