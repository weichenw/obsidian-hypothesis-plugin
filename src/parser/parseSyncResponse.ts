import md5 from 'crypto-js/md5';

const parseAuthorUrl = (url: string) => {
    let domain = (new URL(url));
    const author = domain.hostname.replace('www.','');
    return author;
}


const parseSyncResponse = async (data) => {

        return data.reduce((result, current) => {

            const md5Hash = md5(current['uri']);

            if (!result[md5Hash]) {
                result[md5Hash] = { id: md5Hash,  metadata: { title: current['document']['title'][0], url: current['uri'], author: parseAuthorUrl(current['uri'])},highlights: [] };
            }

            result[md5Hash].highlights.push(
                {
                    id: current['id'],
                    created: current['created'],
                    updated: current['updated'],
                    text: current['target'][0]['selector'][2]['exact'],
                    incontext: current['links']['incontext'],
                    user: current['user'],
                    location: current['target'][0]['selector'][1]['start'],
                    annotation: current['text'],
                    tags: current['tags'],
                }
            );
            return result;
        }, {});

}

export default parseSyncResponse;