'use strict';

var Canvas = require('canvas');
var Image = Canvas.Image;
var colors = require('colors');
var drawText = require('node-canvas-text').default;
var font = require('random-google-font');
var fs = require('fs');
var opentype = require('opentype.js');
var promise = require('promise');
var randomcolor = require('randomcolor');
var request = require('request');
var sizeOf = require('image-size');
const pIf = require('p-if');

var settings = {};

var defaults = {
  "padding": 10,
  "file": "",
  "mute": false
}

function getTextBox(text) {
  if (!settings.mute) { console.log(`Deciding text-box dimensions...`.dim); }

  var ws = ((50 / 100) * (settings.dimensions.width - settings.padding));
  var w = Math.floor((Math.random() * ((settings.dimensions.width - settings.padding) - ws + 1)) + ws);
  var h = Math.floor((Math.random() * ((settings.dimensions.height - settings.padding) / 3.5) + 10));
  var x = Math.floor((Math.random() * ((settings.dimensions.width - settings.padding) - w + 1)) + settings.padding);
  var y = Math.floor((Math.random() * ((settings.dimensions.height - settings.padding) - h + 1)) + settings.padding);

  if (!settings.mute) { console.log(`Text Box: w:${w} h:${h} x:${x} y:${y}`.bold); }
  return {width:w,height:h,x:x,y:y};
}

function getImgBrightness(imgBuffer, box) {
  if (!settings.mute) { console.log('Getting text-box area brightness...'.dim); }

  var canvas = new Canvas(box.width, box.height);
  var ctx = canvas.getContext('2d');
  var img = new Image;

  img.src = imgBuffer;
  ctx.drawImage(img, -box.x, -box.y);

  var data = ctx.getImageData(0, 0, box.width, box.height).data;
  var brightness = 0;

  for (var i = 0; i < data.length; i += 4) {
    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];
    brightness += 0.34 * r + 0.5 * g + 0.16 * b;
    if (brightness !== 0) { brightness /= 2 };
  }

  if (!settings.mute) { console.log(`Text-box area brightness: ${brightness}`.bold); }
  return brightness;
}

function getFont() {
  if (!settings.mute) { console.log(`Deciding font...`.dim); }

  return new Promise(function (fulfill, reject){
    font.get().then(function(f){
      f[0].local[0] = f[0].local[0].replace(/^\'+|\'+$/g, '');
      request.get({encoding:'binary', url:f[0].url.ttf}, function(error, response, body){
        if (!error) {
          if (!settings.mute) { console.log(`Font: ${f[0].local[0]}`.bold); }
          var buffer = new Buffer(body, 'binary');
          fulfill([bufferToArrayBuffer(buffer), f[0]]);
        } else { reject(error); }
      })
    }).fail(function(error) { reject(error); });
  });
}

function bufferToArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

function getTxtColor(imgBuffer, box) {
  var brightness = getImgBrightness(imgBuffer, box);
  var opts = { luminosity: 'bright' };
  if (brightness > 127) { opts.luminosity = 'dark'; }

  if (!settings.mute) { console.log(`Deciding ${opts.luminosity} text color...`.dim); }
  var color = randomcolor(opts);

  if (!settings.mute) { console.log(`Text color: ${color}`.bold); }
  return color;
}

function writeText(imgBuffer, text, font, color, box) {
  var canvas = new Canvas(settings.dimensions.width, settings.dimensions.height);
  var ctx = canvas.getContext('2d');
  var img = new Image;
  var opts = { textFillStyle: color };

  img.src = imgBuffer;
  ctx.drawImage(img, 0, 0, settings.dimensions.width, settings.dimensions.height);

  if (!settings.mute) { console.log(`Writing text to image...`.dim); }
  drawText(ctx, text, font, box, opts);

  return canvas;
}

function saveImage(stream, file) {
  if (!settings.mute) { console.log(`Saving image...`.dim); }

  return new Promise(function (fulfill, reject){
    var out = fs.createWriteStream(file);
    try { stream.pipe(out); }
    catch(e) { reject(e); }
    finally {
      if (!settings.mute) { console.log(`Image saved to ${settings.file}`.bold); }
      fulfill();
    }
  });
}

module.exports = function(image, text, options, cb) {
  if (!cb && options && typeof options !== 'object') {
    cb = options;
    options = {};
  } else if (!options) { options = {}; }

  settings = Object.assign({}, defaults, options);

  if (!cb) { var cb = function(e, i, d) { if (e) { throw e; } } }
  if (!image instanceof Buffer) { image = fs.readFileSync(image); }

  settings.dimensions = sizeOf(image);

  getFont()
    .then(function(r){
      var font = opentype.parse(r[0]);
      var fontName = r[1].local[0];
      var fontUrl = r[1].url.ttf;
      var box = getTextBox(text);
      var color = getTxtColor(image, box);
      var img = writeText(image, text, font, color, box);
      image = img.toBuffer();

      return [{
        image: image,
        font: fontName,
        color: color,
        width: settings.dimensions.width,
        height: settings.dimensions.height,
        box: box
      }, img];
    })
    .then(pIf(settings.file !== "", function(r){
      var stream = r[1].pngStream();
      return saveImage(stream, settings.file)
        .then(function(s){ return r; })
    }))
    .then(function(r){
      cb(null, r[0]);
    })
    .catch(function(e){
      cb(e);
    });
};
