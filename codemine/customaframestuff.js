AFRAME.registerComponent('rounded', {
  schema: {
    enabled: { default: true },
    width: { type: 'number', default: 1 },
    height: { type: 'number', default: 1 },
    radius: { type: 'number', default: 0.3 },
    topLeftRadius: { type: 'number', default: -1 },
    topRightRadius: { type: 'number', default: -1 },
    bottomLeftRadius: { type: 'number', default: -1 },
    bottomRightRadius: { type: 'number', default: -1 },
    color: { type: 'color', default: "#F0F0F0" },
    opacity: { type: 'number', default: 1 }
  },
  init: function () {
    this.rounded = new THREE.Mesh(this.draw(), new THREE.MeshPhongMaterial({ color: new THREE.Color(this.data.color), side: THREE.DoubleSide }));
    this.updateOpacity();
    this.el.setObject3D('mesh', this.rounded)
  },
  update: function () {
    if (this.data.enabled) {
      if (this.rounded) {
        this.rounded.visible = true;
        this.rounded.geometry = this.draw();
        this.rounded.material.color = new THREE.Color(this.data.color);
        this.updateOpacity();
      }
    } else {
      this.rounded.visible = false;
    }
  },
  updateOpacity: function () {
    if (this.data.opacity < 0) { this.data.opacity = 0; }
    if (this.data.opacity > 1) { this.data.opacity = 1; }
    if (this.data.opacity < 1) {
      this.rounded.material.transparent = true;
    } else {
      this.rounded.material.transparent = false;
    }
    this.rounded.material.opacity = this.data.opacity;
  },
  tick: function () { },
  remove: function () {
    if (!this.rounded) { return; }
    this.el.object3D.remove(this.rounded);
    this.rounded = null;
  },
  draw: function () {
    var roundedRectShape = new THREE.Shape();
    function roundedRect(ctx, x, y, width, height, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius) {
      if (!topLeftRadius) { topLeftRadius = 0.00001; }
      if (!topRightRadius) { topRightRadius = 0.00001; }
      if (!bottomLeftRadius) { bottomLeftRadius = 0.00001; }
      if (!bottomRightRadius) { bottomRightRadius = 0.00001; }
      ctx.moveTo(x, y + topLeftRadius);
      ctx.lineTo(x, y + height - topLeftRadius);
      ctx.quadraticCurveTo(x, y + height, x + topLeftRadius, y + height);
      ctx.lineTo(x + width - topRightRadius, y + height);
      ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - topRightRadius);
      ctx.lineTo(x + width, y + bottomRightRadius);
      ctx.quadraticCurveTo(x + width, y, x + width - bottomRightRadius, y);
      ctx.lineTo(x + bottomLeftRadius, y);
      ctx.quadraticCurveTo(x, y, x, y + bottomLeftRadius);
    }

    var corners = [this.data.radius, this.data.radius, this.data.radius, this.data.radius];
    if (this.data.topLeftRadius != -1) { corners[0] = this.data.topLeftRadius; }
    if (this.data.topRightRadius != -1) { corners[1] = this.data.topRightRadius; }
    if (this.data.bottomLeftRadius != -1) { corners[2] = this.data.bottomLeftRadius; }
    if (this.data.bottomRightRadius != -1) { corners[3] = this.data.bottomRightRadius; }

    // fixed position
    // instead of x = 0 and y = 0
    // used x = -this.data.width / 2 and y = -this.data.height / 2 
    roundedRect(roundedRectShape, -this.data.width / 2, -this.data.height / 2, this.data.width, this.data.height, corners[0], corners[1], corners[2], corners[3]);
    return new THREE.ShapeBufferGeometry(roundedRectShape);
  },
  pause: function () { },
  play: function () { }
});

AFRAME.registerPrimitive('a-rounded', {
  defaultComponents: {
    rounded: {}
  },
  mappings: {
    enabled: 'rounded.enabled',
    width: 'rounded.width',
    height: 'rounded.height',
    radius: 'rounded.radius',
    'top-left-radius': 'rounded.topLeftRadius',
    'top-right-radius': 'rounded.topRightRadius',
    'bottom-left-radius': 'rounded.bottomLeftRadius',
    'bottom-right-radius': 'rounded.bottomRightRadius',
    color: 'rounded.color',
    opacity: 'rounded.opacity'
  }
});

AFRAME.registerComponent('spin-on-mouseenter', {
  schema: {
    isspinning: { default: false },
  },
  init: function () {
    var self = this;

    this.el.addEventListener('mouseenter', () => {
      if (self.data.isspinning) {
        return;
      }

      var rx = THREE.Math.radToDeg(self.el.object3D.rotation.x);
      var ry = THREE.Math.radToDeg(self.el.object3D.rotation.y);
      var rz = THREE.Math.radToDeg(self.el.object3D.rotation.z);

      var axis = _.sample(['x', 'y', 'z']);
      if (axis === 'x') {
        rx += 360;
      } else if (axis === 'y') {
        ry += 360;
      } else if (axis === 'z') {
        rz += 360;
      }

      self.data.isspinning = true;
      self.el.setAttribute('animation__spin', `property: rotation; dur: 500; easing: easeInOutQuad; to: ${rx} ${ry} ${rz}`);
      setTimeout(() => {
        self.data.isspinning = false;
      }, 500);
    });
  }
});

AFRAME.registerComponent('custom-snooze', {
  schema: {},

  init: function () {
    var thescene = this.el;

    var scenerunning = true;
    var scenelastmove = Date.now();
    const SCENESTANDBY = 3000;
    const CUSHION = 5000;

    function ping() {
      scenelastmove = Date.now();
      if (!scenerunning) {
        scenerunning = true;
        thescene.render();
      }
    }
    var throttledping = _.throttle(ping, 1000);

    // how to turn on
    window.addEventListener("mousemove", throttledping, false);
    window.addEventListener("keydown", throttledping, false);
    window.addEventListener("touchstart", throttledping, false);
    window.addEventListener("stayinalive", throttledping, false);
    window.addEventListener("wheel", throttledping, false);
    // window.addEventListener("click", throttledping, false);
    // window.addEventListener("orientationchange", throttledping, false);
    // window.addEventListener("pointerlockchange", throttledping, false);
    // window.addEventListener("raycaster-intersection", throttledping, false);

    // how to snooze rendering
    setTimeout(() => {
      setInterval(() => {
        if (scenerunning && scenelastmove + SCENESTANDBY < Date.now()) {
          scenerunning = false;
          thescene.renderer.animate(null);
        }
      }, 1000);
    }, CUSHION);
  }
});

AFRAME.registerComponent('custom-shadows', {
  schema: {},

  init: function () {
    var thescene = this.el;
    // every few sec recalc shadows
    const SHADOWSTANDBY = 1000;
    var intervalID = setInterval(() => {
      thescene.renderer.shadowMap.needsUpdate = true;
    }, SHADOWSTANDBY);
  }

});
