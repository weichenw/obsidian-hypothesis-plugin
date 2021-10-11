import { Notice, Plugin, addIcon } from 'obsidian';
import { SettingsTab } from '~/settingsTab';
import { initialise, settingsStore } from '~/store';
import { get } from 'svelte/store';
import SyncHypothesis from '~/sync/syncHypothesis';
import hypothesisIcon from '~/assets/hypothesisIcon.svg'
import FileManager from '~/fileManager';

addIcon('hypothesisIcon', hypothesisIcon);

export default class HypothesisPlugin extends Plugin {
	private syncHypothesis!: SyncHypothesis;

	async onload(): Promise<void> {
		console.log('loading plugin', new Date().toLocaleString());

		await initialise(this);

		const fileManager = new FileManager(this.app.vault, this.app.metadataCache);

		this.syncHypothesis = new SyncHypothesis(fileManager);

		this.addRibbonIcon('hypothesisIcon', 'Sync your hypothesis highlights', () => {
			 if (!get(settingsStore).isConnected) {
				new Notice('Please configure Hypothesis API token in the plugin setting');
			 } else {
				this.startSync();
			 }
		});

		// this.addStatusBarItem().setText('Status Bar Text');

		this.addCommand({
			id: 'hypothesis-sync',
			name: 'Sync highlights',
			callback: () => {
				if (!get(settingsStore).isConnected) {
					new Notice('Please configure Hypothesis API token in the plugin setting');
				} else {
					this.startSync();
				}
			},
		});

		this.addSettingTab(new SettingsTab(this.app, this));

		if (get(settingsStore).syncOnBoot) {
			if (get(settingsStore).isConnected) {
				await this.startSync();
			} else{
				console.info('Sync disabled. API Token not configured');
			}
		}
	}

	async onunload() : Promise<void> {
		console.log('unloading plugin', new Date().toLocaleString());
	}

	async startSync(): Promise<void> {
		console.log('Start syncing...')
		await this.syncHypothesis.startSync();
	}
}