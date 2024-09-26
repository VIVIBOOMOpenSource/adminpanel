import React, { useRef } from 'react';
import './button.scss';

import Loading from '../loading/loading';
import { ReactComponent as VisibilityOnSvg } from '../../../css/imgs/icon-visibility-on.svg';
import { ReactComponent as VisibilityOffSvg } from '../../../css/imgs/icon-visibility-off.svg';
import { ReactComponent as AddSvg } from '../../../css/imgs/icon-add.svg';
import { ReactComponent as MinusSvg } from '../../../css/imgs/icon-minus.svg';
import { ReactComponent as EditSvg } from '../../../css/imgs/icon-edit.svg';
import { ReactComponent as SaveSvg } from '../../../css/imgs/icon-save.svg';
import { ReactComponent as DeleteSvg } from '../../../css/imgs/icon-delete.svg';
import { ReactComponent as CloseSvg } from '../../../css/imgs/icon-close.svg';
import { ReactComponent as ContinueSvg } from '../../../css/imgs/icon-arrow-forward.svg';

// types = ["submit", "button"]
// status = ["loading","showing","hiding","edit","save","add","delete", null, undefined]
function Button({
  type, status, parentClassName, ...rest
}) {
  const buttonRef = useRef(null);

  const params = { ...rest };
  let disable = false;
  if (status === 'loading' || (params.disabled !== undefined && params.disabled === true)) {
    disable = true;
  }
  const disabledClass = (disable) ? ' disabled' : '';

  const parentClass = (parentClassName !== undefined) ? parentClassName : '';

  const imageElement = () => {
    let element = (<div />);

    if (status === 'loading') {
      element = <Loading show="true" size="24px" />;
    } else if (status === 'showing') {
      element = <VisibilityOffSvg className="light" />;
    } else if (status === 'hiding') {
      element = <VisibilityOnSvg className="light" />;
    } else if (status === 'edit') {
      element = <EditSvg className="light" />;
    } else if (status === 'save') {
      element = <SaveSvg className="light" />;
    } else if (status === 'add') {
      element = <AddSvg className="light" />;
    } else if (status === 'minus') {
      element = <MinusSvg className="light" />;
    } else if (status === 'delete') {
      element = <DeleteSvg className="light" />;
    } else if (status === 'close') {
      element = <CloseSvg className="light" />;
    } else if (status === 'continue') {
      element = <ContinueSvg className="light" />;
    }

    return element;
  };

  return (
    <div className={`button-element${disabledClass} ${parentClass}`}>
      <div className="background" />
      <div className={parentClass === 'submit-form' ? 'no-image' : 'button-status-image'}>
        {imageElement()}
      </div>
      {(type === 'submit')
        ? <input type="submit" ref={buttonRef} disabled={disable} {...rest} />
        : <button ref={buttonRef} type="button" disabled={disable} {...rest} />}
    </div>
  );
}

export default Button;
