/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    let fields = path.split('.')
    return (obj) => {
        let value = obj
        for (const field of fields) {
            // this condition is before get of property in case theh root obj already undefined
            if (value === undefined) break;
            value = value[field]
        }
        return value;
    };
}
