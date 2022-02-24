import matter from "gray-matter"
import type { Article } from '~/models';

type FrontMatterContent = {
    doc_type?: string;
    url?: string;
}

export const frontMatterDocType = "hypothesis-highlights"

export const addFrontMatter = (markdownContent: string, article: Article) => {
    const frontMatter: FrontMatterContent = {
        doc_type: frontMatterDocType,
        url: article.metadata.url,
    };
    return matter.stringify(markdownContent, frontMatter);
}
