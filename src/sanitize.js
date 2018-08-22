import fs from 'fs';
import path from 'path';
import { AssertionError } from 'assert';

function getResource(fileName) {
    const filePath = path.resolve('__dirname__', `../resources/${fileName}.txt`);
    const text = fs.readFileSync(filePath, { encoding: 'utf-8' });
    return text.split('\n');
}

/**
 * Sanitize the text in input, by remove stopwords
 *
 * @export
 * @param {Stream} data
 * @param {Array<Object>} feed
 * @param {string} [stopwords='StopwFrench']    name of the stopwords file to use
 * @returns
 */
export default function TEEFTSanitize(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const stopWordsFile = this.getParam('stopwords', 'StopwFrench');
    const stopWords = getResource(stopWordsFile);
    const res = data
        .filter(w => !stopWords.includes(w.lemma));
    feed.write(res);
    feed.end();
}
