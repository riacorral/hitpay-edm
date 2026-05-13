import open from 'open';

export async function openInBrowser(path: string): Promise<void> {
  await open(path);
}
