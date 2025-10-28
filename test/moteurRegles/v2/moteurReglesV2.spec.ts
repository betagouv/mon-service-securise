import { MoteurReglesV2 } from '../../../src/moteurRegles/v2/moteurReglesV2.js';
import { NiveauSecurite } from '../../../donneesReferentielMesuresV2.js';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.js';
import { besoins } from './besoinsDeSecurite.js';
import { creeReferentielV2 } from '../../../src/referentielV2.js';

function uneDescriptionAuNiveau(niveauSecurite: NiveauSecurite) {
  return uneDescriptionV2Valide()
    .avecNiveauSecurite(niveauSecurite)
    .construis();
}

describe('Le moteur de règles V2', () => {
  it('se base sur les mesures qui correspondent au niveau de sécurité du service', () => {
    const referentiel = creeReferentielV2();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        besoinsDeSecurite: {
          niveau1: 'Absente',
          niveau2: 'Recommandée',
          niveau3: 'Indispensable',
        },
        dansSocleInitial: true,
        modificateurs: {},
      },
    ]);

    const serviceNiveau1 = uneDescriptionAuNiveau('niveau1');
    const mesuresNiveau1 = v2.mesures(serviceNiveau1);
    expect(mesuresNiveau1['RECENSEMENT.1']).not.toBeDefined();

    const serviceNiveau2 = uneDescriptionAuNiveau('niveau2');
    const mesuresNiveau2 = v2.mesures(serviceNiveau2);
    expect(mesuresNiveau2['RECENSEMENT.1']).toBeDefined();
    expect(mesuresNiveau2['RECENSEMENT.1'].indispensable).toBe(false);

    const serviceNiveau3 = uneDescriptionAuNiveau('niveau3');
    const mesuresNiveau3 = v2.mesures(serviceNiveau3);
    expect(mesuresNiveau3['RECENSEMENT.1']).toBeDefined();
    expect(mesuresNiveau3['RECENSEMENT.1'].indispensable).toBe(true);
  });

  it('sait rendre une mesure « Indispensable » par un modificateur', () => {
    const referentiel = creeReferentielV2();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: true,
        besoinsDeSecurite: besoins('R-R-R'),
        modificateurs: {
          donneesHorsUE: [[true, ['RendreIndispensable']]],
        },
      },
    ]);

    const avecDonneesHorsUE = uneDescriptionV2Valide()
      .avecLocalisationDonneesTraitees(['horsUE'])
      .construis();
    const mesures = v2.mesures(avecDonneesHorsUE);

    expect(mesures['RECENSEMENT.1'].indispensable).toBe(true);
  });

  it("sait redescendre une mesure en « Recommandée » par modificateur alors qu'elle était « Indispensable » par le niveau de sécurité", () => {
    const referentiel = creeReferentielV2();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: true,
        besoinsDeSecurite: besoins('I-I-I'),
        modificateurs: {
          typeService: [['api', ['RendreRecommandee']]],
        },
      },
    ]);

    const uneAPI = uneDescriptionV2Valide()
      .avecTypesService(['api'])
      .construis();
    const mesures = v2.mesures(uneAPI);

    expect(mesures['RECENSEMENT.1'].indispensable).toBe(false);
  });

  it("sait rajouter une mesure « Recommandée » par modificateur alors qu'elle était « Absente » en statut initial", () => {
    const referentiel = creeReferentielV2();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: false, // Pas dans le socle initial
        besoinsDeSecurite: besoins('R-R-R'),
        modificateurs: {
          typeHebergement: [['onPremise', ['Ajouter']]],
        },
      },
    ]);
    const duOnPremise = uneDescriptionV2Valide()
      .avecTypeHebergement('onPremise')
      .construis();
    const mesures = v2.mesures(duOnPremise);

    expect(mesures['RECENSEMENT.1']).toBeDefined();
    expect(mesures['RECENSEMENT.1'].indispensable).toBe(false);
  });

  it("sait rajouter une mesure « Indispensable » par modificateur alors qu'elle était « Absente » en statut initial", () => {
    const referentiel = creeReferentielV2();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: false, // Pas dans le socle initial
        besoinsDeSecurite: besoins('I-I-I'),
        modificateurs: {
          typeHebergement: [['onPremise', ['Ajouter']]],
        },
      },
    ]);
    const duOnPremise = uneDescriptionV2Valide()
      .avecTypeHebergement('onPremise')
      .construis();
    const mesures = v2.mesures(duOnPremise);

    expect(mesures['RECENSEMENT.1']).toBeDefined();
    expect(mesures['RECENSEMENT.1'].indispensable).toBe(true);
  });

  it("sait retirer une mesure par modificateur alors qu'elle était « Présente » en statut initial", () => {
    const referentiel = creeReferentielV2();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: true,
        besoinsDeSecurite: besoins('R-R-R'),
        modificateurs: {
          criticiteDisponibilite: [[1, ['Retirer']]],
        },
      },
    ]);

    const pasDuToutCritique = uneDescriptionV2Valide()
      .avecDureeDysfonctionnementAcceptable('plusDe24h')
      .construis();
    const mesures = v2.mesures(pasDuToutCritique);

    expect(mesures).toEqual({});
  });

  it('sait combiner « Rajouter » et « Rendre indispensable » sur une même mesure', () => {
    const referentiel = creeReferentielV2();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: false,
        besoinsDeSecurite: besoins('R-R-R'),
        modificateurs: {
          criticiteOuverture: [[1, ['RendreIndispensable']]],
          specificitesProjet: [['annuaire', ['Ajouter']]],
        },
      },
    ]);

    const serviceQuiCombineDeuxModificateurs = uneDescriptionV2Valide()
      .avecOuvertureSysteme('interneRestreint')
      .avecSpecificitesProjet(['annuaire'])
      .construis();
    const mesures = v2.mesures(serviceQuiCombineDeuxModificateurs);

    expect(mesures['RECENSEMENT.1'].indispensable).toBe(true);
  });

  it("sait combiner « Rajouter » et « Retirer » sur une même mesure : c'est « Rajouter » qui l'emporte", () => {
    const referentiel = creeReferentielV2();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: false,
        besoinsDeSecurite: besoins('R-R-R'),
        modificateurs: {
          specificitesProjet: [['annuaire', ['Ajouter']]],
          typeService: [['portailInformation', ['Retirer']]],
        },
      },
    ]);

    const serviceCombineAjouterEtRetirer = uneDescriptionV2Valide()
      .avecSpecificitesProjet(['annuaire'])
      .avecTypesService(['portailInformation'])
      .construis();
    const mesures = v2.mesures(serviceCombineAjouterEtRetirer);

    expect(mesures['RECENSEMENT.1']).toBeDefined();
  });

  it('sait combiner des modificateurs multiples pour « Rajouter » et « Rendre indispensable » sur un même champ', () => {
    const referentiel = creeReferentielV2();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: false,
        besoinsDeSecurite: besoins('R-R-R'),
        modificateurs: {
          criticiteOuverture: [[4, ['Ajouter', 'RendreIndispensable']]],
        },
      },
    ]);

    const tresOuvert = uneDescriptionV2Valide()
      .avecOuvertureSysteme('accessibleSurInternet')
      .construis();

    const mesures = v2.mesures(tresOuvert);

    expect(mesures['RECENSEMENT.1'].indispensable).toBe(true);
  });

  it('renvoie les mesures complétées avec leurs données référentielles', () => {
    const referentiel = creeReferentielV2();
    const v2 = new MoteurReglesV2(referentiel, [
      {
        reference: 'RECENSEMENT.1',
        dansSocleInitial: true,
        besoinsDeSecurite: besoins('R-R-R'),
        modificateurs: {},
      },
    ]);

    const mesures = v2.mesures(uneDescriptionAuNiveau('niveau1'));

    expect(mesures['RECENSEMENT.1'].categorie).toBe('gouvernance');
    expect(mesures['RECENSEMENT.1'].referentiel).toBe('ANSSI');
    expect(mesures['RECENSEMENT.1'].description).toBe(
      "Etablir la liste de l'ensemble des services et données à protéger"
    );
  });
});
