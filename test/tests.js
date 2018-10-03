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

describe('filter tags', () => {
    it('should keep only adjectives and names, by default', (done) => {
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
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal('NOM', res[0].pos[0]);
                assert.equal('ADJ', res[1].pos[0]);
                done();
            });
    });

    it('should keep only passed tag', (done) => {
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
            .pipe(ezs('TEEFTFilterTags', { tags: ['VER'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal('VER', res[0].pos[0]);
                done();
            });
    });

    it('should keep only passed tag (based on the beginning)', (done) => {
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
            .pipe(ezs('TEEFTFilterTags', { tags: ['PRO'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal('PRO:per', res[0].pos[0]);
                done();
            });
    });

    it('should keep only passed tag, even if not the first', (done) => {
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
            .pipe(ezs('TEEFTFilterTags', { tags: ['ART'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(1, res.length);
                assert.equal('ART:def', res[0].pos[1]);
                done();
            });
    });
});

describe('extract terms', () => {
    it('should return three terms', (done) => {
        const res = [];
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
            { id: 7, word: 'frais', pos: ['ADJ'], lemma: 'frais' },
            { id: 8, word: 'et', pos: ['CON'], lemma: 'et' },
            { id: 9, word: 'de', pos: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 10, word: 'hotdog', pos: ['UNK'], lemma: 'hotdog' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                assert.equal('plancton', res[0].word);
                assert.equal('frais', res[1].word);
                assert.equal('plancton frais', res[2].word);
                assert.equal('plancton', res[0].lemma);
                assert.equal('frais', res[1].lemma);
                assert.strictEqual(undefined, res[2].lemma);
                assert.equal('NOM', res[0].pos[0]);
                assert.equal('ADJ', res[1].pos[0]);
                assert.strictEqual(undefined, res[2].pos);
                assert.equal(1, res[0].frequency);
                assert.equal(1, res[1].frequency);
                assert.equal(1, res[2].frequency);
                assert.equal(1, res[0].length);
                assert.equal(1, res[1].length);
                assert.equal(2, res[2].length);
                done();
            });
    });

    it('should compute correct frequencies', (done) => {
        const res = [];
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
            { id: 7, word: 'frais', pos: ['ADJ'], lemma: 'frais' },
            { id: 8, word: 'et', pos: ['CON'], lemma: 'et' },
            { id: 9, word: 'de', pos: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 10, word: 'hotdog', pos: ['UNK'], lemma: 'hotdog' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(11, res.length);
                assert.equal('elle', res[0].word);
                assert.equal('elle', res[0].lemma);
                assert.equal('PRO:per', res[0].pos[0]);
                assert.equal(1, res[0].frequency);
                assert.equal(2, res[5].frequency);
                assert.equal(11, res[10].length);
                assert.strictEqual(1, res[1].frequency); // no undefined
                done();
            });
    });

    it('should decompose frequencies when in several chunks', (done) => {
        const res = [];
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
        ], [
            { id: 6, word: 'plancton', pos: ['NOM'], lemma: 'plancton' },
            { id: 7, word: 'frais', pos: ['ADJ'], lemma: 'frais' },
            { id: 8, word: 'et', pos: ['CON'], lemma: 'et' },
            { id: 9, word: 'de', pos: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 10, word: 'hotdog', pos: ['UNK'], lemma: 'hotdog' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(13, res.length);
                assert.equal('de', res[5].lemma);
                assert.equal('de', res[10].lemma);
                assert.equal(1, res[5].frequency);
                assert.equal(1, res[10].frequency);
                done();
            });
    });

    it('should take token keys parameter', (done) => {
        const res = [];
        from([[
        /* eslint-disable object-curly-newline */
            { id: 0, token: 'elle', pos: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', pos: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', pos: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', pos: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                pos: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', pos: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, token: 'plancton', pos: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'frais', pos: ['ADJ'], lemma: 'frais' },
            { id: 8, token: 'et', pos: ['CON'], lemma: 'et' },
            { id: 9, token: 'de', pos: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 10, token: 'hotdog', pos: ['UNK'], lemma: 'hotdog' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { keys: '{ "token": "token" }' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 3);
                assert.equal('plancton', res[0].token);
                assert.equal('frais', res[1].token);
                assert.equal('plancton frais', res[2].token);
                assert.equal('plancton', res[0].lemma);
                assert.equal('frais', res[1].lemma);
                assert.strictEqual(undefined, res[2].lemma);
                assert.equal('NOM', res[0].pos[0]);
                assert.equal('ADJ', res[1].pos[0]);
                assert.strictEqual(undefined, res[2].pos);
                assert.equal(1, res[0].frequency);
                assert.equal(1, res[1].frequency);
                assert.equal(1, res[2].frequency);
                assert.equal(1, res[0].length);
                assert.equal(1, res[1].length);
                assert.equal(2, res[2].length);
                done();
            });
    });

    it('should take tag keys parameter', (done) => {
        const res = [];
        from([[
        /* eslint-disable object-curly-newline */
            { id: 0, word: 'elle', tag: 'PRO:per', lemma: 'elle' },
            { id: 1, word: 'semble', tag: 'VER', lemma: 'sembler' },
            { id: 2, word: 'se', tag: 'PRO:per', lemma: 'se' },
            { id: 3, word: 'nourrir', tag: 'VER', lemma: 'nourrir' },
            { id: 4,
                word: 'essentiellement',
                tag: 'ADV',
                lemma: 'essentiellement',
            },
            { id: 5, word: 'de', tag: 'PRE', lemma: 'de' },
            { id: 6, word: 'plancton', tag: 'NOM', lemma: 'plancton' },
            { id: 7, word: 'frais', tag: 'ADJ', lemma: 'frais' },
            { id: 8, word: 'et', tag: 'CON', lemma: 'et' },
            { id: 9, word: 'de', tag: 'PRE', lemma: 'de' },
            { id: 10, word: 'hotdog', tag: 'UNK', lemma: 'hotdog' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { keys: '{ "tag": "tag" }' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 3);
                assert.equal('plancton', res[0].word);
                assert.equal('frais', res[1].word);
                assert.equal('plancton frais', res[2].word);
                assert.equal('plancton', res[0].lemma);
                assert.equal('frais', res[1].lemma);
                assert.strictEqual(undefined, res[2].lemma);
                assert.equal('NOM', res[0].tag);
                assert.equal('ADJ', res[1].tag);
                assert.strictEqual(undefined, res[2].tag);
                assert.equal(1, res[0].frequency);
                assert.equal(1, res[1].frequency);
                assert.equal(1, res[2].frequency);
                assert.equal(1, res[0].length);
                assert.equal(1, res[1].length);
                assert.equal(2, res[2].length);
                done();
            });
    });

    it('should take token and tag keys parameter without ids', (done) => {
        const res = [];
        from([[
        /* eslint-disable object-curly-newline */
            { token: 'elle', tag: 'PRO:per', lemma: 'elle' },
            { token: 'semble', tag: 'VER', lemma: 'sembler' },
            { token: 'se', tag: 'PRO:per', lemma: 'se' },
            { token: 'nourrir', tag: 'VER', lemma: 'nourrir' },
            {
                token: 'essentiellement',
                tag: 'ADV',
                lemma: 'essentiellement',
            },
            { token: 'de', tag: 'PRE', lemma: 'de' },
            { token: 'plancton', tag: 'NOM', lemma: 'plancton' },
            { token: 'frais', tag: 'ADJ', lemma: 'frais' },
            { token: 'et', tag: 'CON', lemma: 'et' },
            { token: 'de', tag: 'PRE', lemma: 'de' },
            { token: 'hotdog', tag: 'UNK', lemma: 'hotdog' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { keys: '{ "token": "token", "tag": "tag" }' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 3);
                assert.equal('plancton', res[0].token);
                assert.equal('frais', res[1].token);
                assert.equal('plancton frais', res[2].token);
                assert.equal('plancton', res[0].lemma);
                assert.equal('frais', res[1].lemma);
                assert.strictEqual(undefined, res[2].lemma);
                assert.equal('NOM', res[0].tag);
                assert.equal('ADJ', res[1].tag);
                assert.strictEqual(undefined, res[2].tag);
                assert.equal(1, res[0].frequency);
                assert.equal(1, res[1].frequency);
                assert.equal(1, res[2].frequency);
                assert.equal(1, res[0].length);
                assert.equal(1, res[1].length);
                assert.equal(2, res[2].length);
                done();
            });
    });
});

describe('sum up frequencies', () => {
    it('should sum up frequencies when in several chunks', (done) => {
        const res = [];
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
        ], [
            { id: 6, word: 'plancton', pos: ['NOM'], lemma: 'plancton' },
            { id: 7, word: 'frais', pos: ['ADJ'], lemma: 'frais' },
            { id: 8, word: 'et', pos: ['CON'], lemma: 'et' },
            { id: 9, word: 'de', pos: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 10, word: 'hotdog', pos: ['UNK'], lemma: 'hotdog' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            .pipe(ezs('TEEFTSumUpFrequencies'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(12, res.length);
                assert.equal('de', res[5].lemma);
                assert.equal(2, res[5].frequency);
                done();
            });
    });
});

describe('compute specificity', () => {
    it('should work without weights', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 8, length: 1, word: 'elle', id: 0, pos: ['PRO:per'], lemma: 'elle' },
            { frequency: 1, length: 1, word: 'semble', id: 1, pos: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, word: 'se', id: 2, pos: ['PRO:per'], lemma: 'se' },
            { frequency: 1, length: 1, word: 'nourrir', id: 3, pos: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, word: 'essentiellement', id: 4, pos: ['ADV'], lemma: 'essentiellement' },
            { frequency: 2, length: 1, word: 'de', id: 9, pos: ['PRE', 'ART:def'], lemma: 'de' },
            { frequency: 1, length: 1, word: 'plancton', id: 6, pos: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, word: 'frais', id: 7, pos: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, word: 'et', id: 8, pos: ['CON'], lemma: 'et' },
            { frequency: 1, length: 1, word: 'hotdog', id: 10, pos: ['UNK'], lemma: 'hotdog' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTSpecificity', { weightedDictionary: null, filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(10, res.length);
                assert.equal('elle', res[0].lemma);
                assert.equal(8, res[0].frequency);
                assert.equal(1, res[0].specificity);
                done();
            });
    });

    it('should work with weights', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 1, length: 1, word: 'semble', id: 1, pos: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, word: 'nourrir', id: 3, pos: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, word: 'essentiellement', id: 4, pos: ['ADV'], lemma: 'essentiellement' },
            { frequency: 1, length: 1, word: 'plancton', id: 6, pos: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, word: 'frais', id: 7, pos: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, word: 'hotdog', id: 10, pos: ['UNK'], lemma: 'hotdog' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTSpecificity', { filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(6, res.length);
                assert.equal('semble', res[0].word);
                assert.equal(1, res[0].frequency);
                assert.equal(0.0008964346775894244, res[0].specificity);
                done();
            });
    });

    it('should work with weights and filter', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 1, length: 1, word: 'semble', id: 1, pos: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, word: 'nourrir', id: 3, pos: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, word: 'essentiellement', id: 4, pos: ['ADV'], lemma: 'essentiellement' },
            { frequency: 1, length: 1, word: 'plancton', id: 6, pos: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, word: 'frais', id: 7, pos: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, word: 'hotdog', id: 10, pos: ['UNK'], lemma: 'hotdog' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTSpecificity'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                assert.equal(res[0].lemma, 'hotdog');
                assert.equal(res[0].frequency, 1);
                assert.equal(res[0].specificity, 1);
                done();
            });
    });

    it('should sort when asked', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 8, length: 1, word: 'elle', id: 0, pos: ['PRO:per'], lemma: 'elle' },
            { frequency: 1, length: 1, word: 'semble', id: 1, pos: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, word: 'se', id: 2, pos: ['PRO:per'], lemma: 'se' },
            { frequency: 1, length: 1, word: 'nourrir', id: 3, pos: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, word: 'essentiellement', id: 4, pos: ['ADV'], lemma: 'essentiellement' },
            { frequency: 2, length: 1, word: 'de', id: 9, pos: ['PRE', 'ART:def'], lemma: 'de' },
            { frequency: 1, length: 1, word: 'plancton', id: 6, pos: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, word: 'frais', id: 7, pos: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, word: 'et', id: 8, pos: ['CON'], lemma: 'et' },
            { frequency: 1, length: 1, word: 'hotdog', id: 10, pos: ['UNK'], lemma: 'hotdog' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTSpecificity', { sort: true, weightedDictionary: '', filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(10, res.length);
                assert.equal(1, res.find(t => t.word === 'elle').specificity);
                assert.equal(0.25, res.find(t => t.word === 'de').specificity);
                assert.equal(0.125, res.find(t => t.word === 'semble').specificity);
                done();
            });
    });

    it('should work whatever the order of terms', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 1, length: 1, word: 'semble', id: 1, pos: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, word: 'se', id: 2, pos: ['PRO:per'], lemma: 'se' },
            { frequency: 1, length: 1, word: 'nourrir', id: 3, pos: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, word: 'essentiellement', id: 4, pos: ['ADV'], lemma: 'essentiellement' },
            { frequency: 2, length: 1, word: 'de', id: 9, pos: ['PRE', 'ART:def'], lemma: 'de' },
            { frequency: 1, length: 1, word: 'plancton', id: 6, pos: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, word: 'frais', id: 7, pos: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, word: 'et', id: 8, pos: ['CON'], lemma: 'et' },
            { frequency: 1, length: 1, word: 'hotdog', id: 10, pos: ['UNK'], lemma: 'hotdog' },
            { frequency: 8, length: 1, word: 'elle', id: 0, pos: ['PRO:per'], lemma: 'elle' },
            /* eslint-enable object-curly-newline */

        ]])
            .pipe(ezs('TEEFTSpecificity', { sort: true, weightedDictionary: '', filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(10, res.length);
                assert.equal(1, res.find(t => t.word === 'elle').specificity);
                assert.equal(0.25, res.find(t => t.word === 'de').specificity);
                assert.equal(0.125, res.find(t => t.word === 'semble').specificity);
                done();
            });
    });

    it('should keep multiterms (terms without tags)', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 3, length: 1, word: 'logiciel', id: 2703, pos: ['ADJ', 'NOM'], lemma: 'logiciel' },
            { frequency: 1, length: 1, word: 'content', id: 2704, pos: ['NOM', 'ADJ', 'VER'], lemma: 'content' },
            { frequency: 1, length: 2, word: 'logiciel content' },
            { frequency: 1, length: 1, word: 'management', id: 2706, pos: ['NOM'], lemma: 'management' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTSpecificity', { sort: true, weightedDictionary: '', filter: true }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal('logiciel', res[0].lemma);
                assert.equal(3, res[0].frequency);
                assert.equal(1, res[0].specificity);
                assert.equal('logiciel content', res[1].word);
                assert.equal(1, res[1].frequency);
                assert.equal(2, res[1].length);
                assert.equal(1 / 3, res[1].specificity);
                done();
            });
    });

    it('should compute average specificity only on monoterms', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 1, length: 1, word: 'logiciel', id: 2703, pos: ['ADJ', 'NOM'], lemma: 'logiciel' },
            { frequency: 1, length: 1, word: 'content', id: 2704, pos: ['NOM', 'ADJ', 'VER'], lemma: 'content' },
            { frequency: 10, length: 2, word: 'logiciel content' },
            { frequency: 1, length: 1, word: 'management', id: 2706, pos: ['NOM'], lemma: 'management' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTSpecificity', { sort: true, filter: true }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res[0].pos, undefined); // multiterm
                assert.equal(res[0].specificity, 1);
                assert(res[1].pos); // monoterm
                done();
            });
    });
});

