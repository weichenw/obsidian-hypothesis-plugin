import md5 from 'crypto-js/md5';
import { moment } from 'obsidian';
import { settingsStore } from '~/store';
import { get } from 'svelte/store';

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


const parseSyncResponse = async (data) => {
    const momentFormat = get(settingsStore).dateTimeFormat;
    const groups = get(settingsStore).groups;

    return data.reduce((result, current) => {

        //skip pdf source
        if ((current['uri']).startsWith('urn:x-pdf')) {
            return result;
        }

        //Check if group is selected
        const group = groups.find(k => k.id == current['group']);
        if (!group.selected) {
            return result;
        }

        const md5Hash = md5(current['uri']);
        let selectorText = 'No highlighted text';

        try {

            // Get document metadata; title
            if (!result[md5Hash]) {
                result[md5Hash] = { id: md5Hash, metadata: { title: current['document']['title'][0], url: current['uri'], author: parseAuthorUrl(current['uri']) }, highlights: [] };
            }

            // Get highlighted text
            const val = "TextQuoteSelector";
            const selector = current['target'][0]['selector']
            selector.find(function (item, i) {
                if (item.type === val) {
                    selectorText = item.exact;
                    return i;
                }
            });

            result[md5Hash].highlights.push(
                {
                    id: current['id'],
                    created: moment(current['created']).format(momentFormat),
                    updated: moment(current['updated']).format(momentFormat),
                    text: selectorText && cleanTextSelectorHighlight(selectorText),
                    incontext: current['links']['incontext'],
                    user: current['user'],
                    annotation: current['text'],
                    tags: current['tags'],
                    group: group.name,
                }
            );

        } catch (error) {
            console.log(`Possible missing highlights or document title. ${error}`, current);
        }

        return result;
    }, {});

}

export default parseSyncResponse;