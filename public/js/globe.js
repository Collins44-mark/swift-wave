/* Swift Wave — spinning Earth with location markers (globe.gl) */
(function () {
  const LOCATIONS = [
    { lat: -6.7924, lng: 39.2083, name: "Tanzania", role: "Headquarters", color: "#D4AF37" },
    { lat: 25.2048, lng: 55.2708, name: "Dubai", role: "Regional Hub", color: "#D4AF37" },
    { lat: 19.076, lng: 72.8777, name: "India", role: "Education Hub", color: "#0B2E6D" },
    { lat: 31.2304, lng: 121.4737, name: "China", role: "Trade Hub", color: "#0B2E6D" },
  ];

  const GLOBE_TEXTURE =
    "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
  const BUMP_TEXTURE =
    "https://unpkg.com/three-globe/example/img/earth-topology.png";

  const instances = [];
  let resizeBound = false;

  function isMobile() {
    return window.matchMedia("(max-width: 639px)").matches;
  }

  function isTablet() {
    return window.matchMedia("(min-width: 640px) and (max-width: 1023px)").matches;
  }

  function getSize(container) {
    const parent = container.parentElement;
    const width =
      container.clientWidth ||
      parent?.clientWidth ||
      parent?.getBoundingClientRect().width ||
      320;
    if (isMobile()) return Math.min(Math.max(width, 260), 340);
    if (isTablet()) return Math.min(Math.max(width, 320), 420);
    return Math.min(Math.max(width, 360), 520);
  }

  function applyResponsiveLayers(world) {
    const mobile = isMobile();
    world
      .pointRadius(mobile ? 0.7 : 0.55)
      .pointAltitude(mobile ? 0.05 : 0.04)
      .labelSize(mobile ? 1.8 : isTablet() ? 1.5 : 1.4)
      .labelDotRadius(mobile ? 0.45 : 0.35)
      .labelAltitude(0.05)
      .ringMaxRadius(mobile ? 4 : 3.2)
      .atmosphereAltitude(mobile ? 0.15 : 0.18)
      .pointOfView({ lat: 10, lng: 55, altitude: mobile ? 2.35 : 2.1 }, 0);
  }

  function disposeInstance(entry) {
    if (!entry) return;
    entry.node.innerHTML = "";
    if (entry.world && typeof entry.world._destructor === "function") {
      entry.world._destructor();
    }
  }

  function initGlobe(container) {
    if (!container || typeof Globe === "undefined") return null;

    const size = getSize(container);
    if (size < 120) return null;

    const world = Globe()(container)
      .width(size)
      .height(size)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl(GLOBE_TEXTURE)
      .bumpImageUrl(BUMP_TEXTURE)
      .showAtmosphere(true)
      .atmosphereColor("#0B2E6D")
      .pointsData(LOCATIONS)
      .pointLat("lat")
      .pointLng("lng")
      .pointColor("color")
      .pointsMerge(false)
      .labelsData(LOCATIONS)
      .labelLat("lat")
      .labelLng("lng")
      .labelText(function (d) {
        return d.name;
      })
      .labelColor(function (d) {
        return d.color;
      })
      .labelResolution(2)
      .ringsData(LOCATIONS)
      .ringLat("lat")
      .ringLng("lng")
      .ringColor(function (d) {
        return d.color;
      })
      .ringPropagationSpeed(1.4)
      .ringRepeatPeriod(1400);

    applyResponsiveLayers(world);

    const controls = world.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = isMobile() ? 0.65 : 0.85;
    controls.enableZoom = false;
    controls.enablePan = false;

    const renderer = world.renderer();
    if (renderer) {
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, isMobile() ? 1.75 : 2)
      );
    }

    container.dataset.earthMounted = "true";
    return world;
  }

  function mountAll() {
    if (typeof Globe === "undefined") return false;

    const nodes = Array.from(document.querySelectorAll("[data-earth-globe]"));
    if (!nodes.length) return false;

    instances.splice(0, instances.length).forEach(disposeInstance);

    nodes.forEach(function (node) {
      node.innerHTML = "";
      node.removeAttribute("data-earth-mounted");
      const world = initGlobe(node);
      if (world) instances.push({ node: node, world: world });
    });

    if (!resizeBound) {
      resizeBound = true;
      let resizeTimer;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          instances.forEach(function (entry) {
            const size = getSize(entry.node);
            entry.world.width(size);
            entry.world.height(size);
            applyResponsiveLayers(entry.world);
            const controls = entry.world.controls();
            if (controls) controls.autoRotateSpeed = isMobile() ? 0.65 : 0.85;
          });
        }, 150);
      });
    }

    return instances.length > 0;
  }

  function scheduleMount(attempt) {
    attempt = attempt || 0;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (mountAll()) return;
        if (attempt < 8) {
          setTimeout(function () {
            scheduleMount(attempt + 1);
          }, attempt < 3 ? 50 : 150);
        }
      });
    });
  }

  window.SwiftWaveGlobe = {
    mount: scheduleMount,
    remount: scheduleMount,
  };

  scheduleMount();
})();
