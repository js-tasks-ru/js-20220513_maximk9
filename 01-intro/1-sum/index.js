/**
 * sum
 * @param {number} m base
 * @param {number} n index
 * @returns {number}
 */
export default function sum(m, n) {
    if (typeof(m) == 'string') {
        m = Number.parseFloat(m)
    }
    if (typeof(n) == 'string') {
        n = Number.parseFloat(n)
    }

    return typeof(m) == 'number' && typeof(n) == 'number' ? m + n : NaN;
}
