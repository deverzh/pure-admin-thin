import { Boot, type IModalMenu, type IDomEditor } from "@wangeditor/editor";

class CarouselMenu implements IModalMenu {
  title = "轮播图";
  iconSvg =
    '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M768 192H256a64 64 0 0 0-64 64v512a64 64 0 0 0 64 64h512a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64z m-64 512H320V320h384v384z m-448-448v384h-64V256h64z m576 384V256h64v384h-64z" fill="currentColor"/></svg>';
  tag = "button";
  showModal = true;
  modalWidth = 640;

  private _selectedSlides: Array<{ url: string; link?: string; alt?: string }> =
    [
      { url: "", link: "", alt: "" },
      { url: "", link: "", alt: "" },
      { url: "", link: "", alt: "" }
    ];
  private _editor: IDomEditor | null = null;

  getValue(_editor: IDomEditor): string | boolean {
    return "";
  }

  isActive(_editor: IDomEditor): boolean {
    return false;
  }

  isDisabled(_editor: IDomEditor): boolean {
    return false;
  }

  exec(_editor: IDomEditor, _value: string | boolean) {}

  getModalPositionNode(_editor: IDomEditor) {
    return null;
  }

  private _insertCarousel() {
    if (!this._editor) return;
    const slides = this._selectedSlides.filter(s => s.url.trim());
    if (slides.length === 0) return;

    const carouselId = `carousel-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const slidesHtml = slides
      .map((s, i) => {
        const img = `<img src="${s.url}" alt="${s.alt || ""}" data-index="${i}" style="width:100%;height:100%;object-fit:cover;display:block;" />`;
        const inner = s.link
          ? `<a href="${s.link}" target="_blank" style="display:block;width:100%;height:100%;">${img}</a>`
          : img;
        return `<div class="carousel-slide" data-index="${i}" style="position:absolute;inset:0;opacity:${i === 0 ? 1 : 0};transition:opacity .6s ease;">${inner}</div>`;
      })
      .join("");
    const dotsHtml = slides
      .map(
        (_, i) =>
          `<span class="carousel-dot" data-index="${i}" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${i === 0 ? "#fff" : "rgba(255,255,255,0.5)"};margin:0 4px;cursor:pointer;transition:background .3s;"></span>`
      )
      .join("");

    const html = `<div class="carousel-container" id="${carouselId}" data-carousel="true" style="position:relative;width:100%;max-width:960px;height:360px;margin:16px auto;overflow:hidden;border-radius:8px;background:#000;user-select:none;">
  ${slidesHtml}
  <div class="carousel-prev" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,.4);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:20px;z-index:2;">&#8249;</div>
  <div class="carousel-next" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,.4);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:20px;z-index:2;">&#8250;</div>
  <div class="carousel-dots" style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);z-index:2;">${dotsHtml}</div>
</div>
<script>
(function(){
  var root = document.getElementById('${carouselId}');
  if (!root) return;
  var slides = root.querySelectorAll('.carousel-slide');
  var dots = root.querySelectorAll('.carousel-dot');
  var idx = 0;
  var timer = null;
  function go(i) {
    idx = (i + slides.length) % slides.length;
    slides.forEach(function(s, k) { s.style.opacity = k === idx ? '1' : '0'; });
    dots.forEach(function(d, k) { d.style.background = k === idx ? '#fff' : 'rgba(255,255,255,0.5)'; });
  }
  function start() { timer = setInterval(function() { go(idx + 1); }, 3000); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  root.querySelector('.carousel-prev').addEventListener('click', function() { stop(); go(idx - 1); start(); });
  root.querySelector('.carousel-next').addEventListener('click', function() { stop(); go(idx + 1); start(); });
  dots.forEach(function(d) { d.addEventListener('click', function() { stop(); go(parseInt(d.getAttribute('data-index'), 10)); start(); }); });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  start();
})();
<\/script>`;

