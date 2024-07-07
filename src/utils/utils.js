function isEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function addObjectIfNotExists(arr, obj) {
  const isDuplicate = arr.findIndex((item) => isEqual(item, obj)) !== -1;

  if (!isDuplicate) {
    arr.push(obj);
  } else {
    console.log("Duplicate object found:", obj);
  }
}
