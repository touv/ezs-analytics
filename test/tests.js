const assert = require('assert');
const from = require('from');
const ezs = require('ezs');
const { reinitSequenceFrequency, extractSentenceTerms } = require('../lib/term-extractor');

ezs.use(require('../lib'));

describe('tokenize', () => {
    it('should split ascii simple words', (done) => {
        let res = [];
        from([['aha blabla hehe']])
            .pipe(ezs('TEEFTTokenize'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const firstSentence = res[0];
                assert(Array.isArray(firstSentence));
                assert.equal(firstSentence.length, 3);
                assert.equal(firstSentence[0], 'aha');
                assert.equal(firstSentence[1], 'blabla');
                assert.equal(firstSentence[2], 'hehe');
                done();
            });
    });

    it('should split french simple words', (done) => {
        let res = [];
        from([['ça va héhé']])
            .pipe(ezs('TEEFTTokenize'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const firstSentence = res[0];
                assert(Array.isArray(firstSentence));
                assert.equal(firstSentence.length, 3);
                assert.equal(firstSentence[0], 'ça');
                assert.equal(firstSentence[1], 'va');
                assert.equal(firstSentence[2], 'héhé');
                done();
            });
    });

    it('should remove punctuation characters', (done) => {
        let res = [];
        from([['ça va, héhé!']])
            .pipe(ezs('TEEFTTokenize'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                const firstSentence = res[0];
                assert(Array.isArray(firstSentence));
                assert.equal(firstSentence.length, 3);
                assert.equal(firstSentence[0], 'ça');
                assert.equal(firstSentence[1], 'va');
                assert.equal(firstSentence[2], 'héhé');
                done();
            });
    });

    it('should output as many items as sentences', (done) => {
        let res = [];
        from([['ça va?', 'héhé!']])
            .pipe(ezs('TEEFTTokenize'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                const firstSentence = res[0];
                assert(Array.isArray(firstSentence));
                assert.equal(firstSentence.length, 2);
                assert.equal(firstSentence[0], 'ça');
                assert.equal(firstSentence[1], 'va');
                const secondSentence = res[1];
                assert(Array.isArray(secondSentence));
                assert.equal(secondSentence.length, 1);
                assert.equal(secondSentence[0], 'héhé');
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
                    assert.equal(res.length, 3);
                    assert.equal(res[0], 'aha');
                    assert.equal(res[1], 'blabla');
                    assert.equal(res[2], 'hehe');
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
                    assert.equal(res.length, 3);
                    assert.equal(res[0], 'ça');
                    assert.equal(res[1], 'va');
                    assert.equal(res[2], 'héhé');
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
                    assert.equal(res.length, 3);
                    assert.equal(res[0], 'ça');
                    assert.equal(res[1], 'va');
                    assert.equal(res[2], 'héhé');
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
                    assert.equal(res.length, 10);
                    assert.equal(res[1].token, 'semble');
                    assert.equal(res[1].tag[0], 'VER');
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
                    assert.equal(res.length, 10);
                    assert.equal(res[1].token, 'semble');
                    assert.equal(res[1].lemma, 'sembler');
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
                    assert.equal(res.length, 10);
                    assert.equal(res[1].token, 'semble');
                    assert.equal(res[1].lemma, 'sembler');
                    assert.equal(res[1].tag[0], 'VER');
                    done();
                });
        });
    });
});

