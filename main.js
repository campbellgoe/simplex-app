import { makeNoise2D } from 'fast-simplex-noise';
import alea from 'alea';

const appEl = document.getElementById('app');
const resetButton = document.getElementById('reset-btn');
const pauseButton = document.getElementById('pause-btn');
const noise2D = makeNoise2D(alea('seed2'));
const width = 2 ** 9; // Ensures a non-zero, positive width
const height = width;
let looping = true;
let canvas;
let ctx;
let frame = 0;
let loopRequestId;

function createCanvas() {
  const c = document.createElement('canvas');
  appEl.appendChild(c);
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  return c;
}

function drawNoise(ctx, ox = 0, oy = 0, width, height, layers = [800, 200, 100, 50, 15, 10]) {
  if (width <= 0 || height <= 0) {
    console.error('Invalid dimensions for drawNoise:', width, height);
    return;
  }

  const imageData = ctx.createImageData(width, height);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let value = layers.reduce((acc, layer) =>
        acc + noise2D((x + ox) / layer, (y + oy) / layer) / (layers.length ** 0.5), 0);

      const color = (value + 1) * 128; // Normalize and scale
      const index = (x + y * width) * 4;
      imageData.data.set([color, color, color, 255], index); // R, G, B, Alpha
    }
  }
  return imageData
  
}

function draw(ctx) {
  const ox = performance.now()/100
  const oy = -ox
  const layers = [width, width/2, width/4, width / 8, width/16, width/32, width/64]
  //ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (let x = 0; x < canvas.width; x += width) {
    for(let y = 0; y < canvas.height; y += height){
      ctx.putImageData(drawNoise(ctx, x+ox, y+oy, width, height, layers) , x, y);
    }
  }
}

function loop() {
  if(looping){
  draw(ctx);
  frame++;
  return requestAnimationFrame(loop);
  } else {
  
  }
}

function cleanup() {
  window.removeEventListener('resize', resizeCanvas);
  cancelAnimationFrame(loopRequestId);
  appEl.removeChild(canvas);
  resetButton.removeEventListener('click', reset);
  pauseButton.removeEventListener('click', pause);
}

function reset() {
  cleanup();
  init();
}
function pause(){
  looping = !looping
  pauseButton.textContent = looping ? 'Pause' : 'Continue'
  if(looping){
    loopRequestId = loop()
  }
}
function resizeCanvas() {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

function init() {
  canvas = createCanvas();
  ctx = canvas.getContext('2d');
  resetButton.addEventListener('click', reset);
  pauseButton.addEventListener('click', pause);
  window.addEventListener('resize', resizeCanvas);
  loopRequestId = loop();
}



init(); // Start the loop