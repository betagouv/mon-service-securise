type Nombre = {
  nombre: number;
};

type StatistiquesPubliques = {
  utilisateurs: Nombre;
  services: Nombre;
  vulnerabilites: Nombre;
};

export interface AdaptateurStatistiques {
  recupereStatistiques: () => Promise<StatistiquesPubliques>;
}
