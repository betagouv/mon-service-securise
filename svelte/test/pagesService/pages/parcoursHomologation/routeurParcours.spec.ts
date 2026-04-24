import { etapeDeURL } from '../../../../lib/pagesService/pages/parcoursHomologation/routeurParcours';

describe("Le routeur du parcours d'homologation", () => {
  const urlSurEtape = (etape: string) =>
    `/service/:uuid/homologation/edition/etape/${etape}`;

  it("sait extraire l'étape correpondant à l'URL d'un utilisateur", () => {
    const url = urlSurEtape('autorite');

    const cible = etapeDeURL(url);

    expect(cible).toBe('autorite');
  });

  it("throw une erreur si l'URL ne correspond à aucune étape", () => {
    expect(() => etapeDeURL(urlSurEtape('pasUneEtape'))).toThrow();
  });
});
