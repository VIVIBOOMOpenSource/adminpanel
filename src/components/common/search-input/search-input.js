import React,{useState, useEffect, useRef} from 'react';
import './search-input.scss';
import {useDebouncedEffect} from  '../../../utils/debounced-effect';

import Loading from '../loading/loading'
import {request,unSubRequest} from '../../../utils/request'
import { toast } from 'react-toastify';

const SearchInput = (
        {
          ResultsItemDiv,
          searchEndpoint,
          submitCallback, 
          ...rest
        }
      ) => {

  const [searchValue, setSearchValue] = useState("");
  const [inputFocused,setInputFocused] = useState(false);
  const [showResultsDiv,setShowResultsDiv] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPosition,setSelectedPosition] = useState(1);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      unSubRequest("search-input");
    }
  },[])

  useEffect(() => {
    setSelectedPosition(1)
  },[results]);

  useDebouncedEffect(() => {
    if(searchValue !== ""){
      fetchResults(searchEndpoint,searchValue);
    }
  },500,[searchEndpoint,searchValue]);

  useDebouncedEffect(() => {
    if(searchValue === ""){
      setResults([]);
      setLoading(false);
    }
  },500,[searchValue]);

  useDebouncedEffect(() => {
    setShowResultsDiv(inputFocused)
  },1,[inputFocused]);

  const fetchResults = (searchEndpoint,query) => {
    let endpoint = searchEndpoint+query;
    setLoading(true);
    request("search-input",endpoint,"GET", {}, {
      then: function(res){
        setResults(res.data.res);
      },
      catch: function(err){
        toast.error(err.message);
      },
      finally: function(){
        setLoading(false);
      }
    });
  }
  
  const handleSubmit = (results,selectedPosition,showResultsDiv,inputRef) => {
    if(results.length <= 0){
      return false;
    }
    let value = results[0];
    if(showResultsDiv){
      value = results[selectedPosition-1];
    }

    if(inputRef !== null && inputRef.current !== null){
      inputRef.current.blur();
    }

    if(submitCallback !== undefined){
      submitCallback(value);
    }
  }

  useEffect(() => {
    let updateSelectedPosition = selectedPosition;
    if(selectedPosition > results.length){
      updateSelectedPosition = 1;
    }else if(selectedPosition === 0){
      updateSelectedPosition = results.length
    }

    setSelectedPosition(updateSelectedPosition);
  },[selectedPosition,results]);

  const handleKeyUp = (e,selectedPosition) => {
    if(e.keyCode === 38){// up
      setSelectedPosition(selectedPosition-1);
    }else if(e.keyCode === 40){// down
      setSelectedPosition(selectedPosition+1);
    }
  }

  return (
    <form className="search-input" onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(results,selectedPosition,showResultsDiv,inputRef);
          }}>
      <div className="search-input-sub">
        <input 
          type="search" {...rest} 
          value={searchValue}
          ref={inputRef}
          onKeyUp={(e) => {handleKeyUp(e,selectedPosition)}}
          onFocus={() => {setInputFocused(true)}}
          onBlur={() => {setInputFocused(false)}}
          onChange={(e) => {setSearchValue(e.target.value)}}
            />
        <div className={"search-input-results"+((showResultsDiv)?"":" hide")}>
          <Loading show={loading} size={"32px"}/>
          <ul>
            {results.map((value,index) => { 
              return(
                <li key={index} 
                  className={((index === (selectedPosition-1))?"selected":"")} 
                  onMouseOver={() => {
                    setSelectedPosition(index+1);
                  }}
                  onMouseDown={() => {
                    if(submitCallback !== undefined){
                      submitCallback(value);
                    }
                  }}
                  >
                  <ResultsItemDiv value={value}/>
                </li>
              )
            })}
          </ul>

        </div>
      </div>
      <input className="button" type="submit" value="Search" />
    </form>
  );
};

export default SearchInput;