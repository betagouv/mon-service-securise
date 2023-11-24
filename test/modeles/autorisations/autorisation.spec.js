const expect = require('expect.js');

const Autorisation = require('../../../src/modeles/autorisations/autorisation');
const {
  Permissions,
  Rubriques,
  tousDroitsEnEcriture,
} = require('../../../src/modeles/autorisations/gestionDroits');

const { ECRITURE, LECTURE, INVISIBLE } = Permissions;
const { DECRIRE, SECURISER, HOMOLOGUER, RISQUES, CONTACTS } = Rubriques;

describe('Une autorisation', () => {
  describe('sur demande de permission de suppression de service', () => {
    it('interdit la suppression pour un contributeur', () => {
      const autorisation = Autorisation.NouvelleAutorisationContributeur();
      expect(autorisation.peutSupprimerService()).to.be(false);
    });

    it('autorise la suppression pour un propriétaire', () => {
      const autorisation = Autorisation.NouvelleAutorisationProprietaire();
      expect(autorisation.peutSupprimerService()).to.be(true);
    });
  });

  describe('sur demande de permission de duplication de service', () => {
    it('interdit la duplication pour un contributeur', () => {
      const autorisation = Autorisation.NouvelleAutorisationContributeur();
      expect(autorisation.peutDupliquer()).to.be(false);
    });

    it('autorise la duplication pour un propriétaire', () => {
      const autorisation = Autorisation.NouvelleAutorisationProprietaire();
      expect(autorisation.peutDupliquer()).to.be(true);
    });
  });

  it("permet de savoir s'il y a une permission en lecture sur une rubrique", () => {
    const autorisation = new Autorisation({
      droits: { [DECRIRE]: LECTURE },
    });

    expect(autorisation.aLaPermission(LECTURE, DECRIRE)).to.be(true);
  });

  it("permet de savoir s'il y a une permission en écriture sur une rubrique", () => {
    const autorisation = new Autorisation({
      droits: { [DECRIRE]: ECRITURE },
    });

    expect(autorisation.aLaPermission(ECRITURE, DECRIRE)).to.be(true);
  });

  it("autorise la lecture sur une rubrique avec droits d'écriture", () => {
    const autorisationEcriture = new Autorisation({
      droits: { [DECRIRE]: ECRITURE },
    });

    const peutLire = autorisationEcriture.aLaPermission(LECTURE, DECRIRE);

    expect(peutLire).to.be(true);
  });

  it("n'autorise pas l'accès à une rubrique non référencée", () => {
    const autorisationSecuriser = new Autorisation({
      droits: { [SECURISER]: ECRITURE },
    });

    const peutLireDecrire = autorisationSecuriser.aLaPermission(
      LECTURE,
      DECRIRE
    );

    expect(peutLireDecrire).to.be(false);
  });

  it("n'autorise aucun accès pour un niveau invisible", () => {
    const niveauInvisible = new Autorisation({
      droits: { [DECRIRE]: INVISIBLE },
    });

    const peutLire = niveauInvisible.aLaPermission(LECTURE, DECRIRE);
    const peutEcrire = niveauInvisible.aLaPermission(ECRITURE, DECRIRE);

    expect(peutLire).to.be(false);
    expect(peutEcrire).to.be(false);
  });

  it('sait appliquer de nouveaux droits', () => {
    const autorisation = new Autorisation({
      droits: tousDroitsEnEcriture(),
    });
    expect(autorisation.aLaPermission(ECRITURE, HOMOLOGUER)).to.be(true);

    const homologuerLecture = { HOMOLOGUER: LECTURE };
    autorisation.appliqueDroits(homologuerLecture);

    expect(autorisation.aLaPermission(ECRITURE, HOMOLOGUER)).to.be(false);
    expect(autorisation.aLaPermission(LECTURE, HOMOLOGUER)).to.be(true);
  });

  it('passe tous les droits en écriture si on devient propriétaire', () => {
    const autorisation = new Autorisation({
      droits: { [DECRIRE]: LECTURE },
    });

    autorisation.appliqueDroits({ estProprietaire: true });

    expect(autorisation.estProprietaire).to.be(true);
    expect(autorisation.droits).to.eql({
      [DECRIRE]: ECRITURE,
      [SECURISER]: ECRITURE,
      [HOMOLOGUER]: ECRITURE,
      [RISQUES]: ECRITURE,
      [CONTACTS]: ECRITURE,
    });
  });

  it("supprime le droit de propriétaire lors de l'application d'un droit d'écriture", () => {
    const autorisation = Autorisation.NouvelleAutorisationProprietaire();

    autorisation.appliqueDroits({ HOMOLOGUER: ECRITURE });

    expect(autorisation.estProprietaire).to.be(false);
  });

  it("supprime le droit de propriétaire lors de l'application d'un droit de lecture", () => {
    const autorisation = Autorisation.NouvelleAutorisationProprietaire();

    autorisation.appliqueDroits({ HOMOLOGUER: LECTURE });

    expect(autorisation.estProprietaire).to.be(false);
  });

  describe('sur demande de résumé de niveau de droit', () => {
    it("retourne 'PROPRIETAIRE' si l'utilisateur est propriétaire du service", async () => {
      const autorisationProprietaire =
        Autorisation.NouvelleAutorisationProprietaire();

      expect(autorisationProprietaire.resumeNiveauDroit()).to.be(
        Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE
      );
    });

    it("retourne 'ECRITURE' si tous les droits sont en ECRITURE", () => {
      const autorisationLecture = new Autorisation({
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
        Autorisation.NouvelleAutorisationContributeur();

      expect(autorisationContributeur.peutGererContributeurs()).to.be(false);
    });

    it('autorise la gestion pour un propriétaire', () => {
      const autorisationCreateur =
        Autorisation.NouvelleAutorisationProprietaire();

      expect(autorisationCreateur.peutGererContributeurs()).to.be(true);
    });
  });

  describe("sur demande de permission d'homologuer un service", () => {
    it("autorise l'homologation pour un propriétaire", () => {
      const proprietaire = Autorisation.NouvelleAutorisationProprietaire();

      expect(proprietaire.peutHomologuer()).to.be(true);
    });

    it("interdit l'homologation pour un contributeur", () => {
      const contributeur = Autorisation.NouvelleAutorisationContributeur({
        droits: tousDroitsEnEcriture(),
      });

      expect(contributeur.peutHomologuer()).to.be(false);
    });
  });

  describe('sur demande des données à persister', () => {
    it('connaît ses données pour une autorisation de contributeur', () => {
      const autorisationContributeur =
        Autorisation.NouvelleAutorisationContributeur({
          id: 'uuid',
          idService: '123',
          idUtilisateur: '999',
          droits: tousDroitsEnEcriture(),
        });

      expect(autorisationContributeur.donneesAPersister()).to.eql({
        estProprietaire: false,
        id: 'uuid',
        idService: '123',
        idHomologation: '123',
        idUtilisateur: '999',
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
          id: 'uuid',
          idService: '123',
          idUtilisateur: '999',
        });

      expect(autorisationProprietaire.donneesAPersister()).to.eql({
        estProprietaire: true,
        id: 'uuid',
        idService: '123',
        idHomologation: '123',
        idUtilisateur: '999',
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
});
