

export const capitalize = (s) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const tryJSONParse = (s) => {
  let res = null;
  try{
    res = JSON.parse(s);
  }catch(e){
    console.log("Failed to parse string("+s+")");
  }
  return res;
};

export const urlEncode = (str) => {
  str = (str + '').toString();
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/\+/,'%252B')
    .replace(/%20/g, '+')
    .replace(/~/g, '%7E');
};

export const urlDecode = (str) => {
  str = (str + '').toString();
  return decodeURIComponent(str)
    .replace(/%21/g, '!')
    .replace(/%27/g, "'")
    // .replace(/%28/g, '\(')
    // .replace(/%29/g, '\)')
    // .replace(/%2A/g, '\*')
    // .replace(/%252B/,'\+')
    .replace(/\+/g, '%20')
    .replace(/%7E/g, '~');
};

export const prettifyDate = (dateString) => {
  if (dateString === null || dateString === undefined || dateString === ""){
    return "---";
  }

  let d = new Date(dateString);
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                'August', 'September', 'October', 'November', 'December'];
  let formattedDate = months[d.getMonth()] + " " + d.getDate() + " " + d.getFullYear()
  return formattedDate;
}

export const prettyPrintJson = (str) => {
  var ugly = str;
  var obj = JSON.parse(ugly);
  var pretty = JSON.stringify(obj, undefined, 4);
  return pretty;
}

export const prettifyCamelCase = (str) => {
  return str
        // insert a space before all caps
        .replace(/([A-Z])/g, ' $1')
        // uppercase the first character
        .replace(/^./, function(str){ return str.toUpperCase(); })
}

export const camelCaseToSnakeCase = (str) => {
  return str.split(/(?=[A-Z])/).join('_').toLowerCase();
}
export const camelCaseToKebabCase = (str) => {
  return str.split(/(?=[A-Z])/).join('-').toLowerCase();
}

export const isValidEmail = (emailAddress) => {
  var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
  var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
  var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
  var sQuotedPair = '\\x5c[\\x00-\\x7f]';
  var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
  var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
  var sDomain_ref = sAtom;
  var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
  var sWord = '(' + sAtom + '|' + sQuotedString + ')';
  var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
  var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
  var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
  var sValidEmail = '^' + sAddrSpec + '$'; // as whole string

  var reValidEmail = new RegExp(sValidEmail);

  return reValidEmail.test(emailAddress);
}
