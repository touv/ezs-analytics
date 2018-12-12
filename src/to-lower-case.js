import {
    assocPath, curry, map, path, pipe, toLower,
} from 'ramda';

const objPropLower = curry((propPath, obj) => {
    const propToLowerCase = pipe(
        path(propPath),
        toLower,
    );
    const str = propToLowerCase(obj);
    const res = assocPath(propPath, str, obj);
    return res;
});

/**
 * Transform strings to lower case.
 *
 * @export
 * @param {any} data
 * @param {any} feed
 * @param {Array<string>}   path    path to the property to modify
 */
export default function ToLowerCase(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const propPath = this.getParam('path', []);
    let res;
    if (Array.isArray(data)) {
        res = map(objPropLower(propPath), data);
    } else {
        res = objPropLower(propPath, data);
    }
    feed.write(res);
    feed.end();
}
