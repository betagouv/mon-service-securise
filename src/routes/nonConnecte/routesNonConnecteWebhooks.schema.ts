import { z } from 'zod';

// Côté Brevo ce webhook sera appelé sur l'événement `contact_updated`
// … donc potentiellement bcp de fois, pour toutes sortes de mises à jour.
// On laisse volontairement passer la validation même sans `_PIXEL_TRACKING_CONSENT` :
// c'est la route qui fait un early return quand l'attribut est absent, pour ne pas
// déclencher notre code métier sur une mise à jour qui ne nous intéresse pas
// ni envoyer des erreurs 400 à tout va qui seront loguées dans Sentry pour rien.
export const schemaPostConsentementPixelDeSuivi = z.object({
  event: z.literal('contact_updated'),
  email: z.email(),
  content: z
    .array(
      z.object({
        attributes: z.object({
          _PIXEL_TRACKING_CONSENT: z.boolean().optional(),
        }),
      })
    )
    .min(1)
    .max(1),
});
