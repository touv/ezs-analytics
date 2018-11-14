import { SentenceTokenizer } from 'natural';

const tokenizer = new SentenceTokenizer();

function TEEFTSentenceTokenize(data, feed) {
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

/**
 * Segment the data into an array of documents (objects { path, content }).
 *
 * Yield an array of documents (objects { path, sentences: []})
 *
 * @export
 * @name TEEFTSentenceTokenize
 */
export default {
    TEEFTSentenceTokenize,
};
