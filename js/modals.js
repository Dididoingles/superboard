/* ==========================================================================
   MODAIS / TOAST
   ========================================================================== */
function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }

let currentConfirmAction = null;

function openConfirmModal(title, message, onConfirm) {
  document.getElementById('confirmModalTitle').innerText = title;
  document.getElementById('confirmModalMessage').innerText = message;
  currentConfirmAction = onConfirm;
  document.getElementById('confirmModalActionBtn').onclick = executeAndCloseConfirm;
  openModal('confirmModal');
}

function executeAndCloseConfirm() {
  if (typeof currentConfirmAction === 'function') currentConfirmAction();
  closeConfirmModal();
}

function closeConfirmModal() {
  currentConfirmAction = null;
  closeModal('confirmModal');
}

function showLongOperationToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 2500);
}

/* ==========================================================================
   GAVETA
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const openDrawerBtn = document.getElementById('openDrawerBtn');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const sidebar = document.getElementById('sidebar');

  function openDrawer() {
    drawerOverlay.classList.add('active');
    sidebar.classList.add('active');
  }
  function closeDrawer() {
    drawerOverlay.classList.remove('active');
    sidebar.classList.remove('active');
  }

  openDrawerBtn.addEventListener('click', openDrawer);
  closeDrawerBtn.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);
});

/* ==========================================================================
   TABS / SLIDE
   ========================================================================== */
function switchTab(name, el) {
  document.querySelectorAll('.mode-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  el.classList.add('active');
  el.setAttribute('aria-selected', 'true');

  const wrapper = document.getElementById('screens-wrapper');
  const drawerBtn = document.getElementById('openDrawerBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('drawerOverlay');

  if (name === 'Modo-game') {
    wrapper.classList.add('show-game');
    drawerBtn.classList.add('hidden-in-game');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    hideTextFormatBar();
  } else {
    wrapper.classList.remove('show-game');
    drawerBtn.classList.remove('hidden-in-game');
  }
}
