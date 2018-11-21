import { mapObjIndexed, merge, values } from 'ramda';

let lemmaFrequency = {};
let terms = {};

const reinitDocumentAggregations = () => {
    lemmaFrequency = {};
    terms = {};
};

/**
 * Sums up the frequencies of identical lemmas from different chunks.
 *
 * @export
 * @param {Stream} data
 * @param {Array<Object>} feed
 */
export default function TEEFTSumUpFrequencies(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const documents = Array.isArray(data) ? data : [data];
    documents.forEach((document) => {
        const { terms: termsList } = document;
        termsList
            .forEach((term) => {
                const key = term.lemma || term.token;
                lemmaFrequency[key] = (lemmaFrequency[key] || 0) + term.frequency;
                terms[key] = term;
            });
        const newTerms = mapObjIndexed((frequency, lemma) => {
            const term = terms[lemma];
            const newTerm = merge(term, { frequency });
            return newTerm;
        }, lemmaFrequency);
        feed.write({
            ...document,
            terms: values(newTerms),
        });
        reinitDocumentAggregations();
    });
    feed.end();
}
