import { App, Modal, Vault } from 'obsidian';
import ResyncDelFileModalContent from './resyncDelFileModal.svelte';
import { settingsStore } from '~/store';
import { get } from 'svelte/store';
import SyncHypothesis from '~/sync/syncHypothesis';
import FileManager from '~/fileManager';
import type { Article, SyncedFile } from '~/models';
import ApiManager from '~/api/api';
import parseSyncResponse from '~/parser/parseSyncResponse';

export default class ResyncDelFileModal extends Modal {
    private syncHypothesis!: SyncHypothesis;
    public waitForClose: Promise<void>;
    private resolvePromise: () => void;
    private modalContent: ResyncDelFileModalContent;
    private vault: Vault;
    private fileManager: FileManager

    constructor(app: App) {
        super(app);
        this.vault = app.vault;
        this.fileManager = new FileManager(this.vault, this.app.metadataCache);

        this.waitForClose = new Promise(
            (resolve) => (this.resolvePromise = resolve)
        );

        this.open();

    }

    async onOpen() {
        super.onOpen()
		this.syncHypothesis = new SyncHypothesis(this.fileManager);
        const deletedFiles = await this.retrieveDeletedFiles();

        this.titleEl.innerText = "Hypothes.is: Resync deleted file(s)";

        this.modalContent = new ResyncDelFileModalContent({
            target: this.contentEl,
            props: {
                deletedFiles: deletedFiles,
                onSubmit: async (value: { selected }) => {
                    if((!!value.selected) && value.selected.length > 0 ){
                        this.startResync(value.selected)
                    } else{
                        console.log('No files selected')
                    }
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

    async retrieveDeletedFiles(): Promise<SyncedFile[]> {
        const token = get(settingsStore).token;
        const userid = get(settingsStore).user;
        const apiManager = new ApiManager(token, userid);

        // Fetch all annotated articles that *should* be present
        const allAnnotations = await apiManager.getHighlights()
        const allArticles: [] = Object.values(await parseSyncResponse(allAnnotations));

        // Check which files are actually present
        const deletedArticles = await Promise.all(allArticles.filter(async article => !(await this.fileManager.isArticleSaved(article))));
        return await Promise.all(deletedArticles.map(async (article: Article) => 
            ({ uri: article.metadata.url, filename: (await this.fileManager.getNewArticleFilePath(article)).split('//')[1]})
        ));
    }

    async startResync(selectedFiles: SyncedFile[]): Promise<void> {
        selectedFiles.forEach(async selected => {
		console.log(`Start resync deleted file - ${selected.filename}`)
		await this.syncHypothesis.startSync(selected.uri);
        })
	}
}

