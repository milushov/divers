var App = function(debug) {
  this.debug = debug || false;

  this.init = function() {
    console.log('app init');

    this.canvas = document.getElementById('app');
    this.ctx = this.canvas.getContext('2d');
    this.bottom = this.canvas.height - 50;

    this.canvas.addEventListener('mousedown', function(event) {
      var x = event.x;
      var y = event.y;
      var rating = Math.round(Math.random()*9+1);
      new_star = new Star(x, y);
      new_star.setImage(rating);
      app.stars.push(new_star);
    });

    this.divers = new Array();
    this.stars = new Array();

    //TODO make buttons
  }

  this.test = function() {
    console.log(this)
  }

  this.animate = function() {
    requestAnimFrame(this.animate.bind(this));
    this.draw();
  }

  this.draw = function() {
    this.clear();
    for (var i = 0; i < this.starts.length; ++i) {
      this.stars[i].draw();
    };
  }
  
  this.clear = function() {
    //this.canvas.width = this.canvas.width;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

window.onload = function() {
  app = new App(true);
  app.init();
  app.animate();
  gebi('click').addEventListener('click', function(){ app.test.apply(app) } );
}

var Star = function(x, y) {
  this.x = x;
  this.y = y;

  this.setImage = function(rating) {
    if(typeof rating == 'undefined') {
      throw { message: 'rating not set', code: 1 }
      this.rating = 1;
    }
    this.rating = rating;
    this.image = new Image();
    this.image.src = 'images/tf-star' + rating + '.png';
    this.image.onload = function() {
      x = this.x - this.width / 2
      y = this.y - this.height / 2
      app.ctx.drawImage(this.image, x, y);
      this.fall();
    }.bind(this) // bind context of star object to onload handler
  }

  this.fall = function() {
    console.log('start falling..')
    intr = setInterval(function() {
      console.log(this)
    }.bind(this), 1000/15);
  }
}

// prototype of star
Star.prototype = {
  width: 46,
  height: 43
}
