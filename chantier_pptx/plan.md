# Chantier : support de commission d'homologation (pptx)

Générer à la demande, pour un service, un support de commission d'homologation au format pptx, prérempli avec les données MonServiceSécurisé, à partir du template réalisé par le designer (`Support_de_commission.pptx`, 30 slides).

Point de départ : le POC de Thibaud (7 octobre 2026, non commité), décrit dans le document « Reprise du chantier PowerPoint ».

## Décisions

| Sujet                                      | Décision                                                                                                                                                                                                                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Livraison                                  | **Derrière un feature flag** `FEATURE_FLAG_AVEC_SUPPORT_COMMISSION_PPTX` (même motif que `avecRisquesV2` dans `adaptateurEnvironnement.js`, déclaré dans `.env.template`). Flag désactivé : la route répond 404 et le bouton n'est pas affiché. On peut ainsi livrer chaque PR en production. |
| Services concernés                         | **V2 uniquement.** La route refuse les services V1.                                                                                                                                                                                                                                           |
| Annexe des mesures (slides 27–30)          | **Conservée**, paginée (environ 7 mesures par slide, slide dupliquée si besoin).                                                                                                                                                                                                              |
| Exigences restantes (slide 20)             | Uniquement les mesures **partielles** et **à lancer**.                                                                                                                                                                                                                                        |
| Porteurs (slide 20)                        | `partieResponsable` du moteur de règles V2 (`Projet` / `Presta` / `Mixte`), libellé équivalent à `svelte/lib/tableauDesMesures/ligne/mapPartieResponsable.ts`. Une transcription existe déjà dans `src/adaptateurs/adaptateurCsv.js` (export CSV). Pas de nom d'utilisateur.                  |
| Avis (slide 24)                            | Champ « Collaborateurs métier et techniques renseignant l'avis » de l'homologation (`avis.collaborateurs`, déjà des chaînes).                                                                                                                                                                 |
| Format de date                             | Court (`14/10/2026`), via `dateEnFrancais` du projet.                                                                                                                                                                                                                                         |
| Pastilles colorées (slides 12, 14, 15, 20) | **Couleur vraiment dynamique**, calculée selon la donnée.                                                                                                                                                                                                                                     |
| Couleur des pastilles de risque            | Celle des blocs de la matrice (voir plus bas).                                                                                                                                                                                                                                                |
| Barres (slide 19)                          | Largeur dynamique en XML (`setPosition`), validée par le spike.                                                                                                                                                                                                                               |
| Matrices de risques                        | Formes éditables du template, libellé de chaque case rempli à la génération. Plus d'image Typst pour les matrices.                                                                                                                                                                            |
| Lib                                        | **pptx-automizer** (MIT), à la place de docxtemplater. Voir la section « Spike ».                                                                                                                                                                                                             |

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

| Slides     | Contenu                                                                                                       | Difficulté                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1          | Nom du service, date de création                                                                              | Texte                                                    |
| 5          | Contexte : description, organisation, statut, URL, type, hébergement, localisation des données, sécurisations | Texte                                                    |
| 8          | Besoins de sécurité, alerte « supérieur à l'ANSSI », démarche, exposition, données identifiées                | Texte + condition + illustration selon le niveau + liste |
| 12, 14, 15 | Matrices brute / à date / résiduelle cible + liste des risques                                                | Balise par case + liste + pastilles colorées             |
| 13         | Description des risques                                                                                       | Liste                                                    |
| 18         | Indice cyber ANSSI et personnalisé, radar par catégorie                                                       | Texte + images (jauges, radar)                           |
| 19         | Statistiques des mesures par criticité et par catégorie                                                       | Barres à largeur dynamique                               |
| 20         | Exigences restantes : mesure, statut, échéance, porteurs                                                      | Liste + pastilles colorées                               |
| 24         | Avis des membres                                                                                              | Liste                                                    |
| 27–30      | Annexe des mesures par statut                                                                                 | Liste + duplication de slide                             |

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

Autre constat sur le template, pour le designer :

- Le nom du service (slide 1) garde le style « à compléter » (fond gris, souligné orange) alors qu'il est prérempli : à passer en italique.

Pas encore vérifié :

