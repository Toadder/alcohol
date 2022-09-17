// Dynamic Adaptive
class DynamicAdapt {
  constructor(type) {
    this.type = type;
  }

  init() {
    // массив объектов
    this.оbjects = [];
    this.daClassname = "_dynamic_adapt_";
    // массив DOM-элементов
    this.nodes = [...document.querySelectorAll("[data-da]")];

    // наполнение оbjects объктами
    this.nodes.forEach((node) => {
      const data = node.dataset.da.trim();
      const dataArray = data.split(",");
      const оbject = {};
      оbject.element = node;
      оbject.parent = node.parentNode;
      оbject.destination =
        node.closest(`${dataArray[0].trim()}`) ||
        document.querySelector(`${dataArray[0].trim()}`);
      оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767";
      оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
      оbject.index = this.indexInParent(оbject.parent, оbject.element);
      this.оbjects.push(оbject);
    });

    this.arraySort(this.оbjects);

    // массив уникальных медиа-запросов
    this.mediaQueries = this.оbjects
      .map(
        ({ breakpoint }) =>
          `(${this.type}-width: ${breakpoint}px),${breakpoint}`
      )
      .filter((item, index, self) => self.indexOf(item) === index);

    // навешивание слушателя на медиа-запрос
    // и вызов обработчика при первом запуске
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(",");
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];

      // массив объектов с подходящим брейкпоинтом
      const оbjectsFilter = this.оbjects.filter(
        ({ breakpoint }) => breakpoint === mediaBreakpoint
      );
      matchMedia.addEventListener("change", () => {
        this.mediaHandler(matchMedia, оbjectsFilter);
      });
      this.mediaHandler(matchMedia, оbjectsFilter);
    });
  }

  // Основная функция
  mediaHandler(matchMedia, оbjects) {
    if (matchMedia.matches) {
      оbjects.forEach((оbject) => {
        оbject.index = this.indexInParent(оbject.parent, оbject.element);
        this.moveTo(оbject.place, оbject.element, оbject.destination);
      });
    } else {
      оbjects.forEach(({ parent, element, index }) => {
        if (element.classList.contains(this.daClassname)) {
          this.moveBack(parent, element, index);
        }
      });
    }
  }

  // Функция перемещения
  moveTo(place, element, destination) {
    element.classList.add(this.daClassname);
    if (place === "last" || place >= destination.children.length) {
      destination.append(element);
      return;
    }
    if (place === "first") {
      destination.prepend(element);
      return;
    }
    destination.children[place].before(element);
  }

  // Функция возврата
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== undefined) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }

  // Функция получения индекса внутри родителя
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }

  // Функция сортировки массива по breakpoint и place
  // по возрастанию для this.type = min
  // по убыванию для this.type = max
  arraySort(arr) {
    if (this.type === "min") {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return -1;
          }
          if (a.place === "last" || b.place === "first") {
            return 1;
          }
          return a.place - b.place;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return 1;
          }
          if (a.place === "last" || b.place === "first") {
            return -1;
          }
          return b.place - a.place;
        }
        return b.breakpoint - a.breakpoint;
      });
      return;
    }
  }
}

// Click on the burger
const headerBurger = document.querySelector(".header__burger");
const headerMenu = document.querySelector(".header__main");

headerBurger.addEventListener("click", () => {
  headerBurger.classList.toggle("header__burger_active");
  headerMenu.classList.toggle("header__main_active");
  document.body.classList.toggle("lock");
});

// Stock Slider Init
if (document.querySelector(".slider-stocks")) {
  const stocksSlider = new Swiper(".slider-stocks", {
    speed: 650,
    autoHeight: true,
    loop: true,
    slidesPerView: 1,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    navigation: {
      prevEl: ".stocks__prev",
      nextEl: ".stocks__next",
    },
    preloadImages: false,
    lazy: {
      loadPrevNext: true,
    },
  });
}

// Click Delegation
document.addEventListener("click", clickHandler);
function clickHandler(e) {
  const target = e.target;

  // Add to cart
  if (target.closest(".add-to-cart")) {
    const addBtn = target.closest(".add-to-cart");
    const timeout = addBtn.classList.contains("add-to-cart_active") ? 0 : 400;

    addBtn.classList.add("add-to-cart_active");
    setTimeout(() => {
      popupOpen(document.querySelector("#add_popup"));
    }, timeout);
  }
}

// Init dynamic adapt
const da = new DynamicAdapt("max");
da.init();

