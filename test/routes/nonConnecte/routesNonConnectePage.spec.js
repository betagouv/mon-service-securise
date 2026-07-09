import expect from 'expect.js';
import { ErreurArticleCrispIntrouvable } from '@lab-anssi/lib';
import testeurMSS from '../testeurMSS.js';
import { donneesPartagees } from '../../aides/http.js';
import { ErreurJWTInvalide, ErreurJWTManquant } from '../../../src/erreurs.js';

describe('Le serveur MSS des pages pour un utilisateur "Non connecté"', () => {
  const testeur = testeurMSS();

  beforeEach(() => testeur.initialise());

  [
    '/',
    '/aPropos',
    '/securite',
    '/accessibilite',
    '/cgu',
    '/confidentialite',
    '/mentionsLegales',
    '/inscription',
    '/creation-compte?token=unToken',
    '/connexion',
    '/devenir-ambassadeurrice-monservicesecurise',
    '/faire-connaitre-et-recommander-monservicesecurise',
    '/co-construire-monservicesecurise',
    '/conseils-cyber',
    '/doctrine-homologation-anssi',
    '/industrialisez-vos-homologations',
    '/securisez-votre-service-numerique',
  ].forEach((route) => {
    beforeEach(() => {
      testeur.adaptateurJWT().decode = () => ({});
    });

    it(`sert le contenu HTML de la page ${route}`, async () => {
      const reponse = await testeur.get(`${route}`);

      expect(reponse.status).to.equal(200);
      expect(reponse.headers['content-type']).to.contain('text/html');
    });

    it(`charge l'utilisateur connecte (pour afficher le header en mode connecté) sur la page ${route}`, async () => {
      await testeur
        .middleware()
        .verifieRequeteChargeUtilisateurConnecte(testeur.app(), route);
    });
  });

  describe('concernant les données structurées (JSON-LD)', () => {
    it("expose le socle WebSite et GovernmentOrganization sur la page d'accueil", async () => {
      const reponse = await testeur.get('/');

      expect(reponse.text).to.contain('application/ld+json');
      expect(reponse.text).to.contain('"@type": "WebSite"');
      expect(reponse.text).to.contain('"@type": "GovernmentOrganization"');
      expect(reponse.text).to.contain('ANSSI');
    });

    it("n'expose pas le socle sur la page 404", async () => {
      const reponse = await testeur.get('/une-page-qui-nexiste-pas');

      expect(reponse.status).to.equal(404);
      expect(reponse.text).not.to.contain('GovernmentOrganization');
    });

    it('expose un BreadcrumbList sur les pages de documentation', async () => {
      const reponse = await testeur.get('/aPropos');

      expect(reponse.text).to.contain('"@type": "BreadcrumbList"');
    });

    it('expose un BreadcrumbList sur la page conseils cyber', async () => {
      const reponse = await testeur.get('/conseils-cyber');

      expect(reponse.text).to.contain('"@type": "BreadcrumbList"');
    });

    it('déclare une balise canonical sur la page', async () => {
      const reponse = await testeur.get('/aPropos');

      expect(reponse.text).to.contain('rel="canonical"');
    });

    it("ne déclare qu'une seule balise title", async () => {
      const reponse = await testeur.get('/aPropos');

      const nombreDeTitles = reponse.text.split('<title').length - 1;
      expect(nombreDeTitles).to.equal(1);
    });

    it('place le title à l’intérieur du <head>', async () => {
      const reponse = await testeur.get('/aPropos');

      expect(reponse.text.indexOf('<title')).to.be.lessThan(
        reponse.text.indexOf('</head>')
      );
    });

    it('tronque une méta-description trop longue', async () => {
      const reponse = await testeur.get('/mentionsLegales');

      expect(reponse.text).to.contain('…');
      expect(reponse.text).not.to.contain(
        'Protégez-vous en toute transparence'
      );
    });
  });

  describe('quand requête GET sur `/articles/:slug`', () => {
    it('utilise le CMS Crisp pour récupérer un article de blog', async () => {
      let slugRecu;
      testeur.cmsCrisp().recupereArticleBlog = async (slug) => {
        slugRecu = slug;
        return {
          contenuMarkdown: 'Un contenu',
          titre: 'Un titre',
          description: 'Une description',
          tableDesMatieres: [],
          section: {
            id: 'IdSection',
            nom: 'Une section',
          },
        };
      };

      await testeur.get(`/articles/un-slug-generique`);

      expect(slugRecu).to.be('un-slug-generique');
    });

    it('sert le contenu HTML de la page', async () => {
      testeur.cmsCrisp().recupereArticleBlog = async () => ({
        contenuMarkdown: 'Un contenu',
        titre: 'Un titre',
        description: 'Une description',
        tableDesMatieres: [],
        section: {
          id: 'IdSection',
          nom: 'Une section',
        },
      });

      const reponse = await testeur.get(`/articles/un-slug-generique`);

      expect(reponse.status).to.be(200);
      expect(reponse.headers['content-type']).to.contain('text/html');
      expect(reponse.text).to.contain('Un titre');
    });

    it('expose un BreadcrumbList décrivant le fil d’Ariane de l’article', async () => {
      testeur.cmsCrisp().recupereArticleBlog = async () => ({
        contenuMarkdown: 'Un contenu',
        titre: 'Un titre',
        description: 'Une description',
        tableDesMatieres: [],
        section: { id: 'IdSection', nom: 'Une section' },
      });

      const reponse = await testeur.get(`/articles/un-slug-generique`);

      expect(reponse.text).to.contain('"@type": "BreadcrumbList"');
      expect(reponse.text).to.contain('"name": "Un titre"');
    });

    it('expose un schéma Article décrivant le contenu éditorial', async () => {
      testeur.cmsCrisp().recupereArticleBlog = async () => ({
        contenuMarkdown: 'Un contenu',
        titre: 'Un titre',
        description: 'Une description',
        tableDesMatieres: [],
        section: { id: 'IdSection', nom: 'Une section' },
      });

      const reponse = await testeur.get(`/articles/un-slug-generique`);

      expect(reponse.text).to.contain('"@type": "Article"');
      expect(reponse.text).to.contain('"headline": "Un titre"');
      expect(reponse.text).to.contain('"author"');
    });

    it("retire les emojis en tête du <title> de l'article", async () => {
      testeur.cmsCrisp().recupereArticleBlog = async () => ({
        contenu: 'Un contenu',
        titre: '📝 Un titre',
        description: 'Une description',
        tableDesMatieres: [],
        section: { id: 'IdSection', nom: 'Une section' },
      });

      const reponse = await testeur.get(`/articles/un-slug-generique`);

      expect(reponse.text).to.contain(
        '<title>Un titre | MonServiceSécurisé</title>'
      );
      expect(reponse.text).not.to.contain('📝 Un titre |');
    });

    it('renseigne les dates de publication et de mise à jour dans le schéma Article', async () => {
      testeur.cmsCrisp().recupereArticleBlog = async () => ({
        contenu: 'Un contenu',
        titre: 'Un titre',
        description: 'Une description',
        tableDesMatieres: [],
        section: { id: 'IdSection', nom: 'Une section' },
        datePublication: '2024-01-01T00:00:00.000Z',
        dateMiseAJour: '2024-02-01T00:00:00.000Z',
      });

      const reponse = await testeur.get(`/articles/un-slug-generique`);

      expect(reponse.text).to.contain(
        '"datePublished": "2024-01-01T00:00:00.000Z"'
      );
      expect(reponse.text).to.contain(
        '"dateModified": "2024-02-01T00:00:00.000Z"'
      );
    });

    it("renvoie une erreur 404 si l'article n'existe pas", async () => {
      testeur.cmsCrisp().recupereArticleBlog = async () => {
        throw new ErreurArticleCrispIntrouvable();
      };
      await testeur.verifieRequeteGenereErreurHTTP(
        404,
        `Article Crisp inconnu`,
        `/articles/un-slug-inexistant`
      );
    });
  });

  describe('quand requête GET sur `/sitemap.xml`', () => {
    it('sert le contenu XML du fichier', async () => {
      const reponse = await testeur.get('/sitemap.xml');

      expect(reponse.status).to.equal(200);
      expect(reponse.headers['content-type']).to.contain('application/xml');
    });
  });

  describe('quand requête GET sur `/robots.txt`', () => {
    it('sert le contenu du fichier', async () => {
      const reponse = await testeur.get('/robots.txt');

      expect(reponse.status).to.equal(200);
      expect(reponse.headers['content-type']).to.contain('text/plain');
    });

    it('autorise explicitement les principaux robots des IA', async () => {
      const reponse = await testeur.get('/robots.txt');

      expect(reponse.text).to.contain('GPTBot');
      expect(reponse.text).to.contain('ClaudeBot');
      expect(reponse.text).to.contain('PerplexityBot');
      expect(reponse.text).to.contain('Google-Extended');
    });
  });

  describe('quand requête GET sur `/llms.txt`', () => {
    it('sert un contenu Markdown décrivant le service', async () => {
      const reponse = await testeur.get('/llms.txt');

      expect(reponse.status).to.equal(200);
      expect(reponse.headers['content-type']).to.contain('text/markdown');
      expect(reponse.text).to.contain('# MonServiceSécurisé');
    });
  });

  describe('quand requete GET sur `/creation-compte`', () => {
    beforeEach(() => {
      testeur.adaptateurJWT().decode = () => ({});
    });

    it('retourne une erreur 400 si la signature du token est invalide', async () => {
      testeur.adaptateurJWT().decode = () => {
        throw new ErreurJWTInvalide();
      };

      const reponse = await testeur.get(`/creation-compte?token=unFauxToken`);
      expect(reponse.status).to.be(400);
    });

    it('retourne une erreur 400 si le token est vide', async () => {
      testeur.adaptateurJWT().decode = () => {
        throw new ErreurJWTManquant();
      };

      const reponse = await testeur.get('/creation-compte?token=');
      expect(reponse.status).to.be(400);
    });

    it('envoie les départements', async () => {
      testeur.referentiel().departements = () => [{ nom: 'Gironde' }];

      const reponse = await testeur.get(`/creation-compte?token=unTokenValide`);

      expect(donneesPartagees(reponse.text, 'departements')).to.eql({
        departements: [{ nom: 'Gironde' }],
      });
    });

    it("ajoute les informations provenant du token pour que l'utilisateur voie des infos pré-remplies à l'écran", async () => {
      testeur.adaptateurJWT().decode = () => ({
        email: 'jeand@beta.fr',
        nom: 'Dujardin',
        prenom: 'Jean',
        organisation: {
          siret: '1234',
          departement: '75',
          nom: 'BLEU',
        },
        telephone: '0607080910',
        domainesSpecialite: ['RSSI', 'DEV'],
      });

      const reponse = await testeur.get(`/creation-compte?token=unTokenValide`);

      expect(
        donneesPartagees(reponse.text, 'informations-professionnelles')
      ).to.eql({
        informationsProfessionnelles: {
          email: 'jeand@beta.fr',
          nom: 'Dujardin',
          prenom: 'Jean',
          organisation: {
            siret: '1234',
            departement: '75',
            nom: 'BLEU',
          },
          telephone: '0607080910',
          domainesSpecialite: ['RSSI', 'DEV'],
        },
      });
    });

    it('envoie le token', async () => {
      const reponse = await testeur.get(`/creation-compte?token=unTokenValide`);

      expect(donneesPartagees(reponse.text, 'token')).to.eql({
        token: 'unTokenValide',
      });
    });
  });

  describe('quand requête GET sur `/inscription`', () => {
    it("déconnecte l'utilisateur courant", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(testeur.app(), '/inscription');
    });
  });

  describe('quand requête GET sur `/connexion`', () => {
    it("déconnecte l'utilisateur courant", async () => {
      await testeur
        .middleware()
        .verifieRequeteExigeSuppressionCookie(testeur.app(), '/connexion');
    });

    it('ajoute la redirection', async () => {
      const reponse = await testeur.get(
        '/connexion?urlRedirection=/redirige-vers'
      );

      expect(donneesPartagees(reponse.text, 'url-redirection')).to.eql({
        urlRedirection: 'http://localhost:1234/redirige-vers',
      });
    });

    it("n'ajoute pas la redirection si l'url n'est pas valide", async () => {
      const reponse = await testeur.get(
        '/connexion?urlRedirection=uri-invalide'
      );

      expect(donneesPartagees(reponse.text, 'url-redirection')).to.eql({});
    });
  });

  describe('quand requete GET sur `/statistiques`', () => {
    it("utilise l'adaptateur de statistiques pour récupérer les données", async () => {
      let adaptateurAppele = false;
      testeur.adaptateurStatistiques().recupereStatistiques = async () => {
        adaptateurAppele = true;
        return {
          utilisateurs: { nombre: 0, progression: 0 },
          services: { nombre: 0, progression: 0 },
          vulnerabilites: { nombre: 0, progression: 0 },
          indiceCyber: { nombre: 0, progression: 0 },
        };
      };

      const reponse = await testeur.get('/statistiques');

      expect(reponse.status).to.be(200);
      expect(adaptateurAppele).to.be(true);
    });
  });

  describe('quand requete GET sur `/cgu`', () => {
    it("affiche la demande d'acceptation si l'utilisateur connecté n'a pas accepté les CGU", async () => {
      testeur.serviceGestionnaireSession().cguAcceptees = () => false;

      const reponse = await testeur.get('/cgu');

      expect(reponse.text).to.contain('class="demande-acceptation"');
    });

    it("n'affiche pas la demande d'acceptation si l'utilisateur connecté a accepté les CGU", async () => {
      testeur.serviceGestionnaireSession().cguAcceptees = () => true;

      const reponse = await testeur.get('/cgu');

      expect(reponse.text).not.to.contain('class="demande-acceptation"');
    });
  });
});
