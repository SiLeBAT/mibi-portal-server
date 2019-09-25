import { Writable, WritableOptions } from "stream";

// Snippet from https://gist.github.com/andrei-tofan/b75082574544aee19de1295a48323ad5

/**
 * Simple writable buffer stream
 * @docs: https://nodejs.org/api/stream.html#stream_writable_streams
 */
export class WritableBufferStream extends Writable {
    private _chunks: any[];
  
      constructor(options?: WritableOptions | undefined) {
          super(options);
          this._chunks = [];
      }
  
      _write (chunk: any, enc: string, callback: ((error?: Error|null|undefined) => void)): void{
          this._chunks.push(chunk);
          callback(null);
      }
  
      _destroy(err: any, callback: any): any {
          this._chunks = [];
          return callback(null);
      }
  
      toBuffer(): Buffer {
          return Buffer.concat(this._chunks);
      }
  }