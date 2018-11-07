import { concat } from 'ramda';

let totalSpecificities;
let terms;

const isMulti = term => !term.tag;
const isMono = term => term.tag;


function initialize() {
    terms = [];
    totalSpecificities = 0;
}

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
        // When input is empty (this.isFirst && this.isLast)
        if (terms.length === 0) {
            return feed.close();
        }
        const averageSpecificity = totalSpecificities / terms.filter(isMulti).length;
        const result = terms.filter(term => term.specificity > averageSpecificity || isMono(term));
        feed.write(result);

        initialize(); // Ready for the next document
        return feed.close();
    }

    if (this.isFirst()) {
        initialize();
    }
    const dataArray = Array.isArray(data) ? data : [data];
    totalSpecificities = dataArray
        .filter(isMulti)
        .reduce((total, { specificity }) => total + specificity, totalSpecificities);
    terms = concat(terms, dataArray);
    feed.end();
}
