<script lang="ts">
  import type { VersionService } from '../../../src/modeles/versionService';

  export let value: VersionService;

  const selectionneVersion = (version: string) => {
    value = version as VersionService;
  };
</script>

<th colspan="3">
  <div>
    <label for="version-v2" class:actif={value === 'v2'}>
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Nouveau référentiel"
        variante={value === 'v2' ? 'secondaire' : 'tertiaire'}
        taille="sm"
        icone=""
        positionIcone="sans"
        id="version-v2"
        on:click={() => selectionneVersion('v2')}
      />
    </label>
    <label for="version-v1" class:actif={value === 'v1'}>
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Ancien référentiel"
        variante={value === 'v1' ? 'secondaire' : 'tertiaire'}
        taille="sm"
        icone=""
        positionIcone="sans"
        id="version-v1"
        on:click={() => selectionneVersion('v1')}
      />
    </label>
  </div>
</th>

<style lang="scss">
  th {
    padding: 12px;
    color: var(--bleu-mise-en-avant);
    border-bottom: 1px solid #dddddd;

    div {
      display: flex;

      label {
        cursor: pointer;

        &.actif {
          z-index: 1;
        }
      }

      label[for='version-v1'] {
        margin-left: -4px;
      }
    }
  }
</style>
