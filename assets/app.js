// SOVI KZ — light interactions
(function(){
  // mobile nav
  var burger=document.querySelector('.burger'),links=document.querySelector('.nav-links');
  if(burger&&links){burger.addEventListener('click',function(){links.classList.toggle('open');});}

  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // number count-up
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

  // scroll reveal (staggers children within a group) + count-up trigger
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
    // standalone counters not wrapped in .reveal
    document.querySelectorAll('[data-count]').forEach(function(c){if(!c.closest('.reveal'))io.observe(c);});
  }else{els.forEach(function(el){el.classList.add('in');});document.querySelectorAll('[data-count]').forEach(countUp);}

  // subtle illustration parallax
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

  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function(q){
    q.addEventListener('click',function(){
      var item=q.closest('.faq-item'),a=item.querySelector('.faq-a'),open=item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(o){o.classList.remove('open');o.querySelector('.faq-a').style.maxHeight=null;});
      if(!open){item.classList.add('open');a.style.maxHeight=a.scrollHeight+'px';}
    });
  });

  // process accordion
  document.querySelectorAll('.acc-head').forEach(function(h){
    h.addEventListener('click',function(){
      var item=h.closest('.acc-item'),b=item.querySelector('.acc-body'),open=item.classList.contains('open');
      var group=h.closest('.acc');
      group.querySelectorAll('.acc-item.open').forEach(function(o){o.classList.remove('open');o.querySelector('.acc-body').style.maxHeight=null;});
      if(!open){item.classList.add('open');b.style.maxHeight=b.scrollHeight+'px';}
    });
  });
  // open first accordion item by default
  var firstAcc=document.querySelector('.acc-item');
  if(firstAcc){firstAcc.classList.add('open');var fb=firstAcc.querySelector('.acc-body');if(fb)fb.style.maxHeight=fb.scrollHeight+'px';}

  // hero email capture -> route to contact
  document.querySelectorAll('.capture').forEach(function(c){
    c.addEventListener('submit',function(e){e.preventDefault();window.location.href='kontakty.html#form';});
  });

  // contact form (front-end only demo)
  var form=document.getElementById('lead-form');
  if(form){form.addEventListener('submit',function(e){
    e.preventDefault();
    var btn=form.querySelector('button[type=submit]'),ok=document.getElementById('form-ok');
    btn.disabled=true;btn.textContent='Отправляем…';
    setTimeout(function(){if(ok){ok.style.display='flex';}form.reset();btn.disabled=false;btn.textContent='Отправить заявку';},700);
  });}
})();
