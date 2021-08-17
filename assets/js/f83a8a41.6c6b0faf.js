(self.webpackChunkdjorm_docs=self.webpackChunkdjorm_docs||[]).push([[7974],{876:function(e,t,a){"use strict";a.d(t,{Zo:function(){return c},kt:function(){return m}});var n=a(2784);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function s(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var l=n.createContext({}),d=function(e){var t=n.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):s(s({},t),e)),a},c=function(e){var t=d(e.components);return n.createElement(l.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},u=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,o=e.originalType,l=e.parentName,c=i(e,["components","mdxType","originalType","parentName"]),u=d(a),m=r,h=u["".concat(l,".").concat(m)]||u[m]||p[m]||o;return a?n.createElement(h,s(s({ref:t},c),{},{components:a})):n.createElement(h,s({ref:t},c))}));function m(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=a.length,s=new Array(o);s[0]=u;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:r,s[1]=i;for(var d=2;d<o;d++)s[d]=a[d];return n.createElement.apply(null,s)}return n.createElement.apply(null,a)}u.displayName="MDXCreateElement"},1684:function(e,t,a){"use strict";a.r(t),a.d(t,{frontMatter:function(){return i},metadata:function(){return l},toc:function(){return d},default:function(){return p}});var n=a(7560),r=a(8283),o=(a(2784),a(876)),s=["components"],i={sidebar_position:1},l={unversionedId:"models/DatabaseModel",id:"models/DatabaseModel",isDocsHomePage:!1,title:"Database Model",description:"This is the base class for your models.",source:"@site/docs/models/DatabaseModel.md",sourceDirName:"models",slug:"/models/DatabaseModel",permalink:"/djorm/docs/models/DatabaseModel",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/models/DatabaseModel.md",version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",previous:{title:"Settings",permalink:"/djorm/docs/settings"},next:{title:"Object Manager",permalink:"/djorm/docs/models/ObjectManager"}},d=[{value:"Model attributes",id:"model-attributes",children:[{value:"<code>objects</code>",id:"objects",children:[]}]},{value:"Model instance methods",id:"model-instance-methods",children:[{value:"<code>save()</code>",id:"save",children:[]},{value:"<code>create()</code>",id:"create",children:[]},{value:"<code>update()</code>",id:"update",children:[]},{value:"<code>delete()</code>",id:"delete",children:[]},{value:"<code>reload()</code>",id:"reload",children:[]}]},{value:"Model static methods",id:"model-static-methods",children:[{value:"<code>create(values)</code>",id:"createvalues",children:[]}]}],c={toc:d};function p(e){var t=e.components,a=(0,r.Z)(e,s);return(0,o.kt)("wrapper",(0,n.Z)({},c,a,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"This is the base class for your models."),(0,o.kt)("h2",{id:"model-attributes"},"Model attributes"),(0,o.kt)("h3",{id:"objects"},(0,o.kt)("inlineCode",{parentName:"h3"},"objects")),(0,o.kt)("p",null,"This is the ",(0,o.kt)("a",{parentName:"p",href:"/djorm/docs/models/ObjectManager"},"ObjectManager")," connected to the model, it provides interface to query the database."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"const { DatabaseModel } = require('djorm/models/DatabaseModel')\nconst { DateField } = require('djorm/fields/DateField')\nconst { CharField } = require('djorm/fields/CharField')\n\nclass Person extends DatabaseModel {\n  static firstName = new CharField()\n  static lastName = new CharField()\n  static birth = new DateField()\n}\n\nasync function getAllJohns() {\n  // Accessing the object manager\n  return await Person.objects.filter({ firstName: 'John' }).all()\n}\n")),(0,o.kt)("h2",{id:"model-instance-methods"},"Model instance methods"),(0,o.kt)("p",null,"This is the public model API intended for use. Feel free to extend these methods"),(0,o.kt)("h3",{id:"save"},(0,o.kt)("inlineCode",{parentName:"h3"},"save()")),(0,o.kt)("p",null,"Store the model instance in the database updating the current database record given it was pulled from the database or creating new one otherwise."),(0,o.kt)("p",null,"Save calls ",(0,o.kt)("a",{parentName:"p",href:"#create"},"create")," and ",(0,o.kt)("a",{parentName:"p",href:"#update"},"update")," internally."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"const person = await Person.objects.get({ id: 1 })\nperson.firstName = 'George'\nawait person.save()\n")),(0,o.kt)("h3",{id:"create"},(0,o.kt)("inlineCode",{parentName:"h3"},"create()")),(0,o.kt)("p",null,"Create new database record."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"const person = new Person({\n  firstName: 'Matthew',\n  lastName: 'Barnes',\n  birth: '1964-12-24'\n})\nawait person.create()\n")),(0,o.kt)("h3",{id:"update"},(0,o.kt)("inlineCode",{parentName:"h3"},"update()")),(0,o.kt)("p",null,"Update existing database record."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"const person = await Person.objects.get({ id: 1 })\nperson.firstName = 'George'\nawait person.update()\n")),(0,o.kt)("h3",{id:"delete"},(0,o.kt)("inlineCode",{parentName:"h3"},"delete()")),(0,o.kt)("p",null,"Delete existing database record."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"const person = await Person.objects.get({ id: 1 })\nawait person.delete()\n")),(0,o.kt)("h3",{id:"reload"},(0,o.kt)("inlineCode",{parentName:"h3"},"reload()")),(0,o.kt)("p",null,"Query the database for current entity state and store it in the instance."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"const person = await Person.objects.get({ id: 1 })\nawait person.refresh()\n")),(0,o.kt)("h2",{id:"model-static-methods"},"Model static methods"),(0,o.kt)("h3",{id:"createvalues"},(0,o.kt)("inlineCode",{parentName:"h3"},"create(values)")),(0,o.kt)("p",null,"Creates an instance of model and immediately storese it in the database."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"await Person.create({\n  firstName: 'Matthew',\n  lastName: 'Barnes',\n  birth: '1964-12-24'\n})\n")))}p.isMDXComponent=!0}}]);