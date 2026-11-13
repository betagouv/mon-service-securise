import Service from '../service.js';
import {
  IdCategorieMesure,
  IdReferentielMesure,
} from '../../referentiel.types.js';

export type IndiceCyberDeCategorie = {
  libelle: string;
  note: number;
};

export type IndiceCyberDuService = {
  nomService: string;
  total: number;
  totalPersonnalise: number;
  noteMax: number;
  categories: IndiceCyberDeCategorie[];
  referentiels: string;
};

const referentielsDesMesuresProposees = (service: Service) => {
  const { mesuresGenerales } =
    service.mesures.enrichiesAvecDonneesPersonnalisees();
  const referentiels = Object.values(mesuresGenerales).map(
    (mesure) => (mesure as { referentiel: IdReferentielMesure }).referentiel
  );
  return service.referentiel
    .formatteListeDeReferentiels(referentiels)
    .replaceAll("'", '’');
};

export const indiceCyber = (service: Service): IndiceCyberDuService => {
  const { referentiel } = service;
  const indice = service.indiceCyber();
  return {
    nomService: service.nomService(),
    total: indice.total,
    totalPersonnalise: service.indiceCyberPersonnalise().total,
    noteMax: referentiel.indiceCyberNoteMax(),
    categories: referentiel
      .identifiantsCategoriesMesures()
      .map((idCategorie) => ({
        libelle: referentiel.descriptionCategorie(
          idCategorie as IdCategorieMesure
        ),
        note: indice[idCategorie],
      })),
    referentiels: referentielsDesMesuresProposees(service),
  };
};
