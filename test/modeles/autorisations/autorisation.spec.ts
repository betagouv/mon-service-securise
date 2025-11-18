import {
  Autorisation,
  DonneesAutorisation,
} from '../../../src/modeles/autorisations/autorisation.js';
import {
  Droits,
  Permissions,
  Rubriques,
  tousDroitsEnEcriture,
} from '../../../src/modeles/autorisations/gestionDroits.js';
import Service from '../../../src/modeles/service.js';
import { unUUID } from '../../constructeurs/UUID.js';
import { ActionRecommandee } from '../../../src/modeles/actionsRecommandees.js';

const { ECRITURE, LECTURE, INVISIBLE } = Permissions;
const { DECRIRE, SECURISER, HOMOLOGUER, RISQUES, CONTACTS } = Rubriques;

describe('Une autorisation', () => {
  const donneesAutorisation: DonneesAutorisation = {
    id: unUUID('a'),
    idService: unUUID('s'),
    idUtilisateur: unUUID('u'),
    estProprietaire: false,
    droits: {},
    type: 'unType',
  };
  describe('sur demande de permission de suppression de service', () => {
    it('interdit la suppression pour un contributeur', () => {
      const autorisation =
        Autorisation.NouvelleAutorisationContributeur(donneesAutorisation);
      expect(autorisation.peutSupprimerService()).toBe(false);
    });

    it('autorise la suppression pour un propriétaire', () => {
      const autorisation =
        Autorisation.NouvelleAutorisationProprietaire(donneesAutorisation);
      expect(autorisation.peutSupprimerService()).toBe(true);
    });
  });

  describe('sur demande de permission de duplication de service', () => {
    it('interdit la duplication pour un contributeur', () => {
      const autorisation =
        Autorisation.NouvelleAutorisationContributeur(donneesAutorisation);
      expect(autorisation.peutDupliquer()).toBe(false);
    });

    it('autorise la duplication pour un propriétaire', () => {
      const autorisation =
        Autorisation.NouvelleAutorisationProprietaire(donneesAutorisation);
      expect(autorisation.peutDupliquer()).toBe(true);
    });
  });

  it("permet de savoir s'il y a une permission en lecture sur une rubrique", () => {
    const autorisation = new Autorisation({
      ...donneesAutorisation,
      droits: { [DECRIRE]: LECTURE },
    });

    expect(autorisation.aLaPermission(LECTURE, DECRIRE)).toBe(true);
  });

  it("permet de savoir s'il y a une permission en écriture sur une rubrique", () => {
    const autorisation = new Autorisation({
      ...donneesAutorisation,
      droits: { [DECRIRE]: ECRITURE },
    });

    expect(autorisation.aLaPermission(ECRITURE, DECRIRE)).toBe(true);
  });

  it("autorise la lecture sur une rubrique avec droits d'écriture", () => {
    const autorisationEcriture = new Autorisation({
      ...donneesAutorisation,
      droits: { [DECRIRE]: ECRITURE },
    });

    const peutLire = autorisationEcriture.aLaPermission(LECTURE, DECRIRE);

    expect(peutLire).toBe(true);
  });

  it("n'autorise pas l'accès à une rubrique non référencée", () => {
    const autorisationSecuriser = new Autorisation({
      ...donneesAutorisation,
      droits: { [SECURISER]: ECRITURE },
    });

    const peutLireDecrire = autorisationSecuriser.aLaPermission(
      LECTURE,
      DECRIRE
    );

    expect(peutLireDecrire).toBe(false);
  });

  it("n'autorise aucun accès pour un niveau invisible", () => {
    const niveauInvisible = new Autorisation({
      ...donneesAutorisation,
      droits: { [DECRIRE]: INVISIBLE },
    });

    const peutLire = niveauInvisible.aLaPermission(LECTURE, DECRIRE);
    const peutEcrire = niveauInvisible.aLaPermission(ECRITURE, DECRIRE);

    expect(peutLire).toBe(false);
    expect(peutEcrire).toBe(false);
  });

  it('sait appliquer de nouveaux droits', () => {
    const autorisation = new Autorisation({
      ...donneesAutorisation,
      droits: tousDroitsEnEcriture(),
    });
    expect(autorisation.aLaPermission(ECRITURE, HOMOLOGUER)).toBe(true);

    const homologuerLecture = { HOMOLOGUER: LECTURE };
    autorisation.appliqueDroits(homologuerLecture);

    expect(autorisation.aLaPermission(ECRITURE, HOMOLOGUER)).toBe(false);
    expect(autorisation.aLaPermission(LECTURE, HOMOLOGUER)).toBe(true);
  });

  it('passe tous les droits en écriture si on devient propriétaire', () => {
    const autorisation = new Autorisation({
      ...donneesAutorisation,
      droits: { [DECRIRE]: LECTURE },
    });

    autorisation.appliqueDroits({ estProprietaire: true });

    expect(autorisation.estProprietaire).toBe(true);
    expect(autorisation.droits).to.eql({
      [DECRIRE]: ECRITURE,
      [SECURISER]: ECRITURE,
      [HOMOLOGUER]: ECRITURE,
      [RISQUES]: ECRITURE,
      [CONTACTS]: ECRITURE,
    });
  });

  it("supprime le droit de propriétaire lors de l'application d'un droit d'écriture", () => {
    const autorisation =
      Autorisation.NouvelleAutorisationProprietaire(donneesAutorisation);

    autorisation.appliqueDroits({ HOMOLOGUER: ECRITURE });

    expect(autorisation.estProprietaire).toBe(false);
  });

  it("supprime le droit de propriétaire lors de l'application d'un droit de lecture", () => {
    const autorisation =
      Autorisation.NouvelleAutorisationProprietaire(donneesAutorisation);

    autorisation.appliqueDroits({ HOMOLOGUER: LECTURE });

    expect(autorisation.estProprietaire).toBe(false);
  });

  describe('sur demande de résumé de niveau de droit', () => {
    it("retourne 'PROPRIETAIRE' si l'utilisateur est propriétaire du service", async () => {
      const autorisationProprietaire =
        Autorisation.NouvelleAutorisationProprietaire(donneesAutorisation);

      expect(autorisationProprietaire.resumeNiveauDroit()).toBe(
        Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE
      );
    });

    it("retourne 'ECRITURE' si tous les droits sont en ECRITURE", () => {
      const autorisationLecture = new Autorisation({
        ...donneesAutorisation,
        droits: {
          [DECRIRE]: ECRITURE,
          [SECURISER]: ECRITURE,
          [HOMOLOGUER]: ECRITURE,
          [RISQUES]: ECRITURE,
          [CONTACTS]: ECRITURE,
        },
      });

      expect(autorisationLecture.resumeNiveauDroit()).to.equal(
        Autorisation.RESUME_NIVEAU_DROIT.ECRITURE
      );
    });

    it("retourne 'LECTURE' si tous les droits sont en LECTURE", () => {
      const autorisationLecture = new Autorisation({
        ...donneesAutorisation,
        droits: {
          [DECRIRE]: LECTURE,
          [SECURISER]: LECTURE,
          [HOMOLOGUER]: LECTURE,
          [RISQUES]: LECTURE,
          [CONTACTS]: LECTURE,
        },
      });

      expect(autorisationLecture.resumeNiveauDroit()).to.equal(
        Autorisation.RESUME_NIVEAU_DROIT.LECTURE
      );
    });

    it("retourne 'PERSONNALISE' si les droits sont mixtes", () => {
      const autorisationLecture = new Autorisation({
        ...donneesAutorisation,
        droits: {
          [DECRIRE]: LECTURE,
          [SECURISER]: ECRITURE,
          [HOMOLOGUER]: LECTURE,
          [RISQUES]: ECRITURE,
          [CONTACTS]: ECRITURE,
        },
      });

      expect(autorisationLecture.resumeNiveauDroit()).to.equal(
        Autorisation.RESUME_NIVEAU_DROIT.PERSONNALISE
      );
    });
  });

  describe('sur demande de permission de gestion des contributeurs', () => {
    it('interdit la gestion pour un contributeur', () => {
      const autorisationContributeur =
        Autorisation.NouvelleAutorisationContributeur(donneesAutorisation);

      expect(autorisationContributeur.peutGererContributeurs()).toBe(false);
    });

    it('autorise la gestion pour un propriétaire', () => {
      const autorisationCreateur =
        Autorisation.NouvelleAutorisationProprietaire(donneesAutorisation);

      expect(autorisationCreateur.peutGererContributeurs()).toBe(true);
    });
  });

  describe("sur demande de permission d'homologuer un service", () => {
    it("autorise l'homologation pour un propriétaire", () => {
      const proprietaire =
        Autorisation.NouvelleAutorisationProprietaire(donneesAutorisation);

      expect(proprietaire.peutHomologuer()).toBe(true);
    });

    it("interdit l'homologation pour un contributeur", () => {
      const contributeur = Autorisation.NouvelleAutorisationContributeur({
        ...donneesAutorisation,
        droits: tousDroitsEnEcriture(),
      });

      expect(contributeur.peutHomologuer()).toBe(false);
    });
  });

  describe('sur demande des données à persister', () => {
    it('connaît ses données pour une autorisation de contributeur', () => {
      const autorisationContributeur =
        Autorisation.NouvelleAutorisationContributeur({
          id: unUUID('a'),
          idService: unUUID('s'),
          idUtilisateur: unUUID('u'),
          droits: tousDroitsEnEcriture(),
          type: 'unType',
        });

      expect(autorisationContributeur.donneesAPersister()).to.eql({
        estProprietaire: false,
        id: unUUID('a'),
        idService: unUUID('s'),
        idUtilisateur: unUUID('u'),
        droits: {
          CONTACTS: 2,
          DECRIRE: 2,
          HOMOLOGUER: 2,
          RISQUES: 2,
          SECURISER: 2,
        },
      });
    });

    it('connaît ses données pour une autorisation de propriétaire', () => {
      const autorisationProprietaire =
        Autorisation.NouvelleAutorisationProprietaire({
          ...donneesAutorisation,
          id: unUUID('a'),
          idService: unUUID('s'),
          idUtilisateur: unUUID('u'),
        });

      expect(autorisationProprietaire.donneesAPersister()).to.eql({
        estProprietaire: true,
        id: unUUID('a'),
        idService: unUUID('s'),
        idUtilisateur: unUUID('u'),
        droits: {
          CONTACTS: 2,
          DECRIRE: 2,
          HOMOLOGUER: 2,
          RISQUES: 2,
          SECURISER: 2,
        },
      });
    });
  });

  describe("sur demande de permission d'action recommandée", () => {
    [
      Service.ACTIONS_RECOMMANDEES.METTRE_A_JOUR,
      Service.ACTIONS_RECOMMANDEES.CONTINUER_HOMOLOGATION,
      Service.ACTIONS_RECOMMANDEES.AUGMENTER_INDICE_CYBER,
      Service.ACTIONS_RECOMMANDEES.TELECHARGER_ENCART_HOMOLOGATION,
      Service.ACTIONS_RECOMMANDEES.HOMOLOGUER_A_NOUVEAU,
      Service.ACTIONS_RECOMMANDEES.HOMOLOGUER_SERVICE,
    ].forEach((action) => {
      it(`vérifie que les droits sont présents pour l'action '${action.id}'`, () => {
        const autorisationAvecDroits =
          Autorisation.NouvelleAutorisationContributeur({
            ...donneesAutorisation,
            droits: action.droitsNecessaires as Droits,
          });

        expect(autorisationAvecDroits.peutFaireActionRecommandee(action)).toBe(
          true
        );
      });

      it(`interdis l'action '${action.id}' si les droits ne sont pas présents`, () => {
        const autorisationSansDroits =
          Autorisation.NouvelleAutorisationContributeur({
            ...donneesAutorisation,
            droits: {},
          });

        expect(autorisationSansDroits.peutFaireActionRecommandee(action)).toBe(
          false
        );
      });
    });

    describe("Dans le cas particulier de l'invitation de contributeurs", () => {
      it("peut faire l'action si l'utilisateur est propriétaire", () => {
        const autorisationAvecDroitInvitation =
          Autorisation.NouvelleAutorisationProprietaire({
            ...donneesAutorisation,
          });
        const action: ActionRecommandee = {
          id: 'INVITER_CONTRIBUTEUR',
          droitsNecessaires: Autorisation.DROIT_INVITER_CONTRIBUTEUR,
        };

        expect(
          autorisationAvecDroitInvitation.peutFaireActionRecommandee(action)
        ).toBe(true);
      });

      it("ne peut pas faire l'action si l'utilisateur n'est pas propriétaire", () => {
        const autorisationSansDroitInvitation =
          Autorisation.NouvelleAutorisationContributeur({
            ...donneesAutorisation,
            droits: {},
          });
        const action: ActionRecommandee = {
          id: 'INVITER_CONTRIBUTEUR',
          droitsNecessaires: Autorisation.DROIT_INVITER_CONTRIBUTEUR,
        };

        expect(
          autorisationSansDroitInvitation.peutFaireActionRecommandee(action)
        ).toBe(false);
      });
    });
  });
});
