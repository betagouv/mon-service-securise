<script lang="ts">
  import ContenuTiroir from '../../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../../ui/tiroirs/ActionsTiroir.svelte';
  import BoutonsRadio from '../../../ui/BoutonsRadio.svelte';

  export const titre: string = 'Supprimer la mesure';
  export const sousTitre: string =
    'Le statut et la précision de cette mesure peuvent être modifiés et appliqués simultanément à plusieurs services.';
  export const taille = 'large';

  enum ModeDeSuppression {
    COMPLET = 'COMPLET',
    UNIQUEMENT_MODELE = 'UNIQUEMENT_MODELE',
    UNIQUEMENT_SERVICES_CHOISIS = 'UNIQUEMENT_SERVICES_CHOISIS',
  }

  let valeurSelectionnee: ModeDeSuppression = ModeDeSuppression.COMPLET;
</script>

<ContenuTiroir>
  <div class="marge-24">
    <h4>Où souhaitez vous supprimer cette mesure ?</h4>
    <div class="conteneur-boutons-radio">
      <BoutonsRadio
        bind:valeurSelectionnee
        options={[
          {
            titre: 'Supprimer complètement la mesure',
            sousTitre:
              'La mesure sera définitivement supprimée de la liste centralisée ainsi que de tous les services où elle est utilisée.',
            valeur: ModeDeSuppression.COMPLET,
          },
        ]}
      />
    </div>
  </div>
</ContenuTiroir>
<ActionsTiroir></ActionsTiroir>

<style lang="scss">
  h4 {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.75rem;
    margin: 0;
  }

  .conteneur-boutons-radio {
    max-width: 660px;
  }

  .marge-24 {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
</style>
