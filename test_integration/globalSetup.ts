import { FullConfig } from '@playwright/test';

export default async (config: FullConfig) => {
  process.env.SECRET_JWT = config.webServer!.env!.SECRET_JWT;
};
