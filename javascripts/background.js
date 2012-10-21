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
  };
}
