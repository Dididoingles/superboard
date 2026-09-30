/* ==========================================================================
   TOOLTIP GLOBAL
   ========================================================================== */
function setupGlobalTooltips() {
  const tooltip = document.getElementById('global-tooltip');
  if (!tooltip) return;

  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      tooltip.textContent = el.dataset.tooltip;
      tooltip.classList.add('visible');
      positionTooltip(el, tooltip);
    });
    el.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  });
}

function positionTooltip(el, tooltip) {
  const rect = el.getBoundingClientRect();
  const isHeaderBtn = el.classList.contains('header-icon-btn');
  const isDrawerCol3 = el.classList.contains('side-item') && isInDrawerColumn3(el);
  const tRect = tooltip.getBoundingClientRect();

  let top, left;

  if (isHeaderBtn) {
    top = rect.bottom + 8;
    left = rect.left + rect.width / 2 - tRect.width / 2;
  } else if (isDrawerCol3) {
    /* Coluna 3: tooltip à esquerda do ícone */
    top = rect.top + rect.height / 2 - tRect.height / 2;
    left = rect.left - tRect.width - 10;
  } else {
    top = rect.top + rect.height / 2 - tRect.height / 2;
    left = rect.right + 10;
  }

  const p = 8;
  if (left + tRect.width > window.innerWidth - p) left = window.innerWidth - tRect.width - p;
  if (left < p) left = p;
  if (top < p) top = p;
  if (top + tRect.height > window.innerHeight - p) top = window.innerHeight - tRect.height - p;

  tooltip.style.top = top + 'px';
  tooltip.style.left = left + 'px';
}

/* Descobre se o .side-item está na 3ª coluna do grid 3×N */
function isInDrawerColumn3(el) {
  const grid = el.parentElement;
  if (!grid || !grid.classList.contains('tool-grid')) return false;
  const items = Array.from(grid.children).filter(c => c.classList.contains('side-item'));
  const index = items.indexOf(el);
  if (index === -1) return false;
  return (index % 3) === 2;
}

/* ==========================================================================
   ÍCONES
   ========================================================================== */
const AVAILABLE_ICONS = [
  'fa-star', 'fa-heart', 'fa-thumbs-up', 'fa-check', 'fa-xmark',
  'fa-question', 'fa-lightbulb', 'fa-graduation-cap', 'fa-book', 'fa-pencil',
  'fa-clock', 'fa-calendar', 'fa-location-dot', 'fa-comment', 'fa-envelope',
  'fa-arrow-right', 'fa-arrow-left', 'fa-arrow-up', 'fa-arrow-down', 'fa-music',
  'fa-camera', 'fa-globe', 'fa-bolt', 'fa-fire', 'fa-trophy'
];

function populateIconPicker() {
  const grid = document.getElementById('icon-picker-grid');
  grid.innerHTML = '';
  AVAILABLE_ICONS.forEach(iconClass => {
    const div = document.createElement('div');
    div.className = 'icon-option';
    div.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
    div.onclick = () => selectIcon(iconClass);
    grid.appendChild(div);
  });
}

function openIconModal() { openModal('iconModal'); }

function selectIcon(iconClass) {
  closeModal('iconModal');
  const tempI = document.createElement('i');
  tempI.className = `fa-solid ${iconClass}`;
  document.body.appendChild(tempI);
  const charCode = window.getComputedStyle(tempI, ':before').getPropertyValue('content').replace(/"/g, '');
  document.body.removeChild(tempI);

  const iconText = new fabric.Text(charCode, {
    fontFamily: '"Font Awesome 6 Free"',
    fontWeight: '900',
    fontSize: 40,
    left: 100,
    top: 100,
    fill: canvas.freeDrawingBrush.color || '#333333'
  });

  canvas.add(iconText);
  canvas.isDrawingMode = false;
  updateDrawingBtnUI();
}

/* ==========================================================================
   COLAR IMAGEM
   ========================================================================== */
document.addEventListener('paste', function (e) {
  const items = e.clipboardData && e.clipboardData.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile();
      const reader = new FileReader();

      reader.onload = function (event) {
        const imgObj = new Image();
        imgObj.src = event.target.result;

        imgObj.onload = function () {
          const fabricImg = new fabric.Image(imgObj, {
            left: canvas.width ? canvas.width / 4 : 150,
            top: canvas.height ? canvas.height / 4 : 150,
            selectable: true,
            hasControls: true,
            cornerColor: '#c00000',
            cornerSize: 8,
            transparentCorners: false
          });

          if (fabricImg.width > 400) fabricImg.scaleToWidth(400);

          canvas.add(fabricImg);
          canvas.setActiveObject(fabricImg);
          canvas.renderAll();
          showLongOperationToast("Imagem colada!");
          updateCounter();
        };
      };

      reader.readAsDataURL(blob);
      e.preventDefault();
      break;
    }
  }
});
