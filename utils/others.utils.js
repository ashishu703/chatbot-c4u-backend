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
      (objA) => objA.mobile === objB.sender_mobile
    );
    return matchingObject ? { ...objB, contact: matchingObject } : objB;
  });
}

module.exports = { generateRandomNumber, mergeArrays };
