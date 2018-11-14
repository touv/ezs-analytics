const assert = require('assert');
const path = require('path');
const from = require('from');
const ezs = require('ezs');

ezs.use(require('../lib'));

describe('files', () => {
    describe('ListFiles', () => {
        it('should return the list of files', (done) => {
            let res = [];
            const dirPath = path.resolve(__dirname, '../examples/data/fr-articles/');
            from([dirPath])
                .pipe(ezs('ListFiles'))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 5);
                    done();
                });
        });

        it('should return the list of files for every directory', (done) => {
            let res = [];
            from([
                path.resolve(__dirname, '../examples/data/fr-articles/'),
                path.resolve(__dirname, '../examples/data/'),
            ])
                .pipe(ezs('ListFiles'))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 7);
                    done();
                });
        });

        it('should return no file when input is not a list of directories', (done) => {
            let res = [];
            from([
                path.resolve(__dirname, '../examples/data/artificial.txt'),
            ])
                .pipe(ezs('ListFiles'))
                .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 0);
                    done();
                });
        });

        it('should return no file when input does not exist', (done) => {
            let res = [];
            from([
                path.resolve(__dirname, '../examples/data/foo'),
            ])
                .pipe(ezs('ListFiles'))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 0);
                    done();
                });
        });
    });
});
