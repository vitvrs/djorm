(self.webpackChunkdjorm_docs=self.webpackChunkdjorm_docs||[]).push([[1608],{876:function(e,t,r){"use strict";r.d(t,{Zo:function(){return p},kt:function(){return d}});var n=r(2784);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function c(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?c(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function a(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},c=Object.keys(e);for(n=0;n<c.length;n++)r=c[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var c=Object.getOwnPropertySymbols(e);for(n=0;n<c.length;n++)r=c[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var s=n.createContext({}),u=function(e){var t=n.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},p=function(e){var t=u(e.components);return n.createElement(s.Provider,{value:t},e.children)},l={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},f=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,c=e.originalType,s=e.parentName,p=a(e,["components","mdxType","originalType","parentName"]),f=u(r),d=o,m=f["".concat(s,".").concat(d)]||f[d]||l[d]||c;return r?n.createElement(m,i(i({ref:t},p),{},{components:r})):n.createElement(m,i({ref:t},p))}));function d(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var c=r.length,i=new Array(c);i[0]=f;var a={};for(var s in t)hasOwnProperty.call(t,s)&&(a[s]=t[s]);a.originalType=e,a.mdxType="string"==typeof e?e:o,i[1]=a;for(var u=2;u<c;u++)i[u]=r[u];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}f.displayName="MDXCreateElement"},8866:function(e,t,r){"use strict";r.r(t),r.d(t,{frontMatter:function(){return a},metadata:function(){return s},toc:function(){return u},default:function(){return l}});var n=r(7560),o=r(8283),c=(r(2784),r(876)),i=["components"],a={sidebar_position:5},s={unversionedId:"concepts/querying",id:"concepts/querying",isDocsHomePage:!1,title:"Querying",description:"Djorm has a Query API simillar to the Django's, but it has quite a few differences due to the asynchronous nature of JavaScript.",source:"@site/docs/concepts/querying.md",sourceDirName:"concepts",slug:"/concepts/querying",permalink:"/djorm/docs/concepts/querying",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/concepts/querying.md",version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5},sidebar:"tutorialSidebar",previous:{title:"Logger",permalink:"/djorm/docs/concepts/logger"},next:{title:"Settings",permalink:"/djorm/docs/settings"}},u=[{value:"Quick example",id:"quick-example",children:[]}],p={toc:u};function l(e){var t=e.components,r=(0,o.Z)(e,i);return(0,c.kt)("wrapper",(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,c.kt)("p",null,"Djorm has a Query API simillar to the Django's, but it has quite a few differences due to the asynchronous nature of JavaScript."),(0,c.kt)("h2",{id:"quick-example"},"Quick example"),(0,c.kt)("pre",null,(0,c.kt)("code",{parentName:"pre"},"const { Person } = require('./models')\n\nconst myMethod = async () => {\n  const allPeople = await Person.objects.all()\n\n  const activePeople = await Person.objects.filter({\n    active: true\n  })\n\n  const personById = await Person.objects.get({ id: 1 })\n}\n\n\nmodule.exports = { myMethod }\n")))}l.isMDXComponent=!0}}]);