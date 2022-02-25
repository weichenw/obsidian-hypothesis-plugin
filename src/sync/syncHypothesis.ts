import { settingsStore, syncSessionStore } from '~/store';
import type { SyncState } from './syncState';
import { get } from 'svelte/store';
import ApiManager from '~/api/api';
import parseSyncResponse from '~/parser/parseSyncResponse';
import SyncGroup from './syncGroup';
import type FileManager from '~/fileManager';
import type { Article } from '~/models';

export default class SyncHypothesis {

    private syncState: SyncState = { newArticlesSynced: 0, newHighlightsSynced: 0 };
    private syncGroup: SyncGroup;
    private fileManager: FileManager;

    constructor(fileManager: FileManager) {
        this.fileManager = fileManager;
        this.syncGroup = new SyncGroup;
    }

    async startSync(uri?: string) {
        this.syncState = { newArticlesSynced: 0, newHighlightsSynced: 0 };

        const token = await get(settingsStore).token;
        const userid = await get(settingsStore).user;

        const apiManager = new ApiManager(token, userid);

        syncSessionStore.actions.startSync();

        //fetch groups
        await this.syncGroup.startSync();

        //fetch highlights
        const responseBody: [] = (!uri) ? await apiManager.getHighlights(get(settingsStore).lastSyncDate) : await apiManager.getHighlightWithUri(uri);
        const articles = await parseSyncResponse(responseBody);

        syncSessionStore.actions.setJobs(articles);

        if (articles.length > 0) {
            await this.syncArticles(articles);
        }

        syncSessionStore.actions.completeSync({
            newArticlesCount: this.syncState.newArticlesSynced,
            newHighlightsCount: this.syncState.newHighlightsSynced,
            updatedArticlesCount: 0,
            updatedHighlightsCount: 0,
        });
    }

    private async syncArticles(articles: Article[]): Promise<void> {

        for (const article of articles) {
            try {
                syncSessionStore.actions.startJob(article);

                await this.syncArticle(article);

                syncSessionStore.actions.completeJob(article);

            } catch (e) {
                console.error(`Error syncing ${article.metadata.title}`, e);
                syncSessionStore.actions.errorJob(article);
            }
        }
    }

    private async syncArticle(article: Article): Promise<void> {

        const createdNewArticle = await this.fileManager.saveArticle(article);

        if (createdNewArticle) {
            this.syncState.newArticlesSynced += 1;
        }
        this.syncState.newHighlightsSynced += article.highlights.length;

    }
}