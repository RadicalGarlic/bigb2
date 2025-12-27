export async function sleep(millisec: number): Promise<void> {
  return await (new Promise<void>((resolve) => {
    setTimeout(resolve, millisec);
  }));
}
