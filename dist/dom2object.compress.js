/* Copyright 2023 Carlos A. (https://github.com/dealfonso); License: https://opensource.org/license/mit/ */
function m(a,d=!1){if(void 0!==(a="string"==typeof a?document.querySelector(a):a).children&&(void 0===a.children.length||0==a.children.length))return a;const c=e=>void 0===e||""==e||null===e;let f={};function i(e){f={};var n,r,i=[];for(r of Array.from(a.children))void 0!==(n=r).id&&""!=n.id&&null!==n.id||void 0!==n.name&&""!=n.name&&null!==n.name?(c(r.id)||(r.id in f?console.warn("element already has a property named "+r.id):f[r.id]=m(r,d)),c(r.name)||r.name===r.id||(r.name in f?console.warn("element already has a property named "+r.name):f[r.name]=m(r,d))):d&&i.push(r);if(d)for(var t of i)if(0<t.children.length){var o,l=m(t,!0);for(o of l._childrenNames)o in f?console.warn("element already has a property named "+o):f[o]=l[o]}e._el=a,e._children=Object.fromEntries(Object.entries(f).map(([e,n])=>[e,n._el])),e._childrenNames=Object.keys(f)}var t=new Proxy(a,{get:function(e,n){return n in f?f[n]:"function"==typeof e[n]?e[n].bind(e):e[n]},set:function(e,n,r){return n in f?f[n]=r:(e[n]=r,t.hasOwnProperty(n)||i(t)),!0}});return i(t),t}window,m.multiple=function(e,n=!1){let r=[];for(var i of e="string"==typeof e?document.querySelectorAll(e):e)"string"==typeof i?r=[...r,...m.multiple(i,n)]:r.push(m(i,n));return r},m.version="0.9.1",window.DOM2Object=m;
