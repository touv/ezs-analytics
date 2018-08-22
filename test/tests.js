const assert = require('assert');
const from = require('from');
const ezs = require('ezs');

ezs.use(require('../lib'));

describe('test', () => {
    it('count', (done) => {
        const res = [];
        from([
            { a: 'x' },
            { a: 't' },
            { a: 't' },
            { a: 'x' },
        ])
            .pipe(ezs('count', { path: 'a' }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(4, res.length);
                assert.equal(1, res[0].value);
                assert.equal(1, res[1].value);
                assert.equal(1, res[2].value);
                assert.equal(1, res[3].value);
                done();
            });
    });
});

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
