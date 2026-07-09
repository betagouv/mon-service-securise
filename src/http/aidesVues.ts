import { Express } from 'express';

const LONGUEUR_MAX_META_DESCRIPTION = 160;

export const tronqueMetaDescription = (
  texte: string,
  longueurMax = LONGUEUR_MAX_META_DESCRIPTION
): string => {
  if (!texte || texte.length <= longueurMax) return texte;

  const coupe = texte.slice(0, longueurMax);
  const dernierEspace = coupe.lastIndexOf(' ');
  const base = dernierEspace > 0 ? coupe.slice(0, dernierEspace) : coupe;
  return `${base.trimEnd()}…`;
};

const EMOJIS_ET_ESPACES_EN_TETE =
  /^[\p{Extended_Pictographic}\p{Emoji_Component}\s]+/u;

export const retireEmojisEnTete = (texte: string): string =>
  texte ? texte.replace(EMOJIS_ET_ESPACES_EN_TETE, '') : texte;

export const ajouteAidesVues = (app: Express) => {
  // eslint-disable-next-line no-param-reassign
  app.locals.tronqueMetaDescription = tronqueMetaDescription;
  // eslint-disable-next-line no-param-reassign
  app.locals.retireEmojisEnTete = retireEmojisEnTete;
};
