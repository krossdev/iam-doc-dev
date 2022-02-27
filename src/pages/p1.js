import React, { useState, useRef } from 'react';
import {
  FlexBox,
  Heading,
  SpectacleLogo,
  UnorderedList,
  CodeSpan,
  OrderedList,
  ListItem,
  FullScreen,
  Progress,
  Appear,
  Slide,
  Deck,
  Grid,
  Box,
  Image,
  CodePane,
  MarkdownSlide,
  MarkdownSlideSet,
  Markdown,
  Notes
} from 'spectacle';
import { Stage, Layer, Star, Text, Circle } from 'react-konva';
import IdSapceTree from '../components/IdSpaceTree';
import ReactMarkdown from 'react-markdown';

const markdown = `A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

* Lists
* [ ] todo
* [x] done

A table:

| a | b |
| - | - |
`

function XXX() {
          return <ReactMarkdown children={markdown}/>
}
function App() {
  const layer = useRef()
  const [label, setLabel] = useState("")
  return (
    <Deck>
      <Slide>
        <Heading>Welcome to Spectacle</Heading>
        <div>当前节点: {label}</div>
          <Markdown>
            {markdown}

          </Markdown>
        <Stage width={600} height={400}>
          <Layer ref={layer}>
          </Layer>
          {/* <Layer>
          <Text text="hello world"/>
        </Layer> */}
        </Stage>
        <IdSapceTree layer={layer} updateSelectedLabel={setLabel} />
        <div>hello</div>
      </Slide>
      <Slide>
        <FlexBox height="100%">
          <SpectacleLogo size={500} />
        </FlexBox>
        <Notes>
          <div>

          <button>hello</button>
          <XXX/>
          <p>p</p>
          Spectacle supports notes per slide.
          <ol>
            <li>Notes can now be HTML markup!</li>
            <li>Lists can make it easier to make points.</li>
          </ol>
          </div>
        </Notes>
      </Slide>
    </Deck>
  );
}
export default App;