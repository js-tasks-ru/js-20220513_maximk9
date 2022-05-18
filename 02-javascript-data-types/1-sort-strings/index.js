/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
 return [...arr].sort((x, y) => {
   const c = x.localeCompare(y, 'ru', { caseFirst: 'upper' });
   return param === 'desc' ? -c : c;
 });
}


