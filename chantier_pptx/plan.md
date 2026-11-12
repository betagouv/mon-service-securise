# Chantier : support de commission d'homologation (pptx)

Générer à la demande, pour un service, un support de commission d'homologation au format pptx, prérempli avec les données MonServiceSécurisé, à partir du template réalisé par le designer (`Support_de_commission.pptx`, 30 slides).

Point de départ : le POC de Thibaud (7 octobre 2026, non commité), décrit dans le document « Reprise du chantier PowerPoint ».

## Décisions

| Sujet                                      | Décision                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prérempli / à compléter                    | Règle de la légende des slides : **italique = prérempli par MSS** ; **souligné orange = laissé tel quel**, à compléter par le projet après téléchargement. On ne remplit jamais un texte souligné orange. Dans le XML : prérempli = `i="1"` ; à compléter = texte `B34000` surligné `FFF4E5`, ou formes « fond `FFF4E5` + trait `FFB05C` » (couverture). |
| Livraison                                  | **Derrière un feature flag** `FEATURE_FLAG_AVEC_SUPPORT_COMMISSION_PPTX` (même motif que `avecRisquesV2` dans `adaptateurEnvironnement.js`, déclaré dans `.env.template`). Flag désactivé : la route répond 404 et le bouton n'est pas affiché. On peut ainsi livrer chaque PR en production.                                                            |
| Services concernés                         | **V2 uniquement.** La route refuse les services V1. Elle refuse aussi les services **sans dossier courant** (422 `AUCUN_DOSSIER_COURANT`) : le tiroir ne propose pas le téléchargement dans ce cas.                                                                                                                                                      |
| Annexe des mesures (slides 27–30)          | **Conservée**, paginée (environ 7 mesures par slide, slide dupliquée si besoin).                                                                                                                                                                                                                                                                         |
| Exigences restantes (slide 20)             | Uniquement les mesures **partielles** et **à lancer**.                                                                                                                                                                                                                                                                                                   |
| Porteurs (slide 20)                        | `partieResponsable` du moteur de règles V2 (`Projet` / `Presta` / `Mixte`), libellé équivalent à `svelte/lib/tableauDesMesures/ligne/mapPartieResponsable.ts`. Une transcription existe déjà dans `src/adaptateurs/adaptateurCsv.js` (export CSV). Pas de nom d'utilisateur.                                                                             |
| Avis (slide 24)                            | Champ « Collaborateurs métier et techniques renseignant l'avis » de l'homologation (`avis.collaborateurs`, déjà des chaînes).                                                                                                                                                                                                                            |
| Format de date                             | Court (`14/10/2026`), via `dateEnFrancais` du projet.                                                                                                                                                                                                                                                                                                    |
| Pastilles colorées (slides 12, 14, 15, 20) | **Couleur vraiment dynamique**, calculée selon la donnée.                                                                                                                                                                                                                                                                                                |
| Couleur des pastilles de risque            | Celle des blocs de la matrice (voir plus bas).                                                                                                                                                                                                                                                                                                           |
| Barres (slide 19)                          | Largeur dynamique en XML (`setPosition`), validée par le spike.                                                                                                                                                                                                                                                                                          |
| Matrices de risques                        | Formes éditables du template, libellé de chaque case rempli à la génération. Plus d'image Typst pour les matrices.                                                                                                                                                                                                                                       |
| Lib                                        | **pptx-automizer** (MIT), à la place de docxtemplater. Voir la section « Spike ».                                                                                                                                                                                                                                                                        |

### Couleurs relevées dans le template

Niveaux de risque (cases de la matrice et pastilles `R1`, `R3`…) :

| Niveau                          | Couleur   |
| ------------------------------- | --------- |
| Faible : acceptable en l'état   | `#84C14E` |
| Moyen : tolérable sous contrôle | `#FAC63C` |
| Élevé : inacceptable            | `#F8785B` |

Statuts de mesure : on reprend **les couleurs déjà utilisées dans MSS**, définies dans `svelte/lib/ui/TagStatutMesure.svelte`. Elles priment sur celles du template, qui diffèrent légèrement (fond de Partielle, texte de Non prise en compte).

