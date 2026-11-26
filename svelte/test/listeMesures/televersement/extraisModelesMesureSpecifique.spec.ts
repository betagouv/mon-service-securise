import { extraisModelesMesureSpecifique } from '../../../lib/listeMesures/televersement/extraisModelesMesureSpecifique';
import { ErreurFichierInvalide } from '../../../lib/ui/televersement/lecteurExcel';
import {
  leTemplateComplete,
  unClasseur,
} from '../../ui/televersement/classeurDeTest';

const ENTETES = [
  'Intitulé de la mesure *',
  'Description de la mesure',
  'Catégorie *',
];

const unClasseurDeMesures = (lignes: string[][], entetes = ENTETES) =>
  unClasseur({
    'Template mesures': [[], [], [], [], [], entetes, ...lignes],
  });

describe("L'extraction des modèles de mesure spécifique téléversés", () => {
  it('transforme chaque ligne du classeur en modèle de mesure', async () => {
    const contenu = unClasseurDeMesures([
      ['Mon intitulé', 'Ma description', 'Gouvernance'],
    ]);

    const modeles = await extraisModelesMesureSpecifique(contenu);

    expect(modeles).toEqual([
      {
        description: 'Mon intitulé',
        descriptionLongue: 'Ma description',
        categorie: 'Gouvernance',
      },
    ]);
  });

  it('supprime les espaces en début et fin de cellule', async () => {
    const contenu = unClasseurDeMesures([
      ['  Mon intitulé ', ' Ma description  ', ' Gouvernance '],
    ]);

    const modeles = await extraisModelesMesureSpecifique(contenu);

    expect(modeles[0]).toEqual({
      description: 'Mon intitulé',
      descriptionLongue: 'Ma description',
      categorie: 'Gouvernance',
    });
  });

  it('sait lire le template proposé au téléchargement', async () => {
    const contenu = leTemplateComplete(
      'Template mesures - MSS.xlsx',
      'Template mesures',
      ['Mon intitulé', 'Ma description', 'Gouvernance']
    );

    const modeles = await extraisModelesMesureSpecifique(contenu);

    expect(modeles).toEqual([
      {
        description: 'Mon intitulé',
        descriptionLongue: 'Ma description',
        categorie: 'Gouvernance',
      },
    ]);
  });

  it('rejette un classeur auquel il manque une colonne', async () => {
    const contenu = unClasseurDeMesures(
      [['Mon intitulé', 'Ma description']],
      ['Intitulé de la mesure *', 'Description de la mesure']
    );

    await expect(extraisModelesMesureSpecifique(contenu)).rejects.toThrow(
      ErreurFichierInvalide
    );
  });

  it('accepte 40 lignes', async () => {
    const contenu = unClasseurDeMesures(
      Array(40).fill(['Mon intitulé', 'Ma description', 'Gouvernance'])
    );

    const modeles = await extraisModelesMesureSpecifique(contenu);

    expect(modeles).toHaveLength(40);
  });

  it('rejette un classeur de plus de 40 lignes', async () => {
    const contenu = unClasseurDeMesures(
      Array(41).fill(['Mon intitulé', 'Ma description', 'Gouvernance'])
    );

    await expect(extraisModelesMesureSpecifique(contenu)).rejects.toThrow(
      ErreurFichierInvalide
    );
  });
});
