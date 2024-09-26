import { useState,useEffect } from "react";

export const useMaskEmail = (name,domain) => {

  const [maskedEmail,setMaskedEmail] = useState("loading@JustAMoment.com");

  useEffect(() => {
    let timeout = 0;
    
    timeout = setTimeout(function(){
      if(timeout === 0){
        return false;
      }
      let email = name+"@"+domain;
      setMaskedEmail(email);
      if(timeout !== 0){
        clearTimeout(timeout)
        timeout = 0;
      }
    },750);

    return () => {
      if(timeout !== 0){
        clearTimeout(timeout);
        timeout = 0;
      }
    };
  }, [name, domain]);


  return {maskedEmail}
}