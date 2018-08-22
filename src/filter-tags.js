/**
 * Filter the text in input, by keeping only adjectives and names
 *
 * @export
 * @param {Stream} data
 * @param {Array<Object>} feed
 * @param {string} [tags=['ADJ', 'NOM']]  Tags to keep
 * @returns
 */
export default function TEEFTFilterTags(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const tagsToKeep = this.getParam('tags', ['ADJ', 'NOM']);
    const res = data
        .filter(w => tagsToKeep.includes(w.pos[0]));
    feed.write(res);
    feed.end();
}
