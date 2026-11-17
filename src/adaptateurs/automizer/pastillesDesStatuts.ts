import { ISlide, modify } from 'pptx-automizer';
import { borde, colore, coloreLeTexte } from './formes.js';

export type StatutDUnePastille = 'fait' | 'enCours' | 'aLancer' | 'sansStatut';

type Pastille = {
  libelle: string;
  texte: string;
  fond: string;
  bordure?: string;
  largeur: number;
};

const PASTILLES_DES_STATUTS: Record<StatutDUnePastille, Pastille> = {
  fait: {
    libelle: 'FAITE',
    texte: '0C8626',
    fond: 'D4F4DB',
    largeur: 914474,
  },
  enCours: {
    libelle: 'PARTIELLE',
    texte: '0079D0',
    fond: 'DBEEFF',
    largeur: 1519758,
  },
  aLancer: {
    libelle: 'À LANCER',
    texte: '7025DA',
    fond: 'E9DDFF',
    largeur: 1447800,
  },
  sansStatut: {
    libelle: 'STATUT À DÉFINIR',
    texte: '667892',
    fond: 'F1F5F9',
    bordure: '94A3B8',
    largeur: 2340843,
  },
};

export const ecrisLaPastilleDuStatut = (
  slide: ISlide,
  formes: { fond: string; texte: string },
  statut: StatutDUnePastille
) => {
  const { libelle, texte, fond, bordure, largeur } =
    PASTILLES_DES_STATUTS[statut];
  slide.modifyElement(formes.texte, [
    modify.setText(libelle),
    coloreLeTexte(texte),
  ]);
  slide.modifyElement(formes.fond, [
    colore(fond),
    ...(bordure ? [borde(bordure)] : []),
    modify.setPosition({ w: largeur }),
  ]);
};
