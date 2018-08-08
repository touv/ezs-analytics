const assert = require('assert');
const from = require('from');
const ezs = require('ezs');

ezs.use(require('../lib'));

describe('test', () => {
    it('count', (done) => {
        const res = [];
        // from([
        //     { a: 'x', b: 'z' },
        //     { a: 't', b: 'z' },
        //     { a: 't', b: 'z' },
        //     { c: 'x', b: 'z' },
        //     { a: 'x', b: 'z' },
        // ])
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
