import { PathLike } from 'fs';
import { LecteurDeCSVDeReglesV2 } from '../../../../src/moteurRegles/v2/parsing/lecteurDeCSVDeReglesV2.js';
import { mesuresV2 } from '../../../../donneesReferentielMesuresV2.js';
import { ErreurMoteurDeReglesV2 } from '../../../../src/erreurs.js';
import { RegleDuReferentielV2 } from '../../../../src/moteurRegles/v2/moteurReglesV2.js';

async function lisLeFichier(cheminRelatif: PathLike) {
  const lecteur = new LecteurDeCSVDeReglesV2(mesuresV2);

  return lecteur.lis(`${__dirname}/${cheminRelatif}`);
}

describe('Le lecteur de CSV de règles V2', () => {
  it('renvoie autant de règles brut que de lignes dans le CSV', async () => {
    const regles = await lisLeFichier(`MESURES_V2_OK_2_LIGNES.csv`);

    expect(regles).toHaveLength(2);
  });

  it('renvoie la référence et la présence dans le socle initial pour chaque mesure', async () => {
    const regles = await lisLeFichier(`MESURES_V2_OK_2_LIGNES.csv`);

    const [r1, r2] = regles;
    expect(r1.reference).toBe('RECENSEMENT.1');
    expect(r1.dansSocleInitial).toBe(true);
    expect(r2.reference).toBe('RECENSEMENT.2');
    expect(r2.dansSocleInitial).toBe(false);
  });

  it('renvoie un modificateur pour le niveau de sécurité', async () => {
    const regles = await lisLeFichier(
      `MESURES_V2_OK_UN_SEUL_NIVEAU_SECURITE.csv`
    );

    expect<RegleDuReferentielV2>(regles[0]).toEqual({
      reference: 'RECENSEMENT.1',
      dansSocleInitial: true,
      modificateurs: {
        niveauDeSecurite: [['niveau1', 'RendreIndispensable']],
      },
    });

    expect<RegleDuReferentielV2>(regles[1]).toEqual({
      reference: 'RECENSEMENT.2',
      dansSocleInitial: false,
      modificateurs: {
        niveauDeSecurite: [['niveau1', 'RendreRecommandee']],
      },
    });
  });

  it('renvoie plusieurs modificateur pour le niveau de sécurité', async () => {
    const regles = await lisLeFichier(
      `MESURES_V2_OK_TROIS_NIVEAUX_SECURITE.csv`
    );

    expect<RegleDuReferentielV2>(regles[0]).toEqual({
      reference: 'RECENSEMENT.1',
      dansSocleInitial: true,
      modificateurs: {
        niveauDeSecurite: [
          ['niveau1', 'RendreIndispensable'],
          ['niveau2', 'RendreIndispensable'],
          ['niveau3', 'RendreIndispensable'],
        ],
      },
    });

    expect<RegleDuReferentielV2>(regles[1]).toEqual({
      reference: 'RECENSEMENT.2',
      dansSocleInitial: false,
      modificateurs: {
        niveauDeSecurite: [
          ['niveau1', 'RendreRecommandee'],
          ['niveau2', 'RendreRecommandee'],
          ['niveau3', 'RendreIndispensable'],
        ],
      },
    });
  });

  it('jette une erreur si un statut initial de mesure est inconnue', async () => {
    await expect(
      lisLeFichier(`MESURES_V2_MAUVAIS_STATUT_INITIAL.csv`)
    ).rejects.toThrowError(
      new ErreurMoteurDeReglesV2(
        "Le statut initial 'MAUVAIS_STATUT' est inconnu"
      )
    );
  });
  it('jette une erreur si une référence de mesure est inconnue', async () => {
    await expect(
      lisLeFichier(`MESURES_V2_MAUVAIS_ID.csv`)
    ).rejects.toThrowError(
      new ErreurMoteurDeReglesV2(
        "La mesure 'MAUVAIS_ID' n'existe pas dans le référentiel MSS"
      )
    );
  });

  it('jette une erreur si un modificateur est inconnu', async () => {
    await expect(
      lisLeFichier(`MESURES_V2_MAUVAIS_MODIFICATEUR.csv`)
    ).rejects.toThrowError(
      new ErreurMoteurDeReglesV2("Le modificateur 'PasQuoiFaire' est inconnu")
    );
  });

  it('peut lire le CSV de production', async () => {
    const reglesDeProd = await lisLeFichier(
      '../../../../src/moteurRegles/v2/mesures_V2_prod_30-09-2025.csv'
    );

    expect(reglesDeProd).toHaveLength(1);
  });
});
