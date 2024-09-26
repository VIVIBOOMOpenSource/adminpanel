
const isObject = function (o) {
  return o === Object(o) && !isArray(o) && typeof o !== 'function';
};

const isArray = function (a) {
  return Array.isArray(a);
};

const toCamelCase = (s) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

const toSnakeCase = (s) => {  
  return s.split(/(?=[A-Z])/).join('_').toLowerCase();
};

export const toCamelCaseKeys = function (o) {
  if (isObject(o)) {
    const n = {};

    Object.keys(o)
      .forEach((k) => {
        n[toCamelCase(k)] = toCamelCaseKeys(o[k]);
      });

    return n;
  } else if (isArray(o)) {
    return o.map((i) => {
      return toCamelCaseKeys(i);
    });
  }

  return o;
};

export const prettifyDay = (dateObj) => {
  if (dateObj === null || dateObj === undefined || dateObj === ""){
    return "---";
  }

  let d = new Date(dateObj);
  let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let formattedDate = days[d.getDay()];
  return formattedDate;
}

export const prettifyTime = (dateObj) => {
  if (dateObj === null || dateObj === undefined || dateObj === ""){
    return "---";
  }

  let d = dateObj.toString() ;
  let formattedTime = d.substring(11,16);
  return formattedTime;
}

export const prettifyDate = (dateObj) => {
  if (dateObj === null || dateObj === undefined || dateObj === ""){
    return "---";
  }

  let d = new Date(dateObj);
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 
                'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let formattedDate = d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear()
  return formattedDate;
}

export const prettifyDateTime = (dateObj) => {
  if (dateObj === null || dateObj === undefined || dateObj === ""){
    return "---";
  }

  let d = dateObj.toString() ;
  
  let formattedTime = d.substring(11,16);
  let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 
                'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let formattedDate = d.substring(8,10) + " " + months[Number(d.substring(5,7))-1] + " " + d.substring(0,4)

  return formattedDate + " " + formattedTime;
}

export const toSnakeCaseKeys = function (o) {
  if (isObject(o)) {
    const n = {};

    Object.keys(o)
      .forEach((k) => {
        n[toSnakeCase(k)] = toSnakeCaseKeys(o[k]);
      });

    return n;
  } else if (isArray(o)) {
    return o.map((i) => {
      return toSnakeCaseKeys(i);
    });
  }

  return o;
};

export const getBase64 = async (file,cb,failedCb) => {
  if(file === null || file === undefined){
    cb(null);
    return;
  }
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async function () {
    cb(reader.result);
  };
  reader.onerror = function (error) {
    console.log('Error: ', error);
    if(failedCb !== undefined){
      failedCb();
    }
  };
}

export const formatDateForInput = (dateToFormat) => {
  if(dateToFormat === "" || dateToFormat === null || dateToFormat === undefined){
    return ""
  }
  let d = new Date(dateToFormat);
  let year = d.getFullYear();
  let month = ("0" + (d.getMonth() + 1)).slice(-2)
  let day = ("0" + (d.getDate()+1)).slice(-2);
  let dString = year+"-"+month+"-"+day;
  return dString;
}