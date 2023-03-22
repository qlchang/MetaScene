import YUVSurfaceShader from "./YUVSurfaceShader";
import Texture from "./Texture";

let canvas = null;
let yuvSurfaceShader = null;
let yTexture = null;
let uTexture = null;
let vTexture = null;

function initWebGLCanvas() {
  canvas = document.createElement("canvas");
  canvas.id = "test_canvas";
  canvas.style = `position: fixed;top:0;left: 0;z-index: 100;`;
  const gl = canvas.getContext("webgl");
  yuvSurfaceShader = YUVSurfaceShader.create(gl);
  yTexture = Texture.create(gl, gl.LUMINANCE);
  uTexture = Texture.create(gl, gl.LUMINANCE);
  vTexture = Texture.create(gl, gl.LUMINANCE);

  document.body.append(canvas);
}

function draw(buffer, width, height) {
  canvas.width = width;
  canvas.height = height;

  // the width & height returned are actually padded, so we have to use the frame size to get the real image dimension
  // when uploading to texture
  const stride = width; // stride
  // height is padded with filler rows

  // if we knew the size of the video before encoding, we could cut out the black filler pixels. We don't, so just set
  // it to the size after encoding
  const sourceWidth = width;
  const sourceHeight = height;
  const maxXTexCoord = sourceWidth / stride;
  const maxYTexCoord = sourceHeight / height;

  const lumaSize = stride * height;
  const chromaSize = lumaSize >> 2;

  const yBuffer = buffer.subarray(0, lumaSize);
  const uBuffer = buffer.subarray(lumaSize, lumaSize + chromaSize);
  const vBuffer = buffer.subarray(
    lumaSize + chromaSize,
    lumaSize + 2 * chromaSize
  );
//   console.log("yBuffer", 1);
//   window.updateTexture(yBuffer);

  const chromaHeight = height >> 1;
  const chromaStride = stride >> 1;

  // we upload the entire image, including stride padding & filler rows. The actual visible image will be mapped
  // from texture coordinates as to crop out stride padding & filler rows using maxXTexCoord and maxYTexCoord.

  yTexture.image2dBuffer(yBuffer, stride, height);
  uTexture.image2dBuffer(uBuffer, chromaStride, chromaHeight);
  vTexture.image2dBuffer(vBuffer, chromaStride, chromaHeight);

  yuvSurfaceShader.setTexture(yTexture, uTexture, vTexture);
  yuvSurfaceShader.updateShaderData(
    { w: width, h: height },
    { maxXTexCoord, maxYTexCoord }
  );
  // debugger
  // data = window.changeTexture(data);
  // window.updateTexture( data );
  yuvSurfaceShader.draw();
}

export { canvas, initWebGLCanvas, draw };
