const $=s=>document.querySelector(s),rand=n=>Math.floor(Math.random()*n);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const sym=c=>({S:'⊘',R:'⇄',D:'+2',W:'W',F:'+4'})[c[1]]||c[1];
const G=[['uno','01','UNO','2–10 pemain'],['f100','02','Family 100','Tebak jawaban survei'],['tod','03','Truth or Dare','Jujur atau berani?']];
const GI={uno:['UNO','Ruang khusus UNO. Buat room UNO baru atau masukkan kode room UNO dari temanmu. Main 2 sampai 10 pemain.'],f100:['Family 100','Ruang khusus Family 100. Tebak jawaban survei bareng teman dan kumpulkan skor terbanyak.'],tod:['Truth or Dare','Ruang khusus Truth or Dare. Jawab pertanyaan dengan jujur atau selesaikan tantangan, lalu kirim buktinya ke WhatsApp.']};
const Q=[["Sebutkan makanan sarapan di Indonesia",[["Nasi goreng",35],["Bubur ayam",25],["Roti",15],["Lontong sayur",10],["Nasi uduk",8],["Mie instan",7]]],
["Sebutkan hewan peliharaan yang umum",[["Kucing",40],["Anjing",25],["Ikan",15],["Burung",12],["Kelinci",8]]],
["Sebutkan benda yang selalu dibawa saat keluar rumah",[["HP",40],["Dompet",30],["Kunci",15],["Tas",8],["Masker",7]]],
["Sebutkan alasan orang terlambat ke kantor",[["Macet",45],["Bangun kesiangan",30],["Hujan",10],["Ban bocor",8],["Motor mogok",7]]],
["Sebutkan minuman yang sering dipesan di warung kopi",[["Kopi hitam",35],["Teh manis",25],["Es teh",15],["Susu",12],["Jahe",8]]],
["Sebutkan tempat liburan favorit orang Indonesia",[["Bali",40],["Yogyakarta",20],["Lombok",15],["Bandung",15],["Raja Ampat",10]]],
["Sebutkan aplikasi yang ada di hampir semua HP",[["WhatsApp",40],["Instagram",20],["TikTok",15],["YouTube",15],["Gojek",10]]],
["Sebutkan hal yang dilakukan saat bosan",[["Tidur",30],["Main HP",30],["Makan",20],["Nonton",12],["Jalan-jalan",8]]]];
const TR=["Apa hal paling memalukan yang pernah kamu alami?","Siapa orang yang diam-diam kamu kagumi?","Apa kebohongan terbesar yang pernah kamu katakan?","Apa kebiasaan anehmu yang jarang orang tahu?","Apa hal yang paling kamu sesali tahun ini?","Siapa di room ini yang paling sering bikin kamu kesal?","Apa ketakutan terbesarmu?","Lagu apa yang malu kamu akui kamu suka?","Kapan terakhir kali kamu menangis dan kenapa?","Pernah ngestalk mantan? Ceritakan!"];
const DR=["Kirim voice note nyanyi 10 detik ke room ini","Tirukan suara hewan pilihan teman-temanmu","Joget 15 detik tanpa musik","Bicara dengan aksen daerah selama 3 giliran","Ceritakan jokes receh sampai ada yang ketawa","Peragakan gaya jalan model catwalk","Ucapkan alfabet mundur dari Z secepat mungkin","Puji semua pemain satu per satu dengan serius","Selfie dengan wajah paling lucu lalu tunjukkan ke kamera","Bicara tanpa henti selama 20 detik tentang makanan favoritmu"];
let rt=null,rm=null,ME=null,name='',code='',S=null,isHost=false,pend=null,tab='glob',H={deck:[],disc:[],Q:[]};
const chats={room:[],glob:[]},unread={room:0,glob:0};let waNum='',gsel=null,gkey=null;
function toast(t){const e=$('#toast');e.textContent=t;e.className='s';clearTimeout(toast.t);toast.t=setTimeout(()=>e.className='',2500)}
(async()=>{try{rt=await window.claude?.use('room')}catch(e){}
 if(rt)rt.on('gchat',m=>addChat('glob',m));render()})();
