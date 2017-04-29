"use strict";

var App = (function() {
  
  
  function drawPoint(ctx, point, color) {
    ctx.fillStyle = 'black';
    ctx.fillRect(point.x, point.y, 1, 1);
  }
  
  
  function App() {
    this._updateTimer   = undefined;
    this._running       = false;
    this._points        = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 400, y: 500 }
    ];
    this._game          = undefined;
    this._view          = undefined;
    this._pointsLayer   = undefined;
    this._gameLayer     = undefined;
    this._speed         = 1;
  };
  
  
  App.prototype._bindUiActions = function() {
    var self = this;
    
    this._view = new Concrete.Viewport({
      container: $('#view').get(0),
      width: 800,
      height: 600
    });
    this._pointsLayer = new Concrete.Layer();
    this._gameLayer = new Concrete.Layer();
    this._view.add(this._pointsLayer).add(this._gameLayer);
    console.log(this._gameLayer);
    
    
    $('.button-start').show();
    $('.button-stop').hide();
    $('.slider-speed').val(100);
    
    $('.button-reset').click(function() { self._reset(); });
    $('.button-start').click(function() { self._start(); });
    $('.button-stop').click(function() { self._stop(); });
    $('.button-step').click(function() { self._step(); });
    $('.slider-speed').on('input change', function() { self._changeSpeed($(this).val()); });
  }
  
  
  App.prototype._updateUi = function() {
    /* update speed indicator */
    $('.speed').text((1.0/this._speed).toFixed(2) + 'x');
  }
  
  
  App.prototype._reset = function() {
    this._stop();
    this._game = new Chaos({x: 0, y: 0}, this._points, 0.5);
    
    this._updateUi();
  }
  
  
  App.prototype._update = function() {
    var newPoint = this._game.update();
    
    if (newPoint) {
      drawPoint(this._gameLayer.scene.context, newPoint, 'black');
    }
    
    this._updateUi();
  }
  
  
  App.prototype._start = function() {
    if (!this._running) {
      $('.button-start').hide();
      $('.button-stop').show();
      
      this._running = true;
      var self = this;
      this._updateTimer = setInterval(function() { self._update(); }, this._speed);
    }
  }
  
  
  App.prototype._step = function() {
    
  }
  
  
  App.prototype._stop = function() {
    if (this._running) {
      $('.button-start').show();
      $('.button-stop').hide();
    
      this._running = false;
      clearInterval(this._updateTimer);
    }
  }
  
  
  App.prototype._changeSpeed = function(val) {
    this._speed = 100 * Math.pow(1.0471285480508995334645, -val);
    if (this._running) {
      clearInterval(this._updateTimer);
      var self = this;
      this._updateTimer = setInterval(function() { self._update(); }, this._speed);
    } 
    this._updateUi();
  }
  

  App.prototype.run = function() {
    this._bindUiActions();
    this._reset();
  }
  
  
  return App;
} ());

