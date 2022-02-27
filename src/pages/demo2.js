import React, {useEffect, useRef, useState} from 'react';
import Konva from 'konva';
import { Stage, Layer, Star, Text, Circle } from 'react-konva';
import IdSapceTree from '../components/IdSpaceTree';

const App = () => {
  useEffect(()=>{
  },[])
  const layer = useRef()
  return (
    // <Stage width={window.innerWidth} height={window.innerHeight}>
    <>
    <button onClick={()=>{
      console.log("hello", layer)
      // const nd = new Konva.Circle({x:400,y:400, radius:50, fill:"red"})
      // layer.current.add(nd)
      }}>test</button>
      <div id="container"></div>
    <IdSapceTree layer={layer} />
    </>
  );
};

export default function() {
  return (
    <>
      <App />
    </>
  )

} 