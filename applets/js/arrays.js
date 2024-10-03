/******************************************************************************
 * Shuffles an array into a randomized order.
 * @param array {number[]}
 */
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

/******************************************************************************
 * Sorts an array of numbers into ascending order.
 * @param list {number[]} list of numbers to sort
 */
function sort(list) {
    return list.sort(function (a, b) { return a - b; });
}

/******************************************************************************
 * Sorts an array of numbers into descending order.
 * @param list {number[]} list of numbers to sort
 */
function sortD(list) {
    return list.sort(function (a, b) { return b - a; });
}

/******************************************************************************
 * Creates an array of numbers in a linear sequential order from start to
 *  stop in increments of step
 * @param start {number} The beginning value in the list
 * @param stop {number} The ending value in the list
 * @param step {number} The number of values to skip from one item to the next
 * @returns {number[]} An array containing a list of sequential values from
 *   start to stop in increments of step
 */

function aRange(start, stop, step) {
    return Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step)
};
