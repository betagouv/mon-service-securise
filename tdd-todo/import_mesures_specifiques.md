# La TODO list de l'import des mesures spécifiques

## Vocabulaire

On dit [Modèles de mesure spécifique] pour parler de la partie « référentiel de mesures lié à l'utilisateur ».

## Du point de vue des Modèles de mesure

### Suppression

- [ ] On peut supprimer un modèle du référentiel, mais **sans** supprimer les mesures : elles seront détachées sur chaque service où elles
      sont liées. Supprime et détache
- [ ] On peut supprimer un modèle du référentiel **et** supprimer les mesures associées : les mesures disparaisssent totalement
      de tous les services où elles apparaissaient. Supprime et supprime
- [ ] On peut dissocier une mesure de certains services tout en **conservant** le modèle : les mesures spécifiques disparaissent du service
      et le lien entre modèle et service disparaît aussi. Conserve et supprime

### CSV

- [ ] On peut créer des modèles de mesure (description, description longue, catégorie) lié à son identifiant utilisateur via un import de CSV
  - Cet import aura une limite en nombre total de modèles détenu par l'utilisateur

## Du point de vue du Front

- [ ] On veut pouvoir afficher la liste des modèles de mesure dans un onglet à coté de la liste des mesures générales
  - [ ] Les badges des onglets sont mis à jour en fonction de la recherche
- [ ] On veut pouvoir supprimer un modèle de mesure
  - [ ] La mesure est supprimée de la liste & des services (on retire l'association, les mesures spécifiques concernées et le modèle)
  - [ ] La mesure est supprimée de la liste, mais détachée des services (on retire l'association et le modèle, mais on conserve les mesures spécifiques une fois détachées)
  - [ ] La mesure est supprimée de certains services (on retire l'association et la mesure spécifique concernée, mais on conserve le modèle)

## Du point de vue de la page "SÉCURISER"

- [ ] Une mesure spécifique associée, supprimée depuis l'interface, doit supprimer l'association entre le service et le modèle