- l'ouverture du fichier dans Microsoft PowerPoint (rendu contrôlé uniquement avec LibreOffice) ;
- le remplacement d'image (`ModifyImageHelper` ou `modify.setRelationTarget`) pour les slides 8 et 18 ;
- `modify.setTable` sur un tableau natif.

## Ce qu'on garde du POC

- **L'idée de la brique 3** (image placée dans le template et remplacée à la génération) : illustration du niveau de besoin (slide 8), jauges et radar (slide 18). L'implémentation passera par pptx-automizer plutôt que par `remplaceImageNommee`, si son remplacement d'image fonctionne.
- **Pipeline Typst → SVG → PNG** (brique 4) : seulement pour le radar et les jauges, si on les génère en image. Il n'est plus utilisé pour les matrices ni pour les barres.
- **Câblage MSS** : route `GET /api/service/:id/powerpoint/supportCommissionHomologation.pptx`, droits `Autorisation.DROITS_DOSSIER_DECISION_PDF`, injection `server.ts` → `mss.js` → `routesConnecteApi` → `routesConnecteApiService`, stub dans `testeurMSS`.

## Ce qui change par rapport au POC

1. **Template à retravailler** : un nom stable pour chaque forme dynamique (textes, pastilles, barres, images, lignes de liste), style « prérempli » (italique) sur les champs remplis par MSS.
2. **Lib : pptx-automizer** à la place de docxtemplater (voir le spike).
3. **Séparer les données du rendu** : une vue pure `vueSupportCommission(service, …)` produit un objet simple, testé en TDD. L'adaptateur ne fait que l'injecter dans le template. Si on change de lib, seul l'adaptateur bouge.

## Plan des PR

Chaque PR après la 1 suit le même schéma : un test rouge sur la vue → la donnée → la forme nommée dans le template → un test qui relit le pptx généré.

0. **Template** (sans code) : formes dynamiques nommées, style prérempli. Peut avancer slide par slide, en parallèle.
1. **Squelette de bout en bout** : feature flag (404 si désactivé), dépendance pptx-automizer, interface et implémentation de l'adaptateur, template réduit à la slide 1 (nom du service, date de création), route réservée aux services V2, injection, spec de la route et test qui relit le pptx. Pas de bouton dans l'interface.
2. **Slide 5, contexte** : création de `vueSupportCommission` et des champs de description.
3. **Slide 8, besoins de sécurité** : niveau, condition « supérieur à l'ANSSI », exposition, données identifiées, illustration selon le niveau (remplacement d'image à valider).
4. ~~**Spike sur la lib**~~ : fait, voir la section « Spike ».
5. **Slides 12, 14 et 15, matrices** : libellés des cases (brute, à date, cible), liste des risques, pastilles colorées selon le niveau.
6. **Slide 13, description des risques**.
7. **Slide 18, indice cyber** : texte, puis jauges et radar en images.
8. **Slide 19, statistiques des mesures** : largeur des barres via `setPosition`.
9. **Slide 20, exigences restantes** : mesures partielles et à lancer uniquement, statut coloré, échéance, porteurs (`partieResponsable`).
10. **Slide 24, avis** : collaborateurs, avis, durée, commentaire.
11. **Slides 27–30, annexe des mesures** : pagination par statut.
12. **Bouton dans l'interface**, affiché seulement si le flag est actif, et vérification manuelle sous Microsoft PowerPoint.
13. **Retrait du feature flag**, une fois la fonctionnalité validée en production.

## Points ouverts

- [x] Lib retenue : pptx-automizer.
- [x] Barres de la slide 19 : en XML (`setPosition`).
- [ ] Listes : formes nommées (testé) ou tableaux natifs (`setTable`, non testé). À décider avec le designer avant la PR 5.
- [ ] Remplacement d'image avec pptx-automizer : à valider en PR 3.
- [x] Largeur des pastilles de statut : largeur fixe par statut, reprise de la légende de la slide 19.
- [ ] Pastilles de statut sous Microsoft PowerPoint : à revérifier avec les largeurs par statut.
- [ ] Réutilisation éventuelle des jauges ou du radar déjà présents dans `src/vuesPdf/syntheseSecurite.typ` : à vérifier.
- [ ] Vérification sous Microsoft PowerPoint : jamais faite (ni sur le POC, ni sur ce template).