async function enter(c,host,g){
 if(!rt)return toast('Mode online belum tersambung. Buka lewat claude.ai dan login.');
 try{rm=await rt.join(g+'-'+c.toLowerCase())}catch(e){return toast('Gagal masuk room, coba lagi')}
 code=c;isHost=host;gkey=g;ME=null;chats.room=[];tab='room';
 S=host?{game:'lobby',host:null,players:[]}:null;
 rm.on('chat',m=>addChat('room',m));rm.on('g',onG);
 rm.emit('g',{t:'hi',n:name});render()}
function onG(m){const d=m.data||{};
 if(m.sameTab&&!ME){ME=m.peer;if(isHost)S.host=ME}
 if(d.t==='s'){if(!isHost)S=d.s;render();return}
 if(isHost&&S)hostAct(m.peer,d)}
const bc=()=>rm.emit('g',{t:'s',s:S});
function hostAct(id,d){S.msg='';const P=S.players;
 if(d.t==='hi'){if(!P.find(p=>p.id===id))P.push({id,n:String(d.n||'Pemain').slice(0,14)})}
 else if(d.t==='go'&&id===S.host)start(gkey);
 else if(d.t==='lobby'&&id===S.host)S={game:'lobby',host:S.host,players:P};
 else if(S.game==='uno')unoAct(id,d);else if(S.game==='f100')fAct(id,d);else if(S.game==='tod')tAct(id,d);
 S.gk=gkey;bc()}
function start(g){const P=S.players;
 if(g==='uno'){if(P.length<2){S.msg='UNO butuh minimal 2 pemain. Tunggu temanmu masuk dulu.';return}
  let d=[];'rygb'.split('').forEach(c=>{for(let v=0;v<=9;v++){d.push(c+v);if(v)d.push(c+v)}['S','R','D'].forEach(x=>d.push(c+x,c+x))});
  for(let i=0;i<4;i++)d.push('kW','kF');shuf(d);
  const hands={};P.forEach(p=>hands[p.id]=d.splice(0,7));
  const t=d.splice(d.findIndex(c=>c[0]!=='k'),1)[0];H.deck=d;H.disc=[];
  S={game:'uno',host:S.host,players:P,u:{hands,top:t,col:t[0],turn:0,dir:1,drew:false,win:null,log:'Game dimulai!'}}}
 else if(g==='f100'){H.Q=shuf(Q.slice());S={game:'f100',host:S.host,players:P,f:{i:-1,sc:{},rev:[],q:'',log:''}};nextQ()}
 else if(g==='tod')S={game:'tod',host:S.host,players:P,t:{turn:0,k:null,x:''}}}
/* UNO */
const nxt=(u,k=1)=>{const n=S.players.length;return((u.turn+u.dir*k)%n+n)%n};
function draw(id,k){const h=S.u.hands[id];for(let i=0;i<k;i++){if(!H.deck.length){H.deck=shuf(H.disc);H.disc=[]}if(H.deck.length)h.push(H.deck.pop())}}
function unoAct(id,d){const u=S.u,cur=S.players[u.turn];if(u.win||!cur||cur.id!==id)return;const h=u.hands[id];
 if(d.t==='draw'&&!u.drew){draw(id,1);u.drew=true;u.log=cur.n+' mengambil kartu'}
 else if(d.t==='pass'&&u.drew){u.drew=false;u.turn=nxt(u);u.log=cur.n+' melewati giliran'}
 else if(d.t==='play'){const c=h[d.i];if(!c||!(c[0]==='k'||c[0]===u.col||c[1]===u.top[1])||(u.drew&&d.i!==h.length-1))return;
  h.splice(d.i,1);H.disc.push(u.top);u.top=c;u.col=c[0]==='k'?('rygb'.includes(d.c)?d.c:'r'):c[0];u.drew=false;u.log=cur.n+' memainkan '+sym(c);
  if(!h.length){u.win=cur.n;return}
  const v=c[1];
  if(v==='R'){if(S.players.length===2)u.turn=nxt(u,2);else{u.dir*=-1;u.turn=nxt(u)}}
  else if(v==='S')u.turn=nxt(u,2);
  else if(v==='D'||v==='F'){const t=nxt(u),n=v==='D'?2:4;draw(S.players[t].id,n);u.log+=' → '+S.players[t].n+' ambil '+n;u.turn=nxt(u,2)}
  else u.turn=nxt(u)}}
