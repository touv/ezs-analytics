/* eslint no-console: ["error", { allow: [ "time", "timeEnd" ] }] */
const labels = [];
let index = 0;

/**
 * Profile the time a statement takes to execute.
 *
 * You have to place one to initialize, and a second to display the time it
 * takes.
 *
 * @export
 * @param {*} data
 * @param {*} feed
 * @returns
 */
export default function profile(data, feed) {
    if (this.isLast()) {
        const label = labels.shift();
        console.timeEnd(`Stage ${label}`);
        return feed.close();
    }
    if (this.isFirst()) {
        index += 1;
        labels.push(index);
        console.time(`Stage ${index}`);
    }
    return feed.send(data);
}
