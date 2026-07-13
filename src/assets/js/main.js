// Bear Limo — minimal vanilla JS: mobile nav, dropdown, reveal-on-scroll
(function () {
  "use strict";
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
  var hamburger = document.querySelector(".hamburger");
  var navList = document.getElementById("primary-nav");
  if (hamburger && navList) {
    hamburger.addEventListener("click", function () {
      var open = navList.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    navList.addEventListener("click", function (e) {
      var t = e.target;
      if (t.tagName === "A" && window.innerWidth <= 720) {
        navList.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }
  document.querySelectorAll(".has-dropdown").forEach(function (item) {
    var btn = item.querySelector("button");
    if (!btn) return;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-haspopup", "true");
    function setOpen(v) {
      item.setAttribute("aria-expanded", v ? "true" : "false");
      btn.setAttribute("aria-expanded", v ? "true" : "false");
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(item.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("click", function (e) {
      if (!item.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    if (window.matchMedia("(hover:hover) and (min-width:721px)").matches) {
      var t;
      item.addEventListener("mouseenter", function () {
        clearTimeout(t);
        setOpen(true);
      });
      item.addEventListener("mouseleave", function () {
        t = setTimeout(function () { setOpen(false); }, 160);
      });
    }
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }
})();
