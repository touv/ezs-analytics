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
export default function TEEFTFilterMonoFreq(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const multiLimit = this.getParam('multiLimit', 2);
    const minFrequency = this.getParam('minFrequency', 7);

    const isMonoTerm = term => term.length < multiLimit;
    const isFrequent = term => term.frequency >= minFrequency;
    const isMultiTerm = term => term.length >= multiLimit;

    const isFrequentMonoTerm = both(isMonoTerm, isFrequent);
    const isMultiOrFrequent = either(isFrequentMonoTerm, isMultiTerm);

    const filterMultiFrequency = filter(isMultiOrFrequent);

    const documents = Array.isArray(data) ? data : [data];
    const results = documents.map((document) => {
        const { terms } = document;
        const filteredTerms = filterMultiFrequency(terms);
        const res = {
            ...document,
            terms: filteredTerms,
        };
        return res;
    });
    feed.write(results);
    feed.end();
}
