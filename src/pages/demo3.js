import React, { useRef, useState } from 'react';
import Konva from 'konva';
import { Stage, Layer, Star, Text, Circle } from 'react-konva';
import IdSapceTree from '../components/IdSpaceTree';

const App = () => {
  const layer = useRef()
  const [label, setLabel] = useState("")
  return (
    // <Stage width={window.innerWidth} height={window.innerHeight}>
    <>
      <div>当前节点: {label}</div>
      <button onClick={() => {
        console.log("hello", layer)
        // const nd = new Konva.Circle({x:400,y:400, radius:50, fill:"red"})
        // layer.current.add(nd)
      }}>test</button>
      <Stage width={800} height={600}>
        <Layer ref={layer}>
        </Layer>
        {/* <XX/> */}
      </Stage>
        <IdSapceTree layer={layer} updateSelectedLabel={setLabel} />
    </>
  );
};

export default function () {
  return (
    <>
      <App />
    </>
  )

} 