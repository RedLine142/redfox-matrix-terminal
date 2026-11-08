(function () {
  'use strict';

  var STYLE_ID = 'matrix-task-style';
  var ROOT_ID = 'matrix-task-effects';
  var TASK_PATH = /^\/play\/safari\/\d+\/?$/;

  function start() {
    if (!TASK_PATH.test(window.location.pathname)) return;
    if (document.getElementById(ROOT_ID)) return;

    var container = document.querySelector('.container.container-location') || document.querySelector('.container');
    if (!container) return;

    injectStyles();

    var effects = document.createElement('div');
    effects.id = ROOT_ID;
    effects.setAttribute('aria-hidden', 'true');
    effects.innerHTML = '<canvas class="mt-rain"></canvas><div class="mt-vignette"></div>';
    document.body.appendChild(effects);
    startRain(effects.querySelector('canvas'));

    container.classList.add('matrix-task-container');

    var topbar = document.createElement('div');
    topbar.className = 'mt-topbar';
    topbar.innerHTML = '<span class="mt-brand">MATRIX // REDFOX TASK TERMINAL</span><span class="mt-online"><i></i> SYSTEM ONLINE</span>';
    container.insertBefore(topbar, container.firstChild);

    var heading = container.querySelector('h1');
    if (heading) heading.classList.add('mt-heading');

    var taskText = container.querySelector('.task_text');
    if (taskText) taskText.classList.add('mt-task-text');

    var tabs = document.querySelector('.tabs');
    if (tabs) tabs.classList.add('mt-tabs');

    var fixedTop = document.querySelector('.fixed-top');
    if (fixedTop) fixedTop.classList.add('mt-codebar');

    var form = document.querySelector('.fixed-top form.enter');
    if (form) {
      form.setAttribute('autocomplete', 'off');
      var input = form.querySelector('input[name="code"]');
      if (input) {
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('autocapitalize', 'off');
      }
    }

    var announcement = container.querySelector('.announcement');
    if (announcement) announcement.classList.add('mt-announcement');

    var sectionLabels = {
      'found-codes': 'FOUND CODES',
      'task': 'MISSION DATA',
      'hints': 'INTEL / HINTS',
      'location-codes': 'LOCATION CODES'
    };

    Array.prototype.forEach.call(container.querySelectorAll('.tabcontent'), function (section) {
      var key = Object.keys(sectionLabels).find(function (name) { return section.classList.contains(name); });
      if (key) {
        section.setAttribute('data-matrix-label', sectionLabels[key]);
        section.classList.add('mt-panel');
      }
    });

    if (tabs) {
      Array.prototype.forEach.call(tabs.querySelectorAll('.tab'), function (tab) {
        tab.classList.add('mt-tab');
      });
    }

    var clock = document.createElement('div');
    clock.className = 'mt-clock';
    clock.innerHTML = '<span class="mt-clock-label">LOCAL SYSTEM TIME</span><strong></strong>';
    if (tabs) tabs.appendChild(clock);
    else document.body.appendChild(clock);

    function updateClock() {
      var value = clock.querySelector('strong');
      if (value) value.textContent = new Date().toLocaleTimeString('ru-RU');
    }
    updateClock();
    window.setInterval(updateClock, 1000);

    var taskName = heading ? heading.textContent.replace(/\s+/g, ' ').trim() : 'TASK';
    var title = document.createElement('div');
    title.className = 'mt-task-id';
    title.textContent = 'MISSION FILE // ' + taskName.toUpperCase();
    if (heading) heading.insertAdjacentElement('afterend', title);

    var activeTab = tabs && tabs.querySelector('.tab.active');
    if (!activeTab && tabs) {
      var defaultTab = tabs.querySelector('#task');
      if (defaultTab) defaultTab.click();
    }

    window.addEventListener('load', function () {
      Array.prototype.forEach.call(container.querySelectorAll('.tabcontent img'), function (img) {
        img.loading = 'lazy';
      });
    });
  }

  function startRain(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var width = 0;
    var height = 0;
    var columns = 0;
    var drops = [];
    var chars = 'アカサタナハマヤラワ012345789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(width / 19);
      drops = [];
      for (var i = 0; i < columns; i += 1) drops[i] = Math.random() * -height / 18;
    }

    function draw() {
      ctx.fillStyle = 'rgba(0, 7, 2, 0.12)';
      ctx.fillRect(0, 0, width, height);
      ctx.font = '12px monospace';
      for (var i = 0; i < columns; i += 1) {
        var y = drops[i] * 18;
        ctx.fillStyle = Math.random() > 0.985 ? 'rgba(180,255,195,.75)' : 'rgba(30,190,75,.32)';
        ctx.fillText(chars.charAt(Math.floor(Math.random() * chars.length)), i * 19, y);
        if (y > height && Math.random() > 0.98) drops[i] = 0;
        drops[i] += 0.35 + Math.random() * 0.35;
      }
      window.requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      'html,body{min-height:100%;background:#010603!important;color:#a4ffb8!important;}body{position:relative;font-family:Consolas,"Courier New",monospace!important;}',
      '#matrix-task-effects{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}#matrix-task-effects .mt-rain{position:absolute;inset:0;opacity:.28;}#matrix-task-effects .mt-vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,.58) 100%);}',
      'body>.wrapper{position:relative;z-index:1;}',
      '.matrix-task-container{box-sizing:border-box;width:min(1180px,calc(100% - 32px))!important;max-width:1180px!important;margin:76px auto 86px!important;padding:0!important;background:rgba(0,12,5,.91)!important;border:1px solid #176332!important;box-shadow:0 0 35px rgba(0,255,90,.11),inset 0 0 35px rgba(0,255,90,.035)!important;color:#a4ffb8!important;font-family:Consolas,"Courier New",monospace!important;}',
      '.mt-topbar{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid #14552a;background:rgba(0,35,12,.82);font-size:11px;letter-spacing:2px;}',
      '.mt-brand{color:#c0ffd0;font-weight:bold;text-shadow:0 0 8px rgba(0,255,90,.45);}.mt-online{color:#55c978;white-space:nowrap;font-size:10px;letter-spacing:1px;}.mt-online i{display:inline-block;width:7px;height:7px;margin-right:7px;border-radius:50%;background:#42ff78;box-shadow:0 0 9px #42ff78;}',
      '.matrix-task-container h1.mt-heading{display:flex;align-items:center;gap:10px;margin:0!important;padding:18px 20px!important;border-bottom:1px solid rgba(30,110,55,.45)!important;background:rgba(0,20,8,.72)!important;color:#baffc9!important;font-size:18px!important;letter-spacing:1px!important;}',
      '.matrix-task-container h1 a{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border:1px solid #24643a;color:#79ff9c!important;background:rgba(0,55,18,.4);}.matrix-task-container h1 a:hover{background:rgba(0,100,35,.45);box-shadow:0 0 12px rgba(0,255,90,.2);}.matrix-task-container .separator{color:#36764a!important;}.matrix-task-container h1 strong{color:#c5ffd2!important;}',
      '.mt-task-id{padding:10px 20px;border-bottom:1px solid rgba(30,110,55,.35);color:#4d9c65;font-size:10px;letter-spacing:2px;background:rgba(0,12,5,.6);}',
      '.matrix-task-container .tabcontent{box-sizing:border-box;padding:22px!important;color:#a4ffb8!important;background:linear-gradient(180deg,rgba(0,20,8,.72),rgba(0,8,3,.78))!important;}',
      '.matrix-task-container .tabcontent:not(.active){display:none!important;}.matrix-task-container .tabcontent.active{display:block!important;}',
      '.matrix-task-container .tabcontent:before{content:attr(data-matrix-label);display:block;margin:0 0 18px;padding:0 0 10px;border-bottom:1px solid rgba(45,140,70,.35);color:#65ff91;font-size:11px;font-weight:bold;letter-spacing:2px;}',
      '.matrix-task-container p{color:#b4ffc5!important;line-height:1.75;}.matrix-task-container strong{color:#e0ffe7!important;}.matrix-task-container a{color:#75ff9b!important;text-decoration-color:rgba(90,255,140,.4);}.matrix-task-container a:hover{color:#d5ffe0!important;text-shadow:0 0 8px rgba(0,255,90,.45);}',
      '.matrix-task-container .task_text{font-size:15px;line-height:1.8;}.matrix-task-container .task_text img,.matrix-task-container .hints img{display:block;max-width:100%!important;width:auto!important;height:auto!important;margin:16px auto!important;border:1px solid rgba(55,190,95,.35);box-shadow:0 0 18px rgba(0,255,90,.09);}.matrix-task-container .task_text a{display:inline-block;max-width:100%;}',
      '.matrix-task-container .found-codes,.matrix-task-container .spoiler,.matrix-task-container .hints li,.matrix-task-container .location-codes{border:1px solid rgba(50,150,75,.28);background:rgba(0,30,11,.42);}',
      '.matrix-task-container .found-codes{padding:16px!important;}.matrix-task-container .spoiler{margin-top:18px;padding:14px 18px;}.matrix-task-container .hints ul,.matrix-task-container ul.hints{padding:0!important;list-style:none!important;}.matrix-task-container .hints li{margin:0 0 14px;padding:16px!important;list-style:none!important;}.matrix-task-container .hints li>p:first-child{margin-top:0;color:#76ff9b!important;font-size:12px;letter-spacing:1px;text-transform:uppercase;}.matrix-task-container .location-codes{padding:16px!important;}',
      '.matrix-task-container input[name="code"]{box-sizing:border-box;min-width:0;min-height:42px;padding:10px 13px!important;border:1px solid #28653b!important;border-radius:0!important;outline:none!important;background:#001407!important;color:#d4ffe0!important;box-shadow:inset 0 0 12px rgba(0,0,0,.5)!important;font:14px Consolas,"Courier New",monospace!important;}.matrix-task-container input[name="code"]:focus{border-color:#54ff83!important;box-shadow:0 0 12px rgba(0,255,90,.18)!important;}.matrix-task-container input[name="code"]::placeholder{color:#4f9663!important;}',
      '.mt-codebar{position:fixed!important;top:0;left:0;right:0;z-index:50!important;padding:10px 16px!important;border-bottom:1px solid #176332!important;background:rgba(0,10,4,.96)!important;box-shadow:0 5px 22px rgba(0,0,0,.55)!important;backdrop-filter:blur(10px);}.mt-codebar>.wrapper{width:min(1180px,100%);margin:0 auto;}.mt-codebar form.enter{margin:0!important;}.mt-codebar .non-fixed-input{display:flex;gap:10px;align-items:center;}.mt-codebar input[name="code"]{flex:1;}',
      '.mt-codebar button{min-height:42px;padding:0 20px!important;border:1px solid #3acb68!important;border-radius:0!important;background:linear-gradient(180deg,#0b5524,#063516)!important;color:#caffd7!important;font: bold 12px Consolas,"Courier New",monospace!important;letter-spacing:1px;text-transform:uppercase;cursor:pointer;}.mt-codebar button:hover{background:linear-gradient(180deg,#117a32,#08451d)!important;box-shadow:0 0 14px rgba(0,255,90,.22);}',
      '.mt-tabs{position:fixed!important;left:0;right:0;bottom:0;z-index:45!important;margin:0!important;padding:0 16px!important;border-top:1px solid #176332!important;background:rgba(0,10,4,.97)!important;box-shadow:0 -7px 24px rgba(0,0,0,.5)!important;backdrop-filter:blur(10px);}.mt-tabs>.wrapper{display:flex;justify-content:center;align-items:stretch;gap:0;width:min(1180px,100%);margin:0 auto;}.mt-tabs .tab{flex:1 1 0;min-width:0;margin:0!important;padding:15px 10px!important;border:0!important;border-right:1px solid rgba(45,130,65,.22)!important;border-radius:0!important;background:transparent!important;color:#57966a!important;font:11px Consolas,"Courier New",monospace!important;letter-spacing:1px;text-align:center;text-transform:uppercase;cursor:pointer;}.mt-tabs .tab:first-child{border-left:1px solid rgba(45,130,65,.22)!important;}.mt-tabs .tab.active{background:rgba(0,75,25,.42)!important;color:#baffc9!important;box-shadow:inset 0 2px 0 #45ed78,0 0 14px rgba(0,255,90,.08);text-shadow:0 0 8px rgba(0,255,90,.25);}',
      '.mt-clock{display:flex;flex-direction:column;justify-content:center;gap:3px;padding:5px 12px;border-left:1px solid rgba(45,130,65,.3);color:#8affaa;white-space:nowrap;}.mt-clock-label{color:#43895a;font-size:8px;letter-spacing:1px;}.mt-clock strong{font-size:12px;letter-spacing:1px;}',
      '.matrix-task-container .announcement{margin:0!important;padding:0!important;}.matrix-task-container .announcement a{color:#75ff9b!important;}',
      '@media(min-width:768px){.matrix-task-container{min-height:calc(100vh - 162px);}.matrix-task-container .tabcontent.active{min-height:calc(100vh - 330px);}.matrix-task-container .task_text{max-width:100%;}}',
      '@media(max-width:767px){.matrix-task-container{width:calc(100% - 16px)!important;margin:76px auto 100px!important;}.mt-topbar{padding:11px 12px;font-size:9px;letter-spacing:1px;}.mt-online{font-size:8px;}.matrix-task-container h1.mt-heading{padding:13px!important;font-size:15px!important;}.mt-task-id{padding:9px 13px;font-size:9px;}.matrix-task-container .tabcontent{padding:14px!important;}.matrix-task-container .task_text{font-size:14px;}.mt-codebar{padding:8px!important;}.mt-codebar>.wrapper{width:100%;}.mt-codebar .non-fixed-input{gap:6px;}.mt-codebar input[name="code"]{font-size:12px!important;min-height:40px;}.mt-codebar button{padding:0 10px!important;font-size:10px!important;}.mt-tabs{padding:0 4px!important;}.mt-tabs>.wrapper{flex-wrap:wrap;}.mt-tabs .tab{padding:12px 4px!important;font-size:9px!important;letter-spacing:0;}.mt-clock{display:none;}.matrix-task-container .tabcontent.active{min-height:42vh;}}',
      '@media(max-width:390px){.mt-brand{font-size:8px;}.mt-online{font-size:7px;}.mt-tabs .tab{font-size:8px!important;}.mt-codebar button{padding:0 7px!important;}}'
    ].join('\n');

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();