| Statut              | Clé MSS        | Texte     | Fond      |
| ------------------- | -------------- | --------- | --------- |
| Faite               | `fait`         | `#0C8626` | `#D4F4DB` |
| Partielle           | `enCours`      | `#0079D0` | `#DBEEFF` |
| Non prise en compte | `nonFait`      | `#FAA72C` | `#FFF2DE` |
| À lancer            | `aLancer`      | `#7025DA` | `#E9DDFF` |
| Statut à définir    | (aucun statut) | `#667892` | `#F1F5F9` |

## Analyse du template du designer

- **Il a été généré à partir de HTML.** Chaque élément est une forme positionnée en absolu (`Text 1`, `Text 2`…, jusqu'à 106 formes par slide), sans tableau natif ni groupe. Les images sont nommées `Image 0` (`descr="preencoded.png"`).
- **Conséquence** : les boucles docxtemplater (`{#items}…{/items}`) ne savent dupliquer que des paragraphes dans une forme, ou des lignes de tableau natif. Elles ne peuvent pas dupliquer une « ligne » faite de plusieurs formes indépendantes.
- Les bulles « Prérempli par MonServiceSécurisé » et « À compléter par le projet » sont statiques : elles restent telles quelles.

### Slides préremplies

| Slides                                                                 | Contenu                                                                                                                                                                                                                                  | Difficulté                                               |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1                                                                      | Date de création (le nom du périmètre reste à compléter)                                                                                                                                                                                 | Texte                                                    |
| 3 (remplacée en V4 par les slides 30, 32 et 31 du template, voir PR 2) | Autorité d'homologation de l'étape 1 du dossier courant (« Prénom Nom, fonction » ; style à compléter si non renseignée). Pièces du dossier : lignes fixes, ligne « Avis écrits de … » générée à partir des avis, documents de l'étape 3 | Texte + liste                                            |
| 5                                                                      | Contexte : description, organisation, statut, URL, type, hébergement, localisation des données, sécurisations                                                                                                                            | Texte                                                    |
| 8                                                                      | Besoins de sécurité, alerte « supérieur à l'ANSSI », nom du service et niveau dans l'explication (« nature des services » et « type de données » restent à compléter), exposition, données identifiées                                   | Texte + condition + illustration selon le niveau + liste |
| 12, 14, 15                                                             | Matrices brute / à date / résiduelle cible + liste des risques                                                                                                                                                                           | Balise par case + liste + pastilles colorées             |
| 13                                                                     | Description des risques                                                                                                                                                                                                                  | Liste                                                    |
| 18                                                                     | Indice cyber ANSSI et personnalisé, radar par catégorie                                                                                                                                                                                  | Texte + images (jauges, radar)                           |
| 19                                                                     | Statistiques des mesures par criticité et par catégorie                                                                                                                                                                                  | Barres à largeur dynamique                               |
| 20                                                                     | Exigences restantes : mesure, statut, échéance, porteurs                                                                                                                                                                                 | Liste + pastilles colorées                               |
| 24                                                                     | Avis des membres                                                                                                                                                                                                                         | Liste                                                    |
| 27–30                                                                  | Annexe des mesures par statut                                                                                                                                                                                                            | Liste + duplication de slide                             |

Les autres slides (couverture des parties, sommaire, composition de la commission, schémas, historique, audit, proposition de décision) sont à compléter par le projet et restent statiques.

## Spike : choix de la lib (9 novembre 2026)

**Décision : pptx-automizer seul** (MIT, v0.9.4). docxtemplater et pizzip ne sont plus nécessaires.

Script d'essai : `chantier_pptx/spike/essaiAutomizer.mjs`, lancé sur le template brut du designer, avec contrôle du zip, du XML et du rendu LibreOffice.

| Besoin                                                   | Résultat | Moyen                                                                                                                 |
| -------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| Remplacer un texte (slide 1)                             | ✅       | `slide.modifyElement('<nom>', modify.setText(…))`                                                                     |
| Couleur dynamique d'une pastille (slides 20 et 27)       | ✅       | `ModifyColorHelper.solidFill` sur le fond, `ModifyTextHelper.setColor` sur le texte                                   |
| Largeur dynamique des barres (slide 19)                  | ✅       | `modify.setPosition({ x, w })` sur les segments                                                                       |
| Dupliquer une slide (annexe, 3 pages depuis la slide 27) | ✅       | `automizer.addSlide('modele', 27, …)` autant de fois que nécessaire                                                   |
| Liste plus courte que le modèle                          | ✅       | `slide.removeElement('<nom>')` sur les formes des lignes en trop                                                      |
| Ne garder que les slides voulues, sans orphelines        | ✅       | options `removeExistingSlides: true` et `cleanup: true` (sans `cleanup`, les 30 slides d'origine restent dans le zip) |

Pourquoi pas docxtemplater : la duplication de slides (annexe) est un module payant, et les couleurs et largeurs auraient demandé de la manipulation XML maison. pptx-automizer couvre tout en MIT.

Conséquences :

- **Barres de la slide 19 : en XML, pas en image.** C'est simple avec `setPosition`.
- **Plus de balises `{cle}` dans le template** : on cible les formes **par leur nom**. Le template doit donc nommer chaque forme dynamique de façon stable et lisible (`nom-service`, `statut-fond`, `ligne-1-mesure`…). Les noms actuels (`Text 25`, `Shape 24`) changent dès qu'on retouche une slide.
- **Les listes peuvent rester en formes** : le template prévoit N lignes nommées, on remplit celles qui servent et on supprime les autres. Les tableaux natifs (`modify.setTable`) seraient sans doute plus propres, mais **ce n'est pas testé** (le template n'en contient aucun).

**Largeur des pastilles de statut.** Changer le libellé sans changer la largeur fait déborder le texte (« À LANCER » dans une pastille prévue pour « FAITE »). La légende de la slide 19 donne la largeur prévue par le designer pour chaque statut, avec la même police (18 pt) et la même hauteur. On applique donc une largeur fixe par statut au fond et au texte (`setPosition({ w })`), et on décale le compteur « N mesures » d'autant. Testé avec « À LANCER » et « NON PRISE EN COMPTE » : correct sous LibreOffice.

| Statut              | Largeur fond (EMU) | Largeur texte (EMU) |
| ------------------- | ------------------ | ------------------- |
| Faite               | 914474             | 723974              |
| Partielle           | 1519758            | 1329258             |
| Non prise en compte | 2946722            | 2768424             |
| À lancer            | 1447800            | 1257300             |
| Statut à définir    | 2340843            | 2150343             |

Autre constat sur le template :

- Sur la couverture (slide 1), « Nom Périmètre d'homologation » reste à compléter par le projet (souligné orange) : seule la date de création est préremplie.

Pas encore vérifié :

- ~~l'ouverture du fichier dans Microsoft PowerPoint~~ : vérifiée sur la PR 2 (voir les points ouverts) ;
- ~~le remplacement d'image~~ : validé en PR 3 avec `loadMedia` et `modify.setRelationTarget` (slide 8) ; reste à faire pour la slide 18 ;
- `modify.setTable` sur un tableau natif.

## Ce qu'on garde du POC

- **L'idée de la brique 3** (image placée dans le template et remplacée à la génération) : illustration du niveau de besoin (slide 8), jauges et radar (slide 18). L'implémentation passera par pptx-automizer plutôt que par `remplaceImageNommee`, si son remplacement d'image fonctionne.
- **Pipeline Typst → SVG → PNG** (brique 4) : seulement pour le radar et les jauges, si on les génère en image. Il n'est plus utilisé pour les matrices ni pour les barres.
- **Câblage MSS** : route `GET /api/service/:id/pptx/supportCommissionHomologation.pptx`, droits `Autorisation.DROITS_DOSSIER_DECISION_PDF`, injection `server.ts` → `mss.js` → `routesConnecteApi` → `routesConnecteApiService`, stub dans `testeurMSS`.

## Ce qui change par rapport au POC

1. **Template à retravailler** : un nom stable pour chaque forme dynamique (textes, pastilles, barres, images, lignes de liste), style « prérempli » (italique) sur les champs remplis par MSS.
2. **Lib : pptx-automizer** à la place de docxtemplater (voir le spike).
3. **Séparer les données du rendu** : une vue pure `vueSupportCommission(service, …)` produit un objet simple, testé en TDD. L'adaptateur ne fait que l'injecter dans le template. Si on change de lib, seul l'adaptateur bouge.

## Plan des PR

Chaque PR après la 1 suit le même schéma : un test rouge sur la vue → la donnée → la forme nommée dans le template → un test qui relit le pptx généré.

0. ~~**Template**~~ : le designer ne fera plus de modifications. **C'est l'équipe qui retouche le template**, au fil des PR : chaque PR renomme et restyle uniquement les formes de ses slides, dans le même commit que le code qui les utilise. Le template versionné (`src/vuesPowerpoint/supportCommissionHomologation.pptx`) est la source de vérité. Retouches possibles directement dans le XML, ou dans PowerPoint (volet Sélection pour renommer). Contrôle du rendu dans PowerPoint dès qu'une PR touche au style.
   - **Numérotation des slides du template sans trou** (`slide1.xml` à `slideN.xml`) : pptx-automizer numérote les slides générées à partir du nombre de slides du template ; avec un trou, elles écrasent des slides existantes et dédoublent leurs déclarations, et PowerPoint demande une réparation. Après tout retrait de slide, renuméroter les slides, leurs notes, leurs `.rels` et toutes les références avec `python3 chantier_pptx/scripts/renumerote_slides.py src/vuesPowerpoint/supportCommissionHomologation.pptx` (modifie le fichier sur place et affiche les anciens et nouveaux numéros), puis mettre à jour les constantes `SLIDE_*` de l’adaptateur.
   - Les numéros de slide des PR 3 et suivantes sont ceux de la maquette du designer. Depuis le retrait de la slide 3, le fichier du template correspondant porte le numéro de maquette moins 1 (maquette 8 → `slide7.xml`).
1. ~~**Squelette de bout en bout**~~ (fait) : feature flag (404 si désactivé), dépendance pptx-automizer, interface et implémentation de l'adaptateur, template réduit à la slide 1 (date de création), route réservée aux services V2, injection, spec de la route et test qui relit le pptx. Pas de bouton dans l'interface.
2. ~~**Commission et pièces du dossier**~~ (fait) — maquette V4 de la designer : la slide 3 d'origine est remplacée par des slides du template (numéros de fichier, utilisés par pptx-automizer) :
   - **slide 30, composition de la commission** : autorité d'homologation de l'étape 1 en italique, ou « Prénom Nom, fonction » à compléter si elle n'est pas renseignée (les deux versions sont superposées dans le template, l'adaptateur retire l'inutile) ;
   - **slide 32, page de pièces** (toutes les pages) : 16 lignes régulières (colonne de gauche puis de droite), chacune avec une version préremplie (case, intitulé, source) et une version à compléter, et un séparateur nommé ; les zones d'intitulé s'arrêtent avant la colonne « Source / réf. ». La slide 32 de la maquette (lignes hautes en première page) a été retirée : la synthèse tient désormais sur une ligne ;
   - **slide 31, page de pièces vide** : 16 lignes à compléter, ajoutée en dernière page quand le nombre total de lignes est un multiple de 16 ;
   - pièces (`piecesDuDossier`, `{ intitule, intituleAbrege?, source, cochee }`) : « Présent support de commission » et « Décision d'homologation à signer » (MonServiceSécurisé, cochées), « Avis écrits de A, B et C » (collaborateurs des avis de l'étape 2, sans doublon, absente sans avis ; Utilisateur), « Synthèse de la sécurité du service » (MonServiceSécurisé), « Rapport d'audit, si réalisé » et « Analyse de risque, si réalisée » (Utilisateur), puis les documents de l'étape 3 (Utilisateur) ;
   - **ligne des avis à hauteur variable** : nombre de lignes de texte estimé par retour à la ligne mot par mot (40 caractères par ligne, calibré sur les rendus) ; de 1 à 3 lignes, la ligne grandit et les suivantes de la colonne descendent ; au-delà, intitulé abrégé « Avis écrits des collaborateurs » ;
   - pagination : 16 lignes par page, dernière page complétée par des lignes à remplir, « k/N » dans le titre seulement s'il y a plusieurs pages (exemple réel : 43 documents → 4 pages) ;
   - refus de la route sans dossier en cours (422 `AUCUN_DOSSIER_COURANT`) ;
   - **fichier ouvert sans réparation dans PowerPoint** : template renuméroté sans trou ; après génération, l'adaptateur retire les notes et les relations des slides du template non reprises, ainsi que les déclarations de parties absentes de `[Content_Types].xml` (pptx-automizer les laisse) ; archive compressée (DEFLATE, 248 Ko → 32 Ko). Des tests relisent la structure du fichier : pas de partie déclarée deux fois, pas de relation cassée, pas de partie déclarée absente, fichiers compressés.
   - Les PR suivantes ajoutent leurs slides dans l'ordre du template, avec les slides statiques qui les précèdent. Jamais de données fictives de la maquette dans le support généré.

