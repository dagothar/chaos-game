"use strict";

var Chaos = (function() {
  
  /**
   * @brief Chaos class constructor.
   */
  function Chaos(startPoint, points, stepSize) {
    this._startPoint = startPoint;
    this._points = points;
    this._stepSize = stepSize;
    this._current = this._startPoint;
  }
  
  
  Chaos.prototype.setStartPoint   = function(startPoint)  { this._startPoint = startPoint; }
  Chaos.prototype.setPoints       = function(points)      { this._points = points; }
  Chaos.prototype.addPoint        = function(point)       { this._points.push(point); }
  Chaos.prototype.clearPoints     = function()            { this._points = []; }
  Chaos.prototype.setStepSize     = function(stepSize)    { this._stepSize = stepSize; }
  

  /**
   * @brief Returns new Chaos Game point.
   */
  Chaos.prototype.update = function(context) {
    /* pick the new target */
    if (this._points.length == 0) return false;
    var target = this._points[Math.floor(Math.random() * this._points.length)];
    if (target === undefined) return null;
    
    /* calculate new position */
    var x = (1.0-this._stepSize) * this._current.x + this._stepSize * target.x;
    var y = (1.0-this._stepSize) * this._current.y + this._stepSize * target.y;
    this._current = {x: x, y: y};
    
    return this._current;
  }
  
  
  return Chaos;
} ());

