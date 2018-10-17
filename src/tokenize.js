import words from 'talisman/tokenizers/words';

/**
 * Extract tokens from a text
 *
 * @see http://yomguithereal.github.io/talisman/tokenizers/words
 * @export
 * @param {Stream} data
 * @param {Array<Array<string>>>} feed
 */
export default function TEEFTTokenize(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    feed.write(data.map(words));
    feed.end();
}
