function Background(config, debug) {
  this.config = config;

  this.init = function() {
    console.log('bg init');
    this.canvas = document.getElementById('background');
    this.canvas.width = wwh()[0];
    this.canvas.height = wwh()[1];
    this.ctx = this.canvas.getContext('2d');

    this.fishes = new Array();
    this.clouds = new Array();

    //TODO set canvas width and height

    function wwh() {
      var de = document.documentElement,
        w = bg.config.options.min_width,
        h = bg.config.options.min_height;
      return [
        Math.max(w, de.clientWidth),
        Math.max(h, de.clientHeight)
      ];
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
    this.drawBackground();
    this.drawSea();
    for (var i = 0; i < this.fishes.length; ++i) {
      this.fishes[i].draw();
    }

    for (var i = 0; i < this.clouds.length; ++i) {
      this.clouds[i].draw();
    }
  };

  this.drawBackground = function() {
    var w = this.canvas.width,
      h = this.canvas.height,
      gradient = this.ctx.createLinearGradient(0, 0, 0, h);

    gradient.addColorStop(0,'rgb(49, 104, 224)');
    gradient.addColorStop(1,'rgb(49, 53, 224)');
    this.ctx.fillStyle = gradient;
    this.ctx.roundRect(0, 0, w, h, 20, true);
  }

  this.drawSea = function() {
    var w = this.canvas.width - 40,
      h = this.canvas.height - 80,
      gradient = this.ctx.createLinearGradient(0, 60, 0, h);
      
    gradient.addColorStop(0,'rgb(133, 227, 255)');
    gradient.addColorStop(.5,'rgb(70, 180, 224)');
    gradient.addColorStop(1,'rgb(25, 111, 194)');
    this.ctx.fillStyle = gradient;
    this.ctx.roundRect(20, 60, w, h, 20, true);
  }
}
