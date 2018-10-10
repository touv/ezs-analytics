import NlpjsTFr from 'nlp-js-tools-french';

const toCommonStruct = (taggedWord) => {
    const res = {
        id: taggedWord.id,
        token: taggedWord.word,
    };
    if (taggedWord.pos) {
        res.tag = taggedWord.pos;
    }
    if (taggedWord.lemma) {
        res.lemma = taggedWord.lemma;
    }
    return res;
};

/**
 * Tokenize, tag, and lemmatize a French text
 *
 * @example
 * from(['Elle semble se nourrir essentiellement de plancton, et de hotdog.'])
                .pipe(ezs('TEEFTFrToTagLem', { doLemmatize: false }))
 * @example
 * [ { id: 0, token: 'elle', tag: [ 'PRO:per' ] },
 * { id: 1, token: 'semble', tag: [ 'VER' ] },
 * { id: 2, token: 'se', tag: [ 'PRO:per' ] },
 * { id: 3, token: 'nourrir', tag: [ 'VER' ] },
 * { id: 4, token: 'essentiellement', tag: [ 'ADV' ] },
 * { id: 5, token: 'de', tag: [ 'PRE', 'NOM', 'ART:def' ] },
 * { id: 6, token: 'plancton', tag: [ 'NOM' ] },
 * { id: 7, token: 'et', tag: [ 'CON' ] },
 * { id: 8, token: 'de', tag: [ 'PRE', 'NOM', 'ART:def' ] },
 * { id: 9, token: 'hotdog', tag: [ 'UNK' ] } ]
 *
 * @export
 * @param {Stream} data
 * @param {Array<Object>} feed
 * @param {Array<string>} [tagTypes=['adj', 'adv', 'art', 'con', 'nom', 'ono', 'pre', 'ver', 'pro']]  tag types
 * @param {Boolean} [strictness=true]   When false, non-accentuated character are the same as accentuated ones
 * @param {Number} [minimumLength=1]    Ignore words shorter than this
 * @param {Boolean} [doTag=true]  return tags if true
 * @param {Boolean} [doLemmatize=true]  return lems if true
 */
export default function TEEFTFrToTagLem(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const tagTypes = this.getParam('tagTypes', ['adj', 'adv', 'art', 'con', 'nom', 'ono', 'pre', 'ver', 'pro']);
    const strictness = this.getParam('strictness', true);
    const minimumLength = this.getParam('minimumLength', 1);
    const doTag = this.getParam('doTag', true);
    const doLemmatize = this.getParam('doLemmatize', true);
    const config = {
        tagTypes,
        strictness,
        minimumLength,
        debug: false,
    };
    const nlpToolsFr = new NlpjsTFr(data, config);
    const tokenizedWords = nlpToolsFr.tokenized;
    const posTaggedWords = (doTag ? nlpToolsFr.posTagger() : [])
        .map(toCommonStruct);
    const lemmatizedWords = (doLemmatize ? nlpToolsFr.lemmatizer() : [])
        .map(toCommonStruct);
    if (!doTag && !doLemmatize) {
        feed.write(tokenizedWords);
        return feed.end();
    }
    if (doTag && !doLemmatize) {
        feed.write(posTaggedWords);
        return feed.end();
    }
    if (!doTag && doLemmatize) {
        feed.write(lemmatizedWords);
        return feed.end();
    }
    // Merge lems into tagged words
    const result = posTaggedWords
        .map((taggedWord) => {
            const lemma = lemmatizedWords.find(lemWord => lemWord.id === taggedWord.id) || { lemma: null };
            return {
                ...taggedWord,
                lemma: lemma.lemma,
            };
        });
    feed.write(result);
    feed.end();
}
