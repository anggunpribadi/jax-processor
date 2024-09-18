'use client'

import { useState, useEffect, useRef } from 'react'
import YouTube from 'react-youtube'

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


	useEffect(() => {
		if ( ! isPlaying ) return;

		const timeout = setInterval(() => {
			let crTime = player.getCurrentTime()
			setDisplayingSub( subTitles2.filter( item => ( item.startTime ) < crTime && ( item.endTime > crTime) ) )

		}, 100);

		return () => clearInterval(timeout);
	},[isPlaying]);
	

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

	return (
        <div className='grid md:grid-cols-2'>
            <div>
                <textarea className='w-full h-screen ' onChange={ onSubtitleChange } />
            </div>
            <div className={` ${ isFullscreen ? 'fullscreen': '' }`} ref={playerContainer}>
                <div className={`relative overflow-hidden bg-black text-gray-100`}>
                    <div className="relative">
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
  
  