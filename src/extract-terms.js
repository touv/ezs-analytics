import R from 'ramda';
import { someBeginsWith } from './filter-tags';

let termFrequency = {};
let termSequence = [];
const SEARCH = Symbol('SEARCH');
const NOUN = Symbol('NOUN');

export function reinitSequenceFrequency() {
    termFrequency = {};
    termSequence = [];
}

export function extractSentenceTerms(taggedTerms,
    nounTag = 'NOM',
    adjTag = 'ADJ',
    isNoun = R.curry(someBeginsWith)([nounTag]),
    isAdj = R.curry(someBeginsWith)([adjTag])) {
    let multiterm = [];
    let state = SEARCH;
    taggedTerms
        .forEach((taggedTerm) => {
            const tags = taggedTerm.tag;
            const norm = taggedTerm.token;
            if (state === SEARCH && (isNoun(tags) || isAdj(tags))) {
                state = NOUN;
                multiterm.push(norm);
                termSequence.push(taggedTerm.token);
                termFrequency[norm] = (termFrequency[norm] || 0) + 1;
            } else if (state === NOUN && (isNoun(tags) || isAdj(tags))) {
                multiterm.push(norm);
                termSequence.push(taggedTerm.token);
                termFrequency[norm] = (termFrequency[norm] || 0) + 1;
            } else if (state === NOUN && !isNoun(tags) && !isAdj(tags)) {
                state = SEARCH;
                if (multiterm.length > 1) {
                    const word = multiterm.join(' ');
                    termSequence.push(word);
                    termFrequency[word] = (termFrequency[word] || 0) + 1;
                }
                multiterm = [];
            }
        });
    // If a multiterm was in progress, we save it
    if (multiterm.length > 1) {
        const word = multiterm.join(' ');
        termSequence.push(word);
        termFrequency[word] = (termFrequency[word] || 0) + 1;
    }
    return { termSequence, termFrequency };
}

/**
 * Take an array of objects { path, sentences: [token, tag: ["tag"]]}
 * Regroup multi-terms when possible (noun + noun, adjective + noun, *etc*.),
 * and computes statistics (frequency, *etc*.).
 *
 * @example
 * [{
 *    path: '/path/1',
 *    sentences:
 *    [[
 *      { token: 'elle', tag: ['PRO:per'] },
 *      { token: 'semble', tag: ['VER'] },
 *      { token: 'se', tag: ['PRO:per'] },
 *      { token: 'nourrir', tag: ['VER'] },
 *      {
 *        token: 'essentiellement',
 *        tag: ['ADV'],
 *      },
 *      { token: 'de', tag: ['PRE', 'ART:def'] },
 *      { token: 'plancton', tag: ['NOM'] },
 *      { token: 'frais', tag: ['ADJ'] },
 *      { token: 'et', tag: ['CON'] },
 *      { token: 'de', tag: ['PRE', 'ART:def'] },
 *      { token: 'hotdog', tag: ['UNK'] }
 *    ]]
 * }]
 *
 * @see https://github.com/istex/sisyphe/blob/master/src/worker/teeft/lib/termextractor.js
 * @export
 * @param {Stream}  data array of documents containing sentences of tagged tokens
 * @param {Array<Objects>}   feed   same as data, with `term` replacing `token`, `length`, and `frequency`
 * @param {string}  [nounTag='NOM']  noun tag
 * @param {string}  [adjTag='ADJ']   adjective tag
 */
export default function TEEFTExtractTerms(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const nounTag = this.getParam('nounTag', 'NOM');
    const adjTag = this.getParam('adjTag', 'ADJ');
    const documents = Array.isArray(data) ? data : [data];

    function extractFromDocument(document) {
        reinitSequenceFrequency();
        let taggedTerms = [];
        const { sentences } = document;
        sentences.forEach((sentence) => {
            const sentenceTaggedTerms = R.clone(sentence)
                .map(term => ({ ...term, tag: Array.isArray(term.tag) ? term.tag : [term.tag] }));
            extractSentenceTerms(sentenceTaggedTerms, nounTag, adjTag);
            taggedTerms = taggedTerms.concat(sentenceTaggedTerms);
        });

        // Compute `length` (number of words) and frequency
        // @param termSequence
        const computeLengthFrequency = R.reduce((acc, word) => {
            acc[word] = {
                frequency: termFrequency[word],
                length: word.split(' ').length,
            };
            return acc;
        }, {});

        // Merge taggedTerms and value (length and frequency) of words (output of
        // computeLengthFrequency)
        const mergeTagsAndFrequency = (lengthFreq, token) => R.merge(
            { ...lengthFreq, token },
            R.find(taggedTerm => taggedTerm.token === token, taggedTerms),
        );

        // Rename `token` property to `term`
        const moveTokenToTerm = R.pipe(
            taggedToken => ({ ...taggedToken, term: taggedToken.token }),
            R.omit('token'),
        );

        // Add tags to terms
        const addTags = R.mapObjIndexed(mergeTagsAndFrequency);
        // NOTE: FilterTag is applied *after* TermExtractor

        const terms = R.pipe(computeLengthFrequency, addTags, R.values)(termSequence);
        const doc = {
            ...document,
            terms: terms.map(moveTokenToTerm),
        };
        const result = R.dissoc('sentences', doc);

        return result;
    }

    const results = documents.map(extractFromDocument);

    feed.write(results);
    feed.end();
}
