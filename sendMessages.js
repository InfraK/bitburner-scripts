
export async function main(ns) {
  const port = 20;

  while (true) {
    ns.write(port, 'Message to display');
    await ns.sleep(500);
  }
}
