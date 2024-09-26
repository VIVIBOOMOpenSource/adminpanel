

export const numberWithCommas = (number) => {
  if(number === undefined || number === null || isNaN(number)){
    return number;
  }
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export const formatCurrency = (cents) => {
  var res = cents / 100;
  res = res.toLocaleString("en-US", {style:"currency", currency:"USD"});
  return res;
}