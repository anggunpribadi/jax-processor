"use client"

import { useState } from "react"

export default function JaxEditor() {
  const [jax0, setJax0] = useState('[00:00.000 -> 00:00.000] test')

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
    return srt
  }

  return (
      <div className="lg:grid lg:grid-cols-3 ">
        <textarea className="p-5 block w-full h-screen" onChange={ (e) => setJax0( e.target.value )} />
        <div className="h-screen relative"> 
            <textarea className="relative w-full h-screen overflow-auto p-5" value={ jaxToSrt(jax0).map( (j, i) => `${j.number}\n${j.startTime} --> ${j.endTime}\n${j.text}` ).join('\n\n') }>
            </textarea>
            <a href={`data:attachment/text,` + encodeURI(jaxToSrt(jax0).map( (j, i) => `${j.number}\n${j.startTime} --> ${j.endTime}\n${j.text}` ).join('\n\n')) } target="_blank" className="absolute bottom-5 right-10 p-2 bg-red-400 hover:bg-red-500 text-white" download="file.srt">Download SRT</a>
        </div>
        
        {/* <div>{JSON.stringify(jaxToSrt(jax0)) }</div> */}
        <div className='p-5 h-screen overflow-auto'>
            {/* { jaxToSrt(jax0).map( (j, i) => `${j.number}\n${j.startTime} --> ${j.endTime}\n${j.text}` ).join('\n\n') } */}
            {JSON.stringify(jaxToSrt(jax0))}
        </div>
      </div>
  );
}
