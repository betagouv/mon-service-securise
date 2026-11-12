import { DescriptionServiceV2 } from '../descriptionServiceV2.js';

export type ContexteDuService = {
  description?: string;
};

export const contexteDuService = (
  description: DescriptionServiceV2
): ContexteDuService => ({
  description: description.presentation,
});
