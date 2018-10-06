const makeDiv = () => {
  const div = document.createElement("div");
  div.style.position = 'fixed';
  div.style.width = "33%";
  div.style.height = "33%";
  div.style.bottom = '0';
  div.style.bottom = '0';
  div.style.background = 'grey';
  div.style.padding = '20px';
  div.innerText = 'This is my dashboard';
  div.style.color = "white";
  div.innerHTML = "Hello";

  document.body.appendChild(div);
};
  export async function main(ns) {
    makeDiv();
  }
