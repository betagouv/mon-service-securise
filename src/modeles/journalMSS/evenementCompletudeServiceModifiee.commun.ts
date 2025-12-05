import Service from '../service.js';
import { AdaptateurChiffrement } from '../../adaptateurs/adaptateurChiffrement.interface.js';
import { CategorieMesure, DonneesIndiceCyber } from '../indiceCyber.type.js';
import PointsAcces from '../pointsAcces.js';

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
  const {
    indiceCyber,
    nombreTotalMesures,
    nombreMesuresCompletes,
    detailMesures,
  } = service.completudeMesures();
  const description = service.descriptionService;

  return {
    detailIndiceCyber: enTableau(indiceCyber),
    detailMesures,
    idService: adaptateurChiffrement.hacheSha256(service.id),
    niveauSecurite: description.niveauSecurite,
    niveauSecuriteMinimal: service.estimeNiveauDeSecurite(),
    nombreMesuresCompletes,
    nombreTotalMesures,
    pointsAcces: (description.pointsAcces as PointsAcces).nombre(),
    statutDeploiement: description.statutDeploiement,
    typeService: description.typeService,
    versionIndiceCyber: 'v2',
    versionService: service.version(),
  };
};
