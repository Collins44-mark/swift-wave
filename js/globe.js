/* Swift Wave — spinning Earth with location markers */
(function () {
  const LOCATIONS = [
    { lat: -6.7924, lng: 39.2083, name: "Tanzania", role: "Headquarters", color: "#D4AF37" },
    { lat: 25.2048, lng: 55.2708, name: "Dubai", role: "Regional Hub", color: "#D4AF37" },
    { lat: 19.076, lng: 72.8777, name: "India", role: "Education Hub", color: "#0B2E6D" },
    { lat: 31.2304, lng: 121.4737, name: "China", role: "Trade Hub", color: "#0B2E6D" },
  ];

  function isMobile() {
    return window.matchMedia("(max-width: 639px)").matches;
  }

  function isTablet() {
    return window.matchMedia("(min-width: 640px) and (max-width: 1023px)").matches;
  }

  function getSize(container) {
    const width = container.clientWidth || container.parentElement?.clientWidth || 320;
    if (isMobile()) return Math.min(width, 340);
    if (isTablet()) return Math.min(width, 420);
    return Math.min(width, 520);
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

  function initGlobe(container) {
    if (!container || typeof Globe === "undefined") return null;

    const size = getSize(container);

    const world = Globe()(container)
      .width(size)
      .height(size)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
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
      .labelText((d) => d.name)
      .labelColor((d) => d.color)
      .labelResolution(2)
      .ringsData(LOCATIONS)
      .ringLat("lat")
      .ringLng("lng")
      .ringColor((d) => d.color)
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile() ? 1.75 : 2));
    }

    return world;
  }

  function mountAll() {
    const nodes = document.querySelectorAll("[data-earth-globe]");
    const instances = [];

    nodes.forEach((node) => {
      node.innerHTML = "";
      const world = initGlobe(node);
      if (world) instances.push({ node, world });
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        instances.forEach(({ node, world }) => {
          const size = getSize(node);
          world.width(size);
          world.height(size);
          applyResponsiveLayers(world);
          const controls = world.controls();
          if (controls) controls.autoRotateSpeed = isMobile() ? 0.65 : 0.85;
        });
      }, 150);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})();
