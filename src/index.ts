type initOpts = { alphabet?: string; encodeChunkSize?: number };
type encoding = "utf-8" | "utf8" | "utf-16" | "utf-16le" | "utf-16be";
type buffer =
  | ArrayBuffer
  | DataView
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

class Base64 {
  private _lookup: string[];
  private _revLookup: { [key: number]: number };
  private _encodeChunkSize: number;
  constructor(initOpts: initOpts = {}) {
    const { alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", encodeChunkSize = 16383 } = initOpts;
    this._lookup = [...alphabet].filter((char, i, arr) => arr.indexOf(char) === i && char.charCodeAt(0) < 128);
    if (this._lookup.length !== 64) {
      throw new Error("the alphabet must contain 64 distinct ASCII characters");
    }
    this._revLookup = this._lookup.reduce(
      (map, char, i) => {
        map[char.charCodeAt(0) as keyof typeof map] = i;
        return map;
      },
      // 如果需要解码的 Base64 字符串是使用 +/ 被替换成 -_ 的字符集编码得来的，默认也支持解码。如果自定义的 alphabet 中存在 -_ 这个设置会被覆盖的。
      { 45: 62, 95: 63 }
    );
    this._encodeChunkSize = Math.max(3, Math.floor(encodeChunkSize / 3) * 3);
  }

  // 将二进制数据编码成 Base64 字符串
  bufferToBase64(value: buffer, padding: boolean = true): string {
    let arrayBuffer; // 底层的二进制数据
    let byteOffset; // 开始编码的位置
    let totalBytes; // 需要编码的字节总数
    if (ArrayBuffer.isView(value)) {
      arrayBuffer = value.buffer;
      byteOffset = value.byteOffset;
      totalBytes = value.byteLength;
    } else if (value instanceof ArrayBuffer) {
      arrayBuffer = value;
      byteOffset = 0;
      totalBytes = value.byteLength;
    } else {
      throw new Error("encode value can only be arrayBuffer or typedArray or dataView");
    }

    // 3个字节为一组进行处理，多出来的1个或2个字节最后单独处理
    const extraBytes = totalBytes % 3;
    const unit3Bytes = totalBytes - extraBytes;
    // 创建 Uint8Array 视图用于读取字节内容
    const view = new Uint8Array(arrayBuffer, byteOffset, totalBytes);

    // 字符串频繁拼接会比较慢，所以先分块保存，最后再一次性 join 成一个完整的字符串返回
    let chunks: string[] = [];
    for (let i = 0; i < unit3Bytes; i += this._encodeChunkSize) {
      let chunk: string[] = [];
      for (let j = i, chunkEnd = Math.min(unit3Bytes, i + this._encodeChunkSize); j < chunkEnd; j += 3) {
        // 把三个字节拼接成一个完整的 24 bit 数字
        const $24bitsNum = (view[j] << 16) | (view[j + 1] << 8) | view[j + 2];
        // 以 6 bit 为一个单元进行读取
        chunk.push(
          this._lookup[$24bitsNum >> 18] +
            this._lookup[($24bitsNum >> 12) & 0b111111] + // "& 0b111111" 是为了只保留最后面的6个字节
            this._lookup[($24bitsNum >> 6) & 0b111111] +
            this._lookup[$24bitsNum & 0b111111]
        );
      }
      chunks.push(chunk.join(""));
    }

    // 处理多出来的1个或2个字节
    if (extraBytes === 1) {
      const $8bitsNum = view[totalBytes - 1];
      chunks.push(this._lookup[$8bitsNum >> 2]);
      chunks.push(this._lookup[($8bitsNum << 4) & 0b111111]);
      padding && chunks.push("==");
    } else if (extraBytes === 2) {
      const $16bitsNum = (view[totalBytes - 2] << 8) | view[totalBytes - 1];
      chunks.push(this._lookup[$16bitsNum >> 10]);
      chunks.push(this._lookup[($16bitsNum >> 4) & 0b111111]);
      chunks.push(this._lookup[($16bitsNum << 2) & 0b111111]);
      padding && chunks.push("=");
    }

    return chunks.join("");
  }

  // 将 Base64 字符串还原成二进制数据（返回 ArrayBuffer 实例）
  base64ToBuffer(base64Str: string): ArrayBuffer {
    if (typeof base64Str !== "string") {
      throw new Error("the first argument must be string");
    }
    // 去除尾部的 padding
    base64Str = base64Str.replace(/==?$/, "");
    // 4 个字符为一组进行处理，多出来的2个或3个字符最后单独处理
    const totalChars = base64Str.length;
    const extraChars = totalChars % 4;
    if (extraChars === 1) {
      throw new Error("invalid Base64 string"); // 编码正确的 Base64 字符串，后面不可能只多出来一个字符
    }
    const unit4Chars = totalChars - extraChars;
    // 创建 arrayBuffer，每4个字符需要3个字节，如果最后多出来2个字符额外需要1个字节，如果最后多出来3个字符额外需要2个字节
    const arrayBuffer = new ArrayBuffer((unit4Chars / 4) * 3 + (extraChars === 0 ? 0 : extraChars - 1));
    // 创建 DataView 视图用于修改字节内容
    const view = new Uint8Array(arrayBuffer);

    let byteOffset = 0;
    for (let i = 0; i < unit4Chars; i += 4) {
      // 把4个字符对应的 code pointer 还原成3字节的数字
      const $24bitsNum =
        (this._revLookup[base64Str.charCodeAt(i)] << 18) |
        (this._revLookup[base64Str.charCodeAt(i + 1)] << 12) |
        (this._revLookup[base64Str.charCodeAt(i + 2)] << 6) |
        this._revLookup[base64Str.charCodeAt(i + 3)];

      // 以 8 bit 为一个单元修改 arrayBuffer 3次
      view[byteOffset++] = $24bitsNum >>> 16;
      view[byteOffset++] = ($24bitsNum >>> 8) & 0b11111111;
      view[byteOffset++] = $24bitsNum & 0b11111111;
    }

    // 处理多出来的2个或3个字符
    if (extraChars === 2) {
      const $8bitNum = (this._revLookup[base64Str.charCodeAt(totalChars - 2)] << 2) | (this._revLookup[base64Str.charCodeAt(totalChars - 1)] >>> 4);
      view[byteOffset++] = $8bitNum;
    } else if (extraChars === 3) {
      const $16bitNum =
        (this._revLookup[base64Str.charCodeAt(totalChars - 3)] << 10) |
        (this._revLookup[base64Str.charCodeAt(totalChars - 2)] << 4) |
        (this._revLookup[base64Str.charCodeAt(totalChars - 1)] >> 2);
      view[byteOffset++] = $16bitNum >>> 8;
      view[byteOffset++] = $16bitNum & 0b11111111;
    }
    return arrayBuffer;
  }

  // 将普通字符串编码成 Base64 字符串
  strToBase64(str: string, encoding: encoding = "utf-8", padding: boolean = true): string {
    if (typeof str !== "string") {
      throw new Error("the first argument must be string");
    }
    switch (encoding.toLowerCase()) {
      case "utf-8":
      case "utf8":
        return this._utf8ToBase64(str, padding);
      case "utf-16":
      case "utf-16le":
        return this._utf16ToBase64(str, true, padding);
      case "utf-16be":
        return this._utf16ToBase64(str, false, padding);
      default:
        throw new Error("encoding not support");
    }
  }

  // 将 Base64 字符串还原成普通字符串
  base64ToStr(base64Str: string, encoding: encoding = "utf-8"): string {
    if (typeof base64Str !== "string") {
      throw new Error("the first argument must be string");
    }
    switch (encoding.toLowerCase()) {
      case "utf-8":
      case "utf8":
        return this._base64ToUtf8(base64Str);
      case "utf-16":
      case "utf-16le":
        return this._base64ToUtf16(base64Str, true);
      case "utf-16be":
        return this._base64ToUtf16(base64Str, false);
      default:
        throw new Error("encoding not support");
    }
  }

  private _utf8ToBase64(utf8Str: string, padding: boolean = true): string {
    if (typeof utf8Str !== "string") {
      throw new Error("the first argument must be string");
    }
    const encoder = new TextEncoder(); // TextEncoder 目前只支持 utf-8 编码
    return this.bufferToBase64(encoder.encode(utf8Str), padding);
  }

  private _base64ToUtf8(base64Str: string): string {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(this.base64ToBuffer(base64Str));
  }

  private _utf16ToBase64(utf16Str: string, littleEndian: boolean = true, padding: boolean = true): string {
    if (typeof utf16Str !== "string") {
      throw new Error("the first argument must be string");
    }
    const dv = new DataView(new ArrayBuffer(utf16Str.length * 2));
    for (let i = 0; i < utf16Str.length; i++) {
      dv.setUint16(i * 2, utf16Str.charCodeAt(i), littleEndian);
    }
    return this.bufferToBase64(dv, padding);
  }

  private _base64ToUtf16(base64Str: string, littleEndian: boolean = true): string {
    const decoder = new TextDecoder(littleEndian ? "utf-16le" : "utf-16be");
    return decoder.decode(this.base64ToBuffer(base64Str));
  }

  bufferToDataURL(value: buffer, mimeType: string = "application/octet-stream"): string {
    return `data:${mimeType};base64,${encodeURIComponent(this.bufferToBase64(value, true))}`;
  }
  strToDataURL(str: string, encoding: encoding = "utf-8"): string {
    return `data:text/plain;charset=${encoding};base64,${encodeURIComponent(this.strToBase64(str, encoding, true))}`;
  }
}

export = Base64;
