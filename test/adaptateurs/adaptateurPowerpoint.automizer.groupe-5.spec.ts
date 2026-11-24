import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';
import {
  cadreDeLaForme,
  contenusDesSlides,
  couleurDuFond,
  couleursDuTexte,
  formeNommee,
  nomsDesFormes,
  paragraphesDeLaForme,
  texteDeLaForme,
  textesDeLaSlide,
} from '../aides/lecturePptx.js';
import {
  DESCRIPTION_DU_CONTEXTE,
  nomsDesPastilles,
  pagesDeLaCartographie,
  slideAvecLaForme,
  slideDesBesoins,
  slideDuContexte,
  slidesDeLAnnexe,
} from '../aides/lectureSupportCommission.js';
import {
  repete,
  uneExigence,
  uneMesure,
  unRisque,
  unSupportDeCommission,
} from '../constructeurs/constructeurSupportCommissionHomologation.js';

const intituleDe = (nombreDeLignes: number) =>
  repete("Compromission d'un poste de travail utilisateur", nombreDeLignes);

const donnees = unSupportDeCommission()
  .avecContexte({
    description: 'Premier paragraphe\n\n\n\nDernier paragraphe',
  })
  .avecDonneesIdentifiees(
    "Données d'identité",
    'Documents RH sensibles',
    'Données relatives à la situation familiale, économique et financière',
    'Données techniques',
    'Plannings des agents'
  )
  .avecRisquesBruts(
    ...[1, 2, 3, 4].map((lignes) =>
      unRisque(`R${lignes}`, { intitule: intituleDe(lignes) })
    )
  )
  .avecRisquesADate(
    unRisque('R1', { gravite: 2, vraisemblance: 2, niveau: 'faible' }),
    unRisque('R2', {
      gravite: 2,
      vraisemblance: 2,
      niveau: 'faible',
      description: repete('description', 40),
    }),
    unRisque('R3', { gravite: 2, vraisemblance: 2, niveau: 'faible' })
  )
  .avecExigencesRestantes(
    uneExigence('Une description courte', { statut: 'enCours' }),
    uneExigence(
      'Mettre en place une authentification multifacteur pour les administrateurs et les comptes à privilèges',
      { statut: 'aLancer' }
    ),
    uneExigence('Une autre description courte')
  )
  .avecAvis()
  .avecAnnexe(
    {
      statut: 'fait',
      mesures: [
        uneMesure('Désigner un responsable de la sécurité'),
        uneMesure(
          'Mettre en place une authentification multifacteur pour les administrateurs et les comptes à privilèges du système',
          {
            categorie: 'Protection',
            criticite: 'Recommandée',
            referentiel: 'CNIL',
          }
        ),
        uneMesure('Une autre description courte'),
      ],
    },
    { statut: 'sansStatut', mesures: [uneMesure('Journaliser les accès')] }
  )
  .construis();