describe('filter multiterms and frequent monoterms', () => {
    it('should keep frequent monoterms', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 8, length: 1, word: 'elle', id: 0, pos: ['PRO:per'], lemma: 'elle' },
            { frequency: 1, length: 1, word: 'semble', id: 1, pos: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, word: 'se', id: 2, pos: ['PRO:per'], lemma: 'se' },
            { frequency: 1, length: 1, word: 'nourrir', id: 3, pos: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, word: 'essentiellement', id: 4, pos: ['ADV'], lemma: 'essentiellement' },
            { frequency: 2, length: 1, word: 'de', id: 9, pos: ['PRE', 'ART:def'], lemma: 'de' },
            { frequency: 1, length: 1, word: 'plancton', id: 6, pos: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, word: 'frais', id: 7, pos: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, word: 'et', id: 8, pos: ['CON'], lemma: 'et' },
            { frequency: 1, length: 1, word: 'hotdog', id: 10, pos: ['UNK'], lemma: 'hotdog' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTFilterMultiFreq'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(1, res.length);
                assert.equal('elle', res[0].lemma);
                assert.equal(8, res[0].frequency);
                done();
            });
    });

    it('should keep multiterms', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 1, length: 1, word: 'elle', id: 0, pos: ['PRO:per'], lemma: 'elle' },
            { frequency: 1, length: 1, word: 'semble', id: 1, pos: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, word: 'se', id: 2, pos: ['PRO:per'], lemma: 'se' },
            { frequency: 1, length: 1, word: 'nourrir', id: 3, pos: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, word: 'essentiellement', id: 4, pos: ['ADV'], lemma: 'essentiellement' },
            { frequency: 2, length: 1, word: 'de', id: 9, pos: ['PRE', 'ART:def'], lemma: 'de' },
            { frequency: 1, length: 6, word: 'elle sembler se nourrir essentiellement de' },
            { frequency: 1, length: 1, word: 'plancton', id: 6, pos: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, word: 'frais', id: 7, pos: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, word: 'et', id: 8, pos: ['CON'], lemma: 'et' },
            { frequency: 1, length: 1, word: 'hotdog', id: 10, pos: ['UNK'], lemma: 'hotdog' },
            { frequency: 1, length: 5, word: 'plancton frais et de hotdog' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTFilterMultiFreq'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal('elle sembler se nourrir essentiellement de', res[0].word);
                assert.equal('plancton frais et de hotdog', res[1].word);
                done();
            });
    });
});

describe('natural', () => {
    describe('tag', () => {
        it('should correctly tag a sentence in French', (done) => {
            let res = [];
            from(['Elle', 'semble', 'se', 'nourrir', 'essentiellement', 'de', 'plancton', 'et', 'de', 'hotdog'])
                .pipe(ezs('TEEFTNaturalTag'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 10);
                    assert.equal(res[1].token, 'semble');
                    assert.equal(res[1].tag, 'v');
                    assert.equal(res[4].token, 'essentiellement');
                    assert.equal(res[4].tag, 'adv');
                    done();
                });
        });

        it('should correctly tag a sentence in French with accented words', (done) => {
            let res = [];
            from(['Ça', 'veut', 'sûrement', 'dire', 'qu\'', 'il', 'fut', 'assassiné'])
                .pipe(ezs('TEEFTNaturalTag'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 8);
                    assert.equal(res[1].token, 'veut');
                    assert.equal(res[1].tag, 'v');
                    assert.equal(res[2].token, 'sûrement');
                    assert.equal(res[2].tag, 'adv');
                    done();
                });
        });
    });
});
