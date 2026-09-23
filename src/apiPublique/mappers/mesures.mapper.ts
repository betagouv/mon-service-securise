import Service from '../../modeles/service.js';
import Mesure from '../../modeles/mesure.js';
import MesureSpecifique from '../../modeles/mesureSpecifique.js';
import { VersionService } from '../../modeles/versionService.js';
import { dateEnIso } from '../../utilitaires/date.js';
import {
  MesureApiPublique,
  ReponseMesuresApiPublique,
} from '../schemas/mesures.schema.js';

type StatutApiPublique = MesureApiPublique['statut'];
type OrigineApiPublique = MesureApiPublique['origine'];
type CategorieApiPublique = MesureApiPublique['categorie'];

type DonneesMesurePersonnalisee = {
  description: string;
  categorie: CategorieApiPublique;
  indispensable?: boolean;
};

type EtatApplication = {
  statut?: string;
  echeance?: Date;
  modalites?: string;
};

const etatApplication = ({ statut, echeance, modalites }: EtatApplication) => ({
  statut: Mesure.statutRenseigne(statut) ? (statut as StatutApiPublique) : null,
  echeance: echeance ? dateEnIso(echeance.toISOString()) : null,
  modalites: modalites || null,
});

const origineReferentiel = (service: Service): OrigineApiPublique =>
  service.version() === VersionService.v2 ? 'referentielV2' : 'referentielV1';

const mesuresDuReferentiel = (service: Service): MesureApiPublique[] => {
  const { mesuresPersonnalisees, mesuresGenerales } = service.mesures;
  const origine = origineReferentiel(service);

  return Object.entries(
    mesuresPersonnalisees as Record<string, DonneesMesurePersonnalisee>
  ).map(([id, { description, categorie, indispensable }]) => ({
    id,
    origine,
    intitule: description,
    categorie,
    indispensable: !!indispensable,
    ...etatApplication(mesuresGenerales.avecId(id) ?? {}),
  }));
};

const mesuresSpecifiques = (service: Service): MesureApiPublique[] =>
  service.mesures.mesuresSpecifiques.items.map((mesure: MesureSpecifique) => ({
    id: mesure.id,
    origine: 'utilisateur',
    intitule: mesure.description,
    categorie: mesure.categorie as CategorieApiPublique,
    indispensable: false,
    ...etatApplication(mesure),
  }));

const syntheseParStatut = (mesures: MesureApiPublique[]) => {
  const totalParStatut = (statut: StatutApiPublique) =>
    mesures.filter((m) => m.statut === statut).length;

  return {
    fait: totalParStatut('fait'),
    enCours: totalParStatut('enCours'),
    nonFait: totalParStatut('nonFait'),
    aLancer: totalParStatut('aLancer'),
    nonRenseigne: totalParStatut(null),
  };
};

export const serialiseMesuresPourAPIPublique = (
  service: Service
): ReponseMesuresApiPublique => {
  const mesures = [
    ...mesuresDuReferentiel(service),
    ...mesuresSpecifiques(service),
  ];

  return { synthese: syntheseParStatut(mesures), donnees: mesures };
};
