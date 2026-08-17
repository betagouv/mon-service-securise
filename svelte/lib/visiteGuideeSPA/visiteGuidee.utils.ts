import type { PositionModale } from './visiteGuideeSPA.d';

const decoupeParDefaut = { marge: 24, rayon: 8 };

export const geleDefilementDuCorps = () => {
  const scrollGele = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollGele}px`;
  document.body.style.width = '100%';
  return scrollGele;
};

export const degeleDefilementDuCorps = (scrollGele: number) => {
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.overflow = '';
  window.scrollTo({ top: scrollGele, behavior: 'instant' });
};

export const cheminRectangleArrondi = (
  x: number,
  y: number,
  largeur: number,
  hauteur: number,
  rayon: number
) => {
  const r = Math.min(rayon, largeur / 2, hauteur / 2);
  return (
    `M${x + r} ${y} ` +
    `H${x + largeur - r} ` +
    `A${r} ${r} 0 0 1 ${x + largeur} ${y + r} ` +
    `V${y + hauteur - r} ` +
    `A${r} ${r} 0 0 1 ${x + largeur - r} ${y + hauteur} ` +
    `H${x + r} ` +
    `A${r} ${r} 0 0 1 ${x} ${y + hauteur - r} ` +
    `V${y + r} ` +
    `A${r} ${r} 0 0 1 ${x + r} ${y} ` +
    `Z`
  );
};

export const rectEgaux = (a: DOMRect, b: DOMRect) =>
  a.top === b.top &&
  a.left === b.left &&
  a.right === b.right &&
  a.bottom === b.bottom;

type EtendueVerticale = { top: number; bottom: number; height: number };

const estEntierementVisible = (etendue: EtendueVerticale) =>
  etendue.top >= 0 && etendue.bottom <= window.innerHeight;

const seraitEntierementVisibleEnHautDePage = (
  etendue: EtendueVerticale,
  defilementActuel: number
) => {
  const topDepuisHautDocument = etendue.top + defilementActuel;
  return (
    topDepuisHautDocument >= 0 &&
    topDepuisHautDocument + etendue.height <= window.innerHeight
  );
};

const englobe = (
  a: EtendueVerticale,
  b: EtendueVerticale
): EtendueVerticale => {
  const top = Math.min(a.top, b.top);
  const bottom = Math.max(a.bottom, b.bottom);
  return { top, bottom, height: bottom - top };
};

const etendueModaleProjetee = (
  rectCible: EtendueVerticale,
  hauteurModale: number,
  positionModale: PositionModale,
  decalageModale: number
): EtendueVerticale => {
  if (positionModale === 'bas') {
    const bottom = rectCible.top + decalageModale;
    return { top: bottom - hauteurModale, bottom, height: hauteurModale };
  }
  const top = rectCible.top + rectCible.height / 2 - hauteurModale / 2;
  return { top, bottom: top + hauteurModale, height: hauteurModale };
};

const scrolleSansBloquerLeCorps = (
  declencheScroll: () => void,
  scrollGele: number
): number => {
  degeleDefilementDuCorps(scrollGele);
  declencheScroll();
  return geleDefilementDuCorps();
};

export const ajusteHauteurScroll = (
  ouverture: HTMLElement,
  defilementActuel: number,
  scrollGele: number,
  modale?: {
    element: HTMLElement;
    position: PositionModale;
    decalage: number;
  }
): number => {
  const rectCible = ouverture.getBoundingClientRect();
  const etendueAVerifier = modale
    ? englobe(
        rectCible,
        etendueModaleProjetee(
          rectCible,
          modale.element.getBoundingClientRect().height,
          modale.position,
          modale.decalage
        )
      )
    : rectCible;

  if (
    seraitEntierementVisibleEnHautDePage(etendueAVerifier, defilementActuel)
  ) {
    if (defilementActuel !== 0) {
      return scrolleSansBloquerLeCorps(
        () => window.scrollTo({ top: 0, behavior: 'instant' }),
        scrollGele
      );
    }
  } else if (!estEntierementVisible(etendueAVerifier)) {
    const centreEtendue = (etendueAVerifier.top + etendueAVerifier.bottom) / 2;
    const nouveauDefilement =
      defilementActuel + centreEtendue - window.innerHeight / 2;
    return scrolleSansBloquerLeCorps(
      () => window.scrollTo({ top: nouveauDefilement, behavior: 'instant' }),
      scrollGele
    );
  }
  return scrollGele;
};

const attendStabiliteRect = (
  element: HTMLElement,
  essaisRestants = 60
): Promise<void> =>
  new Promise((resolve) => {
    const precedent = element.getBoundingClientRect();
    requestAnimationFrame(() => {
      const actuel = element.getBoundingClientRect();
      if (rectEgaux(precedent, actuel) || essaisRestants <= 0) {
        resolve();
      } else {
        resolve(attendStabiliteRect(element, essaisRestants - 1));
      }
    });
  });

const calculeDecoupe = (
  ouverture: HTMLElement,
  rideau: HTMLElement,
  cadreBlanc: HTMLElement,
  { marge, rayon } = decoupeParDefaut
) => {
  const { left, top, right, bottom } = ouverture.getBoundingClientRect();
  const cheminElement = cheminRectangleArrondi(
    left,
    top,
    right - left,
    bottom - top,
    0
  );
  const cheminMarge = cheminRectangleArrondi(
    left - marge,
    top - marge,
    right - left + marge * 2,
    bottom - top + marge * 2,
    rayon
  );

  rideau.style.clipPath = `path(evenodd, "M0 0 H${window.innerWidth} V${window.innerHeight} H0 Z ${cheminMarge}")`;
  cadreBlanc.style.clipPath = `path(evenodd, "${cheminMarge} ${cheminElement}")`;
};

const desactiveTransition = (element: HTMLElement) => {
  const transitionOriginale = element.style.transition;
  element.style.transition = 'none';
  element.getBoundingClientRect();
  return () => {
    element.style.transition = transitionOriginale;
  };
};

export const calculeRectangleOuverture = async (
  ouverture: HTMLElement,
  rideau: HTMLElement,
  cadreBlanc: HTMLElement,
  decoupe: { marge: number; rayon: number } = decoupeParDefaut
) => {
  const restaureTransition = desactiveTransition(ouverture);
  await attendStabiliteRect(ouverture);
  calculeDecoupe(ouverture, rideau, cadreBlanc, decoupe);
  const rectCible = ouverture.getBoundingClientRect();
  restaureTransition();
  return rectCible;
};
