export function enleveParametreDeUrl(parametre: string) {
  const url = new URL(window.location.href);
  url.searchParams.delete(parametre);
  window.history.replaceState({}, '', url);
}
