import Service from '../service.js';
import { AdaptateurChiffrement } from '../../adaptateurs/adaptateurChiffrement.interface.js';
import { CategorieMesure, DonneesIndiceCyber } from '../indiceCyber.type.js';

type TableauIndiceCyber = Array<{ categorie: CategorieMesure; indice: number }>;

const enTableau = (donneesIndiceCyber: DonneesIndiceCyber) =>
  Object.entries(donneesIndiceCyber).reduce<TableauIndiceCyber>(
    (acc, [categorie, indice]) => [
      ...acc,
      { categorie: categorie as CategorieMesure, indice },
    ],
    []
  );

export const completudeCommune = (
  service: Service,
  adaptateurChiffrement: AdaptateurChiffrement
) => {
  const niveauSecuriteMinimal = service.estimeNiveauDeSecurite();
  const { indiceCyber } = service.completudeMesures();

  return {
    idService: adaptateurChiffrement.hacheSha256(service.id),
    niveauSecuriteMinimal,
    detailIndiceCyber: enTableau(indiceCyber),
  };
};
