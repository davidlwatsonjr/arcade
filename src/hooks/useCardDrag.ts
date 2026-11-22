import {dragEnabled} from '../accessibility/preferences';
import { useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, MouseEvent } from 'react';
type Active<T> = { value:T; pointer:number; x:number; y:number; source:HTMLElement; ghost:HTMLElement|null; target:HTMLElement|null };
export function useCardDrag<T>(onDrop:(value:T,target:string)=>void) {
  const active=useRef<Active<T>|null>(null);
  const suppress=useRef(0);
  const handler=useRef(onDrop);
  handler.current=onDrop;
  function clear() {
    const a=active.current;
    if(!a)return;
    active.current=null;
    a.ghost?.remove();
    a.source.classList.remove('card-dragging');
    a.target?.classList.remove('card-drop-hover');
    document.body.classList.remove('card-drag-active');
    if(a.source.hasPointerCapture(a.pointer))a.source.releasePointerCapture(a.pointer);
  }
  useEffect(()=>()=>clear(),[]);
  function source(value:T,enabled=true) {
    if(!enabled)return {};
    return {
      'data-card-drag':'true',
      draggable:false,
      onPointerDown:(e:ReactPointerEvent<HTMLElement>)=>{
        if(!dragEnabled()||!e.isPrimary||e.button!==0||active.current||(e.target as HTMLElement).closest('button')!==e.currentTarget&&(e.target as HTMLElement).closest('button')!==null)return;
        active.current={value,pointer:e.pointerId,x:e.clientX,y:e.clientY,source:e.currentTarget,ghost:null,target:null};
        e.currentTarget.setPointerCapture(e.pointerId);
      },
      onPointerMove:(e:ReactPointerEvent<HTMLElement>)=>{
        const a=active.current;if(!a||a.pointer!==e.pointerId)return;
        if(!a.ghost&&Math.hypot(e.clientX-a.x,e.clientY-a.y)<7)return;
        if(!a.ghost){
          const rect=a.source.getBoundingClientRect();
          const ghost=a.source.cloneNode(true) as HTMLElement;
          ghost.removeAttribute('id');ghost.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
          ghost.setAttribute('aria-hidden','true');ghost.setAttribute('inert','');
          ghost.classList.add('card-drag-ghost');
          Object.assign(ghost.style,{width:rect.width+'px',height:rect.height+'px',left:'0',top:'0'});
          document.body.appendChild(ghost);a.ghost=ghost;
          a.source.classList.add('card-dragging');document.body.classList.add('card-drag-active');
        }
        e.preventDefault();
        a.ghost.style.transform='translate3d('+(e.clientX-a.ghost.offsetWidth/2)+'px,'+(e.clientY-a.ghost.offsetHeight/2)+'px,0)';
        const target=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-card-drop]')??null;
        if(target!==a.target){a.target?.classList.remove('card-drop-hover');target?.classList.add('card-drop-hover');a.target=target}
      },
      onPointerUp:(e:ReactPointerEvent<HTMLElement>)=>{
        const a=active.current;if(!a||a.pointer!==e.pointerId)return;
        const moved=!!a.ghost;
        const target=moved?document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>('[data-card-drop]'):null;
        const value=a.value;
        clear();
        if(moved){suppress.current=performance.now()+350;e.preventDefault();if(target?.dataset.cardDrop)handler.current(value,target.dataset.cardDrop)}
      },
      onPointerCancel:()=>clear(),
      onLostPointerCapture:()=>clear(),
      onClickCapture:(e:MouseEvent<HTMLElement>)=>{if(e.detail!==0&&performance.now()<suppress.current){e.preventDefault();e.stopPropagation();suppress.current=0}},
    };
  }
  const target=(id:string,enabled=true)=>enabled?{'data-card-drop':id}:{};
  return {source,target};
}