describe('stopwords', () => {
    it('should remove stopwords', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([[{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'et', tag: ['CON'], lemma: 'et' },
            { id: 8, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 9, token: 'hotdog', tag: ['UNK'], lemma: 'hotdog' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTStopWords'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 5);
                done();
            });
    });
});

describe('filter tags', () => {
    it('should keep only adjectives and names, by default', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([[{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTFilterTags'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res[0].tag[0], 'NOM');
                assert.equal(res[1].tag[0], 'ADJ');
                done();
            });
    });

    it('should keep only passed tag', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([[{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTFilterTags', { tags: ['VER'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res[0].tag[0], 'VER');
                done();
            });
    });

    it('should keep only passed tag (based on the beginning)', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([[{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTFilterTags', { tags: ['PRO'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res[0].tag[0], 'PRO:per');
                done();
            });
    });

    it('should keep only passed tag, even if not the first', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([[{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTFilterTags', { tags: ['ART'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                assert.equal(res[0].tag[1], 'ART:def');
                done();
            });
    });
});

describe('extract sentence\'s terms', () => {
    it('should return three terms', () => {
        reinitSequenceFrequency();
        const taggedWords = [
            { token: 'elle', tag: ['PRO:per'] },
            { token: 'semble', tag: ['VER'] },
            { token: 'se', tag: ['PRO:per'] },
            { token: 'nourrir', tag: ['VER'] },
            {
                token: 'essentiellement',
                tag: ['ADV'],
            },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'plancton', tag: ['NOM'] },
            { token: 'frais', tag: ['ADJ'] },
            { token: 'et', tag: ['CON'] },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'hotdog', tag: ['UNK'] },
        ];
        const { termSequence, termFrequency } = extractSentenceTerms(taggedWords);
        assert.equal(termSequence.length, 3);
        assert.equal(termSequence[0], 'plancton');
        assert.equal(termSequence[1], 'frais');
        assert.equal(termSequence[2], 'plancton frais');
        assert.equal(termFrequency.plancton, 1);
        assert.equal(termFrequency.frais, 1);
        assert.equal(termFrequency['plancton frais'], 1);
    });

    it('should compute correct frequencies', () => {
        reinitSequenceFrequency();
        const taggedWords = [
            { token: 'elle', tag: ['PRO:per'] },
            { token: 'semble', tag: ['VER'] },
            { token: 'se', tag: ['PRO:per'] },
            { token: 'nourrir', tag: ['VER'] },
            {
                token: 'essentiellement',
                tag: ['ADV'],
            },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'plancton', tag: ['NOM'] },
            { token: 'frais', tag: ['ADJ'] },
            { token: 'et', tag: ['CON'] },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'hotdog', tag: ['UNK'] },
        ];
        const { termFrequency } = extractSentenceTerms(taggedWords, '', '');
        assert.equal(Object.keys(termFrequency).length, 11);
        assert.equal(termFrequency.elle, 1);
        assert.equal(termFrequency.de, 2);
    });
});

describe('extract terms', () => {
    it('should return three terms', (done) => {
        const res = [];
        /* eslint-disable object-curly-newline */
        from([[[{ token: 'elle', tag: ['PRO:per'] },
            { token: 'semble', tag: ['VER'] },
            { token: 'se', tag: ['PRO:per'] },
            { token: 'nourrir', tag: ['VER'] },
            {
                token: 'essentiellement',
                tag: ['ADV'],
            },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'plancton', tag: ['NOM'] },
            { token: 'frais', tag: ['ADJ'] },
            { token: 'et', tag: ['CON'] },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'hotdog', tag: ['UNK'] }]]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 3);
                assert.equal(res[0].token, 'plancton');
                assert.equal(res[1].token, 'frais');
                assert.equal(res[2].token, 'plancton frais');
                assert.equal(res[0].tag[0], 'NOM');
                assert.equal(res[1].tag[0], 'ADJ');
                assert.strictEqual(res[2].tag, undefined);
                assert.equal(res[0].frequency, 1);
                assert.equal(res[1].frequency, 1);
                assert.equal(res[2].frequency, 1);
                assert.equal(res[0].length, 1);
                assert.equal(res[1].length, 1);
                assert.equal(res[2].length, 2);
                done();
            });
    });

    it('should compute correct frequencies', (done) => {
        const res = [];
        /* eslint-disable object-curly-newline */
        from([[[{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' },
            { id: 8, token: 'et', tag: ['CON'], lemma: 'et' },
            { id: 9, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 10, token: 'hotdog', tag: ['UNK'], lemma: 'hotdog' }]]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.equal(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 11);
                assert.equal(res[0].token, 'elle');
                assert.equal(res[0].lemma, 'elle');
                assert.equal(res[0].tag[0], 'PRO:per');
                assert.equal(res[0].frequency, 1);
                assert.equal(res[5].frequency, 2);
                assert.equal(res[10].length, 11);
                assert.strictEqual(res[1].frequency, 1); // no undefined
                done();
            });
    });

    it('should return terms from several sentences', (done) => {
        const res = [];
        from([[[
            { token: 'elle', tag: ['PRO:per'] },
            { token: 'semble', tag: ['VER'] },
            { token: 'heureuse', tag: ['ADJ'] },
        ], [
            { token: 'mais', tag: ['CON'] },
            { token: 'pas', tag: ['FAKE'] },
            { token: 'lui', tag: ['PRO'] },
        ]]])
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert.equal(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 8); // One multiterm per sentence (no tags given)
                done();
            });
    });

    it('should decompose frequencies when in several chunks', (done) => {
        const res = [];
        /* eslint-disable object-curly-newline */
        from([[[{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
        ]], [[
            { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' },
            { id: 8, token: 'et', tag: ['CON'], lemma: 'et' },
            { id: 9, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 10, token: 'hotdog', tag: ['UNK'], lemma: 'hotdog' }]]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 13);
                assert.equal(res[5].lemma, 'de');
                assert.equal(res[10].lemma, 'de');
                assert.equal(res[5].frequency, 1);
                assert.equal(res[10].frequency, 1);
                done();
            });
    });
});

