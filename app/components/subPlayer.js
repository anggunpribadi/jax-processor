'use client'

import { useState, useEffect, useRef } from 'react'
import YouTube from 'react-youtube'
//import * as deepl from 'deepl-node';

export default function SubPlayer2(props) {
	const {
		videoId = '',
	} = props

	const playerContainer = useRef(null)
	const [player, setPlayer] = useState(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [displayingSub, setDisplayingSub] = useState([])
	const [isFullscreen, setIsFullscreen] = useState( false )
	const [subTitles2, setSubTitles2] = useState([])
  const [onImport, setOnImport] = useState(false)
  const [onFilter, setOnFilter] = useState(false)
  const [onInfo, setOnInfo] = useState(false)
  const [jax, setJax] = useState('')
  const [splited, setSplited] = useState([])
  const [filter, setFilter] = useState('')
  const [filteredSub, setFilteredSub] = useState([])
  const [infoLoaded, setInfoLoaded] = useState(false)
  //const authKey = "0b3711ce-a016-4f8b-a9ce-446d9e0db11a:fx"; // Replace with your key
  //const translator = new deepl.Translator(authKey);
    

	useEffect(() => {
		if ( ! isPlaying ) return;

		const timeout = setInterval(() => {
			let crTime = player.getCurrentTime()
			setDisplayingSub( filteredSub.filter( item => ( item.startTime ) < crTime && ( item.endTime > crTime) ) )

		}, 100);

		return () => clearInterval(timeout);
	},[isPlaying]);
	
  useEffect(() => {
      setSplited( splitSrtByChar(subTitles2) )
  },[subTitles2])

  useEffect(() => { 
    if ( infoLoaded == false && onInfo == true  ) {
      retrieveVideoInfo()
      setInfoLoaded(true)
    }
  }, [onInfo])

  useEffect(() => {
      const arrTxt = filter.split('\n')
      setFilteredSub( 
          subTitles2.map( (sub, idx) => ({
              id: idx + 1,
              startTime: sub.startTime,
              endTime: sub.endTime,
              text: arrTxt[idx] ? arrTxt[idx] : sub.text
          }) ) 
      )
  },[subTitles2, filter])
    
	const onReady = (e) => {
		console.log(`YouTube Player object for videoId: "${props.videoId}" has been saved to state.`);
		setPlayer(e.target);
	};


	const setFullscreen = (e) => {
		if ( playerContainer.current == null ) return

		playerContainer.current
			.requestFullscreen()
			.then(() => {
				setIsFullscreen(true);
			})
			.catch(() => {
				setIsFullscreen(false);
			});		
	}

	const onSubtitleChange = (e) => {
		setSubTitles2( parser.fromSrt(e.target.value, true) )
	}

	const handleExitFullscreen = () => document.exitFullscreen();

	useEffect(() => {
		document.onfullscreenchange = () =>
			setIsFullscreen(document[getBrowserFullscreenElementProp()] != null);

		return () => (document.onfullscreenchange = undefined);
	});

	const opts = {
		playerVars : {
			fs: 0,
			modestbranding: 1,
		}
	}

    const importJax = () => {
        const el = document.querySelector('#srt-main')
        el.value = jaxToSrt(jax)
        el.dispatchEvent(new Event('change', { 'bubbles': true }))
        setOnImport(false)
    }

    const jaxToSrt = (jax) => {

        const srt = jax.split('\n').map( function(j,idx) {
            const ele = j.split(']')
            //console.log(ele)
            const time = ele[0].replace('[', '').replaceAll('.', ',').split(' -> ')
            //console.log(time)
            
    
            return {
                number: idx + 1,
                startTime: time[0].length > 10 ? time[0] : '00:' + time[0],
                endTime: time[1].length > 10 ? time[1] : '00:' + time[1],
                text: ele[1],
            } 
        })
        return srt.map( (j, i) => `${j.number}\n${j.startTime} --> ${j.endTime}\n${j.text}` ).join('\n\n')
    }

    async function translateSub()  {
        //const raw = await translator.translateText(splited.join('\n'), null, 'en-US');
        console.log(splited.map( (sarr) => sarr.join('\n') ).join('\n'))
        const raw = await fetch('/api/deepl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: splited.map( (sarr) => sarr.join('\n') ).join('\n')}),          
        })
        const res = await raw.json()
        console.log(res)
        document.querySelector('#filter').value = res.text
    }

    async function retrieveVideoInfo() {
      const raw = await fetch('/api/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId: props.videoId }),          
      })
      const res = await raw.json()
      console.log(res)
      document.querySelector('#ytinfo').value = res.text
    }

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
            
	return (
        <div className="relative">
            <div className={`${onImport ? 'fixed' : 'hidden'} w-full h-full top-0 left-0 z-10 bg-black/40 p-10`}>
                <div>
                    <textarea className="block w-full h-[500px] p-5" onChange={ (e) => setJax(e.target.value)}></textarea>
                    <button className='bg-black text-white px-2' onClick={ (e) => importJax() }>Import</button>
                    <button className='bg-black text-white px-2' onClick={ (e) => setOnImport(false) }>Cancel</button>
                </div>

            </div>
            <div className={`${onFilter ? 'fixed' : 'hidden'} w-full h-full top-0 left-0 z-10 bg-black/40 p-10`}>
                <div>
                    <div className="grid grid-cols-2 gap-5">
                        <div className='h-[500px] overflow-auto'>
                            { splited.length > 0 && splited.map( (spSrt, index) => (
                                <textarea className="p-5 mb-5 border w-full" key={index} value={ spSrt.join('\n') } readonly={ true } />
                            ))}
                        </div>
                        <textarea className='h-[500px] p-5' id="filter" onChange={ (e) => setFilter(e.target.value) }>
                        </textarea>
                        <button className='bg-black text-white px-2' onClick={ translateSub }>Translate</button>
                    </div>
                    <button className='bg-black text-white px-2' onClick={ (e) => setOnFilter(false) }>Close</button>
                </div>

            </div>
            <div className={`${onInfo ? 'fixed' : 'hidden'} w-full h-full top-0 left-0 z-10 bg-black/40 p-10`}>
                <div>
                    <div className="grid grid-cols-2 gap-5">
                        <textarea className='h-[500px] p-5' id="ytinfo" >
                        </textarea>                        
                    </div>
                    <button className='bg-black text-white px-2' onClick={ (e) => setOnInfo(false) }>Close</button>
                </div>
            </div>
            <div className='grid md:grid-cols-2'>
                <div className="relative h-screen">
                    <textarea id="srt-main" className='relative w-full h-screen ' onChange={ onSubtitleChange } />
                    <div  className='absolute left-5 bottom-5' >
                        <button className='inline-block mr-2 bg-black text-white px-2'  onClick={ (e) => setOnImport(true) }>Import from Jax format</button>
                        <button className='inline-block mr-2 bg-black text-white px-2'  onClick={ (e) => setOnFilter(true) }>Filter</button>
                        <button className='inline-block mr-2 bg-black text-white px-2'  onClick={ (e) => setOnInfo(true) }>Info</button>
                    </div>
                </div>
                <div>
                    <div className={` ${ isFullscreen ? 'fullscreen': '' }`} ref={playerContainer}>
                        <div className={`relative overflow-hidden bg-black text-gray-100`}>
                            <div className="relative font-[family-name:var(--font-geist-sans)]">
                                <YouTube 
                                    className={`${ isFullscreen ? 'h-screen': '' } w-full md:h-auto relative`}
                                    iframeClassName={`${ isFullscreen ? 'h-screen': '' } w-full md:h-auto md:aspect-video`}
                                    videoId={videoId} 
                                    onReady={onReady} 
                                    // onPlay={onPlay} 
                                    // onPause={onPause}
                                    onPlay={ () => setIsPlaying(true) } 
                                    onPause={ () => setIsPlaying(false) }
                                    opts={opts}
                                />
                                <div className={`absolute w-full px-7 text-center bottom-12 leading-tight ${ isFullscreen ? 'text-[2vw]' : 'text-[2vw] md:text-[1.5vw]'}`}>
                                    { displayingSub.length > 0 && displayingSub.map( ( sub, idx ) => (
                                        <span className="subtitle bg-black/60 inline-block px-2" key={idx} dangerouslySetInnerHTML={{__html: sub.text}} />
                                    ) )}
                                </div>
                            </div>
                            { isFullscreen && 
                                <button className="absolute right-0 top-full" onClick={handleExitFullscreen}>Exit fullscreen</button>
                            }
                            { ! isFullscreen && 
                                <div className="flex px-4 py-2">

                                    <button className="whitespace-nowrap pl-3 underline ml-auto" onClick={setFullscreen}>Watch in fullscreen</button>
                                </div>
                            }
                        </div>
                        <textarea className="w-full h-[200px]" value={ JSON.stringify( { slug: videoId, lang: "en", author: "Whisper AI + translated by deepl", subtitles: filteredSub } ) } readonly={true}></textarea>
                    </div>
                </div>
            </div>
        </div>
	)
}


function getBrowserFullscreenElementProp() {
	if (typeof document.fullscreenElement !== "undefined") {
		return "fullscreenElement";
	} else if (typeof document.mozFullScreenElement !== "undefined") {
		return "mozFullScreenElement";
	} else if (typeof document.msFullscreenElement !== "undefined") {
		return "msFullscreenElement";
	} else if (typeof document.webkitFullscreenElement !== "undefined") {
		return "webkitFullscreenElement";
	} else {
		throw new Error("fullscreenElement is not supported by this browser");
	}
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
  
  