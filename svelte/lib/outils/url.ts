export function enleveParametreDeUrl(parametre: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete(parametre);
  window.history.replaceState({}, '', url);
}

export function ajouteParametreAUrl(parametre: string, valeur: string) {
  const url = new URL(window.location.href);
  url.searchParams.append(parametre, valeur);
  window.history.replaceState({}, '', url);
}
