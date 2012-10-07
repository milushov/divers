window.app = {
  init: function() {
    console.log('app init');
    canvas = gebi('app');
  }
}

window.onload = app.init();
