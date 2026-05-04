import {
  ErreurEmailManquant,
  ErreurDonneesObligatoiresManquantes,
} from '../../src/erreurs.js';
import Utilisateur, {
  DonneesUtilisateur,
} from '../../src/modeles/utilisateur.js';
import { fabriqueAdaptateurMailMemoire } from '../../src/adaptateurs/adaptateurMailMemoire.js';
import { unUtilisateur } from '../constructeurs/constructeurUtilisateur.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { AdaptateurJWT } from '../../src/adaptateurs/adaptateurJWT.interface.ts';
import { adaptateurJWT as jwt } from '../../src/adaptateurs/adaptateurJWT.ts';
import * as adaptateurEnvironnement from '../../src/adaptateurs/adaptateurEnvironnement.js';
import { UUID } from '../../src/typesBasiques.ts';
import { SourceAuthentification } from '../../src/modeles/sourceAuthentification.ts';
import { AdaptateurMail } from '../../src/adaptateurs/adaptateurMail.interface.ts';

describe('Un utilisateur', () => {
  let adaptateurJWT: AdaptateurJWT;
  let cguActuelles: string;
  let adaptateursParDefaut: {
    adaptateurJWT: AdaptateurJWT;
    cguActuelles: string;
  };

  beforeEach(() => {
    adaptateurJWT = jwt({ adaptateurEnvironnement });
    cguActuelles = 'v1';
    adaptateursParDefaut = { adaptateurJWT, cguActuelles };
  });

  const donneesUtilisateur = (
    surcharge: Partial<DonneesUtilisateur>
  ): DonneesUtilisateur => ({
    id: unUUID('1'),
    prenom: 'Jean',
    nom: 'Dujardin',
    cguAcceptees: 'CGU',
    dateCreation: new Date(),
    email: 'jean.dujardin@beta.gouv.fr',
    entite: { nom: 'ANSSI', siret: '1234', departement: '75' },
    estimationNombreServices: { borneBasse: '0', borneHaute: '0' },
    postes: [],
    infolettreAcceptee: true,
    transactionnelAccepte: true,
    ...surcharge,
  });

  describe("sur demande d'un profil complet ou non", () => {
    it("considère le profil « complet » et sans champ manquant dès lors que le nom et le siret de l'entite sont renseignés", () => {
      const utilisateur = new Utilisateur(
        donneesUtilisateur({
          nom: 'Dupont',
          email: 'jean.dupont@mail.fr',
          entite: { siret: '12345' },
          estimationNombreServices: { borneBasse: '1', borneHaute: '10' },
        }),
        adaptateursParDefaut
      );
      expect(utilisateur.completudeProfil().estComplet).toBe(true);
      expect(utilisateur.completudeProfil().champsNonRenseignes).toEqual([]);
    });

    it("considère le profil « incomplet » à cause du nom, du SIRET et de l'estimation du nombre de services manquants s'ils ne sont pas renseignés", () => {
      const utilisateur = new Utilisateur(
        donneesUtilisateur({
          email: 'jean.dupont@mail.fr',
          nom: undefined,
          entite: { siret: undefined },
          estimationNombreServices: undefined,
        }),
        adaptateursParDefaut
      );
      expect(utilisateur.completudeProfil().estComplet).toBe(false);
      expect(utilisateur.completudeProfil().champsNonRenseignes).toEqual([
        'nom',
        'siret',
        'estimationNombreServices',
      ]);
    });

    it("considère le profil « incomplet » à cause du SIRET manquant si le SIRET de l'entité n'est pas renseigné", () => {
      const utilisateur = new Utilisateur(
        donneesUtilisateur({
          estimationNombreServices: { borneBasse: '1', borneHaute: '10' },
          entite: { siret: undefined },
        }),
        adaptateursParDefaut
      );
      expect(utilisateur.completudeProfil().estComplet).toBe(false);
      expect(utilisateur.completudeProfil().champsNonRenseignes).toEqual([
        'siret',
      ]);
    });

    it("considère le profil « incomplet » à cause de l'estimation du nombre de services manquante si les bornes sont égales à zéro", () => {
      const utilisateur = new Utilisateur(
        donneesUtilisateur({
          estimationNombreServices: { borneBasse: '0', borneHaute: '0' },
        }),
        adaptateursParDefaut
      );
      expect(utilisateur.completudeProfil().estComplet).toBe(false);
      expect(utilisateur.completudeProfil().champsNonRenseignes).toEqual([
        'estimationNombreServices',
      ]);
    });
  });

  it('connaît ses initiales', () => {
    const jeanDupont = new Utilisateur(
      donneesUtilisateur({
        prenom: 'Jean',
        nom: 'Dupont',
      }),
      adaptateursParDefaut
    );
    expect(jeanDupont.initiales()).toEqual('JD');
  });

  it('connaît son « prénom / nom »', () => {
    const jeanDupont = new Utilisateur(
      donneesUtilisateur({
        prenom: 'Jean',
        nom: 'Dupont',
      }),
      adaptateursParDefaut
    );
    expect(jeanDupont.prenomNom()).toEqual('Jean Dupont');
  });

  it('combine toutes les informations de postes sur demande de son poste détaillé', () => {
    const toutEnMemeTemps = new Utilisateur(
      donneesUtilisateur({
        postes: ['RSSI', 'DPO', 'Maire'],
      }),
      adaptateursParDefaut
    );

    expect(toutEnMemeTemps.posteDetaille()).toEqual('RSSI, DPO et Maire');
  });

  describe('concernant la génération de son token JWT', () => {
    beforeEach(() => {
      // @ts-expect-error On mock la méthode
      adaptateurJWT.genereToken = (
        idUtilisateur: UUID,
        source: SourceAuthentification,
        estInvite: boolean
      ) => ({
        idUtilisateur,
        source,
        estInvite,
      });
    });

    it('sait générer son JWT', () => {
      const jean = new Utilisateur(
        donneesUtilisateur({
          id: unUUID('1'),
        }),
        { adaptateurJWT, cguActuelles: 'v1' }
      );

      const token = jean.genereToken(
        'source' as SourceAuthentification
      ) as unknown as {
        idUtilisateur: UUID;
        source: SourceAuthentification;
      };

      expect(token.idUtilisateur).toBe(unUUID('1'));
      expect(token.source).toBe('source');
    });
  });

  it('sait détecter que les conditions générales actuelles ont été acceptées', () => {
    const accepteLesActuelles = new Utilisateur(
      donneesUtilisateur({
        cguAcceptees: 'v1.0',
      }),
      { adaptateurJWT, cguActuelles: 'v1.0' }
    );

    expect(accepteLesActuelles.accepteCGU()).toBe(true);
  });

  it("sait détecter que les conditions générales actuelles n'ont pas été acceptées", () => {
    const accepteObsoletes = new Utilisateur(
      donneesUtilisateur({
        cguAcceptees: 'v1.0',
      }),
      { adaptateurJWT, cguActuelles: 'v1.1-8' }
    );

    expect(accepteObsoletes.accepteCGU()).toBe(false);
  });

  it("sait détecter que les conditions générales actuelles n'ont jamais été acceptées", () => {
    const jamaisAcceptees = new Utilisateur(
      donneesUtilisateur({ email: 'jean.dupont@mail.fr' }),
      { adaptateurJWT, cguActuelles: 'v1.0' }
    );

    expect(jamaisAcceptees.accepteCGU()).toBe(false);
  });

  it("est considéré comme « invité » s'il n'a aucune version de CGU acceptée (i.e. les CGU acceptées sont `undefined`)", () => {
    const unInvite = new Utilisateur(
      donneesUtilisateur({
        cguAcceptees: undefined,
      }),
      adaptateursParDefaut
    );

    expect(unInvite.estUnInvite()).toBe(true);
  });

  it("n'est plus un invité dès lors qu'une version de CGU a été acceptée, même s'il s'agit de CGU osbolètes", () => {
    const accepteObsolete = new Utilisateur(
      donneesUtilisateur({ cguAcceptees: 'v1' }),
      { adaptateurJWT, cguActuelles: 'v2' }
    );

    expect(accepteObsolete.estUnInvite()).toBe(false);
  });

  it('sait détecter si le transactionnel a été acceptée', () => {
    const utilisateur = new Utilisateur(
      donneesUtilisateur({
        transactionnelAccepte: true,
      }),
      adaptateursParDefaut
    );
    expect(utilisateur.accepteTransactionnel()).toBe(true);

    const autreUtilisateur = new Utilisateur(
      donneesUtilisateur({
        transactionnelAccepte: undefined,
      }),
      adaptateursParDefaut
    );
    expect(autreUtilisateur.accepteTransactionnel()).toBe(false);
  });

  it("sait détecter si l'infolettre a été acceptée", () => {
    const utilisateur = new Utilisateur(
      donneesUtilisateur({
        infolettreAcceptee: true,
      }),
      adaptateursParDefaut
    );
    expect(utilisateur.accepteInfolettre()).toBe(true);

    const autreUtilisateur = new Utilisateur(
      donneesUtilisateur({
        infolettreAcceptee: undefined,
      }),
      adaptateursParDefaut
    );
    expect(autreUtilisateur.accepteInfolettre()).toBe(false);
  });

  it("exige que l'adresse électronique soit renseignée", () => {
    expect(
      () =>
        new Utilisateur(
          donneesUtilisateur({
            email: undefined,
          }),
          adaptateursParDefaut
        )
    ).toThrow(new ErreurEmailManquant());
  });

  it('connaît sa date de création', () => {
    const dateCreation = new Date(2000, 1, 1, 12, 0);
    const utilisateur = new Utilisateur(
      donneesUtilisateur({
        dateCreation,
        prenom: 'Jean',
        nom: 'Dupont',
        email: 'email',
      }),
      adaptateursParDefaut
    );

    expect(utilisateur.dateCreation).toBeDefined();
    expect(utilisateur.dateCreation).toEqual(dateCreation);
  });

  it('connaît la liste des noms de ses propriétés de base', () => {
    const nomsProprietes = [
      'prenom',
      'nom',
      'email',
      'telephone',
      'cguAcceptees',
      'infolettreAcceptee',
      'transactionnelAccepte',
      'postes.*',
      'estimationNombreServices.*',
    ];
    expect(Utilisateur.nomsProprietesBase()).toEqual(nomsProprietes);
  });

  it("initialise les postes s'ils ne sont pas définis", () => {
    const utilisateur = new Utilisateur(
      donneesUtilisateur({
        postes: undefined,
      }),
      adaptateursParDefaut
    );

    expect(utilisateur.postes).toEqual([]);
  });

  describe("sur une demande de validation des données d'un utilisateur", () => {
    let donnees: Partial<DonneesUtilisateur>;

    const verifiePresencePropriete = (clef: string, nom: string) => {
      if (clef.includes('.')) {
        const clefs = clef.split('.');
        // @ts-expect-error On utilise une notation `clef.autreClef`
        delete donnees[clefs[0]][clefs[1]];
      } else {
        // @ts-expect-error On utilise une notation `clef.autreClef`
        delete donnees[clef];
      }
      try {
        Utilisateur.valideDonnees(donnees);
        expect.fail(
          `La validation des données d'un utilisateur sans ${nom} aurait du lever une erreur de donnée manquante`
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ErreurDonneesObligatoiresManquantes);
        expect((error as Error).message).toEqual(
          `La propriété "${clef}" est requise`
        );
      }
    };

    beforeEach(() => {
      donnees = {
        prenom: 'Sandy',
        nom: 'Ferrance',
        email: 'sandy.ferrance@domaine.co',
        postes: ['RSSI'],
        entite: {
          siret: '7524242424',
        },
        estimationNombreServices: {
          borneBasse: '1',
          borneHaute: '10',
        },
        infolettreAcceptee: true,
        transactionnelAccepte: true,
      };
    });

    it('exige que le prénom soit renseigné', () => {
      verifiePresencePropriete('prenom', 'prénom');
    });

    it('exige que le nom soit renseigné', () => {
      verifiePresencePropriete('nom', 'nom');
    });

    it("exige que l'e-mail soit renseigné quand l'utilisateur est inexistant", () => {
      verifiePresencePropriete('email', 'e-mail');
    });

    it("n'exige pas que l'e-mail soit renseigné quand l'utilisateur existe déjà", () => {
      delete donnees.email;
      try {
        Utilisateur.valideDonnees(donnees, true);
      } catch (erreur) {
        let messageEchec = `La validation des données d'un utilisateur existant sans email n'aurait pas du lever d'erreur : ${(erreur as Error).message}`;
        if (erreur instanceof ErreurDonneesObligatoiresManquantes) {
          messageEchec =
            "La validation des données d'un utilisateur existant sans email n'aurait pas du lever d'erreur de propriété manquante";
        }
        expect.fail(messageEchec);
      }
    });

    it("exige que le SIRET de l'entité soit renseigné", () => {
      verifiePresencePropriete('entite.siret', "SIRET de l'entité");
    });

    it("exige que l'estimation du nombre de services soit renseignée", () => {
      verifiePresencePropriete(
        'estimationNombreServices',
        'Estimation du nombre de services'
      );
    });

    it('exige que les postes soient renseignés', () => {
      verifiePresencePropriete('postes', 'Postes');
    });

    it("exige que l'information d'acceptation de l'infolettre soit renseignée", () => {
      verifiePresencePropriete('infolettreAcceptee', 'infolettre acceptée');
    });
  });

  describe('sur demande de changement de ses préférences de communication', () => {
    let adaptateurEmail: AdaptateurMail;

    beforeEach(() => {
      adaptateurEmail =
        fabriqueAdaptateurMailMemoire() as unknown as AdaptateurMail;
    });

    const jeanDupont = () => unUtilisateur().avecEmail('jean.dupont@mail.fr');

    it("s'inscrit à l'infolettre s'il passe de « non » à « oui » sur ce canal de communication", async () => {
      let inscriptionEffectuee;
      adaptateurEmail.inscrisInfolettre = async (email) => {
        inscriptionEffectuee = email;
      };
      adaptateurEmail.desinscrisInfolettre = async () => {
        throw new Error('Ce test ne devrait pas déclencher de désinscription');
      };

      const refusait = jeanDupont().quiRefuseInfolettre().construis();
      await refusait.changePreferencesCommunication(
        { infolettreAcceptee: true },
        adaptateurEmail
      );

      expect(inscriptionEffectuee).toBe('jean.dupont@mail.fr');
    });

    it("se désinscrit de l'infolettre s'il passe de « oui » à « non » sur ce canal de communication", async () => {
      let desinscriptionEffectuee;
      adaptateurEmail.desinscrisInfolettre = async (email) => {
        desinscriptionEffectuee = email;
      };
      adaptateurEmail.inscrisInfolettre = async () => {
        throw new Error("Ce test ne devrait pas déclencher d'inscription");
      };

      const acceptait = jeanDupont().quiAccepteInfolettre().construis();
      await acceptait.changePreferencesCommunication(
        { infolettreAcceptee: false },
        adaptateurEmail
      );

      expect(desinscriptionEffectuee).toBe('jean.dupont@mail.fr');
    });

    it("s'inscrit aux emails transactionnels s'il passe de « non » à « oui » sur ce canal de communications", async () => {
      let inscriptionEffectuee;
      // @ts-expect-error On mock la méthode
      adaptateurEmail.inscrisEmailsTransactionnels = async (email) => {
        inscriptionEffectuee = email;
      };
      adaptateurEmail.desinscrisEmailsTransactionnels = async () => {
        throw new Error('Ce test ne devrait pas déclencher de désinscription');
      };

      const refusait = jeanDupont()
        .quiRefuseEmailsTransactionnels()
        .construis();

      await refusait.changePreferencesCommunication(
        { transactionnelAccepte: true },
        adaptateurEmail
      );

      expect(inscriptionEffectuee).toBe('jean.dupont@mail.fr');
    });

    it("se déinscrit des emails transactionnels s'il passe de « oui » à « non » sur ce canal de communications", async () => {
      let desinscriptionEffectuee;
      // @ts-expect-error On mock la méthode
      adaptateurEmail.desinscrisEmailsTransactionnels = async (email) => {
        desinscriptionEffectuee = email;
      };
      adaptateurEmail.inscrisEmailsTransactionnels = async () => {
        throw new Error("Ce test ne devrait pas déclencher d'inscription");
      };

      const acceptait = jeanDupont()
        .quiAccepteEmailsTransactionnels()
        .construis();

      await acceptait.changePreferencesCommunication(
        { transactionnelAccepte: false },
        adaptateurEmail
      );

      expect(desinscriptionEffectuee).toBe('jean.dupont@mail.fr');
    });

    it('sait dire si un utilisateur a toutes les informations fournies par AgentConnect', () => {
      const utilisateurComplet = unUtilisateur()
        .avecEmail('jean.dujardin@beta.gouv.fr')
        .quiSAppelle('Jean Dujardin')
        .quiTravaillePourUneEntiteAvecSiret('unSIRET')
        .construis();
      const utilisateurIncomplet = unUtilisateur().construis();

      expect(utilisateurComplet.aLesInformationsAgentConnect()).toBe(true);
      expect(utilisateurIncomplet.aLesInformationsAgentConnect()).toBe(false);
    });
  });
});
