import templateInstructions from './templateInstructions.html';
import datetimeInstructions from './datetimeInstructions.html';
import type HypothesisPlugin from '~/main';
import pickBy from 'lodash.pickby';
import { App, PluginSettingTab, Setting } from 'obsidian';
import { get } from 'svelte/store';
import { Renderer } from '~/renderer';
import { settingsStore } from '~/store';
import { TokenManager } from '~/store/tokenManager';
import ApiTokenModal from '~/modals/apiTokenModal';
import ResyncDelFileModal from '~/modals/resyncDelFileModal';
import SyncGroup from '~/sync/syncGroup';
import ManageGroupsModal from '~/modals/manageGroupsModal';

const { moment } = window;

export class SettingsTab extends PluginSettingTab {
  public app: App;
  private plugin: HypothesisPlugin;
  private renderer: Renderer;
  private tokenManager: TokenManager;
  private syncGroup: SyncGroup;

  constructor(app: App, plugin: HypothesisPlugin) {
    super(app, plugin);
    this.app = app;
    this.plugin = plugin;
    this.renderer = new Renderer();
    this.tokenManager = new TokenManager();
    this.syncGroup = new SyncGroup();
  }

  public async display(): Promise<void> {
    const { containerEl } = this;

    containerEl.empty();

    if (get(settingsStore).isConnected) {
      this.disconnect();
    } else {
      this.connect();
    }
    this.autoSyncInterval();
    this.highlightsFolder();
    this.folderPath();
    this.folderURLPath()
    this.syncOnBoot();
    this.dateFormat();
    this.template();
    this.manageGroups();
    this.resetSyncHistory();
  }

  private disconnect(): void {
    const syncMessage = get(settingsStore).lastSyncDate
      ? `Last sync ${moment(get(settingsStore).lastSyncDate).fromNow()}`
      : 'Sync has never run';

    const descFragment = document.createRange().createContextualFragment(`
      ${get(settingsStore).history.totalArticles} article(s) & ${get(settingsStore).history.totalHighlights} highlight(s) synced<br/>
      ${syncMessage}
    `);

    new Setting(this.containerEl)
      .setName(`Connected to Hypothes.is as ${(get(settingsStore).user).match(/([^:]+)@/)[1]}`)
      .setDesc(descFragment)
      .addButton((button) => {
        return button
          .setButtonText('Disconnect')
          .setCta()
          .onClick(async () => {
            button
              .removeCta()
              .setButtonText('Removing API token...')
              .setDisabled(true);

            await settingsStore.actions.disconnect();

            this.display(); // rerender
          });
      });
  }

  private connect(): void {
    new Setting(this.containerEl)
      .setName('Connect to Hypothes.is')
      .addButton((button) => {
        return button
          .setButtonText('Connect')
          .setCta()
          .onClick(async () => {
            button
              .removeCta()
              .setButtonText('Removing API token...')
              .setDisabled(true);

            const tokenModal = new ApiTokenModal(this.app, this.tokenManager);
            await tokenModal.waitForClose;

            this.display(); // rerender
          });
      });
  }

  private autoSyncInterval(): void {
    new Setting(this.containerEl)
    .setName('Auto sync in interval (minutes)')
    .setDesc('Sync every X minutes. To disable auto sync, specify negative value or zero (default)')
    .addText((text) => {
      text
        .setPlaceholder(String(0))
        .setValue(String(get(settingsStore).autoSyncInterval))
        .onChange(async (value) => {
          if (!isNaN(Number(value))) {
            const minutes = Number(value);
            await settingsStore.actions.setAutoSyncInterval(minutes);
            const autoSyncInterval = get(settingsStore).autoSyncInterval;
            console.log(autoSyncInterval);
            if (autoSyncInterval > 0) {
              this.plugin.clearAutoSync();
              this.plugin.startAutoSync(minutes);
              console.log(
                  `Auto sync enabled! Every ${minutes} minutes.`
              );
            } else if (autoSyncInterval <= 0) {
              this.plugin.clearAutoSync() && console.log("Auto sync disabled!");
            }
          }
        });
    });
  }

  private highlightsFolder(): void {
    new Setting(this.containerEl)
      .setName('Highlights folder location')
      .setDesc('Vault folder to use for writing hypothesis highlights')
      .addDropdown((dropdown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const files = (this.app.vault.adapter as any).files;
        const folders = pickBy(files, (val) => {
          return val.type === 'folder';
        });

        Object.keys(folders).forEach((val) => {
          dropdown.addOption(val, val);
        });
        return dropdown
          .setValue(get(settingsStore).highlightsFolder)
          .onChange(async (value) => {
            await settingsStore.actions.setHighlightsFolder(value);
          });
      });
  }

