
export const findObjectByValue = (object,value) => {
  for (let index in object){
    let pos = object[index];
    if(pos.value === value){
      return pos;
    }
  }
  return null;
}

export const findObjectsByValues = (object,values) => {
  let res = [];
  for (let index in object){
    let obj = object[index];
    if(values.indexOf(obj.value) !== -1){
      res.push(obj);
    }
  }
  return res;
}

// objects - [Object] : What you want to normalize
// value - String : What should be the value
// label - String : What the user should see
export const normalizeObjects = (objects,value,label) => {
  let newObjects = [];

  for (let index in objects){
    let object = objects[index];
    newObjects.push({
      "value": object[value],
      "label": object[label],
    })
  }

  return newObjects;
}
