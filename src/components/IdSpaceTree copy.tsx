import Konva from "konva";
import React, { useEffect, useReducer, useRef } from "react";
import { pointCircleIntersection } from "./line-circle-intersection";

const idSpaceBits = 6
const idSpaceSize = Math.pow(2, idSpaceBits)
const padding = 75
const radius = 5

const showDistanceColors = false;
// var selectedNodeId = "";

// const treeNodes = [];
// const treeEdges = [];
// const hoveredEdgeLabels = [];

const binaryPrefix = "0b";
const offset = binaryPrefix.length;

// bucket colors 
const colors = [
  "#EE6352",
  "#FFB847",
  "#0CCE6B",
  "#C17FFF",
  "#FF7FE3",
  "#BBFF47"
];

const selectedNodeColor = "#00CBFF";
const selectedPathColor = "#00CBFF";

const noSelectedGraphNodeColor = "#EEE";
const noSelectedColor = "#AAA";
const noSelectedLightColor = "#AAA";

const treeNodeNotInGraphColor = "#FFFFFF";

function dec2bin(dec) {
  const raw = (dec >>> 0).toString(2);
  const padding = "000000";
  const withPadding = padding + raw;
  return withPadding.substring(withPadding.length - padding.length);
}

function bin2dec(bin) {
  if (bin.startsWith(binaryPrefix)) {
    return parseInt(bin.substring(binaryPrefix.length), 2);
  } else {
    return parseInt(bin, 2);
  }
}

// ID的公共前缀?
function getCommonPrefixLength(s1, s2, offset) {
  var index = offset;
  while (index < s1.length && s1[index] === s2[index]) {
    index++;
  }
  return index - offset;
}

// Returns the position of the provided SVG element.
// function getPos(svg, elem) {
//   var matrix, position;

//   matrix = elem.getCTM();
//   position = svg.createSVGPoint();
//   position.x = elem.getAttribute("cx");
//   position.y = elem.getAttribute("cy");
//   position = position.matrixTransform(matrix);
//   return position;
// }


////

function createEdge(id: string, nd1: Konva.Circle, nd2: Konva.Circle): Konva.Line {
  const pos1 = pointCircleIntersection(nd1.x(), nd1.y(), nd1.radius(), nd2.x(), nd2.y())
  const pos2 = pointCircleIntersection(nd2.x(), nd2.y(), nd2.radius(), nd1.x(), nd1.y())
  return new Konva.Line({
    id,
    // points: [nd1.x(), nd1.y(), nd2.x(), nd2.y()],
    points: [...pos1, ...pos2],
    stroke: noSelectedColor,
    strokeWidth: 2,
    lineCap: 'round',
    lineJoin: 'round',
  });
}
function debug1(layer, x, y) {
  return;
  const tmp = new Konva.Circle({
    x,
    y,
    radius: 5,
    fill: 'red',
  })
  layer.add(tmp)
}

type IdSpaceData = {
  selectedNodeId: string
  treeNodes: Konva.Circle[]
  treeEdges: Konva.Line[]
  hoveredEdgeLabels: Konva.Text[]
}

function generateIdSpaceTree(layer: Konva.Layer): IdSpaceData {
  const data: IdSpaceData = {
    selectedNodeId: "",
    treeNodes: [],
    treeEdges: [],
    hoveredEdgeLabels: [],
  }

  console.log("h=", layer.height)
  const height = layer.height()
  const width = layer.width()
  const n = idSpaceSize
  const r = radius // 节点半径
  // <Circle x={20} y={20} radius={10} fill='blue' />

  // Draw leaves
  let children: Konva.Circle[] = []
  for (let i = 0; i < idSpaceSize; i++) {
    const circle = new Konva.Circle({
      id: binaryPrefix + dec2bin(i),
      x: (width / (n + 1)) * (i + 1),
      y: height - padding,
      radius: r,
      fill: noSelectedColor,
    })

    circle.on('mouseover', function () {
      data.selectedNodeId = this.id()
      updateTree(layer, data);
      // updateSelectedLabel();
      console.log('mouseover circle', this, this.id());
    })
    circle.on('mouseout', function () {
      data.selectedNodeId = ""
      updateTree(layer, data);
      console.log('mouseout circle', this, this.id());
    })
    // circle.on('mousedown', function () {
    //   console.log('Mousedown circle', this, this.id());
    // });

    layer.add(circle)
    data.treeNodes.push(circle) // save
    children.push(circle) // temp
  }

  while (children.length > 1) {
    const newChildren: Konva.Circle[] = []
    let child1Pos = { x: 0, y: 0 }
    let child2Pos = { x: 0, y: 0 }
    let child1Id = ""
    let child2Id = ""
    let parentPos = { x: 0, y: 0 }

    // 上一层
    for (let i = 0; i < children.length - 1; i += 2) {
      const child1 = children[i]
      const child2 = children[i + 1]
      child1Pos = { x: child1.x(), y: child1.y() }
      child2Pos = { x: child2.x(), y: child2.y() }
      child1Id = child1.id()
      child2Id = child2.id()

      // Draw parent
      const circle = new Konva.Circle({
        id: child1Id.substring(0, child1Id.length - 1),
        x: (child1Pos.x + child2Pos.x) / 2,
        y: child1Pos.y - (height - 2 * padding) / Math.log2(n),
        radius: r,
        fill: noSelectedColor,
      })
      layer.add(circle);
      newChildren.push(circle);
      data.treeNodes.push(circle);

      parentPos = { x: circle.x(), y: circle.y() }

      // Draw edges between parent and children
      // let line = new Konva.Line({
      //   id: child1Id,
      //   points: [child1Pos.x, child1Pos.y, parentPos.x, parentPos.y],
      //   stroke: 'red',
      //   strokeWidth: 2,
      //   lineCap: 'round',
      //   lineJoin: 'round',
      // });

      let line = createEdge(child1Id, child1, circle)
      layer.add(line);
      data.treeEdges.push(line);

      debug1(layer, line.points()[0], line.points()[1])
      debug1(layer, line.points()[2], line.points()[3])

      // line = new Konva.Line({
      //   id: child2Id,
      //   points: [child2Pos.x, child2Pos.y, parentPos.x, parentPos.y],
      //   stroke: 'red',
      //   strokeWidth: 2,
      //   lineCap: 'round',
      //   lineJoin: 'round',
      // });
      line = createEdge(child2Id, child2, circle)
      layer.add(line);
      data.treeEdges.push(line);
    }

    // 最上一层
    if (newChildren.length === 1) {
      let label = new Konva.Text({
        x: (child1Pos.x + parentPos.x) / 2,
        y: (child1Pos.y + parentPos.y) / 2,
        text: '0',
        //fontSize: 30,
        //fontFamily: 'Calibri',
        //fill: 'green',
      });
      layer.add(label);

      label = new Konva.Text({
        x: (child2Pos.x + parentPos.x) / 2,
        y: (child2Pos.y + parentPos.y) / 2,
        text: '1',
        //fontSize: 30,
        //fontFamily: 'Calibri',
        //fill: 'green',
      });
      layer.add(label);
    }

    // 递归
    children = newChildren;
  }

  return data
}

