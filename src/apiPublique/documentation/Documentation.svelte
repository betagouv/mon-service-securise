<script lang="ts">
  import type { ModeleDocumentation } from './modeleDocumentation';

  let {
    modele,
    urlBaseMss,
  }: { modele: ModeleDocumentation; urlBaseMss: string } = $props();

  const json = (valeur: unknown) => JSON.stringify(valeur);

  const colonnesChamps = [
    { key: 'nom', label: 'Champ' },
    { key: 'type', label: 'Type' },
    { key: 'requis', label: 'Requis' },
    { key: 'description', label: 'Description', multiline: true },
  ];
  const colonnesParametres = [
    { key: 'nom', label: 'Nom' },
    { key: 'emplacement', label: 'Emplacement' },
    { key: 'type', label: 'Type' },
    { key: 'requis', label: 'Requis' },
    { key: 'description', label: 'Description', multiline: true },
  ];

  const statutDeMethode: Record<string, string> = {
    GET: 'info',
    POST: 'success',
    PUT: 'warning',
    PATCH: 'warning',
    DELETE: 'error',
  };
  const statutHttp = (code: string) => {
    if (code.startsWith('2')) return 'success';
    if (code.startsWith('3')) return 'info';
    return 'error';
  };

  const entreeDeMenu = (id: string, label: string) => ({
    id: `menu-${id}`,
    label,
    href: `#${id}`,
    type: 'link',
  });
  const sectionDeMenu = (id: string, label: string, items: unknown[]) => ({
    id: `menu-${id}`,
    label,
    type: 'menu',
    isCollapsible: true,
    collapseId: `menu-${id}-contenu`,
    items,
  });

  const menu = $derived([
    ...(modele.authentifications.length
      ? [entreeDeMenu('authentification', 'Authentification')]
      : []),
    ...modele.groupes.map((groupe) =>
      sectionDeMenu(
        groupe.id,
        groupe.nom,
        groupe.operations.map((operation) =>
          entreeDeMenu(operation.id, `${operation.methode} ${operation.chemin}`)
        )
      )
    ),
    ...(modele.schemas.length
      ? [
          sectionDeMenu(
            'schemas',
            'Schémas',
            modele.schemas.map((schema) => entreeDeMenu(schema.id, schema.nom))
          ),
        ]
      : []),
  ]);
</script>

<dsfr-header
  has-brand-operator
  brand-operator-src={`${urlBaseMss}/statique/assets/images/logo_ANSSI_MSS.svg`}
  brand-operator-alt="MonServiceSécurisé"
  brand-operator-style="height:4rem"
  brand-service="MonServiceSécurisé"
  has-brand-tagline
  brand-tagline={`Documentation de l'API publique · v${modele.version}`}
  brand-link-href="/docs"
  brand-link-title="Accueil - Documentation de l'API publique MonServiceSécurisé"
></dsfr-header>

