# jQuery signature field

Provides signature field as [jQuery component](http://plugins.jquery.com/signfield/), using either a sketch pad or an uploaded signature file.

See [demo](http://rawgit.com/cchantep/jquery.signfield/master/demo.html).

## Get started

Files of this plugin can be download from the source repository: [js/](https://github.com/cchantep/jquery.signfield/tree/master/js) and [lang/](https://github.com/cchantep/jquery.signfield/tree/master/lang) sub-directories.

> It requires jQuery 1.10+ and [sketch.js](http://intridea.github.com/sketch.js).

Signature field plugin is also available as a [NPM package](https://www.npmjs.com/package/jquery.signfield): `npm install jquery.signfield`

## Setup

Following scripts must be included at bottom of page body.

```html
<script src="jquery.js"></script>
<script src="sketch.min.js"></script>

<!-- Localized messages -->
<script src="lang/jquery.signfield-en.min.js"></script>

<!-- Component script -->
<script src="js/jquery.signfield.min.js"></script>
```

## JavaScript usage

Any element can be turned into a signature field.

Consider element thereafter as original one you want to replace with a signature field.

```html
<div id="uniqueId" class="classes" data-name="fieldName" 
  data-max-size="2048" data-pen-tickness="3" data-pen-color="red" ></div>
```

- `id` (optional): Signature field identifier.
- `class` (optional): CSS classes, if present applied on signature field.
- `data-name` (required): Field name, used on submit.
- `data-max-size` (optional): If present, used as limit in kB to upload signature file.
- `data-pen-thickness` (optional, default = 2): If present and if sketch (canvas) is supported, defines pen thickness.
- `data-pen-color` (optional): If present and if sketch is supported, defines pen color.

Then calling `$("#uniqueId").signField()` will replace original element with a signature field as following (considering `${orig.x}` is value of attribute `x` on original element).

```html
<div id="${orig.id}" class="${orig.class}">
  <!-- If canvas is supported by browser -->
  <label class="radio sketch-radio">
    <input type="radio" name="${orig.name}-type" value="canvas" />
    <!-- + Localized label -->
  </label>
  <a class="clear-canvas"><!-- Localized message --></a>
  <canvas></canvas>

  <label class="radio file-radio">
    <input type="radio" name="${orig.name}-type" value="file" />
    <!-- + Localized label --> 
  </label>
  <!-- end of if -->

  <input type="file" name="${orig.name}-file" />
  <span class="message"></span>
</div>
```

> Canvas size is defined by CSS, you may want to enforce it so that size of sketch image data is compliant with what you expect (e.g. `#uniqueId canvas { width: 200px; height: 100px }` ensure sketch image is 200x100).

If signature component wants to raise an error, CSS class `has-error` is added to the nesting `div` element, and localized message written in its `span.message`.

### Methods

#### addError

`.signField('addError', "errorKey", "message")`

Adds and displays a custom error.

```javascript
$('#signature').signField('addError', "file.error.type-unsupported", 
  "This kind of file is not supported");
// #signature should have been previously set up as signature field
```

> If custom error is related to a selected file, then key must starts with `file.error.`.

#### errors

`.signField('errors')`

If there is error for a signature field, returns array of error keys or `[]` (if none).

```javascript
var errs = $('#signature').signField('error');
// #signature should have been previously set up as signature field
```

#### filename

`.signField('filename')`

Returns name of selected file if any, or `null` if none.

```javascript
var filename = $('#signature').signField('filename')
```

#### imagedata (getter)

`.signField('imagedata')`

Returns image PNG data for a sketched signature, in data URI format if any, or `null` if none.

```javascript
var imagedata = $('#signature').signField('imagedata')
```

#### imagedata (setter)

`.signField('imagedata', dataURI)`

Load PNG image from given `dataURI` into signature canvas (if supported).

```javascript
$('#signature').signField('imagedata', aDataUri)
```

#### selectiontype

`.signField('selectiontype')`

Returns type of selected signature, either `file` or `canvas` (or null if none).

```javascript
var seltype = $('#signature').signField('selectiontype')
```

### Events

`change`

Fired when field value is changed, either by uploading a signature file or by sketching one.

```javascript
$("#signature").on('change', function() { 
  var signature = $(this);
  // ...
})
```

## Submit

When form including a signature field is submitted, either canvas image data or uploaded file is sent as field value.

A related field, suffixed with `-type` is also submitted, with either "canvas" or "file" as value, so that you can process signature data accordingly. 

If canvas image data is submitted, then another field suffixed with `-dpi` is added, so that you get DPI meta data, according screen on which canvas was used.

> Canvas image is submitted as PNG data, using [data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/data_URIs) format.

## Localization

Messages are provided by language pack in separate file 
(e.g. For english, `lang/jquery.signfield-en.min.js`).

If you find a language pack is missing, please [file a ticket](https://github.com/playframework/playframework/issues).

To customize some messages, you can redefine them in loaded language pack:

```javascript
signField_I18N['sketch.label'] = "Custom label for Sketch radio button";
```
