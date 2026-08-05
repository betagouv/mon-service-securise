<script lang="ts">
  const legende = [
    { classe: 'vert', label: 'Faible : acceptable en l’état' },
    { classe: 'orange', label: 'Moyen : tolérable sous contrôle' },
    { classe: 'rouge', label: 'Élevé : inacceptable' },
  ];
</script>

<div class="conteneur-legende">
  {#each legende as { classe, label }, index (index)}
    <div class="entree-legende">
      <div class="carre-legende {classe}"></div>
      <span>{label}</span>
    </div>
  {/each}
</div>

<style lang="scss">
  .conteneur-legende {
    --rouge: #fa7659;
    --orange: #fcc63a;
    --vert: #7fc04b;
    display: flex;
    padding: 16px;
    gap: 24px;

    .entree-legende {
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;

      .carre-legende {
        width: 13px;
        height: 13px;

        &.vert {
          background: var(--vert);
        }

        &.orange {
          background: var(--orange);
        }

        &.rouge {
          background: var(--rouge);
        }
      }

      span {
        color: #3a3a3a;
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.5rem;
      }
    }
  }
</style>
