"use strict";
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const CANVAS_W = 560;
const uid = () => Math.random().toString(36).slice(2, 9);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const escHtml = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escAttr = s => escHtml(s).replace(/"/g,'&quot;');

/* ---------------- palettes ---------------- */
/* 글꼴 목록 — 본문 선택과 똑같은 항목을 화자·블록 선택에도 쓴다 */
const FONT_GROUPS = [
  ['고딕', [["'Pretendard',sans-serif", '프리텐다드'], ["'Noto Sans KR',sans-serif", '본고딕'],
            ["'IBM Plex Sans KR',sans-serif", 'IBM 플렉스'], ["'Gowun Dodum',sans-serif", '고운돋움']]],
  ['명조 · 바탕', [["'Noto Serif KR',serif", '본명조'], ["'Gowun Batang',serif", '고운바탕'], ["'Hahmlet',serif", '함렛']]],
  ['한글 · 제목용', [["'Black Han Sans',sans-serif", '검은고딕'], ["'Gasoek One',sans-serif", '가석'],
                  ["'Song Myung',serif", '송명']]],
  ['영문', [["'Playfair Display','Noto Serif KR',serif", 'Playfair Display'],
           ["'Cormorant Garamond','Noto Serif KR',serif", 'Cormorant Garamond'],
           ["'Cinzel','Noto Serif KR',serif", 'Cinzel'],
           ["'Bebas Neue','Black Han Sans',sans-serif", 'Bebas Neue'],
           ["'Anton','Black Han Sans',sans-serif", 'Anton'],
           ["'Great Vibes',cursive", 'Great Vibes'], ["'Dancing Script',cursive", 'Dancing Script'],
           ["'Parisienne',cursive", 'Parisienne']]]
];
function fontOptions(cur, blankLabel){
  return '<option value=""' + (!cur ? ' selected' : '') + '>' + blankLabel + '</option>' +
    FONT_GROUPS.map(([g, list]) => '<optgroup label="' + g + '">' +
      list.map(([v, l]) => '<option value="' + escAttr(v) + '"' + (cur === v ? ' selected' : '') + '>' + l + '</option>').join('') +
      '</optgroup>').join('');
}
const THEMES = {
  mono:{label:'모노', bg:'#F1F1EF', bg2:'#DCDCD8', font:"'Pretendard',sans-serif",
    narr:{text:'#5B5952', action:'#8A887F'},
    pairs:[{bubble:'#FFFFFF',text:'#1D1D1B',action:'#7C7A74',nameColor:'#43413C'},
           {bubble:'#E3E2DE',text:'#1D1D1B',action:'#6E6C66',nameColor:'#43413C'}]},
  pastel:{label:'파스텔', bg:'#FDF3F6', bg2:'#EAF1FB', font:"'Gowun Dodum',sans-serif",
    narr:{text:'#7A6270', action:'#A98CA0'},
    pairs:[{bubble:'#FFE1E9',text:'#59394A',action:'#AE879A',nameColor:'#A8607E'},
           {bubble:'#E1EDFB',text:'#2F455C',action:'#7E97B2',nameColor:'#4B7098'}]},
  dark:{label:'다크', bg:'#15151B', bg2:'#22212B', font:"'Pretendard',sans-serif",
    narr:{text:'#A7A2B4', action:'#7D7889'},
    pairs:[{bubble:'#25252F',text:'#E9E7EF',action:'#8E88A0',nameColor:'#B7B1C6'},
           {bubble:'#37304C',text:'#F0E9F8',action:'#A79BC0',nameColor:'#C7B9E0'}]},
  kakao:{label:'카카오톡', bg:'#A6BCD9', bg2:'#8FA8CB', font:"'Pretendard',sans-serif",
    narr:{text:'#3A4757', action:'#5D6B7D'},
    pairs:[{bubble:'#FFFFFF',text:'#191919',action:'#767676',nameColor:'#2C3B4E'},
           {bubble:'#FEE500',text:'#191919',action:'#7A7000',nameColor:'#2C3B4E'}]},
  imessage:{label:'아이메시지', bg:'#FFFFFF', bg2:'#F2F2F7', font:"'Pretendard',sans-serif",
    narr:{text:'#8A8A8E', action:'#A9A9AE'},
    pairs:[{bubble:'#E9E9EB',text:'#000000',action:'#6E6E73',nameColor:'#8A8A8E'},
           {bubble:'#0A84FF',text:'#FFFFFF',action:'#CBE3FF',nameColor:'#8A8A8E'}]},
  sepia:{label:'고서', bg:'#F0E7D5', bg2:'#E2D3B8', font:"'Gowun Batang',serif",
    narr:{text:'#4B3B28', action:'#8A7150'},
    pairs:[{bubble:'#FBF5E9',text:'#3A2E20',action:'#8A7150',nameColor:'#6A5334'},
           {bubble:'#E7DAC1',text:'#3A2E20',action:'#8A7150',nameColor:'#6A5334'}]},
  /* 소설책 — 전자책 지면. 흰 종이에 검은 글자, 말풍선 없이 글줄로 읽는 조판 */
  novel:{label:'소설책', bg:'#FFFFFF', bg2:'#FFFFFF', font:"'Noto Serif KR',serif",
    /* 말풍선을 버리고 글줄로, 대사는 큰따옴표로 묶고 지문은 문단으로 내린다 */
    preset:{mode:'line', wrapQuote:'\u201C\u201D', nameSep:'', hideNames:true,
      actionMode:'split', textAlign:'justify', alignedText:true,
      fontSize:17, lineHeight:1.9, pgap:60, indent:100, indentOn:true, indentDlg:true, padX:56, padY:52, gap:6},
    narr:{text:'#111111', action:'#111111'},
    pairs:[{bubble:'#FFFFFF',text:'#111111',action:'#111111',nameColor:'#111111'},
           {bubble:'#FFFFFF',text:'#111111',action:'#111111',nameColor:'#111111'}]},
  /* 잡지 — 흑백 대비가 센 편집 디자인 */
  editorial:{label:'잡지', bg:'#FFFFFF', bg2:'#EFEFEF', font:"'IBM Plex Sans KR',sans-serif",
    narr:{text:'#111111', action:'#6A6A6A'},
    pairs:[{bubble:'#111111',text:'#FFFFFF',action:'#B9B9B9',nameColor:'#000000'},
           {bubble:'#F0F0F0',text:'#111111',action:'#7A7A7A',nameColor:'#111111'}]}
};
const MODE_HINT = {
  bubble:'메신저처럼 화자마다 좌우로 말풍선이 붙습니다.',
  mixed:'대사만 말풍선 안에, 행동 지문은 밖에 서술처럼. 지문 규칙의 줄 나누기 설정과 상관없이 늘 나뉩니다.',
  line:'말풍선 없이 이름과 대사를 한 줄에. 이름 뒤 기호와 감싸는 기호는 따로 고릅니다.',
  quote:'대사를 인용문처럼 들여쓰고 이름은 아래에 출처처럼. 행동 지문은 상자 밖으로 빠집니다.'
};
const WRAPS = [['none','없음'],['""','" 대사 "'],['\u201C\u201D','\u201C 대사 \u201D'],['\u2018\u2019','\u2018 대사 \u2019'],
  ['「」','「 대사 」'],['『』','『 대사 』'],['≪≫','≪ 대사 ≫'],['〈〉','〈 대사 〉'],['()','( 대사 )'],['―','― 대사']];
const NAMESEPS = [['','없음 (띄어쓰기만)'],[':',': 콜론'],['-','- 하이픈'],['―','― 줄표'],['·','· 가운뎃점'],['｜','｜ 세로줄'],['》','》 꺾쇠']];
const MODE_MIGRATE = {book:'line', color:'line'};
const FRAME_TUNE = {
  browser :{ratio:'16:9', canvasRadius:12, frameColor:'#E9E7EC', padX:34, padY:26, gap:14},
  terminal:{ratio:'4:3',  canvasRadius:12, frameColor:'#1D1D24', padX:30, padY:22, gap:13},
  monitor :{ratio:'16:9', canvasRadius:20, frameColor:'#2B2B33', padX:30, padY:24, gap:14},
  phone   :{ratio:'9:16', canvasRadius:52, frameColor:'#3A3A42', padX:26, padY:16, gap:14},
  chat    :{ratio:'9:16', canvasRadius:24, frameColor:'#E9E7EC', padX:20, padY:16, gap:13},
  player  :{ratio:'1:1',  canvasRadius:22, frameColor:'#2A2A2E', padX:30, padY:14, gap:14},
  vn      :{ratio:'16:9', canvasRadius:8,  frameColor:'#F0E9FA', padX:34, padY:12, gap:12},
  rpg     :{ratio:'4:3',  canvasRadius:6,  frameColor:'#E8DFC6', padX:38, padY:20, gap:13},
  hud     :{ratio:'16:9', canvasRadius:6,  frameColor:'#9FE8C4', padX:40, padY:16, gap:13},
  letter  :{ratio:'3:4',  canvasRadius:2,  frameColor:'#8A7150', padX:44, padY:34, gap:15},
  magazine:{ratio:'3:4',  canvasRadius:0,  frameColor:'#2A2A2E', padX:36, padY:18, gap:15},
  polaroid:{ratio:'1:1',  canvasRadius:2,  frameColor:'#FFFFFF', padX:26, padY:22, gap:14},
  /* 책은 판면 대비 글자가 작아야 책처럼 보인다. 여백은 재단선이 들어갈 만큼만 */
  print   :{ratio:'custom', ratioW:5, ratioH:7, canvasRadius:0, frameColor:'#111111', padX:30, padY:34, gap:5,
            fontSize:9, usePageNo:true, pageNoPos:'bc', pageNoSize:9},
  /* 문고판 두 쪽을 나란히 편 비율(가로:세로 ≒ 1.43) */
  spread  :{ratio:'custom', ratioW:10, ratioH:7, canvasRadius:0, frameColor:'#111111', padX:24, padY:22, gap:4,
            fontSize:8, usePageNo:true, pageNoPos:'outer', pageNoSize:8},
  calendar:{ratio:'custom', ratioW:1200, ratioH:1150, canvasRadius:10, frameColor:'#C75050', padX:32, padY:18, gap:14},
  film    :{ratio:'custom', ratioW:1500, ratioH:1000, canvasRadius:0, frameColor:'#1B1814', padX:36, padY:24, gap:13},
  ticket  :{ratio:'3:4',  canvasRadius:6,  frameColor:'#2A2A2E', padX:32, padY:20, gap:14},
  receipt :{ratio:'custom', ratioW:900, ratioH:1700, canvasRadius:2, frameColor:'#2A2A2E', padX:30, padY:14, gap:13},
  'ticket:movie'  :{ratio:'custom', ratioW:1000, ratioH:1500, canvasRadius:6, frameColor:'#2A2A2E', padX:34, padY:18, gap:14},
  'ticket:flight' :{ratio:'custom', ratioW:1600, ratioH:760,  canvasRadius:8, frameColor:'#2A2A2E', padX:30, padY:16, gap:12},
  'ticket:concert':{ratio:'custom', ratioW:1000, ratioH:1400, canvasRadius:6, frameColor:'#B8324B', padX:34, padY:18, gap:14}
};
const PAGENO_POS_LBL = {bc:'아래 가운데', br:'아래 오른쪽', tr:'위 오른쪽', outer:'바깥쪽 양쪽'};
const TUNE_META = [
  ['usePageNo','쪽 번호 넣기', v => v ? '켬' : '끔'],
  ['pageNoPos','쪽 번호 위치', v => PAGENO_POS_LBL[v] || v],
  ['pageNoSize','쪽 번호 크기', v => v + 'px'],
  ['fontSize','글자 크기', v => v + 'px'],
  ['canvasRadius','캔버스 모서리 둥글기', v => v + 'px'],
  ['padX','좌우 여백', v => v + 'px'],
  ['padY','위아래 여백', v => v + 'px'],
  ['gap','대화 간격', v => v + 'px'],
  ['frameColor','테두리 색', v => v]
];
const RATIO_LABEL = {auto:'내용에 맞춤', custom:'직접 입력'};
const ratioName = v => RATIO_LABEL[v] || String(v).replace(':', ' : ');
/* 배경 패턴 — 그라데이션으로 그리는 것만 쓴다(html2canvas가 확실히 그림).
   별·하트 같은 모양은 기호를 격자로 까는 방식으로 따로 처리한다. */
const BG_PATTERNS = [
  ['none','없음'], ['stripe-v','세로 줄무늬'], ['stripe-h','가로 줄무늬'], ['stripe-d','사선 줄무늬'],
  ['check','체크무늬'], ['gingham','깅엄 체크'], ['grid','모눈'], ['dot','땡땡이'],
  ['diamond','마름모'], ['zigzag','지그재그'], ['symbol','기호 타일']
];
function patternCss(kind, color, size){
  const c = color, s2 = size, h = s2 / 2;
  switch (kind){
    case 'stripe-v':
      return {image:'repeating-linear-gradient(90deg,' + c + ' 0 ' + h + 'px,transparent ' + h + 'px ' + s2 + 'px)', size:null};
    case 'stripe-h':
      return {image:'repeating-linear-gradient(180deg,' + c + ' 0 ' + h + 'px,transparent ' + h + 'px ' + s2 + 'px)', size:null};
    case 'stripe-d':
      return {image:'repeating-linear-gradient(45deg,' + c + ' 0 ' + h + 'px,transparent ' + h + 'px ' + s2 + 'px)', size:null};
    case 'check':
      return {image:'linear-gradient(45deg,' + c + ' 25%,transparent 25% 75%,' + c + ' 75%),' +
                    'linear-gradient(45deg,' + c + ' 25%,transparent 25% 75%,' + c + ' 75%)',
              size:s2 + 'px ' + s2 + 'px', pos:'0 0,' + h + 'px ' + h + 'px'};
    case 'gingham':
      return {image:'repeating-linear-gradient(90deg,' + c + ' 0 ' + h + 'px,transparent ' + h + 'px ' + s2 + 'px),' +
                    'repeating-linear-gradient(180deg,' + c + ' 0 ' + h + 'px,transparent ' + h + 'px ' + s2 + 'px)', size:null};
    case 'grid':
      return {image:'repeating-linear-gradient(90deg,' + c + ' 0 1px,transparent 1px ' + s2 + 'px),' +
                    'repeating-linear-gradient(180deg,' + c + ' 0 1px,transparent 1px ' + s2 + 'px)', size:null};
    case 'dot':
      return {image:'radial-gradient(' + c + ' ' + Math.max(1, Math.round(s2 * .17)) + 'px,transparent ' + Math.max(2, Math.round(s2 * .18)) + 'px),' +
                    'radial-gradient(' + c + ' ' + Math.max(1, Math.round(s2 * .17)) + 'px,transparent ' + Math.max(2, Math.round(s2 * .18)) + 'px)',
              size:s2 + 'px ' + s2 + 'px', pos:'0 0,' + h + 'px ' + h + 'px'};
    case 'diamond':
      return {image:'repeating-linear-gradient(45deg,' + c + ' 0 1px,transparent 1px ' + s2 + 'px),' +
                    'repeating-linear-gradient(-45deg,' + c + ' 0 1px,transparent 1px ' + s2 + 'px)', size:null};
    case 'zigzag':
      return {image:'linear-gradient(135deg,' + c + ' 25%,transparent 25%),' +
                    'linear-gradient(225deg,' + c + ' 25%,transparent 25%),' +
                    'linear-gradient(45deg,' + c + ' 25%,transparent 25%),' +
                    'linear-gradient(315deg,' + c + ' 25%,transparent 25%)',
              size:s2 + 'px ' + s2 + 'px', pos:'0 0,' + h + 'px 0,' + h + 'px -' + h + 'px,0 ' + h + 'px'};
    default: return null;
  }
}
const FRAME_TITLE_LBL = {browser:'탭·주소창 글자', terminal:'창 이름', monitor:'받침대 글자', phone:'상태바 시각',
  chat:'상대 이름', player:'트랙 이름', vn:'이름표', rpg:'이름표', hud:'플레이어 이름', letter:'머리글',
  magazine:'제호', polaroid:'쓰지 않음', ticket:'티켓 문구', custom:'쓰지 않음'};
const FRAME_TITLE_PH = {browser:'발췌', terminal:'~/chat — zsh', monitor:'', phone:'9:41',
  chat:'대화', player:'이름 없는 트랙', vn:'화자', rpg:'화자', hud:'PLAYER', letter:'편지',
  magazine:'ARCHIVE', polaroid:'2026. 여름', ticket:'ADMIT ONE', custom:''};
const FRAME_PROMPT = [
  '이미지로 저장할 캔버스 위에 얹을 «장식 테두리» HTML 조각을 만들어 줘. 설명 없이 코드만 줘.',
  '',
  '조건',
  '- 캔버스 전체를 덮는 빈 칸 안에 들어간다. 모든 요소는 position:absolute 로 배치할 것.',
  '- top / left / right / bottom 의 0 이 캔버스의 네 모서리다.',
  '- <html>, <body>, <script> 같은 바깥 태그 없이 요소만 쓸 것.',
  '- 스타일은 각 태그의 style 속성에 인라인으로 쓸 것.',
  '- 길이 단위는 되도록 em 을 쓸 것 (캔버스 글자 크기에 비례해야 함).',
  '- box-shadow, filter, clip-path, backdrop-filter 는 쓰지 말 것. 저장하면 사라진다.',
  '- border, border-radius, linear-gradient, 색면은 마음껏 써도 된다.',
  '- 캔버스 가운데는 대사가 들어갈 자리다. 위·아래·가장자리만 쓰고 가운데는 비워 둘 것.',
  '- 위나 아래에 막대를 만들면 그 두께가 몇 px 인지 코드 끝에 주석 한 줄로 알려 줄 것.',
  '',
  '만들 테두리: (여기에 원하는 모양을 적으세요)'
].join('\n');
const FRAME_SAMPLE = [
  '<div style="position:absolute;top:0;left:0;right:0;height:34px;background:#2E4A63;color:#EFEAF5;',
  'display:flex;align-items:center;gap:8px;padding:0 14px;font-size:12px;letter-spacing:.12em">',
  '<span style="width:9px;height:9px;border-radius:9px;background:#FF6B6B"></span>',
  '<span>MY WINDOW</span>',
  '</div>',
  '<div style="position:absolute;inset:0;border:2px solid #2E4A63;border-radius:14px"></div>'
].join('\n');
const AUTO_COLORS = [
  {bubble:'#FFFFFF',text:'#1D1D1B',action:'#7C7A74',nameColor:'#43413C'},
  {bubble:'#E3E2DE',text:'#1D1D1B',action:'#6E6C66',nameColor:'#43413C'},
  {bubble:'#E6EFE4',text:'#22301F',action:'#71856D',nameColor:'#41603B'},
  {bubble:'#F3E6EC',text:'#3A2028',action:'#9C7C89',nameColor:'#7E4258'},
  {bubble:'#E7EAF6',text:'#1F2438',action:'#77809E',nameColor:'#3D4A78'},
  {bubble:'#F6EEDF',text:'#332A1C',action:'#8E7C5C',nameColor:'#6B5630'}
];

/* ---------------- state ---------------- */
const DEFAULT_STATE = () => ({
  version: 7,
  mode: 'bubble',
  theme: 'mono',
  hideNames: false,
  alignedText: false,
  wrapQuote: '\u201C\u201D',
  nameSep: ':',
  quoteOrn: 'bar',
  markColor: '#FDE68A', markAlpha: 0,
  bubbleWidth: 82, bubblePad: 95,
  bubbleShape: 'notch', bubbleShadow: true,
  narrator: {text:'#5B5952', action:'#8A887F', align:'center', size:100, italic:false, bubble:'#FFFFFF', noBubble:true},
  textAlign: 'left',
  frame: 'none', frameColor: '#E9E7EC', frameTitle: '', frameHtml: '', frameOnTop: false, frameEls: {},
  frameAsk: 'ask', frameVar: {}, frameText: {}, frameImg: {},
  frameChoiceText: '그에게 다가간다\n그냥 지나친다',
  marks: { parenStar:true, star:true, paren:false, quote:false, rules:[] },
  xrules: [], xprio: '',
  memos: [],
  actionMode: 'inline',
  ratio: 'auto', ratioW: 2, ratioH: 3,
  usePageNo: false, useDocTitle: false, useStamp: false,
  pageNo: 'num', pageNoPos: 'bc', pageNoColor: '#8A8A8E', pageNoSize: 12,
  docTitle: '', docTitleAlign: 'center', docTitleWhere: 'all', docTitleColor: '#8A8A8E', docTitleSize: 130,
  docTitleFont: '', docTitleDeco: 'rule', docTitleEyebrow: 'CHAPTER', docTitleLs: 16,
  stampText: '', stampPos: 'bl', stampColor: '#A5A5AA', stampSize: 11, stampFont: '',
  bgKind: 'solid', bgColor: '#F1F1EF', bgColor2: '#DCE6EF', bgImage: null,
  bgFit: 'cover', bgUnder: 'solid', bgFade: 'none', bgFadeSize: 35, tint: 0,
  bgPattern: 'none', bgPatColor: '#FFFFFF', bgPatSize: 26, bgPatOpacity: 35, bgPatSymbol: '★',
  font: "'Pretendard',sans-serif", fontSize: 16, lineHeight: 1.65, letterSpace: 0, pgap: 42, indent: 0,
  hScale: 100, fontWeight: 400, wordBreak: 'char', inkColor: '#D9534F',
  padX: 30, padY: 30, gap: 15, bubbleRadius: 18, canvasRadius: 14,
  exportW: 1080, exportName: '발췌', exportMode: 'zip', exportPages: 'all',
  speakers: [
    {id:'s1', name:'화자1', align:'left', avatar:null, ...AUTO_COLORS[1]},
    {id:'s2', name:'화자2', align:'right', avatar:null, ...AUTO_COLORS[0]}
  ],
  blocks: [
    {id:'b1', type:'line', speakerId:'s1', text:'*창밖으로 시선을 옮기며*\n오늘은 눈이 오려나.', image:null},
    {id:'b2', type:'line', speakerId:'s2', text:'우산은 **두 개** 챙겼어.', image:null},
    {id:'b3', type:'rule', line:'solid', sym:'✦', color:'#9A93A5', width:70, thick:1, symSize:100},
    {id:'b4', type:'line', speakerId:'', text:'그리고 첫눈이 내렸다.', image:null}
  ]
});
let state = DEFAULT_STATE();
let zoom = 1, zoomAuto = true, pageCount = 1, reflowing = false;

/* ---------------- history ---------------- */
const past = [];
let snapTimer = null, pastSize = 0;
const HISTORY_MAX = 40, HISTORY_BYTES = 24e6;
function snapshot(){
  const snap = JSON.stringify(state);
  past.push(snap); pastSize += snap.length;
  /* 사진이 붙은 상태는 한 벌만 해도 수 MB다. 개수와 총량 둘 다로 끊는다 */
  while (past.length > HISTORY_MAX || (past.length > 1 && pastSize > HISTORY_BYTES))
    pastSize -= past.shift().length;
  $('#btnUndo').disabled = false;
  /* 새로 고치기 시작하면 '다시 실행'할 거리는 사라진다 */
  future.length = 0; $('#btnRedo').disabled = true;
}
function snapshotSoon(){ clearTimeout(snapTimer); snapTimer = setTimeout(snapshot, 700); }
/* 다시 실행 — 되돌릴 때 지금 상태를 future에 쌓아 두었다가 꺼낸다 */
const future = [];
function undo(){
  clearTimeout(snapTimer);
  if (!past.length) return;
  const snap = past.pop();
  pastSize -= snap.length;
  future.push(JSON.stringify(state));
  state = JSON.parse(snap);
  $('#btnUndo').disabled = !past.length;
  $('#btnRedo').disabled = false;
  renderAll();
  toast('되돌렸습니다');
}
function redo(){
  clearTimeout(snapTimer);
  if (!future.length) return;
  const cur = JSON.stringify(state);
  past.push(cur); pastSize += cur.length;
  state = JSON.parse(future.pop());
  $('#btnUndo').disabled = false;
  $('#btnRedo').disabled = !future.length;
  renderAll();
  toast('다시 실행했습니다');
}

/* ---------------- toast ---------------- */
let toastTimer = null;
function toast(msg){
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
}

/* ---------------- inline parser ----------------
   한 번의 스캔으로 우선순위대로 마커를 잡는다.
   ** 굵게 · == 형광 · {{#색:글자}} 글자색 · _ 기울임 · *( )* / * * / ( ) 지문 · " " 대사 · 직접 규칙
   직접 규칙은 여는·닫는 기호 사이를 지문(action) 또는 대사(quote)로 읽는다.
------------------------------------------------- */
const reEsc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MARK_DEFAULTS = () => ({parenStar:true, star:true, paren:false, quote:false, custom:false, rules:[]});
/* 저장 파일·프리셋의 지문 규칙을 지금 모양으로 맞춘다. 직접 규칙이 없던 예전 파일은 빈 목록이 된다 */
function normMarks(m){
  const out = Object.assign(MARK_DEFAULTS(), m || {});
  out.rules = (Array.isArray(out.rules) ? out.rules : [])
    .filter(r => r && typeof r.open === 'string' && typeof r.close === 'string')
    .map(r => ({open:r.open, close:r.close, kind:r.kind === 'talk' ? 'talk' : 'action', show:!!r.show}));
  /* 켜짐 표시가 없는 파일(커췌기 파일 등)은 규칙이 있으면 켠다 */
  out.custom = m && m.custom !== undefined ? !!m.custom : out.rules.length > 0;
  delete out.rest;
  return out;
}
function activeRules(marks){
  if (!marks || !marks.custom) return [];
  return (marks.rules || []).filter(r => r.open && r.close);
}
/* 기호 밖의 글을 지문으로 돌릴지: "따옴표" 규칙이나 대사 직접 규칙이 있을 때 */
function invertsRest(marks){
  return !!marks.quote || activeRules(marks).some(r => r.kind === 'talk');
}
function buildRules(marks, allowAction){
  const r = [
    {type:'bold',   re:/\*\*([^*\n]+?)\*\*/y},
    {type:'mark',   re:/==([^=\n]+?)==/y},
    {type:'size',   re:/\[\[(\d{2,3}:[^\]\n]+?)\]\]/y},
    {type:'ink',    re:/\{\{(!?#[0-9a-fA-F]{3,8}(?:@\d{2,3})?:[^}\n]+?)\}\}/y},
    /* 밑줄: ⸨#색:글⸩, 필기에 딸린 밑줄은 ⸨#색^필기id:글⸩ */
    {type:'under',  re:/\u2E28(#[0-9a-fA-F]{3,8}(?:\^[a-z0-9]+)?:[^\u2E29\n]+?)\u2E29/y},
  ];
  /* 직접 규칙과 *( )* · * * 를 여는 기호가 긴 순서로 본다. (( )) 가 ( ) 보다, *( )* 가 * * 보다 먼저 잡혀야 한다.
     길이가 같으면 직접 규칙이 먼저 */
  const pre = [];
  activeRules(marks).forEach(u => {
    if (u.kind === 'action' && !allowAction) return;
    const o = reEsc(u.open), c = reEsc(u.close);
    /* 닫는 기호를 만나기 전까지 읽되, 안에 든 **굵게** 는 통째로 건너뛴다 (* * 규칙이 굵게에 끊기지 않게) */
    pre.push({type:u.kind === 'talk' ? 'quote' : 'action', open:u.open, close:u.close, show:u.show, len:u.open.length,
      re:new RegExp(o + '((?:\\*\\*[^*\\n]+?\\*\\*|(?!' + c + ')[^\\n])+)' + c, 'y')});
  });
  if (allowAction && marks.parenStar !== false) pre.push({type:'action', len:2, re:/\*\(([^)\n]+?)\)\*/y});
  if (allowAction && marks.star)  pre.push({type:'action', len:1, re:/\*(?=\S)((?:[^*\n]|\*\*)*?(?:[^\s*]|\*\*))\*(?!\*)/y});
  pre.sort((a, b) => b.len - a.len).forEach(x => r.push(x));
  r.push({type:'italic', re:/_([^_\n]+?)_/y});
  if (allowAction && marks.paren) r.push({type:'action', re:/\(([^()\n]+?)\)/y});
  if (marks.quote) r.push({type:'quote', re:/[“"]([^”"\n]*?)[”"]/y});
  return r;
}
function parseInline(src, marks, allowAction = true, depth = 0){
  const rules = buildRules(marks, allowAction);
  const out = []; let buf = ''; let i = 0;
  const flush = () => { if (buf) { out.push({type:'text', text:buf}); buf = ''; } };
  while (i < src.length){
    let hit = null;
    for (const r of rules){
      r.re.lastIndex = i;
      const m = r.re.exec(src);
      if (m && m.index === i){ hit = {type:r.type, m, rule:r}; break; }
    }
    if (hit && depth < 5){
      flush();
      let inner = hit.m[1] ?? '';
      let color = null;
      if (hit.type === 'mark'){
        const cm = /^(#[0-9a-fA-F]{3,8}):([\s\S]*)$/.exec(inner);
        if (cm){ color = cm[1]; inner = cm[2]; }
      }
      /* {{!#색@크기:...}} 은 화자 추가 색상이 넣는 표시 — 안의 괄호 등을 지문으로 읽지 않는다 */
      let plain = false, size = null;
      if (hit.type === 'ink'){
        const km = /^(!?)(#[0-9a-fA-F]{3,8})(?:@(\d{2,3}))?:([\s\S]*)$/.exec(inner);
        if (km){ plain = !!km[1]; color = km[2]; size = km[3] || null; inner = km[4]; }
      }
      let note = null;
      if (hit.type === 'under'){
        const um = /^(#[0-9a-fA-F]{3,8})(?:\^([a-z0-9]+))?:([\s\S]*)$/.exec(inner);
        if (um){ color = um[1]; note = um[2] || null; inner = um[3]; }
      }
      if (hit.type === 'size'){
        const sm = /^(\d{2,3}):([\s\S]*)$/.exec(inner);
        if (sm){ color = sm[1]; inner = sm[2]; }
      }
      const childAction = hit.type === 'action' || plain ? false : allowAction;
      const node = {type:hit.type, kids:parseInline(inner, marks, childAction, depth + 1), raw:hit.m[0], color:color};
      if (size) node.size = size;
      if (plain) node.plain = true;
      if (note) node.note = note;
      if (hit.rule.open != null){ node.open = hit.rule.open; node.close = hit.rule.close; node.show = hit.rule.show; }
      out.push(node);
      i += hit.m[0].length;
    } else { buf += src[i]; i++; }
  }
  flush();
  return out;
}
/* "따옴표 밖은 전부 지문" 모드 (대사 직접 규칙도 같다) */
function invertQuotes(nodes){
  return nodes.map(n => {
    if (n.type === 'quote') return n;
    if (n.type === 'action') return n;
    return {type:'action', kids:[n]};
  });
}
function isActionNode(n){ return n.type === 'action'; }
function nodeText(n){
  if (n.type === 'text') return n.text;
  if (n.open != null){
    const inner = (n.kids || []).map(nodeText).join('');
    return n.show ? n.open + inner + n.close : inner;
  }
  if (n.type === 'quote' && n.raw) return n.raw;
  return (n.kids || []).map(nodeText).join('');
}
/* 형광 배경은 글자 하나짜리 조각으로 쪼개 칠한다.
   여러 줄에 걸친 인라인 요소의 배경을 html2canvas가 줄별로 못 그리고
   전체를 덮는 한 장의 사각형으로 그려, 주변 글자까지 형광색으로 덮어 버리기 때문.
   글자마다 따로 칠하면 어떤 조각도 줄을 넘지 않아 저장 결과가 미리보기와 같다. */
/* #RRGGBBAA 를 rgba() 로 편다 — html2canvas 가 8자리 hex 를 못 읽는다 */
function markBgOf(v){
  const m = /^#([0-9a-fA-F]{8})$/.exec(v || '');
  if (!m) return v;
  const n = m[1];
  const p = i => parseInt(n.slice(i, i + 2), 16);
  return 'rgba(' + p(0) + ',' + p(2) + ',' + p(4) + ',' + (p(6) / 255).toFixed(3) + ')';
}
function markChars(text, bg){
  return Array.from(String(text)).map(ch =>
    ch === '\n' ? escHtml(ch)
      : '<span class="mkc" style="background:' + markBgOf(bg) + '">' + escHtml(ch) + '</span>'
  ).join('');
}
/* ---- 외국어 색상 ----
   화자별로 켜면 한글이 아닌 글자(고른 문자 종류)를 따로 칠한다.
   색이 겹칠 때(직접 글자색·괄호 번역색·외국어색·지문색)는 글자 하나하나에서 우선순위가 높은 색을 쓴다. */
const FX_SCRIPTS = [
  ['han',   '한자',         /\p{Script=Han}/u],
  ['kana',  '일본 가나',     /[\p{Script=Hiragana}\p{Script=Katakana}\u30FC\uFF70]/u],
  ['latin', '라틴 문자 (영어 등)', /\p{Script=Latin}/u],
  ['other', '그 밖의 문자 (키릴·그리스·태국 등)', /[\p{Script=Cyrillic}\p{Script=Greek}\p{Script=Thai}\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Devanagari}\p{Script=Lao}\p{Script=Khmer}\p{Script=Georgian}\p{Script=Armenian}]/u],
];
const FX_PRIO_DEFAULT = ['ink', 'extra', 'foreign', 'action'];
const FX_PRIO_LABEL = {ink:'직접 지정한 글자색', extra:'괄호 안 글자색', foreign:'외국어 색', action:'지문 색'};
const XR_HEX = /^#[0-9a-fA-F]{3,8}$/;
function xPrio(){
  const v = String(state.xprio || '').split(',').filter(k => FX_PRIO_DEFAULT.indexOf(k) >= 0);
  FX_PRIO_DEFAULT.forEach(k => { if (v.indexOf(k) < 0) v.push(k); });
  return v.slice(0, FX_PRIO_DEFAULT.length);
}
function xrScripts(r){
  const v = r.scripts == null ? 'han,kana,latin,other' : String(r.scripts);
  return v.split(',').filter(k => FX_SCRIPTS.some(x => x[0] === k));
}
function xrScope(r){
  const sc = r.scope || {};
  return {narr: !!sc.narr, all: sc.all !== false, ids: Array.isArray(sc.ids) ? sc.ids : []};
}
/* 이 블록(화자, 없으면 나레이션)에 걸리는 추가 지문 규칙 */
function xRulesFor(sp){
  return (state.xrules || []).filter(r => {
    if (r.on === false) return false;
    const sc = xrScope(r);
    if (!sp) return sc.narr;
    return sc.all || sc.ids.indexOf(sp.id) >= 0;
  });
}
/* 그리기용 설정. 걸리는 규칙이 없으면 null — 예전 방식(안쪽 표시가 이기는)대로 그린다 */
function xrConf(sp){
  const rules = xRulesFor(sp);
  if (!rules.length) return null;
  const fx = rules.filter(r => r.kind === 'fx').map(r => {
    const keys = xrScripts(r);
    const res = FX_SCRIPTS.filter(x => keys.indexOf(x[0]) >= 0).map(x => x[2]);
    return {color: XR_HEX.test(r.color || '') ? r.color : '#C0392B', test: ch => res.some(re => re.test(ch))};
  });
  return {fx, prio: xPrio()};
}
/* 예전 화자별 설정(추가 색상·외국어 색상)을 추가 지문 규칙으로 옮긴다. 설정이 같은 화자끼리는 규칙 하나로 묶는다.
   지워진 화자는 적용 범위에서 뺀다. 불러오기·되돌리기 어느 길로 들어와도 그리기 전에 한 번 돈다. */
const XR_OLD_KEYS = ['extraOn','extraOpen','extraClose','extraColor','extraSize','extraShow','fxOn','fxColor','fxScripts','fxPrio'];
function ensureXRules(){
  if (!Array.isArray(state.xrules)) state.xrules = [];
  const sig = r => JSON.stringify(Object.keys(r).filter(k => k !== 'id' && k !== 'scope').sort().map(k => [k, r[k]]));
  const add = (rule, spId) => {
    const key = sig(rule);
    const same = state.xrules.find(r => sig(r) === key);
    if (same){ const sc = xrScope(same); if (!sc.all && sc.ids.indexOf(spId) < 0) sc.ids.push(spId); same.scope = sc; return; }
    state.xrules.push(Object.assign({id: uid()}, rule, {scope: {narr:false, all:false, ids:[spId]}}));
  };
  state.speakers.forEach(sp => {
    if (!XR_OLD_KEYS.some(k => k in sp)) return;
    if (sp.extraOn){
      add({kind:'br', on:true, open: sp.extraOpen == null ? '(' : String(sp.extraOpen), close: sp.extraClose == null ? ')' : String(sp.extraClose),
        color: XR_HEX.test(sp.extraColor || '') ? sp.extraColor : '#8A8F99',
        size: clamp(Math.round(Number(sp.extraSize) || 100), 50, 300), show: sp.extraShow !== false}, sp.id);
    }
    if (sp.fxOn){
      add({kind:'fx', on:true, color: XR_HEX.test(sp.fxColor || '') ? sp.fxColor : '#C0392B',
        scripts: sp.fxScripts == null ? 'han,kana,latin,other' : String(sp.fxScripts)}, sp.id);
      if (sp.fxPrio && !state.xprio) state.xprio = sp.fxPrio;
    }
    XR_OLD_KEYS.forEach(k => { delete sp[k]; });
  });
  const live = new Set(state.speakers.map(sp => sp.id));
  state.xrules.forEach(r => {
    if (r.scope && Array.isArray(r.scope.ids) && r.scope.ids.some(id => !live.has(id)))
      r.scope.ids = r.scope.ids.filter(id => live.has(id));
  });
}
/* 괄호 안 글자 규칙 — 정한 두 기호 사이의 글자를 {{!#색@크기:글자}} 로 감싸 그린다. 원문은 그대로 둔다.
   기호 표시를 끄면 기호는 찾는 데만 쓰고 판에는 안쪽 글자만 그린다. 같은 기호가 지문 규칙이어도 이 규칙이 먼저다. */
function applyBrackets(text, rules){
  let out = String(text ?? '');
  rules.filter(r => r.kind === 'br').forEach(r => {
    const open = String(r.open == null ? '(' : r.open), close = String(r.close == null ? ')' : r.close);
    if (!open || !close || /[{}\n]/.test(open + close)) return;
    const color = XR_HEX.test(r.color || '') ? r.color : '#8A8F99';
    const size = clamp(Math.round(Number(r.size) || 100), 50, 300);
    const tag = '{{!' + color + (size !== 100 ? '@' + size : '') + ':';
    const show = r.show !== false;
    const re = new RegExp(reEsc(open) + '([^\n]*?)' + reEsc(close), 'g');
    out = out.replace(re, (all, inner) => {
      if (!inner.trim() || /[{}]/.test(inner)) return all;
      return tag + (show ? all : inner) + '}}';
    });
  });
  return out;
}
/* 글자마다 외국어 색을 정한다(외국어가 아니면 null). 외국어 규칙이 여럿이면 목록 위의 규칙이 먼저.
   문장부호·숫자·띄어쓰기는 어느 말에도 속하지 않으므로 양쪽이 외국어면 외국어로,
   한쪽만 외국어면 띄어쓰기 없이 붙은 부호만 외국어로 본다(괄호는 빼고).
   예: “笑乜嘢。” 는 따옴표·마침표까지, "OK 했어" 는 OK만. */
const FX_HANGUL = /\p{Script=Hangul}/u, FX_SPACE = /\s/;
const FX_BRACKET = /[()\[\]（）［］]/;
function foreignMask(text, xr){
  const chs = Array.from(text);
  const col = chs.map(ch => {
    if (FX_HANGUL.test(ch)) return 'K';
    const r = xr.fx.find(f => f.test(ch));
    return r ? r.color : null;
  });
  const isF = v => v && v !== 'K';
  const out = col.map(v => isF(v) ? v : null);
  let i = 0;
  while (i < col.length){
    if (col[i] !== null){ i++; continue; }
    let j = i;
    while (j < col.length && col[j] === null) j++;
    const L = i > 0 ? col[i - 1] : null, R = j < col.length ? col[j] : null;
    if (isF(L) && isF(R)){
      for (let k = i; k < j; k++) out[k] = L;
    } else {
      const glue = ch => !FX_SPACE.test(ch) && !FX_BRACKET.test(ch);
      if (isF(L)) for (let k = i; k < j && glue(chs[k]); k++) out[k] = L;
      if (isF(R)) for (let k = j - 1; k >= i && glue(chs[k]) && !out[k]; k--) out[k] = R;
    }
    i = j;
  }
  return out;
}
function leafText(nodes){
  return nodes.map(n => n.type === 'text' ? n.text : leafText(n.kids || [])).join('');
}
function fxText(text, ctx, c, markBg){
  const chs = Array.from(text);
  const st = ctx.st;
  const body = t => markBg ? markChars(t, markBg) : escHtml(t);
  const colorFor = fcol => {
    for (const k of c.fx.prio){
      if (k === 'foreign'){ if (fcol) return fcol; }
      else if (ctx.src[k]) return ctx.src[k];
    }
    return null;
  };
  let out = '', i = 0;
  while (i < chs.length){
    const f = ctx.mask[st.pos + i] || null;
    let j = i;
    while (j < chs.length && (ctx.mask[st.pos + j] || null) === f) j++;
    const run = chs.slice(i, j).join('');
    const col = colorFor(f);
    out += col ? '<span style="color:' + markBgOf(col) + '">' + body(run) + '</span>' : body(run);
    i = j;
  }
  st.pos += chs.length;
  return out;
}
function nodesToHtml(nodes, c, markBg, ctx){
  if (c && c.fx && !ctx) ctx = {mask: foreignMask(leafText(nodes), c.fx), st:{pos:0}, src:{}};
  return nodes.map(n => {
    if (n.type === 'text'){
      if (ctx) return fxText(n.text, ctx, c, markBg);
      return markBg ? markChars(n.text, markBg) : escHtml(n.text);
    }
    const bg = n.type === 'mark' ? (n.color || c.mark) : markBg;
    let sub = ctx;
    if (ctx){
      const add = n.type === 'ink' ? (n.plain ? {extra: n.color || '#000000'} : {ink: n.color || '#000000'})
        : n.type === 'action' ? {action: c.action} : null;
      if (add) sub = {mask: ctx.mask, st: ctx.st, src: Object.assign({}, ctx.src, add)};
    }
    const inner = nodesToHtml(n.kids || [], c, bg, sub);
    switch (n.type){
      case 'bold':   return '<strong>' + inner + '</strong>';
      case 'italic': return '<em>' + inner + '</em>';
      case 'mark':   return '<mark style="background:none;color:inherit">' + inner + '</mark>';
      case 'ink':    return '<span class="ink" style="color:' + markBgOf(n.color || '#000000') +
        (n.size ? ';font-size:' + clamp(Number(n.size) || 100, 50, 300) + '%;line-height:1.25' : '') + '">' + inner + '</span>';
      case 'size':   return '<span style="font-size:' + clamp(Number(n.color) || 100, 50, 300) + '%;line-height:1.25">' + inner + '</span>';
      /* 밑줄은 배치가 끝난 뒤 줄마다 따로 그린다(paintUnderlines) — 여러 줄에 걸쳐도 저장 이미지와 같게 */
      case 'under':  return '<span class="ul" data-ulc="' + escAttr(n.color || '#D9534F') + '"' + (n.note ? ' data-note="' + n.note + '"' : '') + '>' + inner + '</span>';
      case 'action': return '<span class="act" style="color:' + c.action +
        (c.actionFont ? ';font-family:' + c.actionFont : '') + '">' + (n.show ? escHtml(n.open) : '') + inner + (n.show ? escHtml(n.close) : '') + '</span>';
      case 'quote':
        if (n.open != null) return '<span class="dlg">' + (n.show ? escHtml(n.open) : '') + inner + (n.show ? escHtml(n.close) : '') + '</span>';
        return '<span class="dlg">' + (n.raw ? escHtml(n.raw[0]) : '"') + inner + (n.raw ? escHtml(n.raw[n.raw.length-1]) : '"') + '</span>';
      default:       return inner;
    }
  }).join('');
}
/* 한 블록의 텍스트 → 문단 배열 */
function buildParagraphs(text, colors, forceSplit){
  const marks = state.marks;
  const split = forceSplit || state.actionMode !== 'inline';
  const lines = String(text ?? '').split('\n');
  const paras = [];
  /* 문단은 빈 줄로 나눈다. 빈 줄 없이 줄만 바꾼 곳은 같은 문단의 다음 줄(ln)이라 문단 간격을 넣지 않는다.
     빈 줄이 여럿이면 하나 넘는 만큼(gap) 더 띄운다. 맨 앞 빈 줄은 예전처럼 빈칸으로 남긴다. */
  let blanks = 0, seen = false;
  lines.forEach(line => {
    if (!line.trim()){
      if (seen) blanks++; else paras.push({kind:'space'});
      return;
    }
    const at = paras.length;
    const lead = seen ? (blanks ? {gap: blanks} : {ln: true}) : {};
    const done = () => { if (paras[at]) Object.assign(paras[at], lead); seen = true; blanks = 0; };
    let nodes = parseInline(line, marks, true);
    if (invertsRest(marks)) nodes = invertQuotes(nodes);
    /* 지문/대사 구간으로 묶기 */
    const runs = [];
    nodes.forEach(n => {
      const kind = isActionNode(n) ? 'action' : 'talk';
      const last = runs[runs.length - 1];
      if (last && last.kind === kind) last.nodes.push(n);
      else runs.push({kind, nodes:[n]});
    });
    const clean = runs.filter(r => r.nodes.some(n => nodeText(n).trim() !== ''));
    if (!clean.length){
      if (seen) blanks++; else paras.push({kind:'space'});
      return;
    }
    if (split) clean.forEach(r => paras.push({kind:r.kind, nodes:r.nodes}));
    else paras.push({kind:'mixed', runs:clean});
    done();
  });
  /* 끝에 남은 빈 줄은 예전처럼 빈칸으로 */
  for (let i = 0; i < blanks; i++) paras.push({kind:'space'});
  return paras;
}
function wrapPair(){
  const w = state.wrapQuote;
  if (!w || w === 'none') return null;
  if (w.length >= 2) return [w[0], w[1]];
  return [w + ' ', ''];
}
function wrapQuotes(html, plain, off, fx){
  if (off) return html;
  if (state.mode !== 'line' && state.mode !== 'quote') return html;
  const pair = wrapPair();
  if (!pair) return html;
  const t = plain.trim();
  if (!t) return html;
  const opens = '"\u201C\u2018\'「『≪〈(';
  const closes = '"\u201D\u2019\'」』≫〉)';
  if (opens.indexOf(t[0]) >= 0 && closes.indexOf(t[t.length - 1]) >= 0) return html;
  /* 외국어 규칙이 걸린 대사가 처음부터 끝까지 외국어면 감싸는 따옴표도 같은 색으로 */
  if (fx && fx.fx.length){
    const m = foreignMask(t, fx);
    if (m.length && m.every(Boolean)){
      const q = x => x ? '<span style="color:' + markBgOf(m[0]) + '">' + escHtml(x) + '</span>' : '';
      return q(pair[0]) + html + q(pair[1]);
    }
  }
  return pair[0] + html + pair[1];
}
function paraHtml(p, colors, noWrap){
  if (p.kind === 'mixed'){
    return p.runs.map(r => {
      const raw = nodesToHtml(r.nodes, colors);
      const lead = (raw.match(/^\s*/) || [''])[0];
      const tail = (raw.match(/\s*$/) || [''])[0];
      const core = raw.trim();
      return lead + (r.kind === 'talk' ? wrapQuotes(core, r.nodes.map(nodeText).join(''), noWrap, colors && colors.fx) : core) + tail;
    }).join('');
  }
  if (p.kind === 'action') return nodesToHtml(p.nodes, colors).trim();
  return wrapQuotes(nodesToHtml(p.nodes, colors).trim(), p.nodes.map(nodeText).join(''), noWrap, colors && colors.fx);
}
/* 문단 사이 간격 표시 — 줄만 바꾼 곳은 ln, 빈 줄이 둘 이상이면 넘는 만큼 더 띄운다 */
function paraAttr(p, cls){
  const c = cls + (p.ln ? ' pln' : '');
  const st = p.gap > 1 ? ' style="margin-top:calc(var(--c-pgap) + ' + ((p.gap - 1) * .5) + 'em)"' : '';
  return ' class="' + c + '"' + st;
}
function paragraphsHtml(text, colors, nameHtml, forceSplit, noWrap){
  const paras = buildParagraphs(text, colors, forceSplit);
  const out = [];
  let namePlaced = !nameHtml;
  paras.forEach(p => {
    if (p.kind === 'space'){ out.push('<div class="pspace"></div>'); return; }
    let html = paraHtml(p, colors, noWrap);
    if (!namePlaced){ html = nameHtml + html; namePlaced = true; }
    out.push('<p' + paraAttr(p, 'p' + (p.kind === 'action' ? ' act-p' : '')) + '>' + html + '</p>');
  });
  if (!namePlaced && nameHtml) out.unshift('<p class="p">' + nameHtml + '</p>');
  return out.join('');
}

/* 지문은 바깥에, 대사만 말풍선(혼합) 또는 인용 상자(인용구) 안에 */
function groupHtml(text, colors, sp, kind, lead){
  const isQuote = kind === 'quote';
  /* 지문은 항상 상자 밖으로 뺀다. 인용 표시는 실제로 입 밖에 낸 대사에만 붙는다. */
  const paras = buildParagraphs(text, colors, true);
  const nameColor = sp.nameColor || sp.text;
  const out = [];
  let buf = [], first = true, lastQ = -1;
  const flush = () => {
    if (!buf.length) return;
    if (isQuote){
      const tpl = quoteTpl().k;
      const mark = (first && tpl === 'quotes') ? '<span class="qmark open">\u201C</span>' : '';
      /* 상자 안·테두리에 이름을 두는 템플릿은 첫 상자 머리에 넣는다 */
      out.push('<div class="qbox" style="color:' + sp.text + ';--qc:' + nameColor + ';--qbg:' + hexToRgba(nameColor, .1) +
        ';--qbg2:' + hexToRgba(nameColor, .18) + '">' + (first && lead ? lead : '') + mark + buf.join('') +
        /* 꼬리·접힌 모서리는 가상 요소 대신 실제 요소로(저장 이미지에 빠지지 않게) */
        (tpl === 'bubble' ? '<span class="qtail"></span>' : tpl === 'postit' ? '<span class="qfold"></span>' : '') + '</div>');
      lastQ = out.length - 1;
    } else {
      out.push('<div class="bubble" style="' + bubbleStyle(sp) + '">' +
        (first && lead ? lead : '') + buf.join('') + tailHtml() + '</div>');
    }
    first = false; buf = [];
  };
  paras.forEach(p => {
    if (p.kind === 'space') return;
    if (p.kind === 'action'){
      flush();
      out.push('<p class="p out' + (p.ln ? ' pln' : '') + '" style="color:' + colors.action +
        (colors.actionFont ? ';font-family:' + colors.actionFont : '') +
        (p.gap > 1 ? ';margin-top:calc(var(--c-pgap) + ' + ((p.gap - 1) * .5) + 'em)' : '') + '">' + nodesToHtml(p.nodes, colors).trim() + '</p>');
    } else {
      buf.push('<p' + paraAttr(p, 'p') + '>' + paraHtml(p, colors, !isQuote) + '</p>');
    }
  });
  flush();
  /* 큰따옴표 템플릿은 마지막 상자 끝에 닫는 따옴표 */
  if (isQuote && lastQ >= 0 && quoteTpl().k === 'quotes') out[lastQ] = out[lastQ].replace(/<\/div>$/, '<span class="qmark close">\u201D</span></div>');
  return '<div class="stack">' + out.join('') + '</div>';
}

/* ---------------- canvas render ---------------- */
function ratioValue(){
  if (state.ratio === 'auto') return null;
  if (state.ratio === 'custom'){
    const w = Number(state.ratioW) || 1, h = Number(state.ratioH) || 1;
    return w / h;
  }
  const [w, h] = state.ratio.split(':').map(Number);
  return w / h;
}
function hexToRgba(hex, a){
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!m) return 'rgba(0,0,0,' + a + ')';
  return 'rgba(' + parseInt(m[1],16) + ',' + parseInt(m[2],16) + ',' + parseInt(m[3],16) + ',' + a + ')';
}
function speakerOf(id){ return state.speakers.find(s => s.id === id) || null; }
/* html2canvas가 가상 요소를 놓칠 수 있어 꼬리는 실제 요소로 넣는다 */
function tailHtml(){
  const bubbly = state.mode === 'bubble' || state.mode === 'mixed';
  return (bubbly && state.bubbleShape === 'tail') ? '<span class="btail"></span>' : '';
}
/* 예전 '배경 없애기' 체크는 0% 로 이어 받는다 (0% = 완전 투명) */
/* 예전 기본값 92%를 새 기본값 100%로 올린다. 일부러 고른 다른 값은 두고 92만 옮긴다 */
function migrateNarrSize(nr){ if (nr && Number(nr.size) === 92) nr.size = 100; return nr; }
/* 화자별 대사 크기. 예전 설정 파일에는 없으므로 100%로 본다 */
function spSize(sp){ return clamp(Number(sp && sp.size) || 100, 60, 160); }
function bubAlpha(sp){
  if (sp.bubbleAlpha != null) return clamp(Number(sp.bubbleAlpha), 0, 100);
  return sp.noBubble ? 0 : 100;
}
function bubbleStyle(sp){
  const a = bubAlpha(sp);
  const clear = a === 0;
  const bg = clear ? 'transparent' : (a >= 100 ? sp.bubble : hexToRgba(sp.bubble, a / 100));
  return 'background:' + bg + ';color:' + sp.text + ';--bub-bg:' + bg + (clear ? ';box-shadow:none' : '');
}

/* HTML 블록 — 작업 파일로 남의 HTML 이 들어올 수 있으므로 스크립트·외부 문서·이벤트 속성은 걷어낸다.
   <style> 은 앱 화면 전체에 번지므로 뺀다. 꾸밈은 style="" 속성으로. */
/* 편집기 목록에는 HTML을 펼치지 않고 한 줄 요약만 둔다 */
function htmlSummary(src){
  const t = String(src || '').trim();
  if (!t) return '(비어 있음 — 수정을 눌러 HTML을 적으세요)';
  const tmp = document.createElement('div');
  tmp.innerHTML = safeHtml(t);
  const text = (tmp.textContent || '').replace(/\s+/g, ' ').trim();
  const lines = t.split('\n').length;
  return (text || '(글자 없는 HTML)') + ' · ' + lines + '줄';
}
let htmlEditId = null;
function openHtmlEdit(id){
  const bk = state.blocks.find(b => b.id === id);
  if (!bk) return;
  htmlEditId = id;
  $('#htmlEdit').value = bk.html || '';
  $('#htmlVeil').classList.add('on');
  setTimeout(() => $('#htmlEdit').focus(), 30);
}
function closeHtmlEdit(apply){
  const bk = htmlEditId && state.blocks.find(b => b.id === htmlEditId);
  if (apply && bk && bk.html !== $('#htmlEdit').value){
    snapshot();
    bk.html = $('#htmlEdit').value;
    renderBlocks(); renderCanvas();
  }
  htmlEditId = null;
  $('#htmlVeil').classList.remove('on');
}
function safeHtml(src){
  const doc = new DOMParser().parseFromString('<div>' + String(src) + '</div>', 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return '';
  root.querySelectorAll('script,style,link,meta,base,iframe,frame,frameset,object,embed,form,input,button,textarea,select,noscript,template').forEach(n => n.remove());
  root.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(a => {
      const n = a.name.toLowerCase(), v = a.value.replace(/[\s\u0000-\u001F]/g, '').toLowerCase();
      if (n.startsWith('on')) el.removeAttribute(a.name);
      else if (/^(href|src|xlink:href|action|formaction|srcset)$/.test(n) && /^(javascript|vbscript|data:text\/html)/.test(v)) el.removeAttribute(a.name);
      else if (n === 'style' && /expression\(|javascript:/.test(v)) el.removeAttribute(a.name);
    });
  });
  return root.innerHTML;
}
/* ---- 인용구 템플릿 ----
   블로그 인용구처럼 장식과 화자 이름 자리를 한 묶음으로 고른다. 글줄(이름: 대사)과 달리 늘 인용 상자 모양이다.
   name: 이름이 놓이는 곳 — below 상자 아래 · inside 상자 안 머리 · tag 테두리에 걸친 이름표 · col 왼쪽 이름 칸 */
const QUOTE_TPLS = [
  {k:'bar',    l:'세로줄',      name:'below',  txt:'dash'},
  {k:'quotes', l:'큰따옴표',    name:'below',  txt:'dash'},
  {k:'lines',  l:'위아래 선',   name:'below',  txt:'caps'},
  {k:'bubble', l:'말풍선',      name:'below',  txt:'plain'},
  {k:'postit', l:'포스트잇',    name:'inside', txt:'plain'},
  {k:'card',   l:'카드',        name:'inside', txt:'plain'},
  {k:'frame',  l:'테두리 상자', name:'tag',    txt:'plain'},
  {k:'script', l:'대본',        name:'col',    txt:'plain'},
];
/* 예전 '인용 장식' 값은 가까운 템플릿으로 */
function quoteTpl(){
  const t = QUOTE_TPLS.find(x => x.k === state.quoteTpl);
  if (t) return t;
  const old = {mark:'quotes'}[state.quoteOrn] || 'bar';
  return QUOTE_TPLS.find(x => x.k === old);
}
function quoteNameHtml(sp, tpl){
  if (state.hideNames || !sp) return '';
  const nm = escHtml(sp.name || '');
  const txt = tpl.txt === 'dash' ? '— ' + nm : nm;
  return '<div class="attrib qn qn-' + tpl.name + '">' + txt + '</div>';
}
function buildRow(bk){
  if (bk.type === 'img'){
    const row = document.createElement('div');
    const al = bk.imgAlign || 'center';
    row.className = 'crow imgrow ia-' + al;
    if (bk.bleedX) row.classList.add('bleed-x');
    if (bk.bleedT) row.dataset.bleedt = '1';
    if (bk.bleedB) row.dataset.bleedb = '1';
    if (!bk.image){
      row.classList.add('imgempty');
      row.textContent = '이미지를 넣어 주세요';
      return row;
    }
    const im = document.createElement('img');
    if (isSideAlign(al)){
      /* 페이지 한쪽 세로 전체를 차지하는 그림 — 자리 잡기는 renderCanvas가 한다 */
      row.className = 'crow imgrow';
      row.dataset.side = al === 'sideL' ? 'l' : 'r';
      row.dataset.sidew = sideWOf(bk);
      im.className = 'cimg';
      /* 원형 자르기·가장자리 흐림은 세운 그림에 맞지 않으므로 잘라낸 원본을 쓴다 */
      im.src = bk.imgCropped || bk.imgOrig || bk.image;
      im.style.opacity = (bk.imgOp == null ? 100 : bk.imgOp) / 100;
      row.appendChild(im);
      return row;
    }
    im.className = 'cimg ish-' + (bk.imgShape || 'round');
    im.src = bk.image;
    im.style.width = (bk.imgW == null ? 100 : bk.imgW) + '%';
    im.style.opacity = (bk.imgOp == null ? 100 : bk.imgOp) / 100;
    row.appendChild(im);
    return row;
  }
  if (bk.type === 'html'){
    const row = document.createElement('div');
    row.className = 'crow htmlrow';
    row.innerHTML = safeHtml(bk.html || '');
    return row;
  }
  if (bk.type === 'pb'){
    const el = document.createElement('div');
    el.className = 'pbreak';
    el.dataset.pb = '1';
    return el;
  }
  if (bk.type === 'rule'){
    const b = normRule(bk);
    const el = document.createElement('div');
    el.className = 'cdiv';
    el.style.color = b.color;
    el.style.width = b.width + '%';
    const ln = b.line === 'none' ? ''
      : '<span class="ln" style="border-top-color:' + b.color + ';border-top-style:' + b.line +
        ';border-top-width:' + b.thick + 'px"></span>';
    const sym = b.sym ? '<span class="sym" style="font-size:' + (b.symSize / 100) + 'em">' + escHtml(b.sym) + '</span>' : '';
    el.innerHTML = sym ? (ln + sym + ln) : (ln || '<span class="sym">&nbsp;</span>');
    return el;
  }

  const sp = speakerOf(bk.speakerId);
  const row = document.createElement('div');
  const colors = {
    fx: xrConf(sp),
    action: sp ? sp.action : '#8A8296',
    actionFont: bk.font || (sp ? sp.actionFont : (state.narrator || {}).actionFont) || '',
    mark: state.markColor || '#FDE68A'
  };
  const imgHtml = '';

  if (bk.align) row.style.textAlign = bk.align;
  const rowFont = bk.font || (sp ? sp.font : (state.narrator || {}).font) || '';
  if (rowFont) row.style.fontFamily = rowFont;
  /* 바탕 상자는 프로필까지 감싸면 띠처럼 보인다 — 글이 담긴 칸에만 입힌다 */
  const paintBox = () => {
    if (!bk.box) return;
    row.classList.add('hasbox');
    if (bk.boxEdge !== 'none') row.classList.add('bx-around');
    const op = (bk.boxOpacity == null ? 100 : bk.boxOpacity) / 100;
    row.style.setProperty('--box-bg', hexToRgba(bk.boxColor || '#F1EFEA', op));
    row.style.setProperty('--box-line', bk.boxLine || '#B9B2A6');
    row.style.setProperty('--box-pad', ((bk.boxPad == null ? 70 : bk.boxPad) / 100) + 'em');
    row.style.setProperty('--box-rad', ((bk.boxRadius == null ? 40 : bk.boxRadius) / 100) + 'em');
  };

  if (!sp){
    const nr = state.narrator || {};
    row.className = 'crow narr ' + (nr.italic ? 'yi' : 'ni') + (bk.image && bk.imgAlign === 'full' ? ' imgfull' : '');
    paintBox();
    const nal = bk.align || nr.align || 'center';
    row.style.textAlign = nal;
    /* 왼쪽·오른쪽으로 맞추면 화자 말풍선과 시작점이 같아야 한다 */
    row.style.setProperty('align-self', nal === 'right' ? 'flex-end' : nal === 'center' ? 'center' : 'flex-start', 'important');
    row.style.setProperty('max-width', nal === 'center' ? '88%' : '100%', 'important');
    row.style.color = nr.text || '#5B5952';
    row.style.fontSize = ((Number(nr.size) || 100) / 100) + 'em';
    const inner = paragraphsHtml(applyBrackets(bk.text, xRulesFor(null)),
      {action: nr.action || '#8A887F', mark: colors.mark, fx: xrConf(null)}, '', false, true) + imgHtml;
    row.innerHTML = nr.noBubble
      ? inner
      : '<div class="bubble" style="background:' + nr.bubble + ';color:' + (nr.text || '#5B5952') + ';--bub-bg:' + nr.bubble + '">' + inner + '</div>';
    return row;
  }

  const side = ['left','center','right','wide'].indexOf(sp.align) >= 0 ? sp.align : 'left';
  row.className = 'crow ' + side + (bk.image && bk.imgAlign === 'full' ? ' imgfull' : '');
  row.style.fontSize = (spSize(sp) / 100) + 'em';
  paintBox();
  const nameColor = sp.nameColor || sp.text;
  const sep = state.nameSep || '';
  const inlineName = (state.mode !== 'line' || state.hideNames)
    ? ''
    : '<span class="inline-name" style="color:' + nameColor + '">' + escHtml(sp.name || '') + escHtml(sep) + '</span>';

  const nameInBox = (state.bubbleShape === 'panel' && !state.hideNames && (state.mode === 'bubble' || state.mode === 'mixed'))
    ? '<div class="cname inbox" style="color:' + (sp.nameColor || sp.text) + '">' + escHtml(sp.name || '') + '</div>'
    : '';
  const text = applyBrackets(bk.text, xRulesFor(sp));
  const bodyHtml = (state.mode === 'mixed' ? groupHtml(text, colors, sp, 'bubble', nameInBox)
      : state.mode === 'quote' ? groupHtml(text, colors, sp, 'quote', /^(inside|tag)$/.test(quoteTpl().name) ? quoteNameHtml(sp, quoteTpl()) : '')
      : nameInBox + paragraphsHtml(text, colors, inlineName)) + imgHtml;
  const avSize = ((Number(sp.avatarSize) || 100) / 100 * 2.3).toFixed(2);
  const AV_R = {circle:'99px', round:'.45em', soft:'.9em', square:'0'};
  const avatar = sp.avatar
    ? '<div class="cav" style="background-image:url(' + escAttr(sp.avatar) +
      ');width:' + avSize + 'em;height:' + avSize + 'em;border-radius:' + (AV_R[sp.avatarShape] || '99px') + '"></div>'
    : '<div class="cav" style="background:' + hexToRgba(sp.bubble, .9) + ';color:' + sp.text + '">' + escHtml((sp.name || '?').slice(0,1)) + '</div>';

  /* 대사창 모양에서는 화자 이름이 말풍선 밖이 아니라 안에 들어간다 */
  const panelBox = state.bubbleShape === 'panel' && (state.mode === 'bubble' || state.mode === 'mixed');
  const showName = (state.mode === 'bubble' || state.mode === 'mixed') && !panelBox;
  if (state.mode === 'quote'){
    const tpl = quoteTpl();
    row.className += ' qt-' + tpl.k;
    row.style.setProperty('--qc', nameColor);
    const attrib = tpl.name === 'below' || tpl.name === 'col' ? quoteNameHtml(sp, tpl) : '';
    row.innerHTML = '<div class="cbody-col">' + (tpl.name === 'col' ? attrib + bodyHtml : bodyHtml + attrib) + '</div>';
    return row;
  }
  row.innerHTML =
    (state.mode === 'bubble' && sp.avatar ? avatar : '') +
    '<div class="cbody-col">' +
      (showName ? '<div class="cname" style="color:' + (sp.nameColor || sp.text) + '">' + escHtml(sp.name || '') + '</div>' : '') +
      (state.mode === 'mixed' ? bodyHtml
        : '<div class="bubble" style="' + bubbleStyle(sp) + '">' + bodyHtml + tailHtml() + '</div>') +
    '</div>';
  return row;
}

function luma(hex){
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!m) return 1;
  const [r, g, b] = [1,2,3].map(i => parseInt(m[i], 16) / 255);
  return .2126 * r + .7152 * g + .0722 * b;
}
const FRAME_ELS = {
  browser:[['tabs','탭 줄',true],['nav','앞뒤 화살표',true]],
  terminal:[['dots','신호등',true],['prompt','하단 프롬프트',true]],
  monitor:[['stand','받침대',true],['led','전원 램프',true],['leg','모니터 다리',true]],
  phone:[['bezel','바깥 테두리',true],['notch','노치',true],['sig','신호·배터리',true],['home','홈 바',true]],
  chat:[['back','뒤로가기',true],['avatar','프로필 동그라미',true],['status','상태 문구',true],['input','하단 입력창',true]],
  player:[['art','앨범아트',true],['prog','재생바',true],['time','재생 시간',true],['ctrl','조작 버튼',true]],
  vn:[['panel','대사 패널',true],['name','이름표',true],['menu','메뉴 버튼',true],['next','진행 표시',true],['chapter','상단 챕터',false],['choices','선택지 창',false]],
  rpg:[['corner','모서리 장식',true],['name','이름표',true],['next','진행 표시',true]],
  hud:[['hp','체력·마나 바',true],['keys','조작 힌트',true],['corner','모서리 장식',true]],
  letter:[['inner','이중 테두리',true],['head','머리글',true]],
  magazine:[['mast','제호',true],['foot','아래 줄',true]],
  polaroid:[['caption','손글씨 캡션',true]],
  print:[['marks','모서리 재단선',true],['edge','종이 가장자리 선',true],['head','머리말',false]],
  spread:[['gutter','가운데 제본선',true],['marks','모서리 재단선',true],['head','머리말',false]],
  calendar:[['rings','상단 고리',true],['photo','사진 칸',true],['date','날짜 줄',true],['foot','아래 줄',true]],
  film:[['holes','위·아래 구멍 줄',true],['label','필름 라벨 줄',true]],
  ticket:[['stub','위 절취선',true],['barcode','바코드',true],['info','아래 정보 줄',true]],
  receipt:[['head','상단 상호',true],['items','항목 목록',true],['total','합계',true],['barcode','바코드',true]]
};
/* 테두리 종류 안의 세부 모양 */
const FRAME_VARIANTS = {
  browser:[['mac','맥 스타일'],['safari','사파리'],['windows','윈도우 창']],
  ticket:[['basic','기본 · 세로 절취권'],['movie','영화표 · 세로'],['flight','탑승권 · 가로 스텁'],['concert','공연 · 컬러 헤더']]
};
/* 테두리에 들어가는 글자·이미지 — 전부 직접 고칠 수 있다 */
const FRAME_FIELDS = {
  browser:[{k:'url', l:'주소창 글자', ph:'about:blank'}],
  terminal:[{k:'prompt', l:'프롬프트 기호', ph:'$'}],
  monitor:[],
  phone:[{k:'batt', l:'배터리 문구', ph:'82%'}],
  chat:[{k:'status', l:'상태 문구', ph:'접속 중'}, {k:'input', l:'입력창 문구', ph:'메시지 입력'},
        {k:'ava', l:'프로필 이미지', type:'image'}],
  player:[{k:'artist', l:'아티스트', ph:'Unknown Artist'}, {k:'now', l:'지난 시간', ph:'1:18'},
          {k:'total', l:'전체 시간', ph:'3:24'}, {k:'prog', l:'재생바 진행 (%)', ph:'38'},
          {k:'art', l:'앨범아트 이미지', type:'image'}],
  vn:[{k:'chapter', l:'상단 챕터 문구', ph:'CHAPTER 01'},
      {k:'menu', l:'메뉴 버튼 (쉼표로 구분)', ph:'SAVE, LOAD, AUTO, SKIP, LOG'},
      {k:'panelDim', l:'대사 창 진하기 (%)', ph:'22'}],
  rpg:[],
  hud:[{k:'hp', l:'첫째 스탯 (%)', ph:'74'}, {k:'hpc', l:'첫째 스탯 색', type:'color', ph:'#E24B4B'},
       {k:'mp', l:'둘째 스탯 (%)', ph:'46'}, {k:'mpc', l:'둘째 스탯 색', type:'color', ph:'#3E7BFA'},
       {k:'keys', l:'조작 힌트', ph:'◉ 확인　✕ 취소　▤ 메뉴'}],
  letter:[],
  magazine:[{k:'left', l:'아래 왼쪽', ph:'ISSUE 01'}, {k:'right', l:'아래 오른쪽', ph:'2026'}],
  polaroid:[{k:'cap', l:'손글씨 캡션 (여러 줄)', type:'area', ph:'2026. 8. 1.\n그날의 기록'}],
  print:[{k:'head', l:'머리말', ph:''}],
  spread:[{k:'headL', l:'왼쪽 면 머리말', ph:''}, {k:'headR', l:'오른쪽 면 머리말', ph:''}],
  calendar:[{k:'day', l:'날짜 (숫자)', ph:'1'}, {k:'month', l:'달', ph:'8월'}, {k:'year', l:'연도', ph:'2026'},
            {k:'wd', l:'요일', ph:'토요일'}, {k:'foot', l:'아래 문구', ph:'오늘의 기록'},
            {k:'photo', l:'사진', type:'image'}],
  film:[{k:'label', l:'필름 라벨', ph:'FUJICOLOR 400'}, {k:'no', l:'컷 번호', ph:'24A'}],
  'ticket:basic':[{k:'no', l:'번호', ph:'No. 001'}, {k:'info1', l:'아래 왼쪽', ph:'ADMIT ONE'}, {k:'info2', l:'아래 오른쪽', ph:'ALL AGES'}],
  'ticket:movie':[{k:'sub1', l:'상영관', ph:'CINEMA 3관'}, {k:'sub2', l:'좌석', ph:'H-12'},
                  {k:'info1', l:'아래 왼쪽', ph:'2026.07.31  19:30'}, {k:'info2', l:'아래 오른쪽', ph:'2D · 자막'}],
  'ticket:flight':[{k:'from', l:'출발', ph:'ICN'}, {k:'to', l:'도착', ph:'HND'},
                   {k:'sub1', l:'스텁 위 (게이트)', ph:'GATE 24'}, {k:'sub2', l:'스텁 가운데 (좌석)', ph:'12A'},
                   {k:'info1', l:'스텁 아래', ph:'BOARDING 18:40'}],
  'ticket:concert':[{k:'sub1', l:'장소', ph:'OLYMPIC HALL'}, {k:'sub2', l:'구역', ph:'STANDING A'},
                    {k:'info1', l:'아래 왼쪽', ph:'2026.08.15  18:00'}, {k:'info2', l:'아래 오른쪽', ph:'1 PERSON'}],
  receipt:[{k:'sub', l:'상호 아래 줄', ph:'2026-07-31  14:20'},
           {k:'items', l:'항목 (한 줄에 「이름 | 금액」)', type:'area', ph:'아메리카노 | 4,500\n치즈케이크 | 6,000'},
           {k:'total', l:'합계', ph:'10,500'}, {k:'foot', l:'맺음말', ph:'THANK YOU'}]
};
function fvar(){
  const list = FRAME_VARIANTS[state.frame];
  if (!list) return '';
  const v = (state.frameVar || {})[state.frame];
  return list.some(x => x[0] === v) ? v : list[0][0];
}
function fieldsFor(){
  const v = fvar();
  return FRAME_FIELDS[state.frame + ':' + v] || FRAME_FIELDS[state.frame] || [];
}
function ftx(k, d){
  const v = (state.frameText || {})[state.frame + '.' + k];
  return (v === undefined || v === '') ? (d === undefined ? '' : d) : v;
}
function fim(k){ return (state.frameImg || {})[state.frame + '.' + k] || ''; }
function elOn(key){
  const list = FRAME_ELS[state.frame] || [];
  const found = list.find(x => x[0] === key);
  const def = found ? found[2] : true;
  const v = state.frameEls ? state.frameEls[state.frame + '.' + key] : undefined;
  return v === undefined ? def : !!v;
}
const BARCODE = '31213112331211321213311231122313'.split('')
  .map(n => '<i style="width:' + n + 'px"></i>').join('');

function frameParts(){
  const f = state.frame;
  if (!f || f === 'none') return null;
  const c = state.frameColor || '#E9E7EC';
  const title = escHtml(state.frameTitle || '');
  const ink = luma(c) > .58 ? '#1B1B20' : '#F5F3F8';
  const soft = hexToRgba(ink, .6);
  const line = hexToRgba(ink, .16);
  const T = (k, d) => escHtml(ftx(k, d));
  const v = fvar();

  if (f === 'custom'){
    const html = String(state.frameHtml || '').replace(/<script[\s\S]*?<\/script>/gi, '');
    if (!html.trim()) return null;
    const n = k => Math.max(0, Number(ftx(k, '0')) || 0);
    return {
      overlay:'<div class="fcustom">' + html + '</div>',
      below: !state.frameOnTop,
      pad:{t:n('insT'), b:n('insB'), x:n('insX')}
    };
  }

  if (f === 'browser'){
    const url = T('url', 'about:blank');
    const tabBg = state.bgKind === 'solid' ? state.bgColor : '#FFFFFF';
    const tabInk = luma(tabBg) > .58 ? '#1B1B20' : '#F5F3F8';
    const dots = '<span class="fdots"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i></span>';
    if (v === 'windows') return {
      top:'<div class="fchrome" style="background:' + c + ';color:' + ink + ';border-bottom:1px solid ' + line + '">' +
        (elOn('tabs') ? '<div class="ftabs win">' +
          '<span class="ftab win" style="background:' + tabBg + ';color:' + tabInk + '">' + (title || '발췌') + '</span>' +
          '<span class="ftab win ghost" style="background:' + hexToRgba(ink,.08) + ';color:' + soft + '">＋</span>' +
          '<span class="fwinbtn" style="color:' + soft + '"><i>─</i><i>▢</i><i>✕</i></span></div>' : '') +
        '<div class="fbar win" style="padding:.5em .8em">' +
          (elOn('nav') ? '<span class="fnav" style="color:' + soft + '">←　→　⟳</span>' : '') +
          '<span class="fpill sq" style="background:' + hexToRgba(ink,.09) + ';color:' + soft + '">' + url + '</span>' +
          '<span class="fico" style="color:' + soft + '">⋯</span></div></div>'
    };
    if (v === 'safari') return {
      top:'<div class="fchrome" style="background:' + c + ';color:' + ink + ';border-bottom:1px solid ' + line + '">' +
        '<div class="fbar safari">' + dots +
          (elOn('nav') ? '<span class="fnav" style="color:' + soft + '">‹ ›</span>' : '') +
          '<span class="fpill safari" style="background:' + hexToRgba(ink,.09) + ';color:' + soft + '">' + url + '</span>' +
          '<span class="fico" style="color:' + soft + '">↑　＋　⧉</span></div></div>'
    };
    return {
      top:'<div class="fchrome" style="background:' + c + ';color:' + ink + ';border-bottom:1px solid ' + line + '">' +
        (elOn('tabs') ? '<div class="ftabs">' +
          '<span class="ftab" style="background:' + tabBg + ';color:' + tabInk + '">' + (title || '발췌') + '</span>' +
          '<span class="ftab ghost" style="background:' + hexToRgba(ink,.1) + ';color:' + soft + '">＋</span></div>' : '') +
        '<div class="fbar" style="padding:.55em .8em">' + dots +
          (elOn('nav') ? '<span class="fnav" style="color:' + soft + '">‹　›　⟳</span>' : '') +
          '<span class="fpill" style="background:' + hexToRgba(ink,.09) + ';color:' + soft + '">' + url + '</span>' +
          '<span class="fico" style="color:' + soft + '">⋯</span></div></div>'
    };
  }

  if (f === 'terminal') return {
    top:'<div class="fbar term" style="background:' + c + ';color:' + ink + ';border-bottom:1px solid ' + line + '">' +
      (elOn('dots') ? '<span class="fdots"><i style="background:' + hexToRgba(ink,.3) + '"></i><i style="background:' + hexToRgba(ink,.3) + '"></i><i style="background:' + hexToRgba(ink,.3) + '"></i></span>' : '') +
      '<span class="fmono" style="color:' + soft + '">' + (title || '~/chat — zsh') + '</span></div>',
    bottom: elOn('prompt')
      ? '<div class="fprompt" style="background:' + c + ';color:' + soft + ';border-top:1px solid ' + line + '">' +
        T('prompt', '$') + '<span class="cur" style="background:' + soft + '"></span></div>' : ''
  };

  if (f === 'monitor'){
    /* 베젤은 대사 영역을 감싸는 테두리로 두고, 받침대와 다리는 그 아래에 덧붙인다 */
    const rr = Math.max(0, (Number(state.canvasRadius) || 0) - 2);
    const hasChin = elOn('stand');
    return {
      clearBg:true,
      body:'border:13px solid ' + c + (hasChin ? ';border-bottom:0' : '') +
        ';border-radius:' + rr + 'px ' + rr + 'px ' + (hasChin ? '0 0' : rr + 'px ' + rr + 'px'),
      bottom:
        (hasChin ? '<div class="fstand" style="background:' + c + ';color:' + ink + '">' +
          (elOn('led') ? '<i style="background:#7CE0A3"></i>' : '') + '<span>' + title + '</span></div>' : '') +
        (elOn('leg') ? '<div class="fmon-leg"><i class="neck" style="border-bottom-color:' + c + '"></i>' +
          '<i class="foot" style="background:' + c + '"></i><i class="shade"></i></div>' : ''),
      pad:[10, 10]
    };
  }

  if (f === 'phone'){
    const bez = elOn('bezel');
    return {
    top:'<div class="fstatus' + (bez ? ' inbez' : '') + '" style="color:' + c + '"><span>' + (title || '9:41') + '</span>' +
      (elOn('notch') ? '<span class="fnotch" style="background:' + c + '"></span>' : '') +
      (elOn('sig') ? '<span class="fsig">' +
        (ftx('batt', '') ? '<span class="fbatt">' + T('batt', '') + '</span>' : '') +
        '<i class="s1"></i><i class="s2"></i><i class="s3"></i><i class="s4"></i>' +
        '<span class="fbat"><i></i></span></span>' : '<span>' + T('batt', '') + '</span>') + '</div>',
    bottom: elOn('home') ? '<div class="fhome' + (bez ? ' inbez' : '') + '"><i style="background:' + hexToRgba(c,.75) + '"></i></div>' : '',
    overlay: bez ? '<div class="fph-bezel" style="border-color:' + c + '"></div>' : '',
    pad: bez ? [12, 12] : null
    };
  }

  if (f === 'chat'){
    const ava = fim('ava');
    return {
      top:'<div class="fbar chat" style="background:' + c + ';color:' + ink + ';border-bottom:1px solid ' + line + '">' +
        (elOn('back') ? '<span class="fback">‹</span>' : '') +
        (elOn('avatar') ? '<span class="favatar" style="' + (ava ? 'background:url(' + escAttr(ava) + ') center/cover' : 'background:' + hexToRgba(ink,.14)) + '"></span>' : '') +
        '<span class="fmeta"><span class="ftitle">' + (title || '대화') + '</span>' +
        (elOn('status') ? '<span class="fstat">' + T('status', '접속 중') + '</span>' : '') + '</span>' +
        '<span class="fico" style="color:' + soft + '">⋮</span></div>',
      bottom: elOn('input')
        ? '<div class="finput" style="background:' + c + ';border-top:1px solid ' + line + '">' +
          '<span class="fplus">＋</span>' +
          '<span class="fbox" style="background:' + hexToRgba(ink,.09) + ';color:' + soft + '">' + T('input', '메시지 입력') + '</span>' +
          '<span class="fsend" style="background:' + hexToRgba(ink,.16) + ';color:' + ink + '">↑</span></div>' : ''
    };
  }

  if (f === 'player'){
    const art = fim('art');
    return {
      top:'<div class="fplay-t" style="color:' + c + '">' +
        (elOn('art') ? '<span class="fart" style="' + (art ? 'background:url(' + escAttr(art) + ') center/cover' : 'background:' + hexToRgba(c,.16) + ';color:' + hexToRgba(c,.75)) + '">' + (art ? '' : '♪') + '</span>' : '') +
        '<span class="fmeta"><span class="eyebrow2">' + T('artist', 'NOW PLAYING') + '</span>' +
        '<span class="ftitle2">' + (title || '이름 없는 트랙') + '</span></span></div>',
      bottom:'<div class="fplay-b" style="color:' + c + '">' +
        (elOn('prog') ? '<div class="fprog" style="background:' + hexToRgba(c,.2) + '"><i style="background:' + c +
          ';width:' + clamp(Number(ftx('prog', '38')) || 0, 0, 100) + '%"></i></div>' : '') +
        (elOn('time') ? '<div class="ftime"><span>' + T('now', '1:18') + '</span><span>' + T('total', '3:24') + '</span></div>' : '') +
        /* 재생 단추는 글자 기호(◀ ▶)가 기기마다 이모지로 바뀌므로 도형으로 그린다 */
        (elOn('ctrl') ? '<div class="fctrl">' +
          '<span class="ic prev"><i class="bar"></i><i class="tri l"></i><i class="tri l"></i></span>' +
          '<span class="big" style="background:' + hexToRgba(c,.16) + '"><i class="tri r"></i></span>' +
          '<span class="ic next"><i class="tri r"></i><i class="tri r"></i><i class="bar"></i></span></div>' : '') +
        '</div>'
    };
  }

  if (f === 'vn'){
    const menuTxt = ftx('menu', 'SAVE, LOAD, AUTO, SKIP, LOG').split(',').map(x => x.trim()).filter(Boolean);
    const menu = elOn('menu')
      ? '<span class="fvn-menu">' + menuTxt.map(t => '<span style="border-color:' + hexToRgba(c,.5) + '">' + escHtml(t) + '</span>').join('') + '</span>'
      : '<span></span>';
    const chapter = elOn('chapter') ? '<span class="fvn-ch">' + T('chapter', 'CHAPTER 01') + '</span>' : '<span></span>';
    const choices = elOn('choices')
      ? '<div class="fvn-ch-box" style="color:' + c + '">' +
        String(state.frameChoiceText || '').split('\n').map(t => t.trim()).filter(Boolean).slice(0, 4)
          .map(t => '<span style="border-color:' + hexToRgba(c,.55) + ';background:' + hexToRgba(c,.14) + '">' + escHtml(t) + '</span>').join('') +
        '</div>' : '';
    const dim = clamp(Number(ftx('panelDim', '22')) || 22, 0, 100) / 100;
    return {
      top:'<div class="fvn-top" style="color:' + c + '">' + chapter + menu + '</div>' +
        (elOn('name') && title ? '<div class="fvn-n" style="background:' + c + ';color:' + ink + '">' + title + '</div>' : ''),
      bottom: choices + (elOn('next') ? '<div class="fvn-x" style="color:' + c + '">▼</div>' : ''),
      pad:[10, 16],
      body: elOn('panel')
        ? 'background:' + hexToRgba(c, dim) + ';border:1px solid ' + hexToRgba(c, .45) +
          ';border-radius:.5em;margin:0 1.1em .5em;overflow:hidden' : ''
    };
  }

  if (f === 'rpg') return {
    top: elOn('name') && title ? '<div class="frpg-n" style="background:' + c + ';color:' + ink + '">' + title + '</div>' : '',
    bottom: elOn('next') ? '<div class="frpg-x" style="color:' + c + '">▼</div>' : '',
    overlay:'<div class="frpg" style="border-color:' + c + ';color:' + c + '">' +
      (elOn('corner') ? '<i class="d1">◆</i><i class="d2">◆</i><i class="d3">◆</i><i class="d4">◆</i>' : '') + '</div>',
    pad:[14, 16]
  };

  if (f === 'hud'){
    const hp = clamp(Number(ftx('hp', '74')) || 0, 0, 100);
    const mp = clamp(Number(ftx('mp', '46')) || 0, 0, 100);
    return {
      top:'<div class="fhud-t" style="color:' + c + '"><span class="hudname">' + (title || 'PLAYER') + '</span>' +
        (elOn('hp') ? '<span class="hudbars">' +
          '<span class="hudbar"><i style="background:' + ftx('hpc', '#E24B4B') + ';width:' + hp + '%"></i></span>' +
          '<span class="hudbar"><i style="background:' + ftx('mpc', '#3E7BFA') + ';width:' + mp + '%"></i></span>' +
        '</span>' : '') + '</div>',
      bottom: elOn('keys') ? '<div class="fhud-b" style="color:' + c + '">' + T('keys', '◉ 확인　✕ 취소　▤ 메뉴') + '</div>' : '',
      overlay:'<div class="fgame" style="border-color:' + hexToRgba(c,.4) + ';color:' + c + '">' +
        (elOn('corner') ? '<i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i>' : '') + '</div>',
      pad:[14, 16]
    };
  }

  if (f === 'letter') return {
    top: elOn('head') && title ? '<div class="fletter-t" style="color:' + c + '">❦ ' + title + ' ❦</div>' : '',
    overlay: elOn('inner') ? '<div class="fletter" style="border-color:' + c + '"><i style="border-color:' + c + '"></i></div>' : '',
    pad: elOn('inner') ? [18, 20] : null
  };

  if (f === 'magazine') return {
    top: elOn('mast') ? '<div class="fmag" style="color:' + c + ';border-color:' + c + '">' + (title || 'ARCHIVE') + '</div>' : '',
    bottom: elOn('foot') ? '<div class="fmag-b" style="color:' + c + ';border-color:' + c + '">' +
      '<span>' + T('left', 'ISSUE 01') + '</span><span>' + T('right', '2026') + '</span></div>' : ''
  };

  if (f === 'print' || f === 'spread'){
    const two = f === 'spread';
    const soft2 = hexToRgba(c, .5);
    const marks = elOn('marks')
      ? '<div class="fpr-marks" style="color:' + soft2 + '">' +
        '<i class="m1"></i><i class="m2"></i><i class="m3"></i><i class="m4"></i></div>' : '';
    const edge = (!two && elOn('edge'))
      ? '<div class="fpr-edge" style="border-color:' + hexToRgba(c, .28) + '"></div>' : '';
    const gutter = (two && elOn('gutter'))
      ? '<div class="fpr-gut"><i class="ln" style="background:' + hexToRgba(c, .25) + '"></i></div>' : '';
    const headTxt = two
      ? '<div class="fpr-head two" style="color:' + hexToRgba(c, .55) + '"><span>' + T('headL', '') + '</span>' +
        '<span>' + T('headR', '') + '</span></div>'
      : '<div class="fpr-head" style="color:' + hexToRgba(c, .55) + '">' + T('head', '') + '</div>';
    return {
      top: elOn('head') ? headTxt : '',
      overlay: marks + edge + gutter,
      cols: two ? 2 : 0,
      pad:[6, 8]
    };
  }

  if (f === 'calendar'){
    const photo = fim('photo');
    const dash = hexToRgba(c, .3);
    const rings = elOn('rings')
      ? '<div class="fcal-rings">' +
        '<i style="border-color:' + c + '"></i><i style="border-color:' + c + '"></i><i style="border-color:' + c + '"></i>' +
        '</div>' : '';
    const photoBox = elOn('photo')
      ? '<div class="fcal-photo" style="' +
        (photo ? 'background-image:url(' + escAttr(photo) + ')' : 'background:' + hexToRgba(c,.1) + ';color:' + hexToRgba(c,.55)) + '">' +
        (photo ? '' : '<span>사진을 넣어 보세요</span>') + '</div>' : '';
    const date = elOn('date')
      ? '<div class="fcal-date" style="color:' + c + ';border-color:' + dash + '">' +
        '<span class="fcal-my"><b>' + T('month', '8월') + '</b><small>' + T('year', '2026') + '</small></span>' +
        '<span class="fcal-day">' + T('day', '1') + '</span>' +
        '<span class="fcal-wd">' + T('wd', '토요일') + '</span>' +
        '</div>' : '';
    return {
      top: rings + photoBox + date,
      bottom: elOn('foot')
        ? '<div class="fcal-foot" style="color:' + c + ';border-color:' + dash + '">' + T('foot', '오늘의 기록') + '</div>' : '',
      pad:[6, 8]
    };
  }

  if (f === 'film'){
    const strip = '<div class="ffilm" style="background-color:' + c + '"></div>';
    return {
      top: elOn('holes') ? strip : '',
      bottom: (elOn('holes') ? strip : '') +
        (elOn('label') ? '<div class="ffilm-cap" style="color:' + c + '"><span>' + T('label', 'FUJICOLOR 400') +
          '</span><span>\u25B8 ' + T('no', '24A') + '</span></div>' : '')
    };
  }

  if (f === 'polaroid') return {
    top:'<div class="fpola-t" style="background:' + c + '"></div>',
    bottom:'<div class="fpola-b" style="background:' + c + ';color:' + ink + '">' +
      (elOn('caption') && ftx('cap', '')
        ? '<span>' + escHtml(ftx('cap', '')).replace(/\n/g, '<br>') + '</span>' : '') + '</div>',
    overlay:'<div class="fpola" style="border-color:' + c + '"></div>'
  };

  if (f === 'ticket'){
    const dash = hexToRgba(c, .55);
    const bars = elOn('barcode') ? '<span class="bars">' + BARCODE + '</span>' : '';
    const info = elOn('info')
      ? '<div class="ftk-info"><span>' + T('info1', '') + '</span><span>' + T('info2', '') + '</span></div>' : '';

    /* 가로형 — 오른쪽에 뜯는 스텁이 붙고 본문은 그만큼 좁아진다 */
    if (v === 'flight') return {
      top: elOn('stub') ? '<div class="ftk-air" style="color:' + c + ';border-color:' + dash + '">' +
        '<span class="ftk-air-t">' + (title || 'BOARDING PASS') + '</span>' +
        '<span class="ftk-route"><i class="rline" style="background:' + hexToRgba(c,.35) + '"></i>' +
        '<b>' + T('from', 'ICN') + '</b><i class="rplane">\u2708</i><b>' + T('to', 'HND') + '</b>' +
        '<i class="rline" style="background:' + hexToRgba(c,.35) + '"></i></span></div>' : '',
      overlay:'<div class="ftk-stub" style="color:' + c + ';border-color:' + dash + ';background:' + hexToRgba(c,.05) + '">' +
        '<span>' + T('sub1', 'GATE 24') + '</span><span class="big">' + T('sub2', '12A') + '</span>' +
        (elOn('barcode') ? '<span class="bars sm">' + BARCODE + '</span>' : '') +
        '<span>' + T('info1', 'BOARDING 18:40') + '</span></div>',
      body:'margin-right:26%',
      pad:[6, 10]
    };

    /* 컬러 헤더가 통째로 깔린 공연 티켓 */
    if (v === 'concert') return {
      top: elOn('stub') ? '<div class="ftk-band" style="background:' + c +
        ';background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.06) 0 .6em,transparent .6em 1.2em);color:' + ink + '">' +
        '<span class="ftk-eyebrow">LIVE TICKET</span>' +
        '<span>' + (title || 'LIVE') + '</span>' +
        '<span class="ftk-sub2">' + T('sub1', 'OLYMPIC HALL') + ' · ' + T('sub2', 'STANDING A') + '</span></div>' : '',
      bottom:'<div class="ftk-b" style="color:' + c + ';border-color:' + dash + '">' + info + bars + '</div>',
      pad:[4, 8]
    };

    /* 위쪽이 크게 뜯기는 영화표 */
    if (v === 'movie') return {
      top: elOn('stub') ? '<div class="ftk-mv" style="color:' + c + ';border-color:' + dash + '">' +
        '<span class="mvholes" style="background-image:repeating-linear-gradient(90deg,transparent 0 .5em,' + hexToRgba(c,.4) + ' .5em 1.05em,transparent 1.05em 1.55em)"></span>' +
        '<span class="ftk-mv-k">TICKET</span>' +
        '<span class="ftk-mv-t">' + (title || 'CINEMA') + '</span>' +
        '<span class="ftk-mv-s"><span>' + T('sub1', 'CINEMA 3관') + '</span><span>' + T('sub2', 'H-12') + '</span></span>' +
        '<i class="fcut" style="color:' + c + '">\u2702</i></div>' : '',
      bottom:'<div class="ftk-b" style="color:' + c + ';border-color:' + dash + '">' + info + bars + '</div>',
      pad:[4, 8]
    };

    return {
      top: elOn('stub') ? '<div class="ftk-t" style="color:' + c + ';border-color:' + dash + ';border-top:3px solid ' + c + '">' +
        '<span class="tkstar">\u2605</span><span style="flex:1;text-align:left;padding-left:.6em">' + (title || 'ADMIT ONE') + '</span>' +
        '<span class="ftk-no">' + T('no', 'No. 001') + '</span><span class="tkstar">\u2605</span>' +
        '<i class="fcut" style="color:' + c + '">\u2702</i></div>' : '',
      bottom:'<div class="ftk-b" style="color:' + c + ';border-color:' + dash + ';border-bottom:3px solid ' + c + '">' + info + bars + '</div>',
      pad:[4, 8]
    };
  }

  if (f === 'receipt'){
    const dash = hexToRgba(c, .5);
    const rows = String(ftx('items', '아메리카노 | 4,500\n치즈케이크 | 6,000')).split('\n')
      .map(x => x.trim()).filter(Boolean).slice(0, 8)
      .map(x => {
        const p = x.split('|');
        return '<div class="rc"><span>' + escHtml((p[0] || '').trim()) + '</span><span>' + escHtml((p[1] || '').trim()) + '</span></div>';
      }).join('');
    return {
      top: elOn('head')
        ? '<div class="frc-t" style="color:' + c + ';border-color:' + dash + '">' + (title || 'CAFE MOMENT') +
          '<small>' + T('sub', '2026-07-31  14:20') + '</small></div>' : '',
      bottom:'<div class="frc-b" style="color:' + c + ';border-color:' + dash + '">' +
        (elOn('items') ? rows : '') +
        (elOn('total') ? '<div class="rc sum" style="border-color:' + dash + '"><span>합계</span><span>' + T('total', '10,500') + '</span></div>' : '') +
        '<div class="rcfoot">' + T('foot', 'THANK YOU') + '</div>' +
        (elOn('barcode') ? '<span class="bars" style="margin-top:.5em">' + BARCODE + '</span>' : '') +
        '</div>'
    };
  }

  return null;
}

/* 첫 줄 들여쓰기 — 예전 파일은 켜고 끄는 값이 없으므로 간격이 0보다 크면 켜진 것으로 본다 */
function indentIsOn(){ return state.indentOn == null ? (Number(state.indent) || 0) > 0 : !!state.indentOn; }
function indentOf(){ return indentIsOn() ? (Number(state.indent) || 0) : 0; }
function makePage(idx){
  const wrap = document.createElement('div');
  wrap.className = 'page-wrap';
  const page = document.createElement('div');
  page.className = 'page mode-' + state.mode + ' ta-' + (state.textAlign || 'left') +
    ' shape-' + (state.bubbleShape || 'notch') +
    (state.bubbleShadow === false ? ' noshadow' : '') +
    (state.hideNames ? ' hidenames' : '') + (state.alignedText ? ' aligned' : '') +
    (hScaleOf() !== 100 ? ' hs' : '') + (state.wordBreak === 'word' ? ' wb-word' : '');
  page.style.setProperty('--c-hs', hScaleOf() / 100);
  page.style.setProperty('--c-fw', fontWeightOf());
  page.style.setProperty('--c-fwb', Math.min(900, fontWeightOf() + 300));
  page.style.setProperty('--c-padx', state.padX + 'px');
  page.style.setProperty('--c-pady', state.padY + 'px');
  page.style.setProperty('--c-gap', state.gap + 'px');
  page.style.setProperty('--c-fs', state.fontSize + 'px');
  page.style.setProperty('--c-lh', state.lineHeight);
  page.style.setProperty('--c-ls', (Number(state.letterSpace) || 0) / 100 + 'em');
  page.style.setProperty('--c-pgap', (Number(state.pgap) || 0) / 100 + 'em');
  page.style.setProperty('--c-indent', indentOf() / 100 + 'em');
  if (indentOf() && state.indentDlg === false) page.classList.add('noindent-dlg');
  page.style.setProperty('--c-bw', (Number(state.bubbleWidth) || 82) + '%');
  page.style.setProperty('--c-bpad', (Number(state.bubblePad) || 95) / 100 + 'em');
  page.style.setProperty('--c-radius', state.canvasRadius + 'px');
  page.style.setProperty('--c-bubble', state.bubbleRadius + 'px');
  page.style.fontFamily = state.font;
  page.style.width = CANVAS_W + 'px';

  const paintBg = el => {
    /* 사진 밑 바탕을 그라데이션으로 두면, 사진이 덮지 않은 자리(전체 보이기의 여백, 흐리게 녹인 가장자리)에 그라데이션이 비친다 */
    const underGrad = state.bgKind === 'image' && state.bgUnder === 'gradient';
    if (state.bgKind === 'none') el.style.background = 'transparent';
    else if (state.bgKind === 'gradient' || underGrad) el.style.background = bgGradCss();
    else el.style.background = state.bgColor;
    if (state.bgKind === 'image' && state.bgImage){
      const fit = state.bgFit || 'cover';
      const extra = underGrad ? ',' : '';
      el.style.backgroundImage = 'url(' + bgImageSrc() + ')' + (underGrad ? ',' + bgGradCss() : '');
      el.style.backgroundSize = (fit === 'tile' ? 'auto' : fit) + (extra && extra + '100% 100%');
      el.style.backgroundRepeat = (fit === 'tile' ? 'repeat' : 'no-repeat') + (extra && extra + 'no-repeat');
      el.style.backgroundPosition = (fit === 'tile' ? 'top left' : 'center') + (extra && extra + 'center');
    }
  };
  /* 배경 위에 덧씌우는 패턴 층 */
  const mkPattern = () => {
    const kind = state.bgPattern || 'none';
    if (kind === 'none' || state.bgKind === 'none') return null;
    const el = document.createElement('div');
    el.className = 'bgpat';
    el.style.opacity = (Number(state.bgPatOpacity) || 0) / 100;
    const size = Number(state.bgPatSize) || 26;
    if (kind === 'symbol'){
      const sym = escHtml(state.bgPatSymbol || '★');
      const cols = Math.ceil(CANVAS_W / size) + 2;
      const rows = Math.ceil(1600 / size) + 2;
      el.style.color = state.bgPatColor || '#FFFFFF';
      el.style.fontSize = Math.round(size * .62) + 'px';
      el.style.lineHeight = size + 'px';
      el.style.letterSpacing = Math.round(size * .38) + 'px';
      el.innerHTML = Array.from({length: rows}, (_, r) =>
        '<div class="bgpr"' + (r % 2 ? ' style="text-indent:' + Math.round(size / 2) + 'px"' : '') + '>' +
        sym.repeat(cols) + '</div>').join('');
    } else {
      const p2 = patternCss(kind, state.bgPatColor || '#FFFFFF', size);
      if (!p2) return null;
      el.style.backgroundImage = p2.image;
      if (p2.size) el.style.backgroundSize = p2.size;
      if (p2.pos) el.style.backgroundPosition = p2.pos;
    }
    return el;
  };

  const fr = frameParts();
  /* 화면 바깥이 투명해야 하는 테두리(모니터 등)는 배경을 대사 영역에만 칠한다 */
  const bgOnBody = !!(fr && fr.clearBg);
  if (!bgOnBody) paintBg(page); else page.style.background = 'transparent';
  const mkTint = () => {
    if (state.tint === 0) return null;
    const t = document.createElement('div');
    t.className = 'tint';
    t.style.background = state.tint > 0
      ? 'rgba(255,255,255,' + (state.tint / 100) + ')'
      : 'rgba(0,0,0,' + (-state.tint / 100) + ')';
    return t;
  };
  if (!bgOnBody){
    const pt = mkPattern(); if (pt) page.appendChild(pt);
    const t = mkTint(); if (t) page.appendChild(t);
  }
  const frag = html => { const d = document.createElement('div'); d.innerHTML = html; return Array.from(d.children); };
  if (fr && fr.back) frag(fr.back).forEach(n => page.appendChild(n));
  if (fr && fr.top) frag(fr.top).forEach(n => page.appendChild(n));
  const body = document.createElement('div');
  body.className = 'cbody';
  const twoCols = !!(fr && fr.cols === 2);
  if (fr && fr.pad){
    const q = Array.isArray(fr.pad) ? {t:fr.pad[0], b:fr.pad[0], x:fr.pad[1]} : fr.pad;
    page.style.setProperty('--c-fpx', (q.x || 0) + 'px');
    page.style.setProperty('--c-fpy', (q.t || 0) + 'px');
    /* 두 칸으로 나뉠 때는 여백을 칸이 들고 있으므로 여기서 주지 않는다 */
    if (!twoCols)
      body.style.padding = 'calc(var(--c-pady) + ' + (q.t || 0) + 'px) calc(var(--c-padx) + ' + (q.x || 0) + 'px) ' +
        'calc(var(--c-pady) + ' + (q.b || 0) + 'px)';
  }
  /* 양면 펼침은 CSS 다단이 아니라 진짜 두 칸으로 나눈다.
     다단은 넘친 내용이 다음 장으로 못 넘어가고 잘려 버린다. */
  let slots = null;
  if (twoCols){
    body.dataset.cols = '2';
    const mk = () => { const c = document.createElement('div'); c.className = 'pgcol'; return c; };
    slots = [mk(), mk()];
  }
  if (fr && fr.body) body.style.cssText += ';' + fr.body;
  if (bgOnBody){
    paintBg(body);
    body.style.zIndex = '0';
    const pt = mkPattern();
    if (pt){ pt.style.zIndex = '-1'; body.appendChild(pt); }
    const t = mkTint();
    if (t){ t.style.zIndex = '-1'; body.appendChild(t); }
  }

  /* 비율은 언제나 대사 영역에 건다. 테두리 장식은 그 바깥에 덧붙어 캔버스만 길어진다. */
  const r = ratioValue();
  if (r){
    page.style.height = 'auto';
    body.style.flex = '0 0 auto';
    body.style.height = Math.round(CANVAS_W / r) + 'px';
  } else {
    page.classList.add('auto');
    page.style.height = 'auto';
  }
  const dtitle = state.useDocTitle ? String(state.docTitle || '').trim() : '';
  if (dtitle && ((state.docTitleWhere || 'all') === 'all' || (idx || 0) === 0)){
    const deco = state.docTitleDeco || 'rule';
    const el = document.createElement('div');
    el.className = 'doctitle ta-' + (state.docTitleAlign || 'center') + ' deco-' + deco;
    el.style.color = state.docTitleColor || '#8A8A8E';
    el.style.fontSize = ((Number(state.docTitleSize) || 130) / 100 * 13) + 'px';
    el.style.letterSpacing = ((Number(state.docTitleLs) || 0) / 100) + 'em';
    if (state.docTitleFont) el.style.fontFamily = state.docTitleFont;
    const eb = String(state.docTitleEyebrow || '').trim();
    el.innerHTML =
      (deco === 'tag' && eb ? '<span class="dt-eb">' + escHtml(eb) + '</span>' : '') +
      '<span class="dt-tx">' + escHtml(dtitle) + '</span>';
    (slots ? slots[0] : body).appendChild(el);
  }
  page.appendChild(body);
  if (fr && fr.bottom) frag(fr.bottom).forEach(n => page.appendChild(n));
  if (fr && fr.overlay) frag(fr.overlay).forEach(n => {
    if (fr.below) page.insertBefore(n, body); else page.appendChild(n);
  });
  const box = document.createElement('div');
  box.className = 'pagebox';
  if (state.bgKind === 'none' || bgOnBody){
    const ck = document.createElement('div');
    ck.className = 'checker';
    ck.style.borderRadius = state.canvasRadius + 'px';
    box.appendChild(ck);
  }
  box.appendChild(page);
  wrap.appendChild(box);
  if (slots) slots.forEach(c => body.appendChild(c));
  return {wrap, page, body, slots: slots || [body], si: 0};
}

/* 블록 하나가 한 장을 넘길 때, 문단 단위로 잘라 다음 장으로 넘긴다 */
/* 마지막 블록의 바닥이 '높이 - 아래 여백' 선을 넘으면 가득 찬 것.
   scrollHeight 비교는 엔진에 따라 아래 여백을 무시하고 바닥까지 채워 버린다. */
const contentRows = b => b.querySelectorAll(':scope > [data-bid]');
function overBottom(body){
  const rs = contentRows(body);
  const last = rs[rs.length - 1];
  if (!last) return false;
  const padB = parseFloat(getComputedStyle(body).paddingBottom) || 0;
  return last.offsetTop + last.offsetHeight > body.clientHeight - padB + 1;
}
/* 쪽을 통째로 덮는 삽화 — 비율이 달라 남는 자리는 그림을 키워 덮고 넘친 만큼 잘라낸다.
   object-fit은 저장 이미지에 안 나오므로, 실제 픽셀 크기와 여백으로 직접 맞춘다. */
function clearCover(row){
  const im = row.querySelector('.cimg');
  if (!im || !im.dataset.cover) return;
  im.style.width = im.dataset.coverW || '';
  im.style.height = ''; im.style.marginLeft = ''; im.style.marginTop = '';
  row.style.height = '';
  delete im.dataset.cover;
}
function coverFill(row, w, h){
  const im = row.querySelector('.cimg');
  if (!im || !w || !h) return;
  const nw = im.naturalWidth, nh = im.naturalHeight;
  if (!nw || !nh) return;              /* 아직 안 읽힌 그림 — 로드 뒤 다시 배치된다 */
  const sc = Math.max(w / nw, h / nh);
  const iw = Math.round(nw * sc), ih = Math.round(nh * sc);
  im.dataset.coverW = im.style.width;
  im.dataset.cover = '1';
  row.style.height = h + 'px';
  im.style.width = iw + 'px';
  im.style.height = ih + 'px';
  im.style.marginLeft = Math.round((w - iw) / 2) + 'px';
  im.style.marginTop = Math.round((h - ih) / 2) + 'px';
}

/* 블록 하나가 한 장보다 길 때만 쓰는 안전장치. 문단 경계에서만 나눈다.
   이것마저 없으면 넘친 문단이 그대로 잘려 사라진다. */
function splitRow(body, row){
  const holder = row.querySelector('.bubble') || row.querySelector('.stack') || row;
  if (holder.children.length < 2) return null;
  const full = row.cloneNode(true);
  const fullHolder = full.querySelector('.bubble') || full.querySelector('.stack') || full;
  const cut = [];
  while (holder.children.length > 1 && overBottom(body)){
    cut.unshift(holder.lastElementChild);
    holder.removeChild(holder.lastElementChild);
  }
  const giveUp = () => { cut.forEach(n => holder.appendChild(n)); return null; };
  if (!cut.length) return giveUp();
  let keep = holder.children.length;
  while (keep-- > 0 && fullHolder.firstElementChild) fullHolder.removeChild(fullHolder.firstElementChild);
  if (!fullHolder.children.length) return giveUp();
  full.classList.add('cont');
  return full;
}

function hScaleOf(){ return clamp(Math.round(Number(state.hScale) || 100), 50, 150); }
function fontWeightOf(){ return clamp(Math.round((Number(state.fontWeight) || 400) / 100) * 100, 100, 900); }
/* 장평을 바꾸면 글은 눈으로만 줄거나 늘고 배치 폭은 그대로다.
   그래서 내용 길이에 맞춰 줄어드는 칸(말풍선·지문 줄 등)은 원래 글 폭에 맞춰 남거나 모자란다.
   그런 칸만 골라 '글 폭 × 장평 + 안쪽 여백'으로 폭을 다시 적는다. 폭이 정해진 칸은 건드리지 않는다. */
function fitHScale(row){
  const k = hScaleOf() / 100;
  if (k === 1 || !row) return;
  row.querySelectorAll('[data-hsw]').forEach(el => { el.style.width = ''; delete el.dataset.hsw; });
  const hosts = [];
  row.querySelectorAll('.p').forEach(p => { const h = p.parentElement; if (h && hosts.indexOf(h) < 0) hosts.push(h); });
  /* 안쪽 칸부터 — 바깥 칸이 안쪽 칸의 새 폭을 보고 정해지도록 */
  const depth = el => { let d = 0; for (let n = el; n && n !== row; n = n.parentElement) d++; return d; };
  hosts.sort((a, b) => depth(b) - depth(a));
  hosts.forEach(h => {
    const ps = Array.from(h.children).filter(c => c.classList.contains('p'));
    if (!ps.length) return;
    const setW = v => ps.forEach(p => { p.style.width = v; });
    setW('1px');
    const wMin = h.offsetWidth;
    setW('100000px');
    /* 칸이 바깥 칸을 뚫고 나갈 수 있으므로(세로 flex 안의 말풍선 등) 바깥 칸의 안쪽 폭으로 막는다 */
    const par = h.parentElement, pcs = par && getComputedStyle(par);
    const room = par ? par.clientWidth - (parseFloat(pcs.paddingLeft) || 0) - (parseFloat(pcs.paddingRight) || 0) : Infinity;
    const wMax = Math.min(h.offsetWidth, room);
    if (wMax - wMin < 1){ setW(''); return; }
    setW('max-content');
    const text = Math.max(...ps.map(p => p.offsetWidth));
    setW('');
    const cs = getComputedStyle(h);
    const pb = ['paddingLeft','paddingRight','borderLeftWidth','borderRightWidth'].reduce((a, k2) => a + (parseFloat(cs[k2]) || 0), 0);
    const want = clamp(text * k + pb + 1, wMin, wMax);
    h.style.width = want + 'px';
    h.dataset.hsw = '1';
  });
}
/* 페이지 한쪽을 채우는 그림. 대사 영역 한쪽을 위아래 끝까지 덮고, 그 장의 글은 그만큼 반대쪽으로 민다.
   흐름 배치에서 빠지도록 data-bid를 떼어 둔다(넘침 계산·블록 수 세기에 안 잡힌다). */
function attachSide(pg, row){
  const body = pg.body;
  const w = Math.round(CANVAS_W * Number(row.dataset.sidew || 45) / 100);
  const side = row.dataset.side === 'l' ? 'l' : 'r';
  row.classList.add('side', 'side-' + side);
  row.style.width = w + 'px';
  row.dataset.sidebid = row.dataset.bid;
  delete row.dataset.bid;
  const cs = getComputedStyle(body);
  const key = side === 'l' ? 'paddingLeft' : 'paddingRight';
  body.style[key] = ((parseFloat(cs[key]) || 0) + w) + 'px';
  body.insertBefore(row, body.firstChild);
  body.classList.add('has-side');
  pg.sides = pg.sides || {};
  pg.sides[side] = {row, w};
}
function fitSide(pg, fixed){
  const list = Object.values(pg.sides || {});
  /* 높이가 내용에 맞춰지는 판이면 그림이 잘리지 않을 만큼은 판을 늘린다 */
  if (!fixed){
    let need = 0;
    list.forEach(({row, w}) => {
      const im = row.querySelector('.cimg');
      if (im && im.naturalWidth) need = Math.max(need, Math.round(w * im.naturalHeight / im.naturalWidth));
    });
    if (need) pg.body.style.minHeight = need + 'px';
  }
  const h = pg.body.clientHeight;
  list.forEach(({row, w}) => {
    const im = row.querySelector('.cimg');
    if (!im) return;
    const nw = im.naturalWidth, nh = im.naturalHeight;
    if (!nw || !nh) return;              /* 아직 안 읽힌 그림 — 로드 뒤 다시 배치된다 */
    const sc = Math.max(w / nw, h / nh);
    const iw = Math.round(nw * sc), ih = Math.round(nh * sc);
    im.style.width = iw + 'px';
    im.style.height = ih + 'px';
    im.style.marginLeft = Math.round((w - iw) / 2) + 'px';
    im.style.marginTop = Math.round((h - ih) / 2) + 'px';
  });
}
function renderCanvas(){
  ensureXRules();
  const stack = $('#pageStack');
  stack.innerHTML = '';
  const rows = state.blocks.map(bk => { const r = buildRow(bk); r.dataset.bid = bk.id; return r; });
  const pageOf = {};
  const mark = (row, i) => { const b = row.dataset.bid; if (b && pageOf[b] === undefined) pageOf[b] = i; };
  const fixed = !!ratioValue();
  const pages = [];

  let cur = makePage(0);
  stack.appendChild(cur.wrap);
  pages.push(cur);

  const overflows = overBottom;
  const nextPage = () => { const p2 = makePage(pages.length); stack.appendChild(p2.wrap); pages.push(p2); return p2; };
  const queue = rows.slice();
  const slot = () => cur.slots[cur.si];
  /* 칸이 남아 있으면 다음 칸으로, 아니면 새 장으로 */
  const advance = () => { if (cur.si + 1 < cur.slots.length) cur.si++; else cur = nextPage(); };
  const bodyRows = b => contentRows(b).length;
  let guard = 0;
  while (queue.length && guard++ < 4000){
    const row = queue.shift();
    if (row.dataset.pb){
      if (cur.sides || cur.slots.some(bodyRows)) cur = nextPage();
      mark(row, pages.length - 1);
      continue;
    }
    if (row.dataset.side){
      if (cur.slots.length > 1){
        /* 양면 펼침에서는 한쪽 세우기를 할 수 없다 — 가운데 그림으로 둔다 */
        delete row.dataset.side;
        row.classList.add('ia-center');
      } else {
        /* 그림이 놓인 그 장의 한쪽을 채운다. 같은 쪽이 이미 차 있을 때만 다음 장으로. */
        if (cur.sides && cur.sides[row.dataset.side]) cur = nextPage();
        mark(row, pages.length - 1);
        attachSide(cur, row);
        /* 폭이 좁아져 넘치게 된 앞 블록들은 뒤에서부터 다음 장으로 돌려보낸다 */
        if (fixed){
          const sl = cur.slots[0];
          while (contentRows(sl).length > 1 && overflows(sl)){
            const rs = contentRows(sl), last = rs[rs.length - 1];
            sl.removeChild(last);
            delete pageOf[last.dataset.bid];
            queue.unshift(last);
          }
          if (overflows(sl)){
            /* 한 블록만 남았는데도 넘치면 문단 단위로 자른다 */
            const only = contentRows(sl)[0];
            const rest = splitRow(sl, only);
            if (rest) queue.unshift(rest);
          }
        }
        continue;
      }
    }
    slot().appendChild(row);
    fitHScale(row);
    if (!fixed || !overflows(slot())){ mark(row, pages.length - 1); continue; }
    if (bodyRows(slot()) > 1){
      /* 자리에 못 들어가면 블록을 통째로 다음 칸(또는 다음 장)으로 넘긴다 */
      slot().removeChild(row);
      queue.unshift(row);
      advance();
      continue;
    }
    mark(row, pages.length - 1);
    const rest = splitRow(slot(), row);
    fitHScale(row);
    if (rest){ queue.unshift(rest); advance(); }
  }

  pageCount = pages.length;
  const expW = Number(state.exportW) || 1080;
  const scale = expW / CANVAS_W;
  $('#sizeLabel').textContent = expW + ' × ' + (pages[0] ? Math.round(pages[0].page.offsetHeight * scale) : '자동') + ' px';
  $('#pageWarn').textContent = pages.length > 1 ? '· ' + pages.length + '장으로 나눠 저장됩니다' : '';
  const stamp = state.useStamp ? String(state.stampText || '').trim() : '';
  if (stamp){
    pages.forEach(pp => {
      const el = document.createElement('div');
      el.className = 'cstamp pos-' + (state.stampPos || 'bl');
      el.style.color = state.stampColor || '#A5A5AA';
      el.style.fontSize = (Number(state.stampSize) || 11) + 'px';
      if (state.stampFont) el.style.fontFamily = state.stampFont;
      el.textContent = stamp;
      pp.page.appendChild(el);
    });
  }
  if (state.usePageNo && state.pageNo && state.pageNo !== 'off'){
    /* 바깥쪽 양쪽 — 한 장이 두 쪽인 양면 펼침용. 번호를 좌우 바깥 모서리에 하나씩 */
    const two = (state.pageNoPos || 'bc') === 'outer';
    const total = two ? pages.length * 2 : pages.length;
    const label = n => state.pageNo === 'frac' ? n + ' / ' + total
      : state.pageNo === 'dash' ? '\u2014 ' + n + ' \u2014' : String(n);
    pages.forEach((pp, i) => {
      const mk = (cls, n) => {
        const el = document.createElement('div');
        el.className = 'pgstamp ' + cls;
        el.style.color = state.pageNoColor || '#8A8A8E';
        el.style.fontSize = (Number(state.pageNoSize) || 12) + 'px';
        el.textContent = label(n);
        pp.page.appendChild(el);
      };
      if (two){ mk('pos-bl', i * 2 + 1); mk('pos-br', i * 2 + 2); }
      else mk('pos-' + (state.pageNoPos || 'bc'), i + 1);
    });
  }
  pages.forEach(pp => { if (pp.sides) fitSide(pp, fixed); });
  pages.forEach(pp => {
    pp.slots.forEach(sl => {
      const rs = Array.from(contentRows(sl));
      rs.forEach(r => { r.classList.remove('bleed-t', 'bleed-b', 'bleed-page'); clearCover(r); });
      const first = rs[0], last = rs[rs.length - 1];
      if (first && first.dataset.bleedt) first.classList.add('bleed-t');
      if (last && last.dataset.bleedb) last.classList.add('bleed-b');
      /* 삽화 한 장이 그 쪽을 혼자 쓰고 세 방향 채우기가 모두 켜져 있으면
         쪽 전체를 덮는 그림으로 본다. 남는 자리는 그림을 키워 잘라 메운다. */
      if (fixed && rs.length === 1 && first.classList.contains('imgrow') &&
          first.classList.contains('bleed-x') && first.dataset.bleedt && first.dataset.bleedb){
        first.classList.add('bleed-page');
        coverFill(first, sl.clientWidth, sl.clientHeight);
      }
    });
  });
  if (state.bgKind === 'image' && state.bgImage && state.bgUnder === 'edge'){
    ensureBgEdge();
    pages.forEach(pp => paintEdgeUnder(pp.page));
  }
  paintUnderlines(pages);
  paintNotes(pages);
  paintMemos(pages);
  paintPageMarkers(pageOf, pages.length);
  applyView();
  if (zoomAuto) fitZoom(); else applyZoom();

  /* 이미지가 늦게 로드되면 높이가 달라지므로 한 번만 다시 배치 */
  if (!reflowing){
    const pending = Array.from(stack.querySelectorAll('img')).filter(im => !im.complete);
    let left = pending.length;
    pending.forEach(im => im.addEventListener('load', () => {
      if (--left === 0){ reflowing = true; renderCanvas(); reflowing = false; }
    }, {once:true}));
  }
}

/* 대사 목록에 몇 쪽인지 표시한다 */
/* 편집기 목록에서 장별로 접어 둘 수 있게 한다. 보기 상태일 뿐이라 저장하지 않는다.
   블록 수가 바뀌면(추가·삭제·붙여넣기) 접힘을 풀어, 더한 블록이 숨어 있는 일이 없게 한다. */
let foldedPages = new Set(), lastBlkCount = -1;
function setPageFold(pg, folded){
  if (folded) foldedPages.add(pg); else foldedPages.delete(pg);
  applyPageFold();
}
function applyPageFold(){
  const list = $('#blockList');
  if (!list) return;
  let pg = -1;
  Array.from(list.children).forEach(el => {
    if (el.classList.contains('pagemark')){
      pg = Number(el.dataset.pg);
      el.classList.toggle('folded', foldedPages.has(pg));
      return;
    }
    if (pg >= 0) el.hidden = foldedPages.has(pg);
  });
  const btn = $('#btnFoldAll');
  if (btn){
    const marks = list.querySelectorAll('.pagemark').length;
    btn.hidden = marks < 2;
    const allFolded = marks > 0 && foldedPages.size >= marks;
    btn.textContent = allFolded ? '⊞ 모두 펼치기' : '⊟ 모두 접기';
  }
}
function paintPageMarkers(pageOf, total){
  const list = $('#blockList');
  if (!list) return;
  const sc = list.closest('.pane-scroll');
  const keep = sc ? sc.scrollTop : 0;
  list.querySelectorAll('.pagemark').forEach(n => n.remove());
  const blks = Array.from(list.querySelectorAll('.blk'));
  /* 블록이 늘거나 줄면 접힘을 푼다 — 방금 더한 블록이 접힌 장에 숨는 일을 막는다 */
  if (blks.length !== lastBlkCount){ foldedPages.clear(); lastBlkCount = blks.length; }
  if (total < 2){
    blks.forEach(el => { el.hidden = false; const b = el.querySelector('.pgno'); if (b){ b.textContent = ''; b.classList.remove('on'); } });
    foldedPages.clear();
    applyPageFold();
    return;
  }
  const perPage = {};
  blks.forEach(el => { const pg = pageOf[el.dataset.id]; if (pg !== undefined) perPage[pg] = (perPage[pg] || 0) + 1; });
  let last = -1;
  blks.forEach(el => {
    const pg = pageOf[el.dataset.id];
    const badge = el.querySelector('.pgno');
    if (badge){
      badge.textContent = pg === undefined ? '' : (pg + 1);
      badge.classList.toggle('on', pg !== undefined);
    }
    if (pg !== undefined && pg !== last){
      const m = document.createElement('button');
      m.className = 'pagemark';
      m.type = 'button';
      m.dataset.pg = pg;
      m.title = '이 장의 블록을 접거나 펼칩니다';
      m.innerHTML = '<span><i class="arw">▼</i>' + (pg + 1) + ' / ' + total + ' 쪽' +
        '<b class="cnt2">· ' + (perPage[pg] || 0) + '</b></span>';
      list.insertBefore(m, el);
      last = pg;
    }
  });
  applyPageFold();
  if (sc && sc.scrollTop !== keep) sc.scrollTop = keep;
}

/* ---------------- zoom ---------------- */
function applyZoom(){
  const stack = $('#pageStack');
  /* transform은 겉모습만 균일하게 키우므로, 실제 차지 크기는 상자에 따로 적어 스크롤이 맞게 한다 */
  stack.style.transform = 'scale(' + zoom + ')';
  const box = $('#zoomBox');
  box.style.width = Math.round(stack.offsetWidth * zoom) + 'px';
  box.style.height = Math.round(stack.offsetHeight * zoom) + 'px';
  $('#zVal').textContent = Math.round(zoom * 100) + '%';
}
/* 이미지가 늦게 로드되어 높이가 변하면 상자 크기를 따라잡는다.
   단, 캡처 중에는 절대 배율을 다시 걸면 안 된다 — 걸면 저장 이미지의 글자가 겹쳐 깨진다. */
let capturing = false;
if (typeof ResizeObserver !== 'undefined'){
  new ResizeObserver(() => { if (!capturing) applyZoom(); }).observe($('#pageStack'));
}
function fitZoom(){
  const scroll = $('#stageScroll');
  const stack = $('#pageStack');
  const pw = stack.offsetWidth || CANVAS_W;
  const ph = stack.offsetHeight || 1;
  const availW = scroll.clientWidth - 48;
  const availH = scroll.clientHeight - 60;
  zoom = snapZoom(Math.min(availW / pw, availH / ph, 1));
  zoomAuto = true;
  applyZoom();
}
function snapZoom(z){ return Math.max(.15, Math.round(CANVAS_W * clamp(z, .15, 2)) / CANVAS_W); }
function setZoom(z){ zoom = snapZoom(z); zoomAuto = false; applyZoom(); }

/* ---------------- panel: speakers ---------------- */
function renderCast(){
  ensureXRules();
  renderXRules();
  const list = $('#castList');
  const sc = list.closest('.pane-scroll');
  const keepTop = sc ? sc.scrollTop : 0;
  renderCastInner(list);
  if (sc && sc.scrollTop !== keepTop) sc.scrollTop = keepTop;
}
function renderCastInner(list){
  const nr = state.narrator || {};
  list.innerHTML =
    '<div class="card narr-card">' +
      '<div class="card-top">' +
        '<span class="tag">나레이션 · 화자 없음</span>' +
        '<select data-nr="align" style="flex:0 0 84px">' +
          ['left','center','right'].map(v => '<option value="' + v + '"' + ((nr.align || 'center') === v ? ' selected' : '') + '>' +
            ({left:'왼쪽', center:'가운데', right:'오른쪽'}[v]) + '</option>').join('') +
        '</select>' +
      '</div>' +
      '<div class="colorrow" style="grid-template-columns:repeat(3,1fr)">' +
        '<div class="cc"><input type="color" value="' + (nr.text || '#5B5952') + '" data-nrc="text"><span>글자</span></div>' +
        '<div class="cc"><input type="color" value="' + (nr.action || '#8A887F') + '" data-nrc="action"><span>지문</span></div>' +
        '<div class="cc"><input type="color" value="' + (nr.bubble || '#FFFFFF') + '" data-nrc="bubble"><span>바탕</span></div>' +
      '</div>' +
      '<div class="rangerow" style="margin:9px 0 4px"><span class="lbl">글자 크기</span>' +
        '<input type="range" min="60" max="160" value="' + (nr.size || 100) + '" data-nr="size"><output>' + (nr.size || 100) + '%</output></div>' +
      '<div class="grid2" style="margin:0 0 9px">' +
        '<div class="field" style="margin:0"><label>나레이션 글꼴</label>' +
          '<select data-nrfont="text">' + fontOptions(nr.font || '', '기본 글꼴') + '</select></div>' +
        '<div class="field" style="margin:0"><label>지문 글꼴</label>' +
          '<select data-nrfont="action">' + fontOptions(nr.actionFont || '', '기본 글꼴') + '</select></div>' +
      '</div>' +
      '<label class="check" style="margin-bottom:6px"><input type="checkbox" data-nr="italic"' + (nr.italic ? ' checked' : '') + '> 기울임으로</label>' +
      '<label class="check" style="margin:0"><input type="checkbox" data-nr="box"' + (nr.noBubble ? '' : ' checked') + '> 바탕색 상자 안에 넣기</label>' +
      '<p class="hint" style="margin:8px 2px 0">화자 없는 블록이 쓰는 설정. 블록별로는 정렬만 따로.</p>' +
    '</div>';
  if (!state.speakers.length){
    list.insertAdjacentHTML('beforeend', '<div class="empty" style="padding:16px 18px">추가한 화자가 없습니다.<br>모든 블록이 위 나레이션 설정으로 렌더링돼요.</div>');
  }
  state.speakers.forEach(sp => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<div class="card-top">' +
        '<label class="avatar" title="프로필 이미지" style="' + (sp.avatar ? 'background-image:url(' + escAttr(sp.avatar) + ')' : '') + '">' +
          (sp.avatar ? '' : escHtml((sp.name || '?').slice(0,1))) +
          '<input type="file" accept="image/*" hidden data-av="' + sp.id + '">' +
        '</label>' +
        '<input type="text" value="' + escAttr(sp.name) + '" data-name="' + sp.id + '" placeholder="이름">' +
        '<select data-align="' + sp.id + '" style="flex:0 0 92px" title="말풍선이 놓일 자리">' +
          [['left','왼쪽'],['center','가운데'],['right','오른쪽'],['wide','가로 꽉 채움']]
            .map(([vv, ll]) => '<option value="' + vv + '"' + (sp.align === vv ? ' selected' : '') + '>' + ll + '</option>').join('') +
        '</select>' +
        (sp.avatar ? '<button class="mini" data-avcrop="' + sp.id + '" title="프로필 사진 자르기">✂</button>' +
          '<button class="mini" data-avdel="' + sp.id + '" title="프로필 사진 지우기">⊘</button>' : '') +
        '<button class="mini" data-cpsp="' + sp.id + '" title="이 화자의 설정을 그대로 복사합니다">⧉</button>' +
        '<button class="mini danger" data-del="' + sp.id + '" title="삭제">✕</button>' +
      '</div>' +
      '<div class="colorrow">' +
        '<div class="cc"><input type="color" value="' + sp.bubble + '" data-c="bubble" data-id="' + sp.id + '"><span>말풍선</span></div>' +
        '<div class="cc"><input type="color" value="' + sp.text + '" data-c="text" data-id="' + sp.id + '"><span>대사</span></div>' +
        '<div class="cc"><input type="color" value="' + sp.action + '" data-c="action" data-id="' + sp.id + '"><span>지문</span></div>' +
        '<div class="cc"><input type="color" value="' + (sp.nameColor || sp.text) + '" data-c="nameColor" data-id="' + sp.id + '"><span>이름</span></div>' +
      '</div>' +
      '<div class="rangerow" style="margin:9px 0 4px"><span class="lbl">대사 크기</span>' +
        '<input type="range" min="60" max="160" value="' + spSize(sp) + '" data-spsize="' + sp.id + '"><output>' + spSize(sp) + '%</output></div>' +
      '<div class="field" style="margin:9px 0 0"><label>말풍선 투명도</label>' +
        '<div class="rangerow" style="margin:0"><input type="range" min="0" max="100" value="' + (100 - bubAlpha(sp)) +
          '" data-balpha="' + sp.id + '"><output>' + (100 - bubAlpha(sp)) + '%</output></div></div>' +
      '<div class="grid2" style="margin-top:9px">' +
        '<div class="field" style="margin:0"><label>대사 글꼴</label>' +
          '<select data-spfont="' + sp.id + '">' + fontOptions(sp.font || '', '기본 글꼴') + '</select></div>' +
        '<div class="field" style="margin:0"><label>지문 글꼴</label>' +
          '<select data-spafont="' + sp.id + '">' + fontOptions(sp.actionFont || '', '기본 글꼴') + '</select></div>' +
      '</div>' +
      '<div class="grid2" style="margin-top:9px">' +
        '<div class="field" style="margin:0"><label>프로필 모양</label>' +
          '<select data-avsh="' + sp.id + '">' +
            [['circle','원형'],['round','둥근 사각'],['soft','많이 둥근'],['square','사각']]
              .map(([vv, ll]) => '<option value="' + vv + '"' + ((sp.avatarShape || 'circle') === vv ? ' selected' : '') + '>' + ll + '</option>').join('') +
          '</select></div>' +
        '<div class="field" style="margin:0"><label>프로필 크기</label>' +
          '<div class="rangerow" style="margin:0"><input type="range" min="60" max="300" value="' + (sp.avatarSize || 100) + '" data-avsz="' + sp.id + '"><output>' + (sp.avatarSize || 100) + '%</output></div></div>' +
      '</div>' +
      '<p class="hint" style="margin:10px 2px 0">외국어 색·괄호 안 글자 색은 <b>글 → 추가 지문 규칙</b>에서 화자를 골라 정합니다.</p>';
    list.appendChild(card);
  });
  upgradeRangeRows(list);
  $('#cntCast').textContent = state.speakers.length;
}

/* ---------------- panel: 추가 지문 규칙 ---------------- */
function xrScopeHtml(r){
  const sc = xrScope(r);
  return '<div class="field" style="margin:9px 0 4px"><label>적용 범위</label></div>' +
    '<div class="xrscope">' +
      '<label class="check"><input type="checkbox" data-xrnarr="' + r.id + '"' + (sc.narr ? ' checked' : '') + '> 나레이션</label>' +
      '<label class="check"><input type="checkbox" data-xrall="' + r.id + '"' + (sc.all ? ' checked' : '') + '> 모든 화자</label>' +
      (sc.all ? '' : state.speakers.map(sp =>
        '<label class="check"><input type="checkbox" data-xrsp="' + r.id + '" value="' + sp.id + '"' + (sc.ids.indexOf(sp.id) >= 0 ? ' checked' : '') + '> ' +
        '<i class="swatchdot" style="background:' + sp.bubble + '"></i>' + escHtml(sp.name || '이름 없음') + '</label>').join('') +
        (state.speakers.length ? '' : '<p class="hint" style="margin:0">추가한 화자가 없습니다.</p>')) +
    '</div>';
}
function xrCardHtml(r, i, n){
  const isFx = r.kind === 'fx';
  const on = r.on !== false;
  let body;
  if (isFx){
    const keys = xrScripts(r);
    body = '<div class="field" style="margin:7px 0 6px"><label>외국어 글자색</label>' +
        '<input type="color" value="' + (XR_HEX.test(r.color || '') ? r.color : '#C0392B') + '" data-xrcol="' + r.id + '"></div>' +
      '<div class="field" style="margin:0 0 4px"><label>외국어로 볼 글자</label></div>' +
      '<div class="xrscope">' + FX_SCRIPTS.map(([k, l]) => '<label class="check"><input type="checkbox" data-xrscr="' + r.id + '" value="' + k + '"' +
        (keys.indexOf(k) >= 0 ? ' checked' : '') + '> ' + l + '</label>').join('') + '</div>';
  } else {
    const size = clamp(Math.round(Number(r.size) || 100), 50, 300);
    body = '<div class="grid3 xcolor" style="margin-top:7px">' +
        '<div class="field" style="margin:0"><label>여는 기호</label><input type="text" maxlength="4" value="' + escAttr(r.open == null ? '(' : r.open) + '" data-xro="' + r.id + '"></div>' +
        '<div class="field" style="margin:0"><label>닫는 기호</label><input type="text" maxlength="4" value="' + escAttr(r.close == null ? ')' : r.close) + '" data-xrc="' + r.id + '"></div>' +
        '<div class="field" style="margin:0"><label>글자색</label><input type="color" value="' + (XR_HEX.test(r.color || '') ? r.color : '#8A8F99') + '" data-xrcol="' + r.id + '"></div>' +
      '</div>' +
      '<div class="rangerow" style="margin:9px 0 4px"><span class="lbl">글자 크기</span>' +
        '<input type="range" min="50" max="200" step="5" value="' + size + '" data-xrsz="' + r.id + '"><output>' + size + '%</output></div>' +
      '<label class="check" style="margin:4px 0 0" data-tip="켜면 기호도 판에 함께 그립니다. 예: (안녕)&#10;끄면 기호는 찾는 데만 쓰고 안쪽 글자만 그립니다. 예: 안녕">' +
        '<input type="checkbox" data-xrshow="' + r.id + '"' + (r.show !== false ? ' checked' : '') + '> 기호도 함께 표시</label>';
  }
  return '<div class="card xrcard' + (on ? '' : ' off') + '" data-xr="' + r.id + '">' +
    '<div class="xrhead">' +
      '<label class="check" style="margin:0;flex:1 1 auto"><input type="checkbox" data-xron="' + r.id + '"' + (on ? ' checked' : '') + '> ' +
        '<b>' + (isFx ? '외국어' : '괄호 안 글자') + '</b></label>' +
      '<button class="mini" data-xrup="' + r.id + '" title="위로 (같은 종류끼리 겹치면 위 규칙이 먼저)"' + (i === 0 ? ' disabled' : '') + '>▲</button>' +
      '<button class="mini" data-xrdn="' + r.id + '" title="아래로"' + (i === n - 1 ? ' disabled' : '') + '>▼</button>' +
      '<button class="mini danger" data-xrdel="' + r.id + '" title="규칙 지우기">✕</button>' +
    '</div>' +
    '<div class="xrbody"' + (on ? '' : ' hidden') + '>' + body + xrScopeHtml(r) + '</div>' +
  '</div>';
}
function xrPrioHtml(){
  const prio = xPrio();
  return '<div class="field" style="margin:4px 0 4px"><label>색이 겹칠 때 우선순위 (위가 먼저)</label></div>' +
    '<div class="fxprio">' + prio.map((k, i) =>
      '<div class="fxp"><b>' + (i + 1) + '</b><span>' + FX_PRIO_LABEL[k] + '</span>' +
      '<button class="mini" data-xpup="' + k + '" title="위로"' + (i === 0 ? ' disabled' : '') + '>▲</button>' +
      '<button class="mini" data-xpdn="' + k + '" title="아래로"' + (i === prio.length - 1 ? ' disabled' : '') + '>▼</button>' +
      '</div>').join('') + '</div>' +
    '<p class="hint" style="margin:6px 2px 0">글자 하나하나마다, 해당하는 색 가운데 위에 있는 색을 씁니다. 형광펜·굵게·크기는 그대로.<br>' +
    '규칙이 걸린 블록에만 적용됩니다. 규칙이 하나도 없는 블록은 예전처럼 안쪽 표시가 이깁니다.</p>';
}
/* 규칙 칸은 글 탭과 붙여넣기 창 두 곳에 있을 수 있다(붙여넣기 창을 열면 칸째 옮겨 간다) */
function renderXRules(){
  const list = $('#xrList'), pr = $('#xrPrio');
  if (!list) return;
  const rules = state.xrules || [];
  list.innerHTML = rules.length
    ? rules.map((r, i) => xrCardHtml(r, i, rules.length)).join('')
    : '<p class="hint" style="margin:0 0 8px">아직 규칙이 없습니다. 외국어만 다른 색으로 칠하거나, 괄호 안 번역을 다른 색·크기로 그릴 때 추가하세요.</p>';
  pr.innerHTML = xrPrioHtml();
  upgradeRangeRows(list);
}
function xrById(id){ return (state.xrules || []).find(r => r.id === id) || null; }
(() => {
  const body = $('#xrBody');
  body.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.id === 'xrAddFx' || t.id === 'xrAddBr'){
      snapshot();
      const fx = t.id === 'xrAddFx';
      state.xrules.push(fx
        ? {id:uid(), kind:'fx', on:true, color:'#C0392B', scripts:'han,kana,latin,other', scope:{narr:false, all:true, ids:[]}}
        : {id:uid(), kind:'br', on:true, open:'(', close:')', color:'#8A8F99', size:100, show:true, scope:{narr:false, all:true, ids:[]}});
      renderXRules(); renderCanvas();
      return;
    }
    const mv = t.dataset.xrup || t.dataset.xrdn;
    if (mv){
      const i = state.xrules.findIndex(r => r.id === mv), j = i + (t.dataset.xrup ? -1 : 1);
      if (i < 0 || j < 0 || j >= state.xrules.length) return;
      snapshot();
      [state.xrules[i], state.xrules[j]] = [state.xrules[j], state.xrules[i]];
      renderXRules(); renderCanvas();
      return;
    }
    if (t.dataset.xrdel){
      snapshot();
      state.xrules = state.xrules.filter(r => r.id !== t.dataset.xrdel);
      renderXRules(); renderCanvas();
      return;
    }
    const pk = t.dataset.xpup || t.dataset.xpdn;
    if (pk){
      const pr = xPrio(), i = pr.indexOf(pk), j = i + (t.dataset.xpup ? -1 : 1);
      if (i < 0 || j < 0 || j >= pr.length) return;
      snapshot();
      [pr[i], pr[j]] = [pr[j], pr[i]];
      state.xprio = pr.join(',');
      $('#xrPrio').innerHTML = xrPrioHtml();
      renderCanvas();
    }
  });
  body.addEventListener('input', e => {
    const el = e.target;
    const r = xrById(el.dataset.xrcol || el.dataset.xro || el.dataset.xrc || el.dataset.xrsz || '');
    if (!r) return;
    snapshotSoon();
    if (el.dataset.xrcol) r.color = el.value;
    else if (el.dataset.xro) r.open = el.value;
    else if (el.dataset.xrc) r.close = el.value;
    else {
      r.size = Number(el.value);
      const o = el.closest('.rangerow').querySelector('.numin, output'); if (o) o.value = el.value + '%';
    }
    renderCanvas();
  });
  body.addEventListener('change', e => {
    const el = e.target;
    const id = el.dataset.xron || el.dataset.xrshow || el.dataset.xrscr || el.dataset.xrnarr || el.dataset.xrall || el.dataset.xrsp;
    const r = id && xrById(id);
    if (!r) return;
    snapshot();
    const card = el.closest('[data-xr]');
    if (el.dataset.xron){
      r.on = el.checked;
      card.classList.toggle('off', !el.checked);
      const b = card.querySelector('.xrbody'); if (b) b.hidden = !el.checked;
    } else if (el.dataset.xrshow) r.show = el.checked;
    else if (el.dataset.xrscr){
      r.scripts = Array.from(card.querySelectorAll('[data-xrscr]')).filter(x => x.checked).map(x => x.value).join(',');
    } else {
      const sc = xrScope(r);
      if (el.dataset.xrnarr) sc.narr = el.checked;
      else if (el.dataset.xrall){
        sc.all = el.checked;
        /* '모든 화자'를 끄면 화자 고르는 칸이 나온다 — 이미 고른 화자가 없으면 전부 골라 둔 채로 시작 */
        if (!sc.all && !sc.ids.length) sc.ids = state.speakers.map(sp => sp.id);
      } else {
        sc.ids = Array.from(card.querySelectorAll('[data-xrsp]')).filter(x => x.checked).map(x => x.value);
      }
      r.scope = sc;
      if (el.dataset.xrall){
        card.outerHTML = xrCardHtml(r, state.xrules.indexOf(r), state.xrules.length);
        upgradeRangeRows($('#xrList'));
      }
    }
    renderCanvas();
  });
})();
/* ---------------- panel: blocks ---------------- */
const LINE_STYLES = [['solid','실선'],['dashed','점선'],['double','이중선'],['none','선 없음']];
const SYM_PRESETS = [['','없음'],['•  •  •','• • •'],['✦','✦ 별'],['✧','✧ 빈 별'],['❁','❁ 꽃'],['✿','✿ 겹꽃'],
  ['❖','❖ 마름모'],['♡','♡ 하트'],['〜','〜 물결'],['❦','❦ 잎'],['⁂','⁂ 세 점'],['◆ ◆ ◆','◆ ◆ ◆']];
const LEGACY_RULE = {line:{line:'solid',sym:''}, dash:{line:'dashed',sym:''}, double:{line:'double',sym:''},
  dots:{line:'solid',sym:'•  •  •'}, flower:{line:'solid',sym:'❁'}, star:{line:'solid',sym:'✦'}, wave:{line:'solid',sym:'〜'}};
function normRule(b){
  if (b.line === undefined){
    const m = LEGACY_RULE[b.style] || {line:'solid', sym:''};
    b.line = m.line; if (b.sym === undefined) b.sym = m.sym;
  }
  if (b.sym === undefined) b.sym = '';
  if (b.thick === undefined) b.thick = 1;
  if (b.symSize === undefined) b.symSize = 100;
  if (b.width === undefined) b.width = 70;
  if (!b.color) b.color = '#9A93A5';
  return b;
}
function renderBlocks(){
  const list = $('#blockList');
  const sc = list.closest('.pane-scroll');
  const keep = sc ? sc.scrollTop : 0;
  list.innerHTML = '';
  if (!state.blocks.length){
    list.innerHTML = '<div class="empty">아직 대사가 없습니다.<br>위의 <b>대화 붙여넣기</b>로 로그를 한 번에 옮겨 보세요.</div>';
  }
  state.blocks.forEach(bk => {
    const el = document.createElement('div');
    el.className = 'blk' + (bk.type === 'rule' ? ' rule' : '') + (bk.type === 'pb' ? ' pb' : '');
    el.dataset.id = bk.id;

    if (bk.type === 'img'){
      el.className = 'blk img';
      el.innerHTML =
        '<div class="blk-head">' +
          '<span class="grip" title="드래그해서 순서 바꾸기">⠿</span>' +
          '<span class="pgno"></span>' +
          (bk.image ? '<img class="thumb" src="' + escAttr(bk.image) + '">' : '') +
          '<label class="filebtn">' + (bk.image ? '바꾸기' : '이미지 고르기') +
            '<input type="file" accept="image/*" hidden data-img="' + bk.id + '"></label>' +
          (bk.image ? '<button class="mini wide" data-imgcrop="' + bk.id + '" title="잘라내기 · 다시 눌러 고칠 수 있습니다">✂ 자르기</button>' : '') +
          '<span style="flex:1"></span>' +
          '<button class="mini" data-addafter="' + bk.id + '" data-tip="바로 아래에 대사·이미지·구분선·페이지 나누기를 추가합니다">＋</button>' +
          '<button class="mini" data-dup="' + bk.id + '" title="복제">⧉</button>' +
          '<button class="mini danger" data-del="' + bk.id + '" title="삭제">✕</button>' +
        '</div>' +
        (bk.image ? imgOptsHtml(bk) : '');
      list.appendChild(el);
      return;
    }
    if (bk.type === 'html'){
      el.className = 'blk html';
      el.innerHTML =
        '<div class="blk-head">' +
          '<span class="grip" title="드래그해서 순서 바꾸기">⠿</span>' +
          '<span class="pgno"></span>' +
          '<span style="flex:1;font-size:12.5px;color:var(--muted)">HTML 블록</span>' +
          '<button class="mini" data-addafter="' + bk.id + '" data-tip="바로 아래에 대사·이미지·구분선·페이지 나누기를 추가합니다">＋</button>' +
          '<button class="mini" data-dup="' + bk.id + '" title="복제">⧉</button>' +
          '<button class="mini danger" data-del="' + bk.id + '" title="삭제">✕</button>' +
        '</div>' +
        '<div class="htmlsum"><span>' + escHtml(htmlSummary(bk.html)) + '</span>' +
          '<button class="btn sm" data-hedit="' + bk.id + '">수정</button></div>';
      list.appendChild(el);
      return;
    }
    if (bk.type === 'pb'){
      el.innerHTML =
        '<div class="blk-head">' +
          '<span class="grip" title="드래그해서 순서 바꾸기">⠿</span>' +
          '<span class="pgno"></span>' +
          '<span class="pbl">여기서 페이지 나누기</span>' +
          '<button class="mini" data-addafter="' + bk.id + '" data-tip="바로 아래에 대사·이미지·구분선·페이지 나누기를 추가합니다">＋</button>' +
          '<button class="mini danger" data-del="' + bk.id + '" title="삭제">✕</button>' +
        '</div>';
      list.appendChild(el);
      return;
    }
    if (bk.type === 'rule'){
      const b = normRule(bk);
      const isPreset = !b.symCustom && SYM_PRESETS.some(([v]) => v === b.sym);
      el.innerHTML =
        '<div class="blk-head">' +
          '<span class="grip" title="드래그해서 순서 바꾸기">⠿</span>' +
          '<span class="pgno"></span>' +
          '<span class="dot" style="background:' + b.color + '"></span>' +
          '<span style="flex:1;font-size:12.5px;color:var(--muted)">구분선</span>' +
          '<button class="mini" data-addafter="' + b.id + '" data-tip="바로 아래에 대사·구분선·페이지 나누기를 추가합니다">＋</button>' +
          '<button class="mini" data-dup="' + b.id + '" title="복제">⧉</button>' +
          '<button class="mini danger" data-del="' + b.id + '" title="삭제">✕</button>' +
        '</div>' +
        '<div class="ruleopts">' +
          '<select data-rl="' + b.id + '" title="선 모양">' +
            LINE_STYLES.map(([v,l]) => '<option value="' + v + '"' + (b.line === v ? ' selected' : '') + '>' + l + '</option>').join('') +
          '</select>' +
          '<select data-rsym="' + b.id + '" title="가운데 기호">' +
            SYM_PRESETS.map(([v,l]) => '<option value="' + escAttr(v) + '"' + (isPreset && b.sym === v ? ' selected' : '') + '>' + escHtml(l) + '</option>').join('') +
            '<option value="__custom"' + (isPreset ? '' : ' selected') + '>직접 입력…</option>' +
          '</select>' +
          '<input type="color" value="' + b.color + '" data-rc="' + b.id + '">' +
          (isPreset ? '' : '<input type="text" class="symtext" data-rsymtext="' + b.id + '" value="' + escAttr(b.sym) + '" placeholder="넣고 싶은 기호나 글자">') +
          '<div class="rulegrid">' +
            '<div class="rangerow"><span class="lbl">선 길이</span><input type="range" min="10" max="100" value="' + b.width + '" data-rw="' + b.id + '"><output>' + b.width + '%</output></div>' +
            '<div class="rangerow"><span class="lbl">선 두께</span><input type="range" min="1" max="14" value="' + b.thick + '" data-rt="' + b.id + '"><output>' + b.thick + 'px</output></div>' +
            '<div class="rangerow"><span class="lbl">기호 크기</span><input type="range" min="50" max="300" value="' + b.symSize + '" data-rz="' + b.id + '"><output>' + b.symSize + '%</output></div>' +
          '</div>' +
        '</div>';
    } else {
      const sp = speakerOf(bk.speakerId);
      const opts = ['<option value=""' + (!sp ? ' selected' : '') + '>나레이션 (화자 없음)</option>']
        .concat(state.speakers.map(s => '<option value="' + s.id + '"' + (bk.speakerId === s.id ? ' selected' : '') + '>' + escHtml(s.name) + '</option>')).join('');
      el.innerHTML =
        '<div class="blk-head">' +
          '<span class="grip" title="드래그해서 순서 바꾸기">⠿</span>' +
          '<span class="pgno"></span>' +
          '<span class="dot" style="background:' + (sp ? sp.bubble : '#E7E2ED') + '"></span>' +
          '<select data-sp="' + bk.id + '">' + opts + '</select>' +
          '<button class="mini" data-addafter="' + bk.id + '" data-tip="바로 아래에 대사·구분선·페이지 나누기를 추가합니다">＋</button>' +
          '<button class="mini" data-dup="' + bk.id + '" title="복제">⧉</button>' +
          '<button class="mini danger" data-del="' + bk.id + '" title="삭제">✕</button>' +
        '</div>' +
        '<div class="fmt">' +
          '<button data-fmt="' + bk.id + '" data-a="**" data-b="**" title="굵게 (Ctrl+B)"><b>B</b></button>' +
          '<button data-fmt="' + bk.id + '" data-a="_" data-b="_" title="기울임 (Ctrl+I)"><i>I</i></button>' +
          '<span class="split"><button data-mark="' + bk.id + '" title="형광펜 (Ctrl+H)">' +
            '<i class="swatchdot" style="background:' + markBgOf(withAlpha(state.markColor || '#FDE68A', state.markAlpha)) + '"></i>형광</button>' +
            '<button class="caret" data-markset="' + bk.id + '" title="형광펜 색과 투명도">▾</button></span>' +
          '<span class="split"><button data-ink="' + bk.id + '" title="선택한 글자의 색 바꾸기">' +
            '<i class="swatchdot" style="background:' + (state.inkColor || '#D9534F') + '"></i>글자색</button>' +
            '<button class="caret" data-inkset="' + bk.id + '" title="글자색 고르기">▾</button></span>' +
          '<span class="split"><button data-ul="' + bk.id + '" title="선택한 글자에 밑줄 (Ctrl+U)"><i class="swatchdot" style="background:' + (state.ulColor || '#D9534F') + '"></i><u>밑줄</u></button>' +
            '<button class="caret" data-ulset="' + bk.id + '" title="밑줄 색 고르기">▾</button></span>' +
          '<span class="split"><button data-size="' + bk.id + '" title="글자 크기">글자 크기</button>' +
            '<button class="caret" data-sizeset="' + bk.id + '" title="크기 고르기">▾</button></span>' +
          '<button data-fmt="' + bk.id + '" data-a="*(" data-b=")*" title="행동 지문">지문</button>' +
          '<button data-fmt="' + bk.id + '" data-a="&quot;" data-b="&quot;" title="큰따옴표">" "</button>' +
          '<button data-strip="' + bk.id + '" title="굵게·형광·글자색·기울임만 지웁니다. 행동 지문 기호는 남습니다. 선택한 곳이 없으면 블록 전체">서식 지우기</button>' +
        '</div>' +
        '<div class="ed" contenteditable="true" spellcheck="false" data-tx="' + bk.id + '" data-ph="대사를 입력하세요">' + edHtml(bk) + '</div>' +
        '<div class="blk-foot">' +
          '<span class="left">' +
          '<select class="alignsel" data-al="' + bk.id + '" title="이 블록의 텍스트 정렬">' +
            ['','left','center','right','justify'].map(v => '<option value="' + v + '"' + ((bk.align || '') === v ? ' selected' : '') + '>' +
              ({'':'정렬: 기본', left:'왼쪽', center:'가운데', right:'오른쪽', justify:'양쪽'}[v]) + '</option>').join('') +
          '</select>' +
          '<select class="alignsel" data-bfont="' + bk.id + '" title="이 블록만 다른 글꼴로">' +
            fontOptions(bk.font || '', '글꼴: 기본') + '</select>' +
          '<label class="check boxchk"><input type="checkbox" data-bbox="' + bk.id + '"' + (bk.box ? ' checked' : '') + '> 바탕 상자</label>' +
          '</span>' +
        '</div>' +
        (bk.box ? boxOptsHtml(bk) : '');
    }
    list.appendChild(el);
  });
  upgradeRangeRows(list);
  list.querySelectorAll('textarea').forEach(autosize);
  if (sc) sc.scrollTop = keep;
  $('#cntBlocks').textContent = state.blocks.filter(b => b.type === 'line' || b.type === 'img').length;
}
function boxOptsHtml(bk){
  const pad = bk.boxPad == null ? 70 : bk.boxPad;
  const rad = bk.boxRadius == null ? 40 : bk.boxRadius;
  const op = bk.boxOpacity == null ? 100 : bk.boxOpacity;
  return '<div class="boxopts">' +
    '<div class="row2">' +
      '<div class="field" style="margin:0"><label>바탕색</label>' +
        '<input type="color" data-bboxc="' + bk.id + '" value="' + escAttr(bk.boxColor || '#F1EFEA') + '"></div>' +
      '<div class="field" style="margin:0"><label>선 색</label>' +
        '<input type="color" data-bboxl="' + bk.id + '" value="' + escAttr(bk.boxLine || '#B9B2A6') + '"' +
        (bk.boxEdge === 'none' ? ' disabled' : '') + '></div>' +
    '</div>' +
    '<label class="check" style="margin:0 0 7px"><input type="checkbox" data-bboxe="' + bk.id + '"' +
      (bk.boxEdge === 'none' ? '' : ' checked') + '> 테두리 선 넣기</label>' +
    '<div class="rangerow"><span class="lbl">여백</span><input type="range" min="0" max="220" value="' + pad + '" data-bboxp="' + bk.id + '"><output>' + (pad / 100).toFixed(2) + 'em</output></div>' +
    '<div class="rangerow"><span class="lbl">모서리</span><input type="range" min="0" max="200" value="' + rad + '" data-bboxr="' + bk.id + '"><output>' + (rad / 100).toFixed(2) + 'em</output></div>' +
    '<div class="rangerow"><span class="lbl">진하기</span><input type="range" min="10" max="100" value="' + op + '" data-bboxo="' + bk.id + '"><output>' + op + '%</output></div>' +
  '</div>';
}
function imgOptsHtml(bk){
  const w = bk.imgW == null ? 100 : bk.imgW;
  const op = bk.imgOp == null ? 100 : bk.imgOp;
  const side = isSideAlign(bk.imgAlign);
  const alSel = '<select data-ial="' + bk.id + '" title="이미지 정렬"' + (side ? ' style="flex:1 1 100%"' : '') + '>' +
        IMG_ALIGNS.map(([v,l]) => '<option value="' + v + '"' + ((bk.imgAlign || '') === v ? ' selected' : '') + '>' + l + '</option>').join('') +
      '</select>';
  if (side){
    const sw = sideWOf(bk);
    return '<div class="imgopts">' +
      '<div class="row2">' + alSel + '</div>' +
      '<div class="rangerow"><span class="lbl">그림 폭</span><input type="range" min="20" max="80" value="' + sw + '" data-isw="' + bk.id + '"><output>' + sw + '%</output></div>' +
      '<div class="rangerow"><span class="lbl">투명도</span><input type="range" min="10" max="100" value="' + op + '" data-iop="' + bk.id + '"><output>' + op + '%</output></div>' +
      '<p class="hint" style="margin:6px 2px 0">그림이 놓인 <b>그 장</b>의 한쪽을 위아래 끝까지 채웁니다. 그 장의 글은 앞뒤 블록 모두 반대쪽으로 비켜나고, 넘치는 글은 다음 장으로 넘어갑니다. 한 장에 왼쪽·오른쪽 하나씩 둘 수 있습니다. 비율이 안 맞으면 키워서 잘라 맞춥니다.</p>' +
    '</div>';
  }
  return '<div class="imgopts">' +
    '<div class="row2">' +
      '<select data-ish="' + bk.id + '" title="테두리 모양">' +
        IMG_SHAPES.map(([v,l]) => '<option value="' + v + '"' + ((bk.imgShape || 'round') === v ? ' selected' : '') + '>' + l + '</option>').join('') +
      '</select>' + alSel +
    '</div>' +
    '<div class="rangerow"><span class="lbl">크기</span><input type="range" min="10" max="100" value="' + w + '" data-iw="' + bk.id + '"><output>' + w + '%</output></div>' +
    '<div class="rangerow"><span class="lbl">투명도</span><input type="range" min="10" max="100" value="' + op + '" data-iop="' + bk.id + '"><output>' + op + '%</output></div>' +
    '<div class="rangerow"><span class="lbl">흐리게</span><select data-ifade="' + bk.id + '" style="flex:1 1 auto;min-width:0" title="고른 쪽 가장자리를 투명하게 녹여 바탕에 스며들게 합니다">' +
      FADE_MODES.map(([v, l]) => '<option value="' + v + '"' + ((bk.imgFade || 'none') === v ? ' selected' : '') + '>' + l + '</option>').join('') +
    '</select></div>' +
    ((bk.imgFade || 'none') !== 'none'
      ? '<div class="rangerow"><span class="lbl">흐림 폭</span><input type="range" min="5" max="100" value="' + (Number(bk.imgFadeSize) || 35) +
        '" data-ifs="' + bk.id + '"><output>' + (Number(bk.imgFadeSize) || 35) + '%</output></div>' : '') +
    '<div class="bleeds">' +
      '<label class="check"><input type="checkbox" data-ibx="' + bk.id + '"' + (bk.bleedX ? ' checked' : '') + '> 좌우 끝까지 채우기</label>' +
      '<label class="check"><input type="checkbox" data-ibt="' + bk.id + '"' + (bk.bleedT ? ' checked' : '') + '> 쪽 맨 위면 위쪽 끝까지</label>' +
      '<label class="check"><input type="checkbox" data-ibb="' + bk.id + '"' + (bk.bleedB ? ' checked' : '') + '> 쪽 맨 아래면 아래쪽 끝까지</label>' +
      '<p class="hint" style="margin:6px 2px 0">셋 다 켠 그림이 그 쪽을 혼자 쓰면 <b>쪽 전체를 덮는 삽화</b>가 됩니다. 비율이 안 맞으면 키워서 잘라 맞춥니다.<br>양면 펼침에서는 한쪽 면만 덮습니다 — 제본선을 넘지 않습니다.</p>' +
    '</div>' +
  '</div>';
}
/* height를 auto로 되돌리는 순간 목록이 잠깐 줄어들며 스크롤이 위로 밀린다. 위치를 붙잡아 둔다. */
function autosize(ta){
  const sc = ta.closest('.pane-scroll');
  const keep = sc ? sc.scrollTop : 0;
  ta.style.height = 'auto';
  ta.style.height = (ta.scrollHeight + 2) + 'px';
  if (sc && sc.scrollTop !== keep) sc.scrollTop = keep;
}

/* ---------------- controls sync ---------------- */
function fillSelect(el, table, value){
  if (el.dataset.filled !== '1'){
    el.innerHTML = table.map(([v, l]) => '<option value="' + escAttr(v) + '">' + escHtml(l) + '</option>').join('');
    el.dataset.filled = '1';
  }
  el.value = value;
}
function renderThemes(){
  const g = $('#themeGrid');
  g.innerHTML = Object.entries(THEMES).map(([k, t]) =>
    '<button class="theme" data-theme="' + k + '" aria-pressed="' + (state.theme === k ? 'true' : 'false') + '">' +
      '<span class="sw" style="background:' + t.bg + '"><i style="background:' + t.pairs[0].bubble + '"></i><i style="background:' + t.pairs[1].bubble + '"></i></span>' +
      '<em>' + t.label + '</em>' +
    '</button>').join('');
}
function syncControls(){
  if (MODE_MIGRATE[state.mode]) state.mode = MODE_MIGRATE[state.mode];
  $$('#modeSegA button, #modeSegB button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === state.mode ? 'true' : 'false'));
  $('#bubbleOpts').hidden = !(state.mode === 'bubble' || state.mode === 'mixed');
  $('#lineOpts').hidden = state.mode !== 'line';
  $('#quoteOpts').hidden = state.mode !== 'quote';
  fillSelect($('#nameSep'), NAMESEPS, state.nameSep || '');
  fillSelect($('#wrapQuote'), WRAPS, state.wrapQuote || 'none');
  fillSelect($('#wrapQuote2'), WRAPS, state.wrapQuote || 'none');
  renderQuoteTpls();
  $('#optHideNames').checked = state.hideNames;
  $('#optAligned').checked = state.alignedText;
  $('#mkParenStar').checked = state.marks.parenStar !== false;
  $('#mkStar').checked = state.marks.star;
  $('#mkParen').checked = state.marks.paren;
  $('#mkQuote').checked = state.marks.quote;
  renderMarkRules();
  $('#actionMode').value = state.actionMode;
  $$('#alignSeg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === (state.textAlign || 'left') ? 'true' : 'false'));
  $('#modeHint').textContent = MODE_HINT[state.mode] || '';
  if (state.frame && state.frame !== 'none' && state.frame !== 'custom' && !FRAME_ELS[state.frame]) state.frame = 'none';
  $('#frameSel').value = state.frame || 'none';
  $('#frameAsk').value = state.frameAsk || 'ask';
  $('#frameOpts').hidden = !state.frame || state.frame === 'none' || state.frame === 'custom';
  $('#frameCustom').hidden = state.frame !== 'custom';
  const els = FRAME_ELS[state.frame] || [];
  $('#frameElsWrap').hidden = !els.length;
  $('#frameChoiceWrap').hidden = !(state.frame === 'vn' && elOn('choices'));
  $('#frameChoiceText').value = state.frameChoiceText || '';
  const vars = FRAME_VARIANTS[state.frame];
  $('#frameVarWrap').hidden = !vars;
  if (vars) $('#frameVar').innerHTML = vars.map(([vv, ll]) =>
    '<option value="' + vv + '"' + (fvar() === vv ? ' selected' : '') + '>' + ll + '</option>').join('');
  $('#frameFields').innerHTML = (state.frame === 'custom' ? [] : fieldsFor()).map(fd => {
    const cur = ftx(fd.k, '');
    if (fd.type === 'image'){
      const img = fim(fd.k);
      return '<div class="field"><label>' + fd.l + '</label><div style="display:flex;gap:7px;align-items:center">' +
        '<label class="filebtn" style="height:32px">' + (img ? '바꾸기' : '고르기') +
          '<input type="file" accept="image/*" hidden data-fimg="' + fd.k + '"></label>' +
        (img ? '<img class="thumb" src="' + escAttr(img) + '">' +
          '<button class="btn sm" data-fcrop="' + fd.k + '" style="white-space:nowrap">✂ 자르기</button>' +
          '<button class="btn sm" data-fimgdel="' + fd.k + '">지우기</button>' : '') +
        '</div></div>';
    }
    if (fd.type === 'color'){
      return '<div class="field"><label>' + fd.l + '</label>' +
        '<input type="color" class="swatch" data-ftxc="' + fd.k + '" value="' + escAttr(cur || fd.ph) + '"></div>';
    }
    if (fd.type === 'select'){
      return '<div class="field"><label>' + fd.l + '</label><select data-ftx="' + fd.k + '">' +
        fd.opts.map(([vv, ll]) => '<option value="' + vv + '"' + ((cur || fd.opts[0][0]) === vv ? ' selected' : '') + '>' + ll + '</option>').join('') +
        '</select></div>';
    }
    if (fd.type === 'area'){
      return '<div class="field"><label>' + fd.l + '</label><textarea rows="3" data-ftx="' + fd.k + '" placeholder="' + escAttr(fd.ph || '') + '">' + escHtml(cur) + '</textarea></div>';
    }
    return '<div class="field"><label>' + fd.l + '</label><input type="text" data-ftx="' + fd.k + '" value="' + escAttr(cur) + '" placeholder="' + escAttr(fd.ph || '') + '"></div>';
  }).join('');
  $('#frameEls').innerHTML = els.map(([k, label]) =>
    '<label class="check"><input type="checkbox" data-fel="' + k + '"' + (elOn(k) ? ' checked' : '') + '> ' + label + '</label>').join('');
  $('#frameHtml').value = state.frameHtml || '';
  ['insT','insB','insX'].forEach(id => { $('#' + id).value = (state.frameText || {})['custom.' + id] || ''; });
  $('#frameOnTop').checked = !!state.frameOnTop;
  $('#frameColor').value = state.frameColor || '#E9E7EC';
  $('#frameTitle').value = state.frameTitle || '';
  const tlbl = FRAME_TITLE_LBL[state.frame] || '제목';
  $('#frameTitleWrap').hidden = tlbl === '쓰지 않음';
  $('#frameTitleLbl').textContent = tlbl;
  $('#frameTitle').placeholder = FRAME_TITLE_PH[state.frame] || '창 제목';
  $('#ratioSel').value = state.ratio;
  $('#usePageNo').checked = !!state.usePageNo;
  $('#useDocTitle').checked = !!state.useDocTitle;
  $('#useStamp').checked = !!state.useStamp;
  $('#pageNoOpts').hidden = !state.usePageNo;
  $('#docTitleOpts').hidden = !state.useDocTitle;
  $('#stampOpts').hidden = !state.useStamp;
  $('#pageNoSel').value = (state.pageNo && state.pageNo !== 'off') ? state.pageNo : 'num';
  $('#pageNoPos').value = state.pageNoPos || 'bc';
  $('#pageNoColor').value = state.pageNoColor || '#8A8A8E';
  $('#pageNoSize').value = state.pageNoSize || 12;
  $('#pageNoSizeOut').value = (state.pageNoSize || 12) + 'px';
  $('#docTitle').value = state.docTitle || '';
  $('#docTitleAlign').value = state.docTitleAlign || 'center';
  $('#docTitleWhere').value = state.docTitleWhere || 'all';
  $('#docTitleColor').value = state.docTitleColor || '#8A8A8E';
  $('#docTitleFont').value = state.docTitleFont || '';
  $('#docTitleDeco').value = state.docTitleDeco || 'rule';
  $('#docTitleEyebrow').value = state.docTitleEyebrow || '';
  $('#docTitleEyebrowWrap').hidden = (state.docTitleDeco || 'rule') !== 'tag';
  $('#stampText').value = state.stampText || '';
  $('#stampPos').value = state.stampPos || 'bl';
  $('#stampColor').value = state.stampColor || '#A5A5AA';
  $('#stampSize').value = state.stampSize || 11;
  $('#stampFont').innerHTML = fontOptions(state.stampFont || '', '기본 글꼴');
  $('#customRatio').hidden = state.ratio !== 'custom';
  $('#customRatioTip').hidden = state.ratio !== 'custom';
  $('#ratioW').value = state.ratioW; $('#ratioH').value = state.ratioH;
  $('#bgKind').value = state.bgKind;
  $('#bgColor').value = state.bgColor;
  $('#bgColor2').value = state.bgColor2;
  $('#bgFit').value = state.bgFit || 'cover';
  $('#bgUnder').value = state.bgUnder || 'solid';
  fillSelect($('#bgFade'), FADE_MODES, state.bgFade || 'none');
  $('#bgFadeSize').value = Number(state.bgFadeSize) || 35;
  { const o = $('#bgFadeSize').closest('.rangerow').querySelector('.numin, output'); if (o) o.value = (Number(state.bgFadeSize) || 35) + '%'; }
  syncBgWraps();
  $('#bgSolid').hidden = state.bgKind === 'none';
  fillSelect($('#bgPattern'), BG_PATTERNS, state.bgPattern || 'none');
  $('#bgPatWrap').hidden = state.bgKind === 'none';
  $('#bgPatOpts').hidden = state.bgKind === 'none' || (state.bgPattern || 'none') === 'none';
  $('#bgPatSymWrap').hidden = state.bgPattern !== 'symbol';
  $('#bgPatColor').value = state.bgPatColor || '#FFFFFF';
  $('#bgPatSymbol').value = state.bgPatSymbol || '★';
  $('#bgPatSize').value = state.bgPatSize; $('#bgPatSizeOut').value = state.bgPatSize + 'px';
  $('#bgPatOp').value = state.bgPatOpacity; $('#bgPatOpOut').value = state.bgPatOpacity + '%';
  $('#tint').value = state.tint; $('#tintOut').value = state.tint;
  $('#fontSel').value = state.font;
  $('#fsRange').value = state.fontSize; $('#fsOut').value = state.fontSize + 'px';
  state.lineHeight = Number(state.lineHeight) || 1.65;
  $('#lhRange').value = Math.round(state.lineHeight * 100); $('#lhOut').value = state.lineHeight.toFixed(2);
  $('#lsRange').value = state.letterSpace || 0; $('#lsOut').value = ((state.letterSpace || 0) / 100).toFixed(2);
  $('#hsRange').value = hScaleOf(); $('#hsOut').value = hScaleOf() + '%';
  $('#fwRange').value = fontWeightOf(); $('#fwOut').value = fontWeightOf();
  $('#wbSel').value = state.wordBreak === 'word' ? 'word' : 'char';
  $('#pgRange').value = state.pgap; $('#pgOut').value = ((state.pgap || 0) / 100).toFixed(2);
  $('#inRange').value = state.indent || 0; $('#inOut').value = ((state.indent || 0) / 100).toFixed(2);
  $('#inOn').checked = indentIsOn();
  $('#inOpts').hidden = !indentIsOn();
  $('#inDlg').checked = state.indentDlg !== false;
  $('#bubShape').value = state.bubbleShape || 'notch';
  $('#shapeHint').hidden = state.bubbleShape !== 'panel';
  $('#bubShadow').value = state.bubbleShadow === false ? '0' : '1';
  $('#bwRange').value = state.bubbleWidth; $('#bwOut').value = state.bubbleWidth + '%';
  $('#bwRange2').value = state.bubbleWidth; $('#bwOut2').value = state.bubbleWidth + '%';
  $('#bpRange').value = state.bubblePad; $('#bpOut').value = (state.bubblePad / 100).toFixed(2);
  $('#padXRange').value = state.padX; $('#padXOut').value = state.padX + 'px';
  $('#padYRange').value = state.padY; $('#padYOut').value = state.padY + 'px';
  $('#gapRange').value = state.gap; $('#gapOut').value = state.gap + 'px';
  $('#bubRange').value = state.bubbleRadius; $('#bubOut').value = state.bubbleRadius + 'px';
  $('#radRange').value = state.canvasRadius; $('#radOut').value = state.canvasRadius + 'px';
  $('#expW').value = state.exportW; $('#expName').value = state.exportName;
  $('#expMode').value = state.exportMode || 'zip';
  $('#expPages').value = state.exportPages || 'all';
  renderThemes();
}
function renderAll(){ syncControls(); renderCast(); renderBlocks(); renderCanvas(); renderMemos(); }


/* ---------------- 메모 ---------------- */
/* 새 메모는 바탕 없이 글자만 — 꾸밈은 필요할 때 켠다 */
const MEMO_DEFAULT = () => ({text:'', page:0, x:55, y:5, w:40, font:'', size:14, color:'#5B5952', align:'left',
  rotate:0, box:false, boxColor:'#FFF6BF', boxOpacity:100, boxEdge:'none', boxLine:'#D9C878', boxPad:60, boxRadius:30});
function memoById(id){ return (state.memos || []).find(m => m.id === id) || null; }
function memoInner(m){
  /* **굵게** · _기울임_ · ==형광== 같은 표시는 대사와 같게 읽는다. 지문 규칙은 쓰지 않는다 */
  const c = {action:'', mark: markBgOf(withAlpha(state.markColor || '#FDE68A', state.markAlpha))};
  return String(m.text || '').split('\n').map(line =>
    line.trim() ? nodesToHtml(parseInline(line, {}, false), c) : '&nbsp;').join('<br>');
}
function paintMemos(pages){
  (state.memos || []).forEach(m => {
    if (m.kind === 'note') return;
    if (m.kind === 'img' ? !m.src : !String(m.text || '').trim()) return;
    const pp = pages[clamp(Math.round(Number(m.page) || 0), 0, pages.length - 1)];
    if (!pp) return;
    const el = document.createElement('div');
    el.className = 'memo';
    el.dataset.memo = m.id;
    el.style.left = (Number(m.x) || 0) + '%';
    el.style.top = (Number(m.y) || 0) + '%';
    el.style.maxWidth = clamp(Number(m.w) || 38, 10, 100) + '%';
    el.style.fontSize = clamp(Number(m.size) || 14, 6, 60) + 'px';
    el.style.color = m.color || '#3A3A3A';
    el.style.fontFamily = m.font || state.font;
    el.style.fontWeight = m.bold ? '700' : '400';
    el.style.fontStyle = m.italic ? 'italic' : 'normal';
    el.style.textAlign = m.align || 'left';
    if (Number(m.rotate)) el.style.transform = 'rotate(' + Number(m.rotate) + 'deg)';
    if (m.box){
      el.style.background = hexToRgba(m.boxColor || '#FFF6BF', (m.boxOpacity == null ? 100 : m.boxOpacity) / 100);
      const pad = (m.boxPad == null ? 70 : m.boxPad) / 100;
      el.style.padding = pad + 'em ' + (pad * 1.3) + 'em';
      el.style.borderRadius = ((m.boxRadius == null ? 30 : m.boxRadius) / 100) + 'em';
      if (m.boxEdge === 'line') el.style.borderColor = m.boxLine || '#D9C878';
    }
    if (m.kind === 'img'){
      /* 짤 — 폭은 장 너비에 대한 비율 */
      el.classList.add('memo-img');
      el.style.maxWidth = 'none';
      el.style.width = clamp(Number(m.w) || 30, 5, 100) + '%';
      el.style.opacity = (m.op == null ? 100 : m.op) / 100;
      el.innerHTML = '<img src="' + escAttr(m.src) + '" alt="" draggable="false">';
    } else el.innerHTML = memoInner(m);
    pp.page.appendChild(el);
  });
}
/* ---- 밑줄 그리기 ----
   밑줄은 글자 장식이 아니라 줄마다 따로 그린 막대다. text-decoration은 저장 이미지(html2canvas)에서
   굵기·위치가 미리보기와 달라지고, 여러 줄에 걸친 테두리는 한 덩어리로 그려진다. */
function pageRel(page){
  const pr = page.getBoundingClientRect();
  return r => ({l: (r.left - pr.left) / zoom, t: (r.top - pr.top) / zoom, r: (r.right - pr.left) / zoom, b: (r.bottom - pr.top) / zoom});
}
function noteOf(id){ const m = memoById(id); return m && m.kind === 'note' ? m : null; }
function paintUnderlines(pages){
  pages.forEach(pp => {
    const rel = pageRel(pp.page);
    pp.page.querySelectorAll('.ul').forEach(sp => {
      const note = sp.dataset.note ? noteOf(sp.dataset.note) : null;
      const thick = note ? clamp(Number(note.thick) || 2, 1, 6) : 2;
      const col = markBgOf(note ? (note.color || sp.dataset.ulc) : sp.dataset.ulc);
      Array.from(sp.getClientRects()).forEach(r0 => {
        const r = rel(r0);
        if (r.r - r.l < 1) return;
        const ln = document.createElement('div');
        ln.className = 'ulline';
        ln.style.left = r.l + 'px';
        ln.style.width = (r.r - r.l) + 'px';
        ln.style.top = (r.b - thick * .5) + 'px';
        ln.style.height = thick + 'px';
        ln.style.background = col;
        pp.page.appendChild(ln);
      });
    });
  });
}
/* ---- 필기 ----
   대사 속 글자에 밑줄을 긋고, 그 옆에 하고 싶은 말을 단다. 잇는 모양은 다섯 가지:
   leader 꺾은 지시선 · bubble 말풍선 꼬리 · num 번호 각주 · none 밑줄만. (예전 arrow는 지시선으로 그린다)
   글 상자 자리는 밑줄 끝에서 떨어진 거리(dx, dy)로 적어 두어, 글줄이 바뀌어도 밑줄을 따라다닌다.
   선은 글 상자에서 가장 가까운 밑줄 줄에서 나온다 — 여러 줄 밑줄의 끝에서 나오면 다른 줄 글자를 가로지른다. */
const NOTE_TAILS = [['leader','꺾은 지시선'],['bubble','말풍선 꼬리'],['num','번호 각주'],['none','밑줄만']];
const noteTailOf = v => NOTE_TAILS.some(x => x[0] === v) ? v : 'leader';
const NOTE_DEFAULT = () => ({kind:'note', text:'', color:'#D9534F', textColor:'', thick:2, size:13, font:'', w:42, dx:18, dy:null, align:'left',
  tail: noteTailOf(state.noteTail), bubbleBg:'#FFFFFF', bubbleOp:100, bubbleLine:''});
function paintNotes(pages){
  const nums = new Map();   /* 번호 각주는 장마다 위에서부터 1, 2, 3 */
  (state.memos || []).forEach(m => {
    if (m.kind !== 'note') return;
    let page = null, rects = [];
    pages.forEach(pp => {
      if (page) return;
      const sps = pp.page.querySelectorAll('.ul[data-note="' + m.id + '"]');
      if (!sps.length) return;
      const rel = pageRel(pp.page);
      sps.forEach(sp => Array.from(sp.getClientRects()).forEach(r0 => { if (r0.width >= 1) rects.push(rel(r0)); }));
      if (rects.length) page = pp.page;
    });
    if (!page) return;
    const last = rects[rects.length - 1];
    /* 처음 놓는 자리는 밑줄 친 첫 줄 위 — 여러 줄 밑줄이면 마지막 줄 위에 두면 앞 줄 글자를 덮는다 */
    const anchor = {x: last.r, y: last.b, top: Math.min(...rects.map(r => r.t))};
    const tail = noteTailOf(m.tail);
    const el = document.createElement('div');
    el.className = 'memo notebox' + (tail === 'bubble' ? ' nb-bubble' : '');
    el.dataset.memo = m.id;
    el.dataset.ax = anchor.x; el.dataset.ay = anchor.y;
    el.style.left = (anchor.x + (Number(m.dx) || 0)) + 'px';
    el.style.top = (anchor.y + (Number(m.dy) || 0)) + 'px';
    el.style.maxWidth = clamp(Number(m.w) || 42, 10, 100) + '%';
    el.style.fontSize = clamp(Number(m.size) || 13, 6, 60) + 'px';
    const col = markBgOf(m.color || '#D9534F');
    el.style.color = m.textColor || col;
    el.style.fontFamily = m.font || state.font;
    el.style.textAlign = m.align || 'left';

    let numHtml = '';
    if (tail === 'num'){
      const n = (nums.get(page) || 0) + 1; nums.set(page, n);
      numHtml = '<sup class="notenum" style="color:' + col + '">' + n + '</sup> ';
      const mk = document.createElement('div');
      mk.className = 'notemark';
      mk.style.color = col;
      mk.style.left = (last.r + 1) + 'px';
      mk.style.top = (last.t - 3) + 'px';
      mk.textContent = n;
      page.appendChild(mk);
    }
    el.innerHTML = numHtml + (String(m.text || '').trim() ? memoInner(m) : '&nbsp;');
    page.appendChild(el);
    /* 아직 옮기지 않은 필기는 밑줄 줄 바로 위에 겹치지 않게 놓는다. 위가 모자라면 아래로 */
    if (m.dy == null){
      let top = anchor.top - 12 - el.offsetHeight;
      if (top < 4) top = anchor.y + 12;
      el.style.top = top + 'px';
    }
    /* 장 밖으로 나가면 안쪽으로 당긴다 */
    const over = el.offsetLeft + el.offsetWidth - (page.offsetWidth - 6);
    if (over > 0) el.style.left = Math.max(6, el.offsetLeft - over) + 'px';
    if (el.offsetLeft < 6) el.style.left = '6px';
    if (el.offsetTop < 4) el.style.top = '4px';
    if (tail === 'leader' || tail === 'bubble') drawNoteTail(page, m, rects, el, tail);
  });
}
/* 글 상자에서 가장 가까운 밑줄 줄과, 그 줄에서 선이 나올 자리.
   상자가 위에 있으면 글자 윗변에서, 아래면 밑줄에서, 옆이면 줄 끝에서 나온다 — 글자를 가로지르지 않게. */
function noteAttach(rects, box){
  const dist = r => {
    const dx = Math.max(box.l - r.r, r.l - box.r, 0), dy = Math.max(box.t - r.b, r.t - box.b, 0);
    return Math.hypot(dx, dy);
  };
  const r = rects.reduce((a, b) => dist(b) < dist(a) ? b : a, rects[0]);
  const cx = (box.l + box.r) / 2;
  if (box.b <= r.t) return {x: clamp(cx, r.l + 4, r.r - 4), y: r.t - 2, dir: 'up'};
  if (box.t >= r.b) return {x: clamp(cx, r.l + 4, r.r - 4), y: r.b + 3, dir: 'down'};
  return box.l >= r.r ? {x: r.r + 3, y: (r.t + r.b) / 2, dir: 'right'} : {x: r.l - 3, y: (r.t + r.b) / 2, dir: 'left'};
}
function noteCanvas(page, pts, pad, draw){
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const x0 = Math.floor(Math.min(...xs) - pad), y0 = Math.floor(Math.min(...ys) - pad);
  const w = Math.ceil(Math.max(...xs) + pad) - x0, h = Math.ceil(Math.max(...ys) + pad) - y0;
  if (w < 2 || h < 2) return;
  const k = 4;  /* 저장 해상도에서도 매끈하게 크게 그려 둔다 */
  const cv = document.createElement('canvas');
  cv.className = 'notetail';
  cv.width = w * k; cv.height = h * k;
  cv.style.left = x0 + 'px'; cv.style.top = y0 + 'px';
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  const g = cv.getContext('2d');
  g.scale(k, k); g.translate(-x0, -y0);
  draw(g);
  page.appendChild(cv);
  return cv;
}
function drawNoteTail(page, m, rects, el, tail){
  const box = {l: el.offsetLeft, t: el.offsetTop, r: el.offsetLeft + el.offsetWidth, b: el.offsetTop + el.offsetHeight};
  const a = noteAttach(rects, box);
  const col = markBgOf(m.color || '#D9534F'), thick = clamp(Number(m.thick) || 2, 1, 6);
  const gap = 5;
  /* 상자에서 출발점에 가장 가까운 자리 */
  const q = {x: clamp(a.x, box.l, box.r), y: clamp(a.y, box.t, box.b)};
  const inside = q.x > box.l && q.x < box.r && q.y > box.t && q.y < box.b;
  if (inside && tail !== 'bubble') return;
  if (tail === 'bubble'){
    /* 상자와 꼬리를 한 줄의 테두리로 함께 그린다 — 바탕을 투명하게 해도 꼬리 이음매가 비치지 않는다 */
    /* 상자가 밑줄을 덮고 있으면 꼬리 없이 상자만 */
    const side = inside ? '' : q.y === box.t ? 't' : q.y === box.b ? 'b' : q.x === box.l ? 'l' : 'r';
    const R = Math.min(10, (box.b - box.t) / 2, (box.r - box.l) / 2), half = 6;
    const tip = [a.x, a.y];
    const bx = clamp(q.x, box.l + R + half, box.r - R - half), by = clamp(q.y, box.t + R + half, box.b - R - half);
    const line = markBgOf(m.bubbleLine || m.color || '#D9534F');
    const op = (m.bubbleOp == null ? 100 : m.bubbleOp) / 100;
    const cv = noteCanvas(page, [[box.l, box.t], [box.r, box.b], tip], 4, g => {
      const {l, t, r, b} = box;
      g.beginPath();
      g.moveTo(l + R, t);
      if (side === 't'){ g.lineTo(bx - half, t); g.lineTo(tip[0], tip[1]); g.lineTo(bx + half, t); }
      g.lineTo(r - R, t); g.arcTo(r, t, r, t + R, R);
      if (side === 'r'){ g.lineTo(r, by - half); g.lineTo(tip[0], tip[1]); g.lineTo(r, by + half); }
      g.lineTo(r, b - R); g.arcTo(r, b, r - R, b, R);
      if (side === 'b'){ g.lineTo(bx + half, b); g.lineTo(tip[0], tip[1]); g.lineTo(bx - half, b); }
      g.lineTo(l + R, b); g.arcTo(l, b, l, b - R, R);
      if (side === 'l'){ g.lineTo(l, by + half); g.lineTo(tip[0], tip[1]); g.lineTo(l, by - half); }
      g.lineTo(l, t + R); g.arcTo(l, t, l + R, t, R);
      g.closePath();
      if (op > 0){ g.fillStyle = hexToRgba(m.bubbleBg || '#FFFFFF', op); g.fill(); }
      g.strokeStyle = line; g.lineWidth = 1.5; g.lineJoin = 'round'; g.stroke();
    });
    if (cv) cv.style.zIndex = 29;
    return;
  }
  /* 상자 변에서 살짝 띄운 끝점 */
  const e = {x: q.x, y: q.y};
  if (q.x === box.l) e.x -= gap; else if (q.x === box.r) e.x += gap;
  if (q.y === box.t) e.y -= gap; else if (q.y === box.b) e.y += gap;
  if (Math.hypot(e.x - a.x, e.y - a.y) < 6) return;
  if (tail === 'leader'){
    /* 출발점에서 세로로, 상자 높이에서 가로로 꺾는다 */
    const midY = clamp((box.t + box.b) / 2, box.t + 6, box.b - 6);
    const ex = a.x <= box.l ? box.l - gap : a.x >= box.r ? box.r + gap : null;
    const pts = ex == null ? [[a.x, a.y], [e.x, e.y]] : [[a.x, a.y], [a.x, midY], [ex, midY]];
    noteCanvas(page, pts, thick + 4, g => {
      g.strokeStyle = col; g.lineWidth = Math.max(1, thick * .7); g.lineJoin = 'round';
      g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
      g.fillStyle = col; g.beginPath(); g.arc(a.x, a.y, thick * 1.3 + .6, 0, Math.PI * 2); g.fill();
    });
    return;
  }
}
/* 필기를 지우면 대사에 그어 둔 그 필기의 밑줄도 걷는다. 색을 바꾸면 밑줄 표시의 색도 바꾼다 */
function rewriteNoteMarks(id, fn){
  state.blocks.forEach(b => {
    if (b.type !== 'line' || !b.text || b.text.indexOf('^' + id + ':') < 0) return;
    const model = markupToModel(b.text);
    let hit = false;
    model.forEach(x => { if (x.u && x.u.split('^')[1] === id){ hit = true; fn(x); } });
    if (hit) b.text = modelToMarkup(model);
  });
}
function noteSnippet(id){
  for (const b of state.blocks){
    if (b.type !== 'line' || !b.text || b.text.indexOf('^' + id + ':') < 0) continue;
    const t = markupToModel(b.text).filter(x => x.u && x.u.split('^')[1] === id).map(x => x.c).join('');
    if (t) return t;
  }
  return '';
}
/* 지금 화면에 가장 많이 보이는 장 */
function visiblePageIndex(){
  if (viewMode === 'paged') return curPage;
  const sc = $('#stageScroll').getBoundingClientRect();
  let best = 0, area = -1;
  $$('#pageStack .page').forEach((pg, i) => {
    const r = pg.getBoundingClientRect();
    const h = Math.max(0, Math.min(r.bottom, sc.bottom) - Math.max(r.top, sc.top));
    if (h > area){ area = h; best = i; }
  });
  return best;
}
function textMemoCardHtml(m, i){
  const pad = m.boxPad == null ? 60 : m.boxPad, rad = m.boxRadius == null ? 30 : m.boxRadius, op = m.boxOpacity == null ? 100 : m.boxOpacity;
  const sz = clamp(Number(m.size) || 14, 6, 60), w = clamp(Number(m.w) || 40, 10, 100), rot = Number(m.rotate) || 0;
  return '<div class="blk memo-blk" data-id="' + m.id + '">' +
    memoHead(m, '메모 ' + (i + 1), pageSel(m)) +
    '<div class="fmt">' +
      '<button data-fmt="' + m.id + '" data-a="**" data-b="**" title="굵게 (Ctrl+B)"><b>B</b></button>' +
      '<button data-fmt="' + m.id + '" data-a="_" data-b="_" title="기울임 (Ctrl+I)"><i>I</i></button>' +
      '<span class="split"><button data-mark="' + m.id + '" title="형광펜 (Ctrl+H)">' +
        '<i class="swatchdot" style="background:' + markBgOf(withAlpha(state.markColor || '#FDE68A', state.markAlpha)) + '"></i>형광</button>' +
        '<button class="caret" data-markset="' + m.id + '" title="형광펜 색과 투명도">▾</button></span>' +
      '<span class="split"><button data-ink="' + m.id + '" title="선택한 글자의 색 바꾸기">' +
        '<i class="swatchdot" style="background:' + (state.inkColor || '#D9534F') + '"></i>글자색</button>' +
        '<button class="caret" data-inkset="' + m.id + '" title="글자색 고르기">▾</button></span>' +
      '<span class="split"><button data-ul="' + m.id + '" title="선택한 글자에 밑줄 (Ctrl+U)"><i class="swatchdot" style="background:' + (state.ulColor || '#D9534F') + '"></i><u>밑줄</u></button>' +
            '<button class="caret" data-ulset="' + m.id + '" title="밑줄 색 고르기">▾</button></span>' +
      '<span class="split"><button data-size="' + m.id + '" title="글자 크기">글자 크기</button>' +
        '<button class="caret" data-sizeset="' + m.id + '" title="크기 고르기">▾</button></span>' +
      '<button data-strip="' + m.id + '" title="굵게·형광·글자색·기울임을 지웁니다. 선택한 곳이 없으면 메모 전체">서식 지우기</button>' +
    '</div>' +
    '<div class="ed" contenteditable="true" spellcheck="false" data-tx="' + m.id + '" data-ph="메모를 입력하세요">' + edHtml(m) + '</div>' +
    '<div class="blk-foot"><span class="left">' +
      '<select class="alignsel" data-malign="' + m.id + '" title="메모 정렬">' +
        [['left','정렬: 왼쪽'],['center','가운데'],['right','오른쪽']].map(([v, l]) => '<option value="' + v + '"' + ((m.align || 'left') === v ? ' selected' : '') + '>' + l + '</option>').join('') +
      '</select>' +
      '<select class="alignsel" data-mfont="' + m.id + '" title="메모 글꼴">' + fontOptions(m.font || '', '글꼴: 기본') + '</select>' +
      '<label class="check boxchk"><input type="checkbox" data-mbox="' + m.id + '"' + (m.box ? ' checked' : '') + '> 바탕 상자</label>' +
    '</span></div>' +
    '<details class="mopt"' + (m._open ? ' open' : '') + ' data-mopt="' + m.id + '"><summary>글자색 · 크기 · 폭 · 기울기</summary>' +
      '<div class="field" style="margin:8px 0 6px"><label>기본 글자색</label><input type="color" value="' + (m.color || '#5B5952') + '" data-mcolor="' + m.id + '"></div>' +
      '<div class="rangerow"><span class="lbl">글자 크기</span><input type="range" min="6" max="60" value="' + sz + '" data-mr="size" data-id="' + m.id + '"><output>' + sz + 'px</output></div>' +
      '<div class="rangerow"><span class="lbl">최대 폭</span><input type="range" min="10" max="100" value="' + w + '" data-mr="w" data-id="' + m.id + '"><output>' + w + '%</output></div>' +
      '<div class="rangerow"><span class="lbl">기울기</span><input type="range" min="-30" max="30" value="' + rot + '" data-mr="rotate" data-id="' + m.id + '"><output>' + rot + '°</output></div>' +
    '</details>' +
    (m.box ? '<div class="boxopts">' +
      '<div class="row2">' +
        '<div class="field" style="margin:0"><label>바탕색</label><input type="color" data-mboxc="' + m.id + '" value="' + escAttr(m.boxColor || '#FFF6BF') + '"></div>' +
        '<div class="field" style="margin:0"><label>선 색</label><input type="color" data-mboxl="' + m.id + '" value="' + escAttr(m.boxLine || '#D9C878') + '"' + (m.boxEdge === 'line' ? '' : ' disabled') + '></div>' +
      '</div>' +
      '<label class="check" style="margin:0 0 7px"><input type="checkbox" data-mboxe="' + m.id + '"' + (m.boxEdge === 'line' ? ' checked' : '') + '> 테두리 선 넣기</label>' +
      '<div class="rangerow"><span class="lbl">여백</span><input type="range" min="0" max="220" value="' + pad + '" data-mr="boxPad" data-id="' + m.id + '"><output>' + (pad / 100).toFixed(2) + 'em</output></div>' +
      '<div class="rangerow"><span class="lbl">모서리</span><input type="range" min="0" max="200" value="' + rad + '" data-mr="boxRadius" data-id="' + m.id + '"><output>' + (rad / 100).toFixed(2) + 'em</output></div>' +
      '<div class="rangerow"><span class="lbl">진하기</span><input type="range" min="10" max="100" value="' + op + '" data-mr="boxOpacity" data-id="' + m.id + '"><output>' + op + '%</output></div>' +
    '</div>' : '') +
  '</div>';
}
const MEMO_KIND_LABEL = {text:'메모', note:'필기', img:'이미지'};
function memoCardHtml(m){
  const kind = m.kind || 'text';
  /* 번호는 종류별로 센다 */
  const i = state.memos.filter(x => (x.kind || 'text') === kind).indexOf(m);
  return kind === 'note' ? noteCardHtml(m, i) : kind === 'img' ? imgMemoCardHtml(m, i) : textMemoCardHtml(m, i);
}
const memoHead = (m, label, extra) =>
  '<div class="blk-head">' +
    '<span class="dot" style="background:' + escAttr(m.kind === 'note' ? (m.color || '#D9534F') : m.kind === 'img' ? '#B9C6D3' : (m.box ? (m.boxColor || '#FFF6BF') : (m.color || '#5B5952'))) + '"></span>' +
    '<span class="mname">' + label + '</span>' + (extra || '') +
    '<span style="flex:1"></span>' +
    (m.kind === 'note' ? '' : '<button class="mini" data-mdup="' + m.id + '" title="복제">⧉</button>') +
    '<button class="mini danger" data-mdel="' + m.id + '" title="삭제">✕</button>' +
  '</div>';
const pageSel = m => {
  const n = Math.max(pageCount, (Number(m.page) || 0) + 1);
  return '<select data-mpage="' + m.id + '" title="놓일 장">' +
    Array.from({length: n}, (_, k) => '<option value="' + k + '"' + ((Number(m.page) || 0) === k ? ' selected' : '') + '>' + (k + 1) + '쪽</option>').join('') +
  '</select>';
};
const rangeRow = (lbl, key, m, min, max, val, out) =>
  '<div class="rangerow"><span class="lbl">' + lbl + '</span><input type="range" min="' + min + '" max="' + max + '" value="' + val + '" data-mr="' + key + '" data-id="' + m.id + '"><output>' + out + '</output></div>';
function noteCardHtml(m, i){
  const snip = noteSnippet(m.id);
  const sz = clamp(Number(m.size) || 13, 6, 60), w = clamp(Number(m.w) || 42, 10, 100), th = clamp(Number(m.thick) || 2, 1, 6);
  return '<div class="blk memo-blk note-blk" data-id="' + m.id + '">' +
    memoHead(m, '필기 ' + (i + 1)) +
    '<div class="notesnip">' + (snip ? '밑줄: <b>' + escHtml(snip.length > 40 ? snip.slice(0, 40) + '…' : snip) + '</b>'
      : '<span class="warn">밑줄 친 글자가 대사에서 지워져 판에 보이지 않습니다.</span>') + '</div>' +
    '<div class="fmt">' +
      '<button data-fmt="' + m.id + '" data-a="**" data-b="**" title="굵게 (Ctrl+B)"><b>B</b></button>' +
      '<button data-fmt="' + m.id + '" data-a="_" data-b="_" title="기울임 (Ctrl+I)"><i>I</i></button>' +
      '<span class="split"><button data-ink="' + m.id + '" title="선택한 글자의 색 바꾸기">' +
        '<i class="swatchdot" style="background:' + (state.inkColor || '#D9534F') + '"></i>글자색</button>' +
        '<button class="caret" data-inkset="' + m.id + '" title="글자색 고르기">▾</button></span>' +
      '<button data-strip="' + m.id + '" title="서식 지우기">서식 지우기</button>' +
    '</div>' +
    '<div class="ed" contenteditable="true" spellcheck="false" data-tx="' + m.id + '" data-ph="하고 싶은 말을 적으세요">' + edHtml(m) + '</div>' +
    '<div class="blk-foot"><span class="left">' +
      '<label class="mcol" title="밑줄·꼬리 색"><input type="color" value="' + escAttr(m.color || '#D9534F') + '" data-ncolor="' + m.id + '"><span>선 색</span></label>' +
      '<label class="mcol" title="글자 색 (비우면 선 색과 같게)"><input type="color" value="' + escAttr(m.textColor || m.color || '#D9534F') + '" data-ntcolor="' + m.id + '"><span>글자 색</span></label>' +
      '<select class="alignsel" data-ntail="' + m.id + '" title="밑줄과 글을 잇는 모양">' +
        NOTE_TAILS.map(([v, l]) => '<option value="' + v + '"' + (noteTailOf(m.tail) === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>' +
      '<select class="alignsel" data-mfont="' + m.id + '" title="필기 글꼴">' + fontOptions(m.font || '', '글꼴: 기본') + '</select>' +
    '</span></div>' +
    (noteTailOf(m.tail) === 'bubble' ? '<div class="nbub">' +
      '<label class="mcol" title="말풍선 테두리 색"><input type="color" value="' + escAttr(m.bubbleLine || m.color || '#D9534F') + '" data-nline="' + m.id + '"><span>말풍선 선</span></label>' +
      '<label class="mcol" title="말풍선 바탕색"><input type="color" value="' + escAttr(m.bubbleBg || '#FFFFFF') + '" data-nbg="' + m.id + '"><span>바탕</span></label>' +
      rangeRow('바탕 진하기', 'bubbleOp', m, 0, 100, m.bubbleOp == null ? 100 : m.bubbleOp, (m.bubbleOp == null ? 100 : m.bubbleOp) + '%') +
    '</div>' : '') +
    '<details class="mopt"' + (m._open ? ' open' : '') + ' data-mopt="' + m.id + '"><summary>크기 · 폭 · 선 굵기</summary>' +
      rangeRow('글자 크기', 'size', m, 6, 60, sz, sz + 'px') +
      rangeRow('최대 폭', 'w', m, 10, 100, w, w + '%') +
      rangeRow('선 굵기', 'thick', m, 1, 6, th, th + 'px') +
    '</details>' +
  '</div>';
}
function imgMemoCardHtml(m, i){
  const w = clamp(Number(m.w) || 30, 5, 100), rot = Number(m.rotate) || 0, op = m.op == null ? 100 : m.op;
  return '<div class="blk memo-blk img-blk" data-id="' + m.id + '">' +
    memoHead(m, '이미지 ' + (i + 1), pageSel(m)) +
    '<div class="imgmemo">' +
      (m.src ? '<img class="thumb" src="' + escAttr(m.src) + '" alt="">' : '') +
      '<label class="filebtn">' + (m.src ? '바꾸기' : '이미지 고르기') + '<input type="file" accept="image/*" hidden data-mimg="' + m.id + '"></label>' +
    '</div>' +
    '<div class="mopt-flat">' +
      rangeRow('크기', 'w', m, 5, 100, w, w + '%') +
      rangeRow('기울기', 'rotate', m, -30, 30, rot, rot + '°') +
      rangeRow('투명도', 'op', m, 10, 100, op, op + '%') +
    '</div>' +
  '</div>';
}
const MEMO_FMT = {bubbleOp: v => v + '%', size: v => v + 'px', w: v => v + '%', rotate: v => v + '°', thick: v => v + 'px', op: v => v + '%', boxPad: v => (v / 100).toFixed(2) + 'em',
  boxRadius: v => (v / 100).toFixed(2) + 'em', boxOpacity: v => v + '%'};
function renderMemos(){
  if (!Array.isArray(state.memos)) state.memos = [];
  const list = $('#memoList');
  const sc = list.closest('.pane-scroll'), keep = sc ? sc.scrollTop : 0;
  list.innerHTML = state.memos.length ? state.memos.map(memoCardHtml).join('')
    : '<div class="empty" style="padding:16px 18px">아직 아무것도 없습니다.<br>' +
      '· <b>+ 메모</b>: 지금 보고 있는 장에 글을 얹습니다.<br>' +
      '· <b>+ 필기</b>: 미리보기에서 대사 글자를 드래그해서 선택하면 밑줄과 꼬리 달린 글이 붙습니다.<br>' +
      '· <b>+ 이미지</b>: 짤 같은 그림을 얹습니다.<br>' +
      '모두 미리보기에서 드래그해서 옮길 수 있어요.</div>';
  upgradeRangeRows(list);
  if (sc) sc.scrollTop = keep;
  $('#cntMemo').textContent = state.memos.length;
}
function flashMemoCard(id){
  const card = document.querySelector('#memoList [data-id="' + id + '"]');
  if (!card) return;
  card.scrollIntoView({block:'nearest'});
  card.classList.add('flash');
  setTimeout(() => card.classList.remove('flash'), 900);
}
$('#btnAddMemo').addEventListener('click', () => {
  snapshot();
  const pg = visiblePageIndex();
  const m = Object.assign(MEMO_DEFAULT(), {id: uid(), page: pg});
  /* 같은 장에 이미 메모가 있으면 겹치지 않게 조금씩 아래로 */
  const same = state.memos.filter(x => (Number(x.page) || 0) === pg).length;
  m.y = clamp(5 + same * 8, 0, 90);
  state.memos.push(m);
  renderMemos(); renderCanvas();
  const ed = document.querySelector('#memoList [data-tx="' + m.id + '"]');
  if (ed){ ed.focus(); ed.scrollIntoView({block:'nearest'}); }
});
$('#btnAddNote').addEventListener('click', () => {
  toast('미리보기에서 대사 글자를 드래그해서 선택하면, 그 자리에 필기를 넣을지 묻습니다');
  $('#stageScroll').classList.add('hint-note');
  setTimeout(() => $('#stageScroll').classList.remove('hint-note'), 1600);
});
$('#fileMemoImg').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  readImage(f, async d => {
    e.target.value = '';
    let src;
    try { src = await prepareImage(d, 1200); } catch (err){ toast('이 이미지는 읽을 수 없습니다'); return; }
    snapshot();
    const pg = visiblePageIndex();
    const same = state.memos.filter(x => (Number(x.page) || 0) === pg).length;
    state.memos.push({id: uid(), kind:'img', src, page: pg, x: 60, y: clamp(5 + same * 8, 0, 90), w: 30, rotate: 0, op: 100});
    renderMemos(); renderCanvas();
  });
});
/* 미리보기에서 대사 글자를 드래그해서 선택하면 필기(또는 밑줄만)를 넣을지 묻는다.
   미리보기 글은 이름·따옴표·숨긴 기호 때문에 원문과 다르므로, 고른 글자를 원문에서 찾아 그 자리에 표시를 단다. */
function previewSelInfo(){
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return null;
  const rg = sel.getRangeAt(0);
  const host = n => { const e = n && (n.nodeType === 1 ? n : n.parentElement); return e && e.closest ? e.closest('#pageStack .crow[data-bid]') : null; };
  const row = host(rg.startContainer);
  if (!row || row !== host(rg.endContainer)) return null;
  const bk = state.blocks.find(b => b.id === row.dataset.bid);
  if (!bk || bk.type !== 'line') return null;
  const picked = rg.toString();
  if (!picked.trim()) return null;
  const pre = document.createRange();
  pre.selectNodeContents(row); pre.setEnd(rg.startContainer, rg.startOffset);
  return {bk, picked, before: pre.toString(), rect: rg.getBoundingClientRect()};
}
function locateInBlock(bk, picked, before){
  const model = markupToModel(bk.text || '');
  /* 줄바꿈은 미리보기 글에 없으므로 빼고 찾는다 */
  const map = [], flat = [];
  model.forEach((x, i) => { if (x.c !== '\n'){ map.push(i); flat.push(x.c); } });
  const hay = flat.join('');
  const QUOTES = /^[\s"“”'‘’「」『』]+|[\s"“”'‘’「」『』]+$/g;
  const tries = [picked.replace(/\n/g, ''), picked.replace(/\n/g, '').trim(), picked.replace(/\n/g, '').replace(QUOTES, '')];
  for (const t of tries){
    if (!t) continue;
    const hits = [];
    for (let k = hay.indexOf(t); k >= 0; k = hay.indexOf(t, k + 1)) hits.push(k);
    if (!hits.length) continue;
    /* 같은 글이 여러 번 나오면 앞에서 몇 번째인지로 고른다 */
    let n = 0; for (let k = before.indexOf(t); k >= 0; k = before.indexOf(t, k + 1)) n++;
    const at = hits[Math.min(n, hits.length - 1)];
    return {model, s: map[at], e: map[at + t.length - 1] + 1};
  }
  return null;
}
function addMarkFromPreview(info, color, withNote, text){
  const loc = locateInBlock(info.bk, info.picked, info.before);
  if (!loc){ toast('고른 글자를 원문에서 찾지 못했습니다 · 이름·따옴표를 빼고 글자만 골라 보세요'); return; }
  snapshot();
  const id = withNote ? uid() : null;
  loc.model.slice(loc.s, loc.e).forEach(x => { if (x.c !== '\n') x.u = color + (id ? '^' + id : ''); });
  info.bk.text = modelToMarkup(loc.model);
  if (withNote) state.memos.push(Object.assign(NOTE_DEFAULT(), {id, color, text: text || ''}));
  window.getSelection().removeAllRanges();
  renderBlocks(); renderMemos(); renderCanvas();
  toast(withNote ? '필기를 넣었습니다 · 글 상자는 드래그해서 옮길 수 있어요' : '밑줄을 그었습니다');
}
(() => {
  let timer = null;
  const ask = () => {
    const info = previewSelInfo();
    if (!info || (popEl && popEl.classList.contains('notepop'))) return;
    const anchor = {getBoundingClientRect: () => info.rect};
    let color = state.noteColor || '#D9534F';
    openPop(anchor,
      '<div class="r"><label><b>이 부분에 필기를 넣을까요?</b></label></div>' +
      '<div class="r swatches">' + INK_SWATCHES.map(c => '<i data-sw="' + c + '" style="background:' + c + '"' + (c === color ? ' class="on"' : '') + '></i>').join('') + '</div>' +
      '<div class="r"><label>직접 고르기</label><input type="color" id="popNoteCol" value="' + color + '"></div>' +
      '<div class="r"><label>잇는 모양</label><select id="popNoteTail">' +
        NOTE_TAILS.map(([v, l]) => '<option value="' + v + '"' + (noteTailOf(state.noteTail) === v ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></div>' +
      '<div class="r"><textarea id="popNote" rows="3" placeholder="하고 싶은 말 (나중에 메모 탭에서 고칠 수 있어요)"></textarea></div>' +
      '<div class="r sizes"><button id="popNoteGo">필기 넣기</button><button id="popUlGo">밑줄만</button><button id="popNoCancel">취소</button></div>',
      p => {
        p.classList.add('notepop');
        const pick = c => {
          color = c; state.noteColor = c;
          p.querySelector('#popNoteCol').value = c;
          p.querySelectorAll('[data-sw]').forEach(x => x.classList.toggle('on', x.dataset.sw.toLowerCase() === c.toLowerCase()));
        };
        p.querySelectorAll('[data-sw]').forEach(i => i.addEventListener('click', () => pick(i.dataset.sw)));
        p.querySelector('#popNoteCol').addEventListener('input', e2 => pick(e2.target.value));
        p.querySelector('#popNoteTail').addEventListener('change', e2 => { state.noteTail = e2.target.value; });
        p.querySelector('#popNoteGo').addEventListener('click', () => { closePop(); addMarkFromPreview(info, color, true, p.querySelector('#popNote').value.trim()); });
        p.querySelector('#popUlGo').addEventListener('click', () => { closePop(); addMarkFromPreview(info, color, false); });
        p.querySelector('#popNoCancel').addEventListener('click', closePop);
      });
  };
  $('#pageStack').addEventListener('mouseup', () => { clearTimeout(timer); timer = setTimeout(ask, 10); });
  /* 휴대폰은 길게 눌러 고른 뒤 손잡이로 범위를 고치므로, 고르기가 멈추면 묻는다 */
  document.addEventListener('selectionchange', () => {
    if (!('ontouchstart' in window)) return;
    clearTimeout(timer); timer = setTimeout(ask, 700);
  });
})();
$('#memoList').addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.tx){
    const m = memoById(el.dataset.tx); if (!m) return;
    if (!el._burst) snapshot();
    clearTimeout(el._burstT); el._burst = 1; el._burstT = setTimeout(() => { el._burst = 0; }, 900);
    m.text = modelToMarkup(domModel(el, true));
    renderCanvas(); return;
  }
  if (el.dataset.mr){
    const m = memoById(el.dataset.id); if (!m) return;
    snapshotSoon(); m[el.dataset.mr] = Number(el.value);
    const o = el.closest('.rangerow').querySelector('.numin, output'); if (o) o.value = MEMO_FMT[el.dataset.mr](el.value);
    renderCanvas(); return;
  }
  if (el.dataset.nbg || el.dataset.nline){
    const m = memoById(el.dataset.nbg || el.dataset.nline); if (!m) return;
    snapshotSoon();
    if (el.dataset.nbg) m.bubbleBg = el.value; else m.bubbleLine = el.value;
    renderCanvas(); return;
  }
  if (el.dataset.ncolor || el.dataset.ntcolor){
    const m = memoById(el.dataset.ncolor || el.dataset.ntcolor); if (!m) return;
    snapshotSoon();
    if (el.dataset.ntcolor) m.textColor = el.value;
    else {
      m.color = el.value;
      rewriteNoteMarks(m.id, x => { x.u = el.value + '^' + m.id; });
      const dot = el.closest('.memo-blk').querySelector('.blk-head .dot'); if (dot) dot.style.background = el.value;
    }
    renderCanvas(); return;
  }
  const cid = el.dataset.mcolor || el.dataset.mboxc || el.dataset.mboxl;
  if (cid){
    const m = memoById(cid); if (!m) return;
    snapshotSoon();
    if (el.dataset.mcolor) m.color = el.value; else if (el.dataset.mboxc) m.boxColor = el.value; else m.boxLine = el.value;
    renderCanvas();
  }
});
$('#memoList').addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.ntail){
    const m = memoById(el.dataset.ntail); if (!m) return;
    snapshot(); m.tail = el.value; state.noteTail = el.value;
    renderMemos(); renderCanvas(); return;
  }
  if (el.dataset.mimg){
    const m = memoById(el.dataset.mimg), f = el.files && el.files[0];
    if (m && f) readImage(f, async d => {
      try { const src = await prepareImage(d, 1200); snapshot(); m.src = src; renderMemos(); renderCanvas(); }
      catch (err){ toast('이 이미지는 읽을 수 없습니다'); }
    });
    return;
  }
  const id = el.dataset.mpage || el.dataset.mfont || el.dataset.malign || el.dataset.mbox || el.dataset.mboxe;
  const m = id && memoById(id); if (!m) return;
  snapshot();
  if (el.dataset.mpage) m.page = Number(el.value);
  else if (el.dataset.mfont) m.font = el.value;
  else if (el.dataset.malign) m.align = el.value;
  else if (el.dataset.mbox){ m.box = el.checked; renderMemos(); }
  else { m.boxEdge = el.checked ? 'line' : 'none'; renderMemos(); }
  renderCanvas();
});
$('#memoList').addEventListener('click', e => {
  /* 서식 도구줄은 대사 블록과 같다 */
  const fmt = e.target.closest('[data-fmt]');
  if (fmt){ applyFormat(fmt.dataset.fmt, fmt.dataset.a, fmt.dataset.b); return; }
  const mset = e.target.closest('[data-markset]');
  if (mset){ openMarkPop(mset, mset.dataset.markset); return; }
  const uset = e.target.closest('[data-ulset]');
  if (uset){ openUlPop(uset, uset.dataset.ulset); return; }
  const ugo = e.target.closest('[data-ul]');
  if (ugo){ toggleUnder(ugo.dataset.ul, state.ulColor || '#D9534F'); return; }
  const iset = e.target.closest('[data-inkset]');
  if (iset){ openInkPop(iset, iset.dataset.inkset); return; }
  const igo = e.target.closest('[data-ink]');
  if (igo){ toggleInk(igo.dataset.ink, state.inkColor || '#D9534F'); return; }
  const sset = e.target.closest('[data-sizeset]');
  if (sset){ openSizePop(sset, sset.dataset.sizeset); return; }
  const sgo = e.target.closest('[data-size]');
  if (sgo){ applySize(sgo.dataset.size, 130); return; }
  const mk = e.target.closest('[data-mark]');
  if (mk){ toggleMark(mk.dataset.mark, withAlpha(state.markColor || '#FDE68A', state.markAlpha)); return; }
  const strip = e.target.closest('[data-strip]');
  if (strip){ stripFormat(strip.dataset.strip); return; }
  const b = e.target.closest('button'); if (!b) return;
  const id = b.dataset.mdel || b.dataset.mdup;
  const m = id && memoById(id); if (!m) return;
  snapshot();
  if (b.dataset.mdel){
    state.memos = state.memos.filter(x => x !== m);
    if (m.kind === 'note'){ rewriteNoteMarks(m.id, x => { delete x.u; }); renderBlocks(); }
  }
  else if (b.dataset.mdup){
    const c = Object.assign({}, m, {id: uid(), x: clamp((Number(m.x) || 0) + 3, 0, 90), y: clamp((Number(m.y) || 0) + 4, 0, 90)});
    state.memos.splice(state.memos.indexOf(m) + 1, 0, c);
  }
  renderMemos(); renderCanvas();
});
/* 편집 칸 키·붙여넣기 — 대사 블록과 같게. Enter는 줄바꿈 */
$('#memoList').addEventListener('mousedown', e => {
  if (e.target.closest && e.target.closest('.fmt button')) e.preventDefault();
});
$('#memoList').addEventListener('paste', e => {
  const ed = e.target.closest && e.target.closest('.ed');
  if (!ed) return;
  e.preventDefault();
  const t = (e.clipboardData || window.clipboardData).getData('text/plain') || '';
  if (t) edInsertText(ed, t);
});
$('#memoList').addEventListener('drop', e => { if (e.target.closest && e.target.closest('.ed')) e.preventDefault(); });
$('#memoList').addEventListener('keydown', e => {
  if (!e.target.dataset || !e.target.dataset.tx) return;
  const id = e.target.dataset.tx;
  if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229){ e.preventDefault(); edInsertText(e.target, '\n'); return; }
  const k = (e.ctrlKey || e.metaKey) && e.key.toLowerCase();
  if (k === 'b'){ e.preventDefault(); applyFormat(id, '**', '**'); }
  if (k === 'i'){ e.preventDefault(); applyFormat(id, '_', '_'); }
  if (k === 'h'){ e.preventDefault(); toggleMark(id, withAlpha(state.markColor || '#FDE68A', state.markAlpha)); }
  if (k === 'u'){ e.preventDefault(); toggleUnder(id, state.ulColor || '#D9534F'); }
});
/* 모양 칸을 펼쳐 둔 것은 다시 그려도 유지한다 (보기 상태라 저장하지 않는다) */
$('#memoList').addEventListener('toggle', e => {
  const d = e.target; if (!d.dataset || !d.dataset.mopt) return;
  const m = memoById(d.dataset.mopt); if (m) Object.defineProperty(m, '_open', {value: d.open, enumerable: false, writable: true, configurable: true});
}, true);
/* 미리보기에서 메모를 드래그해 옮긴다. 다른 장 위에 놓으면 그 장으로 옮겨 간다.
   위치는 장 크기에 대한 비율(%)로 적어 두어, 확대·저장 해상도와 상관없이 같은 자리에 놓인다. */
(() => {
  let drag = null;
  const stack = $('#pageStack');
  stack.addEventListener('pointerdown', e => {
    const el = e.target.closest('.memo');
    if (!el || e.button > 0) return;
    e.preventDefault();
    const page = el.parentNode;
    drag = {el, page, id: el.dataset.memo, sx: e.clientX, sy: e.clientY, l: el.offsetLeft, t: el.offsetTop, moved: false, ov: page.style.overflow};
    el.setPointerCapture(e.pointerId);
  });
  stack.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = (e.clientX - drag.sx) / zoom, dy = (e.clientY - drag.sy) / zoom;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
    if (!drag.moved){ drag.moved = true; drag.el.classList.add('dragging'); drag.page.style.overflow = 'visible'; drag.page.classList.add('memo-moving'); }
    drag.el.style.left = (drag.l + dx) + 'px';
    drag.el.style.top = (drag.t + dy) + 'px';
  });
  const end = e => {
    if (!drag) return;
    const d = drag; drag = null;
    d.page.style.overflow = d.ov;
    d.page.classList.remove('memo-moving');
    d.el.classList.remove('dragging');
    const m = memoById(d.id);
    if (!m) return;
    if (!d.moved){
      /* 누르기만 했으면 메모 탭에서 그 메모를 찾아 보여 준다 */
      document.querySelector('.tab[data-tab="memo"]').click();
      flashMemoCard(m.id);
      return;
    }
    if (m.kind === 'note'){
      /* 필기 글은 밑줄 끝에서 떨어진 거리로 적는다 — 다른 장으로는 옮기지 않는다 */
      snapshot();
      const ax = Number(d.el.dataset.ax) || 0, ay = Number(d.el.dataset.ay) || 0;
      m.dx = Math.round(d.l + (e.clientX - d.sx) / zoom - ax);
      m.dy = Math.round(d.t + (e.clientY - d.sy) / zoom - ay);
      renderCanvas();
      return;
    }
    const pages = $$('#pageStack .page');
    let target = d.page;
    const hit = document.elementsFromPoint(e.clientX, e.clientY).map(n => n.closest && n.closest('.page')).find(Boolean);
    if (hit && pages.indexOf(hit) >= 0) target = hit;
    const er = d.el.getBoundingClientRect(), pr = target.getBoundingClientRect();
    /* 기울인 메모는 겉 상자가 커지므로 가운데 기준으로 되돌려 잰다 */
    const cx = (er.left + er.width / 2 - pr.left) / zoom, cy = (er.top + er.height / 2 - pr.top) / zoom;
    const left = cx - d.el.offsetWidth / 2, top = cy - d.el.offsetHeight / 2;
    snapshot();
    m.page = pages.indexOf(target);
    m.x = Math.round(clamp(left / target.offsetWidth * 100, -20, 100) * 10) / 10;
    m.y = Math.round(clamp(top / target.offsetHeight * 100, -20, 100) * 10) / 10;
    renderCanvas();
    renderMemos();
  };
  stack.addEventListener('pointerup', end);
  stack.addEventListener('pointercancel', end);
})();

/* ---------------- tabs ---------------- */
$$('.tab').forEach(t => t.addEventListener('click', () => {
  $$('.tab').forEach(x => x.setAttribute('aria-selected', String(x === t)));
  $$('.tabpane').forEach(p => p.classList.toggle('on', p.id === 'pane-' + t.dataset.tab));
}));
/* 메모 탭을 열 때마다 장 수를 새로 반영한다 */
document.querySelector('.tab[data-tab="memo"]').addEventListener('click', () => {
  if (!document.activeElement || !document.activeElement.closest('#memoList')) renderMemos();
});
/* 설정 묶음은 접힌 채로 시작하고, 펼쳐 둔 것만 기억한다 */
(() => {
  const KEY = 'chatFormatter.secOpen';
  let open = {};
  try { open = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch(e){}
  $$('details.sec').forEach(d => {
    if (open[d.dataset.sec]) d.open = true;
    d.addEventListener('toggle', () => {
      open[d.dataset.sec] = d.open;
      try { localStorage.setItem(KEY, JSON.stringify(open)); } catch(e){}
    });
  });
})();

/* ---------------- panel events (delegated) ---------------- */
$('#castList').addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.spsize){
    const sp = speakerOf(el.dataset.spsize);
    if (sp){
      sp.size = Number(el.value);
      const o = el.closest('.rangerow').querySelector('.numin, output'); if (o) o.value = el.value + '%';
      renderCanvas();
    }
    return;
  }
  if (el.dataset.balpha){
    const sp = speakerOf(el.dataset.balpha);
    if (sp){
      /* 화면은 투명도, 안에 담기는 값은 불투명도 — 예전 설정 파일과 호환된다 */
      sp.bubbleAlpha = 100 - Number(el.value);
      sp.noBubble = Number(el.value) === 100;
      const o = el.closest('.rangerow').querySelector('.numin, output'); if (o) o.value = el.value + '%';
      renderCanvas();
    }
    return;
  }
  if (el.dataset.avsz){
    const sp = speakerOf(el.dataset.avsz);
    if (sp){
      sp.avatarSize = Number(el.value);
      const o = el.closest('.rangerow').querySelector('.numin, output'); if (o) o.value = el.value + '%';
      renderCanvas();
    }
    return;
  }
  if (el.dataset.nrc){ state.narrator[el.dataset.nrc] = el.value; renderCanvas(); return; }
  if (el.dataset.nr === 'size'){
    state.narrator.size = Number(el.value);
    const o = el.closest('.rangerow').querySelector('.numin, output'); if (o) o.value = el.value + '%';
    renderCanvas(); return;
  }
  if (el.dataset.name){ const s = speakerOf(el.dataset.name); if (s){ snapshotSoon(); s.name = el.value; renderCanvas(); renderXRules(); } }
  else if (el.dataset.c){ const s = speakerOf(el.dataset.id); if (s){ snapshotSoon(); s[el.dataset.c] = el.value; renderCanvas(); } }
});
$('#castList').addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.nr === 'align'){ snapshot(); state.narrator.align = el.value; renderCanvas(); return; }
  if (el.dataset.nr === 'italic'){ snapshot(); state.narrator.italic = el.checked; renderCanvas(); return; }
  if (el.dataset.nr === 'box'){ snapshot(); state.narrator.noBubble = !el.checked; renderCanvas(); return; }
  if (el.dataset.avsh){
    const sp = speakerOf(el.dataset.avsh);
    if (sp){ snapshot(); sp.avatarShape = el.value; renderCanvas(); }
    return;
  }
  if (el.dataset.spfont || el.dataset.spafont){
    const sp = speakerOf(el.dataset.spfont || el.dataset.spafont);
    if (sp){ snapshot(); sp[el.dataset.spfont ? 'font' : 'actionFont'] = el.value; renderCanvas(); }
    return;
  }
  if (el.dataset.nrfont){
    snapshot();
    state.narrator[el.dataset.nrfont === 'text' ? 'font' : 'actionFont'] = el.value;
    renderCanvas();
    return;
  }
  if (el.dataset.align){ const s = speakerOf(el.dataset.align); if (s){ snapshot(); s.align = el.value; renderCanvas(); } }
  if (el.dataset.name){ renderBlocks(); }
  if (el.dataset.av){
    const s = speakerOf(el.dataset.av); const f = el.files && el.files[0];
    if (s && f) readImage(f, async d => {
      snapshot();
      try { s.avatarOrig = await prepareImage(d, 1600); } catch (err){ toast('이 이미지는 읽을 수 없습니다'); return; }
      s.avatarCrop = null;
      s.avatar = s.avatarOrig;
      renderCast(); renderCanvas();
    });
  }
});
$('#castList').addEventListener('click', e => {
  const del = e.target.closest('[data-del]');
  if (del){
    snapshot();
    const id = del.dataset.del;
    state.speakers = state.speakers.filter(s => s.id !== id);
    state.blocks.forEach(b => { if (b.speakerId === id) b.speakerId = ''; });
    renderAll();
  }
});
$('#castList').addEventListener('click', e => {
  const ac = e.target.closest('[data-avcrop]');
  if (ac){ openCrop({kind:'avatar', id:ac.dataset.avcrop}); return; }
  const ad = e.target.closest('[data-avdel]');
  if (ad){
    const sp = state.speakers.find(x => x.id === ad.dataset.avdel);
    if (sp){ snapshot(); sp.avatar = null; sp.avatarOrig = null; sp.avatarCrop = null; renderCast(); renderCanvas(); }
    return;
  }
  const cp = e.target.closest('[data-cpsp]');
  if (!cp) return;
  const src = state.speakers.find(x => x.id === cp.dataset.cpsp);
  if (!src) return;
  snapshot();
  const base = (src.name || '화자') + ' 사본';
  let name = base, n = 2;
  while (state.speakers.some(x => x.name === name)) name = base + ' ' + (n++);
  const copy = {...src, id:uid(), name};
  state.speakers.splice(state.speakers.indexOf(src) + 1, 0, copy);
  /* 원래 화자에게 걸린 추가 지문 규칙은 사본에도 건다 */
  (state.xrules || []).forEach(r => { const sc = xrScope(r); if (!sc.all && sc.ids.indexOf(src.id) >= 0){ sc.ids.push(copy.id); r.scope = sc; } });
  renderCast(); renderBlocks(); renderCanvas();
  toast('화자를 복사했습니다');
});
$('#btnAddCast').addEventListener('click', () => {
  snapshot();
  const t = THEMES[state.theme] || THEMES.mono;
  const pair = t.pairs[state.speakers.length % t.pairs.length] || AUTO_COLORS[state.speakers.length % AUTO_COLORS.length];
  state.speakers.push({id:uid(), name:'새 화자', align: state.speakers.length % 2 ? 'right' : 'left', avatar:null, ...pair});
  renderAll();
});

$('#blockList').addEventListener('input', e => {
  const el0 = e.target;
  const BOX_IN = {bboxc:'boxColor', bboxl:'boxLine'};
  const BOX_RANGE = {bboxp:['boxPad', v => (v / 100).toFixed(2) + 'em'],
                     bboxr:['boxRadius', v => (v / 100).toFixed(2) + 'em'],
                     bboxo:['boxOpacity', v => v + '%']};
  for (const k in BOX_IN){
    if (!el0.dataset[k]) continue;
    const b = state.blocks.find(x => x.id === el0.dataset[k]);
    if (b){ b[BOX_IN[k]] = el0.value; renderCanvas(); }
    return;
  }
  for (const k in BOX_RANGE){
    if (!el0.dataset[k]) continue;
    const b = state.blocks.find(x => x.id === el0.dataset[k]);
    if (b){
      b[BOX_RANGE[k][0]] = Number(el0.value);
      const o = el0.closest('.rangerow').querySelector('.numin, output');
      if (o) o.value = BOX_RANGE[k][1](el0.value);
      renderCanvas();
    }
    return;
  }
  const el = e.target;
  if (el.dataset.tx){
    const b = state.blocks.find(x => x.id === el.dataset.tx);
    if (b){
      /* 한 번에 이어 친 글은 되돌리기 한 번으로 — 치기 시작할 때의 상태를 남긴다 */
      if (!el._burst) snapshot();
      clearTimeout(el._burstT); el._burst = 1; el._burstT = setTimeout(() => { el._burst = 0; }, 900);
      b.text = modelToMarkup(domModel(el, true));
      renderCanvas();
    }
  } else if (el.dataset.rw || el.dataset.rt || el.dataset.rz){
    const id = el.dataset.rw || el.dataset.rt || el.dataset.rz;
    const b = state.blocks.find(x => x.id === id);
    if (b){
      const v = Number(el.value);
      const row = el.closest('.rangerow');
      const out = row && row.querySelector('.numin, output');
      if (el.dataset.rw){ b.width = v; if (out) out.value = v + '%'; }
      if (el.dataset.rt){ b.thick = v; if (out) out.value = v + 'px'; }
      if (el.dataset.rz){ b.symSize = v; if (out) out.value = v + '%'; }
      renderCanvas();
    }
  } else if (el.dataset.ifs){
    const b = state.blocks.find(x => x.id === el.dataset.ifs);
    if (b){
      snapshotSoon();
      b.imgFadeSize = Number(el.value);
      const o = el.closest('.rangerow').querySelector('.numin, output'); if (o) o.value = el.value + '%';
      scheduleBlockFade(b);
    }
  } else if (el.dataset.iw || el.dataset.iop || el.dataset.isw){
    const id = el.dataset.iw || el.dataset.iop || el.dataset.isw;
    const b = state.blocks.find(x => x.id === id);
    if (b){
      const v = Number(el.value);
      if (el.dataset.iw) b.imgW = v; else if (el.dataset.isw) b.sideW = v; else b.imgOp = v;
      const o = el.closest('.rangerow').querySelector('.numin, output'); if (o) o.value = v + '%';
      renderCanvas();
    }
  } else if (el.dataset.markc){
    state.markColor = el.value;
  } else if (el.dataset.rsymtext){
    const b = state.blocks.find(x => x.id === el.dataset.rsymtext);
    if (b){ snapshotSoon(); b.sym = el.value; renderCanvas(); }
  } else if (el.dataset.rc){
    const b = state.blocks.find(x => x.id === el.dataset.rc);
    if (b){ b.color = el.value; el.closest('.blk').querySelector('.dot').style.background = el.value; renderCanvas(); }
  }
});
$('#blockList').addEventListener('change', e => {
  const bxe = e.target.closest('[data-bboxe]');
  if (bxe){
    const b = state.blocks.find(x => x.id === bxe.dataset.bboxe);
    if (b){ snapshot(); b.boxEdge = bxe.checked ? 'around' : 'none'; renderBlocks(); renderCanvas(); }
    return;
  }
  const bx = e.target.closest('[data-bbox]');
  if (bx){
    const b = state.blocks.find(x => x.id === bx.dataset.bbox);
    if (b){ snapshot(); b.box = bx.checked; if (b.box && !b.boxColor) b.boxColor = '#F1EFEA'; renderBlocks(); renderCanvas(); }
    return;
  }
  const bf = e.target.closest('[data-bfont]');
  if (bf){
    const b = state.blocks.find(x => x.id === bf.dataset.bfont);
    if (b){ snapshot(); b.font = bf.value; renderCanvas(); }
    return;
  }
  const bl = e.target.closest('[data-ibx],[data-ibt],[data-ibb]');
  if (bl){
    const key = bl.dataset.ibx ? 'bleedX' : bl.dataset.ibt ? 'bleedT' : 'bleedB';
    const id = bl.dataset.ibx || bl.dataset.ibt || bl.dataset.ibb;
    const b = state.blocks.find(x => x.id === id);
    if (b){ snapshot(); b[key] = bl.checked; renderCanvas(); }
    return;
  }
  const el = e.target;
  if (el.dataset.sp){
    const b = state.blocks.find(x => x.id === el.dataset.sp);
    if (b){ snapshot(); b.speakerId = el.value; const sp = speakerOf(el.value);
      el.closest('.blk').querySelector('.dot').style.background = sp ? sp.bubble : '#E7E2ED'; renderCanvas(); }
  } else if (el.dataset.rl){
    const b = state.blocks.find(x => x.id === el.dataset.rl);
    if (b){ snapshot(); b.line = el.value; renderCanvas(); }
  } else if (el.dataset.rsym){
    const b = state.blocks.find(x => x.id === el.dataset.rsym);
    if (b){
      snapshot();
      if (el.value === '__custom'){ b.symCustom = true; }
      else { b.symCustom = false; b.sym = el.value; }
      renderBlocks(); renderCanvas();
      const tf = $('[data-rsymtext="' + b.id + '"]');
      if (tf) tf.focus();
    }
  } else if (el.dataset.al){
    const b = state.blocks.find(x => x.id === el.dataset.al);
    if (b){ snapshot(); if (el.value) b.align = el.value; else delete b.align; renderCanvas(); }
  } else if (el.dataset.ish){
    const b = state.blocks.find(x => x.id === el.dataset.ish);
    if (b){
      snapshot();
      const wasCircle = b.imgShape === 'circle';
      b.imgShape = el.value;
      if (wasCircle || el.value === 'circle') reprocessBlockImage(b);
      else { renderBlocks(); renderCanvas(); }
    }
  } else if (el.dataset.ifade){
    const b = state.blocks.find(x => x.id === el.dataset.ifade);
    if (b){ snapshot(); b.imgFade = el.value; reprocessBlockImage(b); }
  } else if (el.dataset.ial){
    const b = state.blocks.find(x => x.id === el.dataset.ial);
    if (b){
      snapshot();
      const wasSide = isSideAlign(b.imgAlign);
      b.imgAlign = el.value;
      /* 세우기로 바꾸거나 풀면 옵션 칸이 달라진다 */
      if (wasSide !== isSideAlign(b.imgAlign)) renderBlocks();
      renderCanvas();
    }
  } else if (el.dataset.img){
    const b = state.blocks.find(x => x.id === el.dataset.img);
    const f = el.files && el.files[0];
    if (b && f) readImage(f, async d => {
      snapshot();
      try { b.imgOrig = await prepareImage(d, 2600); }
      catch (err){ toast('이 이미지는 읽을 수 없습니다'); return; }
      if (!b.imgShape) b.imgShape = 'round';
      b.imgCrop = null; b.imgCropped = null;
      reprocessBlockImage(b);
    });
  }
});
/* 작은 설정 창 (형광펜·글자 크기) */
let popEl = null;
function closePop(){ if (popEl){ popEl.remove(); popEl = null; } }
function openPop(btn, html, wire){
  closePop();
  const p = document.createElement('div');
  p.className = 'pop';
  p.innerHTML = html;
  document.body.appendChild(p);
  const r = btn.getBoundingClientRect(), pr = p.getBoundingClientRect();
  p.style.left = Math.round(clamp(r.left, 8, window.innerWidth - pr.width - 8)) + 'px';
  p.style.top = Math.round(r.bottom + 6 + pr.height > window.innerHeight - 8
    ? Math.max(8, r.top - pr.height - 6) : r.bottom + 6) + 'px';
  popEl = p;
  wire(p);
}
document.addEventListener('pointerdown', e => {
  if (popEl && !e.target.closest('.pop') && !e.target.closest('.caret')) closePop();
});

const MARK_SWATCHES = ['#FDE68A','#FFC9DE','#C7F0D8','#BFE3FB','#E3D4FB','#FFD9B8','#D9D9DE','#FFF7B2'];
function openMarkPop(btn, id){
  const col = state.markColor || '#FDE68A';
  const op = state.markAlpha == null ? 0 : state.markAlpha;
  openPop(btn,
    '<div class="r"><label>색</label><input type="color" id="popMc" value="' + col + '"></div>' +
    '<div class="r swatches">' + MARK_SWATCHES.map(c => '<i data-sw="' + c + '" style="background:' + c + '"></i>').join('') + '</div>' +
    '<div class="r"><label>투명도</label><input type="range" id="popMo" min="0" max="90" step="5" value="' + op + '"><b id="popMoV" style="width:34px;text-align:right;font-size:11.5px">' + op + '%</b></div>' +
    '<div class="r sizes"><button id="popMgo">선택 부분에 칠하기</button></div>',
    p => {
      const sync = () => { renderBlocks(); };
      p.querySelector('#popMc').addEventListener('input', e => { state.markColor = e.target.value; sync(); });
      p.querySelectorAll('[data-sw]').forEach(i => i.addEventListener('click', () => {
        state.markColor = i.dataset.sw; p.querySelector('#popMc').value = i.dataset.sw; sync();
      }));
      p.querySelector('#popMo').addEventListener('input', e => {
        state.markAlpha = Number(e.target.value); p.querySelector('#popMoV').textContent = e.target.value + '%'; sync();
      });
      p.querySelector('#popMgo').addEventListener('click', () => {
        closePop(); toggleMark(id, withAlpha(state.markColor || '#FDE68A', state.markAlpha));
      });
    });
}
const INK_SWATCHES = ['#D9534F','#E8833A','#D4A62A','#3E9B5B','#2F7FC1','#7A5BC4','#C2477E','#8A887F','#FFFFFF','#22303D'];
function openInkPop(btn, id){
  const col = state.inkColor || '#D9534F';
  openPop(btn,
    '<div class="r"><label>글자색</label><input type="color" id="popIc" value="' + col + '"></div>' +
    '<div class="r swatches">' + INK_SWATCHES.map(c => '<i data-sw="' + c + '" style="background:' + c + '"></i>').join('') + '</div>' +
    '<div class="r sizes"><button id="popIgo">선택 부분에 칠하기</button></div>',
    p => {
      const sync = () => { renderBlocks(); };
      p.querySelector('#popIc').addEventListener('input', e => { state.inkColor = e.target.value; sync(); });
      p.querySelectorAll('[data-sw]').forEach(i => i.addEventListener('click', () => {
        state.inkColor = i.dataset.sw; p.querySelector('#popIc').value = i.dataset.sw; sync();
      }));
      p.querySelector('#popIgo').addEventListener('click', () => { closePop(); toggleInk(id, state.inkColor || '#D9534F'); });
    });
}
/* 글자색: {{#D9534F:텍스트}} — 지문 안에서도 쓸 수 있다. 이미 칠한 곳을 다시 누르면 벗긴다 */
function toggleInk(id, color){ edToggle(id, 'k', color, '먼저 색을 바꿀 글자를 선택하세요'); }
/* 밑줄: ⸨#색:텍스트⸩ — 형광펜과 달리 글자 밑에 줄만 긋는다 */
function toggleUnder(id, color){ edToggle(id, 'u', color, '먼저 밑줄 그을 부분을 선택하세요'); }
function openUlPop(btn, id){
  const col = state.ulColor || '#D9534F';
  openPop(btn,
    '<div class="r"><label>밑줄 색</label><input type="color" id="popUc" value="' + col + '"></div>' +
    '<div class="r swatches">' + INK_SWATCHES.map(c => '<i data-sw="' + c + '" style="background:' + c + '"></i>').join('') + '</div>' +
    '<div class="r sizes"><button id="popUgo">선택 부분에 밑줄</button></div>',
    p => {
      const sync = () => { $$('[data-ul] .swatchdot').forEach(d => { d.style.background = state.ulColor; }); };
      p.querySelector('#popUc').addEventListener('input', e => { state.ulColor = e.target.value; sync(); });
      p.querySelectorAll('[data-sw]').forEach(i => i.addEventListener('click', () => {
        state.ulColor = i.dataset.sw; p.querySelector('#popUc').value = i.dataset.sw; sync();
      }));
      p.querySelector('#popUgo').addEventListener('click', () => { closePop(); toggleUnder(id, state.ulColor || '#D9534F'); });
    });
}const SIZE_STEPS = [['80','작게'],['120','크게'],['150','더 크게'],['200','아주 크게']];
function openSizePop(btn, id){
  openPop(btn,
    '<div class="r"><label>선택한 글자를 이 크기로</label></div>' +
    '<div class="r sizes">' + SIZE_STEPS.map(([v, l]) => '<button data-sz="' + v + '">' + l + '</button>').join('') + '</div>' +
    '<div class="r"><label>직접 (%)</label><input type="number" id="popSz" min="50" max="300" step="10" value="130" style="width:64px">' +
      '<button id="popSzGo" style="height:26px;font-size:11.5px;border:1px solid var(--line);background:#fff;border-radius:7px;cursor:pointer">적용</button></div>',
    p => {
      const go = v => { closePop(); applySize(id, v); };
      p.querySelectorAll('[data-sz]').forEach(b => b.addEventListener('click', () => go(b.dataset.sz)));
      p.querySelector('#popSzGo').addEventListener('click', () => go(clamp(Number(p.querySelector('#popSz').value) || 130, 50, 300)));
    });
}
/* 글자 크기: [[130:텍스트]] */
function applySize(id, pct){ edToggle(id, 's', String(pct), '먼저 크기를 바꿀 부분을 선택하세요'); }
/* 블록 바로 뒤에 새 블록 끼워 넣기 */
let addMenuEl = null;
function closeAddMenu(){ if (addMenuEl){ addMenuEl.remove(); addMenuEl = null; } }
function insertAfter(id, type){
  const i = state.blocks.findIndex(x => x.id === id);
  if (i < 0) return;
  snapshot();
  const src = state.blocks[i];
  const nb = type === 'line'
    ? {id:uid(), type:'line', sp:(src.type === 'line' ? src.sp : null) || null, text:''}
    : type === 'img' ? {id:uid(), type:'img', image:null, imgShape:'round', imgAlign:'center', imgSize:100, imgOpacity:100}
    : type === 'rule' ? {id:uid(), type:'rule'}
    : type === 'html' ? {id:uid(), type:'html', html:''} : {id:uid(), type:'pb'};
  state.blocks.splice(i + 1, 0, nb);
  renderBlocks(); renderCanvas();
  if (type === 'html'){ openHtmlEdit(nb.id); return; }
  const focusSel = type === 'line' ? '[data-tx="' + nb.id + '"]' : '';
  if (focusSel){
    const el = $(focusSel);
    if (el){ el.focus(); el.scrollIntoView({block:'center', behavior:'smooth'}); }
  }
}
function openAddMenu(btn, id){
  closeAddMenu();
  const m = document.createElement('div');
  m.className = 'addmenu';
  m.innerHTML =
    '<button data-am="line">＋ 대사</button>' +
    '<button data-am="img">＋ 이미지</button>' +
    '<button data-am="rule">＋ 구분선</button>' +
    '<button data-am="pb">＋ 페이지 나누기</button>' +
    '<button data-am="html">＋ HTML</button>';
  document.body.appendChild(m);
  const r = btn.getBoundingClientRect();
  const mr = m.getBoundingClientRect();
  m.style.left = Math.round(clamp(r.right - mr.width, 8, window.innerWidth - mr.width - 8)) + 'px';
  m.style.top = Math.round(r.bottom + 5 + mr.height > window.innerHeight - 8 ? r.top - mr.height - 5 : r.bottom + 5) + 'px';
  m.addEventListener('click', ev => {
    const b = ev.target.closest('[data-am]');
    if (b){ closeAddMenu(); insertAfter(id, b.dataset.am); }
  });
  addMenuEl = m;
}
document.addEventListener('pointerdown', e => {
  if (addMenuEl && !e.target.closest('.addmenu') && !e.target.closest('[data-addafter]')) closeAddMenu();
});

$('#blockList').addEventListener('click', e => {
  const pm = e.target.closest('.pagemark');
  if (pm){ const pg = Number(pm.dataset.pg); setPageFold(pg, !foldedPages.has(pg)); return; }
  const fmt = e.target.closest('[data-fmt]');
  if (fmt){ applyFormat(fmt.dataset.fmt, fmt.dataset.a, fmt.dataset.b); return; }
  const mset = e.target.closest('[data-markset]');
  if (mset){ openMarkPop(mset, mset.dataset.markset); return; }
  const uset = e.target.closest('[data-ulset]');
  if (uset){ openUlPop(uset, uset.dataset.ulset); return; }
  const ugo = e.target.closest('[data-ul]');
  if (ugo){ toggleUnder(ugo.dataset.ul, state.ulColor || '#D9534F'); return; }
  const iset = e.target.closest('[data-inkset]');
  if (iset){ openInkPop(iset, iset.dataset.inkset); return; }
  const igo = e.target.closest('[data-ink]');
  if (igo){ toggleInk(igo.dataset.ink, state.inkColor || '#D9534F'); return; }
  const sset = e.target.closest('[data-sizeset]');
  if (sset){ openSizePop(sset, sset.dataset.sizeset); return; }
  const sgo = e.target.closest('[data-size]');
  if (sgo){ applySize(sgo.dataset.size, 130); return; }
  const mk = e.target.closest('[data-mark]');
  if (mk){
    toggleMark(mk.dataset.mark, withAlpha(state.markColor || '#FDE68A', state.markAlpha));
    return;
  }
  const he = e.target.closest('[data-hedit]');
  if (he){ openHtmlEdit(he.dataset.hedit); return; }
  const aa = e.target.closest('[data-addafter]');
  if (aa){ openAddMenu(aa, aa.dataset.addafter); return; }
  const strip = e.target.closest('[data-strip]');
  if (strip){ stripFormat(strip.dataset.strip); return; }
  const dup = e.target.closest('[data-dup]');
  if (dup){
    snapshot();
    const i = state.blocks.findIndex(b => b.id === dup.dataset.dup);
    const copy = JSON.parse(JSON.stringify(state.blocks[i])); copy.id = uid();
    state.blocks.splice(i + 1, 0, copy); renderBlocks(); renderCanvas(); return;
  }
  const del = e.target.closest('[data-del]');
  if (del){
    snapshot();
    state.blocks = state.blocks.filter(b => b.id !== del.dataset.del);
    renderBlocks(); renderCanvas(); toast('삭제했습니다 · Ctrl+Z 로 되돌리기'); return;
  }
  const crop = e.target.closest('[data-imgcrop]');
  if (crop){ openCrop({kind:'block', id:crop.dataset.imgcrop}); return; }
  const imgdel = e.target.closest('[data-imgdel]');
  if (imgdel){
    snapshot();
    const b = state.blocks.find(x => x.id === imgdel.dataset.imgdel);
    if (b){ b.image = null; b.imgOrig = null; renderBlocks(); renderCanvas(); }
  }
});
/* ---------------- 이미지 준비 ---------------- */
const IMG_SHAPES = [['round','둥근 사각'],['rect','사각'],['soft','많이 둥근'],['pill','알약'],['circle','원형']];
const IMG_ALIGNS = [['','기본 (글 정렬 따라)'],['left','왼쪽'],['center','가운데'],['right','오른쪽'],['full','좌우 꽉 채움'],
  ['sideL','페이지 왼쪽 (글은 오른쪽)'],['sideR','페이지 오른쪽 (글은 왼쪽)']];
const isSideAlign = a => a === 'sideL' || a === 'sideR';
function sideWOf(bk){ return clamp(Math.round(Number(bk.sideW) || 45), 20, 80); }

function loadImg(src){
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
/* 큰 사진은 줄여서 담고, 원형은 픽셀에 직접 오려 낸다.
   (html2canvas가 clip-path를 그리지 못해서 CSS로는 저장 결과가 어긋난다) */
/* 원본이 한도 이내면 재인코딩 없이 그대로 쓴다 — 화질을 지키는 핵심 */
async function prepareImage(src, maxDim){
  const img = await loadImg(src);
  if (Math.max(img.naturalWidth, img.naturalHeight) <= maxDim) return src;
  return processImage(src, {maxDim});
}
/* ---- 가장자리 흐리게 ----
   사진 가장자리를 투명하게 녹여 바탕(단색·그라데이션)에 자연스럽게 스며들게 한다.
   mask-image는 저장 이미지(html2canvas)에 안 나오므로 알파를 픽셀에 직접 굽는다. */
/* 값(t·b·tb·lr·all)은 저장 파일과 맞아야 하므로 그대로 두고, 이름만 흐려지는 쪽으로 짧게 쓴다 */
const FADE_MODES = [['none','없음'],['t','위'],['b','아래'],['l','왼쪽'],['r','오른쪽'],['tb','위아래'],['lr','좌우'],
  ['tl','왼쪽 위'],['tr','오른쪽 위'],['bl','왼쪽 아래'],['br','오른쪽 아래'],['all','전체']];
/* 직선으로 녹이면 경계가 띠처럼 보인다. 부드러운 곡선으로 알파를 올린다 */
const FADE_EASE = [0, .06, .22, .5, .78, .94, 1];
async function fadeImage(src, mode, size){
  if (!src || !mode || mode === 'none') return src;
  const img = await loadImg(src);
  const w = img.naturalWidth, h = img.naturalHeight;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'destination-in';
  const f = clamp(Number(size) || 35, 5, 100) / 100;
  const n = FADE_EASE.length - 1;
  /* (x0,y0)→(x1,y1) 선을 따라 앞(head)·뒤(tail) 끝을 녹인다 */
  const maskLine = (x0, y0, x1, y1, head, tail) => {
    const span = Math.min(f, head && tail ? .5 : 1);
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    if (head) FADE_EASE.forEach((a, i) => gr.addColorStop(span * i / n, 'rgba(0,0,0,' + a + ')'));
    else gr.addColorStop(0, '#000');
    if (tail) FADE_EASE.forEach((a, i) => gr.addColorStop(1 - span + span * i / n, 'rgba(0,0,0,' + (1 - a) + ')'));
    else gr.addColorStop(1, '#000');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
  };
  const mask = (horizontal, head, tail) =>
    horizontal ? maskLine(0, 0, w, 0, head, tail) : maskLine(0, 0, 0, h, head, tail);
  /* 대각선 — CSS의 'to bottom right'처럼, 같은 투명도 선이 나머지 두 모서리를 잇게 기울인다.
     sx·sy는 녹일 모서리 쪽(+1 오른쪽·아래, -1 왼쪽·위) */
  const corner = (sx, sy) => {
    const n = Math.hypot(w, h);
    const dx = sx * h / n, dy = sy * w / n;
    const len = Math.abs(w * dx) + Math.abs(h * dy);
    maskLine(w / 2 - dx * len / 2, h / 2 - dy * len / 2, w / 2 + dx * len / 2, h / 2 + dy * len / 2, false, true);
  };
  /* 두 번 덮으면 알파가 곱해져 네 모서리가 함께 녹는다 */
  if (mode === 'b')  mask(false, false, true);
  if (mode === 't')  mask(false, true, false);
  if (mode === 'r')  mask(true, false, true);
  if (mode === 'l')  mask(true, true, false);
  if (mode === 'tb' || mode === 'all') mask(false, true, true);
  if (mode === 'lr' || mode === 'all') mask(true, true, true);
  if (mode === 'tl') corner(-1, -1);
  if (mode === 'tr') corner(1, -1);
  if (mode === 'bl') corner(-1, 1);
  if (mode === 'br') corner(1, 1);
  return cv.toDataURL('image/png');
}
/* CSS linear-gradient(각도)와 똑같은 선을 캔버스에 긋는다 — 저장 이미지와 화면을 맞추기 위함 */
function fillCssGradient(g, w, h, deg, c1, c2){
  const a = deg * Math.PI / 180;
  const dx = Math.sin(a), dy = -Math.cos(a);
  const len = Math.abs(w * dx) + Math.abs(h * dy);
  const gr = g.createLinearGradient(w / 2 - dx * len / 2, h / 2 - dy * len / 2, w / 2 + dx * len / 2, h / 2 + dy * len / 2);
  gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}
const BG_GRAD_DEG = 160;
const bgGradCss = () => 'linear-gradient(' + BG_GRAD_DEG + 'deg,' + state.bgColor + ' 0%,' + state.bgColor2 + ' 100%)';
/* 배경 사진은 원본을 state에 두고, 흐리게 구운 것은 메모리에만 둔다(설정을 바꿀 때마다 다시 굽는다) */
let bgFadeCache = {src:null, key:'', url:null}, bgFadeJob = null, bgFadeTimer = null;
const bgFadeKey = () => (state.bgFade || 'none') + '|' + (Number(state.bgFadeSize) || 35);
function ensureBgFade(){
  const src = state.bgImage, mode = state.bgFade || 'none', key = bgFadeKey();
  if (!src || mode === 'none') return Promise.resolve(src);
  if (bgFadeCache.src === src && bgFadeCache.key === key) return Promise.resolve(bgFadeCache.url);
  if (bgFadeJob && bgFadeJob.src === src && bgFadeJob.key === key) return bgFadeJob.p;
  const job = {src, key};
  job.p = fadeImage(src, mode, state.bgFadeSize).then(url => {
    if (bgFadeJob === job){ bgFadeCache = {src, key, url}; bgFadeJob = null; renderCanvas(); }
    return url;
  }).catch(() => { if (bgFadeJob === job) bgFadeJob = null; return src; });
  bgFadeJob = job;
  return job.p;
}
function bgImageSrc(){
  const src = state.bgImage;
  if (!src || (state.bgFade || 'none') === 'none') return src;
  if (bgFadeCache.src === src && bgFadeCache.key === bgFadeKey()) return bgFadeCache.url;
  /* 굽는 동안은 직전에 구운 것을(없으면 원본을) 보여 줘 깜박이지 않게 한다. 슬라이더를 끄는 동안은 몰아서 한 번만 */
  clearTimeout(bgFadeTimer);
  bgFadeTimer = setTimeout(ensureBgFade, 200);
  return bgFadeCache.src === src && bgFadeCache.url ? bgFadeCache.url : src;
}
/* ---- 사진 가장자리 색으로 늘려 채우기 ----
   사진이 남긴 빈 곳을, 그 빈 곳과 맞닿은 변의 색으로 채운다.
   변마다 한 색이다: 그 변에 닿은 픽셀 중 가장 많이 나오는 색.
   JPEG 잡티 때문에 똑같은 색은 드물므로 채널마다 16단계로 묶어 세고, 이긴 묶음의 평균을 쓴다. */
let bgEdgeCache = {src:null, colors:null}, bgEdgeJob = null;
async function edgeColors(src){
  const img = await loadImg(src);
  const k = Math.min(1, 400 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  g.drawImage(img, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h).data;
  const band = Math.max(1, Math.round(Math.min(w, h) * .015));
  const pick = (x0, y0, x1, y1) => {
    const bins = new Map();
    let best = null;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++){
      const i = (y * w + x) * 4;
      if (d[i + 3] < 128) continue;                 /* 투명한 곳은 색이 없다 */
      const key = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4);
      let b = bins.get(key);
      if (!b){ b = {n:0, r:0, g:0, b:0}; bins.set(key, b); }
      b.n++; b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2];
      if (!best || b.n > best.n) best = b;
    }
    if (!best) return null;
    const hx = v => Math.round(v / best.n).toString(16).padStart(2, '0');
    return '#' + hx(best.r) + hx(best.g) + hx(best.b);
  };
  return {w: img.naturalWidth, h: img.naturalHeight,
    t: pick(0, 0, w, band), b: pick(0, h - band, w, h), l: pick(0, 0, band, h), r: pick(w - band, 0, w, h)};
}
function ensureBgEdge(){
  const src = state.bgImage;
  if (!src || state.bgUnder !== 'edge') return Promise.resolve(null);
  if (bgEdgeCache.src === src) return Promise.resolve(bgEdgeCache.colors);
  if (bgEdgeJob && bgEdgeJob.src === src) return bgEdgeJob.p;
  const job = {src};
  /* 흐리게 구운 사진은 가장자리가 투명하므로 원본에서 뽑는다 */
  job.p = edgeColors(src).then(colors => {
    if (bgEdgeJob === job){ bgEdgeCache = {src, colors}; bgEdgeJob = null; renderCanvas(); }
    return colors;
  }).catch(() => { if (bgEdgeJob === job) bgEdgeJob = null; return null; });
  bgEdgeJob = job;
  return job.p;
}
/* w×h 판에 사진을 앉혔을 때 어느 축이 비는지 보고, 그 축으로 두 변의 색을 늘린다.
   가운데(사진 뒤)는 두 색을 부드럽게 잇는다 — 흐리게 녹인 가장자리로 비쳐도 자연스럽다 */
function edgeLayer(w, h){
  const c = bgEdgeCache.src === state.bgImage ? bgEdgeCache.colors : null;
  const fit = state.bgFit || 'cover';
  if (!c || fit === 'tile' || !w || !h) return null;
  const r = fit === 'contain' ? Math.min(w / c.w, h / c.h) : Math.max(w / c.w, h / c.h);
  const dw = c.w * r, dh = c.h * r;
  const vertical = fit === 'contain' ? (h - dh) >= (w - dw) : (dh - h) <= (dw - w);
  const len = vertical ? h : w, size = vertical ? dh : dw;
  const a = clamp((len - size) / 2 / len, 0, 1), b = clamp(1 - a, 0, 1);
  const fb = state.bgColor;
  const c1 = (vertical ? c.t : c.l) || fb, c2 = (vertical ? c.b : c.r) || fb;
  const pc = v => Math.round(v * 1000) / 10 + '%';
  return {vertical, c1, c2, a, b,
    css: 'linear-gradient(to ' + (vertical ? 'bottom' : 'right') + ',' + c1 + ' 0%,' + c1 + ' ' + pc(a) + ',' + c2 + ' ' + pc(b) + ',' + c2 + ' 100%)'};
}
function fillEdgeLayer(g, w, h, L){
  const gr = L.vertical ? g.createLinearGradient(0, 0, 0, h) : g.createLinearGradient(0, 0, w, 0);
  gr.addColorStop(0, L.c1); gr.addColorStop(L.a, L.c1); gr.addColorStop(L.b, L.c2); gr.addColorStop(1, L.c2);
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
}
/* 판 크기는 배치가 끝나야 알 수 있으므로 다 그린 뒤에 얹는다 */
function paintEdgeUnder(pg){
  const host = pg.style.backgroundImage && pg.style.backgroundImage !== 'none' ? pg : pg.querySelector('.cbody');
  if (!host || !host.style.backgroundImage || host.style.backgroundImage === 'none') return;
  const L = edgeLayer(host.offsetWidth, host.offsetHeight);
  if (!L) return;
  host.style.backgroundImage = 'url(' + bgImageSrc() + '),' + L.css;
  host.style.backgroundSize = (state.bgFit || 'cover') + ',100% 100%';
  host.style.backgroundRepeat = 'no-repeat,no-repeat';
  host.style.backgroundPosition = 'center,center';
}
async function processImage(src, opt){
  opt = opt || {};
  const img = await loadImg(src);
  const maxDim = opt.maxDim || 2600;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (opt.circle){
    const side = Math.min(sw, sh);
    sx = (sw - side) / 2; sy = (sh - side) / 2; sw = sh = side;
  }
  let w = sw, h = sh;
  if (Math.max(w, h) > maxDim){ const k = maxDim / Math.max(w, h); w = Math.round(w * k); h = Math.round(h * k); }
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  if (opt.circle){
    const cut = document.createElement('canvas');
    cut.width = w; cut.height = h;
    const cc = cut.getContext('2d');
    cc.beginPath();
    cc.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
    cc.closePath(); cc.clip();
    cc.drawImage(cv, 0, 0);
    return cut.toDataURL('image/png');
  }
  /* 투명 픽셀이 있으면 PNG, 없으면 용량을 아끼려고 JPEG */
  let hasAlpha = false;
  try {
    const d = ctx.getImageData(0, 0, w, h).data;
    for (let i = 3; i < d.length; i += 4){ if (d[i] < 250){ hasAlpha = true; break; } }
  } catch (e){ hasAlpha = true; }
  return hasAlpha ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', opt.quality || 0.95);
}
/* ---------- 이미지 자르기 ----------
   자른 범위는 0~1 비율로 보관하고 원본은 그대로 둔다. 그래서 몇 번이든 다시 고칠 수 있다. */
let cropTarget = null, cropRect = {x:0, y:0, w:1, h:1}, cropDrag = null;

function cropLayout(){
  const img = $('#cropImg'), box = $('#cropBox');
  if (!img.clientWidth) return;
  box.style.left = (cropRect.x * img.clientWidth) + 'px';
  box.style.top = (cropRect.y * img.clientHeight) + 'px';
  box.style.width = (cropRect.w * img.clientWidth) + 'px';
  box.style.height = (cropRect.h * img.clientHeight) + 'px';
}
function cropRatioVal(){ return Number($('#cropRatio').value) || 0; }
function cropApplyRatio(anchor){
  const r = cropRatioVal();
  if (!r) return;
  const img = $('#cropImg');
  const iw = img.clientWidth || 1, ih = img.clientHeight || 1;
  /* 화면 비율 r 을 이미지 좌표 비율로 바꾼다 */
  let w = cropRect.w, h = (cropRect.w * iw) / r / ih;
  if (h > 1){ h = 1; w = (h * ih * r) / iw; }
  cropRect.w = w; cropRect.h = h;
  if (anchor !== 'keep'){
    cropRect.x = clamp(cropRect.x, 0, 1 - w);
    cropRect.y = clamp(cropRect.y, 0, 1 - h);
  }
}
/* 대상은 대사 블록의 이미지이거나 테두리에 넣은 사진이다 */
function cropSource(t){
  if (!t) return null;
  if (t.kind === 'block'){
    const bk = state.blocks.find(x => x.id === t.id);
    return bk && bk.imgOrig ? {src: bk.imgOrig, crop: bk.imgCrop} : null;
  }
  if (t.kind === 'avatar'){
    const sp = state.speakers.find(x => x.id === t.id);
    const src = sp && (sp.avatarOrig || sp.avatar);
    return src ? {src, crop: sp.avatarCrop} : null;
  }
  const key = state.frame + '.' + t.id;
  const orig = (state.frameImgOrig || {})[key] || (state.frameImg || {})[key];
  return orig ? {src: orig, crop: (state.frameCrop || {})[key]} : null;
}
function openCrop(target){
  const src = cropSource(target);
  if (!src) return;
  cropTarget = target;
  cropRect = src.crop ? {...src.crop} : {x:0, y:0, w:1, h:1};
  $('#cropRatio').value = '0';
  const img = $('#cropImg');
  img.onload = () => cropLayout();
  img.src = src.src;
  $('#cropVeil').classList.add('on');
  setTimeout(cropLayout, 30);
}
function cropPoint(e){
  const img = $('#cropImg');
  const r = img.getBoundingClientRect();
  const p = e.touches ? e.touches[0] : e;
  return {x: (p.clientX - r.left) / (r.width || 1), y: (p.clientY - r.top) / (r.height || 1)};
}
function cropStart(e){
  const h = e.target.closest('[data-ch]');
  const inBox = e.target.closest('#cropBox');
  if (!inBox) return;
  e.preventDefault();
  cropDrag = {mode: h ? h.dataset.ch : 'move', from: cropPoint(e), rect: {...cropRect}};
}
function cropMove(e){
  if (!cropDrag) return;
  e.preventDefault();
  const p = cropPoint(e), s0 = cropDrag.rect;
  const dx = p.x - cropDrag.from.x, dy = p.y - cropDrag.from.y;
  const MIN = .06;
  if (cropDrag.mode === 'move'){
    cropRect.x = clamp(s0.x + dx, 0, 1 - s0.w);
    cropRect.y = clamp(s0.y + dy, 0, 1 - s0.h);
  } else {
    let x = s0.x, y = s0.y, w = s0.w, h = s0.h;
    if (cropDrag.mode.includes('w')){ const nx = clamp(s0.x + dx, 0, s0.x + s0.w - MIN); w = s0.x + s0.w - nx; x = nx; }
    if (cropDrag.mode.includes('e')){ w = clamp(s0.w + dx, MIN, 1 - s0.x); }
    if (cropDrag.mode.includes('n')){ const ny = clamp(s0.y + dy, 0, s0.y + s0.h - MIN); h = s0.y + s0.h - ny; y = ny; }
    if (cropDrag.mode.includes('s')){ h = clamp(s0.h + dy, MIN, 1 - s0.y); }
    cropRect = {x, y, w, h};
    if (cropRatioVal()){
      cropApplyRatio('keep');
      cropRect.x = clamp(cropRect.x, 0, 1 - cropRect.w);
      cropRect.y = clamp(cropRect.y, 0, 1 - cropRect.h);
    }
  }
  cropLayout();
}
function cropEnd(){ cropDrag = null; }

async function cropDataUrl(src, c){
  const img = await loadImg(src);
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.round(c.w * iw));
  cv.height = Math.max(1, Math.round(c.h * ih));
  const g = cv.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, Math.round(c.x * iw), Math.round(c.y * ih), cv.width, cv.height, 0, 0, cv.width, cv.height);
  return cv.toDataURL('image/png');
}
async function applyCrop(bk){
  if (!bk.imgOrig) return;
  const c = bk.imgCrop;
  if (!c || (c.x <= 0 && c.y <= 0 && c.w >= 1 && c.h >= 1)){ bk.imgCropped = null; return; }
  bk.imgCropped = await cropDataUrl(bk.imgOrig, c);
}

/* 자르기 → 원형 → 흐리게 순으로 굽는다. 늦게 끝난 옛 작업이 새 결과를 덮지 않게 차례표를 둔다 */
const reprocTurn = {};
async function reprocessBlockImage(bk, opt){
  const turn = (reprocTurn[bk.id] || 0) + 1;
  reprocTurn[bk.id] = turn;
  if (!bk.imgOrig) bk.imgOrig = bk.image;
  try { await applyCrop(bk); } catch (e){ bk.imgCropped = null; }
  const base = bk.imgCropped || bk.imgOrig;
  let out = base;
  if (bk.imgShape === 'circle'){
    try { out = await processImage(base, {circle:true}); }
    catch (e){ toast('이미지를 처리할 수 없습니다'); out = bk.image; }
  }
  if (bk.imgFade && bk.imgFade !== 'none'){
    try { out = await fadeImage(out, bk.imgFade, bk.imgFadeSize); } catch (e){}
  }
  if (reprocTurn[bk.id] !== turn) return;
  bk.image = out;
  if (opt && opt.quiet) return;
  /* 슬라이더를 끄는 중에 목록을 다시 그리면 손잡이가 사라진다. 그때는 썸네일만 바꾼다 */
  if (opt && opt.keepList){
    const th = document.querySelector('.blk[data-id="' + bk.id + '"] .thumb');
    if (th) th.src = out;
    renderCanvas();
  } else { renderBlocks(); renderCanvas(); }
}
/* 흐림 폭 슬라이더는 몰아서 한 번만 굽는다. 저장 직전에는 남은 것을 다 끝낸다 */
const fadeTimers = {}, fadeRuns = new Set();
function runBlockFade(bk){
  const p = reprocessBlockImage(bk, {keepList:true});
  fadeRuns.add(p); p.finally(() => fadeRuns.delete(p));
  return p;
}
function scheduleBlockFade(bk){
  clearTimeout(fadeTimers[bk.id]);
  fadeTimers[bk.id] = setTimeout(() => { delete fadeTimers[bk.id]; runBlockFade(bk); }, 220);
}
async function settleFades(){
  Object.keys(fadeTimers).forEach(id => {
    clearTimeout(fadeTimers[id]); delete fadeTimers[id];
    const bk = state.blocks.find(b => b.id === id);
    if (bk) runBlockFade(bk);
  });
  clearTimeout(bgFadeTimer);
  await Promise.all([...fadeRuns, ensureBgFade(), ensureBgEdge()]);
}
/* 다시 그린 뒤 새 이미지가 읽히며 한 번 더 배치된다. 캡처 도중 그 일이 일어나면 떼어 낸 장을 찍게 된다 */
async function imagesSettled(){
  for (let round = 0; round < 3; round++){
    const pend = Array.from($('#pageStack').querySelectorAll('img')).filter(i => !i.complete);
    if (!pend.length) return;
    await Promise.all(pend.map(i => new Promise(r => {
      i.addEventListener('load', r, {once:true}); i.addEventListener('error', r, {once:true});
    })));
    await new Promise(r => setTimeout(r, 0));
  }
}

function readImage(file, cb){
  const r = new FileReader();
  r.onload = ev => cb(ev.target.result);
  r.readAsDataURL(file);
}
/* ---------------- 서식이 보이는 편집기 ----------------
   편집 칸은 서식(굵게·기울임·형광·글자색·크기)을 기호 대신 모양으로 보여 준다.
   저장은 예전과 같은 기호 글(**, ==, {{ }}, [[ ]], _)이라 작업 파일·프리셋이 그대로 맞는다.
   글자마다 서식을 들고 있는 목록(모델)을 가운데 두고 [기호 글 ⇄ 모델 ⇄ 편집 칸]을 오간다.
   기호 글로 적을 때는 지문·대사 기호(*( )*, * *, 직접 규칙 등)에 서식이 걸치지 않게 그 자리에서 끊는다. */
const FMT_ONLY = {parenStar:false, star:false, paren:false, quote:false, custom:false, rules:[]};
const FMT_KEYS = ['s', 'k', 'm', 'b', 'i', 'u'];
function markupToModel(text){
  const out = [];
  const walk = (nodes, a) => nodes.forEach(n => {
    if (n.type === 'text'){ for (const ch of n.text) out.push(Object.assign({c: ch}, a)); return; }
    const na = Object.assign({}, a);
    if (n.type === 'bold') na.b = 1;
    else if (n.type === 'italic') na.i = 1;
    else if (n.type === 'mark') na.m = n.color || 'default';
    else if (n.type === 'ink') na.k = n.color;
    else if (n.type === 'size') na.s = String(n.color || 100);
    else if (n.type === 'under') na.u = n.color + (n.note ? '^' + n.note : '');
    walk(n.kids || [], na);
  });
  String(text ?? '').split('\n').forEach((line, li) => {
    if (li) out.push({c: '\n'});
    walk(parseInline(line, FMT_ONLY, false), {});
  });
  return out;
}
/* 실제 규칙으로 읽었을 때 지문·대사 기호가 놓이는 글자 자리 */
function markerSpots(plain){
  const spots = new Set();
  const marks = state.marks || MARK_DEFAULTS();
  const mark = (a, b) => { for (let x = a; x < b; x++) spots.add(x); };
  const walk = (nodes, off) => nodes.forEach(n => {
    if (n.type === 'text'){ off += n.text.length; return; }
    const len = n.raw.length;
    if (n.type === 'action' || n.type === 'quote'){
      let ol = 1, cl = 1;
      if (n.open != null){ ol = n.open.length; cl = n.close.length; }
      else if (n.type === 'action' && n.raw.startsWith('*(') && n.raw.endsWith(')*')){ ol = 2; cl = 2; }
      mark(off, off + ol); mark(off + len - cl, off + len);
      walk(n.kids || [], off + ol);
    } else mark(off, off + len); /* 직접 적어 넣은 서식 기호는 손대지 않고 그대로 둔다 */
    off += len;
  });
  let base = 0;
  plain.split('\n').forEach(line => { walk(parseInline(line, marks, true), base); base += line.length + 1; });
  return spots;
}
/* 감싸는 기호와 부딪히는 글자 — 그 글자만 서식 밖으로 뺀다 */
const FMT_BAD = {s: ']', k: '}', m: '=', b: '*', i: '_', u: '⸩'};
/* 서식을 바깥에서 안으로 감싸 나간다. 한 번에 길게 이어지는 서식을 바깥에 두어 기호가 덜 쪼개지게 한다 */
function fmtNest(seg, keys, leaf, wrap){
  if (!keys.length) return leaf(seg);
  const span = k => {
    let n = 0, len = 0;
    for (let i = 0; i < seg.length; i++){
      if (!seg[i][k]) continue;
      len++;
      if (!i || seg[i][k] !== seg[i - 1][k]) n++;
    }
    return n ? len / n : 0;
  };
  const key = keys.reduce((best, k) => span(k) > span(best) ? k : best, keys[0]);
  const rest = keys.filter(k => k !== key);
  let out = '', i = 0;
  while (i < seg.length){
    let j = i;
    while (j < seg.length && (seg[j][key] || null) === (seg[i][key] || null)) j++;
    const inner = fmtNest(seg.slice(i, j), rest, leaf, wrap);
    const v = seg[i][key];
    out += v && inner ? wrap(key, v, inner) : inner;
    i = j;
  }
  return out;
}
function modelToMarkup(model){
  const plain = model.map(x => x.c).join('');
  const spots = markerSpots(plain);
  const bare = (x, idx) => x.c === '\n' || spots.has(idx) || FMT_KEYS.some(k => x[k] && x.c === FMT_BAD[k]);
  const items = model.map((x, idx) => bare(x, idx) ? {c: x.c} : x);
  return fmtNest(items, FMT_KEYS, seg => seg.map(x => x.c).join(''), (key, v, inner) =>
    key === 's' ? '[[' + v + ':' + inner + ']]'
    : key === 'k' ? '{{' + v + ':' + inner + '}}'
    : key === 'm' ? '==' + (v === 'default' ? '' : v + ':') + inner + '=='
    : key === 'u' ? '⸨' + v + ':' + inner + '⸩'
    : key === 'b' ? '**' + inner + '**' : '_' + inner + '_');
}
function modelToHtml(model){
  const html = fmtNest(model, FMT_KEYS, seg => seg.map(x => x.c === '\n' ? '<br>' : escHtml(x.c)).join(''), (key, v, inner) =>
    key === 's' ? '<span data-s="' + escAttr(v) + '" style="font-size:' + clamp(Number(v) || 100, 50, 300) + '%">' + inner + '</span>'
    : key === 'k' ? '<span data-k="' + escAttr(v) + '" style="color:' + markBgOf(v) + '">' + inner + '</span>'
    : key === 'm' ? '<mark data-m="' + escAttr(v) + '" style="background:' +
        markBgOf(v === 'default' ? (state.markColor || '#FDE68A') : v) + '">' + inner + '</mark>'
    : key === 'u' ? '<span data-u="' + escAttr(v) + '" style="text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:3px;text-decoration-color:' +
        markBgOf(String(v).split('^')[0]) + '">' + inner + '</span>'
    : key === 'b' ? '<b>' + inner + '</b>' : '<i>' + inner + '</i>');
  /* 끝이 줄바꿈이면 커서가 설 빈 줄 하나를 덧붙인다 */
  return model.length && model[model.length - 1].c === '\n' ? html + '<br>' : html;
}
const ED_BLOCK = /^(DIV|P|LI|H[1-6]|BLOCKQUOTE)$/;
function domModel(root, trim){
  const out = [];
  let lastLeaf = null;
  const walk = (node, a) => {
    if (node.nodeType === 3){
      for (const ch of node.nodeValue) out.push(Object.assign({c: ch === '\r' ? '\n' : ch}, a));
      if (node.nodeValue) lastLeaf = node;
      return;
    }
    if (node.nodeType !== 1 && node.nodeType !== 11) return;
    if (node.nodeName === 'BR'){ out.push({c: '\n'}); lastLeaf = node; return; }
    const na = Object.assign({}, a);
    if (node.nodeType === 1){
      const t = node.nodeName, d = node.dataset || {};
      if (t === 'B' || t === 'STRONG') na.b = 1;
      if (t === 'I' || t === 'EM') na.i = 1;
      if (d.m) na.m = d.m; else if (t === 'MARK') na.m = 'default';
      if (d.k) na.k = d.k;
      if (d.s) na.s = d.s;
      if (d.u) na.u = d.u;
      /* 브라우저가 줄을 <div>로 나눠 넣는 경우 */
      if (ED_BLOCK.test(t) && node !== root && out.length && out[out.length - 1].c !== '\n') out.push({c: '\n'});
    }
    node.childNodes.forEach(ch => walk(ch, na));
  };
  walk(root, {});
  if (trim && lastLeaf && lastLeaf.nodeName === 'BR' && out.length && out[out.length - 1].c === '\n') out.pop();
  return out;
}
function edOffset(ed, node, off){
  const r = document.createRange();
  r.selectNodeContents(ed);
  try { r.setEnd(node, off); } catch(e){ return 0; }
  return domModel(r.cloneContents(), false).length;
}
function edGetSel(ed){
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  const r = sel.getRangeAt(0);
  if (!ed.contains(r.startContainer) || !ed.contains(r.endContainer)) return null;
  return [edOffset(ed, r.startContainer, r.startOffset), edOffset(ed, r.endContainer, r.endOffset)];
}
function edPoint(ed, n){
  let left = n, found = null;
  const walk = node => {
    if (found) return;
    if (node.nodeType === 3){
      const L = node.nodeValue.length;
      if (left <= L){ found = [node, left]; return; }
      left -= L; return;
    }
    if (node.nodeName === 'BR'){
      const i = Array.prototype.indexOf.call(node.parentNode.childNodes, node);
      if (left === 0){ found = [node.parentNode, i]; return; }
      left -= 1;
      if (left === 0 && !node.nextSibling){ found = [node.parentNode, i + 1]; }
      return;
    }
    node.childNodes.forEach(walk);
  };
  ed.childNodes.forEach(walk);
  return found || [ed, ed.childNodes.length];
}
function edSetSel(ed, s, e){
  const sel = window.getSelection();
  if (!sel) return;
  const r = document.createRange();
  const a = edPoint(ed, s), b = edPoint(ed, e);
  try { r.setStart(a[0], a[1]); r.setEnd(b[0], b[1]); } catch(err){ return; }
  sel.removeAllRanges(); sel.addRange(r);
  ed._sel = [s, e];
}
function edHtml(bk){ return modelToHtml(markupToModel(bk.text || '')); }
/* 서식 버튼을 누르면 편집 칸의 선택이 풀릴 수 있어 마지막 선택을 붙잡아 둔다 */
document.addEventListener('selectionchange', () => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;
  const n = sel.getRangeAt(0).startContainer;
  const ed = n && (n.nodeType === 1 ? n : n.parentElement);
  const host = ed && ed.closest && ed.closest('.ed');
  if (host){ const v = edGetSel(host); if (v) host._sel = v; }
});
function edCtx(id){
  const ed = $('[data-tx="' + id + '"]');
  /* 메모도 같은 편집 칸을 쓴다 */
  const bk = state.blocks.find(x => x.id === id) || (state.memos || []).find(x => x.id === id);
  if (!ed || !bk) return null;
  const live = document.activeElement === ed ? edGetSel(ed) : null;
  const [s, e] = live || ed._sel || [0, 0];
  return {ed, bk, model: domModel(ed, true), s: Math.min(s, e), e: Math.max(s, e)};
}
function edCommit(cx, model, s, e){
  snapshot();
  cx.bk.text = modelToMarkup(model);
  cx.ed.innerHTML = edHtml(cx.bk);
  cx.ed.focus();
  edSetSel(cx.ed, s, e);
  renderCanvas();
}
/* 선택한 글자 모두가 이미 그 서식이면 벗기고, 아니면 입힌다 */
function edToggle(id, key, val, emptyMsg){
  const cx = edCtx(id);
  if (!cx) return;
  if (cx.s === cx.e){ toast(emptyMsg); cx.ed.focus(); return; }
  const part = cx.model.slice(cx.s, cx.e).filter(x => x.c !== '\n');
  const all = part.length && part.every(x => key === 'm' || key === 'k' || key === 's' || key === 'u' ? !!x[key] : x[key] === val);
  cx.model.slice(cx.s, cx.e).forEach(x => { if (x.c === '\n') return; if (all) delete x[key]; else x[key] = val; });
  edCommit(cx, cx.model, cx.s, cx.e);
}
/* 지문·따옴표 버튼 — 서식이 아니라 기호 글자를 앞뒤에 넣는다. 이미 감싸여 있으면 걷어낸다 */
function applyFormat(id, a, b){
  if (a === '**') return edToggle(id, 'b', 1, '먼저 굵게 할 부분을 선택하세요');
  if (a === '_') return edToggle(id, 'i', 1, '먼저 기울일 부분을 선택하세요');
  const cx = edCtx(id);
  if (!cx) return;
  const {model, s, e} = cx;
  if (s === e){ toast('먼저 감쌀 부분을 선택하세요'); cx.ed.focus(); return; }
  const txt = (i, j) => model.slice(Math.max(0, i), j).map(x => x.c).join('');
  const chars = t => Array.from(t).map(c => ({c}));
  let next, ns, ne;
  if (s >= a.length && txt(s - a.length, s) === a && txt(e, e + b.length) === b){
    next = model.slice(0, s - a.length).concat(model.slice(s, e), model.slice(e + b.length));
    ns = s - a.length; ne = e - a.length;
  } else if (e - s >= a.length + b.length && txt(s, s + a.length) === a && txt(e - b.length, e) === b){
    next = model.slice(0, s).concat(model.slice(s + a.length, e - b.length), model.slice(e));
    ns = s; ne = e - a.length - b.length;
  } else {
    next = model.slice(0, s).concat(chars(a), model.slice(s, e), chars(b), model.slice(e));
    ns = s + a.length; ne = e + a.length;
  }
  edCommit(cx, next, ns, ne);
}/* 형광펜은 색을 함께 적는다: ==#FFD86B:텍스트== (투명도는 뒤 두 자리 #FFD86B80) */
function withAlpha(hex, op){
  const a = clamp(100 - (Number(op) || 0), 0, 100);
  if (a >= 100) return hex;
  const v = Math.round(a * 255 / 100).toString(16).padStart(2, '0');
  return (hex || '#FDE68A') + v;
}
function toggleMark(id, color){ edToggle(id, 'm', color, '먼저 칠할 부분을 선택하세요'); }
/* 선택한 곳(없으면 블록 전체)의 서식 기호를 모두 없앤다 */
function stripFormat(id){
  const cx = edCtx(id);
  if (!cx) return;
  const whole = cx.s === cx.e;
  const s0 = whole ? 0 : cx.s, e0 = whole ? cx.model.length : cx.e;
  const part = cx.model.slice(s0, e0);
  if (!part.some(x => FMT_KEYS.some(k => x[k]))){ toast('지울 서식이 없습니다'); return; }
  part.forEach(x => FMT_KEYS.forEach(k => { delete x[k]; }));
  edCommit(cx, cx.model, s0, e0);
  if (whole) toast('블록 전체의 서식을 지웠습니다');
}/* 편집 칸에 줄바꿈·붙여넣기를 직접 넣는다 — 브라우저마다 <div>·서식째 넣는 방식이 달라서 */
function edInsertText(ed, text){
  const id = ed.dataset.tx;
  const cx = edCtx(id);
  if (!cx) return;
  const t = String(text).replace(/\r\n?/g, '\n');
  const ins = Array.from(t).map(c => ({c}));
  /* 이어 치는 글은 바로 앞 글자의 서식을 따른다 (줄바꿈 제외) */
  const prev = cx.s > 0 ? cx.model[cx.s - 1] : null;
  if (prev && prev.c !== '\n') ins.forEach(x => { if (x.c !== '\n') FMT_KEYS.forEach(k => { if (prev[k]) x[k] = prev[k]; }); });
  const next = cx.model.slice(0, cx.s).concat(ins, cx.model.slice(cx.e));
  edCommit(cx, next, cx.s + ins.length, cx.s + ins.length);
}
$('#blockList').addEventListener('mousedown', e => {
  if (e.target.closest && e.target.closest('.fmt button')) e.preventDefault();
});
$('#blockList').addEventListener('paste', e => {
  const ed = e.target.closest && e.target.closest('.ed');
  if (!ed) return;
  e.preventDefault();
  const t = (e.clipboardData || window.clipboardData).getData('text/plain') || '';
  if (t) edInsertText(ed, t);
});
$('#blockList').addEventListener('drop', e => { if (e.target.closest && e.target.closest('.ed')) e.preventDefault(); });
$('#blockList').addEventListener('keydown', e => {
  if (!e.target.dataset.tx) return;
  const id = e.target.dataset.tx;
  if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.isComposing && e.keyCode !== 229){
    e.preventDefault(); edInsertText(e.target, '\n'); return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b'){ e.preventDefault(); applyFormat(id, '**', '**'); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i'){ e.preventDefault(); applyFormat(id, '_', '_'); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h'){
    e.preventDefault();
    toggleMark(id, withAlpha(state.markColor || '#FDE68A', state.markAlpha));
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u'){ e.preventDefault(); toggleUnder(id, state.ulColor || '#D9534F'); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); addLine(id); }
});

/* add blocks */
function addLine(afterId){
  snapshot();
  const last = [...state.blocks].reverse().find(b => b.type === 'line' && b.speakerId);
  const others = state.speakers.filter(s => !last || s.id !== last.speakerId);
  const nextSp = others.length ? others[0].id : (state.speakers[0] ? state.speakers[0].id : '');
  const nb = {id:uid(), type:'line', speakerId:nextSp, text:'', image:null};
  const i = afterId ? state.blocks.findIndex(b => b.id === afterId) : -1;
  if (i >= 0) state.blocks.splice(i + 1, 0, nb); else state.blocks.push(nb);
  renderBlocks(); renderCanvas();
  const ta = $('[data-tx="' + nb.id + '"]');
  if (ta){ ta.focus(); ta.scrollIntoView({block:'center'}); }
}
$('#btnFoldAll').addEventListener('click', () => {
  const marks = Array.from($('#blockList').querySelectorAll('.pagemark'));
  if (foldedPages.size >= marks.length) foldedPages.clear();
  else marks.forEach(m => foldedPages.add(Number(m.dataset.pg)));
  applyPageFold();
});
$('#btnAddLine').addEventListener('click', () => addLine());
$('#btnAddImg').addEventListener('click', () => {
  snapshot();
  state.blocks.push({id:uid(), type:'img', image:null, imgShape:'round', imgAlign:'center', imgSize:100, imgOpacity:100});
  renderBlocks(); renderCanvas();
  const el = $('#blockList .blk:last-child .filebtn');
  if (el) el.scrollIntoView({block:'center', behavior:'smooth'});
});
$('#btnAddHtml').addEventListener('click', () => {
  snapshot();
  const nb = {id:uid(), type:'html', html:''};
  state.blocks.push(nb);
  renderBlocks(); renderCanvas();
  const el = $('[data-hedit="' + nb.id + '"]');
  if (el) el.scrollIntoView({block:'center'});
  openHtmlEdit(nb.id);
});
$('#htmlApply').addEventListener('click', () => closeHtmlEdit(true));
$('#htmlCancel').addEventListener('click', () => closeHtmlEdit(false));
$('#htmlEdit').addEventListener('keydown', e => {
  /* 들여쓰기용 Tab, 적용은 Ctrl+Enter */
  if (e.key === 'Tab' && !e.shiftKey){
    e.preventDefault();
    const t = e.target, a = t.selectionStart, b = t.selectionEnd;
    t.value = t.value.slice(0, a) + '  ' + t.value.slice(b);
    t.selectionStart = t.selectionEnd = a + 2;
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); closeHtmlEdit(true); }
});
$('#btnAddBreak').addEventListener('click', () => {
  snapshot();
  state.blocks.push({id:uid(), type:'pb'});
  renderBlocks(); renderCanvas();
});
$('#btnAddRule').addEventListener('click', () => {
  snapshot();
  state.blocks.push({id:uid(), type:'rule', line:'solid', sym:'✦', color:'#9A93A5', width:70, thick:1, symSize:100});
  renderBlocks(); renderCanvas();
});

/* ---------------- drag reorder ---------------- */
let drag = null;
$('#blockList').addEventListener('pointerdown', e => {
  const grip = e.target.closest('.grip');
  if (!grip) return;
  const el = grip.closest('.blk');
  e.preventDefault();
  grip.setPointerCapture(e.pointerId);
  drag = {el, grip};
  el.classList.add('dragging');
});
$('#blockList').addEventListener('pointermove', e => {
  if (!drag) return;
  const list = $('#blockList');
  const others = Array.from(list.querySelectorAll('.blk:not(.dragging)'));
  const after = others.find(s => {
    const r = s.getBoundingClientRect();
    return e.clientY <= r.top + r.height / 2;
  });
  if (after) list.insertBefore(drag.el, after); else list.appendChild(drag.el);
  const sc = list.closest('.pane-scroll');
  const r = sc.getBoundingClientRect();
  if (e.clientY < r.top + 50) sc.scrollTop -= 12;
  else if (e.clientY > r.bottom - 50) sc.scrollTop += 12;
});
function endDrag(){
  if (!drag) return;
  drag.el.classList.remove('dragging');
  const order = Array.from($('#blockList').querySelectorAll('.blk')).map(b => b.dataset.id);
  snapshot();
  state.blocks.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  drag = null;
  renderCanvas();
}
$('#blockList').addEventListener('pointerup', endDrag);
$('#blockList').addEventListener('pointercancel', endDrag);

/* ---------------- style controls ---------------- */
['#modeSegA', '#modeSegB'].forEach(sel => $(sel).addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  snapshot(); state.mode = b.dataset.v; syncControls(); renderCanvas();
}));
$('#nameSep').addEventListener('change', e => { snapshot(); state.nameSep = e.target.value; renderCanvas(); });
['#wrapQuote', '#wrapQuote2'].forEach(sel => $(sel).addEventListener('change', e => {
  snapshot(); state.wrapQuote = e.target.value; syncControls(); renderCanvas();
}));
/* 인용구 템플릿 고르기 — 판에 그려지는 모양을 작게 흉내 낸 견본 */
function renderQuoteTpls(){
  const g = $('#qtplGrid'); if (!g) return;
  const cur = quoteTpl().k;
  if (g.dataset.built !== '1'){
    g.innerHTML = QUOTE_TPLS.map(t => '<button class="qtpl" data-qtpl="' + t.k + '"><span class="qprev qt-' + t.k + '">' + {
      bar:'<i class="b"></i><i class="l1"></i><i class="l2"></i><i class="nm r"></i>',
      quotes:'<b class="qo">“</b><i class="l1 c"></i><i class="l2 c"></i><b class="qc">”</b><i class="nm c"></i>',
      lines:'<i class="hr"></i><i class="l1 c"></i><i class="l2 c"></i><i class="hr"></i><i class="nm c"></i>',
      bubble:'<span class="bx"><i class="l1"></i><i class="l2"></i></span><i class="tail"></i><i class="nm"></i>',
      postit:'<span class="bx"><i class="nm d"></i><i class="l1"></i><i class="l2"></i></span>',
      card:'<span class="bx"><i class="nm d"></i><i class="hr2"></i><i class="l1"></i><i class="l2"></i></span>',
      frame:'<span class="bx"><i class="tg"></i><i class="l1"></i><i class="l2"></i></span>',
      script:'<i class="nm col"></i><span class="sc"><i class="l1"></i><i class="l2"></i></span>'
    }[t.k] + '</span><em>' + t.l + '</em></button>').join('');
    g.dataset.built = '1';
  }
  g.querySelectorAll('[data-qtpl]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.qtpl === cur)));
}
$('#qtplGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-qtpl]'); if (!b) return;
  snapshot(); state.quoteTpl = b.dataset.qtpl; renderQuoteTpls(); renderCanvas();
});
$('#frameChoiceText').addEventListener('input', e => { snapshotSoon(); state.frameChoiceText = e.target.value; renderCanvas(); });
/* 테마가 건드리는 배치 값 — 어느 테마든 preset에 적은 값은 테마를 바꿀 때 기본으로 돌린다 */
const THEME_RESET_KEYS = Array.from(new Set(Object.values(THEMES).flatMap(t => Object.keys(t.preset || {}))
  .concat(['indentOn', 'indentDlg'])));
$('#themeGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-theme]'); if (!b) return;
  snapshot();
  const key = b.dataset.theme, t = THEMES[key];
  /* 테마를 바꾸면 앞 테마가 바꿔 둔 배치(소설책의 글줄·들여쓰기 등)까지 기본으로 되돌린 뒤 새 테마를 씌운다.
     안 그러면 색만 바뀌고 앞 테마의 배치가 남아 테마가 제대로 안 먹은 것처럼 보인다. */
  const def = DEFAULT_STATE();
  THEME_RESET_KEYS.forEach(k => { state[k] = JSON.parse(JSON.stringify(def[k] === undefined ? null : def[k])); if (def[k] === undefined) delete state[k]; });
  state.theme = key; state.bgColor = t.bg; state.bgColor2 = t.bg2; state.font = t.font;
  if (state.bgKind !== 'gradient') state.bgKind = 'solid';
  state.tint = 0;
  state.speakers.forEach((sp, i) => Object.assign(sp, t.pairs[i % t.pairs.length]));
  state.narrator = Object.assign({}, state.narrator, {text: def.narrator.text, action: def.narrator.action, bubble: def.narrator.bubble}, t.narr || {});
  if (t.preset) Object.assign(state, JSON.parse(JSON.stringify(t.preset)));
  renderAll();
});
const bindCheck = (sel, fn) => $(sel).addEventListener('change', e => { snapshot(); fn(e.target.checked); renderCanvas(); });
bindCheck('#optHideNames', v => state.hideNames = v);
bindCheck('#optAligned', v => state.alignedText = v);
bindCheck('#mkParenStar', v => state.marks.parenStar = v);
bindCheck('#mkStar', v => state.marks.star = v);
bindCheck('#mkParen', v => state.marks.paren = v);
bindCheck('#mkQuote', v => state.marks.quote = v);
/* 직접 지문 규칙 */
function renderMarkRules(){
  const list = $('#mkRules');
  const rules = state.marks.rules || (state.marks.rules = []);
  $('#mkCustom').checked = !!state.marks.custom;
  $('#mkCustomBox').hidden = !state.marks.custom;
  if (!rules.length){
    list.innerHTML = '<div class="empty">규칙이 없습니다. 아래에서 추가하세요.</div>';
    return;
  }
  const opt = (v, l, cur) => '<option value="' + v + '"' + (cur === v ? ' selected' : '') + '>' + l + '</option>';
  list.innerHTML = rules.map((r, i) =>
    '<div class="mkrow">' +
      '<input type="text" data-mko="' + i + '" value="' + escAttr(r.open) + '" placeholder="여는" title="여는 기호">' +
      '<span class="mktil">~</span>' +
      '<input type="text" data-mkc="' + i + '" value="' + escAttr(r.close) + '" placeholder="닫는" title="닫는 기호">' +
      '<select data-mkk="' + i + '" title="기호 사이를 무엇으로 읽을지">' + opt('action', '지문', r.kind) + opt('talk', '대사', r.kind) + '</select>' +
      '<label class="mkshow" title="끄면 그림에는 기호 안의 글만 남습니다"><input type="checkbox" data-mks="' + i + '"' + (r.show ? ' checked' : '') + '> 그림에 기호도 표시</label>' +
      '<button class="mini danger" data-mkdel="' + i + '" title="규칙 삭제">✕</button>' +
    '</div>').join('');
}
$('#mkCustom').addEventListener('change', e => {
  snapshot();
  state.marks.custom = e.target.checked;
  const rules = state.marks.rules || (state.marks.rules = []);
  /* 처음 켜면 빈 칸 하나를 바로 내어 준다 */
  if (state.marks.custom && !rules.length) rules.push({open:'', close:'', kind:'action', show:false});
  renderMarkRules(); renderCanvas();
  if (state.marks.custom){ const ins = $$('#mkRules [data-mko]'); if (ins.length && !ins[ins.length - 1].value) ins[ins.length - 1].focus(); }
});
$('#mkAdd').addEventListener('click', () => {
  snapshot();
  (state.marks.rules || (state.marks.rules = [])).push({open:'', close:'', kind:'action', show:false});
  renderMarkRules();
  const ins = $$('#mkRules [data-mko]');
  if (ins.length) ins[ins.length - 1].focus();
});
$('#mkRules').addEventListener('input', e => {
  const t = e.target, rules = state.marks.rules;
  if (t.dataset.mko != null){ snapshotSoon(); rules[t.dataset.mko].open = t.value; renderCanvas(); }
  else if (t.dataset.mkc != null){ snapshotSoon(); rules[t.dataset.mkc].close = t.value; renderCanvas(); }
});
$('#mkRules').addEventListener('change', e => {
  const t = e.target, rules = state.marks.rules;
  if (t.dataset.mkk != null){ snapshot(); rules[t.dataset.mkk].kind = t.value; renderCanvas(); }
  else if (t.dataset.mks != null){ snapshot(); rules[t.dataset.mks].show = t.checked; renderCanvas(); }
});
$('#mkRules').addEventListener('click', e => {
  const b = e.target.closest('[data-mkdel]'); if (!b) return;
  snapshot(); state.marks.rules.splice(Number(b.dataset.mkdel), 1);
  renderMarkRules(); renderCanvas();
});
$('#actionMode').addEventListener('change', e => { snapshot(); state.actionMode = e.target.value; renderCanvas(); });
$('#alignSeg').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  snapshot(); state.textAlign = b.dataset.v; syncControls(); renderCanvas();
});
/* 테두리를 고를 때 함께 바뀔 수 있는 값들 — 실제로 달라지는 것만 추린다 */
function tuneKey(f){
  const vs = FRAME_VARIANTS[f];
  if (vs) return f + ':' + ((state.frameVar || {})[f] || vs[0][0]);
  return f;
}
function tuneFor(f){ return FRAME_TUNE[tuneKey(f)] || FRAME_TUNE[f]; }
function maybeTune(){
  const mode = state.frameAsk || 'ask';
  const list = mode === 'never' ? [] : pendingTune(state.frame);
  if (!list.length) return;
  if (mode === 'always'){ applyTune(list); toast('추천 설정 ' + list.length + '개를 함께 적용했습니다'); }
  else openTune(list);
}
function simpleRatio(w, h){
  w = Math.max(1, Math.round(Number(w) || 1)); h = Math.max(1, Math.round(Number(h) || 1));
  const g = (a, b) => b ? g(b, a % b) : a;
  const d = g(w, h) || 1;
  let sw = w / d, sh = h / d;
  while (sw > 99 || sh > 99){ sw = Math.max(1, Math.round(sw / 2)); sh = Math.max(1, Math.round(sh / 2)); }
  return [sw, sh];
}
const showRatio = (r, w, h) => r === 'custom' ? (simpleRatio(w, h).join(' : ')) : ratioName(r);
function pendingTune(f){
  const t = tuneFor(f);
  if (!t) return [];
  const out = [];
  if (t.ratio !== undefined){
    const cus = t.ratio === 'custom';
    const same = cus
      ? (state.ratio === 'custom' && Number(state.ratioW) === t.ratioW && Number(state.ratioH) === t.ratioH)
      : state.ratio === t.ratio;
    if (!same) out.push({key:'ratio', label:'배경 비율',
      from: showRatio(state.ratio, state.ratioW, state.ratioH),
      to: showRatio(t.ratio, t.ratioW, t.ratioH), val:t});
  }
  TUNE_META.forEach(([key, label, fmt]) => {
    if (t[key] === undefined) return;
    const cur = state[key];
    const same = (typeof t[key] === 'boolean') ? (!!cur === t[key])
      : (typeof t[key] === 'string') ? String(cur).toUpperCase() === t[key].toUpperCase()
      : Number(cur) === Number(t[key]);
    if (same) return;
    out.push({key, label, from:fmt(cur), to:fmt(t[key]), val:t[key], swatch:key === 'frameColor'});
  });
  return out;
}
function applyTune(list){
  list.forEach(it => {
    if (it.key === 'ratio'){
      state.ratio = it.val.ratio;
      if (it.val.ratio === 'custom'){ const [sw, sh] = simpleRatio(it.val.ratioW, it.val.ratioH); state.ratioW = sw; state.ratioH = sh; }
      zoomAuto = true;
    } else state[it.key] = it.val;
  });
  syncControls(); renderCanvas();
}
let tunePending = [];
function openTune(list){
  tunePending = list;
  $('#tuneList').innerHTML = list.map((it, i) =>
    '<label class="check tunerow"><input type="checkbox" data-tune="' + i + '" checked>' +
      '<b>' + it.label + '</b>' +
      '<span class="tuneval">' + escHtml(it.from) + ' → ' + escHtml(it.to) + '</span>' +
      (it.swatch ? '<i class="tunesw" style="background:' + it.to + '"></i>' : '') +
    '</label>').join('');
  $('#tuneVeil').classList.add('on');
}
$('#tuneSkip').addEventListener('click', () => $('#tuneVeil').classList.remove('on'));
$('#tuneVeil').addEventListener('click', e => { if (e.target.id === 'tuneVeil') $('#tuneVeil').classList.remove('on'); });
$('#tuneApply').addEventListener('click', () => {
  const picked = tunePending.filter((_, i) => {
    const c = $('[data-tune="' + i + '"]');
    return c && c.checked;
  });
  $('#tuneVeil').classList.remove('on');
  if (picked.length) applyTune(picked);
});
$('#frameAsk').addEventListener('change', e => { state.frameAsk = e.target.value; });
/* 예전에 '제목' 칸에 적어 둔 폴라로이드 캡션을 여러 줄 칸으로 옮긴다 */
function migratePolaroidCaption(){
  if (!state.frameTitle) return;
  if (!state.frameText) state.frameText = {};
  if (!state.frameText['polaroid.cap']) state.frameText['polaroid.cap'] = state.frameTitle;
}
$('#frameSel').addEventListener('change', e => {
  snapshot();
  state.frame = e.target.value;
  if (state.frame === 'polaroid') migratePolaroidCaption();
  const mode = state.frameAsk || 'ask';
  const list = mode === 'never' ? [] : pendingTune(state.frame);
  syncControls(); renderCanvas();
  if (!list.length) return;
  if (mode === 'always'){ applyTune(list); toast('추천 설정 ' + list.length + '개를 함께 적용했습니다'); }
  else openTune(list);
});

$('#frameColor').addEventListener('input', e => { state.frameColor = e.target.value; renderCanvas(); });
$('#frameTitle').addEventListener('input', e => { state.frameTitle = e.target.value; renderCanvas(); });
$('#frameHtml').addEventListener('input', e => { snapshotSoon(); state.frameHtml = e.target.value; renderCanvas(); });
$('#frameOnTop').addEventListener('change', e => { snapshot(); state.frameOnTop = e.target.checked; renderCanvas(); });
$('#frameEls').addEventListener('change', e => {
  const k = e.target.dataset.fel; if (!k) return;
  snapshot();
  const before = tuneKey(state.frame);
  if (!state.frameEls) state.frameEls = {};
  state.frameEls[state.frame + '.' + k] = e.target.checked;
  syncControls(); renderCanvas();
  if (tuneKey(state.frame) !== before) maybeTune();
});
$('#frameVar').addEventListener('change', e => {
  snapshot();
  if (!state.frameVar) state.frameVar = {};
  state.frameVar[state.frame] = e.target.value;
  syncControls(); renderCanvas();
  maybeTune();
});
function setFTx(k, v){
  if (!state.frameText) state.frameText = {};
  state.frameText[state.frame + '.' + k] = v;
}
$('#frameFields').addEventListener('input', e => {
  const ck = e.target.dataset.ftxc;
  if (ck){ setFTx(ck, e.target.value); renderCanvas(); return; }
  const k = e.target.dataset.ftx;
  if (!k || e.target.tagName === 'SELECT') return;
  snapshotSoon(); setFTx(k, e.target.value); renderCanvas();
});
$('#frameFields').addEventListener('change', e => {
  const k = e.target.dataset.ftx;
  if (k && e.target.tagName === 'SELECT'){ snapshot(); setFTx(k, e.target.value); renderCanvas(); return; }
  const ik = e.target.dataset.fimg;
  if (ik){
    const file = e.target.files && e.target.files[0];
    if (file) readImage(file, async d => {
      snapshot();
      if (!state.frameImg) state.frameImg = {};
      const fkey = state.frame + '.' + ik;
      if (state.frameImgOrig) delete state.frameImgOrig[fkey];
      if (state.frameCrop) delete state.frameCrop[fkey];
      try { state.frameImg[fkey] = await prepareImage(d, 2000); }
      catch (err){ toast('이 이미지는 읽을 수 없습니다'); return; }
      syncControls(); renderCanvas();
    });
  }
});
$('#frameFields').addEventListener('click', e => {
  const fc = e.target.closest('[data-fcrop]');
  if (fc){ openCrop({kind:'frame', id:fc.dataset.fcrop}); return; }
  const dk = e.target.dataset.fimgdel; if (!dk) return;
  snapshot();
  const dkey = state.frame + '.' + dk;
  if (state.frameImg) delete state.frameImg[dkey];
  if (state.frameImgOrig) delete state.frameImgOrig[dkey];
  if (state.frameCrop) delete state.frameCrop[dkey];
  syncControls(); renderCanvas();
});
['insT','insB','insX'].forEach(id => $('#' + id).addEventListener('input', e => {
  if (!state.frameText) state.frameText = {};
  state.frameText['custom.' + id] = e.target.value;
  renderCanvas();
}));
$('#frameSample').addEventListener('click', () => {
  snapshot();
  state.frameHtml = FRAME_SAMPLE;
  if (!state.frameText) state.frameText = {};
  state.frameText['custom.insT'] = '40';
  syncControls(); renderCanvas();
  toast('예시를 넣고 위쪽 자리 40px를 비워 뒀습니다');
});
$('#framePrompt').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(FRAME_PROMPT);
    toast('프롬프트를 복사했습니다 · AI에게 붙여 넣으세요');
  } catch (e){
    $('#frameHtml').value = FRAME_PROMPT;
    toast('복사가 막혀 있어 입력칸에 넣었습니다 · 잘라내 쓰세요');
  }
});
$('#frameClearHtml').addEventListener('click', () => { snapshot(); state.frameHtml = ''; syncControls(); renderCanvas(); });
$('#ratioSel').addEventListener('change', e => { snapshot(); state.ratio = e.target.value; $('#customRatio').hidden = state.ratio !== 'custom'; $('#customRatioTip').hidden = state.ratio !== 'custom'; zoomAuto = true; renderCanvas(); });
[['usePageNo','usePageNo','#pageNoOpts'],['useDocTitle','useDocTitle','#docTitleOpts'],['useStamp','useStamp','#stampOpts']]
  .forEach(([id, key, box]) => $('#' + id).addEventListener('change', e => {
    snapshot(); state[key] = e.target.checked; $(box).hidden = !e.target.checked; renderCanvas();
  }));
$('#pageNoSel').addEventListener('change', e => { snapshot(); state.pageNo = e.target.value; renderCanvas(); });
$('#pageNoPos').addEventListener('change', e => { snapshot(); state.pageNoPos = e.target.value; renderCanvas(); });
$('#pageNoColor').addEventListener('input', e => { state.pageNoColor = e.target.value; renderCanvas(); });
$('#docTitle').addEventListener('input', e => { snapshotSoon(); state.docTitle = e.target.value; renderCanvas(); });
$('#docTitleAlign').addEventListener('change', e => { snapshot(); state.docTitleAlign = e.target.value; renderCanvas(); });
$('#docTitleWhere').addEventListener('change', e => { snapshot(); state.docTitleWhere = e.target.value; renderCanvas(); });
$('#docTitleColor').addEventListener('input', e => { state.docTitleColor = e.target.value; renderCanvas(); });
$('#docTitleFont').addEventListener('change', e => { snapshot(); state.docTitleFont = e.target.value; renderCanvas(); });
$('#docTitleDeco').addEventListener('change', e => {
  snapshot(); state.docTitleDeco = e.target.value;
  $('#docTitleEyebrowWrap').hidden = e.target.value !== 'tag';
  renderCanvas();
});
$('#docTitleEyebrow').addEventListener('input', e => { snapshotSoon(); state.docTitleEyebrow = e.target.value; renderCanvas(); });
$('#stampText').addEventListener('input', e => { snapshotSoon(); state.stampText = e.target.value; renderCanvas(); });
$('#stampPos').addEventListener('change', e => { snapshot(); state.stampPos = e.target.value; renderCanvas(); });
$('#stampColor').addEventListener('input', e => { state.stampColor = e.target.value; renderCanvas(); });
$('#stampSize').addEventListener('input', e => { state.stampSize = clamp(Number(e.target.value) || 11, 6, 40); renderCanvas(); });
$('#stampFont').addEventListener('change', e => { snapshot(); state.stampFont = e.target.value; renderCanvas(); });
$('#ratioW').addEventListener('input', e => { state.ratioW = Number(e.target.value) || 1000; renderCanvas(); });
$('#ratioH').addEventListener('input', e => { state.ratioH = Number(e.target.value) || 1500; renderCanvas(); });
function syncBgWraps(){
  const underGrad = state.bgKind === 'image' && state.bgUnder === 'gradient';
  $('#bgColor2Wrap').hidden = !(state.bgKind === 'gradient' || underGrad);
  $('#bgImageWrap').hidden = state.bgKind !== 'image';
  $('#bgFadeSizeWrap').hidden = (state.bgFade || 'none') === 'none';
}
$('#bgKind').addEventListener('change', e => {
  snapshot(); state.bgKind = e.target.value;
  syncBgWraps();
  renderCanvas();
});
$('#bgUnder').addEventListener('change', e => { snapshot(); state.bgUnder = e.target.value; syncBgWraps(); renderCanvas(); });
$('#bgFade').addEventListener('change', e => { snapshot(); state.bgFade = e.target.value; syncBgWraps(); renderCanvas(); });
$('#bgFadeSize').addEventListener('input', e => {
  snapshotSoon();
  state.bgFadeSize = Number(e.target.value);
  const o = e.target.closest('.rangerow').querySelector('.numin, output'); if (o) o.value = e.target.value + '%';
  renderCanvas();
});
$('#bubShape').addEventListener('change', e => { snapshot(); state.bubbleShape = e.target.value; renderCanvas(); });
$('#bubShadow').addEventListener('change', e => { snapshot(); state.bubbleShadow = e.target.value === '1'; renderCanvas(); });
$('#bgColor').addEventListener('input', e => { state.bgColor = e.target.value; renderCanvas(); });
$('#bgColor2').addEventListener('input', e => { state.bgColor2 = e.target.value; renderCanvas(); });
$('#bgImage').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if (f) readImage(f, async d => {
    snapshot();
    try { state.bgImage = await prepareImage(d, 4200); }
    catch (err){ toast('이 이미지는 읽을 수 없습니다'); return; }
    state.bgKind = 'image';
    syncControls(); renderCanvas();
  });
});
$('#bgImageClear').addEventListener('click', () => { snapshot(); state.bgImage = null; renderCanvas(); });
$('#bgFit').addEventListener('change', e => { snapshot(); state.bgFit = e.target.value; renderCanvas(); });
$('#bgPattern').addEventListener('change', e => { snapshot(); state.bgPattern = e.target.value; syncControls(); renderCanvas(); });
$('#bgPatColor').addEventListener('input', e => { state.bgPatColor = e.target.value; renderCanvas(); });
$('#bgPatSymbol').addEventListener('input', e => { state.bgPatSymbol = e.target.value || '★'; renderCanvas(); });
$('#tint').addEventListener('input', e => { state.tint = Number(e.target.value); $('#tintOut').value = state.tint; renderCanvas(); });
$('#fontSel').addEventListener('change', e => { snapshot(); state.font = e.target.value; renderCanvas(); });
const bindRange = (sel, out, fn, fmt) => $(sel).addEventListener('input', e => {
  const v = Number(e.target.value); fn(v); $(out).value = fmt ? fmt(v) : v; renderCanvas();
});
bindRange('#fsRange', '#fsOut', v => state.fontSize = v, v => v + 'px');
bindRange('#lhRange', '#lhOut', v => state.lineHeight = v / 100, v => (v / 100).toFixed(2));
bindRange('#lsRange', '#lsOut', v => state.letterSpace = v, v => (v / 100).toFixed(2));
bindRange('#hsRange', '#hsOut', v => state.hScale = v, v => v + '%');
bindRange('#fwRange', '#fwOut', v => state.fontWeight = v);
$('#wbSel').addEventListener('change', e => { snapshot(); state.wordBreak = e.target.value; renderCanvas(); });
bindRange('#pgRange', '#pgOut', v => state.pgap = v, v => (v / 100).toFixed(2));
bindRange('#inRange', '#inOut', v => state.indent = v, v => (v / 100).toFixed(2));
$('#inOn').addEventListener('change', e => {
  snapshot();
  state.indentOn = e.target.checked;
  /* 간격이 0인 채로 켜면 켠 티가 안 나므로 한 글자만큼 넣어 준다 */
  if (state.indentOn && !(Number(state.indent) > 0)){
    state.indent = 100;
    $('#inRange').value = 100; $('#inOut').value = '1.00';
  }
  $('#inOpts').hidden = !state.indentOn;
  renderCanvas();
});
$('#inDlg').addEventListener('change', e => { snapshot(); state.indentDlg = e.target.checked; renderCanvas(); });
bindRange('#bwRange', '#bwOut', v => state.bubbleWidth = v, v => v + '%');
bindRange('#bwRange2', '#bwOut2', v => state.bubbleWidth = v, v => v + '%');
bindRange('#bpRange', '#bpOut', v => state.bubblePad = v, v => (v / 100).toFixed(2));
bindRange('#padXRange', '#padXOut', v => state.padX = v, v => v + 'px');
bindRange('#padYRange', '#padYOut', v => state.padY = v, v => v + 'px');
bindRange('#gapRange', '#gapOut', v => state.gap = v, v => v + 'px');
bindRange('#bubRange', '#bubOut', v => state.bubbleRadius = v, v => v + 'px');
bindRange('#radRange', '#radOut', v => state.canvasRadius = v, v => v + 'px');
bindRange('#bgPatSize', '#bgPatSizeOut', v => state.bgPatSize = v, v => v + 'px');
bindRange('#bgPatOp', '#bgPatOpOut', v => state.bgPatOpacity = v, v => v + '%');
bindRange('#pageNoSize', '#pageNoSizeOut', v => state.pageNoSize = v, v => v + 'px');
bindRange('#docTitleSize', '#docTitleSizeOut', v => state.docTitleSize = v, v => v + '%');
bindRange('#docTitleLs', '#docTitleLsOut', v => state.docTitleLs = v, v => (v / 100).toFixed(2));
$('#expW').addEventListener('input', e => { state.exportW = clamp(Number(e.target.value) || 1080, 200, 4000); renderCanvas(); });
$('#expName').addEventListener('input', e => { state.exportName = e.target.value; });
$('#expMode').addEventListener('change', e => { state.exportMode = e.target.value; });
$('#expPages').addEventListener('change', e => { state.exportPages = e.target.value; });

/* ---------------- 편집 화면 배치 ---------------- */
let uiMode = 'desktop';
function setUiMode(m, silent){
  uiMode = m;
  document.body.classList.toggle('ui-mobile', m === 'mobile');
  $('#btnUiMode').textContent = m === 'mobile' ? '📱 모바일' : '🖥 PC';
  $('#btnUiMode').title = m === 'mobile' ? '모바일 배치 · 눌러서 PC 배치로' : 'PC 배치 · 눌러서 모바일 배치로';
  try { localStorage.setItem('chatFormatter.ui', m); } catch(e){}
  updateCollapseBtn();
  zoomAuto = true;
  setTimeout(fitZoom, 60);
  if (!silent) toast(m === 'mobile' ? '모바일 배치로 바꿨습니다' : 'PC 배치로 바꿨습니다');
}
$('#btnUiMode').addEventListener('click', () => setUiMode(uiMode === 'mobile' ? 'desktop' : 'mobile'));

/* ---------------- zoom controls ---------------- */
$('#zIn').addEventListener('click', () => setZoom(zoom * 1.15));
$('#zOut').addEventListener('click', () => setZoom(zoom / 1.15));
$('#zFit').addEventListener('click', fitZoom);
window.addEventListener('resize', () => { if (zoomAuto) fitZoom(); });

/* 두 손가락 확대 — 미리보기 영역만 커진다 */
const scrollEl = $('#stageScroll');
const touchDist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
let pinch = null;
scrollEl.addEventListener('touchstart', e => {
  if (e.touches.length === 2) pinch = {d: touchDist(e.touches), z: zoom};
}, {passive:true});
scrollEl.addEventListener('touchmove', e => {
  if (!pinch || e.touches.length !== 2) return;
  e.preventDefault();
  const d = touchDist(e.touches);
  if (pinch.d > 0) setZoom(pinch.z * (d / pinch.d));
}, {passive:false});
['touchend','touchcancel'].forEach(ev => scrollEl.addEventListener(ev, () => { pinch = null; }, {passive:true}));
/* 트랙패드 오므리기 / Ctrl+휠 */
scrollEl.addEventListener('wheel', e => {
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  setZoom(zoom * (1 - e.deltaY * 0.012));
}, {passive:false});

/* 넘김 보기 / 스크롤 보기 */
let viewMode = 'scroll', curPage = 0;
function applyView(){
  const wraps = Array.from($('#pageStack').children);
  const n = wraps.length;
  if (viewMode === 'paged' && n){
    curPage = clamp(curPage, 0, n - 1);
    wraps.forEach((w, i) => { w.style.display = i === curPage ? 'flex' : 'none'; });
    $('#pageNav').hidden = n < 2;
    $('#pgLabel').textContent = (curPage + 1) + ' / ' + n;
    $('#pgPrev').disabled = curPage === 0;
    $('#pgNext').disabled = curPage === n - 1;
  } else {
    wraps.forEach(w => { w.style.display = 'flex'; });
    $('#pageNav').hidden = true;
  }
  $('#btnViewMode').textContent = viewMode === 'paged' ? '스크롤 보기' : '넘김 보기';
}
function setViewMode(m, silent){
  viewMode = m;
  try { localStorage.setItem('chatFormatter.view', m); } catch(e){}
  applyView();
  zoomAuto = true; fitZoom();
  if (!silent) toast(m === 'paged' ? '한 장씩 넘겨 봅니다' : '이어서 스크롤합니다');
}
$('#btnViewMode').addEventListener('click', () => setViewMode(viewMode === 'paged' ? 'scroll' : 'paged'));
/* 대사 탭이 열려 있으면 그 장의 첫 블록 위치로 목록을 옮긴다 */
function scrollBlocksToPage(pg){
  const tab = document.querySelector('.tab[data-tab="script"]');
  if (!tab || tab.getAttribute('aria-selected') !== 'true') return;
  const list = $('#blockList');
  const sc = list && list.closest('.pane-scroll');
  if (!sc) return;
  if (pg === 0){ sc.scrollTo({top:0, behavior:'smooth'}); return; }
  const mark = Array.from(list.querySelectorAll('.pagemark')).find(m => Number(m.dataset.pg) === pg);
  if (!mark) return;
  if (foldedPages.has(pg)) setPageFold(pg, false);
  const top = sc.scrollTop + mark.getBoundingClientRect().top - sc.getBoundingClientRect().top - 8;
  sc.scrollTo({top: Math.max(0, top), behavior:'smooth'});
}
/* 스크롤 보기: 미리보기를 내리면 지금 보이는 장을 따라 목록도 움직인다 */
let lastSyncPage = -1, syncTimer = null;
$('#stageScroll').addEventListener('scroll', () => {
  if (viewMode !== 'scroll') return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    const sc = $('#stageScroll');
    const wraps = Array.from($('#pageStack').children);
    if (wraps.length < 2) return;
    /* 화면 위쪽 38% 지점을 지나고 있는 장을 '보는 중'으로 판단 */
    const mark = sc.getBoundingClientRect().top + sc.clientHeight * .38;
    let pg = 0;
    wraps.forEach((w, i) => { if (w.getBoundingClientRect().top <= mark) pg = i; });
    if (pg !== lastSyncPage){ lastSyncPage = pg; scrollBlocksToPage(pg); }
  }, 130);
}, {passive:true});
$('#pgPrev').addEventListener('click', () => { curPage--; applyView(); if (zoomAuto) fitZoom(); scrollBlocksToPage(curPage); });
$('#pgNext').addEventListener('click', () => { curPage++; applyView(); if (zoomAuto) fitZoom(); scrollBlocksToPage(curPage); });

/* ---------------- paste importer ---------------- */
/* ---------- 붙여넣기: 원문 색 읽어오기 ---------- */
/* 클립보드는 순수 텍스트와 서식(HTML)을 함께 들고 있다.
   입력칸에는 글자만 넣고, 색은 따로 뽑아 두었다가 역할을 배정받는다. */
const DROP_TAGS = 'script,style,link,meta,iframe,object,embed,svg,img,video,audio,input,button,table';
const BLOCK_TAGS = /^(P|DIV|LI|TR|H[1-6]|BLOCKQUOTE|SECTION|ARTICLE|PRE)$/;
let pastedRuns = null;

function normColor(v){
  if (!v) return '';
  v = String(v).trim().toLowerCase();
  if (!v || v === 'transparent' || v === 'inherit' || v === 'initial' || v === 'currentcolor') return '';
  let m = /^rgba?\(([^)]+)\)$/.exec(v);
  if (m){
    const n = m[1].split(',').map(x => parseFloat(x));
    if (n.length > 3 && n[3] < .12) return '';
    return '#' + n.slice(0, 3).map(x => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('');
  }
  m = /^#([0-9a-f]{3})$/.exec(v);
  if (m) return '#' + m[1].split('').map(c => c + c).join('');
  m = /^#([0-9a-f]{6})$/.exec(v);
  if (m) return '#' + m[1];
  return '';
}

function extractRuns(html){
  const box = document.createElement('div');
  box.innerHTML = html;
  box.querySelectorAll(DROP_TAGS).forEach(el => el.remove());
  const runs = [];
  const push = (text, st) => { if (text) runs.push({text, ...st}); };
  const walk = (node, st) => {
    if (node.nodeType === 3){ push(node.nodeValue.replace(/\r/g, ''), st); return; }
    if (node.nodeType !== 1) return;
    const tag = node.tagName;
    if (tag === 'BR'){ push('\n', {color:'', bold:false, italic:false}); return; }
    const sty = node.style || {};
    const next = {
      color: normColor(sty.color) || normColor(node.getAttribute && node.getAttribute('color')) || st.color,
      bold: st.bold || tag === 'B' || tag === 'STRONG' || Number(sty.fontWeight) >= 600 || sty.fontWeight === 'bold',
      italic: st.italic || tag === 'I' || tag === 'EM' || sty.fontStyle === 'italic'
    };
    Array.from(node.childNodes).forEach(ch => walk(ch, next));
    if (BLOCK_TAGS.test(tag)) push('\n', {color:'', bold:false, italic:false});
  };
  walk(box, {color:'', bold:false, italic:false});
  /* 붙어 있는 같은 서식끼리 합쳐 조각을 줄인다 */
  const out = [];
  runs.forEach(r => {
    const prev = out[out.length - 1];
    if (prev && prev.color === r.color && prev.bold === r.bold && prev.italic === r.italic)
      prev.text += r.text;
    else out.push({...r});
  });
  return out;
}

const pasteEl = () => $('#pasteText');
const pasteValue = () => {
  const el = pasteEl();
  const t = el.innerText != null ? el.innerText : el.textContent;
  return String(t || '').replace(/\u00a0/g, ' ');
};
function setPasteValue(text){
  const el = pasteEl();
  el.textContent = '';
  if (text) el.appendChild(document.createTextNode(text));
}
/* 원문 색을 그대로 보여 주면 어느 색이 누구인지 눈으로 확인할 수 있다 */
function showRuns(runs){
  const el = pasteEl();
  el.textContent = '';
  runs.forEach(r => {
    if (!r.text) return;
    if (!r.color && !r.bold){ el.appendChild(document.createTextNode(r.text)); return; }
    const sp = document.createElement('span');
    if (r.color) sp.style.color = r.color;
    if (r.bold) sp.style.fontWeight = '700';
    sp.textContent = r.text;
    el.appendChild(sp);
  });
}
function runsToText(runs){
  return runs.map(r => r.text).join('').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+\n/g, '\n').trim();
}

function renderPasteColors(){
  const wrap = $('#pasteColorWrap'), list = $('#pasteColors'), tip = $('#pasteColorTip');
  const onMode = $('#pasteMode').value === 'color';
  const tally = new Map();
  (pastedRuns || []).forEach(r => {
    if (!r.color || !r.text.trim()) return;
    const t = tally.get(r.color) || {n:0, sample:''};
    t.n += r.text.trim().length;
    if (!t.sample) t.sample = r.text.trim().slice(0, 28);
    tally.set(r.color, t);
  });
  const rows = Array.from(tally.entries()).sort((a, b) => b[1].n - a[1].n).slice(0, 12);
  tip.hidden = !(rows.length && !onMode);
  if (!rows.length || !onMode){ wrap.hidden = true; list.innerHTML = ''; return; }
  wrap.hidden = false;
  const keepName = {};
  $$('#pasteColors [data-pcname]').forEach(inp => { keepName[inp.dataset.pcname] = inp.value; });
  const keepKind = {};
  $$('#pasteColors [data-pckind]').forEach(sel => { keepKind[sel.dataset.pckind] = sel.value; });
  const opt = (v, l, cur) => '<option value="' + v + '"' + (cur === v ? ' selected' : '') + '>' + l + '</option>';
  list.innerHTML =
    '<datalist id="pcNames">' + state.speakers.map(sp => '<option value="' + escAttr(sp.name || '') + '">').join('') + '</datalist>' +
    rows.map(([col, t]) => {
      const kind = keepKind[col] || 'line';
      return '<div class="pcrow">' +
        '<span class="pcchip" style="background:' + col + '"></span>' +
        '<span class="pcsam" style="color:' + col + '" title="' + escAttr(t.sample) + '">' + escHtml(t.sample || col) + '</span>' +
        '<input class="pcname" list="pcNames" data-pcname="' + col + '" placeholder="나레이션" value="' +
          escAttr(keepName[col] || '') + '" title="이 색을 쓰는 화자 이름 (비우면 나레이션)">' +
        '<select data-pckind="' + col + '" title="대사인가 행동 지문인가">' +
          opt('line', '대사', kind) + opt('act', '지문', kind) +
        '</select>' +
      '</div>';
    }).join('');
}

$('#pasteMode').addEventListener('change', () => {
  if (pastedRuns){
    if ($('#pasteMode').value === 'color') showRuns(pastedRuns);
    else setPasteValue(runsToText(pastedRuns));
  }
  renderPasteColors();
});
$('#pasteColors').addEventListener('input', e => {
  const nm = e.target.closest('[data-pcname]');
  if (!nm) return;
  /* 같은 이름을 쓰면 그 색들이 한 화자로 묶인다는 표시 */
  const names = $$('#pasteColors [data-pcname]').map(x => x.value.trim()).filter(Boolean);
  const tied = nm.value.trim() && names.filter(v => v === nm.value.trim()).length > 1;
  nm.style.borderColor = tied ? 'var(--accent-line)' : '';
  nm.title = tied ? '같은 이름이라 한 화자로 묶입니다' : '';
});

$('#pasteText').addEventListener('paste', e => {
  const cb = e.clipboardData || window.clipboardData;
  if (!cb) return;
  let html = '';
  try { html = cb.getData('text/html') || ''; } catch(err){}
  const plain = () => {
    let t = '';
    try { t = cb.getData('text/plain') || ''; } catch(err){}
    e.preventDefault();
    document.execCommand('insertText', false, t);
    pastedRuns = null; renderPasteColors();
  };
  if (!html){ plain(); return; }
  let runs;
  try { runs = extractRuns(html); } catch(err){ plain(); return; }
  if (!runs.some(r => r.color && r.text.trim())){ plain(); return; }
  pastedRuns = runs;
  e.preventDefault();
  /* 어느 방식이든 서식은 버리고 글자만 넣되, 색은 눈으로 볼 수 있게 남긴다 */
  if ($('#pasteMode').value === 'color') showRuns(runs);
  else setPasteValue(runsToText(runs));
  renderPasteColors();
});

$('#cropStage').addEventListener('pointerdown', cropStart);
window.addEventListener('pointermove', cropMove);
window.addEventListener('pointerup', cropEnd);
$('#cropRatio').addEventListener('change', () => { cropApplyRatio(); cropLayout(); });
$('#cropReset').addEventListener('click', () => { cropRect = {x:0, y:0, w:1, h:1}; $('#cropRatio').value = '0'; cropLayout(); });
$('#cropCancel').addEventListener('click', () => { $('#cropVeil').classList.remove('on'); cropTarget = null; });
$('#cropVeil').addEventListener('click', e => { if (e.target.id === 'cropVeil'){ $('#cropVeil').classList.remove('on'); cropTarget = null; } });
$('#cropApply').addEventListener('click', async () => {
  const t = cropTarget;
  $('#cropVeil').classList.remove('on');
  if (!t) return;
  const full = cropRect.w >= .999 && cropRect.h >= .999;
  const rect = full ? null : {...cropRect};
  snapshot();
  if (t.kind === 'block'){
    const bk = state.blocks.find(x => x.id === t.id);
    if (!bk) return;
    bk.imgCrop = rect;
    await reprocessBlockImage(bk);
  } else if (t.kind === 'avatar'){
    const sp = state.speakers.find(x => x.id === t.id);
    if (!sp) return;
    if (!sp.avatarOrig) sp.avatarOrig = sp.avatar;
    sp.avatarCrop = rect;
    try { sp.avatar = rect ? await cropDataUrl(sp.avatarOrig, rect) : sp.avatarOrig; }
    catch (err){ toast('이미지를 자를 수 없습니다'); }
    renderCast(); renderCanvas();
  } else {
    const key = state.frame + '.' + t.id;
    if (!state.frameImgOrig) state.frameImgOrig = {};
    if (!state.frameCrop) state.frameCrop = {};
    if (!state.frameImgOrig[key]) state.frameImgOrig[key] = (state.frameImg || {})[key];
    state.frameCrop[key] = rect;
    const base = state.frameImgOrig[key];
    try { state.frameImg[key] = rect ? await cropDataUrl(base, rect) : base; }
    catch (e){ toast('이미지를 자를 수 없습니다'); }
    syncControls(); renderCanvas();
  }
  toast(rect ? '이미지를 잘랐습니다' : '자르기를 해제했습니다');
});
$('#btnPaste').addEventListener('click', () => { $('#pasteVeil').classList.add('on'); $('#pasteText').focus(); });
/* 붙여넣기 창을 열면 지문 규칙·추가 지문 규칙 칸을 통째로 창 안으로 옮겨 오고, 닫으면 제자리로 돌려놓는다.
   같은 칸을 옮기므로 따로 맞출 값이 없고, 닫는 길(취소·바깥 누르기·Esc·적용)이 무엇이든 MutationObserver가 돌려놓는다. */
function ruleSummary(){
  const m = state.marks || {};
  const on = [];
  if (m.parenStar !== false) on.push('*(괄호)*');
  if (m.star) on.push('*별표*');
  if (m.quote) on.push('"따옴표" 밖');
  if (m.paren) on.push('(괄호)');
  activeRules(m).forEach(r => on.push(r.open + ' ' + r.close + (r.kind === 'talk' ? ' 대사' : '')));
  const xr = (state.xrules || []).filter(r => r.on !== false);
  const fx = xr.filter(r => r.kind === 'fx').length, br = xr.filter(r => r.kind === 'br').length;
  const parts = ['지문: ' + (on.length ? on.join(', ') : '없음')];
  if (fx) parts.push('외국어 ' + fx + '개');
  if (br) parts.push('괄호 안 글자 ' + br + '개');
  if (!fx && !br) parts.push('추가 규칙 없음');
  return parts.join(' · ');
}
(() => {
  const veil = $('#pasteVeil');
  const marksBody = document.querySelector('details[data-sec=marks] > .sec-body');
  const xrBody = $('#xrBody');
  const homes = [[marksBody, marksBody.parentNode], [xrBody, xrBody.parentNode]];
  const refreshSum = () => { $('#pasteRuleSum').textContent = ruleSummary(); };
  let inModal = false;
  new MutationObserver(() => {
    const open = veil.classList.contains('on');
    if (open && !inModal){
      renderXRules();
      $('#pasteMarksSlot').appendChild(marksBody);
      $('#pasteXrSlot').appendChild(xrBody);
      refreshSum();
      inModal = true;
    } else if (!open && inModal){
      homes.forEach(([el, home]) => home.appendChild(el));
      inModal = false;
    }
  }).observe(veil, {attributes: true, attributeFilter: ['class']});
  /* 창 안에서 규칙을 바꾸면 요약 줄도 따라 바꾼다 */
  ['change', 'click', 'input'].forEach(ev => $('#pasteRules').addEventListener(ev, () => setTimeout(refreshSum, 0)));
})();

$('#pasteCancel').addEventListener('click', () => {
  $('#pasteVeil').classList.remove('on');
  pastedRuns = null; renderPasteColors();
});
$('#pasteVeil').addEventListener('click', e => { if (e.target.id === 'pasteVeil') $('#pasteVeil').classList.remove('on'); });
$('#pasteApply').addEventListener('click', () => {
  const raw = pasteValue();
  if (!raw.trim()){ toast('붙여 넣은 내용이 없습니다'); return; }
  snapshot();
  const mode = $('#pasteMode').value;
  const made = [];
  const nameOf = s => s.replace(/\*\*/g, '').replace(/^[-–—•\s]+/, '').trim();
  const findOrAdd = name => {
    if (!name) return '';
    let sp = state.speakers.find(s => s.name === name);
    if (!sp){
      const t = THEMES[state.theme] || THEMES.mono;
      const pair = t.pairs[state.speakers.length % t.pairs.length];
      sp = {id:uid(), name, align: state.speakers.length % 2 ? 'right' : 'left', avatar:null, ...pair};
      state.speakers.push(sp);
    }
    return sp.id;
  };
  /* 색 배정이 하나라도 있으면 색을 기준으로 만든다 */
  /* 색마다 '누구의 말인가'(who)와 '대사인가 지문인가'(kind)를 따로 받는다 */
  const roleOf = {};
  $$('#pasteColors [data-pcname]').forEach(nm => {
    const col = nm.dataset.pcname;
    const kindSel = nm.parentNode.querySelector('[data-pckind]');
    const kind = kindSel ? kindSel.value : 'line';
    const name = nm.value.trim();
    if (!name && kind === 'line') return;
    roleOf[col] = {who: name ? 'sp:' + findOrAdd(name) : '', kind};
  });
  if (mode === 'color' && pastedRuns && Object.keys(roleOf).length){
    const lines = [[]];
    pastedRuns.forEach(r => {
      const parts = r.text.split('\n');
      parts.forEach((t, i) => {
        if (i) lines.push([]);
        if (t) lines[lines.length - 1].push({...r, text:t});
      });
    });
    /* 한 줄 안에 «지문 대사 지문» 처럼 화자가 섞여 있으면 화자가 바뀌는 지점에서 블록을 나눈다.
       한 줄 = 한 블록으로 묶으면 나레이션이 엉뚱한 화자에 붙는다. */
    const SEP_ONLY = /^[\s:：\-–—]*$/;
    lines.forEach(runs => {
      if (!runs.length || !runs.map(r => r.text).join('').trim()) return;
      const whoOf = r => ((roleOf[r.color] || {}).who) || '';
      const kindOf = r => ((roleOf[r.color] || {}).kind) || 'line';
      /* 이름과 대사 사이의 «: » 같은 조각은 앞 화자에 붙여 둔다 */
      const marked = runs.map(r => ({r, who: whoOf(r)}));
      marked.forEach((m, i) => {
        if (!SEP_ONLY.test(m.r.text)) return;
        const prev = marked[i - 1];
        if (prev) m.who = prev.who;
      });
      const segs = [];
      marked.forEach(m => {
        const last = segs[segs.length - 1];
        if (last && last.who === m.who) last.runs.push(m.r);
        else segs.push({who: m.who, runs:[m.r]});
      });
      /* 이름에만 색이 칠해진 로그: 맨 앞의 짧은 화자 조각과 뒤따르는 «: 대사» 를 한 덩어리로 본다 */
      if (segs.length > 1 && segs[0].who.startsWith('sp:') && kindOf(segs[0].runs[0]) !== 'act'){
        const label = segs[0].runs.map(r => r.text).join('');
        const nextTxt = segs[1].runs.map(r => r.text).join('');
        if (label.trim().length <= 20 && /^[\s:：\-–—]/.test(nextTxt) && nextTxt.replace(/^[\s:：\-–—]+/, '').trim()){
          segs[0].runs = segs[0].runs.concat(segs[1].runs);
          segs.splice(1, 1);
        }
      }
      segs.forEach(seg => {
        if (!seg.runs.map(r => r.text).join('').trim()) return;
        const speakerId = seg.who.startsWith('sp:') ? seg.who.slice(3) : '';
        /* 첫머리에 짧게 붙은 이름표는 본문에서 뺀다 (줄 전체가 화자색이면 대사로 남긴다) */
        let skip = -1;
        const head = seg.runs[0];
        if (speakerId && kindOf(head) !== 'act'){
          const rest = seg.runs.slice(1).map(r => r.text).join('').replace(/^[\s:：\-–—]+/, '');
          if (head.text.trim().length <= 20 && rest.trim()) skip = 0;
        }
        const parts = [];
        seg.runs.forEach((r, i) => {
          if (i === skip) return;
          let t = r.text;
          if (i === skip + 1 && skip >= 0) t = t.replace(/^[\s:：\-–—]+/, '');
          if (!t) return;
          if (r.bold) t = '**' + t + '**';
          if (kindOf(r) === 'act'){
            const lead = /^\s*/.exec(t)[0], tail = /\s*$/.exec(t)[0];
            if (t.trim()) t = lead + '*(' + t.trim() + ')*' + tail;
          }
          parts.push(t);
        });
        const text = parts.join('').trim();
        if (text) made.push({id:uid(), type:'line', speakerId, text, image:null});
      });
    });
  } else if (mode === 'blank'){
    raw.split(/\n\s*\n/).forEach(chunk => {
      const lines = chunk.split('\n').filter(l => l.trim() !== '');
      if (!lines.length) return;
      const head = nameOf(lines[0].replace(/[:：]\s*$/, ''));
      const body = lines.slice(1).join('\n').trim();
      if (body) made.push({id:uid(), type:'line', speakerId:findOrAdd(head), text:body, image:null});
      else made.push({id:uid(), type:'line', speakerId:'', text:lines.join('\n'), image:null});
    });
  } else {
    raw.split('\n').forEach(line => {
      if (!line.trim()){ return; }
      const m = mode === 'colon' ? /^\s*([^\s:：][^:：]{0,24})[:：]\s*(.*)$/.exec(line) : null;
      if (m){
        made.push({id:uid(), type:'line', speakerId:findOrAdd(nameOf(m[1])), text:m[2].trim(), image:null});
      } else if (made.length && mode === 'colon'){
        made[made.length - 1].text += '\n' + line.trim();
      } else {
        made.push({id:uid(), type:'line', speakerId:'', text:line.trim(), image:null});
      }
    });
  }
  if (!made.length){ toast('나눌 수 있는 줄을 찾지 못했습니다'); return; }
  if ($('#pasteReplace').checked) state.blocks = made;
  else state.blocks = state.blocks.concat(made);
  $('#pasteVeil').classList.remove('on');
  setPasteValue('');
  pastedRuns = null; renderPasteColors();
  renderAll();
  toast('블록 ' + made.length + '개를 만들었습니다');
});

/* ---------------- save / load ---------------- */
/* 예전 버전(.json)도 열 수 있게 형식을 맞춰 준다 */
function migrate(o){
  if (!o || typeof o !== 'object') return null;
  const isOld = o.renderStyle || o.speakers && o.speakers[0] && o.speakers[0].bubbleColor;
  if (!isOld) return o;
  const modeMap = {bubble:'bubble', quote:'book', color:'color'};
  const ratio = (o.aspectRatio && o.aspectRatio !== 'auto')
    ? (o.aspectRatio === 'custom' ? 'custom' : String(o.aspectRatio).replace('/', ':')) : 'auto';
  return {
    version:7,
    mode: modeMap[o.renderStyle] || 'bubble',
    hideNames: !!o.hideSpeakerName,
    actionMode: o.actionSubstitute ? 'split' : 'inline',
    marks:MARK_DEFAULTS(),
    ratio, ratioW:Number(o.customRatioW) || 1000, ratioH:Number(o.customRatioH) || 1500,
    bgKind: o.bgImage ? 'image' : 'solid',
    bgColor: o.bgColor || '#F1F1EF', bgImage: o.bgImage || null,
    font: (o.fontFamily || "'Pretendard',sans-serif").replace(/,\s*/g, ','),
    fontSize: Number(o.fontSize) || 16,
    padX: Number(o.padding) || 30, padY: Number(o.padding) || 30, gap: Number(o.gap) || 15,
    speakers: (o.speakers || []).map(sp => ({
      id: sp.id || uid(), name: sp.name || '이름', align: sp.align === 'right' ? 'right' : 'left', avatar:null,
      bubble: sp.bubbleColor || '#FFFFFF', text: sp.textColor || '#1D1D1B',
      action: sp.actionColor || '#7C7A74', nameColor: sp.textColor || '#1D1D1B'
    })),
    blocks: (o.blocks || []).map(b => b.type === 'divider'
      ? normRule({id:b.id || uid(), type:'rule', style:({solid:'line', dashed:'dash', dots:'dots', floral:'flower', stars:'star'}[b.style] || 'line'), color:b.color || '#9A93A5', width:70})
      : {id:b.id || uid(), type:'line', speakerId:b.speakerId || '', text:b.text || '', image:b.image || null})
  };
}
const STYLE_KEYS = ['mode','theme','textAlign','hideNames','alignedText','wrapQuote','nameSep','quoteOrn','quoteTpl','markColor','markAlpha','marks','actionMode','xrules','xprio',
  'ratio','ratioW','ratioH','usePageNo','useDocTitle','useStamp','pageNo','pageNoPos','pageNoColor','pageNoSize',
  'docTitle','docTitleAlign','docTitleWhere','docTitleColor','docTitleSize','docTitleFont','docTitleDeco','docTitleEyebrow','docTitleLs',
  'stampText','stampPos','stampColor','stampSize','stampFont','bgKind','bgColor','bgColor2','bgImage','bgFit','bgUnder','bgFade','bgFadeSize','tint',
  'bgPattern','bgPatColor','bgPatSize','bgPatOpacity','bgPatSymbol','frame','frameColor','frameTitle','frameHtml','frameOnTop','frameEls','frameChoiceText','frameAsk','frameVar','frameText','frameImg','frameImgOrig','frameCrop',
  'font','fontSize','lineHeight','letterSpace','hScale','fontWeight','wordBreak','inkColor','pgap','indent','indentOn','indentDlg','padX','padY','gap','narrator',
  'bubbleWidth','bubblePad','bubbleShape','bubbleShadow','bubbleRadius','canvasRadius','exportW','exportMode','exportPages'];

function makePreset(){
  const style = {};
  STYLE_KEYS.forEach(k => { style[k] = state[k]; });
  return {
    kind:'chat-formatter-preset', version:8,
    style: JSON.parse(JSON.stringify(style)),
    speakers: JSON.parse(JSON.stringify(state.speakers))
  };
}
/* 프리셋은 화자와 스타일만 담는다. 대사 내용은 저장하지 않는다. */
function applyPreset(pre){
  const st = Object.assign({}, pre.style || {});
  if (st.padding !== undefined && st.padX === undefined){ st.padX = st.padding; st.padY = st.padding; }
  /* 파일에 없는 설정은 지금 값을 남기지 않고 기본값으로 — 스타일을 씌우면 그 스타일 그대로가 되게 */
  const def = DEFAULT_STATE();
  STYLE_KEYS.forEach(k => {
    if (st[k] !== undefined) state[k] = st[k];
    else if (k === 'exportW' || k === 'exportMode' || k === 'exportPages') return;  /* 저장 방식은 그대로 */
    else if (def[k] !== undefined) state[k] = JSON.parse(JSON.stringify(def[k]));
    else delete state[k];
  });
  /* 원본 없이 잘린 테두리 사진만 든 예전 파일: 지금 쓰던 원본과 섞이지 않게 비운다 */
  if (st.frameImg !== undefined && st.frameImgOrig === undefined){ state.frameImgOrig = {}; state.frameCrop = {}; }
  state.marks = normMarks(st.marks);
  state.narrator = migrateNarrSize(Object.assign(DEFAULT_STATE().narrator, st.narrator || {}));
  if (Array.isArray(pre.speakers) && pre.speakers.length){
    const old = state.speakers.slice();
    const next = pre.speakers.map(sp => Object.assign({avatar:null, nameColor:null}, sp, {id: sp.id || uid()}));
    const byName = {};
    next.forEach(sp => { if (!(sp.name in byName)) byName[sp.name] = sp.id; });
    state.blocks.forEach(b => {
      if (b.type !== 'line' || !b.speakerId) return;
      const oldSp = old.find(x => x.id === b.speakerId);
      if (!oldSp){ b.speakerId = ''; return; }
      if (byName[oldSp.name]){ b.speakerId = byName[oldSp.name]; return; }
      const at = old.indexOf(oldSp);
      b.speakerId = next[at] ? next[at].id : '';
    });
    state.speakers = next;
  }
  /* 작업 파일에서 서식만 가져올 때: 그 파일엔 자른 사진(테두리·프로필)의 원본만 있다. 표시용을 다시 만든다 */
  rebuildDerivedImages();
}
/* ---------------- 내 스타일 ----------------
   화자·서식(프리셋)을 이름 붙여 모아 둔다. 프로필·배경 사진이 들어가 크기가 커질 수 있어 IndexedDB에 둔다. */
let myStyles = [], styleEdit = false, styleActive = null;
const STYLE_IDB_KEY = 'myStyles';
function saveStyles(){
  withTimeout(idbPut(STYLE_IDB_KEY, myStyles), 4000).catch(() => {
    try { localStorage.setItem('chatFormatter.myStyles', JSON.stringify(myStyles)); }
    catch (e){ toast('스타일 목록을 저장할 공간이 모자랍니다 · 파일로 저장해 두세요'); }
  });
}
function loadStyles(){
  withTimeout(idbGet(STYLE_IDB_KEY), 4000).then(v => {
    if (Array.isArray(v)) myStyles = v;
    else { try { myStyles = JSON.parse(localStorage.getItem('chatFormatter.myStyles') || '[]') || []; } catch (e){ myStyles = []; } }
  }).catch(() => {
    try { myStyles = JSON.parse(localStorage.getItem('chatFormatter.myStyles') || '[]') || []; } catch (e){ myStyles = []; }
  }).then(renderStyles);
}
function styleSwatch(pre){
  const st = pre.style || {}, sps = pre.speakers || [];
  let bg = st.bgColor || '#F1F1EF';
  if (st.bgKind === 'gradient') bg = 'linear-gradient(135deg,' + (st.bgColor || '#F1F1EF') + ',' + (st.bgColor2 || '#DCE6EF') + ')';
  if (st.bgKind === 'image' && st.bgImage) bg = 'url(' + st.bgImage + ') center/cover';
  if (st.bgKind === 'none') bg = 'repeating-conic-gradient(#E6E6E6 0 25%,#fff 0 50%) 0 0/10px 10px';
  const dots = sps.slice(0, 3).map(sp => '<i style="background:' + (sp.bubble || '#fff') + '"></i>').join('');
  return '<span class="sw" style="background:' + escAttr(bg) + '">' + dots + '</span>';
}
function renderStyles(){
  const g = $('#styleGrid');
  if (!g) return;
  $('#stEdit').setAttribute('aria-pressed', String(styleEdit));
  $('#stEdit').textContent = styleEdit ? '편집 끝내기' : '목록 편집';
  if (!myStyles.length){
    g.innerHTML = '<div class="empty" style="padding:12px 4px">모아 둔 스타일이 없습니다. <b>+ 지금 스타일 추가</b>로 지금 화면의 서식을 담아 두세요.</div>';
    return;
  }
  g.innerHTML = myStyles.map((st, i) =>
    '<div class="theme stylecard" role="button" tabindex="0" data-style="' + st.id + '" aria-pressed="' + (styleActive === st.id ? 'true' : 'false') + '"' +
      ' title="' + escAttr(styleEdit ? '' : '눌러서 이 스타일 씌우기') + '">' +
      styleSwatch(st.preset || {}) +
      '<em>' + escHtml(st.name || '이름 없음') + '</em>' +
      (styleEdit ? '<span class="stools">' +
        '<button class="mini" data-stren="' + st.id + '" title="이름 바꾸기">✎</button>' +
        '<button class="mini" data-stover="' + st.id + '" title="지금 스타일로 덮어쓰기">⟳</button>' +
        '<button class="mini" data-stfile="' + st.id + '" title="이 스타일만 파일로 저장">⤓</button>' +
        '<button class="mini" data-stl="' + st.id + '" title="앞으로"' + (i === 0 ? ' disabled' : '') + '>◀</button>' +
        '<button class="mini" data-str="' + st.id + '" title="뒤로"' + (i === myStyles.length - 1 ? ' disabled' : '') + '>▶</button>' +
        '<button class="mini danger" data-stdel="' + st.id + '" title="목록에서 지우기">✕</button>' +
      '</span>' : '') +
    '</div>').join('');
}
function downloadJson(obj, name){
  downloadBlob(new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'}), name);
}
const safeName = t => String(t || '스타일').replace(/[\\/:*?"<>|]+/g, '_').slice(0, 60);
function addStyle(name, preset){
  const st = {id: uid(), name: name, savedAt: new Date().toISOString(), preset: JSON.parse(JSON.stringify(preset))};
  myStyles.push(st);
  saveStyles();
  return st;
}
function useStyle(st){
  snapshot();
  applyPreset(JSON.parse(JSON.stringify(st.preset)));
  styleActive = st.id;
  zoomAuto = true;
  renderAll();
  renderStyles();
  toast('「' + (st.name || '스타일') + '」을 씌웠습니다 · 대사는 그대로 둡니다');
}
$('#stAdd').addEventListener('click', () => {
  const name = prompt('스타일 이름', '내 스타일 ' + (myStyles.length + 1));
  if (name == null) return;
  const st = addStyle(name.trim() || '내 스타일 ' + (myStyles.length + 1), makePreset());
  styleActive = st.id;
  renderStyles();
  toast('지금 스타일을 목록에 담았습니다');
});
$('#stEdit').addEventListener('click', () => { styleEdit = !styleEdit; renderStyles(); });
$('#stSaveFile').addEventListener('click', () => {
  downloadJson(makePreset(), (state.exportName || '발췌') + '_스타일.json');
  toast('화자와 서식만 담아 저장했습니다');
});
$('#stSaveAll').addEventListener('click', () => {
  if (!myStyles.length){ toast('목록이 비어 있습니다'); return; }
  downloadJson({kind:'chat-formatter-styles', version:1, styles: myStyles.map(st => ({name: st.name, savedAt: st.savedAt, preset: st.preset}))}, '내_스타일_목록.json');
  toast('스타일 ' + myStyles.length + '개를 파일 하나로 저장했습니다');
});
$('#styleGrid').addEventListener('click', e => {
  const btn = e.target.closest('button');
  const card = e.target.closest('[data-style]');
  if (!card) return;
  const st = myStyles.find(x => x.id === card.dataset.style);
  if (!st) return;
  if (!btn){ useStyle(st); return; }
  const i = myStyles.indexOf(st);
  if (btn.dataset.stren){
    const n = prompt('새 이름', st.name || '');
    if (n == null) return;
    st.name = n.trim() || st.name;
  } else if (btn.dataset.stover){
    if (!confirm('「' + st.name + '」을 지금 화면의 스타일로 바꿀까요?')) return;
    st.preset = JSON.parse(JSON.stringify(makePreset())); st.savedAt = new Date().toISOString();
    toast('지금 스타일로 덮어썼습니다');
  } else if (btn.dataset.stfile){
    downloadJson(st.preset, safeName(st.name) + '.json'); return;
  } else if (btn.dataset.stl || btn.dataset.str){
    const j = i + (btn.dataset.stl ? -1 : 1);
    if (j < 0 || j >= myStyles.length) return;
    [myStyles[i], myStyles[j]] = [myStyles[j], myStyles[i]];
  } else if (btn.dataset.stdel){
    if (!confirm('「' + st.name + '」을 목록에서 지울까요?')) return;
    myStyles.splice(i, 1);
    if (styleActive === st.id) styleActive = null;
  }
  saveStyles();
  renderStyles();
});
$('#styleGrid').addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-style]')){ e.preventDefault(); e.target.click(); }
});
$('#fileJson').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const raw = JSON.parse(ev.target.result);
      /* 목록 전체 파일: 목록에만 더한다 */
      if (raw && raw.kind === 'chat-formatter-styles' && Array.isArray(raw.styles)){
        let n = 0;
        raw.styles.forEach(x => { if (x && x.preset){ addStyle(x.name || '불러온 스타일', x.preset); n++; } });
        renderStyles();
        toast('스타일 ' + n + '개를 목록에 넣었습니다 · 눌러서 씌우세요');
        e.target.value = '';
        return;
      }
      let pre;
      if (raw && raw.kind === 'chat-formatter-preset') pre = raw;
      else {
        const full = migrate(raw && raw.kind === 'chat-formatter-work' ? raw.state : raw);
        if (!full || !Array.isArray(full.speakers)) throw new Error('bad');
        const style = {};
        STYLE_KEYS.forEach(k => { if (full[k] !== undefined) style[k] = full[k]; });
        pre = {kind:'chat-formatter-preset', version:8, style, speakers: full.speakers};
      }
      const st = addStyle(f.name.replace(/\.json$/i, '') || '불러온 스타일', pre);
      useStyle(st);
    } catch (err){ toast('이 파일은 읽을 수 없습니다'); }
    e.target.value = '';
  };
  r.readAsText(f);
});
setTimeout(loadStyles, 0);

/* ---------------- 작업 파일 ----------------
   대사·사진·서식 전부를 파일 하나로. 사진은 원본만 담고, 자르기·원형·흐리게를 거친 표시용은
   열 때 원본과 설정으로 다시 만든다(임시저장과 같은 방식). 그래서 화질은 그대로, 파일은 작다. */
function adoptState(loaded){
  state = Object.assign(DEFAULT_STATE(), loaded);
  state.marks = normMarks(loaded.marks);
  if (loaded.padding !== undefined && loaded.padX === undefined){ state.padX = loaded.padding; state.padY = loaded.padding; }
  state.narrator = migrateNarrSize(Object.assign(DEFAULT_STATE().narrator, loaded.narrator || {}));
  if (state.frame === 'polaroid') migratePolaroidCaption();
  rebuildDerivedImages();
}
$('#btnSaveWork').addEventListener('click', () => {
  const photos = imageCandidates().length;
  /* 큰 문자열을 한 번 더 풀었다 묶지 않게 겉만 이어 붙인다 */
  const json = '{"kind":"chat-formatter-work","version":1,"savedAt":' + JSON.stringify(new Date().toISOString()) +
    ',"state":' + savedJson(new Set()) + '}';
  downloadBlob(new Blob([json], {type:'application/json'}), (state.exportName || '발췌') + '_작업.json');
  toast('작업 파일을 저장했습니다' + (photos ? ' · 사진 ' + photos + '장 포함' : ''));
});
$('#fileWork').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    e.target.value = '';
    let raw;
    try { raw = JSON.parse(ev.target.result); } catch (err){ toast('이 파일은 읽을 수 없습니다'); return; }
    /* 설정 파일을 골랐다면 서식만 적용한다 */
    if (raw && raw.kind === 'chat-formatter-preset'){
      snapshot(); applyPreset(raw); zoomAuto = true; renderAll();
      toast('설정 파일입니다 · 서식만 적용했습니다');
      return;
    }
    const loaded = raw && raw.kind === 'chat-formatter-work' ? raw.state : migrate(raw);
    if (!loaded || !Array.isArray(loaded.blocks) || !Array.isArray(loaded.speakers)){ toast('작업 파일이 아닙니다'); return; }
    if (state.blocks.length && !confirm('지금 작업을 이 파일 내용으로 바꿀까요?\n\n되돌리기(Ctrl+Z)로 복구할 수 있습니다.')) return;
    snapshot();
    adoptState(loaded);
    zoomAuto = true;
    renderAll();
    toast('작업 파일을 열었습니다');
  };
  r.readAsText(f);
});

/* ---------------- export ---------------- */
/* html2canvas 는 배경 이미지를 화면 크기(CSS px)로 한 번 그린 뒤 확대한다.
   그래서 내보내기 픽셀을 키워도 배경만 흐릿하다.
   저장 직전에 최종 픽셀 크기로 배경을 직접 그려 넣고, 끝나면 되돌린다. */
let bgTooSmall = 0;
async function swapBgForCapture(pages, scale){
  bgTooSmall = 0;
  if (state.bgKind !== 'image' || !state.bgImage) return null;
  let img;
  try { img = await loadImg(await ensureBgFade()); } catch(e){ return null; }
  const underGrad = state.bgUnder === 'gradient';
  const fit = state.bgFit || 'cover';
  const saved = [];
  for (const pg of pages){
    /* 배경을 그릴 곳은 페이지지만, 모니터처럼 화면 안쪽에만 칠하는 테두리에서는 본문 상자다 */
    /* background:transparent 로 비운 페이지는 backgroundImage 가 'initial' 로 읽힌다 — url 이 있을 때만 페이지로 본다 */
    const host = /url\(/.test(pg.style.backgroundImage || '')
      ? pg : (pg.querySelector('.cbody') || pg);
    const w = Math.round(host.offsetWidth * scale);
    const h = Math.round(host.offsetHeight * scale);
    if (!w || !h) continue;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    /* 이 층이 CSS 배경을 통째로 대신하므로 밑 그라데이션도 여기에 함께 굽는다 */
    if (underGrad) fillCssGradient(g, w, h, BG_GRAD_DEG, state.bgColor, state.bgColor2);
    else if (state.bgUnder === 'edge'){ const L = edgeLayer(w, h); if (L) fillEdgeLayer(g, w, h, L); }
    if (fit === 'tile'){
      const tw = Math.max(1, Math.round(iw * scale)), th = Math.max(1, Math.round(ih * scale));
      for (let y = 0; y < h; y += th) for (let x = 0; x < w; x += tw) g.drawImage(img, x, y, tw, th);
    } else {
      const r = fit === 'contain' ? Math.min(w / iw, h / ih) : Math.max(w / iw, h / ih);
      if (r > 1.05) bgTooSmall = iw + '×' + ih;
      const dw = iw * r, dh = ih * r;
      g.drawImage(img, Math.round((w - dw) / 2), Math.round((h - dh) / 2), Math.round(dw), Math.round(dh));
    }
    /* CSS 배경은 html2canvas 가 화면 크기 캔버스에 한 번 굽고 늘리므로 흐려진다.
       실제 <img> 요소로 깔면 원본 해상도 그대로 그려진다. */
    const layer = document.createElement('img');
    layer.className = 'capbg';
    layer.src = cv.toDataURL('image/png');
    /* 절대 위치 층은 위치 지정이 없는 형제(앨범아트 줄·재생바·채팅 상단바 같은 테두리 장식)보다 위에 그려져 그것들을 덮는다.
       z-index:-1 로 배경 자리(맨 아래)에 내리고, 그 아래로 빠지지 않게 host 를 쌓임 맥락으로 묶는다. */
    layer.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:-1';
    saved.push({host, image: host.style.backgroundImage, zIndex: host.style.zIndex, first: host.firstChild, layer});
    host.style.backgroundImage = 'none';
    host.style.zIndex = '0';
    host.insertBefore(layer, host.firstChild);
  }
  return saved;
}
function restoreBg(saved){
  if (!saved) return;
  saved.forEach(o => {
    if (o.layer && o.layer.parentNode) o.layer.parentNode.removeChild(o.layer);
    o.host.style.backgroundImage = o.image;
    if (o.zIndex !== undefined) o.host.style.zIndex = o.zIndex;
    if (o.pos !== undefined) o.host.style.position = o.pos;
  });
}
/* 테두리 속 사진(메신저 프로필·앨범아트·달력 사진)도 CSS 배경이라 같은 길을 탄다.
   저장 순간 최종 픽셀 크기로 잘라 둥근 모서리까지 구운 <img>로 바꿔 끼운다.
   html2canvas의 CSS 배경 그리기(cover·둥근 모서리)에 기대지 않으므로 브라우저마다 결과가 같다. */
async function swapFrameImgsForCapture(pages, scale){
  const saved = [];
  for (const pg of pages){
    for (const el of pg.querySelectorAll('.favatar, .fart, .fcal-photo')){
      const m = /url\((["']?)(.*)\1\)/.exec(el.style.backgroundImage || '');
      if (!m) continue;
      const w = Math.round(el.offsetWidth * scale), h = Math.round(el.offsetHeight * scale);
      if (!w || !h) continue;
      let img;
      try { img = await loadImg(m[2]); } catch(e){ continue; }
      const iw = img.naturalWidth, ih = img.naturalHeight;
      if (!iw || !ih) continue;
      const cv = document.createElement('canvas');
      cv.width = w; cv.height = h;
      const g = cv.getContext('2d');
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      const rs = getComputedStyle(el).borderTopLeftRadius || '0';
      let rad = parseFloat(rs) || 0;
      rad = /%$/.test(rs) ? rad / 100 * Math.min(w, h) : rad * scale;
      rad = Math.min(rad, w / 2, h / 2);
      if (rad > 0){
        g.beginPath();
        g.moveTo(rad, 0);
        g.arcTo(w, 0, w, h, rad); g.arcTo(w, h, 0, h, rad);
        g.arcTo(0, h, 0, 0, rad); g.arcTo(0, 0, w, 0, rad);
        g.closePath(); g.clip();
      }
      const r = Math.max(w / iw, h / ih), dw = iw * r, dh = ih * r;
      g.drawImage(img, Math.round((w - dw) / 2), Math.round((h - dh) / 2), Math.round(dw), Math.round(dh));
      const layer = document.createElement('img');
      layer.className = 'capbg';
      layer.src = cv.toDataURL('image/png');
      layer.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none';
      try { await layer.decode(); } catch(e){}
      const pos = el.style.position;
      saved.push({host: el, image: el.style.backgroundImage, layer, pos});
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.style.backgroundImage = 'none';
      el.insertBefore(layer, el.firstChild);
    }
  }
  return saved;
}
/* 글자마다 칠한 형광 조각은 html2canvas 가 조각 경계를 반투명하게 깎아 그려 세로 틈이 생긴다.
   저장 순간에만 같은 줄·같은 색·같은 높이로 이어진 조각을 한 장의 사각형으로 합쳐 글자 뒤에 깔고,
   글자 조각의 배경은 비운다. 사각형은 문단 안쪽 맨 아래 층(z-index:-1)이라 말풍선 배경 위, 글자 아래에 놓인다. */
function mergeMarksForCapture(pages){
  const saved = {spans: [], hosts: [], layers: []};
  const hostOf = new Map();
  for (const pg of pages){
    const spans = Array.from(pg.querySelectorAll('span.mkc'));
    let run = null;
    const flush = () => {
      if (!run) return;
      let h = hostOf.get(run.host);
      if (!h){
        const cs = getComputedStyle(run.host);
        h = {el: run.host, pos: run.host.style.position, z: run.host.style.zIndex};
        if (cs.position === 'static') run.host.style.position = 'relative';
        if (cs.zIndex === 'auto') run.host.style.zIndex = '0';
        /* 장평은 문단을 가로로만 늘이므로 가로·세로 배율을 따로 잰다 */
        const r = run.host.getBoundingClientRect();
        h.kx = r.width / (run.host.offsetWidth || r.width || 1) || 1;
        h.ky = r.height / (run.host.offsetHeight || r.height || 1) || 1;
        h.x = r.left + run.host.clientLeft * h.kx;
        h.y = r.top + run.host.clientTop * h.ky;
        hostOf.set(run.host, h);
        saved.hosts.push(h);
      }
      const d = document.createElement('div');
      d.className = 'capmk';
      d.style.cssText = 'position:absolute;pointer-events:none;z-index:-1;margin:0;padding:0;border:0;background:' + run.bg +
        ';left:' + ((run.l - h.x) / h.kx) + 'px;top:' + ((run.t - h.y) / h.ky) + 'px;width:' + ((run.r - run.l) / h.kx) +
        'px;height:' + ((run.b - run.t) / h.ky) + 'px';
      run.host.appendChild(d);
      saved.layers.push(d);
      run = null;
    };
    for (const sp of spans){
      const r = sp.getBoundingClientRect();
      const bg = sp.style.background;
      saved.spans.push({el: sp, bg});
      sp.style.background = 'none';
      if (!r.width || !r.height){ continue; }
      const host = sp.closest('p, div, li, blockquote') || sp.parentNode;
      const same = run && run.host === host && run.bg === bg &&
        Math.abs(run.t - r.top) < .5 && Math.abs(run.b - r.bottom) < .5 &&
        r.left >= run.r - 1.5 && r.left <= run.r + 1.5;
      if (same){ run.r = Math.max(run.r, r.right); continue; }
      flush();
      run = {host, bg, l: r.left, r: r.right, t: r.top, b: r.bottom};
    }
    flush();
  }
  return saved;
}
function restoreMarks(saved){
  if (!saved) return;
  saved.layers.forEach(d => { if (d.parentNode) d.parentNode.removeChild(d); });
  saved.spans.forEach(o => { o.el.style.background = o.bg; });
  saved.hosts.forEach(h => { h.el.style.position = h.pos; h.el.style.zIndex = h.z; });
}
/* html2canvas 는 <details> 의 접힘을 모른다. 접힌 칸의 속 내용까지 그리고, 요약 줄의 ▶ 표시는 '1.' 로 그린다.
   저장 순간에만 접힌 속 내용을 숨기고, ▶ 표시는 같은 색 글자로 바꿔 끼운다. 화면에서 접고 편 그대로 저장된다. */
function foldDetailsForCapture(pages){
  const saved = {styles: [], texts: [], added: []};
  const hide = el => { saved.styles.push([el, el.style.cssText]); el.style.display = 'none'; };
  pages.forEach(pg => pg.querySelectorAll('details').forEach(d => {
    const sum = Array.from(d.children).find(c => c.tagName === 'SUMMARY');
    if (!d.open){
      Array.from(d.childNodes).forEach(n => {
        if (n === sum) return;
        if (n.nodeType === 1) hide(n);
        else if (n.nodeType === 3 && n.nodeValue.trim()){ saved.texts.push([n, n.nodeValue]); n.nodeValue = ''; }
      });
    }
    if (sum && getComputedStyle(sum).display === 'list-item'){
      saved.styles.push([sum, sum.style.cssText]);
      sum.style.display = 'block';
      sum.style.listStyle = 'none';
      const m = document.createElement('span');
      m.textContent = d.open ? '\u25BE\u00A0' : '\u25B8\u00A0';
      sum.insertBefore(m, sum.firstChild);
      saved.added.push(m);
    }
  }));
  return saved;
}
function unfoldDetails(saved){
  if (!saved) return;
  saved.added.forEach(m => m.remove());
  saved.texts.forEach(([n, v]) => { n.nodeValue = v; });
  saved.styles.forEach(([el, css]) => { el.style.cssText = css; });
}
async function capturePages(){
  await settleFades();
  await imagesSettled();
  capturing = true;
  document.body.classList.add('cap');
  const stack = $('#pageStack');
  const sc = $('#stageScroll');
  const prevT = stack.style.transform;
  const keepTop = sc.scrollTop, keepLeft = sc.scrollLeft;
  const hidden = Array.from(stack.children).map(w => w.style.display);
  Array.from(stack.children).forEach(w => { w.style.display = 'flex'; });
  stack.style.transform = 'none';
  sc.scrollTop = 0; sc.scrollLeft = 0;
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch(e){} }
  const scale = (Number(state.exportW) || 1080) / CANVAS_W;
  const pages = Array.from(stack.querySelectorAll('.page'));
  const shots = [];
  let bgSaved = null, frSaved = null, mkSaved = null, dtSaved = null;
  try {
    bgSaved = await swapBgForCapture(pages, scale);
    frSaved = await swapFrameImgsForCapture(pages, scale);
    dtSaved = foldDetailsForCapture(pages);
    mkSaved = mergeMarksForCapture(pages);
    const want = capturePages.only;
    for (let i = 0; i < pages.length; i++){
      if (want != null && i !== want) continue;
      shots.push(await html2canvas(pages[i], {scale, useCORS:true, backgroundColor:null, logging:false}));
    }
  } finally {
    restoreMarks(mkSaved);
    unfoldDetails(dtSaved);
    restoreBg(frSaved);
    restoreBg(bgSaved);
    capturePages.only = null;
    stack.style.transform = prevT;
    Array.from(stack.children).forEach((w, i) => { w.style.display = hidden[i] || 'flex'; });
    sc.scrollTop = keepTop; sc.scrollLeft = keepLeft;
    capturing = false;
    document.body.classList.remove('cap');
    applyZoom();
  }
  return shots;
}
/* 여러 장을 한 번에 내려받을 때는 브라우저가 뒤엣것을 막는다.
   dataURL 대신 Blob을 쓰고, 링크를 문서에 붙였다 떼며, 사이를 충분히 띄운다. */
/* 여러 장을 한 파일로 묶기 — 합치지 않고 페이지만 나눠 담는다 (PDF)
   이미지는 무손실(Flate)로 넣는다. 라이브러리 없이 브라우저 기본 압축을 쓴다. */
async function deflateBytes(bytes){
  if (typeof CompressionStream === 'undefined') return null;
  const cs = new CompressionStream('deflate');
  const w = cs.writable.getWriter();
  w.write(bytes); w.close();
  return new Uint8Array(await new Response(cs.readable).arrayBuffer());
}
async function buildPdf(canvases){
  const enc = new TextEncoder();
  const parts = [];
  let pos = 0;
  const put = d => { const b = (typeof d === 'string') ? enc.encode(d) : d; parts.push(b); pos += b.length; };
  const offs = {};
  const startObj = n => { offs[n] = pos; put(n + ' 0 obj\n'); };

  const pages = [];
  for (const cv of canvases){
    const w = cv.width, h = cv.height;
    const d = cv.getContext('2d').getImageData(0, 0, w, h).data;
    const rgb = new Uint8Array(w * h * 3);
    for (let i = 0, j = 0; i < d.length; i += 4){
      const a = d[i + 3] / 255, inv = 255 * (1 - a);
      rgb[j++] = Math.round(d[i] * a + inv);
      rgb[j++] = Math.round(d[i + 1] * a + inv);
      rgb[j++] = Math.round(d[i + 2] * a + inv);
    }
    const z = await deflateBytes(rgb);
    if (!z) return null;
    pages.push({w, h, z});
  }

  put('%PDF-1.4\n');
  startObj(1); put('<</Type/Catalog/Pages 2 0 R>>\n'); put('endobj\n');
  const kids = pages.map((_, n) => (5 + n * 3) + ' 0 R').join(' ');
  startObj(2); put('<</Type/Pages/Kids[' + kids + ']/Count ' + pages.length + '>>\n'); put('endobj\n');
  for (let n = 0; n < pages.length; n++){
    const p2 = pages[n];
    const imgN = 3 + n * 3, conN = 4 + n * 3, pgN = 5 + n * 3;
    startObj(imgN);
    put('<</Type/XObject/Subtype/Image/Width ' + p2.w + '/Height ' + p2.h +
        '/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/FlateDecode/Length ' + p2.z.length + '>>\nstream\n');
    put(p2.z);
    put('\nendstream\n'); put('endobj\n');
    const content = 'q ' + p2.w + ' 0 0 ' + p2.h + ' 0 0 cm /Im0 Do Q\n';
    startObj(conN);
    put('<</Length ' + content.length + '>>\nstream\n' + content + 'endstream\n'); put('endobj\n');
    startObj(pgN);
    put('<</Type/Page/Parent 2 0 R/MediaBox[0 0 ' + p2.w + ' ' + p2.h + ']' +
        '/Resources<</XObject<</Im0 ' + imgN + ' 0 R>>>>/Contents ' + conN + ' 0 R>>\n');
    put('endobj\n');
  }
  const xrefPos = pos;
  const count = 3 + pages.length * 3;
  let x = 'xref\n0 ' + count + '\n0000000000 65535 f \n';
  for (let i = 1; i < count; i++) x += String(offs[i]).padStart(10, '0') + ' 00000 n \n';
  put(x);
  put('trailer\n<</Size ' + count + '/Root 1 0 R>>\nstartxref\n' + xrefPos + '\n%%EOF\n');
  return new Blob(parts, {type:'application/pdf'});
}
/* ---- 여러 장을 ZIP 한 파일로 ----
   삼성 인터넷 등 일부 브라우저는 사용자가 누른 그 순간(transient activation)을 벗어난
   두 번째 이후의 내려받기를 조용히 버린다. 물어보지도, 오류를 내지도 않는다.
   그래서 첫 장만 남는다. 파일 하나로 묶어 한 번만 내려받으면 그 규칙에 걸리지 않는다.
   PNG는 이미 압축돼 있으므로 다시 누르지 않고 그대로 담는다(stored). */
const CRC32_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++){
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c >>> 0;
  }
  return t;
})();
function crc32(bytes){
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC32_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function zipStored(files){
  const enc = new TextEncoder();
  const d = new Date();
  const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const parts = [], central = [];
  let off = 0;
  files.forEach(f => {
    const name = enc.encode(f.name);
    const crc = crc32(f.data), n = f.data.length;
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
    lh.setUint16(8, 0, true); lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, n, true); lh.setUint32(22, n, true);
    lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), name, f.data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true);
    ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true);
    ch.setUint32(16, crc, true); ch.setUint32(20, n, true); ch.setUint32(24, n, true);
    ch.setUint16(28, name.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true);
    ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, 0, true);
    ch.setUint32(42, off, true);
    central.push(new Uint8Array(ch.buffer), name);
    off += 30 + name.length + n;
  });
  const cdSize = central.reduce((t, b) => t + b.length, 0);
  const eo = new DataView(new ArrayBuffer(22));
  eo.setUint32(0, 0x06054b50, true); eo.setUint16(4, 0, true); eo.setUint16(6, 0, true);
  eo.setUint16(8, files.length, true); eo.setUint16(10, files.length, true);
  eo.setUint32(12, cdSize, true); eo.setUint32(16, off, true); eo.setUint16(20, 0, true);
  return new Blob(parts.concat(central, [new Uint8Array(eo.buffer)]), {type:'application/zip'});
}
function canvasBytes(canvas){
  return new Promise(res => canvas.toBlob(async blob => {
    res(blob ? new Uint8Array(await blob.arrayBuffer()) : null);
  }, 'image/png'));
}
function downloadBlob(blob, name){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1500);
}
function downloadCanvas(canvas, name){
  return new Promise(res => {
    canvas.toBlob(blob => {
      if (!blob){ res(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { a.remove(); URL.revokeObjectURL(url); res(true); }, 1200);
    }, 'image/png');
  });
}
function currentVisiblePage(){
  if (viewMode === 'paged') return curPage;
  const sc = $('#stageScroll');
  const wraps = Array.from($('#pageStack').children);
  if (wraps.length < 2) return 0;
  const mark = sc.getBoundingClientRect().top + sc.clientHeight * .38;
  let pg = 0;
  wraps.forEach((w, i) => { if (w.getBoundingClientRect().top <= mark) pg = i; });
  return pg;
}
$('#btnExport').addEventListener('click', async () => {
  const btn = $('#btnExport');
  btn.disabled = true; btn.textContent = '저장 중…';
  try {
    const onlyCurrent = (state.exportPages || 'all') === 'current';
    const cur = onlyCurrent ? currentVisiblePage() : null;
    if (onlyCurrent) capturePages.only = cur;
    const shots = await capturePages();
    const base = state.exportName || '발췌';
    if (bgTooSmall) setTimeout(() => toast('배경 원본이 ' + bgTooSmall + 'px라 더 크게는 선명해지지 않습니다'), 2200);
    if (onlyCurrent){
      const name = base + '_' + String(cur + 1).padStart(2, '0') + '.png';
      if (await downloadCanvas(shots[0], name)) toast((cur + 1) + '쪽을 저장했습니다');
      else toast('저장이 막혔습니다 · 브라우저 설정을 확인해 주세요');
      btn.disabled = false; btn.textContent = '이미지 저장';
      return;
    }
    const mode = state.exportMode || 'zip';
    if (shots.length > 1 && mode === 'zip'){
      btn.textContent = '한 파일로 묶는 중…';
      const files = [];
      for (let i = 0; i < shots.length; i++){
        const bytes = await canvasBytes(shots[i]);
        if (bytes) files.push({name: base + '_' + String(i + 1).padStart(2, '0') + '.png', data: bytes});
      }
      if (files.length){
        downloadBlob(zipStored(files), base + '.zip');
        toast(files.length + '장을 ZIP 한 파일로 저장했습니다');
      } else toast('저장에 실패했습니다');
      btn.disabled = false; btn.textContent = '이미지 저장';
      return;
    }
    if (shots.length > 1 && mode === 'pdf'){
      btn.textContent = '한 파일로 묶는 중…';
      const pdf = await buildPdf(shots);
      if (pdf){
        downloadBlob(pdf, base + '.pdf');
        toast(shots.length + '쪽짜리 파일 하나로 저장했습니다');
      } else {
        toast('이 브라우저는 한 파일 묶기를 지원하지 않습니다 · PNG로 저장하세요');
      }
      btn.disabled = false; btn.textContent = '이미지 저장';
      return;
    }
    let ok = 0;
    for (let i = 0; i < shots.length; i++){
      if (shots.length > 1) btn.textContent = (i + 1) + ' / ' + shots.length + ' 저장 중…';
      const name = base + (shots.length > 1 ? '_' + String(i + 1).padStart(2, '0') : '') + '.png';
      if (await downloadCanvas(shots[i], name)) ok++;
      if (i < shots.length - 1) await new Promise(r => setTimeout(r, 350));
    }
    if (ok < shots.length)
      toast(ok + ' / ' + shots.length + '장만 저장됐습니다 · 여러 파일 내려받기를 허용해 주세요');
    else if (shots.length > 1)
      /* 링크를 눌렀다고 파일이 받아졌다는 뜻은 아니다. 조용히 버리는 브라우저가 있다 */
      toast(shots.length + '장을 보냈습니다 · 일부만 받아졌다면 ZIP으로 저장하세요');
    else toast('이미지를 저장했습니다');
  } catch (err){ console.error(err); toast('저장에 실패했습니다'); }
  btn.disabled = false; btn.textContent = '이미지 저장';
});
$('#btnCopy').addEventListener('click', async () => {
  try {
    const shots = await capturePages();
    const blob = await new Promise(res => shots[0].toBlob(res, 'image/png'));
    await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
    toast(shots.length > 1 ? '첫 장을 클립보드에 복사했습니다' : '클립보드에 복사했습니다');
  } catch (err){ toast('이 브라우저에서는 복사가 안 됩니다. 이미지 저장을 쓰세요'); }
});

$('#btnReset').addEventListener('click', () => {
  if (!confirm('화자와 대사를 모두 지우고 빈 상태로 시작할까요?\n\n설정도 기본값으로 돌아갑니다. 되돌리기(Ctrl+Z)로 복구할 수 있습니다.')) return;
  snapshot();
  state = DEFAULT_STATE();
  state.speakers = [];
  state.blocks = [];
  zoomAuto = true;
  renderAll();
  toast('빈 상태로 시작합니다');
});

/* ---------------- 슬라이더에 숫자 입력칸 붙이기 ---------------- */
function upgradeRangeRows(scope){
  (scope || document).querySelectorAll('.rangerow').forEach(row => {
    const r = row.querySelector('input[type=range]');
    const o = row.querySelector('output');
    if (!r || !o) return;
    const n = document.createElement('input');
    n.type = 'text';
    n.className = 'numin';
    n.inputMode = 'decimal';
    n.spellcheck = false;
    if (o.id) n.id = o.id;
    n.value = o.value || r.value;
    o.replaceWith(n);
  });
}
document.addEventListener('change', e => {
  const el = e.target;
  if (!el.classList || !el.classList.contains('numin')) return;
  const row = el.closest('.rangerow');
  const r = row && row.querySelector('input[type=range]');
  if (!r) return;
  const scale = Number(row.dataset.scale) || 1;
  const m = String(el.value).replace(/[,\s]/g, '').match(/-?\d+(\.\d+)?/);
  if (!m){ el.value = r.value; r.dispatchEvent(new Event('input', {bubbles:true})); return; }
  const v = Math.round(clamp(parseFloat(m[0]) * scale, Number(r.min), Number(r.max)));
  r.value = v;
  r.dispatchEvent(new Event('input', {bubbles:true}));
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.classList && e.target.classList.contains('numin')){
    e.preventDefault(); e.target.blur();
  }
});

/* ---------------- 편집기 크기 조절 · 접기 ---------------- */
let panelW = 396, stageH = 0, collapsed = false;
function setPanelW(px){
  panelW = Math.round(clamp(px, 190, Math.max(280, Math.min(780, window.innerWidth - 300))));
  document.documentElement.style.setProperty('--panel-w', panelW + 'px');
  try { localStorage.setItem('chatFormatter.panelW', panelW); } catch(e){}
}
function setStageH(px){
  stageH = Math.round(clamp(px, 120, Math.max(160, window.innerHeight - 200)));
  document.documentElement.style.setProperty('--stage-h', stageH + 'px');
  try { localStorage.setItem('chatFormatter.stageH', stageH); } catch(e){}
}
function updateCollapseBtn(){
  const b = $('#btnCollapse');
  if (uiMode === 'mobile'){
    b.textContent = collapsed ? '편집기 열기' : '미리보기 크게';
    b.setAttribute('data-tip', collapsed ? '편집 패널을 다시 엽니다.' : '편집 패널을 접고 미리보기만 화면 가득 봅니다.');
  } else {
    b.textContent = collapsed ? '편집기 펼치기' : '편집기 접기';
    b.setAttribute('data-tip', collapsed ? '왼쪽 편집 패널을 다시 엽니다.' : '왼쪽 편집 패널을 접습니다. 가운데 손잡이를 드래그해 크기를 바꿀 수도 있습니다.');
  }
}
function setCollapsed(v){
  collapsed = !!v;
  document.body.classList.toggle('panel-hidden', collapsed);
  updateCollapseBtn();
  zoomAuto = true;
  setTimeout(fitZoom, 40);
}
$('#btnCollapse').addEventListener('click', () => setCollapsed(!collapsed));

const splitEl = $('#splitter');
let split = null;
splitEl.addEventListener('pointerdown', e => {
  e.preventDefault();
  splitEl.setPointerCapture(e.pointerId);
  split = {x:e.clientX, y:e.clientY,
    w: collapsed ? 0 : panelW,
    h: stageH || $('.stage').getBoundingClientRect().height};
  splitEl.classList.add('on');
  document.body.classList.add('splitting');
});
splitEl.addEventListener('pointermove', e => {
  if (!split) return;
  if (uiMode === 'mobile'){
    setStageH(split.h + (e.clientY - split.y));
  } else {
    /* 왼쪽 끝까지 밀면 그대로 접힌다 */
    const w = split.w + (e.clientX - split.x);
    if (w < 185){ if (!collapsed) setCollapsed(true); }
    else { if (collapsed) setCollapsed(false); setPanelW(w); }
  }
  if (zoomAuto) fitZoom();
});
['pointerup','pointercancel'].forEach(ev => splitEl.addEventListener(ev, () => {
  if (!split) return;
  split = null;
  splitEl.classList.remove('on');
  document.body.classList.remove('splitting');
  if (zoomAuto) fitZoom();
}));
splitEl.addEventListener('dblclick', () => setCollapsed(!collapsed));

/* ---------------- 미리보기 뒷판 색 ---------------- */
let matColor = '#43647F';
function shade(hex, amt){
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!m) return hex;
  const ch = i => {
    let v = parseInt(m[i], 16);
    v = amt >= 0 ? v + (255 - v) * amt : v * (1 + amt);
    return Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
  };
  return '#' + ch(1) + ch(2) + ch(3);
}
function setMat(hex){
  matColor = hex || '#43647F';
  const dark = luma(matColor) < .55;
  const r = document.documentElement.style;
  r.setProperty('--mat', matColor);
  r.setProperty('--mat2', shade(matColor, dark ? .13 : -.07));
  r.setProperty('--mat-ink', dark ? '#EDF5FB' : '#22303D');
  r.setProperty('--mat-ink2', dark ? 'rgba(237,245,251,.72)' : 'rgba(34,48,61,.62)');
  r.setProperty('--mat-line', dark ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.14)');
  r.setProperty('--mat-hover', dark ? 'rgba(255,255,255,.13)' : 'rgba(0,0,0,.07)');
  r.setProperty('--mat-thumb', dark ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.22)');
  const inp = $('#matColor');
  if (inp && inp.value !== matColor) inp.value = matColor;
  try { localStorage.setItem('chatFormatter.mat', matColor); } catch(e){}
}
$('#matColor').addEventListener('input', e => setMat(e.target.value));

/* ---------------- 빠른 도움말 ---------------- */
const tipEl = document.createElement('div');
tipEl.className = 'tip';
document.body.appendChild(tipEl);
let tipTimer = null;
function showTip(target){
  const text = target.getAttribute('data-tip');
  if (!text) return;
  tipEl.textContent = text;
  tipEl.classList.add('on');
  const r = target.getBoundingClientRect();
  const tr = tipEl.getBoundingClientRect();
  let left = r.left + r.width / 2 - tr.width / 2;
  left = clamp(left, 10, window.innerWidth - tr.width - 10);
  let top = r.bottom + 8;
  if (top + tr.height > window.innerHeight - 10) top = Math.max(10, r.top - tr.height - 8);
  tipEl.style.left = Math.round(left) + 'px';
  tipEl.style.top = Math.round(top) + 'px';
}
function hideTip(){ clearTimeout(tipTimer); tipEl.classList.remove('on'); }
document.addEventListener('pointerover', e => {
  const t = e.target.closest && e.target.closest('[data-tip]');
  if (!t){ return; }
  clearTimeout(tipTimer);
  tipTimer = setTimeout(() => showTip(t), 90);
});
document.addEventListener('pointerout', e => {
  if (e.pointerType === 'touch') return;
  if (e.target.closest && e.target.closest('[data-tip]')) hideTip();
});
document.addEventListener('pointerdown', e => {
  const t = e.pointerType === 'touch' && e.target.closest && e.target.closest('[data-tip]');
  if (!t){ hideTip(); return; }
  clearTimeout(tipTimer);
  showTip(t);
  tipTimer = setTimeout(hideTip, 3200);
});
window.addEventListener('scroll', hideTip, true);

/* ---------------- keyboard ---------------- */
$('#btnUndo').addEventListener('click', undo);
$('#btnRedo').addEventListener('click', redo);
document.addEventListener('keydown', e => {
  const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  const tag = document.activeElement && document.activeElement.tagName;
  const typing = tag === 'TEXTAREA' || tag === 'INPUT';
  if (mod && k === 'z' && !e.shiftKey){
    if (typing) return;
    e.preventDefault(); undo();
  }
  /* 다시 실행: Ctrl+Shift+Z 또는 Ctrl+Y */
  if (mod && ((k === 'z' && e.shiftKey) || k === 'y')){
    if (typing) return;
    e.preventDefault(); redo();
  }
  if (e.key === 'Escape'){
    $('#pasteVeil').classList.remove('on'); $('#tuneVeil').classList.remove('on');
    if ($('#htmlVeil').classList.contains('on')) closeHtmlEdit(false);
  }
});

/* ---------------- autosave (복구용) ---------------- */
const KEY = 'chatFormatter.v7';
let saveTimer = null;
/* 임시저장에는 원본 사진만 담는다. 자르기·원형·흐리게를 거친 표시용 사진은 불러올 때 다시 만든다.
   예전에는 한 장이 원본 + 잘린 것 + 표시용으로 2~3벌 들어갔고(자른 것은 PNG라 원본의 3배),
   사진 한두 장에 브라우저 한도(약 5MB)를 넘겨 '사진 전부 빼고 글만' 저장되곤 했다. */
function savedJson(drop){
  const fi = state.frameImg, fo = state.frameImgOrig || {};
  return JSON.stringify(state, function(k, v){
    if (k === 'imgCropped') return undefined;
    if (k === 'image' && this.imgOrig) return undefined;
    if (k === 'avatar' && this.avatarOrig) return undefined;
    if (this === fi && fo[k]) return undefined;
    /* 그래도 넘치면 고른 사진을 뺀다 */
    if (drop.size){
      if (k === 'bgImage' && drop.has('bg')) return null;
      if ((k === 'imgOrig' || k === 'image') && this.id && drop.has('b:' + this.id)) return null;
      if ((k === 'avatarOrig' || k === 'avatar') && this.id && drop.has('s:' + this.id)) return null;
      if ((this === fi || this === fo) && drop.has('f:' + k)) return undefined;
    }
    return v;
  });
}
/* 뺄 수 있는 사진들 — 큰 것부터 뺀다 */
function imageCandidates(){
  const L = [];
  if (state.bgImage) L.push({id:'bg', n: state.bgImage.length});
  state.blocks.forEach(b => { const v = b.imgOrig || b.image; if (v) L.push({id:'b:' + b.id, n: v.length}); });
  state.speakers.forEach(sp => { const v = sp.avatarOrig || sp.avatar; if (v) L.push({id:'s:' + sp.id, n: v.length}); });
  const fo = state.frameImgOrig || {}, fi = state.frameImg || {};
  new Set(Object.keys(fo).concat(Object.keys(fi))).forEach(k => { const v = fo[k] || fi[k]; if (v) L.push({id:'f:' + k, n: v.length}); });
  return L.sort((a, b) => b.n - a.n);
}
/* 임시저장은 IndexedDB에 둔다. localStorage는 한도가 약 5MB라 고화질 사진 두어 장에 넘쳤다.
   IndexedDB는 기기 여유 공간만큼 쓸 수 있다. 못 쓰는 환경(일부 사생활 보호 창 등)에서만 localStorage로 물러난다. */
const IDB_NAME = 'chatFormatter', IDB_STORE = 'save';
let idbOpen = null, idbMoved = false;
function idb(){
  if (!idbOpen){
    idbOpen = new Promise((res, rej) => {
      if (!window.indexedDB) return rej(new Error('IndexedDB 없음'));
      const rq = indexedDB.open(IDB_NAME, 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore(IDB_STORE);
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
    });
    idbOpen.catch(() => {});
  }
  return idbOpen;
}
function idbGet(key){
  return idb().then(db => new Promise((res, rej) => {
    const rq = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(key);
    rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
  }));
}
function idbPut(key, val){
  return idb().then(db => new Promise((res, rej) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(val, key);
    tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error);
  }));
}
/* 열기가 멈춰 버리는 브라우저가 드물게 있다. 그때 앱이 안 뜨는 일이 없게 시간을 끊는다 */
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
let lastDropNote = '';
function noteDropped(drop){
  /* 빠진 사진이 달라졌을 때만 한 번 알린다 */
  const note = Array.from(drop).sort().join(',');
  if (note === lastDropNote) return;
  lastDropNote = note;
  if (drop.size) toast('브라우저 임시저장 공간이 모자라 사진 ' + drop.size + '장은 임시저장에서 뺐습니다 · 지금 화면에는 그대로 있습니다');
}
/* 물러난 경우: localStorage에 넣되, 넘치면 큰 사진부터 하나씩 뺀다 */
function saveToLocal(){
  const drop = new Set(), cands = imageCandidates();
  for (let i = 0; i <= cands.length; i++){
    try { localStorage.setItem(KEY, savedJson(drop)); break; }
    catch(e){ if (i < cands.length) drop.add(cands[i].id); else return; }
  }
  noteDropped(drop);
}
function saveNow(){
  clearTimeout(saveTimer); saveTimer = null;
  let json;
  try { json = savedJson(new Set()); } catch(e){ return; }
  withTimeout(idbPut(KEY, json), 4000).then(() => {
    /* 옮긴 뒤에는 localStorage의 옛 사본을 지워 다른 설정이 쓸 자리를 비운다 */
    if (!idbMoved){ idbMoved = true; try { localStorage.removeItem(KEY); } catch(e){} }
    noteDropped(new Set());
  }).catch(saveToLocal);
}
function autosave(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 900);
}
/* 편집 직후 창을 닫거나 앱을 넘겨도 마지막 수정이 남게, 가려지는 순간 바로 저장한다 */
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && saveTimer) saveNow(); });
window.addEventListener('pagehide', () => { if (saveTimer) saveNow(); });
/* 불러온 뒤, 원본만 있는 사진의 표시용을 다시 만든다. 먼저 원본을 보여 주고 다 되면 바꿔 끼운다 */
async function rebuildDerivedImages(){
  const jobs = [];
  state.blocks.forEach(b => {
    if (!b.imgOrig || b.image) return;
    b.image = b.imgOrig;
    const c = b.imgCrop, cropped = c && !(c.x <= 0 && c.y <= 0 && c.w >= 1 && c.h >= 1);
    if (cropped || b.imgShape === 'circle' || (b.imgFade && b.imgFade !== 'none')) jobs.push(reprocessBlockImage(b, {quiet:true}));
  });
  state.speakers.forEach(sp => {
    if (!sp.avatarOrig || sp.avatar) return;
    sp.avatar = sp.avatarOrig;
    if (sp.avatarCrop) jobs.push(cropDataUrl(sp.avatarOrig, sp.avatarCrop).then(u => { sp.avatar = u; }).catch(() => {}));
  });
  const fo = state.frameImgOrig || {};
  if (!state.frameImg) state.frameImg = {};
  Object.keys(fo).forEach(k => {
    if (!fo[k] || state.frameImg[k]) return;
    state.frameImg[k] = fo[k];
    const rc = (state.frameCrop || {})[k];
    if (rc) jobs.push(cropDataUrl(fo[k], rc).then(u => { state.frameImg[k] = u; }).catch(() => {}));
  });
  if (jobs.length){ await Promise.all(jobs); renderAll(); }
}
const _renderCanvas = renderCanvas;
renderCanvas = function(){ _renderCanvas(); autosave(); };

(async function boot(){
  let saved = null;
  try { saved = await withTimeout(idbGet(KEY), 1500); } catch(e){}
  if (!saved){ try { saved = localStorage.getItem(KEY); } catch(e){} }
  try {
    if (saved){
      const loaded = JSON.parse(saved);
      if (loaded && Array.isArray(loaded.blocks) && loaded.blocks.length){
        adoptState(loaded);
        setTimeout(() => toast('지난번 작업을 이어서 불러왔습니다'), 600);
      }
    }
  } catch(e){}
  if (state.frame === 'polaroid') migratePolaroidCaption();
  upgradeRangeRows();
  try {
    const pw = Number(localStorage.getItem('chatFormatter.panelW'));
    if (pw) setPanelW(pw);
    const sh = Number(localStorage.getItem('chatFormatter.stageH'));
    if (sh) setStageH(sh);
  } catch(e){}
  let savedMat = null;
  try { savedMat = localStorage.getItem('chatFormatter.mat'); } catch(e){}
  setMat(savedMat || '#43647F');
  let savedUi = null;
  try { savedUi = localStorage.getItem('chatFormatter.ui'); } catch(e){}
  setUiMode(savedUi || (window.innerWidth < 860 ? 'mobile' : 'desktop'), true);
  let savedView = null;
  try { savedView = localStorage.getItem('chatFormatter.view'); } catch(e){}
  viewMode = savedView === 'paged' ? 'paged' : 'scroll';
  $('#btnUndo').disabled = true;
  $('#btnRedo').disabled = true;
  renderAll();
  setTimeout(fitZoom, 260);
  if (document.fonts && document.fonts.ready){
    document.fonts.ready.then(() => { reflowing = true; renderCanvas(); reflowing = false; });
  }
  warmUiFonts();
})();
/* 제목 글꼴(고운바탕)은 Google Fonts 가 한글을 여러 조각으로 나눠, 화면에 보이는 글자의 조각만 받는다.
   iOS Safari 는 처음에 숨어 있던 탭·접힌 칸의 제목을 나중에 열어도 그 조각을 받지 않고 기본 고딕으로 그려 버린다.
   시작할 때 제목에 쓰인 글자를 모아 조각을 미리 받고, 받은 뒤 한 번 다시 그리게 한다. */
function warmUiFonts(){
  if (!document.fonts || !document.fonts.load) return;
  const sel = '.brand b, .eyebrow, .sec-t, .modal h2';
  const chars = new Set();
  document.querySelectorAll(sel).forEach(el => { for (const ch of el.textContent) if (ch.trim()) chars.add(ch); });
  if (!chars.size) return;
  const text = Array.from(chars).join('');
  document.fonts.load('700 16px "Gowun Batang"', text)
    .then(() => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.fontFamily = 'serif';
        void el.offsetWidth;
        el.style.fontFamily = '';
      });
    })
    .catch(() => {});
}
