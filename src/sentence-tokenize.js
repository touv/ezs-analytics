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
    feed.write(tokenizer.tokenize(data));
    feed.end();
}
