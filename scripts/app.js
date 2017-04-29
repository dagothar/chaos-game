"use strict";

var App = (function() {
  
  
  function drawDot(ctx, point, size, color) {
    ctx.save();
    
    ctx.fillStyle = color;
    
    ctx.beginPath();
      ctx.arc(point.x, point.y, size/2.0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  
  var POINT_ID = 10;
  
  function Point(x, y) {
    this.x = x;
    this.y = y;
    this.selected = false;
    this.hovered = false;
    this.key = ++POINT_ID;
  }
  
  
  /**
   * @brief App class constructor.
   */
  function App() {
    var self = this;
    
    this._updateTimer   = undefined;
    this._running       = false;
    
    this._points        = [
      new Point(100, 100),
      new Point(700, 100),
      new Point(400, 500)
    ];
    this._pointsHash = [];
    this._hashPoints();
    this._hovered = null;
    this._selected = null;
    this._newPoint = false;
    this._mouseUp = false;
    
    this._viewContainer = $('#view').get(0);
    this._view = new Concrete.Viewport({
      container: this._viewContainer,
      width: 800,
      height: 600
    });
    this._pointsLayer = new Concrete.Layer();
    this._gameLayer = new Concrete.Layer();
    this._view.add(this._pointsLayer).add(this._gameLayer);
    
    this._speed         = 10;
    this._dotSize       = 3;
    this._stepSize      = 0.5;
    
    this._game = new Chaos({x: 400, y: 300}, this._points, this._stepSize);
  };
  
  
  App.prototype._hashPoints = function() {
    var self = this;
    
    this._pointsHash = [];
    this._points.forEach(function(p) {
      self._pointsHash[p.key] = p;
    });
  }
  
  
  App.prototype._removePoint = function(point) {
    var self = this;
    
    var idx = this._points.findIndex(function(p) { return p.key == self._selected.key; })
    this._points.splice(idx, 1);
    this._hashPoints();
  }
  
  
  App.prototype._bindUiActions = function() {
    var self = this;

    $('.button-start').show();
    $('.button-stop').hide();
    $('.slider-speed').val(100);
    $('.parameter-dot-size').val(this._dotSize);
    $('.slider-step').val(50);
    
    $('.button-reset').click(function() { self._clear(); });
    $('.button-start').click(function() { self._start(); });
    $('.button-stop').click(function() { self._stop(); });
    $('.button-step').click(function() { self._step(); });
    $('.button-download').click(function() { self._download(); });
    $('.slider-speed').on('input change', function() { self._changeSpeed($(this).val()); });
    $('.parameter').on('input change', function() { self._updateParameters(); });
    
    /* control points */
    $('#view').mousemove(_.throttle(function(e) { self._mousemove(e); }, 10));
    
    $('#view').mouseout(function(e) {
      if (!self._newPoint) {
        if (self._hovered) { self._hovered.hovered = false; }
        if (self._selected) { self._selected.selected = false; }
        
        if (self._selected) self._removePoint(self._selected);
        
        self._hovered = null;
        self._selected = null;
      }

      self._updateControlPoints();
    });
    
    $('#view').mousedown(function(e) {
      self._mouseUp = false;
      self._selected = self._hovered;
    });
    
    $('body').mouseup(function(e) {
      self._mouseUp = true;
    });
    
    $('#view').mouseup(function(e) {
      self._mouseUp = true;
      self._selected = null;
      self._newPoint = false;
    });
    
    $('.new-point').mousedown(function(e) {
      var newPoint = new Point(0, 0);
      self._points.push(newPoint);
      self._points.forEach(function(p) {
        self._pointsHash[p.key] = p;
      });
      
      self._newPoint = true;
      newPoint.hovered = true;
      newPoint.selected = true;
      self._hovered = newPoint;
      self._selected = newPoint;
    });
    
    this._updateUi();
    this._updateControlPoints();
  }
  
  
  App.prototype._updateUi = function() {
    /* update speed indicator */
    $('.speed').text((10.0/this._speed).toFixed(3) + 'x');
    
    /* update step size */
    $('.step-size').text(this._stepSize.toFixed(2));
  }
  
  
  App.prototype._updateParameters = function() {
    /* update dot size */
    this._dotSize = parseFloat($('.parameter-dot-size').val());
    if (this._dotSize < 1) $('.parameter-dot-size').val(1);
    if (this._dotSize > 10) $('.parameter-dot-size').val(10);
    
    /* update step size */
    this._stepSize = 0.01 * parseFloat($('.slider-step').val());
    this._game.setStepSize(this._stepSize);
    
    this._updateUi();
  }
  
  
  App.prototype._clear = function() {
    this._gameLayer.scene.clear();
  }
  
  
  App.prototype._update = function() {
    var newPoint = this._game.update();
    this._updateControlPoints();
    
    if (newPoint) {
      drawDot(this._gameLayer.scene.context, newPoint, this._dotSize, 'black');
      drawDot(this._pointsLayer.scene.context, newPoint, 10, 'green');
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
  
  
  /*App.prototype._step = function() {
    this._updateControlPoints();
    this._update();
  }*/
  
  
  App.prototype._stop = function() {
    if (this._running) {
      $('.button-start').show();
      $('.button-stop').hide();
    
      this._running = false;
      clearInterval(this._updateTimer);
    }
  }
  
  
  /**
   * @brief Download button callback.
   */
  App.prototype._download = function() {
    this._view.toScene().download({ fileName: 'chaos.png' });
  }
  
  
  App.prototype._changeSpeed = function(val) {
    this._speed = 1000 * Math.pow(1.047129, -val);
    //console.log(this._speed);
    if (this._running) {
      clearInterval(this._updateTimer);
      var self = this;
      this._updateTimer = setInterval(function() { self._update(); }, this._speed);
    } 
    this._updateUi();
  }
  
  
  App.prototype._updateControlPoints = function() {
    var self = this;
    
    var scene = this._pointsLayer.scene;
    var hit = this._pointsLayer.hit;
    
    scene.clear();
    hit.clear();

    this._points.forEach(function(point) {
      drawDot(hit.context, point, 10, hit.getColorFromKey(point.key));
      drawDot(scene.context, point, 10, point.hovered ? 'yellow' : 'red');
    });
  }
  
  
  /**
   * @brief Callback for mouse movement in the viewport.
   */
  App.prototype._mousemove = function(e) {
    var boundingRect = this._viewContainer.getBoundingClientRect();
    var x = Math.floor(e.clientX - boundingRect.left);
    var y = Math.floor(e.clientY - boundingRect.top);
    
    //console.log(x, y);
    
    if (this._selected) {
      this._selected.x = x;
      this._selected.y = y;
    } else {
      var key = this._view.getIntersection(x, y);
      
      this._points.forEach(function(point) {
        point.hovered = false;
      });
      
      if (key) {
        this._pointsHash[key].hovered = true;
        this._hovered = this._pointsHash[key];
      } else {
        this._hovered = null;
      }
    }
    
    this._updateControlPoints();
  }
  
  
  App.prototype.run = function() {
    this._bindUiActions();
    this._clear();
  }
  
  
  return App;
} ());

