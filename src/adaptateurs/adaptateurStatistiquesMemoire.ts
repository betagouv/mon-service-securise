import { AdaptateurStatistiques } from './adaptateurStatistiques.interface.js';

const recupereStatistiques = async () => ({
  utilisateurs: {
    nombre: 5000,
    progression: '50%',
  },
  services: {
    nombre: 5000,
    progression: '50%',
  },
  vulnerabilites: {
    nombre: 5000,
    progression: '50%',
  },
  indiceCyber: { nombre: '50%' },
});

export const adaptateurStatistiquesMemoire: AdaptateurStatistiques = {
  recupereStatistiques,
};