// Yandex map
let sectionMap = document.querySelector(".contacts__map");

window.addEventListener("scroll", checkYmapInit);
checkYmapInit();

function ymapInit() {
  if (typeof ymaps === "undefined" || !sectionMap) return;
  let ymap = document.getElementById("ymap");

  ymaps.ready(function () {
    let map = new ymaps.Map("ymap", {
      center: [59.96502956414705, 30.278920499999966],
      zoom: 17,
      controls: ["zoomControl"],
      behaviors: ["drag"],
    });

    // Placemark
    let placemark = new ymaps.Placemark(
      [59.96502956414705, 30.278920499999966],
      {
        // Hint
        hintContent: "ALKO CLUB",
        balloonContent: "ALKO CLUB",
      },
      {
        preset: "islands#icon",
        iconColor: "#633389",
      }
    );

    map.geoObjects.add(placemark);
  });
}

function checkYmapInit() {
  if (!sectionMap) return;
  let sectionMapTop = sectionMap.getBoundingClientRect().top;
  let scrollTop = window.pageYOffset;
  let sectionMapOffsetTop = sectionMapTop + scrollTop;

  if (scrollTop + window.innerHeight > sectionMapOffsetTop) {
    ymapLoad();
    window.removeEventListener("scroll", checkYmapInit);
  }
}

function ymapLoad() {
  let script = document.createElement("script");
  script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
  document.body.appendChild(script);
  script.onload = ymapInit;
}

// Popup
const popupLinks = document.querySelectorAll(".popup-link");
const body = document.querySelector("body");
const lockPadding = document.querySelectorAll(".lock-padding");
let unlock = true;
const timeout = 400;

if (popupLinks.length > 0) {
  for (let index = 0; index < popupLinks.length; index++) {
    const popupLink = popupLinks[index];
    popupLink.addEventListener("click", function (e) {
      const popupName = popupLink.getAttribute("href").replace("#", "");
      const currentPopup = document.getElementById(popupName);
      popupOpen(currentPopup);
      e.preventDefault();
    });
  }
}

const popupCloseIcon = document.querySelectorAll(".close-popup");
if (popupCloseIcon.length > 0) {
  for (let index = 0; index < popupCloseIcon.length; index++) {
    const el = popupCloseIcon[index];
    el.addEventListener("click", function (e) {
      popupClose(el.closest(".popup"));
      e.preventDefault();
    });
  }
}

function popupOpen(currentPopup) {
  if (currentPopup && unlock) {
    const popupActive = document.querySelector(".popup._open");
    if (popupActive) {
      popupClose(popupActive, false);
    } else {
      bodyLock();
    }
    currentPopup.classList.add("_open");
    currentPopup.addEventListener("click", function (e) {
      if (!e.target.closest(".popup__content")) {
        popupClose(e.target.closest(".popup"));
      }
    });
  }
}

function popupClose(popupActive, doUnlock = true) {
  if (unlock) {
    popupActive.classList.remove("_open");
    if (doUnlock) {
      bodyUnlock();
    }
  }
}

function bodyLock() {
  const lockPaddingValue =
    window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";

  if (lockPadding.length > 0) {
    for (let index = 0; index < lockPadding.length; index++) {
      const el = lockPadding[index];
      el.style.paddingRight = lockPaddingValue;
    }
  }
  body.style.paddingRight = lockPaddingValue;
  body.classList.add("lock");

  unlock = false;
  setTimeout(function () {
    unlock = true;
  }, timeout);
}

function bodyUnlock() {
  setTimeout(function () {
    if (lockPadding.length > 0) {
      for (let index = 0; index < lockPadding.length; index++) {
        const el = lockPadding[index];
        el.style.paddingRight = "0px";
      }
    }
    body.style.paddingRight = "0px";
    body.classList.remove("lock");
  }, timeout);

  unlock = false;
  setTimeout(function () {
    unlock = true;
  }, timeout);
}

document.addEventListener("keydown", function (e) {
  if (e.which === 27) {
    const popupActive = document.querySelector(".popup._open");
    popupClose(popupActive);
  }
});

window.onload = () => {
  // Lazyloading
  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.2,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;

        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        } else if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
          img.removeAttribute("data-srcset");
        }

        img.onload = () => {
          img.classList.add("lazy-image--loaded");
        };
        observer.unobserve(img);
      }
    });
  }, options);

  const lazyImages = document.querySelectorAll(
    "img[data-src], source[data-srcset]"
  );
  lazyImages.forEach((img) => observer.observe(img));
};
