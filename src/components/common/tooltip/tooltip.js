import React,{useState, useRef} from 'react';
import './tooltip.scss'

// top & bottom are only supported atm
const Tooltip = ({className,positionOpt,tip,parentBoundsRef,children,...rest}) => {

  let position = (positionOpt !== undefined)?positionOpt:"bottom"

  const [showTip,setShowTip] = useState(false);
  const tooltipRef = useRef(null);
  const tipRef = useRef(null);
  const tipChildRef = useRef(null);

  if(parentBoundsRef !== null && parentBoundsRef.current !== null && 
    tipChildRef !== null && tipChildRef.current !== null &&
    tooltipRef !== null && tooltipRef.current !== null){
    let parentRect = parentBoundsRef.current.getBoundingClientRect();
    let tipChildRect = tipChildRef.current.getBoundingClientRect();
    

    if(position === "bottom"){
      let space = tipChildRect.y - parentRect.y;
      let height = tipChildRect.height;
      if(height > space){
        position = "top";
      }
    }

    if(position === "top"){
      let y = tipChildRect.y - parentRect.y;
      let pos = y+tipChildRect.height;
      let height = parentRect.height;
      if(pos > height){
        position = "bottom";
      }
    }

  }

  let tipStyle = {};
  let tipChildStyle = {};
  if(tooltipRef !== null && tooltipRef.current !== null && showTip === true){
    let tooltipRect = tooltipRef.current.getBoundingClientRect();
    tipChildStyle = {
      width: tooltipRect.width-2,
    };
    if(position === "bottom"){
      tipStyle.bottom = tooltipRef.current.offsetHeight+12;
    }else{
      tipStyle.top = tooltipRef.current.offsetHeight+12;
    }
  }

  return (
    <div 
      className={"tooltip"+((className !== undefined)?(" "+className):"")}
      onMouseOver={()=>{setShowTip(true)}}
      onMouseOut={()=>{setShowTip(false)}}
      ref={tooltipRef}
      {...rest}
      >
      {children}
      <div 
        className={"tip"+((showTip)?"":" hide")} 
        style={tipStyle}
        ref={tipRef}
        >
        <div 
          className={"tip-child "+position} 
          style={tipChildStyle}
          ref={tipChildRef}
          >
            <div
              className="tip-grandchild">
              {tip}
            </div>
        </div>
      </div>
    </div>
  )
}

export default Tooltip;