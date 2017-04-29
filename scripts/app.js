"use strict";

var App = (function() {
  
  
  function drawPoint(ctx, point, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
      ctx.arc(point.x, point.y, size/2.0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  
  
  function Point(x, y) {
    this.x = x;
    this.y = y;
    this.selected = false;
    this.hovered = false;
  }
  
  
  function App() {
    this._updateTimer   = undefined;
    this._running       = false;
    this._points        = [
      new Point(100, 100),
      new Point(700, 100),
      new Point(400, 500)
    ];
    this._view          = undefined;
    this._pointsLayer   = undefined;
    this._gameLayer     = undefined;
    this._speed         = 1;
    this._dotSize       = 2;
    this._stepSize      = 0.5;
    
    this._game = new Chaos({x: 0, y: 0}, this._points, 0.5);
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
    
    
    $('.button-start').show();
    $('.button-stop').hide();
    $('.slider-speed').val(100);
    $('.parameter-dot-size').val(2);
    $('.slider-step').val(50);
    
    $('.button-reset').click(function() { self._clear(); });
    $('.button-start').click(function() { self._start(); });
    $('.button-stop').click(function() { self._stop(); });
    $('.button-step').click(function() { self._step(); });
    $('.button-download').click(function() { self._download(); });
    $('.slider-speed').on('input change', function() { self._changeSpeed($(this).val()); });
    $('.parameter').on('input change', function() { self._updateParameters(); });
  }
  
  
  App.prototype._updateUi = function() {
    /* update speed indicator */
    $('.speed').text((1.0/this._speed).toFixed(2) + 'x');
    
    /* update step size */
    $('.step-size').text(this._stepSize.toFixed(2));
  }
  
  
  App.prototype._updateParameters = function() {
    /* update dot size */
    this._dotSize = parseFloat($('.parameter-dot-size').val());
    console.log('!');
    if (this._dotSize < 1) $('.parameter-dot-size').val(1);
    if (this._dotSize > 10) $('.parameter-dot-size').val(10);
    
    /* update step size */
    this._stepSize = 0.01 * parseFloat($('.slider-step').val());
    this._game.setStepSize(this._stepSize);
    
    this._updateUi();
  }
  
  
  App.prototype._clear = function() {
    this._stop();
    //this._game = new Chaos({x: 0, y: 0}, this._points, 0.5);
    this._gameLayer.scene.clear();
    
    this._updateUi();
  }
  
  
  App.prototype._update = function() {
    var newPoint = this._game.update();
    
    if (newPoint) {
      console.log(this._dotSize);
      drawPoint(this._gameLayer.scene.context, newPoint, this._dotSize, 'black');
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
    this._test();
    this._update();
  }
  
  
  App.prototype._stop = function() {
    if (this._running) {
      $('.button-start').show();
      $('.button-stop').hide();
    
      this._running = false;
      clearInterval(this._updateTimer);
    }
  }
  
  
  App.prototype._download = function() {
    this._view.toScene().download({ fileName: 'chaos.png' });
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
    this._clear();
  }
  
  
  App.prototype._test = function() {
    var self = this;
    this._points.forEach(function(point) {
      drawPoint(self._pointsLayer.scene.context, point, 10, 'red');
    });
  }
  
  
  return App;
} ());

