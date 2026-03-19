<script lang="ts">
  const legende = [
    { classe: 'vert', label: 'Faible : Acceptable en l’état' },
    { classe: 'orange', label: 'Moyen : Tolérable sous contrôle' },
    { classe: 'rouge', label: 'Élevé : Inacceptable' },
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
    display: flex;
    padding: 16px;
    gap: 24px;

    .entree-legende {
      display: flex;
      align-items: center;
      gap: 8px;

      .carre-legende {
        width: 13px;
        height: 13px;

        &.vert {
          background: #77b645;
        }

        &.orange {
          background: #fa7a35;
        }

        &.rouge {
          background: #e1000f;
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
