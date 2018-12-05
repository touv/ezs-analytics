import { concat } from 'ramda';

const isMulti = term => !term.tag;
const isMono = term => term.tag;

const filterMultiSpec = (document) => {
    const { terms } = document;
    const totalSpecificities = terms
        .filter(isMulti)
        .reduce((total, { specificity }) => total + specificity, 0);
    const averageSpecificity = totalSpecificities / terms.filter(isMulti).length;
    const filteredTerms = terms.filter(term => term.specificity > averageSpecificity || isMono(term));
    const result = {
        ...document,
        terms: filteredTerms,
    };
    return result;
};

/**
 * Filter multiterms to keep only multiterms which specificity is higher than
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
    const documents = Array.isArray(data) ? data : [data];
    const results = documents.map(filterMultiSpec);
    feed.write(results);
    feed.end();
}
