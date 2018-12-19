import words from 'talisman/tokenizers/words';
import { map, replace } from 'ramda';

const hideDash = replace(/-/g, 'xyxyxyxyxyxy');
const revealDash = map(replace(/xyxyxyxyxyxy/g, '-'));

function TEEFTTokenize(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const docsIn = Array.isArray(data) ? data : [data];

    const docsOut = docsIn.map(doc => ({
        path: doc.path,
        sentences: doc.sentences
            .map(hideDash)
            .map(words)
            .map(revealDash),
    }));
    feed.write(docsOut);
    feed.end();
}

/**
 * Extract tokens from an array of documents (objects { path, sentences: [] }).
 *
 * Yields an array of documents (objects: { path, sentences: [[]] })
 *
 * > **Warning**: results are surprising on uppercase sentences
 *
 * @see http://yomguithereal.github.io/talisman/tokenizers/words
 * @export
 * @name TEEFTTokenize
 */
export default {
    TEEFTTokenize,
};
