const StaffRolePrivilegeLevel = {
  NONE: 0,
  READ: 1,
  UPDATE: 2,
  CREATE_DELETE: 3,
};
export default StaffRolePrivilegeLevel;

export const staffRolePrivilegeLevels = [
  StaffRolePrivilegeLevel.NONE,
  StaffRolePrivilegeLevel.READ,
  StaffRolePrivilegeLevel.UPDATE,
  StaffRolePrivilegeLevel.CREATE_DELETE,
];

export const staffRolePrivilegeLevelsString = [
  'NONE',
  'READ',
  'UPDATE',
  'CREATE_AND_DELETE',
];
