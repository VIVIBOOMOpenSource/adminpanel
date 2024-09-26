import { useEffect } from 'react';

const useScript = (url,loadFunc,errorFunc) => {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = url;
    script.async = true;

    document.body.appendChild(script);
    script.addEventListener('load', function () {
      if(loadFunc !== undefined && typeof loadFunc === "function"){
        loadFunc();
      }
    });
    script.addEventListener('error', function (e) {
      console.log();
      if(errorFunc !== undefined && typeof errorFunc === "function"){
        errorFunc();
      }
    });

    return () => {
      if(document.body.contains(script)){
        document.body.removeChild(script);
      }
    }
  }, [url,loadFunc,errorFunc]);
};

export default useScript;