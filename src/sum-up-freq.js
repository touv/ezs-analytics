import { mapObjIndexed, merge } from 'ramda';

let lemmaFrequency = {};
let terms = {};
let totalFrequencies = 0;
/**
 * Sums up the frequencies of identical lemmas from different chunks,
 * and yield as last object { totalFrequencies }.
 *
 * @export
 * @param {Stream} data
 * @param {Array<Object>} feed
 */
export default function TEEFTSumUpFrequencies(data, feed) {
    if (this.isLast()) {
        mapObjIndexed((frequency, lemma) => {
            const term = terms[lemma];
            const newTerm = merge(term, { frequency });
            feed.write(newTerm);
            totalFrequencies += frequency;
            return newTerm;
        }, lemmaFrequency);
        lemmaFrequency = {};
        terms = {};
        feed.write({ totalFrequencies });
        return feed.close();
    }
    const key = data.lemma || data.word;
    lemmaFrequency[key] = (lemmaFrequency[key] || 0) + data.frequency;
    terms[key] = data;
    feed.end();
}