/*
function updateSelectedLabel() {
    if (selectedNodeId === "") {
      $("#selected-leaf-display").html(
        `<b><i>Hover over a leaf node to view its associated ID.</i></b>`
      );
    } else {
      $("#selected-leaf-display").html(
        `You are hovering over the leaf corresponding to <b>${selectedNodeId} (${bin2dec(
          selectedNodeId
        )})</b>.`
      );
    }
  }
*/

function updateTree(layer: Konva.Layer, data: IdSpaceData) {
  // Remove previously hovered labels
  data.hoveredEdgeLabels.forEach(label => label.remove());

  for (let i = 0; i < data.treeNodes.length; i++) {
    let node = data.treeNodes[i];
    if (data.selectedNodeId.startsWith(node.id())) {
      node.fill(selectedNodeColor);
    } else if (data.selectedNodeId === "" || !showDistanceColors) {
      node.fill(noSelectedColor);
    } else {
      const commonPrefixLength = getCommonPrefixLength(
        data.selectedNodeId,
        node.id(),
        offset
      );
      node.fill(colors[commonPrefixLength]);
    }
  }

  for (let i = 0; i < data.treeEdges.length; i++) {
    const edge = data.treeEdges[i];
    if (data.selectedNodeId.startsWith(edge.id())) {
      // select node 所在的路径节点
      edge.stroke(selectedPathColor).strokeWidth(10).lineCap("round")
      if (edge.id().length > "0b".length) {
        // Only add labels for non-top level edges
        const bit = edge.id()[edge.id().length - 1]
        const p = edge.points()
        const label = new Konva.Text({
          x: ((p[0] + p[2]) / 2),
          y: ((p[1] + p[3]) / 2),
          text: bit,
        })
        data.hoveredEdgeLabels.push(label)
        layer.add(label)
      } else if (data.selectedNodeId === "" || !showDistanceColors) {
        // edge.stroke({ color: noSelectedColor, width: 2, linecap: "round" });
        edge.stroke(noSelectedColor).strokeWidth(2).lineCap("round")
      } else {
        const commonPrefixLength = getCommonPrefixLength(
          data.selectedNodeId,
          edge.id(),
          offset
        );
        // edge.stroke({ color: colors[commonPrefixLength], width: 4, linecap: "round" });
        edge.stroke(colors[commonPrefixLength]).strokeWidth(4).lineCap("round")
      }
    } else {
      edge.stroke(noSelectedColor).strokeWidth(2).lineCap("round")
    }
  }
}

// function onNodeMouseOver(shape: Konva.Circle) {
//   selectedNodeId = e.target.getAttribute("data-id");
//   updateTree();
//   updateSelectedLabel();
// }

// function onNodeMouseOut() {
//   selectedNodeId = "";
//   updateTree();
//   updateSelectedLabel();
// }

function IdSapceTree({ layer }) {
  const ref = useRef<IdSpaceData>(null)
  const [r, reload] = useReducer(x => !x, true);
  const data = useRef()
  console.log("layer=", layer)
  useEffect(() => {
    console.log("once !!!!")
    ref.current = generateIdSpaceTree(layer.current)
  }, [])

  return <>
    {/* <div>{ref.current.id}</div> */}
    <button onClick={() => {
      // ref.current.id = ref.current.id + 1;
      reload()
    }}>hello</button>
  </>
}

export default IdSapceTree;
// export const generateIdSpaceTree;

export function IdSapceTree2() {
  const ref = useRef<IdSpaceData>(null)
  const [r, reload] = useReducer(x => !x, true);
  const data = useRef()

  

  //console.log("layer=", layer)
  useEffect(() => {
    console.log("once !!!!")
    var stage = new Konva.Stage({
      container: 'container',
      //width: window.innerWidth - 200,
      //height: window.innerHeight - 200,
    });
    stage.add(layer);

    var layer = new Konva.Layer();
    // ref.current = generateIdSpaceTree(layer.current)
    ref.current = generateIdSpaceTree(layer)

  }, [])

  return <>
    <button onClick={() => {
      // reload()
    }}>hello</button>
    <div id="container"></div>
  </>
}