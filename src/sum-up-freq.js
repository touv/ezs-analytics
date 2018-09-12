import { mapObjIndexed, merge } from 'ramda';

let lemmaFrequency = {};
let terms = {};
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
            return newTerm;
        }, lemmaFrequency);
        lemmaFrequency = {};
        terms = {};
        return feed.close();
    }
    const dataArray = Array.isArray(data) ? data : [data];
    dataArray
        .forEach((term) => {
            const key = term.lemma || term.word;
            lemmaFrequency[key] = (lemmaFrequency[key] || 0) + term.frequency;
            terms[key] = term;
        });
    feed.end();
}
