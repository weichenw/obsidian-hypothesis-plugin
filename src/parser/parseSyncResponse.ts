import md5 from 'crypto-js/md5';

const parseAuthorUrl = (url: string) => {
    const domain = (new URL(url));
    const author = domain.hostname.replace('www.','');
    return author;
}


const parseSyncResponse = async (data) => {

        return data.reduce((result, current) => {

            const md5Hash = md5(current['uri']);
            let selectorText = 'No highlighted text';

            if (!result[md5Hash]) {
                result[md5Hash] = { id: md5Hash,  metadata: { title: current['document']['title'][0], url: current['uri'], author: parseAuthorUrl(current['uri'])},highlights: [] };
            }

            try {
                const val = "TextQuoteSelector";
                const selector = current['target'][0]['selector']
                selector.find(function(item, i) {
                    if (item.type === val) {
                        selectorText = item.exact;
                        return i;
                    }
                });
            } catch (error) {
                // console.log(`no highlights found possible only annotations, {$current}`);
            }

            result[md5Hash].highlights.push(
                {
                    id: current['id'],
                    created: current['created'],
                    updated: current['updated'],
                    text: selectorText,
                    incontext: current['links']['incontext'],
                    user: current['user'],
                    annotation: current['text'],
                    tags: current['tags'],
                }
            );
            return result;
        }, {});

}

export default parseSyncResponse;