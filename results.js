/* global marked */

const copyContent = async () => {
  const content = document.getElementById("content").textContent;
  const status = document.getElementById("status");

  await navigator.clipboard.writeText(content);
  status.textContent = chrome.i18n.getMessage("results_copied");
  setTimeout(() => status.textContent = "", 1000);
};

const initialize = async () => {
  marked.use({ renderer: { link: (_href, _title, text) => text } });

  document.body.setAttribute("dir", chrome.i18n.getMessage("@@bidi_dir"));

  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = chrome.i18n.getMessage(element.getAttribute("data-i18n"));
  });

  const urlParams = new URLSearchParams(window.location.search);
  const contentIndex = urlParams.get("i");
  const content = (await chrome.storage.session.get({ [`c_${contentIndex}`]: "" }))[`c_${contentIndex}`];

  const div = document.createElement("div");
  div.textContent = content;
  document.getElementById("content").innerHTML = marked.parse(div.innerHTML);
};

document.addEventListener("DOMContentLoaded", initialize);
document.getElementById("copy").addEventListener("click", copyContent);