describe('sum up frequencies', () => {
    it('should sum up frequencies when in several chunks', (done) => {
        const res = [];
        /* eslint-disable object-curly-newline */
        from([[[{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
            { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
            { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
            { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
                lemma: 'essentiellement',
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
        ]], [[
            { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
            { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' },
            { id: 8, token: 'et', tag: ['CON'], lemma: 'et' },
            { id: 9, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
            { id: 10, token: 'hotdog', tag: ['UNK'], lemma: 'hotdog' }]]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            .pipe(ezs('TEEFTSumUpFrequencies'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 12);
                assert.equal(res[5].lemma, 'de');
                assert.equal(res[5].frequency, 2);
                done();
            });
    });

    it('should sum up frequencies when in several chunks, and no lemma', (done) => {
        const res = [];
        /* eslint-disable object-curly-newline */
        from([[[{ id: 0, token: 'elle', tag: ['PRO:per'] },
            { id: 1, token: 'semble', tag: ['VER'] },
            { id: 2, token: 'se', tag: ['PRO:per'] },
            { id: 3, token: 'nourrir', tag: ['VER'] },
            { id: 4,
                token: 'essentiellement',
                tag: ['ADV'],
            },
            { id: 5, token: 'de', tag: ['PRE', 'ART:def'] },
        ]], [[
            { id: 6, token: 'plancton', tag: ['NOM'] },
            { id: 7, token: 'frais', tag: ['ADJ'] },
            { id: 8, token: 'et', tag: ['CON'] },
            { id: 9, token: 'de', tag: ['PRE', 'ART:def'] },
            { id: 10, token: 'hotdog', tag: ['UNK'] }]]])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TEEFTExtractTerms', { nounTag: '', adjTag: '' }))
            .pipe(ezs('TEEFTSumUpFrequencies'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk, 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 12);
                assert.equal(res[5].token, 'de');
                assert.equal(res[5].frequency, 2);
                done();
            });
    });
});

describe('compute specificity', () => {
    it('should work without weights', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 8, length: 1, token: 'elle', id: 0, tag: ['PRO:per'], lemma: 'elle' },
            { frequency: 1, length: 1, token: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, token: 'se', id: 2, tag: ['PRO:per'], lemma: 'se' },
            { frequency: 1, length: 1, token: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, token: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
            { frequency: 2, length: 1, token: 'de', id: 9, tag: ['PRE', 'ART:def'], lemma: 'de' },
            { frequency: 1, length: 1, token: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, token: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, token: 'et', id: 8, tag: ['CON'], lemma: 'et' },
            { frequency: 1, length: 1, token: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTSpecificity', { weightedDictionary: null, filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 10);
                assert.equal(res[0].lemma, 'elle');
                assert.equal(res[0].frequency, 8);
                assert.equal(res[0].specificity, 1);
                done();
            });
    });

    it('should work with weights', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 1, length: 1, token: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, token: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, token: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
            { frequency: 1, length: 1, token: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, token: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, token: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTSpecificity', { filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 6);
                assert.equal(res[0].token, 'semble');
                assert.equal(res[0].frequency, 1);
                assert.equal(res[0].specificity, 0.0008964346775894244);
                done();
            });
    });

    it('should work with weights and filter', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 1, length: 1, token: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, token: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, token: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
            { frequency: 1, length: 1, token: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, token: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, token: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTSpecificity'))
            // .pipe(ezs('debug'))
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
            { frequency: 8, length: 1, token: 'elle', id: 0, tag: ['PRO:per'], lemma: 'elle' },
            { frequency: 1, length: 1, token: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, token: 'se', id: 2, tag: ['PRO:per'], lemma: 'se' },
            { frequency: 1, length: 1, token: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, token: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
            { frequency: 2, length: 1, token: 'de', id: 9, tag: ['PRE', 'ART:def'], lemma: 'de' },
            { frequency: 1, length: 1, token: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, token: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, token: 'et', id: 8, tag: ['CON'], lemma: 'et' },
            { frequency: 1, length: 1, token: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTSpecificity', { sort: true, weightedDictionary: '', filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 10);
                assert.equal(res.find(t => t.token === 'elle').specificity, 1);
                assert.equal(res.find(t => t.token === 'de').specificity, 0.25);
                assert.equal(res.find(t => t.token === 'semble').specificity, 0.125);
                done();
            });
    });

    it('should work whatever the order of terms', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 1, length: 1, token: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, token: 'se', id: 2, tag: ['PRO:per'], lemma: 'se' },
            { frequency: 1, length: 1, token: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, token: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
            { frequency: 2, length: 1, token: 'de', id: 9, tag: ['PRE', 'ART:def'], lemma: 'de' },
            { frequency: 1, length: 1, token: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, token: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, token: 'et', id: 8, tag: ['CON'], lemma: 'et' },
            { frequency: 1, length: 1, token: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
            { frequency: 8, length: 1, token: 'elle', id: 0, tag: ['PRO:per'], lemma: 'elle' },
            /* eslint-enable object-curly-newline */

        ]])
            .pipe(ezs('TEEFTSpecificity', { sort: true, weightedDictionary: '', filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 10);
                assert.equal(res.find(t => t.token === 'elle').specificity, 1);
                assert.equal(res.find(t => t.token === 'de').specificity, 0.25);
                assert.equal(res.find(t => t.token === 'semble').specificity, 0.125);
                done();
            });
    });

    it('should keep multiterms (terms without tags)', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 3, length: 1, token: 'logiciel', id: 2703, tag: ['ADJ', 'NOM'], lemma: 'logiciel' },
            { frequency: 1, length: 1, token: 'content', id: 2704, tag: ['NOM', 'ADJ', 'VER'], lemma: 'content' },
            { frequency: 1, length: 2, token: 'logiciel content' },
            { frequency: 1, length: 1, token: 'management', id: 2706, tag: ['NOM'], lemma: 'management' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTSpecificity', { sort: true, weightedDictionary: '', filter: true }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res[0].lemma, 'logiciel');
                assert.equal(res[0].frequency, 3);
                assert.equal(res[0].specificity, 1);
                assert.equal(res[1].token, 'logiciel content');
                assert.equal(res[1].frequency, 1);
                assert.equal(res[1].length, 2);
                assert.equal(res[1].specificity, 1 / 3);
                done();
            });
    });

    it('should compute average specificity only on monoterms', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 1, length: 1, token: 'logiciel', id: 2703, tag: ['ADJ', 'NOM'], lemma: 'logiciel' },
            { frequency: 1, length: 1, token: 'content', id: 2704, tag: ['NOM', 'ADJ', 'VER'], lemma: 'content' },
            { frequency: 10, length: 2, token: 'logiciel content' },
            { frequency: 1, length: 1, token: 'management', id: 2706, tag: ['NOM'], lemma: 'management' },
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
                assert.equal(res[0].tag, undefined); // multiterm
                assert.equal(res[0].specificity, 1);
                assert(res[1].tag); // monoterm
                done();
            });
    });

    it('should not crash when input is empty', (done) => {
        let res = [];
        let err;
        from([])
            .pipe(ezs('TEEFTSpecificity'))
            // .pipe(ezs('debug'))
            .pipe(ezs.catch((error) => { err = error; }))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 0);
                done(err);
            });
    });

    it('should work on several sentences', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 3, length: 1, token: 'logiciel', id: 2703, tag: ['ADJ', 'NOM'], lemma: 'logiciel' },
            { frequency: 1, length: 1, token: 'content', id: 2704, tag: ['NOM', 'ADJ', 'VER'], lemma: 'content' },
            { frequency: 1, length: 2, token: 'logiciel content' },
        ], [
            { frequency: 1, length: 1, token: 'management', id: 2706, tag: ['NOM'], lemma: 'management' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTSpecificity', { sort: true, weightedDictionary: '', filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 4);
                assert.equal(res[0].lemma, 'logiciel');
                assert.equal(res[0].frequency, 3);
                assert.equal(res[0].specificity, 1);
                assert.equal(res[2].token, 'logiciel content');
                assert.equal(res[2].frequency, 1);
                assert.equal(res[2].length, 2);
                assert.equal(res[2].specificity, 1 / 3);
                assert.equal(res[3].token, 'management');
                assert.equal(res[3].frequency, 1);
                assert.equal(res[3].specificity, 1 / 3);
                done();
            });
    });
});

