<script lang="ts">
  import type { EntetePageServiceProps } from './entetePageService.d';

  let { nomService, organisationResponsable }: EntetePageServiceProps =
    $props();
</script>

<div class="entete-service">
  <div class="conteneur-nom">
    <h1>{nomService}</h1>
    <h2>{organisationResponsable}</h2>
  </div>
</div>

<style lang="scss">
  .entete-service {
    background: #f6f6f6;
    padding: 32px 24px;

    .conteneur-nom {
      display: flex;
      flex-direction: column;
      gap: 12px;

      h1 {
        font-weight: bold;
        font-size: 1.75rem;
        line-height: 2.25rem;
        color: #161616;
        margin: 0;
      }

      h2 {
        font-weight: 400;
        font-size: 1rem;
        line-height: 1.5rem;
        color: #161616;
        margin: 0;
      }
    }
  }
</style>
