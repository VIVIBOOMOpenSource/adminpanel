import { useEffect, useGlobal } from 'reactn';
import {request,unSubRequest,subscriptions} from '../utils/request'

const useSnsInfoState = () => {

  const [snsInfo, setSnsInfo] = useGlobal('snsInfo'); 

  useEffect(() => {
    if(snsInfo === null && !("get-auth-urls" in subscriptions)){
      populateSnsInfoUrls(setSnsInfo);
    }
  },[snsInfo, setSnsInfo]);

  const populateSnsInfoUrls = (setSnsInfo) => {
    request("get-auth-urls","/get-auth-urls","GET", {}, {
      then: function(res){
        setSnsInfo(res.data.res);
      },  
      catch: function(err){
        unSubRequest("get-auth-urls");
      },
      finally: function(){}
    });
  }

  return {snsInfo, setSnsInfo, populateSnsInfoUrls};
}

export default useSnsInfoState;