describe('filter multiterms and frequent monoterms', () => {
    it('should keep frequent monoterms', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 8, length: 1, token: 'elle', id: 0, tag: ['PRO:per'], lemma: 'elle' },
            { frequency: 1, length: 1, token: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, token: 'se', id: 2, tag: ['PRO:per'], lemma: 'se' },
            { frequency: 1, length: 1, token: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, token: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
            { frequency: 2, length: 1, token: 'de', id: 9, tag: ['PRE', 'ART:def'], lemma: 'de' },
            { frequency: 1, length: 1, token: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, token: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, token: 'et', id: 8, tag: ['CON'], lemma: 'et' },
            { frequency: 1, length: 1, token: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTFilterMultiFreq'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                assert.equal(res[0].lemma, 'elle');
                assert.equal(res[0].frequency, 8);
                done();
            });
    });

    it('should keep multiterms', (done) => {
        let res = [];
        from([[
            /* eslint-disable object-curly-newline */
            { frequency: 1, length: 1, token: 'elle', id: 0, tag: ['PRO:per'], lemma: 'elle' },
            { frequency: 1, length: 1, token: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
            { frequency: 1, length: 1, token: 'se', id: 2, tag: ['PRO:per'], lemma: 'se' },
            { frequency: 1, length: 1, token: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
            { frequency: 1, length: 1, token: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
            { frequency: 2, length: 1, token: 'de', id: 9, tag: ['PRE', 'ART:def'], lemma: 'de' },
            { frequency: 1, length: 6, token: 'elle sembler se nourrir essentiellement de' },
            { frequency: 1, length: 1, token: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
            { frequency: 1, length: 1, token: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
            { frequency: 1, length: 1, token: 'et', id: 8, tag: ['CON'], lemma: 'et' },
            { frequency: 1, length: 1, token: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
            { frequency: 1, length: 5, token: 'plancton frais et de hotdog' },
            /* eslint-enable object-curly-newline */
        ]])
            .pipe(ezs('TEEFTFilterMultiFreq'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res[0].token, 'elle sembler se nourrir essentiellement de');
                assert.equal(res[1].token, 'plancton frais et de hotdog');
                done();
            });
    });
});

describe('natural', () => {
    describe('tag', () => {
        it('should correctly tag a sentence in French', (done) => {
            let res = [];
            from([[['Elle', 'semble', 'se', 'nourrir', 'essentiellement', 'de', 'plancton', 'et', 'de', 'hotdog']]])
                .pipe(ezs('TEEFTNaturalTag'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 1);
                    const firstSentence = res[0];
                    assert.equal(firstSentence.length, 10);
                    assert.equal(firstSentence[1].token, 'semble');
                    assert.equal(firstSentence[1].tag[0], 'VER');
                    assert.equal(firstSentence[4].token, 'essentiellement');
                    assert.equal(firstSentence[4].tag[0], 'ADV');
                    done();
                });
        });

        it('should correctly tag a sentence in French with accented words', (done) => {
            let res = [];
            from([[['Ça', 'veut', 'sûrement', 'dire', 'qu\'', 'il', 'fut', 'assassiné']]])
                .pipe(ezs('TEEFTNaturalTag'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 1);
                    const firstSentence = res[0];
                    assert.equal(firstSentence.length, 8);
                    assert.equal(firstSentence[1].token, 'veut');
                    assert.equal(firstSentence[1].tag[0], 'VER');
                    assert.equal(firstSentence[2].token, 'sûrement');
                    assert.equal(firstSentence[2].tag[0], 'ADV');
                    done();
                });
        });

        it('should correctly tag two sentences in French with accented words', (done) => {
            let res = [];
            from([[
                ['Ça', 'veut', 'sûrement', 'dire', 'qu\'', 'il', 'fut', 'assassiné'],
                ['Mais', 'j\'', 'espère', 'que', 'ce', 'n\'', 'était', 'pas', 'grave'],
            ]])
                .pipe(ezs('TEEFTNaturalTag'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 2);
                    const firstSentence = res[0];
                    assert.equal(firstSentence.length, 8);
                    assert.equal(firstSentence[1].token, 'veut');
                    assert.equal(firstSentence[1].tag[0], 'VER');
                    assert.equal(firstSentence[2].token, 'sûrement');
                    assert.equal(firstSentence[2].tag[0], 'ADV');
                    const secondSentence = res[1];
                    assert.equal(secondSentence.length, 9);
                    assert.equal(secondSentence[0].token, 'Mais');
                    assert(secondSentence[0].tag);
                    assert.equal(secondSentence[0].tag[0], 'KON');
                    assert.equal(secondSentence[1].token, 'j\'');
                    assert.equal(secondSentence[1].tag[0], 'PRO');
                    done();
                });
        });
    });

    describe('sentence-tokenize', () => {
        it('should correctly segment sentences', (done) => {
            let res = [];
            from(['Je ne suis pas sûr. Il faut un tableau.'])
                .pipe(ezs('TEEFTSentenceTokenize'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 2);
                    assert.equal(res[0], 'Je ne suis pas sûr.');
                    assert.equal(res[1], 'Il faut un tableau.');
                    done();
                });
        });

        it('should correctly segment sentences in several strings', (done) => {
            let res = [];
            from(['Il faut un tableau.', 'Et ça j\'en suis sûr. Maintenant!'])
                .pipe(ezs('TEEFTSentenceTokenize'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(chunk);
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 3);
                    assert.equal(res[0], 'Il faut un tableau.');
                    assert.equal(res[1], 'Et ça j\'en suis sûr.');
                    assert.equal(res[2], 'Maintenant!');
                    done();
                });
        });
    });
});
