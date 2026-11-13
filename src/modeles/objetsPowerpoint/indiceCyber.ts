import Service from '../service.js';

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

export const indiceCyber = (service: Service): IndiceCyberDuService => {
  const { referentiel } = service;
  const indice = service.indiceCyber();
  return {
    nomService: service.nomService(),
    total: indice.total,
    totalPersonnalise: service.indiceCyberPersonnalise().total,
    noteMax: referentiel.indiceCyberNoteMax(),
    categories: referentiel.indiceCyberAvecLibellesCategories(indice),
    referentiels: service.referentielsDesMesuresGenerales(),
  };
};