function canPlay(i){const u=S.u,my=u.hands[ME]||[],c=my[i],cur=S.players[u.turn];
 return !!c&&!!cur&&cur.id===ME&&!u.win&&(c[0]==='k'||c[0]===u.col||c[1]===u.top[1])&&(!u.drew||i===my.length-1)}
/* Family 100 */
const norm=s=>String(s).toLowerCase().replace(/[^a-z0-9 ]/g,'').trim();
function nextQ(){const f=S.f;f.i=(f.i+1)%H.Q.length;f.q=H.Q[f.i][0];f.rev=H.Q[f.i][1].map(()=>null);f.log='Soal baru, ayo tebak!'}
function fAct(id,d){const f=S.f,A=H.Q[f.i][1],p=S.players.find(x=>x.id===id);if(!p)return;
 if(d.t==='gs'){const g=norm(d.g||'');if(g.length<2)return;
  const k=A.findIndex((x,j)=>{const a=norm(x[0]);return !f.rev[j]&&(a===g||(g.length>2&&a.includes(g))||(a.length>2&&g.includes(a)))});
  if(k<0)f.log=p.n+': '+String(d.g).slice(0,30)+' (salah)';
  else{f.rev[k]=A[k];f.sc[id]=(f.sc[id]||0)+A[k][1];f.log=p.n+' benar! '+A[k][0]+' +'+A[k][1]}}
 else if(id===S.host&&d.t==='all')f.rev=A.slice();
 else if(id===S.host&&d.t==='nq')nextQ()}
/* Truth or Dare */
function tAct(id,d){const t=S.t,cur=S.players[t.turn];if(!cur)return;
 if(d.t==='pick'&&cur.id===id&&!t.k){t.k=d.k==='d'?'d':'t';t.x=(t.k==='t'?TR:DR)[rand(10)];t.a='';t.done=false}
 else if(d.t==='ans'&&cur.id===id&&t.k==='t'&&!t.a)t.a=String(d.a||'').trim().slice(0,300);
 else if(d.t==='done'&&cur.id===id&&t.k==='d')t.done=true
 else if(d.t==='next'&&(id===cur.id||id===S.host)){t.turn=(t.turn+1)%S.players.length;t.k=null;t.x='';t.a='';t.done=false}}
/* Chat */
function addChat(k,m){const d=m.data||{};if(!d.m)return;
 chats[k].push({n:String(d.n||'Anon').slice(0,14),m:String(d.m).slice(0,300),me:m.isMe});if(chats[k].length>100)chats[k].shift();
 if(tab!==k)unread[k]++;renderChat()}
function send(){const i=$('#ci'),v=i.value.trim();if(!v)return;
 const tg=tab==='room'?rm:rt;if(!tg)return toast(tab==='room'?'Gabung room dulu':'Chat belum tersambung');
 i.value='';tg.emit(tab==='room'?'chat':'gchat',{n:name||'Anon',m:v}).catch(()=>toast('Pesan gagal terkirim'))}
function renderChat(){
 document.querySelectorAll('.tabs button').forEach(b=>{const k=b.dataset.t;b.className=k===tab?'on':'';const i=b.querySelector('i');i.hidden=!unread[k];i.textContent=unread[k]});
 const cl=$('#cl');unread[tab]=0;
 cl.innerHTML=(tab==='room'&&!rm)?'<p class="mu">Gabung atau buat room dulu untuk chat bersama temanmu.</p>':
  (chats[tab].map(c=>`<div class="msg ${c.me?'me':''}"><b>${esc(c.n)}</b>${esc(c.m)}</div>`).join('')||'<p class="mu">Belum ada pesan. Sapa dulu yuk!</p>');
 cl.scrollTop=cl.scrollHeight}
