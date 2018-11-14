function ListFiles(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    feed.write();
    feed.end();
}

/**
 * Take an array of directory paths as input, a pattern, and returns a list of
 * file paths matching the pattern in the directories from the input.
 *
 * @name ListFiles
 * @param {String}  [pattern="*"]   pattern for files (ex: "*.txt")
 * @returns {<Array<String>>}   an array of file paths
 */
export default {
    ListFiles,
};
