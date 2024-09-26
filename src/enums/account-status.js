const AccountStatusEnum = {
  Any: -1,
  EmailUnverified: 0,
  Banned: 1,
  Basic: 2,
  Premium: 3,
  Crew: 4,
  LocalAdmin: 5,
  Admin: 6,
  Developer: 7,
}

export const displayAccountStatusLabelById = (id) => {
  var label = "Null";
  switch(id){
    case AccountStatusEnum.Any: label = "Any"; break;
    case AccountStatusEnum.EmailUnverified: label = "Email Unverified"; break;
    case AccountStatusEnum.Banned: label = "Banned"; break;
    case AccountStatusEnum.Basic: label = "Basic"; break;
    case AccountStatusEnum.Premium: label = "Premium"; break;
    case AccountStatusEnum.Crew: label = "Crew"; break;
    case AccountStatusEnum.LocalAdmin: label = "Local Admin"; break;
    case AccountStatusEnum.Admin: label = "Admin"; break;
    case AccountStatusEnum.Developer: label = "Developer"; break;
    default: break;
  }
  return label;
}

export default AccountStatusEnum;