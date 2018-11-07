
/**
 * Filter multiterm to keep only multiterms which specificity is higher than
 * multiterms' average specificity.
 *
 * @export
 * @param {*} data
 * @param {*} feed
 */
export default function TEEFTFilterMultiSpec(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    feed.end();
}
