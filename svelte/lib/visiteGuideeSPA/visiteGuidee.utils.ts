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

const estEntierementVisible = (element: HTMLElement) => {
  const { top, bottom } = element.getBoundingClientRect();
  return top >= 0 && bottom <= window.innerHeight;
};

const seraitEntierementVisibleEnHautDePage = (
  element: HTMLElement,
  defilementActuel: number
) => {
  const { top, height } = element.getBoundingClientRect();
  const topDepuisHautDocument = top + defilementActuel;
  return (
    topDepuisHautDocument >= 0 &&
    topDepuisHautDocument + height <= window.innerHeight
  );
};

const scrolleSansBloquerLeCorps = (
  declencheScroll: () => void,
  scrollGele: number
) => {
  degeleDefilementDuCorps(scrollGele);
  declencheScroll();
  geleDefilementDuCorps();
};

export const ajusteHauteurScroll = (
  ouverture: HTMLElement,
  defilementActuel: number,
  scrollGele: number
) => {
  if (seraitEntierementVisibleEnHautDePage(ouverture, defilementActuel)) {
    if (defilementActuel !== 0) {
      scrolleSansBloquerLeCorps(
        () => window.scrollTo({ top: 0, behavior: 'instant' }),
        scrollGele
      );
    }
  } else if (!estEntierementVisible(ouverture)) {
    scrolleSansBloquerLeCorps(
      () => ouverture.scrollIntoView({ behavior: 'instant', block: 'center' }),
      scrollGele
    );
  }
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
