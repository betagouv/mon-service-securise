import type { PositionModale, RectCible } from './visiteGuideeSPA.d';
import type { DonneesEtapeVisiteGuidee } from './visiteGuideeSPA.d';

const decoupeParDefaut = { marge: 24, rayon: 8 };

export const calculePositionModale = (
  rectCible: RectCible,
  tailleModale: { width: number; height: number },
  positionModale: PositionModale,
  decalageModale: number
) =>
  positionModale === 'bas'
    ? {
        top: rectCible.top - tailleModale.height + decalageModale,
        left: rectCible.left + rectCible.width / 2 - tailleModale.width / 2,
      }
    : {
        top: rectCible.top + rectCible.height / 2 - tailleModale.height / 2,
        left: rectCible.left - tailleModale.width + decalageModale,
      };

export const geleDefilementDuCorps = () => {
  document.documentElement.style.overflow = 'hidden';
};

export const degeleDefilementDuCorps = () => {
  document.documentElement.style.overflow = '';
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

const defileVers = (top: number) =>
  window.scrollTo({ top, behavior: 'instant' });

export const ajusteHauteurScroll = (
  ouverture: HTMLElement,
  modale?: {
    element: HTMLElement;
    position: PositionModale;
    decalage: number;
  }
) => {
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

  const defilementActuel = window.scrollY;

  if (
    seraitEntierementVisibleEnHautDePage(etendueAVerifier, defilementActuel)
  ) {
    if (defilementActuel !== 0) defileVers(0);
  } else if (!estEntierementVisible(etendueAVerifier)) {
    const centreEtendue = (etendueAVerifier.top + etendueAVerifier.bottom) / 2;
    defileVers(defilementActuel + centreEtendue - window.innerHeight / 2);
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

const cheminsDecoupe = (
  element: HTMLElement,
  { marge, rayon }: { marge: number; rayon: number }
) => {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  return {
    cheminElement: cheminRectangleArrondi(
      left,
      top,
      right - left,
      bottom - top,
      0
    ),
    cheminMarge: cheminRectangleArrondi(
      left - marge,
      top - marge,
      right - left + marge * 2,
      bottom - top + marge * 2,
      rayon
    ),
  };
};

const calculeDecoupe = (
  ouverture: HTMLElement,
  rideau: HTMLElement,
  cadreBlanc: HTMLElement,
  decoupe = decoupeParDefaut,
  ouvertureSecondaire?: HTMLElement
) => {
  const principale = cheminsDecoupe(ouverture, decoupe);
  const secondaire = ouvertureSecondaire
    ? cheminsDecoupe(ouvertureSecondaire, decoupeParDefaut)
    : undefined;

  const cheminsMarge = [principale.cheminMarge, secondaire?.cheminMarge]
    .filter(Boolean)
    .join(' ');

  rideau.style.clipPath = `path(evenodd, "M0 0 H${window.innerWidth} V${window.innerHeight} H0 Z ${cheminsMarge}")`;
  cadreBlanc.style.clipPath = `path(evenodd, "${principale.cheminMarge} ${principale.cheminElement}${secondaire ? ` ${secondaire.cheminMarge} ${secondaire.cheminElement}` : ''}")`;
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
  donneesEtape: DonneesEtapeVisiteGuidee,
  rideau: HTMLElement,
  cadreBlanc: HTMLElement
) => {
  const decoupe = donneesEtape.decoupe || decoupeParDefaut;
  const ouverture = donneesEtape.ouverture();
  const restaureTransition = desactiveTransition(ouverture);
  await attendStabiliteRect(ouverture);
  calculeDecoupe(
    ouverture,
    rideau,
    cadreBlanc,
    decoupe,
    donneesEtape.ouvertureSecondaire?.()
  );
  const rectCible = ouverture.getBoundingClientRect();
  restaureTransition();
  return rectCible;
};
