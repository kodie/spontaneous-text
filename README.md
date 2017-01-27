# spontaneous-text [![npm version](https://badge.fury.io/js/spontaneous-text.svg)](https://badge.fury.io/js/spontaneous-text)

A node module that draws the provided text string onto the provided image in a random font, color, size, and position.

## Installation
`npm install spontaneous-text --save`

## Usage
```javascript
var imgText = require('spontaneous-text');

var image = 'img/original_image.jpg';
var text = 'My Awesome Text!';
var options = {
	file: 'img/new_image.png',
    padding: 5
};

imgText(image, text, options, function(err, res) {
  if (!err) {
    console.log(res);
  } else { console.log(new Error(err)); }
});
```

## Parameters
`image` - The image to draw the text onto. Can be a file path or an image buffer.

`text` - The text string to draw onto the image.

`options` - The options object to set the options explained below. (Optional)

## Options
`padding` - The number of pixels that is off-limits to text around the edge of the image.

`file` - If specified, the image will be saved to this file.

`mute` - Set to `true` to mute console output.

## Default Options
```json
{
  "padding": 10,
  "file": "",
  "mute": false
}
```

## Return
Here's an example of what the response will look like:
```
{
	image: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 04 ad 00 00 03 94 08 06 00 00 00 60 eb c0 39 00 00 00 06 62 4b 47 44 00 ff 00 ff 00 ff a0 bd a7 ... >,
	font: 'Alike',
	color: '#59e060',
	width: 1197,
	height: 916,
	box: {
		width: 743,
        height: 268,
        x: 286,
        y: 81
	}
}
```

`image` - The image buffer.

`font` - The font name used.

`color` - The font color used.

`width` - The image width.

`height` - The image height.

`box` - The bounding box decided for the text.

## License
MIT. See the License file for more info.
