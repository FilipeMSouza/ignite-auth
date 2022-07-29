import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validateUserPermitions } from "../../utils/validateUserPermitions";

type UseCanParams ={
  permissions?: string[];
  roles?: string[];
}; 

export function useCan({permissions , roles}: UseCanParams){
  const {user, isAuthenticated} = useContext(AuthContext)

  if(!isAuthenticated){
    return false
  }

  const userHasValidPermissions = validateUserPermitions({
    user, 
    permissions, 
    roles
  })

  return userHasValidPermissions;
}