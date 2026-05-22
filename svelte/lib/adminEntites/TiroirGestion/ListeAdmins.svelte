<script lang="ts">
  import type { AdminSupervise } from '../adminEntites.types';

  interface Props {
    administrateurs: Array<AdminSupervise>;
  }

  let { administrateurs }: Props = $props();
</script>

<hr />
<h3>Administrateurs de l’entité</h3>
<span class="sous-titre"
  >Consultez la liste des utilisateurs disposant des droits admins.</span
>
<div class="conteneur-cartouches">
  {#each administrateurs as admin, i (i)}
    <div class="cartouche-admin">
      <div class="initiales"><span>{admin.initiales}</span></div>
      <div class="identite">
        <span class="nom-prenom">{admin.prenomNom}</span>
        <span class="postes">{admin.postes}</span>
      </div>
    </div>
  {/each}
</div>

<style>
  hr {
    border: none;
    border-top: 1px solid #dddddd;
  }
  h3 {
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .sous-titre {
    font-size: 0.75rem;
    line-height: 1.125rem;
    color: #666666;
  }

  .conteneur-cartouches {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 12px;

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
  }
</style>
