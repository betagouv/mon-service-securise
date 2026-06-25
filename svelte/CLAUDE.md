---
name: svelte-core-bestpractices
description: Svelte 5 runes-mode best practices. Use when writing, reviewing, or modifying any .svelte or .svelte.ts file in frontend/ — covers $state, $derived, $effect, $props, snippets, events, context, styling, and legacy patterns to avoid.
---

# Svelte 5 Core Best Practices

Source: https://svelte.dev/docs/ai/skills#svelte-core-bestpractices

This project uses Svelte 5 (runes mode). Apply these rules when editing components.

## `$state`

- Use `$state` only for variables that need reactivity — i.e. read by `$effect`, `$derived`, or the template. Plain variables are fine otherwise.
- Objects/arrays with `$state` are deeply reactive via Proxy, which has a perf cost. For large objects that are _reassigned_ rather than mutated (e.g. API responses), prefer `$state.raw`.

## `$derived`

Compute values from state with `$derived`, never with `$effect`:

```js
// ✅
let square = $derived(num * num);

// ❌
let square;
$effect(() => {
  square = num * num;
});
```

- `$derived` takes an expression, not a function. For complex logic use `$derived.by(() => { ... })`.
- Deriveds are assignable like `$state`, and re-evaluate when dependencies change.
- Object/array deriveds are _not_ deeply reactive, but you can nest `$state` inside `$derived.by` when needed.

## `$effect`

Effects are an escape hatch. Use cautiously. **Do not update state inside an effect.**

- Syncing with external libs (e.g. D3): use `{@attach ...}` instead.
- User interactions: use event handlers or function bindings.
- Debugging: use `$inspect`, not `$effect`.
- Observing external sources: use `createSubscriber`.
- **Never** wrap an effect in `if (browser)` — effects don't run on the server anyway.

## `$props`

Treat props as mutable (they can change). State derived from props should almost always use `$derived`:

```js
let { type } = $props();

// ✅ updates when `type` changes
let color = $derived(type === 'danger' ? 'red' : 'green');

// ❌ stays frozen at initial value
let color = type === 'danger' ? 'red' : 'green';
```

## `$inspect.trace`

