const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const Homologation = require('../../src/modeles/homologation');
const Mesure = require('../../src/modeles/mesure');

describe('Une homologation', () => {
  it('sait se convertir en JSON', () => {
    const homologation = new Homologation({
      id: '123', idUtilisateur: '456', nomService: 'Super Service',
    });

    expect(homologation.toJSON()).to.eql({
      id: '123', nomService: 'Super Service',
    });
  });

  it('sait décrire la nature du service', () => {
    const referentiel = Referentiel.creeReferentiel({
      naturesService: {
        uneNature: { description: 'Une nature' },
        uneAutre: { description: 'Une autre' },
      },
    });
    const homologation = new Homologation({
      id: '123', idUtilisateur: '456', nomService: 'nom', natureService: ['uneNature', 'uneAutre'],
    }, referentiel);

    expect(homologation.descriptionNatureService()).to.equal('Une nature, Une autre');
  });

  it("se comporte correctement si la nature du service n'est pas présente", () => {
    const homologation = new Homologation({ id: '123', idUtilisateur: '456', nomService: 'nom' });
    expect(homologation.descriptionNatureService()).to.equal('Nature du service non renseignée');
  });

  it('connaît ses caractéristiques complémentaires', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: { france: { description: 'Quelque part en France' } },
    });
    const homologation = new Homologation({
      id: '123',
      caracteristiquesComplementaires: {
        presentation: 'Une présentation',
        structureDeveloppement: 'Une structure',
        hebergeur: 'Un hébergeur',
        localisationDonnees: 'france',
      },
    }, referentiel);

    expect(homologation.presentation()).to.equal('Une présentation');
    expect(homologation.structureDeveloppement()).to.equal('Une structure');
    expect(homologation.hebergeur()).to.equal('Un hébergeur');
    expect(homologation.localisationDonnees()).to.equal('Quelque part en France');
  });

  it('connait ses parties prenantes', () => {
    const homologation = new Homologation({
      id: '123',
      partiesPrenantes: {
        autoriteHomologation: 'Jean Dupont',
        fonctionAutoriteHomologation: 'Maire',
        piloteProjet: 'Sylvie Martin',
        expertCybersecurite: 'Anna Dubreuil',
      },
    });

    expect(homologation.autoriteHomologation()).to.equal('Jean Dupont');
    expect(homologation.fonctionAutoriteHomologation()).to.equal('Maire');
    expect(homologation.piloteProjet()).to.equal('Sylvie Martin');
    expect(homologation.expertCybersecurite()).to.equal('Anna Dubreuil');
  });

  it("sait décrire l'équipe de préparation du dossier", () => {
    const homologation = new Homologation({
      id: '123',
      partiesPrenantes: { piloteProjet: 'Sylvie Martin' },
    });

    expect(homologation.descriptionEquipePreparation()).to.equal(
      'Sylvie Martin (fonction non renseignée)'
    );
  });

  it("sait décrire l'autorité d'homologation", () => {
    const homologation = new Homologation({
      id: '123',
      partiesPrenantes: {
        autoriteHomologation: 'Jean Dupont', fonctionAutoriteHomologation: 'Maire',
      },
    });

    expect(homologation.descriptionAutoriteHomologation()).to.equal('Jean Dupont (Maire)');
  });

  it('décrit son expiration', () => {
    const referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { unAn: { expiration: 'Dans un an' } },
    });

    const homologation = new Homologation({
      id: '123',
      avisExpertCyber: { dateRenouvellement: 'unAn' },
    }, referentiel);

    expect(homologation.descriptionExpiration()).to.equal('Dans un an');
  });

  describe('sur calcul du nombre de mesures mises en œuvre', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: {
        m1: { indispensable: true },
        m2: { indispensable: true },
        m3: { indispensable: true },
        m4: {},
      },
    });

    it('additionne les mesures mises en oeuvre', () => {
      const homologation = new Homologation({
        mesures: [{ id: 'm1', statut: Mesure.STATUT_FAIT }, { id: 'm2', statut: Mesure.STATUT_FAIT }],
      }, referentiel);

      expect(homologation.nbMesuresIndispensablesMisesEnOeuvre()).to.equal(2);
    });

    it('tient uniquement compte des mesures mises en œuvre', () => {
      const homologation = new Homologation({
        mesures: [{ id: 'm1', statut: Mesure.STATUT_PLANIFIE }, { id: 'm2', statut: Mesure.STATUT_NON_RETENU }],
      }, referentiel);

      expect(homologation.nbMesuresIndispensablesMisesEnOeuvre()).to.equal(0);
    });

    it('ne tient pas compte des mesures non concernees', () => {
      const homologation = new Homologation({
        mesures: [{ id: 'm1', statut: Mesure.STATUT_FAIT }, { id: 'm4', statut: Mesure.STATUT_FAIT }],
      }, referentiel);

      expect(homologation.nbMesuresIndispensablesMisesEnOeuvre()).to.equal(1);
      expect(homologation.nbMesuresRecommandeesMisesEnOeuvre()).to.equal(1);
    });
  });

  describe('sur calcul du niveau de sécurité', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: {
        m1: { indispensable: true },
        m2: { indispensable: true },
        m3: { indispensable: true },
        m4: { indispensable: true },
        m5: {},
        m6: {},
      },
    });

    it('retourne un niveau « bon » quand mise en œuvre 100% des mesures indispensables '
      + 'et plus de 50% des mesures recommandées', () => {
      const homologation = new Homologation({
        mesures: [
          { id: 'm1', statut: Mesure.STATUT_FAIT },
          { id: 'm2', statut: Mesure.STATUT_FAIT },
          { id: 'm3', statut: Mesure.STATUT_FAIT },
          { id: 'm4', statut: Mesure.STATUT_FAIT },
          { id: 'm5', statut: Mesure.STATUT_FAIT },
          { id: 'm6', statut: Mesure.STATUT_PLANIFIE },
        ],
      }, referentiel);

      expect(homologation.niveauSecurite()).to.equal(Homologation.NIVEAU_SECURITE_BON);
    });

    it('retourne niveau « statisfaisant » quand mise en œuvre 100% des mesures indispensables '
      + 'et strictement moins de 50% des mesures recommandées', () => {
      const homologation = new Homologation({
        mesures: [
          { id: 'm1', statut: Mesure.STATUT_FAIT },
          { id: 'm2', statut: Mesure.STATUT_FAIT },
          { id: 'm3', statut: Mesure.STATUT_FAIT },
          { id: 'm4', statut: Mesure.STATUT_FAIT },
          { id: 'm5', statut: Mesure.STATUT_PLANIFIE },
          { id: 'm6', statut: Mesure.STATUT_PLANIFIE },
        ],
      }, referentiel);

      expect(homologation.niveauSecurite()).to.equal(Homologation.NIVEAU_SECURITE_SATISFAISANT);
    });

    it('retourne niveau « à renforcer » quand mise en œuvre au moins 75% des '
      + 'mesures indispensables', () => {
      const homologation = new Homologation({
        mesures: [
          { id: 'm1', statut: Mesure.STATUT_FAIT },
          { id: 'm2', statut: Mesure.STATUT_FAIT },
          { id: 'm3', statut: Mesure.STATUT_FAIT },
          { id: 'm4', statut: Mesure.STATUT_PLANIFIE },
          { id: 'm5', statut: Mesure.STATUT_FAIT },
          { id: 'm6', statut: Mesure.STATUT_FAIT },
        ],
      }, referentiel);

      expect(homologation.niveauSecurite()).to.equal(Homologation.NIVEAU_SECURITE_A_RENFORCER);
    });

    it('retourne niveau « insatisfaisant » quand mise en œuvre de moins de 75% des '
      + 'mesures indispensables', () => {
      const homologation = new Homologation({
        mesures: [
          { id: 'm1', statut: Mesure.STATUT_FAIT },
          { id: 'm2', statut: Mesure.STATUT_FAIT },
          { id: 'm3', statut: Mesure.STATUT_PLANIFIE },
          { id: 'm4', statut: Mesure.STATUT_PLANIFIE },
          { id: 'm5', statut: Mesure.STATUT_FAIT },
          { id: 'm6', statut: Mesure.STATUT_FAIT },
        ],
      }, referentiel);

      expect(homologation.niveauSecurite()).to.equal(Homologation.NIVEAU_SECURITE_INSUFFISANT);
    });

    it('ne tient pas compte des mesures non retenues pour les calculs', () => {
      const homologation = new Homologation({
        mesures: [
          { id: 'm1', statut: Mesure.STATUT_FAIT },
          { id: 'm2', statut: Mesure.STATUT_FAIT },
          { id: 'm3', statut: Mesure.STATUT_FAIT },
          { id: 'm4', statut: Mesure.STATUT_NON_RETENU },
          { id: 'm5', statut: Mesure.STATUT_FAIT },
          { id: 'm6', statut: Mesure.STATUT_FAIT },
        ],
      }, referentiel);

      expect(homologation.niveauSecurite()).to.equal(Homologation.NIVEAU_SECURITE_BON);
    });

    it("gère les cas où aucune mesure n'est retenue", () => {
      const homologation = new Homologation({
        mesures: [
          { id: 'm1', statut: Mesure.STATUT_FAIT },
          { id: 'm2', statut: Mesure.STATUT_FAIT },
          { id: 'm3', statut: Mesure.STATUT_FAIT },
          { id: 'm4', statut: Mesure.STATUT_FAIT },
          { id: 'm5', statut: Mesure.STATUT_NON_RETENU },
          { id: 'm6', statut: Mesure.STATUT_NON_RETENU },
        ],
      }, referentiel);

      expect(homologation.niveauSecurite()).to.equal(Homologation.NIVEAU_SECURITE_BON);
    });
  });
});
