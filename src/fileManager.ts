import type {  Vault } from 'obsidian';
import { get } from 'svelte/store';
import { Renderer } from '~/renderer';
import { settingsStore } from '~/store';
import { sanitizeTitle } from '~/utils/sanitizeTitle';
import type { Article } from '~/models';

const articleFilePath = (fileName: string): string => {
  // const fileName = sanitizeTitle(articleTitle);
  return `${get(settingsStore).highlightsFolder}/${fileName}.md`;
};

export default class FileManager {
  private vault: Vault;
  private renderer: Renderer;

  constructor(vault: Vault) {
    this.vault = vault;
    this.renderer = new Renderer();
  }

  public async createFile(filePath: string, article: Article, content: string): Promise<void> {

    await this.vault.create(filePath, content);
  }

  public async createOrUpdate(article: Article): Promise<boolean> {
    const fileName = sanitizeTitle(article.metadata.title);
    const filePath = articleFilePath(fileName);
    let createdNewArticle = false;

    if (!(await this.vault.adapter.exists(filePath))) {

      console.info(`Document ${filePath} not found. Will be created`);
      const content = this.renderer.render(article);
      await this.createFile(filePath,article, content);
      createdNewArticle = true;
      await settingsStore.actions.addSyncedFile({filename: `${fileName}.md`, uri: encodeURIComponent(article.metadata.url)});
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

