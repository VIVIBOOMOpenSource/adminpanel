import React from 'react';
import './switch-toggle.scss';
import Loading from '../loading/loading';

const SwitchToggle = ({isOn,onClickFunc,loading}) => {

  if (loading === undefined){
    loading = false;
  }

  return (  
    <div 
      className={"switch-toggle"+((isOn)?" on":" off")} 
      onClick={onClickFunc}>
      <div className="line"></div>
      <div className="circle"></div>
      <div className="dot"><Loading show={loading} size="20px"/></div>
    </div>
  );

};

export default SwitchToggle;