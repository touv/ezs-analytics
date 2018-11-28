import {
    __, concat, divide, map, max, pipe, prop, sum,
} from 'ramda';
import { getResource } from './stop-words';


let totalFrequencies;
let weights = {};
let maxSpecificity;
let specificitySum;

function initialize() {
    totalFrequencies = 0;
    maxSpecificity = 0;
    specificitySum = 0;
}

const isMulti = term => !term.tag;
const isMono = term => term.tag;

function addSpecificity(oldTerm) {
    const { frequency, term } = oldTerm;
    console.log(Object.keys(weights).length);
    const weight = weights[term] || 10 ** -5;
    const computeSpecificity = pipe(
        divide(__, totalFrequencies),
        divide(__, weight),
    );
    const specificity = computeSpecificity(frequency);

    maxSpecificity = max(maxSpecificity, specificity);
    return {
        ...oldTerm,
        specificity,
    };
}

function normalizeSpecificity(token) {
    const specificity = token.specificity / maxSpecificity;
    console.dir({specificity, token, maxSpecificity})
    specificitySum += isMono(token) ? specificity : 0;
    return {
        ...token,
        specificity,
    };
}

const addNormalizedSpecificity = pipe(
    map(addSpecificity),
    map(normalizeSpecificity),
);

/**
 * Take documents (with a `path`, an array of `terms`, each term being an object
 * { term, frequency, length[, tag] })
 *
 * Process objects containing frequency, add a specificity to each object, and
 * remove all object with a specificity below average specificity (except when
 * `filter` is `false`).
 *
 * Can also sort the objects according to their specificity, when `sort` is
 * `true`.
 *
 * @export
 * @param {*} data
 * @param {*} feed
 * @param {string} [weightedDictionary="Ress_Frantext"] name of the weigthed dictionary
 * @param {Boolean} [filter=true]   filter below average specificity
 * @param {Boolean} [sort=false]    sort objects according to their specificity
 * @returns
 */
export function oldTEEFTSpecificity(data, feed) {
    const weightedDictionary = this.getParam('weightedDictionary', 'Ress_Frantext');
    const filter = this.getParam('filter', true);
    const sort = this.getParam('sort', false);
    if (this.isLast()) {
        // When input is empty (this.isFirst && this.isLast)
        if (terms.length === 0) {
            return feed.close();
        }
        let result = addNormalizedSpecificity(terms);

        if (filter) {
            // compute averageSpecificity only on monoTerms
            const averageSpecificity = specificitySum / terms.filter(isMono).length;
            result = result.filter(term => term.specificity >= averageSpecificity || isMulti(term));
        }
        if (sort) {
            result = result.sort((a, b) => b.specificity - a.specificity);
        }

        feed.write(result);
        initialize();
        return feed.close();
    }
    if (this.isFirst()) {
        initialize();
        getResource(weightedDictionary)
            .map(line => line.split('\t'))
            .forEach(([term, weight]) => { weights[term] = weight; });
    }
    const dataArray = Array.isArray(data) ? data : [data];
    totalFrequencies = dataArray.reduce((total, { frequency }) => total + (frequency || 0), totalFrequencies);
    terms = concat(terms, dataArray);
    feed.end();
}

export default function TEEFTSpecificity(data, feed) {
    const weightedDictionary = this.getParam('weightedDictionary', 'Ress_Frantext');
    const filter = this.getParam('filter', true);
    const sort = this.getParam('sort', false);
    if (this.isLast()) {
        return feed.close();
    }
    if (this.isFirst()) {
        if (weightedDictionary) {
            getResource(weightedDictionary)
                .map(line => line.split('\t'))
                .forEach(([term, weight]) => { weights[term] = weight; });
        } else {
            weights = {};
        }
    }
    const documents = Array.isArray(data) ? data : [data];
    const results = documents.map((document) => {
        initialize();

        totalFrequencies = sum(document.terms.map(prop('frequency')));

        let terms = addNormalizedSpecificity(document.terms);

        if (filter) {
            // compute averageSpecificity only on monoTerms
            const averageSpecificity = specificitySum / terms.filter(isMono).length;
            terms = terms.filter(term => term.specificity >= averageSpecificity || isMulti(term));
        }

        if (sort) {
            terms = terms.sort((a, b) => b.specificity - a.specificity);
        }

        return {
            ...document,
            terms,
        };
    });
    feed.write(results);
    feed.end();
}
