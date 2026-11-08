(function () {
  'use strict';
  if (window.__REDFOX_MESSENGER_LOADED__) return;
  window.__REDFOX_MESSENGER_LOADED__ = true;

  function start() {
    const config = window.REDFOX_MESSENGER_CONFIG;
    if (!config || !config.id || !Array.isArray(config.contacts) || !config.contacts.length) {
      console.error('[RedFox Messenger] Не найдена REDFOX_MESSENGER_CONFIG.');
      return;
    }
    const VERSION = '1.1.0';
    const storageKey = 'redfox-messenger:' + config.id + ':' + VERSION;
    const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const norm = v => String(v || '').toLowerCase().replace(/ё/g,'е').replace(/[^\p{L}\p{N}\s-]/gu,' ').replace(/\s+/g,' ').trim();
    const pick = v => Array.isArray(v) ? v[Math.floor(Math.random()*v.length)] : v;
    const time = () => new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
    let state;
    try { state = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch (_) { state = null; }
    if (!state || !Array.isArray(state.messages)) state = {messages:[],flags:{},unread:{},activeContact:config.contacts[0].id};
    if (!config.contacts.some(c => c.id === state.activeContact)) state.activeContact = config.contacts[0].id;

    const getContact = id => config.contacts.find(c => c.id === id) || config.contacts[0];
    const save = () => { try { sessionStorage.setItem(storageKey,JSON.stringify(state)); } catch(e) { console.warn('[RedFox Messenger] sessionStorage недоступен',e); } };
    function addMessage(contactId,from,payload) {
      const p = typeof payload === 'string' ? {text:payload} : (payload || {});
      state.messages.push({id:'m'+Date.now()+Math.random().toString(16).slice(2),contactId,from,text:p.text || '',attachment:p.attachment || null,time:time()});
      save();
    }
    function intro(contact) {
      if (state.messages.some(m => m.contactId === contact.id)) return;
      (contact.intro || []).forEach(m => addMessage(contact.id,'them',m));
    }

    const style = document.createElement('style');
    style.id = 'rfm-styles';
    style.textContent = `
#rfm-root{font-family:Arial,Helvetica,sans-serif;position:relative;z-index:2147483000;color:#e9f0f4}
#rfm-launch{position:fixed;right:24px;bottom:24px;z-index:2147483000;border:1px solid #27d8c4;background:#101c22;color:#eafffc;padding:14px 19px;border-radius:8px;font-weight:700;letter-spacing:1px;cursor:pointer;box-shadow:0 8px 30px #0008}
#rfm-launch:hover{background:#16302f;box-shadow:0 0 22px #18d8c455}
#rfm-panel{position:fixed;right:24px;bottom:84px;width:min(760px,calc(100vw - 32px));height:min(590px,calc(100vh - 120px));z-index:2147483001;background:#0b1218;border:1px solid #28404a;border-radius:12px;box-shadow:0 18px 70px #000b;display:none;overflow:hidden}
#rfm-panel.rfm-open{display:flex;flex-direction:column}
#rfm-top{height:58px;flex:0 0 58px;background:#111e25;border-bottom:1px solid #243a43;display:flex;align-items:center;justify-content:space-between;padding:0 17px}
#rfm-brand{font-size:13px;font-weight:800;letter-spacing:2px;color:#48d9c7}
#rfm-subtitle{font-size:10px;color:#7e969e;margin-top:4px;letter-spacing:1px}
#rfm-actions{display:flex;gap:8px}
.rfm-iconbtn{background:transparent;color:#91aab2;border:1px solid #314650;border-radius:6px;padding:7px 10px;cursor:pointer}
.rfm-iconbtn:hover{color:#fff;border-color:#48d9c7}
#rfm-main{display:flex;min-height:0;flex:1}
#rfm-contacts{width:190px;flex:0 0 190px;background:#0e1920;border-right:1px solid #243a43;overflow:auto;padding:10px}
.rfm-contact{width:100%;display:flex;align-items:center;gap:10px;text-align:left;background:transparent;border:1px solid transparent;color:#d9e5e8;padding:11px 9px;border-radius:8px;margin-bottom:5px;cursor:pointer}
.rfm-contact:hover,.rfm-contact.active{background:#172a31;border-color:#28544f}
.rfm-avatar{width:35px;height:35px;border-radius:50%;display:grid;place-items:center;background:#203b42;color:#65e2d2;font-weight:800;flex:0 0 35px}
.rfm-contact-name{font-size:12px;font-weight:700}
.rfm-contact-status{font-size:10px;color:#7d969e;margin-top:4px}
#rfm-chat{flex:1;min-width:0;display:flex;flex-direction:column}
#rfm-chathead{padding:13px 17px;border-bottom:1px solid #1e323a;background:#0e171d}
#rfm-chatname{font-size:14px;font-weight:700}
#rfm-chatdesc{font-size:11px;color:#7f979e;margin-top:4px}
#rfm-messages{flex:1;overflow:auto;padding:17px;display:flex;flex-direction:column;gap:11px;background:radial-gradient(ellipse at 50% 0%,#14232a 0%,#0b1218 65%)}
.rfm-msg{max-width:82%;padding:10px 12px;border-radius:10px;font-size:13px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere}
.rfm-msg.them{align-self:flex-start;background:#17272e;border:1px solid #263f47;color:#e2ecef;border-bottom-left-radius:3px}
.rfm-msg.me{align-self:flex-end;background:#12443f;border:1px solid #1c655a;color:#eafffa;border-bottom-right-radius:3px}
.rfm-time{display:block;text-align:right;font-size:9px;color:#789197;margin-top:5px}
.rfm-attachment{display:block;margin-top:8px;padding:10px;border:1px dashed #52716f;border-radius:7px;color:#9be8db;background:#0c1c20;font-size:11px}
.rfm-attachment strong{display:block;color:#d8fff8;margin-bottom:4px}
#rfm-typing{font-size:11px;color:#7d9b9f;padding:0 18px 8px;min-height:18px}\n#rfm-toast{position:absolute;right:12px;top:68px;z-index:5;background:#153b38;border:1px solid #37bcae;color:#cafff6;padding:10px 14px;border-radius:7px;font-size:11px;opacity:0;transform:translateY(-6px);transition:.2s;pointer-events:none}\n#rfm-toast.show{opacity:1;transform:translateY(0)}
#rfm-suggestions{display:flex;gap:6px;flex-wrap:wrap;padding:8px 14px 0;background:#101b21}
.rfm-suggest{background:#132a30;border:1px solid #31534f;color:#9de8dc;border-radius:20px;padding:6px 10px;font-size:10px;cursor:pointer}
.rfm-suggest:hover{background:#1b3b3d}
#rfm-compose{display:flex;gap:9px;padding:12px 14px 14px;background:#101b21;border-top:1px solid #243a43}
#rfm-input{flex:1;min-width:0;resize:none;height:42px;max-height:100px;background:#091116;border:1px solid #2a424a;border-radius:7px;color:#eaf4f4;padding:11px;font:13px Arial;outline:none}
#rfm-input:focus{border-color:#37cbb9}
#rfm-send{border:0;border-radius:7px;background:#1ba995;color:#041715;font-weight:800;padding:0 17px;cursor:pointer}
#rfm-send:hover{background:#45d9c5}
#rfm-empty{margin:auto;color:#70868d;font-size:12px;text-align:center}
@media(max-width:560px){#rfm-launch{right:12px;bottom:12px;padding:12px 14px}#rfm-panel{right:8px;bottom:66px;width:calc(100vw - 16px);height:calc(100vh - 82px);border-radius:9px}#rfm-contacts{width:76px;flex-basis:76px;padding:7px 4px}.rfm-contact{justify-content:center;padding:8px 3px}.rfm-contact-copy{display:none}.rfm-avatar{width:38px;height:38px;flex-basis:38px}.rfm-msg{max-width:91%}}
`;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.id = 'rfm-root';
    root.innerHTML = '<button id="rfm-launch" type="button">✉ &nbsp; '+esc(config.launchLabel || 'ОТКРЫТЬ МЕССЕНДЖЕР')+'</button>'+
      '<section id="rfm-panel" aria-label="Игровой мессенджер"><header id="rfm-top"><div><div id="rfm-brand">'+esc(config.title || 'SECURE MESSENGER')+'</div><div id="rfm-subtitle">'+esc(config.subtitle || 'ЗАЩИЩЁННЫЙ КАНАЛ СВЯЗИ')+'</div></div><div id="rfm-actions"><button class="rfm-iconbtn" id="rfm-reset" title="Начать диалог заново">↻</button><button class="rfm-iconbtn" id="rfm-close" title="Закрыть">✕</button></div></header>'+
      '<div id="rfm-main"><nav id="rfm-contacts" aria-label="Контакты"></nav><section id="rfm-chat"><div id="rfm-chathead"><div id="rfm-chatname"></div><div id="rfm-chatdesc"></div></div><div id="rfm-messages"></div><div id="rfm-typing"></div><form id="rfm-compose"><textarea id="rfm-input" maxlength="600" placeholder="Напишите сообщение..." aria-label="Сообщение"></textarea><button id="rfm-send" type="submit">➤</button></form></section></div></section>';
    document.body.appendChild(root);

    const $ = selector => root.querySelector(selector);
    const panel = $('#rfm-panel'), messageBox = $('#rfm-messages'), input = $('#rfm-input');
    let typingTimer = null;

    function isUnlocked(c) { return !c.unlockFlag || !!state.flags[c.unlockFlag]; }
    function renderContacts() {
      const visible = config.contacts.filter(isUnlocked);
      $('#rfm-contacts').innerHTML = visible.map(c =>
        '<button type="button" class="rfm-contact '+(c.id===state.activeContact?'active':'')+'" data-contact="'+esc(c.id)+'"><span class="rfm-avatar">'+esc(c.avatar || c.name.slice(0,1))+'</span><span class="rfm-contact-copy"><span class="rfm-contact-name">'+esc(c.name)+(state.unread[c.id]?' <b style="color:#56e5cf">●</b>':'')+'</span><span class="rfm-contact-status">'+esc(c.status || 'в сети')+'</span></span></button>'
      ).join('');
      $('#rfm-contacts').querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click',() => {
        state.activeContact = button.getAttribute('data-contact'); state.unread[state.activeContact]=false; intro(getContact(state.activeContact)); save(); render();
      }));
    }
    function renderMessages() {
      const items = state.messages.filter(m => m.contactId === state.activeContact);
      if (!items.length) { messageBox.innerHTML = '<div id="rfm-empty">Канал готов к работе.<br>Отправьте первое сообщение.</div>'; return; }
      messageBox.innerHTML = items.map(m => {
        const attachment = m.attachment ? '<span class="rfm-attachment"><strong>▣ '+esc(m.attachment.name || 'Вложение')+'</strong>'+esc(m.attachment.description || 'Файл получен')+'</span>' : '';
        return '<div class="rfm-msg '+(m.from==='me'?'me':'them')+'">'+esc(m.text).replace(/\n/g,'<br>')+attachment+'<span class="rfm-time">'+esc(m.time)+'</span></div>';
      }).join('');
      messageBox.scrollTop = messageBox.scrollHeight;
    }
    function render() {
      const c = getContact(state.activeContact);
      renderContacts(); $('#rfm-chatname').textContent=c.name; $('#rfm-chatdesc').textContent=c.description || c.status || '';
      renderMessages();
    }
    function score(text,intent) {
      const n = norm(text), aliases = (intent.aliases || []).map(norm).filter(Boolean);
      for (const a of aliases) {
        if (n===a) return 100+a.length;
        if (a.length>3 && (' '+n+' ').includes(' '+a+' ')) return 80+a.length;
      }
      const m=intent.match || {}, forbidden=(m.none || []).map(norm);
      if (forbidden.some(w => w && n.includes(w))) return 0;
      const required=(m.all || []).map(norm);
      if (required.some(w => w && !n.includes(w))) return 0;
      const any=(m.any || []).map(norm), hits=any.filter(w => w && n.includes(w)).length;
      if (hits < Number(m.min || 1)) return 0;
      return 10+hits*8+required.length*5;
    }
    function findIntent(contact,text) {
      const candidates=(contact.intents || []).map((intent,index) => {
        if (intent.requires && !intent.requires.every(f => !!state.flags[f])) return {score:0,index};
        if (intent.excludes && intent.excludes.some(f => !!state.flags[f])) return {score:0,index};
        return {score:score(text,intent),index};
      }).filter(x => x.score>0).sort((a,b)=>b.score-a.score || a.index-b.index);
      return candidates.length ? contact.intents[candidates[0].index] : null;
    }
    function scheduleEvents() {
      (config.events || []).forEach(ev => {
        if (!ev.id || !ev.whenFlag || !state.flags[ev.whenFlag] || state.flags['__event_'+ev.id]) return;
        state.flags['__event_'+ev.id] = true;
        if (ev.unlockFlag) state.flags[ev.unlockFlag] = true;
        save(); renderContacts();
        const delay = Array.isArray(ev.delay) ? ev.delay[0] + Math.random()*(ev.delay[1]-ev.delay[0]) : Number(ev.delay || 5000);
        setTimeout(() => {
          const c = getContact(ev.contactId);
          if (!c || !isUnlocked(c)) return;
          (ev.messages || []).forEach((m,i) => setTimeout(() => {
            addMessage(c.id,'them',m);
            if (state.activeContact !== c.id) state.unread[c.id] = true;
            else renderMessages();
            renderContacts(); save();
            if (state.activeContact !== c.id) showToast(c.name+' — новое сообщение');
          }, i * Number(ev.messageGap || 1400)));
        }, delay);
      });
    }
    function showToast(message) {
      let toast = $('#rfm-toast');
      if (!toast) { toast=document.createElement('div'); toast.id='rfm-toast'; root.appendChild(toast); }
      toast.textContent=message; toast.classList.add('show');
      setTimeout(()=>toast.classList.remove('show'),3600);
    }
    function answer(contact,text) {
      const intent=findIntent(contact,text);
      if (!intent) {
        addMessage(contact.id,'them',pick(contact.fallback || config.fallback || ['Не понял сообщение. Попробуй иначе.']));
        save(); renderMessages(); return;
      }
      if (intent.set) Object.keys(intent.set).forEach(k => { state.flags[k]=intent.set[k]; });
      addMessage(contact.id,'them',pick(intent.responses || intent.response || '...'));
      save(); renderMessages(); scheduleEvents();
    }
    function sendMessage() {
      const text=input.value.trim(); if (!text) return;
      const contact=getContact(state.activeContact); addMessage(contact.id,'me',text); input.value=''; renderMessages();
      $('#rfm-typing').textContent=(contact.name || 'Собеседник')+' печатает…';
      if (typingTimer) clearTimeout(typingTimer);
      const delayCfg = config.replyDelay || [1400,3200];
      const delay = Array.isArray(delayCfg) ? delayCfg[0] + Math.random()*(delayCfg[1]-delayCfg[0]) : Number(delayCfg);
      typingTimer=setTimeout(() => { $('#rfm-typing').textContent=''; answer(contact,text); },delay);
    }
    $('#rfm-compose').addEventListener('submit',e=>{e.preventDefault();sendMessage();});
    input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});
    $('#rfm-launch').addEventListener('click',()=>{panel.classList.add('rfm-open');intro(getContact(state.activeContact));save();render();input.focus();});
    $('#rfm-close').addEventListener('click',()=>panel.classList.remove('rfm-open'));
    $('#rfm-reset').addEventListener('click',()=>{
      if(!window.confirm('Сбросить переписку в этой вкладке и начать заново?')) return;
      state={messages:[],flags:{},unread:{},activeContact:config.contacts[0].id};
      try{sessionStorage.removeItem(storageKey);}catch(_){}
      intro(getContact(state.activeContact));save();render();
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape')panel.classList.remove('rfm-open');});
    intro(getContact(state.activeContact)); save(); render();
    if(config.autoOpen) panel.classList.add('rfm-open');
    console.info('[RedFox Messenger] '+VERSION+' / '+config.id);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();