import md5 from 'crypto-js/md5';
import { moment } from 'obsidian';
import { settingsStore } from '~/store';
import { get } from 'svelte/store';
import basex from 'base-x';
import type { Article, Highlights } from '../models'

const BASE62_CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = basex(BASE62_CHARSET);

const parseAuthorUrl = (url: string) => {
    const domain = (new URL(url));
    const author = domain.hostname.replace('www.', '');
    return author;
}

// Strip excessive whitespace and newlines from the TextQuoteSelector highlight text
// This mirrors how Hypothesis displays annotations, to remove artifacts from the HTML annotation anchoring
export const cleanTextSelectorHighlight = (text: string): string => {
    text = text.replaceAll('\n', ' ') // e.g. http://www.paulgraham.com/venturecapital.html
    text = text.replace('\t', ' ') // e.g. https://sive.rs/about

    // Remove space-indented lines, e.g. https://calpaterson.com/bank-python.html
    while (text.contains('  ')) {
        text = text.replaceAll('  ', ' ')
    }

    return text
};

const parseTitleFromUrl = (url: string) => {
    const domain = (new URL(url));
    let pathname = domain.pathname
    // Remove leading and optional trailing slash
    pathname = pathname.slice(1)
    if (pathname.endsWith("/")) {
        pathname = pathname.slice(0, pathname.length - 1)
    }

    return pathname.replaceAll('/', '-');
}

const parseHighlight = (annotationData, groupName: string, momentFormat: string): Highlights => {
    try {
        // Get highlighted text or reply
        let isReply, highlightText = null;
        const selector = annotationData['target'][0]['selector']
        if (selector) {
            highlightText = selector
                .find(item => item.type === "TextQuoteSelector")
                ?.exact
        } else {
            // Could be page note or reply
            if (annotationData['references']) {
                isReply = true
            }
        }

        const id = annotationData['id'];
        let id_base62 = null;
        if(id != null){
            const uint8Array = Buffer.from(id, 'utf-8');
            id_base62 = base62.encode(uint8Array);
        }

        return {
            id,
            id_base62,
            created: moment(annotationData['created']).format(momentFormat),
            updated: moment(annotationData['updated']).format(momentFormat),
            text: highlightText && cleanTextSelectorHighlight(highlightText),
            incontext: annotationData['links']['incontext'],
            user: annotationData['user'],
            annotation: annotationData['text'],
            tags: annotationData['tags'],
            group: groupName,
            isReply,
        }
    } catch (error) {

        console.log(`Error parsing annotation format: ${error}`, annotationData);
        return null
    }
}


const parseSyncResponse = (data): Article[] => {
    const momentFormat = get(settingsStore).dateTimeFormat;
    const groups = get(settingsStore).groups;

    // Group annotations per article
    const articlesMap = data.reduce((result, annotationData) => {
        const url = annotationData['uri'];
        const md5Hash = md5(url);

        // Skip pdf source
        if ((url).startsWith('urn:x-pdf')) {
            return result;
        }

        // Check if group is selected
        const group = groups.find(k => k.id == annotationData['group']);
        if (!group.selected) {
            return result;
        }


        const title = annotationData['document']['title']?.[0] || parseTitleFromUrl(url);
        const author = parseAuthorUrl(url);
        // Set article metadata, if not already set by previous annotation
        if (!result[md5Hash]) {
            result[md5Hash] = { id: md5Hash, metadata: { title, url, author }, highlights: [], page_notes: [] };
        }

        const annotation = parseHighlight(annotationData, group.name, momentFormat)
        if (!annotation.text && !annotation.isReply) {
            result[md5Hash].page_notes.push(annotation);
        } else {
            result[md5Hash].highlights.push(annotation);
        }

        return result;
    }, {});

    return Object.values(articlesMap)
}

export default parseSyncResponse;