(() => {
  const translations = {
    "Apply the reference BOM to all model code": "Appliquer la BOM de référence à tous les codes modèles",
    "Apply the same BOM to all model code selected": "Appliquer la même BOM à tous les codes modèles sélectionnés",
    "Yes": "Oui",
    "No": "Non",
    "activated": "activés",
    "Synthesis": "Synthèse",
    "BOM selected": "BOM sélectionnée",
  };
  const scope = [
    "#models-view .bom-description",
    "#models-body td:nth-child(6) span",
    "#models-body .model-levers",
    "#synthesis-title",
    ".detail-bom-field label",
  ].join(", ");
  const originals = new WeakMap();
  const toggle = document.querySelector("#profile-language-toggle");
  const menu = document.querySelector("#profile-language-menu");
  let language = "en";

  function setOpen(open, restoreFocus = false) {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) menu.querySelector("input:checked").focus();
    else if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener("click", () => setOpen(menu.hidden));
  document.addEventListener("click", event => {
    if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !menu.hidden) {
      event.preventDefault();
      setOpen(false, true);
    }
  });
  document.querySelector(".user").addEventListener("focusout", () => {
    queueMicrotask(() => {
      if (!document.querySelector(".user").contains(document.activeElement)) setOpen(false);
    });
  });

  function render() {
    observer.disconnect();
    document.documentElement.lang = "en";
    document.querySelectorAll(scope).forEach(element => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const previous = originals.get(node);
        const source = previous && node.textContent === previous.rendered ? previous.source : node.textContent;
        const text = source.trim();
        const translated = language === "fr" ? translations[text] : null;
        const rendered = translated ? source.replace(text, () => translated) : source;
        originals.set(node, { source, rendered });
        if (node.textContent !== rendered) node.textContent = rendered;
      }
      if (language === "fr" && Object.values(translations).includes(element.textContent.trim())) element.lang = "fr";
      else element.removeAttribute("lang");
    });
    document.querySelectorAll("#models-body td:nth-child(6) img.evaluation-sticker, #models-body td:nth-child(7) img.evaluation-sticker, #models-body td:nth-child(8) img.evaluation-sticker").forEach(image => {
      if (!image.dataset.englishSrc) {
        image.dataset.englishSrc = image.getAttribute("src");
        image.dataset.englishWidth = image.getAttribute("width");
      }
      if (!image.dataset.englishSrc.endsWith("sticker-not-evaluated.svg")) return;
      if (language === "fr") {
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="92" height="20"><rect width="92" height="20" fill="#F5F4F5"/><text x="5" y="14" font-family="Inter,Arial,sans-serif" font-size="12" fill="#101010">Non évalué</text></svg>';
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        image.width = 92;
        image.alt = "Non évalué";
        image.lang = "fr";
      } else {
        image.setAttribute("src", image.dataset.englishSrc);
        image.setAttribute("width", image.dataset.englishWidth);
        image.alt = "Not evaluated";
        image.removeAttribute("lang");
      }
    });
    const bomTrigger = document.querySelector("#detail-bom-select-trigger");
    if (bomTrigger) {
      const label = bomTrigger.getAttribute("aria-label");
      if (label) bomTrigger.setAttribute("aria-label", label.replace(/^(?:BOM selected|BOM sélectionnée):/, language === "fr" ? "BOM sélectionnée:" : "BOM selected:"));
    }
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-label"] });
  }
  const observer = new MutationObserver(render);
  menu.addEventListener("change", event => {
    if (!event.target.matches('[name="interface-language"]')) return;
    language = event.target.value;
    render();
  });
  render();
})();
