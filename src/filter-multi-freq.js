import { both, either, filter } from 'ramda';

/**
 * Filter the `data`, keeping only multiterms and frequent monoterms.
 *
 * @export
 * @param {Stream} data
 * @param {Array<Object>} feed
 * @param {Number}  [multiLimit=2]  threshold for being a multiterm (in tokens number)
 * @param {Number}  [minFrequency=7]    minimal frequency to be taken as a frequent term
 */
export default function TEEFTFilterMultiFreq(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const multiLimit = this.getParam('multiLimit', 2);
    const minFrequency = this.getParam('minFrequency', 7);

    const isMonoTerm = word => word.length < multiLimit;
    const isFrequent = word => word.frequency >= minFrequency;
    const isMultiTerm = word => word.length >= multiLimit;

    const isFrequentMonoTerm = both(isMonoTerm, isFrequent);
    const isMultiFrequency = either(isFrequentMonoTerm, isMultiTerm);

    const filterMultiFrequency = filter(isMultiFrequency);
    feed.write(filterMultiFrequency(data));
    feed.end();
}
