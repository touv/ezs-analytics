import words from 'talisman/tokenizers/words';

function TEEFTTokenize(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const docsIn = Array.isArray(data) ? data : [data];

    const docsOut = docsIn.map(doc => ({
        path: doc.path,
        sentences: doc.sentences.map(words),
    }));
    feed.write(docsOut);
    feed.end();
}

/**
 * Extract tokens from an array of documents (objects { path, sentences: [] }).
 *
 * Yields an array of documents (objects: { path, sentences: [[]] })
 *
 * @see http://yomguithereal.github.io/talisman/tokenizers/words
 * @export
 */
export default {
    TEEFTTokenize,
};
