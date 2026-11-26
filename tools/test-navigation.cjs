// Isolated routing regression check. This is NOT a real-browser test.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(require('path').join(__dirname,'../assets/house.js'),'utf8');
const chunk=(a,b)=>src.slice(src.indexOf(a),src.indexOf(b,src.indexOf(a)));
const intro={},journey={focus(){}},home={querySelector:()=>intro},classes=new Set(),location={hash:''}, main={dataset:{},replaceChildren(v){this.child=v},focus(){},getAnimations(){return[]},animate(){throw Error('animation unavailable')}};
const c={main,home,journey,location,history:{pushState(a,b,h){location.hash=h}},reduced:{matches:false},view:'',cache:new Map([['home',home]]),aliases:{about:'founders'},document:{body:{classList:{toggle(k,v){v?classes.add(k):classes.delete(k)}}},getElementById:()=>({content:{firstElementChild:{cloneNode:()=>({})}}})},window:{scrollTo(){}},requestAnimationFrame:()=>{},updateFilm(){},markNav(){},updateSpine(){},indexOf(){return 0},drawPath(){},stageMotion:0,showStage(n){c.stage=n},setupFounders(){}}; main.querySelector=()=>({});vm.createContext(c);
vm.runInContext(chunk('  function animateRoute(', '  function setupForm(')+chunk('  function route(', "  document.addEventListener('click',event=>{const link="),c);
for(const [hash,expected,inJourney] of [['#intro','home',false],['#journey','home',true],['#journey/3','home',true],['#founders','founders',false],['#contact','contact',false],['#intro','home',false],['#journey','home',true]]){
 c.navigate(hash);assert.equal(location.hash,hash);assert.equal(main.dataset.view,expected);assert.equal(intro.hidden,inJourney);assert.equal(journey.hidden,!inJourney);assert.equal(classes.has('journey-scene'),inJourney);assert.equal(classes.has('home-lock'),expected==='home');if(hash==='#journey/3')assert.equal(c.stage,3);
}
console.log('PASS. 7 isolated navigation transitions, scene visibility, direct milestone and animation failure fallback.');
