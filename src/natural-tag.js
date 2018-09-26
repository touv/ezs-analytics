import { Lexicon, RuleSet, BrillPOSTagger } from 'natural';

const baseFolder = `${__dirname}/..`;
// const rulesFilename = `${baseFolder}/data/French/tr_from_posjs.txt`;
const lexiconFilename = `${baseFolder}/data/French/lexicon_from_posjs.json`;
const defaultCategory = 'N';

const lexicon = new Lexicon(lexiconFilename, defaultCategory);
// const rules = new RuleSet(rulesFilename);
const tagger = BrillPOSTagger(lexicon);

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
        return feed.close();
    }
    const tokens = Array.isArray(data) ? data : [data];
    const res = tagger.tag(tokens);
    feed.write(res);
    feed.end();
}
