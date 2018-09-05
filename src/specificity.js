import {
    __, concat, divide, forEach, map, max, pipe,
} from 'ramda';
import { getResource } from './stop-words';


let terms;
let totalFrequencies;
let weights;
let maxSpecificity;
let specificitySum;

function initialize() {
    terms = [];
    totalFrequencies = 0;
    weights = {};
    maxSpecificity = 0;
    specificitySum = 0;
}

function addSpecificity(term) {
    const { frequency, key } = term;
    const weight = weights[key] || 10 ** -5;
    const computeSpecificity = pipe(
        divide(__, totalFrequencies),
        divide(__, weight),
    );
    const specificity = computeSpecificity(frequency);

    maxSpecificity = max(maxSpecificity, specificity);
    specificitySum += specificity;
    return {
        ...term,
        specificity,
    };
}

function normalizeSpecificity(term) {
    return {
        ...term,
        specificity: term.specificity / maxSpecificity,
    };
}

const addNormalizedSpecificity = pipe(
    addSpecificity,
    normalizeSpecificity,
);

/**
 * Process objects containing frequency (and last object containing
 * totalFrequencies), and add a specificity to each object.
 *
 * @export
 * @param {*} data
 * @param {*} feed
 * @param {string} [weightedDictionary="weightsFrench"]    name of the weigthed dictionary
 * @returns
 */
export default function TEEFTSpecificity(data, feed) {
    const weightedDictionary = this.getParam('weightedDictionary', 'weightsFrench');
    if (this.isLast()) {
        feed.write(map(addNormalizedSpecificity, terms));
        return feed.close();
    }
    if (this.isFirst()) {
        initialize();
        getResource(weightedDictionary)
            .map(line => line.split('\t'))
            .forEach(([term, weight]) => { weights[term] = weight; });
    }
    forEach(({ frequency }) => { totalFrequencies += frequency || 0; }, data);
    terms = concat(terms, data);
    feed.end();
}
