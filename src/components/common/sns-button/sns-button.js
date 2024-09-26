import React,{useEffect,useState} from 'react';
import './sns-button.scss'
import useSnsInfoState from '../../../store/sns-info';
import useUserState from '../../../store/user';
import * as stringUtil from '../../../utils/string';
import Loading from '../loading/loading';
import {request, unSubRequest} from '../../../utils/request';
import { toast } from 'react-toastify';

import {useTranslation} from 'react-i18next';

// action = "connect", "link"
const SnsButton = ({action, snsType}) => {

  // Check if action is link
  // if it's link, check api to see linked status
  // if linked, change to button to unlinked
  // if not linked, keep the same.

  // on facebook-auth.js & google-auth.js add in code to check if a user is logged in.
  // if logged in, send to authRoute backend

  // on backend, 
    // normRoute endpoint
    // authRoute endpoint

  const {user} = useUserState();
  const {snsInfo} = useSnsInfoState();
  const [loading,setLoading] = useState(false);
  const [linkInfo,setLinkInfo] = useState(null);

  const {t} = useTranslation();

  const text = (action === "link") ? t('entry.sns.link',{sns:stringUtil.capitalize(snsType)}): t('entry.sns.connect',{sns:stringUtil.capitalize(snsType)});
  let type = "unknown";
  let urlName = "";
  let url = "#";
  let disable = true;
  let hide = false;
  let failed = false;

  useEffect(() => {
    return () => {
      unSubRequest("get-sns-link-info-"+snsType);
    }
  },[snsType]);

  useEffect(() => {
    if(action === "link"){
      refreshSnsInfo(snsType);
    }
  },[action,snsType]);

  const refreshSnsInfo = (snsType) => {
    setLoading(true);
    request("get-sns-link-info-"+snsType,"/get-sns-link-info","GET", {}, {
      then: function(res){
        let info = null;
        if(snsType === "google"){
          info = res.data.res.google;
        }else if(snsType === "facebook"){
          info = res.data.res.facebook;
        }
        setLinkInfo(info);
      },
      catch: function(err){
        toast.error(err.message);
      },
      finally: function(){
        setLoading(false);
      }
    });
  }

  const unlinkAccount = (snsType,user) => {

    if(!user.passSet){
      toast.error(t('entry.sns.setPass'));
      return false;
    }

    let url = "";
    if(snsType === "google"){
      url = "/google-link";
    }else if(snsType === "facebook"){
      url = "/facebook-link";
    }else{
      toast.error("couldn't recognized snsType: "+snsType);
      console.error("couldn't recognize snsType",snsType);
      return false;
    }

    setLoading(true);
    request(url,url,"DELETE", {}, {
      then: function(res){
        toast.success(t('entry.sns.unlinkSuccess'));
      },
      catch: function(err){
        toast.error(err.message);
      },
      finally: function(){
        setLoading(false);
        refreshSnsInfo(snsType);
      }
    });
  }

  if(snsType === "google"){
    type = snsType;
    urlName = "googleUrl";
  }else if(snsType === "facebook"){
    type = snsType;
    urlName = "facebookUrl";
  }else{
    console.error("SnsButton snsType not recognized: "+snsType);
    hide = true;
  }

  if(snsInfo !== null){
    if(snsInfo[urlName] !== undefined){
      url = snsInfo[urlName];
      disable = false;
    }else{
      failed = true;
    }
  }

  if(action === "link" && linkInfo === null && !loading){
    disable = true;
    failed = true;
  }

  if(hide){
    return (<div className="hide"></div>);
  }

  if(disable || loading){
    return( 
      <div className={"button sns-button "+type+"-button disabled"}>
        <a href={url} 
          onClick={(e) => {e.preventDefault()}}>
          {(!failed) ? 
          t('entry.sns.loading',{sns:stringUtil.capitalize(snsType)}):
          t('entry.sns.failedToLoad',{sns:stringUtil.capitalize(snsType)})
          }
          {(!failed)?<Loading show={true} size={"24px"} /> :""}
        </a>
      </div>
    )
  }

  if(action === "link" && linkInfo.linked){
    return(
      <div
        className={"button sns-button linked "+type+"-button"}
        onClick={() => {unlinkAccount(snsType,user);}}>
        <div>
          <span className="email">
            {linkInfo.email}
          </span>
          <span className="unlink">
            {t('entry.sns.unlink')} 
          </span>
        </div>
      </div>
    )
  }

  return (  
    <div className={"button sns-button "+type+"-button"}>
      <a href={url}>
        {text}
      </a>
    </div>
  );

};

export default SnsButton;