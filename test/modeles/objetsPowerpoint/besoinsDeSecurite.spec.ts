import { besoinsDeSecurite } from '../../../src/modeles/objetsPowerpoint/besoinsDeSecurite.js';
import {
  uneDescriptionDeNiveauDeSecuriteEstime1,
  uneDescriptionV2Valide,
} from '../../constructeurs/constructeurDescriptionServiceV2.js';

describe('Les besoins de sécurité présentés à la commission', () => {
  it('nomment le niveau de besoin de sécurité du service', () => {
    const description = uneDescriptionV2Valide()
      .avecNiveauSecurite('niveau2')
      .construis();

    expect(besoinsDeSecurite(description).niveau).toBe('Modérés');
  });

  it('résument le niveau de besoin de sécurité', () => {
    const description = uneDescriptionV2Valide()
      .avecNiveauSecurite('niveau1')
      .construis();

    expect(besoinsDeSecurite(description).resume).toBe(
      "Les besoins de sécurité sont basiques en l'absence de données ou de fonctionnalités sensibles."
    );
  });

  it('indiquent la démarche indicative adaptée au niveau', () => {
    const description = uneDescriptionV2Valide()
      .avecNiveauSecurite('niveau2')
      .construis();

    expect(besoinsDeSecurite(description).demarche).toBe('intermédiaire');
  });

  it('nomment le niveau identifié à titre indicatif par l’ANSSI', () => {
    const description = uneDescriptionDeNiveauDeSecuriteEstime1()
      .avecNiveauSecurite('niveau3')
      .construis();

    expect(besoinsDeSecurite(description).niveauIndicatifAnssi).toBe(
      'Basiques'
    );
  });

  it('indiquent que le niveau choisi dépasse celui identifié par l’ANSSI', () => {
    const description = uneDescriptionDeNiveauDeSecuriteEstime1()
      .avecNiveauSecurite('niveau3')
      .construis();

    expect(besoinsDeSecurite(description).depasseRecommandation).toBe(true);
  });

  it('indiquent que le niveau choisi ne dépasse pas celui identifié par l’ANSSI', () => {
    const description = uneDescriptionDeNiveauDeSecuriteEstime1().construis();

    const besoins = besoinsDeSecurite(description);
    expect(besoins.depasseRecommandation).toBe(false);
    expect(besoins.niveauIndicatifAnssi).toBe('Basiques');
  });

  it('nomment le service, pour l’explication par le projet', () => {
    const description = uneDescriptionV2Valide()
      .avecNomService('Portail des démarches')
      .construis();

    expect(besoinsDeSecurite(description).nomService).toBe(
      'Portail des démarches'
    );
  });

  it('décrivent l’exposition du service', () => {
    const description = uneDescriptionV2Valide()
      .avecOuvertureSysteme('interne')
      .avecAudienceCible('limitee')
      .avecDureeDysfonctionnementAcceptable('moinsDe12h')
      .construis();

    expect(besoinsDeSecurite(description).exposition).toEqual({
      ouverture: "Interne à l'organisation",
      audience:
        'Limitée : Utilisé par un petit nombre de personnes, souvent en interne.',
      dureeDysfonctionnement: 'Moins de 12h',
    });
  });
});
