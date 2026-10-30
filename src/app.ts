// stack state
const params = new URLSearchParams(location.search);
let stack = (params.get('stackedNotes') || '').split(',').filter(Boolean);
fetch('/index.json').then(r=>r.json()).then(({notes})=>{
  const map = new Map(notes.map((n:any)=>[n.id,n]));
  if(!stack.length && notes.length) stack=[notes[0].id];
  const root=document.getElementById('stack')!;
  function render(){
    root.innerHTML='';
    stack.forEach(id=>{
      const n=map.get(id); if(!n) return;
      const p=document.createElement('div'); p.className='panel';
      p.innerHTML='<h1>'+n.title+'</h1>'+n.html;
      root.appendChild(p);
    });
  }
  render();
});
