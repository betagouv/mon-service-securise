import { readFile } from 'node:fs/promises';
import { AdaptateurPowerpointAutomizer } from '../../src/adaptateurs/adaptateurPowerpoint.automizer.js';
import {
  contenuSlide,
  fichiersNonCompresses,
  identifiantsDeFormesEnDouble,
  imageDeLaForme,
  nombreDeSlides,
  partiesDeclarees,
  partiesDeclareesAbsentes,
  relationsCassees,
} from '../aides/lecturePptx.js';
import { DonneesSupportCommissionHomologation } from '../../src/adaptateurs/adaptateurPowerpoint.interface.js';
import { PieceDuDossier } from '../../src/modeles/objetsPowerpoint/piecesDuDossier.js';
import { ContexteDuService } from '../../src/modeles/objetsPowerpoint/contexteDuService.js';
import { BesoinsDeSecurite } from '../../src/modeles/objetsPowerpoint/besoinsDeSecurite.js';

const texteDeLaForme = (slide: string, nom: string) => {
  const forme = slide.match(
    new RegExp(`name="${nom}"(?:(?!</p:sp>).)*</p:sp>`, 's')
  );
  if (!forme) throw new Error(`Forme ${nom} absente de la slide`);
  return [...forme[0].matchAll(/<a:t>([^<]*)<\/a:t>/g)]
    .map(([, texte]) => texte)
    .join('');
};

const cadreDeLaForme = (slide: string, nom: string) => {
  const cadre = slide.match(
    new RegExp(
      `name="${nom}"(?:(?!</p:(?:sp|pic)>).)*?<a:off x="(\\d+)" y="(\\d+)"/>\\s*<a:ext cx="(\\d+)" cy="(\\d+)"/>`,
      's'
    )
  );
  if (!cadre) throw new Error(`Forme ${nom} absente de la slide`);
  const [, x, y, largeur, hauteur] = cadre.map(Number);
  return { x, y, largeur, hauteur };
};

const unePiece = (intitule: string): PieceDuDossier => ({
  intitule,
  source: 'MonServiceSécurisé',
  cochee: false,
});

