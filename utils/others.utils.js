const generateRandomNumber = (length) => {
  const characters = "0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};


const mergeArrays = (arrA, arrB) => {
  return arrB.map((objB) => {
    const matchingObject = arrA.find(
      (objA) => objA.mobile === objB.sender_id
    );
    return matchingObject ? { ...objB, contact: matchingObject } : objB;
  });
}


function dataGet(target, key, defaultValue = null) {
  if (key == null) return target;

  const segments = Array.isArray(key) ? key : key.split('.');

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (segment === null) return target;

    if (segment === '*') {
      if (!Array.isArray(target)) return typeof defaultValue === 'function' ? defaultValue() : defaultValue;

      const remaining = segments.slice(i + 1);
      const result = target.map(item => dataGet(item, remaining));

      return remaining.includes('*') ? result.flat() : result;
    }

    if (Array.isArray(target)) {
      if (!isNaN(segment) && target[segment] !== undefined) {
        target = target[segment];
      } else {
        return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
      }
    } else if (target !== null && typeof target === 'object' && segment in target) {
      target = target[segment];
    } else {
      return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
  }

  return target;
}


module.exports = { generateRandomNumber, mergeArrays, dataGet };
