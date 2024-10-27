
// [0.15, 0.1, 0.2, 0.3, 0.25]
// [3, 4, 3, 3, 7]

const dmath = require('./dmath.js');

console.log(wmedian([1, 2, 3, 4, 5], [0.15, 0.1, 0.2, 0.3, 0.25]));
console.log(wmedian([1, 2, 3, 4], [0.25, 0.25, 0.25, 0.25]));
console.log(wmedian([22, 23, 24, 25, 26], [3, 4, 3, 3, 7]));

function wmedian (list, freq) {

    if (list.length != freq.length) {
        return NaN;
    }

    let weights = []
    let total = sum(freq);
    for (let f of freq) {
        if (f < 0) {
            return NaN;
        }
        weights.push(f / total);
    }

    [list, weights] = wsort(list, weights);

    let csum = 0;
    let index = 0;

    while (dmath.isLess(csum, 0.5)) {
        csum += weights[index]
        index += 1
    }

    if (dmath.isEqual(csum, 0.5)) {
        return (list[index-1] + list[index]) / 2;
    } else {
        return list[index-1];
    }

}


function wsort (list, freq) {
    if (list.length != freq.length) {
        return NaN;
    }

    for (var i = 0; i < freq.length; i++) {
        if (freq[i] < 0) {
            return NaN;
        }
    }

    var newArray = [];

    for (var i = 0; i < list.length; i++) {
        newArray.push({ 'x' : list[i],  'f' : freq[i] });
    }

    newArray.sort(function(a, b) {
        return ((a.x < b.x) ? -1 : ((a.x == b.x) ? 0 : 1));
    });

    for (var i = 0; i < newArray.length; i++) {
        list[i] = newArray[i].x;
        freq[i] = newArray[i].f;
    }

    return [list, freq];

}

function sum(list) {
    var s = 0;
    for(var i = 0; i < list.length; i++) {
        s += list[i];
    }
    return s;
}

function abs(x) {
    if (x >= 0) {
        return x;
    } else {
        return -x;
    }
}

// // Main call is WeightedMedian(a, 1, n)
// // Returns lower median
// function WeightedMedian(a, w, p, r) {
//     // base case for single element
//     if (r == p) {
//         return a[p]
//     }

//     // base case for two elements
//     // make sure we return the mean in the case that the two candidates have equal weight
//     if (r-p == 1) {
//         if(w[p] == w[r]) {
//             return (a[p] + a[r]) / 2;
//         }
//         if(w[p] > w[r]) {
//             return a[p];
//         } else {
//             return a[r];
//         }
//     }

//     // partition around pivot r
//     q = 

// }

//     // Partition around pivot r
//     q = partition(a, p, r)
//     wl, wg = sum weights of partitions (p, q-1), (q+1, r)
//     // If partitions are balanced then we are done
//     if wl and wg both < 1/2 then
//         return a[q]
//     else
//         // Increase pivot weight by the amount of partition we eliminate
//         if wl > wg then
//             a[q].w += wg
//             // Recurse on pivot inclusively 
//             WeightedMedian(a, p, q)
//         else
//             a[q].w += wl
//             WeightedMedian(a, q, r)


//     // Base case for single element
//     if r = p then
//         return a[p]
//     // Base case for two elements
//     // Make sure we return the mean in the case that the two candidates have equal weight
//     if r-p = 1 then
//         if a[p].w == a[r].w
//             return (a[p] + a[r])/2
//         if a[p].w > a[r].w
//             return a[p]
//         else 
//             return a[r]