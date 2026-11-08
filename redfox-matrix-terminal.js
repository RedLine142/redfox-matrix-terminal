(function () {
  'use strict';

  var ROOT_PATH = '/play/safari';
  var STYLE_ID = 'matrix-terminal-style';
  var ROOT_ID = 'matrix-terminal-root';

  function start() {
    var path = window.location.pathname.replace(/\/+$/, '');
    if (path !== ROOT_PATH) return;

    var container = document.querySelector('.container');
    if (!container || document.getElementById(ROOT_ID)) return;

    var teamNode = container.querySelector('.team_name');
    var headingNode = container.querySelector('h1');
    var teamName = teamNode ? teamNode.textContent.replace(/^Команда:\s*/i, '').trim() : 'UNKNOWN';
    var gameName = headingNode ? headingNode.textContent.trim() : 'RED FOX QUEST';

    var entries = [];
    var taskNumber = 0;
    var links = container.querySelectorAll('.item a[href]');

    Array.prototype.forEach.call(links, function (link) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '/' || href.indexOf('/play/safari/') !== 0) return;

      var labelNode = link.querySelector('strong');
      var label = labelNode ? labelNode.textContent.trim() : link.textContent.trim();
      var isInfo = /информация\s+по\s+игре/i.test(label);
      var name;

      if (isInfo) {
        name = 'info';
      } else {
        taskNumber += 1;
        name = 'text' + taskNumber;
      }

      entries.push({
        name: name,
        label: label,
        href: href,
        info: isInfo
      });
    });

    injectStyles();
    container.innerHTML = '';
    container.classList.add('matrix-terminal-container');

    var root = document.createElement('section');
    root.id = ROOT_ID;
    root.innerHTML =
      '<div class="mx-shell">' +
        '<div class="mx-topbar"><span class="mx-brand">MATRIX // REDFOX TERMINAL</span><span class="mx-status"><i></i> SYSTEM ONLINE</span></div>' +
        '<div class="mx-screen" id="mx-screen" aria-live="polite">' +
          '<div class="mx-output" id="mx-output"></div>' +
        '</div>' +
        '<form class="mx-input-line" id="mx-form" autocomplete="off">' +
          '<label for="mx-command">C:\\REDFOX&gt;</label>' +
          '<input id="mx-command" name="command" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" autofocus aria-label="Введите команду">' +
          '<span class="mx-cursor"></span>' +
        '</form>' +
        '<div class="mx-footer"><span>ENTER — EXECUTE</span><span>TYPE HELP FOR COMMANDS</span><span id="mx-clock"></span></div>' +
      '</div>';

    container.appendChild(root);

    var output = root.querySelector('#mx-output');
    var form = root.querySelector('#mx-form');
    var input = root.querySelector('#mx-command');
    var screen = root.querySelector('#mx-screen');
    var clock = root.querySelector('#mx-clock');

    function line(text, className) {
      var row = document.createElement('div');
      row.className = 'mx-line' + (className ? ' ' + className : '');
      row.textContent = text;
      output.appendChild(row);
      screen.scrollTop = screen.scrollHeight;
    }

    function blank() {
      line(' ');
    }

    function listEntries(withPing) {
      if (!entries.length) {
        line('NO DIRECTORIES FOUND', 'mx-warning');
        return;
      }

      line(withPing ? 'PING DIRECTORY INDEX...' : 'DIRECTORY OF C:\\REDFOX', 'mx-dim');
      line(' ');
      entries.forEach(function (entry) {
        var prefix = entry.info ? '[INFO] ' : '[FILE] ';
        line(prefix + entry.name + '    ' + entry.label);
        if (withPing) line('  ' + entry.href, 'mx-dim');
      });
      line(' ');
      line(entries.length + ' ITEM(S)', 'mx-success');
    }

    function execute(raw) {
      var command = raw.trim();
      if (!command) return;

      line('C:\\REDFOX> ' + command, 'mx-command-echo');

      var lower = command.toLowerCase();

      if (lower === 'dir') {
        listEntries(false);
        return;
      }

      if (lower === 'ping') {
        listEntries(true);
        return;
      }

      if (lower === 'cls') {
        output.innerHTML = '';
        return;
      }

      if (lower === 'shutdown') {
        line('RESTARTING REDFOX SESSION...', 'mx-warning');
        window.setTimeout(function () {
          window.location.reload();
        }, 450);
        return;
      }

      if (lower === 'help') {
        line('AVAILABLE COMMANDS:', 'mx-success');
        line('DIR                  - SHOW AVAILABLE LEVELS');
        line('PING                 - SHOW LEVEL INDEX AND LINKS');
        line('CD C:\\text1          - OPEN LEVEL');
        line('CHDIR C:\\text1       - OPEN LEVEL (ALIAS)');
        line('CLS                  - CLEAR TERMINAL');
        line('SHUTDOWN             - RELOAD PAGE');
        line('HELP                 - SHOW THIS HELP');
        return;
      }

      var match = command.match(/^(?:cd|chdir)\s+(.+)$/i);
      if (match) {
        var target = match[1].trim().replace(/\//g, '\\').replace(/^["']|["']$/g, '');
        target = target.replace(/^C:\\?/i, '').replace(/^\\+/, '').toLowerCase();
        var requested = target.split('\\').filter(Boolean).pop();

        var entry = entries.find(function (item) {
          return item.name.toLowerCase() === requested;
        });

        if (!entry) {
          line('PATH NOT FOUND: ' + match[1], 'mx-error');
          line('TYPE DIR TO VIEW AVAILABLE LEVELS', 'mx-dim');
          return;
        }

        line('OPENING ' + entry.name.toUpperCase() + '...', 'mx-success');
        window.setTimeout(function () {
          window.location.href = entry.href;
        }, 250);
        return;
      }

      line('COMMAND NOT RECOGNIZED: ' + command, 'mx-error');
      line('TYPE HELP TO VIEW AVAILABLE COMMANDS', 'mx-dim');
    }

    line('MATRIX TERMINAL // REDFOX QUEST', 'mx-success');
    line('ESTABLISHING SECURE CONNECTION...', 'mx-dim');
    line('CONNECTION ESTABLISHED', 'mx-success');
    blank();
    line('Wake up, ' + teamName + '...', 'mx-wakeup');
    line('The Matrix has you.', 'mx-dim');
    line('Game: ' + gameName, 'mx-dim');
    blank();
    line('TYPE DIR TO LIST AVAILABLE LEVELS.', 'mx-hint');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value;
      input.value = '';
      execute(value);
      input.focus();
    });

    root.addEventListener('click', function (event) {
      if (event.target !== input) input.focus();
    });

    function updateClock() {
      clock.textContent = new Date().toLocaleTimeString();
    }
    updateClock();
    window.setInterval(updateClock, 1000);

    input.focus();
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var css = [
      '.matrix-terminal-container{max-width:100%!important;padding:18px!important;background:#020804!important;border:1px solid #174b2b!important;box-shadow:0 0 35px rgba(0,255,90,.10),inset 0 0 35px rgba(0,255,90,.035)!important;color:#8affaa!important;font-family:Consolas,"Courier New",monospace!important;}',
      '#matrix-terminal-root{width:100%;color:#8affaa;font-family:Consolas,"Courier New",monospace;}',
      '.mx-shell{position:relative;overflow:hidden;background:linear-gradient(180deg,rgba(0,15,6,.98),rgba(0,5,2,.99));border:1px solid #176332;box-shadow:0 0 22px rgba(0,255,85,.12);}',
      '.mx-topbar{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:12px 16px;border-bottom:1px solid #14552a;background:rgba(0,35,12,.65);font-size:12px;letter-spacing:2px;}',
      '.mx-brand{color:#b5ffc9;font-weight:bold;text-shadow:0 0 8px rgba(0,255,90,.55);}',
      '.mx-status{color:#51c978;white-space:nowrap;font-size:10px;letter-spacing:1px;}',
      '.mx-status i{display:inline-block;width:7px;height:7px;margin-right:7px;border-radius:50%;background:#42ff78;box-shadow:0 0 9px #42ff78;}',
      '.mx-screen{height:390px;overflow-y:auto;padding:18px 20px 12px;background:repeating-linear-gradient(0deg,rgba(0,255,90,.018) 0,rgba(0,255,90,.018) 1px,transparent 1px,transparent 4px),radial-gradient(ellipse at 50% 0%,rgba(0,90,35,.16),transparent 72%);}',
      '.mx-output{min-height:100%;font-size:14px;line-height:1.65;overflow-wrap:anywhere;}',
      '.mx-line{min-height:1.65em;color:#8affaa;white-space:pre-wrap;}',
      '.mx-dim{color:#43895a;}.mx-success{color:#65ff91;text-shadow:0 0 7px rgba(0,255,90,.3);}.mx-warning{color:#d2ed70;}.mx-error{color:#ff6868;}.mx-hint{color:#54c979;}.mx-command-echo{color:#d4ffdf;}.mx-wakeup{margin:5px 0;color:#baffc9;font-size:20px;font-weight:bold;letter-spacing:1px;text-shadow:0 0 12px rgba(0,255,90,.55);}',
      '.mx-input-line{display:flex;align-items:center;gap:9px;padding:13px 18px;border-top:1px solid #14552a;background:#001407;}',
      '.mx-input-line label{color:#65ff91;white-space:nowrap;font-size:14px;}',
      '.mx-input-line input{flex:1;min-width:0;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;color:#caffd7!important;font:14px Consolas,"Courier New",monospace!important;padding:2px 0!important;margin:0!important;}',
      '.mx-cursor{width:8px;height:17px;background:#65ff91;box-shadow:0 0 8px #36ff70;animation:mxBlink 1s steps(2,start) infinite;}',
      '.mx-footer{display:flex;justify-content:space-between;gap:8px;padding:8px 14px;border-top:1px solid rgba(20,85,42,.55);color:#39794e;font-size:9px;letter-spacing:1px;}',
      '@keyframes mxBlink{to{visibility:hidden;}}',
      '@media(max-width:600px){.matrix-terminal-container{padding:8px!important;}.mx-screen{height:360px;padding:14px 12px;}.mx-output{font-size:12px;}.mx-wakeup{font-size:17px;}.mx-topbar{font-size:10px;padding:10px;}.mx-footer{font-size:8px;flex-wrap:wrap;}.mx-input-line{padding:12px 10px;}.mx-input-line label,.mx-input-line input{font-size:12px!important;}}'
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