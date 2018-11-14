import { SentenceTokenizer } from 'natural';

const tokenizer = new SentenceTokenizer();

/**
 * Segment the data into an array of sentences.
 *
 * @export
 * @param {Stream} data Array of strings
 * @param {Array<String>} feed
 */
export default function TEEFTSentenceTokenize(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const docsIn = Array.isArray(data) ? data : [data];
    const docsOut = docsIn.map(doc => ({
        path: doc.path,
        sentences: tokenizer.tokenize(doc.content),
    }));
    feed.write(docsOut);
    feed.end();
}
