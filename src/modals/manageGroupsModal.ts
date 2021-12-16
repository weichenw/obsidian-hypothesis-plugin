import { App, Modal, Vault } from 'obsidian';
import ManageGroupsModalContent from './manageGroupsModal.svelte';
import { settingsStore } from '~/store';
import { get } from 'svelte/store';

export default class ManageGroupsModal extends Modal {
    public waitForClose: Promise<void>;
    private resolvePromise: () => void;
    private modalContent: ManageGroupsModalContent;
    vault: Vault;

    constructor(app: App) {
        super(app);

        this.waitForClose = new Promise(
            (resolve) => (this.resolvePromise = resolve)
        );

        this.open();

    }

    async onOpen() {
        super.onOpen()
        const groups = get(settingsStore).groups;

        this.titleEl.innerText = "Hypothes.is: Manage groups to be synced";

        this.modalContent = new ManageGroupsModalContent({
            target: this.contentEl,
            props: {
                groups: groups,
                onSubmit: async (value: { selectedGroups }) => {
                    this.setGroupsSettings(value.selectedGroups);
                    this.close();
                },
            },
        });

    }

    onClose() {
        super.onClose();
        this.modalContent.$destroy();
        this.resolvePromise();
    }

    async setGroupsSettings(selectedGroups) {

        const groups = get(settingsStore).groups;

        groups.forEach(group => {
            group.selected = selectedGroups.some((selectedGroup) => selectedGroup.id === group.id);
        })

        await settingsStore.actions.setGroups(groups);

    }

}

