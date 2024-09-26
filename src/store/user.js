import { useEffect, useGlobal, useState } from 'reactn';
import {request} from '../utils/request';
import { clone } from '../utils/clone';

const useUserState = () => {

  const loginPageWaitTime = 25;

  const [user, setUser] = useGlobal('user'); 
  const [redirectLoginPage, setRedirectLoginPage] = useState(false);
  
  useEffect(() => {
    let timeout = null;

    if(user === null){
      localStorage.removeItem("user");
      setRedirectLoginPage(false);
    }else{
      localStorage.setItem("user", JSON.stringify(user));
      if(timeout != null){clearTimeout(timeout);timeout = null}
      timeout = setTimeout(function(){
        setRedirectLoginPage(true);
      },loginPageWaitTime);
    }

    return () => {
      if(timeout != null){clearTimeout(timeout);timeout = null}
    }
  },[user]);

  const logoutUser = () => {
    if(user === null){
      return false;
    }

    let authId = "";
    let authToken = "";

    if( user !== undefined && user.auth !== undefined && 
        user.auth.id !== undefined && user.auth.token !== undefined){
      
      authId = user.auth.id;
      authToken = user.auth.token;
    }

    const data = {
      authId: authId,
      authToken: authToken,
    };

    request("logout","/logout","POST", data, {
      then: function(res){},
      catch: function(err){},
      finally: function(){}
    });

    setUser(null);
  }

  const updateUserStatus = () => {
    if(user === null){
      return false;
    }
    request("user-subscription-status","/subscription-status","GET", {}, {
      then: function(res){
        let cloneUser = clone(user);
        if(res.data.res.user.status !== null){
          if(res.data.res.user.status !== cloneUser.status){
            cloneUser.status = res.data.res.user.status;
          }
        }
        setUser(cloneUser);
      },
      catch: function(err){},
      finally: function(){}
    });
  }

  return {user, setUser, logoutUser, redirectLoginPage, updateUserStatus};
}

export default useUserState;