/* Views */
const dash=()=>`<div class="box"><button class="btn sec sm" data-a="back">Semua game</button><h2 style="margin-top:10px">${GI[gsel][0]}</h2><p class="mu">${GI[gsel][1]}</p>
${rt?'':'<p class="warn">Mode online belum tersambung. Buka halaman ini lewat claude.ai dan pastikan sudah login.</p>'}
<label>Nama kamu</label><div class="row"><input id="nm" maxlength="14" value="${esc(name)}" placeholder="Contoh: Budi"></div>
<div class="row"><button class="btn" data-a="create">Buat Room Baru</button></div>
<div class="or">atau gabung dengan kode room</div>
<div class="row"><input id="cd" maxlength="5" placeholder="KODE" style="text-transform:uppercase;letter-spacing:5px;text-align:center"><button class="btn" data-a="join">Gabung</button></div></div>`;
const menu=()=>`<div class="box"><h2>Pilih game</h2><p class="mu">Setiap game punya ruang sendiri dengan kode room sendiri, jadi tidak tercampur.</p>${rt?'':'<p class="warn">Mode online belum tersambung. Buka halaman ini lewat claude.ai dan pastikan sudah login.</p>'}</div><div class="tiles">${G.map(g=>`<button class="tile gt-${g[0]}" data-a="sel" data-g="${g[0]}"><span>${g[1]}</span><b>${g[2]}</b><small>${g[3]}</small></button>`).join('')}</div>`;
const lobby=h=>`<div class="box"><h3>Ruang tunggu ${GI[gkey][0]}</h3>${S.msg?`<p class="warn">${esc(S.msg)}</p>`:''}<p class="mu">Bagikan kode room ke temanmu. Pemain di room: ${S.players.length}</p>${h?`<div class="row"><button class="btn" data-a="go" data-g="${gkey}">Mulai ${GI[gkey][0]}</button></div>`:'<p class="mu">Menunggu host memulai game...</p>'}</div>`;
function uno(h){const u=S.u,P=S.players,cur=P[u.turn],my=u.hands[ME]||[],mine=cur.id===ME;
 return `<div class="box"><div class="opps">${P.map((p,i)=>`<div class="opp ${i===u.turn?'t':''}"><b>${esc(p.n)}</b><span>${(u.hands[p.id]||[]).length} kartu</span></div>`).join('')}</div>
<div class="table"><button class="pile" data-a="draw" ${mine&&!u.drew&&!u.win?'':'disabled'}>Ambil</button><div class="uc c-${u.top[0]}">${sym(u.top)}</div><div class="colr c-${u.col}" title="Warna aktif"></div></div>
<p class="log">${esc(u.log)} (${u.dir>0?'searah':'berlawanan arah'})</p>
${u.win?`<div class="win">${esc(u.win)} menang!</div>${h?'<div class="row" style="justify-content:center"><button class="btn" data-a="go" data-g="uno">Main lagi</button></div>':''}`:`<p class="turn">${mine?'Giliran kamu!':'Giliran '+esc(cur.n)}</p>`}
${mine&&u.drew&&!u.win?'<div class="row" style="justify-content:center"><button class="btn sec" data-a="pass">Lewati giliran</button></div>':''}
<div class="hand">${my.map((c,i)=>`<button class="uc c-${c[0]} ${canPlay(i)?'ok':'no'}" data-a="play" data-i="${i}">${sym(c)}</button>`).join('')}</div>
${pend!==null?`<div class="picker">Pilih warna: ${'rygb'.split('').map(c=>`<button class="uc c-${c}" data-a="col" data-c="${c}"></button>`).join('')}</div>`:''}
${h?'<div class="row"><button class="btn sec sm" data-a="lobby">Kembali ke lobi</button></div>':''}</div>`}
const f100=h=>{const f=S.f;return `<div class="box"><h3>Family 100</h3><div class="q">${esc(f.q)}</div>
<div class="ans">${f.rev.map((r,i)=>`<div class="an ${r?'on':''}"><span>${i+1}</span><b>${r?esc(r[0]):'. . . . .'}</b><em>${r?r[1]:''}</em></div>`).join('')}</div>
<div class="row"><input id="gi" placeholder="Ketik tebakanmu..." autocomplete="off"><button class="btn" data-a="gs">Tebak</button></div>
<p class="log">${esc(f.log)}</p><div class="chips">${S.players.map(p=>`<span class="chip">${esc(p.n)}: <b>${f.sc[p.id]||0}</b></span>`).join('')}</div>
${h?'<div class="row"><button class="btn sec" data-a="all">Buka semua</button><button class="btn" data-a="nq">Soal berikutnya</button><button class="btn sec" data-a="lobby">Lobi</button></div>':''}</div>`};
const waLink=(n,x)=>{let d=waNum.replace(/\D/g,'');if(d.startsWith('0'))d='62'+d.slice(1);return 'https://wa.me/'+d+'?text='+encodeURIComponent('Bukti dare dari '+n+'. Tantangan: '+x+' Sudah saya kerjakan!')};
const waBox=(n,x)=>`<div class="ansbox"><small>KIRIM BUKTI</small><p>Kirim bukti ke WhatsApp temanmu. Foto atau video bukti bisa kamu lampirkan langsung di WhatsApp. Nomor boleh dikosongkan, nanti pilih kontak di WhatsApp.</p><div class="row"><input id="wa" inputmode="tel" placeholder="Nomor WA tujuan, contoh 08123456789" value="${esc(waNum)}"><a class="btn" id="wal" target="_blank" rel="noopener" href="${waLink(n,x)}">Kirim via WhatsApp</a></div></div>`;
const tod=h=>{const t=S.t,cur=S.players[t.turn],mine=cur.id===ME;return `<div class="box center"><h3>Truth or Dare</h3><div class="spot">Giliran <b>${esc(cur.n)}</b></div>
${t.k?`<div class="tcard ${t.k}"><small>${t.k==='t'?'TRUTH':'DARE'}</small><p>${esc(t.x)}</p></div>`:''}
${!t.k&&mine?'<div class="row"><button class="btn" data-a="pick" data-k="t">Truth</button><button class="btn" data-a="pick" data-k="d">Dare</button></div>':''}
${!t.k&&!mine?`<p class="mu">Menunggu ${esc(cur.n)} memilih...</p>`:''}
${t.k==='t'?(t.a?`<div class="ansbox"><small>JAWABAN ${esc(cur.n).toUpperCase()}</small><p>${esc(t.a)}</p></div>`:(mine?'<div class="row"><input id="ta" maxlength="300" placeholder="Tulis jawabanmu dengan jujur..." autocomplete="off"><button class="btn" data-a="ans">Kirim Jawaban</button></div>':`<p class="mu">Menunggu jawaban ${esc(cur.n)}...</p>`)):''}
${t.k==='d'?(t.done?`<div class="ansbox"><small>BUKTI</small><p>Tantangan sudah dikerjakan oleh ${esc(cur.n)}.</p></div>`:(mine?'<div class="row"><button class="btn" data-a="done">Tandai Tantangan Selesai</button></div>':`<p class="mu">Menunggu ${esc(cur.n)} menyelesaikan tantangan...</p>`)):''}
${t.k==='d'&&t.done&&mine?waBox(cur.n,t.x):''}
${t.k&&(mine||h)?'<div class="row"><button class="btn sec" data-a="next">Lanjut ke pemain berikutnya</button></div>':''}
${h?'<div class="row"><button class="btn sec sm" data-a="lobby">Kembali ke lobi</button></div>':''}</div>`};
function roomView(){
 if(!S)return `<div class="box"><h2>Room ${esc(code)}</h2><p class="mu">Menunggu host... Pastikan kode room benar dan host sedang membuka halaman ini.</p><button class="btn sec" data-a="leave">Keluar</button></div>`;
 const h=S.host===ME;
 return `<div class="box head"><div><div class="mu">${GI[gkey][0].toUpperCase()} · KODE ROOM (ketuk untuk salin)</div><div class="code" data-a="copy">${esc(code)}</div></div><div class="chips">${S.players.map(p=>`<span class="chip ${p.id===S.host?'h':''}">${p.id===S.host?'Host · ':''}${esc(p.n)}${p.id===ME?' (kamu)':''}</span>`).join('')}</div><button class="btn sec sm" data-a="leave">Keluar</button></div>`+
 (S.game==='lobby'?lobby(h):S.game==='uno'?uno(h):S.game==='f100'?f100(h):tod(h))}
