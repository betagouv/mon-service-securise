<script lang="ts">
  interface Props {
    prenomNom: string;
    initiales?: string;
    postes?: string;
  }

  let { prenomNom, initiales, postes }: Props = $props();
</script>

<div class="cartouche-admin">
  {#if initiales}
    <div class="initiales"><span>{initiales}</span></div>
  {/if}
  <div class="identite">
    <span class="nom-prenom">{prenomNom}</span>
    {#if postes}
      <span class="postes">{postes}</span>
    {/if}
  </div>
</div>

<style>
  .cartouche-admin {
    padding: 24px;
    border: 1px solid #dddddd;
    border-radius: 8px;
    display: flex;
    gap: 16px;
    align-items: center;

    .identite {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .nom-prenom {
        font-size: 1rem;
        line-height: 1.5rem;
        color: #3a3a3a;
      }

      .postes {
        font-size: 1rem;
        line-height: 1.5rem;
        color: #666666;
      }
    }

    .initiales {
      width: 40px;
      height: 40px;
      background: var(--purple-glycine-925-125);
      border-radius: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      span {
        font-size: 0.875rem;
        line-height: 1.5rem;
        color: var(--purple-glycine-sun-319-moon-630);
      }
    }
  }
</style>
