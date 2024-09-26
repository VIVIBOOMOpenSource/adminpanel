const userTypes = [
  {
    "label": "Email Unverified",
    "value": 0
  },{
    "label": "Banned",
    "value": 1
  },{
    "label": "Basic",
    "value": 2
  },{
    "label": "Premium",
    "value": 3
  },{
    "label": "Admin",
    "value": 4
  }
];

export const getUserTypeById = (id) => {
  for (let i = 0; i < userTypes.length; i++) {
    const item = userTypes[i];
    if(item.value === id){
      return item.label;
    }  
  }
  return "Null"
}

export default userTypes;