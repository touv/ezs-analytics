import { Lexicon, RuleSet, BrillPOSTagger } from 'natural';

const baseFolder = `${__dirname}/..`;
const lexiconFilename = `${baseFolder}/resources/tagging_wiki08.json`;
const defaultCategory = 'UNK';

const lexicon = new Lexicon(lexiconFilename, defaultCategory);
const rules = new RuleSet();
const tagger = new BrillPOSTagger(lexicon, rules);

const tokens2taggedWords = (tokens) => {
    const { taggedWords } = tagger.tag(tokens);
    return taggedWords;
};

const toCommonStruct = taggedWords => taggedWords
    .map(taggedWord => ({
        token: taggedWord.token,
        tag: [taggedWord.tag],
    }));

function TEEFTNaturalTag(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const docsIn = Array.isArray(data) ? data : [data];

    const docsOut = docsIn.map(doc => ({
        path: doc.path,
        sentences: doc.sentences
            .map(tokens2taggedWords)
            .map(toCommonStruct),
    }));
    feed.write(docsOut);
    feed.end();
}

/**
 * POS Tagger from natural
 *
 * French pos tagging using natural (and LEFFF resources)
 *
 * Take an array of documents (objects: { path, sentences: [[]] })
 *
 * Yield an array of documents (objects: {
 *      path, sentences: [
 *          [{
 *              token: "token",
 *              tag: [ "tag", ... ]
 *          },
 *          ...]
 *      ]
 * })
 *
 * @example
 *  [{
 *      path: "/path/1",
 *      sentences: [{ "token": "dans",      "tag": ["prep"] },
 *                  { "token": "le",        "tag": ["det"]  },
 *                  { "token": "cadre",     "tag": ["nc"] },
 *                  { "token": "du",        "tag": ["det"] },
 *                  { "token": "programme", "tag": ["nc"] }
 *                  },
 *      ]
 *  }]
 *
 * @export
 */
export default {
    TEEFTNaturalTag,
};