<main class="page" id="contenu">
  <aside class="sommaire">
    <dsfr-side-menu
      title="Sommaire"
      has-title
      modifier="sticky"
      button-label="Sommaire"
      button-id="sommaire-bouton"
      items={json(menu)}
    ></dsfr-side-menu>
  </aside>

  <div class="contenu">
    <h1>
      {modele.titre}
      <dsfr-badge label="BÊTA" type="accent" accent="green-emeraude" size="sm"
      ></dsfr-badge>
    </h1>
    {#if modele.description}
      <p class="introduction">{modele.description}</p>
    {/if}
    <p>
      <a href="/openapi.json" download>Spécification OpenAPI (JSON)</a>
    </p>

    {#if modele.serveurs.length}
      <dsfr-callout
        has-title
        title="URL de base"
        title-markup="p"
        text={modele.serveurs.join(' · ')}
      ></dsfr-callout>
    {/if}

    {#if modele.authentifications.length}
      <h2 id="authentification">Authentification</h2>
      {#each modele.authentifications as authentification (authentification.nom)}
        <dsfr-callout
          has-title
          title={authentification.type}
          title-markup="h3"
          text={authentification.description}
        ></dsfr-callout>
      {/each}
    {/if}

    {#each modele.groupes as groupe (groupe.id)}
      <h2 id={groupe.id}>{groupe.nom}</h2>

      {#each groupe.operations as operation (operation.id)}
        <section class="bloc" id={operation.id}>
          <h3 class="titre-operation">
            <dsfr-badge
              type="status"
              status={statutDeMethode[operation.methode] ?? 'info'}
              label={operation.methode}
            ></dsfr-badge>
            <code>{operation.chemin}</code>
          </h3>
          <p class="resume">{operation.resume}</p>
          {#if operation.description}<p>{operation.description}</p>{/if}

          {#if operation.parametres.length}
            <h4>Paramètres</h4>
            <dsfr-table
              id={`${operation.id}-parametres`}
              caption="Paramètres"
              no-caption
              size="sm"
              columns={json(colonnesParametres)}
              rows={json(operation.parametres)}
            ></dsfr-table>
          {/if}

          <h4>Réponses</h4>
          {#each operation.reponses as reponse, index (reponse.statut)}
            <dsfr-accordion
              id={`${operation.id}-${reponse.statut}`}
              label={`${reponse.statut} — ${reponse.description}`}
              title-markup-level="5"
              is-expanded={index === 0 || undefined}
            >
              <dsfr-badge
                type="status"
                status={statutHttp(reponse.statut)}
                label={`HTTP ${reponse.statut}`}
                size="sm"
              ></dsfr-badge>
              {#if reponse.lignes.length}
                <dsfr-table
                  id={`${operation.id}-${reponse.statut}-corps`}
                  caption={`Corps de la réponse ${reponse.statut}`}
                  no-caption
                  size="sm"
                  columns={json(colonnesChamps)}
                  rows={json(reponse.lignes)}
                ></dsfr-table>
              {:else}
                <p>Pas de corps de réponse.</p>
              {/if}
              {#if reponse.exemple}
                <p class="legende-exemple">Exemple</p>
                <pre class="exemple"><code>{reponse.exemple}</code></pre>
              {/if}
            </dsfr-accordion>
          {/each}
        </section>
      {/each}
    {/each}

    {#if modele.schemas.length}
      <h2 id="schemas">Schémas</h2>
      {#each modele.schemas as schema (schema.id)}
        <section class="bloc" id={schema.id}>
          <h3><code>{schema.nom}</code></h3>
          <dsfr-table
            id={`${schema.id}-champs`}
            caption={schema.nom}
            no-caption
            size="sm"
            columns={json(colonnesChamps)}
            rows={json(schema.lignes)}
          ></dsfr-table>
          {#if schema.exemple}
            <p class="legende-exemple">Exemple</p>
            <pre class="exemple"><code>{schema.exemple}</code></pre>
          {/if}
        </section>
      {/each}
    {/if}
  </div>
</main>

<dsfr-footer
  brand-link-href="/docs"
  brand-link-title="Accueil - Documentation de l'API publique MonServiceSécurisé"
  has-description
  content-description={`Documentation générée automatiquement depuis la spécification OpenAPI (v${modele.version}).`}
  bottom-links={json([
    {
      label: 'Spécification OpenAPI (JSON)',
      href: '/openapi.json',
      markup: 'a',
    },
  ])}
></dsfr-footer>

<style>
  :global(body) {
    margin: 0;
    font-family: Marianne, arial, sans-serif;
    font-size: 1rem;
    line-height: 1.5;
    color: var(--text-default-grey);
    background: var(--background-default-grey);
  }

  .page {
    max-width: 78rem;
    margin: 0 auto;
    padding: 3rem 1.5rem;
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    align-items: start;
  }
  @media (min-width: 62em) {
    .page {
      grid-template-columns: 1fr 3fr;
    }
    .sommaire {
      position: sticky;
      top: 1rem;
    }
  }

  .contenu {
    min-width: 0;
  }
  .contenu h1 {
    font-size: 2.5rem;
    line-height: 1.2;
    margin: 0 0 1.5rem;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .contenu h2 {
    font-size: 1.75rem;
    line-height: 1.25;
    margin: 3rem 0 1.5rem;
    scroll-margin-top: 1.5rem;
  }
  .contenu h3 {
    font-size: 1.375rem;
    line-height: 1.25;
    margin: 0 0 1rem;
  }
  .contenu h4 {
    font-size: 1.125rem;
    margin: 1.5rem 0 0.75rem;
  }
  .contenu a {
    color: var(--text-action-high-blue-france);
  }
  .contenu code {
    font-family: monospace;
  }

  .introduction {
    font-size: 1.25rem;
    line-height: 1.6;
  }
  .resume {
    font-size: 1.125rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
  }

  .bloc {
    scroll-margin-top: 1.5rem;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
    border-bottom: 1px solid var(--border-default-grey);
  }
  .titre-operation {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .titre-operation code {
    font-size: 1.25rem;
  }

  .legende-exemple {
    font-size: 0.875rem;
    font-weight: 700;
    margin: 1rem 0 0.5rem;
  }
  .exemple {
    margin: 0 0 1rem;
    padding: 1rem 1.25rem;
    overflow-x: auto;
    background: var(--background-alt-grey);
    border-left: 4px solid var(--border-plain-blue-france);
    font-size: 0.875rem;
    line-height: 1.5;
  }
</style>
