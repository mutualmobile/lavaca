/* eslint-disable no-use-before-define */

let longestCommonSubsequence = function(a, b, equals) {
  equals = equals || function(a, b) {
    return a === b;
  };

  // https://en.wikipedia.org/wiki/Longest_common_subsequence_problem
  let lcs = function(a, b) {
    // https://en.wikipedia.org/wiki/Row-major_order
    let matrix = new Uint16Array(a.length * b.length);

    for (let i = 1; i < a.length; i++) {
      for (let j = 1; j < b.length; j++) {
        if (equals(a[i], b[j])) {
          matrix[b.length * i + j] = matrix[b.length * (i-1) + (j-1)] + 1;
        }
        else {
          matrix[b.length * i + j] = Math.max(matrix[b.length * i + (j-1)], matrix[b.length * (i-1) + j]);
        }
      }
    }

    return matrix;
  };

  let backtrack = function(matrix, a, b, prefix, i = (a.length - 1), j = (b.length - 1), ret) {
    ret = ret || {
      added: [],
      removed: [],
      common: []
    };

    if (i > 0 && j > 0 && equals(a[i], b[j])) {
      backtrack(matrix, a, b, prefix, i-1, j-1, ret);
      ret.common.push({
        oldIndex: prefix + i - 1,
        index: prefix + j - 1,
        item: b[j]
      });
    }
    else if (j > 0 && (i === 0 || matrix[b.length * i + (j-1)] >= matrix[b.length * (i-1) + j])) {
      backtrack(matrix, a, b, prefix, i, j-1, ret);
      ret.added.push({
        index: prefix + j - 1,
        item: b[j]
      });
    }
    else if (i > 0 && (j === 0 || matrix[b.length * i + (j-1)] < matrix[b.length * (i-1) + j])) {
      backtrack(matrix, a, b, prefix, i-1, j, ret);
      ret.removed.push({
        index: prefix + i - 1,
        item: a[i]
      });
    }

    return ret;
  };

  let getSharedPrefix = function(a, b) {
    let len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      if (!equals(a[i], b[i])) {
        return i;
      }
    }
    return len;
  };

  let getSharedSuffix = function(a, b) {
    let i = a.length;
    let j = b.length;
    let count = 0;
    while (i > 0 && j > 0) {
      i--;
      j--;
      if (!equals(a[i], b[j])) {
        return count;
      }
      count++;
    }
    return count;
  };

  let prefix = getSharedPrefix(a, b);

  let common = a.slice(0, prefix).map((item, i) => {
    return {
      oldIndex: i,
      index: i
    };
  });

  if (a.length === b.length && prefix === a.length) {
    return {
      added: [],
      removed: [],
      moved: [],
      common
    };
  }

  let suffix = getSharedSuffix(a, b);

  if (suffix) {
    let aOffset = a.length - suffix;
    let bOffset = b.length - suffix;
    common = [...common, ...a.slice(-1 * suffix).map((item, i) => {
      return {
        oldIndex: i + aOffset,
        index: i + bOffset
      };
    })];
  }


  a = a.slice(prefix, (-1 * suffix) || a.length);
  b = b.slice(prefix, (-1 * suffix) || b.length);

  a = [null, ...a];
  b = [null, ...b];

  let matrix = lcs(a, b);
  let result = backtrack(matrix, a, b, prefix);

  let added = result.added.slice(0);
  let removed = result.removed.slice(0);
  let moved = [];
  common = [...common, ...result.common];

  // detect moved items (both added and removed)
  for (let i = result.removed.length-1; i >= 0; i--) {
    for (let j = result.added.length-1; j >= 0; j--) {
      if (equals(removed[i].item, added[j].item)) {
        let oldIndex = removed[i].index;
        let index = added[j].index;
        let item = added[j].item;

        if (oldIndex !== index) {
          moved.push({
            oldIndex,
            index,
            item
          });
        }

        added.splice(j, 1);
        removed.splice(i, 1);
        break;
      }
    }
  }

  return {
    added,
    removed,
    moved,
    common
  };
};


let diff = function(a, b, equals) {

  let patches = [];

  let arrayDiff = function(a, b, path) {
    let lcs = longestCommonSubsequence(a, b, equals);
    lcs.added.forEach(function(item) {
      patches.push({
        op: 'add',
        path: [...path, item.index],
        value: b[item.index]
      });
    });
    lcs.removed.forEach(function(item) {
      patches.push({
        op: 'remove',
        path: [...path, item.index],
        value: a[item.index]
      });
    });
    lcs.moved.forEach(function(item) {
      patches.push({
        op: 'move',
        path: [...path, item.index],
        from: [...path, item.oldIndex],
        value: b[item.index]
      });
    });

    let list = [...lcs.common, ...lcs.moved];
    for (let i = 0; i < list.length; i++) {
      let oldIndex = list[i].oldIndex;
      let newIndex = list[i].index;
      let oldValue = a[oldIndex];
      let newValue = b[newIndex];
      anyDiff(oldValue, newValue, [...path, newIndex]);
    }
  };

  let objectDiff = function(a, b, path) {
    let oldKeys = Object.keys(a);
    let newKeys = Object.keys(b);
    let keysAreEqual = true;

    for (let i = 0; i < oldKeys.length; i++) {
      let key = oldKeys[i];

      if (key !== newKeys[i]) {
        keysAreEqual = false;
      }

      if (b[key] === a[key]) {
        continue;
      }

      if (b[key] === undefined && newKeys.indexOf(key) === -1) {
        patches.push({
          op: 'remove',
          path: [...path, key],
          value: a[key]
        });
        continue;
      }

      anyDiff(a[key], b[key], [...path, key]);
    }

    // We can skip checking for 'add's if a and b have the exact same
    // enumerable property names.
    if (keysAreEqual && oldKeys.length === newKeys.length) {
      return;
    }

    for (let i = 0; i < newKeys.length; i++) {
      let key = newKeys[i];

      if (a[key] === undefined && oldKeys.indexOf(key) === -1) {
        patches.push({
          op: 'add',
          path: [...path, key],
          value: b[key]
        });
      }
    }
  };

  let anyDiff = function(a, b, path) {
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      if (Array.isArray(a) && Array.isArray(b)) {
        arrayDiff(a, b, path);
        return;
      }
      objectDiff(a, b, path);
      return;
    }
    if (a !== b) {
      patches.push({
        op: 'replace',
        path: path,
        oldValue: a,
        value: b
      });
    }
    return;
  };

  anyDiff(a, b, []);
  return patches;
};

export default diff;
