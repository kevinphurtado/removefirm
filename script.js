document.addEventListener('DOMContentLoaded', () => {

  // ======== CONSTANTES Y CONFIGURACIÓN ========
  const DB_NAME = 'TransparentSignatureDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'processedImages';
  const DEFAULT_TOLERANCE = 25;
  const DEFAULT_FEATHER = 5;
  const DEBOUNCE_DELAY = 100;

  // ======== DICCIONARIO DE TRADUCCIONES ========
  const translations = {
    es: {
      badge: "Fase Beta 3",
      heroTitle: "Quita el fondo de tu firma en segundos",
      heroSubtitle: "Sube tu imagen, ajusta la tolerancia y el suavizado, y obtén una firma con fondo transparente lista para usar.",
      chipFormats: "Formatos: PNG, JPG, WebP",
      chipEasy: "Carga fácil por clic o arrastre",
      chipMulti: "Multi-idioma y tema",
      uploadTitle: "Arrastra o selecciona tu imagen",
      uploadHint: "Tamaño máximo 10MB",
      before: "Antes", after: "Después",
      tolerance: "Tolerancia", feather: "Suavizado",
      download: "Descargar", copy: "Copiar", copied: "¡Copiado!", reset: "Restaurar",
      hintTip: "Tip: usa imágenes con fondo uniforme y buena iluminación para mejores resultados.",
      privacyTitle: "Política de Privacidad",
      privacyDesc1: "Tus imágenes se procesan en tu dispositivo y nunca se suben a un servidor. El historial se guarda localmente en la base de datos de tu navegador. <br>Si tienes dudas sobre la privacidad, puedes contactarnos a través del correo <strong>agente.chococreativo@gmail.com.</strong></br>",
      howToTitle: "Cómo Usar",
      howTo1_title: "Carga tu imagen", howTo1_desc: "Arrastra o selecciona un archivo para empezar.",
      howTo2_title: "Ajusta el resultado", howTo2_desc: "Usa los controles para perfeccionar la selección.",
      howTo3_title: "Guarda tu firma", howTo3_desc: "Descarga o copia la imagen con fondo transparente.",
      background: "Fondo de previsualización:",
      langAria: "Cambiar idioma",
      themeAriaLight: "Cambiar a modo claro",
      themeAriaDark: "Cambiar a modo oscuro",
      processing: "Procesando...",
      historyTitle: "Historial",
      clearHistory: "Limpiar historial",
      versionTitle: "Novedades en la Versión 3",
      donate: "Donar con PayPal",
      donateTitle: "Apoya este proyecto",
      donateDesc: "Si esta herramienta te resulta útil, considera hacer una donación para apoyar su desarrollo y mantenimiento futuro.",
    },
    en: {
      badge: "Beta Phase 3",
      heroTitle: "Remove your signature's background in seconds",
      heroSubtitle: "Upload your image, adjust tolerance and feather, and get a transparent background signature ready to use.",
      chipFormats: "Formats: PNG, JPG, WebP",
      chipEasy: "Easy upload by click or drag",
      chipMulti: "Multi-language & theme",
      uploadTitle: "Drag or select your image",
      uploadHint: "Maximum size 10MB",
      before: "Before", after: "After",
      tolerance: "Tolerance", feather: "Feather",
      download: "Download", copy: "Copy", copied: "Copied!", reset: "Reset",
      hintTip: "Tip: use images with a uniform background and good lighting for best results.",
      privacyTitle: "Privacy Policy",
      privacyDesc1: "Your images are processed on your device and never uploaded to a server. The history is saved locally in your browser's database. <br>If you have any questions about privacy, you can contact us at <strong>agente.chococreativo@gmail.com.</strong></br>",
      howToTitle: "How to Use",
      howTo1_title: "Upload Your Image", howTo1_desc: "Drag and drop or select a file to begin.",
      howTo2_title: "Adjust the Result", howTo2_desc: "Use the controls to perfect the selection.",
      howTo3_title: "Save Your Signature", howTo3_desc: "Download or copy the image with a transparent background.",
      background: "Preview background:",
      langAria: "Change language",
      themeAriaLight: "Switch to light mode",
      themeAriaDark: "Switch to dark mode",
      processing: "Processing...",
      historyTitle: "History",
      clearHistory: "Clear History",
      versionTitle: "What's New in Version 3",
      donate: "Donate with PayPal",
      donateTitle: "Support this project",
      donateDesc: "If you find this tool useful, please consider making a donation to support its future development and maintenance.",
    }
  };

  // ======== ELEMENTOS DEL DOM ========
  const getEl = (id) => document.getElementById(id);
  const UIElements = {
    uploadArea: getEl('upload'),
    fileInput: getEl('fileInput'),
    editor: getEl('editor'),
    resultCanvas: getEl('resultCanvas'),
    previewContainer: getEl('previewContainer'),
    beforeAfterToggle: getEl('beforeAfterToggle'),
    tolSlider: getEl('tolerance'),
    featherSlider: getEl('feather'),
    tolVal: getEl('tolVal'),
    featherVal: getEl('featherVal'),
    downloadBtn: getEl('downloadBtn'),
    copyBtn: getEl('copyBtn'),
    resetBtn: getEl('resetBtn'),
    langSwitch: getEl('langSwitch'),
    themeSwitch: getEl('themeSwitch'),
    sunIcon: getEl('sunIcon'),
    moonIcon: getEl('moonIcon'),
    bgSwatches: getEl('bgSwatches'),
    loadingOverlay: getEl('loadingOverlay'),
    versionLink: getEl('versionLink'),
    versionModal: getEl('versionModal'),
    modalClose: getEl('modalClose'),
    historySection: getEl('historySection'),
    historyContainer: getEl('historyContainer'),
    clearHistoryBtn: getEl('clearHistoryBtn'),
    howToContainer: getEl('howToContainer'),
    donateLink: getEl('donateLink'),
    donateModal: getEl('donateModal'),
    donateModalClose: getEl('donateModalClose'),
  };

  // ======== ESTADO DE LA APLICACIÓN ========
  const AppState = {
    imgOriginal: null,
    workCanvas: document.createElement('canvas'),
    originalCanvas: document.createElement('canvas'),
    currentLang: localStorage.getItem("lang") || "es",
    isDarkMode: localStorage.getItem("theme") === "dark",
    isProcessing: false,
    db: null,
  };
  
  // ======== LÓGICA DE BASE DE DATOS (IndexedDB) ========
  const DB = {
    init: () => new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    }),
    add: (data) => new Promise((resolve, reject) => {
        const transaction = AppState.db.transaction(STORE_NAME, 'readwrite');
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.objectStore(STORE_NAME).add({ dataUrl: data });
    }),
    getAll: () => new Promise((resolve, reject) => {
        const transaction = AppState.db.transaction(STORE_NAME, 'readonly');
        const request = transaction.objectStore(STORE_NAME).getAll();
        request.onsuccess = () => resolve(request.result.reverse());
        request.onerror = () => reject(request.error);
    }),
    delete: (id) => new Promise((resolve, reject) => {
        const transaction = AppState.db.transaction(STORE_NAME, 'readwrite');
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.objectStore(STORE_NAME).delete(id);
    }),
    clear: () => new Promise((resolve, reject) => {
        const transaction = AppState.db.transaction(STORE_NAME, 'readwrite');
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.objectStore(STORE_NAME).clear();
    }),
  };
  
  // ======== WEB WORKER PARA PROCESAMIENTO DE IMAGEN ========
  let imageWorker;
  function initializeWorker() {
    const workerCode = `
      const rgbToLab = (r, g, b) => {
          r /= 255; g /= 255; b /= 255;
          r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
          g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
          b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
          let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
          let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0000;
          let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
          x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
          y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
          z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
          return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)];
      };
      const computeBackgroundColor = (d, w, h) => {
          let r=0,g=0,b=0,count=0;
          const step = Math.max(2, Math.floor(Math.min(w, h) / 100));
          for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
              if (x > step && x < w - step && y > step && y < h - step) continue;
              const i = (y * w + x) * 4; r += d[i]; g += d[i+1]; b += d[i+2]; count++;
          }
          return count === 0 ? [d[0], d[1], d[2]] : [Math.round(r/count), Math.round(g/count), Math.round(b/count)];
      };
      self.onmessage = (e) => {
        const { imageData, w, h, tol, soft } = e.data;
        const d = imageData.data;
        const [bgR, bgG, bgB] = computeBackgroundColor(d, w, h);
        const bgLab = rgbToLab(bgR, bgG, bgB);
        const tolMin = Math.max(0, tol - soft);
        const tolMax = tol + soft;
        for (let i = 0; i < d.length; i += 4) {
            const pxLab = rgbToLab(d[i], d[i+1], d[i+2]);
            const deltaE = Math.hypot(pxLab[0] - bgLab[0], pxLab[1] - bgLab[1], pxLab[2] - bgLab[2]);
            if (deltaE <= tolMin) d[i+3] = 0;
            else if (soft > 0 && deltaE < tolMax) d[i+3] = Math.round(d[i+3] * ((deltaE - tolMin) / soft));
        }
        self.postMessage(imageData, [imageData.data.buffer]);
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    imageWorker = new Worker(URL.createObjectURL(blob));
    imageWorker.onmessage = (e) => {
        const processedImageData = e.data;
        AppState.workCanvas.getContext('2d').putImageData(processedImageData, 0, 0);
        drawProcessed();
        AppState.isProcessing = false;
        UIElements.loadingOverlay.classList.remove('active');
    };
  }

  // ======== LÓGICA DE UI, DIBUJADO Y PROCESAMIENTO ========
    function buildHowToHTML(t) {
        return `
            <div class="how-to-step">
                <div class="step-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <div class="step-text">
                    <h3>${t.howTo1_title}</h3>
                    <p>${t.howTo1_desc}</p>
                </div>
            </div>
            <div class="how-to-step">
                <div class="step-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                </div>
                <div class="step-text">
                    <h3>${t.howTo2_title}</h3>
                    <p>${t.howTo2_desc}</p>
                </div>
            </div>
            <div class="how-to-step">
                <div class="step-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </div>
                <div class="step-text">
                    <h3>${t.howTo3_title}</h3>
                    <p>${t.howTo3_desc}</p>
                </div>
            </div>
        `;
    }

  function applyLanguage(lang) {
    const t = translations[lang];
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
      const key = el.getAttribute('data-i18n-key');
      if (t[key]) el.innerHTML = t[key];
    });
    UIElements.howToContainer.innerHTML = buildHowToHTML(t);
    UIElements.langSwitch.setAttribute('aria-label', t.langAria);
    applyTheme(AppState.isDarkMode);
  }
  function applyTheme(isDark) {
    const t = translations[AppState.currentLang];
    document.body.classList.toggle("dark", isDark);
    UIElements.sunIcon.classList.toggle('hidden', isDark);
    UIElements.moonIcon.classList.toggle('hidden', !isDark);
    UIElements.themeSwitch.setAttribute('aria-label', isDark ? t.themeAriaLight : t.themeAriaDark);
  }
  function showEditorUI(show) {
    UIElements.editor.classList.toggle('hidden', !show);
    UIElements.uploadArea.classList.toggle('compact', show);
  }
  function processCurrentImage() {
    if (!AppState.imgOriginal || AppState.isProcessing) return;
    AppState.isProcessing = true;
    UIElements.loadingOverlay.classList.add('active');
    const ctx = AppState.workCanvas.getContext('2d', { willReadFrequently: true });
    ctx.clearRect(0, 0, AppState.workCanvas.width, AppState.workCanvas.height);
    ctx.drawImage(AppState.imgOriginal, 0, 0, AppState.workCanvas.width, AppState.workCanvas.height);
    const imageData = ctx.getImageData(0, 0, AppState.workCanvas.width, AppState.workCanvas.height);
    imageWorker.postMessage({
        imageData: imageData,
        w: AppState.workCanvas.width, h: AppState.workCanvas.height,
        tol: parseInt(UIElements.tolSlider.value, 10),
        soft: parseInt(UIElements.featherSlider.value, 10)
    }, [imageData.data.buffer]);
  }
  const drawProcessed = () => {
    const outCtx = UIElements.resultCanvas.getContext('2d');
    UIElements.resultCanvas.width = AppState.workCanvas.width;
    UIElements.resultCanvas.height = AppState.workCanvas.height;
    outCtx.clearRect(0, 0, AppState.workCanvas.width, AppState.workCanvas.height);
    outCtx.drawImage(AppState.workCanvas, 0, 0);
  };
  const drawOriginal = () => {
    const outCtx = UIElements.resultCanvas.getContext('2d');
    UIElements.resultCanvas.width = AppState.originalCanvas.width;
    UIElements.resultCanvas.height = AppState.originalCanvas.height;
    outCtx.clearRect(0, 0, AppState.originalCanvas.width, AppState.originalCanvas.height);
    outCtx.drawImage(AppState.originalCanvas, 0, 0);
  };
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    loadImageOnCanvas(URL.createObjectURL(file));
  }
  function loadImageOnCanvas(imageSource) {
    const img = new Image();
    img.onload = () => {
        AppState.imgOriginal = img;
        const w = img.naturalWidth, h = img.naturalHeight;
        AppState.originalCanvas.width = w; AppState.originalCanvas.height = h;
        AppState.originalCanvas.getContext('2d').drawImage(img, 0, 0);
        AppState.workCanvas.width = w; AppState.workCanvas.height = h;
        showEditorUI(true);
        UIElements.beforeAfterToggle.checked = true;
        UIElements.beforeAfterToggle.dispatchEvent(new Event('change'));
        processCurrentImage();
    };
    img.onerror = () => {
      alert("No se pudo cargar la imagen.");
    }
    img.src = imageSource;
  }
  async function loadAndRenderHistory() {
      const images = await DB.getAll();
      UIElements.historyContainer.innerHTML = '';
      const hasImages = images.length > 0;
      UIElements.historySection.classList.toggle('hidden', !hasImages);
      UIElements.clearHistoryBtn.classList.toggle('hidden', !hasImages);
      images.forEach(image => {
          const item = document.createElement('div');
          item.className = 'history-item';
          item.innerHTML = `<img src="${image.dataUrl}" alt="Imagen procesada del historial" /><button class="history-delete" data-id="${image.id}" aria-label="Eliminar del historial">&times;</button>`;
          UIElements.historyContainer.appendChild(item);
      });
  }
  function resetToInitialState() {
      AppState.imgOriginal = null;
      showEditorUI(false);
      
      const ctx = UIElements.resultCanvas.getContext('2d');
      ctx.clearRect(0, 0, UIElements.resultCanvas.width, UIElements.resultCanvas.height);

      UIElements.fileInput.value = '';

      UIElements.tolSlider.value = DEFAULT_TOLERANCE;
      UIElements.featherSlider.value = DEFAULT_FEATHER;
      UIElements.tolVal.textContent = DEFAULT_TOLERANCE;
      UIElements.featherVal.textContent = DEFAULT_FEATHER;

      UIElements.bgSwatches.querySelector('.active')?.classList.remove('active');
      UIElements.bgSwatches.querySelector('[data-bg="transparent"]').classList.add('active');
      UIElements.previewContainer.style.background = '';
  }
  const debounce = (func, delay) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), delay); }; };
  
  // ======== INICIALIZACIÓN Y EVENT LISTENERS ========
  async function init() {
    applyLanguage(AppState.currentLang);
    applyTheme(AppState.isDarkMode);
    initializeWorker();
    try {
        AppState.db = await DB.init();
        await loadAndRenderHistory();
    } catch (error) {
        console.error("No se pudo inicializar la base de datos:", error);
    }
    setupEventListeners();
  }
  function setupEventListeners(){
    UIElements.uploadArea.addEventListener('click', () => UIElements.fileInput.click());
    UIElements.fileInput.addEventListener('change', e => handleFile(e.target.files[0]));
    const dragEvents = ['dragover', 'dragleave', 'drop'];
    dragEvents.forEach(eName => UIElements.uploadArea.addEventListener(eName, e => {
        e.preventDefault();
        e.stopPropagation();
        if (eName === 'dragover') UIElements.uploadArea.classList.add('dragover');
        if (eName !== 'dragover') UIElements.uploadArea.classList.remove('dragover');
        if (eName === 'drop') handleFile(e.dataTransfer.files[0]);
    }));
    const debouncedProcess = debounce(processCurrentImage, DEBOUNCE_DELAY);
    UIElements.tolSlider.addEventListener('input', () => { UIElements.tolVal.textContent = UIElements.tolSlider.value; debouncedProcess(); });
    UIElements.featherSlider.addEventListener('input', () => { UIElements.featherVal.textContent = UIElements.featherSlider.value; debouncedProcess(); });
    UIElements.beforeAfterToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            UIElements.previewContainer.style.background = '';
            drawProcessed();
        } else {
            UIElements.previewContainer.style.background = '#ffffff';
            drawOriginal();
        }
    });
    
    UIElements.resetBtn.addEventListener('click', resetToInitialState);

    const saveAndAction = async (action) => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = UIElements.resultCanvas.width;
        tempCanvas.height = UIElements.resultCanvas.height;
        tempCanvas.getContext('2d').drawImage(UIElements.resultCanvas, 0, 0);
        try { 
            await DB.add(tempCanvas.toDataURL('image/png'));
            await loadAndRenderHistory(); 
        } catch(e) { console.error("Error al guardar en historial", e); }
        action(tempCanvas);
    };
    UIElements.downloadBtn.addEventListener('click', () => saveAndAction((canvas) => {
        const a = document.createElement('a');
        a.download = 'firma_transparente.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
    }));
    UIElements.copyBtn.addEventListener('click', () => {
        UIElements.copyBtn.disabled = true;
        saveAndAction(async (canvas) => {
            const originalText = UIElements.copyBtn.querySelector('span').innerHTML;
            UIElements.copyBtn.querySelector('span').textContent = translations[AppState.currentLang].copied;
            try {
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                await navigator.clipboard.write([ new ClipboardItem({ 'image/png': blob }) ]);
            } catch (err) { alert('No se pudo copiar la imagen.'); } finally {
                setTimeout(() => { UIElements.copyBtn.querySelector('span').innerHTML = originalText; UIElements.copyBtn.disabled = false; }, 2000);
            }
        })
    });
    UIElements.historyContainer.addEventListener('click', e => {
        if (e.target.tagName === 'IMG') {
            loadImageOnCanvas(e.target.src);
            window.scrollTo({ top: UIElements.editor.offsetTop, behavior: 'smooth' });
        }
        if (e.target.classList.contains('history-delete')) {
            const id = parseInt(e.target.dataset.id, 10);
            DB.delete(id).then(loadAndRenderHistory);
        }
    });
    UIElements.clearHistoryBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
            DB.clear().then(loadAndRenderHistory);
        }
    });
    UIElements.bgSwatches.addEventListener('click', (e) => {
        if(e.target.classList.contains('swatch')) {
            UIElements.bgSwatches.querySelector('.active')?.classList.remove('active');
            e.target.classList.add('active');
            const bg = e.target.dataset.bg;
            if (bg === 'transparent') {
                UIElements.previewContainer.style.background = '';
            } else if (bg === 'gradient') {
                UIElements.previewContainer.style.background = 'conic-gradient(from 90deg at 50% 50%,#fde047,#fca5a5,#4338ca,#4ade80,#fde047)';
            } else {
                UIElements.previewContainer.style.background = bg;
            }
        }
    });
    UIElements.langSwitch.addEventListener("click", () => { AppState.currentLang = AppState.currentLang === "es" ? "en" : "es"; localStorage.setItem("lang", AppState.currentLang); applyLanguage(AppState.currentLang); });
    UIElements.themeSwitch.addEventListener("click", () => { AppState.isDarkMode = !AppState.isDarkMode; localStorage.setItem("theme", AppState.isDarkMode ? "dark" : "light"); applyTheme(AppState.isDarkMode); });
    
    // Listeners para modales
    UIElements.versionLink.addEventListener('click', e => { e.preventDefault(); UIElements.versionModal.classList.add('visible'); });
    UIElements.modalClose.addEventListener('click', () => UIElements.versionModal.classList.remove('visible'));
    UIElements.versionModal.addEventListener('click', e => { if (e.target === UIElements.versionModal) UIElements.versionModal.classList.remove('visible'); });
    
    UIElements.donateLink.addEventListener('click', e => { e.preventDefault(); UIElements.donateModal.classList.add('visible'); });
    UIElements.donateModalClose.addEventListener('click', () => UIElements.donateModal.classList.remove('visible'));
    UIElements.donateModal.addEventListener('click', e => { if (e.target === UIElements.donateModal) UIElements.donateModal.classList.remove('visible'); });
  }

  init();
});