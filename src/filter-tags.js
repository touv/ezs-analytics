/*
 * Check that a `text` begins with any of the `tags`.
 *
 * @param {Array<string>} tags
 * @param {string} text
 * @returns {Boolean}
 */
function beginsWith(tags, text) {
    return tags.some(tag => text.startsWith(tag));
}

/*
 * Check if some of the `texts` begins with any of the `tags`
 *
 * @param {Array<string>} tags
 * @param {Array<string>} texts
 * @returns {Boolean}
 */
function someBeginsWith(tags, texts) {
    return texts.some(text => beginsWith(tags, text));
}

/**
 * Filter the text in input, by keeping only adjectives and names
 *
 * @export
 * @param {Stream} data
 * @param {Array<Object>} feed
 * @param {string} [tags=['ADJ', 'NOM']]  Tags to keep
 */
export default function TEEFTFilterTags(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const tagsToKeep = this.getParam('tags', ['ADJ', 'NOM']);
    const res = data
        .filter(w => someBeginsWith(tagsToKeep, w.pos));
    feed.write(res);
    feed.end();
}
