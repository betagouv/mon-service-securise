export type NombrePourStatistiquesPubliques = {
  nombre: number;
};

type StatistiquesPubliques = {
  utilisateurs: NombrePourStatistiquesPubliques;
  services: NombrePourStatistiquesPubliques;
  vulnerabilites: NombrePourStatistiquesPubliques;
};

export interface AdaptateurStatistiques {
  recupereStatistiques: () => Promise<StatistiquesPubliques>;
}
