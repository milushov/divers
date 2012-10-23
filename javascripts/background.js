function Background(config, debug) {
  this.config = config;

  this.init = function() {
    console.log('bg init');

    Object.extend(this.config, {
      objects: {
        wave1: 200
      },

      options: {
        ratio_sky_water: 1/6,
        sand_height: 90,
        crabs_count: 4,
        stars_count: 5
      }
    });

    this.canvas = document.getElementById('background');
    this.canvas.width = wwh()[0];
    this.canvas.height = wwh()[1];
    this.ctx = this.canvas.getContext('2d');

    this.fishes = new Array();
    this.clouds = new Array();

    this.config.objects.water = getWaterY.call(this);


    function getWaterY() {
      var ratio = this.config.options.ratio_sky_water;
      return Math.round((this.canvas.height - (60 + 20)) * ratio) + 60;
    }
  };

  this.animate = function() {
    requestAnimFrame(this.animate.bind(this));
    this.clear();
    this.draw();
  };

  this.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  this.draw = function() {
    this.static.drawSea.call(this);
    this.static.bottom.call(this);
    this.static.drawCrabsAndStars.call(this);

    for (var i = 0; i < this.fishes.length; ++i) {
      this.fishes[i].draw();
    }

    for (var i = 0; i < this.clouds.length; ++i) {
      this.clouds[i].draw();
    }

    this.static.drawFrame.call(this);
  };

  this._cache = {
    crabs: [],
    stars: []
  };

  this.static = new Object();

  this.static.drawFrame = function() {
    var w = this.canvas.width/2,
      h = this.canvas.height,
      gradient = this.ctx.createLinearGradient(0, 0, 0, h),
      x = 0, y = 0, r = 20;

    gradient.addColorStop(0,'rgb(49, 104, 224)');
    gradient.addColorStop(1,'rgb(49, 53, 224)');

    this.ctx.fillStyle = gradient;

    this.ctx.beginPath();
    this.ctx.moveTo(x, y);

    this.ctx.lineTo(w, y);
    this.ctx.lineTo(w, y + 60);
    this.ctx.lineTo(x + 20 + r, y + 60);
    this.ctx.quadraticCurveTo(x + 20, y + 60, x + 20, y + 60 + r);
    this.ctx.lineTo(x + 20, h - 20 - r);
    this.ctx.quadraticCurveTo(x + 20, h - 20, x + 20 + r, h - 20);
    this.ctx.lineTo(w, h - 20);
    this.ctx.lineTo(w, h);
    this.ctx.lineTo(x, h);
    this.ctx.lineTo(x, y);

    this.ctx.closePath();
    this.ctx.fill();


    this.ctx.beginPath();
    this.ctx.moveTo(w*2, y);

    this.ctx.lineTo(w, y);
    this.ctx.lineTo(w, y + 60);
    this.ctx.lineTo(w*2 - 20 - r, y + 60);
    this.ctx.quadraticCurveTo(w*2 - 20, y + 60, w*2 - 20, y + 60 + r);
    this.ctx.lineTo(w*2 - 20, h - 20 - r);
    this.ctx.quadraticCurveTo(w*2 - 20, h - 20, w*2 - 20 - r, h - 20);
    this.ctx.lineTo(w, h - 20);
    this.ctx.lineTo(w, h);
    this.ctx.lineTo(w*2, h);
    this.ctx.lineTo(w*2, y);

    this.ctx.closePath();
    this.ctx.fill();
  };

  this.static.drawCrabsAndStars = function() {
    var sand_height = this.config.options.sand_height,
      cw = this.canvas.width, ch = this.canvas.height,
      left = 20, right = cw - 20,
      cc = this.config.options.crabs_count,
      cs = this.config.options.stars_count,
      x = null, y = null, image = {},
      crabs = this._cache.crabs,
      stars = this._cache.stars;

    // crabs
    if(!crabs.length) {
      for (var i = 0; i < cc; ++i) {
        image = {};
        image.image = images['crab'+rand(1,2)+'.png'];
        image.x = rand(left, right);
        image.y = rand(ch - 20 - sand_height, ch - 20);
        this.ctx.drawImage(image.image, image.x, image.y);
        this._cache.crabs.push(image);
      }
    } else {
      for (var i = 0; i < crabs.length; ++i) {
        image = crabs[i].image;
        x = crabs[i].x; y = crabs[i].y;
        this.ctx.drawImage(image, x, y);
      }
    }

    // stars
    if(!stars.length) {
      for (var i = 0; i < cc; ++i) {
        image = {};
        image.image = images['star'+rand(1,4)+'.png'];
        image.x = rand(left, right);
        image.y = rand(ch - 20 - sand_height, ch - 20);
        this.ctx.drawImage(image.image, image.x, image.y);
        this._cache.stars.push(image);
      }
    } else {
      for (var i = 0; i < stars.length; ++i) {
        image = stars[i].image;
        x = stars[i].x; y = stars[i].y;
        this.ctx.drawImage(image, x, y);
      }
    }
  };

  this.static.drawSea = function() {
    var w = this.canvas.width - 40,
      h = this.canvas.height - 80,
      gradient = this.ctx.createLinearGradient(0, 0, 0, h),
      y = this.config.objects.water;

    gradient.addColorStop(0,'rgb(133, 227, 255)');
    gradient.addColorStop(.5,'rgb(70, 180, 224)');
    gradient.addColorStop(1,'rgb(25, 111, 194)');
    this.ctx.fillStyle = gradient;
    this.ctx.roundRect(20, y, w, h, 20, true, false);
    //this.ctx.globalCompositeOperation = "xor";
  };

  this.static.bottom = function() {
    var left = {i: images['sand_left.png'], w: 358, h: 71},
      center = {i: images['sand_center.png'], w: 19, h: 71},
      right = {i: images['sand_right.png'], w: 347, h: 71};

    left.x = 20;
    left.y = this.canvas.height - (left.h + 20);

    center.x = left.x + left.w;
    center.y = left.y;

    right.x = this.canvas.width - (right.w + 20);
    right.y = this.canvas.height - (right.h + 20);

    this.ctx.drawImage(left.i, left.x, left.y);

    var count = Math.ceil((right.x - (left.x + left.w)) / center.w);
    for (var i = 0; i < count; ++i) {
      this.ctx.drawImage(center.i, center.x + center.w * i, center.y);
    }

    this.ctx.drawImage(right.i, right.x, right.y);
 }
}
