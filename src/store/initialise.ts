import type HypothesisPlugin from '../main';
import { settingsStore } from './settings';

export async function initialise(plugin: HypothesisPlugin): Promise<void> {
  await settingsStore.initialise(plugin);
}
