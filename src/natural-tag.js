import { Lexicon, RuleSet, BrillPOSTagger } from 'natural';

const baseFolder = `${__dirname}/..`;
const lexiconFilename = `${baseFolder}/resources/lexicon_from_posjs.json`;
const defaultCategory = 'UNK';

const lexicon = new Lexicon(lexiconFilename, defaultCategory);
const rules = new RuleSet();
const tagger = new BrillPOSTagger(lexicon, rules);

let tokens;

const toCommonStruct = taggedWord => ({
    token: taggedWord.token,
    tag: [taggedWord.tag],
});

/**
 * POS Tagger from natural
 *
 * French pos tagging using natural (and LEFFF resources)
 *
 * @example
 *  { "token": "dans",      "tag": ["prep"] },
    { "token": "le",        "tag": ["det"]  },
    { "token": "cadre",     "tag": ["nc"] },
    { "token": "du",        "tag": ["det"] },
    { "token": "programme", "tag": ["nc"] }
    },
 *
 * @export
 * @param {Array<String>} data  Array of tokens (string)
 * @param {Array<Object>} feed  Array of tokens (object, with `token` and `tag`)
 * @returns
 */
export default function TEEFTNaturalTag(data, feed) {
    if (this.isLast()) {
        const res = tagger.tag(tokens);
        feed.write(res.taggedWords.map(toCommonStruct));
        return feed.close();
    }
    if (this.isFirst()) {
        tokens = [];
    }
    const tokensArray = Array.isArray(data) ? data : [data];
    tokens = tokens.concat(tokensArray);
    feed.end();
}