describe("Le support de commission d'homologation du groupe 5", () => {
  let slides: string[];

  beforeAll(async () => {
    const pptx =
      await new AdaptateurPowerpointAutomizer().genereSupportCommissionHomologation(
        donnees
      );
    slides = await contenusDesSlides(pptx);
  });

  describe('sur le contexte', () => {
    it('[19] coupe aussi la description aux sauts de ligne quand elle dépasse quatre lignes à 14 pt', () => {
      const contexte = slideDuContexte(slides);

      expect(paragraphesDeLaForme(contexte, DESCRIPTION_DU_CONTEXTE)).toContain(
        'Premier paragraphe…'
      );
      expect(texteDeLaForme(contexte, DESCRIPTION_DU_CONTEXTE)).not.toContain(
        'Dernier paragraphe'
      );
    });
  });

  describe('sur les pastilles des données identifiées', () => {
    it('[39] écrit « et 1 autre » au singulier', () => {
      const besoins = slideDesBesoins(slides);
      const noms = nomsDesPastilles(besoins);

      expect(noms).toHaveLength(5);
      expect(texteDeLaForme(besoins, noms[4])).toBe('et 1 autre');
    });
  });

  describe('sur la cartographie des risques bruts, pour les lignes de la liste des risques', () => {
    const HAUTEUR_D_UNE_LIGNE_DE_TEXTE_EN_18_PT = 274320;
    const MARGES_D_UNE_LIGNE = 76200 + 50800;
    const ECART_ENTRE_LIGNES = 38100;

    const cartographie = () =>
      pagesDeLaCartographie(slides, 'Cartographie des risques bruts')[0];

    it('[54] ajustent leur hauteur au nombre de lignes de leur intitulé, en 18 pt', () => {
      const hauteur = (numero: number) =>
        cadreDeLaForme(cartographie(), `risque-${numero}-fond`).hauteur;

      [1, 2, 3, 4].forEach((lignes) =>
        expect(hauteur(lignes)).toBe(
          MARGES_D_UNE_LIGNE + lignes * HAUTEUR_D_UNE_LIGNE_DE_TEXTE_EN_18_PT
        )
      );
    });

    it("[55] s'empilent sous l'en-tête, séparées par l'écart de la maquette", () => {
      const fond = (numero: number) =>
        cadreDeLaForme(cartographie(), `risque-${numero}-fond`);

      expect(fond(1).y).toBe(3190949);
      [2, 3, 4].forEach((numero) =>
        expect(fond(numero).y).toBe(
          fond(numero - 1).y + fond(numero - 1).hauteur + ECART_ENTRE_LIGNES
        )
      );
    });

    it("[56] centrent la pastille et l'identifiant dans la ligne, et ajustent la zone de l'intitulé", () => {
      const cadre = (nom: string) => cadreDeLaForme(cartographie(), nom);

      const fond = cadre('risque-2-fond');
      const pastille = cadre('risque-2-pastille');
      expect(pastille.y).toBe(
        fond.y + Math.floor((fond.hauteur - pastille.hauteur) / 2)
      );
      expect(cadre('risque-2-identifiant').y).toBe(pastille.y + 19050);
      const intitule = cadre('risque-2-intitule');
      expect(intitule.y).toBe(fond.y + 57150);
      expect(intitule.hauteur).toBe(fond.hauteur - 76200);
    });
  });

  describe('sur les exigences restantes', () => {
    const HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION = 297180;
    const ECART_ENTRE_LIGNES_DU_TABLEAU = 57150;

    const slideDesExigences = () =>
      slideAvecLaForme(slides, 'exigences-restantes-titre');

    it('[85] colore la pastille du statut aux couleurs de MonServiceSécurisé', () => {
      const slide = slideDesExigences();

      expect(
        [1, 2].map((numero) => [
          couleursDuTexte(slide, `exigence-${numero}-statut-texte`),
          couleurDuFond(slide, `exigence-${numero}-statut-fond`),
        ])
      ).toEqual([
        [['0079D0'], 'DBEEFF'],
        [['7025DA'], 'E9DDFF'],
      ]);
    });

    it('[86] ajuste la largeur de la pastille du statut à son libellé', () => {
      const slide = slideDesExigences();

      expect(
        [1, 2].map(
          (numero) =>
            cadreDeLaForme(slide, `exigence-${numero}-statut-fond`).largeur
        )
      ).toEqual([1519758, 1447800]);
    });

    describe("quand la description d'une mesure tient sur plusieurs lignes", () => {
      it('[90] écrit la description sur plusieurs lignes au lieu de rétrécir la police', () => {
        const slide = slideDesExigences();

        expect(
          formeNommee(slide, 'exigence-2-description').getElementsByTagName(
            'a:normAutofit'
          )
        ).toHaveLength(0);
        expect(
          cadreDeLaForme(slide, 'exigence-2-description').hauteur -
            cadreDeLaForme(slide, 'exigence-1-description').hauteur
        ).toBe(HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION);
      });

      it("[92] agrandit la ligne du tableau et descend les cartouches d'autant", () => {
        const slide = slideDesExigences();

        const cadre = (numero: number, partie: string) => {
          const { y, hauteur } = cadreDeLaForme(
            slide,
            `exigence-${numero}-${partie}`
          );
          const haut = cadreDeLaForme(
            slide,
            `exigence-${numero}-fond-mesure`
          ).y;
          return { decalage: y - haut, hauteur };
        };
        const ecartAvecLaLigneCourte = (
          partie: string,
          mesure: 'decalage' | 'hauteur'
        ) => cadre(2, partie)[mesure] - cadre(1, partie)[mesure];
        expect(
          [
            'fond-mesure',
            'fond-statut',
            'fond-echeance',
            'fond-porteurs',
            'echeance',
            'porteurs',
          ].map((partie) => ecartAvecLaLigneCourte(partie, 'hauteur'))
        ).toEqual(Array(6).fill(HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION));
        expect(
          ['cartouche-1-fond', 'cartouche-1-texte'].map((partie) =>
            ecartAvecLaLigneCourte(partie, 'decalage')
          )
        ).toEqual([
          HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION,
          HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION,
        ]);
        expect(ecartAvecLaLigneCourte('statut-fond', 'decalage')).toBe(
          HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION / 2
        );
      });

      it('[93] place les lignes suivantes sous la ligne agrandie', () => {
        const slide = slideDesExigences();

        const ligne = (numero: number) =>
          cadreDeLaForme(slide, `exigence-${numero}-fond-mesure`);
        expect(ligne(2).y).toBe(
          ligne(1).y + ligne(1).hauteur + ECART_ENTRE_LIGNES_DU_TABLEAU
        );
        expect(ligne(3).y).toBe(
          ligne(2).y + ligne(2).hauteur + ECART_ENTRE_LIGNES_DU_TABLEAU
        );
      });
    });
  });

  describe('sur les avis des membres', () => {
    it("[110] écrit « Aucun avis n'a été renseigné par l'équipe. », comme le PDF, quand le dossier n'a pas d'avis", () => {
      const slide = slideAvecLaForme(slides, 'avis-titre');

      expect(texteDeLaForme(slide, 'aucun-avis')).toBe(
        "Aucun avis n'a été renseigné par l'équipe."
      );
      expect(
        nomsDesFormes(slide).filter((nom) => /^avis-\d-/.test(nom))
      ).toEqual([]);
    });
  });

  describe("sur l'annexe des mesures", () => {
    const HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION = 319710;

    it('[113] ajoute une slide par statut qui a des mesures, avec une ligne par mesure', () => {
      const annexe = slidesDeLAnnexe(slides);

      expect(annexe).toHaveLength(2);
      expect(textesDeLaSlide(annexe[0])).toContain('FAITE');
      expect(textesDeLaSlide(annexe[1])).toContain('STATUT À DÉFINIR');
      const ligne = (slide: string, numero: number) =>
        ['mesure', 'categorie', 'criticite', 'referentiel'].map((partie) =>
          texteDeLaForme(slide, `mesure-${numero}-${partie}`)
        );
      expect([ligne(annexe[0], 1), ligne(annexe[0], 2)]).toEqual([
        [
          'Désigner un responsable de la sécurité',
          'Gouvernance',
          'Indispensable',
          'ANSSI',
        ],
        [
          'Mettre en place une authentification multifacteur pour les administrateurs et les comptes à privilèges du système',
          'Protection',
          'Recommandée',
          'CNIL',
        ],
      ]);
      expect(ligne(annexe[1], 1)).toEqual([
        'Journaliser les accès',
        'Gouvernance',
        'Indispensable',
        'ANSSI',
      ]);
    });

    it('[115] agrandit la ligne du tableau, garde ses textes centrés et descend les lignes suivantes', () => {
      const [mesuresFaites] = slidesDeLAnnexe(slides);

      const cadre = (numero: number, partie: string) =>
        cadreDeLaForme(mesuresFaites, `mesure-${numero}-${partie}`);
      const parties = [
        'fond-mesure',
        'mesure',
        'fond-categorie',
        'categorie',
        'fond-criticite',
        'criticite',
        'fond-referentiel',
        'referentiel',
      ];
      expect(
        parties.map(
          (partie) => cadre(2, partie).hauteur - cadre(1, partie).hauteur
        )
      ).toEqual(Array(8).fill(HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION));
      expect(
        parties.map(
          (partie) =>
            cadre(3, partie).y -
            cadre(2, partie).y -
            (cadre(2, partie).y - cadre(1, partie).y)
        )
      ).toEqual(Array(8).fill(HAUTEUR_D_UNE_LIGNE_DE_DESCRIPTION));
    });
  });

  describe('sur la description des risques, pour les lignes de la description', () => {
    const ECART_ENTRE_LIGNES = 38100;

    const description = () =>
      slideAvecLaForme(slides, 'description-risques-total');

    it("[125] s'empilent sous l'en-tête, séparées par l'écart de la maquette", () => {
      const fond = (numero: number) =>
        cadreDeLaForme(
          description(),
          `description-risque-${numero}-fond-reference`
        );

      expect(fond(1).y).toBe(2708970);
      [2, 3].forEach((numero) =>
        expect(fond(numero).y).toBe(
          fond(numero - 1).y + fond(numero - 1).hauteur + ECART_ENTRE_LIGNES
        )
      );
    });

    it('[126] alignent les fonds de la ligne, centrent la pastille et ajustent les zones de texte', () => {
      const cadre = (partie: string) =>
        cadreDeLaForme(description(), `description-risque-2-${partie}`);

      const fond = cadre('fond-reference');
      ['fond-intitule', 'fond-description'].forEach((partie) =>
        expect([cadre(partie).y, cadre(partie).hauteur]).toEqual([
          fond.y,
          fond.hauteur,
        ])
      );
      const pastille = cadre('pastille');
      expect(pastille.y).toBe(
        fond.y + Math.floor((fond.hauteur - pastille.hauteur) / 2)
      );
      expect(cadre('identifiant').y).toBe(pastille.y + 19050);
      ['intitule', 'description'].forEach((partie) =>
        expect([cadre(partie).y, cadre(partie).hauteur]).toEqual([
          fond.y + 38100,
          fond.hauteur - 76200,
        ])
      );
    });
  });
});
