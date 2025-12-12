import type { PositionModale, PositionRond } from './ModaleSousEtape.d';

type DetailsPositionModale = {
  top: string;
  left: string;
  transformY: string;
  transformX: string;
  positionRond: PositionRond;
  leftPointe: string;
};

type DetailsPositionRond = {
  top: number;
  left: number;
};

export const recuperePositionModale = (
  positionCible: DOMRect,
  positionModale: PositionModale
): DetailsPositionModale => {
  switch (positionModale) {
    case 'DeuxTiersCentre':
      return {
        top: `${positionCible.top + positionCible.height / 2}px`,
        left: `${
          positionCible.right - (positionCible.right - positionCible.left) / 3
        }px`,
        transformY: '50%',
        transformX: '0',
        positionRond: 'DeuxTiersCentre',
        leftPointe: '0%',
      };

    case 'MilieuDroite':
      return {
        top: `${positionCible.top + positionCible.height / 2}px`,
        left: `${positionCible.right + 7}px`,
        transformY: '50%',
        transformX: '0',
        positionRond: 'Droite',
        leftPointe: '0%',
      };

    case 'HautDroite':
      return {
        top: `${positionCible.top + positionCible.height / 2}px`,
        left: `${positionCible.right + 7}px`,
        transformY: '20%',
        transformX: '0',
        positionRond: 'Droite',
        leftPointe: '0%',
      };

    case 'BasDroite':
      return {
        top: `${positionCible.top + positionCible.height / 2}px`,
        left: `${positionCible.right + 7}px`,
        transformY: '80%',
        transformX: '0',
        positionRond: 'Droite',
        leftPointe: '0%',
      };

    case 'MilieuGauche':
      return {
        top: `${positionCible.top + positionCible.height / 2}px`,
        left: `${positionCible.right - positionCible.width - 7}px`,
        transformY: '50%',
        transformX: '-100%',
        positionRond: 'Gauche',
        leftPointe: '100%',
      };

    case 'HautGauche':
      return {
        top: `${positionCible.top + positionCible.height / 2}px`,
        left: `${positionCible.right - positionCible.width - 7}px`,
        transformY: '20%',
        transformX: '-100%',
        positionRond: 'Gauche',
        leftPointe: '100%',
      };

    case 'BasGauche':
      return {
        top: `${positionCible.top + positionCible.height / 2}px`,
        left: `${positionCible.right - positionCible.width - 7}px`,
        transformY: '80%',
        transformX: '-100%',
        positionRond: 'Gauche',
        leftPointe: '100%',
      };

    case 'BasMilieu':
      return {
        top: `${positionCible.bottom + 7}px`,
        left: `${positionCible.right - positionCible.width / 2}px`,
        transformY: '0%',
        transformX: '-50%',
        positionRond: 'Bas',
        leftPointe: '50%',
      };

    case 'HautMilieu':
      return {
        top: `${positionCible.top - 7}px`,
        left: `${positionCible.right - positionCible.width / 2}px`,
        transformY: '100%',
        transformX: '-50%',
        positionRond: 'Haut',
        leftPointe: '50%',
      };
  }
};

export const recuperePositionRond = (
  positionCible: DOMRect,
  positionRond: PositionRond
): DetailsPositionRond => {
  switch (positionRond) {
    case 'Gauche':
      return {
        top: positionCible.top + positionCible.height / 2 - 9,
        left: positionCible.left - 9,
      };

    case 'Droite':
      return {
        top: positionCible.top + positionCible.height / 2 - 9,
        left: positionCible.right - 9,
      };

    case 'Bas':
      return {
        top: positionCible.bottom - 9,
        left: positionCible.left + positionCible.width / 2 - 9,
      };

    case 'Haut':
      return {
        top: positionCible.top - 9,
        left: positionCible.left + positionCible.width / 2 - 9,
      };

    case 'DeuxTiersCentre':
      return {
        top: positionCible.top + positionCible.height / 2 - 9,
        left:
          positionCible.right -
          (positionCible.right - positionCible.left) / 3 -
          16,
      };
  }
};
