/**
 * MAZDA SOUL DRIFT - UI Manager
 * HUD, screen transitions, judgment display
 */

var UIManager = (function() {
  
  var elements = {};
  var judgmentTimer = null;
  
  function init() {
    elements.hud = document.getElementById('hud');
    elements.hudTime = document.getElementById('hud-time');
    elements.hudLap = document.getElementById('hud-lap');
    elements.hudSpeed = document.getElementById('hud-speed');
    elements.hudProgressFill = document.getElementById('hud-progress-fill');
    elements.hudScore = document.getElementById('hud-score');
    elements.hudCornerName = document.getElementById('hud-corner-name');
    elements.titleScreen = document.getElementById('title-screen');
    elements.selectScreen = document.getElementById('select-screen');
    elements.countdown = document.getElementById('countdown');
    elements.countdownText = document.getElementById('countdown-text');
    elements.resultScreen = document.getElementById('result-screen');
    elements.judgmentDisplay = document.getElementById('judgment-display');
    elements.carCards = document.getElementById('car-cards');
  }
  
  function showScreen(name) {
    elements.titleScreen.style.display = (name === 'title') ? 'flex' : 'none';
    elements.selectScreen.style.display = (name === 'select') ? 'flex' : 'none';
    elements.countdown.style.display = (name === 'countdown') ? 'flex' : 'none';
    elements.hud.style.display = (name === 'race') ? 'block' : 'none';
    elements.resultScreen.style.display = (name === 'result') ? 'flex' : 'none';
  }
  
  function updateHUD(data) {
    if (elements.hudTime) {
      elements.hudTime.textContent = 'TIME ' + formatTime(data.time);
    }
    if (elements.hudLap) {
      elements.hudLap.textContent = 'LAP ' + data.lap + '/' + TOTAL_LAPS;
    }
    if (elements.hudSpeed) {
      var displaySpeed = Math.floor(data.speed * 280); // visual km/h
      elements.hudSpeed.textContent = displaySpeed + ' km/h';
      elements.hudSpeed.style.color = data.boosting ? '#FF8800' : '#FFA500';
    }
    if (elements.hudProgressFill) {
      elements.hudProgressFill.style.width = (data.progress * 100) + '%';
    }
    if (elements.hudScore) {
      elements.hudScore.textContent = 'SCORE: ' + data.score.toLocaleString();
    }
  }
  
  function formatTime(ms) {
    var totalSec = ms / 1000;
    var min = Math.floor(totalSec / 60);
    var sec = Math.floor(totalSec % 60);
    var milli = Math.floor(ms % 1000);
    return min + ':' + pad2(sec) + '.' + pad3(milli);
  }
  
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }
  function pad3(n) {
    if (n < 10) return '00' + n;
    if (n < 100) return '0' + n;
    return '' + n;
  }
  
  function showJudgment(judge) {
    var el = elements.judgmentDisplay;
    el.textContent = judge.label;
    el.style.color = judge.color;
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, -50%) scale(1.3)';
    
    clearTimeout(judgmentTimer);
    
    setTimeout(function() {
      el.style.transform = 'translate(-50%, -50%) scale(1.0)';
    }, 100);
    
    judgmentTimer = setTimeout(function() {
      el.style.opacity = '0';
    }, 1500);
  }
  
  function showLapNotification(lap) {
    var el = elements.judgmentDisplay;
    if (lap > TOTAL_LAPS) return;
    
    if (lap === TOTAL_LAPS) {
      el.textContent = 'FINAL LAP!';
      el.style.color = '#FF3344';
    } else {
      el.textContent = 'LAP ' + lap + '/' + TOTAL_LAPS;
      el.style.color = '#FFFFFF';
    }
    el.style.opacity = '1';
    el.style.transform = 'translate(-50%, -50%) scale(1.2)';
    
    setTimeout(function() {
      el.style.transform = 'translate(-50%, -50%) scale(1.0)';
    }, 100);
    
    clearTimeout(judgmentTimer);
    judgmentTimer = setTimeout(function() {
      el.style.opacity = '0';
    }, 1000);
  }
  
  function runCountdown(callback) {
    showScreen('countdown');
    var counts = ['3', '2', '1', 'GO!'];
    var i = 0;
    
    function next() {
      if (i >= counts.length) {
        elements.countdown.style.display = 'none';
        callback();
        return;
      }
      elements.countdownText.textContent = counts[i];
      elements.countdownText.style.animation = 'none';
      // Force reflow
      void elements.countdownText.offsetWidth;
      elements.countdownText.style.animation = 'countPulse 0.6s ease-out';
      
      i++;
      var delay = (i === counts.length) ? 500 : 1000;
      setTimeout(next, delay);
    }
    next();
  }
  
  function buildCarSelectCards(cars, selectedIdx, onSelect) {
    elements.carCards.innerHTML = '';
    
    for (var i = 0; i < cars.length; i++) {
      (function(idx) {
        var car = cars[idx];
        var card = document.createElement('div');
        card.className = 'car-card' + (idx === selectedIdx ? ' selected' : '');
        
        var colorHex = '#' + car.bodyColor.toString(16).padStart(6, '0');
        
        card.innerHTML = 
          '<div class="car-card-color" style="background:' + colorHex + '"></div>' +
          '<div class="car-card-name">' + car.name + '</div>' +
          '<div class="car-card-year">' + car.year + '</div>' +
          '<div class="car-param"><span>SPD</span><div class="car-param-bar"><div class="car-param-fill" style="width:' + (car.baseSpeed * 80) + '%"></div></div></div>' +
          '<div class="car-param"><span>ACC</span><div class="car-param-bar"><div class="car-param-fill" style="width:' + (car.acceleration * 80) + '%"></div></div></div>' +
          '<div class="car-param"><span>DFT</span><div class="car-param-bar"><div class="car-param-fill" style="width:' + (car.driftBoostMul * 75) + '%"></div></div></div>' +
          '<div class="car-card-desc">' + car.desc + '</div>';
        
        card.addEventListener('click', function() {
          onSelect(idx);
        });
        
        elements.carCards.appendChild(card);
      })(i);
    }
  }
  
  function showResult(data) {
    showScreen('result');
    
    document.getElementById('result-time').textContent = formatTime(data.totalTime);
    
    var lapsHtml = '';
    for (var i = 0; i < data.lapTimes.length; i++) {
      lapsHtml += 'LAP ' + (i+1) + ': ' + formatTime(data.lapTimes[i]) + '<br>';
    }
    document.getElementById('result-laps').innerHTML = lapsHtml;
    
    document.getElementById('result-score').textContent = 
      'DRIFT SCORE: ' + data.score.toLocaleString();
    
    var jHtml = '<span style="color:#00FF88">PERFECT: ' + data.judgments.perfect + '</span> | ' +
                '<span style="color:#FFD700">GREAT: ' + data.judgments.great + '</span> | ' +
                '<span style="color:#FF8800">GOOD: ' + data.judgments.good + '</span> | ' +
                '<span style="color:#FF3344">MISS: ' + data.judgments.miss + '</span>';
    document.getElementById('result-judgments').innerHTML = jHtml;
  }
  
  return {
    init: init,
    showScreen: showScreen,
    updateHUD: updateHUD,
    showJudgment: showJudgment,
    showLapNotification: showLapNotification,
    runCountdown: runCountdown,
    buildCarSelectCards: buildCarSelectCards,
    showResult: showResult,
    formatTime: formatTime
  };
})();
