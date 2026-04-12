// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program




var VSHADER_SOURCE = ' \
  attribute vec4 a_Position; \
  uniform float u_Size; \
  void main() { \
    gl_Position = a_Position; \
    gl_PointSize = u_Size; \
  }'

// Fragment shader program
var FSHADER_SOURCE = ' \
  precision mediump float; \
  uniform vec4 u_FragColor; \
  void main() { \
    gl_FragColor = u_FragColor; \
  }';

let canvas
let gl
let a_Position
let u_Size
let u_FragColor

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

let g_selectedColor = [1.0, 1.0, 1.0, 1.0]
let g_selectedSize = 5

function addActionsForHTMLUI() {
  document.getElementById('green').onclick = () => { g_selectedColor = [0,1.0,0,1.0] }
  document.getElementById('red').onclick = () => { g_selectedColor = [1.0,0,0,1.0] }

  document.getElementById('redSlide').addEventListener('mouseup', function () { g_selectedColor[0] = this.value / 100; })
  document.getElementById('greenSlide').addEventListener('mouseup', function () { g_selectedColor[1] = this.value / 100; })
  document.getElementById('blueSlide').addEventListener('mouseup', function () { g_selectedColor[2] = this.value / 100; })
  
  document.getElementById('sizeSlide').addEventListener('mouseup', function () { g_selectedSize = this.value; })
}

function main() {

  addActionsForHTMLUI()

  setUpWebGL()

  connectVariablesToGLSL()

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

class Point {
  constructor () {
    this.type = 'point'
    this.position = [0.0, 0.0, 0.0]
    this.color = [1.0, 1.0, 1.0]
    this.size = 5.0
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    //pass the size
    gl.uniform1f(u_Size, size)
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

let g_shapesList = []

function click(ev) {
  let [x,y] = convertCoordinates(ev)

  let point = new Point()

  point.position = [x,y]
  point.color = g_selectedColor.slice()
  point.size = g_selectedSize
  g_shapesList.push(point)

  renderAllShapes()
}

function convertCoordinates(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return [x, y]
}

function renderAllShapes() {
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render()
  }
}