  private template(): void {

    const descFragment = document
      .createRange()
      .createContextualFragment(templateInstructions);

    new Setting(this.containerEl)
      .setName('Highlights template')
      .setDesc(descFragment)
      .addTextArea((text) => {
        text.inputEl.style.width = '100%';
        text.inputEl.style.height = '450px';
        text.inputEl.style.fontSize = '0.8em';
        text
          .setValue(get(settingsStore).template)
          .onChange(async (value) => {
            const isValid = this.renderer.validate(value);

            if (isValid) {
              await settingsStore.actions.setTemplate(value);
            }

            text.inputEl.style.border = isValid ? '' : '1px solid red';
          });
        return text;
      });
  }

  private folderPath(): void {
    new Setting(this.containerEl)
    .setName('Use domain folders')
    .setDesc('Group generated files into folders based on the domain of the annotated URL')
    .addToggle((toggle) =>
      toggle
        .setValue(get(settingsStore).useDomainFolders)
        .onChange(async (value) => {
          await settingsStore.actions.setUseDomainFolder(value);
        })
    );
  }

  private folderURLPath(): void {

    new Setting(this.containerEl)
    .setName('Use URL path folders')
    .setDesc('The generated file directory is based on the path of the highlight URL.' +
        'This option is designed to prevent filename conflicts caused by identical webpage titles under different paths of a website' +
        'It is recommended to enable this option only when "Use domain folders" is enabled.')
    .addToggle((toggle) =>
      toggle
        .setValue(get(settingsStore).useDomainFolders)
        .onChange(async (value) => {
          await settingsStore.actions.setURLPathFolders(value);
        })
    );
  }

  private syncOnBoot(): void {
    new Setting(this.containerEl)
      .setName('Sync on Startup')
      .setDesc(
        'Automatically sync new highlights when Obsidian starts'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(get(settingsStore).syncOnBoot)
          .onChange(async (value) => {
            await settingsStore.actions.setSyncOnBoot(value);
          })
      );
  }

  private resetSyncHistory(): void {
    new Setting(this.containerEl)
      .setName('Reset sync')
      .setDesc('Wipe sync history to allow for resync')
      .addButton((button) => {
        return button
          .setButtonText('Reset')
          .setDisabled(!get(settingsStore).isConnected)
          .setWarning()
          .onClick(async () => {
            await settingsStore.actions.resetSyncHistory();
            this.display(); // rerender
          });
      });
  }

  private dateFormat(): void {
    const descFragment = document
      .createRange()
      .createContextualFragment(datetimeInstructions);

    new Setting(this.containerEl)
      .setName('Date & time format')
      .setDesc(descFragment)
      .addText((text) => {
        text
          .setPlaceholder('YYYY-MM-DD HH:mm:ss')
          .setValue(get(settingsStore).dateTimeFormat)
          .onChange(async (value) => {
            await settingsStore.actions.setDateTimeFormat(value);
          });
      });
  }

  private async resyncDeletedFile(): Promise<void> {
    new Setting(this.containerEl)
      .setName('Sync deleted file(s)')
      .setDesc('Manually sync deleted file(s)')
      .addButton((button) => {
        return button
          .setButtonText('Show deleted file(s)')
          .setCta()
          .onClick(async () => {
            button
              .removeCta()
              .setButtonText('Resync deleted file..')
              .setDisabled(true);

            const resyncDelFileModal = new ResyncDelFileModal(this.app);
            await resyncDelFileModal.waitForClose;

            this.display(); // rerender
          });
      });
  }

  private async manageGroups(): Promise<void> {
    const descFragment = document.createRange().createContextualFragment(`Add/remove group(s) to be synced.<br/>
      ${(get(settingsStore).groups).length} group(s) synced from Hypothesis<br/>`);

    new Setting(this.containerEl)
      .setName('Groups')
      .setDesc(descFragment)
      .addExtraButton((button) => {
        return button
          .setIcon('switch')
          .setTooltip('Reset group selections')
          .setDisabled(!get(settingsStore).isConnected)
          .onClick(async () => {
            await settingsStore.actions.resetGroups();
            await this.syncGroup.startSync();
            this.display(); // rerender
          });
      })
      .addButton((button) => {
        return button
          .setButtonText('Manage')
          .setCta()
          .setDisabled(!get(settingsStore).isConnected)
          .onClick(async () => {
            const manageGroupsModal = new ManageGroupsModal(this.app);
            await manageGroupsModal.waitForClose;
            this.display(); // rerender
          });
      });
  }
}
