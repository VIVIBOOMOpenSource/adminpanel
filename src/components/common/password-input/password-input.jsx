import React, { useState, useEffect, useRef } from 'react';
import './password-input.scss';

import { ReactComponent as VisibilityOnSvg } from '../../../css/imgs/icon-visibility-on.svg';
import { ReactComponent as VisibilityOffSvg } from '../../../css/imgs/icon-visibility-off.svg';

function PasswordInput({ passRef, ...rest }) {
  const [showPass, setShowPass] = useState(false);
  const [requestFocus, setRequestFocus] = useState(false);
  const inputRef = useRef(null);

  let type = 'password';
  if (showPass) {
    type = 'text';
  }

  useEffect(() => {
    if (requestFocus) {
      inputRef.current.focus();
      // Move cursor to the end of the input
      const { value } = inputRef.current;
      inputRef.current.value = '';
      inputRef.current.value = value;
      setRequestFocus(false);
    }
  }, [requestFocus]);

  const showPasswordToggle = () => {
    setRequestFocus(true);
    setShowPass(!showPass);
  };

  return (
    <div ref={passRef} className="password-input">
      <input ref={inputRef} type={type} {...rest} />
      <span className="show-password hlo" onClick={showPasswordToggle}>
        {(showPass) ? <VisibilityOffSvg /> : <VisibilityOnSvg /> }
      </span>
    </div>
  );
}

export default PasswordInput;
