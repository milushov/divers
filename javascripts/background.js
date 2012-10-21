function Background(debug) {
  this.config = {
    speed: {
    },

    objects: {
    },

    options: {
    }
  };

  this.init = function() {
    console.log('bg init');
    this.canvas = document.getElementById('background');
    this.ctx = this.canvas.getContext('2d');

    this.fishes = new Array();
    this.clouds = new Array();

    //TODO set canvas width and height
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
    //this.drawSea();
    for (var i = 0; i < this.fishes.length; ++i) {
      this.fishes[i].draw();
    }

    for (var i = 0; i < this.clouds.length; ++i) {
      this.clouds[i].draw();
    }
  };

  this.drawBackground = function() {
    var w = this.canvas.width, h = this.canvas.height;
    var gradient = this.ctx.createLinearGradient(100,90,100,200);
    gradient.addColorStop(0,'rgb(49, 104, 224)');
    gradient.addColorStop(.5,'rgb(49, 72, 224)');
    gradient.addColorStop(1,'rgb(49, 53, 224)');
    this.ctx.fillStyle = gradient;

    this.ctx.roundRect(0, 0, w, h, 20, true);
  }
}
