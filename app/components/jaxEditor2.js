"use client"

import { useState, useEffect } from "react"

export default function JaxEditor() {
  //const [srt, setSrt] = useState('1\n00:00:00,000 --> 00:00:00,000\ntest')
  const [srt, setSrt] = useState([])
  const [splitedSrt, setSplitedSrt] = useState([])
  const [translated, setTranslated] = useState('')

  useEffect(() => {
    setSplitedSrt( splitSrtByChar(srt) )
  },[srt])

  const splitSrtByChar = (srt, n = 4000) => {
    console.log(srt.length)
    let counter = 0
    let j = 0
    let k = 0
    let tempSrt = []
    tempSrt[0] = []
    for ( let i = 0; i < srt.length ; i++ ) {
      counter += srt[i].text.length
      tempSrt[j][k] = srt[i].text
      k++
      if ( counter > n ) {
        counter = 0
        j++
        tempSrt[j] = []
        k = 0
      }
    }
    console.log(tempSrt)
    return tempSrt
    
  }

  const buildTranslatedSrt = (txt) => {
    const arrTxt = txt.split('\n')
    return srt.map( (s, idx) => `${s.id}\n${s.startTime} --> ${s.endTime}\n${arrTxt[idx] ? arrTxt[idx] : s.text}` ).join('\n\n')
  }

  return (
      <div className="lg:grid lg:grid-cols-4 ">
        <textarea className="p-5 block w-full h-screen" onChange={ (e) => setSrt( parser.fromSrt(e.target.value) )} />
        <div className="h-screen relative p-5 overflow-auto"> 
            { splitedSrt.length > 0 && splitedSrt.map( (spSrt, index) => (
              <textarea className="p-5 mb-5 border w-full" key={index} value={ spSrt.join('\n') } />
            ))}
        </div>
        
        <textarea className='p-5 h-screen overflow-auto' onChange={ (e) => setTranslated(e.target.value)}>
        </textarea>
        <textarea className='p-5 h-screen' value={ buildTranslatedSrt(translated) } />
      </div>
  );
}


var parser = (function() {
  var pItems = {};

  /**
   * Converts SubRip subtitles into array of objects
   * [{
   *     id:        `Number of subtitle`
   *     startTime: `Start time of subtitle`
   *     endTime:   `End time of subtitle
   *     text: `Text of subtitle`
   * }]
   *
   * @param  {String}  data SubRip suntitles string
   * @param  {Boolean} ms   Optional: use milliseconds for startTime and endTime
   * @return {Array}  
   */
  pItems.fromSrt = function(data, ms) {
      var useMs = ms ? true : false;

      data = data.replace(/\r/g, '');
      var regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
      data = data.split(regex);
      data.shift();

      var items = [];
      for (var i = 0; i < data.length; i += 4) {
          items.push({
              id: data[i].trim(),
              startTime: useMs ? timeMs(data[i + 1].trim())/1000 : data[i + 1].trim(),
              endTime: useMs ? timeMs(data[i + 2].trim())/1000 : data[i + 2].trim(),
              text: data[i + 3].trim().replaceAll('\n', ' ')
          });
      }

      return items;
  };

  /**
   * Converts Array of objects created by this module to SubRip subtitles
   * @param  {Array}  data
   * @return {String}      SubRip subtitles string
   */
  pItems.toSrt = function(data) {
      if (!data instanceof Array) return '';
      var res = '';

      for (var i = 0; i < data.length; i++) {
          var s = data[i];

          if (!isNaN(s.startTime) && !isNaN(s.endTime)) {
              s.startTime = msTime(parseInt(s.startTime, 10));
              s.endTime = msTime(parseInt(s.endTime, 10));
          }

          res += s.id + '\r\n';
          res += s.startTime + ' --> ' + s.endTime + '\r\n';
          res += s.text.replace('\n', '\r\n') + '\r\n\r\n';
      }

      return res;
  };

  var timeMs = function(val) {
      var regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/;
      var parts = regex.exec(val);

      if (parts === null) {
          return 0;
      }

      for (var i = 1; i < 5; i++) {
          parts[i] = parseInt(parts[i], 10);
          if (isNaN(parts[i])) parts[i] = 0;
      }

      // hours + minutes + seconds + ms
      return parts[1] * 3600000 + parts[2] * 60000 + parts[3] * 1000 + parts[4];
  };

  var msTime = function(val) {
      var measures = [ 3600000, 60000, 1000 ]; 
      var time = [];
      console.log(val)
      for (var i in measures) {
          var res = (val / measures[i] >> 0).toString();
          
          if (res.length < 2) res = '0' + res;
          val %= measures[i];
          time.push(res);
          console.log(`${i}: ${res}`);
      }

      var ms = val.toString();
      if (ms.length < 3) {
          for (i = 0; i <= 3 - ms.length; i++) ms = '0' + ms;
      }

      return time.join(':') + ',' + ms;
  };

  return pItems;
})();

