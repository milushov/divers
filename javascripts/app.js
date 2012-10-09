var App = function(debug) {
  this.debug = debug || false;

  this.init = function() {
    console.log('app init');

    this.canvas = document.getElementById('app');
    this.ctx = this.canvas.getContext('2d');

    this.canvas.addEventListener('selectstart', function(e) {
      e.preventDefault();
      return false;
    }, false);

    this.canvas.addEventListener('mousedown', function(event) {
      console.log(event)
      var x = event.x;
      var y = event.y;

      ctx = app.ctx;
      
      var rating = Math.round(Math.random()*10);
      new_star = new Star(x, y);
      new_star.setImage(rating);
      app.stars.push(new_star);
    });

    this.divers = new Array();
    this.stars = new Array();
  }

  this.test = function() {
    console.log(this)
  }
}

window.onload = function() {
  app = new App(true);
  app.init();
  gebi('click').addEventListener('click', function(){ app.test.apply(app) } );
}

var Star = function(x, y) {
  this.x = x;
  this.y = y;

  this.setImage = function(rating) {
    if(!rating) {
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
    console.log('star is falling..')
  }
}

// prototype of star
Star.prototype = {
  width: 46,
  height: 43
}