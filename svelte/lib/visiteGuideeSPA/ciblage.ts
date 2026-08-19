import type { Attachment } from 'svelte/attachments';
import type { IdNiveauDeSecurite } from '../ui/types';

// Pour faire {@attach … }
export const cibleDeVisiteGuidee = (
  idDeCiblage: string
): Attachment<HTMLElement> => {
  return (node: HTMLElement) => {
    node.setAttribute('data-visite-guidee-id', idDeCiblage);
  };
};

class CibleVisiteGuidee {
  constructor(
    private readonly idCible: string,
    private readonly index: number = 0
  ) {}

  public query() {
    return `[data-visite-guidee-id="${this.idCible}"]`;
  }

  public el() {
    return document.querySelectorAll(this.query())[this.index] as HTMLElement;
  }

  public id() {
    return this.idCible;
  }
}

class CibleVisiteGuideeDirecteDom extends CibleVisiteGuidee {
  private readonly queryDom: string;

  constructor(queryDom: string) {
    super('', 0);
    this.queryDom = queryDom;
  }

  public query(): string {
    return this.queryDom;
  }
}

const rectangleEnglobant = (elements: HTMLElement[]): DOMRect => {
  const rects = elements.map((e) => e.getBoundingClientRect());
  const top = Math.min(...rects.map((r) => r.top));
  const left = Math.min(...rects.map((r) => r.left));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  const right = Math.max(...rects.map((r) => r.right));
  return new DOMRect(left, top, right - left, bottom - top);
};

class CibleVisiteGuideeEnglobante extends CibleVisiteGuideeDirecteDom {
  constructor(
    private readonly queryElements: string,
    queryDetection: string
  ) {
    super(queryDetection);
  }

  public el(): HTMLElement {
    return {
      getBoundingClientRect: () =>
        rectangleEnglobant(
          Array.from(document.querySelectorAll<HTMLElement>(this.queryElements))
        ),
      style: {} as CSSStyleDeclaration,
    } as HTMLElement;
  }
}

export const ciblage = () => ({
  listeMesures: () =>
    new CibleVisiteGuideeEnglobante(
      'table tr:nth-child(3), table tr:nth-child(4)',
      'table tr:nth-child(4)'
    ),
  statistiques: () => new CibleVisiteGuidee('admin-statistiques'),
  decrireV2: () => ({
    besoinsSecurite: (id: IdNiveauDeSecurite) =>
      new CibleVisiteGuidee(`besoins-securite-${id}`),
  }),
  securiser: () => ({
    deuxiemeLigneMesure: () => new CibleVisiteGuidee('ligne-de-mesure', 1),
    matriceRisquesV2: () => new CibleVisiteGuidee('matrice-risques-v2'),
    ligneRisque: (index: number) =>
      new CibleVisiteGuidee(`ligne-risque-${index}`),
    lignesRisques: (indices: number[]) =>
      new CibleVisiteGuideeEnglobante(
        indices
          .map((index) => `[data-visite-guidee-id="ligne-risque-${index}"]`)
          .join(', '),
        `[data-visite-guidee-id="ligne-risque-${Math.max(...indices)}"]`
      ),
    premiereMesure: () => new CibleVisiteGuidee('titre-mesure'),
    gererContributeurs: () => new CibleVisiteGuidee('gerer-contributeurs'),
  }),
  tiroir: () => new CibleVisiteGuidee('tiroir'),
});
