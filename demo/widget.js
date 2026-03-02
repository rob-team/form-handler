"use strict";(()=>{var F=(t,e,n)=>new Promise((o,s)=>{var r=u=>{try{l(n.next(u))}catch(_){s(_)}},a=u=>{try{l(n.throw(u))}catch(_){s(_)}},l=u=>u.done?o(u.value):Promise.resolve(u.value).then(r,a);l((n=n.apply(t,e)).next())});var j,m,me,Oe,A,ce,be,ge,ve,X,Y,G,Ve,U={},$=[],Qe=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,O=Array.isArray;function E(t,e){for(var n in e)t[n]=e[n];return t}function ee(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function te(t,e,n){var o,s,r,a={};for(r in e)r=="key"?o=e[r]:r=="ref"?s=e[r]:a[r]=e[r];if(arguments.length>2&&(a.children=arguments.length>3?j.call(arguments,2):n),typeof t=="function"&&t.defaultProps!=null)for(r in t.defaultProps)a[r]===void 0&&(a[r]=t.defaultProps[r]);return B(t,a,o,s,null)}function B(t,e,n,o,s){var r={type:t,props:e,key:n,ref:o,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:s==null?++me:s,__i:-1,__u:0};return s==null&&m.vnode!=null&&m.vnode(r),r}function q(t){return t.children}function R(t,e){this.props=t,this.context=e}function W(t,e){if(e==null)return t.__?W(t.__,t.__i+1):null;for(var n;e<t.__k.length;e++)if((n=t.__k[e])!=null&&n.__e!=null)return n.__e;return typeof t.type=="function"?W(t):null}function Ke(t){if(t.__P&&t.__d){var e=t.__v,n=e.__e,o=[],s=[],r=E({},e);r.__v=e.__v+1,m.vnode&&m.vnode(r),ne(t.__P,r,e,t.__n,t.__P.namespaceURI,32&e.__u?[n]:null,o,n==null?W(e):n,!!(32&e.__u),s),r.__v=e.__v,r.__.__k[r.__i]=r,ke(o,r,s),e.__e=e.__=null,r.__e!=n&&ye(r)}}function ye(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),ye(t)}function pe(t){(!t.__d&&(t.__d=!0)&&A.push(t)&&!L.__r++||ce!=m.debounceRendering)&&((ce=m.debounceRendering)||be)(L)}function L(){for(var t,e=1;A.length;)A.length>e&&A.sort(ge),t=A.shift(),e=A.length,Ke(t);L.__r=0}function xe(t,e,n,o,s,r,a,l,u,_,p){var i,d,f,v,w,g,h,b=o&&o.__k||$,S=e.length;for(u=Je(n,e,b,u,S),i=0;i<S;i++)(f=n.__k[i])!=null&&(d=f.__i!=-1&&b[f.__i]||U,f.__i=i,g=ne(t,f,d,s,r,a,l,u,_,p),v=f.__e,f.ref&&d.ref!=f.ref&&(d.ref&&oe(d.ref,null,f),p.push(f.ref,f.__c||v,f)),w==null&&v!=null&&(w=v),(h=!!(4&f.__u))||d.__k===f.__k?u=we(f,u,t,h):typeof f.type=="function"&&g!==void 0?u=g:v&&(u=v.nextSibling),f.__u&=-7);return n.__e=w,u}function Je(t,e,n,o,s){var r,a,l,u,_,p=n.length,i=p,d=0;for(t.__k=new Array(s),r=0;r<s;r++)(a=e[r])!=null&&typeof a!="boolean"&&typeof a!="function"?(typeof a=="string"||typeof a=="number"||typeof a=="bigint"||a.constructor==String?a=t.__k[r]=B(null,a,null,null,null):O(a)?a=t.__k[r]=B(q,{children:a},null,null,null):a.constructor===void 0&&a.__b>0?a=t.__k[r]=B(a.type,a.props,a.key,a.ref?a.ref:null,a.__v):t.__k[r]=a,u=r+d,a.__=t,a.__b=t.__b+1,l=null,(_=a.__i=Ye(a,n,u,i))!=-1&&(i--,(l=n[_])&&(l.__u|=2)),l==null||l.__v==null?(_==-1&&(s>p?d--:s<p&&d++),typeof a.type!="function"&&(a.__u|=4)):_!=u&&(_==u-1?d--:_==u+1?d++:(_>u?d--:d++,a.__u|=4))):t.__k[r]=null;if(i)for(r=0;r<p;r++)(l=n[r])!=null&&!(2&l.__u)&&(l.__e==o&&(o=W(l)),Se(l,l));return o}function we(t,e,n,o){var s,r;if(typeof t.type=="function"){for(s=t.__k,r=0;s&&r<s.length;r++)s[r]&&(s[r].__=t,e=we(s[r],e,n,o));return e}t.__e!=e&&(o&&(e&&t.type&&!e.parentNode&&(e=W(t)),n.insertBefore(t.__e,e||null)),e=t.__e);do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function Ye(t,e,n,o){var s,r,a,l=t.key,u=t.type,_=e[n],p=_!=null&&(2&_.__u)==0;if(_===null&&l==null||p&&l==_.key&&u==_.type)return n;if(o>(p?1:0)){for(s=n-1,r=n+1;s>=0||r<e.length;)if((_=e[a=s>=0?s--:r++])!=null&&!(2&_.__u)&&l==_.key&&u==_.type)return a}return-1}function de(t,e,n){e[0]=="-"?t.setProperty(e,n==null?"":n):t[e]=n==null?"":typeof n!="number"||Qe.test(e)?n:n+"px"}function z(t,e,n,o,s){var r,a;e:if(e=="style")if(typeof n=="string")t.style.cssText=n;else{if(typeof o=="string"&&(t.style.cssText=o=""),o)for(e in o)n&&e in n||de(t.style,e,"");if(n)for(e in n)o&&n[e]==o[e]||de(t.style,e,n[e])}else if(e[0]=="o"&&e[1]=="n")r=e!=(e=e.replace(ve,"$1")),a=e.toLowerCase(),e=a in t||e=="onFocusOut"||e=="onFocusIn"?a.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+r]=n,n?o?n.u=o.u:(n.u=X,t.addEventListener(e,r?G:Y,r)):t.removeEventListener(e,r?G:Y,r);else{if(s=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=n==null?"":n;break e}catch(l){}typeof n=="function"||(n==null||n===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&n==1?"":n))}}function he(t){return function(e){if(this.l){var n=this.l[e.type+t];if(e.t==null)e.t=X++;else if(e.t<n.u)return;return n(m.event?m.event(e):e)}}}function ne(t,e,n,o,s,r,a,l,u,_){var p,i,d,f,v,w,g,h,b,S,H,k,M,T,I,P=e.type;if(e.constructor!==void 0)return null;128&n.__u&&(u=!!(32&n.__u),r=[l=e.__e=n.__e]),(p=m.__b)&&p(e);e:if(typeof P=="function")try{if(h=e.props,b="prototype"in P&&P.prototype.render,S=(p=P.contextType)&&o[p.__c],H=p?S?S.props.value:p.__:o,n.__c?g=(i=e.__c=n.__c).__=i.__E:(b?e.__c=i=new P(h,H):(e.__c=i=new R(h,H),i.constructor=P,i.render=Ze),S&&S.sub(i),i.state||(i.state={}),i.__n=o,d=i.__d=!0,i.__h=[],i._sb=[]),b&&i.__s==null&&(i.__s=i.state),b&&P.getDerivedStateFromProps!=null&&(i.__s==i.state&&(i.__s=E({},i.__s)),E(i.__s,P.getDerivedStateFromProps(h,i.__s))),f=i.props,v=i.state,i.__v=e,d)b&&P.getDerivedStateFromProps==null&&i.componentWillMount!=null&&i.componentWillMount(),b&&i.componentDidMount!=null&&i.__h.push(i.componentDidMount);else{if(b&&P.getDerivedStateFromProps==null&&h!==f&&i.componentWillReceiveProps!=null&&i.componentWillReceiveProps(h,H),e.__v==n.__v||!i.__e&&i.shouldComponentUpdate!=null&&i.shouldComponentUpdate(h,i.__s,H)===!1){e.__v!=n.__v&&(i.props=h,i.state=i.__s,i.__d=!1),e.__e=n.__e,e.__k=n.__k,e.__k.some(function(D){D&&(D.__=e)}),$.push.apply(i.__h,i._sb),i._sb=[],i.__h.length&&a.push(i);break e}i.componentWillUpdate!=null&&i.componentWillUpdate(h,i.__s,H),b&&i.componentDidUpdate!=null&&i.__h.push(function(){i.componentDidUpdate(f,v,w)})}if(i.context=H,i.props=h,i.__P=t,i.__e=!1,k=m.__r,M=0,b)i.state=i.__s,i.__d=!1,k&&k(e),p=i.render(i.props,i.state,i.context),$.push.apply(i.__h,i._sb),i._sb=[];else do i.__d=!1,k&&k(e),p=i.render(i.props,i.state,i.context),i.state=i.__s;while(i.__d&&++M<25);i.state=i.__s,i.getChildContext!=null&&(o=E(E({},o),i.getChildContext())),b&&!d&&i.getSnapshotBeforeUpdate!=null&&(w=i.getSnapshotBeforeUpdate(f,v)),T=p!=null&&p.type===q&&p.key==null?Ce(p.props.children):p,l=xe(t,O(T)?T:[T],e,n,o,s,r,a,l,u,_),i.base=e.__e,e.__u&=-161,i.__h.length&&a.push(i),g&&(i.__E=i.__=null)}catch(D){if(e.__v=null,u||r!=null)if(D.then){for(e.__u|=u?160:128;l&&l.nodeType==8&&l.nextSibling;)l=l.nextSibling;r[r.indexOf(l)]=null,e.__e=l}else{for(I=r.length;I--;)ee(r[I]);Z(e)}else e.__e=n.__e,e.__k=n.__k,D.then||Z(e);m.__e(D,e,n)}else r==null&&e.__v==n.__v?(e.__k=n.__k,e.__e=n.__e):l=e.__e=Ge(n.__e,e,n,o,s,r,a,u,_);return(p=m.diffed)&&p(e),128&e.__u?void 0:l}function Z(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(Z))}function ke(t,e,n){for(var o=0;o<n.length;o++)oe(n[o],n[++o],n[++o]);m.__c&&m.__c(e,t),t.some(function(s){try{t=s.__h,s.__h=[],t.some(function(r){r.call(s)})}catch(r){m.__e(r,s.__v)}})}function Ce(t){return typeof t!="object"||t==null||t.__b>0?t:O(t)?t.map(Ce):E({},t)}function Ge(t,e,n,o,s,r,a,l,u){var _,p,i,d,f,v,w,g=n.props||U,h=e.props,b=e.type;if(b=="svg"?s="http://www.w3.org/2000/svg":b=="math"?s="http://www.w3.org/1998/Math/MathML":s||(s="http://www.w3.org/1999/xhtml"),r!=null){for(_=0;_<r.length;_++)if((f=r[_])&&"setAttribute"in f==!!b&&(b?f.localName==b:f.nodeType==3)){t=f,r[_]=null;break}}if(t==null){if(b==null)return document.createTextNode(h);t=document.createElementNS(s,b,h.is&&h),l&&(m.__m&&m.__m(e,r),l=!1),r=null}if(b==null)g===h||l&&t.data==h||(t.data=h);else{if(r=r&&j.call(t.childNodes),!l&&r!=null)for(g={},_=0;_<t.attributes.length;_++)g[(f=t.attributes[_]).name]=f.value;for(_ in g)f=g[_],_=="dangerouslySetInnerHTML"?i=f:_=="children"||_ in h||_=="value"&&"defaultValue"in h||_=="checked"&&"defaultChecked"in h||z(t,_,null,f,s);for(_ in h)f=h[_],_=="children"?d=f:_=="dangerouslySetInnerHTML"?p=f:_=="value"?v=f:_=="checked"?w=f:l&&typeof f!="function"||g[_]===f||z(t,_,f,g[_],s);if(p)l||i&&(p.__html==i.__html||p.__html==t.innerHTML)||(t.innerHTML=p.__html),e.__k=[];else if(i&&(t.innerHTML=""),xe(e.type=="template"?t.content:t,O(d)?d:[d],e,n,o,b=="foreignObject"?"http://www.w3.org/1999/xhtml":s,r,a,r?r[0]:n.__k&&W(n,0),l,u),r!=null)for(_=r.length;_--;)ee(r[_]);l||(_="value",b=="progress"&&v==null?t.removeAttribute("value"):v!=null&&(v!==t[_]||b=="progress"&&!v||b=="option"&&v!=g[_])&&z(t,_,v,g[_],s),_="checked",w!=null&&w!=t[_]&&z(t,_,w,g[_],s))}return t}function oe(t,e,n){try{if(typeof t=="function"){var o=typeof t.__u=="function";o&&t.__u(),o&&e==null||(t.__u=t(e))}else t.current=e}catch(s){m.__e(s,n)}}function Se(t,e,n){var o,s;if(m.unmount&&m.unmount(t),(o=t.ref)&&(o.current&&o.current!=t.__e||oe(o,null,e)),(o=t.__c)!=null){if(o.componentWillUnmount)try{o.componentWillUnmount()}catch(r){m.__e(r,e)}o.base=o.__P=null}if(o=t.__k)for(s=0;s<o.length;s++)o[s]&&Se(o[s],e,n||typeof t.type!="function");n||ee(t.__e),t.__c=t.__=t.__e=void 0}function Ze(t,e,n){return this.constructor(t,n)}function Pe(t,e,n){var o,s,r,a;e==document&&(e=document.documentElement),m.__&&m.__(t,e),s=(o=typeof n=="function")?null:n&&n.__k||e.__k,r=[],a=[],ne(e,t=(!o&&n||e).__k=te(q,null,[t]),s||U,U,e.namespaceURI,!o&&n?[n]:s?null:e.firstChild?j.call(e.childNodes):null,r,!o&&n?n:s?s.__e:e.firstChild,o,a),ke(r,t,a)}j=$.slice,m={__e:function(t,e,n,o){for(var s,r,a;e=e.__;)if((s=e.__c)&&!s.__)try{if((r=s.constructor)&&r.getDerivedStateFromError!=null&&(s.setState(r.getDerivedStateFromError(t)),a=s.__d),s.componentDidCatch!=null&&(s.componentDidCatch(t,o||{}),a=s.__d),a)return s.__E=s}catch(l){t=l}throw t}},me=0,Oe=function(t){return t!=null&&t.constructor===void 0},R.prototype.setState=function(t,e){var n;n=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=E({},this.state),typeof t=="function"&&(t=t(E({},n),this.props)),t&&E(n,t),t!=null&&this.__v&&(e&&this._sb.push(e),pe(this))},R.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),pe(this))},R.prototype.render=q,A=[],be=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,ge=function(t,e){return t.__v.__b-e.__v.__b},L.__r=0,ve=/(PointerCapture)$|Capture$/i,X=0,Y=he(!1),G=he(!0),Ve=0;var N,y,re,He,Q=0,qe=[],x=m,Ee=x.__b,Ae=x.__r,Te=x.diffed,Ie=x.__c,De=x.unmount,Fe=x.__;function se(t,e){x.__h&&x.__h(y,t,Q||e),Q=0;var n=y.__H||(y.__H={__:[],__h:[]});return t>=n.__.length&&n.__.push({}),n.__[t]}function C(t){return Q=1,Xe(ze,t)}function Xe(t,e,n){var o=se(N++,2);if(o.t=t,!o.__c&&(o.__=[n?n(e):ze(void 0,e),function(l){var u=o.__N?o.__N[0]:o.__[0],_=o.t(u,l);u!==_&&(o.__N=[_,o.__[1]],o.__c.setState({}))}],o.__c=y,!y.__f)){var s=function(l,u,_){if(!o.__c.__H)return!0;var p=o.__c.__H.__.filter(function(d){return d.__c});if(p.every(function(d){return!d.__N}))return!r||r.call(this,l,u,_);var i=o.__c.props!==l;return p.some(function(d){if(d.__N){var f=d.__[0];d.__=d.__N,d.__N=void 0,f!==d.__[0]&&(i=!0)}}),r&&r.call(this,l,u,_)||i};y.__f=!0;var r=y.shouldComponentUpdate,a=y.componentWillUpdate;y.componentWillUpdate=function(l,u,_){if(this.__e){var p=r;r=void 0,s(l,u,_),r=p}a&&a.call(this,l,u,_)},y.shouldComponentUpdate=s}return o.__N||o.__}function K(t,e){var n=se(N++,3);!x.__s&&Ne(n.__H,e)&&(n.__=t,n.u=e,y.__H.__h.push(n))}function Me(t){return Q=5,et(function(){return{current:t}},[])}function et(t,e){var n=se(N++,7);return Ne(n.__H,e)&&(n.__=t(),n.__H=e,n.__h=t),n.__}function tt(){for(var t;t=qe.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(V),e.__h.some(ie),e.__h=[]}catch(n){e.__h=[],x.__e(n,t.__v)}}}x.__b=function(t){y=null,Ee&&Ee(t)},x.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),Fe&&Fe(t,e)},x.__r=function(t){Ae&&Ae(t),N=0;var e=(y=t.__c).__H;e&&(re===y?(e.__h=[],y.__h=[],e.__.some(function(n){n.__N&&(n.__=n.__N),n.u=n.__N=void 0})):(e.__h.some(V),e.__h.some(ie),e.__h=[],N=0)),re=y},x.diffed=function(t){Te&&Te(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(qe.push(e)!==1&&He===x.requestAnimationFrame||((He=x.requestAnimationFrame)||nt)(tt)),e.__H.__.some(function(n){n.u&&(n.__H=n.u),n.u=void 0})),re=y=null},x.__c=function(t,e){e.some(function(n){try{n.__h.some(V),n.__h=n.__h.filter(function(o){return!o.__||ie(o)})}catch(o){e.some(function(s){s.__h&&(s.__h=[])}),e=[],x.__e(o,n.__v)}}),Ie&&Ie(t,e)},x.unmount=function(t){De&&De(t);var e,n=t.__c;n&&n.__H&&(n.__H.__.some(function(o){try{V(o)}catch(s){e=s}}),n.__H=void 0,e&&x.__e(e,n.__v))};var We=typeof requestAnimationFrame=="function";function nt(t){var e,n=function(){clearTimeout(o),We&&cancelAnimationFrame(e),setTimeout(t)},o=setTimeout(n,35);We&&(e=requestAnimationFrame(n))}function V(t){var e=y,n=t.__c;typeof n=="function"&&(t.__c=void 0,n()),y=e}function ie(t){var e=y;t.__c=t.__(),y=e}function Ne(t,e){return!t||t.length!==e.length||e.some(function(n,o){return n!==t[o]})}function ze(t,e){return typeof e=="function"?e(t):e}var ot=0,ft=Array.isArray;function c(t,e,n,o,s,r){e||(e={});var a,l,u=e;if("ref"in u)for(l in u={},e)l=="ref"?a=e[l]:u[l]=e[l];var _={type:t,props:u,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:--ot,__i:-1,__u:0,__source:s,__self:r};if(typeof t=="function"&&(a=t.defaultProps))for(l in a)u[l]===void 0&&(u[l]=a[l]);return m.vnode&&m.vnode(_),_}function _e({buttonText:t,isOpen:e,onClick:n}){return c("button",{class:`fh-bubble${e?" fh-bubble-open":""}`,onClick:n,"aria-label":e?"Close inquiry form":t,role:"button",children:e?c("span",{class:"fh-bubble-close",children:"\xD7"}):c("svg",{class:"fh-bubble-icon",viewBox:"0 0 24 24",xmlns:"http://www.w3.org/2000/svg",children:c("path",{d:"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"})})})}function ae({options:t,selected:e,onSelect:n}){return c("div",{class:"fh-options",children:t.map(o=>c("button",{class:`fh-option-btn${e===o?" fh-selected":""}`,onClick:()=>n(o),type:"button",children:o},o))})}function rt(t){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)}function le({question:t,currentAnswer:e,onAnswer:n}){let[o,s]=C(e||""),[r,a]=C("");function l(){let _=o.trim();if(t.required&&!_){a("This field is required.");return}if(t.type==="email"&&_&&!rt(_)){a("Please enter a valid email address.");return}a(""),n(_)}function u(_){_.key==="Enter"&&(_.preventDefault(),l())}return t.type==="single-select"&&t.options?c(ae,{options:t.options,selected:e||null,onSelect:_=>{a(""),n(_)}}):c("div",{class:"fh-input-area",children:[r&&c("div",{class:"fh-error",children:r}),c("div",{class:"fh-input-row",children:[c("input",{class:`fh-input${r?" fh-input-error":""}`,type:t.type==="email"?"email":"text",placeholder:t.type==="email"?"your@email.com":"Type your answer...",value:o,onInput:_=>{s(_.target.value),r&&a("")},onKeyDown:u,autoFocus:!0}),c("button",{class:"fh-send-btn",onClick:l,disabled:t.required&&!o.trim(),"aria-label":"Send",type:"button",children:c("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"currentColor",children:c("path",{d:"M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"})})})]})]})}function ue({greeting:t,questions:e,answers:n,currentStep:o,submitting:s,submitted:r,error:a,onAnswer:l,onBack:u,onSubmit:_,onClose:p}){var f,v;let i=Me(null);K(()=>{i.current&&(i.current.scrollTop=i.current.scrollHeight)},[o,n.length,r]);let d=o>=e.length;return c("div",{class:"fh-window",children:[c("div",{class:"fh-header",children:[c("span",{class:"fh-header-title",children:"Send Inquiry"}),c("button",{class:"fh-header-close",onClick:p,"aria-label":"Close",children:"\xD7"})]}),c("div",{class:"fh-messages",ref:i,children:[t&&c("div",{class:"fh-msg fh-msg-system",children:t}),n.map((w,g)=>{var h;return c("div",{children:[c("div",{class:"fh-msg fh-msg-system",children:(h=e[g])==null?void 0:h.label}),c("div",{class:"fh-msg fh-msg-visitor",children:w.answer})]},g)}),!r&&!d&&e[o]&&c("div",{class:"fh-msg fh-msg-system",children:[e[o].label,!e[o].required&&c("span",{style:{opacity:.6},children:" (optional)"})]}),r&&c("div",{class:"fh-msg fh-msg-system",children:"Thank you! Your inquiry has been submitted successfully. We'll get back to you soon."})]}),!r&&c("div",{class:"fh-progress",children:[o>0&&!d&&c("button",{class:"fh-back-btn",onClick:u,type:"button",children:"\u2190 Back"}),!d&&c("span",{children:[o+1," / ",e.length]})]}),a&&c("div",{class:"fh-error",children:a}),!r&&(d?c("div",{class:"fh-input-area",children:c("button",{class:"fh-submit-btn",onClick:_,disabled:s,type:"button",children:s?"Submitting...":"Submit Inquiry"})}):e[o]&&c(le,{question:e[o],currentAnswer:(v=(f=n[o])==null?void 0:f.answer)!=null?v:"",onAnswer:l},o))]})}var J="";function Be(t){J=t.replace(/\/$/,"")}function Re(t){return F(this,null,function*(){let e=yield fetch(`${J}/api/widget/${t}`);if(!e.ok)throw new Error(`Widget not found (${e.status})`);return e.json()})}function Ue(t,e,n){return F(this,null,function*(){let o=yield fetch(`${J}/api/widget/${t}/submit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({responses:e,page_url:n})});if(!o.ok){let s=yield o.json().catch(()=>({}));throw new Error(s.message||`Submission failed (${o.status})`)}return o.json()})}function $e(t,e){return F(this,null,function*(){try{yield fetch(`${J}/api/widget/${t}/visit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({page_url:e})})}catch(n){}})}function fe({widgetId:t}){let[e,n]=C("loading"),[o,s]=C(null),[r,a]=C(!1),[l,u]=C([]),[_,p]=C(0),[i,d]=C(!1),[f,v]=C(!1),[w,g]=C("");if(K(()=>{Re(t).then(k=>{s(k),n("ready"),$e(t,window.location.href)}).catch(()=>{n("error")})},[t]),e==="loading"||e==="error"||!o)return null;function h(){a(!r)}function b(k){let M=o.questions[_],T={question_id:M.id,question_label:M.label,answer:k},I=[...l];I[_]=T,u(I),p(_+1),g("")}function S(){_>0&&p(_-1)}function H(){return F(this,null,function*(){d(!0),g("");try{let k=l.filter(Boolean);yield Ue(t,k,window.location.href),v(!0)}catch(k){g(k instanceof Error?k.message:"Submission failed. Please try again.")}finally{d(!1)}})}return c("div",{class:"fh-root",children:[c(_e,{buttonText:o.button_text||"Send Inquiry",isOpen:r,onClick:h}),r&&c(ue,{greeting:o.greeting,questions:o.questions,answers:l,currentStep:_,submitting:i,submitted:f,error:w,onAnswer:b,onBack:S,onSubmit:H,onClose:()=>a(!1)})]})}var Le=`/* FormHandler Widget Styles \u2014 injected into Shadow DOM */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.fh-root {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #1a1a1a;
  -webkit-font-smoothing: antialiased;
}

/* Floating button */
.fh-bubble {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.fh-bubble:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.fh-bubble:active {
  transform: scale(0.95);
}

.fh-bubble-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.fh-bubble-close {
  font-size: 24px;
  line-height: 1;
}

/* Chat window */
.fh-window {
  position: fixed;
  bottom: 88px;
  right: 20px;
  width: 380px;
  height: 520px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  z-index: 9998;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fh-slide-up 0.25s ease-out;
}

@keyframes fh-slide-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.fh-header {
  background: #2563eb;
  color: #fff;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.fh-header-title {
  font-size: 16px;
  font-weight: 600;
}

.fh-header-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  opacity: 0.8;
}

.fh-header-close:hover {
  opacity: 1;
}

/* Messages area */
.fh-messages {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Message bubbles */
.fh-msg {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  word-break: break-word;
}

.fh-msg-system {
  align-self: flex-start;
  background: #f1f5f9;
  color: #334155;
  border-bottom-left-radius: 4px;
}

.fh-msg-visitor {
  align-self: flex-end;
  background: #2563eb;
  color: #fff;
  border-bottom-right-radius: 4px;
}

/* Input area */
.fh-input-area {
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.fh-input-row {
  display: flex;
  gap: 8px;
}

.fh-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
}

.fh-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.fh-input-error {
  border-color: #dc2626;
}

.fh-send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s;
}

.fh-send-btn:hover {
  background: #1d4ed8;
}

.fh-send-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

/* Select options */
.fh-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.fh-option-btn {
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  font-family: inherit;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.fh-option-btn:hover {
  background: #eff6ff;
  border-color: #2563eb;
}

.fh-option-btn.fh-selected {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

/* Progress */
.fh-progress {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
  padding: 4px 0;
}

/* Back button */
.fh-back-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.fh-back-btn:hover {
  color: #334155;
}

/* Submit button */
.fh-submit-btn {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.fh-submit-btn:hover {
  background: #1d4ed8;
}

.fh-submit-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

/* Error text */
.fh-error {
  color: #dc2626;
  font-size: 12px;
  padding: 0 16px 8px;
}

/* Responsive: mobile */
@media (max-width: 480px) {
  .fh-window {
    width: 100%;
    height: 100%;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }

  .fh-bubble {
    bottom: 16px;
    right: 16px;
  }

  /* Hide floating bubble when chat is open (header has its own close button) */
  .fh-bubble.fh-bubble-open {
    display: none;
  }

  /* Prevent iOS Safari zoom on input focus (requires >= 16px) */
  .fh-input {
    font-size: 16px;
  }
}
`;function je(){let t=window.FormHandler;if(!t||!t.widgetId){console.error("[FormHandler] Missing widgetId in window.FormHandler config");return}let e=t.widgetId,n=t.apiBase||"";Be(n);let o=document.createElement("div");o.id="formhandler-widget",document.body.appendChild(o);let s=o.attachShadow({mode:"closed"}),r=document.createElement("style");r.textContent=Le,s.appendChild(r);let a=document.createElement("div");s.appendChild(a),Pe(te(fe,{widgetId:e}),a)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",je):je();})();
