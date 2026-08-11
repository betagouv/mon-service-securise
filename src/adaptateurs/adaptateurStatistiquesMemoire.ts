import { AdaptateurStatistiques } from './adaptateurStatistiques.interface.js';

const recupereStatistiques = async () => ({
  utilisateurs: {
    nombre: 5000,
  },
  services: {
    nombre: 5000,
  },
  vulnerabilites: {
    nombre: 5000,
  },
});

export const adaptateurStatistiquesMemoire: AdaptateurStatistiques = {
  recupereStatistiques,
};
