/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size = -1) {
    if (size === -1) {
        return string;
    }

    let result = ''
    let consecutive = 1
    for (const currentChar of string) {
        if (currentChar == result.slice(-1)) {
            consecutive++;
        } else {
            consecutive = 1
        }
        if (consecutive <= size) {
            result = result + currentChar
        }
    }

    return result
}
