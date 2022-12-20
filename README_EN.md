# base64-pro

`base64-pro` does base64 encoding and decoding.

<p align="center">
    <a href="https://www.npmjs.com/package/base64-pro" target="_blank"><img src="https://img.shields.io/npm/v/base64-pro.svg?style=flat-square" alt="Version"></a>
    <a href="https://npmcharts.com/compare/base64-pro?minimal=true" target="_blank"><img src="https://img.shields.io/npm/dm/base64-pro.svg?style=flat-square" alt="Downloads"></a>
    <a href="https://www.jsdelivr.com/package/npm/base64-pro"><img src="https://data.jsdelivr.com/v1/package/npm/base64-pro/badge?style=flat-square" alt="jsdelivr"></a>
    <a href="https://github.com/haochuan9421/base64-pro" target="_blank"><img src="https://visitor-badge.glitch.me/badge?page_id=haochuan9421.base64-pro"></a>
    <a href="https://github.com/haochuan9421/base64-pro/commits/master" target="_blank"><img src="https://img.shields.io/github/last-commit/haochuan9421/base64-pro.svg?style=flat-square" alt="Commit"></a>
    <a href="https://github.com/haochuan9421/base64-pro/issues" target="_blank"><img src="https://img.shields.io/github/issues-closed/haochuan9421/base64-pro.svg?style=flat-square" alt="Issues"></a>
    <a href="https://github.com/haochuan9421/base64-pro/blob/master/LICENSE" target="_blank"><img src="https://img.shields.io/npm/l/@haochuan9421/base64-pro.svg?style=flat-square" alt="License"></a>
</p>

