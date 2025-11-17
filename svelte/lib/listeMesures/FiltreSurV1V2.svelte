<script lang="ts">
  import type { VersionService } from '../../../src/modeles/versionService';

  export let value: VersionService;
</script>

<th colspan="3">
  <div>
    <label for="version-v1">
      <input
        type="radio"
        id="version-v1"
        name="version-service"
        value="v1"
        bind:group={value}
      />
      v1
    </label>
    <label for="version-v2">
      <input
        type="radio"
        id="version-v2"
        name="version-service"
        value="v2"
        bind:group={value}
      />
      v2
    </label>
  </div>
</th>

<style lang="scss">
  th {
    padding: 12px;
    color: var(--bleu-mise-en-avant);

    div {
      display: flex;
      gap: 12px;

      label {
        cursor: pointer;
      }
    }
  }
</style>
