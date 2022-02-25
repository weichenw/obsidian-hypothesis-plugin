import nunjucks from 'nunjucks';
import { get } from 'svelte/store';
import { settingsStore } from '~/store';
import type { Article, RenderTemplate } from './models';

export class Renderer {
  constructor() {
    nunjucks.configure({ autoescape: false });
  }

  validate(template: string): boolean {
    try {
      nunjucks.renderString(template, {});
      return true;
    } catch (error) {
      return false;
    }
  }

  render(entry: Article, isNew = true): string {
    const { metadata , highlights, page_notes } = entry;

    const context: RenderTemplate = {
       is_new_article: isNew,
       ...metadata,
       highlights,
       page_notes,
    };

    const template = get(settingsStore).template;
    const content = nunjucks.renderString(template, context);
    return content;
  }
}