    this._editor.dangerouslyInsertHtml(html);
    this._selectedSlides = [
      { url: "", link: "", alt: "" },
      { url: "", link: "", alt: "" },
      { url: "", link: "", alt: "" }
    ];
  }

  private _closeModal() {
    const modal = document.querySelector(".w-e-modal");
    if (modal) {
      modal.parentNode?.removeChild(modal);
    }
  }

  getModalContentElem(editor: IDomEditor): HTMLElement {
    this._editor = editor;

    const container = document.createElement("div");
    container.style.padding = "16px";
    container.style.minWidth = "560px";

    const listWrapper = document.createElement("div");
    listWrapper.style.maxHeight = "300px";
    listWrapper.style.overflowY = "auto";
    listWrapper.style.border = "1px solid #eee";
    listWrapper.style.borderRadius = "4px";
    listWrapper.style.padding = "8px";

    const render = () => {
      listWrapper.innerHTML = "";
      this._selectedSlides.forEach((slide, idx) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.marginBottom = "8px";
        row.style.gap = "8px";

        const label = document.createElement("span");
        label.textContent = `图${idx + 1}`;
        label.style.width = "40px";
        label.style.fontSize = "14px";

        const urlInput = document.createElement("input");
        urlInput.placeholder = "图片地址";
        urlInput.value = slide.url;
        urlInput.style.flex = "1";
        urlInput.style.padding = "4px 6px";
        urlInput.style.border = "1px solid #ccc";
        urlInput.style.borderRadius = "4px";
        urlInput.addEventListener("input", () => {
          this._selectedSlides[idx].url = urlInput.value;
        });

        const linkInput = document.createElement("input");
        linkInput.placeholder = "跳转链接(可选)";
        linkInput.value = slide.link || "";
        linkInput.style.flex = "1";
        linkInput.style.padding = "4px 6px";
        linkInput.style.border = "1px solid #ccc";
        linkInput.style.borderRadius = "4px";
        linkInput.addEventListener("input", () => {
          this._selectedSlides[idx].link = linkInput.value;
        });

        const delBtn = document.createElement("button");
        delBtn.textContent = "删";
        delBtn.style.padding = "2px 8px";
        delBtn.style.border = "none";
        delBtn.style.background = "#f56c6c";
        delBtn.style.color = "#fff";
        delBtn.style.borderRadius = "4px";
        delBtn.style.cursor = "pointer";
        delBtn.addEventListener("click", () => {
          this._selectedSlides.splice(idx, 1);
          if (this._selectedSlides.length === 0) {
            this._selectedSlides.push({ url: "", link: "", alt: "" });
          }
          render();
        });

        row.appendChild(label);
        row.appendChild(urlInput);
        row.appendChild(linkInput);
        row.appendChild(delBtn);
        listWrapper.appendChild(row);
      });
    };
    render();

    const addBtn = document.createElement("button");
    addBtn.textContent = "+ 添加一张图";
    addBtn.style.marginTop = "8px";
    addBtn.style.padding = "4px 12px";
    addBtn.style.border = "1px solid #409eff";
    addBtn.style.background = "#fff";
    addBtn.style.color = "#409eff";
    addBtn.style.borderRadius = "4px";
    addBtn.style.cursor = "pointer";
    addBtn.addEventListener("click", () => {
      this._selectedSlides.push({ url: "", link: "", alt: "" });
      render();
    });

    const tip = document.createElement("div");
    tip.style.marginTop = "8px";
    tip.style.fontSize = "12px";
    tip.style.color = "#999";
    tip.textContent =
      "提示：轮播图自动轮播，每张图支持图片地址和可选的跳转链接。";

    const btnBar = document.createElement("div");
    btnBar.style.marginTop = "16px";
    btnBar.style.textAlign = "right";
    btnBar.style.paddingTop = "12px";
    btnBar.style.borderTop = "1px solid #eee";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "取消";
    cancelBtn.style.padding = "6px 20px";
    cancelBtn.style.marginRight = "8px";
    cancelBtn.style.border = "1px solid #dcdfe6";
    cancelBtn.style.background = "#fff";
    cancelBtn.style.color = "#606266";
    cancelBtn.style.borderRadius = "4px";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.addEventListener("click", () => {
      this._closeModal();
    });

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "确认";
    confirmBtn.style.padding = "6px 20px";
    confirmBtn.style.border = "none";
    confirmBtn.style.background = "#409eff";
    confirmBtn.style.color = "#fff";
    confirmBtn.style.borderRadius = "4px";
    confirmBtn.style.cursor = "pointer";
    confirmBtn.addEventListener("click", () => {
      this._insertCarousel();
      this._closeModal();
    });

    btnBar.appendChild(cancelBtn);
    btnBar.appendChild(confirmBtn);

    container.appendChild(listWrapper);
    container.appendChild(addBtn);
    container.appendChild(tip);
    container.appendChild(btnBar);

    return container;
  }
}

const menuConf = {
  key: "carousel",
  factory() {
    return new CarouselMenu();
  }
};

export function registerCarouselMenu() {
  Boot.registerMenu(menuConf);
}
