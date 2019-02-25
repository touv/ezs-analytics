import fs from 'fs';
import path from 'path';

export function getResource(fileName) {
    if (!fileName) return [];
    const filePath = path.resolve(__dirname, `../resources/${fileName}.txt`);
    const text = fs.readFileSync(filePath, { encoding: 'utf-8' });
    return text.split('\n');
}

/**
 * Filter the text in input, by removing stopwords in token
 *
 * @export
 * @param {Stream} data
 * @param {Array<Object>} feed
 * @param {string} [stopwords='StopwFrench']    name of the stopwords file to use
 * @returns
 */
export default function TEEFTStopWords(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const stopWordsFile = this.getParam('stopwords', 'StopwFrench');
    const stopWords = getResource(stopWordsFile);
    const documents = Array.isArray(data) ? data : [data];

    const isNotStopWord = w => !stopWords.includes(w.term && w.term.toLowerCase());

    const removeStopWordsFromDocument = ((document) => {
        const { terms } = document;
        return {
            ...document,
            terms: terms.filter(isNotStopWord),
        };
    });
    const results = documents.map(removeStopWordsFromDocument);
    feed.write(results);
    feed.end();
}
