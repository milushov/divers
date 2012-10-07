window.app = {
  init: function() {
    console.log('app init');
    document.write('hello');
  }
}

window.onload = app.init();
