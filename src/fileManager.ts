import type {  Vault } from 'obsidian';
import { get } from 'svelte/store';
import { Renderer } from '~/renderer';
import { settingsStore } from '~/store';
import { sanitizeTitle } from '~/utils/sanitizeTitle';
import type { Article } from '~/models';

const articleFolderPath = (article: Article): string => {
  const settings = get(settingsStore);
  if (settings.useDomainFolders) {
    // "metadata.author" is equal to the article domain at the moment
    return `${settings.highlightsFolder}/${article.metadata.author}`;
  }

  return settings.highlightsFolder;
};

export default class FileManager {
  private vault: Vault;
  private renderer: Renderer;

  constructor(vault: Vault) {
    this.vault = vault;
    this.renderer = new Renderer();
  }

  public async createFolder(folderPath: string): Promise<void> {
    await this.vault.createFolder(folderPath);
  }

  public async createFile(filePath: string, content: string): Promise<void> {
    await this.vault.create(filePath, content);
  }

  public async createOrUpdate(article: Article): Promise<boolean> {
    const folderPath = articleFolderPath(article);
    const fileName = `${sanitizeTitle(article.metadata.title)}.md`;
    const filePath = `${folderPath}/${fileName}`
    let createdNewArticle = false;

    if (!(await this.vault.adapter.exists(folderPath))) {

      console.info(`Folder ${folderPath} not found. Will be created`);
      await this.createFolder(folderPath);
    }

    if (!(await this.vault.adapter.exists(filePath))) {

      console.info(`Document ${filePath} not found. Will be created`);
      const content = this.renderer.render(article);
      await this.createFile(filePath, content);
      createdNewArticle = true;
      await settingsStore.actions.addSyncedFile({filename: fileName, uri: encodeURIComponent(article.metadata.url)});
    }
    else {

      console.info(`Document ${article.metadata.title} found. Loading content and updating highlights`);
      const content = this.renderer.render(article, false);
      const fileContent = await this.vault.adapter.read(filePath);
      const contentToSave = fileContent + content;
      await this.vault.adapter.write(filePath, contentToSave);

    }

    return createdNewArticle;
  }

}

