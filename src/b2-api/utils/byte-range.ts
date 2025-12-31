export class ByteRange {
  constructor(public start: number, public end: number) { }

  toHeaderValue(): string {
    return `bytes=${this.start}-${this.end}`;
  }

  toString(): string {
    return this.toHeaderValue();
  }
}
