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
  gl = canvas.getContext("webgl", {
    preserveDrawingBuffer: true,
    alpha: false
  });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  //enable blending for transparency
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
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

const POINT = 0
const TRIANGLE = 1
const CIRCLE = 2

let g_selectedColor = [1.0, 1.0, 1.0, 1.0]
let g_selectedSize = 5
let g_selectedType = POINT
let g_selectedSeg = 10

function addActionsForHTMLUI() {
  document.getElementById('green').onclick = () => { g_selectedColor = [0,1.0,0,1.0] }
  document.getElementById('red').onclick = () => { g_selectedColor = [1.0,0,0,1.0] }
  document.getElementById('clear').onclick = () => { g_shapesList= []; renderAllShapes() }

  document.getElementById('cat').onclick = () => { drawPicture() }


  document.getElementById('point').onclick = () => { g_selectedType = POINT }
  document.getElementById('triangle').onclick = () => { g_selectedType = TRIANGLE }
  document.getElementById('circle').onclick = () => { g_selectedType = CIRCLE }



  document.getElementById('redSlide').addEventListener('mouseup', function () { g_selectedColor[0] = this.value / 100; })
  document.getElementById('greenSlide').addEventListener('mouseup', function () { g_selectedColor[1] = this.value / 100; })
  document.getElementById('blueSlide').addEventListener('mouseup', function () { g_selectedColor[2] = this.value / 100; })
  
  document.getElementById('sizeSlide').addEventListener('mouseup', function () { g_selectedSize = this.value; })
  document.getElementById('segSlide').addEventListener('mouseup', function () { g_selectedSeg = this.value; })
  document.getElementById('transSlide').addEventListener('mouseup', function () { g_selectedColor[3] = this.value / 100;})
}

function main() {

  addActionsForHTMLUI()

  setUpWebGL()

  connectVariablesToGLSL()

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click
  canvas.onmousemove = click

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //drawPicture()
}

let g_shapesList = []

function click(ev) {

  if (ev.buttons != 1) {
    return
  }

  let [x,y] = convertCoordinates(ev)

  let point

  if (g_selectedType == POINT)  {
    point = new Point()
  }
  else if (g_selectedType == TRIANGLE) {
    point = new Triangle()
  }
  else {
    point = new Circle(g_selectedSeg, 0)
  }

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
  
  let startTime = performance.now()

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {

    g_shapesList[i].render()
  }

  let duration = performance.now() - startTime

  sendTextToHTML('numdot: ' + len + ' ms: ' + Math.floor(duration) + ' fps: ' + Math.floor(10000/duration) + ' total points: ' + g_shapesList.length, 'debug')
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID)

  if (!htmlElm) {
    console.log('Failed to get ' + htmlID + ' from HTML')
    return
  }
  htmlElm.innerHTML = text
}

function drawPicture() { 
  //draw head

  let head1 = new Triangle()
  head1.size = 80
  head1.position = [-0.4, -0.4]
  head1.render()

  let head2 = new Triangle()
  head2.position = [0,0]
  head2.size = -80
  head2.render()
  g_shapesList.push(head1, head2)
  //8 triangles

  //draw mouth

  let mouth1 = new Triangle()
  mouth1.position = [-0.205, -0.3]
  mouth1.color = [1.0,0.0,0.0, 1.0]
  mouth1.size = 12

  mouth1.render()
  g_shapesList.push(mouth1)

  //draw eyes

  let eye1a = new Triangle()
  let eye1b= new Triangle()
  eye1a.color = [0,0,0,1]
  eye1a.position = [-0.15, -0.15]
  eye1a.size = 20
  eye1a.render()

  eye1b.color = [0,0,0,1]
  eye1b.position = [-.05, -.05]
  eye1b.size = -20
  eye1b.render()

  g_shapesList.push(eye1a)
  g_shapesList.push(eye1b)

  let eye2a= new Triangle()
  let eye2b= new Triangle()

  eye2a.color = [0,0,0,1]
  eye2a.position = [-0.35, -0.15]
  eye2a.size = 20
  eye2a.render()

  eye2b.color = [0,0,0,1]
  eye2b.position = [-0.25, -0.05]
  eye2b.size = -20
  eye2b.render()

  g_shapesList.push(eye2a)
  g_shapesList.push(eye2b)

  let iris1a = new Triangle()
  let iris1b = new Triangle()

  iris1a.color = [1,1,1,1]
  iris1a.size = 5
  iris1a.position = [-0.095, -0.1]
  iris1a.render()

  iris1b.position = [-0.07, -0.075]
  iris1b.size = -5
  iris1b.render()

  g_shapesList.push(iris1a)
  g_shapesList.push(iris1b)

  let iris2a = new Triangle()
  let iris2b = new Triangle()

  iris2a.position = [-0.3, -0.1]
  iris2a.render()
  //0.025
  iris2b.position = [-0.275, -0.075]
  iris2b.size = -5
  iris2b.render()

  g_shapesList.push(iris2a)
  g_shapesList.push(iris2b)

  let ear1 = new Triangle()
  ear1.position = [-.15,0]
  ear1.size = 30
  ear1.render()

  g_shapesList.push(ear1)  

  let ear2 = new Triangle()
  ear2.position = [-.4,0]
  ear2.size = 30
  ear2.render()

  g_shapesList.push(ear2)  

  let body = new Triangle()

  body.position = [-0.2, -.85]
  body.size = 100
  body.render()

  g_shapesList.push(body)  

  let tail1 = new Triangle()

  tail1.position = [0.3, -0.65]
  tail1.size = -40
  tail1.render()

  let tail2 = new Triangle()

  tail2.position = [0.3, -0.65]
  tail2.size = 40
  tail2.angle = -1
  tail2.render()

  let tail3 = new Triangle()

  tail3.position = [0.3, -0.65]
  tail3.size = 40
  tail3.render()


  let tail4 = new Triangle()

  tail4.position = [0.3, -0.45]
  tail4.angle = 1
  tail4.size = -40
  tail4.render()

  let tail5 = new Triangle()

  tail5.position = [0.3, -0.45]
  tail5.angle = -1
  tail5.size = -40
  tail5.render()

  let tail6 = new Triangle()

  tail6.position = [0.3, -0.45]
  tail6.angle = 1
  tail6.size = 40
  tail6.render()

  g_shapesList.push(tail1, tail2, tail3, tail4, tail5, tail6)  

  let mark1 = new Triangle()

  mark1.position = [-0.1, -.85]
  mark1.color = [0.2,0.2,0.2, 1]
  mark1.size = 45
  mark1.render()

  let mark2 = new Triangle()

  mark2.position = [-0.15, -0.6]
  mark2.color = [0.2,0.2,0.2, 1]
  mark2.size = 20
  mark2.render()

  g_shapesList.push(mark1, mark2)
}