When reactivity misbehaves, drop `$inspect.trace(label)` as the first line of an `$effect`, `$derived.by`, or a function they call. It logs why the block re-ran (or why it didn't).

## Events

Element attributes starting with `on` are event listeners:

```svelte
<button onclick={() => {...}}>click me</button>
<button {onclick}>shorthand</button>
<button {...props}>spread</button>
```

Window/document events use `<svelte:window>` / `<svelte:document>`:

```svelte
<svelte:window onkeydown={...} />
<svelte:document onvisibilitychange={...} />
```

Do not register these via `onMount` or `$effect`.

## Snippets

Reusable markup via `{#snippet}` + `{@render}`:

```svelte
{#snippet greeting(name)}
  <p>hello {name}!</p>
{/snippet}

{@render greeting('world')}
```

- Top-level snippets (not inside elements/blocks) can live in `<script>`.
- Snippets that don't touch component state can be exported from `<script module>`.

## Each blocks

Always key each blocks — Svelte inserts/removes items surgically instead of repainting:

```svelte
{#each items as item (item.id)}
```

- The key must uniquely identify the item. **Never use the index as key.**
- Don't destructure items if you plan to mutate them through bindings.

## JS variables in CSS

Pass values to CSS via the `style:` directive + CSS custom properties:

```svelte
<div style:--columns={columns}>...</div>

<style>
  div {
    grid-template-columns: repeat(var(--columns), 1fr);
  }
</style>
```

## Styling child components

Scoped styles don't cross component boundaries. Expose CSS custom properties:

```svelte
<!-- Parent -->
<Child --color="red" />

<!-- Child -->
<style>
  h1 {
    color: var(--color);
  }
</style>
```

For third-party components, use `:global`:

```svelte
<div>
  <Child />
</div>

<style>
  div :global {
    h1 {
      color: red;
    }
  }
</style>
```

## Context

Prefer context over module-level state — it scopes reactivity per component tree and prevents cross-user leakage during SSR. Use `createContext` (type-safe) instead of raw `setContext`/`getContext`.

## Async Svelte

Svelte 5.36+ supports `await` in components and a hydratable promise API, gated by `experimental.async` in `svelte.config.js`. Still unstable — opt in deliberately.

## Do not use legacy patterns

Runes mode only. Replace:

| Legacy                                 | Use instead                                |
| -------------------------------------- | ------------------------------------------ |
| implicit reactive `let`                | `$state`                                   |
| `$:` reactive statements               | `$derived` / `$effect`                     |
| `export let`, `$$props`, `$$restProps` | `$props`                                   |
| `on:click={...}`                       | `onclick={...}`                            |
| `<slot>`, `$$slots`                    | `{#snippet ...}` + `{@render ...}`         |
| `<svelte:component>`                   | `<DynamicComponent>`                       |
| `<svelte:self>`                        | `<Self>`                                   |
| stores (`writable`, etc.)              | classes with `$state`                      |
| `use:action`                           | `{@attach ...}`                            |
| `class:foo={bar}` directive            | clsx-style arrays/objects in `class={...}` |

## Styling

Use `<style lang="scss">` style block.
Use style nesting.

### CSS units

- **`rem` pour la typographie** : `font-size` et `line-height` toujours en `rem` (ex. `font-size: 0.875rem`, `line-height: 1.5rem`). C'est la convention dominante du projet (~500 occurrences) et ça respecte la taille de police préférée de l'utilisateur.
- **`px` pour le layout** : `padding`, `margin`, `gap`, `width`, `height`, `border-radius`, `border` restent en `px`. C'est ce qui est utilisé partout dans la codebase.
- Pas de `em` (sauf cas justifié, ex. taille relative à un parent typographique précis).

# Workflow Figma

Sur un travail à partir d'une maquette Figma, dès que tu penses avoir besoin d'un SVG (icône, illustration, pictogramme…) : **demande-le-moi** et je le déposerai dans `public/assets/images/`.

- ❌ Ne va **pas** récupérer le SVG toi-même (export Figma, `upload_assets`, etc.) — c'est trop long.
- ✅ Indique-moi précisément quel asset il te faut (nom, usage) et attends que je l'aie placé dans `public/assets/images/` avant de continuer.

## Inclure un SVG

Toujours inclure un SVG via une balise `<img>` qui pointe vers le fichier, **jamais** en inlinant le markup `<svg>...</svg>` dans le composant :

```svelte
<img src="/assets/images/illustration_data_security.svg" alt="" />
```

# MSS UI kit

Ce projet expose une bibliothèque de composants UI dans `svelte/lib/ui/` et des web components DSFR (`dsfr-*`). **Ne jamais réinventer un primitive** : chercher d'abord dans `svelte/lib/ui/`, puis dans les web components DSFR, avant d'écrire du HTML/CSS brut.

## Référence des web components de l'UI Kit

Les composants de l'UI Kit sont préfixés par `dsfr-`.
Le Storybook est sur https://betagouv.github.io/lab-anssi-ui-kit
Référence complète (tags, props, types, attributs, exemples de markup) — fetch si besoin :
https://betagouv.github.io/lab-anssi-ui-kit/ui-kit-components.json

## Inputs de formulaire

### Champ texte → `InputDSFR`

Pour tout champ de saisie texte (`type="text"`, `email`, `password`, `number`, etc.), utiliser le wrapper `InputDSFR` (`svelte/lib/ui/InputDSFR.svelte`), **pas** un `<input>` natif ni un `<dsfr-input>` direct.

```svelte
<script lang="ts">
  import InputDSFR from '../ui/InputDSFR.svelte';

  let email = $state('');
</script>

<InputDSFR
  label="Adresse e-mail"
  type="email"
  bind:value={email}
  required
  maxlength={200}
/>
```

- `label` est obligatoire (a11y). Pour cacher visuellement le label, descendre sur `<dsfr-input hideLabel>` (cf. plus bas).
- `value` est bindable (`$bindable`) — utiliser `bind:value={...}`.
- `type` par défaut : `"text"`.
- Tout autre attribut HTML (`required`, `minlength`, `maxlength`, `placeholder`, `autocomplete`, `id`, `name`, `disabled`…) est transmis tel quel via `...props`.

Exemples de référence : `EtapeAutorite.svelte`, `ContactsUtiles.svelte`, `EtapeDecision.svelte`.

### Quand descendre au `<dsfr-input>` direct

`InputDSFR` ne couvre pas tous les attributs du web component. Utiliser `<dsfr-input>` directement uniquement si on a besoin de :

- `status` / `errorMessage` (états d'erreur visuels DSFR),
- `hideLabel` (label uniquement pour les lecteurs d'écran),
- `nom` (attribut DOM utilisé pour `querySelector('dsfr-input[nom="..."]')`),
- `bind:this` sur l'élément (pour focus, sélection, etc.).

**Piège web component** : `dsfr-input` est un custom element, pas un composant Svelte. Conséquences :

- **Pas de `bind:value`.** Passer la valeur en attribut (`value={maValeur}`) et écouter `onvaluechanged` qui reçoit un `CustomEvent<string>` :

  ```svelte
  <dsfr-input
    label="SIRET"
    type="text"
    nom="siret"
    value={saisie}
    onvaluechanged={(e: CustomEvent<string>) => (saisie = e.detail)}
  ></dsfr-input>
  ```

- Toujours fermer avec `</dsfr-input>` (balise non auto-fermante).

Exemple de référence : `ChampOrganisation.svelte`.

### À ne pas faire

- ❌ `<input type="text" />` natif dans un formulaire utilisateur — pas de style DSFR, pas d'a11y label gérée.
- ❌ Wrapper maison autour de `<input>` pour refaire le style DSFR — `InputDSFR` existe déjà.
- ❌ `bind:value` sur un `<dsfr-input>` direct — ça ne marche pas, c'est un web component.
