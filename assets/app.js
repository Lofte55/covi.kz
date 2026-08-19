// SOVI KZ — interactions
(function(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== mobile nav =====
  var burger=document.querySelector('.burger'),links=document.querySelector('.nav-links');
  if(burger&&links){burger.addEventListener('click',function(){
    links.classList.toggle('open');
    burger.setAttribute('aria-expanded',links.classList.contains('open')?'true':'false');
  });}

  // ===== header services dropdown (click-toggle, works touch+desktop) =====
  document.querySelectorAll('.has-drop').forEach(function(item){
    var trigger=item.querySelector('.drop-trigger');
    if(!trigger)return;
    trigger.addEventListener('click',function(e){
      e.preventDefault();
      var open=item.classList.contains('open');
      document.querySelectorAll('.has-drop.open').forEach(function(o){o.classList.remove('open');});
      if(!open)item.classList.add('open');
    });
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('.has-drop'))document.querySelectorAll('.has-drop.open').forEach(function(o){o.classList.remove('open');});
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape')document.querySelectorAll('.has-drop.open').forEach(function(o){o.classList.remove('open');});
  });

  // ===== number count-up =====
  function countUp(el){
    var raw=el.getAttribute('data-count'),target=parseFloat(raw),
        prefix=el.getAttribute('data-prefix')||'',suffix=el.getAttribute('data-suffix')||'',
        dec=(raw.indexOf('.')>-1)?1:0,dur=1100,start=null;
    if(reduce){el.textContent=prefix+raw+suffix;return;}
    function step(ts){
      if(!start)start=ts;var p=Math.min((ts-start)/dur,1),eased=1-Math.pow(1-p,3);
      var val=(target*eased).toFixed(dec);
      el.textContent=prefix+(dec?val:Math.round(val)).toLocaleString('ru-RU')+suffix;
      if(p<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ===== scroll reveal + count-up trigger =====
  var els=document.querySelectorAll('.reveal, .reveal-group, .img-reveal');
  if('IntersectionObserver'in window){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){
        e.target.classList.add('in');
        e.target.querySelectorAll('[data-count]').forEach(countUp);
        if(e.target.hasAttribute('data-count'))countUp(e.target);
        io.unobserve(e.target);
      }});
    },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el,i){el.style.transitionDelay=(Math.min(i%4,3)*80)+'ms';io.observe(el);});
    document.querySelectorAll('[data-count]').forEach(function(c){if(!c.closest('.reveal'))io.observe(c);});
  }else{els.forEach(function(el){el.classList.add('in');});document.querySelectorAll('[data-count]').forEach(countUp);}

  // ===== subtle illustration parallax =====
  var plx=document.querySelectorAll('[data-parallax]');
  if(plx.length&&!reduce){
    var ticking=false;
    function onScroll(){
      if(ticking)return;ticking=true;
      requestAnimationFrame(function(){
        var vh=window.innerHeight;
        plx.forEach(function(el){
          var r=el.getBoundingClientRect(),c=r.top+r.height/2,off=(c-vh/2)/vh,
              amt=parseFloat(el.getAttribute('data-parallax'))||14;
          el.style.transform='translate3d(0,'+(off*amt).toFixed(1)+'px,0)';
        });
        ticking=false;
      });
    }
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  }

  // ===== infinite draggable testimonial carousel (mobile) =====
  document.querySelectorAll('.tgrid, .mini-tgrid').forEach(function(track){
    var cards = Array.prototype.slice.call(track.children).filter(function(c){return c.classList.contains('tcard');});
    if(cards.length < 2) return;
    cards.forEach(function(c){
      var clone = c.cloneNode(true);
      clone.classList.add('tcard-clone');
      clone.setAttribute('aria-hidden','true');
      track.appendChild(clone);
    });
    var autoTimer=null, resumeTimer=null;
    function mobile(){ return window.innerWidth <= 768; }
    function startAuto(){
      stopAuto();
      if(!mobile() || reduce) return;
      autoTimer = setInterval(function(){
        var half = track.scrollWidth / 2;
        track.scrollLeft += 1;
        if(track.scrollLeft >= half) track.scrollLeft -= half;
      }, 18);
    }
    function stopAuto(){ if(autoTimer){clearInterval(autoTimer);autoTimer=null;} }
    function pauseThenResume(){
      stopAuto();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAuto, 3000);
    }
    track.addEventListener('touchstart', pauseThenResume, {passive:true});
    track.addEventListener('touchmove', function(){clearTimeout(resumeTimer);}, {passive:true});
    track.addEventListener('touchend', pauseThenResume, {passive:true});
    track.addEventListener('mousedown', pauseThenResume);
    window.addEventListener('resize', function(){ mobile() ? startAuto() : stopAuto(); });
    startAuto();
  });

  // ===== gallery lightbox =====
  var lightbox = document.getElementById('lightbox');
  if(lightbox){
    var lbImg = lightbox.querySelector('img'),
        lbCount = lightbox.querySelector('.lightbox-count'),
        galItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item')),
        lbIndex = 0;
    function showLb(i){
      lbIndex = (i + galItems.length) % galItems.length;
      var full = galItems[lbIndex].querySelector('img').getAttribute('data-full');
      lbImg.src = full;
      lbImg.alt = galItems[lbIndex].querySelector('img').alt;
      if(lbCount) lbCount.textContent = (lbIndex+1) + ' / ' + galItems.length;
    }
    galItems.forEach(function(it, i){
      it.addEventListener('click', function(){
        lightbox.classList.add('open');
        document.body.style.overflow='hidden';
        showLb(i);
      });
    });
    var lbClose = lightbox.querySelector('.lightbox-close'),
        lbPrev = lightbox.querySelector('.lightbox-prev'),
        lbNext = lightbox.querySelector('.lightbox-next');
    function closeLb(){ lightbox.classList.remove('open'); document.body.style.overflow=''; }
    if(lbClose) lbClose.addEventListener('click', closeLb);
    if(lbPrev) lbPrev.addEventListener('click', function(){ showLb(lbIndex-1); });
    if(lbNext) lbNext.addEventListener('click', function(){ showLb(lbIndex+1); });
    lightbox.addEventListener('click', function(e){ if(e.target===lightbox) closeLb(); });
    document.addEventListener('keydown', function(e){
      if(!lightbox.classList.contains('open')) return;
      if(e.key==='Escape') closeLb();
      if(e.key==='ArrowLeft') showLb(lbIndex-1);
      if(e.key==='ArrowRight') showLb(lbIndex+1);
    });
  }

  // ===== FAQ accordion =====
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.addEventListener('click',function(){
      var item=q.closest('.faq-item'),a=item.querySelector('.faq-a'),open=item.classList.contains('open');
      var scope=item.closest('.faq-list')||document;
      scope.querySelectorAll('.faq-item.open').forEach(function(o){o.classList.remove('open');o.querySelector('.faq-a').style.maxHeight=null;});
      if(!open){item.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';}
    });
  });

  // ===== process accordion + image swap =====
  document.querySelectorAll('.acc-head').forEach(function(h){
    h.addEventListener('click',function(){
      var item=h.closest('.acc-item'),b=item.querySelector('.acc-body'),open=item.classList.contains('open');
      var group=h.closest('.acc');
      group.querySelectorAll('.acc-item.open').forEach(function(o){o.classList.remove('open');o.querySelector('.acc-body').style.maxHeight=null;});
      if(!open){
        item.classList.add('open');b.style.maxHeight=b.scrollHeight+'px';
        var img=item.getAttribute('data-image'),alt=item.getAttribute('data-image-alt'),
            visual=document.querySelector('.proc-visual img');
        if(img&&visual&&visual.src.indexOf(img)===-1){
          var wrap=visual.closest('.proc-visual');
          wrap.classList.remove('imgfade');void wrap.offsetWidth;wrap.classList.add('imgfade');
          visual.src=img;if(alt)visual.alt=alt;
        }
      }
    });
  });
  var firstAcc=document.querySelector('.acc-item');
  if(firstAcc){firstAcc.classList.add('open');var fb=firstAcc.querySelector('.acc-body');if(fb)fb.style.maxHeight=fb.scrollHeight+'px';}

  // ===== phone mask + validation =====
  function formatPhone(v){
    var d=v.replace(/\D/g,'');
    if(d.charAt(0)==='8')d='7'+d.slice(1);
    if(d.charAt(0)!=='7')d='7'+d;
    d=d.slice(0,11);
    var out='+7';
    if(d.length>1)out+=' '+d.slice(1,4);
    if(d.length>=5)out+=' '+d.slice(4,7);
    if(d.length>=8)out+=' '+d.slice(7,9);
    if(d.length>=10)out+=' '+d.slice(9,11);
    return out;
  }
  function isValidPhone(v){return v.replace(/\D/g,'').length===11;}
  document.querySelectorAll('input[type=tel]').forEach(function(inp){
    inp.addEventListener('focus',function(){if(!inp.value)inp.value='+7 ';});
    inp.addEventListener('input',function(){
      var pos=inp.selectionStart,before=inp.value.length;
      inp.value=formatPhone(inp.value);
      var after=inp.value.length;
      inp.selectionEnd=Math.max(0,pos+(after-before));
      clearFieldError(inp);
    });
    inp.addEventListener('blur',function(){
      if(inp.value.trim()==='+7')inp.value='';
      if(inp.value&&!isValidPhone(inp.value))setFieldError(inp,'Введите номер полностью: +7 XXX XXX XX XX');
    });
  });

  // ===== email validation =====
  function isValidEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
  document.querySelectorAll('input[type=email]').forEach(function(inp){
    inp.addEventListener('input',function(){clearFieldError(inp);});
    inp.addEventListener('blur',function(){
      if(inp.value&&!isValidEmail(inp.value))setFieldError(inp,'Похоже, email указан неверно');
    });
  });

  function setFieldError(el,msg){
    var field=el.closest('.field');if(!field)return;
    field.classList.add('has-error');
    var err=field.querySelector('.field-err');
    if(!err){err=document.createElement('span');err.className='field-err';field.appendChild(err);}
    err.textContent=msg;
  }
  function clearFieldError(el){
    var field=el.closest('.field');if(!field)return;
    field.classList.remove('has-error');
    var err=field.querySelector('.field-err');if(err)err.remove();
  }

  // ===== custom select (csel) =====
  document.querySelectorAll('.csel').forEach(function(wrap){
    var native=wrap.querySelector('select'),
        btn=wrap.querySelector('.csel-btn'),
        label=wrap.querySelector('.csel-label'),
        list=wrap.querySelector('.csel-list');
    if(!native||!btn||!list)return;
    function sync(){
      var opt=native.options[native.selectedIndex];
      label.textContent=opt?opt.textContent:'';
      list.querySelectorAll('.csel-opt').forEach(function(o){o.classList.toggle('active',o.getAttribute('data-value')===native.value);});
    }
    [...native.options].forEach(function(opt){
      var li=document.createElement('button');
      li.type='button';li.className='csel-opt';li.setAttribute('data-value',opt.value);li.textContent=opt.textContent;
      li.addEventListener('click',function(){
        native.value=opt.value;sync();wrap.classList.remove('open');
        native.dispatchEvent(new Event('change'));
      });
      list.appendChild(li);
    });
    sync();
    btn.addEventListener('click',function(e){
      e.preventDefault();
      var open=wrap.classList.contains('open');
      document.querySelectorAll('.csel.open').forEach(function(o){o.classList.remove('open');});
      if(!open)wrap.classList.add('open');
    });
  });
  document.addEventListener('click',function(e){
    if(!e.target.closest('.csel'))document.querySelectorAll('.csel.open').forEach(function(o){o.classList.remove('open');});
  });

  // ===== modal (lead form) =====
  var modal=document.getElementById('lead-modal');
  var lastFocused=null;
  function openModal(){
    if(!modal)return;
    lastFocused=document.activeElement;
    modal.classList.add('open');
    document.body.style.overflow='hidden';
    var f=modal.querySelector('input,select,textarea');if(f)setTimeout(function(){f.focus();},50);
  }
  function closeModal(){
    if(!modal)return;
    modal.classList.remove('open');
    document.body.style.overflow='';
    if(lastFocused)lastFocused.focus();
  }
  document.querySelectorAll('[data-modal-open]').forEach(function(b){
    b.addEventListener('click',function(e){e.preventDefault();openModal();});
  });
  if(modal){
    modal.querySelectorAll('[data-modal-close]').forEach(function(b){b.addEventListener('click',closeModal);});
    modal.addEventListener('click',function(e){if(e.target===modal)closeModal();});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('open'))closeModal();});
  }

  // ===== hero capture -> opens modal (or falls back to contact page) =====
  document.querySelectorAll('.capture').forEach(function(c){
    c.addEventListener('submit',function(e){
      e.preventDefault();
      var telInput=c.querySelector('input[type=tel]');
      if(modal){
        openModal();
        if(telInput&&telInput.value){var mTel=modal.querySelector('input[type=tel]');if(mTel)mTel.value=formatPhone(telInput.value);}
      }else{window.location.href='kontakty.html#form';}
    });
  });

  // ===== lead forms: validation + consent + fake submit =====
  document.querySelectorAll('.lead-form').forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var valid=true;
      var tel=form.querySelector('input[type=tel]');
      if(tel&&!isValidPhone(tel.value||'')){setFieldError(tel,'Укажите номер телефона полностью');valid=false;}
      var email=form.querySelector('input[type=email]');
      if(email&&email.value&&!isValidEmail(email.value)){setFieldError(email,'Похоже, email указан неверно');valid=false;}
      var consent=form.querySelector('input[type=checkbox][data-consent]');
      if(consent&&!consent.checked){
        var cf=consent.closest('.consent-row');
        if(cf)cf.classList.add('has-error');
        valid=false;
      }
      if(!valid)return;
      var btn=form.querySelector('button[type=submit]'),ok=form.querySelector('.form-ok');
      var originalText=btn.textContent;
      btn.disabled=true;btn.textContent='Отправляем…';

      var data={
        name:(form.querySelector('input[name=name]')||{}).value||'',
        phone:(tel||{}).value||'',
        email:(email||{}).value||'',
        service:(form.querySelector('select[name=service]')||{}).value||'',
        message:(form.querySelector('textarea[name=msg]')||{}).value||'',
        _subject:'Новая заявка с сайта СОВИ KZ',
        _template:'table',
        _captcha:'false'
      };

      function finish(){
        if(ok)ok.style.display='flex';
        form.reset();
        form.querySelectorAll('.csel').forEach(function(w){var s=w.querySelector('select');if(s){s.selectedIndex=0;w.querySelector('.csel-label').textContent=s.options[0].textContent;}});
        btn.disabled=false;btn.textContent=originalText;
      }

      fetch('https://formsubmit.co/ajax/sovi-kz@mail.ru',{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(data)
      }).then(function(){finish();}).catch(function(){finish();});
    });
    form.querySelectorAll('input[type=checkbox][data-consent]').forEach(function(c){
      c.addEventListener('change',function(){
        var cf=c.closest('.consent-row');if(cf)cf.classList.remove('has-error');
      });
    });
  });
})();

