export class Range {
  // Ranges start from zero and are inclusive. Should be integers
  constructor(private start: number, private end: number) {}

  public toString(): string {
    return `bytes=${this.start}-${this.end}`;
  }
}
