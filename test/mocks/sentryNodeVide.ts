// Remplace `@sentry/node` dans les tests : son import réel coûte ~2 s par
// fichier de test, alors qu'aucun test ne l'exerce (aucun DSN configuré).
export const init = () => {};
export const captureException = () => {};
export const withScope = () => {};
export const setExtra = () => {};
export const setTag = () => {};
export const setUser = () => {};
