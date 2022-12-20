# base64-pro

`base64-pro` 是一款 Base64 编解码工具。

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

## 特点

- 纯 JS
- 零依赖
- 支持现代浏览器 & Node.js
- 支持二进制数据和 “Base64 字符串” 互转
- 支持 “Unicode 字符串” 和 “Base64 字符串” 互转 ([atob](https://developer.mozilla.org/en-US/docs/Web/API/atob) 和 [btoa](https://developer.mozilla.org/en-US/docs/Web/API/btoa) 只支持 [code point](https://developer.mozilla.org/en-US/docs/Glossary/Code_point) 是 0-255 的字符)
- 支持将二进制数据或 “Unicode 字符串” 转成 [DataURL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs)
- 支持自定义 Base64 字符集
- 支持 TypeScript
- 支持 ESM、CommonJS、浏览器直接加载

## 安装

```bash
npm i base64-pro
```

## 快速开始

```js
import Base64 from "base64-pro"; // ESM
```

或

```js
const Base64 = require("base64-pro"); // CommonJS
```

或

在浏览器中直接加载 [JS 文件](https://cdn.jsdelivr.net/npm/base64-pro/dist/index.global.js) 来使用，会获得全局变量 `window.Base64`。

#### 1. 二进制数据和 “Base64 字符串” 互转。(二进制数据可以是 [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) 实例 或 某种 [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) 实例 或 [DataView](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) 实例 或 Node.js 中的 [Buffer](https://nodejs.org/api/buffer.html) 实例)

```js
const b64 = new Base64();
// 编码
b64.bufferToBase64(new Uint8Array([1, 2, 3, 4])); // AQIDBA==
// 解码
b64.base64ToBuffer("AQIDBA=="); // ArrayBuffer { [Uint8Contents]: <01 02 03 04>, byteLength: 4 }
```

#### 2. “Unicode 字符串” 和 “Base64 字符串” 互转。

```js
// 编码
b64.strToBase64("👻base64-pro🤗"); // 8J+Ru2Jhc2U2NC1wcm/wn6SX
// 编码
b64.base64ToStr("8J+Ru2Jhc2U2NC1wcm/wn6SX"); // 👻base64-pro🤗
```

#### 3. 将二进制数据或 “Unicode 字符串” 转成 DataURL。

```js
b64.bufferToDataURL(require("fs").readFileSync("icon.png"), "image/png"); // data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...

b64.strToDataURL("👻base64-pro🤗"); // data:text/plain;charset=utf-8;base64,8J%2BRu2Jhc2U2NC1wcm%2Fwn6SX
```

## `Base64` 类的详细介绍

### 一、构造函数

`new Base64(initOpts)`

- `initOpts`
  - 必填: 否
  - 类型: object
  - 属性:
    - `alphabet`
      - 必填: 否
      - 类型: string
      - 默认值: `"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"`
      - 说明: Base64 字符集
    - `encodeChunkSize`
      - 必填: 否
      - 类型: number
      - 默认值: `16383`
      - 说明: 性能优化相关的参数，不建议修改。长字符串拼接是比较慢的，所以在生成 Base64 字符串时，会分块生成，最后合并成一个完整字符串，这个值代表每多少字节的原始数据生成一个临时的字符串片段。

### 二、实例的方法

#### 1. `bufferToBase64(value[, padding])`

- 说明: 将二进制数据转成 Base64 字符串。
- 参数:
  - `value`
    - 必填: 是
    - 类型: buffer
    - 说明: buffer 代指 ArrayBuffer 实例 或 某种 TypedArray 实例 或 DataView 实例 或 Node.js 中的 Buffer 实例
  - `padding`
    - 必填: 否
    - 类型: boolean
    - 默认值: `true`
    - 说明: 当 Base64 字符串的长度不是 4 的整数倍时，是否自动在尾部用 `=` 补齐。
- 返回值: Base64 字符串。

#### 2. `base64ToBuffer(base64Str)`

- 说明: 将 Base64 字符串转成二进制数据。
- 参数:
  - `base64Str`
    - 必填: 是
    - 类型: string
    - 说明: 合法的 Base64 字符串
- 返回值: ArrayBuffer 实例。你可以自由的创建任何一种视图来读取这部分二进制数据。

#### 3. `strToBase64(str[, encoding[, padding]])`

- 说明: 将 Unicode 字符串转成 Base64 字符串。
- 参数:
  - `str`
    - 必填: 是
    - 类型: string
    - 说明: Unicode 字符串
  - `encoding`
    - 必填: 否
    - 类型: string
    - 默认值: `utf-8`
    - 可选值: `utf-8`, `utf8`, `utf-16`, `utf-16le`, `utf-16be`
    - 说明: Unicode 有多种字符编码方式，即使是相同的字符，不同的编码方式底层的二进制也会不一样。目前支持按照 utf-8 和 utf-16 的编码方式将 Unicode 字符串转成 Base64 字符串。其中 utf8 是 utf-8 的别名。utf-16 是 utf-16le 的别名。utf-16le 为小端字节序编码、utf-16be 为大端字节序编码。
  - `padding`
    - 必填: 否
    - 类型: boolean
    - 默认值: `true`
    - 说明: 同上。
- 返回值: Base64 字符串。

#### 4. `base64ToStr(base64Str[, encoding])`

- 说明: 将 Base64 字符串转成 Unicode 字符串。
- 参数:
  - `base64Str`
    - 必填: 是
    - 类型: string
    - 说明: 合法的 Base64 字符串
  - `encoding`
    - 必填: 否
    - 类型: string
    - 默认值: `utf-8`
    - 可选值: `utf-8`, `utf8`, `utf-16`, `utf-16le`, `utf-16be`
    - 说明: 同上。
- 返回值: Unicode 字符串。

#### 5. `strToDataURL(str[, encoding])`

- 说明: 将 Unicode 字符串转成一段 DataURL 字符串。转化后的结果可以直接在浏览器地址栏中打开。
- 参数:
  - `str`
    - 必填: 是
    - 类型: string
    - 说明: Unicode 字符串
  - `encoding`
    - 必填: 否
    - 类型: string
    - 默认值: `utf-8`
    - 可选值: `utf-8`, `utf8`, `utf-16`, `utf-16le`, `utf-16be`
    - 说明: 同上。
- 返回值: DataURL 字符串。

#### 6. `bufferToDataURL(value[, mimeType])`

- 说明: 将二进制数据转成一段 DataURL 字符串。使用 DataURL 可减少网络请求，建议将一些体积较小的文件转成 DataURL。
- 参数:
  - `value`
    - 必填: 是
    - 类型: buffer
    - 说明: 同上。
  - `mimeType`
    - 必填: 否
    - 类型: string
    - 默认值: `application/octet-stream`
    - 说明: 有效的 [MIME 类型](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)，比如 `image/png`、`application/pdf` 等。
- 返回值: DataURL 字符串。

[![Stargazers over time](https://starchart.cc/haochuan9421/base64-pro.svg)](https://starchart.cc/haochuan9421/base64-pro)
