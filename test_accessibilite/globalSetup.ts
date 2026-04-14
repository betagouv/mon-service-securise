import { rmSync } from 'fs';

export default async () => {
  rmSync('test_accessibilite/rapport/violations.jsonl', { force: true });
};
