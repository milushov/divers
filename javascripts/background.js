function Background(config, debug) {
  this.config = config;

  this.init = function() {
    console.log('bg init');

    Object.extend(this.config, {
      speed: {
        clouds: 10,
        fishes: 30
      },

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

    // tune
    this.config.objects.water = getWaterY.call(this);

    this.startClouds();
  };

  function getWaterY() {
    var ratio = this.config.options.ratio_sky_water;
    return Math.round((this.canvas.height - (60 + 20)) * ratio) + 60;
  }

  this.animate = function() {
    requestAnimFrame(this.animate.bind(this));
    this.clear();
    this.draw();
  };

  this.clear = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  this.draw = function() {
    this.static.drawSky.call(this);
    this.static.drawSea.call(this);
    this.static.bottom.call(this);
    this.static.drawCrabsAndStars.call(this);

    for (var i = 0; i < this.clouds.length; ++i) {
      if(this.clouds[i].behind_the_sun) {
        this.clouds[i].draw(this.ctx);
      }
    }

    this.drawSun();

    for (var i = 0; i < this.clouds.length; ++i) {
      if(!this.clouds[i].behind_the_sun) {
        this.clouds[i].draw(this.ctx);
      }
    }

    for (var i = 0; i < this.fishes.length; ++i) {
      this.fishes[i].draw(this.ctx);
    }

    this.static.drawFrame.call(this);
  };

  this._cache = { crabs: [], stars: [] };

  this.static = new Object();

  this.startClouds = function() {
    var w = this.canvas.width,
      h = this.config.objects.water - 60,
      x = 0, y = 60,
      ccb = rand(2,4), // clouds count behind
      cc = rand(2,3), // clouds count front of sun
      cloud = null,
      dir = Math.round(Math.random()) ? 'left' : 'right';

    for (var i = 0; i < ccb; ++i) {
      cloud = new Cloud(rand(100, w), rand(70, 100));
      cloud.behind_the_sun = true;
      cloud.setImage(rand(1,2));
      cloud.move(dir);
      this.clouds.push(cloud);
    }

    for (var i = 0; i < cc; ++i) {
      cloud = new Cloud(rand(100, w), rand(90, 110));
      cloud.behind_the_sun = false;
      cloud.setImage(rand(1,2));
      cloud.move(dir);
      this.clouds.push(cloud);
    }
  };
  
  this.drawSun = function() {
    this.ctx.drawImage(images['sun.png'], 100, 80);
  };

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

  this.static.drawSky = function() {
    var ratio = this.config.options.ratio_sky_water,
      w = this.canvas.width - 40,
      h = Math.round((this.canvas.height - 80) * ratio),
      x = 20, y = 60,
      x1 = this.canvas.width/2, y1 = h/2 + 100 + 60, r1 = 0,
      x2 = this.canvas.width/2, y2 = h/2 + 100 + 60, r2 = 500,
      gradient = this.ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);

    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.75, "#87F1FF");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, w, h);
  };

  this.static.drawSea = function() {
    var w = this.canvas.width - 40,
      h = this.canvas.height - this.config.objects.water - 20,
      gradient = this.ctx.createLinearGradient(0, 0, 0, h),
      y = this.config.objects.water;

    gradient.addColorStop(0,'rgb(133, 227, 255)');
    gradient.addColorStop(.5,'rgb(70, 180, 224)');
    gradient.addColorStop(1,'rgb(25, 111, 194)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(20, y, w, h);
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


var Cloud = (function(_super) {
  extend(Cloud, _super);

  function Cloud() {
    this.wait = true;
    return Cloud.__super__.constructor.apply(this, arguments);
  };

  Object.extend(Cloud.prototype, {
    setImage: function(id) {
      this.image = images['cloud'+id+'.png'];
      //this.x = this.x - this.width / 2
      //this.y = this.y - this.height / 2
      bg.ctx.drawImage(this.image, this.x, this.y);
    },

    move: function(dir) {
      var speed = app.config.speed.clouds + rand(-5, 10),
        interval = 1000 / speed,
        w = bg.canvas.width;

      console.log(speed);
      setInterval(function() {
        if(dir === 'left') {
          if(this.x < -50) {
            this.x = w + 50;
          } else {
            this.x --;
          }
        } else {
          if(this.x > w + 50) {
            this.x = -50;
          } else {
            this.x ++;
          }
        }
      }.bind(this), interval);
    }
  });

  return Cloud;
})(Thing);
