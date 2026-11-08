(function () {
  'use strict';

  var PATH = /^\/play\/safari\/\d+\/?$/;
  var STYLE_ID = 'mx-breach-style';
  var ROOT_ID = 'mx-breach-root';
  var FINAL_CODE = 'MATRIX-7319';

  function start() {
    if (!PATH.test(location.pathname) || document.getElementById(ROOT_ID)) return;

    var container = document.querySelector('.container.container-location') || document.querySelector('.container');
    if (!container) return;

    var engineForm = document.querySelector('.fixed-top form.enter');
    if (!engineForm) return;

    injectStyles();

    var heading = container.querySelector('h1');
    var taskText = container.querySelector('.task_text');
    if (taskText) taskText.style.display = 'none';

    var tabs = document.querySelector('.tabs');
    if (tabs) tabs.style.display = 'none';

    Array.prototype.forEach.call(container.querySelectorAll('.tabcontent'), function (node) {
      node.style.display = 'none';
    });

    var root = document.createElement('section');
    root.id = ROOT_ID;
    root.innerHTML =
      '<div class="mb-shell">' +
        '<div class="mb-topbar"><span class="mb-brand">MATRIX // SECURITY BREACH</span><span class="mb-online"><i></i> INTRUSION SIMULATOR ONLINE</span></div>' +
        '<div class="mb-meta"><span>SECURITY PROTOCOL: ACTIVE</span><span id="mb-level">ACCESS: LOCKED</span></div>' +
        '<div class="mb-screen" id="mb-screen"><canvas class="mb-rain"></canvas><div class="mb-output" id="mb-output" aria-live="polite"></div></div>' +
        '<form class="mb-command" id="mb-form" autocomplete="off"><label for="mb-input">SYSTEM:\\&gt;</label><span class="mb-cursor"></span><input id="mb-input" type="text" autocomplete="off" spellcheck="false" autocapitalize="off" aria-label="Команда терминала" placeholder="Введите команду..."></form>' +
        '<div class="mb-footer"><span>ENTER — EXECUTE</span><span>HELP — COMMAND LIST</span><span id="mb-clock"></span></div>' +
      '</div>';

    if (heading) heading.insertAdjacentElement('afterend', root);
    else container.insertBefore(root, container.firstChild);

    var output = root.querySelector('#mb-output');
    var screen = root.querySelector('#mb-screen');
    var input = root.querySelector('#mb-input');
    var form = root.querySelector('#mb-form');
    var levelLabel = root.querySelector('#mb-level');
    var clock = root.querySelector('#mb-clock');
    var stage = 0;
    var adminClueRead = false;
    var terminalMode = 'SYSTEM';
    var flynnState = 'idle';
    var promptLabel = root.querySelector('.mb-command label');
    var history = [];
    var historyIndex = 0;

    function line(value, cls) {
      var el = document.createElement('div');
      el.className = 'mb-line' + (cls ? ' ' + cls : '');
      el.textContent = value;
      output.appendChild(el);
      screen.scrollTop = screen.scrollHeight;
    }
    function blank() { line(' '); }
    function setLevel(value) { levelLabel.textContent = 'ACCESS: ' + value; }
    function prompt() { line('SYSTEM:\\> ' + input.value, 'mb-echo'); }

    function execute(raw) {
      var command = raw.trim();
      if (!command) return;
      line((terminalMode === 'FLYNN' ? 'FLYNN:\\> ' : 'SYSTEM:\\> ') + command, 'mb-echo');
      var lower = command.toLowerCase();

      if (terminalMode === 'FLYNN') {
        if (lower === 'clear' || lower === 'reboot') {
          resetConsole();
          return;
        }
        if (flynnState === 'laser') {
          if (lower === 'n') {
            line('ОТМЕНА ЗАПУСКА ЛАЗЕРА.', 'mb-warning');
            resetConsole();
          } else if (lower === 'y') {
            line('LASER SEQUENCE INITIATED ............ OK', 'mb-success');
            line('ACCESS GRANTED // FINAL REDFOX CODE:', 'mb-warning');
            blank();
            line(FINAL_CODE, 'mb-final');
            blank();
            line('ВВЕДИ КОД В ОСНОВНОЕ ПОЛЕ REDFOX.', 'mb-success');
            flynnState = 'complete';
          } else {
            line('ВВЕДИ Y ИЛИ N.', 'mb-warning');
          }
          return;
        }
        if (lower === 'uname -a' && flynnState === 'identity') {
          line('ВЫВОД ИНФОРМАЦИИ ОБ ОПЕРАЦИОННОЙ СИСТЕМЕ И ЯДРЕ', 'mb-success');
          line('FLYNN OS 6.1.0 // MATRIX KERNEL x86_64', 'mb-dim');
          line('AVAILABLE UTILITIES (SIMULATED):', 'mb-warning');
          line('DIR  CD / CHDIR  COPY / XCOPY / ROBOCOPY  DEL / ERASE', 'mb-dim');
          line('MD / MKDIR  RD / RMDIR  REN / RENAME  TYPE', 'mb-dim');
          line('TASKLIST  TASKKILL  SHUTDOWN  SCHTASKS  CHKDSK  DEFRAG', 'mb-dim');
          line('DISKPART  SFC /SCANNOW  IPCONFIG  PING  TRACERT  NETSTAT', 'mb-dim');
          line('PWD  RM  CAT  LESS / MORE  FIND / LOCATE', 'mb-dim');
          line('SYSTEM UTILITIES LOADED. COMMAND EXECUTION RESTRICTED.', 'mb-warning');
          line('ДОСТУПНЫ CLEAR И REBOOT. ОСТАЛЬНЫЕ УТИЛИТЫ НЕАКТИВНЫ.', 'mb-dim');
          flynnState = 'utilities';
          return;
        }
        if (lower === 'login -n root' && flynnState === 'utilities') {
          line('ПОПЫТКА ВОЙТИ ПОД УЧЁТНОЙ ЗАПИСЬЮ СУПЕРПОЛЬЗОВАТЕЛЯ root', 'mb-warning');
          line('STATUS: ЗАВЕРШИЛАСЬ НЕУДАЧЕЙ: *Login incorrect*', 'mb-error');
          line('СЕАНС ОГРАНИЧЕН. ДОСТУПНЫ CLEAR И REBOOT.', 'mb-dim');
          flynnState = 'root-failed';
          return;
        }
        if (lower === 'backdoor' && flynnState === 'root-failed') {
          line('HISTORY:', 'mb-success');
          line('vi', 'mb-dim');
          line('make', 'mb-dim');
          line('sanity_check', 'mb-dim');
          line('configure', 'mb-dim');
          line('LLSDLaserControl -ok 1', 'mb-warning');
          flynnState = 'backdoor-open';
          return;
        }
        if (lower === 'llsdl lasercontrol -ok 1' && flynnState === 'backdoor-open') {
          line('Launch Laser ?', 'mb-final');
          line('Y / N', 'mb-warning');
          flynnState = 'laser';
          return;
        }
        if (lower === 'whoami' || lower === 'uname -a' || lower === 'login -n root' || lower === 'backdoor' || lower.indexOf('llsdl') === 0) {
          line('КОМАНДА НЕДОСТУПНА В ТЕКУЩЕМ СОСТОЯНИИ СИСТЕМЫ.', 'mb-error');
          return;
        }
        line('КОМАНДА НЕ РАСПОЗНАНА ИЛИ УТИЛИТА НЕ АКТИВНА.', 'mb-error');
        return;
      }

      if (lower === 'whoami') {
        line('Выдано имя пользователя', 'mb-success');
        terminalMode = 'FLYNN';
        flynnState = 'identity';
        promptLabel.textContent = 'FLYNN:\\>';
        levelLabel.textContent = 'SESSION: FLYNN';
        return;
      }

      if (lower === 'help') {
        line('ДОСТУПНЫЕ КОМАНДЫ:', 'mb-success');
        line('HELP                 — СПИСОК ДОСТУПНЫХ КОМАНД');
        line('WHOAMI               — ОПРЕДЕЛИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ');
        line('STATUS               — ТЕКУЩИЙ УРОВЕНЬ ДОСТУПА');
        line('CLEAR                — ОЧИСТИТЬ ЭКРАН');
        if (stage === 0) {
          line('SCAN                 — СКАНИРОВАТЬ УЗЕЛ');
          line('AUTH GUEST <КЛЮЧ>    — ПОЛУЧИТЬ GUEST');
        } else {
          line('LS                   — СПИСОК ФАЙЛОВ');
          line('CAT WELCOME.LOG      — ПРОЧИТАТЬ ПЕРЕХВАЧЕННОЕ СООБЩЕНИЕ');
          line('CAT USER.KEY         — ПРОЧИТАТЬ ЗАШИФРОВАННЫЙ ТОКЕН');
          line('CAT TRACE.LOG        — ПРОЧИТАТЬ ЖУРНАЛ ПЕРЕХВАТА');
          line('AUTH USER <КЛЮЧ>     — ПОЛУЧИТЬ USER');
        }
        if (stage >= 2) {
          line('CAT ADMIN.AUDIT      — ПРОЧИТАТЬ АУДИТ');
          line('AUDIT                — ПРОАНАЛИЗИРОВАТЬ ЗАЩИТУ');
          line('EXPLOIT <КЛЮЧ>       — ИСПОЛЬЗОВАТЬ УЯЗВИМОСТЬ');
        }
        if (stage >= 3) line('CAT VAULT.DAT        — ОТКРЫТЬ ЗАЩИЩЁННЫЙ ФАЙЛ');
        return;
      }
      if (lower === 'clear' || lower === 'cls') { output.innerHTML = ''; return; }
      if (lower === 'status') {
        line('ТЕКУЩИЙ УРОВЕНЬ: ' + ['GUEST','USER','ADMIN'][stage], 'mb-success');
        line('ПРОТОКОЛ ЗАЩИТЫ: ' + (stage === 3 ? 'ВЗЛОМАН' : 'АКТИВЕН'), stage === 3 ? 'mb-success' : 'mb-dim');
        return;
      }
      if (lower === 'scan') {
        line('СКАНИРОВАНИЕ СЕТЕВОГО УЗЛА...', 'mb-dim');
        line('НАЙДЕН ЗАКРЫТЫЙ ШЛЮЗ GUEST', 'mb-success');
        line('ПЕРЕХВАЧЕН РАДИОСИГНАЛ:', 'mb-dim');
        line('-- .- - .-. .. -..-', 'mb-warning');
        line('ИСТОЧНИК НЕ ОПРЕДЕЛЁН. СИГНАЛ ПОВТОРЯЕТСЯ.', 'mb-dim');
        line('AUTH GUEST <КЛЮЧ>', 'mb-dim');
        return;
      }
      if (lower === 'ls' || lower === 'dir') {
        if (stage < 1) { line('ОТКАЗАНО. ТРЕБУЕТСЯ УРОВЕНЬ GUEST.', 'mb-error'); return; }
        line('DIRECTORY // /GUEST/', 'mb-success');
        line('[FILE] welcome.log');
        line('[FILE] user.key');
        line('[FILE] trace.log');
        if (stage >= 2) line('[FILE] admin.audit');
        if (stage >= 3) line('[FILE] vault.dat');
        return;
      }
      if (lower === 'cat welcome.log') {
        if (stage < 1) { line('ACCESS DENIED // GUEST REQUIRED', 'mb-error'); return; }
        line('WELCOME, GUEST.', 'mb-success');
        line('ПЕРВЫЙ КЛЮЧ БЫЛ ПЕРЕДАН НЕ ГОЛОСОМ, А РАДИОСИГНАЛОМ.', 'mb-dim');
        line('ВСПОМНИ АЗБУКУ, СОСТОЯЩУЮ ИЗ ТОЧЕК И ТИРЕ.', 'mb-warning');
        line('ДАЛЬШЕ ИЗУЧИ USER.KEY И TRACE.LOG.', 'mb-dim');
        return;
      }
      if (lower === 'cat user.key' || lower === 'type user.key') {
        if (stage < 1) { line('ACCESS DENIED // GUEST REQUIRED', 'mb-error'); return; }
        line('USER AUTH TOKEN // DAMAGED RECORD', 'mb-warning');
        line('VIGENERE CIPHER // ENCRYPTED TOKEN', 'mb-warning');
        line('TQHZHFNQGL', 'mb-success');
        line('СООБЩЕНИЕ ЗАШИФРОВАНО. КЛЮЧ НЕ ХРАНИТСЯ В ЭТОМ ФАЙЛЕ.', 'mb-dim');
        line('НАЙДИ ПОДСКАЗКУ В TRACE.LOG.', 'mb-warning');
        return;
      }
      if (lower === 'cat trace.log' || lower === 'type trace.log') {
        if (stage < 1) { line('ACCESS DENIED // GUEST REQUIRED', 'mb-error'); return; }
        line('TRACE // PACKET RECONSTRUCTION', 'mb-success');
        line('ПЕРЕХВАЧЕННЫЙ КОММЕНТАРИЙ ОПЕРАТОРА:', 'mb-success');
        line('«КЛЮЧ — ФАМИЛИЯ АВТОРА РОМАНА NEUROMANCER».', 'mb-warning');
        line('САМ ШИФР НАЗВАН В ЧЕСТЬ ФРАНЦУЗСКОГО ДИПЛОМАТА XVI ВЕКА.', 'mb-dim');
        line('НАЙДИ ФАМИЛИЮ АВТОРА, ЗАТЕМ РАСШИФРУЙ USER.KEY.', 'mb-dim');
        return;
      }
      if (lower === 'cat admin.audit' || lower === 'type admin.audit') {
        if (stage < 2) { line('ACCESS DENIED // USER PRIVILEGES REQUIRED', 'mb-error'); return; }
        adminClueRead = true;
        line('ADMIN AUDIT // FRAGMENT 07', 'mb-success');
        line('AABAB ABBBA BAAAB BAABB BBAAA BAABB BABBA ABBBA', 'mb-warning');
        line('ДАННЫЕ СОСТОЯТ ИЗ ДВУХ СИМВОЛОВ И РАЗБИТЫ НА ГРУППЫ ПО ПЯТЬ.', 'mb-dim');
        line('ИЩИ ШИФР, СВЯЗАННЫЙ С ИМЕНЕМ FRANCIS BACON.', 'mb-dim');
        line('ПОЛУЧЕННЫЙ ТЕКСТ — НЕ ЧИСЛО. ВСПОМНИ «ОТВЕТ НА ГЛАВНЫЙ ВОПРОС ЖИЗНИ, ВСЕЛЕННОЙ И ВСЕГО ОСТАЛЬНОГО».', 'mb-warning');
        return;
      }
      if (lower === 'audit') {
        if (stage < 2) { line('ACCESS DENIED // USER PRIVILEGES REQUIRED', 'mb-error'); return; }
        if (!adminClueRead) { line('СНАЧАЛА ПРОЧИТАЙ ADMIN.AUDIT.', 'mb-warning'); return; }
        line('ADMIN GATE // PATTERN ANALYSIS READY', 'mb-warning');
        line('ПРОТОКОЛ АНАЛИЗА ЗАВЕРШЁН.', 'mb-success');
        line('ПОДСКАЗКА: ДЕКОДИРУЙ ГРУППЫ A/B, А ЗАТЕМ НАЙДИ, КАКОЕ ЧИСЛО НАЗЫВАЮТ ОТВЕТОМ НА ГЛАВНЫЙ ВОПРОС.', 'mb-dim');
        line('ПЕРЕДАЙ ЧИСЛО В EXPLOIT.', 'mb-warning');
        return;
      }
      if (lower.indexOf('auth guest ') === 0) {
        if (stage > 0) { line('GUEST ACCESS ALREADY GRANTED.', 'mb-warning'); return; }
        if (command.slice(11).trim().toUpperCase() === 'MATRIX') {
          stage = 1; setLevel('GUEST');
          line('КЛЮЧ ПРИНЯТ. GUEST ACCESS GRANTED.', 'mb-success');
          line('ДОСТУПЕН КАТАЛОГ /GUEST/. ИСПОЛЬЗУЙ LS.', 'mb-dim');
        } else line('INVALID KEY. GUEST ACCESS DENIED.', 'mb-error');
        return;
      }
      if (lower.indexOf('auth user ') === 0) {
        if (stage < 1) { line('СНАЧАЛА ПОЛУЧИ УРОВЕНЬ GUEST.', 'mb-error'); return; }
        if (stage >= 2) { line('USER ACCESS ALREADY GRANTED.', 'mb-warning'); return; }
        if (command.slice(10).trim().toUpperCase() === 'NIGHTSHIFT') {
          stage = 2; setLevel('USER');
          line('TOKEN VERIFIED. USER ACCESS GRANTED.', 'mb-success');
          line('ОБНАРУЖЕН СКРЫТЫЙ ADMIN GATE. ВЫПОЛНИ AUDIT.', 'mb-dim');
        } else line('INVALID TOKEN. USER ACCESS DENIED.', 'mb-error');
        return;
      }
      if (lower.indexOf('exploit ') === 0) {
        if (stage < 2) { line('ОТКАЗАНО. НУЖНЫ ПРАВА USER.', 'mb-error'); return; }
        if (stage >= 3) { line('ADMIN ACCESS ALREADY GRANTED.', 'mb-warning'); return; }
        if (command.slice(8).trim() === '42') {
          stage = 3; setLevel('ADMIN');
          line('VULNERABILITY EXPLOITED.', 'mb-success');
          line('ADMIN PRIVILEGES GRANTED. SECURITY WALL DISABLED.', 'mb-success');
          line('ЗАЩИЩЁННЫЙ ФАЙЛ VAULT.DAT РАЗБЛОКИРОВАН.', 'mb-dim');
        } else line('EXPLOIT FAILED. ACCESS DENIED.', 'mb-error');
        return;
      }
      if (lower === 'cat vault.dat' || lower === 'type vault.dat') {
        if (stage < 3) { line('ACCESS DENIED // ADMIN PRIVILEGES REQUIRED', 'mb-error'); return; }
        line('DECRYPTING VAULT.DAT ............ OK', 'mb-success');
        blank();
        line('ПРОТОКОЛ ЗАЩИТЫ УСПЕШНО ОБОЙДЕН.', 'mb-success');
        line('ФИНАЛЬНЫЙ КОД ДЛЯ REDFOX:', 'mb-warning');
        line(FINAL_CODE, 'mb-final');
        blank();
        line('ВВЕДИ ЭТОТ КОД В ОСНОВНОЕ ПОЛЕ REDFOX.', 'mb-success');
        return;
      }
      line('КОМАНДА НЕ РАСПОЗНАНА: ' + command, 'mb-error');
      line('ВВЕДИ HELP ДЛЯ СПИСКА КОМАНД.', 'mb-dim');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value;
      input.value = '';
      if (value.trim()) {
        history.push(value);
        historyIndex = history.length;
        execute(value);
      }
      input.focus();
    });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (historyIndex > 0) input.value = history[--historyIndex];
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (historyIndex < history.length - 1) input.value = history[++historyIndex];
        else { historyIndex = history.length; input.value = ''; }
      }
    });
    root.addEventListener('click', function (event) { if (event.target !== input) input.focus(); });

    function updateClock() { clock.textContent = new Date().toLocaleTimeString('ru-RU'); }
    updateClock();
    window.setInterval(updateClock, 1000);
    startRain(root.querySelector('canvas'), screen);

    var boot = [
      ['MATRIX BIOS // SECURITY BREACH SIMULATOR', 'mb-success'],
      ['ПОДКЛЮЧЕНИЕ К ЗАЩИЩЁННОМУ УЗЛУ ........ OK', 'mb-dim'],
      ['ЗАГРУЗКА МОДУЛЕЙ АУТЕНТИФИКАЦИИ ...... OK', 'mb-dim'],
      ['ОБНАРУЖЕНЫ 3 УРОВНЯ ЗАЩИТЫ', 'mb-warning'],
      ['ДОСТУП ЗАКРЫТ. ТРЕБУЕТСЯ АВТОРИЗАЦИЯ.', 'mb-error'],
      ['ВВЕДИ HELP ДЛЯ НАЧАЛА РАБОТЫ.', 'mb-success']
    ];
    var index = 0;
    function typeBoot() {
      if (index >= boot.length) { input.focus(); return; }
      var row = document.createElement('div');
      row.className = 'mb-line ' + boot[index][1];
      output.appendChild(row);
      var text = boot[index++][0];
      var pos = 0;
      (function typeChar() {
        if (pos < text.length) {
          row.textContent += text.charAt(pos++);
          screen.scrollTop = screen.scrollHeight;
          window.setTimeout(typeChar, 9);
        } else window.setTimeout(typeBoot, 130);
      })();
    }
    function resetConsole() {
      stage = 0;
      adminClueRead = false;
      terminalMode = 'SYSTEM';
      flynnState = 'idle';
      promptLabel.textContent = 'SYSTEM:\\>';
      levelLabel.textContent = 'ACCESS: LOCKED';
      history = [];
      historyIndex = 0;
      output.innerHTML = '';
      startBoot();
    }
    function startBoot() {
      index = 0;
      typeBoot();
    }
    startBoot();
  }

  function startRain(canvas, screen) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var w = 0, h = 0, columns = 0, drops = [];
    var glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789';
    function resize() {
      var rect = screen.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = Math.max(1, rect.width); h = Math.max(1, rect.height);
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.ceil(w / 17); drops = [];
      for (var i = 0; i < columns; i++) drops[i] = Math.random() * -h / 17;
    }
    function draw() {
      ctx.fillStyle = 'rgba(0,7,2,.13)'; ctx.fillRect(0, 0, w, h);
      ctx.font = '12px monospace';
      for (var i = 0; i < columns; i++) {
        var y = drops[i] * 17;
        ctx.fillStyle = Math.random() > .98 ? 'rgba(220,255,225,.95)' : 'rgba(55,235,105,.62)';
        ctx.fillText(glyphs.charAt(Math.floor(Math.random() * glyphs.length)), i * 17, y);
        if (y > h && Math.random() > .975) drops[i] = 0;
        drops[i] += .24 + Math.random() * .22;
      }
      window.requestAnimationFrame(draw);
    }
    resize(); window.addEventListener('resize', resize); draw();
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var css = [
      'html,body{background:#010603!important;color:#8affaa!important;}',
      '#'+ROOT_ID+'{position:relative;z-index:2;width:100%;margin:14px 0 92px;color:#8affaa;font-family:Consolas,"Courier New",monospace;}',
      '.mb-shell{display:flex;flex-direction:column;min-height:570px;height:calc(100vh - 245px);max-height:900px;overflow:hidden;border:1px solid #176332;background:rgba(0,9,3,.9);box-shadow:0 0 35px rgba(0,255,90,.12),inset 0 0 35px rgba(0,255,90,.04);}',
      '.mb-topbar,.mb-meta,.mb-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;background:rgba(0,24,8,.9);border-bottom:1px solid #14552a;font-size:10px;letter-spacing:1.5px;}',
      '.mb-brand{font-weight:bold;color:#c0ffd0;text-shadow:0 0 8px rgba(0,255,90,.45);}.mb-online{color:#65c981;font-size:9px;white-space:nowrap;}.mb-online i{display:inline-block;width:7px;height:7px;margin-right:7px;border-radius:50%;background:#42ff78;box-shadow:0 0 9px #42ff78;}',
      '.mb-meta{padding:8px 16px;color:#4f9d65;font-size:9px;border-bottom:1px solid rgba(30,110,55,.4);}',
      '.mb-screen{position:relative;flex:1;min-height:0;overflow:auto;padding:20px;background:rgba(0,7,2,.35);scrollbar-color:#176332 #020904;}',
      '.mb-rain{position:absolute;inset:0;width:100%;height:100%;opacity:.33;pointer-events:none;}.mb-output{position:relative;z-index:1;min-height:100%;font-size:13px;line-height:1.65;text-shadow:0 0 5px rgba(0,255,90,.18);}',
      '.mb-line{min-height:1.5em;white-space:pre-wrap;overflow-wrap:anywhere;color:#a4ffb8;}.mb-echo{margin-top:7px;color:#e0ffe7;}.mb-dim{color:#57966a;}.mb-success{color:#75ff9b;text-shadow:0 0 8px rgba(0,255,90,.35);}.mb-warning{color:#c6e879;}.mb-error{color:#ff6b6b;}.mb-final{margin:8px 0;padding:10px 14px;border:1px solid #4cff82;background:rgba(0,80,25,.35);color:#eaffef;font-size:20px;font-weight:bold;letter-spacing:3px;text-shadow:0 0 12px #39ff72;}',
      '.mb-command{display:flex;align-items:center;gap:8px;padding:13px 16px;border-top:1px solid #176332;background:rgba(0,15,5,.98);}.mb-command label{color:#76ff9b;white-space:nowrap;font-size:13px;}.mb-command input{flex:1;min-width:0;border:0!important;outline:0!important;background:transparent!important;color:#d4ffe0!important;font:14px Consolas,"Courier New",monospace!important;box-shadow:none!important;}.mb-command input::placeholder{color:#39794e;}.mb-cursor{width:8px;height:16px;background:#58ff83;animation:mbblink 1s steps(2,start) infinite;order:3;}@keyframes mbblink{to{visibility:hidden;}}',
      '.mb-footer{border-top:1px solid #14552a;border-bottom:0;color:#57966a;font-size:9px;padding:10px 16px;}',
      '.fixed-top{z-index:60!important;}.fixed-top form.enter{background:rgba(0,10,4,.96)!important;}',
      '@media(min-width:768px){.mb-shell{height:calc(100vh - 260px);min-height:540px;}.mb-screen{padding:24px 28px;}.mb-output{font-size:14px;}}',
      '@media(max-width:767px){#'+ROOT_ID+'{margin:10px 0 100px;}.mb-shell{height:62vh;min-height:430px;max-height:none;}.mb-topbar,.mb-meta,.mb-footer{padding:10px;font-size:8px;letter-spacing:.6px;}.mb-online{font-size:7px;}.mb-screen{padding:14px 12px;}.mb-output{font-size:12px;}.mb-command{padding:12px 10px;gap:6px;}.mb-command label,.mb-command input{font-size:12px!important;}.mb-final{font-size:17px;}}'
    ].join('\n');
    var style = document.createElement('style');
    style.id = STYLE_ID; style.type = 'text/css'; style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();