function render(){
 const a=document.activeElement,ai=a&&a.id,av=a&&a.value;
 const cg=rm?gkey:gsel;$('.app').dataset.g=cg||'';$('.logo').textContent='Main Bareng'+(cg?' · '+GI[cg][0]:'');
 $('#main').innerHTML=rm?roomView():(gsel?dash():menu());
 if(ai&&ai!=='ci'){const e=document.getElementById(ai);if(e&&e.tagName==='INPUT'){e.value=av;e.focus()}}
 renderChat()}
/* Events */
const em=o=>rm&&rm.emit('g',o).catch(()=>{});
$('#main').onclick=e=>{const b=e.target.closest('[data-a]');if(!b||b.disabled)return;const a=b.dataset.a,d=b.dataset;
 if(a==='create'||a==='join'){name=($('#nm').value.trim()||'Pemain'+(10+rand(90))).slice(0,14);
  if(a==='create'){const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';enter(Array.from({length:5},()=>A[rand(A.length)]).join(''),true,gsel)}
  else{const c=$('#cd').value.trim().toUpperCase();if(!/^[A-Z0-9]{3,5}$/.test(c))return toast('Masukkan kode room yang benar');enter(c,false,gsel)}}
 else if(a==='sel'){gsel=d.g;render()}
 else if(a==='back'){gsel=null;render()}
 else if(a==='leave'){rm.leave();rm=null;S=null;tab='glob';render()}
 else if(a==='copy'){try{navigator.clipboard.writeText(code).then(()=>toast('Kode disalin: '+code),()=>toast('Kode: '+code))}catch(x){toast('Kode: '+code)}}
 else if(a==='go')em({t:'go',g:d.g});
 else if(a==='lobby')em({t:'lobby'});
 else if(a==='draw'||a==='pass')em({t:a});
 else if(a==='play'){const i=+d.i;if(!canPlay(i))return;if(S.u.hands[ME][i][0]==='k'){pend=i;render()}else em({t:'play',i})}
 else if(a==='col'){em({t:'play',i:pend,c:d.c});pend=null}
 else if(a==='gs'){const i=$('#gi');if(i.value.trim()){em({t:'gs',g:i.value.trim()});i.value=''}}
 else if(a==='all'||a==='nq')em({t:a});
 else if(a==='pick')em({t:'pick',k:d.k});
 else if(a==='ans'){const i=$('#ta');if(i&&i.value.trim())em({t:'ans',a:i.value.trim()})}
 else if(a==='done')em({t:'done'});
 else if(a==='next')em({t:'next'})};
document.addEventListener('input',e=>{if(e.target.id==='nm')name=e.target.value;if(e.target.id==='wa'){waNum=e.target.value;const a=$('#wal');if(a&&S&&S.t)a.href=waLink(S.players[S.t.turn].n,S.t.x)}});
document.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const id=e.target.id;
 if(id==='ci')send();else if(id==='gi')$('[data-a=gs]').click();else if(id==='cd')$('[data-a=join]').click();else if(id==='nm')$('[data-a=create]').click();else if(id==='ta')$('[data-a=ans]').click()});
$('#cs').onclick=send;
document.querySelector('.tabs').onclick=e=>{const b=e.target.closest('button');if(b){tab=b.dataset.t;renderChat()}};
render();
