import React from 'react';
import './loading.scss'

const styles = ["primary-color","secondary-color","accent-color"];

const Loading = ({show,size,style}) => {

  const sizeRef = (size !== undefined) ? size : "160px";
  const styleRef = (styles.indexOf(style) !== -1) ? style : styles[0];

  const customStyle = {
    height: sizeRef,
    width: sizeRef,
  }

  const showRef = (show) ? "fade-in" : "hide";

  return (
    <div className={"loading "+styleRef+" "+showRef} style={customStyle}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default Loading;