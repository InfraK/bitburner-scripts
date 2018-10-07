export const writeToDashboard = (ns, message) => {
  ns.write(20, `${ns.getScriptName()}: ${message}`);
};

const makeLog = ns => {
  const wrapper = document.createElement('div');
  wrapper.id = 'dashboard-wrapper';
  wrapper.style.position = 'fixed';
  wrapper.style.width = '33%';
  wrapper.style.border = '2px solid var(--my-highlight-color)';
  wrapper.style.backgroundColor = 'black';
  wrapper.style.height = '33%';
  wrapper.style.bottom = '0';
  wrapper.style.right = '0';
  wrapper.style.zIndex = 1;
  wrapper.style.padding = '20px';
  wrapper.style.color = 'var( --my-font-color)';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.overflow = 'hidden';

  const div = document.createElement('div');
  div.id = 'dashboard-log';
  div.style.overflowY = 'auto';

  const content = document.createElement('div');

  const closeBtn = document.createElement('span');
  closeBtn.classList.add('popup-box-button');
  closeBtn.id = 'dashboard-close';
  closeBtn.innerHTML = 'close';
  closeBtn.style.position = 'fixed';
  closeBtn.style.right = '20px';
  closeBtn.style.margin = '0px';

  const header = document.createElement('div');
  header.style.marginBottom = '15px';
  header.style.display = 'flex';
  header.style.alignItems = 'center';

  const p = document.createElement('p');
  p.id = 'dashboard-text';
  p.innerText = 'Welcome...';
  const scriptNumber = document.createElement('span');
  scriptNumber.id = 'dashboard-scripts-number';

  const servers = document.createElement('span');
  servers.id = 'dashboard-servers';
  wrapper.appendChild(header);
  header.appendChild(closeBtn);
  header.appendChild(scriptNumber);
  header.appendChild(servers);
  div.appendChild(content);
  content.appendChild(p);
  document.body.appendChild(wrapper);
  wrapper.appendChild(div);
  return p;
};

const listenPort = async (ns, port) => {
  while (ns.peek(port) === 'NULL PORT DATA') {
    // Throw out all empty values
    ns.read(port);
    await ns.sleep(50);
  }
  return ns.read(port);
};

const addText = async (ns, p, port) => {
  p.innerHTML += `<br> ${await listenPort(ns, port)}`;
};

export async function main(ns) {
  const port = 20;
  const log = makeLog();

  const div = document.querySelector('#dashboard-log');
  const servers = document.querySelector('#dashboard-servers');
  const scripts = document.querySelector('#dashboard-scripts-number');

  const closeBtn = document.querySelector('#dashboard-close');
  closeBtn.addEventListener('click', () => {
    document.querySelector('#dashboard-wrapper').remove();
    ns.exit();
  });

  addText(log, 'Personal dashboard');

  while (true) {
    const s = ns.getPurchasedServers();
    const scrip = ns.ps();
    scripts.innerText = `Scripts Running: ${scrip.length}`;
    servers.innerText = `Servers: ${s.length}`;
    await addText(ns, log, port);
    div.scrollTop = div.scrollHeight;
    await ns.sleep(150);
  }
}
