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

  it('renvoie les besoins de sécurité de chaque mesure', async () => {
    const regles = await lisLeFichier(
      `MESURES_V2_OK_TROIS_NIVEAUX_SECURITE.csv`
    );

    expect(regles[0].besoinsDeSecurite).toEqual({
      niveau1: 'Absente',
      niveau2: 'Recommandée',
      niveau3: 'Indispensable',
    });

    expect(regles[1].besoinsDeSecurite).toEqual({
      niveau1: 'Indispensable',
      niveau2: 'Recommandée',
      niveau3: 'Absente',
    });
  });

  it('renvoie les modificateurs associés aux règles', async () => {
    const regles = await lisLeFichier(`MESURES_V2_OK_TOUS_MODIFICATEURS.csv`);

    const [recensement1, recensement2, recensement3, rgpd1, rgpd2, filtre1] =
      regles;
    expect(recensement1.modificateurs.criticiteDonneesTraitees).toEqual([
      [1, 'Ajouter'],
      [2, 'Retirer'],
      [3, 'RendreRecommandee'],
      [4, 'RendreIndispensable'],
    ]);
    expect(recensement2.modificateurs.donneesHorsUE).toEqual([
      [true, 'Ajouter'],
    ]);
    expect(recensement3.modificateurs.criticiteDisponibilite).toEqual([
      [1, 'Ajouter'],
      [2, 'Retirer'],
      [3, 'RendreRecommandee'],
      [4, 'RendreIndispensable'],
    ]);
    expect(rgpd1.modificateurs.criticiteOuverture).toEqual([
      [1, 'Ajouter'],
      [2, 'RendreIndispensable'],
      [3, 'Retirer'],
      [4, 'RendreRecommandee'],
    ]);
    expect(rgpd2.modificateurs.specificitesProjet).toEqual([
      ['accesPhysiqueAuxSallesTechniques', 'Ajouter'],
      ['accesPhysiqueAuxBureaux', 'Retirer'],
      ['annuaire', 'RendreRecommandee'],
      ['dispositifDeSignatureElectronique', 'RendreIndispensable'],
      ['echangeOuReceptionEmails', 'Retirer'],
      ['postesDeTravail', 'RendreIndispensable'],
    ]);
    expect(filtre1.modificateurs.typeService).toEqual([
      ['applicationMobile', 'Ajouter'],
      ['api', 'Retirer'],
      ['portailInformation', 'RendreIndispensable'],
      ['serviceEnLigne', 'RendreRecommandee'],
      ['autreSystemeInformation', 'Retirer'],
    ]);
  });

  it('ne renvoie pas de modificateurs "vide"', async () => {
    const regles = await lisLeFichier(`MESURES_V2_OK_TOUS_MODIFICATEURS.csv`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sansModificateur: RegleDuReferentielV2 = regles.at(-1)!;
    expect(sansModificateur.modificateurs).toEqual({});
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
