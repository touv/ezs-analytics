import { Lexicon, RuleSet, BrillPOSTagger } from 'natural';

const baseFolder = `${__dirname}/..`;
const lexiconFilename = `${baseFolder}/resources/lexicon_from_posjs.json`;
const defaultCategory = 'UNK';

const lexicon = new Lexicon(lexiconFilename, defaultCategory);
const rules = new RuleSet();
const tagger = new BrillPOSTagger(lexicon, rules);

let tokens;

/**
 * POS Tagger from natural
 *
 * @export
 * @param {*} data
 * @param {*} feed
 * @returns
 */
export default function TEEFTNaturalTag(data, feed) {
    if (this.isLast()) {
        const res = tagger.tag(tokens);
        feed.write(res.taggedWords);
        return feed.close();
    }
    if (this.isFirst()) {
        tokens = [];
    }
    const tokensArray = Array.isArray(data) ? data : [data];
    tokens = tokens.concat(tokensArray);
    feed.end();
}
