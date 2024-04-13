let currentSection = 0;

const SECTIONS = {
  0: '',
  1: 'servicos',
  2: 'quem-somos',
  3: 'contato'
};

const PAGE_URL = window.location.protocol + "//" + window.location.host + window.location.pathname;
const nav = document.getElementById('main-nav');

const createDebounce = (delay = 1000) => {
  let timeoutID = null;

  return function debounce(callback) {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }

    timeoutID = setTimeout(callback, delay);
  }
}

const updateURLRef = (id) => {
  if (!window.history) {
    return;
  }

  const newURL = PAGE_URL + `#${id}`;

  window.history.pushState({ path: newURL }, '', newURL);
  const element = !id ? null : document.getElementById(id);
  const y = !element ? 0 : element.offsetTop;

  window.scrollTo({
    top: y,
    left: 0,
    behavior: "smooth",
  });
}

const delayedScroll = createDebounce(150);

const updateCurrentSection = (deltaY) => {
  if (deltaY > 0) {
    currentSection = Math.min(3, currentSection + 1);
  } else {
    currentSection = Math.max(0, currentSection - 1);
  }
};

const onUpdateLocation = (novoID) => {
  const last = nav.querySelector(`li.active`);
  last.classList.remove('active');
  const current = nav.querySelector(`li:has([href="${novoID}"])`);
  current.classList.add('active'); 
}

const onChangeContent = (deltaY, useDebounce = true) => {
  updateCurrentSection(deltaY);

  const novoID = SECTIONS[currentSection];
  onUpdateLocation(`#${novoID}`);

  if (useDebounce) {
    delayedScroll(() => updateURLRef(novoID));
  } else {
    updateURLRef(novoID);
  }
}

function isTouchDevice() {
  return 'ontouchstart' in window ?? navigator.maxTouchPoints;
}

const createMouseListeners = () => {
  document.addEventListener('wheel', (event) => {
    const { deltaY } = event;
    onChangeContent(deltaY);
  });
};

const createTouchListeners = () => {
  let touchStartY = 0;
  let touchMoveY = -1;
  let hasMoved = false;

  document.addEventListener('touchstart', (event) => {
    touchStartY = event.touches[0].clientY;
  });

  document.addEventListener('touchmove', (event) => {
    touchMoveY = event.touches[0].clientY;
    hasMoved = true;
  });

  document.addEventListener('touchend', (event) => {
    if (!hasMoved) {
      return;
    }
    const deltaY = touchStartY - touchMoveY;
    onChangeContent(deltaY, false);
  });
};

createMouseListeners();
if (isTouchDevice()) {
  createTouchListeners();
}

window.addEventListener("hashchange", (event) => {
  onUpdateLocation(window.location.hash ?? '#');
})