export const featureFlags = {
  planAction: () =>
    import.meta.env.VITE_FEATURE_FLAG_AVEC_PLAN_ACTION === 'true',
};