/* -- accessibility panel -- */
(function(){
  var root=document.documentElement;
  var toggle=document.getElementById('a11yToggle');
  var panel=document.getElementById('a11yPanel');
  var closeBtn=document.getElementById('a11yClose');
  var resetBtn=document.getElementById('a11yReset');
  if(!toggle||!panel)return;

  var KEY='sovi_a11y';
  var state={size:0,contrast:'default',font:false,links:false,cursor:false,motion:false};
  try{var saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved)state=Object.assign(state,saved);}catch(e){}

  var sizeClasses=['a11y-size-1','a11y-size-2','a11y-size-3'];
  var contrastClasses=['a11y-contrast-high','a11y-contrast-bw'];

  function apply(){
    sizeClasses.forEach(function(c){root.classList.remove(c);});
    if(state.size>0)root.classList.add(sizeClasses[state.size-1]);

    contrastClasses.forEach(function(c){root.classList.remove(c);});
    if(state.contrast==='high')root.classList.add('a11y-contrast-high');
    if(state.contrast==='bw')root.classList.add('a11y-contrast-bw');

    root.classList.toggle('a11y-font-readable',!!state.font);
    root.classList.toggle('a11y-links-highlight',!!state.links);
    root.classList.toggle('a11y-cursor-big',!!state.cursor);
    root.classList.toggle('a11y-motion-off',!!state.motion);

    toggle.classList.toggle('active', state.size>0||state.contrast!=='default'||state.font||state.links||state.cursor||state.motion);

    panel.querySelectorAll('[data-size]').forEach(function(b){b.classList.toggle('is-on',Number(b.getAttribute('data-size'))===state.size);});
    panel.querySelectorAll('[data-contrast]').forEach(function(b){b.classList.toggle('is-on',b.getAttribute('data-contrast')===state.contrast);});
    panel.querySelectorAll('[data-toggle]').forEach(function(b){
      var key=b.getAttribute('data-toggle');
      var on=!!state[key];
      b.classList.toggle('is-on',on);
      var s=b.querySelector('.a11y-state');if(s)s.textContent=on?'Вкл':'Выкл';
    });
  }

  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}

  function openPanel(){panel.classList.add('open');panel.removeAttribute('hidden');toggle.setAttribute('aria-expanded','true');}
  function closePanel(){panel.classList.remove('open');toggle.setAttribute('aria-expanded','false');setTimeout(function(){if(!panel.classList.contains('open'))panel.setAttribute('hidden','');},220);}

  toggle.addEventListener('click',function(){
    if(panel.classList.contains('open'))closePanel();else openPanel();
  });
  if(closeBtn)closeBtn.addEventListener('click',closePanel);
  document.addEventListener('click',function(e){
    if(panel.classList.contains('open')&&!panel.contains(e.target)&&e.target!==toggle&&!toggle.contains(e.target))closePanel();
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closePanel();});

  panel.querySelectorAll('[data-size]').forEach(function(b){
    b.addEventListener('click',function(){state.size=Number(b.getAttribute('data-size'));apply();save();});
  });
  panel.querySelectorAll('[data-contrast]').forEach(function(b){
    b.addEventListener('click',function(){state.contrast=b.getAttribute('data-contrast');apply();save();});
  });
  panel.querySelectorAll('[data-toggle]').forEach(function(b){
    b.addEventListener('click',function(){var key=b.getAttribute('data-toggle');state[key]=!state[key];apply();save();});
  });
  if(resetBtn)resetBtn.addEventListener('click',function(){
    state={size:0,contrast:'default',font:false,links:false,cursor:false,motion:false};apply();save();
  });

  apply();
})();
