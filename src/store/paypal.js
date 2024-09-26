import { useGlobal, useEffect, useState } from 'reactn';
// import useScript from '../utils/use-script';
import Config from '../config';
// import {clone} from '../utils/clone';

const usePaypalState = () => {
  
  const [paypalLoaded, setPaypalLoaded] = useGlobal('paypalLoaded'); 
  const [paypalLoading, setPaypalLoading] = useState(false);

  const scriptUrl = "https://www.paypal.com/sdk/js?client-id="+Config.Keys.PaypalClientId+"&vault=true&disable-funding=credit,card&intent=subscription"

  // Inject PayPal Script
  useEffect(() => {

    const script = document.createElement('script');

    script.src = scriptUrl;
    script.async = true;

    script.addEventListener('load', function () {
      setPaypalLoaded(true);
      setPaypalLoading(false);
    });
    script.addEventListener('error', function (e) {
      setPaypalLoading(false);
    });

    if(!paypalLoaded && !paypalLoading){
      setPaypalLoading(true);
      document.body.appendChild(script);
    }

    return () => {
      if(document.body.contains(script)){
        document.body.removeChild(script);
      }
    }
  },[paypalLoaded,paypalLoading,scriptUrl,setPaypalLoaded]);

  return {paypalLoaded};
}

export default usePaypalState;