(function (h, e) {
    "object" === typeof exports && "undefined" !== typeof module
      ? e(exports, require("three"))
      : "function" === typeof define && define.amd
      ? define(["exports", "three"], e)
      : ((h = h || self), e((h.PANOLENS = {}), h.THREE));
  })(this, function (h, e) {
    function S(a) {
      this.constraints = Object.assign(
        {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: { exact: "environment" },
          },
          audio: !1,
        },
        a
      );
      this.element = this.scene = this.container = null;
      this.devices = [];
      this.stream = null;
      this.ratioScalar = 1;
      this.videoDeviceIndex = 0;
    }
    function M(a, b, c) {
      a = void 0 === a ? 16777215 : a;
      b = void 0 === b ? !0 : b;
      c = void 0 === c ? 1500 : c;
      this.dpr = window.devicePixelRatio;
      var d = this.createCanvas(),
        g = d.canvas;
      d = d.context;
      var k = new e.SpriteMaterial({
        color: a,
        map: this.createCanvasTexture(g),
      });
      e.Sprite.call(this, k);
      this.canvasWidth = g.width;
      this.canvasHeight = g.height;
      this.context = d;
      this.color = a instanceof e.Color ? a : new e.Color(a);
      this.autoSelect = b;
      this.dwellTime = c;
      this.rippleDuration = 500;
      this.position.z = -10;
      this.center.set(0.5, 0.5);
      this.scale.set(0.5, 0.5, 1);
      this.callback = this.timerId = this.startTimestamp = null;
      this.frustumCulled = !1;
      this.updateCanvasArcByProgress(0);
    }
    function z(a, b, c) {
      a = void 0 === a ? 300 : a;
      b = b || u.Info;
      e.Sprite.call(this);
      this.type = "infospot";
      this.animated = void 0 !== c ? c : !0;
      this.frustumCulled = this.isHovering = !1;
      this.cursorStyle = this.toPanorama = this.element = null;
      this.mode = t.NORMAL;
      this.scale.set(a, a, 1);
      this.rotation.y = Math.PI;
      this.container = null;
      this.originalRaycast = this.raycast;
      this.HANDLER_FOCUS = null;
      this.material.side = e.DoubleSide;
      this.material.depthTest = !1;
      this.material.transparent = !0;
      this.material.opacity = 0;
      this.scaleUpAnimation = new r.Tween();
      this.scaleDownAnimation = new r.Tween();
      c = function (d) {
        if (this.material) {
          var b = d.image.width / d.image.height,
            c = new e.Vector3();
          d.image.width = d.image.naturalWidth || 64;
          d.image.height = d.image.naturalHeight || 64;
          this.scale.set(b * a, a, 1);
          c.copy(this.scale);
          this.scaleUpAnimation = new r.Tween(this.scale)
            .to({ x: 1.3 * c.x, y: 1.3 * c.y }, 500)
            .easing(r.Easing.Elastic.Out);
          this.scaleDownAnimation = new r.Tween(this.scale)
            .to({ x: c.x, y: c.y }, 500)
            .easing(r.Easing.Elastic.Out);
          this.material.map = d;
          this.material.needsUpdate = !0;
        }
      }.bind(this);
      this.showAnimation = new r.Tween(this.material)
        .to({ opacity: 1 }, 500)
        .onStart(this.enableRaycast.bind(this, !0))
        .easing(r.Easing.Quartic.Out);
      this.hideAnimation = new r.Tween(this.material)
        .to({ opacity: 0 }, 500)
        .onStart(this.enableRaycast.bind(this, !1))
        .easing(r.Easing.Quartic.Out);
      this.addEventListener("click", this.onClick);
      this.addEventListener("hover", this.onHover);
      this.addEventListener("hoverenter", this.onHoverStart);
      this.addEventListener("hoverleave", this.onHoverEnd);
      this.addEventListener("panolens-dual-eye-effect", this.onDualEyeEffect);
      this.addEventListener("panolens-container", this.setContainer.bind(this));
      this.addEventListener("dismiss", this.onDismiss);
      this.addEventListener("panolens-infospot-focus", this.setFocusMethod);
      N.load(b, c);
    }
    function I(a) {
      a || console.warn("PANOLENS.Widget: No container specified");
      e.EventDispatcher.call(this);
      this.DEFAULT_TRANSITION = "all 0.27s ease";
      this.TOUCH_ENABLED = !!(
        "ontouchstart" in window ||
        (window.DocumentTouch && document instanceof DocumentTouch)
      );
      this.PREVENT_EVENT_HANDLER = function (a) {
        a.preventDefault();
        a.stopPropagation();
      };
      this.container = a;
      this.mask =
        this.activeSubMenu =
        this.activeMainItem =
        this.mainMenu =
        this.settingElement =
        this.videoElement =
        this.fullscreenElement =
        this.barElement =
          null;
    }
    function n(a, b) {
      e.Mesh.call(this, a, b);
      this.type = "panorama";
      this.ImageQualityLow = 1;
      this.ImageQualityFair = 2;
      this.ImageQualityMedium = 3;
      this.ImageQualityHigh = 4;
      this.ImageQualitySuperHigh = 5;
      this.animationDuration = 1e3;
      this.defaultInfospotSize = 350;
      this.container = void 0;
      this.loaded = !1;
      this.linkedSpots = [];
      this.isInfospotVisible = !1;
      this.linkingImageScale = this.linkingImageURL = void 0;
      this.material.side = e.BackSide;
      this.material.opacity = 0;
      this.scale.x *= -1;
      this.renderOrder = -1;
      this.active = !1;
      this.infospotAnimation = new r.Tween(this).to(
        {},
        this.animationDuration / 2
      );
      this.addEventListener("load", this.fadeIn.bind(this));
      this.addEventListener("panolens-container", this.setContainer.bind(this));
      this.addEventListener("click", this.onClick.bind(this));
      this.setupTransitions();
    }
    function y(a, b, c) {
      b = b || new e.SphereBufferGeometry(5e3, 60, 40);
      c = c || new e.MeshBasicMaterial({ opacity: 0, transparent: !0 });
      n.call(this, b, c);
      this.src = a;
      this.radius = 5e3;
    }
    function W() {
      var a = new e.BufferGeometry(),
        b = new e.MeshBasicMaterial({ color: 0, opacity: 0, transparent: !0 });
      a.addAttribute("position", new e.BufferAttribute(new Float32Array(), 1));
      n.call(this, a, b);
    }
    function F(a) {
      a = void 0 === a ? [] : a;
      var b = Object.assign({}, e.ShaderLib.cube),
        c = new e.BoxBufferGeometry(1e4, 1e4, 1e4);
      b = new e.ShaderMaterial({
        fragmentShader: b.fragmentShader,
        vertexShader: b.vertexShader,
        uniforms: b.uniforms,
        side: e.BackSide,
        transparent: !0,
      });
      n.call(this, c, b);
      this.images = a;
      this.edgeLength = 1e4;
      this.material.uniforms.opacity.value = 0;
    }
    function O() {
      for (var a = [], b = 0; 6 > b; b++) a.push(u.WhiteTile);
      F.call(this, a);
    }
    function B(a, b) {
      b = void 0 === b ? {} : b;
      var c = new e.SphereBufferGeometry(5e3, 60, 40),
        d = new e.MeshBasicMaterial({ opacity: 0, transparent: !0 });
      n.call(this, c, d);
      this.src = a;
      this.options = {
        videoElement: document.createElement("video"),
        loop: !0,
        muted: !0,
        autoplay: !1,
        playsinline: !0,
        crossOrigin: "anonymous",
      };
      Object.assign(this.options, b);
      this.videoElement = this.options.videoElement;
      this.videoProgress = 0;
      this.radius = 5e3;
      this.addEventListener("leave", this.pauseVideo.bind(this));
      this.addEventListener(
        "enter-fade-start",
        this.resumeVideoProgress.bind(this)
      );
      this.addEventListener("video-toggle", this.toggleVideo.bind(this));
      this.addEventListener("video-time", this.setVideoCurrentTime.bind(this));
    }
    function P(a) {
      this._parameters = a = void 0 === a ? {} : a;
      this._panoId = this._zoom = null;
      this._panoClient = new google.maps.StreetViewService();
      this._total = this._count = 0;
      this._canvas = [];
      this._ctx = [];
      this._hc = this._wc = 0;
      this.result = null;
      this.rotation = 0;
      this.copyright = "";
      this.onPanoramaLoad = this.onSizeChange = null;
      this.levelsW = [1, 2, 4, 7, 13, 26];
      this.levelsH = [1, 1, 2, 4, 7, 13];
      this.widths = [416, 832, 1664, 3328, 6656, 13312];
      this.heights = [416, 416, 832, 1664, 3328, 6656];
      this.maxH = this.maxW = 6656;
      var b;
      try {
        var c = document.createElement("canvas");
        (b = c.getContext("experimental-webgl")) || (b = c.getContext("webgl"));
      } catch (d) {}
      this.maxW = Math.max(b.getParameter(b.MAX_TEXTURE_SIZE), this.maxW);
      this.maxH = Math.max(b.getParameter(b.MAX_TEXTURE_SIZE), this.maxH);
    }
    function Z(a, b) {
      y.call(this);
      this.panoId = a;
      this.gsvLoader = null;
      this.loadRequested = !1;
      this.setupGoogleMapAPI(b);
    }
    function C(a, b, c, d) {
      c = void 0 === c ? 1e4 : c;
      d = void 0 === d ? 0.5 : d;
      "image" === (void 0 === a ? "image" : a) &&
        y.call(this, b, this.createGeometry(c, d), this.createMaterial(c));
      this.size = c;
      this.ratio = d;
      this.EPS = 1e-6;
      this.frameId = null;
      this.dragging = !1;
      this.userMouse = new e.Vector2();
      this.quatA = new e.Quaternion();
      this.quatB = new e.Quaternion();
      this.quatCur = new e.Quaternion();
      this.quatSlerp = new e.Quaternion();
      this.vectorX = new e.Vector3(1, 0, 0);
      this.vectorY = new e.Vector3(0, 1, 0);
      this.addEventListener("window-resize", this.onWindowResize);
    }
    function aa(a, b, c) {
      C.call(this, "image", a, b, c);
    }
    function J(a) {
      var b = new e.SphereBufferGeometry(5e3, 60, 40),
        c = new e.MeshBasicMaterial({ visible: !1 });
      n.call(this, b, c);
      this.media = new S(a);
      this.radius = 5e3;
      this.addEventListener("enter", this.start.bind(this));
      this.addEventListener("leave", this.stop.bind(this));
      this.addEventListener(
        "panolens-container",
        this.onPanolensContainer.bind(this)
      );
      this.addEventListener("panolens-scene", this.onPanolensScene.bind(this));
    }
    function ba(a, b) {
      function c(a) {
        Q = !1;
        K = L = 0;
        if (!1 !== f.enabled) {
          a.preventDefault();
          if (a.button === f.mouseButtons.ORBIT) {
            if (!0 === f.noRotate) return;
            x = w.ROTATE;
            D.set(a.clientX, a.clientY);
          } else if (a.button === f.mouseButtons.ZOOM) {
            if (!0 === f.noZoom) return;
            x = w.DOLLY;
            y.set(a.clientX, a.clientY);
          } else if (a.button === f.mouseButtons.PAN) {
            if (!0 === f.noPan) return;
            x = w.PAN;
            n.set(a.clientX, a.clientY);
          }
          x !== w.NONE &&
            (document.addEventListener("mousemove", d, !1),
            document.addEventListener("mouseup", g, !1),
            f.dispatchEvent(O));
          f.update();
        }
      }
      function d(a) {
        if (!1 !== f.enabled) {
          a.preventDefault();
          var d = f.domElement === document ? f.domElement.body : f.domElement;
          if (x === w.ROTATE) {
            if (!0 === f.noRotate) return;
            h.set(a.clientX, a.clientY);
            r.subVectors(h, D);
            f.rotateLeft(((2 * Math.PI * r.x) / d.clientWidth) * f.rotateSpeed);
            f.rotateUp(((2 * Math.PI * r.y) / d.clientHeight) * f.rotateSpeed);
            D.copy(h);
            G && ((K = a.clientX - G.clientX), (L = a.clientY - G.clientY));
            G = a;
          } else if (x === w.DOLLY) {
            if (!0 === f.noZoom) return;
            z.set(a.clientX, a.clientY);
            T.subVectors(z, y);
            0 < T.y ? f.dollyIn() : 0 > T.y && f.dollyOut();
            y.copy(z);
          } else if (x === w.PAN) {
            if (!0 === f.noPan) return;
            U.set(a.clientX, a.clientY);
            t.subVectors(U, n);
            f.pan(t.x, t.y);
            n.copy(U);
          }
          x !== w.NONE && f.update();
        }
      }
      function g() {
        Q = !0;
        G = void 0;
        !1 !== f.enabled &&
          (document.removeEventListener("mousemove", d, !1),
          document.removeEventListener("mouseup", g, !1),
          f.dispatchEvent(P),
          (x = w.NONE));
      }
      function k(a) {
        if (!1 !== f.enabled && !0 !== f.noZoom && x === w.NONE) {
          a.preventDefault();
          a.stopPropagation();
          var d = 0;
          void 0 !== a.wheelDelta
            ? (d = a.wheelDelta)
            : void 0 !== a.detail && (d = -a.detail);
          0 < d
            ? ((f.object.fov =
                f.object.fov < f.maxFov ? f.object.fov + 1 : f.maxFov),
              f.object.updateProjectionMatrix())
            : 0 > d &&
              ((f.object.fov =
                f.object.fov > f.minFov ? f.object.fov - 1 : f.minFov),
              f.object.updateProjectionMatrix());
          f.update();
          f.dispatchEvent(V);
          f.dispatchEvent(O);
          f.dispatchEvent(P);
        }
      }
      function p(a) {
        switch (a.keyCode) {
          case f.keys.UP:
            I = !1;
            break;
          case f.keys.BOTTOM:
            J = !1;
            break;
          case f.keys.LEFT:
            X = !1;
            break;
          case f.keys.RIGHT:
            Y = !1;
        }
      }
      function m(a) {
        if (!1 !== f.enabled && !0 !== f.noKeys && !0 !== f.noRotate) {
          switch (a.keyCode) {
            case f.keys.UP:
              I = !0;
              break;
            case f.keys.BOTTOM:
              J = !0;
              break;
            case f.keys.LEFT:
              X = !0;
              break;
            case f.keys.RIGHT:
              Y = !0;
          }
          if (I || J || X || Y)
            (Q = !0),
              I && (L = -f.rotateSpeed * f.momentumKeydownFactor),
              J && (L = f.rotateSpeed * f.momentumKeydownFactor),
              X && (K = -f.rotateSpeed * f.momentumKeydownFactor),
              Y && (K = f.rotateSpeed * f.momentumKeydownFactor);
        }
      }
      function l(a) {
        Q = !1;
        K = L = 0;
        if (!1 !== f.enabled) {
          switch (a.touches.length) {
            case 1:
              if (!0 === f.noRotate) return;
              x = w.TOUCH_ROTATE;
              D.set(a.touches[0].pageX, a.touches[0].pageY);
              break;
            case 2:
              if (!0 === f.noZoom) return;
              x = w.TOUCH_DOLLY;
              var d = a.touches[0].pageX - a.touches[1].pageX;
              a = a.touches[0].pageY - a.touches[1].pageY;
              y.set(0, Math.sqrt(d * d + a * a));
              break;
            case 3:
              if (!0 === f.noPan) return;
              x = w.TOUCH_PAN;
              n.set(a.touches[0].pageX, a.touches[0].pageY);
              break;
            default:
              x = w.NONE;
          }
          x !== w.NONE && f.dispatchEvent(O);
        }
      }
      function v(a) {
        if (!1 !== f.enabled) {
          a.preventDefault();
          a.stopPropagation();
          var d = f.domElement === document ? f.domElement.body : f.domElement;
          switch (a.touches.length) {
            case 1:
              if (!0 === f.noRotate) break;
              if (x !== w.TOUCH_ROTATE) break;
              h.set(a.touches[0].pageX, a.touches[0].pageY);
              r.subVectors(h, D);
              f.rotateLeft(((2 * Math.PI * r.x) / d.clientWidth) * f.rotateSpeed);
              f.rotateUp(((2 * Math.PI * r.y) / d.clientHeight) * f.rotateSpeed);
              D.copy(h);
              G &&
                ((K = a.touches[0].pageX - G.pageX),
                (L = a.touches[0].pageY - G.pageY));
              G = { pageX: a.touches[0].pageX, pageY: a.touches[0].pageY };
              f.update();
              break;
            case 2:
              if (!0 === f.noZoom) break;
              if (x !== w.TOUCH_DOLLY) break;
              d = a.touches[0].pageX - a.touches[1].pageX;
              a = a.touches[0].pageY - a.touches[1].pageY;
              z.set(0, Math.sqrt(d * d + a * a));
              T.subVectors(z, y);
              0 > T.y
                ? ((f.object.fov =
                    f.object.fov < f.maxFov ? f.object.fov + 1 : f.maxFov),
                  f.object.updateProjectionMatrix())
                : 0 < T.y &&
                  ((f.object.fov =
                    f.object.fov > f.minFov ? f.object.fov - 1 : f.minFov),
                  f.object.updateProjectionMatrix());
              y.copy(z);
              f.update();
              f.dispatchEvent(V);
              break;
            case 3:
              if (!0 === f.noPan) break;
              if (x !== w.TOUCH_PAN) break;
              U.set(a.touches[0].pageX, a.touches[0].pageY);
              t.subVectors(U, n);
              f.pan(t.x, t.y);
              n.copy(U);
              f.update();
              break;
            default:
              x = w.NONE;
          }
        }
      }
      function q() {
        Q = !0;
        G = void 0;
        !1 !== f.enabled && (f.dispatchEvent(P), (x = w.NONE));
      }
      this.object = a;
      this.domElement = void 0 !== b ? b : document;
      this.frameId = null;
      this.enabled = !0;
      this.center = this.target = new e.Vector3();
      this.noZoom = !1;
      this.zoomSpeed = 1;
      this.minDistance = 0;
      this.maxDistance = Infinity;
      this.minZoom = 0;
      this.maxZoom = Infinity;
      this.noRotate = !1;
      this.rotateSpeed = -0.15;
      this.noPan = !0;
      this.keyPanSpeed = 7;
      this.autoRotate = !1;
      this.autoRotateSpeed = 2;
      this.minPolarAngle = 0;
      this.maxPolarAngle = Math.PI;
      this.momentumDampingFactor = 0.9;
      this.momentumScalingFactor = -0.005;
      this.momentumKeydownFactor = 20;
      this.minFov = 30;
      this.maxFov = 120;
      this.minAzimuthAngle = -Infinity;
      this.maxAzimuthAngle = Infinity;
      this.noKeys = !1;
      this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
      this.mouseButtons = {
        ORBIT: e.MOUSE.LEFT,
        ZOOM: e.MOUSE.MIDDLE,
        PAN: e.MOUSE.RIGHT,
      };
      var f = this,
        D = new e.Vector2(),
        h = new e.Vector2(),
        r = new e.Vector2(),
        n = new e.Vector2(),
        U = new e.Vector2(),
        t = new e.Vector2(),
        u = new e.Vector3(),
        A = new e.Vector3(),
        y = new e.Vector2(),
        z = new e.Vector2(),
        T = new e.Vector2(),
        R = 0,
        H = 0,
        B = 0,
        C = 0,
        E = 1,
        F = new e.Vector3(),
        M = new e.Vector3(),
        N = new e.Quaternion(),
        K = 0,
        L = 0,
        G,
        Q = !1,
        I,
        J,
        X,
        Y,
        w = {
          NONE: -1,
          ROTATE: 0,
          DOLLY: 1,
          PAN: 2,
          TOUCH_ROTATE: 3,
          TOUCH_DOLLY: 4,
          TOUCH_PAN: 5,
        },
        x = w.NONE;
      this.target0 = this.target.clone();
      this.position0 = this.object.position.clone();
      this.zoom0 = this.object.zoom;
      var S = new e.Quaternion().setFromUnitVectors(a.up, new e.Vector3(0, 1, 0)),
        W = S.clone().inverse(),
        V = { type: "change" },
        O = { type: "start" },
        P = { type: "end" };
      this.setLastQuaternion = function (a) {
        N.copy(a);
        f.object.quaternion.copy(a);
      };
      this.getLastPosition = function () {
        return M;
      };
      this.rotateLeft = function (a) {
        void 0 === a && (a = ((2 * Math.PI) / 60 / 60) * f.autoRotateSpeed);
        C -= a;
      };
      this.rotateUp = function (a) {
        void 0 === a && (a = ((2 * Math.PI) / 60 / 60) * f.autoRotateSpeed);
        B -= a;
      };
      this.panLeft = function (a) {
        var d = this.object.matrix.elements;
        u.set(d[0], d[1], d[2]);
        u.multiplyScalar(-a);
        F.add(u);
      };
      this.panUp = function (a) {
        var d = this.object.matrix.elements;
        u.set(d[4], d[5], d[6]);
        u.multiplyScalar(a);
        F.add(u);
      };
      this.pan = function (a, d) {
        var b = f.domElement === document ? f.domElement.body : f.domElement;
        if (f.object instanceof e.PerspectiveCamera) {
          var c = f.object.position.clone().sub(f.target).length();
          c *= Math.tan(((f.object.fov / 2) * Math.PI) / 180);
          f.panLeft((2 * a * c) / b.clientHeight);
          f.panUp((2 * d * c) / b.clientHeight);
        } else
          f.object instanceof e.OrthographicCamera
            ? (f.panLeft((a * (f.object.right - f.object.left)) / b.clientWidth),
              f.panUp((d * (f.object.top - f.object.bottom)) / b.clientHeight))
            : console.warn(
                "WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."
              );
      };
      this.momentum = function () {
        Q &&
          (1e-4 > Math.abs(K) && 1e-4 > Math.abs(L)
            ? (Q = !1)
            : ((L *= this.momentumDampingFactor),
              (K *= this.momentumDampingFactor),
              (C -= this.momentumScalingFactor * K),
              (B -= this.momentumScalingFactor * L)));
      };
      this.dollyIn = function (a) {
        void 0 === a && (a = Math.pow(0.95, f.zoomSpeed));
        f.object instanceof e.PerspectiveCamera
          ? (E /= a)
          : f.object instanceof e.OrthographicCamera
          ? ((f.object.zoom = Math.max(
              this.minZoom,
              Math.min(this.maxZoom, this.object.zoom * a)
            )),
            f.object.updateProjectionMatrix(),
            f.dispatchEvent(V))
          : console.warn(
              "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
            );
      };
      this.dollyOut = function (a) {
        void 0 === a && (a = Math.pow(0.95, f.zoomSpeed));
        f.object instanceof e.PerspectiveCamera
          ? (E *= a)
          : f.object instanceof e.OrthographicCamera
          ? ((f.object.zoom = Math.max(
              this.minZoom,
              Math.min(this.maxZoom, this.object.zoom / a)
            )),
            f.object.updateProjectionMatrix(),
            f.dispatchEvent(V))
          : console.warn(
              "WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."
            );
      };
      this.update = function (a) {
        var d = this.object.position;
        A.copy(d).sub(this.target);
        A.applyQuaternion(S);
        R = Math.atan2(A.x, A.z);
        H = Math.atan2(Math.sqrt(A.x * A.x + A.z * A.z), A.y);
        this.autoRotate &&
          x === w.NONE &&
          this.rotateLeft(((2 * Math.PI) / 60 / 60) * f.autoRotateSpeed);
        this.momentum();
        R += C;
        H += B;
        R = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, R));
        H = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, H));
        H = Math.max(1e-7, Math.min(Math.PI - 1e-7, H));
        var b = A.length() * E;
        b = Math.max(this.minDistance, Math.min(this.maxDistance, b));
        this.target.add(F);
        A.x = b * Math.sin(H) * Math.sin(R);
        A.y = b * Math.cos(H);
        A.z = b * Math.sin(H) * Math.cos(R);
        A.applyQuaternion(W);
        d.copy(this.target).add(A);
        this.object.lookAt(this.target);
        B = C = 0;
        E = 1;
        F.set(0, 0, 0);
        if (
          1e-7 < M.distanceToSquared(this.object.position) ||
          1e-7 < 8 * (1 - N.dot(this.object.quaternion))
        )
          !0 !== a && this.dispatchEvent(V),
            M.copy(this.object.position),
            N.copy(this.object.quaternion);
      };
      this.reset = function () {
        x = w.NONE;
        this.target.copy(this.target0);
        this.object.position.copy(this.position0);
        this.object.zoom = this.zoom0;
        this.object.updateProjectionMatrix();
        this.dispatchEvent(V);
        this.update();
      };
      this.getPolarAngle = function () {
        return H;
      };
      this.getAzimuthalAngle = function () {
        return R;
      };
      this.dispose = function () {
        this.domElement.removeEventListener("mousedown", c);
        this.domElement.removeEventListener("mousewheel", k);
        this.domElement.removeEventListener("DOMMouseScroll", k);
        this.domElement.removeEventListener("touchstart", l);
        this.domElement.removeEventListener("touchend", q);
        this.domElement.removeEventListener("touchmove", v);
        window.removeEventListener("keyup", p);
        window.removeEventListener("keydown", m);
      };
      this.domElement.addEventListener("mousedown", c, { passive: !1 });
      this.domElement.addEventListener("mousewheel", k, { passive: !1 });
      this.domElement.addEventListener("DOMMouseScroll", k, { passive: !1 });
      this.domElement.addEventListener("touchstart", l, { passive: !1 });
      this.domElement.addEventListener("touchend", q, { passive: !1 });
      this.domElement.addEventListener("touchmove", v, { passive: !1 });
      window.addEventListener("keyup", p, { passive: !1 });
      window.addEventListener("keydown", m, { passive: !1 });
      this.update();
    }
    function ca(a, b) {
      var c = this,
        d = { type: "change" },
        g = 0,
        k = 0,
        p = 0,
        m = 0;
      this.camera = a;
      this.camera.rotation.reorder("YXZ");
      this.domElement = void 0 !== b ? b : document;
      this.enabled = !0;
      this.deviceOrientation = {};
      this.alphaOffsetAngle = this.alpha = this.screenOrientation = 0;
      var l = function (a) {
          c.deviceOrientation = a;
        },
        v = function () {
          c.screenOrientation = window.orientation || 0;
        },
        q = function (a) {
          a.preventDefault();
          a.stopPropagation();
          p = a.touches[0].pageX;
          m = a.touches[0].pageY;
        },
        f = function (a) {
          a.preventDefault();
          a.stopPropagation();
          g += e.Math.degToRad((a.touches[0].pageX - p) / 4);
          k += e.Math.degToRad((m - a.touches[0].pageY) / 4);
          c.updateAlphaOffsetAngle(g);
          p = a.touches[0].pageX;
          m = a.touches[0].pageY;
        };
      this.connect = function () {
        v();
        window.addEventListener("orientationchange", v, { passive: !0 });
        window.addEventListener("deviceorientation", l, { passive: !0 });
        window.addEventListener("deviceorientation", this.update.bind(this), {
          passive: !0,
        });
        c.domElement.addEventListener("touchstart", q, { passive: !1 });
        c.domElement.addEventListener("touchmove", f, { passive: !1 });
        c.enabled = !0;
      };
      this.disconnect = function () {
        window.removeEventListener("orientationchange", v, !1);
        window.removeEventListener("deviceorientation", l, !1);
        window.removeEventListener(
          "deviceorientation",
          this.update.bind(this),
          !1
        );
        c.domElement.removeEventListener("touchstart", q, !1);
        c.domElement.removeEventListener("touchmove", f, !1);
        c.enabled = !1;
      };
      this.update = function (a) {
        if (!1 !== c.enabled) {
          var b = c.deviceOrientation.alpha
              ? e.Math.degToRad(c.deviceOrientation.alpha) + c.alphaOffsetAngle
              : 0,
            g = c.deviceOrientation.beta
              ? e.Math.degToRad(c.deviceOrientation.beta)
              : 0,
            f = c.deviceOrientation.gamma
              ? e.Math.degToRad(c.deviceOrientation.gamma)
              : 0,
            p = c.screenOrientation ? e.Math.degToRad(c.screenOrientation) : 0,
            m = c.camera.quaternion,
            l = new e.Vector3(0, 0, 1),
            D = new e.Euler(),
            q = new e.Quaternion(),
            v = new e.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)),
            h = new e.Quaternion(),
            r = new e.Quaternion();
          if (0 == c.screenOrientation) {
            var n = new e.Vector3(1, 0, 0);
            h.setFromAxisAngle(n, -k);
          } else
            180 == c.screenOrientation
              ? ((n = new e.Vector3(1, 0, 0)), h.setFromAxisAngle(n, k))
              : 90 == c.screenOrientation
              ? ((n = new e.Vector3(0, 1, 0)), h.setFromAxisAngle(n, k))
              : -90 == c.screenOrientation &&
                ((n = new e.Vector3(0, 1, 0)), h.setFromAxisAngle(n, -k));
          v.multiply(h);
          v.multiply(r);
          D.set(g, b, -f, "YXZ");
          m.setFromEuler(D);
          m.multiply(v);
          m.multiply(q.setFromAxisAngle(l, -p));
          c.alpha = b;
          !0 !== a && c.dispatchEvent(d);
        }
      };
      this.updateAlphaOffsetAngle = function (a) {
        this.alphaOffsetAngle = a;
        this.update();
      };
      this.dispose = function () {
        this.disconnect();
      };
      this.connect();
    }
    function ha(a) {
      var b = new e.OrthographicCamera(-1, 1, 1, -1, 0, 1),
        c = new e.Scene(),
        d = new e.StereoCamera();
      d.aspect = 0.5;
      var g = new e.WebGLRenderTarget(512, 512, {
        minFilter: e.LinearFilter,
        magFilter: e.NearestFilter,
        format: e.RGBAFormat,
      });
      g.scissorTest = !0;
      g.texture.generateMipmaps = !1;
      var k = new e.Vector2(0.441, 0.156),
        p = new e.PlaneBufferGeometry(1, 1, 10, 20)
          .removeAttribute("normal")
          .toNonIndexed(),
        m = p.attributes.position.array,
        l = p.attributes.uv.array;
      p.attributes.position.count *= 2;
      p.attributes.uv.count *= 2;
      var v = new Float32Array(2 * m.length);
      v.set(m);
      v.set(m, m.length);
      var q = new Float32Array(2 * l.length);
      q.set(l);
      q.set(l, l.length);
      l = new e.Vector2();
      m = m.length / 3;
      for (var f = 0, D = v.length / 3; f < D; f++) {
        l.x = v[3 * f];
        l.y = v[3 * f + 1];
        var h = l.dot(l);
        h = 1.5 + (k.x + k.y * h) * h;
        var n = f < m ? 0 : 1;
        v[3 * f] = (l.x / h) * 1.5 - 0.5 + n;
        v[3 * f + 1] = (l.y / h) * 3;
        q[2 * f] = 0.5 * (q[2 * f] + n);
      }
      p.attributes.position.array = v;
      p.attributes.uv.array = q;
      k = new e.MeshBasicMaterial({ map: g.texture });
      p = new e.Mesh(p, k);
      c.add(p);
      this.setSize = function (d, b) {
        a.setSize(d, b);
        var c = a.getPixelRatio();
        g.setSize(d * c, b * c);
      };
      this.render = function (k, f) {
        k.updateMatrixWorld();
        null === f.parent && f.updateMatrixWorld();
        d.update(f);
        f = g.width / 2;
        var e = g.height;
        a.autoClear && a.clear();
        g.scissor.set(0, 0, f, e);
        g.viewport.set(0, 0, f, e);
        a.setRenderTarget(g);
        a.render(k, d.cameraL);
        a.clearDepth();
        g.scissor.set(f, 0, f, e);
        g.viewport.set(f, 0, f, e);
        a.setRenderTarget(g);
        a.render(k, d.cameraR);
        a.clearDepth();
        a.setRenderTarget(null);
        a.render(c, b);
      };
    }
    function da(a) {
      a = a || {};
      a.controlBar = void 0 !== a.controlBar ? a.controlBar : !0;
      a.controlButtons = a.controlButtons || ["fullscreen", "setting", "video"];
      a.autoHideControlBar =
        void 0 !== a.autoHideControlBar ? a.autoHideControlBar : !1;
      a.autoHideInfospot =
        void 0 !== a.autoHideInfospot ? a.autoHideInfospot : !0;
      a.horizontalView = void 0 !== a.horizontalView ? a.horizontalView : !1;
      a.clickTolerance = a.clickTolerance || 10;
      a.cameraFov = a.cameraFov || 60;
      a.reverseDragging = a.reverseDragging || !1;
      a.enableReticle = a.enableReticle || !1;
      a.dwellTime = a.dwellTime || 1500;
      a.autoReticleSelect =
        void 0 !== a.autoReticleSelect ? a.autoReticleSelect : !0;
      a.viewIndicator = void 0 !== a.viewIndicator ? a.viewIndicator : !1;
      a.indicatorSize = a.indicatorSize || 30;
      a.output = a.output ? a.output : "none";
      a.autoRotate = a.autoRotate || !1;
      a.autoRotateSpeed = a.autoRotateSpeed || 2;
      a.autoRotateActivationDuration = a.autoRotateActivationDuration || 5e3;
      this.options = a;
      if (a.container) {
        var b = a.container;
        b._width = b.clientWidth;
        b._height = b.clientHeight;
      } else (b = document.createElement("div")), b.classList.add("panolens-container"), (b.style.width = "100%"), (b.style.height = "100%"), (b._width = window.innerWidth), (b._height = window.innerHeight), document.body.appendChild(b);
      this.container = b;
      this.camera =
        a.camera ||
        new e.PerspectiveCamera(
          this.options.cameraFov,
          this.container.clientWidth / this.container.clientHeight,
          1,
          1e4
        );
      this.scene = a.scene || new e.Scene();
      this.renderer =
        a.renderer || new e.WebGLRenderer({ alpha: !0, antialias: !1 });
      this.sceneReticle = new e.Scene();
      this.viewIndicatorSize = this.options.indicatorSize;
      this.reticle = {};
      this.tempEnableReticle = this.options.enableReticle;
      this.mode = t.NORMAL;
      this.pressObject =
        this.pressEntityObject =
        this.infospot =
        this.hoverObject =
        this.widget =
        this.panorama =
          null;
      this.raycaster = new e.Raycaster();
      this.raycasterPoint = new e.Vector2();
      this.userMouse = new e.Vector2();
      this.updateCallbacks = [];
      this.requestAnimationId = null;
      this.cameraFrustum = new e.Frustum();
      this.cameraViewProjectionMatrix = new e.Matrix4();
      this.outputDivElement = this.autoRotateRequestId = null;
      this.touchSupported =
        "ontouchstart" in window ||
        (window.DocumentTouch && document instanceof DocumentTouch);
      this.HANDLER_MOUSE_DOWN = this.onMouseDown.bind(this);
      this.HANDLER_MOUSE_UP = this.onMouseUp.bind(this);
      this.HANDLER_MOUSE_MOVE = this.onMouseMove.bind(this);
      this.HANDLER_WINDOW_RESIZE = this.onWindowResize.bind(this);
      this.HANDLER_KEY_DOWN = this.onKeyDown.bind(this);
      this.HANDLER_KEY_UP = this.onKeyUp.bind(this);
      this.HANDLER_TAP = this.onTap.bind(this, {
        clientX: this.container.clientWidth / 2,
        clientY: this.container.clientHeight / 2,
      });
      this.OUTPUT_INFOSPOT = !1;
      this.tweenLeftAnimation = new r.Tween();
      this.tweenUpAnimation = new r.Tween();
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(
        this.container.clientWidth,
        this.container.clientHeight
      );
      this.renderer.setClearColor(0, 0);
      this.renderer.autoClear = !1;
      this.renderer.domElement.classList.add("panolens-canvas");
      this.renderer.domElement.style.display = "block";
      this.container.style.backgroundColor = "#000";
      this.container.appendChild(this.renderer.domElement);
      this.OrbitControls = new ba(this.camera, this.container);
      this.OrbitControls.id = "orbit";
      this.OrbitControls.minDistance = 1;
      this.OrbitControls.noPan = !0;
      this.OrbitControls.autoRotate = this.options.autoRotate;
      this.OrbitControls.autoRotateSpeed = this.options.autoRotateSpeed;
      this.DeviceOrientationControls = new ca(this.camera, this.container);
      this.DeviceOrientationControls.id = "device-orientation";
      this.DeviceOrientationControls.enabled = !1;
      this.camera.position.z = 1;
      this.options.passiveRendering &&
        console.warn("passiveRendering is now deprecated");
      this.controls = [this.OrbitControls, this.DeviceOrientationControls];
      this.control = this.OrbitControls;
      this.CardboardEffect = new ha(this.renderer);
      this.CardboardEffect.setSize(
        this.container.clientWidth,
        this.container.clientHeight
      );
      this.StereoEffect = new ia(this.renderer);
      this.StereoEffect.setSize(
        this.container.clientWidth,
        this.container.clientHeight
      );
      this.effect = this.CardboardEffect;
      this.addReticle();
      this.options.horizontalView &&
        ((this.OrbitControls.minPolarAngle = Math.PI / 2),
        (this.OrbitControls.maxPolarAngle = Math.PI / 2));
      !1 !== this.options.controlBar &&
        this.addDefaultControlBar(this.options.controlButtons);
      this.options.viewIndicator && this.addViewIndicator();
      this.options.reverseDragging && this.reverseDraggingDirection();
      this.options.enableReticle
        ? this.enableReticleControl()
        : this.registerMouseAndTouchEvents();
      "overlay" === this.options.output && this.addOutputElement();
      this.registerEventListeners();
      this.animate.call(this);
    }
    var ja = "^0.105.2".replace(/[^0-9.]/g, ""),
      E = { ORBIT: 0, DEVICEORIENTATION: 1 },
      t = { UNKNOWN: 0, NORMAL: 1, CARDBOARD: 2, STEREO: 3 },
      u = {
        Info: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADBklEQVR42u2bP08UQRiHnzFaSYCI/xoksdBIqGwIiYWRUBISExpCQ0ej38FWOmlIKKhoMPEbaCxsrrHiYrQgOSlQEaICrT+LHSPZzNzt3s3c3Hn7lHvLzvv82L2dm30XKioqKgYY062BJF0HpoA7wARwBbhsPz4DjoEG8AnYNcZ8Sx1Op8IXJM1KWpdUV3nq9m9nJV1I7VNGfEzSM0mNNqR9NOwxx1L7NRMflbQm6SSgeJ4TO8Zoat+8/LKkg4jieQ4kLaf2RtKwpJ0uiufZkTScSn5S0l5C+b/sSZrstvyMpKPU5uc4kjTTjkvpeYCkaeA1/+7hvcIZMGuMqUULQNIU8Aa4ltrWwyHwyBizGzwASSPAe+B2assW7AH3jTE/i+xcZoa12Qfy2Bo3i+5cKABl99zF1GYlWFTBeULLS0DZrOsDcDNggTXgc27bLWA64BhfgHvGmB8dHUXZ1DM0S45xliKMs9bKr+klIOkqsBrwv9JtVq1DewEAT4Ch1BYdMGQdygeg7Df4SmqDAKyoyXpCszPgITCeuvoAjFuX0gE8jljUdv7bCtiOOJ7XpdUZ8L/gdXHOA5QtYH5NXXVgbrgWWn1nwFTqaiPgdPIFcDd1tRFwOl307DwRuZgXwLvctgfA04hjOp18AcReZ6sZY16e3yDpUuQxnU6+S2AkcjEpcDr1zxOXSPgCKLSa0mc4nXwB/EpdbQScTr4AGqmrjYDTyRfAx9TVRsDp5Aug8LJyH+F0cgZg58z11BUHpO5ruGh2G3ybuuqAeF2aBfAqddUB8bq0OgP2U1cegH3aOQOMMb+BrdTVB2DLupQLwLIOnKY26IBT6+ClaQDGmO/ARmqLDtiwDn7HVkcY+EdjNoTlCI+tYhO2iUppm6HKslPUq2qQKHpUe8AFsjaUXuUQWCgqXyoAG8IuME/WkNRrnAHzZfqDSgdgQ6gBc2Td3b3CMTBXtkOsIzTIjZLnQhjcVtlcEIPZLJ0LoVvt8s/Va+3yuSAG84UJRxB98cpM9dJURUVFxSDzBxKde4Lk3/h2AAAAAElFTkSuQmCC",
        Arrow:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADPklEQVR42u2bMUscQRiG30/SRaJEI1ZKUiRErNIELRUbQYSAnX8hpVUgkDYp0wgWVjYW+QcJaQzYpLojJIXhtDDEKBpj65ti58ixmdmb2ZvZ7+T2AUHudmfmeXf2bnb3O6CmpqZmgJGqOiI5AWAWwEMA0wDuArht3r4CcAagBeAbgIaI/NQOp1fhIZKLJN+SbDKcptl3keSQtk+I+BjJVyRbJaRdtEybY9p+ReKjJN+QvIwonufS9DGq7ZuXXyd5nFA8zzHJdW1vkLxDcrdC8Ty7JO9oyc+QPFCUb3NAcqZq+TmSp9rmHZySnCvjErwOIPkUwHv8+w7vF64ALIrIfrIASM4C+ADgnratgxMACyLSiB4AyREAnwE80LbswgGAJyJy4bNxyApr6wbIw4xxy3djrwCYfeeuaZsFsEbPdULXU4DZqusLgMkEA21P05EEbf8A8FhEzos28pkBLxLKL5s/r/M1kEkz9vKQHGeatf05yfmOfubNa7G5JDle5NhtBjwHMBz5yFwAWBaRT+0XzP8pZsKwcQiH2fX8Ycojb+kzxUw4ZJn7CSQXqpRPHMKCq7+iZJ71Mvdy/DftXSQ6HcJdSDaqPPKW/mPOBO+lcbvzCU35RCFM2PpwnQKzZQfdgfe0dxH5dLA6uQJ4pC2fIASrkyuA6X6QjxyC1ckVQNn7bNHlI4ZgdXIFUObiJJl8pBCsTjGfuIwA2Cv4FN7xbYjkjqsRAHuIePXoCiDF1Zk2VidXAL+1R5sAq5MrgJb2aBNgdXIF8FV7tAmwOrkCCFs73wysTtYATHFCU3vEEWm6Ci6KvgY/ao86Ik6XogDeaY86Ik6XbjPgSHvkEThCwQy45XpDRK5JbgN4GWkgUyR9H65MRQxgW0SunZ5FezK7pfwd8e8MV8UfAPdF5Jdrg8JrAbPjprZFD2wWyQP6j8ZSEufRmGlgQ9umBBvd5IOgbjFUKLu+XnWBhG+rpsFVZGUo/coJgFVf+aAATAgNACvICpL6jSsAKyH1QcEBmBD2ASwhq+7uF84ALIVWiPUEB7lQsiOEwS2VzQUxmMXSuRCqKpd/zX4rl88FMZg/mLAEcSN+MlP/aKqmpqZmkPkL0hSjwOpNKxwAAAAASUVORK5CYII=",
        FullscreenEnter:
          "data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz4KICAgIDxwYXRoIGQ9Ik03IDE0SDV2NWg1di0ySDd2LTN6bS0yLTRoMlY3aDNWNUg1djV6bTEyIDdoLTN2Mmg1di01aC0ydjN6TTE0IDV2MmgzdjNoMlY1aC01eiIvPgo8L3N2Zz4=",
        FullscreenLeave:
          "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggc3R5bGU9ImZpbGw6I2ZmZiIgZD0iTTE0LDE0SDE5VjE2SDE2VjE5SDE0VjE0TTUsMTRIMTBWMTlIOFYxNkg1VjE0TTgsNUgxMFYxMEg1VjhIOFY1TTE5LDhWMTBIMTRWNUgxNlY4SDE5WiIgLz48L3N2Zz4=",
        VideoPlay:
          "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggc3R5bGU9ImZpbGw6I2ZmZiIgZD0iTTgsNS4xNFYxOS4xNEwxOSwxMi4xNEw4LDUuMTRaIiAvPjwvc3ZnPg==",
        VideoPause:
          "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggc3R5bGU9ImZpbGw6I2ZmZiIgZD0iTTE0LDE5LjE0SDE4VjUuMTRIMTRNNiwxOS4xNEgxMFY1LjE0SDZWMTkuMTRaIiAvPjwvc3ZnPg==",
        WhiteTile:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIABAMAAAAGVsnJAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB1WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOkNvbXByZXNzaW9uPjE8L3RpZmY6Q29tcHJlc3Npb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOlBob3RvbWV0cmljSW50ZXJwcmV0YXRpb24+MjwvdGlmZjpQaG90b21ldHJpY0ludGVycHJldGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KAtiABQAAACRQTFRFAAAAAAAABgYGBwcHHh4eKysrx8fHy8vLzMzM7OzsAAAABgYG+q7SZgAAAAp0Uk5TAP7+/v7+/v7+/iJx/a8AAAOwSURBVHja7d0hbsNAEAVQo6SFI6XEcALDcgNLvUBvEBQVhpkWVYWlhSsVFS7t5QIshRt695lEASZP+8c7a1kzDL1fz+/zyuvzp6FbvoddrL6uDd1yGZ5eXldeb18N3fIx7A+58prmhm65DfvDcd0952lu6JabFbD/zVprZj1lzcys+fj9z8xTZtbT8rv8yWlu6BYAIgAAAAAAAAAAAABAM6QXEAEAAAAAAAAAgJ2gnaAIiIA3Q2qAGgAAAAAAAAAAAAAAAAAAAAAAAAAAQJsADkVFAAAAAAA8Bj0GRUAEREAEREAEREAEREAEAAAAAAAAAAB2gnaCIiACPplRA9QANUAERAAAAEVQERQBERCBVlfAcZ3aeZobusUKMGBhV6KUElHGKBERJR6/fxExRkQZl9/lT8S1oVsuhqyYMmPKjCkzvfcCpsxohrwY0Q06EAEAAAAAAAAAAACgGdILiAAAAAAAAAAAwE7QTlAERMCbITVADQAAAAAAAAAAAAAAAAAAAAAAAAAAwKmwQ1ERAAAAAACPQY9BERABERABERABERABERABAAAAAAAAAICdoJ2gCIiAT2bUADVADRABEQAAQBFUBEVABERgEyvAlJm+V4ApM6bMmDJjyowpM6bMdN0LmDKjGfJiRDfoQAQAAAAAAAAAAACAZkgvIAIAAAAAAAAAADtBO0EREAFvhtQANQAAAAAAAAAAAAAAAAAAAAAAAAAAAKfCDkVFAAAAAAA8Bj0GRUAEREAEREAEREAEREAEAAAAAAAAAAB2gnaCIiACPplRA9QANUAERAAAAEVQERQBERCBTawAU2b6XgGmzJgyY8qMKTOmzJgy03UvYMqMZsiLEd2gAxEAAAAAAAAAAAAAmiG9gAgAAAAAAAAAAOwE7QRFQAS8GVID1AAAAAAAAAAAAAAAAAAAAAAAAAAAAJwKOxQVAQAAAADwGPQYFAEREAEREAEREAEREAERAAAAAAAAAADYCdoJioAI+GRGDVAD1AAREAEAABRBRVAEREAENrECTJnpewWYMmPKjCkzpsyYMmPKTNe9gCkzmiEvRnSDDkQAAAAAAAAAAAAAaIb0AiIAAAAAAAAAALATtBMUARHwZkgNUAMAAAAAAAAAAAAAAAAAAAAAAAAAAHAq7FBUBAAAAADAY9BjUAREQAREQAREQAREQAREAAAAAAAAAABgJ2gnKAIi4JMZNUANUANEQAQAAFAEFUEREAER2MQKMGWm7xVgyowpM50PWen9ugNGXz1XaocAFgAAAABJRU5ErkJggg==",
        Setting:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADn0lEQVR42u2bzUsVURjGnyO6CPzAMnTjppAo3LTwH1CqTfaxbeOiRS37A0wXtROFVi1aRBs3LWohSIGbQAQXViBGRhG0UIRKUCpK7q/FnOB2uc6cOXNmRnGe3eW+H8/7zLln3vNxpQoVKlQ4wjBFJAFOSRqX1O7osivpvjHmU1nChBZglvSYLYJbS0EanCvIJzWK+gnsyH34/8OuMaYjb265jwCgz6N4SWq3vodbAEmnS/KtBDgoAgyU5BteAOAkMAPcBroc7PskDWfgN+wyDwBdltMMcDI3tYBnde/pHeARMNTErgd4APzweP834oeN1dMkz5DlsFNn/yyv4kdiSK4At4AO4CqwGaDwRmza2B0210qM7YhrXU59ANAq6bWkwQTTn5KO5fIE0uVYlXTeGLOXFMx1DrjlULwKKN41x6DlnIjEEQCckPRe0okCiguJr5LOGGO+xhm5jICJQ1i8LOeJJKPYEQAMKvrtt5ZdjSf2FM0Fq/sZJI2A6UNcvCz36TiDfUcAcE1SPu/U6Mm8k/TFfu6XdFb5iX3dGPM8lQfwNod3+TowBnQ3yddtv1vPIe+b1JIBiwEJ1IAJ208k5W21trWA+V/5CHAcmAtU/A2P/DcCiTAHHE8tgCVhgLvAXgYCk17Jo/yTGfLuWe7Zd72AC8CWB4n3OAz7mLytNkZabAEXMhfeQKYfWEpJZCxA3rGUOZeA/qDF15FpAz47EvlNk9neI2e3jeWCz0BbmvipNkSMMX8kuSZYM8Z8zyqAjbHmaN5mOeYjgIXrU93MWrxHrNQjrqiDkQMLHwG+OdqF3NN3jeXKzU8AoF1SzdH8XKhJUO7HZDXLMbwAwICkJUULFxe0SbqSVQAbw3Xi7Ze0ZLmGAzAKbHs0JGU1QtvAaIjCW4B7ZOvJy2qFa5a730RPtBiaz0CgnkiZi6F5fBZDVMvho7EhcuS3xJJ2hV9IupgTqaLw0hhzab8vq23xOG/r+LDsKjLgYVzxUnU0ltwK2wDezUyJmEwqXgp/PL4rvxthaeCSI+zxuA10J8ZkWdJNSb2SLkvayKHwDRu71+ZajrG941J8agALDQ3GU/a/IvMkYCPzmCbtLNEVmacNtgs5iP9fYVNEV1Q6Hez7yNZSL+J2SarTcpqiyV2iUkG0IvPFvbz5FbEn+KEk3wMjwMeSfCsBXFBdly9CAPk9ydyffpECuB5tZfVJjaKWueOSfinln6YK4lahQoUKRxd/AcRPGTcQCAUQAAAAAElFTkSuQmCC",
        ChevronRight:
          "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTguNTksMTYuNThMMTMuMTcsMTJMOC41OSw3LjQxTDEwLDZMMTYsMTJMMTAsMThMOC41OSwxNi41OFoiIC8+PC9zdmc+",
        Check:
          "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTIxLDdMOSwxOUwzLjUsMTMuNUw0LjkxLDEyLjA5TDksMTYuMTdMMTkuNTksNS41OUwyMSw3WiIgLz48L3N2Zz4=",
        ViewIndicator:
          "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiBpZD0idmlldy1pbmRpY2F0b3IiIGhlaWdodD0iMzAiIHdpZHRoPSIzMCIgdmlld0JveD0iLTIuNSAtMSAzMCAzMCI+Cgk8c3R5bGUgdHlwZT0idGV4dC9jc3MiPi5zdDB7c3Ryb2tlLXdpZHRoOjI7c3Ryb2tlLW1pdGVybGltaXQ6MTA7ZmlsbDpub25lO30uc3Qxe3N0cm9rZS13aWR0aDo2O3N0cm9rZS1taXRlcmxpbWl0OjEwO30KCTwvc3R5bGU+Cgk8Zz4KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNIDEyLjUgMCBBIDEyLjUgMTIuNSAwIDAgMCAtMTIuNSAwIEEgMTIuNSAxMi41IDAgMCAwIDEyLjUgMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwxMywxNS41KSI+PC9wYXRoPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0gMTMgMCBMIDEwIDIgTCAxNiAyIFoiPjwvcGF0aD4KCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNIDIgMCBBIDIgMiAwIDAgMCAtMiAwIEEgMiAyIDAgMCAwIDIgMCIgdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsMSwxMywxNS41KSI+PC9wYXRoPgoJCTxwYXRoIGNsYXNzPSJzdDEiIGlkPSJpbmRpY2F0b3IiIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLDEsMTMsMTUuNSkiPjwvcGF0aD4KCTwvZz4KPC9zdmc+",
      },
      ea = {
        load: function (a, b, c, d) {
          b = void 0 === b ? function () {} : b;
          c = void 0 === c ? function () {} : c;
          d = void 0 === d ? function () {} : d;
          e.Cache.enabled = !0;
          var g, k, p, m;
          for (m in u) u.hasOwnProperty(m) && a === u[m] && (g = m);
          var l = e.Cache.get(g ? g : a);
          if (void 0 !== l)
            return (
              b &&
                setTimeout(function () {
                  c({ loaded: 1, total: 1 });
                  b(l);
                }, 0),
              l
            );
          var h = window.URL || window.webkitURL;
          var q = document.createElementNS("http://www.w3.org/1999/xhtml", "img");
          e.Cache.add(g ? g : a, q);
          var f = function () {
            h.revokeObjectURL(q.src);
            b(q);
          };
          if (0 === a.indexOf("data:"))
            return q.addEventListener("load", f, !1), (q.src = a), q;
          q.crossOrigin = void 0 !== this.crossOrigin ? this.crossOrigin : "";
          g = new window.XMLHttpRequest();
          g.open("GET", a, !0);
          g.responseType = "arraybuffer";
          g.addEventListener("error", d);
          g.addEventListener("progress", function (a) {
            if (a) {
              var d = a.loaded,
                b = a.total;
              a.lengthComputable && c({ loaded: d, total: b });
            }
          });
          g.addEventListener("loadend", function (a) {
            a &&
              ((k = new Uint8Array(a.currentTarget.response)),
              (p = new window.Blob([k])),
              q.addEventListener("load", f, !1),
              (q.src = h.createObjectURL(p)));
          });
          g.send(null);
        },
      },
      N = {
        load: function (a, b, c, d) {
          b = void 0 === b ? function () {} : b;
          var g = new e.Texture();
          ea.load(
            a,
            function (d) {
              g.image = d;
              d =
                0 < a.search(/\.(jpg|jpeg)$/) ||
                0 === a.search(/^data:image\/jpeg/);
              g.format = d ? e.RGBFormat : e.RGBAFormat;
              g.needsUpdate = !0;
              b(g);
            },
            c,
            d
          );
          return g;
        },
      },
      fa = {
        load: function (a, b, c, d) {
          b = void 0 === b ? function () {} : b;
          c = void 0 === c ? function () {} : c;
          var g;
          var k = new e.CubeTexture([]);
          var p = 0;
          var m = {};
          var l = {};
          a.map(function (a, e) {
            ea.load(
              a,
              function (a) {
                k.images[e] = a;
                p++;
                6 === p && ((k.needsUpdate = !0), b(k));
              },
              function (a) {
                m[e] = { loaded: a.loaded, total: a.total };
                l.loaded = 0;
                g = l.total = 0;
                for (var d in m)
                  g++, (l.loaded += m[d].loaded), (l.total += m[d].total);
                6 > g && (l.total = (l.total / g) * 6);
                c(l);
              },
              d
            );
          });
          return k;
        },
      };
    S.prototype = Object.assign(Object.create(e.EventDispatcher.prototype), {
      setContainer: function (a) {
        this.container = a;
      },
      setScene: function (a) {
        this.scene = a;
      },
      enumerateDevices: function () {
        var a = this.devices,
          b = new Promise(function (b) {
            b(a);
          });
        return 0 < a.length
          ? b
          : window.navigator.mediaDevices.enumerateDevices();
      },
      switchNextVideoDevice: function () {
        var a = this.stop.bind(this),
          b = this.start.bind(this),
          c = this.setVideDeviceIndex.bind(this),
          d = this.videoDeviceIndex;
        this.getDevices("video").then(function (g) {
          a();
          d++;
          d >= g.length ? (c(0), d--) : c(d);
          b(g[d]);
        });
      },
      getDevices: function (a) {
        a = void 0 === a ? "video" : a;
        var b = this.devices;
        return this.enumerateDevices()
          .then(function (a) {
            return a.map(function (a) {
              b.includes(a) || b.push(a);
              return a;
            });
          })
          .then(function (b) {
            var d = new RegExp(a, "i");
            return b.filter(function (a) {
              return d.test(a.kind);
            });
          });
      },
      getUserMedia: function (a) {
        var b = this.setMediaStream.bind(this),
          c = this.playVideo.bind(this);
        return window.navigator.mediaDevices
          .getUserMedia(a)
          .then(b)
          .then(c)
          .catch(function (a) {
            console.warn("PANOLENS.Media: " + a);
          });
      },
      setVideDeviceIndex: function (a) {
        this.videoDeviceIndex = a;
      },
      start: function (a) {
        var b = this.constraints,
          c = this.getUserMedia.bind(this);
        this.element = this.createVideoElement();
        return this.getDevices().then(function (d) {
          if (!d || 0 === d.length) throw Error("no video device found");
          b.video.deviceId = (a || d[0]).deviceId;
          return c(b);
        });
      },
      stop: function () {
        var a = this.stream;
        a &&
          a.active &&
          (a.getTracks()[0].stop(),
          window.removeEventListener("resize", this.onWindowResize.bind(this)),
          (this.stream = this.element = null));
      },
      setMediaStream: function (a) {
        this.stream = a;
        this.element.srcObject = a;
        this.scene && (this.scene.background = this.createVideoTexture());
        window.addEventListener("resize", this.onWindowResize.bind(this));
      },
      playVideo: function () {
        var a = this.element;
        a && (a.play(), this.dispatchEvent({ type: "play" }));
      },
      pauseVideo: function () {
        var a = this.element;
        a && (a.pause(), this.dispatchEvent({ type: "pause" }));
      },
      createVideoTexture: function () {
        var a = this.element,
          b = new e.VideoTexture(a);
        b.generateMipmaps = !1;
        b.minFilter = e.LinearFilter;
        b.magFilter = e.LinearFilter;
        b.format = e.RGBFormat;
        b.center.set(0.5, 0.5);
        a.addEventListener("canplay", this.onWindowResize.bind(this));
        return b;
      },
      createVideoElement: function () {
        var a = this.dispatchEvent.bind(this),
          b = document.createElement("video");
        b.setAttribute("autoplay", "");
        b.setAttribute("muted", "");
        b.setAttribute("playsinline", "");
        b.style.position = "absolute";
        b.style.top = "0";
        b.style.left = "0";
        b.style.width = "100%";
        b.style.height = "100%";
        b.style.objectPosition = "center";
        b.style.objectFit = "cover";
        b.style.display = this.scene ? "none" : "";
        b.addEventListener("canplay", function () {
          return a({ type: "canplay" });
        });
        return b;
      },
      onWindowResize: function () {
        if (
          this.element &&
          this.element.videoWidth &&
          this.element.videoHeight &&
          this.scene
        ) {
          var a = this.container,
            b = a.clientWidth;
          a = a.clientHeight;
          var c = this.scene.background,
            d = this.element;
          d =
            (d.videoHeight / d.videoWidth) *
            (this.container ? b / a : 1) *
            this.ratioScalar;
          b > a ? c.repeat.set(d, 1) : c.repeat.set(1, 1 / d);
        }
      },
    });
    M.prototype = Object.assign(Object.create(e.Sprite.prototype), {
      constructor: M,
      setColor: function (a) {
        this.material.color.copy(a instanceof e.Color ? a : new e.Color(a));
      },
      createCanvasTexture: function (a) {
        a = new e.CanvasTexture(a);
        a.minFilter = e.LinearFilter;
        a.magFilter = e.LinearFilter;
        a.generateMipmaps = !1;
        return a;
      },
      createCanvas: function () {
        var a = document.createElement("canvas"),
          b = a.getContext("2d"),
          c = this.dpr;
        a.width = 32 * c;
        a.height = 32 * c;
        b.scale(c, c);
        b.shadowBlur = 5;
        b.shadowColor = "rgba(200,200,200,0.9)";
        return { canvas: a, context: b };
      },
      updateCanvasArcByProgress: function (a) {
        var b = this.context,
          c = this.canvasWidth,
          d = this.canvasHeight,
          g = this.material,
          k = this.dpr,
          e = a * Math.PI * 2,
          m = this.color.getStyle(),
          l = (0.5 * c) / k;
        k = (0.5 * d) / k;
        b.clearRect(0, 0, c, d);
        b.beginPath();
        0 === a
          ? (b.arc(l, k, c / 16, 0, 2 * Math.PI), (b.fillStyle = m), b.fill())
          : (b.arc(l, k, c / 4 - 3, -Math.PI / 2, -Math.PI / 2 + e),
            (b.strokeStyle = m),
            (b.lineWidth = 3),
            b.stroke());
        b.closePath();
        g.map.needsUpdate = !0;
      },
      ripple: function () {
        var a = this,
          b = this.context,
          c = this.canvasWidth,
          d = this.canvasHeight,
          g = this.material,
          k = this.rippleDuration,
          e = performance.now(),
          m = this.color,
          l = this.dpr,
          h = (0.5 * c) / l,
          q = (0.5 * d) / l,
          f = function () {
            var p = window.requestAnimationFrame(f),
              v = (performance.now() - e) / k,
              n = 0 < 1 - v ? 1 - v : 0,
              r = (v * c * 0.5) / l;
            b.clearRect(0, 0, c, d);
            b.beginPath();
            b.arc(h, q, r, 0, 2 * Math.PI);
            b.fillStyle =
              "rgba(" +
              255 * m.r +
              ", " +
              255 * m.g +
              ", " +
              255 * m.b +
              ", " +
              n +
              ")";
            b.fill();
            b.closePath();
            1 <= v &&
              (window.cancelAnimationFrame(p),
              a.updateCanvasArcByProgress(0),
              a.dispatchEvent({ type: "reticle-ripple-end" }));
            g.map.needsUpdate = !0;
          };
        this.dispatchEvent({ type: "reticle-ripple-start" });
        f();
      },
      show: function () {
        this.visible = !0;
      },
      hide: function () {
        this.visible = !1;
      },
      start: function (a) {
        this.autoSelect &&
          (this.dispatchEvent({ type: "reticle-start" }),
          (this.startTimestamp = performance.now()),
          (this.callback = a),
          this.update());
      },
      end: function () {
        this.startTimestamp &&
          (window.cancelAnimationFrame(this.timerId),
          this.updateCanvasArcByProgress(0),
          (this.startTimestamp = this.timerId = this.callback = null),
          this.dispatchEvent({ type: "reticle-end" }));
      },
      update: function () {
        this.timerId = window.requestAnimationFrame(this.update.bind(this));
        var a = (performance.now() - this.startTimestamp) / this.dwellTime;
        this.updateCanvasArcByProgress(a);
        this.dispatchEvent({ type: "reticle-update", progress: a });
        1 <= a &&
          (window.cancelAnimationFrame(this.timerId),
          this.callback && this.callback(),
          this.end(),
          this.ripple());
      },
    });
    var r = (function (a, b) {
      return (b = { exports: {} }), a(b, b.exports), b.exports;
    })(function (a, b) {
      b = function () {
        this._tweens = {};
        this._tweensAddedDuringUpdate = {};
      };
      b.prototype = {
        getAll: function () {
          return Object.keys(this._tweens).map(
            function (a) {
              return this._tweens[a];
            }.bind(this)
          );
        },
        removeAll: function () {
          this._tweens = {};
        },
        add: function (a) {
          this._tweens[a.getId()] = a;
          this._tweensAddedDuringUpdate[a.getId()] = a;
        },
        remove: function (a) {
          delete this._tweens[a.getId()];
          delete this._tweensAddedDuringUpdate[a.getId()];
        },
        update: function (a, b) {
          var d = Object.keys(this._tweens);
          if (0 === d.length) return !1;
          for (a = void 0 !== a ? a : c.now(); 0 < d.length; ) {
            this._tweensAddedDuringUpdate = {};
            for (var g = 0; g < d.length; g++) {
              var e = this._tweens[d[g]];
              e &&
                !1 === e.update(a) &&
                ((e._isPlaying = !1), b || delete this._tweens[d[g]]);
            }
            d = Object.keys(this._tweensAddedDuringUpdate);
          }
          return !0;
        },
      };
      var c = new b();
      c.Group = b;
      c._nextId = 0;
      c.nextId = function () {
        return c._nextId++;
      };
      c.now =
        "undefined" === typeof self &&
        "undefined" !== typeof process &&
        process.hrtime
          ? function () {
              var a = process.hrtime();
              return 1e3 * a[0] + a[1] / 1e6;
            }
          : "undefined" !== typeof self &&
            void 0 !== self.performance &&
            void 0 !== self.performance.now
          ? self.performance.now.bind(self.performance)
          : void 0 !== Date.now
          ? Date.now
          : function () {
              return new Date().getTime();
            };
      c.Tween = function (a, b) {
        this._object = a;
        this._valuesStart = {};
        this._valuesEnd = {};
        this._valuesStartRepeat = {};
        this._duration = 1e3;
        this._repeat = 0;
        this._repeatDelayTime = void 0;
        this._reversed = this._isPlaying = this._yoyo = !1;
        this._delayTime = 0;
        this._startTime = null;
        this._easingFunction = c.Easing.Linear.None;
        this._interpolationFunction = c.Interpolation.Linear;
        this._chainedTweens = [];
        this._onStartCallback = null;
        this._onStartCallbackFired = !1;
        this._onStopCallback =
          this._onCompleteCallback =
          this._onRepeatCallback =
          this._onUpdateCallback =
            null;
        this._group = b || c;
        this._id = c.nextId();
      };
      c.Tween.prototype = {
        getId: function () {
          return this._id;
        },
        isPlaying: function () {
          return this._isPlaying;
        },
        to: function (a, b) {
          this._valuesEnd = Object.create(a);
          void 0 !== b && (this._duration = b);
          return this;
        },
        duration: function (a) {
          this._duration = a;
          return this;
        },
        start: function (a) {
          this._group.add(this);
          this._isPlaying = !0;
          this._onStartCallbackFired = !1;
          this._startTime =
            void 0 !== a
              ? "string" === typeof a
                ? c.now() + parseFloat(a)
                : a
              : c.now();
          this._startTime += this._delayTime;
          for (var d in this._valuesEnd) {
            if (this._valuesEnd[d] instanceof Array) {
              if (0 === this._valuesEnd[d].length) continue;
              this._valuesEnd[d] = [this._object[d]].concat(this._valuesEnd[d]);
            }
            void 0 !== this._object[d] &&
              ((this._valuesStart[d] = this._object[d]),
              !1 === this._valuesStart[d] instanceof Array &&
                (this._valuesStart[d] *= 1),
              (this._valuesStartRepeat[d] = this._valuesStart[d] || 0));
          }
          return this;
        },
        stop: function () {
          if (!this._isPlaying) return this;
          this._group.remove(this);
          this._isPlaying = !1;
          null !== this._onStopCallback && this._onStopCallback(this._object);
          this.stopChainedTweens();
          return this;
        },
        end: function () {
          this.update(Infinity);
          return this;
        },
        stopChainedTweens: function () {
          for (var a = 0, b = this._chainedTweens.length; a < b; a++)
            this._chainedTweens[a].stop();
        },
        group: function (a) {
          this._group = a;
          return this;
        },
        delay: function (a) {
          this._delayTime = a;
          return this;
        },
        repeat: function (a) {
          this._repeat = a;
          return this;
        },
        repeatDelay: function (a) {
          this._repeatDelayTime = a;
          return this;
        },
        yoyo: function (a) {
          this._yoyo = a;
          return this;
        },
        easing: function (a) {
          this._easingFunction = a;
          return this;
        },
        interpolation: function (a) {
          this._interpolationFunction = a;
          return this;
        },
        chain: function () {
          this._chainedTweens = arguments;
          return this;
        },
        onStart: function (a) {
          this._onStartCallback = a;
          return this;
        },
        onUpdate: function (a) {
          this._onUpdateCallback = a;
          return this;
        },
        onRepeat: function (a) {
          this._onRepeatCallback = a;
          return this;
        },
        onComplete: function (a) {
          this._onCompleteCallback = a;
          return this;
        },
        onStop: function (a) {
          this._onStopCallback = a;
          return this;
        },
        update: function (a) {
          var b;
          if (a < this._startTime) return !0;
          !1 === this._onStartCallbackFired &&
            (null !== this._onStartCallback &&
              this._onStartCallback(this._object),
            (this._onStartCallbackFired = !0));
          var d = (a - this._startTime) / this._duration;
          d = 0 === this._duration || 1 < d ? 1 : d;
          var c = this._easingFunction(d);
          for (b in this._valuesEnd)
            if (void 0 !== this._valuesStart[b]) {
              var e = this._valuesStart[b] || 0,
                l = this._valuesEnd[b];
              l instanceof Array
                ? (this._object[b] = this._interpolationFunction(l, c))
                : ("string" === typeof l &&
                    (l =
                      "+" === l.charAt(0) || "-" === l.charAt(0)
                        ? e + parseFloat(l)
                        : parseFloat(l)),
                  "number" === typeof l && (this._object[b] = e + (l - e) * c));
            }
          null !== this._onUpdateCallback &&
            this._onUpdateCallback(this._object, d);
          if (1 === d)
            if (0 < this._repeat) {
              isFinite(this._repeat) && this._repeat--;
              for (b in this._valuesStartRepeat)
                "string" === typeof this._valuesEnd[b] &&
                  (this._valuesStartRepeat[b] += parseFloat(this._valuesEnd[b])),
                  this._yoyo &&
                    ((d = this._valuesStartRepeat[b]),
                    (this._valuesStartRepeat[b] = this._valuesEnd[b]),
                    (this._valuesEnd[b] = d)),
                  (this._valuesStart[b] = this._valuesStartRepeat[b]);
              this._yoyo && (this._reversed = !this._reversed);
              this._startTime =
                void 0 !== this._repeatDelayTime
                  ? a + this._repeatDelayTime
                  : a + this._delayTime;
              null !== this._onRepeatCallback &&
                this._onRepeatCallback(this._object);
            } else {
              null !== this._onCompleteCallback &&
                this._onCompleteCallback(this._object);
              a = 0;
              for (b = this._chainedTweens.length; a < b; a++)
                this._chainedTweens[a].start(this._startTime + this._duration);
              return !1;
            }
          return !0;
        },
      };
      c.Easing = {
        Linear: {
          None: function (a) {
            return a;
          },
        },
        Quadratic: {
          In: function (a) {
            return a * a;
          },
          Out: function (a) {
            return a * (2 - a);
          },
          InOut: function (a) {
            return 1 > (a *= 2) ? 0.5 * a * a : -0.5 * (--a * (a - 2) - 1);
          },
        },
        Cubic: {
          In: function (a) {
            return a * a * a;
          },
          Out: function (a) {
            return --a * a * a + 1;
          },
          InOut: function (a) {
            return 1 > (a *= 2) ? 0.5 * a * a * a : 0.5 * ((a -= 2) * a * a + 2);
          },
        },
        Quartic: {
          In: function (a) {
            return a * a * a * a;
          },
          Out: function (a) {
            return 1 - --a * a * a * a;
          },
          InOut: function (a) {
            return 1 > (a *= 2)
              ? 0.5 * a * a * a * a
              : -0.5 * ((a -= 2) * a * a * a - 2);
          },
        },
        Quintic: {
          In: function (a) {
            return a * a * a * a * a;
          },
          Out: function (a) {
            return --a * a * a * a * a + 1;
          },
          InOut: function (a) {
            return 1 > (a *= 2)
              ? 0.5 * a * a * a * a * a
              : 0.5 * ((a -= 2) * a * a * a * a + 2);
          },
        },
        Sinusoidal: {
          In: function (a) {
            return 1 - Math.cos((a * Math.PI) / 2);
          },
          Out: function (a) {
            return Math.sin((a * Math.PI) / 2);
          },
          InOut: function (a) {
            return 0.5 * (1 - Math.cos(Math.PI * a));
          },
        },
        Exponential: {
          In: function (a) {
            return 0 === a ? 0 : Math.pow(1024, a - 1);
          },
          Out: function (a) {
            return 1 === a ? 1 : 1 - Math.pow(2, -10 * a);
          },
          InOut: function (a) {
            return 0 === a
              ? 0
              : 1 === a
              ? 1
              : 1 > (a *= 2)
              ? 0.5 * Math.pow(1024, a - 1)
              : 0.5 * (-Math.pow(2, -10 * (a - 1)) + 2);
          },
        },
        Circular: {
          In: function (a) {
            return 1 - Math.sqrt(1 - a * a);
          },
          Out: function (a) {
            return Math.sqrt(1 - --a * a);
          },
          InOut: function (a) {
            return 1 > (a *= 2)
              ? -0.5 * (Math.sqrt(1 - a * a) - 1)
              : 0.5 * (Math.sqrt(1 - (a -= 2) * a) + 1);
          },
        },
        Elastic: {
          In: function (a) {
            return 0 === a
              ? 0
              : 1 === a
              ? 1
              : -Math.pow(2, 10 * (a - 1)) * Math.sin(5 * (a - 1.1) * Math.PI);
          },
          Out: function (a) {
            return 0 === a
              ? 0
              : 1 === a
              ? 1
              : Math.pow(2, -10 * a) * Math.sin(5 * (a - 0.1) * Math.PI) + 1;
          },
          InOut: function (a) {
            if (0 === a) return 0;
            if (1 === a) return 1;
            a *= 2;
            return 1 > a
              ? -0.5 *
                  Math.pow(2, 10 * (a - 1)) *
                  Math.sin(5 * (a - 1.1) * Math.PI)
              : 0.5 *
                  Math.pow(2, -10 * (a - 1)) *
                  Math.sin(5 * (a - 1.1) * Math.PI) +
                  1;
          },
        },
        Back: {
          In: function (a) {
            return a * a * (2.70158 * a - 1.70158);
          },
          Out: function (a) {
            return --a * a * (2.70158 * a + 1.70158) + 1;
          },
          InOut: function (a) {
            return 1 > (a *= 2)
              ? 0.5 * a * a * (3.5949095 * a - 2.5949095)
              : 0.5 * ((a -= 2) * a * (3.5949095 * a + 2.5949095) + 2);
          },
        },
        Bounce: {
          In: function (a) {
            return 1 - c.Easing.Bounce.Out(1 - a);
          },
          Out: function (a) {
            return a < 1 / 2.75
              ? 7.5625 * a * a
              : a < 2 / 2.75
              ? 7.5625 * (a -= 1.5 / 2.75) * a + 0.75
              : a < 2.5 / 2.75
              ? 7.5625 * (a -= 2.25 / 2.75) * a + 0.9375
              : 7.5625 * (a -= 2.625 / 2.75) * a + 0.984375;
          },
          InOut: function (a) {
            return 0.5 > a
              ? 0.5 * c.Easing.Bounce.In(2 * a)
              : 0.5 * c.Easing.Bounce.Out(2 * a - 1) + 0.5;
          },
        },
      };
      c.Interpolation = {
        Linear: function (a, b) {
          var d = a.length - 1,
            g = d * b,
            e = Math.floor(g),
            l = c.Interpolation.Utils.Linear;
          return 0 > b
            ? l(a[0], a[1], g)
            : 1 < b
            ? l(a[d], a[d - 1], d - g)
            : l(a[e], a[e + 1 > d ? d : e + 1], g - e);
        },
        Bezier: function (a, b) {
          for (
            var d = 0,
              g = a.length - 1,
              e = Math.pow,
              l = c.Interpolation.Utils.Bernstein,
              h = 0;
            h <= g;
            h++
          )
            d += e(1 - b, g - h) * e(b, h) * a[h] * l(g, h);
          return d;
        },
        CatmullRom: function (a, b) {
          var d = a.length - 1,
            g = d * b,
            e = Math.floor(g),
            l = c.Interpolation.Utils.CatmullRom;
          return a[0] === a[d]
            ? (0 > b && (e = Math.floor((g = d * (1 + b)))),
              l(a[(e - 1 + d) % d], a[e], a[(e + 1) % d], a[(e + 2) % d], g - e))
            : 0 > b
            ? a[0] - (l(a[0], a[0], a[1], a[1], -g) - a[0])
            : 1 < b
            ? a[d] - (l(a[d], a[d], a[d - 1], a[d - 1], g - d) - a[d])
            : l(
                a[e ? e - 1 : 0],
                a[e],
                a[d < e + 1 ? d : e + 1],
                a[d < e + 2 ? d : e + 2],
                g - e
              );
        },
        Utils: {
          Linear: function (a, b, c) {
            return (b - a) * c + a;
          },
          Bernstein: function (a, b) {
            var d = c.Interpolation.Utils.Factorial;
            return d(a) / d(b) / d(a - b);
          },
          Factorial: (function () {
            var a = [1];
            return function (b) {
              var c = 1;
              if (a[b]) return a[b];
              for (var d = b; 1 < d; d--) c *= d;
              return (a[b] = c);
            };
          })(),
          CatmullRom: function (a, b, c, e, m) {
            a = 0.5 * (c - a);
            e = 0.5 * (e - b);
            var d = m * m;
            return (
              (2 * b - 2 * c + a + e) * m * d +
              (-3 * b + 3 * c - 2 * a - e) * d +
              a * m +
              b
            );
          },
        },
      };
      a.exports = c;
    });
    z.prototype = Object.assign(Object.create(e.Sprite.prototype), {
      constructor: z,
      setContainer: function (a) {
        if (a instanceof HTMLElement) var b = a;
        else a && a.container && (b = a.container);
        b && this.element && b.appendChild(this.element);
        this.container = b;
      },
      getContainer: function () {
        return this.container;
      },
      onClick: function (a) {
        this.element &&
          this.getContainer() &&
          (this.onHoverStart(a), this.lockHoverElement());
      },
      onDismiss: function () {
        this.element && (this.unlockHoverElement(), this.onHoverEnd());
      },
      onHover: function () {},
      onHoverStart: function (a) {
        if (this.getContainer()) {
          var b =
              this.cursorStyle ||
              (this.mode === t.NORMAL ? "pointer" : "default"),
            c = this.scaleDownAnimation,
            d = this.scaleUpAnimation,
            g = this.element;
          this.isHovering = !0;
          this.container.style.cursor = b;
          this.animated && (c.stop(), d.start());
          g &&
            0 <= a.mouseEvent.clientX &&
            0 <= a.mouseEvent.clientY &&
            ((a = g.left),
            (b = g.right),
            (c = g.style),
            this.mode === t.CARDBOARD || this.mode === t.STEREO
              ? ((c.display = "none"),
                (a.style.display = "block"),
                (b.style.display = "block"),
                (g._width = a.clientWidth),
                (g._height = a.clientHeight))
              : ((c.display = "block"),
                a && (a.style.display = "none"),
                b && (b.style.display = "none"),
                (g._width = g.clientWidth),
                (g._height = g.clientHeight)));
        }
      },
      onHoverEnd: function () {
        if (this.getContainer()) {
          var a = this.scaleDownAnimation,
            b = this.scaleUpAnimation,
            c = this.element;
          this.isHovering = !1;
          this.container.style.cursor = "default";
          this.animated && (b.stop(), a.start());
          c &&
            !this.element.locked &&
            ((a = c.left),
            (b = c.right),
            (c.style.display = "none"),
            a && (a.style.display = "none"),
            b && (b.style.display = "none"),
            this.unlockHoverElement());
        }
      },
      onDualEyeEffect: function (a) {
        if (this.getContainer()) {
          this.mode = a.mode;
          a = this.element;
          var b = this.container.clientWidth / 2;
          var c = this.container.clientHeight / 2;
          a &&
            (a.left ||
              a.right ||
              ((a.left = a.cloneNode(!0)), (a.right = a.cloneNode(!0))),
            this.mode === t.CARDBOARD || this.mode === t.STEREO
              ? ((a.left.style.display = a.style.display),
                (a.right.style.display = a.style.display),
                (a.style.display = "none"))
              : ((a.style.display = a.left.style.display),
                (a.left.style.display = "none"),
                (a.right.style.display = "none")),
            this.translateElement(b, c),
            this.container.appendChild(a.left),
            this.container.appendChild(a.right));
        }
      },
      translateElement: function (a, b) {
        if (this.element._width && this.element._height && this.getContainer()) {
          var c = this.container;
          var d = this.element;
          var g = d._width / 2;
          var e = d._height / 2;
          var p = void 0 !== d.verticalDelta ? d.verticalDelta : 40;
          var m = a - g;
          var l = b - e - p;
          (this.mode !== t.CARDBOARD && this.mode !== t.STEREO) ||
          !d.left ||
          !d.right ||
          (a === c.clientWidth / 2 && b === c.clientHeight / 2)
            ? this.setElementStyle(
                "transform",
                d,
                "translate(" + m + "px, " + l + "px)"
              )
            : ((m = c.clientWidth / 4 - g + (a - c.clientWidth / 2)),
              (l = c.clientHeight / 2 - e - p + (b - c.clientHeight / 2)),
              this.setElementStyle(
                "transform",
                d.left,
                "translate(" + m + "px, " + l + "px)"
              ),
              (m += c.clientWidth / 2),
              this.setElementStyle(
                "transform",
                d.right,
                "translate(" + m + "px, " + l + "px)"
              ));
        }
      },
      setElementStyle: function (a, b, c) {
        b = b.style;
        "transform" === a &&
          (b.webkitTransform = b.msTransform = b.transform = c);
      },
      setText: function (a) {
        this.element && (this.element.textContent = a);
      },
      setCursorHoverStyle: function (a) {
        this.cursorStyle = a;
      },
      addHoverText: function (a, b) {
        b = void 0 === b ? 40 : b;
        this.element ||
          ((this.element = document.createElement("div")),
          (this.element.style.display = "none"),
          (this.element.style.color = "#fff"),
          (this.element.style.top = 0),
          (this.element.style.maxWidth = "50%"),
          (this.element.style.maxHeight = "50%"),
          (this.element.style.textShadow = "0 0 3px #000000"),
          (this.element.style.fontFamily =
            '"Trebuchet MS", Helvetica, sans-serif'),
          (this.element.style.position = "absolute"),
          this.element.classList.add("panolens-infospot"),
          (this.element.verticalDelta = b));
        this.setText(a);
      },
      addHoverElement: function (a, b) {
        b = void 0 === b ? 40 : b;
        this.element ||
          ((this.element = a.cloneNode(!0)),
          (this.element.style.display = "none"),
          (this.element.style.top = 0),
          (this.element.style.position = "absolute"),
          this.element.classList.add("panolens-infospot"),
          (this.element.verticalDelta = b));
      },
      removeHoverElement: function () {
        this.element &&
          (this.element.left &&
            (this.container.removeChild(this.element.left),
            (this.element.left = null)),
          this.element.right &&
            (this.container.removeChild(this.element.right),
            (this.element.right = null)),
          this.container.removeChild(this.element),
          (this.element = null));
      },
      lockHoverElement: function () {
        this.element && (this.element.locked = !0);
      },
      unlockHoverElement: function () {
        this.element && (this.element.locked = !1);
      },
      enableRaycast: function (a) {
        this.raycast = void 0 === a || a ? this.originalRaycast : function () {};
      },
      show: function (a) {
        a = void 0 === a ? 0 : a;
        var b = this.hideAnimation,
          c = this.showAnimation,
          d = this.material;
        this.animated
          ? (b.stop(), c.delay(a).start())
          : (this.enableRaycast(!0), (d.opacity = 1));
      },
      hide: function (a) {
        a = void 0 === a ? 0 : a;
        var b = this.hideAnimation,
          c = this.showAnimation,
          d = this.material;
        this.animated
          ? (c.stop(), b.delay(a).start())
          : (this.enableRaycast(!1), (d.opacity = 0));
      },
      setFocusMethod: function (a) {
        a && (this.HANDLER_FOCUS = a.method);
      },
      focus: function (a, b) {
        this.HANDLER_FOCUS &&
          (this.HANDLER_FOCUS(this.position, a, b), this.onDismiss());
      },
      dispose: function () {
        var a = this.geometry,
          b = this.material,
          c = b.map;
        this.removeHoverElement();
        this.parent && this.parent.remove(this);
        c && (c.dispose(), (b.map = null));
        a && (a.dispose(), (this.geometry = null));
        b && (b.dispose(), (this.material = null));
      },
    });
    I.prototype = Object.assign(Object.create(e.EventDispatcher.prototype), {
      constructor: I,
      addControlBar: function () {
        if (this.container) {
          var a = this,
            b,
            c;
          var d = document.createElement("div");
          d.style.width = "100%";
          d.style.height = "44px";
          d.style.float = "left";
          d.style.transform =
            d.style.webkitTransform =
            d.style.msTransform =
              "translateY(-100%)";
          d.style.background =
            "-webkit-linear-gradient(bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))";
          d.style.background =
            "-moz-linear-gradient(bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))";
          d.style.background =
            "-o-linear-gradient(bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))";
          d.style.background =
            "-ms-linear-gradient(bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))";
          d.style.background =
            "linear-gradient(bottom, rgba(0,0,0,0.2), rgba(0,0,0,0))";
          d.style.transition = this.DEFAULT_TRANSITION;
          d.style.pointerEvents = "none";
          d.isHidden = !1;
          d.toggle = function () {
            d.isHidden = !d.isHidden;
            b = d.isHidden ? "translateY(0)" : "translateY(-100%)";
            c = d.isHidden ? 0 : 1;
            d.style.transform = d.style.webkitTransform = d.style.msTransform = b;
            d.style.opacity = c;
          };
          var g = this.createDefaultMenu();
          this.mainMenu = this.createMainMenu(g);
          d.appendChild(this.mainMenu);
          this.mask = g = this.createMask();
          this.container.appendChild(g);
          d.dispose = function () {
            a.fullscreenElement &&
              (d.removeChild(a.fullscreenElement),
              a.fullscreenElement.dispose(),
              (a.fullscreenElement = null));
            a.settingElement &&
              (d.removeChild(a.settingElement),
              a.settingElement.dispose(),
              (a.settingElement = null));
            a.videoElement &&
              (d.removeChild(a.videoElement),
              a.videoElement.dispose(),
              (a.videoElement = null));
          };
          this.container.appendChild(d);
          this.mask.addEventListener("mousemove", this.PREVENT_EVENT_HANDLER, !0);
          this.mask.addEventListener("mouseup", this.PREVENT_EVENT_HANDLER, !0);
          this.mask.addEventListener("mousedown", this.PREVENT_EVENT_HANDLER, !0);
          this.mask.addEventListener(
            a.TOUCH_ENABLED ? "touchend" : "click",
            function (b) {
              b.preventDefault();
              b.stopPropagation();
              a.mask.hide();
              a.settingElement.deactivate();
            },
            !1
          );
          this.addEventListener("control-bar-toggle", d.toggle);
          this.barElement = d;
        } else console.warn("Widget container not set");
      },
      createDefaultMenu: function () {
        var a = this;
        var b = function (b, d) {
          return function () {
            a.dispatchEvent({
              type: "panolens-viewer-handler",
              method: b,
              data: d,
            });
          };
        };
        return [
          {
            title: "Control",
            subMenu: [
              {
                title: this.TOUCH_ENABLED ? "Touch" : "Mouse",
                handler: b("enableControl", E.ORBIT),
              },
              {
                title: "Sensor",
                handler: b("enableControl", E.DEVICEORIENTATION),
              },
            ],
          },
          {
            title: "Mode",
            subMenu: [
              { title: "Normal", handler: b("disableEffect") },
              { title: "Cardboard", handler: b("enableEffect", t.CARDBOARD) },
              { title: "Stereoscopic", handler: b("enableEffect", t.STEREO) },
            ],
          },
        ];
      },
      addControlButton: function (a) {
        switch (a) {
          case "fullscreen":
            this.fullscreenElement = a = this.createFullscreenButton();
            break;
          case "setting":
            this.settingElement = a = this.createSettingButton();
            break;
          case "video":
            this.videoElement = a = this.createVideoControl();
            break;
          default:
            return;
        }
        a && this.barElement.appendChild(a);
      },
      createMask: function () {
        var a = document.createElement("div");
        a.style.position = "absolute";
        a.style.top = 0;
        a.style.left = 0;
        a.style.width = "100%";
        a.style.height = "100%";
        a.style.background = "transparent";
        a.style.display = "none";
        a.show = function () {
          this.style.display = "block";
        };
        a.hide = function () {
          this.style.display = "none";
        };
        return a;
      },
      createSettingButton: function () {
        var a = this;
        var b = this.createCustomItem({
          style: {
            backgroundImage: 'url("' + u.Setting + '")',
            webkitTransition: this.DEFAULT_TRANSITION,
            transition: this.DEFAULT_TRANSITION,
          },
          onTap: function (b) {
            b.preventDefault();
            b.stopPropagation();
            a.mainMenu.toggle();
            this.activated ? this.deactivate() : this.activate();
          },
        });
        b.activate = function () {
          this.style.transform = "rotate3d(0,0,1,90deg)";
          this.activated = !0;
          a.mask.show();
        };
        b.deactivate = function () {
          this.style.transform = "rotate3d(0,0,0,0)";
          this.activated = !1;
          a.mask.hide();
          a.mainMenu && a.mainMenu.visible && a.mainMenu.hide();
          a.activeSubMenu && a.activeSubMenu.visible && a.activeSubMenu.hide();
          a.mainMenu &&
            a.mainMenu._width &&
            (a.mainMenu.changeSize(a.mainMenu._width), a.mainMenu.unslideAll());
        };
        b.activated = !1;
        return b;
      },
      createFullscreenButton: function () {
        function a() {
          d &&
            ((c = !c),
            (e.style.backgroundImage = c
              ? 'url("' + u.FullscreenLeave + '")'
              : 'url("' + u.FullscreenEnter + '")'));
          b.dispatchEvent({
            type: "panolens-viewer-handler",
            method: "onWindowResize",
          });
          d = !0;
        }
        var b = this,
          c = !1,
          d = !0,
          g = this.container;
        if (
          document.fullscreenEnabled ||
          document.webkitFullscreenEnabled ||
          document.mozFullScreenEnabled ||
          document.msFullscreenEnabled
        ) {
          document.addEventListener("fullscreenchange", a, !1);
          document.addEventListener("webkitfullscreenchange", a, !1);
          document.addEventListener("mozfullscreenchange", a, !1);
          document.addEventListener("MSFullscreenChange", a, !1);
          var e = this.createCustomItem({
            style: { backgroundImage: 'url("' + u.FullscreenEnter + '")' },
            onTap: function (a) {
              a.preventDefault();
              a.stopPropagation();
              d = !1;
              c
                ? (document.exitFullscreen && document.exitFullscreen(),
                  document.msExitFullscreen && document.msExitFullscreen(),
                  document.mozCancelFullScreen && document.mozCancelFullScreen(),
                  document.webkitExitFullscreen &&
                    document.webkitExitFullscreen(),
                  (c = !1))
                : (g.requestFullscreen && g.requestFullscreen(),
                  g.msRequestFullscreen && g.msRequestFullscreen(),
                  g.mozRequestFullScreen && g.mozRequestFullScreen(),
                  g.webkitRequestFullscreen &&
                    g.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT),
                  (c = !0));
              this.style.backgroundImage = c
                ? 'url("' + u.FullscreenLeave + '")'
                : 'url("' + u.FullscreenEnter + '")';
            },
          });
          if (!document.querySelector("panolens-style-addon")) {
            var p = document.createElement("style");
            p.id = "panolens-style-addon";
            p.innerHTML =
              ":-webkit-full-screen { width: 100% !important; height: 100% !important }";
            document.body.appendChild(p);
          }
          return e;
        }
      },
      createVideoControl: function () {
        var a = document.createElement("span");
        a.style.display = "none";
        a.show = function () {
          a.style.display = "";
        };
        a.hide = function () {
          a.style.display = "none";
          a.controlButton.paused = !0;
          a.controlButton.update();
        };
        a.controlButton = this.createVideoControlButton();
        a.seekBar = this.createVideoControlSeekbar();
        a.appendChild(a.controlButton);
        a.appendChild(a.seekBar);
        a.dispose = function () {
          a.removeChild(a.controlButton);
          a.removeChild(a.seekBar);
          a.controlButton.dispose();
          a.controlButton = null;
          a.seekBar.dispose();
          a.seekBar = null;
        };
        this.addEventListener("video-control-show", a.show);
        this.addEventListener("video-control-hide", a.hide);
        return a;
      },
      createVideoControlButton: function () {
        var a = this,
          b = this.createCustomItem({
            style: {
              float: "left",
              backgroundImage: 'url("' + u.VideoPlay + '")',
            },
            onTap: function (c) {
              c.preventDefault();
              c.stopPropagation();
              a.dispatchEvent({
                type: "panolens-viewer-handler",
                method: "toggleVideoPlay",
                data: !this.paused,
              });
              this.paused = !this.paused;
              b.update();
            },
          });
        b.paused = !0;
        b.update = function (a) {
          this.paused = void 0 !== a ? a : this.paused;
          this.style.backgroundImage =
            'url("' + (this.paused ? u.VideoPlay : u.VideoPause) + '")';
        };
        return b;
      },
      createVideoControlSeekbar: function () {
        function a(a) {
          a.stopPropagation();
          e = !0;
          p = a.clientX || (a.changedTouches && a.changedTouches[0].clientX);
          m = parseInt(h.style.width) / 100;
          g.container.addEventListener("mousemove", b, { passive: !0 });
          g.container.addEventListener("mouseup", c, { passive: !0 });
          g.container.addEventListener("touchmove", b, { passive: !0 });
          g.container.addEventListener("touchend", c, { passive: !0 });
        }
        function b(a) {
          e &&
            ((l =
              ((a.clientX || (a.changedTouches && a.changedTouches[0].clientX)) -
                p) /
              f.clientWidth),
            (l = m + l),
            (l = 1 < l ? 1 : 0 > l ? 0 : l),
            f.setProgress(l),
            g.dispatchEvent({
              type: "panolens-viewer-handler",
              method: "setVideoCurrentTime",
              data: l,
            }));
        }
        function c(a) {
          a.stopPropagation();
          e = !1;
          d();
        }
        function d() {
          g.container.removeEventListener("mousemove", b, !1);
          g.container.removeEventListener("mouseup", c, !1);
          g.container.removeEventListener("touchmove", b, !1);
          g.container.removeEventListener("touchend", c, !1);
        }
        var g = this,
          e = !1,
          p,
          m,
          l;
        var h = document.createElement("div");
        h.style.width = "0%";
        h.style.height = "100%";
        h.style.backgroundColor = "#fff";
        var q = document.createElement("div");
        q.style.float = "right";
        q.style.width = "14px";
        q.style.height = "14px";
        q.style.transform = "translate(7px, -5px)";
        q.style.borderRadius = "50%";
        q.style.backgroundColor = "#ddd";
        q.addEventListener("mousedown", a, { passive: !0 });
        q.addEventListener("touchstart", a, { passive: !0 });
        h.appendChild(q);
        var f = this.createCustomItem({
          style: {
            float: "left",
            width: "30%",
            height: "4px",
            marginTop: "20px",
            backgroundColor: "rgba(188,188,188,0.8)",
          },
          onTap: function (a) {
            a.preventDefault();
            a.stopPropagation();
            if (a.target !== q) {
              var b =
                a.changedTouches && 0 < a.changedTouches.length
                  ? (a.changedTouches[0].pageX -
                      a.target.getBoundingClientRect().left) /
                    this.clientWidth
                  : a.offsetX / this.clientWidth;
              g.dispatchEvent({
                type: "panolens-viewer-handler",
                method: "setVideoCurrentTime",
                data: b,
              });
              f.setProgress(a.offsetX / this.clientWidth);
            }
          },
          onDispose: function () {
            d();
            q = h = null;
          },
        });
        f.appendChild(h);
        f.setProgress = function (a) {
          h.style.width = 100 * a + "%";
        };
        this.addEventListener("video-update", function (a) {
          f.setProgress(a.percentage);
        });
        f.progressElement = h;
        f.progressElementControl = q;
        return f;
      },
      createMenuItem: function (a) {
        var b = this,
          c = document.createElement("a");
        c.textContent = a;
        c.style.display = "block";
        c.style.padding = "10px";
        c.style.textDecoration = "none";
        c.style.cursor = "pointer";
        c.style.pointerEvents = "auto";
        c.style.transition = this.DEFAULT_TRANSITION;
        c.slide = function (a) {
          this.style.transform = "translateX(" + (a ? "" : "-") + "100%)";
        };
        c.unslide = function () {
          this.style.transform = "translateX(0)";
        };
        c.setIcon = function (a) {
          this.icon && (this.icon.style.backgroundImage = "url(" + a + ")");
        };
        c.setSelectionTitle = function (a) {
          this.selection && (this.selection.textContent = a);
        };
        c.addSelection = function (a) {
          var b = document.createElement("span");
          b.style.fontSize = "13px";
          b.style.fontWeight = "300";
          b.style.float = "right";
          this.selection = b;
          this.setSelectionTitle(a);
          this.appendChild(b);
          return this;
        };
        c.addIcon = function (a, b, c) {
          a = void 0 === a ? u.ChevronRight : a;
          b = void 0 === b ? !1 : b;
          c = void 0 === c ? !1 : c;
          var d = document.createElement("span");
          d.style.float = b ? "left" : "right";
          d.style.width = "17px";
          d.style.height = "17px";
          d.style["margin" + (b ? "Right" : "Left")] = "12px";
          d.style.backgroundSize = "cover";
          c && (d.style.transform = "rotateZ(180deg)");
          this.icon = d;
          this.setIcon(a);
          this.appendChild(d);
          return this;
        };
        c.addSubMenu = function (a, c) {
          this.subMenu = b.createSubMenu(a, c);
          return this;
        };
        c.addEventListener(
          "mouseenter",
          function () {
            this.style.backgroundColor = "#e0e0e0";
          },
          !1
        );
        c.addEventListener(
          "mouseleave",
          function () {
            this.style.backgroundColor = "#fafafa";
          },
          !1
        );
        return c;
      },
      createMenuItemHeader: function (a) {
        a = this.createMenuItem(a);
        a.style.borderBottom = "1px solid #333";
        a.style.paddingBottom = "15px";
        return a;
      },
      createMainMenu: function (a) {
        function b(a) {
          a.preventDefault();
          a.stopPropagation();
          var b = c.mainMenu,
            d = this.subMenu;
          b.hide();
          b.slideAll();
          b.parentElement.appendChild(d);
          c.activeMainItem = this;
          c.activeSubMenu = d;
          window.requestAnimationFrame(function () {
            b.changeSize(d.clientWidth);
            d.show();
            d.unslideAll();
          });
        }
        var c = this,
          d = this.createMenu();
        d._width = 200;
        d.changeSize(d._width);
        for (var e = 0; e < a.length; e++) {
          var k = d.addItem(a[e].title);
          k.style.paddingLeft = "20px";
          k.addIcon().addEventListener(
            c.TOUCH_ENABLED ? "touchend" : "click",
            b,
            !1
          );
          a[e].subMenu &&
            0 < a[e].subMenu.length &&
            k
              .addSelection(a[e].subMenu[0].title)
              .addSubMenu(a[e].title, a[e].subMenu);
        }
        return d;
      },
      createSubMenu: function (a, b) {
        function c(a) {
          a.preventDefault();
          a.stopPropagation();
          e = d.mainMenu;
          e.changeSize(e._width);
          e.unslideAll();
          e.show();
          k.slideAll(!0);
          k.hide();
          "header" !== this.type &&
            (k.setActiveItem(this),
            d.activeMainItem.setSelectionTitle(this.textContent),
            this.handler && this.handler());
        }
        var d = this,
          e,
          k = this.createMenu();
        k.items = b;
        k.activeItem = null;
        k.addHeader(a)
          .addIcon(void 0, !0, !0)
          .addEventListener(d.TOUCH_ENABLED ? "touchend" : "click", c, !1);
        for (a = 0; a < b.length; a++) {
          var h = k.addItem(b[a].title);
          h.style.fontWeight = 300;
          h.handler = b[a].handler;
          h.addIcon(" ", !0);
          h.addEventListener(d.TOUCH_ENABLED ? "touchend" : "click", c, !1);
          k.activeItem || k.setActiveItem(h);
        }
        k.slideAll(!0);
        return k;
      },
      createMenu: function () {
        var a = this,
          b = document.createElement("span"),
          c = b.style;
        c.padding = "5px 0";
        c.position = "fixed";
        c.bottom = "100%";
        c.right = "14px";
        c.backgroundColor = "#fafafa";
        c.fontFamily = "Helvetica Neue";
        c.fontSize = "14px";
        c.visibility = "hidden";
        c.opacity = 0;
        c.boxShadow = "0 0 12pt rgba(0,0,0,0.25)";
        c.borderRadius = "2px";
        c.overflow = "hidden";
        c.willChange = "width, height, opacity";
        c.pointerEvents = "auto";
        c.transition = this.DEFAULT_TRANSITION;
        b.visible = !1;
        b.changeSize = function (a, b) {
          a && (this.style.width = a + "px");
          b && (this.style.height = b + "px");
        };
        b.show = function () {
          this.style.opacity = 1;
          this.style.visibility = "visible";
          this.visible = !0;
        };
        b.hide = function () {
          this.style.opacity = 0;
          this.style.visibility = "hidden";
          this.visible = !1;
        };
        b.toggle = function () {
          this.visible ? this.hide() : this.show();
        };
        b.slideAll = function (a) {
          for (var c = 0; c < b.children.length; c++)
            b.children[c].slide && b.children[c].slide(a);
        };
        b.unslideAll = function () {
          for (var a = 0; a < b.children.length; a++)
            b.children[a].unslide && b.children[a].unslide();
        };
        b.addHeader = function (b) {
          b = a.createMenuItemHeader(b);
          b.type = "header";
          this.appendChild(b);
          return b;
        };
        b.addItem = function (b) {
          b = a.createMenuItem(b);
          b.type = "item";
          this.appendChild(b);
          return b;
        };
        b.setActiveItem = function (a) {
          this.activeItem && this.activeItem.setIcon(" ");
          a.setIcon(u.Check);
          this.activeItem = a;
        };
        b.addEventListener("mousemove", this.PREVENT_EVENT_HANDLER, !0);
        b.addEventListener("mouseup", this.PREVENT_EVENT_HANDLER, !0);
        b.addEventListener("mousedown", this.PREVENT_EVENT_HANDLER, !0);
        return b;
      },
      createCustomItem: function (a) {
        a = void 0 === a ? {} : a;
        var b = this,
          c = a.element || document.createElement("span"),
          d = a.onDispose;
        c.style.cursor = "pointer";
        c.style.float = "right";
        c.style.width = "44px";
        c.style.height = "100%";
        c.style.backgroundSize = "60%";
        c.style.backgroundRepeat = "no-repeat";
        c.style.backgroundPosition = "center";
        c.style.webkitUserSelect =
          c.style.MozUserSelect =
          c.style.userSelect =
            "none";
        c.style.position = "relative";
        c.style.pointerEvents = "auto";
        c.addEventListener(
          b.TOUCH_ENABLED ? "touchstart" : "mouseenter",
          function () {
            c.style.filter = c.style.webkitFilter =
              "drop-shadow(0 0 5px rgba(255,255,255,1))";
          },
          { passive: !0 }
        );
        c.addEventListener(
          b.TOUCH_ENABLED ? "touchend" : "mouseleave",
          function () {
            c.style.filter = c.style.webkitFilter = "";
          },
          { passive: !0 }
        );
        this.mergeStyleOptions(c, a.style);
        a.onTap &&
          c.addEventListener(b.TOUCH_ENABLED ? "touchend" : "click", a.onTap, !1);
        c.dispose = function () {
          c.removeEventListener(
            b.TOUCH_ENABLED ? "touchend" : "click",
            a.onTap,
            !1
          );
          if (d) a.onDispose();
        };
        return c;
      },
      mergeStyleOptions: function (a, b) {
        b = void 0 === b ? {} : b;
        for (var c in b) b.hasOwnProperty(c) && (a.style[c] = b[c]);
        return a;
      },
      dispose: function () {
        this.barElement &&
          (this.container.removeChild(this.barElement),
          this.barElement.dispose(),
          (this.barElement = null));
      },
    });
    n.prototype = Object.assign(Object.create(e.Mesh.prototype), {
      constructor: n,
      add: function (a) {
        var b;
        if (1 < arguments.length) {
          for (b = 0; b < arguments.length; b++) this.add(arguments[b]);
          return this;
        }
        if (a instanceof z) {
          if (((b = a), a.dispatchEvent)) {
            var c = this.container;
            c && a.dispatchEvent({ type: "panolens-container", container: c });
            a.dispatchEvent({
              type: "panolens-infospot-focus",
              method: function (a, b, c) {
                this.dispatchEvent({
                  type: "panolens-viewer-handler",
                  method: "tweenControlCenter",
                  data: [a, b, c],
                });
              }.bind(this),
            });
          }
        } else
          (b = new e.Object3D()),
            (b.scale.x = -1),
            (b.scalePlaceHolder = !0),
            b.add(a);
        e.Object3D.prototype.add.call(this, b);
      },
      load: function () {
        this.onLoad();
      },
      onClick: function (a) {
        a.intersects &&
          0 === a.intersects.length &&
          this.traverse(function (a) {
            a.dispatchEvent({ type: "dismiss" });
          });
      },
      setContainer: function (a) {
        if (a instanceof HTMLElement) var b = a;
        else a && a.container && (b = a.container);
        b &&
          (this.children.forEach(function (a) {
            a instanceof z &&
              a.dispatchEvent &&
              a.dispatchEvent({ type: "panolens-container", container: b });
          }),
          (this.container = b));
      },
      onLoad: function () {
        this.loaded = !0;
        this.dispatchEvent({ type: "load" });
      },
      onProgress: function (a) {
        this.dispatchEvent({ type: "progress", progress: a });
      },
      onError: function () {
        this.dispatchEvent({ type: "error" });
      },
      getZoomLevel: function () {
        return 800 >= window.innerWidth
          ? this.ImageQualityFair
          : 800 < window.innerWidth && 1280 >= window.innerWidth
          ? this.ImageQualityMedium
          : 1280 < window.innerWidth && 1920 >= window.innerWidth
          ? this.ImageQualityHigh
          : 1920 < window.innerWidth
          ? this.ImageQualitySuperHigh
          : this.ImageQualityLow;
      },
      updateTexture: function (a) {
        this.material.map = a;
        this.material.needsUpdate = !0;
      },
      toggleInfospotVisibility: function (a, b) {
        b = void 0 !== b ? b : 0;
        var c = void 0 !== a ? a : this.isInfospotVisible ? !1 : !0;
        this.traverse(function (a) {
          a instanceof z && (c ? a.show(b) : a.hide(b));
        });
        this.isInfospotVisible = c;
        this.infospotAnimation
          .onComplete(
            function () {
              this.dispatchEvent({
                type: "infospot-animation-complete",
                visible: c,
              });
            }.bind(this)
          )
          .delay(b)
          .start();
      },
      setLinkingImage: function (a, b) {
        this.linkingImageURL = a;
        this.linkingImageScale = b;
      },
      link: function (a, b, c, d) {
        this.visible = !0;
        b
          ? ((c =
              void 0 !== c
                ? c
                : void 0 !== a.linkingImageScale
                ? a.linkingImageScale
                : 300),
            (d = d ? d : a.linkingImageURL ? a.linkingImageURL : u.Arrow),
            (d = new z(c, d)),
            d.position.copy(b),
            (d.toPanorama = a),
            d.addEventListener(
              "click",
              function () {
                this.dispatchEvent({
                  type: "panolens-viewer-handler",
                  method: "setPanorama",
                  data: a,
                });
              }.bind(this)
            ),
            this.linkedSpots.push(d),
            this.add(d),
            (this.visible = !1))
          : console.warn("Please specify infospot position for linking");
      },
      reset: function () {
        this.children.length = 0;
      },
      setupTransitions: function () {
        this.fadeInAnimation = new r.Tween(this.material)
          .easing(r.Easing.Quartic.Out)
          .onStart(
            function () {
              this.visible = !0;
              this.dispatchEvent({ type: "enter-fade-start" });
            }.bind(this)
          );
        this.fadeOutAnimation = new r.Tween(this.material)
          .easing(r.Easing.Quartic.Out)
          .onComplete(
            function () {
              this.visible = !1;
              this.dispatchEvent({ type: "leave-complete" });
            }.bind(this)
          );
        this.enterTransition = new r.Tween(this)
          .easing(r.Easing.Quartic.Out)
          .onComplete(
            function () {
              this.dispatchEvent({ type: "enter-complete" });
            }.bind(this)
          )
          .start();
        this.leaveTransition = new r.Tween(this).easing(r.Easing.Quartic.Out);
      },
      onFadeAnimationUpdate: function () {
        var a = this.material.opacity,
          b = this.material.uniforms;
        b && b.opacity && (b.opacity.value = a);
      },
      fadeIn: function (a) {
        a = 0 <= a ? a : this.animationDuration;
        this.fadeOutAnimation.stop();
        this.fadeInAnimation
          .to({ opacity: 1 }, a)
          .onUpdate(this.onFadeAnimationUpdate.bind(this))
          .onComplete(
            function () {
              this.toggleInfospotVisibility(!0, a / 2);
              this.dispatchEvent({ type: "enter-fade-complete" });
            }.bind(this)
          )
          .start();
      },
      fadeOut: function (a) {
        a = 0 <= a ? a : this.animationDuration;
        this.fadeInAnimation.stop();
        this.fadeOutAnimation
          .to({ opacity: 0 }, a)
          .onUpdate(this.onFadeAnimationUpdate.bind(this))
          .start();
      },
      onEnter: function () {
        var a = this.animationDuration;
        this.leaveTransition.stop();
        this.enterTransition
          .to({}, a)
          .onStart(
            function () {
              this.dispatchEvent({ type: "enter-start" });
              this.loaded ? this.fadeIn(a) : this.load();
            }.bind(this)
          )
          .start();
        this.dispatchEvent({ type: "enter" });
        this.children.forEach(function (a) {
          a.dispatchEvent({ type: "panorama-enter" });
        });
        this.active = !0;
      },
      onLeave: function () {
        var a = this.animationDuration;
        this.enterTransition.stop();
        this.leaveTransition
          .to({}, a)
          .onStart(
            function () {
              this.dispatchEvent({ type: "leave-start" });
              this.fadeOut(a);
              this.toggleInfospotVisibility(!1);
            }.bind(this)
          )
          .start();
        this.dispatchEvent({ type: "leave" });
        this.children.forEach(function (a) {
          a.dispatchEvent({ type: "panorama-leave" });
        });
        this.active = !1;
      },
      dispose: function () {
        function a(b) {
          for (
            var c = b.geometry, d = b.material, e = b.children.length - 1;
            0 <= e;
            e--
          )
            a(b.children[e]), b.remove(b.children[e]);
          b instanceof z && b.dispose();
          c && (c.dispose(), (b.geometry = null));
          d && (d.dispose(), (b.material = null));
        }
        this.infospotAnimation.stop();
        this.fadeInAnimation.stop();
        this.fadeOutAnimation.stop();
        this.enterTransition.stop();
        this.leaveTransition.stop();
        this.dispatchEvent({
          type: "panolens-viewer-handler",
          method: "onPanoramaDispose",
          data: this,
        });
        a(this);
        this.parent && this.parent.remove(this);
      },
    });
    y.prototype = Object.assign(Object.create(n.prototype), {
      constructor: y,
      load: function (a) {
        a = a || this.src;
        if (!a) console.warn("Image source undefined");
        else if ("string" === typeof a)
          N.load(
            a,
            this.onLoad.bind(this),
            this.onProgress.bind(this),
            this.onError.bind(this)
          );
        else if (a instanceof HTMLImageElement) this.onLoad(new e.Texture(a));
      },
      onLoad: function (a) {
        a.minFilter = a.magFilter = e.LinearFilter;
        a.needsUpdate = !0;
        this.updateTexture(a);
        window.requestAnimationFrame(n.prototype.onLoad.bind(this));
      },
      reset: function () {
        n.prototype.reset.call(this);
      },
      dispose: function () {
        var a = this.material.map;
        e.Cache.remove(this.src);
        a && a.dispose();
        n.prototype.dispose.call(this);
      },
    });
    W.prototype = Object.assign(Object.create(n.prototype), { constructor: W });
    F.prototype = Object.assign(Object.create(n.prototype), {
      constructor: F,
      load: function () {
        fa.load(
          this.images,
          this.onLoad.bind(this),
          this.onProgress.bind(this),
          this.onError.bind(this)
        );
      },
      onLoad: function (a) {
        this.material.uniforms.tCube.value = a;
        n.prototype.onLoad.call(this);
      },
      dispose: function () {
        var a = this.material.uniforms.tCube.value;
        this.images.forEach(function (a) {
          e.Cache.remove(a);
        });
        a instanceof e.CubeTexture && a.dispose();
        n.prototype.dispose.call(this);
      },
    });
    O.prototype = Object.assign(Object.create(F.prototype), { constructor: O });
    B.prototype = Object.assign(Object.create(n.prototype), {
      constructor: B,
      isMobile: function () {
        var a = !1,
          b =
            window.navigator.userAgent || window.navigator.vendor || window.opera;
        if (
          /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
            b
          ) ||
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
            b.substr(0, 4)
          )
        )
          a = !0;
        return a;
      },
      load: function () {
        var a = this.options,
          b = a.muted,
          c = a.loop,
          d = a.autoplay,
          e = a.playsinline;
        a = a.crossOrigin;
        var k = this.videoElement,
          h = this.material,
          m = this.onProgress.bind(this),
          l = this.onLoad.bind(this);
        k.loop = c;
        k.autoplay = d;
        k.playsinline = e;
        k.crossOrigin = a;
        k.muted = b;
        e &&
          (k.setAttribute("playsinline", ""),
          k.setAttribute("webkit-playsinline", ""));
        e = function () {
          this.setVideoTexture(k);
          d &&
            this.dispatchEvent({
              type: "panolens-viewer-handler",
              method: "updateVideoPlayButton",
              data: !1,
            });
          this.isMobile() &&
            (k.pause(),
            d && b
              ? this.dispatchEvent({
                  type: "panolens-viewer-handler",
                  method: "updateVideoPlayButton",
                  data: !1,
                })
              : this.dispatchEvent({
                  type: "panolens-viewer-handler",
                  method: "updateVideoPlayButton",
                  data: !0,
                }));
          window.requestAnimationFrame(function () {
            h.map.needsUpdate = !0;
            m({ loaded: 1, total: 1 });
            l();
          });
        };
        2 < k.readyState
          ? e.call(this)
          : (0 === k.querySelectorAll("source").length &&
              ((a = document.createElement("source")),
              (a.src = this.src),
              k.appendChild(a)),
            k.load());
        k.addEventListener("loadeddata", e.bind(this));
        k.addEventListener(
          "timeupdate",
          function () {
            this.videoProgress = 0 <= k.duration ? k.currentTime / k.duration : 0;
            this.dispatchEvent({
              type: "panolens-viewer-handler",
              method: "onVideoUpdate",
              data: this.videoProgress,
            });
          }.bind(this)
        );
        k.addEventListener(
          "ended",
          function () {
            c ||
              (this.resetVideo(),
              this.dispatchEvent({
                type: "panolens-viewer-handler",
                method: "updateVideoPlayButton",
                data: !0,
              }));
          }.bind(this),
          !1
        );
      },
      setVideoTexture: function (a) {
        a &&
          ((a = new e.VideoTexture(a)),
          (a.minFilter = e.LinearFilter),
          (a.magFilter = e.LinearFilter),
          (a.format = e.RGBFormat),
          this.updateTexture(a));
      },
      reset: function () {
        this.videoElement = void 0;
        n.prototype.reset.call(this);
      },
      isVideoPaused: function () {
        return this.videoElement.paused;
      },
      toggleVideo: function () {
        var a = this.videoElement;
        if (a) a[a.paused ? "play" : "pause"]();
      },
      setVideoCurrentTime: function (a) {
        a = a.percentage;
        var b = this.videoElement;
        b &&
          !Number.isNaN(a) &&
          1 !== a &&
          ((b.currentTime = b.duration * a),
          this.dispatchEvent({
            type: "panolens-viewer-handler",
            method: "onVideoUpdate",
            data: a,
          }));
      },
      playVideo: function () {
        var a = this.videoElement,
          b = this.playVideo.bind(this),
          c = this.dispatchEvent.bind(this),
          d = function () {
            c({ type: "play" });
          },
          e = function (a) {
            window.requestAnimationFrame(b);
            c({ type: "play-error", error: a });
          };
        a && a.paused && a.play().then(d).catch(e);
      },
      pauseVideo: function () {
        var a = this.videoElement;
        a && !a.paused && a.pause();
        this.dispatchEvent({ type: "pause" });
      },
      resumeVideoProgress: function () {
        var a = this.videoElement;
        4 <= a.readyState && a.autoplay && !this.isMobile()
          ? (this.playVideo(),
            this.dispatchEvent({
              type: "panolens-viewer-handler",
              method: "updateVideoPlayButton",
              data: !1,
            }))
          : (this.pauseVideo(),
            this.dispatchEvent({
              type: "panolens-viewer-handler",
              method: "updateVideoPlayButton",
              data: !0,
            }));
        this.setVideoCurrentTime({ percentage: this.videoProgress });
      },
      resetVideo: function () {
        this.videoElement && this.setVideoCurrentTime({ percentage: 0 });
      },
      isVideoMuted: function () {
        return this.videoElement.muted;
      },
      muteVideo: function () {
        var a = this.videoElement;
        a && !a.muted && (a.muted = !0);
        this.dispatchEvent({ type: "volumechange" });
      },
      unmuteVideo: function () {
        var a = this.videoElement;
        a && this.isVideoMuted() && (a.muted = !1);
        this.dispatchEvent({ type: "volumechange" });
      },
      getVideoElement: function () {
        return this.videoElement;
      },
      dispose: function () {
        var a = this.material.map;
        this.pauseVideo();
        this.removeEventListener("leave", this.pauseVideo.bind(this));
        this.removeEventListener(
          "enter-fade-start",
          this.resumeVideoProgress.bind(this)
        );
        this.removeEventListener("video-toggle", this.toggleVideo.bind(this));
        this.removeEventListener(
          "video-time",
          this.setVideoCurrentTime.bind(this)
        );
        a && a.dispose();
        n.prototype.dispose.call(this);
      },
    });
    Object.assign(P.prototype, {
      constructor: P,
      setProgress: function (a, b) {
        if (this.onProgress) this.onProgress({ loaded: a, total: b });
      },
      adaptTextureToZoom: function () {
        var a = this.widths[this._zoom],
          b = this.heights[this._zoom],
          c = this.maxW,
          d = this.maxH;
        this._wc = Math.ceil(a / c);
        this._hc = Math.ceil(b / d);
        for (var e = 0; e < this._hc; e++)
          for (var k = 0; k < this._wc; k++) {
            var h = document.createElement("canvas");
            h.width = k < this._wc - 1 ? c : a - c * k;
            h.height = e < this._hc - 1 ? d : b - d * e;
            this._canvas.push(h);
            this._ctx.push(h.getContext("2d"));
          }
      },
      composeFromTile: function (a, b, c) {
        var d = this.maxW,
          e = this.maxH;
        a *= 512;
        b *= 512;
        var k = Math.floor(a / d),
          h = Math.floor(b / e);
        this._ctx[h * this._wc + k].drawImage(
          c,
          0,
          0,
          c.width,
          c.height,
          a - k * d,
          b - h * e,
          512,
          512
        );
        this.progress();
      },
      progress: function () {
        this._count++;
        this.setProgress(this._count, this._total);
        if (
          this._count === this._total &&
          ((this.canvas = this._canvas),
          (this.panoId = this._panoId),
          (this.zoom = this._zoom),
          this.onPanoramaLoad)
        )
          this.onPanoramaLoad(this._canvas[0]);
      },
      composePanorama: function () {
        this.setProgress(0, 1);
        var a = this.levelsW[this._zoom],
          b = this.levelsH[this._zoom],
          c = this;
        this._count = 0;
        this._total = a * b;
        for (var d = this._parameters.useWebGL, e = 0; e < b; e++)
          for (
            var k = {}, h = 0;
            h < a;
            k = { $jscomp$loop$prop$url$1: k.$jscomp$loop$prop$url$1 }, h++
          )
            (k.$jscomp$loop$prop$url$1 =
              "https://geo0.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&output=tile&zoom=" +
              this._zoom +
              "&x=" +
              h +
              "&y=" +
              e +
              "&panoid=" +
              this._panoId +
              "&nbt&fover=2"),
              (function (a) {
                return function (b, e) {
                  if (d)
                    var g = N.load(a.$jscomp$loop$prop$url$1, null, function () {
                      c.composeFromTile(b, e, g);
                    });
                  else {
                    var f = new Image();
                    f.addEventListener("load", function () {
                      c.composeFromTile(b, e, this);
                    });
                    f.crossOrigin = "";
                    f.src = a.$jscomp$loop$prop$url$1;
                  }
                };
              })(k)(h, e);
      },
      load: function (a) {
        this.loadPano(a);
      },
      loadPano: function (a) {
        var b = this;
        this._panoClient.getPanoramaById(a, function (a, d) {
          d === google.maps.StreetViewStatus.OK &&
            ((b.result = a),
            (b.copyright = a.copyright),
            (b._panoId = a.location.pano),
            b.composePanorama());
        });
      },
      setZoom: function (a) {
        this._zoom = a;
        this.adaptTextureToZoom();
      },
    });
    Z.prototype = Object.assign(Object.create(y.prototype), {
      constructor: Z,
      load: function (a) {
        this.loadRequested = !0;
        ((a = a || this.panoId || {}), this.gsvLoader) && this.loadGSVLoader(a);
      },
      setupGoogleMapAPI: function (a) {
        var b = document.createElement("script");
        b.src = "https://maps.googleapis.com/maps/api/js?";
        b.src += a ? "key=" + a : "";
        b.onreadystatechange = this.setGSVLoader.bind(this);
        b.onload = this.setGSVLoader.bind(this);
        document.querySelector("head").appendChild(b);
      },
      setGSVLoader: function () {
        this.gsvLoader = new P();
        this.loadRequested && this.load();
      },
      getGSVLoader: function () {
        return this.gsvLoader;
      },
      loadGSVLoader: function (a) {
        this.loadRequested = !1;
        this.gsvLoader.onProgress = this.onProgress.bind(this);
        this.gsvLoader.onPanoramaLoad = this.onLoad.bind(this);
        this.gsvLoader.setZoom(this.getZoomLevel());
        this.gsvLoader.load(a);
        this.gsvLoader.loaded = !0;
      },
      onLoad: function (a) {
        y.prototype.onLoad.call(this, new e.Texture(a));
      },
      reset: function () {
        this.gsvLoader = void 0;
        y.prototype.reset.call(this);
      },
    });
    var ka = {
      uniforms: {
        tDiffuse: { value: new e.Texture() },
        resolution: { value: 1 },
        transform: { value: new e.Matrix4() },
        zoom: { value: 1 },
        opacity: { value: 1 },
      },
      vertexShader:
        "varying vec2 vUv;\nvoid main() {\nvUv = uv;\ngl_Position = vec4( position, 1.0 );\n}",
      fragmentShader:
        "uniform sampler2D tDiffuse;\nuniform float resolution;\nuniform mat4 transform;\nuniform float zoom;\nuniform float opacity;\nvarying vec2 vUv;\nconst float PI = 3.141592653589793;\nvoid main(){\nvec2 position = -1.0 +  2.0 * vUv;\nposition *= vec2( zoom * resolution, zoom * 0.5 );\nfloat x2y2 = position.x * position.x + position.y * position.y;\nvec3 sphere_pnt = vec3( 2. * position, x2y2 - 1. ) / ( x2y2 + 1. );\nsphere_pnt = vec3( transform * vec4( sphere_pnt, 1.0 ) );\nvec2 sampleUV = vec2(\n(atan(sphere_pnt.y, sphere_pnt.x) / PI + 1.0) * 0.5,\n(asin(sphere_pnt.z) / PI + 0.5)\n);\ngl_FragColor = texture2D( tDiffuse, sampleUV );\ngl_FragColor.a *= opacity;\n}",
    };
    C.prototype = Object.assign(Object.create(y.prototype), {
      constructor: C,
      add: function (a) {
        if (1 < arguments.length) {
          for (var b = 0; b < arguments.length; b++) this.add(arguments[b]);
          return this;
        }
        a instanceof z && (a.material.depthTest = !1);
        y.prototype.add.call(this, a);
      },
      createGeometry: function (a, b) {
        return new e.PlaneBufferGeometry(a, a * b);
      },
      createMaterial: function (a) {
        var b = Object.assign({}, ka),
          c = b.uniforms;
        c.zoom.value = a;
        c.opacity.value = 0;
        return new e.ShaderMaterial({
          uniforms: c,
          vertexShader: b.vertexShader,
          fragmentShader: b.fragmentShader,
          side: e.BackSide,
          transparent: !0,
        });
      },
      registerMouseEvents: function () {
        this.container.addEventListener(
          "mousedown",
          this.onMouseDown.bind(this),
          { passive: !0 }
        );
        this.container.addEventListener(
          "mousemove",
          this.onMouseMove.bind(this),
          { passive: !0 }
        );
        this.container.addEventListener("mouseup", this.onMouseUp.bind(this), {
          passive: !0,
        });
        this.container.addEventListener(
          "touchstart",
          this.onMouseDown.bind(this),
          { passive: !0 }
        );
        this.container.addEventListener(
          "touchmove",
          this.onMouseMove.bind(this),
          { passive: !0 }
        );
        this.container.addEventListener("touchend", this.onMouseUp.bind(this), {
          passive: !0,
        });
        this.container.addEventListener(
          "mousewheel",
          this.onMouseWheel.bind(this),
          { passive: !1 }
        );
        this.container.addEventListener(
          "DOMMouseScroll",
          this.onMouseWheel.bind(this),
          { passive: !1 }
        );
        this.container.addEventListener(
          "contextmenu",
          this.onContextMenu.bind(this),
          { passive: !0 }
        );
      },
      unregisterMouseEvents: function () {
        this.container.removeEventListener(
          "mousedown",
          this.onMouseDown.bind(this),
          !1
        );
        this.container.removeEventListener(
          "mousemove",
          this.onMouseMove.bind(this),
          !1
        );
        this.container.removeEventListener(
          "mouseup",
          this.onMouseUp.bind(this),
          !1
        );
        this.container.removeEventListener(
          "touchstart",
          this.onMouseDown.bind(this),
          !1
        );
        this.container.removeEventListener(
          "touchmove",
          this.onMouseMove.bind(this),
          !1
        );
        this.container.removeEventListener(
          "touchend",
          this.onMouseUp.bind(this),
          !1
        );
        this.container.removeEventListener(
          "mousewheel",
          this.onMouseWheel.bind(this),
          !1
        );
        this.container.removeEventListener(
          "DOMMouseScroll",
          this.onMouseWheel.bind(this),
          !1
        );
        this.container.removeEventListener(
          "contextmenu",
          this.onContextMenu.bind(this),
          !1
        );
      },
      onMouseDown: function (a) {
        switch ((a.touches && a.touches.length) || 1) {
          case 1:
            var b = 0 <= a.clientX ? a.clientX : a.touches[0].clientX;
            a = 0 <= a.clientY ? a.clientY : a.touches[0].clientY;
            this.dragging = !0;
            this.userMouse.set(b, a);
            break;
          case 2:
            (b = a.touches[0].pageX - a.touches[1].pageX),
              (a = a.touches[0].pageY - a.touches[1].pageY),
              (this.userMouse.pinchDistance = Math.sqrt(b * b + a * a));
        }
        this.onUpdateCallback();
      },
      onMouseMove: function (a) {
        switch ((a.touches && a.touches.length) || 1) {
          case 1:
            var b = 0 <= a.clientX ? a.clientX : a.touches[0].clientX;
            a = 0 <= a.clientY ? a.clientY : a.touches[0].clientY;
            var c = 0.4 * e.Math.degToRad(b - this.userMouse.x),
              d = 0.4 * e.Math.degToRad(a - this.userMouse.y);
            this.dragging &&
              (this.quatA.setFromAxisAngle(this.vectorY, c),
              this.quatB.setFromAxisAngle(this.vectorX, d),
              this.quatCur.multiply(this.quatA).multiply(this.quatB),
              this.userMouse.set(b, a));
            break;
          case 2:
            (b = a.touches[0].pageX - a.touches[1].pageX),
              (a = a.touches[0].pageY - a.touches[1].pageY),
              this.addZoomDelta(
                this.userMouse.pinchDistance - Math.sqrt(b * b + a * a)
              );
        }
      },
      onMouseUp: function () {
        this.dragging = !1;
      },
      onMouseWheel: function (a) {
        a.preventDefault();
        a.stopPropagation();
        var b = 0;
        void 0 !== a.wheelDelta
          ? (b = a.wheelDelta)
          : void 0 !== a.detail && (b = -a.detail);
        this.addZoomDelta(b);
        this.onUpdateCallback();
      },
      addZoomDelta: function (a) {
        var b = this.material.uniforms,
          c = 0.1 * this.size,
          d = 10 * this.size;
        b.zoom.value += a;
        b.zoom.value <= c
          ? (b.zoom.value = c)
          : b.zoom.value >= d && (b.zoom.value = d);
      },
      onUpdateCallback: function () {
        this.frameId = window.requestAnimationFrame(
          this.onUpdateCallback.bind(this)
        );
        this.quatSlerp.slerp(this.quatCur, 0.1);
        this.material &&
          this.material.uniforms.transform.value.makeRotationFromQuaternion(
            this.quatSlerp
          );
        !this.dragging &&
          1 - this.quatSlerp.clone().dot(this.quatCur) < this.EPS &&
          window.cancelAnimationFrame(this.frameId);
      },
      reset: function () {
        this.quatCur.set(0, 0, 0, 1);
        this.quatSlerp.set(0, 0, 0, 1);
        this.onUpdateCallback();
      },
      onLoad: function (a) {
        this.material.uniforms.resolution.value =
          this.container.clientWidth / this.container.clientHeight;
        this.registerMouseEvents();
        this.onUpdateCallback();
        this.dispatchEvent({
          type: "panolens-viewer-handler",
          method: "disableControl",
        });
        y.prototype.onLoad.call(this, a);
      },
      onLeave: function () {
        this.unregisterMouseEvents();
        this.dispatchEvent({
          type: "panolens-viewer-handler",
          method: "enableControl",
          data: E.ORBIT,
        });
        window.cancelAnimationFrame(this.frameId);
        y.prototype.onLeave.call(this);
      },
      onWindowResize: function () {
        this.material.uniforms.resolution.value =
          this.container.clientWidth / this.container.clientHeight;
      },
      onContextMenu: function () {
        this.dragging = !1;
      },
      dispose: function () {
        this.unregisterMouseEvents();
        y.prototype.dispose.call(this);
      },
    });
    aa.prototype = Object.assign(Object.create(C.prototype), {
      constructor: aa,
      onLoad: function (a) {
        this.updateTexture(a);
        C.prototype.onLoad.call(this, a);
      },
      updateTexture: function (a) {
        a.minFilter = a.magFilter = e.LinearFilter;
        this.material.uniforms.tDiffuse.value = a;
      },
      dispose: function () {
        var a = this.material.uniforms.tDiffuse;
        a && a.value && a.value.dispose();
        C.prototype.dispose.call(this);
      },
    });
    J.prototype = Object.assign(Object.create(n.prototype), {
      constructor: J,
      onPanolensContainer: function (a) {
        this.media.setContainer(a.container);
      },
      onPanolensScene: function (a) {
        this.media.setScene(a.scene);
      },
      start: function () {
        return this.media.start();
      },
      stop: function () {
        this.media.stop();
      },
    });
    ba.prototype = Object.assign(Object.create(e.EventDispatcher.prototype), {
      constructor: ba,
    });
    ca.prototype = Object.assign(Object.create(e.EventDispatcher.prototype), {
      constructor: ca,
    });
    var ia = function (a) {
      var b = new e.StereoCamera();
      b.aspect = 0.5;
      var c = new e.Vector2();
      this.setEyeSeparation = function (a) {
        b.eyeSep = a;
      };
      this.setSize = function (b, c) {
        a.setSize(b, c);
      };
      this.render = function (d, e) {
        d.updateMatrixWorld();
        null === e.parent && e.updateMatrixWorld();
        b.update(e);
        a.getSize(c);
        a.autoClear && a.clear();
        a.setScissorTest(!0);
        a.setScissor(0, 0, c.width / 2, c.height);
        a.setViewport(0, 0, c.width / 2, c.height);
        a.render(d, b.cameraL);
        a.setScissor(c.width / 2, 0, c.width / 2, c.height);
        a.setViewport(c.width / 2, 0, c.width / 2, c.height);
        a.render(d, b.cameraR);
        a.setScissorTest(!1);
      };
    };
    da.prototype = Object.assign(Object.create(e.EventDispatcher.prototype), {
      constructor: da,
      add: function (a) {
        if (1 < arguments.length) {
          for (var b = 0; b < arguments.length; b++) this.add(arguments[b]);
          return this;
        }
        this.scene.add(a);
        a.addEventListener &&
          a.addEventListener(
            "panolens-viewer-handler",
            this.eventHandler.bind(this)
          );
        a instanceof n &&
          a.dispatchEvent &&
          a.dispatchEvent({
            type: "panolens-container",
            container: this.container,
          });
        a instanceof J &&
          a.dispatchEvent({ type: "panolens-scene", scene: this.scene });
        "panorama" === a.type &&
          (this.addPanoramaEventListener(a),
          this.panorama || this.setPanorama(a));
      },
      remove: function (a) {
        a.removeEventListener &&
          a.removeEventListener(
            "panolens-viewer-handler",
            this.eventHandler.bind(this)
          );
        this.scene.remove(a);
      },
      addDefaultControlBar: function (a) {
        if (this.widget) console.warn("Default control bar exists");
        else {
          var b = new I(this.container);
          b.addEventListener(
            "panolens-viewer-handler",
            this.eventHandler.bind(this)
          );
          b.addControlBar();
          a.forEach(function (a) {
            b.addControlButton(a);
          });
          this.widget = b;
        }
      },
      setPanorama: function (a) {
        var b = this.panorama;
        if ("panorama" === a.type && b !== a) {
          this.hideInfospot();
          var c = function () {
            if (b) b.onLeave();
            a.removeEventListener("enter-fade-start", c);
          };
          a.addEventListener("enter-fade-start", c);
          (this.panorama = a).onEnter();
        }
      },
      eventHandler: function (a) {
        if (a.method && this[a.method]) this[a.method](a.data);
      },
      dispatchEventToChildren: function (a) {
        this.scene.traverse(function (b) {
          b.dispatchEvent && b.dispatchEvent(a);
        });
      },
      activateWidgetItem: function (a, b) {
        var c = this.widget.mainMenu,
          d = c.children[0];
        c = c.children[1];
        if (void 0 !== a) {
          switch (a) {
            case 0:
              a = d.subMenu.children[1];
              break;
            case 1:
              a = d.subMenu.children[2];
              break;
            default:
              a = d.subMenu.children[1];
          }
          d.subMenu.setActiveItem(a);
          d.setSelectionTitle(a.textContent);
        }
        if (void 0 !== b) {
          switch (b) {
            case t.CARDBOARD:
              a = c.subMenu.children[2];
              break;
            case t.STEREO:
              a = c.subMenu.children[3];
              break;
            default:
              a = c.subMenu.children[1];
          }
          c.subMenu.setActiveItem(a);
          c.setSelectionTitle(a.textContent);
        }
      },
      enableEffect: function (a) {
        if (this.mode !== a)
          if (a === t.NORMAL) this.disableEffect();
          else {
            this.mode = a;
            var b = this.camera.fov;
            switch (a) {
              case t.CARDBOARD:
                this.effect = this.CardboardEffect;
                this.enableReticleControl();
                break;
              case t.STEREO:
                this.effect = this.StereoEffect;
                this.enableReticleControl();
                break;
              default:
                (this.effect = null), this.disableReticleControl();
            }
            this.activateWidgetItem(void 0, this.mode);
            this.dispatchEventToChildren({
              type: "panolens-dual-eye-effect",
              mode: this.mode,
            });
            this.camera.fov = b + 0.01;
            this.effect.setSize(
              this.container.clientWidth,
              this.container.clientHeight
            );
            this.render();
            this.camera.fov = b;
            this.dispatchEvent({ type: "mode-change", mode: this.mode });
          }
      },
      disableEffect: function () {
        this.mode !== t.NORMAL &&
          ((this.mode = t.NORMAL),
          this.disableReticleControl(),
          this.activateWidgetItem(void 0, this.mode),
          this.dispatchEventToChildren({
            type: "panolens-dual-eye-effect",
            mode: this.mode,
          }),
          this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
          ),
          this.render(),
          this.dispatchEvent({ type: "mode-change", mode: this.mode }));
      },
      enableReticleControl: function () {
        this.reticle.visible ||
          ((this.tempEnableReticle = !0),
          this.unregisterMouseAndTouchEvents(),
          this.reticle.show(),
          this.registerReticleEvent(),
          this.updateReticleEvent());
      },
      disableReticleControl: function () {
        this.tempEnableReticle = !1;
        this.options.enableReticle
          ? this.updateReticleEvent()
          : (this.reticle.hide(),
            this.unregisterReticleEvent(),
            this.registerMouseAndTouchEvents());
      },
      enableAutoRate: function () {
        this.options.autoRotate = !0;
        this.OrbitControls.autoRotate = !0;
      },
      disableAutoRate: function () {
        clearTimeout(this.autoRotateRequestId);
        this.options.autoRotate = !1;
        this.OrbitControls.autoRotate = !1;
      },
      toggleVideoPlay: function (a) {
        this.panorama instanceof B &&
          this.panorama.dispatchEvent({ type: "video-toggle", pause: a });
      },
      setVideoCurrentTime: function (a) {
        this.panorama instanceof B &&
          this.panorama.dispatchEvent({ type: "video-time", percentage: a });
      },
      onVideoUpdate: function (a) {
        var b = this.widget;
        b && b.dispatchEvent({ type: "video-update", percentage: a });
      },
      addUpdateCallback: function (a) {
        a && this.updateCallbacks.push(a);
      },
      removeUpdateCallback: function (a) {
        var b = this.updateCallbacks.indexOf(a);
        a && 0 <= b && this.updateCallbacks.splice(b, 1);
      },
      showVideoWidget: function () {
        var a = this.widget;
        a && a.dispatchEvent({ type: "video-control-show" });
      },
      hideVideoWidget: function () {
        var a = this.widget;
        a && a.dispatchEvent({ type: "video-control-hide" });
      },
      updateVideoPlayButton: function (a) {
        var b = this.widget;
        b &&
          b.videoElement &&
          b.videoElement.controlButton &&
          b.videoElement.controlButton.update(a);
      },
      addPanoramaEventListener: function (a) {
        a.addEventListener("enter-fade-start", this.setCameraControl.bind(this));
        a instanceof B &&
          (a.addEventListener(
            "enter-fade-start",
            this.showVideoWidget.bind(this)
          ),
          a.addEventListener(
            "leave",
            function () {
              this.panorama instanceof B || this.hideVideoWidget.call(this);
            }.bind(this)
          ));
      },
      setCameraControl: function () {
        this.OrbitControls.target.copy(this.panorama.position);
      },
      getControl: function () {
        return this.control;
      },
      getScene: function () {
        return this.scene;
      },
      getCamera: function () {
        return this.camera;
      },
      getRenderer: function () {
        return this.renderer;
      },
      getContainer: function () {
        return this.container;
      },
      getControlId: function () {
        return this.control.id;
      },
      getNextControlId: function () {
        return this.controls[this.getNextControlIndex()].id;
      },
      getNextControlIndex: function () {
        var a = this.controls,
          b = a.indexOf(this.control) + 1;
        return b >= a.length ? 0 : b;
      },
      setCameraFov: function (a) {
        this.camera.fov = a;
        this.camera.updateProjectionMatrix();
      },
      enableControl: function (a) {
        a = 0 <= a && a < this.controls.length ? a : 0;
        this.control.enabled = !1;
        this.control = this.controls[a];
        this.control.enabled = !0;
        switch (a) {
          case E.ORBIT:
            this.camera.position.copy(this.panorama.position);
            this.camera.position.z += 1;
            break;
          case E.DEVICEORIENTATION:
            this.camera.position.copy(this.panorama.position);
        }
        this.control.update();
        this.activateWidgetItem(a, void 0);
      },
      disableControl: function () {
        this.control.enabled = !1;
      },
      toggleNextControl: function () {
        this.enableControl(this.getNextControlIndex());
      },
      getScreenVector: function (a) {
        a = a.clone();
        var b = this.container.clientWidth / 2,
          c = this.container.clientHeight / 2;
        a.project(this.camera);
        a.x = a.x * b + b;
        a.y = -(a.y * c) + c;
        a.z = 0;
        return a;
      },
      checkSpriteInViewport: function (a) {
        this.camera.matrixWorldInverse.getInverse(this.camera.matrixWorld);
        this.cameraViewProjectionMatrix.multiplyMatrices(
          this.camera.projectionMatrix,
          this.camera.matrixWorldInverse
        );
        this.cameraFrustum.setFromMatrix(this.cameraViewProjectionMatrix);
        return a.visible && this.cameraFrustum.intersectsSprite(a);
      },
      reverseDraggingDirection: function () {
        this.OrbitControls.rotateSpeed *= -1;
        this.OrbitControls.momentumScalingFactor *= -1;
      },
      addReticle: function () {
        this.reticle = new M(16777215, !0, this.options.dwellTime);
        this.reticle.hide();
        this.camera.add(this.reticle);
        this.sceneReticle.add(this.camera);
      },
      tweenControlCenter: function (a, b, c) {
        var d;
        if (this.control === this.OrbitControls) {
          a instanceof Array && ((b = a[1]), (c = a[2]), (a = a[0]));
          b = void 0 !== b ? b : 1e3;
          c = c || r.Easing.Exponential.Out;
          var g = this;
          var k = this.camera.getWorldDirection(new e.Vector3());
          var h = k.clone();
          var m = this.panorama
            .getWorldPosition(new e.Vector3())
            .sub(this.camera.getWorldPosition(new e.Vector3()));
          a = a.clone();
          a.x *= -1;
          a.add(m).normalize();
          var l = a.clone();
          k.y = 0;
          a.y = 0;
          m = Math.atan2(a.z, a.x) - Math.atan2(k.z, k.x);
          m = m > Math.PI ? m - 2 * Math.PI : m;
          m = m < -Math.PI ? m + 2 * Math.PI : m;
          k = Math.abs(
            h.angleTo(k) + (0 >= h.y * l.y ? l.angleTo(a) : -l.angleTo(a))
          );
          k *= l.y < h.y ? 1 : -1;
          h = { left: 0, up: 0 };
          var n = (d = 0);
          this.tweenLeftAnimation.stop();
          this.tweenUpAnimation.stop();
          this.tweenLeftAnimation = new r.Tween(h)
            .to({ left: m }, b)
            .easing(c)
            .onUpdate(function (a) {
              g.control.rotateLeft(a.left - d);
              d = a.left;
            })
            .start();
          this.tweenUpAnimation = new r.Tween(h)
            .to({ up: k }, b)
            .easing(c)
            .onUpdate(function (a) {
              g.control.rotateUp(a.up - n);
              n = a.up;
            })
            .start();
        }
      },
      tweenControlCenterByObject: function (a, b, c) {
        var d = !1;
        a.traverseAncestors(function (a) {
          a.scalePlaceHolder && (d = !0);
        });
        if (d) {
          var g = new e.Vector3(-1, 1, 1);
          this.tweenControlCenter(
            a.getWorldPosition(new e.Vector3()).multiply(g),
            b,
            c
          );
        } else this.tweenControlCenter(a.getWorldPosition(new e.Vector3()), b, c);
      },
      onWindowResize: function (a, b) {
        var c =
          this.container.classList.contains("panolens-container") ||
          this.container.isFullscreen;
        if (void 0 !== a && void 0 !== b) {
          var d = a;
          var e = b;
          this.container._width = a;
          this.container._height = b;
        } else
          (a = (b = /(android)/i.test(window.navigator.userAgent))
            ? Math.min(
                document.documentElement.clientWidth,
                window.innerWidth || 0
              )
            : Math.max(
                document.documentElement.clientWidth,
                window.innerWidth || 0
              )),
            (b = b
              ? Math.min(
                  document.documentElement.clientHeight,
                  window.innerHeight || 0
                )
              : Math.max(
                  document.documentElement.clientHeight,
                  window.innerHeight || 0
                )),
            (d = c ? a : this.container.clientWidth),
            (e = c ? b : this.container.clientHeight),
            (this.container._width = d),
            (this.container._height = e);
        this.camera.aspect = d / e;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(d, e);
        (this.options.enableReticle || this.tempEnableReticle) &&
          this.updateReticleEvent();
        this.dispatchEvent({ type: "window-resize", width: d, height: e });
        this.scene.traverse(function (a) {
          a.dispatchEvent &&
            a.dispatchEvent({ type: "window-resize", width: d, height: e });
        });
      },
      addOutputElement: function () {
        var a = document.createElement("div");
        a.style.position = "absolute";
        a.style.right = "10px";
        a.style.top = "10px";
        a.style.color = "#fff";
        this.container.appendChild(a);
        this.outputDivElement = a;
      },
      outputPosition: function () {
        var a = this.raycaster.intersectObject(this.panorama, !0);
        if (0 < a.length) {
          a = a[0].point.clone();
          var b = new e.Vector3(-1, 1, 1),
            c = this.panorama.getWorldPosition(new e.Vector3());
          a.sub(c).multiply(b);
          b = a.x.toFixed(2) + ", " + a.y.toFixed(2) + ", " + a.z.toFixed(2);
          if (0 !== a.length())
            switch (this.options.output) {
              case "console":
                console.info(b);
                break;
              case "overlay":
                this.outputDivElement.textContent = b;
            }
        }
      },
      onMouseDown: function (a) {
        a.preventDefault();
        this.userMouse.x = 0 <= a.clientX ? a.clientX : a.touches[0].clientX;
        this.userMouse.y = 0 <= a.clientY ? a.clientY : a.touches[0].clientY;
        this.userMouse.type = "mousedown";
        this.onTap(a);
      },
      onMouseMove: function (a) {
        a.preventDefault();
        this.userMouse.type = "mousemove";
        this.onTap(a);
      },
      onMouseUp: function (a) {
        this.userMouse.type = "mouseup";
        var b =
          (this.userMouse.x >= a.clientX - this.options.clickTolerance &&
            this.userMouse.x <= a.clientX + this.options.clickTolerance &&
            this.userMouse.y >= a.clientY - this.options.clickTolerance &&
            this.userMouse.y <= a.clientY + this.options.clickTolerance) ||
          (a.changedTouches &&
            this.userMouse.x >=
              a.changedTouches[0].clientX - this.options.clickTolerance &&
            this.userMouse.x <=
              a.changedTouches[0].clientX + this.options.clickTolerance &&
            this.userMouse.y >=
              a.changedTouches[0].clientY - this.options.clickTolerance &&
            this.userMouse.y <=
              a.changedTouches[0].clientY + this.options.clickTolerance)
            ? "click"
            : void 0;
        if (!a || !a.target || a.target.classList.contains("panolens-canvas"))
          if (
            (a.preventDefault(),
            (a =
              a.changedTouches && 1 === a.changedTouches.length
                ? this.onTap(
                    {
                      clientX: a.changedTouches[0].clientX,
                      clientY: a.changedTouches[0].clientY,
                    },
                    b
                  )
                : this.onTap(a, b)),
            (this.userMouse.type = "none"),
            !a && "click" === b)
          ) {
            b = this.options;
            a = b.autoHideControlBar;
            var c = this.panorama,
              d = this.toggleControlBar;
            b.autoHideInfospot && c && c.toggleInfospotVisibility();
            a && d();
          }
      },
      onTap: function (a, b) {
        var c = this.container.getBoundingClientRect(),
          d = c.top,
          e = this.container,
          h = e.clientHeight;
        this.raycasterPoint.x = ((a.clientX - c.left) / e.clientWidth) * 2 - 1;
        this.raycasterPoint.y = 2 * -((a.clientY - d) / h) + 1;
        this.raycaster.setFromCamera(this.raycasterPoint, this.camera);
        if (this.panorama) {
          (("mousedown" !== a.type && this.touchSupported) ||
            this.OUTPUT_INFOSPOT) &&
            this.outputPosition();
          c = this.raycaster.intersectObjects(this.panorama.children, !0);
          d = this.getConvertedIntersect(c);
          e = 0 < c.length ? c[0].object : void 0;
          "mouseup" === this.userMouse.type &&
            (d &&
              this.pressEntityObject === d &&
              this.pressEntityObject.dispatchEvent &&
              this.pressEntityObject.dispatchEvent({
                type: "pressstop-entity",
                mouseEvent: a,
              }),
            (this.pressEntityObject = void 0));
          "mouseup" === this.userMouse.type &&
            (e &&
              this.pressObject === e &&
              this.pressObject.dispatchEvent &&
              this.pressObject.dispatchEvent({
                type: "pressstop",
                mouseEvent: a,
              }),
            (this.pressObject = void 0));
          if ("click" === b)
            this.panorama.dispatchEvent({
              type: "click",
              intersects: c,
              mouseEvent: a,
            }),
              d &&
                d.dispatchEvent &&
                d.dispatchEvent({ type: "click-entity", mouseEvent: a }),
              e &&
                e.dispatchEvent &&
                e.dispatchEvent({ type: "click", mouseEvent: a });
          else {
            this.panorama.dispatchEvent({
              type: "hover",
              intersects: c,
              mouseEvent: a,
            });
            if (
              (this.hoverObject && 0 < c.length && this.hoverObject !== d) ||
              (this.hoverObject && 0 === c.length)
            )
              this.hoverObject.dispatchEvent &&
                (this.hoverObject.dispatchEvent({
                  type: "hoverleave",
                  mouseEvent: a,
                }),
                this.reticle.end()),
                (this.hoverObject = void 0);
            d &&
              0 < c.length &&
              (this.hoverObject !== d &&
                ((this.hoverObject = d),
                this.hoverObject.dispatchEvent &&
                  (this.hoverObject.dispatchEvent({
                    type: "hoverenter",
                    mouseEvent: a,
                  }),
                  ((this.options.autoReticleSelect &&
                    this.options.enableReticle) ||
                    this.tempEnableReticle) &&
                    this.reticle.start(this.onTap.bind(this, a, "click")))),
              "mousedown" === this.userMouse.type &&
                this.pressEntityObject != d &&
                ((this.pressEntityObject = d),
                this.pressEntityObject.dispatchEvent &&
                  this.pressEntityObject.dispatchEvent({
                    type: "pressstart-entity",
                    mouseEvent: a,
                  })),
              "mousedown" === this.userMouse.type &&
                this.pressObject != e &&
                ((this.pressObject = e),
                this.pressObject.dispatchEvent &&
                  this.pressObject.dispatchEvent({
                    type: "pressstart",
                    mouseEvent: a,
                  })),
              "mousemove" === this.userMouse.type ||
                this.options.enableReticle) &&
              (e &&
                e.dispatchEvent &&
                e.dispatchEvent({ type: "hover", mouseEvent: a }),
              this.pressEntityObject &&
                this.pressEntityObject.dispatchEvent &&
                this.pressEntityObject.dispatchEvent({
                  type: "pressmove-entity",
                  mouseEvent: a,
                }),
              this.pressObject &&
                this.pressObject.dispatchEvent &&
                this.pressObject.dispatchEvent({
                  type: "pressmove",
                  mouseEvent: a,
                }));
            !d &&
              this.pressEntityObject &&
              this.pressEntityObject.dispatchEvent &&
              (this.pressEntityObject.dispatchEvent({
                type: "pressstop-entity",
                mouseEvent: a,
              }),
              (this.pressEntityObject = void 0));
            !e &&
              this.pressObject &&
              this.pressObject.dispatchEvent &&
              (this.pressObject.dispatchEvent({
                type: "pressstop",
                mouseEvent: a,
              }),
              (this.pressObject = void 0));
          }
          if (e && e instanceof z) {
            if (((this.infospot = e), "click" === b)) return !0;
          } else this.infospot && this.hideInfospot();
          this.options.autoRotate &&
            "mousemove" !== this.userMouse.type &&
            (clearTimeout(this.autoRotateRequestId),
            this.control === this.OrbitControls &&
              ((this.OrbitControls.autoRotate = !1),
              (this.autoRotateRequestId = window.setTimeout(
                this.enableAutoRate.bind(this),
                this.options.autoRotateActivationDuration
              ))));
        }
      },
      getConvertedIntersect: function (a) {
        for (var b, c = 0; c < a.length; c++)
          if (
            0 <= a[c].distance &&
            a[c].object &&
            !a[c].object.passThrough &&
            (!a[c].object.entity || !a[c].object.entity.passThrough)
          ) {
            b =
              a[c].object.entity && !a[c].object.entity.passThrough
                ? a[c].object.entity
                : a[c].object;
            break;
          }
        return b;
      },
      hideInfospot: function () {
        this.infospot && (this.infospot.onHoverEnd(), (this.infospot = void 0));
      },
      toggleControlBar: function () {
        var a = this.widget;
        a && a.dispatchEvent({ type: "control-bar-toggle" });
      },
      onKeyDown: function (a) {
        this.options.output &&
          "none" !== this.options.output &&
          "Control" === a.key &&
          (this.OUTPUT_INFOSPOT = !0);
      },
      onKeyUp: function () {
        this.OUTPUT_INFOSPOT = !1;
      },
      update: function () {
        r.update();
        this.updateCallbacks.forEach(function (a) {
          a();
        });
        this.control.update();
        this.scene.traverse(
          function (a) {
            if (
              a instanceof z &&
              a.element &&
              (this.hoverObject === a ||
                "none" !== a.element.style.display ||
                (a.element.left && "none" !== a.element.left.style.display) ||
                (a.element.right && "none" !== a.element.right.style.display))
            )
              if (this.checkSpriteInViewport(a)) {
                var b = this.getScreenVector(a.getWorldPosition(new e.Vector3()));
                a.translateElement(b.x, b.y);
              } else a.onDismiss();
          }.bind(this)
        );
      },
      render: function () {
        this.mode === t.CARDBOARD || this.mode === t.STEREO
          ? (this.renderer.clear(),
            this.effect.render(this.scene, this.camera),
            this.effect.render(this.sceneReticle, this.camera))
          : (this.renderer.clear(),
            this.renderer.render(this.scene, this.camera),
            this.renderer.clearDepth(),
            this.renderer.render(this.sceneReticle, this.camera));
      },
      animate: function () {
        this.requestAnimationId = window.requestAnimationFrame(
          this.animate.bind(this)
        );
        this.onChange();
      },
      onChange: function () {
        this.update();
        this.render();
      },
      registerMouseAndTouchEvents: function () {
        var a = { passive: !1 };
        this.container.addEventListener("mousedown", this.HANDLER_MOUSE_DOWN, a);
        this.container.addEventListener("mousemove", this.HANDLER_MOUSE_MOVE, a);
        this.container.addEventListener("mouseup", this.HANDLER_MOUSE_UP, a);
        this.container.addEventListener("touchstart", this.HANDLER_MOUSE_DOWN, a);
        this.container.addEventListener("touchend", this.HANDLER_MOUSE_UP, a);
      },
      unregisterMouseAndTouchEvents: function () {
        this.container.removeEventListener(
          "mousedown",
          this.HANDLER_MOUSE_DOWN,
          !1
        );
        this.container.removeEventListener(
          "mousemove",
          this.HANDLER_MOUSE_MOVE,
          !1
        );
        this.container.removeEventListener("mouseup", this.HANDLER_MOUSE_UP, !1);
        this.container.removeEventListener(
          "touchstart",
          this.HANDLER_MOUSE_DOWN,
          !1
        );
        this.container.removeEventListener("touchend", this.HANDLER_MOUSE_UP, !1);
      },
      registerReticleEvent: function () {
        this.addUpdateCallback(this.HANDLER_TAP);
      },
      unregisterReticleEvent: function () {
        this.removeUpdateCallback(this.HANDLER_TAP);
      },
      updateReticleEvent: function () {
        var a = this.container.clientWidth / 2 + this.container.offsetLeft,
          b = this.container.clientHeight / 2;
        this.removeUpdateCallback(this.HANDLER_TAP);
        this.HANDLER_TAP = this.onTap.bind(this, { clientX: a, clientY: b });
        this.addUpdateCallback(this.HANDLER_TAP);
      },
      registerEventListeners: function () {
        window.addEventListener("resize", this.HANDLER_WINDOW_RESIZE, !0);
        window.addEventListener("keydown", this.HANDLER_KEY_DOWN, !0);
        window.addEventListener("keyup", this.HANDLER_KEY_UP, !0);
      },
      unregisterEventListeners: function () {
        window.removeEventListener("resize", this.HANDLER_WINDOW_RESIZE, !0);
        window.removeEventListener("keydown", this.HANDLER_KEY_DOWN, !0);
        window.removeEventListener("keyup", this.HANDLER_KEY_UP, !0);
      },
      dispose: function () {
        function a(b) {
          for (var c = b.children.length - 1; 0 <= c; c--)
            a(b.children[c]), b.remove(b.children[c]);
          b instanceof n || b instanceof z
            ? b.dispose()
            : b.dispatchEvent && b.dispatchEvent("dispose");
        }
        this.tweenLeftAnimation.stop();
        this.tweenUpAnimation.stop();
        this.unregisterEventListeners();
        a(this.scene);
        this.widget && (this.widget.dispose(), (this.widget = null));
        e.Cache && e.Cache.enabled && e.Cache.clear();
      },
      destroy: function () {
        this.dispose();
        this.render();
        window.cancelAnimationFrame(this.requestAnimationId);
      },
      onPanoramaDispose: function (a) {
        a instanceof B && this.hideVideoWidget();
        a === this.panorama && (this.panorama = null);
      },
      loadAsyncRequest: function (a, b) {
        b = void 0 === b ? function () {} : b;
        var c = new window.XMLHttpRequest();
        c.onloadend = function (a) {
          b(a);
        };
        c.open("GET", a, !0);
        c.send(null);
      },
      addViewIndicator: function () {
        var a = this;
        this.loadAsyncRequest(u.ViewIndicator, function (b) {
          if (0 !== b.loaded) {
            b = b.target.responseXML.documentElement;
            b.style.width = a.viewIndicatorSize + "px";
            b.style.height = a.viewIndicatorSize + "px";
            b.style.position = "absolute";
            b.style.top = "10px";
            b.style.left = "10px";
            b.style.opacity = "0.5";
            b.style.cursor = "pointer";
            b.id = "panolens-view-indicator-container";
            a.container.appendChild(b);
            var c = b.querySelector("#indicator");
            a.addUpdateCallback(function () {
              a.radius = 0.225 * a.viewIndicatorSize;
              a.currentPanoAngle = a.camera.rotation.y - e.Math.degToRad(90);
              a.fovAngle = e.Math.degToRad(a.camera.fov);
              a.leftAngle = -a.currentPanoAngle - a.fovAngle / 2;
              a.rightAngle = -a.currentPanoAngle + a.fovAngle / 2;
              a.leftX = a.radius * Math.cos(a.leftAngle);
              a.leftY = a.radius * Math.sin(a.leftAngle);
              a.rightX = a.radius * Math.cos(a.rightAngle);
              a.rightY = a.radius * Math.sin(a.rightAngle);
              a.indicatorD =
                "M " +
                a.leftX +
                " " +
                a.leftY +
                " A " +
                a.radius +
                " " +
                a.radius +
                " 0 0 1 " +
                a.rightX +
                " " +
                a.rightY;
              a.leftX &&
                a.leftY &&
                a.rightX &&
                a.rightY &&
                a.radius &&
                c.setAttribute("d", a.indicatorD);
            });
            b.addEventListener("mouseenter", function () {
              this.style.opacity = "1";
            });
            b.addEventListener("mouseleave", function () {
              this.style.opacity = "0.5";
            });
          }
        });
      },
      appendControlItem: function (a) {
        var b = this.widget.createCustomItem(a);
        "video" === a.group
          ? this.widget.videoElement.appendChild(b)
          : this.widget.barElement.appendChild(b);
        return b;
      },
      clearAllCache: function () {
        e.Cache.clear();
      },
    });
    "105" != e.REVISION &&
      console.warn(
        "three.js version is not matched. Please consider use the target revision 105"
      );
    window.TWEEN = r;
    h.BasicPanorama = O;
    h.CONTROLS = E;
    h.CameraPanorama = J;
    h.CubePanorama = F;
    h.CubeTextureLoader = fa;
    h.DataImage = u;
    h.EmptyPanorama = W;
    h.GoogleStreetviewPanorama = Z;
    h.ImageLittlePlanet = aa;
    h.ImageLoader = ea;
    h.ImagePanorama = y;
    h.Infospot = z;
    h.LittlePlanet = C;
    h.MODES = t;
    h.Media = S;
    h.Panorama = n;
    h.REVISION = "11";
    h.Reticle = M;
    h.THREE_REVISION = "105";
    h.THREE_VERSION = ja;
    h.TextureLoader = N;
    h.VERSION = "0.11.0";
    h.VideoPanorama = B;
    h.Viewer = da;
    h.Widget = I;
    Object.defineProperty(h, "__esModule", { value: !0 });
  });