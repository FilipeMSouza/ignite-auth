type User ={
  permissions: string[];
  roles: string[];
}

type validateUserPermitionsParams = {
  user: User;
  permissions?: string[];
  roles?: string[];
}

export function validateUserPermitions({
  user,
  permissions,
  roles,
}: validateUserPermitionsParams){
  
  if(permissions?.length>0){
    const hasAllPermissions = permissions.every(permission => {
      return user.permissions.includes(permission);
    })
    if(!hasAllPermissions){
      return false
    }
  }
  
  if(roles?.length>0){
    const hasAllrRoles = roles.some(role => {
      return user.roles.includes(role);
    })
    if(!hasAllrRoles){
      return false
    }
  }
  return true;
}