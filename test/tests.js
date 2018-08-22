const assert = require('assert');
const from = require('from');
const ezs = require('ezs');

ezs.use(require('../lib'));

describe('tokenize', () => {
    it('should split ascii simple words', (done) => {
        let res = [];
        from(['aha blabla hehe'])
            .pipe(ezs('TEEFTTokenize'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                assert.equal('aha', res[0]);
                assert.equal('blabla', res[1]);
                assert.equal('hehe', res[2]);
                done();
            });
    });

    it('should split french simple words', (done) => {
        let res = [];
        from(['ça va héhé'])
            .pipe(ezs('TEEFTTokenize'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                assert.equal('ça', res[0]);
                assert.equal('va', res[1]);
                assert.equal('héhé', res[2]);
                done();
            });
    });

    it('should remove punctuation characters', (done) => {
        let res = [];
        from(['ça va? héhé!'])
            .pipe(ezs('TEEFTTokenize'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                assert.equal('ça', res[0]);
                assert.equal('va', res[1]);
                assert.equal('héhé', res[2]);
                done();
            });
    });
});

describe('fr-to-tag-lem', () => {
    describe('tokenize', () => {
        it('should split ascii simple words', (done) => {
            let res = [];
            from(['aha blabla hehe'])
                .pipe(ezs('TEEFTFrToTagLem', { doTag: false, doLemmatize: false }))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(3, res.length);
                    assert.equal('aha', res[0]);
                    assert.equal('blabla', res[1]);
                    assert.equal('hehe', res[2]);
                    done();
                });
        });

        it('should split french simple words', (done) => {
            let res = [];
            from(['ça va héhé'])
                .pipe(ezs('TEEFTFrToTagLem', { doTag: false, doLemmatize: false }))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(3, res.length);
                    assert.equal('ça', res[0]);
                    assert.equal('va', res[1]);
                    assert.equal('héhé', res[2]);
                    done();
                });
        });

        it('should remove punctuation characters', (done) => {
            let res = [];
            from(['ça va? héhé!'])
                .pipe(ezs('TEEFTFrToTagLem', { doTag: false, doLemmatize: false }))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(3, res.length);
                    assert.equal('ça', res[0]);
                    assert.equal('va', res[1]);
                    assert.equal('héhé', res[2]);
                    done();
                });
        });
    });

    describe('tag', () => {
        it('should correctly tag a sentence in French', (done) => {
            let res = [];
            from(['Elle semble se nourrir essentiellement de plancton, et de hotdog.'])
                .pipe(ezs('TEEFTFrToTagLem', { doLemmatize: false }))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(10, res.length);
                    assert.equal('semble', res[1].word);
                    assert.equal('VER', res[1].pos[0]);
                    done();
                });
        });
    });

    describe('lemmatize', () => {
        it('should correctly lemmatize a sentence in French', (done) => {
            let res = [];
            from(['Elle semble se nourrir essentiellement de plancton, et de hotdog.'])
                .pipe(ezs('TEEFTFrToTagLem', { doTag: false }))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(10, res.length);
                    assert.equal('semble', res[1].word);
                    assert.equal('sembler', res[1].lemma);
                    done();
                });
        });
    });

    describe('the whole', () => {
        it('should merge tags and lemmas', (done) => {
            let res = [];
            from(['Elle semble se nourrir essentiellement de plancton, et de hotdog.'])
                .pipe(ezs('TEEFTFrToTagLem'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(10, res.length);
                    assert.equal('semble', res[1].word);
                    assert.equal('sembler', res[1].lemma);
                    assert.equal('VER', res[1].pos[0]);
                    done();
                });
        });
    });
});

describe('stopwords', () => {
    it('should remove stopwords', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([[{ id: 0, word: 'elle', pos: ['PRO:per'], lemma: 'elle' },
            { id: 1, word: 'semble', pos: ['VER'], lemma: 'sembler' },
            { id: 2, word: 'se', pos: ['PRO:per'], lemma: 'se' },
            { id: 3, word: 'nourrir', pos: ['VER'], lemma: 'nourrir' },
            { id: 4,
                word: 'essentiellement',
                pos: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, word: 'de', pos: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, word: 'plancton', pos: ['NOM'], lemma: 'plancton' },
            { id: 7, word: 'et', pos: ['CON'], lemma: 'et' },
            { id: 8, word: 'de', pos: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 9, word: 'hotdog', pos: ['UNK'], lemma: 'hotdog' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTStopWords'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                done();
            });
    });
});

describe.skip('filter tags', () => {
    it('should keep only adjectives and names', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([[{ id: 0, word: 'elle', pos: ['PRO:per'], lemma: 'elle' },
            { id: 1, word: 'semble', pos: ['VER'], lemma: 'sembler' },
            { id: 2, word: 'se', pos: ['PRO:per'], lemma: 'se' },
            { id: 3, word: 'nourrir', pos: ['VER'], lemma: 'nourrir' },
            { id: 4,
                word: 'essentiellement',
                pos: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, word: 'de', pos: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, word: 'plancton', pos: ['NOM'], lemma: 'plancton' },
            { id: 7, word: 'frais', pos: ['ADJ'], lemma: 'frais' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTFilterTags'))
            .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                done();
            });
    });
});