~~**2bis. Slides 4 et 5, présentation du système et contexte**~~ (fait) (fichiers `slide3.xml` et `slide4.xml` du template), insérées après les pièces du dossier. La slide 4 (logo à insérer) reste statique. La slide 5 est remplie depuis la description V2, avec les libellés du référentiel, dans un objet de `src/modeles/objetsPowerpoint/` (même motif que les pièces du dossier) :

- description du SI : `presentation` (jusqu'à 2000 caractères) ; **police réduite selon la longueur**, jusqu'à un minimum lisible, puis coupure « … » (l'ajustement automatique de PowerPoint n'est recalculé qu'à la modification du texte). Calibré sur les rendus : 21 pt sur 2 lignes (105 caractères par ligne), 16 pt sur 3 lignes (120), 14 pt sur 4 lignes (130), coupure au-delà. Chaque saut de ligne commence une nouvelle ligne (une ligne vide compte), chaque ligne est écrite dans son propre paragraphe, et la coupure peut se faire à un saut de ligne. Le cadre de texte couvre tout le fond blanc, texte centré verticalement, sans ajustement automatique ;
- nom de l'organisation : nom et SIRET formaté (« Commune de Villeneuve (123 456 789 00010) ») ;
- statut : description du `statutDeploiement` du référentiel V2 (« En ligne et accessible aux usagers et/ou agents » plutôt que « En production » de la maquette) ;
- URL(s) du projet : `pointsAcces`, séparés par des virgules ;
- type de projet : `typeService` ; hébergement : `typeHebergement` ; données stockées : `localisationDonneesTraitees` ; sécurisations prévues : `specificitesProjet` ;
- **champ non renseigné : laissé vide**.

3. ~~**Slides 6 à 8, périmètre de l'analyse (statiques) et besoins de sécurité**~~ (fait) (fichiers `slide5.xml` à `slide7.xml`) :
   - niveau (Basiques, Modérés, Avancés) et son résumé, démarche indicative adaptée (simplifiée, intermédiaire, renforcée), repris de `svelte/lib/niveauxDeSecurite/donneesNiveauxDeSecurite.ts` ;
   - encart « supérieur à celui identifié par l'ANSSI (niveau estimé) » seulement si le niveau choisi dépasse le niveau estimé (`depasseRecommandation`, le niveau indicatif est toujours fourni) ; sinon l'encart est retiré, l'illustration s'agrandit et le niveau et son résumé descendent à sa place, juste au-dessus de la démarche ;
   - explication par le projet : nom du service et niveau en italique ; « nature des services » et « type de données » restent à compléter (soulignement en tirets et surlignage portés par le texte : Keynote affiche un soulignement plein sans fond, à vérifier dans PowerPoint) ;
   - exposition : ouverture du système, audience cible (« nom : description » du référentiel V2, tel quel comme l'annexe PDF), durée maximale de dysfonctionnement ; quand l'ouverture dépasse une ligne (42 caractères), l'audience et la durée descendent d'une ligne ; zones de texte ramenées dans la carte ;
   - données identifiées : **pastilles en flux** (elles se suivent puis passent à la ligne, largeur estimée d'après le texte, deux lignes pour un texte long), catégories du référentiel puis catégories libres ; une pastille modèle copiée par donnée (identifiants de formes renumérotés) ; si elles débordent de la carte, police réduite à 16 puis 14 pt, puis « et N autres » ;
   - illustration : **remplacée selon le niveau** par les illustrations MSS, converties en PNG (`src/vuesPowerpoint/illustrationsNiveaux/niveauN.png`, depuis `public/assets/images/niveauxSecurite/niveauN.svg`) ; cadre carré ; les relations d'image laissées par pptx-automizer sont retirées après génération.
4. ~~**Spike sur la lib**~~ : fait, voir la section « Spike ».
5. **Slides 12, 14 et 15, matrices** : libellés des cases (brute, à date, cible), liste des risques, pastilles colorées selon le niveau.
6. **Slide 13, description des risques**.
7. **Slide 18, indice cyber** : texte, puis jauges et radar en images.
8. **Slide 19, statistiques des mesures** : largeur des barres via `setPosition`.
9. **Slide 20, exigences restantes** : mesures partielles et à lancer uniquement, statut coloré, échéance, porteurs (`partieResponsable`).
10. **Slide 24, avis** : collaborateurs, avis, durée, commentaire.
11. **Slides 27–30, annexe des mesures** : pagination par statut.
12. ~~**Bouton dans l'interface**~~ (fait) : carte « Support de commission d'homologation » (PPTX) dans le tiroir de téléchargement, si le flag est actif et que le service est V2, avec une homologation en cours et le droit Homologuer en lecture. Le menu du service et le tableau de bord ouvrent le tiroir dès que le support est disponible ; l'action du tableau de bord s'appelle « Télécharger les documents ».
13. **Retrait du feature flag**, une fois la fonctionnalité validée en production.

## Points ouverts

- [ ] **Intitulés longs des documents** (ex. « Document 13 avec un nom vraiment beaucoup … plus long ») : seule la ligne des avis a une hauteur variable. Un document au nom long est rétréci par LibreOffice (police minuscule) ou déborde sur la ligne suivante dans PowerPoint. Pistes discutées, rien de décidé :
  - hauteur variable pour toutes les pièces, avec coupure « … » au-delà de 3 lignes de texte (un document n'a pas d'intitulé abrégé) ;
  - pagination à la hauteur (chaque colonne prend autant de pièces qu'elle peut en contenir, une page peut avoir moins de 16 pièces, la page vide s'ajoute quand la dernière page est pleine), ou maintien de 16 pièces par page avec une hauteur totale plafonnée.
- [ ] Estimation du nombre de lignes de texte : basée sur le nombre de caractères, pas sur la largeur réelle des lettres ; à confirmer dans PowerPoint.
- [x] Pièces du dossier : 16 lignes par page avec pagination (maquette V4), plus de réduction de police.
- [x] Cases des pièces : support de commission et décision cochés, les autres décochés.
- [x] Lib retenue : pptx-automizer.
- [x] Barres de la slide 19 : en XML (`setPosition`).
- [x] Listes : formes nommées (testé). Pas de tableaux natifs : le template n'en contient pas et on ne refait pas la mise en page.
- [x] Remplacement d'image avec pptx-automizer : validé en PR 3 (`loadMedia` + `setRelationTarget`, PNG plutôt que SVG).
- [x] Largeur des pastilles de statut : largeur fixe par statut, reprise de la légende de la slide 19.
- [ ] Pastilles de statut sous Microsoft PowerPoint : à revérifier avec les largeurs par statut.
- [ ] Réutilisation éventuelle des jauges ou du radar déjà présents dans `src/vuesPdf/syntheseSecurite.typ` : à vérifier.
- [ ] Vérification sous Microsoft PowerPoint : faite sur le spike, la couverture et le fichier de la PR 2 (ouvert sans réparation) ; à refaire à chaque nouvelle slide, notamment le contexte (2bis) : retours à la ligne et tenue de la description dans le cadre ; les objectifs de sécurité (3) : soulignés en tirets de l'explication, largeur des pastilles, illustration.
- [x] Thème partagé entre le notes master et le slide master (hérité du fichier du designer) : laissé tel quel, PowerPoint ouvre le fichier sans réparation.