describe("L'adaptateur PowerPoint utilisant pptx-automizer", () => {
  const POSITION_SLIDE_PIECES = 4;

  const adaptateur = new AdaptateurPowerpointAutomizer();

  const besoinsDeSecuriteParDefaut: BesoinsDeSecurite = {
    idNiveau: 'niveau1',
    niveau: 'Un niveau',
    resume: 'Un résumé',
    demarche: 'une démarche',
    niveauIndicatifAnssi: 'Un niveau indicatif',
    depasseRecommandation: true,
    nomService: 'Un service',
    exposition: {
      ouverture: 'Une ouverture',
      audience: 'Une audience',
      dureeDysfonctionnement: 'Une durée',
    },
    donneesIdentifiees: [],
  };

  const contexteParDefaut: ContexteDuService = {
    organisation: 'Une organisation',
    statut: 'Un statut',
    urls: '',
    typeDeProjet: 'Un type de projet',
    hebergement: 'Un hébergement',
    donneesStockees: 'Une localisation',
    securisations: '',
  };

  const genereSupport = (
    donnees: Partial<DonneesSupportCommissionHomologation> = {}
  ) =>
    adaptateur.genereSupportCommissionHomologation({
      dateCreation: new Date(2026, 10, 9),
      piecesDuDossier: [unePiece('Une pièce du dossier')],
      contexte: contexteParDefaut,
      besoinsDeSecurite: besoinsDeSecuriteParDefaut,
      ...donnees,
    });

  describe('quand il génère le support de commission d’homologation', () => {
    it('contient, dans l’ordre, la couverture, le sommaire, la composition de la commission, les pièces du dossier, la présentation du système, le contexte, le périmètre de l’analyse, les objectifs de sécurité, l’historique et la cartographie des risques bruts', async () => {
      const pptx = await genereSupport();

      expect(await nombreDeSlides(pptx)).toBe(13);
      expect(await contenuSlide(pptx, 1)).toContain(
        '<a:t>Support de commission d’homologation</a:t>'
      );
      expect(await contenuSlide(pptx, 2)).toContain('<a:t>Sommaire</a:t>');
      expect(await contenuSlide(pptx, 3)).toContain(
        '<a:t>Composition de la commission</a:t>'
      );
      const pagePieces = await contenuSlide(pptx, 4);
      expect(pagePieces).toContain(
        '<a:t>Pièces du dossier transmises avant la séance</a:t>'
      );
      expect(pagePieces).not.toContain(
        'Composition de la commission et contenu du dossier'
      );
      const presentationDuSysteme = await contenuSlide(pptx, 5);
      expect(presentationDuSysteme).toContain(
        '<a:t>1. Présentation du système</a:t>'
      );
      expect(presentationDuSysteme).toContain('<a:t>Logo</a:t>');
      expect(await contenuSlide(pptx, 6)).toContain('<a:t>Contexte</a:t>');
      expect(await contenuSlide(pptx, 7)).toContain(
        '<a:t>Périmètre de l’analyse : Vue fonctionnelle</a:t>'
      );
      expect(await contenuSlide(pptx, 8)).toContain(
        '<a:t>Périmètre de l’analyse : Description technique</a:t>'
      );
      expect(await contenuSlide(pptx, 9)).toContain(
        '<a:t>Objectifs de sécurité, impacts et exposition</a:t>'
      );
      const intercalaireHistorique = await contenuSlide(pptx, 10);
      expect(intercalaireHistorique).toContain('<a:t>2. Historique</a:t>');
      expect(intercalaireHistorique).toContain('<a:t>Logo</a:t>');
      expect(await contenuSlide(pptx, 11)).toContain('<a:t>EVÈNEMENT</a:t>');
      expect(await contenuSlide(pptx, 12)).toContain(
        '<a:t>3. Détail : Risques et plan d’action</a:t>'
      );
      expect(await contenuSlide(pptx, 13)).toContain(
        '<a:t>Cartographie des risques bruts</a:t>'
      );
    });

    it("écrit le nom et la fonction de l'autorité d'homologation dans la composition de la commission", async () => {
      const pptx = await genereSupport({
        autorite: { nom: 'Jean Dupond', fonction: 'RSSI' },
      });

      expect(await contenuSlide(pptx, 3)).toContain(
        '<a:t>Jean Dupond, RSSI</a:t>'
      );
    });

    it("ne laisse pas l'autorité d'homologation à compléter quand elle est renseignée", async () => {
      const pptx = await genereSupport({
        autorite: { nom: 'Jean Dupond', fonction: 'RSSI' },
      });

      expect(await contenuSlide(pptx, 3)).not.toContain(
        'autorite-homologation-a-completer'
      );
    });

    it("laisse l'autorité d'homologation à compléter par le projet quand elle n'est pas renseignée", async () => {
      const pptx = await genereSupport();

      const commission = await contenuSlide(pptx, 3);
      expect(commission).not.toContain('name="autorite-homologation"');
      expect(commission).toContain(
        'name="autorite-homologation-a-completer-texte"'
      );
    });

    describe('sur la page des pièces du dossier', () => {
      const nombreDePagesDePieces = async (pptx: Buffer) => {
        const positions = Array.from(
          { length: await nombreDeSlides(pptx) },
          (_, index) => index + 1
        );
        const slides = await Promise.all(
          positions.map((position) => contenuSlide(pptx, position))
        );
        return slides.filter((slide) =>
          slide.includes('name="titre-page-pieces"')
        ).length;
      };

      const titreDeLaPage = (page: string) => {
        const [titre] = page.match(
          /name="titre-page-pieces"(?:(?!<\/p:sp>).)*<\/p:sp>/s
        )!;
        return [...titre.matchAll(/<a:t>([^<]*)<\/a:t>/g)]
          .map(([, texte]) => texte)
          .join('');
      };

      const ligne = (page: string, numero: number, partie: string) =>
        page.match(
          new RegExp(
            `name="piece-${numero}-${partie}"(?:(?!</p:sp>).)*</p:sp>`,
            's'
          )
        )?.[0] ?? '';

      it('écrit l’intitulé, la source et la case de chaque pièce', async () => {
        const pptx = await genereSupport({
          piecesDuDossier: [
            {
              intitule: 'Présent support de commission',
              source: 'MonServiceSécurisé',
              cochee: true,
            },
            {
              intitule: 'Charte informatique',
              source: 'Utilisateur',
              cochee: false,
            },
          ],
        });

        const page = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
        expect(ligne(page, 1, 'case')).toContain('<a:t>☑</a:t>');
        expect(ligne(page, 1, 'intitule')).toContain(
          '<a:t>Présent support de commission</a:t>'
        );
        expect(ligne(page, 1, 'source')).toContain(
          '<a:t>MonServiceSécurisé</a:t>'
        );
        expect(ligne(page, 2, 'case')).toContain('<a:t>☐</a:t>');
        expect(ligne(page, 2, 'intitule')).toContain(
          '<a:t>Charte informatique</a:t>'
        );
        expect(ligne(page, 2, 'source')).toContain('<a:t>Utilisateur</a:t>');
      });

      it('retire la version à compléter des lignes remplies', async () => {
        const pptx = await genereSupport({
          piecesDuDossier: [unePiece('Une pièce')],
        });

        const page = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
        expect(page).not.toContain('name="piece-1-a-completer-');
      });

      it('laisse les lignes au-delà des pièces à compléter par le projet', async () => {
        const pptx = await genereSupport({
          piecesDuDossier: [unePiece('Une pièce')],
        });

        const page = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
        expect(page).not.toContain('name="piece-2-intitule"');
        expect(page).not.toContain('name="piece-2-source"');
        expect(page).toContain('name="piece-2-a-completer-intitule-texte"');
        expect(ligne(page, 2, 'case')).toContain('<a:t>☐</a:t>');
        expect(page).toContain('name="piece-16-a-completer-reference-texte"');
      });

      it('répartit les pièces sur plusieurs pages numérotées au-delà de 16', async () => {
        const vingtPieces = Array.from({ length: 20 }, (_, index) =>
          unePiece(`Pièce ${index + 1}`)
        );
        const pptx = await genereSupport({ piecesDuDossier: vingtPieces });

        expect(await nombreDePagesDePieces(pptx)).toBe(2);
        expect(
          titreDeLaPage(await contenuSlide(pptx, POSITION_SLIDE_PIECES))
        ).toBe('Pièces du dossier transmises avant la séance 1/2');
        expect(
          titreDeLaPage(await contenuSlide(pptx, POSITION_SLIDE_PIECES + 1))
        ).toBe('Pièces du dossier transmises avant la séance 2/2');
      });

      it('commence la page suivante par les pièces restantes, puis la complète de lignes à remplir', async () => {
        const vingtPieces = Array.from({ length: 20 }, (_, index) =>
          unePiece(`Pièce ${index + 1}`)
        );
        const pptx = await genereSupport({ piecesDuDossier: vingtPieces });

        const deuxiemePage = await contenuSlide(
          pptx,
          POSITION_SLIDE_PIECES + 1
        );
        expect(ligne(deuxiemePage, 1, 'intitule')).toContain(
          '<a:t>Pièce 17</a:t>'
        );
        expect(ligne(deuxiemePage, 4, 'intitule')).toContain(
          '<a:t>Pièce 20</a:t>'
        );
        expect(deuxiemePage).toContain(
          'name="piece-5-a-completer-intitule-texte"'
        );
      });

      it('ajoute une page entièrement à compléter quand les pièces remplissent exactement leurs pages', async () => {
        const seizePieces = Array.from({ length: 16 }, (_, index) =>
          unePiece(`Pièce ${index + 1}`)
        );
        const pptx = await genereSupport({ piecesDuDossier: seizePieces });

        expect(await nombreDePagesDePieces(pptx)).toBe(2);
        expect(
          titreDeLaPage(await contenuSlide(pptx, POSITION_SLIDE_PIECES))
        ).toBe('Pièces du dossier transmises avant la séance 1/2');
        const pageVide = await contenuSlide(pptx, POSITION_SLIDE_PIECES + 1);
        expect(titreDeLaPage(pageVide)).toBe(
          'Pièces du dossier transmises avant la séance 2/2'
        );
        expect(pageVide).not.toContain('Prérempli par MonServiceSécurisé');
      });

      describe('pour une pièce dont l’intitulé peut être abrégé', () => {
        const PAS_D_UNE_LIGNE_DE_TEXTE = 257175;
        const pieceAbregeable = (intitule: string): PieceDuDossier => ({
          intitule,
          intituleAbrege: 'Avis écrits des collaborateurs',
          source: 'Utilisateur',
          cochee: false,
        });
        const ordonnee = (page: string, numero: number, partie: string) =>
          Number(
            ligne(page, numero, partie).match(/<a:off x="\d+" y="(\d+)"/)![1]
          );

        it('agrandit sa ligne et descend les lignes suivantes de la colonne quand son intitulé tient sur deux lignes', async () => {
          const pptx = await genereSupport({
            piecesDuDossier: [
              unePiece('Pièce 1'),
              unePiece('Pièce 2'),
              pieceAbregeable(
                'Avis écrits de Jean Dupond, Marie Martin et Paul Durand'
              ),
              unePiece('Pièce 4'),
            ],
          });

          const page = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
          expect(
            ordonnee(page, 3, 'separateur') - ordonnee(page, 11, 'separateur')
          ).toBe(PAS_D_UNE_LIGNE_DE_TEXTE);
          expect(ordonnee(page, 4, 'case') - ordonnee(page, 12, 'case')).toBe(
            PAS_D_UNE_LIGNE_DE_TEXTE
          );
        });

        it('écrit son intitulé abrégé, sur une seule ligne, quand l’intitulé complet dépasserait trois lignes', async () => {
          const pptx = await genereSupport({
            piecesDuDossier: [
              pieceAbregeable(
                'Avis écrits de Jean Dupond, Marie Martin, Paul Durand, Sophie Bernard, Lucas Petit, Emma Moreau, Hugo Laurent, Léa Fournier, Nathan Girard et Chloé Garnier'
              ),
              unePiece('Pièce 2'),
            ],
          });

          const page = await contenuSlide(pptx, POSITION_SLIDE_PIECES);
          expect(ligne(page, 1, 'intitule')).toContain(
            '<a:t>Avis écrits des collaborateurs</a:t>'
          );
          expect(ordonnee(page, 2, 'case')).toBe(ordonnee(page, 10, 'case'));
        });
      });

      it('utilise des lignes régulières sur toutes les pages', async () => {
        const vingtPieces = Array.from({ length: 20 }, (_, index) =>
          unePiece(`Pièce ${index + 1}`)
        );
        const pptx = await genereSupport({ piecesDuDossier: vingtPieces });

        const ordonneeDansLaPage = (page: string) => (numero: number) =>
          Number(
            ligne(page, numero, 'case').match(/<a:off x="\d+" y="(\d+)"/)![1]
          );
        const pages = [
          await contenuSlide(pptx, POSITION_SLIDE_PIECES),
          await contenuSlide(pptx, POSITION_SLIDE_PIECES + 1),
        ];
        pages.forEach((page) => {
          const ordonnee = ordonneeDansLaPage(page);
          expect(ordonnee(4) - ordonnee(3)).toBe(ordonnee(12) - ordonnee(11));
        });
      });
    });

    describe('sur le contexte', () => {
      const POSITION_SLIDE_CONTEXTE = 6;

      const formeDescription = (slide: string) =>
        slide.match(
          /name="contexte-description"(?:(?!<\/p:sp>).)*<\/p:sp>/s
        )![0];

      const taillesDePolice = (forme: string) => [
        ...new Set(
          [...forme.matchAll(/<a:rPr [^>]*sz="(\d+)"/g)].map(([, sz]) => sz)
        ),
      ];

      const descriptionDe = (nombreDeMots: number) =>
        Array.from({ length: nombreDeMots }, () => 'description').join(' ');

      it('remplace le placeholder par la description du système d’information', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            description: 'Un portail de démarches en ligne',
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('Portail RH permettant');
        expect(contexte).toContain(
          '<a:t>Un portail de démarches en ligne</a:t>'
        );
      });

      it('réduit la police de la description à 16 pt quand elle dépasse deux lignes à 21 pt', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, description: descriptionDe(20) },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(taillesDePolice(formeDescription(contexte))).toEqual(['1600']);
      });

      it('réduit la police de la description à 14 pt quand elle dépasse trois lignes à 16 pt', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, description: descriptionDe(35) },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(taillesDePolice(formeDescription(contexte))).toEqual(['1400']);
      });

      it('compte chaque saut de ligne de la description comme une nouvelle ligne', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            description: 'Premier paragraphe\n\nSecond paragraphe',
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(taillesDePolice(formeDescription(contexte))).toEqual(['1600']);
      });

      it('coupe la description par « … » quand elle dépasse quatre lignes à 14 pt', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, description: descriptionDe(60) },
        });

        const description = formeDescription(
          await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE)
        );
        const [, texte] = description.match(/<a:t>([^<]*)<\/a:t>/)!;
        expect(texte).toBe(`${descriptionDe(40)}…`);
        expect(taillesDePolice(description)).toEqual(['1400']);
      });

      it('coupe aussi la description aux sauts de ligne quand elle dépasse quatre lignes à 14 pt', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            description: 'Premier paragraphe\n\n\n\nDernier paragraphe',
          },
        });

        const description = formeDescription(
          await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE)
        );
        expect(description).toContain('<a:t>Premier paragraphe…</a:t>');
        expect(description).not.toContain('Dernier paragraphe');
      });

      it('écrit chaque ligne de la description dans son propre paragraphe', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            description: 'Premier paragraphe\n\nSecond paragraphe',
          },
        });

        const description = formeDescription(
          await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE)
        );
        const paragraphes = [...description.matchAll(/<a:p>.*?<\/a:p>/gs)].map(
          ([paragraphe]) =>
            [...paragraphe.matchAll(/<a:t>([^<]*)<\/a:t>/g)]
              .map(([, texte]) => texte)
              .join('')
        );
        expect(paragraphes).toEqual([
          'Premier paragraphe',
          '',
          'Second paragraphe',
        ]);
      });

      it('écrit l’organisation responsable', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            organisation: 'Commune de Saint-Ours (987 654 321 00020)',
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('Commune de Villeneuve');
        expect(contexte).toContain(
          '<a:t>Commune de Saint-Ours (987 654 321 00020)</a:t>'
        );
      });

      it('écrit le statut de déploiement', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, statut: 'En conception' },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('En production');
        expect(contexte).toContain('<a:t>En conception</a:t>');
      });

      it('écrit les URL du projet', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, urls: 'https://rh.exemple.fr' },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('https://rh.villeneuve.fr');
        expect(contexte).toContain('<a:t>https://rh.exemple.fr</a:t>');
      });

      it('écrit le type de projet', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            typeDeProjet: 'Application mobile',
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('Service en ligne, Portail');
        expect(contexte).toContain('<a:t>Application mobile</a:t>');
      });

      it('écrit l’hébergement', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, hebergement: 'Autre' },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('Le système est entièrement fourni');
        expect(contexte).toContain('<a:t>Autre</a:t>');
      });

      it('écrit la localisation des données stockées', async () => {
        const pptx = await genereSupport({
          contexte: {
            ...contexteParDefaut,
            donneesStockees:
              "En partie ou totalement hors de l'Union européenne",
          },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('Au sein de l’Union européenne');
        expect(contexte).toContain(
          "<a:t>En partie ou totalement hors de l'Union européenne</a:t>"
        );
      });

      it('écrit les sécurisations prévues', async () => {
        const pptx = await genereSupport({
          contexte: { ...contexteParDefaut, securisations: 'Un annuaire' },
        });

        const contexte = await contenuSlide(pptx, POSITION_SLIDE_CONTEXTE);
        expect(contexte).not.toContain('Des postes de travail');
        expect(contexte).toContain('<a:t>Un annuaire</a:t>');
      });
    });

    describe('sur les objectifs de sécurité', () => {
      const POSITION_SLIDE_BESOINS_DE_SECURITE = 9;
      const BAS_DE_L_ENCART_ANSSI = 6295579 + 1828577;
      const DESCENTE_SANS_ENCART = BAS_DE_L_ENCART_ANSSI - (5251772 + 929506);

      it('écrit le niveau de besoin de sécurité', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            niveau: 'Modérés',
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(texteDeLaForme(besoins, 'besoins-niveau')).toBe('Modérés');
      });

      it('illustre le niveau avec l’illustration de MonServiceSécurisé', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            idNiveau: 'niveau2',
          },
        });

        const illustration = await imageDeLaForme(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE,
          'besoins-illustration'
        );
        expect(
          illustration.equals(
            await readFile(
              'src/vuesPowerpoint/illustrationsNiveaux/niveau2.png'
            )
          )
        ).toBe(true);
      });

      it('écrit le résumé du niveau', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            resume: 'Les besoins de sécurité sont modérés.',
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(texteDeLaForme(besoins, 'besoins-resume')).toBe(
          'Les besoins de sécurité sont modérés.'
        );
      });

      it('écrit la démarche indicative adaptée, en majuscules', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            demarche: 'intermédiaire',
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(texteDeLaForme(besoins, 'besoins-demarche')).toBe(
          'DÉMARCHE INDICATIVE ADAPTÉE : INTERMÉDIAIRE'
        );
      });

      it('écrit le nom du service et le niveau dans l’explication par le projet', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            nomService: 'Portail des démarches',
            niveau: 'Modérés',
          },
        });

        const explication = texteDeLaForme(
          await contenuSlide(pptx, POSITION_SLIDE_BESOINS_DE_SECURITE),
          'besoins-explication'
        );
        expect(explication).toContain(
          'Dans le cadre du projet Portail des démarches, le système'
        );
        expect(explication).toContain(
          'MonServiceSécurisé, soit Modérés, apparaît'
        );
      });

      it('écrit l’exposition du service', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            exposition: {
              ouverture: 'Accessible depuis internet',
              audience: 'Large : Utilisé à l’échelle nationale.',
              dureeDysfonctionnement: 'Moins de 4h',
            },
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(texteDeLaForme(besoins, 'exposition-ouverture')).toBe(
          'Accessible depuis internet'
        );
        expect(texteDeLaForme(besoins, 'exposition-audience')).toBe(
          'Large : Utilisé à l’échelle nationale.'
        );
        expect(texteDeLaForme(besoins, 'exposition-duree')).toBe('Moins de 4h');
      });

      it('agrandit l’ouverture et descend l’audience et la durée d’une ligne quand l’ouverture dépasse une ligne', async () => {
        const avecOuverture = async (ouverture: string) =>
          contenuSlide(
            await genereSupport({
              besoinsDeSecurite: {
                ...besoinsDeSecuriteParDefaut,
                exposition: {
                  ...besoinsDeSecuriteParDefaut.exposition,
                  ouverture,
                },
              },
            }),
            POSITION_SLIDE_BESOINS_DE_SECURITE
          );
        const courte = await avecOuverture(
          'Interne et ouvert à certains tiers'
        );
        const longue = await avecOuverture(
          "Accessible à très peu de personnes en interne de l'organisation"
        );

        const HAUTEUR_D_UNE_LIGNE = 308595;
        expect(cadreDeLaForme(longue, 'exposition-ouverture').hauteur).toBe(
          cadreDeLaForme(courte, 'exposition-ouverture').hauteur +
            HAUTEUR_D_UNE_LIGNE
        );
        [
          'exposition-audience-libelle',
          'exposition-audience',
          'exposition-duree-libelle',
          'exposition-duree',
        ].forEach((forme) =>
          expect(cadreDeLaForme(longue, forme).y).toBe(
            cadreDeLaForme(courte, forme).y + HAUTEUR_D_UNE_LIGNE
          )
        );
      });

      it('écrit une pastille par donnée identifiée, à la place de la pastille modèle', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            donneesIdentifiees: [
              'Documents RH sensibles',
              'Plannings des agents',
            ],
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(texteDeLaForme(besoins, 'donnee-identifiee-1')).toBe(
          'Documents RH sensibles'
        );
        expect(texteDeLaForme(besoins, 'donnee-identifiee-2')).toBe(
          'Plannings des agents'
        );
        expect(besoins).not.toContain('name="donnee-identifiee-3"');
        expect(besoins).not.toContain('name="donnee-identifiee"');
      });

      describe('pour les pastilles des données identifiées', () => {
        const ECART_ENTRE_PASTILLES = 114300;

        const BAS_DE_LA_ZONE_DES_PASTILLES = 6030739 + 3303761 - 228600;

        const slideAvecLesDonnees = async (donneesIdentifiees: string[]) =>
          contenuSlide(
            await genereSupport({
              besoinsDeSecurite: {
                ...besoinsDeSecuriteParDefaut,
                donneesIdentifiees,
              },
            }),
            POSITION_SLIDE_BESOINS_DE_SECURITE
          );

        const nomsDesPastilles = (besoins: string) =>
          [...besoins.matchAll(/name="(donnee-identifiee-\d+)"/g)].map(
            ([, nom]) => nom
          );

        const pastillesDe = async (donneesIdentifiees: string[]) => {
          const besoins = await slideAvecLesDonnees(donneesIdentifiees);
          return nomsDesPastilles(besoins).map((nom) =>
            cadreDeLaForme(besoins, nom)
          );
        };

        const taillesDePoliceDesPastilles = (besoins: string) => [
          ...new Set(
            nomsDesPastilles(besoins).flatMap((nom) =>
              [
                ...besoins
                  .match(
                    new RegExp(`name="${nom}"(?:(?!</p:sp>).)*</p:sp>`, 's')
                  )![0]
                  .matchAll(/<a:rPr [^>]*sz="(\d+)"/g),
              ].map(([, sz]) => sz)
            )
          ),
        ];

        const basDesPastilles = (pastilles: { y: number; hauteur: number }[]) =>
          Math.max(...pastilles.map(({ y, hauteur }) => y + hauteur));

        const cinqDonnees = [
          'Données d’identité',
          'Documents RH sensibles',
          'Données relatives à la situation familiale, économique et financière',
          'Données techniques',
          'Plannings des agents',
        ];

        it('gardent la police de 18 pt quand elles tiennent dans la carte', async () => {
          const besoins = await slideAvecLesDonnees(['Données techniques']);

          expect(taillesDePoliceDesPastilles(besoins)).toEqual(['1800']);
        });

        it('réduisent leur police pour tenir dans la carte quand elles débordent en 18 pt', async () => {
          const besoins = await slideAvecLesDonnees([
            'Données techniques',
            'Documents RH sensibles',
            'Données d’identité',
            'Plannings des agents',
            'Données sensibles',
          ]);
          const pastilles = nomsDesPastilles(besoins).map((nom) =>
            cadreDeLaForme(besoins, nom)
          );

          const [taille] = taillesDePoliceDesPastilles(besoins);
          expect(taillesDePoliceDesPastilles(besoins)).toHaveLength(1);
          expect(Number(taille)).toBeLessThan(1800);
          expect(basDesPastilles(pastilles)).toBeLessThanOrEqual(
            BAS_DE_LA_ZONE_DES_PASTILLES
          );
        });

        it('remplacent les dernières par « et N autres » quand elles débordent même en 14 pt', async () => {
          const besoins = await slideAvecLesDonnees([
            ...cinqDonnees,
            'Agendas des élus',
            'Comptes rendus de réunion',
          ]);
          const noms = nomsDesPastilles(besoins);
          const pastilles = noms.map((nom) => cadreDeLaForme(besoins, nom));

          expect(texteDeLaForme(besoins, noms[noms.length - 1])).toBe(
            `et ${7 - (noms.length - 1)} autres`
          );
          expect(noms.length).toBeLessThan(7);
          expect(basDesPastilles(pastilles)).toBeLessThanOrEqual(
            BAS_DE_LA_ZONE_DES_PASTILLES
          );
        });

        it('écrit « et 1 autre » au singulier', async () => {
          const besoins = await slideAvecLesDonnees(cinqDonnees);
          const noms = nomsDesPastilles(besoins);

          expect(noms).toHaveLength(5);
          expect(texteDeLaForme(besoins, noms[4])).toBe('et 1 autre');
        });

        it('les place côte à côte tant qu’elles tiennent sur la ligne', async () => {
          const [premiere, seconde] = await pastillesDe([
            'Données techniques',
            'Agendas',
          ]);

          expect(seconde.y).toBe(premiere.y);
          expect(seconde.x).toBe(
            premiere.x + premiere.largeur + ECART_ENTRE_PASTILLES
          );
        });

        it('adaptent leur largeur à leur texte', async () => {
          const [courte] = await pastillesDe(['Données techniques']);
          const [longue] = await pastillesDe([
            'Données administratives et financières',
          ]);

          expect(longue.largeur).toBeGreaterThan(courte.largeur);
        });

        it('sont assez larges pour que leur texte tienne sur une ligne, au gras italique de 18 pt', async () => {
          const LARGEUR_DE_DOCUMENTS_RH_SENSIBLES_AU_RENDU = 3048819;
          const [pastille] = await pastillesDe(['Documents RH sensibles']);

          expect(pastille.largeur).toBeGreaterThanOrEqual(
            LARGEUR_DE_DOCUMENTS_RH_SENSIBLES_AU_RENDU
          );
        });

        it('passent à la ligne quand la pastille ne tient plus sur la ligne', async () => {
          const [premiere, , troisieme] = await pastillesDe([
            'Données techniques',
            'Agendas',
            'Documents RH sensibles',
          ]);

          expect(troisieme.x).toBe(premiere.x);
          expect(troisieme.y).toBe(
            premiere.y + premiere.hauteur + ECART_ENTRE_PASTILLES
          );
        });

        it('prennent toute la largeur et passent sur deux lignes quand leur texte dépasse une ligne', async () => {
          const [courte] = await pastillesDe(['Données techniques']);
          const [longue, suivante] = await pastillesDe([
            'Données relatives à la situation familiale, économique et financière',
            'Données techniques',
          ]);

          expect(longue.largeur).toBe(4381500);
          expect(longue.hauteur).toBe(784771);
          expect(suivante.y).toBe(
            longue.y + longue.hauteur + ECART_ENTRE_PASTILLES
          );
          expect(courte.hauteur).toBe(487635);
        });
      });

      it('nomme, dans l’encart, le niveau identifié à titre indicatif par l’ANSSI', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            niveauIndicatifAnssi: 'Basiques',
            depasseRecommandation: true,
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(texteDeLaForme(besoins, 'besoins-anssi-titre')).toBe(
          'Ce niveau est supérieur à celui identifié à titre indicatif par l’ANSSI (Basiques).'
        );
      });

      it('retire l’encart quand le niveau choisi n’est pas supérieur à celui identifié par l’ANSSI', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            depasseRecommandation: false,
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        expect(besoins).not.toContain('name="besoins-anssi-');
      });

      it('descend le niveau et son résumé à la place de l’encart quand le niveau choisi est celui recommandé', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            depasseRecommandation: false,
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        const resume = cadreDeLaForme(besoins, 'besoins-resume');
        expect(resume.y + resume.hauteur).toBe(BAS_DE_L_ENCART_ANSSI);
        expect(cadreDeLaForme(besoins, 'besoins-niveau').y).toBe(
          4661222 + DESCENTE_SANS_ENCART
        );
      });

      it('agrandit l’illustration jusqu’au niveau, en gardant ses proportions et son axe, quand le niveau choisi est celui recommandé', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            depasseRecommandation: false,
          },
        });

        const besoins = await contenuSlide(
          pptx,
          POSITION_SLIDE_BESOINS_DE_SECURITE
        );
        const illustration = cadreDeLaForme(besoins, 'besoins-illustration');
        const niveau = cadreDeLaForme(besoins, 'besoins-niveau');
        expect(illustration.y).toBe(2918147);
        expect(niveau.y - (illustration.y + illustration.hauteur)).toBe(114300);
        expect(illustration.largeur).toBe(illustration.hauteur);
        expect(illustration.x + illustration.largeur / 2).toBeCloseTo(
          3028950 + 1714500 / 2,
          -1
        );
      });
    });

    it('écrit la date de création au format court, après son libellé', async () => {
      const pptx = await genereSupport();

      const couverture = await contenuSlide(pptx, 1);
      expect(couverture).toContain('<a:t>Date de création : </a:t>');
      expect(couverture).toContain('<a:t>09/11/2026</a:t>');
    });

    describe('produit un fichier que PowerPoint ouvre sans le réparer', () => {
      it('ne déclare chaque partie du fichier qu’une seule fois', async () => {
        const pptx = await genereSupport();

        const parties = await partiesDeclarees(pptx);
        const doublons = parties.filter(
          (partie, index) => parties.indexOf(partie) !== index
        );
        expect(doublons).toEqual([]);
      });

      it('ne contient aucune relation vers une partie absente du fichier', async () => {
        const pptx = await genereSupport();

        expect(await relationsCassees(pptx)).toEqual([]);
      });

      it('ne déclare aucune partie absente du fichier', async () => {
        const pptx = await genereSupport();

        expect(await partiesDeclareesAbsentes(pptx)).toEqual([]);
      });

      it('compresse les fichiers de l’archive', async () => {
        const pptx = await genereSupport();

        expect(fichiersNonCompresses(pptx)).toEqual([]);
      });

      it('donne un identifiant unique à chaque forme d’une slide', async () => {
        const pptx = await genereSupport({
          besoinsDeSecurite: {
            ...besoinsDeSecuriteParDefaut,
            donneesIdentifiees: [
              'Documents RH sensibles',
              'Plannings des agents',
            ],
          },
        });

        expect(await identifiantsDeFormesEnDouble(pptx)).toEqual([]);
      });
    });
  });
});