[简体中文](https://github.com/haochuan9421/base64-pro/blob/master/README.md)&emsp;
[English](https://github.com/haochuan9421/base64-pro/blob/master/README_EN.md)&emsp;

## Features

- Pure JS
- Zero dependencies
- Supports modern browsers & Node.js
- Support conversion between binary data and "base64 string"
- Support conversion between "unicode string" and "base64 string" ([atob](https://developer.mozilla.org/en-US/docs/Web/API/atob) and [btoa](https://developer.mozilla.org/en-US/docs/Web/API/btoa) only support characters which [code point](https://developer.mozilla.org/en-US/docs/Glossary/Code_point) is between 0 and 255)
- Support converting binary data or "unicode string" to [DataURL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)
- Support custom base64 character set
- Support TypeScript
- Support ESM, CommonJS, browser direct loading

## Installation

```bash
npm i base64-pro
```

## Quick Start

```js
import Base64 from "base64-pro"; // ESM
```

Or

```js
const Base64 = require("base64-pro"); // CommonJS
```

Or

Loading the [JS file](https://cdn.jsdelivr.net/npm/base64-pro/dist/index.global.js) directly in the browser. You will get the global variable `window.Base64`.

#### 1. Conversion between binary data and "base64 string". (Binary data means an instance of [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) or [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) or [DataView](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) or [Buffer](https://nodejs.org/api/buffer.html) in Node.js)

```js
const b64 = new Base64();
// encoding
b64.bufferToBase64(new Uint8Array([1, 2, 3, 4])); // AQIDBA==
// decoding
b64.base64ToBuffer("AQIDBA=="); // ArrayBuffer { [Uint8Contents]: <01 02 03 04>, byteLength: 4 }
```

#### 2. Conversion between "unicode string" and "base64 string".

```js
// encoding
b64.strToBase64("👻base64-pro🤗"); // 8J+Ru2Jhc2U2NC1wcm/wn6SX
// decoding
b64.base64ToStr("8J+Ru2Jhc2U2NC1wcm/wn6SX"); // 👻base64-pro🤗
```

#### 3. Converting binary data or "unicode string" to DataURL.

```js
b64.bufferToDataURL(require("fs").readFileSync("icon.png"), "image/png"); // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...

b64.strToDataURL("👻base64-pro🤗"); // data:text/plain;charset=utf-8;base64,8J%2BRu2Jhc2U2NC1wcm%2Fwn6SX
```

## Details of the Class `Base64`

### I. Constructor

`new Base64(initOpts)`

- `initOpts`
  - required: no
  - type: object
  - props:
    - `alphabet`
      - required: no
      - type: string
      - default: `"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"`
      - description: base64 character set
    - `encodeChunkSize`
      - required: no
      - type: number
      - default: `16383`
      - description: Performance optimization related, not recommended to be changed. Long strings are slow to stitch together, so when generating base64 strings, they are generated in chunks and finally merged into a complete string. This value represents a temporary string fragment generated for every how many bytes of raw binary data.

### II. Methods

#### 1. `bufferToBase64(value[, padding])`

- description: Converts binary data to a base64 string.
- arguments:
  - `value`
    - required: yes
    - type: buffer
    - description: buffer means an ArrayBuffer instance or a TypedArray instance or a DataView instance or a Buffer instance in Node.js.
  - `padding`
    - required: no
    - type: boolean
    - default: `true`
    - description: When the length of a base64 string is not an integer multiple of 4, is it automatically completed with `=` at the end.
- return: A base64 string.

#### 2. `base64ToBuffer(base64Str)`

- description: Converts a base64 string to binary data.
- arguments:
  - `base64Str`
    - required: yes
    - type: string
    - description: a valid base64 string
- return: An ArrayBuffer instance. You are free to create any kind of view to read this part of the binary data.

#### 3. `strToBase64(str[, encoding[, padding]])`

- description: Converts a unicode string to a base64 string.
- arguments:
  - `str`
    - required: yes
    - type: string
    - description: A unicode string
  - `encoding`
    - required: no
    - type: string
    - default: `utf-8`
    - optional values: `utf-8`, `utf8`, `utf-16`, `utf-16le`, `utf-16be`
    - description: Unicode has multiple character encoding methods, and even if the characters are the same, the underlying binary will be different for different encoding methods. Currently, we only supported convert to base64 strings in utf-8 and utf-16 encoding. utf8 is an alias for utf-8. utf-16 is an alias for utf-16le. utf-16le is a little-endian byte order encoding, and utf-16be is a big-endian byte order encoding.
  - `padding`
    - required: no
    - type: boolean
    - default: `true`
    - description: ibid.
- return: A base64 string.

#### 4. `base64ToStr(base64Str[, encoding])`

- description: Converts a base64 string to a unicode string.
- arguments:
  - `base64Str`
    - required: yes
    - type: string
    - description: A valid base64 string
  - `encoding`
    - required: no
    - type: string
    - default: `utf-8`
    - optional values: `utf-8`, `utf8`, `utf-16`, `utf-16le`, `utf-16be`
    - description: ibid.
- return: A unicode string

#### 5. `strToDataURL(str[, encoding])`

- description: Converts a unicode string into a DataURL string. The converted result can be opened directly in the browser address bar.
- arguments:
  - `str`
    - required: yes
    - type: string
    - description: a unicode string
  - `encoding`
    - required: no
    - type: string
    - default: `utf-8`
    - optional values: `utf-8`, `utf8`, `utf-16`, `utf-16le`, `utf-16be`
    - description: ibid.
- return: A DataURL string.

#### 6. `bufferToDataURL(value[, mimeType])`

- description: Converts binary data into a DataURL string. Using DataURL reduces network requests, and it is recommended that smaller files be converted to DataURL.
- arguments:
  - `value`
    - required: yes
    - type: buffer
    - description: ibid.
  - `mimeType`
    - required: no
    - type: string
    - default: `application/octet-stream`
    - description: a valid [MIME Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types), for example, `image/png`, `application/pdf`, etc.
- return: A DataURL string.

[![Stargazers over time](https://starchart.cc/haochuan9421/base64-pro.svg)](https://starchart.cc/haochuan9421/base64-pro)
