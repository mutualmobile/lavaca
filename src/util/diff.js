import { isArray, deepEquals } from 'mout/lang';

// longest common subsequence implementation
// https://en.wikipedia.org/wiki/Longest_common_subsequence_problem
let lcs = function(a, b, equals) {
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

let backtrack = function(equals, matrix, a, b, prefix, i = (a.length - 1), j = (b.length - 1), ret) {
  ret = ret || {
    added: [],
    removed: [],
    common: []
  };

  if (i > 0 && j > 0 && equals(a[i], b[j])) {
    backtrack(equals, matrix, a, b, prefix, i-1, j-1, ret);
    ret.common.push({
      fromIndex: prefix + i - 1,
      toIndex: prefix + j - 1,
      item: b[j]
    });
  }
  else if (j > 0 && (i === 0 || matrix[b.length * i + (j-1)] >= matrix[b.length * (i-1) + j])) {
    backtrack(equals, matrix, a, b, prefix, i, j-1, ret);
    ret.added.push({
      index: prefix + j - 1,
      item: b[j]
    });
  }
  else if (i > 0 && (j === 0 || matrix[b.length * i + (j-1)] < matrix[b.length * (i-1) + j])) {
    backtrack(equals, matrix, a, b, prefix, i-1, j, ret);
    ret.removed.push({
      index: prefix + i - 1,
      item: a[i]
    });
  }

  return ret;
};

let getSharedPrefix = function(a, b, equals) {
  let len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (!equals(a[i], b[i])) {
      return i;
    }
  }
  return len;
};

let getSharedSuffix = function(a, b, equals) {
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

let arrayDiff = function(a, b, equals) {
  equals = equals || function(a, b) {
    return a === b;
  };

  let prefix = getSharedPrefix(a, b, equals);
  let suffix = getSharedSuffix(a, b, equals);

  a = a.slice(prefix, (-1 * suffix) || a.length);
  b = b.slice(prefix, (-1 * suffix) || b.length);

  a = [null].concat(a);
  b = [null].concat(b);

  let matrix = lcs(a, b, equals);
  let result = backtrack(equals, matrix, a, b, prefix);

  let added = result.added.slice(0);
  let removed = result.removed.slice(0);
  let moved = [];

  // detect moved items (both added and removed but weren't part of LCS)
  for (let i = result.removed.length-1; i >= 0; i--) {
    for (let j = result.added.length-1; j >= 0; j--) {
      if (equals(removed[i].item, added[j].item)) {
        let fromIndex = removed[i].index;
        let toIndex = added[j].index;
        let item = added[j].item;

        if (fromIndex !== toIndex) {
          moved.push({
            fromIndex,
            toIndex,
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
    moved
  };
};

let objectDiff = function(a, b) {
  let added = [];
  let removed = [];
  let changed = [];

  for (let i = 0, keys = Object.keys(a); i < keys.length; i++) {
    let key = keys[i];

    if (b[key] === a[key]) {
      continue;
    }

    if (!(key in b)) {
      removed.push({
        key,
        value: a[key]
      });
      continue;
    }

    if (!deepEquals(a[key], b[key])) {
      changed.push({
        key,
        oldValue: a[key],
        newValue: b[key]
      });
    }
  }

  for (let i = 0, keys = Object.keys(b); i < keys.length; i++) {
    let key = keys[i];

    if (!(key in a)) {
      added.push({
        key,
        value: b[key]
      });
    }
  }

  return {
    added,
    removed,
    changed
  };
};

let diff = function(a, b, equals) {
  if (isArray(a) && isArray(b)) {
    return arrayDiff(a, b, equals);
  }
  else {
    return objectDiff(a, b, equals);
  }
};

export {
  diff as default,
  objectDiff,
  arrayDiff
};
