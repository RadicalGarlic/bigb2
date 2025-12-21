export abstract class Operation {
  public abstract parseCliArgs(cliArgs: string[]): void;
  public abstract run(): Promise<number>;
}
