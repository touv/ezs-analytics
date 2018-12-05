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

        it('should return the list of select files', (done) => {
            let res = [];
            const dirPath = path.resolve(__dirname, '../examples/data/fr-articles/');
            from([dirPath])
                .pipe(ezs('ListFiles', { pattern: '*m*.txt' }))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 3);
                    done();
                });
        });

        it('should return the files from an explicit relative path', (done) => {
            let res = [];
            const dirPath = './examples/data/fr-articles/';
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

        it('should return the files from an implicit relative path', (done) => {
            let res = [];
            const dirPath = 'examples/data/fr-articles/';
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

        it('should return the files with a newline character', (done) => {
            let res = [];
            const dirPath = 'examples/data/fr-articles/\n';
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
    });

    describe('get files content', () => {
        it('should return the content of one file', (done) => {
            let res = [];
            const dataPath = path.resolve(__dirname, '../examples/data');
            const filePath = `${dataPath}/artificial.txt`;
            from([filePath])
                .pipe(ezs('GetFilesContent'))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 1);
                    assert.equal(typeof res[0], 'object');
                    assert.equal(res[0].path, filePath);
                    assert.equal(res[0].content.length, 1067);
                    assert.ok(res[0].content.startsWith('Ceci est'));
                    done();
                });
        });

        it('should return the content of two files', (done) => {
            let res = [];
            const dataPath = path.resolve(__dirname, '../examples/data');
            const filePath = `${dataPath}/artificial.txt`;
            from([filePath, filePath])
                .pipe(ezs('GetFilesContent'))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 2);
                    assert.equal(typeof res[0], 'object');
                    assert.equal(res[0].path, filePath);
                    assert.equal(res[0].content.length, 1067);
                    assert.ok(res[0].content.startsWith('Ceci est'));
                    assert.equal(typeof res[1], 'object');
                    assert.equal(res[1].path, filePath);
                    assert.equal(res[1].content.length, 1067);
                    assert.ok(res[1].content.startsWith('Ceci est'));
                    done();
                });
        });

        it('should return an error when the file does not exist', (done) => {
            let res = [];
            const dataPath = path.resolve(__dirname, '../examples/data');
            const filePath = `${dataPath}/nonexisting.txt`;
            from([filePath])
                .pipe(ezs('GetFilesContent'))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 1);
                    assert.equal(typeof res[0], 'object');
                    assert.equal(res[0].path, filePath);
                    assert.ok(res[0] instanceof Error);
                    assert.equal(res[0].content, undefined);
                    assert.equal(res[0].errno, -2);
                    assert.equal(res[0].code, 'ENOENT');
                    assert.equal(res[0].syscall, 'open');
                    done();
                });
        });

        it('should continue when encountering an error', (done) => {
            let res = [];
            const dataPath = path.resolve(__dirname, '../examples/data');
            const filePath = `${dataPath}/nonexisting.txt`;
            const filePath2 = `${dataPath}/artificial.txt`;
            from([filePath, filePath2])
                .pipe(ezs('GetFilesContent'))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res = res.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 2);
                    assert.equal(typeof res[0], 'object');
                    assert.equal(res[0].path, filePath);
                    assert.ok(res[0] instanceof Error);
                    assert.equal(res[0].content, undefined);
                    assert.equal(res[0].errno, -2);
                    assert.equal(res[0].code, 'ENOENT');
                    assert.equal(res[0].syscall, 'open');
                    assert.equal(typeof res[1], 'object');
                    assert.equal(res[1].path, filePath2);
                    assert.equal(res[1].content.length, 1067);
                    assert.ok(res[1].content.startsWith('Ceci est'));
                    done();
                });
        });
    });
});
