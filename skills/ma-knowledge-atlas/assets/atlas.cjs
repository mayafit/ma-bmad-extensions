var __ATLAS_LUNR_JS__ = "!function(){var e=function(t){var r=new e.Builder;return r.pipeline.add(e.trimmer,e.stopWordFilter,e.stemmer),r.searchPipeline.add(e.stemmer),t.call(r,r),r.build()};e.version=\"2.3.9\",e.utils={},e.utils.warn=function(e){return function(t){e.console&&console.warn&&console.warn(t)}}(this),e.utils.asString=function(e){return void 0===e||null===e?\"\":e.toString()},e.utils.clone=function(e){if(null===e||void 0===e)return e;for(var t=Object.create(null),r=Object.keys(e),i=0;i<r.length;i++){var n=r[i],s=e[n];if(Array.isArray(s))t[n]=s.slice();else{if(\"string\"!=typeof s&&\"number\"!=typeof s&&\"boolean\"!=typeof s)throw new TypeError(\"clone is not deep and does not support nested objects\");t[n]=s}}return t},e.FieldRef=function(e,t,r){this.docRef=e,this.fieldName=t,this._stringValue=r},e.FieldRef.joiner=\"/\",e.FieldRef.fromString=function(t){var r=t.indexOf(e.FieldRef.joiner);if(r===-1)throw\"malformed field ref string\";var i=t.slice(0,r),n=t.slice(r+1);return new e.FieldRef(n,i,t)},e.FieldRef.prototype.toString=function(){return void 0==this._stringValue&&(this._stringValue=this.fieldName+e.FieldRef.joiner+this.docRef),this._stringValue},e.Set=function(e){if(this.elements=Object.create(null),e){this.length=e.length;for(var t=0;t<this.length;t++)this.elements[e[t]]=!0}else this.length=0},e.Set.complete={intersect:function(e){return e},union:function(){return this},contains:function(){return!0}},e.Set.empty={intersect:function(){return this},union:function(e){return e},contains:function(){return!1}},e.Set.prototype.contains=function(e){return!!this.elements[e]},e.Set.prototype.intersect=function(t){var r,i,n,s=[];if(t===e.Set.complete)return this;if(t===e.Set.empty)return t;this.length<t.length?(r=this,i=t):(r=t,i=this),n=Object.keys(r.elements);for(var o=0;o<n.length;o++){var a=n[o];a in i.elements&&s.push(a)}return new e.Set(s)},e.Set.prototype.union=function(t){return t===e.Set.complete?e.Set.complete:t===e.Set.empty?this:new e.Set(Object.keys(this.elements).concat(Object.keys(t.elements)))},e.idf=function(e,t){var r=0;for(var i in e)\"_index\"!=i&&(r+=Object.keys(e[i]).length);var n=(t-r+.5)/(r+.5);return Math.log(1+Math.abs(n))},e.Token=function(e,t){this.str=e||\"\",this.metadata=t||{}},e.Token.prototype.toString=function(){return this.str},e.Token.prototype.update=function(e){return this.str=e(this.str,this.metadata),this},e.Token.prototype.clone=function(t){return t=t||function(e){return e},new e.Token(t(this.str,this.metadata),this.metadata)},e.tokenizer=function(t,r){if(null==t||void 0==t)return[];if(Array.isArray(t))return t.map(function(t){return new e.Token(e.utils.asString(t).toLowerCase(),e.utils.clone(r))});for(var i=t.toString().toLowerCase(),n=i.length,s=[],o=0,a=0;o<=n;o++){var u=i.charAt(o),l=o-a;if(u.match(e.tokenizer.separator)||o==n){if(l>0){var c=e.utils.clone(r)||{};c.position=[a,l],c.index=s.length,s.push(new e.Token(i.slice(a,o),c))}a=o+1}}return s},e.tokenizer.separator=/[\\s\\-]+/,e.Pipeline=function(){this._stack=[]},e.Pipeline.registeredFunctions=Object.create(null),e.Pipeline.registerFunction=function(t,r){r in this.registeredFunctions&&e.utils.warn(\"Overwriting existing registered function: \"+r),t.label=r,e.Pipeline.registeredFunctions[t.label]=t},e.Pipeline.warnIfFunctionNotRegistered=function(t){var r=t.label&&t.label in this.registeredFunctions;r||e.utils.warn(\"Function is not registered with pipeline. This may cause problems when serialising the index.\\n\",t)},e.Pipeline.load=function(t){var r=new e.Pipeline;return t.forEach(function(t){var i=e.Pipeline.registeredFunctions[t];if(!i)throw new Error(\"Cannot load unregistered function: \"+t);r.add(i)}),r},e.Pipeline.prototype.add=function(){var t=Array.prototype.slice.call(arguments);t.forEach(function(t){e.Pipeline.warnIfFunctionNotRegistered(t),this._stack.push(t)},this)},e.Pipeline.prototype.after=function(t,r){e.Pipeline.warnIfFunctionNotRegistered(r);var i=this._stack.indexOf(t);if(i==-1)throw new Error(\"Cannot find existingFn\");i+=1,this._stack.splice(i,0,r)},e.Pipeline.prototype.before=function(t,r){e.Pipeline.warnIfFunctionNotRegistered(r);var i=this._stack.indexOf(t);if(i==-1)throw new Error(\"Cannot find existingFn\");this._stack.splice(i,0,r)},e.Pipeline.prototype.remove=function(e){var t=this._stack.indexOf(e);t!=-1&&this._stack.splice(t,1)},e.Pipeline.prototype.run=function(e){for(var t=this._stack.length,r=0;r<t;r++){for(var i=this._stack[r],n=[],s=0;s<e.length;s++){var o=i(e[s],s,e);if(null!==o&&void 0!==o&&\"\"!==o)if(Array.isArray(o))for(var a=0;a<o.length;a++)n.push(o[a]);else n.push(o)}e=n}return e},e.Pipeline.prototype.runString=function(t,r){var i=new e.Token(t,r);return this.run([i]).map(function(e){return e.toString()})},e.Pipeline.prototype.reset=function(){this._stack=[]},e.Pipeline.prototype.toJSON=function(){return this._stack.map(function(t){return e.Pipeline.warnIfFunctionNotRegistered(t),t.label})},e.Vector=function(e){this._magnitude=0,this.elements=e||[]},e.Vector.prototype.positionForIndex=function(e){if(0==this.elements.length)return 0;for(var t=0,r=this.elements.length/2,i=r-t,n=Math.floor(i/2),s=this.elements[2*n];i>1&&(s<e&&(t=n),s>e&&(r=n),s!=e);)i=r-t,n=t+Math.floor(i/2),s=this.elements[2*n];return s==e?2*n:s>e?2*n:s<e?2*(n+1):void 0},e.Vector.prototype.insert=function(e,t){this.upsert(e,t,function(){throw\"duplicate index\"})},e.Vector.prototype.upsert=function(e,t,r){this._magnitude=0;var i=this.positionForIndex(e);this.elements[i]==e?this.elements[i+1]=r(this.elements[i+1],t):this.elements.splice(i,0,e,t)},e.Vector.prototype.magnitude=function(){if(this._magnitude)return this._magnitude;for(var e=0,t=this.elements.length,r=1;r<t;r+=2){var i=this.elements[r];e+=i*i}return this._magnitude=Math.sqrt(e)},e.Vector.prototype.dot=function(e){for(var t=0,r=this.elements,i=e.elements,n=r.length,s=i.length,o=0,a=0,u=0,l=0;u<n&&l<s;)o=r[u],a=i[l],o<a?u+=2:o>a?l+=2:o==a&&(t+=r[u+1]*i[l+1],u+=2,l+=2);return t},e.Vector.prototype.similarity=function(e){return this.dot(e)/this.magnitude()||0},e.Vector.prototype.toArray=function(){for(var e=new Array(this.elements.length/2),t=1,r=0;t<this.elements.length;t+=2,r++)e[r]=this.elements[t];return e},e.Vector.prototype.toJSON=function(){return this.elements},e.stemmer=function(){var e={ational:\"ate\",tional:\"tion\",enci:\"ence\",anci:\"ance\",izer:\"ize\",bli:\"ble\",alli:\"al\",entli:\"ent\",eli:\"e\",ousli:\"ous\",ization:\"ize\",ation:\"ate\",ator:\"ate\",alism:\"al\",iveness:\"ive\",fulness:\"ful\",ousness:\"ous\",aliti:\"al\",iviti:\"ive\",biliti:\"ble\",logi:\"log\"},t={icate:\"ic\",ative:\"\",alize:\"al\",iciti:\"ic\",ical:\"ic\",ful:\"\",ness:\"\"},r=\"[^aeiou]\",i=\"[aeiouy]\",n=r+\"[^aeiouy]*\",s=i+\"[aeiou]*\",o=\"^(\"+n+\")?\"+s+n,a=\"^(\"+n+\")?\"+s+n+\"(\"+s+\")?$\",u=\"^(\"+n+\")?\"+s+n+s+n,l=\"^(\"+n+\")?\"+i,c=new RegExp(o),h=new RegExp(u),d=new RegExp(a),f=new RegExp(l),p=/^(.+?)(ss|i)es$/,y=/^(.+?)([^s])s$/,m=/^(.+?)eed$/,v=/^(.+?)(ed|ing)$/,g=/.$/,x=/(at|bl|iz)$/,w=new RegExp(\"([^aeiouylsz])\\\\1$\"),Q=new RegExp(\"^\"+n+i+\"[^aeiouwxy]$\"),k=/^(.+?[^aeiou])y$/,S=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,E=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,L=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,b=/^(.+?)(s|t)(ion)$/,P=/^(.+?)e$/,T=/ll$/,O=new RegExp(\"^\"+n+i+\"[^aeiouwxy]$\"),I=function(r){var i,n,s,o,a,u,l;if(r.length<3)return r;if(s=r.substr(0,1),\"y\"==s&&(r=s.toUpperCase()+r.substr(1)),o=p,a=y,o.test(r)?r=r.replace(o,\"$1$2\"):a.test(r)&&(r=r.replace(a,\"$1$2\")),o=m,a=v,o.test(r)){var I=o.exec(r);o=c,o.test(I[1])&&(o=g,r=r.replace(o,\"\"))}else if(a.test(r)){var I=a.exec(r);i=I[1],a=f,a.test(i)&&(r=i,a=x,u=w,l=Q,a.test(r)?r+=\"e\":u.test(r)?(o=g,r=r.replace(o,\"\")):l.test(r)&&(r+=\"e\"))}if(o=k,o.test(r)){var I=o.exec(r);i=I[1],r=i+\"i\"}if(o=S,o.test(r)){var I=o.exec(r);i=I[1],n=I[2],o=c,o.test(i)&&(r=i+e[n])}if(o=E,o.test(r)){var I=o.exec(r);i=I[1],n=I[2],o=c,o.test(i)&&(r=i+t[n])}if(o=L,a=b,o.test(r)){var I=o.exec(r);i=I[1],o=h,o.test(i)&&(r=i)}else if(a.test(r)){var I=a.exec(r);i=I[1]+I[2],a=h,a.test(i)&&(r=i)}if(o=P,o.test(r)){var I=o.exec(r);i=I[1],o=h,a=d,u=O,(o.test(i)||a.test(i)&&!u.test(i))&&(r=i)}return o=T,a=h,o.test(r)&&a.test(r)&&(o=g,r=r.replace(o,\"\")),\"y\"==s&&(r=s.toLowerCase()+r.substr(1)),r};return function(e){return e.update(I)}}(),e.Pipeline.registerFunction(e.stemmer,\"stemmer\"),e.generateStopWordFilter=function(e){var t=e.reduce(function(e,t){return e[t]=t,e},{});return function(e){if(e&&t[e.toString()]!==e.toString())return e}},e.stopWordFilter=e.generateStopWordFilter([\"a\",\"able\",\"about\",\"across\",\"after\",\"all\",\"almost\",\"also\",\"am\",\"among\",\"an\",\"and\",\"any\",\"are\",\"as\",\"at\",\"be\",\"because\",\"been\",\"but\",\"by\",\"can\",\"cannot\",\"could\",\"dear\",\"did\",\"do\",\"does\",\"either\",\"else\",\"ever\",\"every\",\"for\",\"from\",\"get\",\"got\",\"had\",\"has\",\"have\",\"he\",\"her\",\"hers\",\"him\",\"his\",\"how\",\"however\",\"i\",\"if\",\"in\",\"into\",\"is\",\"it\",\"its\",\"just\",\"least\",\"let\",\"like\",\"likely\",\"may\",\"me\",\"might\",\"most\",\"must\",\"my\",\"neither\",\"no\",\"nor\",\"not\",\"of\",\"off\",\"often\",\"on\",\"only\",\"or\",\"other\",\"our\",\"own\",\"rather\",\"said\",\"say\",\"says\",\"she\",\"should\",\"since\",\"so\",\"some\",\"than\",\"that\",\"the\",\"their\",\"them\",\"then\",\"there\",\"these\",\"they\",\"this\",\"tis\",\"to\",\"too\",\"twas\",\"us\",\"wants\",\"was\",\"we\",\"were\",\"what\",\"when\",\"where\",\"which\",\"while\",\"who\",\"whom\",\"why\",\"will\",\"with\",\"would\",\"yet\",\"you\",\"your\"]),e.Pipeline.registerFunction(e.stopWordFilter,\"stopWordFilter\"),e.trimmer=function(e){return e.update(function(e){return e.replace(/^\\W+/,\"\").replace(/\\W+$/,\"\")})},e.Pipeline.registerFunction(e.trimmer,\"trimmer\"),e.TokenSet=function(){this[\"final\"]=!1,this.edges={},this.id=e.TokenSet._nextId,e.TokenSet._nextId+=1},e.TokenSet._nextId=1,e.TokenSet.fromArray=function(t){for(var r=new e.TokenSet.Builder,i=0,n=t.length;i<n;i++)r.insert(t[i]);return r.finish(),r.root},e.TokenSet.fromClause=function(t){return\"editDistance\"in t?e.TokenSet.fromFuzzyString(t.term,t.editDistance):e.TokenSet.fromString(t.term)},e.TokenSet.fromFuzzyString=function(t,r){for(var i=new e.TokenSet,n=[{node:i,editsRemaining:r,str:t}];n.length;){var s=n.pop();if(s.str.length>0){var o,a=s.str.charAt(0);a in s.node.edges?o=s.node.edges[a]:(o=new e.TokenSet,s.node.edges[a]=o),1==s.str.length&&(o[\"final\"]=!0),n.push({node:o,editsRemaining:s.editsRemaining,str:s.str.slice(1)})}if(0!=s.editsRemaining){if(\"*\"in s.node.edges)var u=s.node.edges[\"*\"];else{var u=new e.TokenSet;s.node.edges[\"*\"]=u}if(0==s.str.length&&(u[\"final\"]=!0),n.push({node:u,editsRemaining:s.editsRemaining-1,str:s.str}),s.str.length>1&&n.push({node:s.node,editsRemaining:s.editsRemaining-1,str:s.str.slice(1)}),1==s.str.length&&(s.node[\"final\"]=!0),s.str.length>=1){if(\"*\"in s.node.edges)var l=s.node.edges[\"*\"];else{var l=new e.TokenSet;s.node.edges[\"*\"]=l}1==s.str.length&&(l[\"final\"]=!0),n.push({node:l,editsRemaining:s.editsRemaining-1,str:s.str.slice(1)})}if(s.str.length>1){var c,h=s.str.charAt(0),d=s.str.charAt(1);d in s.node.edges?c=s.node.edges[d]:(c=new e.TokenSet,s.node.edges[d]=c),1==s.str.length&&(c[\"final\"]=!0),n.push({node:c,editsRemaining:s.editsRemaining-1,str:h+s.str.slice(2)})}}}return i},e.TokenSet.fromString=function(t){for(var r=new e.TokenSet,i=r,n=0,s=t.length;n<s;n++){var o=t[n],a=n==s-1;if(\"*\"==o)r.edges[o]=r,r[\"final\"]=a;else{var u=new e.TokenSet;u[\"final\"]=a,r.edges[o]=u,r=u}}return i},e.TokenSet.prototype.toArray=function(){for(var e=[],t=[{prefix:\"\",node:this}];t.length;){var r=t.pop(),i=Object.keys(r.node.edges),n=i.length;r.node[\"final\"]&&(r.prefix.charAt(0),e.push(r.prefix));for(var s=0;s<n;s++){var o=i[s];t.push({prefix:r.prefix.concat(o),node:r.node.edges[o]})}}return e},e.TokenSet.prototype.toString=function(){if(this._str)return this._str;for(var e=this[\"final\"]?\"1\":\"0\",t=Object.keys(this.edges).sort(),r=t.length,i=0;i<r;i++){var n=t[i],s=this.edges[n];e=e+n+s.id}return e},e.TokenSet.prototype.intersect=function(t){for(var r=new e.TokenSet,i=void 0,n=[{qNode:t,output:r,node:this}];n.length;){i=n.pop();for(var s=Object.keys(i.qNode.edges),o=s.length,a=Object.keys(i.node.edges),u=a.length,l=0;l<o;l++)for(var c=s[l],h=0;h<u;h++){var d=a[h];if(d==c||\"*\"==c){var f=i.node.edges[d],p=i.qNode.edges[c],y=f[\"final\"]&&p[\"final\"],m=void 0;d in i.output.edges?(m=i.output.edges[d],m[\"final\"]=m[\"final\"]||y):(m=new e.TokenSet,m[\"final\"]=y,i.output.edges[d]=m),n.push({qNode:p,output:m,node:f})}}}return r},e.TokenSet.Builder=function(){this.previousWord=\"\",this.root=new e.TokenSet,this.uncheckedNodes=[],this.minimizedNodes={}},e.TokenSet.Builder.prototype.insert=function(t){var r,i=0;if(t<this.previousWord)throw new Error(\"Out of order word insertion\");for(var n=0;n<t.length&&n<this.previousWord.length&&t[n]==this.previousWord[n];n++)i++;this.minimize(i),r=0==this.uncheckedNodes.length?this.root:this.uncheckedNodes[this.uncheckedNodes.length-1].child;for(var n=i;n<t.length;n++){var s=new e.TokenSet,o=t[n];r.edges[o]=s,this.uncheckedNodes.push({parent:r,\"char\":o,child:s}),r=s}r[\"final\"]=!0,this.previousWord=t},e.TokenSet.Builder.prototype.finish=function(){this.minimize(0)},e.TokenSet.Builder.prototype.minimize=function(e){for(var t=this.uncheckedNodes.length-1;t>=e;t--){var r=this.uncheckedNodes[t],i=r.child.toString();i in this.minimizedNodes?r.parent.edges[r[\"char\"]]=this.minimizedNodes[i]:(r.child._str=i,this.minimizedNodes[i]=r.child),this.uncheckedNodes.pop()}},e.Index=function(e){this.invertedIndex=e.invertedIndex,this.fieldVectors=e.fieldVectors,this.tokenSet=e.tokenSet,this.fields=e.fields,this.pipeline=e.pipeline},e.Index.prototype.search=function(t){return this.query(function(r){var i=new e.QueryParser(t,r);i.parse()})},e.Index.prototype.query=function(t){for(var r=new e.Query(this.fields),i=Object.create(null),n=Object.create(null),s=Object.create(null),o=Object.create(null),a=Object.create(null),u=0;u<this.fields.length;u++)n[this.fields[u]]=new e.Vector;t.call(r,r);for(var u=0;u<r.clauses.length;u++){var l=r.clauses[u],c=null,h=e.Set.empty;c=l.usePipeline?this.pipeline.runString(l.term,{fields:l.fields}):[l.term];for(var d=0;d<c.length;d++){var f=c[d];l.term=f;var p=e.TokenSet.fromClause(l),y=this.tokenSet.intersect(p).toArray();if(0===y.length&&l.presence===e.Query.presence.REQUIRED){for(var m=0;m<l.fields.length;m++){var v=l.fields[m];o[v]=e.Set.empty}break}for(var g=0;g<y.length;g++)for(var x=y[g],w=this.invertedIndex[x],Q=w._index,m=0;m<l.fields.length;m++){var v=l.fields[m],k=w[v],S=Object.keys(k),E=x+\"/\"+v,L=new e.Set(S);if(l.presence==e.Query.presence.REQUIRED&&(h=h.union(L),void 0===o[v]&&(o[v]=e.Set.complete)),l.presence!=e.Query.presence.PROHIBITED){if(n[v].upsert(Q,l.boost,function(e,t){return e+t}),!s[E]){for(var b=0;b<S.length;b++){var P,T=S[b],O=new e.FieldRef(T,v),I=k[T];void 0===(P=i[O])?i[O]=new e.MatchData(x,v,I):P.add(x,v,I)}s[E]=!0}}else void 0===a[v]&&(a[v]=e.Set.empty),a[v]=a[v].union(L)}}if(l.presence===e.Query.presence.REQUIRED)for(var m=0;m<l.fields.length;m++){var v=l.fields[m];o[v]=o[v].intersect(h)}}for(var R=e.Set.complete,F=e.Set.empty,u=0;u<this.fields.length;u++){var v=this.fields[u];o[v]&&(R=R.intersect(o[v])),a[v]&&(F=F.union(a[v]))}var C=Object.keys(i),N=[],_=Object.create(null);if(r.isNegated()){C=Object.keys(this.fieldVectors);for(var u=0;u<C.length;u++){var O=C[u],j=e.FieldRef.fromString(O);i[O]=new e.MatchData}}for(var u=0;u<C.length;u++){var j=e.FieldRef.fromString(C[u]),D=j.docRef;if(R.contains(D)&&!F.contains(D)){var A,B=this.fieldVectors[j],V=n[j.fieldName].similarity(B);if(void 0!==(A=_[D]))A.score+=V,A.matchData.combine(i[j]);else{var z={ref:D,score:V,matchData:i[j]};_[D]=z,N.push(z)}}}return N.sort(function(e,t){return t.score-e.score})},e.Index.prototype.toJSON=function(){var t=Object.keys(this.invertedIndex).sort().map(function(e){return[e,this.invertedIndex[e]]},this),r=Object.keys(this.fieldVectors).map(function(e){return[e,this.fieldVectors[e].toJSON()]},this);return{version:e.version,fields:this.fields,fieldVectors:r,invertedIndex:t,pipeline:this.pipeline.toJSON()}},e.Index.load=function(t){var r={},i={},n=t.fieldVectors,s=Object.create(null),o=t.invertedIndex,a=new e.TokenSet.Builder,u=e.Pipeline.load(t.pipeline);t.version!=e.version&&e.utils.warn(\"Version mismatch when loading serialised index. Current version of lunr '\"+e.version+\"' does not match serialized index '\"+t.version+\"'\");for(var l=0;l<n.length;l++){var c=n[l],h=c[0],d=c[1];i[h]=new e.Vector(d)}for(var l=0;l<o.length;l++){var c=o[l],f=c[0],p=c[1];a.insert(f),s[f]=p}return a.finish(),r.fields=t.fields,r.fieldVectors=i,r.invertedIndex=s,r.tokenSet=a.root,r.pipeline=u,new e.Index(r)},e.Builder=function(){this._ref=\"id\",this._fields=Object.create(null),this._documents=Object.create(null),this.invertedIndex=Object.create(null),this.fieldTermFrequencies={},this.fieldLengths={},this.tokenizer=e.tokenizer,this.pipeline=new e.Pipeline,this.searchPipeline=new e.Pipeline,this.documentCount=0,this._b=.75,this._k1=1.2,this.termIndex=0,this.metadataWhitelist=[]},e.Builder.prototype.ref=function(e){this._ref=e},e.Builder.prototype.field=function(e,t){if(/\\//.test(e))throw new RangeError(\"Field '\"+e+\"' contains illegal character '/'\");this._fields[e]=t||{}},e.Builder.prototype.b=function(e){e<0?this._b=0:e>1?this._b=1:this._b=e},e.Builder.prototype.k1=function(e){this._k1=e},e.Builder.prototype.add=function(t,r){var i=t[this._ref],n=Object.keys(this._fields);this._documents[i]=r||{},this.documentCount+=1;for(var s=0;s<n.length;s++){var o=n[s],a=this._fields[o].extractor,u=a?a(t):t[o],l=this.tokenizer(u,{fields:[o]}),c=this.pipeline.run(l),h=new e.FieldRef(i,o),d=Object.create(null);this.fieldTermFrequencies[h]=d,this.fieldLengths[h]=0,this.fieldLengths[h]+=c.length;for(var f=0;f<c.length;f++){var p=c[f];if(void 0==d[p]&&(d[p]=0),d[p]+=1,void 0==this.invertedIndex[p]){var y=Object.create(null);y._index=this.termIndex,this.termIndex+=1;for(var m=0;m<n.length;m++)y[n[m]]=Object.create(null);this.invertedIndex[p]=y}void 0==this.invertedIndex[p][o][i]&&(this.invertedIndex[p][o][i]=Object.create(null));for(var v=0;v<this.metadataWhitelist.length;v++){var g=this.metadataWhitelist[v],x=p.metadata[g];void 0==this.invertedIndex[p][o][i][g]&&(this.invertedIndex[p][o][i][g]=[]),this.invertedIndex[p][o][i][g].push(x)}}}},e.Builder.prototype.calculateAverageFieldLengths=function(){for(var t=Object.keys(this.fieldLengths),r=t.length,i={},n={},s=0;s<r;s++){var o=e.FieldRef.fromString(t[s]),a=o.fieldName;n[a]||(n[a]=0),n[a]+=1,i[a]||(i[a]=0),i[a]+=this.fieldLengths[o]}for(var u=Object.keys(this._fields),s=0;s<u.length;s++){var l=u[s];i[l]=i[l]/n[l]}this.averageFieldLength=i},e.Builder.prototype.createFieldVectors=function(){for(var t={},r=Object.keys(this.fieldTermFrequencies),i=r.length,n=Object.create(null),s=0;s<i;s++){for(var o=e.FieldRef.fromString(r[s]),a=o.fieldName,u=this.fieldLengths[o],l=new e.Vector,c=this.fieldTermFrequencies[o],h=Object.keys(c),d=h.length,f=this._fields[a].boost||1,p=this._documents[o.docRef].boost||1,y=0;y<d;y++){var m,v,g,x=h[y],w=c[x],Q=this.invertedIndex[x]._index;void 0===n[x]?(m=e.idf(this.invertedIndex[x],this.documentCount),n[x]=m):m=n[x],v=m*((this._k1+1)*w)/(this._k1*(1-this._b+this._b*(u/this.averageFieldLength[a]))+w),v*=f,v*=p,g=Math.round(1e3*v)/1e3,l.insert(Q,g)}t[o]=l}this.fieldVectors=t},e.Builder.prototype.createTokenSet=function(){this.tokenSet=e.TokenSet.fromArray(Object.keys(this.invertedIndex).sort())},e.Builder.prototype.build=function(){return this.calculateAverageFieldLengths(),this.createFieldVectors(),this.createTokenSet(),new e.Index({invertedIndex:this.invertedIndex,fieldVectors:this.fieldVectors,tokenSet:this.tokenSet,fields:Object.keys(this._fields),pipeline:this.searchPipeline})},e.Builder.prototype.use=function(e){var t=Array.prototype.slice.call(arguments,1);t.unshift(this),e.apply(this,t)},e.MatchData=function(e,t,r){for(var i=Object.create(null),n=Object.keys(r||{}),s=0;s<n.length;s++){var o=n[s];i[o]=r[o].slice()}this.metadata=Object.create(null),void 0!==e&&(this.metadata[e]=Object.create(null),this.metadata[e][t]=i)},e.MatchData.prototype.combine=function(e){for(var t=Object.keys(e.metadata),r=0;r<t.length;r++){var i=t[r],n=Object.keys(e.metadata[i]);void 0==this.metadata[i]&&(this.metadata[i]=Object.create(null));for(var s=0;s<n.length;s++){var o=n[s],a=Object.keys(e.metadata[i][o]);void 0==this.metadata[i][o]&&(this.metadata[i][o]=Object.create(null));for(var u=0;u<a.length;u++){var l=a[u];void 0==this.metadata[i][o][l]?this.metadata[i][o][l]=e.metadata[i][o][l]:this.metadata[i][o][l]=this.metadata[i][o][l].concat(e.metadata[i][o][l])}}}},e.MatchData.prototype.add=function(e,t,r){if(!(e in this.metadata))return this.metadata[e]=Object.create(null),void(this.metadata[e][t]=r);if(!(t in this.metadata[e]))return void(this.metadata[e][t]=r);for(var i=Object.keys(r),n=0;n<i.length;n++){var s=i[n];s in this.metadata[e][t]?this.metadata[e][t][s]=this.metadata[e][t][s].concat(r[s]):this.metadata[e][t][s]=r[s]}},e.Query=function(e){this.clauses=[],this.allFields=e},e.Query.wildcard=new String(\"*\"),e.Query.wildcard.NONE=0,e.Query.wildcard.LEADING=1,e.Query.wildcard.TRAILING=2,e.Query.presence={OPTIONAL:1,REQUIRED:2,PROHIBITED:3},e.Query.prototype.clause=function(t){return\"fields\"in t||(t.fields=this.allFields),\"boost\"in t||(t.boost=1),\"usePipeline\"in t||(t.usePipeline=!0),\"wildcard\"in t||(t.wildcard=e.Query.wildcard.NONE),t.wildcard&e.Query.wildcard.LEADING&&t.term.charAt(0)!=e.Query.wildcard&&(t.term=\"*\"+t.term),t.wildcard&e.Query.wildcard.TRAILING&&t.term.slice(-1)!=e.Query.wildcard&&(t.term=\"\"+t.term+\"*\"),\"presence\"in t||(t.presence=e.Query.presence.OPTIONAL),this.clauses.push(t),this},e.Query.prototype.isNegated=function(){for(var t=0;t<this.clauses.length;t++)if(this.clauses[t].presence!=e.Query.presence.PROHIBITED)return!1;return!0},e.Query.prototype.term=function(t,r){if(Array.isArray(t))return t.forEach(function(t){this.term(t,e.utils.clone(r))},this),this;var i=r||{};return i.term=t.toString(),this.clause(i),this},e.QueryParseError=function(e,t,r){this.name=\"QueryParseError\",this.message=e,this.start=t,this.end=r},e.QueryParseError.prototype=new Error,e.QueryLexer=function(e){this.lexemes=[],this.str=e,this.length=e.length,this.pos=0,this.start=0,this.escapeCharPositions=[]},e.QueryLexer.prototype.run=function(){for(var t=e.QueryLexer.lexText;t;)t=t(this)},e.QueryLexer.prototype.sliceString=function(){for(var e=[],t=this.start,r=this.pos,i=0;i<this.escapeCharPositions.length;i++)r=this.escapeCharPositions[i],e.push(this.str.slice(t,r)),t=r+1;return e.push(this.str.slice(t,this.pos)),this.escapeCharPositions.length=0,e.join(\"\")},e.QueryLexer.prototype.emit=function(e){this.lexemes.push({type:e,str:this.sliceString(),start:this.start,end:this.pos}),this.start=this.pos},e.QueryLexer.prototype.escapeCharacter=function(){this.escapeCharPositions.push(this.pos-1),this.pos+=1},e.QueryLexer.prototype.next=function(){if(this.pos>=this.length)return e.QueryLexer.EOS;var t=this.str.charAt(this.pos);return this.pos+=1,t},e.QueryLexer.prototype.width=function(){return this.pos-this.start},e.QueryLexer.prototype.ignore=function(){this.start==this.pos&&(this.pos+=1),this.start=this.pos},e.QueryLexer.prototype.backup=function(){this.pos-=1},e.QueryLexer.prototype.acceptDigitRun=function(){var t,r;do t=this.next(),r=t.charCodeAt(0);while(r>47&&r<58);t!=e.QueryLexer.EOS&&this.backup()},e.QueryLexer.prototype.more=function(){return this.pos<this.length},e.QueryLexer.EOS=\"EOS\",e.QueryLexer.FIELD=\"FIELD\",e.QueryLexer.TERM=\"TERM\",e.QueryLexer.EDIT_DISTANCE=\"EDIT_DISTANCE\",e.QueryLexer.BOOST=\"BOOST\",e.QueryLexer.PRESENCE=\"PRESENCE\",e.QueryLexer.lexField=function(t){return t.backup(),t.emit(e.QueryLexer.FIELD),t.ignore(),e.QueryLexer.lexText},e.QueryLexer.lexTerm=function(t){if(t.width()>1&&(t.backup(),t.emit(e.QueryLexer.TERM)),t.ignore(),t.more())return e.QueryLexer.lexText},e.QueryLexer.lexEditDistance=function(t){return t.ignore(),t.acceptDigitRun(),t.emit(e.QueryLexer.EDIT_DISTANCE),e.QueryLexer.lexText},e.QueryLexer.lexBoost=function(t){return t.ignore(),t.acceptDigitRun(),t.emit(e.QueryLexer.BOOST),e.QueryLexer.lexText},e.QueryLexer.lexEOS=function(t){t.width()>0&&t.emit(e.QueryLexer.TERM)},e.QueryLexer.termSeparator=e.tokenizer.separator,e.QueryLexer.lexText=function(t){for(;;){var r=t.next();if(r==e.QueryLexer.EOS)return e.QueryLexer.lexEOS;if(92!=r.charCodeAt(0)){if(\":\"==r)return e.QueryLexer.lexField;if(\"~\"==r)return t.backup(),t.width()>0&&t.emit(e.QueryLexer.TERM),e.QueryLexer.lexEditDistance;if(\"^\"==r)return t.backup(),t.width()>0&&t.emit(e.QueryLexer.TERM),e.QueryLexer.lexBoost;if(\"+\"==r&&1===t.width())return t.emit(e.QueryLexer.PRESENCE),e.QueryLexer.lexText;if(\"-\"==r&&1===t.width())return t.emit(e.QueryLexer.PRESENCE),e.QueryLexer.lexText;if(r.match(e.QueryLexer.termSeparator))return e.QueryLexer.lexTerm}else t.escapeCharacter()}},e.QueryParser=function(t,r){this.lexer=new e.QueryLexer(t),this.query=r,this.currentClause={},this.lexemeIdx=0},e.QueryParser.prototype.parse=function(){this.lexer.run(),this.lexemes=this.lexer.lexemes;for(var t=e.QueryParser.parseClause;t;)t=t(this);return this.query},e.QueryParser.prototype.peekLexeme=function(){return this.lexemes[this.lexemeIdx]},e.QueryParser.prototype.consumeLexeme=function(){var e=this.peekLexeme();return this.lexemeIdx+=1,e},e.QueryParser.prototype.nextClause=function(){var e=this.currentClause;this.query.clause(e),this.currentClause={}},e.QueryParser.parseClause=function(t){var r=t.peekLexeme();if(void 0!=r)switch(r.type){case e.QueryLexer.PRESENCE:return e.QueryParser.parsePresence;case e.QueryLexer.FIELD:return e.QueryParser.parseField;case e.QueryLexer.TERM:return e.QueryParser.parseTerm;default:var i=\"expected either a field or a term, found \"+r.type;throw r.str.length>=1&&(i+=\" with value '\"+r.str+\"'\"),new e.QueryParseError(i,r.start,r.end)}},e.QueryParser.parsePresence=function(t){var r=t.consumeLexeme();if(void 0!=r){switch(r.str){case\"-\":t.currentClause.presence=e.Query.presence.PROHIBITED;break;case\"+\":t.currentClause.presence=e.Query.presence.REQUIRED;break;default:var i=\"unrecognised presence operator'\"+r.str+\"'\";throw new e.QueryParseError(i,r.start,r.end)}var n=t.peekLexeme();if(void 0==n){var i=\"expecting term or field, found nothing\";throw new e.QueryParseError(i,r.start,r.end)}switch(n.type){case e.QueryLexer.FIELD:return e.QueryParser.parseField;case e.QueryLexer.TERM:return e.QueryParser.parseTerm;default:var i=\"expecting term or field, found '\"+n.type+\"'\";throw new e.QueryParseError(i,n.start,n.end)}}},e.QueryParser.parseField=function(t){var r=t.consumeLexeme();if(void 0!=r){if(t.query.allFields.indexOf(r.str)==-1){var i=t.query.allFields.map(function(e){return\"'\"+e+\"'\"}).join(\", \"),n=\"unrecognised field '\"+r.str+\"', possible fields: \"+i;throw new e.QueryParseError(n,r.start,r.end)}t.currentClause.fields=[r.str];var s=t.peekLexeme();if(void 0==s){var n=\"expecting term, found nothing\";throw new e.QueryParseError(n,r.start,r.end)}switch(s.type){case e.QueryLexer.TERM:return e.QueryParser.parseTerm;default:var n=\"expecting term, found '\"+s.type+\"'\";throw new e.QueryParseError(n,s.start,s.end)}}},e.QueryParser.parseTerm=function(t){var r=t.consumeLexeme();if(void 0!=r){t.currentClause.term=r.str.toLowerCase(),r.str.indexOf(\"*\")!=-1&&(t.currentClause.usePipeline=!1);var i=t.peekLexeme();if(void 0==i)return void t.nextClause();switch(i.type){case e.QueryLexer.TERM:return t.nextClause(),e.QueryParser.parseTerm;case e.QueryLexer.FIELD:return t.nextClause(),e.QueryParser.parseField;case e.QueryLexer.EDIT_DISTANCE:return e.QueryParser.parseEditDistance;case e.QueryLexer.BOOST:return e.QueryParser.parseBoost;case e.QueryLexer.PRESENCE:return t.nextClause(),e.QueryParser.parsePresence;default:var n=\"Unexpected lexeme type '\"+i.type+\"'\";throw new e.QueryParseError(n,i.start,i.end)}}},e.QueryParser.parseEditDistance=function(t){var r=t.consumeLexeme();if(void 0!=r){var i=parseInt(r.str,10);if(isNaN(i)){var n=\"edit distance must be numeric\";throw new e.QueryParseError(n,r.start,r.end)}t.currentClause.editDistance=i;var s=t.peekLexeme();if(void 0==s)return void t.nextClause();switch(s.type){case e.QueryLexer.TERM:return t.nextClause(),e.QueryParser.parseTerm;case e.QueryLexer.FIELD:return t.nextClause(),e.QueryParser.parseField;case e.QueryLexer.EDIT_DISTANCE:return e.QueryParser.parseEditDistance;case e.QueryLexer.BOOST:return e.QueryParser.parseBoost;case e.QueryLexer.PRESENCE:return t.nextClause(),e.QueryParser.parsePresence;default:var n=\"Unexpected lexeme type '\"+s.type+\"'\";throw new e.QueryParseError(n,s.start,s.end)}}},e.QueryParser.parseBoost=function(t){var r=t.consumeLexeme();if(void 0!=r){var i=parseInt(r.str,10);if(isNaN(i)){var n=\"boost must be numeric\";throw new e.QueryParseError(n,r.start,r.end)}t.currentClause.boost=i;var s=t.peekLexeme();if(void 0==s)return void t.nextClause();switch(s.type){case e.QueryLexer.TERM:return t.nextClause(),e.QueryParser.parseTerm;case e.QueryLexer.FIELD:return t.nextClause(),e.QueryParser.parseField;case e.QueryLexer.EDIT_DISTANCE:return e.QueryParser.parseEditDistance;case e.QueryLexer.BOOST:return e.QueryParser.parseBoost;case e.QueryLexer.PRESENCE:return t.nextClause(),e.QueryParser.parsePresence;default:var n=\"Unexpected lexeme type '\"+s.type+\"'\";throw new e.QueryParseError(n,s.start,s.end)}}},function(e,t){\"function\"==typeof define&&define.amd?define(t):\"object\"==typeof exports?module.exports=t():e.lunr=t()}(this,function(){return e})}();\n";
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/punycode.js/punycode.js
var require_punycode = __commonJS({
  "node_modules/punycode.js/punycode.js"(exports2, module2) {
    "use strict";
    var maxInt = 2147483647;
    var base = 36;
    var tMin = 1;
    var tMax = 26;
    var skew = 38;
    var damp = 700;
    var initialBias = 72;
    var initialN = 128;
    var delimiter = "-";
    var regexPunycode = /^xn--/;
    var regexNonASCII = /[^\0-\x7F]/;
    var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
    var errors = {
      "overflow": "Overflow: input needs wider integers to process",
      "not-basic": "Illegal input >= 0x80 (not a basic code point)",
      "invalid-input": "Invalid input"
    };
    var baseMinusTMin = base - tMin;
    var floor = Math.floor;
    var stringFromCharCode = String.fromCharCode;
    function error(type2) {
      throw new RangeError(errors[type2]);
    }
    function map2(array, callback) {
      const result = [];
      let length = array.length;
      while (length--) {
        result[length] = callback(array[length]);
      }
      return result;
    }
    function mapDomain(domain, callback) {
      const parts = domain.split("@");
      let result = "";
      if (parts.length > 1) {
        result = parts[0] + "@";
        domain = parts[1];
      }
      domain = domain.replace(regexSeparators, ".");
      const labels = domain.split(".");
      const encoded = map2(labels, callback).join(".");
      return result + encoded;
    }
    function ucs2decode(string) {
      const output = [];
      let counter = 0;
      const length = string.length;
      while (counter < length) {
        const value = string.charCodeAt(counter++);
        if (value >= 55296 && value <= 56319 && counter < length) {
          const extra = string.charCodeAt(counter++);
          if ((extra & 64512) == 56320) {
            output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
          } else {
            output.push(value);
            counter--;
          }
        } else {
          output.push(value);
        }
      }
      return output;
    }
    var ucs2encode = (codePoints) => String.fromCodePoint(...codePoints);
    var basicToDigit = function(codePoint) {
      if (codePoint >= 48 && codePoint < 58) {
        return 26 + (codePoint - 48);
      }
      if (codePoint >= 65 && codePoint < 91) {
        return codePoint - 65;
      }
      if (codePoint >= 97 && codePoint < 123) {
        return codePoint - 97;
      }
      return base;
    };
    var digitToBasic = function(digit, flag) {
      return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
    };
    var adapt = function(delta, numPoints, firstTime) {
      let k = 0;
      delta = firstTime ? floor(delta / damp) : delta >> 1;
      delta += floor(delta / numPoints);
      for (; delta > baseMinusTMin * tMax >> 1; k += base) {
        delta = floor(delta / baseMinusTMin);
      }
      return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
    };
    var decode2 = function(input) {
      const output = [];
      const inputLength = input.length;
      let i2 = 0;
      let n = initialN;
      let bias = initialBias;
      let basic = input.lastIndexOf(delimiter);
      if (basic < 0) {
        basic = 0;
      }
      for (let j = 0; j < basic; ++j) {
        if (input.charCodeAt(j) >= 128) {
          error("not-basic");
        }
        output.push(input.charCodeAt(j));
      }
      for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
        const oldi = i2;
        for (let w = 1, k = base; ; k += base) {
          if (index >= inputLength) {
            error("invalid-input");
          }
          const digit = basicToDigit(input.charCodeAt(index++));
          if (digit >= base) {
            error("invalid-input");
          }
          if (digit > floor((maxInt - i2) / w)) {
            error("overflow");
          }
          i2 += digit * w;
          const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (digit < t) {
            break;
          }
          const baseMinusT = base - t;
          if (w > floor(maxInt / baseMinusT)) {
            error("overflow");
          }
          w *= baseMinusT;
        }
        const out = output.length + 1;
        bias = adapt(i2 - oldi, out, oldi == 0);
        if (floor(i2 / out) > maxInt - n) {
          error("overflow");
        }
        n += floor(i2 / out);
        i2 %= out;
        output.splice(i2++, 0, n);
      }
      return String.fromCodePoint(...output);
    };
    var encode2 = function(input) {
      const output = [];
      input = ucs2decode(input);
      const inputLength = input.length;
      let n = initialN;
      let delta = 0;
      let bias = initialBias;
      for (const currentValue of input) {
        if (currentValue < 128) {
          output.push(stringFromCharCode(currentValue));
        }
      }
      const basicLength = output.length;
      let handledCPCount = basicLength;
      if (basicLength) {
        output.push(delimiter);
      }
      while (handledCPCount < inputLength) {
        let m = maxInt;
        for (const currentValue of input) {
          if (currentValue >= n && currentValue < m) {
            m = currentValue;
          }
        }
        const handledCPCountPlusOne = handledCPCount + 1;
        if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
          error("overflow");
        }
        delta += (m - n) * handledCPCountPlusOne;
        n = m;
        for (const currentValue of input) {
          if (currentValue < n && ++delta > maxInt) {
            error("overflow");
          }
          if (currentValue === n) {
            let q = delta;
            for (let k = base; ; k += base) {
              const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
              if (q < t) {
                break;
              }
              const qMinusT = q - t;
              const baseMinusT = base - t;
              output.push(
                stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
              );
              q = floor(qMinusT / baseMinusT);
            }
            output.push(stringFromCharCode(digitToBasic(q, 0)));
            bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
            delta = 0;
            ++handledCPCount;
          }
        }
        ++delta;
        ++n;
      }
      return output.join("");
    };
    var toUnicode = function(input) {
      return mapDomain(input, function(string) {
        return regexPunycode.test(string) ? decode2(string.slice(4).toLowerCase()) : string;
      });
    };
    var toASCII = function(input) {
      return mapDomain(input, function(string) {
        return regexNonASCII.test(string) ? "xn--" + encode2(string) : string;
      });
    };
    var punycode2 = {
      /**
       * A string representing the current Punycode.js version number.
       * @memberOf punycode
       * @type String
       */
      "version": "2.3.1",
      /**
       * An object of methods to convert from JavaScript's internal character
       * representation (UCS-2) to Unicode code points, and back.
       * @see <https://mathiasbynens.be/notes/javascript-encoding>
       * @memberOf punycode
       * @type Object
       */
      "ucs2": {
        "decode": ucs2decode,
        "encode": ucs2encode
      },
      "decode": decode2,
      "encode": encode2,
      "toASCII": toASCII,
      "toUnicode": toUnicode
    };
    module2.exports = punycode2;
  }
});

// node_modules/lunr/lunr.js
var require_lunr = __commonJS({
  "node_modules/lunr/lunr.js"(exports2, module2) {
    (function() {
      var lunr2 = function(config2) {
        var builder = new lunr2.Builder();
        builder.pipeline.add(
          lunr2.trimmer,
          lunr2.stopWordFilter,
          lunr2.stemmer
        );
        builder.searchPipeline.add(
          lunr2.stemmer
        );
        config2.call(builder, builder);
        return builder.build();
      };
      lunr2.version = "2.3.9";
      lunr2.utils = {};
      lunr2.utils.warn = /* @__PURE__ */ (function(global) {
        return function(message) {
          if (global.console && console.warn) {
            console.warn(message);
          }
        };
      })(this);
      lunr2.utils.asString = function(obj) {
        if (obj === void 0 || obj === null) {
          return "";
        } else {
          return obj.toString();
        }
      };
      lunr2.utils.clone = function(obj) {
        if (obj === null || obj === void 0) {
          return obj;
        }
        var clone = /* @__PURE__ */ Object.create(null), keys = Object.keys(obj);
        for (var i2 = 0; i2 < keys.length; i2++) {
          var key = keys[i2], val = obj[key];
          if (Array.isArray(val)) {
            clone[key] = val.slice();
            continue;
          }
          if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
            clone[key] = val;
            continue;
          }
          throw new TypeError("clone is not deep and does not support nested objects");
        }
        return clone;
      };
      lunr2.FieldRef = function(docRef, fieldName, stringValue) {
        this.docRef = docRef;
        this.fieldName = fieldName;
        this._stringValue = stringValue;
      };
      lunr2.FieldRef.joiner = "/";
      lunr2.FieldRef.fromString = function(s) {
        var n = s.indexOf(lunr2.FieldRef.joiner);
        if (n === -1) {
          throw "malformed field ref string";
        }
        var fieldRef = s.slice(0, n), docRef = s.slice(n + 1);
        return new lunr2.FieldRef(docRef, fieldRef, s);
      };
      lunr2.FieldRef.prototype.toString = function() {
        if (this._stringValue == void 0) {
          this._stringValue = this.fieldName + lunr2.FieldRef.joiner + this.docRef;
        }
        return this._stringValue;
      };
      lunr2.Set = function(elements) {
        this.elements = /* @__PURE__ */ Object.create(null);
        if (elements) {
          this.length = elements.length;
          for (var i2 = 0; i2 < this.length; i2++) {
            this.elements[elements[i2]] = true;
          }
        } else {
          this.length = 0;
        }
      };
      lunr2.Set.complete = {
        intersect: function(other) {
          return other;
        },
        union: function() {
          return this;
        },
        contains: function() {
          return true;
        }
      };
      lunr2.Set.empty = {
        intersect: function() {
          return this;
        },
        union: function(other) {
          return other;
        },
        contains: function() {
          return false;
        }
      };
      lunr2.Set.prototype.contains = function(object) {
        return !!this.elements[object];
      };
      lunr2.Set.prototype.intersect = function(other) {
        var a, b, elements, intersection = [];
        if (other === lunr2.Set.complete) {
          return this;
        }
        if (other === lunr2.Set.empty) {
          return other;
        }
        if (this.length < other.length) {
          a = this;
          b = other;
        } else {
          a = other;
          b = this;
        }
        elements = Object.keys(a.elements);
        for (var i2 = 0; i2 < elements.length; i2++) {
          var element = elements[i2];
          if (element in b.elements) {
            intersection.push(element);
          }
        }
        return new lunr2.Set(intersection);
      };
      lunr2.Set.prototype.union = function(other) {
        if (other === lunr2.Set.complete) {
          return lunr2.Set.complete;
        }
        if (other === lunr2.Set.empty) {
          return this;
        }
        return new lunr2.Set(Object.keys(this.elements).concat(Object.keys(other.elements)));
      };
      lunr2.idf = function(posting, documentCount) {
        var documentsWithTerm = 0;
        for (var fieldName in posting) {
          if (fieldName == "_index") continue;
          documentsWithTerm += Object.keys(posting[fieldName]).length;
        }
        var x = (documentCount - documentsWithTerm + 0.5) / (documentsWithTerm + 0.5);
        return Math.log(1 + Math.abs(x));
      };
      lunr2.Token = function(str2, metadata) {
        this.str = str2 || "";
        this.metadata = metadata || {};
      };
      lunr2.Token.prototype.toString = function() {
        return this.str;
      };
      lunr2.Token.prototype.update = function(fn) {
        this.str = fn(this.str, this.metadata);
        return this;
      };
      lunr2.Token.prototype.clone = function(fn) {
        fn = fn || function(s) {
          return s;
        };
        return new lunr2.Token(fn(this.str, this.metadata), this.metadata);
      };
      lunr2.tokenizer = function(obj, metadata) {
        if (obj == null || obj == void 0) {
          return [];
        }
        if (Array.isArray(obj)) {
          return obj.map(function(t) {
            return new lunr2.Token(
              lunr2.utils.asString(t).toLowerCase(),
              lunr2.utils.clone(metadata)
            );
          });
        }
        var str2 = obj.toString().toLowerCase(), len = str2.length, tokens = [];
        for (var sliceEnd = 0, sliceStart = 0; sliceEnd <= len; sliceEnd++) {
          var char = str2.charAt(sliceEnd), sliceLength = sliceEnd - sliceStart;
          if (char.match(lunr2.tokenizer.separator) || sliceEnd == len) {
            if (sliceLength > 0) {
              var tokenMetadata = lunr2.utils.clone(metadata) || {};
              tokenMetadata["position"] = [sliceStart, sliceLength];
              tokenMetadata["index"] = tokens.length;
              tokens.push(
                new lunr2.Token(
                  str2.slice(sliceStart, sliceEnd),
                  tokenMetadata
                )
              );
            }
            sliceStart = sliceEnd + 1;
          }
        }
        return tokens;
      };
      lunr2.tokenizer.separator = /[\s\-]+/;
      lunr2.Pipeline = function() {
        this._stack = [];
      };
      lunr2.Pipeline.registeredFunctions = /* @__PURE__ */ Object.create(null);
      lunr2.Pipeline.registerFunction = function(fn, label) {
        if (label in this.registeredFunctions) {
          lunr2.utils.warn("Overwriting existing registered function: " + label);
        }
        fn.label = label;
        lunr2.Pipeline.registeredFunctions[fn.label] = fn;
      };
      lunr2.Pipeline.warnIfFunctionNotRegistered = function(fn) {
        var isRegistered = fn.label && fn.label in this.registeredFunctions;
        if (!isRegistered) {
          lunr2.utils.warn("Function is not registered with pipeline. This may cause problems when serialising the index.\n", fn);
        }
      };
      lunr2.Pipeline.load = function(serialised) {
        var pipeline = new lunr2.Pipeline();
        serialised.forEach(function(fnName) {
          var fn = lunr2.Pipeline.registeredFunctions[fnName];
          if (fn) {
            pipeline.add(fn);
          } else {
            throw new Error("Cannot load unregistered function: " + fnName);
          }
        });
        return pipeline;
      };
      lunr2.Pipeline.prototype.add = function() {
        var fns = Array.prototype.slice.call(arguments);
        fns.forEach(function(fn) {
          lunr2.Pipeline.warnIfFunctionNotRegistered(fn);
          this._stack.push(fn);
        }, this);
      };
      lunr2.Pipeline.prototype.after = function(existingFn, newFn) {
        lunr2.Pipeline.warnIfFunctionNotRegistered(newFn);
        var pos = this._stack.indexOf(existingFn);
        if (pos == -1) {
          throw new Error("Cannot find existingFn");
        }
        pos = pos + 1;
        this._stack.splice(pos, 0, newFn);
      };
      lunr2.Pipeline.prototype.before = function(existingFn, newFn) {
        lunr2.Pipeline.warnIfFunctionNotRegistered(newFn);
        var pos = this._stack.indexOf(existingFn);
        if (pos == -1) {
          throw new Error("Cannot find existingFn");
        }
        this._stack.splice(pos, 0, newFn);
      };
      lunr2.Pipeline.prototype.remove = function(fn) {
        var pos = this._stack.indexOf(fn);
        if (pos == -1) {
          return;
        }
        this._stack.splice(pos, 1);
      };
      lunr2.Pipeline.prototype.run = function(tokens) {
        var stackLength = this._stack.length;
        for (var i2 = 0; i2 < stackLength; i2++) {
          var fn = this._stack[i2];
          var memo = [];
          for (var j = 0; j < tokens.length; j++) {
            var result = fn(tokens[j], j, tokens);
            if (result === null || result === void 0 || result === "") continue;
            if (Array.isArray(result)) {
              for (var k = 0; k < result.length; k++) {
                memo.push(result[k]);
              }
            } else {
              memo.push(result);
            }
          }
          tokens = memo;
        }
        return tokens;
      };
      lunr2.Pipeline.prototype.runString = function(str2, metadata) {
        var token = new lunr2.Token(str2, metadata);
        return this.run([token]).map(function(t) {
          return t.toString();
        });
      };
      lunr2.Pipeline.prototype.reset = function() {
        this._stack = [];
      };
      lunr2.Pipeline.prototype.toJSON = function() {
        return this._stack.map(function(fn) {
          lunr2.Pipeline.warnIfFunctionNotRegistered(fn);
          return fn.label;
        });
      };
      lunr2.Vector = function(elements) {
        this._magnitude = 0;
        this.elements = elements || [];
      };
      lunr2.Vector.prototype.positionForIndex = function(index) {
        if (this.elements.length == 0) {
          return 0;
        }
        var start = 0, end = this.elements.length / 2, sliceLength = end - start, pivotPoint = Math.floor(sliceLength / 2), pivotIndex = this.elements[pivotPoint * 2];
        while (sliceLength > 1) {
          if (pivotIndex < index) {
            start = pivotPoint;
          }
          if (pivotIndex > index) {
            end = pivotPoint;
          }
          if (pivotIndex == index) {
            break;
          }
          sliceLength = end - start;
          pivotPoint = start + Math.floor(sliceLength / 2);
          pivotIndex = this.elements[pivotPoint * 2];
        }
        if (pivotIndex == index) {
          return pivotPoint * 2;
        }
        if (pivotIndex > index) {
          return pivotPoint * 2;
        }
        if (pivotIndex < index) {
          return (pivotPoint + 1) * 2;
        }
      };
      lunr2.Vector.prototype.insert = function(insertIdx, val) {
        this.upsert(insertIdx, val, function() {
          throw "duplicate index";
        });
      };
      lunr2.Vector.prototype.upsert = function(insertIdx, val, fn) {
        this._magnitude = 0;
        var position = this.positionForIndex(insertIdx);
        if (this.elements[position] == insertIdx) {
          this.elements[position + 1] = fn(this.elements[position + 1], val);
        } else {
          this.elements.splice(position, 0, insertIdx, val);
        }
      };
      lunr2.Vector.prototype.magnitude = function() {
        if (this._magnitude) return this._magnitude;
        var sumOfSquares = 0, elementsLength = this.elements.length;
        for (var i2 = 1; i2 < elementsLength; i2 += 2) {
          var val = this.elements[i2];
          sumOfSquares += val * val;
        }
        return this._magnitude = Math.sqrt(sumOfSquares);
      };
      lunr2.Vector.prototype.dot = function(otherVector) {
        var dotProduct = 0, a = this.elements, b = otherVector.elements, aLen = a.length, bLen = b.length, aVal = 0, bVal = 0, i2 = 0, j = 0;
        while (i2 < aLen && j < bLen) {
          aVal = a[i2], bVal = b[j];
          if (aVal < bVal) {
            i2 += 2;
          } else if (aVal > bVal) {
            j += 2;
          } else if (aVal == bVal) {
            dotProduct += a[i2 + 1] * b[j + 1];
            i2 += 2;
            j += 2;
          }
        }
        return dotProduct;
      };
      lunr2.Vector.prototype.similarity = function(otherVector) {
        return this.dot(otherVector) / this.magnitude() || 0;
      };
      lunr2.Vector.prototype.toArray = function() {
        var output = new Array(this.elements.length / 2);
        for (var i2 = 1, j = 0; i2 < this.elements.length; i2 += 2, j++) {
          output[j] = this.elements[i2];
        }
        return output;
      };
      lunr2.Vector.prototype.toJSON = function() {
        return this.elements;
      };
      lunr2.stemmer = (function() {
        var step2list = {
          "ational": "ate",
          "tional": "tion",
          "enci": "ence",
          "anci": "ance",
          "izer": "ize",
          "bli": "ble",
          "alli": "al",
          "entli": "ent",
          "eli": "e",
          "ousli": "ous",
          "ization": "ize",
          "ation": "ate",
          "ator": "ate",
          "alism": "al",
          "iveness": "ive",
          "fulness": "ful",
          "ousness": "ous",
          "aliti": "al",
          "iviti": "ive",
          "biliti": "ble",
          "logi": "log"
        }, step3list = {
          "icate": "ic",
          "ative": "",
          "alize": "al",
          "iciti": "ic",
          "ical": "ic",
          "ful": "",
          "ness": ""
        }, c = "[^aeiou]", v = "[aeiouy]", C = c + "[^aeiouy]*", V = v + "[aeiou]*", mgr0 = "^(" + C + ")?" + V + C, meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$", mgr1 = "^(" + C + ")?" + V + C + V + C, s_v = "^(" + C + ")?" + v;
        var re_mgr0 = new RegExp(mgr0);
        var re_mgr1 = new RegExp(mgr1);
        var re_meq1 = new RegExp(meq1);
        var re_s_v = new RegExp(s_v);
        var re_1a = /^(.+?)(ss|i)es$/;
        var re2_1a = /^(.+?)([^s])s$/;
        var re_1b = /^(.+?)eed$/;
        var re2_1b = /^(.+?)(ed|ing)$/;
        var re_1b_2 = /.$/;
        var re2_1b_2 = /(at|bl|iz)$/;
        var re3_1b_2 = new RegExp("([^aeiouylsz])\\1$");
        var re4_1b_2 = new RegExp("^" + C + v + "[^aeiouwxy]$");
        var re_1c = /^(.+?[^aeiou])y$/;
        var re_2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
        var re_3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
        var re_4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
        var re2_4 = /^(.+?)(s|t)(ion)$/;
        var re_5 = /^(.+?)e$/;
        var re_5_1 = /ll$/;
        var re3_5 = new RegExp("^" + C + v + "[^aeiouwxy]$");
        var porterStemmer = function porterStemmer2(w) {
          var stem, suffix, firstch, re, re2, re3, re4;
          if (w.length < 3) {
            return w;
          }
          firstch = w.substr(0, 1);
          if (firstch == "y") {
            w = firstch.toUpperCase() + w.substr(1);
          }
          re = re_1a;
          re2 = re2_1a;
          if (re.test(w)) {
            w = w.replace(re, "$1$2");
          } else if (re2.test(w)) {
            w = w.replace(re2, "$1$2");
          }
          re = re_1b;
          re2 = re2_1b;
          if (re.test(w)) {
            var fp = re.exec(w);
            re = re_mgr0;
            if (re.test(fp[1])) {
              re = re_1b_2;
              w = w.replace(re, "");
            }
          } else if (re2.test(w)) {
            var fp = re2.exec(w);
            stem = fp[1];
            re2 = re_s_v;
            if (re2.test(stem)) {
              w = stem;
              re2 = re2_1b_2;
              re3 = re3_1b_2;
              re4 = re4_1b_2;
              if (re2.test(w)) {
                w = w + "e";
              } else if (re3.test(w)) {
                re = re_1b_2;
                w = w.replace(re, "");
              } else if (re4.test(w)) {
                w = w + "e";
              }
            }
          }
          re = re_1c;
          if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            w = stem + "i";
          }
          re = re_2;
          if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            suffix = fp[2];
            re = re_mgr0;
            if (re.test(stem)) {
              w = stem + step2list[suffix];
            }
          }
          re = re_3;
          if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            suffix = fp[2];
            re = re_mgr0;
            if (re.test(stem)) {
              w = stem + step3list[suffix];
            }
          }
          re = re_4;
          re2 = re2_4;
          if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            re = re_mgr1;
            if (re.test(stem)) {
              w = stem;
            }
          } else if (re2.test(w)) {
            var fp = re2.exec(w);
            stem = fp[1] + fp[2];
            re2 = re_mgr1;
            if (re2.test(stem)) {
              w = stem;
            }
          }
          re = re_5;
          if (re.test(w)) {
            var fp = re.exec(w);
            stem = fp[1];
            re = re_mgr1;
            re2 = re_meq1;
            re3 = re3_5;
            if (re.test(stem) || re2.test(stem) && !re3.test(stem)) {
              w = stem;
            }
          }
          re = re_5_1;
          re2 = re_mgr1;
          if (re.test(w) && re2.test(w)) {
            re = re_1b_2;
            w = w.replace(re, "");
          }
          if (firstch == "y") {
            w = firstch.toLowerCase() + w.substr(1);
          }
          return w;
        };
        return function(token) {
          return token.update(porterStemmer);
        };
      })();
      lunr2.Pipeline.registerFunction(lunr2.stemmer, "stemmer");
      lunr2.generateStopWordFilter = function(stopWords) {
        var words = stopWords.reduce(function(memo, stopWord) {
          memo[stopWord] = stopWord;
          return memo;
        }, {});
        return function(token) {
          if (token && words[token.toString()] !== token.toString()) return token;
        };
      };
      lunr2.stopWordFilter = lunr2.generateStopWordFilter([
        "a",
        "able",
        "about",
        "across",
        "after",
        "all",
        "almost",
        "also",
        "am",
        "among",
        "an",
        "and",
        "any",
        "are",
        "as",
        "at",
        "be",
        "because",
        "been",
        "but",
        "by",
        "can",
        "cannot",
        "could",
        "dear",
        "did",
        "do",
        "does",
        "either",
        "else",
        "ever",
        "every",
        "for",
        "from",
        "get",
        "got",
        "had",
        "has",
        "have",
        "he",
        "her",
        "hers",
        "him",
        "his",
        "how",
        "however",
        "i",
        "if",
        "in",
        "into",
        "is",
        "it",
        "its",
        "just",
        "least",
        "let",
        "like",
        "likely",
        "may",
        "me",
        "might",
        "most",
        "must",
        "my",
        "neither",
        "no",
        "nor",
        "not",
        "of",
        "off",
        "often",
        "on",
        "only",
        "or",
        "other",
        "our",
        "own",
        "rather",
        "said",
        "say",
        "says",
        "she",
        "should",
        "since",
        "so",
        "some",
        "than",
        "that",
        "the",
        "their",
        "them",
        "then",
        "there",
        "these",
        "they",
        "this",
        "tis",
        "to",
        "too",
        "twas",
        "us",
        "wants",
        "was",
        "we",
        "were",
        "what",
        "when",
        "where",
        "which",
        "while",
        "who",
        "whom",
        "why",
        "will",
        "with",
        "would",
        "yet",
        "you",
        "your"
      ]);
      lunr2.Pipeline.registerFunction(lunr2.stopWordFilter, "stopWordFilter");
      lunr2.trimmer = function(token) {
        return token.update(function(s) {
          return s.replace(/^\W+/, "").replace(/\W+$/, "");
        });
      };
      lunr2.Pipeline.registerFunction(lunr2.trimmer, "trimmer");
      lunr2.TokenSet = function() {
        this.final = false;
        this.edges = {};
        this.id = lunr2.TokenSet._nextId;
        lunr2.TokenSet._nextId += 1;
      };
      lunr2.TokenSet._nextId = 1;
      lunr2.TokenSet.fromArray = function(arr) {
        var builder = new lunr2.TokenSet.Builder();
        for (var i2 = 0, len = arr.length; i2 < len; i2++) {
          builder.insert(arr[i2]);
        }
        builder.finish();
        return builder.root;
      };
      lunr2.TokenSet.fromClause = function(clause) {
        if ("editDistance" in clause) {
          return lunr2.TokenSet.fromFuzzyString(clause.term, clause.editDistance);
        } else {
          return lunr2.TokenSet.fromString(clause.term);
        }
      };
      lunr2.TokenSet.fromFuzzyString = function(str2, editDistance) {
        var root = new lunr2.TokenSet();
        var stack = [{
          node: root,
          editsRemaining: editDistance,
          str: str2
        }];
        while (stack.length) {
          var frame = stack.pop();
          if (frame.str.length > 0) {
            var char = frame.str.charAt(0), noEditNode;
            if (char in frame.node.edges) {
              noEditNode = frame.node.edges[char];
            } else {
              noEditNode = new lunr2.TokenSet();
              frame.node.edges[char] = noEditNode;
            }
            if (frame.str.length == 1) {
              noEditNode.final = true;
            }
            stack.push({
              node: noEditNode,
              editsRemaining: frame.editsRemaining,
              str: frame.str.slice(1)
            });
          }
          if (frame.editsRemaining == 0) {
            continue;
          }
          if ("*" in frame.node.edges) {
            var insertionNode = frame.node.edges["*"];
          } else {
            var insertionNode = new lunr2.TokenSet();
            frame.node.edges["*"] = insertionNode;
          }
          if (frame.str.length == 0) {
            insertionNode.final = true;
          }
          stack.push({
            node: insertionNode,
            editsRemaining: frame.editsRemaining - 1,
            str: frame.str
          });
          if (frame.str.length > 1) {
            stack.push({
              node: frame.node,
              editsRemaining: frame.editsRemaining - 1,
              str: frame.str.slice(1)
            });
          }
          if (frame.str.length == 1) {
            frame.node.final = true;
          }
          if (frame.str.length >= 1) {
            if ("*" in frame.node.edges) {
              var substitutionNode = frame.node.edges["*"];
            } else {
              var substitutionNode = new lunr2.TokenSet();
              frame.node.edges["*"] = substitutionNode;
            }
            if (frame.str.length == 1) {
              substitutionNode.final = true;
            }
            stack.push({
              node: substitutionNode,
              editsRemaining: frame.editsRemaining - 1,
              str: frame.str.slice(1)
            });
          }
          if (frame.str.length > 1) {
            var charA = frame.str.charAt(0), charB = frame.str.charAt(1), transposeNode;
            if (charB in frame.node.edges) {
              transposeNode = frame.node.edges[charB];
            } else {
              transposeNode = new lunr2.TokenSet();
              frame.node.edges[charB] = transposeNode;
            }
            if (frame.str.length == 1) {
              transposeNode.final = true;
            }
            stack.push({
              node: transposeNode,
              editsRemaining: frame.editsRemaining - 1,
              str: charA + frame.str.slice(2)
            });
          }
        }
        return root;
      };
      lunr2.TokenSet.fromString = function(str2) {
        var node = new lunr2.TokenSet(), root = node;
        for (var i2 = 0, len = str2.length; i2 < len; i2++) {
          var char = str2[i2], final = i2 == len - 1;
          if (char == "*") {
            node.edges[char] = node;
            node.final = final;
          } else {
            var next = new lunr2.TokenSet();
            next.final = final;
            node.edges[char] = next;
            node = next;
          }
        }
        return root;
      };
      lunr2.TokenSet.prototype.toArray = function() {
        var words = [];
        var stack = [{
          prefix: "",
          node: this
        }];
        while (stack.length) {
          var frame = stack.pop(), edges = Object.keys(frame.node.edges), len = edges.length;
          if (frame.node.final) {
            frame.prefix.charAt(0);
            words.push(frame.prefix);
          }
          for (var i2 = 0; i2 < len; i2++) {
            var edge = edges[i2];
            stack.push({
              prefix: frame.prefix.concat(edge),
              node: frame.node.edges[edge]
            });
          }
        }
        return words;
      };
      lunr2.TokenSet.prototype.toString = function() {
        if (this._str) {
          return this._str;
        }
        var str2 = this.final ? "1" : "0", labels = Object.keys(this.edges).sort(), len = labels.length;
        for (var i2 = 0; i2 < len; i2++) {
          var label = labels[i2], node = this.edges[label];
          str2 = str2 + label + node.id;
        }
        return str2;
      };
      lunr2.TokenSet.prototype.intersect = function(b) {
        var output = new lunr2.TokenSet(), frame = void 0;
        var stack = [{
          qNode: b,
          output,
          node: this
        }];
        while (stack.length) {
          frame = stack.pop();
          var qEdges = Object.keys(frame.qNode.edges), qLen = qEdges.length, nEdges = Object.keys(frame.node.edges), nLen = nEdges.length;
          for (var q = 0; q < qLen; q++) {
            var qEdge = qEdges[q];
            for (var n = 0; n < nLen; n++) {
              var nEdge = nEdges[n];
              if (nEdge == qEdge || qEdge == "*") {
                var node = frame.node.edges[nEdge], qNode = frame.qNode.edges[qEdge], final = node.final && qNode.final, next = void 0;
                if (nEdge in frame.output.edges) {
                  next = frame.output.edges[nEdge];
                  next.final = next.final || final;
                } else {
                  next = new lunr2.TokenSet();
                  next.final = final;
                  frame.output.edges[nEdge] = next;
                }
                stack.push({
                  qNode,
                  output: next,
                  node
                });
              }
            }
          }
        }
        return output;
      };
      lunr2.TokenSet.Builder = function() {
        this.previousWord = "";
        this.root = new lunr2.TokenSet();
        this.uncheckedNodes = [];
        this.minimizedNodes = {};
      };
      lunr2.TokenSet.Builder.prototype.insert = function(word) {
        var node, commonPrefix = 0;
        if (word < this.previousWord) {
          throw new Error("Out of order word insertion");
        }
        for (var i2 = 0; i2 < word.length && i2 < this.previousWord.length; i2++) {
          if (word[i2] != this.previousWord[i2]) break;
          commonPrefix++;
        }
        this.minimize(commonPrefix);
        if (this.uncheckedNodes.length == 0) {
          node = this.root;
        } else {
          node = this.uncheckedNodes[this.uncheckedNodes.length - 1].child;
        }
        for (var i2 = commonPrefix; i2 < word.length; i2++) {
          var nextNode = new lunr2.TokenSet(), char = word[i2];
          node.edges[char] = nextNode;
          this.uncheckedNodes.push({
            parent: node,
            char,
            child: nextNode
          });
          node = nextNode;
        }
        node.final = true;
        this.previousWord = word;
      };
      lunr2.TokenSet.Builder.prototype.finish = function() {
        this.minimize(0);
      };
      lunr2.TokenSet.Builder.prototype.minimize = function(downTo) {
        for (var i2 = this.uncheckedNodes.length - 1; i2 >= downTo; i2--) {
          var node = this.uncheckedNodes[i2], childKey = node.child.toString();
          if (childKey in this.minimizedNodes) {
            node.parent.edges[node.char] = this.minimizedNodes[childKey];
          } else {
            node.child._str = childKey;
            this.minimizedNodes[childKey] = node.child;
          }
          this.uncheckedNodes.pop();
        }
      };
      lunr2.Index = function(attrs) {
        this.invertedIndex = attrs.invertedIndex;
        this.fieldVectors = attrs.fieldVectors;
        this.tokenSet = attrs.tokenSet;
        this.fields = attrs.fields;
        this.pipeline = attrs.pipeline;
      };
      lunr2.Index.prototype.search = function(queryString) {
        return this.query(function(query) {
          var parser = new lunr2.QueryParser(queryString, query);
          parser.parse();
        });
      };
      lunr2.Index.prototype.query = function(fn) {
        var query = new lunr2.Query(this.fields), matchingFields = /* @__PURE__ */ Object.create(null), queryVectors = /* @__PURE__ */ Object.create(null), termFieldCache = /* @__PURE__ */ Object.create(null), requiredMatches = /* @__PURE__ */ Object.create(null), prohibitedMatches = /* @__PURE__ */ Object.create(null);
        for (var i2 = 0; i2 < this.fields.length; i2++) {
          queryVectors[this.fields[i2]] = new lunr2.Vector();
        }
        fn.call(query, query);
        for (var i2 = 0; i2 < query.clauses.length; i2++) {
          var clause = query.clauses[i2], terms = null, clauseMatches = lunr2.Set.empty;
          if (clause.usePipeline) {
            terms = this.pipeline.runString(clause.term, {
              fields: clause.fields
            });
          } else {
            terms = [clause.term];
          }
          for (var m = 0; m < terms.length; m++) {
            var term = terms[m];
            clause.term = term;
            var termTokenSet = lunr2.TokenSet.fromClause(clause), expandedTerms = this.tokenSet.intersect(termTokenSet).toArray();
            if (expandedTerms.length === 0 && clause.presence === lunr2.Query.presence.REQUIRED) {
              for (var k = 0; k < clause.fields.length; k++) {
                var field = clause.fields[k];
                requiredMatches[field] = lunr2.Set.empty;
              }
              break;
            }
            for (var j = 0; j < expandedTerms.length; j++) {
              var expandedTerm = expandedTerms[j], posting = this.invertedIndex[expandedTerm], termIndex = posting._index;
              for (var k = 0; k < clause.fields.length; k++) {
                var field = clause.fields[k], fieldPosting = posting[field], matchingDocumentRefs = Object.keys(fieldPosting), termField = expandedTerm + "/" + field, matchingDocumentsSet = new lunr2.Set(matchingDocumentRefs);
                if (clause.presence == lunr2.Query.presence.REQUIRED) {
                  clauseMatches = clauseMatches.union(matchingDocumentsSet);
                  if (requiredMatches[field] === void 0) {
                    requiredMatches[field] = lunr2.Set.complete;
                  }
                }
                if (clause.presence == lunr2.Query.presence.PROHIBITED) {
                  if (prohibitedMatches[field] === void 0) {
                    prohibitedMatches[field] = lunr2.Set.empty;
                  }
                  prohibitedMatches[field] = prohibitedMatches[field].union(matchingDocumentsSet);
                  continue;
                }
                queryVectors[field].upsert(termIndex, clause.boost, function(a, b) {
                  return a + b;
                });
                if (termFieldCache[termField]) {
                  continue;
                }
                for (var l = 0; l < matchingDocumentRefs.length; l++) {
                  var matchingDocumentRef = matchingDocumentRefs[l], matchingFieldRef = new lunr2.FieldRef(matchingDocumentRef, field), metadata = fieldPosting[matchingDocumentRef], fieldMatch;
                  if ((fieldMatch = matchingFields[matchingFieldRef]) === void 0) {
                    matchingFields[matchingFieldRef] = new lunr2.MatchData(expandedTerm, field, metadata);
                  } else {
                    fieldMatch.add(expandedTerm, field, metadata);
                  }
                }
                termFieldCache[termField] = true;
              }
            }
          }
          if (clause.presence === lunr2.Query.presence.REQUIRED) {
            for (var k = 0; k < clause.fields.length; k++) {
              var field = clause.fields[k];
              requiredMatches[field] = requiredMatches[field].intersect(clauseMatches);
            }
          }
        }
        var allRequiredMatches = lunr2.Set.complete, allProhibitedMatches = lunr2.Set.empty;
        for (var i2 = 0; i2 < this.fields.length; i2++) {
          var field = this.fields[i2];
          if (requiredMatches[field]) {
            allRequiredMatches = allRequiredMatches.intersect(requiredMatches[field]);
          }
          if (prohibitedMatches[field]) {
            allProhibitedMatches = allProhibitedMatches.union(prohibitedMatches[field]);
          }
        }
        var matchingFieldRefs = Object.keys(matchingFields), results = [], matches = /* @__PURE__ */ Object.create(null);
        if (query.isNegated()) {
          matchingFieldRefs = Object.keys(this.fieldVectors);
          for (var i2 = 0; i2 < matchingFieldRefs.length; i2++) {
            var matchingFieldRef = matchingFieldRefs[i2];
            var fieldRef = lunr2.FieldRef.fromString(matchingFieldRef);
            matchingFields[matchingFieldRef] = new lunr2.MatchData();
          }
        }
        for (var i2 = 0; i2 < matchingFieldRefs.length; i2++) {
          var fieldRef = lunr2.FieldRef.fromString(matchingFieldRefs[i2]), docRef = fieldRef.docRef;
          if (!allRequiredMatches.contains(docRef)) {
            continue;
          }
          if (allProhibitedMatches.contains(docRef)) {
            continue;
          }
          var fieldVector = this.fieldVectors[fieldRef], score = queryVectors[fieldRef.fieldName].similarity(fieldVector), docMatch;
          if ((docMatch = matches[docRef]) !== void 0) {
            docMatch.score += score;
            docMatch.matchData.combine(matchingFields[fieldRef]);
          } else {
            var match2 = {
              ref: docRef,
              score,
              matchData: matchingFields[fieldRef]
            };
            matches[docRef] = match2;
            results.push(match2);
          }
        }
        return results.sort(function(a, b) {
          return b.score - a.score;
        });
      };
      lunr2.Index.prototype.toJSON = function() {
        var invertedIndex = Object.keys(this.invertedIndex).sort().map(function(term) {
          return [term, this.invertedIndex[term]];
        }, this);
        var fieldVectors = Object.keys(this.fieldVectors).map(function(ref) {
          return [ref, this.fieldVectors[ref].toJSON()];
        }, this);
        return {
          version: lunr2.version,
          fields: this.fields,
          fieldVectors,
          invertedIndex,
          pipeline: this.pipeline.toJSON()
        };
      };
      lunr2.Index.load = function(serializedIndex) {
        var attrs = {}, fieldVectors = {}, serializedVectors = serializedIndex.fieldVectors, invertedIndex = /* @__PURE__ */ Object.create(null), serializedInvertedIndex = serializedIndex.invertedIndex, tokenSetBuilder = new lunr2.TokenSet.Builder(), pipeline = lunr2.Pipeline.load(serializedIndex.pipeline);
        if (serializedIndex.version != lunr2.version) {
          lunr2.utils.warn("Version mismatch when loading serialised index. Current version of lunr '" + lunr2.version + "' does not match serialized index '" + serializedIndex.version + "'");
        }
        for (var i2 = 0; i2 < serializedVectors.length; i2++) {
          var tuple = serializedVectors[i2], ref = tuple[0], elements = tuple[1];
          fieldVectors[ref] = new lunr2.Vector(elements);
        }
        for (var i2 = 0; i2 < serializedInvertedIndex.length; i2++) {
          var tuple = serializedInvertedIndex[i2], term = tuple[0], posting = tuple[1];
          tokenSetBuilder.insert(term);
          invertedIndex[term] = posting;
        }
        tokenSetBuilder.finish();
        attrs.fields = serializedIndex.fields;
        attrs.fieldVectors = fieldVectors;
        attrs.invertedIndex = invertedIndex;
        attrs.tokenSet = tokenSetBuilder.root;
        attrs.pipeline = pipeline;
        return new lunr2.Index(attrs);
      };
      lunr2.Builder = function() {
        this._ref = "id";
        this._fields = /* @__PURE__ */ Object.create(null);
        this._documents = /* @__PURE__ */ Object.create(null);
        this.invertedIndex = /* @__PURE__ */ Object.create(null);
        this.fieldTermFrequencies = {};
        this.fieldLengths = {};
        this.tokenizer = lunr2.tokenizer;
        this.pipeline = new lunr2.Pipeline();
        this.searchPipeline = new lunr2.Pipeline();
        this.documentCount = 0;
        this._b = 0.75;
        this._k1 = 1.2;
        this.termIndex = 0;
        this.metadataWhitelist = [];
      };
      lunr2.Builder.prototype.ref = function(ref) {
        this._ref = ref;
      };
      lunr2.Builder.prototype.field = function(fieldName, attributes) {
        if (/\//.test(fieldName)) {
          throw new RangeError("Field '" + fieldName + "' contains illegal character '/'");
        }
        this._fields[fieldName] = attributes || {};
      };
      lunr2.Builder.prototype.b = function(number) {
        if (number < 0) {
          this._b = 0;
        } else if (number > 1) {
          this._b = 1;
        } else {
          this._b = number;
        }
      };
      lunr2.Builder.prototype.k1 = function(number) {
        this._k1 = number;
      };
      lunr2.Builder.prototype.add = function(doc, attributes) {
        var docRef = doc[this._ref], fields = Object.keys(this._fields);
        this._documents[docRef] = attributes || {};
        this.documentCount += 1;
        for (var i2 = 0; i2 < fields.length; i2++) {
          var fieldName = fields[i2], extractor = this._fields[fieldName].extractor, field = extractor ? extractor(doc) : doc[fieldName], tokens = this.tokenizer(field, {
            fields: [fieldName]
          }), terms = this.pipeline.run(tokens), fieldRef = new lunr2.FieldRef(docRef, fieldName), fieldTerms = /* @__PURE__ */ Object.create(null);
          this.fieldTermFrequencies[fieldRef] = fieldTerms;
          this.fieldLengths[fieldRef] = 0;
          this.fieldLengths[fieldRef] += terms.length;
          for (var j = 0; j < terms.length; j++) {
            var term = terms[j];
            if (fieldTerms[term] == void 0) {
              fieldTerms[term] = 0;
            }
            fieldTerms[term] += 1;
            if (this.invertedIndex[term] == void 0) {
              var posting = /* @__PURE__ */ Object.create(null);
              posting["_index"] = this.termIndex;
              this.termIndex += 1;
              for (var k = 0; k < fields.length; k++) {
                posting[fields[k]] = /* @__PURE__ */ Object.create(null);
              }
              this.invertedIndex[term] = posting;
            }
            if (this.invertedIndex[term][fieldName][docRef] == void 0) {
              this.invertedIndex[term][fieldName][docRef] = /* @__PURE__ */ Object.create(null);
            }
            for (var l = 0; l < this.metadataWhitelist.length; l++) {
              var metadataKey = this.metadataWhitelist[l], metadata = term.metadata[metadataKey];
              if (this.invertedIndex[term][fieldName][docRef][metadataKey] == void 0) {
                this.invertedIndex[term][fieldName][docRef][metadataKey] = [];
              }
              this.invertedIndex[term][fieldName][docRef][metadataKey].push(metadata);
            }
          }
        }
      };
      lunr2.Builder.prototype.calculateAverageFieldLengths = function() {
        var fieldRefs = Object.keys(this.fieldLengths), numberOfFields = fieldRefs.length, accumulator = {}, documentsWithField = {};
        for (var i2 = 0; i2 < numberOfFields; i2++) {
          var fieldRef = lunr2.FieldRef.fromString(fieldRefs[i2]), field = fieldRef.fieldName;
          documentsWithField[field] || (documentsWithField[field] = 0);
          documentsWithField[field] += 1;
          accumulator[field] || (accumulator[field] = 0);
          accumulator[field] += this.fieldLengths[fieldRef];
        }
        var fields = Object.keys(this._fields);
        for (var i2 = 0; i2 < fields.length; i2++) {
          var fieldName = fields[i2];
          accumulator[fieldName] = accumulator[fieldName] / documentsWithField[fieldName];
        }
        this.averageFieldLength = accumulator;
      };
      lunr2.Builder.prototype.createFieldVectors = function() {
        var fieldVectors = {}, fieldRefs = Object.keys(this.fieldTermFrequencies), fieldRefsLength = fieldRefs.length, termIdfCache = /* @__PURE__ */ Object.create(null);
        for (var i2 = 0; i2 < fieldRefsLength; i2++) {
          var fieldRef = lunr2.FieldRef.fromString(fieldRefs[i2]), fieldName = fieldRef.fieldName, fieldLength = this.fieldLengths[fieldRef], fieldVector = new lunr2.Vector(), termFrequencies = this.fieldTermFrequencies[fieldRef], terms = Object.keys(termFrequencies), termsLength = terms.length;
          var fieldBoost = this._fields[fieldName].boost || 1, docBoost = this._documents[fieldRef.docRef].boost || 1;
          for (var j = 0; j < termsLength; j++) {
            var term = terms[j], tf = termFrequencies[term], termIndex = this.invertedIndex[term]._index, idf, score, scoreWithPrecision;
            if (termIdfCache[term] === void 0) {
              idf = lunr2.idf(this.invertedIndex[term], this.documentCount);
              termIdfCache[term] = idf;
            } else {
              idf = termIdfCache[term];
            }
            score = idf * ((this._k1 + 1) * tf) / (this._k1 * (1 - this._b + this._b * (fieldLength / this.averageFieldLength[fieldName])) + tf);
            score *= fieldBoost;
            score *= docBoost;
            scoreWithPrecision = Math.round(score * 1e3) / 1e3;
            fieldVector.insert(termIndex, scoreWithPrecision);
          }
          fieldVectors[fieldRef] = fieldVector;
        }
        this.fieldVectors = fieldVectors;
      };
      lunr2.Builder.prototype.createTokenSet = function() {
        this.tokenSet = lunr2.TokenSet.fromArray(
          Object.keys(this.invertedIndex).sort()
        );
      };
      lunr2.Builder.prototype.build = function() {
        this.calculateAverageFieldLengths();
        this.createFieldVectors();
        this.createTokenSet();
        return new lunr2.Index({
          invertedIndex: this.invertedIndex,
          fieldVectors: this.fieldVectors,
          tokenSet: this.tokenSet,
          fields: Object.keys(this._fields),
          pipeline: this.searchPipeline
        });
      };
      lunr2.Builder.prototype.use = function(fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        args.unshift(this);
        fn.apply(this, args);
      };
      lunr2.MatchData = function(term, field, metadata) {
        var clonedMetadata = /* @__PURE__ */ Object.create(null), metadataKeys = Object.keys(metadata || {});
        for (var i2 = 0; i2 < metadataKeys.length; i2++) {
          var key = metadataKeys[i2];
          clonedMetadata[key] = metadata[key].slice();
        }
        this.metadata = /* @__PURE__ */ Object.create(null);
        if (term !== void 0) {
          this.metadata[term] = /* @__PURE__ */ Object.create(null);
          this.metadata[term][field] = clonedMetadata;
        }
      };
      lunr2.MatchData.prototype.combine = function(otherMatchData) {
        var terms = Object.keys(otherMatchData.metadata);
        for (var i2 = 0; i2 < terms.length; i2++) {
          var term = terms[i2], fields = Object.keys(otherMatchData.metadata[term]);
          if (this.metadata[term] == void 0) {
            this.metadata[term] = /* @__PURE__ */ Object.create(null);
          }
          for (var j = 0; j < fields.length; j++) {
            var field = fields[j], keys = Object.keys(otherMatchData.metadata[term][field]);
            if (this.metadata[term][field] == void 0) {
              this.metadata[term][field] = /* @__PURE__ */ Object.create(null);
            }
            for (var k = 0; k < keys.length; k++) {
              var key = keys[k];
              if (this.metadata[term][field][key] == void 0) {
                this.metadata[term][field][key] = otherMatchData.metadata[term][field][key];
              } else {
                this.metadata[term][field][key] = this.metadata[term][field][key].concat(otherMatchData.metadata[term][field][key]);
              }
            }
          }
        }
      };
      lunr2.MatchData.prototype.add = function(term, field, metadata) {
        if (!(term in this.metadata)) {
          this.metadata[term] = /* @__PURE__ */ Object.create(null);
          this.metadata[term][field] = metadata;
          return;
        }
        if (!(field in this.metadata[term])) {
          this.metadata[term][field] = metadata;
          return;
        }
        var metadataKeys = Object.keys(metadata);
        for (var i2 = 0; i2 < metadataKeys.length; i2++) {
          var key = metadataKeys[i2];
          if (key in this.metadata[term][field]) {
            this.metadata[term][field][key] = this.metadata[term][field][key].concat(metadata[key]);
          } else {
            this.metadata[term][field][key] = metadata[key];
          }
        }
      };
      lunr2.Query = function(allFields) {
        this.clauses = [];
        this.allFields = allFields;
      };
      lunr2.Query.wildcard = new String("*");
      lunr2.Query.wildcard.NONE = 0;
      lunr2.Query.wildcard.LEADING = 1;
      lunr2.Query.wildcard.TRAILING = 2;
      lunr2.Query.presence = {
        /**
         * Term's presence in a document is optional, this is the default value.
         */
        OPTIONAL: 1,
        /**
         * Term's presence in a document is required, documents that do not contain
         * this term will not be returned.
         */
        REQUIRED: 2,
        /**
         * Term's presence in a document is prohibited, documents that do contain
         * this term will not be returned.
         */
        PROHIBITED: 3
      };
      lunr2.Query.prototype.clause = function(clause) {
        if (!("fields" in clause)) {
          clause.fields = this.allFields;
        }
        if (!("boost" in clause)) {
          clause.boost = 1;
        }
        if (!("usePipeline" in clause)) {
          clause.usePipeline = true;
        }
        if (!("wildcard" in clause)) {
          clause.wildcard = lunr2.Query.wildcard.NONE;
        }
        if (clause.wildcard & lunr2.Query.wildcard.LEADING && clause.term.charAt(0) != lunr2.Query.wildcard) {
          clause.term = "*" + clause.term;
        }
        if (clause.wildcard & lunr2.Query.wildcard.TRAILING && clause.term.slice(-1) != lunr2.Query.wildcard) {
          clause.term = "" + clause.term + "*";
        }
        if (!("presence" in clause)) {
          clause.presence = lunr2.Query.presence.OPTIONAL;
        }
        this.clauses.push(clause);
        return this;
      };
      lunr2.Query.prototype.isNegated = function() {
        for (var i2 = 0; i2 < this.clauses.length; i2++) {
          if (this.clauses[i2].presence != lunr2.Query.presence.PROHIBITED) {
            return false;
          }
        }
        return true;
      };
      lunr2.Query.prototype.term = function(term, options) {
        if (Array.isArray(term)) {
          term.forEach(function(t) {
            this.term(t, lunr2.utils.clone(options));
          }, this);
          return this;
        }
        var clause = options || {};
        clause.term = term.toString();
        this.clause(clause);
        return this;
      };
      lunr2.QueryParseError = function(message, start, end) {
        this.name = "QueryParseError";
        this.message = message;
        this.start = start;
        this.end = end;
      };
      lunr2.QueryParseError.prototype = new Error();
      lunr2.QueryLexer = function(str2) {
        this.lexemes = [];
        this.str = str2;
        this.length = str2.length;
        this.pos = 0;
        this.start = 0;
        this.escapeCharPositions = [];
      };
      lunr2.QueryLexer.prototype.run = function() {
        var state = lunr2.QueryLexer.lexText;
        while (state) {
          state = state(this);
        }
      };
      lunr2.QueryLexer.prototype.sliceString = function() {
        var subSlices = [], sliceStart = this.start, sliceEnd = this.pos;
        for (var i2 = 0; i2 < this.escapeCharPositions.length; i2++) {
          sliceEnd = this.escapeCharPositions[i2];
          subSlices.push(this.str.slice(sliceStart, sliceEnd));
          sliceStart = sliceEnd + 1;
        }
        subSlices.push(this.str.slice(sliceStart, this.pos));
        this.escapeCharPositions.length = 0;
        return subSlices.join("");
      };
      lunr2.QueryLexer.prototype.emit = function(type2) {
        this.lexemes.push({
          type: type2,
          str: this.sliceString(),
          start: this.start,
          end: this.pos
        });
        this.start = this.pos;
      };
      lunr2.QueryLexer.prototype.escapeCharacter = function() {
        this.escapeCharPositions.push(this.pos - 1);
        this.pos += 1;
      };
      lunr2.QueryLexer.prototype.next = function() {
        if (this.pos >= this.length) {
          return lunr2.QueryLexer.EOS;
        }
        var char = this.str.charAt(this.pos);
        this.pos += 1;
        return char;
      };
      lunr2.QueryLexer.prototype.width = function() {
        return this.pos - this.start;
      };
      lunr2.QueryLexer.prototype.ignore = function() {
        if (this.start == this.pos) {
          this.pos += 1;
        }
        this.start = this.pos;
      };
      lunr2.QueryLexer.prototype.backup = function() {
        this.pos -= 1;
      };
      lunr2.QueryLexer.prototype.acceptDigitRun = function() {
        var char, charCode;
        do {
          char = this.next();
          charCode = char.charCodeAt(0);
        } while (charCode > 47 && charCode < 58);
        if (char != lunr2.QueryLexer.EOS) {
          this.backup();
        }
      };
      lunr2.QueryLexer.prototype.more = function() {
        return this.pos < this.length;
      };
      lunr2.QueryLexer.EOS = "EOS";
      lunr2.QueryLexer.FIELD = "FIELD";
      lunr2.QueryLexer.TERM = "TERM";
      lunr2.QueryLexer.EDIT_DISTANCE = "EDIT_DISTANCE";
      lunr2.QueryLexer.BOOST = "BOOST";
      lunr2.QueryLexer.PRESENCE = "PRESENCE";
      lunr2.QueryLexer.lexField = function(lexer) {
        lexer.backup();
        lexer.emit(lunr2.QueryLexer.FIELD);
        lexer.ignore();
        return lunr2.QueryLexer.lexText;
      };
      lunr2.QueryLexer.lexTerm = function(lexer) {
        if (lexer.width() > 1) {
          lexer.backup();
          lexer.emit(lunr2.QueryLexer.TERM);
        }
        lexer.ignore();
        if (lexer.more()) {
          return lunr2.QueryLexer.lexText;
        }
      };
      lunr2.QueryLexer.lexEditDistance = function(lexer) {
        lexer.ignore();
        lexer.acceptDigitRun();
        lexer.emit(lunr2.QueryLexer.EDIT_DISTANCE);
        return lunr2.QueryLexer.lexText;
      };
      lunr2.QueryLexer.lexBoost = function(lexer) {
        lexer.ignore();
        lexer.acceptDigitRun();
        lexer.emit(lunr2.QueryLexer.BOOST);
        return lunr2.QueryLexer.lexText;
      };
      lunr2.QueryLexer.lexEOS = function(lexer) {
        if (lexer.width() > 0) {
          lexer.emit(lunr2.QueryLexer.TERM);
        }
      };
      lunr2.QueryLexer.termSeparator = lunr2.tokenizer.separator;
      lunr2.QueryLexer.lexText = function(lexer) {
        while (true) {
          var char = lexer.next();
          if (char == lunr2.QueryLexer.EOS) {
            return lunr2.QueryLexer.lexEOS;
          }
          if (char.charCodeAt(0) == 92) {
            lexer.escapeCharacter();
            continue;
          }
          if (char == ":") {
            return lunr2.QueryLexer.lexField;
          }
          if (char == "~") {
            lexer.backup();
            if (lexer.width() > 0) {
              lexer.emit(lunr2.QueryLexer.TERM);
            }
            return lunr2.QueryLexer.lexEditDistance;
          }
          if (char == "^") {
            lexer.backup();
            if (lexer.width() > 0) {
              lexer.emit(lunr2.QueryLexer.TERM);
            }
            return lunr2.QueryLexer.lexBoost;
          }
          if (char == "+" && lexer.width() === 1) {
            lexer.emit(lunr2.QueryLexer.PRESENCE);
            return lunr2.QueryLexer.lexText;
          }
          if (char == "-" && lexer.width() === 1) {
            lexer.emit(lunr2.QueryLexer.PRESENCE);
            return lunr2.QueryLexer.lexText;
          }
          if (char.match(lunr2.QueryLexer.termSeparator)) {
            return lunr2.QueryLexer.lexTerm;
          }
        }
      };
      lunr2.QueryParser = function(str2, query) {
        this.lexer = new lunr2.QueryLexer(str2);
        this.query = query;
        this.currentClause = {};
        this.lexemeIdx = 0;
      };
      lunr2.QueryParser.prototype.parse = function() {
        this.lexer.run();
        this.lexemes = this.lexer.lexemes;
        var state = lunr2.QueryParser.parseClause;
        while (state) {
          state = state(this);
        }
        return this.query;
      };
      lunr2.QueryParser.prototype.peekLexeme = function() {
        return this.lexemes[this.lexemeIdx];
      };
      lunr2.QueryParser.prototype.consumeLexeme = function() {
        var lexeme = this.peekLexeme();
        this.lexemeIdx += 1;
        return lexeme;
      };
      lunr2.QueryParser.prototype.nextClause = function() {
        var completedClause = this.currentClause;
        this.query.clause(completedClause);
        this.currentClause = {};
      };
      lunr2.QueryParser.parseClause = function(parser) {
        var lexeme = parser.peekLexeme();
        if (lexeme == void 0) {
          return;
        }
        switch (lexeme.type) {
          case lunr2.QueryLexer.PRESENCE:
            return lunr2.QueryParser.parsePresence;
          case lunr2.QueryLexer.FIELD:
            return lunr2.QueryParser.parseField;
          case lunr2.QueryLexer.TERM:
            return lunr2.QueryParser.parseTerm;
          default:
            var errorMessage = "expected either a field or a term, found " + lexeme.type;
            if (lexeme.str.length >= 1) {
              errorMessage += " with value '" + lexeme.str + "'";
            }
            throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
      };
      lunr2.QueryParser.parsePresence = function(parser) {
        var lexeme = parser.consumeLexeme();
        if (lexeme == void 0) {
          return;
        }
        switch (lexeme.str) {
          case "-":
            parser.currentClause.presence = lunr2.Query.presence.PROHIBITED;
            break;
          case "+":
            parser.currentClause.presence = lunr2.Query.presence.REQUIRED;
            break;
          default:
            var errorMessage = "unrecognised presence operator'" + lexeme.str + "'";
            throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
        var nextLexeme = parser.peekLexeme();
        if (nextLexeme == void 0) {
          var errorMessage = "expecting term or field, found nothing";
          throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
        switch (nextLexeme.type) {
          case lunr2.QueryLexer.FIELD:
            return lunr2.QueryParser.parseField;
          case lunr2.QueryLexer.TERM:
            return lunr2.QueryParser.parseTerm;
          default:
            var errorMessage = "expecting term or field, found '" + nextLexeme.type + "'";
            throw new lunr2.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
        }
      };
      lunr2.QueryParser.parseField = function(parser) {
        var lexeme = parser.consumeLexeme();
        if (lexeme == void 0) {
          return;
        }
        if (parser.query.allFields.indexOf(lexeme.str) == -1) {
          var possibleFields = parser.query.allFields.map(function(f) {
            return "'" + f + "'";
          }).join(", "), errorMessage = "unrecognised field '" + lexeme.str + "', possible fields: " + possibleFields;
          throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
        parser.currentClause.fields = [lexeme.str];
        var nextLexeme = parser.peekLexeme();
        if (nextLexeme == void 0) {
          var errorMessage = "expecting term, found nothing";
          throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
        switch (nextLexeme.type) {
          case lunr2.QueryLexer.TERM:
            return lunr2.QueryParser.parseTerm;
          default:
            var errorMessage = "expecting term, found '" + nextLexeme.type + "'";
            throw new lunr2.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
        }
      };
      lunr2.QueryParser.parseTerm = function(parser) {
        var lexeme = parser.consumeLexeme();
        if (lexeme == void 0) {
          return;
        }
        parser.currentClause.term = lexeme.str.toLowerCase();
        if (lexeme.str.indexOf("*") != -1) {
          parser.currentClause.usePipeline = false;
        }
        var nextLexeme = parser.peekLexeme();
        if (nextLexeme == void 0) {
          parser.nextClause();
          return;
        }
        switch (nextLexeme.type) {
          case lunr2.QueryLexer.TERM:
            parser.nextClause();
            return lunr2.QueryParser.parseTerm;
          case lunr2.QueryLexer.FIELD:
            parser.nextClause();
            return lunr2.QueryParser.parseField;
          case lunr2.QueryLexer.EDIT_DISTANCE:
            return lunr2.QueryParser.parseEditDistance;
          case lunr2.QueryLexer.BOOST:
            return lunr2.QueryParser.parseBoost;
          case lunr2.QueryLexer.PRESENCE:
            parser.nextClause();
            return lunr2.QueryParser.parsePresence;
          default:
            var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'";
            throw new lunr2.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
        }
      };
      lunr2.QueryParser.parseEditDistance = function(parser) {
        var lexeme = parser.consumeLexeme();
        if (lexeme == void 0) {
          return;
        }
        var editDistance = parseInt(lexeme.str, 10);
        if (isNaN(editDistance)) {
          var errorMessage = "edit distance must be numeric";
          throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
        parser.currentClause.editDistance = editDistance;
        var nextLexeme = parser.peekLexeme();
        if (nextLexeme == void 0) {
          parser.nextClause();
          return;
        }
        switch (nextLexeme.type) {
          case lunr2.QueryLexer.TERM:
            parser.nextClause();
            return lunr2.QueryParser.parseTerm;
          case lunr2.QueryLexer.FIELD:
            parser.nextClause();
            return lunr2.QueryParser.parseField;
          case lunr2.QueryLexer.EDIT_DISTANCE:
            return lunr2.QueryParser.parseEditDistance;
          case lunr2.QueryLexer.BOOST:
            return lunr2.QueryParser.parseBoost;
          case lunr2.QueryLexer.PRESENCE:
            parser.nextClause();
            return lunr2.QueryParser.parsePresence;
          default:
            var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'";
            throw new lunr2.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
        }
      };
      lunr2.QueryParser.parseBoost = function(parser) {
        var lexeme = parser.consumeLexeme();
        if (lexeme == void 0) {
          return;
        }
        var boost = parseInt(lexeme.str, 10);
        if (isNaN(boost)) {
          var errorMessage = "boost must be numeric";
          throw new lunr2.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
        parser.currentClause.boost = boost;
        var nextLexeme = parser.peekLexeme();
        if (nextLexeme == void 0) {
          parser.nextClause();
          return;
        }
        switch (nextLexeme.type) {
          case lunr2.QueryLexer.TERM:
            parser.nextClause();
            return lunr2.QueryParser.parseTerm;
          case lunr2.QueryLexer.FIELD:
            parser.nextClause();
            return lunr2.QueryParser.parseField;
          case lunr2.QueryLexer.EDIT_DISTANCE:
            return lunr2.QueryParser.parseEditDistance;
          case lunr2.QueryLexer.BOOST:
            return lunr2.QueryParser.parseBoost;
          case lunr2.QueryLexer.PRESENCE:
            parser.nextClause();
            return lunr2.QueryParser.parsePresence;
          default:
            var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'";
            throw new lunr2.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
        }
      };
      (function(root, factory) {
        if (typeof define === "function" && define.amd) {
          define(factory);
        } else if (typeof exports2 === "object") {
          module2.exports = factory();
        } else {
          root.lunr = factory();
        }
      })(this, function() {
        return lunr2;
      });
    })();
  }
});

// lib/knowledge-atlas/src/cli.ts
var path13 = __toESM(require("path"));

// lib/knowledge-atlas/src/generate.ts
var fs12 = __toESM(require("fs"));
var path12 = __toESM(require("path"));

// lib/knowledge-atlas/src/scan/scanner.ts
var fs2 = __toESM(require("fs"));
var path = __toESM(require("path"));

// lib/knowledge-atlas/src/scan/hash.ts
var fs = __toESM(require("fs"));
var crypto = __toESM(require("crypto"));
function contentHash(absPath) {
  const raw = fs.readFileSync(absPath);
  let text2 = raw.toString("utf-8");
  if (text2.charCodeAt(0) === 65279) {
    text2 = text2.slice(1);
  }
  const normalized = text2.replace(/\r\n/g, "\n");
  return crypto.createHash("sha256").update(normalized, "utf-8").digest("hex");
}

// lib/knowledge-atlas/src/scan/scanner.ts
var BINARY_EXTENSIONS = /* @__PURE__ */ new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".ico",
  ".webp",
  ".svgz",
  ".pdf",
  ".zip",
  ".gz",
  ".tar",
  ".tgz",
  ".7z",
  ".rar",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".eot",
  ".mp3",
  ".mp4",
  ".mov",
  ".avi",
  ".wav",
  ".ogg",
  ".webm",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".bin",
  ".class",
  ".wasm",
  ".xlsx",
  ".xls",
  ".docx",
  ".doc",
  ".pptx",
  ".ppt"
]);
function isBinaryFile(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  if (BINARY_EXTENSIONS.has(ext)) return true;
  let fd;
  try {
    fd = fs2.openSync(absPath, "r");
    const buf = Buffer.alloc(8192);
    const bytes = fs2.readSync(fd, buf, 0, buf.length, 0);
    for (let i2 = 0; i2 < bytes; i2++) {
      if (buf[i2] === 0) return true;
    }
    return false;
  } catch {
    return false;
  } finally {
    if (fd !== void 0) {
      try {
        fs2.closeSync(fd);
      } catch {
      }
    }
  }
}
function classifyFile(fileId) {
  const parts = fileId.split("/");
  const basename4 = parts[parts.length - 1].toLowerCase();
  const lowerFileId = fileId.toLowerCase();
  if (basename4 === "knowledge-graph.json") return "knowledge-graph";
  if (basename4 === "sprint-status.yaml") return "sprint-status";
  if (basename4 === "project-context.md") return "project-context";
  if (/^bug-[a-z0-9][a-z0-9-]*\.md$/.test(basename4)) return "bug";
  if (/^epic-\d+-retrospective\.md$/.test(basename4)) return "retrospective";
  if (/^\d+-\d+-[a-z0-9][a-z0-9-]*\.md$/.test(basename4)) return "story";
  if (/product-brief/.test(basename4)) return "product-brief";
  if (lowerFileId.includes("/briefs/")) return "brief";
  if ((/prd/.test(basename4) || /product-requirements/.test(basename4)) && !/(validation|report|checklist|review|cohesion|assessment)/.test(basename4)) {
    return "prd";
  }
  if (/architecture/.test(basename4)) return "architecture";
  if (/epic/.test(basename4)) return "epics";
  if (basename4.endsWith(".md") || basename4.endsWith(".yaml") || basename4.endsWith(".yml")) {
    return "report";
  }
  return "unknown";
}
var EXCLUDED_DIR_NAMES = /* @__PURE__ */ new Set([
  ".git",
  "node_modules",
  ".hg",
  ".svn",
  ".idea",
  ".vscode",
  "knowledge-site"
]);
function walkDir(dir, results) {
  let entries;
  try {
    entries = fs2.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIR_NAMES.has(entry.name) || entry.name.startsWith(".")) {
        continue;
      }
      walkDir(full, results);
    } else if (entry.isFile()) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      results.push(full);
    }
  }
}
function scanSources(sources, outDir) {
  const outDirPosix = outDir.split(path.sep).join("/").replace(/\/+$/, "");
  const results = [];
  for (const source of sources) {
    if (!fs2.existsSync(source.absPath)) {
      continue;
    }
    const absPaths = [];
    walkDir(source.absPath, absPaths);
    for (const absPath of absPaths) {
      const absPosix = absPath.split(path.sep).join("/").replace(/\/+$/, "");
      if (absPosix === outDirPosix || absPosix.startsWith(outDirPosix + "/")) {
        continue;
      }
      const basename4 = path.basename(absPath);
      if (basename4 === "knowledge-graph.html") {
        continue;
      }
      if (isBinaryFile(absPath)) {
        continue;
      }
      const relToSource = path.relative(source.absPath, absPath).split(path.sep).join("/");
      const fileId = source.fileIdPrefix ? `${source.fileIdPrefix}/${relToSource}` : relToSource;
      let hash;
      try {
        hash = contentHash(absPath);
      } catch {
        continue;
      }
      const type2 = classifyFile(fileId);
      results.push({ fileId, absPath, type: type2, contentHash: hash });
    }
  }
  results.sort((a, b) => a.fileId < b.fileId ? -1 : a.fileId > b.fileId ? 1 : 0);
  const seen = /* @__PURE__ */ new Set();
  const deduped = [];
  for (const r of results) {
    if (seen.has(r.fileId)) continue;
    seen.add(r.fileId);
    deduped.push(r);
  }
  return deduped;
}

// lib/knowledge-atlas/src/scan/config.ts
var fs3 = __toESM(require("fs"));
var path2 = __toESM(require("path"));

// node_modules/js-yaml/dist/js-yaml.mjs
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark) return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
    pos: position - lineStart + head.length
    // relative position
  };
}
function padStart(string, max) {
  return common.repeat(" ", max - string.length) + string;
}
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer) return null;
  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent !== "number") options.indent = 1;
  if (typeof options.linesBefore !== "number") options.linesBefore = 3;
  if (typeof options.linesAfter !== "number") options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match2;
  var foundLineNo = -1;
  while (match2 = re.exec(mark.buffer)) {
    lineEnds.push(match2.index);
    lineStarts.push(match2.index + match2[0].length);
    if (mark.position <= match2.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  var result = "", i2, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i2 = 1; i2 <= options.linesBefore; i2++) {
    if (foundLineNo - i2 < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i2],
      lineEnds[foundLineNo - i2],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i2]),
      maxLineLength
    );
    result = common.repeat(" ", options.indent) + padStart((mark.line - i2 + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i2 = 1; i2 <= options.linesAfter; i2++) {
    if (foundLineNo + i2 >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i2],
      lineEnds[foundLineNo + i2],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i2]),
      maxLineLength
    );
    result += common.repeat(" ", options.indent) + padStart((mark.line + i2 + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$1;
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null) return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null) return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null) return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max) return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max) return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (ch !== "0" && ch !== "1") return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_") continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_") return false;
  for (; index < max; index++) {
    ch = data[index];
    if (ch === "_") continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_") return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0") return 0;
  if (ch === "0") {
    if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x") return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o") return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null) return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match2, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match2 = YAML_DATE_REGEXP.exec(data);
  if (match2 === null) match2 = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match2 === null) throw new Error("Date resolve error");
  year = +match2[1];
  month = +match2[2] - 1;
  day = +match2[3];
  if (!match2[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match2[4];
  minute = +match2[5];
  second = +match2[6];
  if (match2[7]) {
    fraction = match2[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match2[9]) {
    tz_hour = +match2[10];
    tz_minute = +(match2[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match2[9] === "-") delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta) date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null) return false;
  var code2, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code2 = map2.indexOf(data.charAt(idx));
    if (code2 > 64) continue;
    if (code2 < 0) return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null) return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]") return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }
    if (!pairHasKey) return false;
    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null) return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]") return false;
    keys = Object.keys(pair);
    if (keys.length !== 1) return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null) return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null) return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
function setProperty(object, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(object, key, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    });
  } else {
    object[key] = value;
  }
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
var i;
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match2, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match2 = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match2 === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match2[1], 10);
    minor = parseInt(match2[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      setProperty(destination, key, source[key]);
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    setProperty(_result, keyNode, valueNode);
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat("\n", emptyLines);
      }
    } else {
      state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1) return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33) return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38) return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42) return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch)) break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0) readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null) return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1;
var QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n") result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    (inblock ? (
      // c = flow-in
      cIsNsCharOrWhitespace
    ) : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
  );
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1;
var STYLE_SINGLE = 2;
var STYLE_LITERAL = 3;
var STYLE_FOLDED = 4;
var STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i2;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i2 = 0; i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
      char = codePointAt(string, i2);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i2 = 0; i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
      char = codePointAt(string, i2);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i2;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i2 - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(
      string,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  })();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === "\n";
  var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = (function() {
    var nextLF = string.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  })();
  var prevMoreIndented = string[0] === "\n" || string[0] === " ";
  var moreIndented;
  var match2;
  while (match2 = lineRe.exec(string)) {
    var prefix = match2[1], line = match2[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ") return line;
  var breakRe = / [^ ]/g;
  var match2;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match2 = breakRe.exec(line)) {
    next = match2.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i2 = 0; i2 < string.length; char >= 65536 ? i2 += 2 : i2++) {
    char = codePointAt(string, i2);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i2];
      if (char >= 65536) result += string[i2 + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "") _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "") pairBuffer += ", ";
    if (state.condenseFlow) pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024) pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block2, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block2;
  var tagStr;
  if (block2) {
    block2 = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block2 && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block2 && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs) getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true)) return state.dump + "\n";
  return "";
}
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");

// lib/knowledge-atlas/src/scan/config.ts
var DEFAULT_OUTPUT_FOLDER = "_bmad-output";
function normalizeScalar(raw, projectRoot) {
  let s = raw.trim();
  s = s.replace(/\{project[-_]root\}/g, projectRoot);
  s = s.replace(/^["']+|["']+$/g, "");
  return s.trim();
}
function readStringKey(cfg, key, projectRoot) {
  const raw = cfg[key];
  if (typeof raw !== "string") return void 0;
  const v = normalizeScalar(raw, projectRoot);
  return v.length > 0 ? v : void 0;
}
function resolveAbsolute(value, projectRoot) {
  const resolved = path2.isAbsolute(value) ? path2.normalize(value) : path2.resolve(projectRoot, value);
  const stripped = resolved.replace(/[\\/]+$/, "");
  return stripped.length > 0 ? stripped : resolved;
}
function isAncestorOf(parent, child) {
  if (parent === child) return true;
  const withSep = parent.endsWith(path2.sep) ? parent : parent + path2.sep;
  return child.startsWith(withSep);
}
function readBmmConfig(projectRoot) {
  const configPath = path2.join(projectRoot, "_bmad", "bmm", "config.yaml");
  try {
    if (!fs3.existsSync(configPath)) return null;
    const raw = fs3.readFileSync(configPath, "utf-8");
    const parsed = load(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
  }
  return null;
}
function resolveKnowledgeSources(projectRoot) {
  let outputFolder = DEFAULT_OUTPUT_FOLDER;
  let planningArtifacts;
  let implementationArtifacts;
  let knowledgebasePath;
  const cfg = readBmmConfig(projectRoot);
  if (cfg) {
    const of = readStringKey(cfg, "output_folder", projectRoot);
    if (of) outputFolder = of;
    const pa = readStringKey(cfg, "planning_artifacts", projectRoot);
    if (pa) planningArtifacts = resolveAbsolute(pa, projectRoot);
    const ia = readStringKey(cfg, "implementation_artifacts", projectRoot);
    if (ia) implementationArtifacts = resolveAbsolute(ia, projectRoot);
    const kb = readStringKey(cfg, "knowledgebase_path", projectRoot);
    if (kb) knowledgebasePath = resolveAbsolute(kb, projectRoot);
  }
  const defaultAbsPath = resolveAbsolute(outputFolder, projectRoot);
  const outputDir = resolveAbsolute(path2.join(outputFolder, "knowledge-site"), projectRoot);
  const candidates = [{ absPath: defaultAbsPath }];
  for (const v of [planningArtifacts, implementationArtifacts, knowledgebasePath]) {
    if (v && fs3.existsSync(v)) candidates.push({ absPath: v });
  }
  let outputOverlap = false;
  const nonOverlapping = [];
  for (const c of candidates) {
    if (c.absPath === outputDir || isAncestorOf(outputDir, c.absPath)) {
      outputOverlap = true;
      process.stderr.write(
        `[atlas] WARN: knowledge source ${c.absPath} overlaps the output dir ${outputDir} \u2014 skipped
`
      );
      continue;
    }
    nonOverlapping.push(c);
  }
  const seenExact = /* @__PURE__ */ new Set();
  const deduped = [];
  for (const c of nonOverlapping) {
    if (seenExact.has(c.absPath)) continue;
    seenExact.add(c.absPath);
    deduped.push(c);
  }
  const keptAfterNesting = deduped.filter(
    (c) => !deduped.some((other) => other !== c && isAncestorOf(other.absPath, c.absPath) && other.absPath !== c.absPath)
  );
  const withPrefix = keptAfterNesting.map((c) => {
    const rel = path2.relative(projectRoot, c.absPath);
    const isUnderRoot = rel === "" || !rel.startsWith("..") && !path2.isAbsolute(rel);
    const prefix = isUnderRoot ? rel === "" ? "" : rel.split(path2.sep).join("/") : path2.basename(c.absPath);
    return { absPath: c.absPath, prefix, external: !isUnderRoot };
  });
  const sortedForPrefix = [...withPrefix].sort(
    (a, b) => a.absPath < b.absPath ? -1 : a.absPath > b.absPath ? 1 : 0
  );
  const usedPrefixes = /* @__PURE__ */ new Set();
  for (const s of sortedForPrefix) {
    if (s.prefix === "") {
      continue;
    }
    if (!usedPrefixes.has(s.prefix)) {
      usedPrefixes.add(s.prefix);
      continue;
    }
    let n = 2;
    while (usedPrefixes.has(`${s.prefix}-${n}`)) n++;
    s.prefix = `${s.prefix}-${n}`;
    usedPrefixes.add(s.prefix);
  }
  const sources = withPrefix.map((s) => ({ absPath: s.absPath, fileIdPrefix: s.prefix }));
  sources.sort((a, b) => a.fileIdPrefix < b.fileIdPrefix ? -1 : a.fileIdPrefix > b.fileIdPrefix ? 1 : 0);
  return { sources, outputFolder, outputOverlap };
}

// lib/knowledge-atlas/src/extract/frontmatter.ts
function parseFrontmatter(content, fileId) {
  let normalized = content.replace(/\r\n/g, "\n");
  if (normalized.charCodeAt(0) === 65279) normalized = normalized.slice(1);
  normalized = normalized.replace(/^[ \t]*\n+/, "");
  const fenceMatch = normalized.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (fenceMatch) {
    try {
      const parsed = load(fenceMatch[1]);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
    }
    return null;
  }
  if (fileId.endsWith(".yaml") || fileId.endsWith(".yml")) {
    try {
      const parsed = load(normalized);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
    }
  }
  return null;
}

// lib/knowledge-atlas/src/extract/entities.ts
var RE_FR = /\bFR(\d+)\b/g;
var RE_NFR = /\bNFR(\d+)\b/g;
var RE_F = /\bF(\d{1,3})\b(?!R)/g;
var RE_EPIC = /\bEpic\s+(\d{1,4})\b/gi;
var RE_STORY_NM = /\bStory\s+(\d+)\.(\d+)\b/gi;
var RE_STORY_KEY = /\b(\d+)-(\d+)-([a-z][a-z0-9-]*)\b/g;
var RE_BUG = /\bbug-([a-z0-9][a-z0-9-]*)\b/gi;
var RE_ARCH = /\bP(\d+)-(\d+)\b/g;
var RE_RETRO = /\bepic-(\d+)-retrospective\b/gi;
var STATUSES = /* @__PURE__ */ new Set(["backlog", "ready-for-dev", "in-progress", "review", "done"]);
var RE_BLOCKED_BY = /blocked\s+by[:\s]+(.+?)(?:\n|$)/gi;
var RE_BLOCKS = /\bblocks[:\s]+(.+?)(?:\n|$)/gi;
var RE_DEPENDS_ON = /depends\s+on[:\s]+(.+?)(?:\n|$)/gi;
var RE_ADDRESSED_BY = /addressed\s+by[:\s]+(.+?)(?:\n|$)/gi;
var RE_SHIPPED = /shipped(?:\s+in)?\s+(v[\d]+(?:\.[\d]+)*)/gi;
function blankOut(s) {
  return s.replace(/[^\n]/g, " ");
}
function stripCodeSpans(content) {
  let out = content.replace(/(^|\n)(```|~~~)[^\n]*\n[\s\S]*?\n\2[ \t]*(?=\n|$)/g, (m) => blankOut(m));
  out = out.replace(/(^|\n)(```|~~~)[\s\S]*$/g, (m) => blankOut(m));
  out = out.replace(/`[^`\n]*`/g, (m) => blankOut(m));
  return out;
}
function standaloneStatusRegex(status) {
  return new RegExp(`(?<![a-z0-9-])${status}(?![a-z0-9-])`, "i");
}
function normalizeFR(n) {
  return `FR${n}`;
}
function normalizeNFR(n) {
  return `NFR${n}`;
}
function normalizeF(n) {
  return `F${n}`;
}
function normalizeEpic(n) {
  return `Epic ${n}`;
}
function normalizeStoryNM(major, minor) {
  return `Story ${major}.${minor}`;
}
function normalizeStoryKey(major, minor, slug) {
  return `${major}-${minor}-${slug}`;
}
function normalizeBug(slug) {
  return `bug-${slug.toLowerCase()}`;
}
function normalizeArch(major, minor) {
  return `P${major}-${minor}`;
}
function normalizeRetro(n) {
  return `epic-${n}-retrospective`;
}
function extractEntities(content, fileId, docType, frontmatter) {
  if (docType === "knowledge-graph") {
    return { entities: [], statuses: [], edges: [] };
  }
  const normalized = stripCodeSpans(content.replace(/\r\n/g, "\n"));
  const entitySet = /* @__PURE__ */ new Set();
  const statusSet = /* @__PURE__ */ new Set();
  const edges = [];
  if (frontmatter) {
    const fmStatus = frontmatter["status"];
    if (typeof fmStatus === "string") {
      const s = fmStatus.toLowerCase().trim();
      if (STATUSES.has(s)) statusSet.add(s);
    }
    const fmEpic = frontmatter["epic"];
    if (typeof fmEpic === "string") {
      const epicMatch = fmEpic.match(/(\d+)/);
      if (epicMatch) {
        entitySet.add(normalizeEpic(epicMatch[1]));
      }
    }
  }
  RE_FR.lastIndex = 0;
  for (const m of normalized.matchAll(RE_FR)) {
    entitySet.add(normalizeFR(m[1]));
  }
  RE_NFR.lastIndex = 0;
  for (const m of normalized.matchAll(RE_NFR)) {
    entitySet.add(normalizeNFR(m[1]));
  }
  RE_F.lastIndex = 0;
  for (const m of normalized.matchAll(RE_F)) {
    entitySet.add(normalizeF(m[1]));
  }
  RE_EPIC.lastIndex = 0;
  for (const m of normalized.matchAll(RE_EPIC)) {
    entitySet.add(normalizeEpic(m[1]));
  }
  RE_STORY_NM.lastIndex = 0;
  for (const m of normalized.matchAll(RE_STORY_NM)) {
    entitySet.add(normalizeStoryNM(m[1], m[2]));
  }
  RE_STORY_KEY.lastIndex = 0;
  for (const m of normalized.matchAll(RE_STORY_KEY)) {
    const key = normalizeStoryKey(m[1], m[2], m[3]);
    entitySet.add(key);
  }
  RE_BUG.lastIndex = 0;
  for (const m of normalized.matchAll(RE_BUG)) {
    entitySet.add(normalizeBug(m[1]));
  }
  RE_ARCH.lastIndex = 0;
  for (const m of normalized.matchAll(RE_ARCH)) {
    entitySet.add(normalizeArch(m[1], m[2]));
  }
  RE_RETRO.lastIndex = 0;
  for (const m of normalized.matchAll(RE_RETRO)) {
    entitySet.add(normalizeRetro(m[1]));
  }
  for (const status of STATUSES) {
    if (standaloneStatusRegex(status).test(normalized)) {
      statusSet.add(status);
    }
  }
  const sourceId = fileId;
  if (docType === "story") {
    const frRefs = [];
    RE_FR.lastIndex = 0;
    for (const m of normalized.matchAll(RE_FR)) frRefs.push(normalizeFR(m[1]));
    RE_NFR.lastIndex = 0;
    for (const m of normalized.matchAll(RE_NFR)) frRefs.push(normalizeNFR(m[1]));
    RE_F.lastIndex = 0;
    for (const m of normalized.matchAll(RE_F)) frRefs.push(normalizeF(m[1]));
    for (const ref of dedupSorted(frRefs)) {
      edges.push({ from: sourceId, to: ref, kind: "implements" });
    }
    const epicRefs = [];
    RE_EPIC.lastIndex = 0;
    for (const m of normalized.matchAll(RE_EPIC)) epicRefs.push(normalizeEpic(m[1]));
    if (frontmatter?.["epic"]) {
      const em = String(frontmatter["epic"]).match(/(\d+)/);
      if (em) epicRefs.push(normalizeEpic(em[1]));
    }
    for (const ref of dedupSorted(epicRefs)) {
      edges.push({ from: sourceId, to: ref, kind: "derives-from" });
    }
  }
  if (docType === "retrospective") {
    const retroFilenameMatch = fileId.match(/epic-(\d+)-retrospective/);
    if (retroFilenameMatch) {
      entitySet.add(normalizeRetro(retroFilenameMatch[1]));
    }
    RE_EPIC.lastIndex = 0;
    const epicRefs = [];
    for (const m of normalized.matchAll(RE_EPIC)) epicRefs.push(normalizeEpic(m[1]));
    if (retroFilenameMatch) epicRefs.push(normalizeEpic(retroFilenameMatch[1]));
    for (const ref of dedupSorted(epicRefs)) {
      edges.push({ from: sourceId, to: ref, kind: "validates" });
    }
  }
  if (docType === "epics") {
  }
  RE_BLOCKED_BY.lastIndex = 0;
  for (const m of normalized.matchAll(RE_BLOCKED_BY)) {
    const refs = extractEntityRefs(m[1]);
    for (const ref of refs) {
      edges.push({ from: ref, to: sourceId, kind: "blocks" });
    }
  }
  RE_BLOCKS.lastIndex = 0;
  for (const m of normalized.matchAll(RE_BLOCKS)) {
    const refs = extractEntityRefs(m[1]);
    for (const ref of refs) {
      edges.push({ from: sourceId, to: ref, kind: "blocks" });
    }
  }
  RE_DEPENDS_ON.lastIndex = 0;
  for (const m of normalized.matchAll(RE_DEPENDS_ON)) {
    const refs = extractEntityRefs(m[1]);
    for (const ref of refs) {
      edges.push({ from: sourceId, to: ref, kind: "depends-on" });
    }
  }
  RE_ADDRESSED_BY.lastIndex = 0;
  for (const m of normalized.matchAll(RE_ADDRESSED_BY)) {
    const refs = extractEntityRefs(m[1]);
    for (const ref of refs) {
      edges.push({ from: ref, to: sourceId, kind: "addressed-by" });
    }
  }
  RE_SHIPPED.lastIndex = 0;
  for (const m of normalized.matchAll(RE_SHIPPED)) {
    const version = m[1];
    edges.push({ from: sourceId, to: `version:${version}`, kind: "shipped-in" });
  }
  for (const token of entitySet) {
    edges.push({ from: sourceId, to: token, kind: "references" });
  }
  const refObservations = /* @__PURE__ */ new Set();
  const lines = normalized.split("\n");
  const stack = [];
  for (const line of lines) {
    const hm = /^(#{1,6})[ \t]+(.+?)[ \t]*$/.exec(line);
    if (hm) {
      const level = hm[1].length;
      const headingText = hm[2];
      while (stack.length > 0 && stack[stack.length - 1].level >= level) stack.pop();
      const parentOwner = stack.length > 0 ? stack[stack.length - 1].owner : "";
      const headingTokens = [...new Set(allEntityTokens(headingText))];
      const ownOwner = headingTokens.length === 1 ? headingTokens[0] : "";
      const owner2 = ownOwner || parentOwner;
      stack.push({ level, owner: owner2 });
      for (const t of headingTokens) {
        if (owner2 && t !== owner2) refObservations.add(owner2 + "|" + t);
      }
      continue;
    }
    const owner = stack.length > 0 ? stack[stack.length - 1].owner : "";
    if (!owner) continue;
    for (const t of new Set(allEntityTokens(line))) {
      if (t !== owner) refObservations.add(owner + "|" + t);
    }
  }
  for (const obs of refObservations) {
    const bar = obs.indexOf("|");
    const owner = obs.slice(0, bar);
    const token = obs.slice(bar + 1);
    if (owner && token && owner !== token) {
      edges.push({ from: owner, to: token, kind: "references" });
    }
  }
  return {
    entities: dedupSorted([...entitySet]),
    statuses: [...statusSet].sort(),
    edges
  };
}
function allEntityTokens(text2) {
  const refs = [];
  RE_FR.lastIndex = 0;
  for (const m of text2.matchAll(RE_FR)) refs.push(normalizeFR(m[1]));
  RE_NFR.lastIndex = 0;
  for (const m of text2.matchAll(RE_NFR)) refs.push(normalizeNFR(m[1]));
  RE_F.lastIndex = 0;
  for (const m of text2.matchAll(RE_F)) refs.push(normalizeF(m[1]));
  RE_EPIC.lastIndex = 0;
  for (const m of text2.matchAll(RE_EPIC)) refs.push(normalizeEpic(m[1]));
  RE_STORY_NM.lastIndex = 0;
  for (const m of text2.matchAll(RE_STORY_NM)) refs.push(normalizeStoryNM(m[1], m[2]));
  RE_STORY_KEY.lastIndex = 0;
  for (const m of text2.matchAll(RE_STORY_KEY)) refs.push(normalizeStoryKey(m[1], m[2], m[3]));
  RE_BUG.lastIndex = 0;
  for (const m of text2.matchAll(RE_BUG)) refs.push(normalizeBug(m[1]));
  RE_ARCH.lastIndex = 0;
  for (const m of text2.matchAll(RE_ARCH)) refs.push(normalizeArch(m[1], m[2]));
  RE_RETRO.lastIndex = 0;
  for (const m of text2.matchAll(RE_RETRO)) refs.push(normalizeRetro(m[1]));
  return refs;
}
function extractEntityRefs(prose) {
  const refs = [];
  RE_FR.lastIndex = 0;
  for (const m of prose.matchAll(RE_FR)) refs.push(normalizeFR(m[1]));
  RE_NFR.lastIndex = 0;
  for (const m of prose.matchAll(RE_NFR)) refs.push(normalizeNFR(m[1]));
  RE_STORY_NM.lastIndex = 0;
  for (const m of prose.matchAll(RE_STORY_NM)) refs.push(normalizeStoryNM(m[1], m[2]));
  RE_STORY_KEY.lastIndex = 0;
  for (const m of prose.matchAll(RE_STORY_KEY)) refs.push(normalizeStoryKey(m[1], m[2], m[3]));
  RE_BUG.lastIndex = 0;
  for (const m of prose.matchAll(RE_BUG)) refs.push(normalizeBug(m[1]));
  RE_EPIC.lastIndex = 0;
  for (const m of prose.matchAll(RE_EPIC)) refs.push(normalizeEpic(m[1]));
  RE_ARCH.lastIndex = 0;
  for (const m of prose.matchAll(RE_ARCH)) refs.push(normalizeArch(m[1], m[2]));
  return refs;
}
function dedupSorted(arr) {
  return [...new Set(arr)].sort();
}

// lib/knowledge-atlas/src/extract/slug.ts
function headingToSlug(heading2) {
  return heading2.toLowerCase().replace(/[^\w\s-]/g, "").replace(/_/g, "-").replace(/\s+/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "");
}
function entityToSlug(token) {
  return headingToSlug(token.replace(/\./g, "-"));
}
function makeEntityNodeId(fileId, token) {
  if (!token || !token.trim()) return fileId;
  const slug = entityToSlug(token.trim());
  if (!slug) return fileId;
  return `${fileId}#${slug}`;
}

// lib/knowledge-atlas/src/graph/build.ts
var STATUS_PRIORITY = ["done", "review", "in-progress", "ready-for-dev", "backlog"];
function pickStatus(statuses) {
  for (const s of STATUS_PRIORITY) {
    if (statuses.includes(s)) return s;
  }
  return statuses.length > 0 ? [...statuses].sort()[0] : void 0;
}
function entityKind(token) {
  if (/^FR\d+$/.test(token)) return "requirement";
  if (/^NFR\d+$/.test(token)) return "nfr";
  if (/^F\d{1,3}$/.test(token)) return "capability";
  if (/^Epic \d+$/i.test(token)) return "epic";
  if (/^Story \d+\.\d+$/i.test(token)) return "story";
  if (/^\d+-\d+-[a-z0-9][a-z0-9-]*$/.test(token)) return "story";
  if (/^bug-[a-z0-9][a-z0-9-]*$/.test(token)) return "bug";
  if (/^P\d+-\d+$/.test(token)) return "arch-decision";
  if (/^epic-\d+-retrospective$/.test(token)) return "retrospective";
  return "story";
}
function preferredDocType(kind) {
  switch (kind) {
    case "requirement":
    case "nfr":
    case "capability":
      return "prd";
    case "epic":
      return "epics";
    case "story":
      return "story";
    case "bug":
      return "bug";
    case "arch-decision":
      return "architecture";
    case "retrospective":
      return "retrospective";
    case "document":
      return null;
  }
}
function fileNodeKind(docType) {
  if (docType === "story") return "story";
  if (docType === "bug") return "bug";
  if (docType === "retrospective") return "retrospective";
  return "document";
}
function storyKeyPrefix(token) {
  const m = token.match(/^Story\s+(\d+)\.(\d+)$/i);
  if (!m) return null;
  return `${m[1]}-${m[2]}-`;
}
function chooseDefFile(token, kind, fileList) {
  if (kind === "story") {
    const prefix = storyKeyPrefix(token);
    if (prefix) {
      const byBasename = fileList.find((f) => {
        const base = f.fileId.split("/").pop() ?? "";
        return base.startsWith(prefix);
      });
      if (byBasename) return byBasename;
      const epicsFile = fileList.find((f) => f.type === "epics");
      if (epicsFile) return epicsFile;
    }
  }
  const preferred = preferredDocType(kind);
  const byPreferred = preferred ? fileList.find((f) => f.type === preferred) : void 0;
  if (byPreferred) return byPreferred;
  return fileList[0];
}
function buildNodes(records) {
  const tokenFiles = /* @__PURE__ */ new Map();
  for (const rec of records) {
    for (const token of rec.entities) {
      let arr = tokenFiles.get(token);
      if (!arr) {
        arr = [];
        tokenFiles.set(token, arr);
      }
      arr.push({ fileId: rec.path, type: rec.type });
    }
  }
  const nodeMap = /* @__PURE__ */ new Map();
  for (const rec of records) {
    if (rec.type === "knowledge-graph") continue;
    const kind = fileNodeKind(rec.type);
    const basename4 = rec.path.split("/").pop().replace(/\.(md|yaml|yml|json)$/i, "");
    const status = pickStatus(rec.statuses);
    const node = {
      id: rec.path,
      kind,
      label: basename4,
      fileId: rec.path
    };
    if (status) node.status = status;
    nodeMap.set(rec.path, node);
  }
  for (const [token, fileList] of tokenFiles) {
    const kind = entityKind(token);
    const defFile = chooseDefFile(token, kind, fileList);
    if (!defFile) continue;
    const anchor = entityToSlug(token);
    const id = makeEntityNodeId(defFile.fileId, token);
    if (!nodeMap.has(id)) {
      nodeMap.set(id, {
        id,
        kind,
        label: token,
        fileId: defFile.fileId,
        anchor
      });
    }
  }
  return [...nodeMap.values()].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}
function buildEdges(records, nodes) {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edgeMap = /* @__PURE__ */ new Map();
  for (const rec of records) {
    for (const edge of rec.edges) {
      const from = resolveId(edge.from, nodes, rec.path);
      const to = resolveId(edge.to, nodes, rec.path);
      if (from === to) continue;
      const key = `${from}|${to}|${edge.kind}`;
      if (!edgeMap.has(key)) {
        const dangling = !nodeIds.has(to) && !isTerminalTarget(to);
        const e = { from, to, kind: edge.kind };
        if (dangling) e.dangling = true;
        edgeMap.set(key, e);
      }
    }
  }
  return [...edgeMap.values()].sort((a, b) => {
    if (a.from !== b.from) return a.from < b.from ? -1 : 1;
    if (a.to !== b.to) return a.to < b.to ? -1 : 1;
    return a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0;
  });
}
function resolveId(raw, nodes, contextFileId) {
  if (nodes.some((n) => n.id === raw)) return raw;
  const byLabel = nodes.find((n) => n.label === raw);
  if (byLabel) return byLabel.id;
  const byFileId = nodes.find((n) => n.fileId === raw && !n.anchor);
  if (byFileId) return byFileId.id;
  return raw;
}
function isTerminalTarget(to) {
  return to.startsWith("version:");
}
function buildCounts(records, nodes, edges) {
  const counts = {
    files: records.length,
    nodes: nodes.length,
    edges: edges.length
  };
  for (const node of nodes) {
    const key = `nodes.${node.kind}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

// lib/knowledge-atlas/src/graph/reconcile.ts
var fs4 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var VALID_NODE_KINDS = /* @__PURE__ */ new Set([
  "capability",
  "requirement",
  "nfr",
  "epic",
  "story",
  "bug",
  "arch-decision",
  "retrospective",
  "document"
]);
var VALID_EDGE_KINDS = /* @__PURE__ */ new Set([
  "implements",
  "derives-from",
  "refines",
  "blocks",
  "depends-on",
  "validates",
  "addressed-by",
  "shipped-in",
  "references"
]);
function readKgJson(bmadOutputDir) {
  const kgPath = path3.join(bmadOutputDir, "knowledge-graph.json");
  if (!fs4.existsSync(kgPath)) return null;
  try {
    const raw = fs4.readFileSync(kgPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
  }
  return null;
}
function coerceNode(kgNode) {
  if (!kgNode.id || typeof kgNode.id !== "string") return null;
  let kind = "story";
  if (kgNode.kind && VALID_NODE_KINDS.has(kgNode.kind)) {
    kind = kgNode.kind;
  }
  const hashIdx = kgNode.id.indexOf("#");
  const fileId = kgNode.fileId ?? (hashIdx >= 0 ? kgNode.id.slice(0, hashIdx) : kgNode.id);
  const anchor = hashIdx >= 0 ? typeof kgNode.anchor === "string" && kgNode.anchor ? kgNode.anchor : kgNode.id.slice(hashIdx + 1) : void 0;
  const node = {
    id: kgNode.id,
    kind,
    label: typeof kgNode.label === "string" ? kgNode.label : kgNode.id,
    fileId
  };
  if (anchor) node.anchor = anchor;
  if (typeof kgNode.title === "string") node.title = kgNode.title;
  if (typeof kgNode.status === "string") node.status = kgNode.status;
  return node;
}
function coerceEdge(kgEdge) {
  if (!kgEdge.from || !kgEdge.to) return null;
  let kind = "implements";
  if (kgEdge.kind && VALID_EDGE_KINDS.has(kgEdge.kind)) {
    kind = kgEdge.kind;
  }
  return {
    from: kgEdge.from,
    to: kgEdge.to,
    kind,
    ...kgEdge.dangling === true ? { dangling: true } : {}
  };
}
function tagScanNodeWithProvenance(scanNode, kgNode) {
  if (kgNode === null) {
    return { ...scanNode, source: "scan" };
  }
  const merged = { ...scanNode, source: "both" };
  if (!merged.title && kgNode.title) merged.title = kgNode.title;
  if (!merged.status && kgNode.status) merged.status = kgNode.status;
  return merged;
}
function tagKgOnlyNode(kgNode) {
  return { ...kgNode, source: "kg" };
}
function tagScanEdge(scanEdge, kgEdge) {
  const source = kgEdge !== null ? "both" : "scan";
  return { ...scanEdge, source };
}
function tagKgOnlyEdge(kgEdge) {
  return { ...kgEdge, source: "kg" };
}
function reconcileWithKgJson(scanNodes, scanEdges, bmadOutputDir) {
  const kgJson = readKgJson(bmadOutputDir);
  if (!kgJson) {
    return { nodes: scanNodes, edges: scanEdges };
  }
  const kgNodes = Array.isArray(kgJson.nodes) ? kgJson.nodes : [];
  const kgEdges = Array.isArray(kgJson.edges) ? kgJson.edges : [];
  if (kgNodes.length === 0 && kgEdges.length === 0) {
    return { nodes: scanNodes, edges: scanEdges };
  }
  const kgNodeMap = /* @__PURE__ */ new Map();
  for (const kgNode of kgNodes) {
    const coerced = coerceNode(kgNode);
    if (!coerced) continue;
    if (!kgNodeMap.has(coerced.id)) {
      kgNodeMap.set(coerced.id, coerced);
    }
  }
  const seenIds = /* @__PURE__ */ new Set();
  const mergedNodes = [];
  for (const scanNode of scanNodes) {
    seenIds.add(scanNode.id);
    const kgCounterpart = kgNodeMap.get(scanNode.id) ?? null;
    mergedNodes.push(tagScanNodeWithProvenance(scanNode, kgCounterpart));
  }
  for (const [id, kgNode] of kgNodeMap) {
    if (seenIds.has(id)) continue;
    seenIds.add(id);
    mergedNodes.push(tagKgOnlyNode(kgNode));
  }
  const edgeKey = (e) => `${e.from}|${e.to}|${e.kind}`;
  const kgEdgeMap = /* @__PURE__ */ new Map();
  for (const kgEdge of kgEdges) {
    const coerced = coerceEdge(kgEdge);
    if (!coerced) continue;
    const key = edgeKey(coerced);
    if (!kgEdgeMap.has(key)) {
      kgEdgeMap.set(key, coerced);
    }
  }
  const seenEdgeKeys = /* @__PURE__ */ new Set();
  const mergedEdges = [];
  for (const scanEdge of scanEdges) {
    const key = edgeKey(scanEdge);
    seenEdgeKeys.add(key);
    const kgCounterpart = kgEdgeMap.get(key) ?? null;
    mergedEdges.push(tagScanEdge(scanEdge, kgCounterpart));
  }
  for (const [key, kgEdge] of kgEdgeMap) {
    if (seenEdgeKeys.has(key)) continue;
    seenEdgeKeys.add(key);
    mergedEdges.push(tagKgOnlyEdge(kgEdge));
  }
  const mergedNodeIds = new Set(mergedNodes.map((n) => n.id));
  for (const e of mergedEdges) {
    const shouldDangle = !mergedNodeIds.has(e.to) && !e.to.startsWith("version:");
    if (shouldDangle) {
      e.dangling = true;
    } else if ("dangling" in e) {
      delete e.dangling;
    }
  }
  mergedNodes.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  mergedEdges.sort((a, b) => {
    if (a.from !== b.from) return a.from < b.from ? -1 : 1;
    if (a.to !== b.to) return a.to < b.to ? -1 : 1;
    return a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0;
  });
  return { nodes: mergedNodes, edges: mergedEdges };
}

// lib/knowledge-atlas/src/manifest/persist.ts
var fs5 = __toESM(require("fs"));
var path4 = __toESM(require("path"));
function stableStringify(value, indent = 2) {
  return JSON.stringify(value, sortReplacer, indent);
}
function sortReplacer(_key, value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const sorted = {};
    for (const k of Object.keys(value).sort()) {
      sorted[k] = value[k];
    }
    return sorted;
  }
  return value;
}
function writeManifest(outDir, manifest) {
  fs5.mkdirSync(outDir, { recursive: true });
  let relBmad = "_bmad-output";
  if (manifest.projectRoot && manifest.bmadOutputDir) {
    relBmad = path4.relative(manifest.projectRoot, manifest.bmadOutputDir).split(path4.sep).join("/") || "_bmad-output";
  }
  const persisted = { ...manifest, projectRoot: ".", bmadOutputDir: relBmad };
  let json2 = stableStringify(persisted);
  json2 = json2.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!json2.endsWith("\n")) json2 += "\n";
  const manifestPath = path4.join(outDir, "manifest.json");
  fs5.writeFileSync(manifestPath, json2, { encoding: "utf-8" });
  return manifestPath;
}
function readManifest(outDir, expectedVersion) {
  const manifestPath = path4.join(outDir, "manifest.json");
  if (!fs5.existsSync(manifestPath)) return null;
  try {
    const raw = fs5.readFileSync(manifestPath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const manifest = parsed;
    if (expectedVersion !== void 0 && manifest.version !== expectedVersion) {
      return null;
    }
    if (!Array.isArray(manifest.files)) return null;
    return manifest;
  } catch {
  }
  return null;
}

// lib/knowledge-atlas/src/manifest/incremental.ts
function computeDiff(priorRecords, currentScan) {
  const priorByPath = /* @__PURE__ */ new Map();
  const priorByHash = /* @__PURE__ */ new Map();
  for (const rec of priorRecords) {
    priorByPath.set(rec.path, rec);
    let arr = priorByHash.get(rec.contentHash);
    if (!arr) {
      arr = [];
      priorByHash.set(rec.contentHash, arr);
    }
    arr.push(rec);
  }
  const currentByPath = /* @__PURE__ */ new Map();
  for (const f of currentScan) {
    currentByPath.set(f.fileId, f);
  }
  const unchanged = [];
  const toReprocess = [];
  const renames = /* @__PURE__ */ new Map();
  const claimedRenameSources = /* @__PURE__ */ new Set();
  const sortedCurrent = [...currentScan].sort((a, b) => a.fileId < b.fileId ? -1 : a.fileId > b.fileId ? 1 : 0);
  for (const curr of sortedCurrent) {
    const prior = priorByPath.get(curr.fileId);
    if (prior && prior.contentHash === curr.contentHash) {
      unchanged.push(prior);
    } else if (prior) {
      toReprocess.push(curr.fileId);
    } else {
      const candidates = priorByHash.get(curr.contentHash) ?? [];
      const match2 = candidates.find((c) => !currentByPath.has(c.path) && !claimedRenameSources.has(c.path));
      if (match2) {
        renames.set(curr.fileId, match2.path);
        claimedRenameSources.add(match2.path);
      }
      toReprocess.push(curr.fileId);
    }
  }
  const removed = [];
  for (const rec of priorRecords) {
    if (!currentByPath.has(rec.path)) {
      removed.push(rec.path);
    }
  }
  return { unchanged, toReprocess, removed, renames };
}
function mergeRecords(unchanged, reprocessed, removed) {
  const removedSet = new Set(removed);
  const merged = [
    ...unchanged.filter((r) => !removedSet.has(r.path)),
    ...reprocessed
  ];
  merged.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  return merged;
}

// lib/knowledge-atlas/src/render/site.ts
var fs8 = __toESM(require("fs"));
var path8 = __toESM(require("path"));

// lib/knowledge-atlas/src/render/design-system.ts
var DESIGN_SYSTEM_CSS = `/* Knowledge Atlas \u2014 design system (Story 29.3) */
/* NO external URLs, NO web fonts, system font stack only. */

:root {
  /* Core color tokens */
  --ink:         #1a1a2e;
  --paper:       #f8f9fb;
  --surface:     #ffffff;
  --surface-alt: #f1f4f8;
  --ok:          #2e7d32;
  --warn:        #e65100;
  --gap:         1rem;
  --ink-wash:    #5c6a7a;
  --accent:      #00897b;
  --accent-dk:   #00695c;
  --border:      #d0d9e4;
  --radius:      6px;
  --font:        system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;

  /* Status colors */
  --status-backlog:     #5c6a7a;
  --status-backlog-wash:#f1f4f8;
  --status-ready:       #1565c0;
  --status-ready-wash:  #e3f2fd;
  --status-in-progress: #e65100;
  --status-in-progress-wash: #fff3e0;
  --status-review:      #6a1b9a;
  --status-review-wash: #f3e5f5;
  --status-done:        #2e7d32;
  --status-done-wash:   #e8f5e9;
  --status-blocked:     #b71c1c;
  --status-blocked-wash:#ffebee;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -3rem;
  left: 0;
  background: var(--accent);
  color: #fff;
  padding: 0.5rem 1rem;
  text-decoration: none;
  border-radius: 0 0 var(--radius) 0;
  z-index: 1000;
  font-family: var(--font);
  font-size: 0.9rem;
  transition: top 0.2s;
}
.skip-link:focus {
  top: 0;
}

/* Scroll behaviour: use auto (instant) so that landing on a page via a
   #anchor \u2014 e.g. clicking a graph node or an entity link into a long reading
   view \u2014 reliably jumps to the target. A global smooth scroll-behavior
   made the browser's on-load hash navigation unreliable on long documents (it
   could stay at the top \u2014 the "click goes to the start of the document" bug).
   In-page TOC/backlink clicks still jump correctly, just without the animation. */
html {
  scroll-behavior: auto;
}

body {
  font-family: var(--font);
  background: var(--paper);
  color: var(--ink);
  line-height: 1.6;
  font-size: 1rem;
}

/* \u2500\u2500 Type scale \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font);
  font-weight: 700;
  line-height: 1.25;
  color: var(--ink);
}

h1 { font-size: 1.75rem; letter-spacing: -0.03em; }
h2 { font-size: 1.35rem; letter-spacing: -0.02em; margin-top: 1.5rem; margin-bottom: 0.5rem; }
h3 { font-size: 1.1rem; letter-spacing: -0.01em; margin-top: 1.25rem; margin-bottom: 0.4rem; }
h4 { font-size: 1rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.3rem; }
h5 { font-size: 0.9rem; font-weight: 600; margin-top: 0.75rem; margin-bottom: 0.25rem; }
h6 { font-size: 0.85rem; font-weight: 600; color: var(--ink-wash); margin-top: 0.5rem; }

p {
  margin-bottom: 0.75rem;
  max-width: 68ch;
}

a {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color 0.15s, color 0.15s;
}
a:hover, a:focus {
  color: var(--accent-dk);
  text-decoration-color: var(--accent-dk);
}

ul, ol {
  margin-left: 1.5rem;
  margin-bottom: 0.75rem;
}
li { margin-bottom: 0.2rem; }

code {
  font-family: ui-monospace, "Cascadia Code", "Fira Code", Consolas, monospace;
  font-size: 0.875em;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 0.1em 0.35em;
  color: var(--accent-dk);
}

pre {
  background: #1e293b;
  color: #e2e8f0;
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  overflow-x: auto;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  line-height: 1.55;
}
pre code {
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  font-size: inherit;
}

/* Mono eyebrow labels */
.eyebrow {
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-wash);
  display: block;
  margin-bottom: 0.25rem;
}

/* Tabular numerics */
.tabular {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* \u2500\u2500 Layout \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.page-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-nav {
  background: var(--accent);
  padding: 0 calc(var(--gap) * 1.5);
  display: flex;
  align-items: center;
  gap: var(--gap);
  height: 3rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0,0,0,0.12);
}

.site-nav a {
  color: rgba(255,255,255,0.92);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.15s;
}
.site-nav a:hover, .site-nav a:focus {
  background: rgba(255,255,255,0.15);
  color: #fff;
  text-decoration: none;
}

.site-nav .nav-brand {
  font-weight: 700;
  font-size: 0.95rem;
  margin-right: auto;
}

/* Search form in nav */
.nav-search {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.nav-search input[type="search"] {
  border: 1px solid rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.12);
  color: #fff;
  border-radius: 4px;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  font-family: var(--font);
  width: 12rem;
  outline: none;
  transition: background 0.15s, border-color 0.15s;
}
.nav-search input[type="search"]::placeholder { color: rgba(255,255,255,0.55); }
.nav-search input[type="search"]:focus {
  background: rgba(255,255,255,0.2);
  border-color: rgba(255,255,255,0.6);
}
.nav-search button {
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  border-radius: 4px;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  font-family: var(--font);
  cursor: pointer;
  transition: background 0.15s;
}
.nav-search button:hover { background: rgba(255,255,255,0.28); }

/* Hero banner */
.hero {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dk) 100%);
  color: #fff;
  padding: calc(var(--gap) * 2.5) calc(var(--gap) * 2);
}
.hero h1 {
  color: #fff;
  font-size: 2rem;
  letter-spacing: -0.04em;
  margin-bottom: 0.4rem;
}
.hero .subtitle {
  font-size: 1rem;
  opacity: 0.85;
  max-width: 60ch;
}

/* Main content area */
.content-wrap {
  max-width: 960px;
  margin: 0 auto;
  padding: calc(var(--gap) * 1.5) var(--gap);
  width: 100%;
  flex: 1;
}

/* \u2500\u2500 Cards \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: calc(var(--gap) * 1.25);
  margin-bottom: var(--gap);
}
.card h2, .card h3 {
  color: var(--accent-dk);
  margin-top: 0;
  margin-bottom: 0.5rem;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--gap);
  margin-bottom: var(--gap);
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  text-align: center;
}
.stat-card .stat-num {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent);
  display: block;
  font-variant-numeric: tabular-nums;
}
.stat-card .stat-label {
  font-size: 0.8rem;
  color: var(--ink-wash);
}

/* \u2500\u2500 Status pill/badge \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  padding: 0.15em 0.6em;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
  vertical-align: middle;
}

.status-pill.status-backlog     { background: var(--status-backlog-wash);     color: var(--status-backlog); }
.status-pill.status-ready       { background: var(--status-ready-wash);       color: var(--status-ready); }
.status-pill.status-ready-for-dev { background: var(--status-ready-wash);     color: var(--status-ready); }
.status-pill.status-in-progress { background: var(--status-in-progress-wash); color: var(--status-in-progress); }
.status-pill.status-review      { background: var(--status-review-wash);      color: var(--status-review); }
.status-pill.status-done        { background: var(--status-done-wash);        color: var(--status-done); }
.status-pill.status-blocked     { background: var(--status-blocked-wash);     color: var(--status-blocked); }

/* \u2500\u2500 Table \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.atlas-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}
.atlas-table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  background: var(--surface-alt);
  border-bottom: 2px solid var(--border);
  color: var(--ink-wash);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.atlas-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
}
.atlas-table tbody tr:hover { background: var(--surface-alt); }
.atlas-table-wrap { overflow-x: auto; }

/* \u2500\u2500 Callout box \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.callout {
  border-left: 4px solid var(--accent);
  background: var(--surface-alt);
  border-radius: 0 var(--radius) var(--radius) 0;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.callout.callout-warn  { border-color: var(--warn);  background: var(--status-in-progress-wash); }
.callout.callout-ok    { border-color: var(--ok);    background: var(--status-done-wash); }
.callout.callout-error { border-color: var(--status-blocked); background: var(--status-blocked-wash); }

/* \u2500\u2500 Mermaid diagrams \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.mermaid {
  overflow-x: auto;
  padding: 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 1rem;
  min-height: 2rem;
}
.mermaid-fallback {
  background: #f8f9fb;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 0.8rem;
  white-space: pre-wrap;
  color: var(--ink-wash);
  margin-bottom: 1rem;
}

/* \u2500\u2500 Back-link navigation \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--ink-wash);
  text-decoration: none;
  margin-bottom: 1rem;
  transition: color 0.15s;
}
.back-link:hover, .back-link:focus {
  color: var(--accent);
  text-decoration: none;
}

/* \u2500\u2500 Backlinks section \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.backlinks-section {
  border-top: 1px solid var(--border);
  margin-top: 2rem;
  padding-top: 1rem;
}
.backlinks-section h3 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--ink-wash);
  margin-top: 0;
  margin-bottom: 0.5rem;
}
.backlinks-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.backlinks-list li {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}
/* Non-clickable backlink source (no rendered page): muted, not a link. */
.backlink-dangling {
  color: var(--ink-wash);
  text-decoration: none;
  cursor: default;
}

/* Non-clickable node reference (no rendered doc page, e.g. a KG-only node):
   muted, not a link. Used by diagrams.ts and orphan.ts spine/orphan cells. */
.node-link-nodoc {
  color: var(--ink-wash);
  text-decoration: none;
  cursor: default;
}

/* \u2500\u2500 Table of contents \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.toc {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  max-width: 36rem;
}
.toc-title {
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-wash);
  margin-bottom: 0.5rem;
}
.toc ol, .toc ul { margin: 0 0 0 1.25rem; padding: 0; }
.toc li { margin-bottom: 0.15rem; }
.toc a { color: var(--accent-dk); text-decoration: none; }
.toc a:hover { text-decoration: underline; }

/* \u2500\u2500 Document body content \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.doc-body h1 { margin-top: 0; margin-bottom: 1rem; }
.doc-body h2 { padding-top: 0.5rem; border-top: 1px solid var(--border); }
.doc-body blockquote {
  border-left: 4px solid var(--border);
  margin-left: 0;
  padding-left: 1rem;
  color: var(--ink-wash);
  font-style: italic;
}
.doc-body table { font-size: 0.875rem; border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
.doc-body table th, .doc-body table td {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--border);
  text-align: left;
}
.doc-body table th { background: var(--surface-alt); font-weight: 600; }
.doc-body table tr:hover td { background: var(--surface-alt); }
.doc-body img { max-width: 100%; border-radius: var(--radius); }
.doc-body hr { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; }

/* \u2500\u2500 Search page \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

.search-input-wrap {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
#search-input {
  flex: 1;
  padding: 0.6rem 0.9rem;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  font-family: var(--font);
  font-size: 1rem;
  background: var(--surface);
  color: var(--ink);
  outline: none;
  transition: border-color 0.15s;
}
#search-input:focus { border-color: var(--accent); }
#search-btn {
  padding: 0.6rem 1.2rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-family: var(--font);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
#search-btn:hover { background: var(--accent-dk); }
#search-results { list-style: none; margin: 0; padding: 0; }
#search-results li {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}
#search-results li a { font-weight: 600; }
#search-results li .result-kind {
  font-size: 0.75rem;
  color: var(--ink-wash);
  margin-left: 0.5rem;
  font-family: ui-monospace, Consolas, monospace;
}
#search-results li p {
  font-size: 0.85rem;
  color: var(--ink-wash);
  margin: 0.25rem 0 0;
  max-width: none;
}
#search-status { font-size: 0.875rem; color: var(--ink-wash); margin-bottom: 0.75rem; }

/* \u2500\u2500 Footer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

footer {
  margin-top: auto;
  font-size: 0.8rem;
  color: var(--ink-wash);
  text-align: center;
  border-top: 1px solid var(--border);
  padding: var(--gap) calc(var(--gap) * 2);
  background: var(--surface);
}

/* \u2500\u2500 Responsive \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

@media (max-width: 680px) {
  .site-nav { gap: 0.5rem; height: auto; padding: 0.5rem 1rem; flex-wrap: wrap; }
  .hero { padding: 1.5rem 1rem; }
  .hero h1 { font-size: 1.5rem; }
  .content-wrap { padding: 1rem 0.75rem; }
  .card-grid { grid-template-columns: 1fr; }
  .nav-search input[type="search"] { width: 8rem; }
  p { max-width: 100%; }
}

/* \u2500\u2500 Reduced motion \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

// lib/knowledge-atlas/src/render/layout.ts
var NO_NAV_FLAGS = { hasGraphPage: false, hasDiagramsPage: false, hasOrphansPage: false };
function buildNavLinksHtml(baseHref, flags = NO_NAV_FLAGS, current) {
  const base = esc(baseHref);
  const link2 = (href, label, key) => {
    const aria = current === key ? ' aria-current="page"' : "";
    return `<a href="${base}${href}"${aria}>${label}</a>`;
  };
  const links = [link2("index.html", "Home", "home")];
  if (flags.hasGraphPage) links.push(link2("graph.html", "Graph", "graph"));
  if (flags.hasDiagramsPage) links.push(link2("diagrams.html", "Diagrams", "diagrams"));
  if (flags.hasOrphansPage) links.push(link2("orphans.html", "Orphans", "orphans"));
  links.push(link2("search.html", "Search", "search"));
  return links.join("\n");
}
function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function renderSearchBoxHtml(baseHref = "") {
  return [
    `<form class="nav-search" action="${esc(baseHref)}search.html" method="get" role="search" aria-label="Site search">`,
    '<input type="search" name="q" placeholder="Search\u2026" aria-label="Search">',
    '<button type="submit">Go</button>',
    "</form>"
  ].join("\n");
}
function pageShell(opts) {
  const { title, body, manifest, pageType = "home", scripts = [], nav, navFlags, baseHref = "" } = opts;
  const { projectTitle, generatedAt } = manifest;
  const escapedTitle = esc(title);
  const escapedProjectTitle = esc(projectTitle);
  const escapedGeneratedAt = esc(generatedAt);
  const escapedBase = esc(baseHref);
  const bodyClass = `page-type-${pageType}`;
  const navCurrent = pageType === "home" ? "home" : pageType === "search" ? "search" : "document";
  const navLinksHtml = buildNavLinksHtml(baseHref, navFlags, navCurrent);
  const navExtras = nav ? `
${nav}` : "";
  const scriptBlocks = scripts.length > 0 ? `
${scripts.join("\n")}` : "";
  const lines = [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapedTitle} \u2014 ${escapedProjectTitle} Knowledge Atlas</title>`,
    `<meta name="description" content="Knowledge Atlas: ${escapedTitle} \u2014 ${escapedProjectTitle}">`,
    "<style>",
    DESIGN_SYSTEM_CSS.trimEnd(),
    "</style>",
    "</head>",
    "<body>",
    `<div class="page-body ${bodyClass}">`,
    '<a href="#main-content" class="skip-link">Skip to content</a>',
    '<div class="page-wrap">',
    '<nav class="site-nav" aria-label="Site navigation">',
    `<a href="${escapedBase}index.html" class="nav-brand">${escapedProjectTitle}</a>`,
    navLinksHtml,
    navExtras,
    renderSearchBoxHtml(baseHref),
    "</nav>",
    '<main id="main-content" tabindex="-1">',
    body,
    "</main>",
    '<footer role="contentinfo">',
    `Knowledge Atlas \xB7 Generated at: ${escapedGeneratedAt}`,
    "</footer>",
    "</div>",
    scriptBlocks,
    "</div>",
    "</body>",
    "</html>",
    ""
    // trailing newline
  ];
  return lines.join("\n");
}

// lib/knowledge-atlas/src/render/document.ts
var fs6 = __toESM(require("fs"));
var path6 = __toESM(require("path"));

// node_modules/markdown-it/lib/common/utils.mjs
var utils_exports = {};
__export(utils_exports, {
  arrayReplaceAt: () => arrayReplaceAt,
  asciiTrim: () => asciiTrim,
  assign: () => assign,
  escapeHtml: () => escapeHtml,
  escapeRE: () => escapeRE,
  fromCodePoint: () => fromCodePoint2,
  has: () => has,
  isMdAsciiPunct: () => isMdAsciiPunct,
  isPunctChar: () => isPunctChar,
  isPunctCharCode: () => isPunctCharCode,
  isSpace: () => isSpace,
  isString: () => isString,
  isValidEntityCode: () => isValidEntityCode,
  isWhiteSpace: () => isWhiteSpace,
  lib: () => lib,
  normalizeReference: () => normalizeReference,
  unescapeAll: () => unescapeAll,
  unescapeMd: () => unescapeMd
});

// node_modules/mdurl/index.mjs
var mdurl_exports = {};
__export(mdurl_exports, {
  decode: () => decode_default,
  encode: () => encode_default,
  format: () => format,
  parse: () => parse_default
});

// node_modules/mdurl/lib/decode.mjs
var decodeCache = {};
function getDecodeCache(exclude) {
  let cache = decodeCache[exclude];
  if (cache) {
    return cache;
  }
  cache = decodeCache[exclude] = [];
  for (let i2 = 0; i2 < 128; i2++) {
    const ch = String.fromCharCode(i2);
    cache.push(ch);
  }
  for (let i2 = 0; i2 < exclude.length; i2++) {
    const ch = exclude.charCodeAt(i2);
    cache[ch] = "%" + ("0" + ch.toString(16).toUpperCase()).slice(-2);
  }
  return cache;
}
function decode(string, exclude) {
  if (typeof exclude !== "string") {
    exclude = decode.defaultChars;
  }
  const cache = getDecodeCache(exclude);
  return string.replace(/(%[a-f0-9]{2})+/gi, function(seq2) {
    let result = "";
    for (let i2 = 0, l = seq2.length; i2 < l; i2 += 3) {
      const b1 = parseInt(seq2.slice(i2 + 1, i2 + 3), 16);
      if (b1 < 128) {
        result += cache[b1];
        continue;
      }
      if ((b1 & 224) === 192 && i2 + 3 < l) {
        const b2 = parseInt(seq2.slice(i2 + 4, i2 + 6), 16);
        if ((b2 & 192) === 128) {
          const chr = b1 << 6 & 1984 | b2 & 63;
          if (chr < 128) {
            result += "\uFFFD\uFFFD";
          } else {
            result += String.fromCharCode(chr);
          }
          i2 += 3;
          continue;
        }
      }
      if ((b1 & 240) === 224 && i2 + 6 < l) {
        const b2 = parseInt(seq2.slice(i2 + 4, i2 + 6), 16);
        const b3 = parseInt(seq2.slice(i2 + 7, i2 + 9), 16);
        if ((b2 & 192) === 128 && (b3 & 192) === 128) {
          const chr = b1 << 12 & 61440 | b2 << 6 & 4032 | b3 & 63;
          if (chr < 2048 || chr >= 55296 && chr <= 57343) {
            result += "\uFFFD\uFFFD\uFFFD";
          } else {
            result += String.fromCharCode(chr);
          }
          i2 += 6;
          continue;
        }
      }
      if ((b1 & 248) === 240 && i2 + 9 < l) {
        const b2 = parseInt(seq2.slice(i2 + 4, i2 + 6), 16);
        const b3 = parseInt(seq2.slice(i2 + 7, i2 + 9), 16);
        const b4 = parseInt(seq2.slice(i2 + 10, i2 + 12), 16);
        if ((b2 & 192) === 128 && (b3 & 192) === 128 && (b4 & 192) === 128) {
          let chr = b1 << 18 & 1835008 | b2 << 12 & 258048 | b3 << 6 & 4032 | b4 & 63;
          if (chr < 65536 || chr > 1114111) {
            result += "\uFFFD\uFFFD\uFFFD\uFFFD";
          } else {
            chr -= 65536;
            result += String.fromCharCode(55296 + (chr >> 10), 56320 + (chr & 1023));
          }
          i2 += 9;
          continue;
        }
      }
      result += "\uFFFD";
    }
    return result;
  });
}
decode.defaultChars = ";/?:@&=+$,#";
decode.componentChars = "";
var decode_default = decode;

// node_modules/mdurl/lib/encode.mjs
var encodeCache = {};
function getEncodeCache(exclude) {
  let cache = encodeCache[exclude];
  if (cache) {
    return cache;
  }
  cache = encodeCache[exclude] = [];
  for (let i2 = 0; i2 < 128; i2++) {
    const ch = String.fromCharCode(i2);
    if (/^[0-9a-z]$/i.test(ch)) {
      cache.push(ch);
    } else {
      cache.push("%" + ("0" + i2.toString(16).toUpperCase()).slice(-2));
    }
  }
  for (let i2 = 0; i2 < exclude.length; i2++) {
    cache[exclude.charCodeAt(i2)] = exclude[i2];
  }
  return cache;
}
function encode(string, exclude, keepEscaped) {
  if (typeof exclude !== "string") {
    keepEscaped = exclude;
    exclude = encode.defaultChars;
  }
  if (typeof keepEscaped === "undefined") {
    keepEscaped = true;
  }
  const cache = getEncodeCache(exclude);
  let result = "";
  for (let i2 = 0, l = string.length; i2 < l; i2++) {
    const code2 = string.charCodeAt(i2);
    if (keepEscaped && code2 === 37 && i2 + 2 < l) {
      if (/^[0-9a-f]{2}$/i.test(string.slice(i2 + 1, i2 + 3))) {
        result += string.slice(i2, i2 + 3);
        i2 += 2;
        continue;
      }
    }
    if (code2 < 128) {
      result += cache[code2];
      continue;
    }
    if (code2 >= 55296 && code2 <= 57343) {
      if (code2 >= 55296 && code2 <= 56319 && i2 + 1 < l) {
        const nextCode = string.charCodeAt(i2 + 1);
        if (nextCode >= 56320 && nextCode <= 57343) {
          result += encodeURIComponent(string[i2] + string[i2 + 1]);
          i2++;
          continue;
        }
      }
      result += "%EF%BF%BD";
      continue;
    }
    result += encodeURIComponent(string[i2]);
  }
  return result;
}
encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
encode.componentChars = "-_.!~*'()";
var encode_default = encode;

// node_modules/mdurl/lib/format.mjs
function format(url) {
  let result = "";
  result += url.protocol || "";
  result += url.slashes ? "//" : "";
  result += url.auth ? url.auth + "@" : "";
  if (url.hostname && url.hostname.indexOf(":") !== -1) {
    result += "[" + url.hostname + "]";
  } else {
    result += url.hostname || "";
  }
  result += url.port ? ":" + url.port : "";
  result += url.pathname || "";
  result += url.search || "";
  result += url.hash || "";
  return result;
}

// node_modules/mdurl/lib/parse.mjs
function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.pathname = null;
}
var protocolPattern = /^([a-z0-9.+-]+:)/i;
var portPattern = /:[0-9]*$/;
var simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
var delims = ["<", ">", '"', "`", " ", "\r", "\n", "	"];
var unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims);
var autoEscape = ["'"].concat(unwise);
var nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape);
var hostEndingChars = ["/", "?", "#"];
var hostnameMaxLen = 255;
var hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
var hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
var hostlessProtocol = {
  javascript: true,
  "javascript:": true
};
var slashedProtocol = {
  http: true,
  https: true,
  ftp: true,
  gopher: true,
  file: true,
  "http:": true,
  "https:": true,
  "ftp:": true,
  "gopher:": true,
  "file:": true
};
function urlParse(url, slashesDenoteHost) {
  if (url && url instanceof Url) return url;
  const u = new Url();
  u.parse(url, slashesDenoteHost);
  return u;
}
Url.prototype.parse = function(url, slashesDenoteHost) {
  let lowerProto, hec, slashes;
  let rest = url;
  rest = rest.trim();
  if (!slashesDenoteHost && url.split("#").length === 1) {
    const simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
      }
      return this;
    }
  }
  let proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    lowerProto = proto.toLowerCase();
    this.protocol = proto;
    rest = rest.substr(proto.length);
  }
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    slashes = rest.substr(0, 2) === "//";
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }
  if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
    let hostEnd = -1;
    for (let i2 = 0; i2 < hostEndingChars.length; i2++) {
      hec = rest.indexOf(hostEndingChars[i2]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    let auth, atSign;
    if (hostEnd === -1) {
      atSign = rest.lastIndexOf("@");
    } else {
      atSign = rest.lastIndexOf("@", hostEnd);
    }
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = auth;
    }
    hostEnd = -1;
    for (let i2 = 0; i2 < nonHostChars.length; i2++) {
      hec = rest.indexOf(nonHostChars[i2]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    if (hostEnd === -1) {
      hostEnd = rest.length;
    }
    if (rest[hostEnd - 1] === ":") {
      hostEnd--;
    }
    const host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);
    this.parseHost(host);
    this.hostname = this.hostname || "";
    const ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
    if (!ipv6Hostname) {
      const hostparts = this.hostname.split(/\./);
      for (let i2 = 0, l = hostparts.length; i2 < l; i2++) {
        const part = hostparts[i2];
        if (!part) {
          continue;
        }
        if (!part.match(hostnamePartPattern)) {
          let newpart = "";
          for (let j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              newpart += "x";
            } else {
              newpart += part[j];
            }
          }
          if (!newpart.match(hostnamePartPattern)) {
            const validParts = hostparts.slice(0, i2);
            const notHost = hostparts.slice(i2 + 1);
            const bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = notHost.join(".") + rest;
            }
            this.hostname = validParts.join(".");
            break;
          }
        }
      }
    }
    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = "";
    }
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
    }
  }
  const hash = rest.indexOf("#");
  if (hash !== -1) {
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  const qm = rest.indexOf("?");
  if (qm !== -1) {
    this.search = rest.substr(qm);
    rest = rest.slice(0, qm);
  }
  if (rest) {
    this.pathname = rest;
  }
  if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
    this.pathname = "";
  }
  return this;
};
Url.prototype.parseHost = function(host) {
  let port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ":") {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) {
    this.hostname = host;
  }
};
var parse_default = urlParse;

// node_modules/uc.micro/index.mjs
var uc_exports = {};
__export(uc_exports, {
  Any: () => regex_default,
  Cc: () => regex_default2,
  Cf: () => regex_default3,
  P: () => regex_default4,
  S: () => regex_default5,
  Z: () => regex_default6
});

// node_modules/uc.micro/properties/Any/regex.mjs
var regex_default = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;

// node_modules/uc.micro/categories/Cc/regex.mjs
var regex_default2 = /[\0-\x1F\x7F-\x9F]/;

// node_modules/uc.micro/categories/Cf/regex.mjs
var regex_default3 = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;

// node_modules/uc.micro/categories/P/regex.mjs
var regex_default4 = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/;

// node_modules/uc.micro/categories/S/regex.mjs
var regex_default5 = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/;

// node_modules/uc.micro/categories/Z/regex.mjs
var regex_default6 = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;

// node_modules/entities/lib/esm/generated/decode-data-html.js
var decode_data_html_default = new Uint16Array(
  // prettier-ignore
  '\u1D41<\xD5\u0131\u028A\u049D\u057B\u05D0\u0675\u06DE\u07A2\u07D6\u080F\u0A4A\u0A91\u0DA1\u0E6D\u0F09\u0F26\u10CA\u1228\u12E1\u1415\u149D\u14C3\u14DF\u1525\0\0\0\0\0\0\u156B\u16CD\u198D\u1C12\u1DDD\u1F7E\u2060\u21B0\u228D\u23C0\u23FB\u2442\u2824\u2912\u2D08\u2E48\u2FCE\u3016\u32BA\u3639\u37AC\u38FE\u3A28\u3A71\u3AE0\u3B2E\u0800EMabcfglmnoprstu\\bfms\x7F\x84\x8B\x90\x95\x98\xA6\xB3\xB9\xC8\xCFlig\u803B\xC6\u40C6P\u803B&\u4026cute\u803B\xC1\u40C1reve;\u4102\u0100iyx}rc\u803B\xC2\u40C2;\u4410r;\uC000\u{1D504}rave\u803B\xC0\u40C0pha;\u4391acr;\u4100d;\u6A53\u0100gp\x9D\xA1on;\u4104f;\uC000\u{1D538}plyFunction;\u6061ing\u803B\xC5\u40C5\u0100cs\xBE\xC3r;\uC000\u{1D49C}ign;\u6254ilde\u803B\xC3\u40C3ml\u803B\xC4\u40C4\u0400aceforsu\xE5\xFB\xFE\u0117\u011C\u0122\u0127\u012A\u0100cr\xEA\xF2kslash;\u6216\u0176\xF6\xF8;\u6AE7ed;\u6306y;\u4411\u0180crt\u0105\u010B\u0114ause;\u6235noullis;\u612Ca;\u4392r;\uC000\u{1D505}pf;\uC000\u{1D539}eve;\u42D8c\xF2\u0113mpeq;\u624E\u0700HOacdefhilorsu\u014D\u0151\u0156\u0180\u019E\u01A2\u01B5\u01B7\u01BA\u01DC\u0215\u0273\u0278\u027Ecy;\u4427PY\u803B\xA9\u40A9\u0180cpy\u015D\u0162\u017Aute;\u4106\u0100;i\u0167\u0168\u62D2talDifferentialD;\u6145leys;\u612D\u0200aeio\u0189\u018E\u0194\u0198ron;\u410Cdil\u803B\xC7\u40C7rc;\u4108nint;\u6230ot;\u410A\u0100dn\u01A7\u01ADilla;\u40B8terDot;\u40B7\xF2\u017Fi;\u43A7rcle\u0200DMPT\u01C7\u01CB\u01D1\u01D6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01E2\u01F8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020FoubleQuote;\u601Duote;\u6019\u0200lnpu\u021E\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6A74\u0180git\u022F\u0236\u023Aruent;\u6261nt;\u622FourIntegral;\u622E\u0100fr\u024C\u024E;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6A2Fcr;\uC000\u{1D49E}p\u0100;C\u0284\u0285\u62D3ap;\u624D\u0580DJSZacefios\u02A0\u02AC\u02B0\u02B4\u02B8\u02CB\u02D7\u02E1\u02E6\u0333\u048D\u0100;o\u0179\u02A5trahd;\u6911cy;\u4402cy;\u4405cy;\u440F\u0180grs\u02BF\u02C4\u02C7ger;\u6021r;\u61A1hv;\u6AE4\u0100ay\u02D0\u02D5ron;\u410E;\u4414l\u0100;t\u02DD\u02DE\u6207a;\u4394r;\uC000\u{1D507}\u0100af\u02EB\u0327\u0100cm\u02F0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031Ccute;\u40B4o\u0174\u030B\u030D;\u42D9bleAcute;\u42DDrave;\u4060ilde;\u42DCond;\u62C4ferentialD;\u6146\u0470\u033D\0\0\0\u0342\u0354\0\u0405f;\uC000\u{1D53B}\u0180;DE\u0348\u0349\u034D\u40A8ot;\u60DCqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03CF\u03E2\u03F8ontourIntegra\xEC\u0239o\u0274\u0379\0\0\u037B\xBB\u0349nArrow;\u61D3\u0100eo\u0387\u03A4ft\u0180ART\u0390\u0396\u03A1rrow;\u61D0ightArrow;\u61D4e\xE5\u02CAng\u0100LR\u03AB\u03C4eft\u0100AR\u03B3\u03B9rrow;\u67F8ightArrow;\u67FAightArrow;\u67F9ight\u0100AT\u03D8\u03DErrow;\u61D2ee;\u62A8p\u0241\u03E9\0\0\u03EFrrow;\u61D1ownArrow;\u61D5erticalBar;\u6225n\u0300ABLRTa\u0412\u042A\u0430\u045E\u047F\u037Crrow\u0180;BU\u041D\u041E\u0422\u6193ar;\u6913pArrow;\u61F5reve;\u4311eft\u02D2\u043A\0\u0446\0\u0450ightVector;\u6950eeVector;\u695Eector\u0100;B\u0459\u045A\u61BDar;\u6956ight\u01D4\u0467\0\u0471eeVector;\u695Fector\u0100;B\u047A\u047B\u61C1ar;\u6957ee\u0100;A\u0486\u0487\u62A4rrow;\u61A7\u0100ct\u0492\u0497r;\uC000\u{1D49F}rok;\u4110\u0800NTacdfglmopqstux\u04BD\u04C0\u04C4\u04CB\u04DE\u04E2\u04E7\u04EE\u04F5\u0521\u052F\u0536\u0552\u055D\u0560\u0565G;\u414AH\u803B\xD0\u40D0cute\u803B\xC9\u40C9\u0180aiy\u04D2\u04D7\u04DCron;\u411Arc\u803B\xCA\u40CA;\u442Dot;\u4116r;\uC000\u{1D508}rave\u803B\xC8\u40C8ement;\u6208\u0100ap\u04FA\u04FEcr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65FBerySmallSquare;\u65AB\u0100gp\u0526\u052Aon;\u4118f;\uC000\u{1D53C}silon;\u4395u\u0100ai\u053C\u0549l\u0100;T\u0542\u0543\u6A75ilde;\u6242librium;\u61CC\u0100ci\u0557\u055Ar;\u6130m;\u6A73a;\u4397ml\u803B\xCB\u40CB\u0100ip\u056A\u056Fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058D\u05B2\u05CCy;\u4424r;\uC000\u{1D509}lled\u0253\u0597\0\0\u05A3mallSquare;\u65FCerySmallSquare;\u65AA\u0370\u05BA\0\u05BF\0\0\u05C4f;\uC000\u{1D53D}All;\u6200riertrf;\u6131c\xF2\u05CB\u0600JTabcdfgorst\u05E8\u05EC\u05EF\u05FA\u0600\u0612\u0616\u061B\u061D\u0623\u066C\u0672cy;\u4403\u803B>\u403Emma\u0100;d\u05F7\u05F8\u4393;\u43DCreve;\u411E\u0180eiy\u0607\u060C\u0610dil;\u4122rc;\u411C;\u4413ot;\u4120r;\uC000\u{1D50A};\u62D9pf;\uC000\u{1D53E}eater\u0300EFGLST\u0635\u0644\u064E\u0656\u065B\u0666qual\u0100;L\u063E\u063F\u6265ess;\u62DBullEqual;\u6267reater;\u6AA2ess;\u6277lantEqual;\u6A7Eilde;\u6273cr;\uC000\u{1D4A2};\u626B\u0400Aacfiosu\u0685\u068B\u0696\u069B\u069E\u06AA\u06BE\u06CARDcy;\u442A\u0100ct\u0690\u0694ek;\u42C7;\u405Eirc;\u4124r;\u610ClbertSpace;\u610B\u01F0\u06AF\0\u06B2f;\u610DizontalLine;\u6500\u0100ct\u06C3\u06C5\xF2\u06A9rok;\u4126mp\u0144\u06D0\u06D8ownHum\xF0\u012Fqual;\u624F\u0700EJOacdfgmnostu\u06FA\u06FE\u0703\u0707\u070E\u071A\u071E\u0721\u0728\u0744\u0778\u078B\u078F\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803B\xCD\u40CD\u0100iy\u0713\u0718rc\u803B\xCE\u40CE;\u4418ot;\u4130r;\u6111rave\u803B\xCC\u40CC\u0180;ap\u0720\u072F\u073F\u0100cg\u0734\u0737r;\u412AinaryI;\u6148lie\xF3\u03DD\u01F4\u0749\0\u0762\u0100;e\u074D\u074E\u622C\u0100gr\u0753\u0758ral;\u622Bsection;\u62C2isible\u0100CT\u076C\u0772omma;\u6063imes;\u6062\u0180gpt\u077F\u0783\u0788on;\u412Ef;\uC000\u{1D540}a;\u4399cr;\u6110ilde;\u4128\u01EB\u079A\0\u079Ecy;\u4406l\u803B\xCF\u40CF\u0280cfosu\u07AC\u07B7\u07BC\u07C2\u07D0\u0100iy\u07B1\u07B5rc;\u4134;\u4419r;\uC000\u{1D50D}pf;\uC000\u{1D541}\u01E3\u07C7\0\u07CCr;\uC000\u{1D4A5}rcy;\u4408kcy;\u4404\u0380HJacfos\u07E4\u07E8\u07EC\u07F1\u07FD\u0802\u0808cy;\u4425cy;\u440Cppa;\u439A\u0100ey\u07F6\u07FBdil;\u4136;\u441Ar;\uC000\u{1D50E}pf;\uC000\u{1D542}cr;\uC000\u{1D4A6}\u0580JTaceflmost\u0825\u0829\u082C\u0850\u0863\u09B3\u09B8\u09C7\u09CD\u0A37\u0A47cy;\u4409\u803B<\u403C\u0280cmnpr\u0837\u083C\u0841\u0844\u084Dute;\u4139bda;\u439Bg;\u67EAlacetrf;\u6112r;\u619E\u0180aey\u0857\u085C\u0861ron;\u413Ddil;\u413B;\u441B\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087E\u08A9\u08B1\u08E0\u08E6\u08FC\u092F\u095B\u0390\u096A\u0100nr\u0883\u088FgleBracket;\u67E8row\u0180;BR\u0899\u089A\u089E\u6190ar;\u61E4ightArrow;\u61C6eiling;\u6308o\u01F5\u08B7\0\u08C3bleBracket;\u67E6n\u01D4\u08C8\0\u08D2eeVector;\u6961ector\u0100;B\u08DB\u08DC\u61C3ar;\u6959loor;\u630Aight\u0100AV\u08EF\u08F5rrow;\u6194ector;\u694E\u0100er\u0901\u0917e\u0180;AV\u0909\u090A\u0910\u62A3rrow;\u61A4ector;\u695Aiangle\u0180;BE\u0924\u0925\u0929\u62B2ar;\u69CFqual;\u62B4p\u0180DTV\u0937\u0942\u094CownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61BFar;\u6958ector\u0100;B\u0965\u0966\u61BCar;\u6952ight\xE1\u039Cs\u0300EFGLST\u097E\u098B\u0995\u099D\u09A2\u09ADqualGreater;\u62DAullEqual;\u6266reater;\u6276ess;\u6AA1lantEqual;\u6A7Dilde;\u6272r;\uC000\u{1D50F}\u0100;e\u09BD\u09BE\u62D8ftarrow;\u61DAidot;\u413F\u0180npw\u09D4\u0A16\u0A1Bg\u0200LRlr\u09DE\u09F7\u0A02\u0A10eft\u0100AR\u09E6\u09ECrrow;\u67F5ightArrow;\u67F7ightArrow;\u67F6eft\u0100ar\u03B3\u0A0Aight\xE1\u03BFight\xE1\u03CAf;\uC000\u{1D543}er\u0100LR\u0A22\u0A2CeftArrow;\u6199ightArrow;\u6198\u0180cht\u0A3E\u0A40\u0A42\xF2\u084C;\u61B0rok;\u4141;\u626A\u0400acefiosu\u0A5A\u0A5D\u0A60\u0A77\u0A7C\u0A85\u0A8B\u0A8Ep;\u6905y;\u441C\u0100dl\u0A65\u0A6FiumSpace;\u605Flintrf;\u6133r;\uC000\u{1D510}nusPlus;\u6213pf;\uC000\u{1D544}c\xF2\u0A76;\u439C\u0480Jacefostu\u0AA3\u0AA7\u0AAD\u0AC0\u0B14\u0B19\u0D91\u0D97\u0D9Ecy;\u440Acute;\u4143\u0180aey\u0AB4\u0AB9\u0ABEron;\u4147dil;\u4145;\u441D\u0180gsw\u0AC7\u0AF0\u0B0Eative\u0180MTV\u0AD3\u0ADF\u0AE8ediumSpace;\u600Bhi\u0100cn\u0AE6\u0AD8\xEB\u0AD9eryThi\xEE\u0AD9ted\u0100GL\u0AF8\u0B06reaterGreate\xF2\u0673essLes\xF3\u0A48Line;\u400Ar;\uC000\u{1D511}\u0200Bnpt\u0B22\u0B28\u0B37\u0B3Areak;\u6060BreakingSpace;\u40A0f;\u6115\u0680;CDEGHLNPRSTV\u0B55\u0B56\u0B6A\u0B7C\u0BA1\u0BEB\u0C04\u0C5E\u0C84\u0CA6\u0CD8\u0D61\u0D85\u6AEC\u0100ou\u0B5B\u0B64ngruent;\u6262pCap;\u626DoubleVerticalBar;\u6226\u0180lqx\u0B83\u0B8A\u0B9Bement;\u6209ual\u0100;T\u0B92\u0B93\u6260ilde;\uC000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0BB6\u0BB7\u0BBD\u0BC9\u0BD3\u0BD8\u0BE5\u626Fqual;\u6271ullEqual;\uC000\u2267\u0338reater;\uC000\u226B\u0338ess;\u6279lantEqual;\uC000\u2A7E\u0338ilde;\u6275ump\u0144\u0BF2\u0BFDownHump;\uC000\u224E\u0338qual;\uC000\u224F\u0338e\u0100fs\u0C0A\u0C27tTriangle\u0180;BE\u0C1A\u0C1B\u0C21\u62EAar;\uC000\u29CF\u0338qual;\u62ECs\u0300;EGLST\u0C35\u0C36\u0C3C\u0C44\u0C4B\u0C58\u626Equal;\u6270reater;\u6278ess;\uC000\u226A\u0338lantEqual;\uC000\u2A7D\u0338ilde;\u6274ested\u0100GL\u0C68\u0C79reaterGreater;\uC000\u2AA2\u0338essLess;\uC000\u2AA1\u0338recedes\u0180;ES\u0C92\u0C93\u0C9B\u6280qual;\uC000\u2AAF\u0338lantEqual;\u62E0\u0100ei\u0CAB\u0CB9verseElement;\u620CghtTriangle\u0180;BE\u0CCB\u0CCC\u0CD2\u62EBar;\uC000\u29D0\u0338qual;\u62ED\u0100qu\u0CDD\u0D0CuareSu\u0100bp\u0CE8\u0CF9set\u0100;E\u0CF0\u0CF3\uC000\u228F\u0338qual;\u62E2erset\u0100;E\u0D03\u0D06\uC000\u2290\u0338qual;\u62E3\u0180bcp\u0D13\u0D24\u0D4Eset\u0100;E\u0D1B\u0D1E\uC000\u2282\u20D2qual;\u6288ceeds\u0200;EST\u0D32\u0D33\u0D3B\u0D46\u6281qual;\uC000\u2AB0\u0338lantEqual;\u62E1ilde;\uC000\u227F\u0338erset\u0100;E\u0D58\u0D5B\uC000\u2283\u20D2qual;\u6289ilde\u0200;EFT\u0D6E\u0D6F\u0D75\u0D7F\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uC000\u{1D4A9}ilde\u803B\xD1\u40D1;\u439D\u0700Eacdfgmoprstuv\u0DBD\u0DC2\u0DC9\u0DD5\u0DDB\u0DE0\u0DE7\u0DFC\u0E02\u0E20\u0E22\u0E32\u0E3F\u0E44lig;\u4152cute\u803B\xD3\u40D3\u0100iy\u0DCE\u0DD3rc\u803B\xD4\u40D4;\u441Eblac;\u4150r;\uC000\u{1D512}rave\u803B\xD2\u40D2\u0180aei\u0DEE\u0DF2\u0DF6cr;\u414Cga;\u43A9cron;\u439Fpf;\uC000\u{1D546}enCurly\u0100DQ\u0E0E\u0E1AoubleQuote;\u601Cuote;\u6018;\u6A54\u0100cl\u0E27\u0E2Cr;\uC000\u{1D4AA}ash\u803B\xD8\u40D8i\u016C\u0E37\u0E3Cde\u803B\xD5\u40D5es;\u6A37ml\u803B\xD6\u40D6er\u0100BP\u0E4B\u0E60\u0100ar\u0E50\u0E53r;\u603Eac\u0100ek\u0E5A\u0E5C;\u63DEet;\u63B4arenthesis;\u63DC\u0480acfhilors\u0E7F\u0E87\u0E8A\u0E8F\u0E92\u0E94\u0E9D\u0EB0\u0EFCrtialD;\u6202y;\u441Fr;\uC000\u{1D513}i;\u43A6;\u43A0usMinus;\u40B1\u0100ip\u0EA2\u0EADncareplan\xE5\u069Df;\u6119\u0200;eio\u0EB9\u0EBA\u0EE0\u0EE4\u6ABBcedes\u0200;EST\u0EC8\u0EC9\u0ECF\u0EDA\u627Aqual;\u6AAFlantEqual;\u627Cilde;\u627Eme;\u6033\u0100dp\u0EE9\u0EEEuct;\u620Fortion\u0100;a\u0225\u0EF9l;\u621D\u0100ci\u0F01\u0F06r;\uC000\u{1D4AB};\u43A8\u0200Ufos\u0F11\u0F16\u0F1B\u0F1FOT\u803B"\u4022r;\uC000\u{1D514}pf;\u611Acr;\uC000\u{1D4AC}\u0600BEacefhiorsu\u0F3E\u0F43\u0F47\u0F60\u0F73\u0FA7\u0FAA\u0FAD\u1096\u10A9\u10B4\u10BEarr;\u6910G\u803B\xAE\u40AE\u0180cnr\u0F4E\u0F53\u0F56ute;\u4154g;\u67EBr\u0100;t\u0F5C\u0F5D\u61A0l;\u6916\u0180aey\u0F67\u0F6C\u0F71ron;\u4158dil;\u4156;\u4420\u0100;v\u0F78\u0F79\u611Cerse\u0100EU\u0F82\u0F99\u0100lq\u0F87\u0F8Eement;\u620Builibrium;\u61CBpEquilibrium;\u696Fr\xBB\u0F79o;\u43A1ght\u0400ACDFTUVa\u0FC1\u0FEB\u0FF3\u1022\u1028\u105B\u1087\u03D8\u0100nr\u0FC6\u0FD2gleBracket;\u67E9row\u0180;BL\u0FDC\u0FDD\u0FE1\u6192ar;\u61E5eftArrow;\u61C4eiling;\u6309o\u01F5\u0FF9\0\u1005bleBracket;\u67E7n\u01D4\u100A\0\u1014eeVector;\u695Dector\u0100;B\u101D\u101E\u61C2ar;\u6955loor;\u630B\u0100er\u102D\u1043e\u0180;AV\u1035\u1036\u103C\u62A2rrow;\u61A6ector;\u695Biangle\u0180;BE\u1050\u1051\u1055\u62B3ar;\u69D0qual;\u62B5p\u0180DTV\u1063\u106E\u1078ownVector;\u694FeeVector;\u695Cector\u0100;B\u1082\u1083\u61BEar;\u6954ector\u0100;B\u1091\u1092\u61C0ar;\u6953\u0100pu\u109B\u109Ef;\u611DndImplies;\u6970ightarrow;\u61DB\u0100ch\u10B9\u10BCr;\u611B;\u61B1leDelayed;\u69F4\u0680HOacfhimoqstu\u10E4\u10F1\u10F7\u10FD\u1119\u111E\u1151\u1156\u1161\u1167\u11B5\u11BB\u11BF\u0100Cc\u10E9\u10EEHcy;\u4429y;\u4428FTcy;\u442Ccute;\u415A\u0280;aeiy\u1108\u1109\u110E\u1113\u1117\u6ABCron;\u4160dil;\u415Erc;\u415C;\u4421r;\uC000\u{1D516}ort\u0200DLRU\u112A\u1134\u113E\u1149ownArrow\xBB\u041EeftArrow\xBB\u089AightArrow\xBB\u0FDDpArrow;\u6191gma;\u43A3allCircle;\u6218pf;\uC000\u{1D54A}\u0272\u116D\0\0\u1170t;\u621Aare\u0200;ISU\u117B\u117C\u1189\u11AF\u65A1ntersection;\u6293u\u0100bp\u118F\u119Eset\u0100;E\u1197\u1198\u628Fqual;\u6291erset\u0100;E\u11A8\u11A9\u6290qual;\u6292nion;\u6294cr;\uC000\u{1D4AE}ar;\u62C6\u0200bcmp\u11C8\u11DB\u1209\u120B\u0100;s\u11CD\u11CE\u62D0et\u0100;E\u11CD\u11D5qual;\u6286\u0100ch\u11E0\u1205eeds\u0200;EST\u11ED\u11EE\u11F4\u11FF\u627Bqual;\u6AB0lantEqual;\u627Dilde;\u627FTh\xE1\u0F8C;\u6211\u0180;es\u1212\u1213\u1223\u62D1rset\u0100;E\u121C\u121D\u6283qual;\u6287et\xBB\u1213\u0580HRSacfhiors\u123E\u1244\u1249\u1255\u125E\u1271\u1276\u129F\u12C2\u12C8\u12D1ORN\u803B\xDE\u40DEADE;\u6122\u0100Hc\u124E\u1252cy;\u440By;\u4426\u0100bu\u125A\u125C;\u4009;\u43A4\u0180aey\u1265\u126A\u126Fron;\u4164dil;\u4162;\u4422r;\uC000\u{1D517}\u0100ei\u127B\u1289\u01F2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128E\u1298kSpace;\uC000\u205F\u200ASpace;\u6009lde\u0200;EFT\u12AB\u12AC\u12B2\u12BC\u623Cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uC000\u{1D54B}ipleDot;\u60DB\u0100ct\u12D6\u12DBr;\uC000\u{1D4AF}rok;\u4166\u0AE1\u12F7\u130E\u131A\u1326\0\u132C\u1331\0\0\0\0\0\u1338\u133D\u1377\u1385\0\u13FF\u1404\u140A\u1410\u0100cr\u12FB\u1301ute\u803B\xDA\u40DAr\u0100;o\u1307\u1308\u619Fcir;\u6949r\u01E3\u1313\0\u1316y;\u440Eve;\u416C\u0100iy\u131E\u1323rc\u803B\xDB\u40DB;\u4423blac;\u4170r;\uC000\u{1D518}rave\u803B\xD9\u40D9acr;\u416A\u0100di\u1341\u1369er\u0100BP\u1348\u135D\u0100ar\u134D\u1350r;\u405Fac\u0100ek\u1357\u1359;\u63DFet;\u63B5arenthesis;\u63DDon\u0100;P\u1370\u1371\u62C3lus;\u628E\u0100gp\u137B\u137Fon;\u4172f;\uC000\u{1D54C}\u0400ADETadps\u1395\u13AE\u13B8\u13C4\u03E8\u13D2\u13D7\u13F3rrow\u0180;BD\u1150\u13A0\u13A4ar;\u6912ownArrow;\u61C5ownArrow;\u6195quilibrium;\u696Eee\u0100;A\u13CB\u13CC\u62A5rrow;\u61A5own\xE1\u03F3er\u0100LR\u13DE\u13E8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13F9\u13FA\u43D2on;\u43A5ing;\u416Ecr;\uC000\u{1D4B0}ilde;\u4168ml\u803B\xDC\u40DC\u0480Dbcdefosv\u1427\u142C\u1430\u1433\u143E\u1485\u148A\u1490\u1496ash;\u62ABar;\u6AEBy;\u4412ash\u0100;l\u143B\u143C\u62A9;\u6AE6\u0100er\u1443\u1445;\u62C1\u0180bty\u144C\u1450\u147Aar;\u6016\u0100;i\u144F\u1455cal\u0200BLST\u1461\u1465\u146A\u1474ar;\u6223ine;\u407Ceparator;\u6758ilde;\u6240ThinSpace;\u600Ar;\uC000\u{1D519}pf;\uC000\u{1D54D}cr;\uC000\u{1D4B1}dash;\u62AA\u0280cefos\u14A7\u14AC\u14B1\u14B6\u14BCirc;\u4174dge;\u62C0r;\uC000\u{1D51A}pf;\uC000\u{1D54E}cr;\uC000\u{1D4B2}\u0200fios\u14CB\u14D0\u14D2\u14D8r;\uC000\u{1D51B};\u439Epf;\uC000\u{1D54F}cr;\uC000\u{1D4B3}\u0480AIUacfosu\u14F1\u14F5\u14F9\u14FD\u1504\u150F\u1514\u151A\u1520cy;\u442Fcy;\u4407cy;\u442Ecute\u803B\xDD\u40DD\u0100iy\u1509\u150Drc;\u4176;\u442Br;\uC000\u{1D51C}pf;\uC000\u{1D550}cr;\uC000\u{1D4B4}ml;\u4178\u0400Hacdefos\u1535\u1539\u153F\u154B\u154F\u155D\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417D;\u4417ot;\u417B\u01F2\u1554\0\u155BoWidt\xE8\u0AD9a;\u4396r;\u6128pf;\u6124cr;\uC000\u{1D4B5}\u0BE1\u1583\u158A\u1590\0\u15B0\u15B6\u15BF\0\0\0\0\u15C6\u15DB\u15EB\u165F\u166D\0\u1695\u169B\u16B2\u16B9\0\u16BEcute\u803B\xE1\u40E1reve;\u4103\u0300;Ediuy\u159C\u159D\u15A1\u15A3\u15A8\u15AD\u623E;\uC000\u223E\u0333;\u623Frc\u803B\xE2\u40E2te\u80BB\xB4\u0306;\u4430lig\u803B\xE6\u40E6\u0100;r\xB2\u15BA;\uC000\u{1D51E}rave\u803B\xE0\u40E0\u0100ep\u15CA\u15D6\u0100fp\u15CF\u15D4sym;\u6135\xE8\u15D3ha;\u43B1\u0100ap\u15DFc\u0100cl\u15E4\u15E7r;\u4101g;\u6A3F\u0264\u15F0\0\0\u160A\u0280;adsv\u15FA\u15FB\u15FF\u1601\u1607\u6227nd;\u6A55;\u6A5Clope;\u6A58;\u6A5A\u0380;elmrsz\u1618\u1619\u161B\u161E\u163F\u164F\u1659\u6220;\u69A4e\xBB\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163A\u163C\u163E;\u69A8;\u69A9;\u69AA;\u69AB;\u69AC;\u69AD;\u69AE;\u69AFt\u0100;v\u1645\u1646\u621Fb\u0100;d\u164C\u164D\u62BE;\u699D\u0100pt\u1654\u1657h;\u6222\xBB\xB9arr;\u637C\u0100gp\u1663\u1667on;\u4105f;\uC000\u{1D552}\u0380;Eaeiop\u12C1\u167B\u167D\u1682\u1684\u1687\u168A;\u6A70cir;\u6A6F;\u624Ad;\u624Bs;\u4027rox\u0100;e\u12C1\u1692\xF1\u1683ing\u803B\xE5\u40E5\u0180cty\u16A1\u16A6\u16A8r;\uC000\u{1D4B6};\u402Amp\u0100;e\u12C1\u16AF\xF1\u0288ilde\u803B\xE3\u40E3ml\u803B\xE4\u40E4\u0100ci\u16C2\u16C8onin\xF4\u0272nt;\u6A11\u0800Nabcdefiklnoprsu\u16ED\u16F1\u1730\u173C\u1743\u1748\u1778\u177D\u17E0\u17E6\u1839\u1850\u170D\u193D\u1948\u1970ot;\u6AED\u0100cr\u16F6\u171Ek\u0200ceps\u1700\u1705\u170D\u1713ong;\u624Cpsilon;\u43F6rime;\u6035im\u0100;e\u171A\u171B\u623Dq;\u62CD\u0176\u1722\u1726ee;\u62BDed\u0100;g\u172C\u172D\u6305e\xBB\u172Drk\u0100;t\u135C\u1737brk;\u63B6\u0100oy\u1701\u1741;\u4431quo;\u601E\u0280cmprt\u1753\u175B\u1761\u1764\u1768aus\u0100;e\u010A\u0109ptyv;\u69B0s\xE9\u170Cno\xF5\u0113\u0180ahw\u176F\u1771\u1773;\u43B2;\u6136een;\u626Cr;\uC000\u{1D51F}g\u0380costuvw\u178D\u179D\u17B3\u17C1\u17D5\u17DB\u17DE\u0180aiu\u1794\u1796\u179A\xF0\u0760rc;\u65EFp\xBB\u1371\u0180dpt\u17A4\u17A8\u17ADot;\u6A00lus;\u6A01imes;\u6A02\u0271\u17B9\0\0\u17BEcup;\u6A06ar;\u6605riangle\u0100du\u17CD\u17D2own;\u65BDp;\u65B3plus;\u6A04e\xE5\u1444\xE5\u14ADarow;\u690D\u0180ako\u17ED\u1826\u1835\u0100cn\u17F2\u1823k\u0180lst\u17FA\u05AB\u1802ozenge;\u69EBriangle\u0200;dlr\u1812\u1813\u1818\u181D\u65B4own;\u65BEeft;\u65C2ight;\u65B8k;\u6423\u01B1\u182B\0\u1833\u01B2\u182F\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183E\u184D\u0100;q\u1843\u1846\uC000=\u20E5uiv;\uC000\u2261\u20E5t;\u6310\u0200ptwx\u1859\u185E\u1867\u186Cf;\uC000\u{1D553}\u0100;t\u13CB\u1863om\xBB\u13CCtie;\u62C8\u0600DHUVbdhmptuv\u1885\u1896\u18AA\u18BB\u18D7\u18DB\u18EC\u18FF\u1905\u190A\u1910\u1921\u0200LRlr\u188E\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18A1\u18A2\u18A4\u18A6\u18A8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18B3\u18B5\u18B7\u18B9;\u655D;\u655A;\u655C;\u6559\u0380;HLRhlr\u18CA\u18CB\u18CD\u18CF\u18D1\u18D3\u18D5\u6551;\u656C;\u6563;\u6560;\u656B;\u6562;\u655Fox;\u69C9\u0200LRlr\u18E4\u18E6\u18E8\u18EA;\u6555;\u6552;\u6510;\u650C\u0280;DUdu\u06BD\u18F7\u18F9\u18FB\u18FD;\u6565;\u6568;\u652C;\u6534inus;\u629Flus;\u629Eimes;\u62A0\u0200LRlr\u1919\u191B\u191D\u191F;\u655B;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193B\u6502;\u656A;\u6561;\u655E;\u653C;\u6524;\u651C\u0100ev\u0123\u1942bar\u803B\xA6\u40A6\u0200ceio\u1951\u1956\u195A\u1960r;\uC000\u{1D4B7}mi;\u604Fm\u0100;e\u171A\u171Cl\u0180;bh\u1968\u1969\u196B\u405C;\u69C5sub;\u67C8\u016C\u1974\u197El\u0100;e\u1979\u197A\u6022t\xBB\u197Ap\u0180;Ee\u012F\u1985\u1987;\u6AAE\u0100;q\u06DC\u06DB\u0CE1\u19A7\0\u19E8\u1A11\u1A15\u1A32\0\u1A37\u1A50\0\0\u1AB4\0\0\u1AC1\0\0\u1B21\u1B2E\u1B4D\u1B52\0\u1BFD\0\u1C0C\u0180cpr\u19AD\u19B2\u19DDute;\u4107\u0300;abcds\u19BF\u19C0\u19C4\u19CA\u19D5\u19D9\u6229nd;\u6A44rcup;\u6A49\u0100au\u19CF\u19D2p;\u6A4Bp;\u6A47ot;\u6A40;\uC000\u2229\uFE00\u0100eo\u19E2\u19E5t;\u6041\xEE\u0693\u0200aeiu\u19F0\u19FB\u1A01\u1A05\u01F0\u19F5\0\u19F8s;\u6A4Don;\u410Ddil\u803B\xE7\u40E7rc;\u4109ps\u0100;s\u1A0C\u1A0D\u6A4Cm;\u6A50ot;\u410B\u0180dmn\u1A1B\u1A20\u1A26il\u80BB\xB8\u01ADptyv;\u69B2t\u8100\xA2;e\u1A2D\u1A2E\u40A2r\xE4\u01B2r;\uC000\u{1D520}\u0180cei\u1A3D\u1A40\u1A4Dy;\u4447ck\u0100;m\u1A47\u1A48\u6713ark\xBB\u1A48;\u43C7r\u0380;Ecefms\u1A5F\u1A60\u1A62\u1A6B\u1AA4\u1AAA\u1AAE\u65CB;\u69C3\u0180;el\u1A69\u1A6A\u1A6D\u42C6q;\u6257e\u0261\u1A74\0\0\u1A88rrow\u0100lr\u1A7C\u1A81eft;\u61BAight;\u61BB\u0280RSacd\u1A92\u1A94\u1A96\u1A9A\u1A9F\xBB\u0F47;\u64C8st;\u629Birc;\u629Aash;\u629Dnint;\u6A10id;\u6AEFcir;\u69C2ubs\u0100;u\u1ABB\u1ABC\u6663it\xBB\u1ABC\u02EC\u1AC7\u1AD4\u1AFA\0\u1B0Aon\u0100;e\u1ACD\u1ACE\u403A\u0100;q\xC7\xC6\u026D\u1AD9\0\0\u1AE2a\u0100;t\u1ADE\u1ADF\u402C;\u4040\u0180;fl\u1AE8\u1AE9\u1AEB\u6201\xEE\u1160e\u0100mx\u1AF1\u1AF6ent\xBB\u1AE9e\xF3\u024D\u01E7\u1AFE\0\u1B07\u0100;d\u12BB\u1B02ot;\u6A6Dn\xF4\u0246\u0180fry\u1B10\u1B14\u1B17;\uC000\u{1D554}o\xE4\u0254\u8100\xA9;s\u0155\u1B1Dr;\u6117\u0100ao\u1B25\u1B29rr;\u61B5ss;\u6717\u0100cu\u1B32\u1B37r;\uC000\u{1D4B8}\u0100bp\u1B3C\u1B44\u0100;e\u1B41\u1B42\u6ACF;\u6AD1\u0100;e\u1B49\u1B4A\u6AD0;\u6AD2dot;\u62EF\u0380delprvw\u1B60\u1B6C\u1B77\u1B82\u1BAC\u1BD4\u1BF9arr\u0100lr\u1B68\u1B6A;\u6938;\u6935\u0270\u1B72\0\0\u1B75r;\u62DEc;\u62DFarr\u0100;p\u1B7F\u1B80\u61B6;\u693D\u0300;bcdos\u1B8F\u1B90\u1B96\u1BA1\u1BA5\u1BA8\u622Arcap;\u6A48\u0100au\u1B9B\u1B9Ep;\u6A46p;\u6A4Aot;\u628Dr;\u6A45;\uC000\u222A\uFE00\u0200alrv\u1BB5\u1BBF\u1BDE\u1BE3rr\u0100;m\u1BBC\u1BBD\u61B7;\u693Cy\u0180evw\u1BC7\u1BD4\u1BD8q\u0270\u1BCE\0\0\u1BD2re\xE3\u1B73u\xE3\u1B75ee;\u62CEedge;\u62CFen\u803B\xA4\u40A4earrow\u0100lr\u1BEE\u1BF3eft\xBB\u1B80ight\xBB\u1BBDe\xE4\u1BDD\u0100ci\u1C01\u1C07onin\xF4\u01F7nt;\u6231lcty;\u632D\u0980AHabcdefhijlorstuwz\u1C38\u1C3B\u1C3F\u1C5D\u1C69\u1C75\u1C8A\u1C9E\u1CAC\u1CB7\u1CFB\u1CFF\u1D0D\u1D7B\u1D91\u1DAB\u1DBB\u1DC6\u1DCDr\xF2\u0381ar;\u6965\u0200glrs\u1C48\u1C4D\u1C52\u1C54ger;\u6020eth;\u6138\xF2\u1133h\u0100;v\u1C5A\u1C5B\u6010\xBB\u090A\u016B\u1C61\u1C67arow;\u690Fa\xE3\u0315\u0100ay\u1C6E\u1C73ron;\u410F;\u4434\u0180;ao\u0332\u1C7C\u1C84\u0100gr\u02BF\u1C81r;\u61CAtseq;\u6A77\u0180glm\u1C91\u1C94\u1C98\u803B\xB0\u40B0ta;\u43B4ptyv;\u69B1\u0100ir\u1CA3\u1CA8sht;\u697F;\uC000\u{1D521}ar\u0100lr\u1CB3\u1CB5\xBB\u08DC\xBB\u101E\u0280aegsv\u1CC2\u0378\u1CD6\u1CDC\u1CE0m\u0180;os\u0326\u1CCA\u1CD4nd\u0100;s\u0326\u1CD1uit;\u6666amma;\u43DDin;\u62F2\u0180;io\u1CE7\u1CE8\u1CF8\u40F7de\u8100\xF7;o\u1CE7\u1CF0ntimes;\u62C7n\xF8\u1CF7cy;\u4452c\u026F\u1D06\0\0\u1D0Arn;\u631Eop;\u630D\u0280lptuw\u1D18\u1D1D\u1D22\u1D49\u1D55lar;\u4024f;\uC000\u{1D555}\u0280;emps\u030B\u1D2D\u1D37\u1D3D\u1D42q\u0100;d\u0352\u1D33ot;\u6251inus;\u6238lus;\u6214quare;\u62A1blebarwedg\xE5\xFAn\u0180adh\u112E\u1D5D\u1D67ownarrow\xF3\u1C83arpoon\u0100lr\u1D72\u1D76ef\xF4\u1CB4igh\xF4\u1CB6\u0162\u1D7F\u1D85karo\xF7\u0F42\u026F\u1D8A\0\0\u1D8Ern;\u631Fop;\u630C\u0180cot\u1D98\u1DA3\u1DA6\u0100ry\u1D9D\u1DA1;\uC000\u{1D4B9};\u4455l;\u69F6rok;\u4111\u0100dr\u1DB0\u1DB4ot;\u62F1i\u0100;f\u1DBA\u1816\u65BF\u0100ah\u1DC0\u1DC3r\xF2\u0429a\xF2\u0FA6angle;\u69A6\u0100ci\u1DD2\u1DD5y;\u445Fgrarr;\u67FF\u0900Dacdefglmnopqrstux\u1E01\u1E09\u1E19\u1E38\u0578\u1E3C\u1E49\u1E61\u1E7E\u1EA5\u1EAF\u1EBD\u1EE1\u1F2A\u1F37\u1F44\u1F4E\u1F5A\u0100Do\u1E06\u1D34o\xF4\u1C89\u0100cs\u1E0E\u1E14ute\u803B\xE9\u40E9ter;\u6A6E\u0200aioy\u1E22\u1E27\u1E31\u1E36ron;\u411Br\u0100;c\u1E2D\u1E2E\u6256\u803B\xEA\u40EAlon;\u6255;\u444Dot;\u4117\u0100Dr\u1E41\u1E45ot;\u6252;\uC000\u{1D522}\u0180;rs\u1E50\u1E51\u1E57\u6A9Aave\u803B\xE8\u40E8\u0100;d\u1E5C\u1E5D\u6A96ot;\u6A98\u0200;ils\u1E6A\u1E6B\u1E72\u1E74\u6A99nters;\u63E7;\u6113\u0100;d\u1E79\u1E7A\u6A95ot;\u6A97\u0180aps\u1E85\u1E89\u1E97cr;\u4113ty\u0180;sv\u1E92\u1E93\u1E95\u6205et\xBB\u1E93p\u01001;\u1E9D\u1EA4\u0133\u1EA1\u1EA3;\u6004;\u6005\u6003\u0100gs\u1EAA\u1EAC;\u414Bp;\u6002\u0100gp\u1EB4\u1EB8on;\u4119f;\uC000\u{1D556}\u0180als\u1EC4\u1ECE\u1ED2r\u0100;s\u1ECA\u1ECB\u62D5l;\u69E3us;\u6A71i\u0180;lv\u1EDA\u1EDB\u1EDF\u43B5on\xBB\u1EDB;\u43F5\u0200csuv\u1EEA\u1EF3\u1F0B\u1F23\u0100io\u1EEF\u1E31rc\xBB\u1E2E\u0269\u1EF9\0\0\u1EFB\xED\u0548ant\u0100gl\u1F02\u1F06tr\xBB\u1E5Dess\xBB\u1E7A\u0180aei\u1F12\u1F16\u1F1Als;\u403Dst;\u625Fv\u0100;D\u0235\u1F20D;\u6A78parsl;\u69E5\u0100Da\u1F2F\u1F33ot;\u6253rr;\u6971\u0180cdi\u1F3E\u1F41\u1EF8r;\u612Fo\xF4\u0352\u0100ah\u1F49\u1F4B;\u43B7\u803B\xF0\u40F0\u0100mr\u1F53\u1F57l\u803B\xEB\u40EBo;\u60AC\u0180cip\u1F61\u1F64\u1F67l;\u4021s\xF4\u056E\u0100eo\u1F6C\u1F74ctatio\xEE\u0559nential\xE5\u0579\u09E1\u1F92\0\u1F9E\0\u1FA1\u1FA7\0\0\u1FC6\u1FCC\0\u1FD3\0\u1FE6\u1FEA\u2000\0\u2008\u205Allingdotse\xF1\u1E44y;\u4444male;\u6640\u0180ilr\u1FAD\u1FB3\u1FC1lig;\u8000\uFB03\u0269\u1FB9\0\0\u1FBDg;\u8000\uFB00ig;\u8000\uFB04;\uC000\u{1D523}lig;\u8000\uFB01lig;\uC000fj\u0180alt\u1FD9\u1FDC\u1FE1t;\u666Dig;\u8000\uFB02ns;\u65B1of;\u4192\u01F0\u1FEE\0\u1FF3f;\uC000\u{1D557}\u0100ak\u05BF\u1FF7\u0100;v\u1FFC\u1FFD\u62D4;\u6AD9artint;\u6A0D\u0100ao\u200C\u2055\u0100cs\u2011\u2052\u03B1\u201A\u2030\u2038\u2045\u2048\0\u2050\u03B2\u2022\u2025\u2027\u202A\u202C\0\u202E\u803B\xBD\u40BD;\u6153\u803B\xBC\u40BC;\u6155;\u6159;\u615B\u01B3\u2034\0\u2036;\u6154;\u6156\u02B4\u203E\u2041\0\0\u2043\u803B\xBE\u40BE;\u6157;\u615C5;\u6158\u01B6\u204C\0\u204E;\u615A;\u615D8;\u615El;\u6044wn;\u6322cr;\uC000\u{1D4BB}\u0880Eabcdefgijlnorstv\u2082\u2089\u209F\u20A5\u20B0\u20B4\u20F0\u20F5\u20FA\u20FF\u2103\u2112\u2138\u0317\u213E\u2152\u219E\u0100;l\u064D\u2087;\u6A8C\u0180cmp\u2090\u2095\u209Dute;\u41F5ma\u0100;d\u209C\u1CDA\u43B3;\u6A86reve;\u411F\u0100iy\u20AA\u20AErc;\u411D;\u4433ot;\u4121\u0200;lqs\u063E\u0642\u20BD\u20C9\u0180;qs\u063E\u064C\u20C4lan\xF4\u0665\u0200;cdl\u0665\u20D2\u20D5\u20E5c;\u6AA9ot\u0100;o\u20DC\u20DD\u6A80\u0100;l\u20E2\u20E3\u6A82;\u6A84\u0100;e\u20EA\u20ED\uC000\u22DB\uFE00s;\u6A94r;\uC000\u{1D524}\u0100;g\u0673\u061Bmel;\u6137cy;\u4453\u0200;Eaj\u065A\u210C\u210E\u2110;\u6A92;\u6AA5;\u6AA4\u0200Eaes\u211B\u211D\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6A8Arox\xBB\u2124\u0100;q\u212E\u212F\u6A88\u0100;q\u212E\u211Bim;\u62E7pf;\uC000\u{1D558}\u0100ci\u2143\u2146r;\u610Am\u0180;el\u066B\u214E\u2150;\u6A8E;\u6A90\u8300>;cdlqr\u05EE\u2160\u216A\u216E\u2173\u2179\u0100ci\u2165\u2167;\u6AA7r;\u6A7Aot;\u62D7Par;\u6995uest;\u6A7C\u0280adels\u2184\u216A\u2190\u0656\u219B\u01F0\u2189\0\u218Epro\xF8\u209Er;\u6978q\u0100lq\u063F\u2196les\xF3\u2088i\xED\u066B\u0100en\u21A3\u21ADrtneqq;\uC000\u2269\uFE00\xC5\u21AA\u0500Aabcefkosy\u21C4\u21C7\u21F1\u21F5\u21FA\u2218\u221D\u222F\u2268\u227Dr\xF2\u03A0\u0200ilmr\u21D0\u21D4\u21D7\u21DBrs\xF0\u1484f\xBB\u2024il\xF4\u06A9\u0100dr\u21E0\u21E4cy;\u444A\u0180;cw\u08F4\u21EB\u21EFir;\u6948;\u61ADar;\u610Firc;\u4125\u0180alr\u2201\u220E\u2213rts\u0100;u\u2209\u220A\u6665it\xBB\u220Alip;\u6026con;\u62B9r;\uC000\u{1D525}s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223A\u223E\u2243\u225E\u2263rr;\u61FFtht;\u623Bk\u0100lr\u2249\u2253eftarrow;\u61A9ightarrow;\u61AAf;\uC000\u{1D559}bar;\u6015\u0180clt\u226F\u2274\u2278r;\uC000\u{1D4BD}as\xE8\u21F4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xBB\u1C5B\u0AE1\u22A3\0\u22AA\0\u22B8\u22C5\u22CE\0\u22D5\u22F3\0\0\u22F8\u2322\u2367\u2362\u237F\0\u2386\u23AA\u23B4cute\u803B\xED\u40ED\u0180;iy\u0771\u22B0\u22B5rc\u803B\xEE\u40EE;\u4438\u0100cx\u22BC\u22BFy;\u4435cl\u803B\xA1\u40A1\u0100fr\u039F\u22C9;\uC000\u{1D526}rave\u803B\xEC\u40EC\u0200;ino\u073E\u22DD\u22E9\u22EE\u0100in\u22E2\u22E6nt;\u6A0Ct;\u622Dfin;\u69DCta;\u6129lig;\u4133\u0180aop\u22FE\u231A\u231D\u0180cgt\u2305\u2308\u2317r;\u412B\u0180elp\u071F\u230F\u2313in\xE5\u078Ear\xF4\u0720h;\u4131f;\u62B7ed;\u41B5\u0280;cfot\u04F4\u232C\u2331\u233D\u2341are;\u6105in\u0100;t\u2338\u2339\u621Eie;\u69DDdo\xF4\u2319\u0280;celp\u0757\u234C\u2350\u235B\u2361al;\u62BA\u0100gr\u2355\u2359er\xF3\u1563\xE3\u234Darhk;\u6A17rod;\u6A3C\u0200cgpt\u236F\u2372\u2376\u237By;\u4451on;\u412Ff;\uC000\u{1D55A}a;\u43B9uest\u803B\xBF\u40BF\u0100ci\u238A\u238Fr;\uC000\u{1D4BE}n\u0280;Edsv\u04F4\u239B\u239D\u23A1\u04F3;\u62F9ot;\u62F5\u0100;v\u23A6\u23A7\u62F4;\u62F3\u0100;i\u0777\u23AElde;\u4129\u01EB\u23B8\0\u23BCcy;\u4456l\u803B\xEF\u40EF\u0300cfmosu\u23CC\u23D7\u23DC\u23E1\u23E7\u23F5\u0100iy\u23D1\u23D5rc;\u4135;\u4439r;\uC000\u{1D527}ath;\u4237pf;\uC000\u{1D55B}\u01E3\u23EC\0\u23F1r;\uC000\u{1D4BF}rcy;\u4458kcy;\u4454\u0400acfghjos\u240B\u2416\u2422\u2427\u242D\u2431\u2435\u243Bppa\u0100;v\u2413\u2414\u43BA;\u43F0\u0100ey\u241B\u2420dil;\u4137;\u443Ar;\uC000\u{1D528}reen;\u4138cy;\u4445cy;\u445Cpf;\uC000\u{1D55C}cr;\uC000\u{1D4C0}\u0B80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248D\u2491\u250E\u253D\u255A\u2580\u264E\u265E\u2665\u2679\u267D\u269A\u26B2\u26D8\u275D\u2768\u278B\u27C0\u2801\u2812\u0180art\u2477\u247A\u247Cr\xF2\u09C6\xF2\u0395ail;\u691Barr;\u690E\u0100;g\u0994\u248B;\u6A8Bar;\u6962\u0963\u24A5\0\u24AA\0\u24B1\0\0\0\0\0\u24B5\u24BA\0\u24C6\u24C8\u24CD\0\u24F9ute;\u413Amptyv;\u69B4ra\xEE\u084Cbda;\u43BBg\u0180;dl\u088E\u24C1\u24C3;\u6991\xE5\u088E;\u6A85uo\u803B\xAB\u40ABr\u0400;bfhlpst\u0899\u24DE\u24E6\u24E9\u24EB\u24EE\u24F1\u24F5\u0100;f\u089D\u24E3s;\u691Fs;\u691D\xEB\u2252p;\u61ABl;\u6939im;\u6973l;\u61A2\u0180;ae\u24FF\u2500\u2504\u6AABil;\u6919\u0100;s\u2509\u250A\u6AAD;\uC000\u2AAD\uFE00\u0180abr\u2515\u2519\u251Drr;\u690Crk;\u6772\u0100ak\u2522\u252Cc\u0100ek\u2528\u252A;\u407B;\u405B\u0100es\u2531\u2533;\u698Bl\u0100du\u2539\u253B;\u698F;\u698D\u0200aeuy\u2546\u254B\u2556\u2558ron;\u413E\u0100di\u2550\u2554il;\u413C\xEC\u08B0\xE2\u2529;\u443B\u0200cqrs\u2563\u2566\u256D\u257Da;\u6936uo\u0100;r\u0E19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694Bh;\u61B2\u0280;fgqs\u258B\u258C\u0989\u25F3\u25FF\u6264t\u0280ahlrt\u2598\u25A4\u25B7\u25C2\u25E8rrow\u0100;t\u0899\u25A1a\xE9\u24F6arpoon\u0100du\u25AF\u25B4own\xBB\u045Ap\xBB\u0966eftarrows;\u61C7ight\u0180ahs\u25CD\u25D6\u25DErrow\u0100;s\u08F4\u08A7arpoon\xF3\u0F98quigarro\xF7\u21F0hreetimes;\u62CB\u0180;qs\u258B\u0993\u25FAlan\xF4\u09AC\u0280;cdgs\u09AC\u260A\u260D\u261D\u2628c;\u6AA8ot\u0100;o\u2614\u2615\u6A7F\u0100;r\u261A\u261B\u6A81;\u6A83\u0100;e\u2622\u2625\uC000\u22DA\uFE00s;\u6A93\u0280adegs\u2633\u2639\u263D\u2649\u264Bppro\xF8\u24C6ot;\u62D6q\u0100gq\u2643\u2645\xF4\u0989gt\xF2\u248C\xF4\u099Bi\xED\u09B2\u0180ilr\u2655\u08E1\u265Asht;\u697C;\uC000\u{1D529}\u0100;E\u099C\u2663;\u6A91\u0161\u2669\u2676r\u0100du\u25B2\u266E\u0100;l\u0965\u2673;\u696Alk;\u6584cy;\u4459\u0280;acht\u0A48\u2688\u268B\u2691\u2696r\xF2\u25C1orne\xF2\u1D08ard;\u696Bri;\u65FA\u0100io\u269F\u26A4dot;\u4140ust\u0100;a\u26AC\u26AD\u63B0che\xBB\u26AD\u0200Eaes\u26BB\u26BD\u26C9\u26D4;\u6268p\u0100;p\u26C3\u26C4\u6A89rox\xBB\u26C4\u0100;q\u26CE\u26CF\u6A87\u0100;q\u26CE\u26BBim;\u62E6\u0400abnoptwz\u26E9\u26F4\u26F7\u271A\u272F\u2741\u2747\u2750\u0100nr\u26EE\u26F1g;\u67ECr;\u61FDr\xEB\u08C1g\u0180lmr\u26FF\u270D\u2714eft\u0100ar\u09E6\u2707ight\xE1\u09F2apsto;\u67FCight\xE1\u09FDparrow\u0100lr\u2725\u2729ef\xF4\u24EDight;\u61AC\u0180afl\u2736\u2739\u273Dr;\u6985;\uC000\u{1D55D}us;\u6A2Dimes;\u6A34\u0161\u274B\u274Fst;\u6217\xE1\u134E\u0180;ef\u2757\u2758\u1800\u65CAnge\xBB\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277C\u2785\u2787r\xF2\u08A8orne\xF2\u1D8Car\u0100;d\u0F98\u2783;\u696D;\u600Eri;\u62BF\u0300achiqt\u2798\u279D\u0A40\u27A2\u27AE\u27BBquo;\u6039r;\uC000\u{1D4C1}m\u0180;eg\u09B2\u27AA\u27AC;\u6A8D;\u6A8F\u0100bu\u252A\u27B3o\u0100;r\u0E1F\u27B9;\u601Arok;\u4142\u8400<;cdhilqr\u082B\u27D2\u2639\u27DC\u27E0\u27E5\u27EA\u27F0\u0100ci\u27D7\u27D9;\u6AA6r;\u6A79re\xE5\u25F2mes;\u62C9arr;\u6976uest;\u6A7B\u0100Pi\u27F5\u27F9ar;\u6996\u0180;ef\u2800\u092D\u181B\u65C3r\u0100du\u2807\u280Dshar;\u694Ahar;\u6966\u0100en\u2817\u2821rtneqq;\uC000\u2268\uFE00\xC5\u281E\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288E\u2893\u28A0\u28A5\u28A8\u28DA\u28E2\u28E4\u0A83\u28F3\u2902Dot;\u623A\u0200clpr\u284E\u2852\u2863\u287Dr\u803B\xAF\u40AF\u0100et\u2857\u2859;\u6642\u0100;e\u285E\u285F\u6720se\xBB\u285F\u0100;s\u103B\u2868to\u0200;dlu\u103B\u2873\u2877\u287Bow\xEE\u048Cef\xF4\u090F\xF0\u13D1ker;\u65AE\u0100oy\u2887\u288Cmma;\u6A29;\u443Cash;\u6014asuredangle\xBB\u1626r;\uC000\u{1D52A}o;\u6127\u0180cdn\u28AF\u28B4\u28C9ro\u803B\xB5\u40B5\u0200;acd\u1464\u28BD\u28C0\u28C4s\xF4\u16A7ir;\u6AF0ot\u80BB\xB7\u01B5us\u0180;bd\u28D2\u1903\u28D3\u6212\u0100;u\u1D3C\u28D8;\u6A2A\u0163\u28DE\u28E1p;\u6ADB\xF2\u2212\xF0\u0A81\u0100dp\u28E9\u28EEels;\u62A7f;\uC000\u{1D55E}\u0100ct\u28F8\u28FDr;\uC000\u{1D4C2}pos\xBB\u159D\u0180;lm\u2909\u290A\u290D\u43BCtimap;\u62B8\u0C00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297E\u2989\u2998\u29DA\u29E9\u2A15\u2A1A\u2A58\u2A5D\u2A83\u2A95\u2AA4\u2AA8\u2B04\u2B07\u2B44\u2B7F\u2BAE\u2C34\u2C67\u2C7C\u2CE9\u0100gt\u2947\u294B;\uC000\u22D9\u0338\u0100;v\u2950\u0BCF\uC000\u226B\u20D2\u0180elt\u295A\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61CDightarrow;\u61CE;\uC000\u22D8\u0338\u0100;v\u297B\u0C47\uC000\u226A\u20D2ightarrow;\u61CF\u0100Dd\u298E\u2993ash;\u62AFash;\u62AE\u0280bcnpt\u29A3\u29A7\u29AC\u29B1\u29CCla\xBB\u02DEute;\u4144g;\uC000\u2220\u20D2\u0280;Eiop\u0D84\u29BC\u29C0\u29C5\u29C8;\uC000\u2A70\u0338d;\uC000\u224B\u0338s;\u4149ro\xF8\u0D84ur\u0100;a\u29D3\u29D4\u666El\u0100;s\u29D3\u0B38\u01F3\u29DF\0\u29E3p\u80BB\xA0\u0B37mp\u0100;e\u0BF9\u0C00\u0280aeouy\u29F4\u29FE\u2A03\u2A10\u2A13\u01F0\u29F9\0\u29FB;\u6A43on;\u4148dil;\u4146ng\u0100;d\u0D7E\u2A0Aot;\uC000\u2A6D\u0338p;\u6A42;\u443Dash;\u6013\u0380;Aadqsx\u0B92\u2A29\u2A2D\u2A3B\u2A41\u2A45\u2A50rr;\u61D7r\u0100hr\u2A33\u2A36k;\u6924\u0100;o\u13F2\u13F0ot;\uC000\u2250\u0338ui\xF6\u0B63\u0100ei\u2A4A\u2A4Ear;\u6928\xED\u0B98ist\u0100;s\u0BA0\u0B9Fr;\uC000\u{1D52B}\u0200Eest\u0BC5\u2A66\u2A79\u2A7C\u0180;qs\u0BBC\u2A6D\u0BE1\u0180;qs\u0BBC\u0BC5\u2A74lan\xF4\u0BE2i\xED\u0BEA\u0100;r\u0BB6\u2A81\xBB\u0BB7\u0180Aap\u2A8A\u2A8D\u2A91r\xF2\u2971rr;\u61AEar;\u6AF2\u0180;sv\u0F8D\u2A9C\u0F8C\u0100;d\u2AA1\u2AA2\u62FC;\u62FAcy;\u445A\u0380AEadest\u2AB7\u2ABA\u2ABE\u2AC2\u2AC5\u2AF6\u2AF9r\xF2\u2966;\uC000\u2266\u0338rr;\u619Ar;\u6025\u0200;fqs\u0C3B\u2ACE\u2AE3\u2AEFt\u0100ar\u2AD4\u2AD9rro\xF7\u2AC1ightarro\xF7\u2A90\u0180;qs\u0C3B\u2ABA\u2AEAlan\xF4\u0C55\u0100;s\u0C55\u2AF4\xBB\u0C36i\xED\u0C5D\u0100;r\u0C35\u2AFEi\u0100;e\u0C1A\u0C25i\xE4\u0D90\u0100pt\u2B0C\u2B11f;\uC000\u{1D55F}\u8180\xAC;in\u2B19\u2B1A\u2B36\u40ACn\u0200;Edv\u0B89\u2B24\u2B28\u2B2E;\uC000\u22F9\u0338ot;\uC000\u22F5\u0338\u01E1\u0B89\u2B33\u2B35;\u62F7;\u62F6i\u0100;v\u0CB8\u2B3C\u01E1\u0CB8\u2B41\u2B43;\u62FE;\u62FD\u0180aor\u2B4B\u2B63\u2B69r\u0200;ast\u0B7B\u2B55\u2B5A\u2B5Flle\xEC\u0B7Bl;\uC000\u2AFD\u20E5;\uC000\u2202\u0338lint;\u6A14\u0180;ce\u0C92\u2B70\u2B73u\xE5\u0CA5\u0100;c\u0C98\u2B78\u0100;e\u0C92\u2B7D\xF1\u0C98\u0200Aait\u2B88\u2B8B\u2B9D\u2BA7r\xF2\u2988rr\u0180;cw\u2B94\u2B95\u2B99\u619B;\uC000\u2933\u0338;\uC000\u219D\u0338ghtarrow\xBB\u2B95ri\u0100;e\u0CCB\u0CD6\u0380chimpqu\u2BBD\u2BCD\u2BD9\u2B04\u0B78\u2BE4\u2BEF\u0200;cer\u0D32\u2BC6\u0D37\u2BC9u\xE5\u0D45;\uC000\u{1D4C3}ort\u026D\u2B05\0\0\u2BD6ar\xE1\u2B56m\u0100;e\u0D6E\u2BDF\u0100;q\u0D74\u0D73su\u0100bp\u2BEB\u2BED\xE5\u0CF8\xE5\u0D0B\u0180bcp\u2BF6\u2C11\u2C19\u0200;Ees\u2BFF\u2C00\u0D22\u2C04\u6284;\uC000\u2AC5\u0338et\u0100;e\u0D1B\u2C0Bq\u0100;q\u0D23\u2C00c\u0100;e\u0D32\u2C17\xF1\u0D38\u0200;Ees\u2C22\u2C23\u0D5F\u2C27\u6285;\uC000\u2AC6\u0338et\u0100;e\u0D58\u2C2Eq\u0100;q\u0D60\u2C23\u0200gilr\u2C3D\u2C3F\u2C45\u2C47\xEC\u0BD7lde\u803B\xF1\u40F1\xE7\u0C43iangle\u0100lr\u2C52\u2C5Ceft\u0100;e\u0C1A\u2C5A\xF1\u0C26ight\u0100;e\u0CCB\u2C65\xF1\u0CD7\u0100;m\u2C6C\u2C6D\u43BD\u0180;es\u2C74\u2C75\u2C79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2C8F\u2C94\u2C99\u2C9E\u2CA3\u2CB0\u2CB6\u2CD3\u2CE3ash;\u62ADarr;\u6904p;\uC000\u224D\u20D2ash;\u62AC\u0100et\u2CA8\u2CAC;\uC000\u2265\u20D2;\uC000>\u20D2nfin;\u69DE\u0180Aet\u2CBD\u2CC1\u2CC5rr;\u6902;\uC000\u2264\u20D2\u0100;r\u2CCA\u2CCD\uC000<\u20D2ie;\uC000\u22B4\u20D2\u0100At\u2CD8\u2CDCrr;\u6903rie;\uC000\u22B5\u20D2im;\uC000\u223C\u20D2\u0180Aan\u2CF0\u2CF4\u2D02rr;\u61D6r\u0100hr\u2CFA\u2CFDk;\u6923\u0100;o\u13E7\u13E5ear;\u6927\u1253\u1A95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2D2D\0\u2D38\u2D48\u2D60\u2D65\u2D72\u2D84\u1B07\0\0\u2D8D\u2DAB\0\u2DC8\u2DCE\0\u2DDC\u2E19\u2E2B\u2E3E\u2E43\u0100cs\u2D31\u1A97ute\u803B\xF3\u40F3\u0100iy\u2D3C\u2D45r\u0100;c\u1A9E\u2D42\u803B\xF4\u40F4;\u443E\u0280abios\u1AA0\u2D52\u2D57\u01C8\u2D5Alac;\u4151v;\u6A38old;\u69BClig;\u4153\u0100cr\u2D69\u2D6Dir;\u69BF;\uC000\u{1D52C}\u036F\u2D79\0\0\u2D7C\0\u2D82n;\u42DBave\u803B\xF2\u40F2;\u69C1\u0100bm\u2D88\u0DF4ar;\u69B5\u0200acit\u2D95\u2D98\u2DA5\u2DA8r\xF2\u1A80\u0100ir\u2D9D\u2DA0r;\u69BEoss;\u69BBn\xE5\u0E52;\u69C0\u0180aei\u2DB1\u2DB5\u2DB9cr;\u414Dga;\u43C9\u0180cdn\u2DC0\u2DC5\u01CDron;\u43BF;\u69B6pf;\uC000\u{1D560}\u0180ael\u2DD4\u2DD7\u01D2r;\u69B7rp;\u69B9\u0380;adiosv\u2DEA\u2DEB\u2DEE\u2E08\u2E0D\u2E10\u2E16\u6228r\xF2\u1A86\u0200;efm\u2DF7\u2DF8\u2E02\u2E05\u6A5Dr\u0100;o\u2DFE\u2DFF\u6134f\xBB\u2DFF\u803B\xAA\u40AA\u803B\xBA\u40BAgof;\u62B6r;\u6A56lope;\u6A57;\u6A5B\u0180clo\u2E1F\u2E21\u2E27\xF2\u2E01ash\u803B\xF8\u40F8l;\u6298i\u016C\u2E2F\u2E34de\u803B\xF5\u40F5es\u0100;a\u01DB\u2E3As;\u6A36ml\u803B\xF6\u40F6bar;\u633D\u0AE1\u2E5E\0\u2E7D\0\u2E80\u2E9D\0\u2EA2\u2EB9\0\0\u2ECB\u0E9C\0\u2F13\0\0\u2F2B\u2FBC\0\u2FC8r\u0200;ast\u0403\u2E67\u2E72\u0E85\u8100\xB6;l\u2E6D\u2E6E\u40B6le\xEC\u0403\u0269\u2E78\0\0\u2E7Bm;\u6AF3;\u6AFDy;\u443Fr\u0280cimpt\u2E8B\u2E8F\u2E93\u1865\u2E97nt;\u4025od;\u402Eil;\u6030enk;\u6031r;\uC000\u{1D52D}\u0180imo\u2EA8\u2EB0\u2EB4\u0100;v\u2EAD\u2EAE\u43C6;\u43D5ma\xF4\u0A76ne;\u660E\u0180;tv\u2EBF\u2EC0\u2EC8\u43C0chfork\xBB\u1FFD;\u43D6\u0100au\u2ECF\u2EDFn\u0100ck\u2ED5\u2EDDk\u0100;h\u21F4\u2EDB;\u610E\xF6\u21F4s\u0480;abcdemst\u2EF3\u2EF4\u1908\u2EF9\u2EFD\u2F04\u2F06\u2F0A\u2F0E\u402Bcir;\u6A23ir;\u6A22\u0100ou\u1D40\u2F02;\u6A25;\u6A72n\u80BB\xB1\u0E9Dim;\u6A26wo;\u6A27\u0180ipu\u2F19\u2F20\u2F25ntint;\u6A15f;\uC000\u{1D561}nd\u803B\xA3\u40A3\u0500;Eaceinosu\u0EC8\u2F3F\u2F41\u2F44\u2F47\u2F81\u2F89\u2F92\u2F7E\u2FB6;\u6AB3p;\u6AB7u\xE5\u0ED9\u0100;c\u0ECE\u2F4C\u0300;acens\u0EC8\u2F59\u2F5F\u2F66\u2F68\u2F7Eppro\xF8\u2F43urlye\xF1\u0ED9\xF1\u0ECE\u0180aes\u2F6F\u2F76\u2F7Approx;\u6AB9qq;\u6AB5im;\u62E8i\xED\u0EDFme\u0100;s\u2F88\u0EAE\u6032\u0180Eas\u2F78\u2F90\u2F7A\xF0\u2F75\u0180dfp\u0EEC\u2F99\u2FAF\u0180als\u2FA0\u2FA5\u2FAAlar;\u632Eine;\u6312urf;\u6313\u0100;t\u0EFB\u2FB4\xEF\u0EFBrel;\u62B0\u0100ci\u2FC0\u2FC5r;\uC000\u{1D4C5};\u43C8ncsp;\u6008\u0300fiopsu\u2FDA\u22E2\u2FDF\u2FE5\u2FEB\u2FF1r;\uC000\u{1D52E}pf;\uC000\u{1D562}rime;\u6057cr;\uC000\u{1D4C6}\u0180aeo\u2FF8\u3009\u3013t\u0100ei\u2FFE\u3005rnion\xF3\u06B0nt;\u6A16st\u0100;e\u3010\u3011\u403F\xF1\u1F19\xF4\u0F14\u0A80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30E0\u310E\u312B\u3147\u3162\u3172\u318E\u3206\u3215\u3224\u3229\u3258\u326E\u3272\u3290\u32B0\u32B7\u0180art\u3047\u304A\u304Cr\xF2\u10B3\xF2\u03DDail;\u691Car\xF2\u1C65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307F\u308F\u3094\u30CC\u0100eu\u306D\u3071;\uC000\u223D\u0331te;\u4155i\xE3\u116Emptyv;\u69B3g\u0200;del\u0FD1\u3089\u308B\u308D;\u6992;\u69A5\xE5\u0FD1uo\u803B\xBB\u40BBr\u0580;abcfhlpstw\u0FDC\u30AC\u30AF\u30B7\u30B9\u30BC\u30BE\u30C0\u30C3\u30C7\u30CAp;\u6975\u0100;f\u0FE0\u30B4s;\u6920;\u6933s;\u691E\xEB\u225D\xF0\u272El;\u6945im;\u6974l;\u61A3;\u619D\u0100ai\u30D1\u30D5il;\u691Ao\u0100;n\u30DB\u30DC\u6236al\xF3\u0F1E\u0180abr\u30E7\u30EA\u30EEr\xF2\u17E5rk;\u6773\u0100ak\u30F3\u30FDc\u0100ek\u30F9\u30FB;\u407D;\u405D\u0100es\u3102\u3104;\u698Cl\u0100du\u310A\u310C;\u698E;\u6990\u0200aeuy\u3117\u311C\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xEC\u0FF2\xE2\u30FA;\u4440\u0200clqs\u3134\u3137\u313D\u3144a;\u6937dhar;\u6969uo\u0100;r\u020E\u020Dh;\u61B3\u0180acg\u314E\u315F\u0F44l\u0200;ips\u0F78\u3158\u315B\u109Cn\xE5\u10BBar\xF4\u0FA9t;\u65AD\u0180ilr\u3169\u1023\u316Esht;\u697D;\uC000\u{1D52F}\u0100ao\u3177\u3186r\u0100du\u317D\u317F\xBB\u047B\u0100;l\u1091\u3184;\u696C\u0100;v\u318B\u318C\u43C1;\u43F1\u0180gns\u3195\u31F9\u31FCht\u0300ahlrst\u31A4\u31B0\u31C2\u31D8\u31E4\u31EErrow\u0100;t\u0FDC\u31ADa\xE9\u30C8arpoon\u0100du\u31BB\u31BFow\xEE\u317Ep\xBB\u1092eft\u0100ah\u31CA\u31D0rrow\xF3\u0FEAarpoon\xF3\u0551ightarrows;\u61C9quigarro\xF7\u30CBhreetimes;\u62CCg;\u42DAingdotse\xF1\u1F32\u0180ahm\u320D\u3210\u3213r\xF2\u0FEAa\xF2\u0551;\u600Foust\u0100;a\u321E\u321F\u63B1che\xBB\u321Fmid;\u6AEE\u0200abpt\u3232\u323D\u3240\u3252\u0100nr\u3237\u323Ag;\u67EDr;\u61FEr\xEB\u1003\u0180afl\u3247\u324A\u324Er;\u6986;\uC000\u{1D563}us;\u6A2Eimes;\u6A35\u0100ap\u325D\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6A12ar\xF2\u31E3\u0200achq\u327B\u3280\u10BC\u3285quo;\u603Ar;\uC000\u{1D4C7}\u0100bu\u30FB\u328Ao\u0100;r\u0214\u0213\u0180hir\u3297\u329B\u32A0re\xE5\u31F8mes;\u62CAi\u0200;efl\u32AA\u1059\u1821\u32AB\u65B9tri;\u69CEluhar;\u6968;\u611E\u0D61\u32D5\u32DB\u32DF\u332C\u3338\u3371\0\u337A\u33A4\0\0\u33EC\u33F0\0\u3428\u3448\u345A\u34AD\u34B1\u34CA\u34F1\0\u3616\0\0\u3633cute;\u415Bqu\xEF\u27BA\u0500;Eaceinpsy\u11ED\u32F3\u32F5\u32FF\u3302\u330B\u330F\u331F\u3326\u3329;\u6AB4\u01F0\u32FA\0\u32FC;\u6AB8on;\u4161u\xE5\u11FE\u0100;d\u11F3\u3307il;\u415Frc;\u415D\u0180Eas\u3316\u3318\u331B;\u6AB6p;\u6ABAim;\u62E9olint;\u6A13i\xED\u1204;\u4441ot\u0180;be\u3334\u1D47\u3335\u62C5;\u6A66\u0380Aacmstx\u3346\u334A\u3357\u335B\u335E\u3363\u336Drr;\u61D8r\u0100hr\u3350\u3352\xEB\u2228\u0100;o\u0A36\u0A34t\u803B\xA7\u40A7i;\u403Bwar;\u6929m\u0100in\u3369\xF0nu\xF3\xF1t;\u6736r\u0100;o\u3376\u2055\uC000\u{1D530}\u0200acoy\u3382\u3386\u3391\u33A0rp;\u666F\u0100hy\u338B\u338Fcy;\u4449;\u4448rt\u026D\u3399\0\0\u339Ci\xE4\u1464ara\xEC\u2E6F\u803B\xAD\u40AD\u0100gm\u33A8\u33B4ma\u0180;fv\u33B1\u33B2\u33B2\u43C3;\u43C2\u0400;deglnpr\u12AB\u33C5\u33C9\u33CE\u33D6\u33DE\u33E1\u33E6ot;\u6A6A\u0100;q\u12B1\u12B0\u0100;E\u33D3\u33D4\u6A9E;\u6AA0\u0100;E\u33DB\u33DC\u6A9D;\u6A9Fe;\u6246lus;\u6A24arr;\u6972ar\xF2\u113D\u0200aeit\u33F8\u3408\u340F\u3417\u0100ls\u33FD\u3404lsetm\xE9\u336Ahp;\u6A33parsl;\u69E4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341C\u341D\u6AAA\u0100;s\u3422\u3423\u6AAC;\uC000\u2AAC\uFE00\u0180flp\u342E\u3433\u3442tcy;\u444C\u0100;b\u3438\u3439\u402F\u0100;a\u343E\u343F\u69C4r;\u633Ff;\uC000\u{1D564}a\u0100dr\u344D\u0402es\u0100;u\u3454\u3455\u6660it\xBB\u3455\u0180csu\u3460\u3479\u349F\u0100au\u3465\u346Fp\u0100;s\u1188\u346B;\uC000\u2293\uFE00p\u0100;s\u11B4\u3475;\uC000\u2294\uFE00u\u0100bp\u347F\u348F\u0180;es\u1197\u119C\u3486et\u0100;e\u1197\u348D\xF1\u119D\u0180;es\u11A8\u11AD\u3496et\u0100;e\u11A8\u349D\xF1\u11AE\u0180;af\u117B\u34A6\u05B0r\u0165\u34AB\u05B1\xBB\u117Car\xF2\u1148\u0200cemt\u34B9\u34BE\u34C2\u34C5r;\uC000\u{1D4C8}tm\xEE\xF1i\xEC\u3415ar\xE6\u11BE\u0100ar\u34CE\u34D5r\u0100;f\u34D4\u17BF\u6606\u0100an\u34DA\u34EDight\u0100ep\u34E3\u34EApsilo\xEE\u1EE0h\xE9\u2EAFs\xBB\u2852\u0280bcmnp\u34FB\u355E\u1209\u358B\u358E\u0480;Edemnprs\u350E\u350F\u3511\u3515\u351E\u3523\u352C\u3531\u3536\u6282;\u6AC5ot;\u6ABD\u0100;d\u11DA\u351Aot;\u6AC3ult;\u6AC1\u0100Ee\u3528\u352A;\u6ACB;\u628Alus;\u6ABFarr;\u6979\u0180eiu\u353D\u3552\u3555t\u0180;en\u350E\u3545\u354Bq\u0100;q\u11DA\u350Feq\u0100;q\u352B\u3528m;\u6AC7\u0100bp\u355A\u355C;\u6AD5;\u6AD3c\u0300;acens\u11ED\u356C\u3572\u3579\u357B\u3326ppro\xF8\u32FAurlye\xF1\u11FE\xF1\u11F3\u0180aes\u3582\u3588\u331Bppro\xF8\u331Aq\xF1\u3317g;\u666A\u0680123;Edehlmnps\u35A9\u35AC\u35AF\u121C\u35B2\u35B4\u35C0\u35C9\u35D5\u35DA\u35DF\u35E8\u35ED\u803B\xB9\u40B9\u803B\xB2\u40B2\u803B\xB3\u40B3;\u6AC6\u0100os\u35B9\u35BCt;\u6ABEub;\u6AD8\u0100;d\u1222\u35C5ot;\u6AC4s\u0100ou\u35CF\u35D2l;\u67C9b;\u6AD7arr;\u697Bult;\u6AC2\u0100Ee\u35E4\u35E6;\u6ACC;\u628Blus;\u6AC0\u0180eiu\u35F4\u3609\u360Ct\u0180;en\u121C\u35FC\u3602q\u0100;q\u1222\u35B2eq\u0100;q\u35E7\u35E4m;\u6AC8\u0100bp\u3611\u3613;\u6AD4;\u6AD6\u0180Aan\u361C\u3620\u362Drr;\u61D9r\u0100hr\u3626\u3628\xEB\u222E\u0100;o\u0A2B\u0A29war;\u692Alig\u803B\xDF\u40DF\u0BE1\u3651\u365D\u3660\u12CE\u3673\u3679\0\u367E\u36C2\0\0\0\0\0\u36DB\u3703\0\u3709\u376C\0\0\0\u3787\u0272\u3656\0\0\u365Bget;\u6316;\u43C4r\xEB\u0E5F\u0180aey\u3666\u366B\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uC000\u{1D531}\u0200eiko\u3686\u369D\u36B5\u36BC\u01F2\u368B\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369B\u43B8ym;\u43D1\u0100cn\u36A2\u36B2k\u0100as\u36A8\u36AEppro\xF8\u12C1im\xBB\u12ACs\xF0\u129E\u0100as\u36BA\u36AE\xF0\u12C1rn\u803B\xFE\u40FE\u01EC\u031F\u36C6\u22E7es\u8180\xD7;bd\u36CF\u36D0\u36D8\u40D7\u0100;a\u190F\u36D5r;\u6A31;\u6A30\u0180eps\u36E1\u36E3\u3700\xE1\u2A4D\u0200;bcf\u0486\u36EC\u36F0\u36F4ot;\u6336ir;\u6AF1\u0100;o\u36F9\u36FC\uC000\u{1D565}rk;\u6ADA\xE1\u3362rime;\u6034\u0180aip\u370F\u3712\u3764d\xE5\u1248\u0380adempst\u3721\u374D\u3740\u3751\u3757\u375C\u375Fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65B5own\xBB\u1DBBeft\u0100;e\u2800\u373E\xF1\u092E;\u625Cight\u0100;e\u32AA\u374B\xF1\u105Aot;\u65ECinus;\u6A3Alus;\u6A39b;\u69CDime;\u6A3Bezium;\u63E2\u0180cht\u3772\u377D\u3781\u0100ry\u3777\u377B;\uC000\u{1D4C9};\u4446cy;\u445Brok;\u4167\u0100io\u378B\u378Ex\xF4\u1777head\u0100lr\u3797\u37A0eftarro\xF7\u084Fightarrow\xBB\u0F5D\u0900AHabcdfghlmoprstuw\u37D0\u37D3\u37D7\u37E4\u37F0\u37FC\u380E\u381C\u3823\u3834\u3851\u385D\u386B\u38A9\u38CC\u38D2\u38EA\u38F6r\xF2\u03EDar;\u6963\u0100cr\u37DC\u37E2ute\u803B\xFA\u40FA\xF2\u1150r\u01E3\u37EA\0\u37EDy;\u445Eve;\u416D\u0100iy\u37F5\u37FArc\u803B\xFB\u40FB;\u4443\u0180abh\u3803\u3806\u380Br\xF2\u13ADlac;\u4171a\xF2\u13C3\u0100ir\u3813\u3818sht;\u697E;\uC000\u{1D532}rave\u803B\xF9\u40F9\u0161\u3827\u3831r\u0100lr\u382C\u382E\xBB\u0957\xBB\u1083lk;\u6580\u0100ct\u3839\u384D\u026F\u383F\0\0\u384Arn\u0100;e\u3845\u3846\u631Cr\xBB\u3846op;\u630Fri;\u65F8\u0100al\u3856\u385Acr;\u416B\u80BB\xA8\u0349\u0100gp\u3862\u3866on;\u4173f;\uC000\u{1D566}\u0300adhlsu\u114B\u3878\u387D\u1372\u3891\u38A0own\xE1\u13B3arpoon\u0100lr\u3888\u388Cef\xF4\u382Digh\xF4\u382Fi\u0180;hl\u3899\u389A\u389C\u43C5\xBB\u13FAon\xBB\u389Aparrows;\u61C8\u0180cit\u38B0\u38C4\u38C8\u026F\u38B6\0\0\u38C1rn\u0100;e\u38BC\u38BD\u631Dr\xBB\u38BDop;\u630Eng;\u416Fri;\u65F9cr;\uC000\u{1D4CA}\u0180dir\u38D9\u38DD\u38E2ot;\u62F0lde;\u4169i\u0100;f\u3730\u38E8\xBB\u1813\u0100am\u38EF\u38F2r\xF2\u38A8l\u803B\xFC\u40FCangle;\u69A7\u0780ABDacdeflnoprsz\u391C\u391F\u3929\u392D\u39B5\u39B8\u39BD\u39DF\u39E4\u39E8\u39F3\u39F9\u39FD\u3A01\u3A20r\xF2\u03F7ar\u0100;v\u3926\u3927\u6AE8;\u6AE9as\xE8\u03E1\u0100nr\u3932\u3937grt;\u699C\u0380eknprst\u34E3\u3946\u394B\u3952\u395D\u3964\u3996app\xE1\u2415othin\xE7\u1E96\u0180hir\u34EB\u2EC8\u3959op\xF4\u2FB5\u0100;h\u13B7\u3962\xEF\u318D\u0100iu\u3969\u396Dgm\xE1\u33B3\u0100bp\u3972\u3984setneq\u0100;q\u397D\u3980\uC000\u228A\uFE00;\uC000\u2ACB\uFE00setneq\u0100;q\u398F\u3992\uC000\u228B\uFE00;\uC000\u2ACC\uFE00\u0100hr\u399B\u399Fet\xE1\u369Ciangle\u0100lr\u39AA\u39AFeft\xBB\u0925ight\xBB\u1051y;\u4432ash\xBB\u1036\u0180elr\u39C4\u39D2\u39D7\u0180;be\u2DEA\u39CB\u39CFar;\u62BBq;\u625Alip;\u62EE\u0100bt\u39DC\u1468a\xF2\u1469r;\uC000\u{1D533}tr\xE9\u39AEsu\u0100bp\u39EF\u39F1\xBB\u0D1C\xBB\u0D59pf;\uC000\u{1D567}ro\xF0\u0EFBtr\xE9\u39B4\u0100cu\u3A06\u3A0Br;\uC000\u{1D4CB}\u0100bp\u3A10\u3A18n\u0100Ee\u3980\u3A16\xBB\u397En\u0100Ee\u3992\u3A1E\xBB\u3990igzag;\u699A\u0380cefoprs\u3A36\u3A3B\u3A56\u3A5B\u3A54\u3A61\u3A6Airc;\u4175\u0100di\u3A40\u3A51\u0100bg\u3A45\u3A49ar;\u6A5Fe\u0100;q\u15FA\u3A4F;\u6259erp;\u6118r;\uC000\u{1D534}pf;\uC000\u{1D568}\u0100;e\u1479\u3A66at\xE8\u1479cr;\uC000\u{1D4CC}\u0AE3\u178E\u3A87\0\u3A8B\0\u3A90\u3A9B\0\0\u3A9D\u3AA8\u3AAB\u3AAF\0\0\u3AC3\u3ACE\0\u3AD8\u17DC\u17DFtr\xE9\u17D1r;\uC000\u{1D535}\u0100Aa\u3A94\u3A97r\xF2\u03C3r\xF2\u09F6;\u43BE\u0100Aa\u3AA1\u3AA4r\xF2\u03B8r\xF2\u09EBa\xF0\u2713is;\u62FB\u0180dpt\u17A4\u3AB5\u3ABE\u0100fl\u3ABA\u17A9;\uC000\u{1D569}im\xE5\u17B2\u0100Aa\u3AC7\u3ACAr\xF2\u03CEr\xF2\u0A01\u0100cq\u3AD2\u17B8r;\uC000\u{1D4CD}\u0100pt\u17D6\u3ADCr\xE9\u17D4\u0400acefiosu\u3AF0\u3AFD\u3B08\u3B0C\u3B11\u3B15\u3B1B\u3B21c\u0100uy\u3AF6\u3AFBte\u803B\xFD\u40FD;\u444F\u0100iy\u3B02\u3B06rc;\u4177;\u444Bn\u803B\xA5\u40A5r;\uC000\u{1D536}cy;\u4457pf;\uC000\u{1D56A}cr;\uC000\u{1D4CE}\u0100cm\u3B26\u3B29y;\u444El\u803B\xFF\u40FF\u0500acdefhiosw\u3B42\u3B48\u3B54\u3B58\u3B64\u3B69\u3B6D\u3B74\u3B7A\u3B80cute;\u417A\u0100ay\u3B4D\u3B52ron;\u417E;\u4437ot;\u417C\u0100et\u3B5D\u3B61tr\xE6\u155Fa;\u43B6r;\uC000\u{1D537}cy;\u4436grarr;\u61DDpf;\uC000\u{1D56B}cr;\uC000\u{1D4CF}\u0100jn\u3B85\u3B87;\u600Dj;\u600C'.split("").map((c) => c.charCodeAt(0))
);

// node_modules/entities/lib/esm/generated/decode-data-xml.js
var decode_data_xml_default = new Uint16Array(
  // prettier-ignore
  "\u0200aglq	\x1B\u026D\0\0p;\u4026os;\u4027t;\u403Et;\u403Cuot;\u4022".split("").map((c) => c.charCodeAt(0))
);

// node_modules/entities/lib/esm/decode_codepoint.js
var _a;
var decodeMap = /* @__PURE__ */ new Map([
  [0, 65533],
  // C1 Unicode control character reference replacements
  [128, 8364],
  [130, 8218],
  [131, 402],
  [132, 8222],
  [133, 8230],
  [134, 8224],
  [135, 8225],
  [136, 710],
  [137, 8240],
  [138, 352],
  [139, 8249],
  [140, 338],
  [142, 381],
  [145, 8216],
  [146, 8217],
  [147, 8220],
  [148, 8221],
  [149, 8226],
  [150, 8211],
  [151, 8212],
  [152, 732],
  [153, 8482],
  [154, 353],
  [155, 8250],
  [156, 339],
  [158, 382],
  [159, 376]
]);
var fromCodePoint = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
  (_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function(codePoint) {
    let output = "";
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  }
);
function replaceCodePoint(codePoint) {
  var _a2;
  if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
    return 65533;
  }
  return (_a2 = decodeMap.get(codePoint)) !== null && _a2 !== void 0 ? _a2 : codePoint;
}

// node_modules/entities/lib/esm/decode.js
var CharCodes;
(function(CharCodes2) {
  CharCodes2[CharCodes2["NUM"] = 35] = "NUM";
  CharCodes2[CharCodes2["SEMI"] = 59] = "SEMI";
  CharCodes2[CharCodes2["EQUALS"] = 61] = "EQUALS";
  CharCodes2[CharCodes2["ZERO"] = 48] = "ZERO";
  CharCodes2[CharCodes2["NINE"] = 57] = "NINE";
  CharCodes2[CharCodes2["LOWER_A"] = 97] = "LOWER_A";
  CharCodes2[CharCodes2["LOWER_F"] = 102] = "LOWER_F";
  CharCodes2[CharCodes2["LOWER_X"] = 120] = "LOWER_X";
  CharCodes2[CharCodes2["LOWER_Z"] = 122] = "LOWER_Z";
  CharCodes2[CharCodes2["UPPER_A"] = 65] = "UPPER_A";
  CharCodes2[CharCodes2["UPPER_F"] = 70] = "UPPER_F";
  CharCodes2[CharCodes2["UPPER_Z"] = 90] = "UPPER_Z";
})(CharCodes || (CharCodes = {}));
var TO_LOWER_BIT = 32;
var BinTrieFlags;
(function(BinTrieFlags2) {
  BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
  BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
  BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
})(BinTrieFlags || (BinTrieFlags = {}));
function isNumber(code2) {
  return code2 >= CharCodes.ZERO && code2 <= CharCodes.NINE;
}
function isHexadecimalCharacter(code2) {
  return code2 >= CharCodes.UPPER_A && code2 <= CharCodes.UPPER_F || code2 >= CharCodes.LOWER_A && code2 <= CharCodes.LOWER_F;
}
function isAsciiAlphaNumeric(code2) {
  return code2 >= CharCodes.UPPER_A && code2 <= CharCodes.UPPER_Z || code2 >= CharCodes.LOWER_A && code2 <= CharCodes.LOWER_Z || isNumber(code2);
}
function isEntityInAttributeInvalidEnd(code2) {
  return code2 === CharCodes.EQUALS || isAsciiAlphaNumeric(code2);
}
var EntityDecoderState;
(function(EntityDecoderState2) {
  EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
  EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
  EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
  EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
  EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
})(EntityDecoderState || (EntityDecoderState = {}));
var DecodingMode;
(function(DecodingMode2) {
  DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
  DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
  DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
})(DecodingMode || (DecodingMode = {}));
var EntityDecoder = class {
  constructor(decodeTree, emitCodePoint, errors) {
    this.decodeTree = decodeTree;
    this.emitCodePoint = emitCodePoint;
    this.errors = errors;
    this.state = EntityDecoderState.EntityStart;
    this.consumed = 1;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.decodeMode = DecodingMode.Strict;
  }
  /** Resets the instance to make it reusable. */
  startEntity(decodeMode) {
    this.decodeMode = decodeMode;
    this.state = EntityDecoderState.EntityStart;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.consumed = 1;
  }
  /**
   * Write an entity to the decoder. This can be called multiple times with partial entities.
   * If the entity is incomplete, the decoder will return -1.
   *
   * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
   * entity is incomplete, and resume when the next string is written.
   *
   * @param string The string containing the entity (or a continuation of the entity).
   * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  write(str2, offset) {
    switch (this.state) {
      case EntityDecoderState.EntityStart: {
        if (str2.charCodeAt(offset) === CharCodes.NUM) {
          this.state = EntityDecoderState.NumericStart;
          this.consumed += 1;
          return this.stateNumericStart(str2, offset + 1);
        }
        this.state = EntityDecoderState.NamedEntity;
        return this.stateNamedEntity(str2, offset);
      }
      case EntityDecoderState.NumericStart: {
        return this.stateNumericStart(str2, offset);
      }
      case EntityDecoderState.NumericDecimal: {
        return this.stateNumericDecimal(str2, offset);
      }
      case EntityDecoderState.NumericHex: {
        return this.stateNumericHex(str2, offset);
      }
      case EntityDecoderState.NamedEntity: {
        return this.stateNamedEntity(str2, offset);
      }
    }
  }
  /**
   * Switches between the numeric decimal and hexadecimal states.
   *
   * Equivalent to the `Numeric character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericStart(str2, offset) {
    if (offset >= str2.length) {
      return -1;
    }
    if ((str2.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
      this.state = EntityDecoderState.NumericHex;
      this.consumed += 1;
      return this.stateNumericHex(str2, offset + 1);
    }
    this.state = EntityDecoderState.NumericDecimal;
    return this.stateNumericDecimal(str2, offset);
  }
  addToNumericResult(str2, start, end, base) {
    if (start !== end) {
      const digitCount = end - start;
      this.result = this.result * Math.pow(base, digitCount) + parseInt(str2.substr(start, digitCount), base);
      this.consumed += digitCount;
    }
  }
  /**
   * Parses a hexadecimal numeric entity.
   *
   * Equivalent to the `Hexademical character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericHex(str2, offset) {
    const startIdx = offset;
    while (offset < str2.length) {
      const char = str2.charCodeAt(offset);
      if (isNumber(char) || isHexadecimalCharacter(char)) {
        offset += 1;
      } else {
        this.addToNumericResult(str2, startIdx, offset, 16);
        return this.emitNumericEntity(char, 3);
      }
    }
    this.addToNumericResult(str2, startIdx, offset, 16);
    return -1;
  }
  /**
   * Parses a decimal numeric entity.
   *
   * Equivalent to the `Decimal character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericDecimal(str2, offset) {
    const startIdx = offset;
    while (offset < str2.length) {
      const char = str2.charCodeAt(offset);
      if (isNumber(char)) {
        offset += 1;
      } else {
        this.addToNumericResult(str2, startIdx, offset, 10);
        return this.emitNumericEntity(char, 2);
      }
    }
    this.addToNumericResult(str2, startIdx, offset, 10);
    return -1;
  }
  /**
   * Validate and emit a numeric entity.
   *
   * Implements the logic from the `Hexademical character reference start
   * state` and `Numeric character reference end state` in the HTML spec.
   *
   * @param lastCp The last code point of the entity. Used to see if the
   *               entity was terminated with a semicolon.
   * @param expectedLength The minimum number of characters that should be
   *                       consumed. Used to validate that at least one digit
   *                       was consumed.
   * @returns The number of characters that were consumed.
   */
  emitNumericEntity(lastCp, expectedLength) {
    var _a2;
    if (this.consumed <= expectedLength) {
      (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
      return 0;
    }
    if (lastCp === CharCodes.SEMI) {
      this.consumed += 1;
    } else if (this.decodeMode === DecodingMode.Strict) {
      return 0;
    }
    this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
    if (this.errors) {
      if (lastCp !== CharCodes.SEMI) {
        this.errors.missingSemicolonAfterCharacterReference();
      }
      this.errors.validateNumericCharacterReference(this.result);
    }
    return this.consumed;
  }
  /**
   * Parses a named entity.
   *
   * Equivalent to the `Named character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNamedEntity(str2, offset) {
    const { decodeTree } = this;
    let current = decodeTree[this.treeIndex];
    let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
    for (; offset < str2.length; offset++, this.excess++) {
      const char = str2.charCodeAt(offset);
      this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
      if (this.treeIndex < 0) {
        return this.result === 0 || // If we are parsing an attribute
        this.decodeMode === DecodingMode.Attribute && // We shouldn't have consumed any characters after the entity,
        (valueLength === 0 || // And there should be no invalid characters.
        isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
      }
      current = decodeTree[this.treeIndex];
      valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
      if (valueLength !== 0) {
        if (char === CharCodes.SEMI) {
          return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
        }
        if (this.decodeMode !== DecodingMode.Strict) {
          this.result = this.treeIndex;
          this.consumed += this.excess;
          this.excess = 0;
        }
      }
    }
    return -1;
  }
  /**
   * Emit a named entity that was not terminated with a semicolon.
   *
   * @returns The number of characters consumed.
   */
  emitNotTerminatedNamedEntity() {
    var _a2;
    const { result, decodeTree } = this;
    const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
    this.emitNamedEntityData(result, valueLength, this.consumed);
    (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.missingSemicolonAfterCharacterReference();
    return this.consumed;
  }
  /**
   * Emit a named entity.
   *
   * @param result The index of the entity in the decode tree.
   * @param valueLength The number of bytes in the entity.
   * @param consumed The number of characters consumed.
   *
   * @returns The number of characters consumed.
   */
  emitNamedEntityData(result, valueLength, consumed) {
    const { decodeTree } = this;
    this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH : decodeTree[result + 1], consumed);
    if (valueLength === 3) {
      this.emitCodePoint(decodeTree[result + 2], consumed);
    }
    return consumed;
  }
  /**
   * Signal to the parser that the end of the input was reached.
   *
   * Remaining data will be emitted and relevant errors will be produced.
   *
   * @returns The number of characters consumed.
   */
  end() {
    var _a2;
    switch (this.state) {
      case EntityDecoderState.NamedEntity: {
        return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
      }
      // Otherwise, emit a numeric entity if we have one.
      case EntityDecoderState.NumericDecimal: {
        return this.emitNumericEntity(0, 2);
      }
      case EntityDecoderState.NumericHex: {
        return this.emitNumericEntity(0, 3);
      }
      case EntityDecoderState.NumericStart: {
        (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
        return 0;
      }
      case EntityDecoderState.EntityStart: {
        return 0;
      }
    }
  }
};
function getDecoder(decodeTree) {
  let ret = "";
  const decoder = new EntityDecoder(decodeTree, (str2) => ret += fromCodePoint(str2));
  return function decodeWithTrie(str2, decodeMode) {
    let lastIndex = 0;
    let offset = 0;
    while ((offset = str2.indexOf("&", offset)) >= 0) {
      ret += str2.slice(lastIndex, offset);
      decoder.startEntity(decodeMode);
      const len = decoder.write(
        str2,
        // Skip the "&"
        offset + 1
      );
      if (len < 0) {
        lastIndex = offset + decoder.end();
        break;
      }
      lastIndex = offset + len;
      offset = len === 0 ? lastIndex + 1 : lastIndex;
    }
    const result = ret + str2.slice(lastIndex);
    ret = "";
    return result;
  };
}
function determineBranch(decodeTree, current, nodeIdx, char) {
  const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
  const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
  if (branchCount === 0) {
    return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
  }
  if (jumpOffset) {
    const value = char - jumpOffset;
    return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIdx + value] - 1;
  }
  let lo = nodeIdx;
  let hi = lo + branchCount - 1;
  while (lo <= hi) {
    const mid = lo + hi >>> 1;
    const midVal = decodeTree[mid];
    if (midVal < char) {
      lo = mid + 1;
    } else if (midVal > char) {
      hi = mid - 1;
    } else {
      return decodeTree[mid + branchCount];
    }
  }
  return -1;
}
var htmlDecoder = getDecoder(decode_data_html_default);
var xmlDecoder = getDecoder(decode_data_xml_default);
function decodeHTML(str2, mode = DecodingMode.Legacy) {
  return htmlDecoder(str2, mode);
}
function decodeHTMLStrict(str2) {
  return htmlDecoder(str2, DecodingMode.Strict);
}

// node_modules/entities/lib/esm/generated/encode-html.js
function restoreDiff(arr) {
  for (let i2 = 1; i2 < arr.length; i2++) {
    arr[i2][0] += arr[i2 - 1][0] + 1;
  }
  return arr;
}
var encode_html_default = new Map(/* @__PURE__ */ restoreDiff([[9, "&Tab;"], [0, "&NewLine;"], [22, "&excl;"], [0, "&quot;"], [0, "&num;"], [0, "&dollar;"], [0, "&percnt;"], [0, "&amp;"], [0, "&apos;"], [0, "&lpar;"], [0, "&rpar;"], [0, "&ast;"], [0, "&plus;"], [0, "&comma;"], [1, "&period;"], [0, "&sol;"], [10, "&colon;"], [0, "&semi;"], [0, { v: "&lt;", n: 8402, o: "&nvlt;" }], [0, { v: "&equals;", n: 8421, o: "&bne;" }], [0, { v: "&gt;", n: 8402, o: "&nvgt;" }], [0, "&quest;"], [0, "&commat;"], [26, "&lbrack;"], [0, "&bsol;"], [0, "&rbrack;"], [0, "&Hat;"], [0, "&lowbar;"], [0, "&DiacriticalGrave;"], [5, { n: 106, o: "&fjlig;" }], [20, "&lbrace;"], [0, "&verbar;"], [0, "&rbrace;"], [34, "&nbsp;"], [0, "&iexcl;"], [0, "&cent;"], [0, "&pound;"], [0, "&curren;"], [0, "&yen;"], [0, "&brvbar;"], [0, "&sect;"], [0, "&die;"], [0, "&copy;"], [0, "&ordf;"], [0, "&laquo;"], [0, "&not;"], [0, "&shy;"], [0, "&circledR;"], [0, "&macr;"], [0, "&deg;"], [0, "&PlusMinus;"], [0, "&sup2;"], [0, "&sup3;"], [0, "&acute;"], [0, "&micro;"], [0, "&para;"], [0, "&centerdot;"], [0, "&cedil;"], [0, "&sup1;"], [0, "&ordm;"], [0, "&raquo;"], [0, "&frac14;"], [0, "&frac12;"], [0, "&frac34;"], [0, "&iquest;"], [0, "&Agrave;"], [0, "&Aacute;"], [0, "&Acirc;"], [0, "&Atilde;"], [0, "&Auml;"], [0, "&angst;"], [0, "&AElig;"], [0, "&Ccedil;"], [0, "&Egrave;"], [0, "&Eacute;"], [0, "&Ecirc;"], [0, "&Euml;"], [0, "&Igrave;"], [0, "&Iacute;"], [0, "&Icirc;"], [0, "&Iuml;"], [0, "&ETH;"], [0, "&Ntilde;"], [0, "&Ograve;"], [0, "&Oacute;"], [0, "&Ocirc;"], [0, "&Otilde;"], [0, "&Ouml;"], [0, "&times;"], [0, "&Oslash;"], [0, "&Ugrave;"], [0, "&Uacute;"], [0, "&Ucirc;"], [0, "&Uuml;"], [0, "&Yacute;"], [0, "&THORN;"], [0, "&szlig;"], [0, "&agrave;"], [0, "&aacute;"], [0, "&acirc;"], [0, "&atilde;"], [0, "&auml;"], [0, "&aring;"], [0, "&aelig;"], [0, "&ccedil;"], [0, "&egrave;"], [0, "&eacute;"], [0, "&ecirc;"], [0, "&euml;"], [0, "&igrave;"], [0, "&iacute;"], [0, "&icirc;"], [0, "&iuml;"], [0, "&eth;"], [0, "&ntilde;"], [0, "&ograve;"], [0, "&oacute;"], [0, "&ocirc;"], [0, "&otilde;"], [0, "&ouml;"], [0, "&div;"], [0, "&oslash;"], [0, "&ugrave;"], [0, "&uacute;"], [0, "&ucirc;"], [0, "&uuml;"], [0, "&yacute;"], [0, "&thorn;"], [0, "&yuml;"], [0, "&Amacr;"], [0, "&amacr;"], [0, "&Abreve;"], [0, "&abreve;"], [0, "&Aogon;"], [0, "&aogon;"], [0, "&Cacute;"], [0, "&cacute;"], [0, "&Ccirc;"], [0, "&ccirc;"], [0, "&Cdot;"], [0, "&cdot;"], [0, "&Ccaron;"], [0, "&ccaron;"], [0, "&Dcaron;"], [0, "&dcaron;"], [0, "&Dstrok;"], [0, "&dstrok;"], [0, "&Emacr;"], [0, "&emacr;"], [2, "&Edot;"], [0, "&edot;"], [0, "&Eogon;"], [0, "&eogon;"], [0, "&Ecaron;"], [0, "&ecaron;"], [0, "&Gcirc;"], [0, "&gcirc;"], [0, "&Gbreve;"], [0, "&gbreve;"], [0, "&Gdot;"], [0, "&gdot;"], [0, "&Gcedil;"], [1, "&Hcirc;"], [0, "&hcirc;"], [0, "&Hstrok;"], [0, "&hstrok;"], [0, "&Itilde;"], [0, "&itilde;"], [0, "&Imacr;"], [0, "&imacr;"], [2, "&Iogon;"], [0, "&iogon;"], [0, "&Idot;"], [0, "&imath;"], [0, "&IJlig;"], [0, "&ijlig;"], [0, "&Jcirc;"], [0, "&jcirc;"], [0, "&Kcedil;"], [0, "&kcedil;"], [0, "&kgreen;"], [0, "&Lacute;"], [0, "&lacute;"], [0, "&Lcedil;"], [0, "&lcedil;"], [0, "&Lcaron;"], [0, "&lcaron;"], [0, "&Lmidot;"], [0, "&lmidot;"], [0, "&Lstrok;"], [0, "&lstrok;"], [0, "&Nacute;"], [0, "&nacute;"], [0, "&Ncedil;"], [0, "&ncedil;"], [0, "&Ncaron;"], [0, "&ncaron;"], [0, "&napos;"], [0, "&ENG;"], [0, "&eng;"], [0, "&Omacr;"], [0, "&omacr;"], [2, "&Odblac;"], [0, "&odblac;"], [0, "&OElig;"], [0, "&oelig;"], [0, "&Racute;"], [0, "&racute;"], [0, "&Rcedil;"], [0, "&rcedil;"], [0, "&Rcaron;"], [0, "&rcaron;"], [0, "&Sacute;"], [0, "&sacute;"], [0, "&Scirc;"], [0, "&scirc;"], [0, "&Scedil;"], [0, "&scedil;"], [0, "&Scaron;"], [0, "&scaron;"], [0, "&Tcedil;"], [0, "&tcedil;"], [0, "&Tcaron;"], [0, "&tcaron;"], [0, "&Tstrok;"], [0, "&tstrok;"], [0, "&Utilde;"], [0, "&utilde;"], [0, "&Umacr;"], [0, "&umacr;"], [0, "&Ubreve;"], [0, "&ubreve;"], [0, "&Uring;"], [0, "&uring;"], [0, "&Udblac;"], [0, "&udblac;"], [0, "&Uogon;"], [0, "&uogon;"], [0, "&Wcirc;"], [0, "&wcirc;"], [0, "&Ycirc;"], [0, "&ycirc;"], [0, "&Yuml;"], [0, "&Zacute;"], [0, "&zacute;"], [0, "&Zdot;"], [0, "&zdot;"], [0, "&Zcaron;"], [0, "&zcaron;"], [19, "&fnof;"], [34, "&imped;"], [63, "&gacute;"], [65, "&jmath;"], [142, "&circ;"], [0, "&caron;"], [16, "&breve;"], [0, "&DiacriticalDot;"], [0, "&ring;"], [0, "&ogon;"], [0, "&DiacriticalTilde;"], [0, "&dblac;"], [51, "&DownBreve;"], [127, "&Alpha;"], [0, "&Beta;"], [0, "&Gamma;"], [0, "&Delta;"], [0, "&Epsilon;"], [0, "&Zeta;"], [0, "&Eta;"], [0, "&Theta;"], [0, "&Iota;"], [0, "&Kappa;"], [0, "&Lambda;"], [0, "&Mu;"], [0, "&Nu;"], [0, "&Xi;"], [0, "&Omicron;"], [0, "&Pi;"], [0, "&Rho;"], [1, "&Sigma;"], [0, "&Tau;"], [0, "&Upsilon;"], [0, "&Phi;"], [0, "&Chi;"], [0, "&Psi;"], [0, "&ohm;"], [7, "&alpha;"], [0, "&beta;"], [0, "&gamma;"], [0, "&delta;"], [0, "&epsi;"], [0, "&zeta;"], [0, "&eta;"], [0, "&theta;"], [0, "&iota;"], [0, "&kappa;"], [0, "&lambda;"], [0, "&mu;"], [0, "&nu;"], [0, "&xi;"], [0, "&omicron;"], [0, "&pi;"], [0, "&rho;"], [0, "&sigmaf;"], [0, "&sigma;"], [0, "&tau;"], [0, "&upsi;"], [0, "&phi;"], [0, "&chi;"], [0, "&psi;"], [0, "&omega;"], [7, "&thetasym;"], [0, "&Upsi;"], [2, "&phiv;"], [0, "&piv;"], [5, "&Gammad;"], [0, "&digamma;"], [18, "&kappav;"], [0, "&rhov;"], [3, "&epsiv;"], [0, "&backepsilon;"], [10, "&IOcy;"], [0, "&DJcy;"], [0, "&GJcy;"], [0, "&Jukcy;"], [0, "&DScy;"], [0, "&Iukcy;"], [0, "&YIcy;"], [0, "&Jsercy;"], [0, "&LJcy;"], [0, "&NJcy;"], [0, "&TSHcy;"], [0, "&KJcy;"], [1, "&Ubrcy;"], [0, "&DZcy;"], [0, "&Acy;"], [0, "&Bcy;"], [0, "&Vcy;"], [0, "&Gcy;"], [0, "&Dcy;"], [0, "&IEcy;"], [0, "&ZHcy;"], [0, "&Zcy;"], [0, "&Icy;"], [0, "&Jcy;"], [0, "&Kcy;"], [0, "&Lcy;"], [0, "&Mcy;"], [0, "&Ncy;"], [0, "&Ocy;"], [0, "&Pcy;"], [0, "&Rcy;"], [0, "&Scy;"], [0, "&Tcy;"], [0, "&Ucy;"], [0, "&Fcy;"], [0, "&KHcy;"], [0, "&TScy;"], [0, "&CHcy;"], [0, "&SHcy;"], [0, "&SHCHcy;"], [0, "&HARDcy;"], [0, "&Ycy;"], [0, "&SOFTcy;"], [0, "&Ecy;"], [0, "&YUcy;"], [0, "&YAcy;"], [0, "&acy;"], [0, "&bcy;"], [0, "&vcy;"], [0, "&gcy;"], [0, "&dcy;"], [0, "&iecy;"], [0, "&zhcy;"], [0, "&zcy;"], [0, "&icy;"], [0, "&jcy;"], [0, "&kcy;"], [0, "&lcy;"], [0, "&mcy;"], [0, "&ncy;"], [0, "&ocy;"], [0, "&pcy;"], [0, "&rcy;"], [0, "&scy;"], [0, "&tcy;"], [0, "&ucy;"], [0, "&fcy;"], [0, "&khcy;"], [0, "&tscy;"], [0, "&chcy;"], [0, "&shcy;"], [0, "&shchcy;"], [0, "&hardcy;"], [0, "&ycy;"], [0, "&softcy;"], [0, "&ecy;"], [0, "&yucy;"], [0, "&yacy;"], [1, "&iocy;"], [0, "&djcy;"], [0, "&gjcy;"], [0, "&jukcy;"], [0, "&dscy;"], [0, "&iukcy;"], [0, "&yicy;"], [0, "&jsercy;"], [0, "&ljcy;"], [0, "&njcy;"], [0, "&tshcy;"], [0, "&kjcy;"], [1, "&ubrcy;"], [0, "&dzcy;"], [7074, "&ensp;"], [0, "&emsp;"], [0, "&emsp13;"], [0, "&emsp14;"], [1, "&numsp;"], [0, "&puncsp;"], [0, "&ThinSpace;"], [0, "&hairsp;"], [0, "&NegativeMediumSpace;"], [0, "&zwnj;"], [0, "&zwj;"], [0, "&lrm;"], [0, "&rlm;"], [0, "&dash;"], [2, "&ndash;"], [0, "&mdash;"], [0, "&horbar;"], [0, "&Verbar;"], [1, "&lsquo;"], [0, "&CloseCurlyQuote;"], [0, "&lsquor;"], [1, "&ldquo;"], [0, "&CloseCurlyDoubleQuote;"], [0, "&bdquo;"], [1, "&dagger;"], [0, "&Dagger;"], [0, "&bull;"], [2, "&nldr;"], [0, "&hellip;"], [9, "&permil;"], [0, "&pertenk;"], [0, "&prime;"], [0, "&Prime;"], [0, "&tprime;"], [0, "&backprime;"], [3, "&lsaquo;"], [0, "&rsaquo;"], [3, "&oline;"], [2, "&caret;"], [1, "&hybull;"], [0, "&frasl;"], [10, "&bsemi;"], [7, "&qprime;"], [7, { v: "&MediumSpace;", n: 8202, o: "&ThickSpace;" }], [0, "&NoBreak;"], [0, "&af;"], [0, "&InvisibleTimes;"], [0, "&ic;"], [72, "&euro;"], [46, "&tdot;"], [0, "&DotDot;"], [37, "&complexes;"], [2, "&incare;"], [4, "&gscr;"], [0, "&hamilt;"], [0, "&Hfr;"], [0, "&Hopf;"], [0, "&planckh;"], [0, "&hbar;"], [0, "&imagline;"], [0, "&Ifr;"], [0, "&lagran;"], [0, "&ell;"], [1, "&naturals;"], [0, "&numero;"], [0, "&copysr;"], [0, "&weierp;"], [0, "&Popf;"], [0, "&Qopf;"], [0, "&realine;"], [0, "&real;"], [0, "&reals;"], [0, "&rx;"], [3, "&trade;"], [1, "&integers;"], [2, "&mho;"], [0, "&zeetrf;"], [0, "&iiota;"], [2, "&bernou;"], [0, "&Cayleys;"], [1, "&escr;"], [0, "&Escr;"], [0, "&Fouriertrf;"], [1, "&Mellintrf;"], [0, "&order;"], [0, "&alefsym;"], [0, "&beth;"], [0, "&gimel;"], [0, "&daleth;"], [12, "&CapitalDifferentialD;"], [0, "&dd;"], [0, "&ee;"], [0, "&ii;"], [10, "&frac13;"], [0, "&frac23;"], [0, "&frac15;"], [0, "&frac25;"], [0, "&frac35;"], [0, "&frac45;"], [0, "&frac16;"], [0, "&frac56;"], [0, "&frac18;"], [0, "&frac38;"], [0, "&frac58;"], [0, "&frac78;"], [49, "&larr;"], [0, "&ShortUpArrow;"], [0, "&rarr;"], [0, "&darr;"], [0, "&harr;"], [0, "&updownarrow;"], [0, "&nwarr;"], [0, "&nearr;"], [0, "&LowerRightArrow;"], [0, "&LowerLeftArrow;"], [0, "&nlarr;"], [0, "&nrarr;"], [1, { v: "&rarrw;", n: 824, o: "&nrarrw;" }], [0, "&Larr;"], [0, "&Uarr;"], [0, "&Rarr;"], [0, "&Darr;"], [0, "&larrtl;"], [0, "&rarrtl;"], [0, "&LeftTeeArrow;"], [0, "&mapstoup;"], [0, "&map;"], [0, "&DownTeeArrow;"], [1, "&hookleftarrow;"], [0, "&hookrightarrow;"], [0, "&larrlp;"], [0, "&looparrowright;"], [0, "&harrw;"], [0, "&nharr;"], [1, "&lsh;"], [0, "&rsh;"], [0, "&ldsh;"], [0, "&rdsh;"], [1, "&crarr;"], [0, "&cularr;"], [0, "&curarr;"], [2, "&circlearrowleft;"], [0, "&circlearrowright;"], [0, "&leftharpoonup;"], [0, "&DownLeftVector;"], [0, "&RightUpVector;"], [0, "&LeftUpVector;"], [0, "&rharu;"], [0, "&DownRightVector;"], [0, "&dharr;"], [0, "&dharl;"], [0, "&RightArrowLeftArrow;"], [0, "&udarr;"], [0, "&LeftArrowRightArrow;"], [0, "&leftleftarrows;"], [0, "&upuparrows;"], [0, "&rightrightarrows;"], [0, "&ddarr;"], [0, "&leftrightharpoons;"], [0, "&Equilibrium;"], [0, "&nlArr;"], [0, "&nhArr;"], [0, "&nrArr;"], [0, "&DoubleLeftArrow;"], [0, "&DoubleUpArrow;"], [0, "&DoubleRightArrow;"], [0, "&dArr;"], [0, "&DoubleLeftRightArrow;"], [0, "&DoubleUpDownArrow;"], [0, "&nwArr;"], [0, "&neArr;"], [0, "&seArr;"], [0, "&swArr;"], [0, "&lAarr;"], [0, "&rAarr;"], [1, "&zigrarr;"], [6, "&larrb;"], [0, "&rarrb;"], [15, "&DownArrowUpArrow;"], [7, "&loarr;"], [0, "&roarr;"], [0, "&hoarr;"], [0, "&forall;"], [0, "&comp;"], [0, { v: "&part;", n: 824, o: "&npart;" }], [0, "&exist;"], [0, "&nexist;"], [0, "&empty;"], [1, "&Del;"], [0, "&Element;"], [0, "&NotElement;"], [1, "&ni;"], [0, "&notni;"], [2, "&prod;"], [0, "&coprod;"], [0, "&sum;"], [0, "&minus;"], [0, "&MinusPlus;"], [0, "&dotplus;"], [1, "&Backslash;"], [0, "&lowast;"], [0, "&compfn;"], [1, "&radic;"], [2, "&prop;"], [0, "&infin;"], [0, "&angrt;"], [0, { v: "&ang;", n: 8402, o: "&nang;" }], [0, "&angmsd;"], [0, "&angsph;"], [0, "&mid;"], [0, "&nmid;"], [0, "&DoubleVerticalBar;"], [0, "&NotDoubleVerticalBar;"], [0, "&and;"], [0, "&or;"], [0, { v: "&cap;", n: 65024, o: "&caps;" }], [0, { v: "&cup;", n: 65024, o: "&cups;" }], [0, "&int;"], [0, "&Int;"], [0, "&iiint;"], [0, "&conint;"], [0, "&Conint;"], [0, "&Cconint;"], [0, "&cwint;"], [0, "&ClockwiseContourIntegral;"], [0, "&awconint;"], [0, "&there4;"], [0, "&becaus;"], [0, "&ratio;"], [0, "&Colon;"], [0, "&dotminus;"], [1, "&mDDot;"], [0, "&homtht;"], [0, { v: "&sim;", n: 8402, o: "&nvsim;" }], [0, { v: "&backsim;", n: 817, o: "&race;" }], [0, { v: "&ac;", n: 819, o: "&acE;" }], [0, "&acd;"], [0, "&VerticalTilde;"], [0, "&NotTilde;"], [0, { v: "&eqsim;", n: 824, o: "&nesim;" }], [0, "&sime;"], [0, "&NotTildeEqual;"], [0, "&cong;"], [0, "&simne;"], [0, "&ncong;"], [0, "&ap;"], [0, "&nap;"], [0, "&ape;"], [0, { v: "&apid;", n: 824, o: "&napid;" }], [0, "&backcong;"], [0, { v: "&asympeq;", n: 8402, o: "&nvap;" }], [0, { v: "&bump;", n: 824, o: "&nbump;" }], [0, { v: "&bumpe;", n: 824, o: "&nbumpe;" }], [0, { v: "&doteq;", n: 824, o: "&nedot;" }], [0, "&doteqdot;"], [0, "&efDot;"], [0, "&erDot;"], [0, "&Assign;"], [0, "&ecolon;"], [0, "&ecir;"], [0, "&circeq;"], [1, "&wedgeq;"], [0, "&veeeq;"], [1, "&triangleq;"], [2, "&equest;"], [0, "&ne;"], [0, { v: "&Congruent;", n: 8421, o: "&bnequiv;" }], [0, "&nequiv;"], [1, { v: "&le;", n: 8402, o: "&nvle;" }], [0, { v: "&ge;", n: 8402, o: "&nvge;" }], [0, { v: "&lE;", n: 824, o: "&nlE;" }], [0, { v: "&gE;", n: 824, o: "&ngE;" }], [0, { v: "&lnE;", n: 65024, o: "&lvertneqq;" }], [0, { v: "&gnE;", n: 65024, o: "&gvertneqq;" }], [0, { v: "&ll;", n: new Map(/* @__PURE__ */ restoreDiff([[824, "&nLtv;"], [7577, "&nLt;"]])) }], [0, { v: "&gg;", n: new Map(/* @__PURE__ */ restoreDiff([[824, "&nGtv;"], [7577, "&nGt;"]])) }], [0, "&between;"], [0, "&NotCupCap;"], [0, "&nless;"], [0, "&ngt;"], [0, "&nle;"], [0, "&nge;"], [0, "&lesssim;"], [0, "&GreaterTilde;"], [0, "&nlsim;"], [0, "&ngsim;"], [0, "&LessGreater;"], [0, "&gl;"], [0, "&NotLessGreater;"], [0, "&NotGreaterLess;"], [0, "&pr;"], [0, "&sc;"], [0, "&prcue;"], [0, "&sccue;"], [0, "&PrecedesTilde;"], [0, { v: "&scsim;", n: 824, o: "&NotSucceedsTilde;" }], [0, "&NotPrecedes;"], [0, "&NotSucceeds;"], [0, { v: "&sub;", n: 8402, o: "&NotSubset;" }], [0, { v: "&sup;", n: 8402, o: "&NotSuperset;" }], [0, "&nsub;"], [0, "&nsup;"], [0, "&sube;"], [0, "&supe;"], [0, "&NotSubsetEqual;"], [0, "&NotSupersetEqual;"], [0, { v: "&subne;", n: 65024, o: "&varsubsetneq;" }], [0, { v: "&supne;", n: 65024, o: "&varsupsetneq;" }], [1, "&cupdot;"], [0, "&UnionPlus;"], [0, { v: "&sqsub;", n: 824, o: "&NotSquareSubset;" }], [0, { v: "&sqsup;", n: 824, o: "&NotSquareSuperset;" }], [0, "&sqsube;"], [0, "&sqsupe;"], [0, { v: "&sqcap;", n: 65024, o: "&sqcaps;" }], [0, { v: "&sqcup;", n: 65024, o: "&sqcups;" }], [0, "&CirclePlus;"], [0, "&CircleMinus;"], [0, "&CircleTimes;"], [0, "&osol;"], [0, "&CircleDot;"], [0, "&circledcirc;"], [0, "&circledast;"], [1, "&circleddash;"], [0, "&boxplus;"], [0, "&boxminus;"], [0, "&boxtimes;"], [0, "&dotsquare;"], [0, "&RightTee;"], [0, "&dashv;"], [0, "&DownTee;"], [0, "&bot;"], [1, "&models;"], [0, "&DoubleRightTee;"], [0, "&Vdash;"], [0, "&Vvdash;"], [0, "&VDash;"], [0, "&nvdash;"], [0, "&nvDash;"], [0, "&nVdash;"], [0, "&nVDash;"], [0, "&prurel;"], [1, "&LeftTriangle;"], [0, "&RightTriangle;"], [0, { v: "&LeftTriangleEqual;", n: 8402, o: "&nvltrie;" }], [0, { v: "&RightTriangleEqual;", n: 8402, o: "&nvrtrie;" }], [0, "&origof;"], [0, "&imof;"], [0, "&multimap;"], [0, "&hercon;"], [0, "&intcal;"], [0, "&veebar;"], [1, "&barvee;"], [0, "&angrtvb;"], [0, "&lrtri;"], [0, "&bigwedge;"], [0, "&bigvee;"], [0, "&bigcap;"], [0, "&bigcup;"], [0, "&diam;"], [0, "&sdot;"], [0, "&sstarf;"], [0, "&divideontimes;"], [0, "&bowtie;"], [0, "&ltimes;"], [0, "&rtimes;"], [0, "&leftthreetimes;"], [0, "&rightthreetimes;"], [0, "&backsimeq;"], [0, "&curlyvee;"], [0, "&curlywedge;"], [0, "&Sub;"], [0, "&Sup;"], [0, "&Cap;"], [0, "&Cup;"], [0, "&fork;"], [0, "&epar;"], [0, "&lessdot;"], [0, "&gtdot;"], [0, { v: "&Ll;", n: 824, o: "&nLl;" }], [0, { v: "&Gg;", n: 824, o: "&nGg;" }], [0, { v: "&leg;", n: 65024, o: "&lesg;" }], [0, { v: "&gel;", n: 65024, o: "&gesl;" }], [2, "&cuepr;"], [0, "&cuesc;"], [0, "&NotPrecedesSlantEqual;"], [0, "&NotSucceedsSlantEqual;"], [0, "&NotSquareSubsetEqual;"], [0, "&NotSquareSupersetEqual;"], [2, "&lnsim;"], [0, "&gnsim;"], [0, "&precnsim;"], [0, "&scnsim;"], [0, "&nltri;"], [0, "&NotRightTriangle;"], [0, "&nltrie;"], [0, "&NotRightTriangleEqual;"], [0, "&vellip;"], [0, "&ctdot;"], [0, "&utdot;"], [0, "&dtdot;"], [0, "&disin;"], [0, "&isinsv;"], [0, "&isins;"], [0, { v: "&isindot;", n: 824, o: "&notindot;" }], [0, "&notinvc;"], [0, "&notinvb;"], [1, { v: "&isinE;", n: 824, o: "&notinE;" }], [0, "&nisd;"], [0, "&xnis;"], [0, "&nis;"], [0, "&notnivc;"], [0, "&notnivb;"], [6, "&barwed;"], [0, "&Barwed;"], [1, "&lceil;"], [0, "&rceil;"], [0, "&LeftFloor;"], [0, "&rfloor;"], [0, "&drcrop;"], [0, "&dlcrop;"], [0, "&urcrop;"], [0, "&ulcrop;"], [0, "&bnot;"], [1, "&profline;"], [0, "&profsurf;"], [1, "&telrec;"], [0, "&target;"], [5, "&ulcorn;"], [0, "&urcorn;"], [0, "&dlcorn;"], [0, "&drcorn;"], [2, "&frown;"], [0, "&smile;"], [9, "&cylcty;"], [0, "&profalar;"], [7, "&topbot;"], [6, "&ovbar;"], [1, "&solbar;"], [60, "&angzarr;"], [51, "&lmoustache;"], [0, "&rmoustache;"], [2, "&OverBracket;"], [0, "&bbrk;"], [0, "&bbrktbrk;"], [37, "&OverParenthesis;"], [0, "&UnderParenthesis;"], [0, "&OverBrace;"], [0, "&UnderBrace;"], [2, "&trpezium;"], [4, "&elinters;"], [59, "&blank;"], [164, "&circledS;"], [55, "&boxh;"], [1, "&boxv;"], [9, "&boxdr;"], [3, "&boxdl;"], [3, "&boxur;"], [3, "&boxul;"], [3, "&boxvr;"], [7, "&boxvl;"], [7, "&boxhd;"], [7, "&boxhu;"], [7, "&boxvh;"], [19, "&boxH;"], [0, "&boxV;"], [0, "&boxdR;"], [0, "&boxDr;"], [0, "&boxDR;"], [0, "&boxdL;"], [0, "&boxDl;"], [0, "&boxDL;"], [0, "&boxuR;"], [0, "&boxUr;"], [0, "&boxUR;"], [0, "&boxuL;"], [0, "&boxUl;"], [0, "&boxUL;"], [0, "&boxvR;"], [0, "&boxVr;"], [0, "&boxVR;"], [0, "&boxvL;"], [0, "&boxVl;"], [0, "&boxVL;"], [0, "&boxHd;"], [0, "&boxhD;"], [0, "&boxHD;"], [0, "&boxHu;"], [0, "&boxhU;"], [0, "&boxHU;"], [0, "&boxvH;"], [0, "&boxVh;"], [0, "&boxVH;"], [19, "&uhblk;"], [3, "&lhblk;"], [3, "&block;"], [8, "&blk14;"], [0, "&blk12;"], [0, "&blk34;"], [13, "&square;"], [8, "&blacksquare;"], [0, "&EmptyVerySmallSquare;"], [1, "&rect;"], [0, "&marker;"], [2, "&fltns;"], [1, "&bigtriangleup;"], [0, "&blacktriangle;"], [0, "&triangle;"], [2, "&blacktriangleright;"], [0, "&rtri;"], [3, "&bigtriangledown;"], [0, "&blacktriangledown;"], [0, "&dtri;"], [2, "&blacktriangleleft;"], [0, "&ltri;"], [6, "&loz;"], [0, "&cir;"], [32, "&tridot;"], [2, "&bigcirc;"], [8, "&ultri;"], [0, "&urtri;"], [0, "&lltri;"], [0, "&EmptySmallSquare;"], [0, "&FilledSmallSquare;"], [8, "&bigstar;"], [0, "&star;"], [7, "&phone;"], [49, "&female;"], [1, "&male;"], [29, "&spades;"], [2, "&clubs;"], [1, "&hearts;"], [0, "&diamondsuit;"], [3, "&sung;"], [2, "&flat;"], [0, "&natural;"], [0, "&sharp;"], [163, "&check;"], [3, "&cross;"], [8, "&malt;"], [21, "&sext;"], [33, "&VerticalSeparator;"], [25, "&lbbrk;"], [0, "&rbbrk;"], [84, "&bsolhsub;"], [0, "&suphsol;"], [28, "&LeftDoubleBracket;"], [0, "&RightDoubleBracket;"], [0, "&lang;"], [0, "&rang;"], [0, "&Lang;"], [0, "&Rang;"], [0, "&loang;"], [0, "&roang;"], [7, "&longleftarrow;"], [0, "&longrightarrow;"], [0, "&longleftrightarrow;"], [0, "&DoubleLongLeftArrow;"], [0, "&DoubleLongRightArrow;"], [0, "&DoubleLongLeftRightArrow;"], [1, "&longmapsto;"], [2, "&dzigrarr;"], [258, "&nvlArr;"], [0, "&nvrArr;"], [0, "&nvHarr;"], [0, "&Map;"], [6, "&lbarr;"], [0, "&bkarow;"], [0, "&lBarr;"], [0, "&dbkarow;"], [0, "&drbkarow;"], [0, "&DDotrahd;"], [0, "&UpArrowBar;"], [0, "&DownArrowBar;"], [2, "&Rarrtl;"], [2, "&latail;"], [0, "&ratail;"], [0, "&lAtail;"], [0, "&rAtail;"], [0, "&larrfs;"], [0, "&rarrfs;"], [0, "&larrbfs;"], [0, "&rarrbfs;"], [2, "&nwarhk;"], [0, "&nearhk;"], [0, "&hksearow;"], [0, "&hkswarow;"], [0, "&nwnear;"], [0, "&nesear;"], [0, "&seswar;"], [0, "&swnwar;"], [8, { v: "&rarrc;", n: 824, o: "&nrarrc;" }], [1, "&cudarrr;"], [0, "&ldca;"], [0, "&rdca;"], [0, "&cudarrl;"], [0, "&larrpl;"], [2, "&curarrm;"], [0, "&cularrp;"], [7, "&rarrpl;"], [2, "&harrcir;"], [0, "&Uarrocir;"], [0, "&lurdshar;"], [0, "&ldrushar;"], [2, "&LeftRightVector;"], [0, "&RightUpDownVector;"], [0, "&DownLeftRightVector;"], [0, "&LeftUpDownVector;"], [0, "&LeftVectorBar;"], [0, "&RightVectorBar;"], [0, "&RightUpVectorBar;"], [0, "&RightDownVectorBar;"], [0, "&DownLeftVectorBar;"], [0, "&DownRightVectorBar;"], [0, "&LeftUpVectorBar;"], [0, "&LeftDownVectorBar;"], [0, "&LeftTeeVector;"], [0, "&RightTeeVector;"], [0, "&RightUpTeeVector;"], [0, "&RightDownTeeVector;"], [0, "&DownLeftTeeVector;"], [0, "&DownRightTeeVector;"], [0, "&LeftUpTeeVector;"], [0, "&LeftDownTeeVector;"], [0, "&lHar;"], [0, "&uHar;"], [0, "&rHar;"], [0, "&dHar;"], [0, "&luruhar;"], [0, "&ldrdhar;"], [0, "&ruluhar;"], [0, "&rdldhar;"], [0, "&lharul;"], [0, "&llhard;"], [0, "&rharul;"], [0, "&lrhard;"], [0, "&udhar;"], [0, "&duhar;"], [0, "&RoundImplies;"], [0, "&erarr;"], [0, "&simrarr;"], [0, "&larrsim;"], [0, "&rarrsim;"], [0, "&rarrap;"], [0, "&ltlarr;"], [1, "&gtrarr;"], [0, "&subrarr;"], [1, "&suplarr;"], [0, "&lfisht;"], [0, "&rfisht;"], [0, "&ufisht;"], [0, "&dfisht;"], [5, "&lopar;"], [0, "&ropar;"], [4, "&lbrke;"], [0, "&rbrke;"], [0, "&lbrkslu;"], [0, "&rbrksld;"], [0, "&lbrksld;"], [0, "&rbrkslu;"], [0, "&langd;"], [0, "&rangd;"], [0, "&lparlt;"], [0, "&rpargt;"], [0, "&gtlPar;"], [0, "&ltrPar;"], [3, "&vzigzag;"], [1, "&vangrt;"], [0, "&angrtvbd;"], [6, "&ange;"], [0, "&range;"], [0, "&dwangle;"], [0, "&uwangle;"], [0, "&angmsdaa;"], [0, "&angmsdab;"], [0, "&angmsdac;"], [0, "&angmsdad;"], [0, "&angmsdae;"], [0, "&angmsdaf;"], [0, "&angmsdag;"], [0, "&angmsdah;"], [0, "&bemptyv;"], [0, "&demptyv;"], [0, "&cemptyv;"], [0, "&raemptyv;"], [0, "&laemptyv;"], [0, "&ohbar;"], [0, "&omid;"], [0, "&opar;"], [1, "&operp;"], [1, "&olcross;"], [0, "&odsold;"], [1, "&olcir;"], [0, "&ofcir;"], [0, "&olt;"], [0, "&ogt;"], [0, "&cirscir;"], [0, "&cirE;"], [0, "&solb;"], [0, "&bsolb;"], [3, "&boxbox;"], [3, "&trisb;"], [0, "&rtriltri;"], [0, { v: "&LeftTriangleBar;", n: 824, o: "&NotLeftTriangleBar;" }], [0, { v: "&RightTriangleBar;", n: 824, o: "&NotRightTriangleBar;" }], [11, "&iinfin;"], [0, "&infintie;"], [0, "&nvinfin;"], [4, "&eparsl;"], [0, "&smeparsl;"], [0, "&eqvparsl;"], [5, "&blacklozenge;"], [8, "&RuleDelayed;"], [1, "&dsol;"], [9, "&bigodot;"], [0, "&bigoplus;"], [0, "&bigotimes;"], [1, "&biguplus;"], [1, "&bigsqcup;"], [5, "&iiiint;"], [0, "&fpartint;"], [2, "&cirfnint;"], [0, "&awint;"], [0, "&rppolint;"], [0, "&scpolint;"], [0, "&npolint;"], [0, "&pointint;"], [0, "&quatint;"], [0, "&intlarhk;"], [10, "&pluscir;"], [0, "&plusacir;"], [0, "&simplus;"], [0, "&plusdu;"], [0, "&plussim;"], [0, "&plustwo;"], [1, "&mcomma;"], [0, "&minusdu;"], [2, "&loplus;"], [0, "&roplus;"], [0, "&Cross;"], [0, "&timesd;"], [0, "&timesbar;"], [1, "&smashp;"], [0, "&lotimes;"], [0, "&rotimes;"], [0, "&otimesas;"], [0, "&Otimes;"], [0, "&odiv;"], [0, "&triplus;"], [0, "&triminus;"], [0, "&tritime;"], [0, "&intprod;"], [2, "&amalg;"], [0, "&capdot;"], [1, "&ncup;"], [0, "&ncap;"], [0, "&capand;"], [0, "&cupor;"], [0, "&cupcap;"], [0, "&capcup;"], [0, "&cupbrcap;"], [0, "&capbrcup;"], [0, "&cupcup;"], [0, "&capcap;"], [0, "&ccups;"], [0, "&ccaps;"], [2, "&ccupssm;"], [2, "&And;"], [0, "&Or;"], [0, "&andand;"], [0, "&oror;"], [0, "&orslope;"], [0, "&andslope;"], [1, "&andv;"], [0, "&orv;"], [0, "&andd;"], [0, "&ord;"], [1, "&wedbar;"], [6, "&sdote;"], [3, "&simdot;"], [2, { v: "&congdot;", n: 824, o: "&ncongdot;" }], [0, "&easter;"], [0, "&apacir;"], [0, { v: "&apE;", n: 824, o: "&napE;" }], [0, "&eplus;"], [0, "&pluse;"], [0, "&Esim;"], [0, "&Colone;"], [0, "&Equal;"], [1, "&ddotseq;"], [0, "&equivDD;"], [0, "&ltcir;"], [0, "&gtcir;"], [0, "&ltquest;"], [0, "&gtquest;"], [0, { v: "&leqslant;", n: 824, o: "&nleqslant;" }], [0, { v: "&geqslant;", n: 824, o: "&ngeqslant;" }], [0, "&lesdot;"], [0, "&gesdot;"], [0, "&lesdoto;"], [0, "&gesdoto;"], [0, "&lesdotor;"], [0, "&gesdotol;"], [0, "&lap;"], [0, "&gap;"], [0, "&lne;"], [0, "&gne;"], [0, "&lnap;"], [0, "&gnap;"], [0, "&lEg;"], [0, "&gEl;"], [0, "&lsime;"], [0, "&gsime;"], [0, "&lsimg;"], [0, "&gsiml;"], [0, "&lgE;"], [0, "&glE;"], [0, "&lesges;"], [0, "&gesles;"], [0, "&els;"], [0, "&egs;"], [0, "&elsdot;"], [0, "&egsdot;"], [0, "&el;"], [0, "&eg;"], [2, "&siml;"], [0, "&simg;"], [0, "&simlE;"], [0, "&simgE;"], [0, { v: "&LessLess;", n: 824, o: "&NotNestedLessLess;" }], [0, { v: "&GreaterGreater;", n: 824, o: "&NotNestedGreaterGreater;" }], [1, "&glj;"], [0, "&gla;"], [0, "&ltcc;"], [0, "&gtcc;"], [0, "&lescc;"], [0, "&gescc;"], [0, "&smt;"], [0, "&lat;"], [0, { v: "&smte;", n: 65024, o: "&smtes;" }], [0, { v: "&late;", n: 65024, o: "&lates;" }], [0, "&bumpE;"], [0, { v: "&PrecedesEqual;", n: 824, o: "&NotPrecedesEqual;" }], [0, { v: "&sce;", n: 824, o: "&NotSucceedsEqual;" }], [2, "&prE;"], [0, "&scE;"], [0, "&precneqq;"], [0, "&scnE;"], [0, "&prap;"], [0, "&scap;"], [0, "&precnapprox;"], [0, "&scnap;"], [0, "&Pr;"], [0, "&Sc;"], [0, "&subdot;"], [0, "&supdot;"], [0, "&subplus;"], [0, "&supplus;"], [0, "&submult;"], [0, "&supmult;"], [0, "&subedot;"], [0, "&supedot;"], [0, { v: "&subE;", n: 824, o: "&nsubE;" }], [0, { v: "&supE;", n: 824, o: "&nsupE;" }], [0, "&subsim;"], [0, "&supsim;"], [2, { v: "&subnE;", n: 65024, o: "&varsubsetneqq;" }], [0, { v: "&supnE;", n: 65024, o: "&varsupsetneqq;" }], [2, "&csub;"], [0, "&csup;"], [0, "&csube;"], [0, "&csupe;"], [0, "&subsup;"], [0, "&supsub;"], [0, "&subsub;"], [0, "&supsup;"], [0, "&suphsub;"], [0, "&supdsub;"], [0, "&forkv;"], [0, "&topfork;"], [0, "&mlcp;"], [8, "&Dashv;"], [1, "&Vdashl;"], [0, "&Barv;"], [0, "&vBar;"], [0, "&vBarv;"], [1, "&Vbar;"], [0, "&Not;"], [0, "&bNot;"], [0, "&rnmid;"], [0, "&cirmid;"], [0, "&midcir;"], [0, "&topcir;"], [0, "&nhpar;"], [0, "&parsim;"], [9, { v: "&parsl;", n: 8421, o: "&nparsl;" }], [44343, { n: new Map(/* @__PURE__ */ restoreDiff([[56476, "&Ascr;"], [1, "&Cscr;"], [0, "&Dscr;"], [2, "&Gscr;"], [2, "&Jscr;"], [0, "&Kscr;"], [2, "&Nscr;"], [0, "&Oscr;"], [0, "&Pscr;"], [0, "&Qscr;"], [1, "&Sscr;"], [0, "&Tscr;"], [0, "&Uscr;"], [0, "&Vscr;"], [0, "&Wscr;"], [0, "&Xscr;"], [0, "&Yscr;"], [0, "&Zscr;"], [0, "&ascr;"], [0, "&bscr;"], [0, "&cscr;"], [0, "&dscr;"], [1, "&fscr;"], [1, "&hscr;"], [0, "&iscr;"], [0, "&jscr;"], [0, "&kscr;"], [0, "&lscr;"], [0, "&mscr;"], [0, "&nscr;"], [1, "&pscr;"], [0, "&qscr;"], [0, "&rscr;"], [0, "&sscr;"], [0, "&tscr;"], [0, "&uscr;"], [0, "&vscr;"], [0, "&wscr;"], [0, "&xscr;"], [0, "&yscr;"], [0, "&zscr;"], [52, "&Afr;"], [0, "&Bfr;"], [1, "&Dfr;"], [0, "&Efr;"], [0, "&Ffr;"], [0, "&Gfr;"], [2, "&Jfr;"], [0, "&Kfr;"], [0, "&Lfr;"], [0, "&Mfr;"], [0, "&Nfr;"], [0, "&Ofr;"], [0, "&Pfr;"], [0, "&Qfr;"], [1, "&Sfr;"], [0, "&Tfr;"], [0, "&Ufr;"], [0, "&Vfr;"], [0, "&Wfr;"], [0, "&Xfr;"], [0, "&Yfr;"], [1, "&afr;"], [0, "&bfr;"], [0, "&cfr;"], [0, "&dfr;"], [0, "&efr;"], [0, "&ffr;"], [0, "&gfr;"], [0, "&hfr;"], [0, "&ifr;"], [0, "&jfr;"], [0, "&kfr;"], [0, "&lfr;"], [0, "&mfr;"], [0, "&nfr;"], [0, "&ofr;"], [0, "&pfr;"], [0, "&qfr;"], [0, "&rfr;"], [0, "&sfr;"], [0, "&tfr;"], [0, "&ufr;"], [0, "&vfr;"], [0, "&wfr;"], [0, "&xfr;"], [0, "&yfr;"], [0, "&zfr;"], [0, "&Aopf;"], [0, "&Bopf;"], [1, "&Dopf;"], [0, "&Eopf;"], [0, "&Fopf;"], [0, "&Gopf;"], [1, "&Iopf;"], [0, "&Jopf;"], [0, "&Kopf;"], [0, "&Lopf;"], [0, "&Mopf;"], [1, "&Oopf;"], [3, "&Sopf;"], [0, "&Topf;"], [0, "&Uopf;"], [0, "&Vopf;"], [0, "&Wopf;"], [0, "&Xopf;"], [0, "&Yopf;"], [1, "&aopf;"], [0, "&bopf;"], [0, "&copf;"], [0, "&dopf;"], [0, "&eopf;"], [0, "&fopf;"], [0, "&gopf;"], [0, "&hopf;"], [0, "&iopf;"], [0, "&jopf;"], [0, "&kopf;"], [0, "&lopf;"], [0, "&mopf;"], [0, "&nopf;"], [0, "&oopf;"], [0, "&popf;"], [0, "&qopf;"], [0, "&ropf;"], [0, "&sopf;"], [0, "&topf;"], [0, "&uopf;"], [0, "&vopf;"], [0, "&wopf;"], [0, "&xopf;"], [0, "&yopf;"], [0, "&zopf;"]])) }], [8906, "&fflig;"], [0, "&filig;"], [0, "&fllig;"], [0, "&ffilig;"], [0, "&ffllig;"]]));

// node_modules/entities/lib/esm/escape.js
var xmlCodeMap = /* @__PURE__ */ new Map([
  [34, "&quot;"],
  [38, "&amp;"],
  [39, "&apos;"],
  [60, "&lt;"],
  [62, "&gt;"]
]);
var getCodePoint = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  String.prototype.codePointAt != null ? (str2, index) => str2.codePointAt(index) : (
    // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
    (c, index) => (c.charCodeAt(index) & 64512) === 55296 ? (c.charCodeAt(index) - 55296) * 1024 + c.charCodeAt(index + 1) - 56320 + 65536 : c.charCodeAt(index)
  )
);
function getEscaper(regex, map2) {
  return function escape3(data) {
    let match2;
    let lastIdx = 0;
    let result = "";
    while (match2 = regex.exec(data)) {
      if (lastIdx !== match2.index) {
        result += data.substring(lastIdx, match2.index);
      }
      result += map2.get(match2[0].charCodeAt(0));
      lastIdx = match2.index + 1;
    }
    return result + data.substring(lastIdx);
  };
}
var escapeUTF8 = getEscaper(/[&<>'"]/g, xmlCodeMap);
var escapeAttribute = getEscaper(/["&\u00A0]/g, /* @__PURE__ */ new Map([
  [34, "&quot;"],
  [38, "&amp;"],
  [160, "&nbsp;"]
]));
var escapeText = getEscaper(/[&<>\u00A0]/g, /* @__PURE__ */ new Map([
  [38, "&amp;"],
  [60, "&lt;"],
  [62, "&gt;"],
  [160, "&nbsp;"]
]));

// node_modules/entities/lib/esm/index.js
var EntityLevel;
(function(EntityLevel2) {
  EntityLevel2[EntityLevel2["XML"] = 0] = "XML";
  EntityLevel2[EntityLevel2["HTML"] = 1] = "HTML";
})(EntityLevel || (EntityLevel = {}));
var EncodingMode;
(function(EncodingMode2) {
  EncodingMode2[EncodingMode2["UTF8"] = 0] = "UTF8";
  EncodingMode2[EncodingMode2["ASCII"] = 1] = "ASCII";
  EncodingMode2[EncodingMode2["Extensive"] = 2] = "Extensive";
  EncodingMode2[EncodingMode2["Attribute"] = 3] = "Attribute";
  EncodingMode2[EncodingMode2["Text"] = 4] = "Text";
})(EncodingMode || (EncodingMode = {}));

// node_modules/markdown-it/lib/common/utils.mjs
function _class2(obj) {
  return Object.prototype.toString.call(obj);
}
function isString(obj) {
  return _class2(obj) === "[object String]";
}
var _hasOwnProperty2 = Object.prototype.hasOwnProperty;
function has(object, key) {
  return _hasOwnProperty2.call(object, key);
}
function assign(obj) {
  const sources = Array.prototype.slice.call(arguments, 1);
  sources.forEach(function(source) {
    if (!source) {
      return;
    }
    if (typeof source !== "object") {
      throw new TypeError(source + "must be object");
    }
    Object.keys(source).forEach(function(key) {
      obj[key] = source[key];
    });
  });
  return obj;
}
function arrayReplaceAt(src, pos, newElements) {
  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
}
function isValidEntityCode(c) {
  if (c >= 55296 && c <= 57343) {
    return false;
  }
  if (c >= 64976 && c <= 65007) {
    return false;
  }
  if ((c & 65535) === 65535 || (c & 65535) === 65534) {
    return false;
  }
  if (c >= 0 && c <= 8) {
    return false;
  }
  if (c === 11) {
    return false;
  }
  if (c >= 14 && c <= 31) {
    return false;
  }
  if (c >= 127 && c <= 159) {
    return false;
  }
  if (c > 1114111) {
    return false;
  }
  return true;
}
function fromCodePoint2(c) {
  if (c > 65535) {
    c -= 65536;
    const surrogate1 = 55296 + (c >> 10);
    const surrogate2 = 56320 + (c & 1023);
    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c);
}
var UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
var ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + "|" + ENTITY_RE.source, "gi");
var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
function replaceEntityPattern(match2, name) {
  if (name.charCodeAt(0) === 35 && DIGITAL_ENTITY_TEST_RE.test(name)) {
    const code2 = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    if (isValidEntityCode(code2)) {
      return fromCodePoint2(code2);
    }
    return match2;
  }
  const decoded = decodeHTML(match2);
  if (decoded !== match2) {
    return decoded;
  }
  return match2;
}
function unescapeMd(str2) {
  if (str2.indexOf("\\") < 0) {
    return str2;
  }
  return str2.replace(UNESCAPE_MD_RE, "$1");
}
function unescapeAll(str2) {
  if (str2.indexOf("\\") < 0 && str2.indexOf("&") < 0) {
    return str2;
  }
  return str2.replace(UNESCAPE_ALL_RE, function(match2, escaped, entity2) {
    if (escaped) {
      return escaped;
    }
    return replaceEntityPattern(match2, entity2);
  });
}
var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}
function escapeHtml(str2) {
  if (HTML_ESCAPE_TEST_RE.test(str2)) {
    return str2.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str2;
}
var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;
function escapeRE(str2) {
  return str2.replace(REGEXP_ESCAPE_RE, "\\$&");
}
function isSpace(code2) {
  switch (code2) {
    case 9:
    case 32:
      return true;
  }
  return false;
}
function isWhiteSpace(code2) {
  if (code2 >= 8192 && code2 <= 8202) {
    return true;
  }
  switch (code2) {
    case 9:
    // \t
    case 10:
    // \n
    case 11:
    // \v
    case 12:
    // \f
    case 13:
    // \r
    case 32:
    case 160:
    case 5760:
    case 8239:
    case 8287:
    case 12288:
      return true;
  }
  return false;
}
function isPunctChar(ch) {
  return regex_default4.test(ch) || regex_default5.test(ch);
}
function isPunctCharCode(code2) {
  return isPunctChar(fromCodePoint2(code2));
}
function isMdAsciiPunct(ch) {
  switch (ch) {
    case 33:
    case 34:
    case 35:
    case 36:
    case 37:
    case 38:
    case 39:
    case 40:
    case 41:
    case 42:
    case 43:
    case 44:
    case 45:
    case 46:
    case 47:
    case 58:
    case 59:
    case 60:
    case 61:
    case 62:
    case 63:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 124:
    case 125:
    case 126:
      return true;
    default:
      return false;
  }
}
function normalizeReference(str2) {
  str2 = str2.trim().replace(/\s+/g, " ");
  if ("\u1E9E".toLowerCase() === "\u1E7E") {
    str2 = str2.replace(/ẞ/g, "\xDF");
  }
  return str2.toLowerCase().toUpperCase();
}
function isAsciiTrimmable(c) {
  return c === 32 || c === 9 || c === 10 || c === 13;
}
function asciiTrim(str2) {
  let start = 0;
  for (; start < str2.length; start++) {
    if (!isAsciiTrimmable(str2.charCodeAt(start))) {
      break;
    }
  }
  let end = str2.length - 1;
  for (; end >= start; end--) {
    if (!isAsciiTrimmable(str2.charCodeAt(end))) {
      break;
    }
  }
  return str2.slice(start, end + 1);
}
var lib = { mdurl: mdurl_exports, ucmicro: uc_exports };

// node_modules/markdown-it/lib/helpers/index.mjs
var helpers_exports = {};
__export(helpers_exports, {
  parseLinkDestination: () => parseLinkDestination,
  parseLinkLabel: () => parseLinkLabel,
  parseLinkTitle: () => parseLinkTitle
});

// node_modules/markdown-it/lib/helpers/parse_link_label.mjs
function parseLinkLabel(state, start, disableNested) {
  let level, found, marker, prevPos;
  const max = state.posMax;
  const oldPos = state.pos;
  state.pos = start + 1;
  level = 1;
  while (state.pos < max) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 93) {
      level--;
      if (level === 0) {
        found = true;
        break;
      }
    }
    prevPos = state.pos;
    state.md.inline.skipToken(state);
    if (marker === 91) {
      if (prevPos === state.pos - 1) {
        level++;
      } else if (disableNested) {
        state.pos = oldPos;
        return -1;
      }
    }
  }
  let labelEnd = -1;
  if (found) {
    labelEnd = state.pos;
  }
  state.pos = oldPos;
  return labelEnd;
}

// node_modules/markdown-it/lib/helpers/parse_link_destination.mjs
function parseLinkDestination(str2, start, max) {
  let code2;
  let pos = start;
  const result = {
    ok: false,
    pos: 0,
    str: ""
  };
  if (str2.charCodeAt(pos) === 60) {
    pos++;
    while (pos < max) {
      code2 = str2.charCodeAt(pos);
      if (code2 === 10) {
        return result;
      }
      if (code2 === 60) {
        return result;
      }
      if (code2 === 62) {
        result.pos = pos + 1;
        result.str = unescapeAll(str2.slice(start + 1, pos));
        result.ok = true;
        return result;
      }
      if (code2 === 92 && pos + 1 < max) {
        pos += 2;
        continue;
      }
      pos++;
    }
    return result;
  }
  let level = 0;
  while (pos < max) {
    code2 = str2.charCodeAt(pos);
    if (code2 === 32) {
      break;
    }
    if (code2 < 32 || code2 === 127) {
      break;
    }
    if (code2 === 92 && pos + 1 < max) {
      if (str2.charCodeAt(pos + 1) === 32) {
        break;
      }
      pos += 2;
      continue;
    }
    if (code2 === 40) {
      level++;
      if (level > 32) {
        return result;
      }
    }
    if (code2 === 41) {
      if (level === 0) {
        break;
      }
      level--;
    }
    pos++;
  }
  if (start === pos) {
    return result;
  }
  if (level !== 0) {
    return result;
  }
  result.str = unescapeAll(str2.slice(start, pos));
  result.pos = pos;
  result.ok = true;
  return result;
}

// node_modules/markdown-it/lib/helpers/parse_link_title.mjs
function parseLinkTitle(str2, start, max, prev_state) {
  let code2;
  let pos = start;
  const state = {
    // if `true`, this is a valid link title
    ok: false,
    // if `true`, this link can be continued on the next line
    can_continue: false,
    // if `ok`, it's the position of the first character after the closing marker
    pos: 0,
    // if `ok`, it's the unescaped title
    str: "",
    // expected closing marker character code
    marker: 0
  };
  if (prev_state) {
    state.str = prev_state.str;
    state.marker = prev_state.marker;
  } else {
    if (pos >= max) {
      return state;
    }
    let marker = str2.charCodeAt(pos);
    if (marker !== 34 && marker !== 39 && marker !== 40) {
      return state;
    }
    start++;
    pos++;
    if (marker === 40) {
      marker = 41;
    }
    state.marker = marker;
  }
  while (pos < max) {
    code2 = str2.charCodeAt(pos);
    if (code2 === state.marker) {
      state.pos = pos + 1;
      state.str += unescapeAll(str2.slice(start, pos));
      state.ok = true;
      return state;
    } else if (code2 === 40 && state.marker === 41) {
      return state;
    } else if (code2 === 92 && pos + 1 < max) {
      pos++;
    }
    pos++;
  }
  state.can_continue = true;
  state.str += unescapeAll(str2.slice(start, pos));
  return state;
}

// node_modules/markdown-it/lib/renderer.mjs
var default_rules = {};
default_rules.code_inline = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  return "<code" + slf.renderAttrs(token) + ">" + escapeHtml(token.content) + "</code>";
};
default_rules.code_block = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  return "<pre" + slf.renderAttrs(token) + "><code>" + escapeHtml(tokens[idx].content) + "</code></pre>\n";
};
default_rules.fence = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const info = token.info ? unescapeAll(token.info).trim() : "";
  let langName = "";
  let langAttrs = "";
  if (info) {
    const arr = info.split(/(\s+)/g);
    langName = arr[0];
    langAttrs = arr.slice(2).join("");
  }
  let highlighted;
  if (options.highlight) {
    highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }
  if (highlighted.indexOf("<pre") === 0) {
    return highlighted + "\n";
  }
  if (info) {
    const i2 = token.attrIndex("class");
    const tmpAttrs = token.attrs ? token.attrs.slice() : [];
    if (i2 < 0) {
      tmpAttrs.push(["class", options.langPrefix + langName]);
    } else {
      tmpAttrs[i2] = tmpAttrs[i2].slice();
      tmpAttrs[i2][1] += " " + options.langPrefix + langName;
    }
    const tmpToken = {
      attrs: tmpAttrs
    };
    return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>
`;
  }
  return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>
`;
};
default_rules.image = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children, options, env);
  return slf.renderToken(tokens, idx, options);
};
default_rules.hardbreak = function(tokens, idx, options) {
  return options.xhtmlOut ? "<br />\n" : "<br>\n";
};
default_rules.softbreak = function(tokens, idx, options) {
  return options.breaks ? options.xhtmlOut ? "<br />\n" : "<br>\n" : "\n";
};
default_rules.text = function(tokens, idx) {
  return escapeHtml(tokens[idx].content);
};
default_rules.html_block = function(tokens, idx) {
  return tokens[idx].content;
};
default_rules.html_inline = function(tokens, idx) {
  return tokens[idx].content;
};
function Renderer() {
  this.rules = assign({}, default_rules);
}
Renderer.prototype.renderAttrs = function renderAttrs(token) {
  let i2, l, result;
  if (!token.attrs) {
    return "";
  }
  result = "";
  for (i2 = 0, l = token.attrs.length; i2 < l; i2++) {
    result += " " + escapeHtml(token.attrs[i2][0]) + '="' + escapeHtml(token.attrs[i2][1]) + '"';
  }
  return result;
};
Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
  const token = tokens[idx];
  let result = "";
  if (token.hidden) {
    return "";
  }
  if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
    result += "\n";
  }
  result += (token.nesting === -1 ? "</" : "<") + token.tag;
  result += this.renderAttrs(token);
  if (token.nesting === 0 && options.xhtmlOut) {
    result += " /";
  }
  let needLf = false;
  if (token.block) {
    needLf = true;
    if (token.nesting === 1) {
      if (idx + 1 < tokens.length) {
        const nextToken = tokens[idx + 1];
        if (nextToken.type === "inline" || nextToken.hidden) {
          needLf = false;
        } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
          needLf = false;
        }
      }
    }
  }
  result += needLf ? ">\n" : ">";
  return result;
};
Renderer.prototype.renderInline = function(tokens, options, env) {
  let result = "";
  const rules = this.rules;
  for (let i2 = 0, len = tokens.length; i2 < len; i2++) {
    const type2 = tokens[i2].type;
    if (typeof rules[type2] !== "undefined") {
      result += rules[type2](tokens, i2, options, env, this);
    } else {
      result += this.renderToken(tokens, i2, options);
    }
  }
  return result;
};
Renderer.prototype.renderInlineAsText = function(tokens, options, env) {
  let result = "";
  for (let i2 = 0, len = tokens.length; i2 < len; i2++) {
    switch (tokens[i2].type) {
      case "text":
        result += tokens[i2].content;
        break;
      case "image":
        result += this.renderInlineAsText(tokens[i2].children, options, env);
        break;
      case "html_inline":
      case "html_block":
        result += tokens[i2].content;
        break;
      case "softbreak":
      case "hardbreak":
        result += "\n";
        break;
      default:
    }
  }
  return result;
};
Renderer.prototype.render = function(tokens, options, env) {
  let result = "";
  const rules = this.rules;
  for (let i2 = 0, len = tokens.length; i2 < len; i2++) {
    const type2 = tokens[i2].type;
    if (type2 === "inline") {
      result += this.renderInline(tokens[i2].children, options, env);
    } else if (typeof rules[type2] !== "undefined") {
      result += rules[type2](tokens, i2, options, env, this);
    } else {
      result += this.renderToken(tokens, i2, options, env);
    }
  }
  return result;
};
var renderer_default = Renderer;

// node_modules/markdown-it/lib/ruler.mjs
function Ruler() {
  this.__rules__ = [];
  this.__cache__ = null;
}
Ruler.prototype.__find__ = function(name) {
  for (let i2 = 0; i2 < this.__rules__.length; i2++) {
    if (this.__rules__[i2].name === name) {
      return i2;
    }
  }
  return -1;
};
Ruler.prototype.__compile__ = function() {
  const self = this;
  const chains = [""];
  self.__rules__.forEach(function(rule) {
    if (!rule.enabled) {
      return;
    }
    rule.alt.forEach(function(altName) {
      if (chains.indexOf(altName) < 0) {
        chains.push(altName);
      }
    });
  });
  self.__cache__ = {};
  chains.forEach(function(chain) {
    self.__cache__[chain] = [];
    self.__rules__.forEach(function(rule) {
      if (!rule.enabled) {
        return;
      }
      if (chain && rule.alt.indexOf(chain) < 0) {
        return;
      }
      self.__cache__[chain].push(rule.fn);
    });
  });
};
Ruler.prototype.at = function(name, fn, options) {
  const index = this.__find__(name);
  const opt = options || {};
  if (index === -1) {
    throw new Error("Parser rule not found: " + name);
  }
  this.__rules__[index].fn = fn;
  this.__rules__[index].alt = opt.alt || [];
  this.__cache__ = null;
};
Ruler.prototype.before = function(beforeName, ruleName, fn, options) {
  const index = this.__find__(beforeName);
  const opt = options || {};
  if (index === -1) {
    throw new Error("Parser rule not found: " + beforeName);
  }
  this.__rules__.splice(index, 0, {
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  });
  this.__cache__ = null;
};
Ruler.prototype.after = function(afterName, ruleName, fn, options) {
  const index = this.__find__(afterName);
  const opt = options || {};
  if (index === -1) {
    throw new Error("Parser rule not found: " + afterName);
  }
  this.__rules__.splice(index + 1, 0, {
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  });
  this.__cache__ = null;
};
Ruler.prototype.push = function(ruleName, fn, options) {
  const opt = options || {};
  this.__rules__.push({
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  });
  this.__cache__ = null;
};
Ruler.prototype.enable = function(list2, ignoreInvalid) {
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  const result = [];
  list2.forEach(function(name) {
    const idx = this.__find__(name);
    if (idx < 0) {
      if (ignoreInvalid) {
        return;
      }
      throw new Error("Rules manager: invalid rule name " + name);
    }
    this.__rules__[idx].enabled = true;
    result.push(name);
  }, this);
  this.__cache__ = null;
  return result;
};
Ruler.prototype.enableOnly = function(list2, ignoreInvalid) {
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  this.__rules__.forEach(function(rule) {
    rule.enabled = false;
  });
  this.enable(list2, ignoreInvalid);
};
Ruler.prototype.disable = function(list2, ignoreInvalid) {
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  const result = [];
  list2.forEach(function(name) {
    const idx = this.__find__(name);
    if (idx < 0) {
      if (ignoreInvalid) {
        return;
      }
      throw new Error("Rules manager: invalid rule name " + name);
    }
    this.__rules__[idx].enabled = false;
    result.push(name);
  }, this);
  this.__cache__ = null;
  return result;
};
Ruler.prototype.getRules = function(chainName) {
  if (this.__cache__ === null) {
    this.__compile__();
  }
  return this.__cache__[chainName] || [];
};
var ruler_default = Ruler;

// node_modules/markdown-it/lib/token.mjs
function Token(type2, tag, nesting) {
  this.type = type2;
  this.tag = tag;
  this.attrs = null;
  this.map = null;
  this.nesting = nesting;
  this.level = 0;
  this.children = null;
  this.content = "";
  this.markup = "";
  this.info = "";
  this.meta = null;
  this.block = false;
  this.hidden = false;
}
Token.prototype.attrIndex = function attrIndex(name) {
  if (!this.attrs) {
    return -1;
  }
  const attrs = this.attrs;
  for (let i2 = 0, len = attrs.length; i2 < len; i2++) {
    if (attrs[i2][0] === name) {
      return i2;
    }
  }
  return -1;
};
Token.prototype.attrPush = function attrPush(attrData) {
  if (this.attrs) {
    this.attrs.push(attrData);
  } else {
    this.attrs = [attrData];
  }
};
Token.prototype.attrSet = function attrSet(name, value) {
  const idx = this.attrIndex(name);
  const attrData = [name, value];
  if (idx < 0) {
    this.attrPush(attrData);
  } else {
    this.attrs[idx] = attrData;
  }
};
Token.prototype.attrGet = function attrGet(name) {
  const idx = this.attrIndex(name);
  let value = null;
  if (idx >= 0) {
    value = this.attrs[idx][1];
  }
  return value;
};
Token.prototype.attrJoin = function attrJoin(name, value) {
  const idx = this.attrIndex(name);
  if (idx < 0) {
    this.attrPush([name, value]);
  } else {
    this.attrs[idx][1] = this.attrs[idx][1] + " " + value;
  }
};
var token_default = Token;

// node_modules/markdown-it/lib/rules_core/state_core.mjs
function StateCore(src, md2, env) {
  this.src = src;
  this.env = env;
  this.tokens = [];
  this.inlineMode = false;
  this.md = md2;
}
StateCore.prototype.Token = token_default;
var state_core_default = StateCore;

// node_modules/markdown-it/lib/rules_core/normalize.mjs
var NEWLINES_RE = /\r\n?|\n/g;
var NULL_RE = /\0/g;
function normalize2(state) {
  let str2;
  str2 = state.src.replace(NEWLINES_RE, "\n");
  str2 = str2.replace(NULL_RE, "\uFFFD");
  state.src = str2;
}

// node_modules/markdown-it/lib/rules_core/block.mjs
function block(state) {
  let token;
  if (state.inlineMode) {
    token = new state.Token("inline", "", 0);
    token.content = state.src;
    token.map = [0, 1];
    token.children = [];
    state.tokens.push(token);
  } else {
    state.md.block.parse(state.src, state.md, state.env, state.tokens);
  }
}

// node_modules/markdown-it/lib/rules_core/inline.mjs
function inline(state) {
  const tokens = state.tokens;
  for (let i2 = 0, l = tokens.length; i2 < l; i2++) {
    const tok = tokens[i2];
    if (tok.type === "inline") {
      state.md.inline.parse(tok.content, state.md, state.env, tok.children);
    }
  }
}

// node_modules/markdown-it/lib/rules_core/linkify.mjs
function isLinkOpen(str2) {
  return /^<a[>\s]/i.test(str2);
}
function isLinkClose(str2) {
  return /^<\/a\s*>/i.test(str2);
}
function linkify(state) {
  const blockTokens = state.tokens;
  if (!state.md.options.linkify) {
    return;
  }
  for (let j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== "inline" || !state.md.linkify.pretest(blockTokens[j].content)) {
      continue;
    }
    let tokens = blockTokens[j].children;
    let htmlLinkLevel = 0;
    for (let i2 = tokens.length - 1; i2 >= 0; i2--) {
      const currentToken = tokens[i2];
      if (currentToken.type === "link_close") {
        i2--;
        while (tokens[i2].level !== currentToken.level && tokens[i2].type !== "link_open") {
          i2--;
        }
        continue;
      }
      if (currentToken.type === "html_inline") {
        if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
          htmlLinkLevel--;
        }
        if (isLinkClose(currentToken.content)) {
          htmlLinkLevel++;
        }
      }
      if (htmlLinkLevel > 0) {
        continue;
      }
      if (currentToken.type === "text" && state.md.linkify.test(currentToken.content)) {
        const text2 = currentToken.content;
        let links = state.md.linkify.match(text2);
        const nodes = [];
        let level = currentToken.level;
        let lastPos = 0;
        if (links.length > 0 && links[0].index === 0 && i2 > 0 && tokens[i2 - 1].type === "text_special") {
          links = links.slice(1);
        }
        for (let ln = 0; ln < links.length; ln++) {
          const url = links[ln].url;
          const fullUrl = state.md.normalizeLink(url);
          if (!state.md.validateLink(fullUrl)) {
            continue;
          }
          let urlText = links[ln].text;
          if (!links[ln].schema) {
            urlText = state.md.normalizeLinkText("http://" + urlText).replace(/^http:\/\//, "");
          } else if (links[ln].schema === "mailto:" && !/^mailto:/i.test(urlText)) {
            urlText = state.md.normalizeLinkText("mailto:" + urlText).replace(/^mailto:/, "");
          } else {
            urlText = state.md.normalizeLinkText(urlText);
          }
          const pos = links[ln].index;
          if (pos > lastPos) {
            const token = new state.Token("text", "", 0);
            token.content = text2.slice(lastPos, pos);
            token.level = level;
            nodes.push(token);
          }
          const token_o = new state.Token("link_open", "a", 1);
          token_o.attrs = [["href", fullUrl]];
          token_o.level = level++;
          token_o.markup = "linkify";
          token_o.info = "auto";
          nodes.push(token_o);
          const token_t = new state.Token("text", "", 0);
          token_t.content = urlText;
          token_t.level = level;
          nodes.push(token_t);
          const token_c = new state.Token("link_close", "a", -1);
          token_c.level = --level;
          token_c.markup = "linkify";
          token_c.info = "auto";
          nodes.push(token_c);
          lastPos = links[ln].lastIndex;
        }
        if (lastPos < text2.length) {
          const token = new state.Token("text", "", 0);
          token.content = text2.slice(lastPos);
          token.level = level;
          nodes.push(token);
        }
        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i2, nodes);
      }
    }
  }
}

// node_modules/markdown-it/lib/rules_core/replacements.mjs
var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
var SCOPED_ABBR_TEST_RE = /\((c|tm|r)\)/i;
var SCOPED_ABBR_RE = /\((c|tm|r)\)/ig;
var SCOPED_ABBR = {
  c: "\xA9",
  r: "\xAE",
  tm: "\u2122"
};
function replaceFn(match2, name) {
  return SCOPED_ABBR[name.toLowerCase()];
}
function replace_scoped(inlineTokens) {
  let inside_autolink = 0;
  for (let i2 = inlineTokens.length - 1; i2 >= 0; i2--) {
    const token = inlineTokens[i2];
    if (token.type === "text" && !inside_autolink) {
      token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
    }
    if (token.type === "link_open" && token.info === "auto") {
      inside_autolink--;
    }
    if (token.type === "link_close" && token.info === "auto") {
      inside_autolink++;
    }
  }
}
function replace_rare(inlineTokens) {
  let inside_autolink = 0;
  for (let i2 = inlineTokens.length - 1; i2 >= 0; i2--) {
    const token = inlineTokens[i2];
    if (token.type === "text" && !inside_autolink) {
      if (RARE_RE.test(token.content)) {
        token.content = token.content.replace(/\+-/g, "\xB1").replace(/\.{2,}/g, "\u2026").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/mg, "$1\u2014").replace(/(^|\s)--(?=\s|$)/mg, "$1\u2013").replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, "$1\u2013");
      }
    }
    if (token.type === "link_open" && token.info === "auto") {
      inside_autolink--;
    }
    if (token.type === "link_close" && token.info === "auto") {
      inside_autolink++;
    }
  }
}
function replace(state) {
  let blkIdx;
  if (!state.md.options.typographer) {
    return;
  }
  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline") {
      continue;
    }
    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
      replace_scoped(state.tokens[blkIdx].children);
    }
    if (RARE_RE.test(state.tokens[blkIdx].content)) {
      replace_rare(state.tokens[blkIdx].children);
    }
  }
}

// node_modules/markdown-it/lib/rules_core/smartquotes.mjs
var QUOTE_TEST_RE = /['"]/;
var QUOTE_RE = /['"]/g;
var APOSTROPHE = "\u2019";
function addReplacement(replacements, tokenIdx, pos, ch) {
  if (!replacements[tokenIdx]) {
    replacements[tokenIdx] = [];
  }
  replacements[tokenIdx].push({ pos, ch });
}
function applyReplacements(str2, replacements) {
  let result = "";
  let lastPos = 0;
  replacements.sort((a, b) => a.pos - b.pos);
  for (let i2 = 0; i2 < replacements.length; i2++) {
    const replacement = replacements[i2];
    result += str2.slice(lastPos, replacement.pos) + replacement.ch;
    lastPos = replacement.pos + 1;
  }
  return result + str2.slice(lastPos);
}
function process_inlines(tokens, state) {
  let j;
  const stack = [];
  const replacements = {};
  for (let i2 = 0; i2 < tokens.length; i2++) {
    const token = tokens[i2];
    const thisLevel = tokens[i2].level;
    for (j = stack.length - 1; j >= 0; j--) {
      if (stack[j].level <= thisLevel) {
        break;
      }
    }
    stack.length = j + 1;
    if (token.type !== "text") {
      continue;
    }
    const text2 = token.content;
    let pos = 0;
    const max = text2.length;
    OUTER:
      while (pos < max) {
        QUOTE_RE.lastIndex = pos;
        const t = QUOTE_RE.exec(text2);
        if (!t) {
          break;
        }
        let canOpen = true;
        let canClose = true;
        pos = t.index + 1;
        const isSingle = t[0] === "'";
        let lastChar = 32;
        if (t.index - 1 >= 0) {
          lastChar = text2.charCodeAt(t.index - 1);
        } else {
          for (j = i2 - 1; j >= 0; j--) {
            if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break;
            if (!tokens[j].content) continue;
            lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
            break;
          }
        }
        let nextChar = 32;
        if (pos < max) {
          nextChar = text2.charCodeAt(pos);
        } else {
          for (j = i2 + 1; j < tokens.length; j++) {
            if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break;
            if (!tokens[j].content) continue;
            nextChar = tokens[j].content.charCodeAt(0);
            break;
          }
        }
        const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
        const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
        const isLastWhiteSpace = isWhiteSpace(lastChar);
        const isNextWhiteSpace = isWhiteSpace(nextChar);
        if (isNextWhiteSpace) {
          canOpen = false;
        } else if (isNextPunctChar) {
          if (!(isLastWhiteSpace || isLastPunctChar)) {
            canOpen = false;
          }
        }
        if (isLastWhiteSpace) {
          canClose = false;
        } else if (isLastPunctChar) {
          if (!(isNextWhiteSpace || isNextPunctChar)) {
            canClose = false;
          }
        }
        if (nextChar === 34 && t[0] === '"') {
          if (lastChar >= 48 && lastChar <= 57) {
            canClose = canOpen = false;
          }
        }
        if (canOpen && canClose) {
          canOpen = isLastPunctChar;
          canClose = isNextPunctChar;
        }
        if (!canOpen && !canClose) {
          if (isSingle) {
            addReplacement(replacements, i2, t.index, APOSTROPHE);
          }
          continue;
        }
        if (canClose) {
          for (j = stack.length - 1; j >= 0; j--) {
            let item = stack[j];
            if (stack[j].level < thisLevel) {
              break;
            }
            if (item.single === isSingle && stack[j].level === thisLevel) {
              item = stack[j];
              let openQuote;
              let closeQuote;
              if (isSingle) {
                openQuote = state.md.options.quotes[2];
                closeQuote = state.md.options.quotes[3];
              } else {
                openQuote = state.md.options.quotes[0];
                closeQuote = state.md.options.quotes[1];
              }
              addReplacement(replacements, i2, t.index, closeQuote);
              addReplacement(replacements, item.token, item.pos, openQuote);
              stack.length = j;
              continue OUTER;
            }
          }
        }
        if (canOpen) {
          stack.push({
            token: i2,
            pos: t.index,
            single: isSingle,
            level: thisLevel
          });
        } else if (canClose && isSingle) {
          addReplacement(replacements, i2, t.index, APOSTROPHE);
        }
      }
  }
  Object.keys(replacements).forEach(function(tokenIdx) {
    tokens[tokenIdx].content = applyReplacements(tokens[tokenIdx].content, replacements[tokenIdx]);
  });
}
function smartquotes(state) {
  if (!state.md.options.typographer) {
    return;
  }
  for (let blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline" || !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
      continue;
    }
    process_inlines(state.tokens[blkIdx].children, state);
  }
}

// node_modules/markdown-it/lib/rules_core/text_join.mjs
function text_join(state) {
  let curr, last;
  const blockTokens = state.tokens;
  const l = blockTokens.length;
  for (let j = 0; j < l; j++) {
    if (blockTokens[j].type !== "inline") continue;
    const tokens = blockTokens[j].children;
    const max = tokens.length;
    for (curr = 0; curr < max; curr++) {
      if (tokens[curr].type === "text_special") {
        tokens[curr].type = "text";
      }
    }
    for (curr = last = 0; curr < max; curr++) {
      if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") {
        tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
      } else {
        if (curr !== last) {
          tokens[last] = tokens[curr];
        }
        last++;
      }
    }
    if (curr !== last) {
      tokens.length = last;
    }
  }
}

// node_modules/markdown-it/lib/parser_core.mjs
var _rules = [
  ["normalize", normalize2],
  ["block", block],
  ["inline", inline],
  ["linkify", linkify],
  ["replacements", replace],
  ["smartquotes", smartquotes],
  // `text_join` finds `text_special` tokens (for escape sequences)
  // and joins them with the rest of the text
  ["text_join", text_join]
];
function Core() {
  this.ruler = new ruler_default();
  for (let i2 = 0; i2 < _rules.length; i2++) {
    this.ruler.push(_rules[i2][0], _rules[i2][1]);
  }
}
Core.prototype.process = function(state) {
  const rules = this.ruler.getRules("");
  for (let i2 = 0, l = rules.length; i2 < l; i2++) {
    rules[i2](state);
  }
};
Core.prototype.State = state_core_default;
var parser_core_default = Core;

// node_modules/markdown-it/lib/rules_block/state_block.mjs
function StateBlock(src, md2, env, tokens) {
  this.src = src;
  this.md = md2;
  this.env = env;
  this.tokens = tokens;
  this.bMarks = [];
  this.eMarks = [];
  this.tShift = [];
  this.sCount = [];
  this.bsCount = [];
  this.blkIndent = 0;
  this.line = 0;
  this.lineMax = 0;
  this.tight = false;
  this.ddIndent = -1;
  this.listIndent = -1;
  this.parentType = "root";
  this.level = 0;
  const s = this.src;
  for (let start = 0, pos = 0, indent = 0, offset = 0, len = s.length, indent_found = false; pos < len; pos++) {
    const ch = s.charCodeAt(pos);
    if (!indent_found) {
      if (isSpace(ch)) {
        indent++;
        if (ch === 9) {
          offset += 4 - offset % 4;
        } else {
          offset++;
        }
        continue;
      } else {
        indent_found = true;
      }
    }
    if (ch === 10 || pos === len - 1) {
      if (ch !== 10) {
        pos++;
      }
      this.bMarks.push(start);
      this.eMarks.push(pos);
      this.tShift.push(indent);
      this.sCount.push(offset);
      this.bsCount.push(0);
      indent_found = false;
      indent = 0;
      offset = 0;
      start = pos + 1;
    }
  }
  this.bMarks.push(s.length);
  this.eMarks.push(s.length);
  this.tShift.push(0);
  this.sCount.push(0);
  this.bsCount.push(0);
  this.lineMax = this.bMarks.length - 1;
}
StateBlock.prototype.push = function(type2, tag, nesting) {
  const token = new token_default(type2, tag, nesting);
  token.block = true;
  if (nesting < 0) this.level--;
  token.level = this.level;
  if (nesting > 0) this.level++;
  this.tokens.push(token);
  return token;
};
StateBlock.prototype.isEmpty = function isEmpty(line) {
  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
};
StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
  for (let max = this.lineMax; from < max; from++) {
    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
      break;
    }
  }
  return from;
};
StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
  for (let max = this.src.length; pos < max; pos++) {
    const ch = this.src.charCodeAt(pos);
    if (!isSpace(ch)) {
      break;
    }
  }
  return pos;
};
StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
  if (pos <= min) {
    return pos;
  }
  while (pos > min) {
    if (!isSpace(this.src.charCodeAt(--pos))) {
      return pos + 1;
    }
  }
  return pos;
};
StateBlock.prototype.skipChars = function skipChars(pos, code2) {
  for (let max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== code2) {
      break;
    }
  }
  return pos;
};
StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code2, min) {
  if (pos <= min) {
    return pos;
  }
  while (pos > min) {
    if (code2 !== this.src.charCodeAt(--pos)) {
      return pos + 1;
    }
  }
  return pos;
};
StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
  if (begin >= end) {
    return "";
  }
  const queue = new Array(end - begin);
  for (let i2 = 0, line = begin; line < end; line++, i2++) {
    let lineIndent = 0;
    const lineStart = this.bMarks[line];
    let first = lineStart;
    let last;
    if (line + 1 < end || keepLastLF) {
      last = this.eMarks[line] + 1;
    } else {
      last = this.eMarks[line];
    }
    while (first < last && lineIndent < indent) {
      const ch = this.src.charCodeAt(first);
      if (isSpace(ch)) {
        if (ch === 9) {
          lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
        } else {
          lineIndent++;
        }
      } else if (first - lineStart < this.tShift[line]) {
        lineIndent++;
      } else {
        break;
      }
      first++;
    }
    if (lineIndent > indent) {
      queue[i2] = new Array(lineIndent - indent + 1).join(" ") + this.src.slice(first, last);
    } else {
      queue[i2] = this.src.slice(first, last);
    }
  }
  return queue.join("");
};
StateBlock.prototype.Token = token_default;
var state_block_default = StateBlock;

// node_modules/markdown-it/lib/rules_block/table.mjs
var MAX_AUTOCOMPLETED_CELLS = 65536;
function getLine2(state, line) {
  const pos = state.bMarks[line] + state.tShift[line];
  const max = state.eMarks[line];
  return state.src.slice(pos, max);
}
function escapedSplit(str2) {
  const result = [];
  const max = str2.length;
  let pos = 0;
  let ch = str2.charCodeAt(pos);
  let isEscaped = false;
  let lastPos = 0;
  let current = "";
  while (pos < max) {
    if (ch === 124) {
      if (!isEscaped) {
        result.push(current + str2.substring(lastPos, pos));
        current = "";
        lastPos = pos + 1;
      } else {
        current += str2.substring(lastPos, pos - 1);
        lastPos = pos;
      }
    }
    isEscaped = ch === 92;
    pos++;
    ch = str2.charCodeAt(pos);
  }
  result.push(current + str2.substring(lastPos));
  return result;
}
function table(state, startLine, endLine, silent) {
  if (startLine + 2 > endLine) {
    return false;
  }
  let nextLine = startLine + 1;
  if (state.sCount[nextLine] < state.blkIndent) {
    return false;
  }
  if (state.sCount[nextLine] - state.blkIndent >= 4) {
    return false;
  }
  let pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) {
    return false;
  }
  const firstCh = state.src.charCodeAt(pos++);
  if (firstCh !== 124 && firstCh !== 45 && firstCh !== 58) {
    return false;
  }
  if (pos >= state.eMarks[nextLine]) {
    return false;
  }
  const secondCh = state.src.charCodeAt(pos++);
  if (secondCh !== 124 && secondCh !== 45 && secondCh !== 58 && !isSpace(secondCh)) {
    return false;
  }
  if (firstCh === 45 && isSpace(secondCh)) {
    return false;
  }
  while (pos < state.eMarks[nextLine]) {
    const ch = state.src.charCodeAt(pos);
    if (ch !== 124 && ch !== 45 && ch !== 58 && !isSpace(ch)) {
      return false;
    }
    pos++;
  }
  let lineText = getLine2(state, startLine + 1);
  let columns = lineText.split("|");
  const aligns = [];
  for (let i2 = 0; i2 < columns.length; i2++) {
    const t = columns[i2].trim();
    if (!t) {
      if (i2 === 0 || i2 === columns.length - 1) {
        continue;
      } else {
        return false;
      }
    }
    if (!/^:?-+:?$/.test(t)) {
      return false;
    }
    if (t.charCodeAt(t.length - 1) === 58) {
      aligns.push(t.charCodeAt(0) === 58 ? "center" : "right");
    } else if (t.charCodeAt(0) === 58) {
      aligns.push("left");
    } else {
      aligns.push("");
    }
  }
  lineText = getLine2(state, startLine).trim();
  if (lineText.indexOf("|") === -1) {
    return false;
  }
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  columns = escapedSplit(lineText);
  if (columns.length && columns[0] === "") columns.shift();
  if (columns.length && columns[columns.length - 1] === "") columns.pop();
  const columnCount = columns.length;
  if (columnCount === 0 || columnCount !== aligns.length) {
    return false;
  }
  if (silent) {
    return true;
  }
  const oldParentType = state.parentType;
  state.parentType = "table";
  const terminatorRules = state.md.block.ruler.getRules("blockquote");
  const token_to = state.push("table_open", "table", 1);
  const tableLines = [startLine, 0];
  token_to.map = tableLines;
  const token_tho = state.push("thead_open", "thead", 1);
  token_tho.map = [startLine, startLine + 1];
  const token_htro = state.push("tr_open", "tr", 1);
  token_htro.map = [startLine, startLine + 1];
  for (let i2 = 0; i2 < columns.length; i2++) {
    const token_ho = state.push("th_open", "th", 1);
    if (aligns[i2]) {
      token_ho.attrs = [["style", "text-align:" + aligns[i2]]];
    }
    const token_il = state.push("inline", "", 0);
    token_il.content = columns[i2].trim();
    token_il.children = [];
    state.push("th_close", "th", -1);
  }
  state.push("tr_close", "tr", -1);
  state.push("thead_close", "thead", -1);
  let tbodyLines;
  let autocompletedCells = 0;
  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) {
      break;
    }
    let terminate = false;
    for (let i2 = 0, l = terminatorRules.length; i2 < l; i2++) {
      if (terminatorRules[i2](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
    lineText = getLine2(state, nextLine).trim();
    if (!lineText) {
      break;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      break;
    }
    columns = escapedSplit(lineText);
    if (columns.length && columns[0] === "") columns.shift();
    if (columns.length && columns[columns.length - 1] === "") columns.pop();
    autocompletedCells += columnCount - columns.length;
    if (autocompletedCells > MAX_AUTOCOMPLETED_CELLS) {
      break;
    }
    if (nextLine === startLine + 2) {
      const token_tbo = state.push("tbody_open", "tbody", 1);
      token_tbo.map = tbodyLines = [startLine + 2, 0];
    }
    const token_tro = state.push("tr_open", "tr", 1);
    token_tro.map = [nextLine, nextLine + 1];
    for (let i2 = 0; i2 < columnCount; i2++) {
      const token_tdo = state.push("td_open", "td", 1);
      if (aligns[i2]) {
        token_tdo.attrs = [["style", "text-align:" + aligns[i2]]];
      }
      const token_il = state.push("inline", "", 0);
      token_il.content = columns[i2] ? columns[i2].trim() : "";
      token_il.children = [];
      state.push("td_close", "td", -1);
    }
    state.push("tr_close", "tr", -1);
  }
  if (tbodyLines) {
    state.push("tbody_close", "tbody", -1);
    tbodyLines[1] = nextLine;
  }
  state.push("table_close", "table", -1);
  tableLines[1] = nextLine;
  state.parentType = oldParentType;
  state.line = nextLine;
  return true;
}

// node_modules/markdown-it/lib/rules_block/code.mjs
function code(state, startLine, endLine) {
  if (state.sCount[startLine] - state.blkIndent < 4) {
    return false;
  }
  let nextLine = startLine + 1;
  let last = nextLine;
  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }
  state.line = last;
  const token = state.push("code_block", "code", 0);
  token.content = state.getLines(startLine, last, 4 + state.blkIndent, false) + "\n";
  token.map = [startLine, state.line];
  return true;
}

// node_modules/markdown-it/lib/rules_block/fence.mjs
function fence(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (pos + 3 > max) {
    return false;
  }
  const marker = state.src.charCodeAt(pos);
  if (marker !== 126 && marker !== 96) {
    return false;
  }
  let mem = pos;
  pos = state.skipChars(pos, marker);
  let len = pos - mem;
  if (len < 3) {
    return false;
  }
  const markup = state.src.slice(mem, pos);
  const params = state.src.slice(pos, max);
  if (marker === 96) {
    if (params.indexOf(String.fromCharCode(marker)) >= 0) {
      return false;
    }
  }
  if (silent) {
    return true;
  }
  let nextLine = startLine;
  let haveEndMarker = false;
  for (; ; ) {
    nextLine++;
    if (nextLine >= endLine) {
      break;
    }
    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
      break;
    }
    if (state.src.charCodeAt(pos) !== marker) {
      continue;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      continue;
    }
    pos = state.skipChars(pos, marker);
    if (pos - mem < len) {
      continue;
    }
    pos = state.skipSpaces(pos);
    if (pos < max) {
      continue;
    }
    haveEndMarker = true;
    break;
  }
  len = state.sCount[startLine];
  state.line = nextLine + (haveEndMarker ? 1 : 0);
  const token = state.push("fence", "code", 0);
  token.info = params;
  token.content = state.getLines(startLine + 1, nextLine, len, true);
  token.markup = markup;
  token.map = [startLine, state.line];
  return true;
}

// node_modules/markdown-it/lib/rules_block/blockquote.mjs
function blockquote(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  const oldLineMax = state.lineMax;
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (state.src.charCodeAt(pos) !== 62) {
    return false;
  }
  if (silent) {
    return true;
  }
  const oldBMarks = [];
  const oldBSCount = [];
  const oldSCount = [];
  const oldTShift = [];
  const terminatorRules = state.md.block.ruler.getRules("blockquote");
  const oldParentType = state.parentType;
  state.parentType = "blockquote";
  let lastLineEmpty = false;
  let nextLine;
  for (nextLine = startLine; nextLine < endLine; nextLine++) {
    const isOutdented = state.sCount[nextLine] < state.blkIndent;
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    if (pos >= max) {
      break;
    }
    if (state.src.charCodeAt(pos++) === 62 && !isOutdented) {
      let initial = state.sCount[nextLine] + 1;
      let spaceAfterMarker;
      let adjustTab;
      if (state.src.charCodeAt(pos) === 32) {
        pos++;
        initial++;
        adjustTab = false;
        spaceAfterMarker = true;
      } else if (state.src.charCodeAt(pos) === 9) {
        spaceAfterMarker = true;
        if ((state.bsCount[nextLine] + initial) % 4 === 3) {
          pos++;
          initial++;
          adjustTab = false;
        } else {
          adjustTab = true;
        }
      } else {
        spaceAfterMarker = false;
      }
      let offset = initial;
      oldBMarks.push(state.bMarks[nextLine]);
      state.bMarks[nextLine] = pos;
      while (pos < max) {
        const ch = state.src.charCodeAt(pos);
        if (isSpace(ch)) {
          if (ch === 9) {
            offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
          } else {
            offset++;
          }
        } else {
          break;
        }
        pos++;
      }
      lastLineEmpty = pos >= max;
      oldBSCount.push(state.bsCount[nextLine]);
      state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);
      oldSCount.push(state.sCount[nextLine]);
      state.sCount[nextLine] = offset - initial;
      oldTShift.push(state.tShift[nextLine]);
      state.tShift[nextLine] = pos - state.bMarks[nextLine];
      continue;
    }
    if (lastLineEmpty) {
      break;
    }
    let terminate = false;
    for (let i2 = 0, l = terminatorRules.length; i2 < l; i2++) {
      if (terminatorRules[i2](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      state.lineMax = nextLine;
      if (state.blkIndent !== 0) {
        oldBMarks.push(state.bMarks[nextLine]);
        oldBSCount.push(state.bsCount[nextLine]);
        oldTShift.push(state.tShift[nextLine]);
        oldSCount.push(state.sCount[nextLine]);
        state.sCount[nextLine] -= state.blkIndent;
      }
      break;
    }
    oldBMarks.push(state.bMarks[nextLine]);
    oldBSCount.push(state.bsCount[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    oldSCount.push(state.sCount[nextLine]);
    state.sCount[nextLine] = -1;
  }
  const oldIndent = state.blkIndent;
  state.blkIndent = 0;
  const token_o = state.push("blockquote_open", "blockquote", 1);
  token_o.markup = ">";
  const lines = [startLine, 0];
  token_o.map = lines;
  state.md.block.tokenize(state, startLine, nextLine);
  const token_c = state.push("blockquote_close", "blockquote", -1);
  token_c.markup = ">";
  state.lineMax = oldLineMax;
  state.parentType = oldParentType;
  lines[1] = state.line;
  for (let i2 = 0; i2 < oldTShift.length; i2++) {
    state.bMarks[i2 + startLine] = oldBMarks[i2];
    state.tShift[i2 + startLine] = oldTShift[i2];
    state.sCount[i2 + startLine] = oldSCount[i2];
    state.bsCount[i2 + startLine] = oldBSCount[i2];
  }
  state.blkIndent = oldIndent;
  return true;
}

// node_modules/markdown-it/lib/rules_block/hr.mjs
function hr(state, startLine, endLine, silent) {
  const max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const marker = state.src.charCodeAt(pos++);
  if (marker !== 42 && marker !== 45 && marker !== 95) {
    return false;
  }
  let cnt = 1;
  while (pos < max) {
    const ch = state.src.charCodeAt(pos++);
    if (ch !== marker && !isSpace(ch)) {
      return false;
    }
    if (ch === marker) {
      cnt++;
    }
  }
  if (cnt < 3) {
    return false;
  }
  if (silent) {
    return true;
  }
  state.line = startLine + 1;
  const token = state.push("hr", "hr", 0);
  token.map = [startLine, state.line];
  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));
  return true;
}

// node_modules/markdown-it/lib/rules_block/list.mjs
function skipBulletListMarker(state, startLine) {
  const max = state.eMarks[startLine];
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const marker = state.src.charCodeAt(pos++);
  if (marker !== 42 && marker !== 45 && marker !== 43) {
    return -1;
  }
  if (pos < max) {
    const ch = state.src.charCodeAt(pos);
    if (!isSpace(ch)) {
      return -1;
    }
  }
  return pos;
}
function skipOrderedListMarker(state, startLine) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  let pos = start;
  if (pos + 1 >= max) {
    return -1;
  }
  let ch = state.src.charCodeAt(pos++);
  if (ch < 48 || ch > 57) {
    return -1;
  }
  for (; ; ) {
    if (pos >= max) {
      return -1;
    }
    ch = state.src.charCodeAt(pos++);
    if (ch >= 48 && ch <= 57) {
      if (pos - start >= 10) {
        return -1;
      }
      continue;
    }
    if (ch === 41 || ch === 46) {
      break;
    }
    return -1;
  }
  if (pos < max) {
    ch = state.src.charCodeAt(pos);
    if (!isSpace(ch)) {
      return -1;
    }
  }
  return pos;
}
function markTightParagraphs(state, idx) {
  const level = state.level + 2;
  for (let i2 = idx + 2, l = state.tokens.length - 2; i2 < l; i2++) {
    if (state.tokens[i2].level === level && state.tokens[i2].type === "paragraph_open") {
      state.tokens[i2 + 2].hidden = true;
      state.tokens[i2].hidden = true;
      i2 += 2;
    }
  }
}
function list(state, startLine, endLine, silent) {
  let max, pos, start, token;
  let nextLine = startLine;
  let tight = true;
  if (state.sCount[nextLine] - state.blkIndent >= 4) {
    return false;
  }
  if (state.listIndent >= 0 && state.sCount[nextLine] - state.listIndent >= 4 && state.sCount[nextLine] < state.blkIndent) {
    return false;
  }
  let isTerminatingParagraph = false;
  if (silent && state.parentType === "paragraph") {
    if (state.sCount[nextLine] >= state.blkIndent) {
      isTerminatingParagraph = true;
    }
  }
  let isOrdered;
  let markerValue;
  let posAfterMarker;
  if ((posAfterMarker = skipOrderedListMarker(state, nextLine)) >= 0) {
    isOrdered = true;
    start = state.bMarks[nextLine] + state.tShift[nextLine];
    markerValue = Number(state.src.slice(start, posAfterMarker - 1));
    if (isTerminatingParagraph && markerValue !== 1) return false;
  } else if ((posAfterMarker = skipBulletListMarker(state, nextLine)) >= 0) {
    isOrdered = false;
  } else {
    return false;
  }
  if (isTerminatingParagraph) {
    if (state.skipSpaces(posAfterMarker) >= state.eMarks[nextLine]) return false;
  }
  if (silent) {
    return true;
  }
  const markerCharCode = state.src.charCodeAt(posAfterMarker - 1);
  const listTokIdx = state.tokens.length;
  if (isOrdered) {
    token = state.push("ordered_list_open", "ol", 1);
    if (markerValue !== 1) {
      token.attrs = [["start", markerValue]];
    }
  } else {
    token = state.push("bullet_list_open", "ul", 1);
  }
  const listLines = [nextLine, 0];
  token.map = listLines;
  token.markup = String.fromCharCode(markerCharCode);
  let prevEmptyEnd = false;
  const terminatorRules = state.md.block.ruler.getRules("list");
  const oldParentType = state.parentType;
  state.parentType = "list";
  while (nextLine < endLine) {
    pos = posAfterMarker;
    max = state.eMarks[nextLine];
    const initial = state.sCount[nextLine] + posAfterMarker - (state.bMarks[nextLine] + state.tShift[nextLine]);
    let offset = initial;
    while (pos < max) {
      const ch = state.src.charCodeAt(pos);
      if (ch === 9) {
        offset += 4 - (offset + state.bsCount[nextLine]) % 4;
      } else if (ch === 32) {
        offset++;
      } else {
        break;
      }
      pos++;
    }
    const contentStart = pos;
    let indentAfterMarker;
    if (contentStart >= max) {
      indentAfterMarker = 1;
    } else {
      indentAfterMarker = offset - initial;
    }
    if (indentAfterMarker > 4) {
      indentAfterMarker = 1;
    }
    const indent = initial + indentAfterMarker;
    token = state.push("list_item_open", "li", 1);
    token.markup = String.fromCharCode(markerCharCode);
    const itemLines = [nextLine, 0];
    token.map = itemLines;
    if (isOrdered) {
      token.info = state.src.slice(start, posAfterMarker - 1);
    }
    const oldTight = state.tight;
    const oldTShift = state.tShift[nextLine];
    const oldSCount = state.sCount[nextLine];
    const oldListIndent = state.listIndent;
    state.listIndent = state.blkIndent;
    state.blkIndent = indent;
    state.tight = true;
    state.tShift[nextLine] = contentStart - state.bMarks[nextLine];
    state.sCount[nextLine] = offset;
    if (contentStart >= max && state.isEmpty(nextLine + 1)) {
      state.line = Math.min(state.line + 2, endLine);
    } else {
      state.md.block.tokenize(state, nextLine, endLine, true);
    }
    if (!state.tight || prevEmptyEnd) {
      tight = false;
    }
    prevEmptyEnd = state.line - nextLine > 1 && state.isEmpty(state.line - 1);
    state.blkIndent = state.listIndent;
    state.listIndent = oldListIndent;
    state.tShift[nextLine] = oldTShift;
    state.sCount[nextLine] = oldSCount;
    state.tight = oldTight;
    token = state.push("list_item_close", "li", -1);
    token.markup = String.fromCharCode(markerCharCode);
    nextLine = state.line;
    itemLines[1] = nextLine;
    if (nextLine >= endLine) {
      break;
    }
    if (state.sCount[nextLine] < state.blkIndent) {
      break;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      break;
    }
    let terminate = false;
    for (let i2 = 0, l = terminatorRules.length; i2 < l; i2++) {
      if (terminatorRules[i2](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) {
        break;
      }
      start = state.bMarks[nextLine] + state.tShift[nextLine];
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) {
        break;
      }
    }
    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) {
      break;
    }
  }
  if (isOrdered) {
    token = state.push("ordered_list_close", "ol", -1);
  } else {
    token = state.push("bullet_list_close", "ul", -1);
  }
  token.markup = String.fromCharCode(markerCharCode);
  listLines[1] = nextLine;
  state.line = nextLine;
  state.parentType = oldParentType;
  if (tight) {
    markTightParagraphs(state, listTokIdx);
  }
  return true;
}

// node_modules/markdown-it/lib/rules_block/reference.mjs
function reference(state, startLine, _endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  let nextLine = startLine + 1;
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (state.src.charCodeAt(pos) !== 91) {
    return false;
  }
  function getNextLine(nextLine2) {
    const endLine = state.lineMax;
    if (nextLine2 >= endLine || state.isEmpty(nextLine2)) {
      return null;
    }
    let isContinuation = false;
    if (state.sCount[nextLine2] - state.blkIndent > 3) {
      isContinuation = true;
    }
    if (state.sCount[nextLine2] < 0) {
      isContinuation = true;
    }
    if (!isContinuation) {
      const terminatorRules = state.md.block.ruler.getRules("reference");
      const oldParentType = state.parentType;
      state.parentType = "reference";
      let terminate = false;
      for (let i2 = 0, l = terminatorRules.length; i2 < l; i2++) {
        if (terminatorRules[i2](state, nextLine2, endLine, true)) {
          terminate = true;
          break;
        }
      }
      state.parentType = oldParentType;
      if (terminate) {
        return null;
      }
    }
    const pos2 = state.bMarks[nextLine2] + state.tShift[nextLine2];
    const max2 = state.eMarks[nextLine2];
    return state.src.slice(pos2, max2 + 1);
  }
  let str2 = state.src.slice(pos, max + 1);
  max = str2.length;
  let labelEnd = -1;
  for (pos = 1; pos < max; pos++) {
    const ch = str2.charCodeAt(pos);
    if (ch === 91) {
      return false;
    } else if (ch === 93) {
      labelEnd = pos;
      break;
    } else if (ch === 10) {
      const lineContent = getNextLine(nextLine);
      if (lineContent !== null) {
        str2 += lineContent;
        max = str2.length;
        nextLine++;
      }
    } else if (ch === 92) {
      pos++;
      if (pos < max && str2.charCodeAt(pos) === 10) {
        const lineContent = getNextLine(nextLine);
        if (lineContent !== null) {
          str2 += lineContent;
          max = str2.length;
          nextLine++;
        }
      }
    }
  }
  if (labelEnd < 0 || str2.charCodeAt(labelEnd + 1) !== 58) {
    return false;
  }
  for (pos = labelEnd + 2; pos < max; pos++) {
    const ch = str2.charCodeAt(pos);
    if (ch === 10) {
      const lineContent = getNextLine(nextLine);
      if (lineContent !== null) {
        str2 += lineContent;
        max = str2.length;
        nextLine++;
      }
    } else if (isSpace(ch)) {
    } else {
      break;
    }
  }
  const destRes = state.md.helpers.parseLinkDestination(str2, pos, max);
  if (!destRes.ok) {
    return false;
  }
  const href = state.md.normalizeLink(destRes.str);
  if (!state.md.validateLink(href)) {
    return false;
  }
  pos = destRes.pos;
  const destEndPos = pos;
  const destEndLineNo = nextLine;
  const start = pos;
  for (; pos < max; pos++) {
    const ch = str2.charCodeAt(pos);
    if (ch === 10) {
      const lineContent = getNextLine(nextLine);
      if (lineContent !== null) {
        str2 += lineContent;
        max = str2.length;
        nextLine++;
      }
    } else if (isSpace(ch)) {
    } else {
      break;
    }
  }
  let titleRes = state.md.helpers.parseLinkTitle(str2, pos, max);
  while (titleRes.can_continue) {
    const lineContent = getNextLine(nextLine);
    if (lineContent === null) break;
    str2 += lineContent;
    pos = max;
    max = str2.length;
    nextLine++;
    titleRes = state.md.helpers.parseLinkTitle(str2, pos, max, titleRes);
  }
  let title;
  if (pos < max && start !== pos && titleRes.ok) {
    title = titleRes.str;
    pos = titleRes.pos;
  } else {
    title = "";
    pos = destEndPos;
    nextLine = destEndLineNo;
  }
  while (pos < max) {
    const ch = str2.charCodeAt(pos);
    if (!isSpace(ch)) {
      break;
    }
    pos++;
  }
  if (pos < max && str2.charCodeAt(pos) !== 10) {
    if (title) {
      title = "";
      pos = destEndPos;
      nextLine = destEndLineNo;
      while (pos < max) {
        const ch = str2.charCodeAt(pos);
        if (!isSpace(ch)) {
          break;
        }
        pos++;
      }
    }
  }
  if (pos < max && str2.charCodeAt(pos) !== 10) {
    return false;
  }
  const label = normalizeReference(str2.slice(1, labelEnd));
  if (!label) {
    return false;
  }
  if (silent) {
    return true;
  }
  if (typeof state.env.references === "undefined") {
    state.env.references = {};
  }
  if (typeof state.env.references[label] === "undefined") {
    state.env.references[label] = { title, href };
  }
  state.line = nextLine;
  return true;
}

// node_modules/markdown-it/lib/common/html_blocks.mjs
var html_blocks_default = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
];

// node_modules/markdown-it/lib/common/html_re.mjs
var attr_name = "[a-zA-Z_:][a-zA-Z0-9:._-]*";
var unquoted = "[^\"'=<>`\\x00-\\x20]+";
var single_quoted = "'[^']*'";
var double_quoted = '"[^"]*"';
var attr_value = "(?:" + unquoted + "|" + single_quoted + "|" + double_quoted + ")";
var attribute = "(?:\\s+" + attr_name + "(?:\\s*=\\s*" + attr_value + ")?)";
var open_tag = "<[A-Za-z][A-Za-z0-9\\-]*" + attribute + "*\\s*\\/?>";
var close_tag = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>";
var comment = "<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->";
var processing = "<[?][\\s\\S]*?[?]>";
var declaration = "<![A-Za-z][^>]*>";
var cdata = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
var HTML_TAG_RE = new RegExp("^(?:" + open_tag + "|" + close_tag + "|" + comment + "|" + processing + "|" + declaration + "|" + cdata + ")");
var HTML_OPEN_CLOSE_TAG_RE = new RegExp("^(?:" + open_tag + "|" + close_tag + ")");

// node_modules/markdown-it/lib/rules_block/html_block.mjs
var HTML_SEQUENCES = [
  [/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, true],
  [/^<!--/, /-->/, true],
  [/^<\?/, /\?>/, true],
  [/^<![A-Z]/, />/, true],
  [/^<!\[CDATA\[/, /\]\]>/, true],
  [new RegExp("^</?(" + html_blocks_default.join("|") + ")(?=(\\s|/?>|$))", "i"), /^$/, true],
  [new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + "\\s*$"), /^$/, false]
];
function html_block(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (!state.md.options.html) {
    return false;
  }
  if (state.src.charCodeAt(pos) !== 60) {
    return false;
  }
  let lineText = state.src.slice(pos, max);
  let i2 = 0;
  for (; i2 < HTML_SEQUENCES.length; i2++) {
    if (HTML_SEQUENCES[i2][0].test(lineText)) {
      break;
    }
  }
  if (i2 === HTML_SEQUENCES.length) {
    return false;
  }
  if (silent) {
    return HTML_SEQUENCES[i2][2];
  }
  let nextLine = startLine + 1;
  const endsOnBlankLine = HTML_SEQUENCES[i2][1].test("");
  if (!HTML_SEQUENCES[i2][1].test(lineText)) {
    for (; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) {
        if (endsOnBlankLine || !state.isEmpty(nextLine)) {
          break;
        }
      }
      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      lineText = state.src.slice(pos, max);
      if (HTML_SEQUENCES[i2][1].test(lineText)) {
        if (lineText.length !== 0) {
          nextLine++;
        }
        break;
      }
    }
  }
  state.line = nextLine;
  const token = state.push("html_block", "", 0);
  token.map = [startLine, nextLine];
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
  return true;
}

// node_modules/markdown-it/lib/rules_block/heading.mjs
function heading(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  let ch = state.src.charCodeAt(pos);
  if (ch !== 35 || pos >= max) {
    return false;
  }
  let level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 35 && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }
  if (level > 6 || pos < max && !isSpace(ch)) {
    return false;
  }
  if (silent) {
    return true;
  }
  max = state.skipSpacesBack(max, pos);
  const tmp = state.skipCharsBack(max, 35, pos);
  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
    max = tmp;
  }
  state.line = startLine + 1;
  const token_o = state.push("heading_open", "h" + String(level), 1);
  token_o.markup = "########".slice(0, level);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = asciiTrim(state.src.slice(pos, max));
  token_i.map = [startLine, state.line];
  token_i.children = [];
  const token_c = state.push("heading_close", "h" + String(level), -1);
  token_c.markup = "########".slice(0, level);
  return true;
}

// node_modules/markdown-it/lib/rules_block/lheading.mjs
function lheading(state, startLine, endLine) {
  const terminatorRules = state.md.block.ruler.getRules("paragraph");
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  const oldParentType = state.parentType;
  state.parentType = "paragraph";
  let level = 0;
  let marker;
  let nextLine = startLine + 1;
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    if (state.sCount[nextLine] - state.blkIndent > 3) {
      continue;
    }
    if (state.sCount[nextLine] >= state.blkIndent) {
      let pos = state.bMarks[nextLine] + state.tShift[nextLine];
      const max = state.eMarks[nextLine];
      if (pos < max) {
        marker = state.src.charCodeAt(pos);
        if (marker === 45 || marker === 61) {
          pos = state.skipChars(pos, marker);
          pos = state.skipSpaces(pos);
          if (pos >= max) {
            level = marker === 61 ? 1 : 2;
            break;
          }
        }
      }
    }
    if (state.sCount[nextLine] < 0) {
      continue;
    }
    let terminate = false;
    for (let i2 = 0, l = terminatorRules.length; i2 < l; i2++) {
      if (terminatorRules[i2](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
  }
  if (!level) {
    state.parentType = oldParentType;
    return false;
  }
  const content = asciiTrim(state.getLines(startLine, nextLine, state.blkIndent, false));
  state.line = nextLine + 1;
  const token_o = state.push("heading_open", "h" + String(level), 1);
  token_o.markup = String.fromCharCode(marker);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = content;
  token_i.map = [startLine, state.line - 1];
  token_i.children = [];
  const token_c = state.push("heading_close", "h" + String(level), -1);
  token_c.markup = String.fromCharCode(marker);
  state.parentType = oldParentType;
  return true;
}

// node_modules/markdown-it/lib/rules_block/paragraph.mjs
function paragraph(state, startLine, endLine) {
  const terminatorRules = state.md.block.ruler.getRules("paragraph");
  const oldParentType = state.parentType;
  let nextLine = startLine + 1;
  state.parentType = "paragraph";
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    if (state.sCount[nextLine] - state.blkIndent > 3) {
      continue;
    }
    if (state.sCount[nextLine] < 0) {
      continue;
    }
    let terminate = false;
    for (let i2 = 0, l = terminatorRules.length; i2 < l; i2++) {
      if (terminatorRules[i2](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
  }
  const content = asciiTrim(state.getLines(startLine, nextLine, state.blkIndent, false));
  state.line = nextLine;
  const token_o = state.push("paragraph_open", "p", 1);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = content;
  token_i.map = [startLine, state.line];
  token_i.children = [];
  state.push("paragraph_close", "p", -1);
  state.parentType = oldParentType;
  return true;
}

// node_modules/markdown-it/lib/parser_block.mjs
var _rules2 = [
  // First 2 params - rule name & source. Secondary array - list of rules,
  // which can be terminated by this one.
  ["table", table, ["paragraph", "reference"]],
  ["code", code],
  ["fence", fence, ["paragraph", "reference", "blockquote", "list"]],
  ["blockquote", blockquote, ["paragraph", "reference", "blockquote", "list"]],
  ["hr", hr, ["paragraph", "reference", "blockquote", "list"]],
  ["list", list, ["paragraph", "reference", "blockquote"]],
  ["reference", reference],
  ["html_block", html_block, ["paragraph", "reference", "blockquote"]],
  ["heading", heading, ["paragraph", "reference", "blockquote"]],
  ["lheading", lheading],
  ["paragraph", paragraph]
];
function ParserBlock() {
  this.ruler = new ruler_default();
  for (let i2 = 0; i2 < _rules2.length; i2++) {
    this.ruler.push(_rules2[i2][0], _rules2[i2][1], { alt: (_rules2[i2][2] || []).slice() });
  }
}
ParserBlock.prototype.tokenize = function(state, startLine, endLine) {
  const rules = this.ruler.getRules("");
  const len = rules.length;
  const maxNesting = state.md.options.maxNesting;
  let line = startLine;
  let hasEmptyLines = false;
  while (line < endLine) {
    state.line = line = state.skipEmptyLines(line);
    if (line >= endLine) {
      break;
    }
    if (state.sCount[line] < state.blkIndent) {
      break;
    }
    if (state.level >= maxNesting) {
      state.line = endLine;
      break;
    }
    const prevLine = state.line;
    let ok = false;
    for (let i2 = 0; i2 < len; i2++) {
      ok = rules[i2](state, line, endLine, false);
      if (ok) {
        if (prevLine >= state.line) {
          throw new Error("block rule didn't increment state.line");
        }
        break;
      }
    }
    if (!ok) throw new Error("none of the block rules matched");
    state.tight = !hasEmptyLines;
    if (state.isEmpty(state.line - 1)) {
      hasEmptyLines = true;
    }
    line = state.line;
    if (line < endLine && state.isEmpty(line)) {
      hasEmptyLines = true;
      line++;
      state.line = line;
    }
  }
};
ParserBlock.prototype.parse = function(src, md2, env, outTokens) {
  if (!src) {
    return;
  }
  const state = new this.State(src, md2, env, outTokens);
  this.tokenize(state, state.line, state.lineMax);
};
ParserBlock.prototype.State = state_block_default;
var parser_block_default = ParserBlock;

// node_modules/markdown-it/lib/rules_inline/state_inline.mjs
function StateInline(src, md2, env, outTokens) {
  this.src = src;
  this.env = env;
  this.md = md2;
  this.tokens = outTokens;
  this.tokens_meta = Array(outTokens.length);
  this.pos = 0;
  this.posMax = this.src.length;
  this.level = 0;
  this.pending = "";
  this.pendingLevel = 0;
  this.cache = {};
  this.delimiters = [];
  this._prev_delimiters = [];
  this.backticks = {};
  this.backticksScanned = false;
  this.linkLevel = 0;
}
StateInline.prototype.pushPending = function() {
  const token = new token_default("text", "", 0);
  token.content = this.pending;
  token.level = this.pendingLevel;
  this.tokens.push(token);
  this.pending = "";
  return token;
};
StateInline.prototype.push = function(type2, tag, nesting) {
  if (this.pending) {
    this.pushPending();
  }
  const token = new token_default(type2, tag, nesting);
  let token_meta = null;
  if (nesting < 0) {
    this.level--;
    this.delimiters = this._prev_delimiters.pop();
  }
  token.level = this.level;
  if (nesting > 0) {
    this.level++;
    this._prev_delimiters.push(this.delimiters);
    this.delimiters = [];
    token_meta = { delimiters: this.delimiters };
  }
  this.pendingLevel = this.level;
  this.tokens.push(token);
  this.tokens_meta.push(token_meta);
  return token;
};
StateInline.prototype.scanDelims = function(start, canSplitWord) {
  const max = this.posMax;
  const marker = this.src.charCodeAt(start);
  let lastChar;
  if (start === 0) {
    lastChar = 32;
  } else if (start === 1) {
    lastChar = this.src.charCodeAt(0);
    if ((lastChar & 63488) === 55296) {
      lastChar = 65533;
    }
  } else {
    lastChar = this.src.charCodeAt(start - 1);
    if ((lastChar & 64512) === 56320) {
      const highSurr = this.src.charCodeAt(start - 2);
      lastChar = (highSurr & 64512) === 55296 ? 65536 + (highSurr - 55296 << 10) + (lastChar - 56320) : 65533;
    } else if ((lastChar & 64512) === 55296) {
      lastChar = 65533;
    }
  }
  let pos = start;
  while (pos < max && this.src.charCodeAt(pos) === marker) {
    pos++;
  }
  const count = pos - start;
  let nextChar = pos < max ? this.src.charCodeAt(pos) : 32;
  if ((nextChar & 64512) === 55296) {
    const lowSurr = this.src.charCodeAt(pos + 1);
    nextChar = (lowSurr & 64512) === 56320 ? 65536 + (nextChar - 55296 << 10) + (lowSurr - 56320) : 65533;
  } else if ((nextChar & 64512) === 56320) {
    nextChar = 65533;
  }
  const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
  const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
  const isLastWhiteSpace = isWhiteSpace(lastChar);
  const isNextWhiteSpace = isWhiteSpace(nextChar);
  const left_flanking = !isNextWhiteSpace && (!isNextPunctChar || isLastWhiteSpace || isLastPunctChar);
  const right_flanking = !isLastWhiteSpace && (!isLastPunctChar || isNextWhiteSpace || isNextPunctChar);
  const can_open = left_flanking && (canSplitWord || !right_flanking || isLastPunctChar);
  const can_close = right_flanking && (canSplitWord || !left_flanking || isNextPunctChar);
  return { can_open, can_close, length: count };
};
StateInline.prototype.Token = token_default;
var state_inline_default = StateInline;

// node_modules/markdown-it/lib/rules_inline/text.mjs
function isTerminatorChar(ch) {
  switch (ch) {
    case 10:
    case 33:
    case 35:
    case 36:
    case 37:
    case 38:
    case 42:
    case 43:
    case 45:
    case 58:
    case 60:
    case 61:
    case 62:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 125:
    case 126:
      return true;
    default:
      return false;
  }
}
function text(state, silent) {
  let pos = state.pos;
  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
    pos++;
  }
  if (pos === state.pos) {
    return false;
  }
  if (!silent) {
    state.pending += state.src.slice(state.pos, pos);
  }
  state.pos = pos;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/linkify.mjs
var SCHEME_RE = /(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;
function linkify2(state, silent) {
  if (!state.md.options.linkify) return false;
  if (state.linkLevel > 0) return false;
  const pos = state.pos;
  const max = state.posMax;
  if (pos + 3 > max) return false;
  if (state.src.charCodeAt(pos) !== 58) return false;
  if (state.src.charCodeAt(pos + 1) !== 47) return false;
  if (state.src.charCodeAt(pos + 2) !== 47) return false;
  const match2 = state.pending.match(SCHEME_RE);
  if (!match2) return false;
  const proto = match2[1];
  const link2 = state.md.linkify.matchAtStart(state.src.slice(pos - proto.length));
  if (!link2) return false;
  let url = link2.url;
  if (url.length <= proto.length) return false;
  let urlEnd = url.length;
  while (urlEnd > 0 && url.charCodeAt(urlEnd - 1) === 42) {
    urlEnd--;
  }
  if (urlEnd !== url.length) {
    url = url.slice(0, urlEnd);
  }
  const fullUrl = state.md.normalizeLink(url);
  if (!state.md.validateLink(fullUrl)) return false;
  if (!silent) {
    state.pending = state.pending.slice(0, -proto.length);
    const token_o = state.push("link_open", "a", 1);
    token_o.attrs = [["href", fullUrl]];
    token_o.markup = "linkify";
    token_o.info = "auto";
    const token_t = state.push("text", "", 0);
    token_t.content = state.md.normalizeLinkText(url);
    const token_c = state.push("link_close", "a", -1);
    token_c.markup = "linkify";
    token_c.info = "auto";
  }
  state.pos += url.length - proto.length;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/newline.mjs
function newline(state, silent) {
  let pos = state.pos;
  if (state.src.charCodeAt(pos) !== 10) {
    return false;
  }
  const pmax = state.pending.length - 1;
  const max = state.posMax;
  if (!silent) {
    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 32) {
      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 32) {
        let ws = pmax - 1;
        while (ws >= 1 && state.pending.charCodeAt(ws - 1) === 32) ws--;
        state.pending = state.pending.slice(0, ws);
        state.push("hardbreak", "br", 0);
      } else {
        state.pending = state.pending.slice(0, -1);
        state.push("softbreak", "br", 0);
      }
    } else {
      state.push("softbreak", "br", 0);
    }
  }
  pos++;
  while (pos < max && isSpace(state.src.charCodeAt(pos))) {
    pos++;
  }
  state.pos = pos;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/escape.mjs
var ESCAPED = [];
for (let i2 = 0; i2 < 256; i2++) {
  ESCAPED.push(0);
}
"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(ch) {
  ESCAPED[ch.charCodeAt(0)] = 1;
});
function escape2(state, silent) {
  let pos = state.pos;
  const max = state.posMax;
  if (state.src.charCodeAt(pos) !== 92) return false;
  pos++;
  if (pos >= max) return false;
  let ch1 = state.src.charCodeAt(pos);
  if (ch1 === 10) {
    if (!silent) {
      state.push("hardbreak", "br", 0);
    }
    pos++;
    while (pos < max) {
      ch1 = state.src.charCodeAt(pos);
      if (!isSpace(ch1)) break;
      pos++;
    }
    state.pos = pos;
    return true;
  }
  let escapedStr = state.src[pos];
  if (ch1 >= 55296 && ch1 <= 56319 && pos + 1 < max) {
    const ch2 = state.src.charCodeAt(pos + 1);
    if (ch2 >= 56320 && ch2 <= 57343) {
      escapedStr += state.src[pos + 1];
      pos++;
    }
  }
  const origStr = "\\" + escapedStr;
  if (!silent) {
    const token = state.push("text_special", "", 0);
    if (ch1 < 256 && ESCAPED[ch1] !== 0) {
      token.content = escapedStr;
    } else {
      token.content = origStr;
    }
    token.markup = origStr;
    token.info = "escape";
  }
  state.pos = pos + 1;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/backticks.mjs
function backtick(state, silent) {
  let pos = state.pos;
  const ch = state.src.charCodeAt(pos);
  if (ch !== 96) {
    return false;
  }
  const start = pos;
  pos++;
  const max = state.posMax;
  while (pos < max && state.src.charCodeAt(pos) === 96) {
    pos++;
  }
  const marker = state.src.slice(start, pos);
  const openerLength = marker.length;
  if (state.backticksScanned && (state.backticks[openerLength] || 0) <= start) {
    if (!silent) state.pending += marker;
    state.pos += openerLength;
    return true;
  }
  let matchEnd = pos;
  let matchStart;
  while ((matchStart = state.src.indexOf("`", matchEnd)) !== -1) {
    matchEnd = matchStart + 1;
    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 96) {
      matchEnd++;
    }
    const closerLength = matchEnd - matchStart;
    if (closerLength === openerLength) {
      if (!silent) {
        const token = state.push("code_inline", "code", 0);
        token.markup = marker;
        token.content = state.src.slice(pos, matchStart).replace(/\n/g, " ").replace(/^ (.+) $/, "$1");
      }
      state.pos = matchEnd;
      return true;
    }
    state.backticks[closerLength] = matchStart;
  }
  state.backticksScanned = true;
  if (!silent) state.pending += marker;
  state.pos += openerLength;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/strikethrough.mjs
function strikethrough_tokenize(state, silent) {
  const start = state.pos;
  const marker = state.src.charCodeAt(start);
  if (silent) {
    return false;
  }
  if (marker !== 126) {
    return false;
  }
  const scanned = state.scanDelims(state.pos, true);
  let len = scanned.length;
  const ch = String.fromCharCode(marker);
  if (len < 2) {
    return false;
  }
  let token;
  if (len % 2) {
    token = state.push("text", "", 0);
    token.content = ch;
    len--;
  }
  for (let i2 = 0; i2 < len; i2 += 2) {
    token = state.push("text", "", 0);
    token.content = ch + ch;
    state.delimiters.push({
      marker,
      length: 0,
      // disable "rule of 3" length checks meant for emphasis
      token: state.tokens.length - 1,
      end: -1,
      open: scanned.can_open,
      close: scanned.can_close
    });
  }
  state.pos += scanned.length;
  return true;
}
function postProcess(state, delimiters) {
  let token;
  const loneMarkers = [];
  const max = delimiters.length;
  for (let i2 = 0; i2 < max; i2++) {
    const startDelim = delimiters[i2];
    if (startDelim.marker !== 126) {
      continue;
    }
    if (startDelim.end === -1) {
      continue;
    }
    const endDelim = delimiters[startDelim.end];
    token = state.tokens[startDelim.token];
    token.type = "s_open";
    token.tag = "s";
    token.nesting = 1;
    token.markup = "~~";
    token.content = "";
    token = state.tokens[endDelim.token];
    token.type = "s_close";
    token.tag = "s";
    token.nesting = -1;
    token.markup = "~~";
    token.content = "";
    if (state.tokens[endDelim.token - 1].type === "text" && state.tokens[endDelim.token - 1].content === "~") {
      loneMarkers.push(endDelim.token - 1);
    }
  }
  while (loneMarkers.length) {
    const i2 = loneMarkers.pop();
    let j = i2 + 1;
    while (j < state.tokens.length && state.tokens[j].type === "s_close") {
      j++;
    }
    j--;
    if (i2 !== j) {
      token = state.tokens[j];
      state.tokens[j] = state.tokens[i2];
      state.tokens[i2] = token;
    }
  }
}
function strikethrough_postProcess(state) {
  const tokens_meta = state.tokens_meta;
  const max = state.tokens_meta.length;
  postProcess(state, state.delimiters);
  for (let curr = 0; curr < max; curr++) {
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      postProcess(state, tokens_meta[curr].delimiters);
    }
  }
}
var strikethrough_default = {
  tokenize: strikethrough_tokenize,
  postProcess: strikethrough_postProcess
};

// node_modules/markdown-it/lib/rules_inline/emphasis.mjs
function emphasis_tokenize(state, silent) {
  const start = state.pos;
  const marker = state.src.charCodeAt(start);
  if (silent) {
    return false;
  }
  if (marker !== 95 && marker !== 42) {
    return false;
  }
  const scanned = state.scanDelims(state.pos, marker === 42);
  for (let i2 = 0; i2 < scanned.length; i2++) {
    const token = state.push("text", "", 0);
    token.content = String.fromCharCode(marker);
    state.delimiters.push({
      // Char code of the starting marker (number).
      //
      marker,
      // Total length of these series of delimiters.
      //
      length: scanned.length,
      // A position of the token this delimiter corresponds to.
      //
      token: state.tokens.length - 1,
      // If this delimiter is matched as a valid opener, `end` will be
      // equal to its position, otherwise it's `-1`.
      //
      end: -1,
      // Boolean flags that determine if this delimiter could open or close
      // an emphasis.
      //
      open: scanned.can_open,
      close: scanned.can_close
    });
  }
  state.pos += scanned.length;
  return true;
}
function postProcess2(state, delimiters) {
  const max = delimiters.length;
  for (let i2 = max - 1; i2 >= 0; i2--) {
    const startDelim = delimiters[i2];
    if (startDelim.marker !== 95 && startDelim.marker !== 42) {
      continue;
    }
    if (startDelim.end === -1) {
      continue;
    }
    const endDelim = delimiters[startDelim.end];
    const isStrong = i2 > 0 && delimiters[i2 - 1].end === startDelim.end + 1 && // check that first two markers match and adjacent
    delimiters[i2 - 1].marker === startDelim.marker && delimiters[i2 - 1].token === startDelim.token - 1 && // check that last two markers are adjacent (we can safely assume they match)
    delimiters[startDelim.end + 1].token === endDelim.token + 1;
    const ch = String.fromCharCode(startDelim.marker);
    const token_o = state.tokens[startDelim.token];
    token_o.type = isStrong ? "strong_open" : "em_open";
    token_o.tag = isStrong ? "strong" : "em";
    token_o.nesting = 1;
    token_o.markup = isStrong ? ch + ch : ch;
    token_o.content = "";
    const token_c = state.tokens[endDelim.token];
    token_c.type = isStrong ? "strong_close" : "em_close";
    token_c.tag = isStrong ? "strong" : "em";
    token_c.nesting = -1;
    token_c.markup = isStrong ? ch + ch : ch;
    token_c.content = "";
    if (isStrong) {
      state.tokens[delimiters[i2 - 1].token].content = "";
      state.tokens[delimiters[startDelim.end + 1].token].content = "";
      i2--;
    }
  }
}
function emphasis_post_process(state) {
  const tokens_meta = state.tokens_meta;
  const max = state.tokens_meta.length;
  postProcess2(state, state.delimiters);
  for (let curr = 0; curr < max; curr++) {
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      postProcess2(state, tokens_meta[curr].delimiters);
    }
  }
}
var emphasis_default = {
  tokenize: emphasis_tokenize,
  postProcess: emphasis_post_process
};

// node_modules/markdown-it/lib/rules_inline/link.mjs
function link(state, silent) {
  let code2, label, res, ref;
  let href = "";
  let title = "";
  let start = state.pos;
  let parseReference = true;
  if (state.src.charCodeAt(state.pos) !== 91) {
    return false;
  }
  const oldPos = state.pos;
  const max = state.posMax;
  const labelStart = state.pos + 1;
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);
  if (labelEnd < 0) {
    return false;
  }
  let pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 40) {
    parseReference = false;
    pos++;
    for (; pos < max; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) {
        break;
      }
    }
    if (pos >= max) {
      return false;
    }
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) {
        pos = res.pos;
      } else {
        href = "";
      }
      start = pos;
      for (; pos < max; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) {
          break;
        }
      }
      res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
      if (pos < max && start !== pos && res.ok) {
        title = res.str;
        pos = res.pos;
        for (; pos < max; pos++) {
          code2 = state.src.charCodeAt(pos);
          if (!isSpace(code2) && code2 !== 10) {
            break;
          }
        }
      }
    }
    if (pos >= max || state.src.charCodeAt(pos) !== 41) {
      parseReference = true;
    }
    pos++;
  }
  if (parseReference) {
    if (typeof state.env.references === "undefined") {
      return false;
    }
    if (pos < max && state.src.charCodeAt(pos) === 91) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }
    if (!label) {
      label = state.src.slice(labelStart, labelEnd);
    }
    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;
    const token_o = state.push("link_open", "a", 1);
    const attrs = [["href", href]];
    token_o.attrs = attrs;
    if (title) {
      attrs.push(["title", title]);
    }
    state.linkLevel++;
    state.md.inline.tokenize(state);
    state.linkLevel--;
    state.push("link_close", "a", -1);
  }
  state.pos = pos;
  state.posMax = max;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/image.mjs
function image(state, silent) {
  let code2, content, label, pos, ref, res, title, start;
  let href = "";
  const oldPos = state.pos;
  const max = state.posMax;
  if (state.src.charCodeAt(state.pos) !== 33) {
    return false;
  }
  if (state.src.charCodeAt(state.pos + 1) !== 91) {
    return false;
  }
  const labelStart = state.pos + 2;
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);
  if (labelEnd < 0) {
    return false;
  }
  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 40) {
    pos++;
    for (; pos < max; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) {
        break;
      }
    }
    if (pos >= max) {
      return false;
    }
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) {
        pos = res.pos;
      } else {
        href = "";
      }
    }
    start = pos;
    for (; pos < max; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) {
        break;
      }
    }
    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;
      for (; pos < max; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) {
          break;
        }
      }
    } else {
      title = "";
    }
    if (pos >= max || state.src.charCodeAt(pos) !== 41) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    if (typeof state.env.references === "undefined") {
      return false;
    }
    if (pos < max && state.src.charCodeAt(pos) === 91) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }
    if (!label) {
      label = state.src.slice(labelStart, labelEnd);
    }
    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }
  if (!silent) {
    content = state.src.slice(labelStart, labelEnd);
    const tokens = [];
    state.md.inline.parse(
      content,
      state.md,
      state.env,
      tokens
    );
    const token = state.push("image", "img", 0);
    const attrs = [["src", href], ["alt", ""]];
    token.attrs = attrs;
    token.children = tokens;
    token.content = content;
    if (title) {
      attrs.push(["title", title]);
    }
  }
  state.pos = pos;
  state.posMax = max;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/autolink.mjs
var EMAIL_RE = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;
var AUTOLINK_RE = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
function autolink(state, silent) {
  let pos = state.pos;
  if (state.src.charCodeAt(pos) !== 60) {
    return false;
  }
  const start = state.pos;
  const max = state.posMax;
  for (; ; ) {
    if (++pos >= max) return false;
    const ch = state.src.charCodeAt(pos);
    if (ch === 60) return false;
    if (ch === 62) break;
  }
  const url = state.src.slice(start + 1, pos);
  if (AUTOLINK_RE.test(url)) {
    const fullUrl = state.md.normalizeLink(url);
    if (!state.md.validateLink(fullUrl)) {
      return false;
    }
    if (!silent) {
      const token_o = state.push("link_open", "a", 1);
      token_o.attrs = [["href", fullUrl]];
      token_o.markup = "autolink";
      token_o.info = "auto";
      const token_t = state.push("text", "", 0);
      token_t.content = state.md.normalizeLinkText(url);
      const token_c = state.push("link_close", "a", -1);
      token_c.markup = "autolink";
      token_c.info = "auto";
    }
    state.pos += url.length + 2;
    return true;
  }
  if (EMAIL_RE.test(url)) {
    const fullUrl = state.md.normalizeLink("mailto:" + url);
    if (!state.md.validateLink(fullUrl)) {
      return false;
    }
    if (!silent) {
      const token_o = state.push("link_open", "a", 1);
      token_o.attrs = [["href", fullUrl]];
      token_o.markup = "autolink";
      token_o.info = "auto";
      const token_t = state.push("text", "", 0);
      token_t.content = state.md.normalizeLinkText(url);
      const token_c = state.push("link_close", "a", -1);
      token_c.markup = "autolink";
      token_c.info = "auto";
    }
    state.pos += url.length + 2;
    return true;
  }
  return false;
}

// node_modules/markdown-it/lib/rules_inline/html_inline.mjs
function isLinkOpen2(str2) {
  return /^<a[>\s]/i.test(str2);
}
function isLinkClose2(str2) {
  return /^<\/a\s*>/i.test(str2);
}
function isLetter(ch) {
  const lc = ch | 32;
  return lc >= 97 && lc <= 122;
}
function html_inline(state, silent) {
  if (!state.md.options.html) {
    return false;
  }
  const max = state.posMax;
  const pos = state.pos;
  if (state.src.charCodeAt(pos) !== 60 || pos + 2 >= max) {
    return false;
  }
  const ch = state.src.charCodeAt(pos + 1);
  if (ch !== 33 && ch !== 63 && ch !== 47 && !isLetter(ch)) {
    return false;
  }
  const match2 = state.src.slice(pos).match(HTML_TAG_RE);
  if (!match2) {
    return false;
  }
  if (!silent) {
    const token = state.push("html_inline", "", 0);
    token.content = match2[0];
    if (isLinkOpen2(token.content)) state.linkLevel++;
    if (isLinkClose2(token.content)) state.linkLevel--;
  }
  state.pos += match2[0].length;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/entity.mjs
var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
var NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;
function entity(state, silent) {
  const pos = state.pos;
  const max = state.posMax;
  if (state.src.charCodeAt(pos) !== 38) return false;
  if (pos + 1 >= max) return false;
  const ch = state.src.charCodeAt(pos + 1);
  if (ch === 35) {
    const match2 = state.src.slice(pos).match(DIGITAL_RE);
    if (match2) {
      if (!silent) {
        const code2 = match2[1][0].toLowerCase() === "x" ? parseInt(match2[1].slice(1), 16) : parseInt(match2[1], 10);
        const token = state.push("text_special", "", 0);
        token.content = isValidEntityCode(code2) ? fromCodePoint2(code2) : fromCodePoint2(65533);
        token.markup = match2[0];
        token.info = "entity";
      }
      state.pos += match2[0].length;
      return true;
    }
  } else {
    const match2 = state.src.slice(pos).match(NAMED_RE);
    if (match2) {
      const decoded = decodeHTMLStrict(match2[0]);
      if (decoded !== match2[0]) {
        if (!silent) {
          const token = state.push("text_special", "", 0);
          token.content = decoded;
          token.markup = match2[0];
          token.info = "entity";
        }
        state.pos += match2[0].length;
        return true;
      }
    }
  }
  return false;
}

// node_modules/markdown-it/lib/rules_inline/balance_pairs.mjs
function processDelimiters(delimiters) {
  const openersBottom = {};
  const max = delimiters.length;
  if (!max) return;
  let headerIdx = 0;
  let lastTokenIdx = -2;
  const jumps = [];
  for (let closerIdx = 0; closerIdx < max; closerIdx++) {
    const closer = delimiters[closerIdx];
    jumps.push(0);
    if (delimiters[headerIdx].marker !== closer.marker || lastTokenIdx !== closer.token - 1) {
      headerIdx = closerIdx;
    }
    lastTokenIdx = closer.token;
    closer.length = closer.length || 0;
    if (!closer.close) continue;
    if (!openersBottom.hasOwnProperty(closer.marker)) {
      openersBottom[closer.marker] = [-1, -1, -1, -1, -1, -1];
    }
    const minOpenerIdx = openersBottom[closer.marker][(closer.open ? 3 : 0) + closer.length % 3];
    let openerIdx = headerIdx - jumps[headerIdx] - 1;
    let newMinOpenerIdx = openerIdx;
    for (; openerIdx > minOpenerIdx; openerIdx -= jumps[openerIdx] + 1) {
      const opener = delimiters[openerIdx];
      if (opener.marker !== closer.marker) continue;
      if (opener.open && opener.end < 0) {
        let isOddMatch = false;
        if (opener.close || closer.open) {
          if ((opener.length + closer.length) % 3 === 0) {
            if (opener.length % 3 !== 0 || closer.length % 3 !== 0) {
              isOddMatch = true;
            }
          }
        }
        if (!isOddMatch) {
          const lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].open ? jumps[openerIdx - 1] + 1 : 0;
          jumps[closerIdx] = closerIdx - openerIdx + lastJump;
          jumps[openerIdx] = lastJump;
          closer.open = false;
          opener.end = closerIdx;
          opener.close = false;
          newMinOpenerIdx = -1;
          lastTokenIdx = -2;
          break;
        }
      }
    }
    if (newMinOpenerIdx !== -1) {
      openersBottom[closer.marker][(closer.open ? 3 : 0) + (closer.length || 0) % 3] = newMinOpenerIdx;
    }
  }
}
function link_pairs(state) {
  const tokens_meta = state.tokens_meta;
  const max = state.tokens_meta.length;
  processDelimiters(state.delimiters);
  for (let curr = 0; curr < max; curr++) {
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      processDelimiters(tokens_meta[curr].delimiters);
    }
  }
}

// node_modules/markdown-it/lib/rules_inline/fragments_join.mjs
function fragments_join(state) {
  let curr, last;
  let level = 0;
  const tokens = state.tokens;
  const max = state.tokens.length;
  for (curr = last = 0; curr < max; curr++) {
    if (tokens[curr].nesting < 0) level--;
    tokens[curr].level = level;
    if (tokens[curr].nesting > 0) level++;
    if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") {
      tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
    } else {
      if (curr !== last) {
        tokens[last] = tokens[curr];
      }
      last++;
    }
  }
  if (curr !== last) {
    tokens.length = last;
  }
}

// node_modules/markdown-it/lib/parser_inline.mjs
var _rules3 = [
  ["text", text],
  ["linkify", linkify2],
  ["newline", newline],
  ["escape", escape2],
  ["backticks", backtick],
  ["strikethrough", strikethrough_default.tokenize],
  ["emphasis", emphasis_default.tokenize],
  ["link", link],
  ["image", image],
  ["autolink", autolink],
  ["html_inline", html_inline],
  ["entity", entity]
];
var _rules22 = [
  ["balance_pairs", link_pairs],
  ["strikethrough", strikethrough_default.postProcess],
  ["emphasis", emphasis_default.postProcess],
  // rules for pairs separate '**' into its own text tokens, which may be left unused,
  // rule below merges unused segments back with the rest of the text
  ["fragments_join", fragments_join]
];
function ParserInline() {
  this.ruler = new ruler_default();
  for (let i2 = 0; i2 < _rules3.length; i2++) {
    this.ruler.push(_rules3[i2][0], _rules3[i2][1]);
  }
  this.ruler2 = new ruler_default();
  for (let i2 = 0; i2 < _rules22.length; i2++) {
    this.ruler2.push(_rules22[i2][0], _rules22[i2][1]);
  }
}
ParserInline.prototype.skipToken = function(state) {
  const pos = state.pos;
  const rules = this.ruler.getRules("");
  const len = rules.length;
  const maxNesting = state.md.options.maxNesting;
  const cache = state.cache;
  if (typeof cache[pos] !== "undefined") {
    state.pos = cache[pos];
    return;
  }
  let ok = false;
  if (state.level < maxNesting) {
    for (let i2 = 0; i2 < len; i2++) {
      state.level++;
      ok = rules[i2](state, true);
      state.level--;
      if (ok) {
        if (pos >= state.pos) {
          throw new Error("inline rule didn't increment state.pos");
        }
        break;
      }
    }
  } else {
    state.pos = state.posMax;
  }
  if (!ok) {
    state.pos++;
  }
  cache[pos] = state.pos;
};
ParserInline.prototype.tokenize = function(state) {
  const rules = this.ruler.getRules("");
  const len = rules.length;
  const end = state.posMax;
  const maxNesting = state.md.options.maxNesting;
  while (state.pos < end) {
    const prevPos = state.pos;
    let ok = false;
    if (state.level < maxNesting) {
      for (let i2 = 0; i2 < len; i2++) {
        ok = rules[i2](state, false);
        if (ok) {
          if (prevPos >= state.pos) {
            throw new Error("inline rule didn't increment state.pos");
          }
          break;
        }
      }
    }
    if (ok) {
      if (state.pos >= end) {
        break;
      }
      continue;
    }
    state.pending += state.src[state.pos++];
  }
  if (state.pending) {
    state.pushPending();
  }
};
ParserInline.prototype.parse = function(str2, md2, env, outTokens) {
  const state = new this.State(str2, md2, env, outTokens);
  this.tokenize(state);
  const rules = this.ruler2.getRules("");
  const len = rules.length;
  for (let i2 = 0; i2 < len; i2++) {
    rules[i2](state);
  }
};
ParserInline.prototype.State = state_inline_default;
var parser_inline_default = ParserInline;

// node_modules/linkify-it/lib/re.mjs
function re_default(opts) {
  const re = {};
  opts = opts || {};
  re.src_Any = regex_default.source;
  re.src_Cc = regex_default2.source;
  re.src_Z = regex_default6.source;
  re.src_P = regex_default4.source;
  re.src_ZPCc = [re.src_Z, re.src_P, re.src_Cc].join("|");
  re.src_ZCc = [re.src_Z, re.src_Cc].join("|");
  const text_separators = "[><\uFF5C]";
  re.src_pseudo_letter = "(?:(?!" + text_separators + "|" + re.src_ZPCc + ")" + re.src_Any + ")";
  re.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
  re.src_auth = "(?:(?:(?!" + re.src_ZCc + "|[@/\\[\\]()]).)+@)?";
  re.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?";
  re.src_host_terminator = "(?=$|" + text_separators + "|" + re.src_ZPCc + ")(?!" + (opts["---"] ? "-(?!--)|" : "-|") + "_|:\\d|\\.-|\\.(?!$|" + re.src_ZPCc + "))";
  re.src_path = "(?:[/?#](?:(?!" + re.src_ZCc + "|" + text_separators + `|[()[\\]{}.,"'?!\\-;]).|\\[(?:(?!` + re.src_ZCc + "|\\]).)*\\]|\\((?:(?!" + re.src_ZCc + "|[)]).)*\\)|\\{(?:(?!" + re.src_ZCc + '|[}]).)*\\}|\\"(?:(?!' + re.src_ZCc + `|["]).)+\\"|\\'(?:(?!` + re.src_ZCc + "|[']).)+\\'|\\'(?=" + re.src_pseudo_letter + "|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!" + re.src_ZCc + "|[.]|$)|" + (opts["---"] ? "\\-(?!--(?:[^-]|$))(?:-*)|" : "\\-+|") + // allow `,,,` in paths
  ",(?!" + re.src_ZCc + "|$)|;(?!" + re.src_ZCc + "|$)|\\!+(?!" + re.src_ZCc + "|[!]|$)|\\?(?!" + re.src_ZCc + "|[?]|$))+|\\/)?";
  re.src_email_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]*';
  re.src_xn = "xn--[a-z0-9\\-]{1,59}";
  re.src_domain_root = // Allow letters & digits (http://test1)
  "(?:" + re.src_xn + "|" + re.src_pseudo_letter + "{1,63})";
  re.src_domain = "(?:" + re.src_xn + "|(?:" + re.src_pseudo_letter + ")|(?:" + re.src_pseudo_letter + "(?:-|" + re.src_pseudo_letter + "){0,61}" + re.src_pseudo_letter + "))";
  re.src_host = "(?:(?:(?:(?:" + re.src_domain + ")\\.)*" + re.src_domain + "))";
  re.tpl_host_fuzzy = "(?:" + re.src_ip4 + "|(?:(?:(?:" + re.src_domain + ")\\.)+(?:%TLDS%)))";
  re.tpl_host_no_ip_fuzzy = "(?:(?:(?:" + re.src_domain + ")\\.)+(?:%TLDS%))";
  re.src_host_strict = re.src_host + re.src_host_terminator;
  re.tpl_host_fuzzy_strict = re.tpl_host_fuzzy + re.src_host_terminator;
  re.src_host_port_strict = re.src_host + re.src_port + re.src_host_terminator;
  re.tpl_host_port_fuzzy_strict = re.tpl_host_fuzzy + re.src_port + re.src_host_terminator;
  re.tpl_host_port_no_ip_fuzzy_strict = re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator;
  re.tpl_host_fuzzy_test = "localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:" + re.src_ZPCc + "|>|$))";
  re.tpl_email_fuzzy = "(^|" + text_separators + '|"|\\(|' + re.src_ZCc + ")(" + re.src_email_name + "@" + re.tpl_host_fuzzy_strict + ")";
  re.tpl_link_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
  // but can start with > (markdown blockquote)
  "(^|(?![.:/\\-_@])(?:[$+<=>^`|\uFF5C]|" + re.src_ZPCc + "))((?![$+<=>^`|\uFF5C])" + re.tpl_host_port_fuzzy_strict + re.src_path + ")";
  re.tpl_link_no_ip_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
  // but can start with > (markdown blockquote)
  "(^|(?![.:/\\-_@])(?:[$+<=>^`|\uFF5C]|" + re.src_ZPCc + "))((?![$+<=>^`|\uFF5C])" + re.tpl_host_port_no_ip_fuzzy_strict + re.src_path + ")";
  return re;
}

// node_modules/linkify-it/index.mjs
function assign2(obj) {
  const sources = Array.prototype.slice.call(arguments, 1);
  sources.forEach(function(source) {
    if (!source) {
      return;
    }
    Object.keys(source).forEach(function(key) {
      obj[key] = source[key];
    });
  });
  return obj;
}
function _class3(obj) {
  return Object.prototype.toString.call(obj);
}
function isString2(obj) {
  return _class3(obj) === "[object String]";
}
function isObject2(obj) {
  return _class3(obj) === "[object Object]";
}
function isRegExp(obj) {
  return _class3(obj) === "[object RegExp]";
}
function isFunction(obj) {
  return _class3(obj) === "[object Function]";
}
function escapeRE2(str2) {
  return str2.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}
var defaultOptions = {
  fuzzyLink: true,
  fuzzyEmail: true,
  fuzzyIP: false
};
function isOptionsObj(obj) {
  return Object.keys(obj || {}).reduce(function(acc, k) {
    return acc || defaultOptions.hasOwnProperty(k);
  }, false);
}
var defaultSchemas = {
  "http:": {
    validate: function(text2, pos, self) {
      const tail = text2.slice(pos);
      if (!self.re.http) {
        self.re.http = new RegExp(
          "^\\/\\/" + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path,
          "i"
        );
      }
      if (self.re.http.test(tail)) {
        return tail.match(self.re.http)[0].length;
      }
      return 0;
    }
  },
  "https:": "http:",
  "ftp:": "http:",
  "//": {
    validate: function(text2, pos, self) {
      const tail = text2.slice(pos);
      if (!self.re.no_http) {
        self.re.no_http = new RegExp(
          "^" + self.re.src_auth + // Don't allow single-level domains, because of false positives like '//test'
          // with code comments
          "(?:localhost|(?:(?:" + self.re.src_domain + ")\\.)+" + self.re.src_domain_root + ")" + self.re.src_port + self.re.src_host_terminator + self.re.src_path,
          "i"
        );
      }
      if (self.re.no_http.test(tail)) {
        if (pos >= 3 && text2[pos - 3] === ":") {
          return 0;
        }
        if (pos >= 3 && text2[pos - 3] === "/") {
          return 0;
        }
        return tail.match(self.re.no_http)[0].length;
      }
      return 0;
    }
  },
  "mailto:": {
    validate: function(text2, pos, self) {
      const tail = text2.slice(pos);
      if (!self.re.mailto) {
        self.re.mailto = new RegExp(
          "^" + self.re.src_email_name + "@" + self.re.src_host_strict,
          "i"
        );
      }
      if (self.re.mailto.test(tail)) {
        return tail.match(self.re.mailto)[0].length;
      }
      return 0;
    }
  }
};
var tlds_2ch_src_re = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]";
var tlds_default = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444".split("|");
function createValidator(re) {
  return function(text2, pos) {
    const tail = text2.slice(pos);
    if (re.test(tail)) {
      return tail.match(re)[0].length;
    }
    return 0;
  };
}
function createNormalizer() {
  return function(match2, self) {
    self.normalize(match2);
  };
}
function compile(self) {
  const re = self.re = re_default(self.__opts__);
  const tlds2 = self.__tlds__.slice();
  self.onCompile();
  if (!self.__tlds_replaced__) {
    tlds2.push(tlds_2ch_src_re);
  }
  tlds2.push(re.src_xn);
  re.src_tlds = tlds2.join("|");
  function untpl(tpl) {
    return tpl.replace("%TLDS%", re.src_tlds);
  }
  re.email_fuzzy = RegExp(untpl(re.tpl_email_fuzzy), "i");
  re.email_fuzzy_global = RegExp(untpl(re.tpl_email_fuzzy), "ig");
  re.link_fuzzy = RegExp(untpl(re.tpl_link_fuzzy), "i");
  re.link_fuzzy_global = RegExp(untpl(re.tpl_link_fuzzy), "ig");
  re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), "i");
  re.link_no_ip_fuzzy_global = RegExp(untpl(re.tpl_link_no_ip_fuzzy), "ig");
  re.host_fuzzy_test = RegExp(untpl(re.tpl_host_fuzzy_test), "i");
  const aliases = [];
  self.__compiled__ = {};
  function schemaError(name, val) {
    throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val);
  }
  Object.keys(self.__schemas__).forEach(function(name) {
    const val = self.__schemas__[name];
    if (val === null) {
      return;
    }
    const compiled = { validate: null, link: null };
    self.__compiled__[name] = compiled;
    if (isObject2(val)) {
      if (isRegExp(val.validate)) {
        compiled.validate = createValidator(val.validate);
      } else if (isFunction(val.validate)) {
        compiled.validate = val.validate;
      } else {
        schemaError(name, val);
      }
      if (isFunction(val.normalize)) {
        compiled.normalize = val.normalize;
      } else if (!val.normalize) {
        compiled.normalize = createNormalizer();
      } else {
        schemaError(name, val);
      }
      return;
    }
    if (isString2(val)) {
      aliases.push(name);
      return;
    }
    schemaError(name, val);
  });
  aliases.forEach(function(alias) {
    if (!self.__compiled__[self.__schemas__[alias]]) {
      return;
    }
    self.__compiled__[alias].validate = self.__compiled__[self.__schemas__[alias]].validate;
    self.__compiled__[alias].normalize = self.__compiled__[self.__schemas__[alias]].normalize;
  });
  self.__compiled__[""] = { validate: null, normalize: createNormalizer() };
  const slist = Object.keys(self.__compiled__).filter(function(name) {
    return name.length > 0 && self.__compiled__[name];
  }).map(escapeRE2).join("|");
  self.re.schema_test = RegExp("(^|(?!_)(?:[><\uFF5C]|" + re.src_ZPCc + "))(" + slist + ")", "i");
  self.re.schema_search = RegExp("(^|(?!_)(?:[><\uFF5C]|" + re.src_ZPCc + "))(" + slist + ")", "ig");
  self.re.schema_at_start = RegExp("^" + self.re.schema_search.source, "i");
  self.re.pretest = RegExp(
    "(" + self.re.schema_test.source + ")|(" + self.re.host_fuzzy_test.source + ")|@",
    "i"
  );
}
function Match(text2, schema2, index, lastIndex) {
  const raw = text2.slice(index, lastIndex);
  this.schema = schema2.toLowerCase();
  this.index = index;
  this.lastIndex = lastIndex;
  this.raw = raw;
  this.text = raw;
  this.url = raw;
}
function LinkifyIt(schemas, options) {
  if (!(this instanceof LinkifyIt)) {
    return new LinkifyIt(schemas, options);
  }
  if (!options) {
    if (isOptionsObj(schemas)) {
      options = schemas;
      schemas = {};
    }
  }
  this.__opts__ = assign2({}, defaultOptions, options);
  this.__schemas__ = assign2({}, defaultSchemas, schemas);
  this.__compiled__ = {};
  this.__tlds__ = tlds_default;
  this.__tlds_replaced__ = false;
  this.re = {};
  compile(this);
}
LinkifyIt.prototype.add = function add(schema2, definition) {
  this.__schemas__[schema2] = definition;
  compile(this);
  return this;
};
LinkifyIt.prototype.set = function set2(options) {
  this.__opts__ = assign2(this.__opts__, options);
  return this;
};
LinkifyIt.prototype.test = function test(text2) {
  if (!text2.length) {
    return false;
  }
  let m, re;
  if (this.re.schema_test.test(text2)) {
    re = this.re.schema_search;
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) {
      if (this.testSchemaAt(text2, m[2], re.lastIndex)) {
        return true;
      }
    }
  }
  if (this.__opts__.fuzzyLink && this.__compiled__["http:"]) {
    if (text2.search(this.re.host_fuzzy_test) >= 0) {
      if (text2.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy) !== null) {
        return true;
      }
    }
  }
  if (this.__opts__.fuzzyEmail && this.__compiled__["mailto:"]) {
    if (text2.indexOf("@") >= 0) {
      if (text2.match(this.re.email_fuzzy) !== null) {
        return true;
      }
    }
  }
  return false;
};
LinkifyIt.prototype.pretest = function pretest(text2) {
  return this.re.pretest.test(text2);
};
LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text2, schema2, pos) {
  if (!this.__compiled__[schema2.toLowerCase()]) {
    return 0;
  }
  return this.__compiled__[schema2.toLowerCase()].validate(text2, pos, this);
};
LinkifyIt.prototype.match = function match(text2) {
  const result = [];
  const type_schemed = [];
  const type_fuzzy_link = [];
  const type_fuzzy_email = [];
  let m, len, re;
  function choose(a, b) {
    if (!a) {
      return b;
    }
    if (!b) {
      return a;
    }
    if (a.index !== b.index) {
      return a.index < b.index ? a : b;
    }
    return a.lastIndex >= b.lastIndex ? a : b;
  }
  if (!text2.length) {
    return null;
  }
  if (this.re.schema_test.test(text2)) {
    re = this.re.schema_search;
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) {
      len = this.testSchemaAt(text2, m[2], re.lastIndex);
      if (len) {
        type_schemed.push({
          schema: m[2],
          index: m.index + m[1].length,
          lastIndex: m.index + m[0].length + len
        });
      }
    }
  }
  if (this.__opts__.fuzzyLink && this.__compiled__["http:"]) {
    re = this.__opts__.fuzzyIP ? this.re.link_fuzzy_global : this.re.link_no_ip_fuzzy_global;
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) {
      type_fuzzy_link.push({
        schema: "",
        index: m.index + m[1].length,
        lastIndex: m.index + m[0].length
      });
    }
  }
  if (this.__opts__.fuzzyEmail && this.__compiled__["mailto:"]) {
    re = this.re.email_fuzzy_global;
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) {
      type_fuzzy_email.push({
        schema: "mailto:",
        index: m.index + m[1].length,
        lastIndex: m.index + m[0].length
      });
    }
  }
  const indexes = [0, 0, 0];
  let lastIndex = 0;
  for (; ; ) {
    const candidates = [
      type_schemed[indexes[0]],
      type_fuzzy_email[indexes[1]],
      type_fuzzy_link[indexes[2]]
    ];
    const candidate = choose(choose(candidates[0], candidates[1]), candidates[2]);
    if (!candidate) {
      break;
    }
    if (candidate === candidates[0]) {
      indexes[0]++;
    } else if (candidate === candidates[1]) {
      indexes[1]++;
    } else {
      indexes[2]++;
    }
    if (candidate.index < lastIndex) {
      continue;
    }
    const match2 = new Match(text2, candidate.schema, candidate.index, candidate.lastIndex);
    this.__compiled__[match2.schema].normalize(match2, this);
    result.push(match2);
    lastIndex = candidate.lastIndex;
  }
  if (result.length) {
    return result;
  }
  return null;
};
LinkifyIt.prototype.matchAtStart = function matchAtStart(text2) {
  if (!text2.length) return null;
  const m = this.re.schema_at_start.exec(text2);
  if (!m) return null;
  const len = this.testSchemaAt(text2, m[2], m[0].length);
  if (!len) return null;
  const match2 = new Match(text2, m[2], m.index + m[1].length, m.index + m[0].length + len);
  this.__compiled__[match2.schema].normalize(match2, this);
  return match2;
};
LinkifyIt.prototype.tlds = function tlds(list2, keepOld) {
  list2 = Array.isArray(list2) ? list2 : [list2];
  if (!keepOld) {
    this.__tlds__ = list2.slice();
    this.__tlds_replaced__ = true;
    compile(this);
    return this;
  }
  this.__tlds__ = this.__tlds__.concat(list2).sort().filter(function(el, idx, arr) {
    return el !== arr[idx - 1];
  }).reverse();
  compile(this);
  return this;
};
LinkifyIt.prototype.normalize = function normalize3(match2) {
  if (!match2.schema) {
    match2.url = "http://" + match2.url;
  }
  if (match2.schema === "mailto:" && !/^mailto:/i.test(match2.url)) {
    match2.url = "mailto:" + match2.url;
  }
};
LinkifyIt.prototype.onCompile = function onCompile() {
};
var linkify_it_default = LinkifyIt;

// node_modules/markdown-it/lib/index.mjs
var import_punycode = __toESM(require_punycode(), 1);

// node_modules/markdown-it/lib/presets/default.mjs
var default_default = {
  options: {
    // Enable HTML tags in source
    html: false,
    // Use '/' to close single tags (<br />)
    xhtmlOut: false,
    // Convert '\n' in paragraphs into <br>
    breaks: false,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: false,
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "\u201C\u201D\u2018\u2019",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 100
  },
  components: {
    core: {},
    block: {},
    inline: {}
  }
};

// node_modules/markdown-it/lib/presets/zero.mjs
var zero_default = {
  options: {
    // Enable HTML tags in source
    html: false,
    // Use '/' to close single tags (<br />)
    xhtmlOut: false,
    // Convert '\n' in paragraphs into <br>
    breaks: false,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: false,
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "\u201C\u201D\u2018\u2019",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 20
  },
  components: {
    core: {
      rules: [
        "normalize",
        "block",
        "inline",
        "text_join"
      ]
    },
    block: {
      rules: [
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "text"
      ],
      rules2: [
        "balance_pairs",
        "fragments_join"
      ]
    }
  }
};

// node_modules/markdown-it/lib/presets/commonmark.mjs
var commonmark_default = {
  options: {
    // Enable HTML tags in source
    html: true,
    // Use '/' to close single tags (<br />)
    xhtmlOut: true,
    // Convert '\n' in paragraphs into <br>
    breaks: false,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: false,
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "\u201C\u201D\u2018\u2019",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 20
  },
  components: {
    core: {
      rules: [
        "normalize",
        "block",
        "inline",
        "text_join"
      ]
    },
    block: {
      rules: [
        "blockquote",
        "code",
        "fence",
        "heading",
        "hr",
        "html_block",
        "lheading",
        "list",
        "reference",
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "autolink",
        "backticks",
        "emphasis",
        "entity",
        "escape",
        "html_inline",
        "image",
        "link",
        "newline",
        "text"
      ],
      rules2: [
        "balance_pairs",
        "emphasis",
        "fragments_join"
      ]
    }
  }
};

// node_modules/markdown-it/lib/index.mjs
var config = {
  default: default_default,
  zero: zero_default,
  commonmark: commonmark_default
};
var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;
function validateLink(url) {
  const str2 = url.trim().toLowerCase();
  return BAD_PROTO_RE.test(str2) ? GOOD_DATA_RE.test(str2) : true;
}
var RECODE_HOSTNAME_FOR = ["http:", "https:", "mailto:"];
function normalizeLink(url) {
  const parsed = parse_default(url, true);
  if (parsed.hostname) {
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = import_punycode.default.toASCII(parsed.hostname);
      } catch (er) {
      }
    }
  }
  return encode_default(format(parsed));
}
function normalizeLinkText(url) {
  const parsed = parse_default(url, true);
  if (parsed.hostname) {
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = import_punycode.default.toUnicode(parsed.hostname);
      } catch (er) {
      }
    }
  }
  return decode_default(format(parsed), decode_default.defaultChars + "%");
}
function MarkdownIt(presetName, options) {
  if (!(this instanceof MarkdownIt)) {
    return new MarkdownIt(presetName, options);
  }
  if (!options) {
    if (!isString(presetName)) {
      options = presetName || {};
      presetName = "default";
    }
  }
  this.inline = new parser_inline_default();
  this.block = new parser_block_default();
  this.core = new parser_core_default();
  this.renderer = new renderer_default();
  this.linkify = new linkify_it_default();
  this.validateLink = validateLink;
  this.normalizeLink = normalizeLink;
  this.normalizeLinkText = normalizeLinkText;
  this.utils = utils_exports;
  this.helpers = assign({}, helpers_exports);
  this.options = {};
  this.configure(presetName);
  if (options) {
    this.set(options);
  }
}
MarkdownIt.prototype.set = function(options) {
  assign(this.options, options);
  return this;
};
MarkdownIt.prototype.configure = function(presets) {
  const self = this;
  if (isString(presets)) {
    const presetName = presets;
    presets = config[presetName];
    if (!presets) {
      throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name');
    }
  }
  if (!presets) {
    throw new Error("Wrong `markdown-it` preset, can't be empty");
  }
  if (presets.options) {
    self.set(presets.options);
  }
  if (presets.components) {
    Object.keys(presets.components).forEach(function(name) {
      if (presets.components[name].rules) {
        self[name].ruler.enableOnly(presets.components[name].rules);
      }
      if (presets.components[name].rules2) {
        self[name].ruler2.enableOnly(presets.components[name].rules2);
      }
    });
  }
  return this;
};
MarkdownIt.prototype.enable = function(list2, ignoreInvalid) {
  let result = [];
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  ["core", "block", "inline"].forEach(function(chain) {
    result = result.concat(this[chain].ruler.enable(list2, true));
  }, this);
  result = result.concat(this.inline.ruler2.enable(list2, true));
  const missed = list2.filter(function(name) {
    return result.indexOf(name) < 0;
  });
  if (missed.length && !ignoreInvalid) {
    throw new Error("MarkdownIt. Failed to enable unknown rule(s): " + missed);
  }
  return this;
};
MarkdownIt.prototype.disable = function(list2, ignoreInvalid) {
  let result = [];
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  ["core", "block", "inline"].forEach(function(chain) {
    result = result.concat(this[chain].ruler.disable(list2, true));
  }, this);
  result = result.concat(this.inline.ruler2.disable(list2, true));
  const missed = list2.filter(function(name) {
    return result.indexOf(name) < 0;
  });
  if (missed.length && !ignoreInvalid) {
    throw new Error("MarkdownIt. Failed to disable unknown rule(s): " + missed);
  }
  return this;
};
MarkdownIt.prototype.use = function(plugin) {
  const args = [this].concat(Array.prototype.slice.call(arguments, 1));
  plugin.apply(plugin, args);
  return this;
};
MarkdownIt.prototype.parse = function(src, env) {
  if (typeof src !== "string") {
    throw new Error("Input data should be a String");
  }
  const state = new this.core.State(src, this, env);
  this.core.process(state);
  return state.tokens;
};
MarkdownIt.prototype.render = function(src, env) {
  env = env || {};
  return this.renderer.render(this.parse(src, env), this.options, env);
};
MarkdownIt.prototype.parseInline = function(src, env) {
  const state = new this.core.State(src, this, env);
  state.inlineMode = true;
  this.core.process(state);
  return state.tokens;
};
MarkdownIt.prototype.renderInline = function(src, env) {
  env = env || {};
  return this.renderer.render(this.parseInline(src, env), this.options, env);
};
var lib_default = MarkdownIt;

// lib/knowledge-atlas/src/render/paths.ts
function filePathToSlug(filePath) {
  return filePath.replace(/\.(md|markdown|yaml|yml|json|txt)$/i, "").replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}
function buildSlugMap(fileIds) {
  const bases = /* @__PURE__ */ new Set();
  for (const id of fileIds) bases.add(filePathToSlug(id));
  const map2 = /* @__PURE__ */ new Map();
  const used = /* @__PURE__ */ new Set();
  for (const id of fileIds) {
    const base = filePathToSlug(id);
    let slug = base;
    if (used.has(slug)) {
      let n = 2;
      while (used.has(`${base}-${n}`) || bases.has(`${base}-${n}`)) n++;
      slug = `${base}-${n}`;
    }
    used.add(slug);
    map2.set(id, slug);
  }
  return map2;
}
function resolveSlug(fileId, allFileIds) {
  return buildSlugMap(allFileIds).get(fileId) ?? filePathToSlug(fileId);
}
function buildDocPageMap(fileIds) {
  const slugMap = buildSlugMap(fileIds);
  const map2 = /* @__PURE__ */ new Map();
  for (const [fileId, slug] of slugMap) {
    map2.set(fileId, `docs/${slug}.html`);
  }
  return map2;
}
function hrefToNode(fromRel, targetFileId, anchor, manifest) {
  const fileIds = manifest.files.map((f) => f.path);
  const targetRel = `docs/${resolveSlug(targetFileId, fileIds)}.html`;
  const rel = relativeFromTo(fromRel, targetRel);
  return anchor ? `${rel}#${anchor}` : rel;
}
function relativeFromTo(fromRel, toRel) {
  const fromDir = fromRel.includes("/") ? fromRel.slice(0, fromRel.lastIndexOf("/")) : "";
  const fromParts = fromDir ? fromDir.split("/") : [];
  const toParts = toRel.split("/");
  let i2 = 0;
  while (i2 < fromParts.length && i2 < toParts.length - 1 && fromParts[i2] === toParts[i2]) i2++;
  const up = fromParts.length - i2;
  const ups = up > 0 ? Array(up).fill("..") : [];
  const down = toParts.slice(i2);
  const joined = [...ups, ...down].join("/");
  return joined || toParts[toParts.length - 1];
}

// lib/knowledge-atlas/src/render/backlinks.ts
function gatherBacklinks(nodeId, edges, nodes) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const refs = [];
  for (const edge of edges) {
    if (edge.to !== nodeId) continue;
    if (edge.from === nodeId) continue;
    const srcNode = nodeMap.get(edge.from);
    if (srcNode) {
      refs.push({
        fromId: srcNode.id,
        fromLabel: srcNode.label,
        fromFileId: srcNode.fileId,
        fromAnchor: srcNode.anchor,
        kind: edge.kind
      });
    } else {
      const parts = edge.from.split("#");
      refs.push({
        fromId: edge.from,
        fromLabel: edge.from,
        fromFileId: parts[0] ?? edge.from,
        fromAnchor: parts[1],
        kind: edge.kind,
        dangling: true
      });
    }
  }
  const seen = /* @__PURE__ */ new Set();
  const deduped = [];
  for (const ref of refs) {
    const key = `${ref.fromId}::${ref.kind}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(ref);
    }
  }
  deduped.sort((a, b) => {
    if (a.fromId < b.fromId) return -1;
    if (a.fromId > b.fromId) return 1;
    if (a.kind < b.kind) return -1;
    if (a.kind > b.kind) return 1;
    return 0;
  });
  return deduped;
}
function esc2(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function renderBacklinksHtml(backlinks, manifest, fromRel = "docs/page.html") {
  if (backlinks.length === 0) return "";
  const docFileIds = new Set(manifest.files.map((f) => f.path));
  const items = backlinks.map((ref) => {
    const label = esc2(ref.fromLabel);
    const kind = esc2(ref.kind);
    const linkable = !ref.dangling && docFileIds.has(ref.fromFileId);
    if (!linkable) {
      return `<li><span class="backlink-dangling" aria-disabled="true">${label}</span> <span class="result-kind">${kind}</span></li>`;
    }
    const href = hrefToNode(fromRel, ref.fromFileId, ref.fromAnchor, manifest);
    return `<li><a href="${esc2(href)}">${label}</a> <span class="result-kind">${kind}</span></li>`;
  });
  return [
    '<section class="backlinks-section" aria-label="Backlinks">',
    "<h3>Referenced by</h3>",
    '<ul class="backlinks-list">',
    ...items,
    "</ul>",
    "</section>"
  ].join("\n");
}

// lib/knowledge-atlas/src/render/linkify.ts
var path5 = __toESM(require("path"));
var ENTITY_PATTERNS = [
  /\bNFR\d+\b/g,
  // NFR62, NFR12, etc.
  /\bFR\d+\b/g,
  // FR101, FR202
  /\bF\d+\b/g,
  // F1, F2 (capability)
  /\bEpic\s+\d+\b/g,
  // Epic 1, Epic 12
  /\bStory\s+\d+\.\d+\b/g,
  // Story 1.2, Story 12.5
  /\bbug-[\w-]+\b/g,
  // bug-null-pointer
  /\bP\d+-\d+\b/g,
  // P5-7, P3-1
  /\b\d+-\d+-[\w-]+\b/g,
  // 1-1-oauth2-integration
  /\bepic-\d+-retrospective\b/g
  // epic-1-retrospective
];
var COMBINED_PATTERN = new RegExp(
  ENTITY_PATTERNS.map((r) => r.source).join("|"),
  "g"
);
function parseHtmlSegments(html) {
  const segments = [];
  let i2 = 0;
  while (i2 < html.length) {
    const tagStart = html.indexOf("<", i2);
    if (tagStart === -1) {
      if (i2 < html.length) {
        segments.push({ type: "text", value: html.slice(i2) });
      }
      break;
    }
    if (tagStart > i2) {
      segments.push({ type: "text", value: html.slice(i2, tagStart) });
    }
    const tagEnd = html.indexOf(">", tagStart);
    if (tagEnd === -1) {
      segments.push({ type: "text", value: html.slice(tagStart) });
      break;
    }
    segments.push({ type: "tag", value: html.slice(tagStart, tagEnd + 1) });
    i2 = tagEnd + 1;
  }
  return segments;
}
function resolveHref(targetFileId, targetAnchor, currentFileId, slugMap) {
  const targetSlug = slugMap.get(targetFileId) ?? filePathToSlug(targetFileId);
  const currentSlug = slugMap.get(currentFileId) ?? filePathToSlug(currentFileId);
  const anchor = targetAnchor ? `#${targetAnchor}` : "";
  if (targetSlug === currentSlug) {
    return anchor || "#";
  }
  return `${targetSlug}.html${anchor}`;
}
function resolveToken(token, manifest, docFileIds) {
  const lower = token.toLowerCase().trim();
  for (const node of manifest.nodes) {
    if (node.label.toLowerCase() === lower && docFileIds.has(node.fileId)) {
      return { fileId: node.fileId, anchor: node.anchor };
    }
  }
  const tokenSlug = lower.replace(/\s+/g, "-").replace(/\./g, "-");
  for (const node of manifest.nodes) {
    if (!docFileIds.has(node.fileId)) continue;
    const idLower = node.id.toLowerCase();
    if (idLower.endsWith(`#${tokenSlug}`) || idLower.includes(`#${tokenSlug}`)) {
      return { fileId: node.fileId, anchor: node.anchor };
    }
  }
  return null;
}
function esc3(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function linkifyHtml(html, manifest, currentFileId) {
  if (!html || manifest.nodes.length === 0) return html;
  const docFileIds = new Set(manifest.files.map((f) => f.path));
  const slugMap = buildSlugMap(manifest.files.map((f) => f.path));
  const segments = parseHtmlSegments(html);
  let inCode = 0;
  let inPre = 0;
  let inA = 0;
  const parts = [];
  for (const seg of segments) {
    if (seg.type === "tag") {
      const tagLower = seg.value.toLowerCase();
      if (/^<code(\s|>)/i.test(seg.value)) inCode++;
      else if (/^<\/code\s*>/i.test(seg.value)) inCode = Math.max(0, inCode - 1);
      else if (/^<pre(\s|>)/i.test(seg.value)) inPre++;
      else if (/^<\/pre\s*>/i.test(seg.value)) inPre = Math.max(0, inPre - 1);
      else if (/^<a(\s|>)/i.test(seg.value)) inA++;
      else if (/^<\/a\s*>/i.test(seg.value)) inA = Math.max(0, inA - 1);
      void tagLower;
      parts.push(seg.value);
    } else {
      if (inCode > 0 || inPre > 0 || inA > 0) {
        parts.push(seg.value);
      } else {
        parts.push(linkifyText(seg.value, manifest, currentFileId, docFileIds, slugMap));
      }
    }
  }
  return parts.join("");
}
function linkifyText(text2, manifest, currentFileId, docFileIds, slugMap) {
  COMBINED_PATTERN.lastIndex = 0;
  let result = "";
  let last = 0;
  let match2;
  while ((match2 = COMBINED_PATTERN.exec(text2)) !== null) {
    const token = match2[0];
    const start = match2.index;
    result += text2.slice(last, start);
    last = start + token.length;
    const resolved = resolveToken(token, manifest, docFileIds);
    if (resolved) {
      const href = resolveHref(resolved.fileId, resolved.anchor, currentFileId, slugMap);
      result += `<a href="${esc3(href)}" class="entity-link">${esc3(token)}</a>`;
    } else {
      result += token;
    }
  }
  result += text2.slice(last);
  return result;
}
function decodeHrefEntities(value) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
}
function encodeHrefForAttr(value) {
  return value.replace(/&/g, "&amp;");
}
function resolveAuthoredHref(href, currentFileId, fileIdLookup, slugMap) {
  const trimmed = href.trim();
  if (trimmed === "") return null;
  if (/^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|#|\/\/)/.test(trimmed)) return null;
  if (trimmed.startsWith("/")) return null;
  const hashIdx = trimmed.indexOf("#");
  const rawPath = hashIdx === -1 ? trimmed : trimmed.slice(0, hashIdx);
  const fragment = hashIdx === -1 ? "" : trimmed.slice(hashIdx);
  if (rawPath === "") return null;
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    decodedPath = rawPath;
  }
  const currentDir = path5.posix.dirname(currentFileId);
  const joined = currentDir === "." ? decodedPath : `${currentDir}/${decodedPath}`;
  const resolved = path5.posix.normalize(joined).replace(/\/+$/, "");
  if (resolved === ".." || resolved.startsWith("../")) return null;
  const matchedFileId = fileIdLookup.get(resolved.toLowerCase());
  if (!matchedFileId) return null;
  const targetSlug = slugMap.get(matchedFileId);
  if (!targetSlug) return null;
  if (matchedFileId === currentFileId) {
    return fragment || "#";
  }
  return `${targetSlug}.html${fragment}`;
}
function rewriteAuthoredLinks(html, manifest, currentFileId) {
  if (!html) return html;
  const fileIds = manifest.files.map((f) => f.path);
  if (fileIds.length === 0) return html;
  const slugMap = buildSlugMap(fileIds);
  const fileIdLookup = /* @__PURE__ */ new Map();
  for (const id of fileIds) {
    const key = id.toLowerCase();
    if (!fileIdLookup.has(key)) fileIdLookup.set(key, id);
  }
  return html.replace(/<a\b[^>]*>/gi, (tag) => {
    const hrefMatch = tag.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    if (!hrefMatch) return tag;
    const usesDoubleQuote = hrefMatch[1] !== void 0;
    const rawAttrValue = usesDoubleQuote ? hrefMatch[1] : hrefMatch[2];
    const decoded = decodeHrefEntities(rawAttrValue);
    const rewritten = resolveAuthoredHref(decoded, currentFileId, fileIdLookup, slugMap);
    if (rewritten === null) return tag;
    const quote = usesDoubleQuote ? '"' : "'";
    const newAttr = `href=${quote}${encodeHrefForAttr(rewritten)}${quote}`;
    return tag.slice(0, hrefMatch.index) + newAttr + tag.slice(hrefMatch.index + hrefMatch[0].length);
  });
}
var ALLOWED_TAGS = /* @__PURE__ */ new Set([
  "p",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "em",
  "strong",
  "b",
  "i",
  "u",
  "s",
  "del",
  "ins",
  "mark",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "hr",
  "br",
  "div",
  "span",
  "section",
  "article",
  "nav",
  "header",
  "footer",
  "figure",
  "figcaption",
  "img",
  "picture",
  "source",
  "details",
  "summary",
  "abbr",
  "cite",
  "q",
  "sub",
  "sup",
  "kbd",
  "samp",
  "var",
  "dl",
  "dt",
  "dd"
]);
var CONTENT_REMOVAL_TAGS = /* @__PURE__ */ new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "label",
  "link",
  "meta",
  "base"
]);
function decodeForSchemeProbe(value) {
  return value.replace(/&#x([0-9a-f]+);?/gi, (_m, hex) => {
    const code2 = parseInt(hex, 16);
    return Number.isFinite(code2) ? String.fromCodePoint(code2) : "";
  }).replace(/&#(\d+);?/g, (_m, dec) => {
    const code2 = parseInt(dec, 10);
    return Number.isFinite(code2) ? String.fromCodePoint(code2) : "";
  }).replace(/&colon;/gi, ":").replace(/&tab;/gi, "	").replace(/&newline;/gi, "\n").replace(/&[a-z][a-z0-9]*;/gi, "").replace(/[\x00-\x20]+/g, "").toLowerCase();
}
function isSafeUrl(value) {
  const raw = value.trim();
  if (raw === "") return true;
  const v = decodeForSchemeProbe(raw);
  if (v === "") return true;
  if (/^[.\/#?]/.test(v)) return true;
  const colon = v.indexOf(":");
  if (colon === -1) return true;
  const slash = v.search(/[/?#]/);
  if (slash !== -1 && slash < colon) return true;
  const scheme = v.slice(0, colon);
  return scheme === "mailto" || scheme === "tel";
}
function sanitizeHtml(html) {
  if (!html) return html;
  let result = html.replace(/<!--[\s\S]*?-->/g, "");
  for (const tag of CONTENT_REMOVAL_TAGS) {
    const openRe = new RegExp(`<${tag}(?:\\s[^>]*)?>[\\s\\S]*?<\\/${tag}\\s*>`, "gi");
    const selfRe = new RegExp(`<${tag}(?:\\s[^>]*)?\\/?>`, "gi");
    result = result.replace(openRe, "");
    result = result.replace(selfRe, "");
  }
  result = result.replace(/<(!?\/?[\w:-]+)([^>]*)>/g, (fullMatch, tagName, attrs) => {
    if (tagName.startsWith("!")) return fullMatch;
    const lcTag = tagName.toLowerCase().replace(/^\//, "");
    const isClosing = tagName.startsWith("/");
    if (CONTENT_REMOVAL_TAGS.has(lcTag)) return "";
    if (!ALLOWED_TAGS.has(lcTag)) {
      return "";
    }
    if (isClosing) {
      return `</${lcTag}>`;
    }
    const safeAttrs = sanitizeAttributes(lcTag, attrs);
    return safeAttrs ? `<${lcTag} ${safeAttrs}>` : `<${lcTag}>`;
  });
  return result;
}
function sanitizeAttributes(tag, attrString) {
  const safeAttrs = [];
  const attrRe = /\s+([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let m;
  while ((m = attrRe.exec(attrString)) !== null) {
    const attrName = (m[1] ?? "").toLowerCase();
    const attrValue = m[2] ?? m[3] ?? m[4] ?? "";
    if (/^on/i.test(attrName)) continue;
    if (attrName === "href" || attrName === "src" || attrName === "action") {
      if (!isSafeUrl(attrValue.trim())) continue;
    }
    if (tag === "img") {
      const imgAllowed = /* @__PURE__ */ new Set(["src", "alt", "width", "height", "loading", "decoding", "title", "class", "id"]);
      if (!imgAllowed.has(attrName)) continue;
    }
    if (tag === "a") {
      const aAllowed = /* @__PURE__ */ new Set(["href", "title", "class", "id", "aria-label", "aria-describedby", "target", "rel"]);
      if (!aAllowed.has(attrName)) continue;
      if (attrName === "target" && attrValue === "_blank") {
        safeAttrs.push('rel="noopener noreferrer"');
      }
    }
    const generalAllowed = /^(class|id|role|lang|dir|title|aria-[\w-]+|data-[\w-]+|type|colspan|rowspan|scope|align|valign|width|height|alt|loading|decoding)$/;
    if (!generalAllowed.test(attrName) && tag !== "img" && tag !== "a") {
      if (!generalAllowed.test(attrName)) continue;
    }
    const val = attrValue.replace(/"/g, "&quot;");
    safeAttrs.push(`${attrName}="${val}"`);
  }
  return safeAttrs.join(" ");
}

// lib/knowledge-atlas/src/render/document.ts
var md = new lib_default({
  html: true,
  linkify: true,
  typographer: false
});
function esc4(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function fileTitle(filePath) {
  const base = filePath.split("/").pop() ?? filePath;
  return base.replace(/\.(md|yaml|json)$/i, "");
}
function renderStatusBadges(statuses) {
  if (!statuses || statuses.length === 0) return "";
  return statuses.map((s) => {
    const cls = `status-pill status-${s.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    return `<span class="${esc4(cls)}">${esc4(s)}</span>`;
  }).join(" ");
}
function extractToc(markdownContent) {
  const entries = [];
  const headingRe = /^(#{1,6})\s+(.+)$/gm;
  let m;
  while ((m = headingRe.exec(markdownContent)) !== null) {
    const level = m[1].length;
    const raw = m[2].trim();
    const forSlug = raw.replace(/`+/g, "");
    const text2 = forSlug;
    const slug = headingToSlug(forSlug);
    if (slug) {
      entries.push({ level, text: text2, slug });
    }
  }
  return entries;
}
function renderToc(entries) {
  if (entries.length < 3) return "";
  const items = entries.map((e) => {
    const indent = "  ".repeat(Math.max(0, e.level - 1));
    return `${indent}<li><a href="#${esc4(e.slug)}">${esc4(e.text)}</a></li>`;
  });
  return [
    '<nav class="toc" aria-label="Table of contents">',
    '<div class="toc-title">Contents</div>',
    "<ol>",
    ...items,
    "</ol>",
    "</nav>"
  ].join("\n");
}
function processMermaidFences(html) {
  let hasMermaid = false;
  const fenceRe = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/gi;
  const result = html.replace(fenceRe, (_match, codeContent) => {
    hasMermaid = true;
    return [
      '<figure class="mermaid-block" aria-label="Mermaid diagram">',
      `<pre class="mermaid">${codeContent.trim()}</pre>`,
      "</figure>"
    ].join("\n");
  });
  return { html: result, hasMermaid };
}
function addHeadingAnchors(html) {
  return html.replace(/<(h[1-6])>(.*?)<\/h[1-6]>/gi, (_match, tag, content) => {
    const plainText = content.replace(/<[^>]*>/g, "");
    const slug = headingToSlug(plainText);
    if (!slug) return _match;
    return `<${tag} id="${esc4(slug)}">${content}</${tag}>`;
  });
}
function getFileNodes(fileId, nodes) {
  return nodes.filter((n) => n.fileId === fileId);
}
function renderDocumentPage(fileRec, manifest, projectRoot, navFlags, resolveAbsPath) {
  const absPath = resolveAbsPath?.(fileRec.path) ?? path6.join(projectRoot, fileRec.path);
  const title = fileTitle(fileRec.path);
  if (/\.drawio(\.xml)?$/i.test(fileRec.path)) {
    return renderDrawioPage(fileRec, absPath, title, manifest, navFlags);
  }
  let rawContent = "";
  try {
    rawContent = fs6.readFileSync(absPath, "utf-8");
    rawContent = rawContent.replace(/\r\n/g, "\n");
  } catch {
    rawContent = `# ${title}

*(File not found: ${fileRec.path})*
`;
  }
  let markdownContent = rawContent;
  if (rawContent.startsWith("---\n")) {
    const endFm = rawContent.indexOf("\n---\n", 4);
    if (endFm !== -1) {
      markdownContent = rawContent.slice(endFm + 5);
    }
  }
  const tocEntries = extractToc(markdownContent);
  let renderedHtml = md.render(markdownContent);
  renderedHtml = addHeadingAnchors(renderedHtml);
  const { html: mermaidHtml, hasMermaid } = processMermaidFences(renderedHtml);
  renderedHtml = mermaidHtml;
  renderedHtml = rewriteAuthoredLinks(renderedHtml, manifest, fileRec.path);
  renderedHtml = linkifyHtml(renderedHtml, manifest, fileRec.path);
  renderedHtml = sanitizeHtml(renderedHtml);
  const fileIds = manifest.files.map((f) => f.path);
  const fromRel = `docs/${resolveSlug(fileRec.path, fileIds)}.html`;
  const fileNodes = getFileNodes(fileRec.path, manifest.nodes);
  let backlinksHtml = "";
  for (const node of fileNodes) {
    const bl = gatherBacklinks(node.id, manifest.edges, manifest.nodes);
    backlinksHtml += renderBacklinksHtml(bl, manifest, fromRel);
  }
  const tocHtml = renderToc(tocEntries);
  const statusBadgesHtml = renderStatusBadges(fileRec.statuses);
  const existingIds = /* @__PURE__ */ new Set();
  for (const m of renderedHtml.matchAll(/\sid="([^"]+)"/g)) existingIds.add(m[1]);
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const inlinePlacements = [];
  const fallbackAnchors = [];
  for (const node of fileNodes) {
    const a = node.anchor;
    if (!a || existingIds.has(a)) continue;
    existingIds.add(a);
    const ra = escRe(a);
    let m = new RegExp('<a\\b[^>]*href="[^"]*#' + ra + '"[^>]*>[^<]*</a>\\s*:', "i").exec(renderedHtml);
    if (!m) m = new RegExp('<a\\b[^>]*href="[^"]*#' + ra + '"', "i").exec(renderedHtml);
    if (m) inlinePlacements.push({ idx: m.index, anchor: a });
    else fallbackAnchors.push(a);
  }
  inlinePlacements.sort((x, y) => y.idx - x.idx);
  for (const p of inlinePlacements) {
    const span = `<span class="entity-anchor" id="${esc4(p.anchor)}"></span>`;
    renderedHtml = renderedHtml.slice(0, p.idx) + span + renderedHtml.slice(p.idx);
  }
  const anchorTargetsHtml = fallbackAnchors.map((a) => `<span class="entity-anchor" id="${esc4(a)}"></span>`).join("\n");
  const backLinkHtml = '<a class="back-link" href="../index.html">&larr; Back to Home</a>';
  const pageBody = [
    '<div class="content-wrap">',
    backLinkHtml,
    '<article class="doc-body">',
    statusBadgesHtml ? `<div class="doc-statuses" style="margin-bottom:0.75rem">${statusBadgesHtml}</div>` : "",
    anchorTargetsHtml,
    tocHtml,
    renderedHtml,
    backlinksHtml,
    "</article>",
    "</div>"
  ].filter(Boolean).join("\n");
  const scripts = [];
  if (hasMermaid) {
    scripts.push('<script src="../assets/mermaid.min.js"></script>');
    scripts.push(
      '<script>try{mermaid.initialize({startOnLoad:true,securityLevel:"strict",theme:"neutral"});}catch(e){}</script>'
    );
  }
  const html = pageShell({
    title,
    body: pageBody,
    manifest,
    pageType: "document",
    baseHref: "../",
    navFlags,
    scripts
  });
  const articleText = `${title} ${renderedHtml}`.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return { html, articleText, usedMermaid: hasMermaid, usedDrawio: false };
}
function renderDrawioPage(fileRec, absPath, title, manifest, navFlags) {
  let xml = "";
  try {
    xml = fs6.readFileSync(absPath, "utf-8").replace(/\r\n/g, "\n");
  } catch {
    xml = "";
  }
  const config2 = { highlight: "#3572b0", nav: true, resize: true, "toolbar-nohide": true, toolbar: "zoom layers", xml };
  const dataAttr = esc4(JSON.stringify(config2));
  const body = [
    '<div class="content-wrap">',
    '<a class="back-link" href="../index.html">&larr; Back to Home</a>',
    '<article class="doc-body">',
    `<h1>${esc4(title)}</h1>`,
    '<figure class="drawio-block" aria-label="draw.io diagram">',
    xml ? `<div class="mxgraph" style="max-width:100%;border:1px solid var(--border,#ddd);border-radius:6px" data-mxgraph="${dataAttr}"></div>` : "<p><em>(draw.io file could not be read.)</em></p>",
    '<noscript><p class="mermaid-note">This is a draw.io diagram; enable JavaScript to render it.</p></noscript>',
    "</figure>",
    "</article>",
    "</div>"
  ].filter(Boolean).join("\n");
  const scripts = [
    '<script>window.DRAWIO_BASE_URL=".";window.PROXY_URL=".";window.STYLE_PATH=".";window.RESOURCE_BASE=".";window.SHAPES_PATH=".";window.STENCIL_PATH=".";window.IMAGE_PATH=".";</script>',
    '<script src="../assets/drawio-viewer.min.js"></script>'
  ];
  const html = pageShell({
    title,
    body,
    manifest,
    pageType: "document",
    baseHref: "../",
    navFlags,
    scripts
  });
  return { html, articleText: title, usedMermaid: false, usedDrawio: true };
}

// lib/knowledge-atlas/src/render/vendor.ts
var fs7 = __toESM(require("fs"));
var path7 = __toESM(require("path"));
function vendorDir() {
  return path7.join(__dirname, "..", "vendor");
}
function readVendorAsset(name) {
  const p = path7.join(vendorDir(), name);
  try {
    return fs7.readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}
function writeVendorAsset(outDir, name) {
  const content = readVendorAsset(name);
  if (content == null) return null;
  const assetsDir = path7.join(outDir, "assets");
  fs7.mkdirSync(assetsDir, { recursive: true });
  fs7.writeFileSync(path7.join(assetsDir, name), content.replace(/\r\n/g, "\n"), { encoding: "utf-8" });
  return `assets/${name}`;
}

// lib/knowledge-atlas/src/render/search.ts
var lunr = require_lunr();
function esc5(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function fileDisplayName(filePath) {
  return filePath.split("/").pop()?.replace(/\.(md|markdown|yaml|yml|json|txt)$/i, "") ?? filePath;
}
function buildSearchDocs(manifest, docBodies) {
  const docs = [];
  const seen = /* @__PURE__ */ new Set();
  const slugMap = buildSlugMap(manifest.files.map((f) => f.path));
  const pageFor = (fileId) => slugMap.get(fileId);
  for (const file of manifest.files) {
    const docId = `file:${file.path}`;
    if (seen.has(docId)) continue;
    seen.add(docId);
    const bodyText = stripHtml(docBodies.get(file.path) ?? "");
    docs.push({
      id: docId,
      title: fileDisplayName(file.path),
      kind: file.type,
      fileId: file.path,
      body: bodyText.slice(0, 2e3),
      page: pageFor(file.path)
    });
  }
  for (const node of manifest.nodes) {
    const docId = `node:${node.id}`;
    if (seen.has(docId)) continue;
    seen.add(docId);
    docs.push({
      id: docId,
      title: node.label,
      kind: node.kind,
      fileId: node.fileId,
      anchor: node.anchor,
      body: [node.label, node.kind, node.title ?? ""].join(" ").trim(),
      page: pageFor(node.fileId)
    });
  }
  return docs;
}
function buildSearchIndex(manifest, docBodies) {
  const docs = buildSearchDocs(manifest, docBodies);
  const idx = lunr(function() {
    this.ref("id");
    this.field("title", { boost: 10 });
    this.field("kind", { boost: 3 });
    this.field("body");
    for (const doc of docs) {
      this.add(doc);
    }
  });
  const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const indexJson = safeJson(idx);
  const docsJson = safeJson(docs);
  return [
    "<script>",
    "window.__ATLAS_SEARCH__ = {",
    `  index: ${indexJson},`,
    `  docs: ${docsJson}`,
    "};",
    "</script>"
  ].join("\n");
}
var SEARCH_UI_SCRIPT = [
  "<script>",
  "(function(){",
  "  function getParam(name){",
  '    try { return new URLSearchParams(window.location.search).get(name) || ""; }',
  '    catch(e){ return ""; }',
  "  }",
  "  function filePathToSlug(p){",
  '    return p.replace(/\\.(md|markdown|yaml|yml|json|txt)$/i,"")',
  '            .replace(/[^a-zA-Z0-9]/g,"-").replace(/-+/g,"-")',
  '            .replace(/^-+|-+$/g,"");',
  "  }",
  "  function escHtml(s){",
  '    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")',
  '            .replace(/>/g,"&gt;").replace(/"/g,"&quot;");',
  "  }",
  "  function doSearch(query){",
  "    var d = window.__ATLAS_SEARCH__;",
  "    if(!d) return [];",
  "    var docsMap = {};",
  "    d.docs.forEach(function(doc){ docsMap[doc.id] = doc; });",
  '    if(typeof lunr !== "undefined"){',
  "      try {",
  "        var idx = lunr.Index.load(d.index);",
  "        return idx.search(query).map(function(r){ return docsMap[r.ref]; }).filter(Boolean);",
  "      } catch(e){ /* fall through to substring scan */ }",
  "    }",
  "    var q = query.toLowerCase();",
  "    return d.docs.filter(function(doc){",
  '      return (doc.title + " " + (doc.body || "")).toLowerCase().indexOf(q) !== -1;',
  "    });",
  "  }",
  "  function renderResults(results, query){",
  '    var el = document.getElementById("search-results");',
  '    var st = document.getElementById("search-status");',
  "    if(!el) return;",
  "    if(!results.length){",
  '      if(st) st.textContent = "No results for \\u201c" + query + "\\u201d";',
  '      el.innerHTML = "";',
  "      return;",
  "    }",
  '    if(st) st.textContent = results.length + " result" + (results.length===1?"":"s") + " for \\u201c" + query + "\\u201d";',
  "    el.innerHTML = results.slice(0,50).map(function(doc){",
  '      var slug = doc.page || (doc.fileId ? filePathToSlug(doc.fileId) : "");',
  '      var href = slug ? ("docs/" + slug + ".html" + (doc.anchor ? "#" + doc.anchor : "")) : "#";',
  '      var html = "<li><a href=\\"" + href + "\\">" + escHtml(doc.title) + "</a>";',
  '      if(doc.kind) html += " <span class=\\"result-kind\\">" + escHtml(doc.kind) + "</span>";',
  '      if(doc.body) html += "<p>" + escHtml(doc.body.slice(0,140)) + "\\u2026</p>";',
  '      html += "</li>";',
  "      return html;",
  '    }).join("");',
  "  }",
  '  document.addEventListener("DOMContentLoaded", function(){',
  '    var inp = document.getElementById("search-input");',
  '    var btn = document.getElementById("search-btn");',
  '    var nojs = document.getElementById("nojs-fallback");',
  '    if(nojs) nojs.style.display = "none";',
  '    var q = getParam("q");',
  "    if(inp) inp.value = q;",
  "    if(q) renderResults(doSearch(q), q);",
  "    function onSearch(){",
  '      var q2 = inp ? inp.value.trim() : "";',
  '      if(!q2){ renderResults([], ""); return; }',
  '      try { history.replaceState({}, "", "search.html?q=" + encodeURIComponent(q2)); } catch(e){}',
  "      renderResults(doSearch(q2), q2);",
  "    }",
  '    if(btn) btn.addEventListener("click", onSearch);',
  '    if(inp) inp.addEventListener("keydown", function(e){',
  '      if(e.key === "Enter"){ e.preventDefault(); onSearch(); }',
  "    });",
  "  });",
  "})();",
  "</script>"
].join("\n");
function renderSearchPageHtml(manifest, docBodies, navFlags) {
  const { projectTitle, generatedAt } = manifest;
  const escapedTitle = esc5(projectTitle);
  const escapedGeneratedAt = esc5(generatedAt);
  const indexScript = buildSearchIndex(manifest, docBodies);
  const lunrSrc = typeof __ATLAS_LUNR_JS__ === "string" ? __ATLAS_LUNR_JS__ : "";
  const lunrRuntime = lunrSrc.length > 0 ? `<script>${lunrSrc}</script>` : "";
  const fallbackSlugMap = buildSlugMap(manifest.files.map((f) => f.path));
  const fallbackItems = manifest.files.map((file) => {
    const slug = fallbackSlugMap.get(file.path) ?? filePathToSlug(file.path);
    const name = fileDisplayName(file.path);
    return `<li><a href="docs/${esc5(slug)}.html">${esc5(name)}</a> <span class="result-kind">${esc5(file.type)}</span></li>`;
  });
  const lines = [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>Search \u2014 ${escapedTitle} Knowledge Atlas</title>`,
    `<meta name="description" content="Search the ${escapedTitle} Knowledge Atlas offline">`,
    "<style>",
    DESIGN_SYSTEM_CSS.trimEnd(),
    "</style>",
    "</head>",
    '<body class="page-type-search">',
    '<a href="#main-content" class="skip-link">Skip to content</a>',
    '<div class="page-wrap">',
    '<nav class="site-nav" aria-label="Site navigation">',
    `<a href="index.html" class="nav-brand">${escapedTitle}</a>`,
    buildNavLinksHtml("", navFlags, "search"),
    "</nav>",
    '<main id="main-content" tabindex="-1">',
    '<div class="content-wrap">',
    "<h1>Search</h1>",
    '<div class="search-input-wrap">',
    '<input type="search" id="search-input" placeholder="Search documents and entities\u2026" aria-label="Search query" autofocus>',
    '<button id="search-btn" type="button">Search</button>',
    "</div>",
    '<p id="search-status" aria-live="polite"></p>',
    '<ul id="search-results" aria-label="Search results"></ul>',
    '<div id="nojs-fallback">',
    '<p class="no-js-note">Search requires JavaScript. All documents are listed below and remain fully navigable.</p>',
    '<ul class="doc-list">',
    ...fallbackItems,
    "</ul>",
    "</div>",
    "</div>",
    "</main>",
    `<footer class="atlas-footer" role="contentinfo">Knowledge Atlas \xB7 Generated at: ${escapedGeneratedAt}</footer>`,
    "</div>",
    indexScript,
    lunrRuntime,
    SEARCH_UI_SCRIPT,
    "</body>",
    "</html>",
    ""
    // trailing newline
  ];
  return lines.join("\n");
}

// lib/knowledge-atlas/src/render/site.ts
function esc6(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function writeHtml(filePath, content) {
  fs8.mkdirSync(path8.dirname(filePath), { recursive: true });
  fs8.writeFileSync(filePath, content.replace(/\r\n/g, "\n"), { encoding: "utf-8" });
}
function renderHomePage(manifest, navFlags) {
  const { projectTitle, generatedAt, counts, nodes, edges } = manifest;
  const escapedTitle = esc6(projectTitle);
  const totalFiles = counts["files"] ?? 0;
  const totalNodes = counts["nodes"] ?? 0;
  const totalEdges = counts["edges"] ?? 0;
  const kindCounts = {};
  for (const node of nodes) {
    kindCounts[node.kind] = (kindCounts[node.kind] ?? 0) + 1;
  }
  const statusCounts = {};
  for (const node of nodes) {
    if (node.status) {
      statusCounts[node.status] = (statusCounts[node.status] ?? 0) + 1;
    }
  }
  const connectedNodeIds = /* @__PURE__ */ new Set();
  for (const edge of edges) {
    if (!edge.dangling) {
      connectedNodeIds.add(edge.from);
      connectedNodeIds.add(edge.to);
    }
  }
  const orphanCount = nodes.filter((n) => !connectedNodeIds.has(n.id)).length;
  const statCardsHtml = [
    `<div class="stat-card"><span class="stat-num tabular">${totalFiles}</span><div class="stat-label">Documents</div></div>`,
    `<div class="stat-card"><span class="stat-num tabular">${totalNodes}</span><div class="stat-label">Entities</div></div>`,
    `<div class="stat-card"><span class="stat-num tabular">${totalEdges}</span><div class="stat-label">Relationships</div></div>`,
    `<div class="stat-card"><span class="stat-num tabular">${orphanCount}</span><div class="stat-label">Orphaned entities</div></div>`
  ].join("\n");
  const kindRows = Object.entries(kindCounts).sort(([, a], [, b]) => b - a).map(([kind, count]) => `<tr><td>${esc6(kind)}</td><td class="tabular">${count}</td></tr>`).join("\n");
  const kindTableHtml = kindRows ? [
    '<div class="atlas-table-wrap">',
    '<table class="atlas-table">',
    "<thead><tr><th>Entity kind</th><th>Count</th></tr></thead>",
    "<tbody>",
    kindRows,
    "</tbody>",
    "</table>",
    "</div>"
  ].join("\n") : '<p class="meta">No entities found.</p>';
  const statusRows = Object.entries(statusCounts).sort(([, a], [, b]) => b - a).map(([status, count]) => {
    const cls = `status-pill status-${status.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    return `<tr><td><span class="${esc6(cls)}">${esc6(status)}</span></td><td class="tabular">${count}</td></tr>`;
  }).join("\n");
  const statusTableHtml = statusRows ? [
    '<div class="atlas-table-wrap">',
    '<table class="atlas-table">',
    "<thead><tr><th>Status</th><th>Count</th></tr></thead>",
    "<tbody>",
    statusRows,
    "</tbody>",
    "</table>",
    "</div>"
  ].join("\n") : '<p class="meta">No status data.</p>';
  const homeSlugMap = buildSlugMap(manifest.files.map((f) => f.path));
  const filesByType = {};
  for (const file of manifest.files) {
    const t = file.type ?? "unknown";
    if (!filesByType[t]) filesByType[t] = [];
    filesByType[t].push(file);
  }
  const docListParts = [];
  for (const [type2, files] of Object.entries(filesByType).sort(([a], [b]) => a.localeCompare(b))) {
    const items = files.map((f) => {
      const slug = homeSlugMap.get(f.path) ?? filePathToSlug(f.path);
      const name = f.path.split("/").pop()?.replace(/\.(md|yaml|json)$/i, "") ?? f.path;
      const badges = (f.statuses ?? []).map((s) => {
        const cls = `status-pill status-${s.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
        return `<span class="${esc6(cls)}">${esc6(s)}</span>`;
      }).join(" ");
      return `<li><a href="docs/${esc6(slug)}.html">${esc6(name)}</a> ${badges}</li>`;
    }).join("\n");
    docListParts.push(
      `<div class="card">`,
      `<h2>${esc6(type2)}</h2>`,
      `<ul>`,
      items,
      `</ul>`,
      `</div>`
    );
  }
  const docListHtml = docListParts.join("\n") || "<p>No documents found. Run BMAD workflows to generate content.</p>";
  const heroHtml = [
    '<div class="hero">',
    `<h1>${escapedTitle}</h1>`,
    `<p class="subtitle">Knowledge Atlas \u2014 your project's living documentation graph</p>`,
    "</div>"
  ].join("\n");
  const healthSnapshotHtml = [
    '<div class="card">',
    "<h2>Health snapshot</h2>",
    '<div class="card-grid">',
    statCardsHtml,
    "</div>",
    "<h3>Entities by kind</h3>",
    kindTableHtml,
    ...statusRows ? ["<h3>Status distribution</h3>", statusTableHtml] : [],
    "</div>"
  ].join("\n");
  const graphNavItem = navFlags.hasGraphPage ? '<li><a href="graph.html">Explore the knowledge graph</a></li>' : "";
  const diagramsNavItem = navFlags.hasDiagramsPage ? '<li><a href="diagrams.html">View generated diagrams</a></li>' : "";
  const orphansNavItem = navFlags.hasOrphansPage ? '<li><a href="orphans.html">View orphans &amp; gaps</a></li>' : "";
  const quickNavHtml = [
    '<div class="card">',
    "<h2>Navigation</h2>",
    "<ul>",
    '<li><a href="search.html">Search all documents and entities</a></li>',
    graphNavItem,
    diagramsNavItem,
    orphansNavItem,
    "</ul>",
    "</div>"
  ].filter(Boolean).join("\n");
  const body = [
    heroHtml,
    '<div class="content-wrap">',
    quickNavHtml,
    healthSnapshotHtml,
    "<h2>Documents</h2>",
    docListHtml,
    "</div>"
  ].join("\n");
  return pageShell({
    title: projectTitle,
    body,
    manifest,
    pageType: "home",
    navFlags
    // scripts intentionally omitted → home page has zero JS
  });
}
function renderSite(manifest, outDir, resolveAbsPath) {
  const written = [];
  const docBodies = /* @__PURE__ */ new Map();
  fs8.mkdirSync(outDir, { recursive: true });
  fs8.mkdirSync(path8.join(outDir, "docs"), { recursive: true });
  const fileIds = manifest.files.map((f) => f.path);
  const slugMap = buildSlugMap(fileIds);
  const navFlags = {
    hasGraphPage: fs8.existsSync(path8.join(outDir, "graph.html")),
    hasDiagramsPage: fs8.existsSync(path8.join(outDir, "diagrams.html")),
    hasOrphansPage: fs8.existsSync(path8.join(outDir, "orphans.html"))
  };
  let anyMermaid = false;
  let anyDrawio = false;
  for (const file of manifest.files) {
    const slug = slugMap.get(file.path) ?? filePathToSlug(file.path);
    const { html, articleText, usedMermaid, usedDrawio } = renderDocumentPage(file, manifest, manifest.projectRoot, navFlags, resolveAbsPath);
    const relPath = `docs/${slug}.html`;
    writeHtml(path8.join(outDir, relPath), html);
    written.push(relPath);
    if (usedMermaid) anyMermaid = true;
    if (usedDrawio) anyDrawio = true;
    docBodies.set(file.path, articleText);
  }
  if (anyMermaid) {
    const rel = writeVendorAsset(outDir, "mermaid.min.js");
    if (rel) written.push(rel);
  }
  if (anyDrawio) {
    const rel = writeVendorAsset(outDir, "drawio-viewer.min.js");
    if (rel) written.push(rel);
  }
  const searchHtml = renderSearchPageHtml(manifest, docBodies, navFlags);
  writeHtml(path8.join(outDir, "search.html"), searchHtml);
  written.push("search.html");
  const indexHtml = renderHomePage(manifest, navFlags);
  writeHtml(path8.join(outDir, "index.html"), indexHtml);
  written.push("index.html");
  return written.sort();
}

// lib/knowledge-atlas/src/render/graph.ts
var fs9 = __toESM(require("fs"));
var path9 = __toESM(require("path"));

// lib/knowledge-atlas/src/render/force-graph-umd.ts
var FORCE_GRAPH_UMD = `// Version 1.51.4 force-graph - https://github.com/vasturiano/force-graph
!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n():"function"==typeof define&&define.amd?define(n):(t="undefined"!=typeof globalThis?globalThis:t||self).ForceGraph=n()}(this,function(){"use strict";function n(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=Array(n);e<n;e++)r[e]=t[e];return r}function e(t,n,e){if(i())return Reflect.construct.apply(null,arguments);var r=[null];return r.push.apply(r,n),new(t.bind.apply(t,r))}function r(t,n,e){return(n=function(t){var n=function(t,n){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var r=e.call(t,n);if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===n?String:Number)(t)}(t,"string");return"symbol"==typeof n?n:n+""}(n))in t?Object.defineProperty(t,n,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[n]=e,t}function i(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}))}catch(t){}return(i=function(){return!!t})()}function o(t,n){var e=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);n&&(r=r.filter(function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable})),e.push.apply(e,r)}return e}function a(t){for(var n=1;n<arguments.length;n++){var e=null!=arguments[n]?arguments[n]:{};n%2?o(Object(e),!0).forEach(function(n){r(t,n,e[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(e)):o(Object(e)).forEach(function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(e,n))})}return t}function u(t,n){return function(t){if(Array.isArray(t))return t}(t)||function(t,n){var e=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=e){var r,i,o,a,u=[],s=!0,l=!1;try{if(o=(e=e.call(t)).next,0===n);else for(;!(s=(r=o.call(e)).done)&&(u.push(r.value),u.length!==n);s=!0);}catch(t){l=!0,i=t}finally{try{if(!s&&null!=e.return&&(a=e.return(),Object(a)!==a))return}finally{if(l)throw i}}return u}}(t,n)||c(t,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function s(t){return function(t){if(Array.isArray(t))return n(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||c(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(t){return l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},l(t)}function c(t,e){if(t){if("string"==typeof t)return n(t,e);var r={}.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?n(t,e):void 0}}!function(t,n){void 0===n&&(n={});var e=n.insertAt;if("undefined"!=typeof document){var r=document.head||document.getElementsByTagName("head")[0],i=document.createElement("style");i.type="text/css","top"===e&&r.firstChild?r.insertBefore(i,r.firstChild):r.appendChild(i),i.styleSheet?i.styleSheet.cssText=t:i.appendChild(document.createTextNode(t))}}(".force-graph-container canvas {\\n  display: block;\\n  user-select: none;\\n  outline: none;\\n  -webkit-tap-highlight-color: transparent;\\n}\\n\\n.force-graph-container .clickable {\\n  cursor: pointer;\\n}\\n\\n.force-graph-container .grabbable {\\n  cursor: move;\\n  cursor: grab;\\n  cursor: -moz-grab;\\n  cursor: -webkit-grab;\\n}\\n\\n.force-graph-container .grabbable:active {\\n  cursor: grabbing;\\n  cursor: -moz-grabbing;\\n  cursor: -webkit-grabbing;\\n}\\n");var h="http://www.w3.org/1999/xhtml",f={svg:"http://www.w3.org/2000/svg",xhtml:h,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function p(t){var n=t+="",e=n.indexOf(":");return e>=0&&"xmlns"!==(n=t.slice(0,e))&&(t=t.slice(e+1)),f.hasOwnProperty(n)?{space:f[n],local:t}:t}function d(t){return function(){var n=this.ownerDocument,e=this.namespaceURI;return e===h&&n.documentElement.namespaceURI===h?n.createElement(t):n.createElementNS(e,t)}}function g(t){return function(){return this.ownerDocument.createElementNS(t.space,t.local)}}function _(t){var n=p(t);return(n.local?g:d)(n)}function y(){}function v(t){return null==t?y:function(){return this.querySelector(t)}}function m(){return[]}function x(t){return null==t?m:function(){return this.querySelectorAll(t)}}function b(t){return function(){return function(t){return null==t?[]:Array.isArray(t)?t:Array.from(t)}(t.apply(this,arguments))}}function w(t){return function(){return this.matches(t)}}function k(t){return function(n){return n.matches(t)}}var M=Array.prototype.find;function A(){return this.firstElementChild}var z=Array.prototype.filter;function S(){return Array.from(this.children)}function C(t){return new Array(t.length)}function E(t,n){this.ownerDocument=t.ownerDocument,this.namespaceURI=t.namespaceURI,this._next=null,this._parent=t,this.__data__=n}function P(t,n,e,r,i,o){for(var a,u=0,s=n.length,l=o.length;u<l;++u)(a=n[u])?(a.__data__=o[u],r[u]=a):e[u]=new E(t,o[u]);for(;u<s;++u)(a=n[u])&&(i[u]=a)}function O(t,n,e,r,i,o,a){var u,s,l,c=new Map,h=n.length,f=o.length,p=new Array(h);for(u=0;u<h;++u)(s=n[u])&&(p[u]=l=a.call(s,s.__data__,u,n)+"",c.has(l)?i[u]=s:c.set(l,s));for(u=0;u<f;++u)l=a.call(t,o[u],u,o)+"",(s=c.get(l))?(r[u]=s,s.__data__=o[u],c.delete(l)):e[u]=new E(t,o[u]);for(u=0;u<h;++u)(s=n[u])&&c.get(p[u])===s&&(i[u]=s)}function N(t){return t.__data__}function j(t){return"object"==typeof t&&"length"in t?t:Array.from(t)}function T(t,n){return t<n?-1:t>n?1:t>=n?0:NaN}function R(t){return function(){this.removeAttribute(t)}}function D(t){return function(){this.removeAttributeNS(t.space,t.local)}}function I(t,n){return function(){this.setAttribute(t,n)}}function U(t,n){return function(){this.setAttributeNS(t.space,t.local,n)}}function F(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttribute(t):this.setAttribute(t,e)}}function L(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttributeNS(t.space,t.local):this.setAttributeNS(t.space,t.local,e)}}function q(t){return t.ownerDocument&&t.ownerDocument.defaultView||t.document&&t||t.defaultView}function $(t){return function(){this.style.removeProperty(t)}}function B(t,n,e){return function(){this.style.setProperty(t,n,e)}}function H(t,n,e){return function(){var r=n.apply(this,arguments);null==r?this.style.removeProperty(t):this.style.setProperty(t,r,e)}}function V(t,n){return t.style.getPropertyValue(n)||q(t).getComputedStyle(t,null).getPropertyValue(n)}function X(t){return function(){delete this[t]}}function G(t,n){return function(){this[t]=n}}function Y(t,n){return function(){var e=n.apply(this,arguments);null==e?delete this[t]:this[t]=e}}function W(t){return t.trim().split(/^|\\s+/)}function Z(t){return t.classList||new Q(t)}function Q(t){this._node=t,this._names=W(t.getAttribute("class")||"")}function K(t,n){for(var e=Z(t),r=-1,i=n.length;++r<i;)e.add(n[r])}function J(t,n){for(var e=Z(t),r=-1,i=n.length;++r<i;)e.remove(n[r])}function tt(t){return function(){K(this,t)}}function nt(t){return function(){J(this,t)}}function et(t,n){return function(){(n.apply(this,arguments)?K:J)(this,t)}}function rt(){this.textContent=""}function it(t){return function(){this.textContent=t}}function ot(t){return function(){var n=t.apply(this,arguments);this.textContent=null==n?"":n}}function at(){this.innerHTML=""}function ut(t){return function(){this.innerHTML=t}}function st(t){return function(){var n=t.apply(this,arguments);this.innerHTML=null==n?"":n}}function lt(){this.nextSibling&&this.parentNode.appendChild(this)}function ct(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function ht(){return null}function ft(){var t=this.parentNode;t&&t.removeChild(this)}function pt(){var t=this.cloneNode(!1),n=this.parentNode;return n?n.insertBefore(t,this.nextSibling):t}function dt(){var t=this.cloneNode(!0),n=this.parentNode;return n?n.insertBefore(t,this.nextSibling):t}function gt(t){return function(){var n=this.__on;if(n){for(var e,r=0,i=-1,o=n.length;r<o;++r)e=n[r],t.type&&e.type!==t.type||e.name!==t.name?n[++i]=e:this.removeEventListener(e.type,e.listener,e.options);++i?n.length=i:delete this.__on}}}function _t(t,n,e){return function(){var r,i=this.__on,o=function(t){return function(n){t.call(this,n,this.__data__)}}(n);if(i)for(var a=0,u=i.length;a<u;++a)if((r=i[a]).type===t.type&&r.name===t.name)return this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=o,r.options=e),void(r.value=n);this.addEventListener(t.type,o,e),r={type:t.type,name:t.name,value:n,listener:o,options:e},i?i.push(r):this.__on=[r]}}function yt(t,n,e){var r=q(t),i=r.CustomEvent;"function"==typeof i?i=new i(n,e):(i=r.document.createEvent("Event"),e?(i.initEvent(n,e.bubbles,e.cancelable),i.detail=e.detail):i.initEvent(n,!1,!1)),t.dispatchEvent(i)}function vt(t,n){return function(){return yt(this,t,n)}}function mt(t,n){return function(){return yt(this,t,n.apply(this,arguments))}}E.prototype={constructor:E,appendChild:function(t){return this._parent.insertBefore(t,this._next)},insertBefore:function(t,n){return this._parent.insertBefore(t,n)},querySelector:function(t){return this._parent.querySelector(t)},querySelectorAll:function(t){return this._parent.querySelectorAll(t)}},Q.prototype={add:function(t){this._names.indexOf(t)<0&&(this._names.push(t),this._node.setAttribute("class",this._names.join(" ")))},remove:function(t){var n=this._names.indexOf(t);n>=0&&(this._names.splice(n,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(t){return this._names.indexOf(t)>=0}};var xt=[null];function bt(t,n){this._groups=t,this._parents=n}function wt(){return new bt([[document.documentElement]],xt)}function kt(t){return"string"==typeof t?new bt([[document.querySelector(t)]],[document.documentElement]):new bt([[t]],xt)}function Mt(t,n){if(t=function(t){let n;for(;n=t.sourceEvent;)t=n;return t}(t),void 0===n&&(n=t.currentTarget),n){var e=n.ownerSVGElement||n;if(e.createSVGPoint){var r=e.createSVGPoint();return r.x=t.clientX,r.y=t.clientY,[(r=r.matrixTransform(n.getScreenCTM().inverse())).x,r.y]}if(n.getBoundingClientRect){var i=n.getBoundingClientRect();return[t.clientX-i.left-n.clientLeft,t.clientY-i.top-n.clientTop]}}return[t.pageX,t.pageY]}bt.prototype=wt.prototype={constructor:bt,select:function(t){"function"!=typeof t&&(t=v(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,a,u=n[i],s=u.length,l=r[i]=new Array(s),c=0;c<s;++c)(o=u[c])&&(a=t.call(o,o.__data__,c,u))&&("__data__"in o&&(a.__data__=o.__data__),l[c]=a);return new bt(r,this._parents)},selectAll:function(t){t="function"==typeof t?b(t):x(t);for(var n=this._groups,e=n.length,r=[],i=[],o=0;o<e;++o)for(var a,u=n[o],s=u.length,l=0;l<s;++l)(a=u[l])&&(r.push(t.call(a,a.__data__,l,u)),i.push(a));return new bt(r,i)},selectChild:function(t){return this.select(null==t?A:function(t){return function(){return M.call(this.children,t)}}("function"==typeof t?t:k(t)))},selectChildren:function(t){return this.selectAll(null==t?S:function(t){return function(){return z.call(this.children,t)}}("function"==typeof t?t:k(t)))},filter:function(t){"function"!=typeof t&&(t=w(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,a=n[i],u=a.length,s=r[i]=[],l=0;l<u;++l)(o=a[l])&&t.call(o,o.__data__,l,a)&&s.push(o);return new bt(r,this._parents)},data:function(t,n){if(!arguments.length)return Array.from(this,N);var e=n?O:P,r=this._parents,i=this._groups;"function"!=typeof t&&(t=function(t){return function(){return t}}(t));for(var o=i.length,a=new Array(o),u=new Array(o),s=new Array(o),l=0;l<o;++l){var c=r[l],h=i[l],f=h.length,p=j(t.call(c,c&&c.__data__,l,r)),d=p.length,g=u[l]=new Array(d),_=a[l]=new Array(d);e(c,h,g,_,s[l]=new Array(f),p,n);for(var y,v,m=0,x=0;m<d;++m)if(y=g[m]){for(m>=x&&(x=m+1);!(v=_[x])&&++x<d;);y._next=v||null}}return(a=new bt(a,r))._enter=u,a._exit=s,a},enter:function(){return new bt(this._enter||this._groups.map(C),this._parents)},exit:function(){return new bt(this._exit||this._groups.map(C),this._parents)},join:function(t,n,e){var r=this.enter(),i=this,o=this.exit();return"function"==typeof t?(r=t(r))&&(r=r.selection()):r=r.append(t+""),null!=n&&(i=n(i))&&(i=i.selection()),null==e?o.remove():e(o),r&&i?r.merge(i).order():i},merge:function(t){for(var n=t.selection?t.selection():t,e=this._groups,r=n._groups,i=e.length,o=r.length,a=Math.min(i,o),u=new Array(i),s=0;s<a;++s)for(var l,c=e[s],h=r[s],f=c.length,p=u[s]=new Array(f),d=0;d<f;++d)(l=c[d]||h[d])&&(p[d]=l);for(;s<i;++s)u[s]=e[s];return new bt(u,this._parents)},selection:function(){return this},order:function(){for(var t=this._groups,n=-1,e=t.length;++n<e;)for(var r,i=t[n],o=i.length-1,a=i[o];--o>=0;)(r=i[o])&&(a&&4^r.compareDocumentPosition(a)&&a.parentNode.insertBefore(r,a),a=r);return this},sort:function(t){function n(n,e){return n&&e?t(n.__data__,e.__data__):!n-!e}t||(t=T);for(var e=this._groups,r=e.length,i=new Array(r),o=0;o<r;++o){for(var a,u=e[o],s=u.length,l=i[o]=new Array(s),c=0;c<s;++c)(a=u[c])&&(l[c]=a);l.sort(n)}return new bt(i,this._parents).order()},call:function(){var t=arguments[0];return arguments[0]=this,t.apply(null,arguments),this},nodes:function(){return Array.from(this)},node:function(){for(var t=this._groups,n=0,e=t.length;n<e;++n)for(var r=t[n],i=0,o=r.length;i<o;++i){var a=r[i];if(a)return a}return null},size:function(){let t=0;for(const n of this)++t;return t},empty:function(){return!this.node()},each:function(t){for(var n=this._groups,e=0,r=n.length;e<r;++e)for(var i,o=n[e],a=0,u=o.length;a<u;++a)(i=o[a])&&t.call(i,i.__data__,a,o);return this},attr:function(t,n){var e=p(t);if(arguments.length<2){var r=this.node();return e.local?r.getAttributeNS(e.space,e.local):r.getAttribute(e)}return this.each((null==n?e.local?D:R:"function"==typeof n?e.local?L:F:e.local?U:I)(e,n))},style:function(t,n,e){return arguments.length>1?this.each((null==n?$:"function"==typeof n?H:B)(t,n,null==e?"":e)):V(this.node(),t)},property:function(t,n){return arguments.length>1?this.each((null==n?X:"function"==typeof n?Y:G)(t,n)):this.node()[t]},classed:function(t,n){var e=W(t+"");if(arguments.length<2){for(var r=Z(this.node()),i=-1,o=e.length;++i<o;)if(!r.contains(e[i]))return!1;return!0}return this.each(("function"==typeof n?et:n?tt:nt)(e,n))},text:function(t){return arguments.length?this.each(null==t?rt:("function"==typeof t?ot:it)(t)):this.node().textContent},html:function(t){return arguments.length?this.each(null==t?at:("function"==typeof t?st:ut)(t)):this.node().innerHTML},raise:function(){return this.each(lt)},lower:function(){return this.each(ct)},append:function(t){var n="function"==typeof t?t:_(t);return this.select(function(){return this.appendChild(n.apply(this,arguments))})},insert:function(t,n){var e="function"==typeof t?t:_(t),r=null==n?ht:"function"==typeof n?n:v(n);return this.select(function(){return this.insertBefore(e.apply(this,arguments),r.apply(this,arguments)||null)})},remove:function(){return this.each(ft)},clone:function(t){return this.select(t?dt:pt)},datum:function(t){return arguments.length?this.property("__data__",t):this.node().__data__},on:function(t,n,e){var r,i,o=function(t){return t.trim().split(/^|\\s+/).map(function(t){var n="",e=t.indexOf(".");return e>=0&&(n=t.slice(e+1),t=t.slice(0,e)),{type:t,name:n}})}(t+""),a=o.length;if(!(arguments.length<2)){for(u=n?_t:gt,r=0;r<a;++r)this.each(u(o[r],n,e));return this}var u=this.node().__on;if(u)for(var s,l=0,c=u.length;l<c;++l)for(r=0,s=u[l];r<a;++r)if((i=o[r]).type===s.type&&i.name===s.name)return s.value},dispatch:function(t,n){return this.each(("function"==typeof n?mt:vt)(t,n))},[Symbol.iterator]:function*(){for(var t=this._groups,n=0,e=t.length;n<e;++n)for(var r,i=t[n],o=0,a=i.length;o<a;++o)(r=i[o])&&(yield r)}};var At={value:()=>{}};function zt(){for(var t,n=0,e=arguments.length,r={};n<e;++n){if(!(t=arguments[n]+"")||t in r||/[\\s.]/.test(t))throw new Error("illegal type: "+t);r[t]=[]}return new St(r)}function St(t){this._=t}function Ct(t,n){for(var e,r=0,i=t.length;r<i;++r)if((e=t[r]).name===n)return e.value}function Et(t,n,e){for(var r=0,i=t.length;r<i;++r)if(t[r].name===n){t[r]=At,t=t.slice(0,r).concat(t.slice(r+1));break}return null!=e&&t.push({name:n,value:e}),t}St.prototype=zt.prototype={constructor:St,on:function(t,n){var e,r,i=this._,o=(r=i,(t+"").trim().split(/^|\\s+/).map(function(t){var n="",e=t.indexOf(".");if(e>=0&&(n=t.slice(e+1),t=t.slice(0,e)),t&&!r.hasOwnProperty(t))throw new Error("unknown type: "+t);return{type:t,name:n}})),a=-1,u=o.length;if(!(arguments.length<2)){if(null!=n&&"function"!=typeof n)throw new Error("invalid callback: "+n);for(;++a<u;)if(e=(t=o[a]).type)i[e]=Et(i[e],t.name,n);else if(null==n)for(e in i)i[e]=Et(i[e],t.name,null);return this}for(;++a<u;)if((e=(t=o[a]).type)&&(e=Ct(i[e],t.name)))return e},copy:function(){var t={},n=this._;for(var e in n)t[e]=n[e].slice();return new St(t)},call:function(t,n){if((e=arguments.length-2)>0)for(var e,r,i=new Array(e),o=0;o<e;++o)i[o]=arguments[o+2];if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(o=0,e=(r=this._[t]).length;o<e;++o)r[o].value.apply(n,i)},apply:function(t,n,e){if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(var r=this._[t],i=0,o=r.length;i<o;++i)r[i].value.apply(n,e)}};const Pt={passive:!1},Ot={capture:!0,passive:!1};function Nt(t){t.stopImmediatePropagation()}function jt(t){t.preventDefault(),t.stopImmediatePropagation()}function Tt(t){var n=t.document.documentElement,e=kt(t).on("dragstart.drag",jt,Ot);"onselectstart"in n?e.on("selectstart.drag",jt,Ot):(n.__noselect=n.style.MozUserSelect,n.style.MozUserSelect="none")}function Rt(t,n){var e=t.document.documentElement,r=kt(t).on("dragstart.drag",null);n&&(r.on("click.drag",jt,Ot),setTimeout(function(){r.on("click.drag",null)},0)),"onselectstart"in e?r.on("selectstart.drag",null):(e.style.MozUserSelect=e.__noselect,delete e.__noselect)}var Dt=t=>()=>t;function It(t,{sourceEvent:n,subject:e,target:r,identifier:i,active:o,x:a,y:u,dx:s,dy:l,dispatch:c}){Object.defineProperties(this,{type:{value:t,enumerable:!0,configurable:!0},sourceEvent:{value:n,enumerable:!0,configurable:!0},subject:{value:e,enumerable:!0,configurable:!0},target:{value:r,enumerable:!0,configurable:!0},identifier:{value:i,enumerable:!0,configurable:!0},active:{value:o,enumerable:!0,configurable:!0},x:{value:a,enumerable:!0,configurable:!0},y:{value:u,enumerable:!0,configurable:!0},dx:{value:s,enumerable:!0,configurable:!0},dy:{value:l,enumerable:!0,configurable:!0},_:{value:c}})}function Ut(t){return!t.ctrlKey&&!t.button}function Ft(){return this.parentNode}function Lt(t,n){return null==n?{x:t.x,y:t.y}:n}function qt(){return navigator.maxTouchPoints||"ontouchstart"in this}function $t(t,n,e){t.prototype=n.prototype=e,e.constructor=t}function Bt(t,n){var e=Object.create(t.prototype);for(var r in n)e[r]=n[r];return e}function Ht(){}It.prototype.on=function(){var t=this._.on.apply(this._,arguments);return t===this._?this:t};var Vt=.7,Xt=1/Vt,Gt="\\\\s*([+-]?\\\\d+)\\\\s*",Yt="\\\\s*([+-]?(?:\\\\d*\\\\.)?\\\\d+(?:[eE][+-]?\\\\d+)?)\\\\s*",Wt="\\\\s*([+-]?(?:\\\\d*\\\\.)?\\\\d+(?:[eE][+-]?\\\\d+)?)%\\\\s*",Zt=/^#([0-9a-f]{3,8})$/,Qt=new RegExp(\`^rgb\\\\(\${Gt},\${Gt},\${Gt}\\\\)$\`),Kt=new RegExp(\`^rgb\\\\(\${Wt},\${Wt},\${Wt}\\\\)$\`),Jt=new RegExp(\`^rgba\\\\(\${Gt},\${Gt},\${Gt},\${Yt}\\\\)$\`),tn=new RegExp(\`^rgba\\\\(\${Wt},\${Wt},\${Wt},\${Yt}\\\\)$\`),nn=new RegExp(\`^hsl\\\\(\${Yt},\${Wt},\${Wt}\\\\)$\`),en=new RegExp(\`^hsla\\\\(\${Yt},\${Wt},\${Wt},\${Yt}\\\\)$\`),rn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};function on(){return this.rgb().formatHex()}function an(){return this.rgb().formatRgb()}function un(t){var n,e;return t=(t+"").trim().toLowerCase(),(n=Zt.exec(t))?(e=n[1].length,n=parseInt(n[1],16),6===e?sn(n):3===e?new hn(n>>8&15|n>>4&240,n>>4&15|240&n,(15&n)<<4|15&n,1):8===e?ln(n>>24&255,n>>16&255,n>>8&255,(255&n)/255):4===e?ln(n>>12&15|n>>8&240,n>>8&15|n>>4&240,n>>4&15|240&n,((15&n)<<4|15&n)/255):null):(n=Qt.exec(t))?new hn(n[1],n[2],n[3],1):(n=Kt.exec(t))?new hn(255*n[1]/100,255*n[2]/100,255*n[3]/100,1):(n=Jt.exec(t))?ln(n[1],n[2],n[3],n[4]):(n=tn.exec(t))?ln(255*n[1]/100,255*n[2]/100,255*n[3]/100,n[4]):(n=nn.exec(t))?yn(n[1],n[2]/100,n[3]/100,1):(n=en.exec(t))?yn(n[1],n[2]/100,n[3]/100,n[4]):rn.hasOwnProperty(t)?sn(rn[t]):"transparent"===t?new hn(NaN,NaN,NaN,0):null}function sn(t){return new hn(t>>16&255,t>>8&255,255&t,1)}function ln(t,n,e,r){return r<=0&&(t=n=e=NaN),new hn(t,n,e,r)}function cn(t,n,e,r){return 1===arguments.length?function(t){return t instanceof Ht||(t=un(t)),t?new hn((t=t.rgb()).r,t.g,t.b,t.opacity):new hn}(t):new hn(t,n,e,null==r?1:r)}function hn(t,n,e,r){this.r=+t,this.g=+n,this.b=+e,this.opacity=+r}function fn(){return\`#\${_n(this.r)}\${_n(this.g)}\${_n(this.b)}\`}function pn(){const t=dn(this.opacity);return\`\${1===t?"rgb(":"rgba("}\${gn(this.r)}, \${gn(this.g)}, \${gn(this.b)}\${1===t?")":\`, \${t})\`}\`}function dn(t){return isNaN(t)?1:Math.max(0,Math.min(1,t))}function gn(t){return Math.max(0,Math.min(255,Math.round(t)||0))}function _n(t){return((t=gn(t))<16?"0":"")+t.toString(16)}function yn(t,n,e,r){return r<=0?t=n=e=NaN:e<=0||e>=1?t=n=NaN:n<=0&&(t=NaN),new mn(t,n,e,r)}function vn(t){if(t instanceof mn)return new mn(t.h,t.s,t.l,t.opacity);if(t instanceof Ht||(t=un(t)),!t)return new mn;if(t instanceof mn)return t;var n=(t=t.rgb()).r/255,e=t.g/255,r=t.b/255,i=Math.min(n,e,r),o=Math.max(n,e,r),a=NaN,u=o-i,s=(o+i)/2;return u?(a=n===o?(e-r)/u+6*(e<r):e===o?(r-n)/u+2:(n-e)/u+4,u/=s<.5?o+i:2-o-i,a*=60):u=s>0&&s<1?0:a,new mn(a,u,s,t.opacity)}function mn(t,n,e,r){this.h=+t,this.s=+n,this.l=+e,this.opacity=+r}function xn(t){return(t=(t||0)%360)<0?t+360:t}function bn(t){return Math.max(0,Math.min(1,t||0))}function wn(t,n,e){return 255*(t<60?n+(e-n)*t/60:t<180?e:t<240?n+(e-n)*(240-t)/60:n)}$t(Ht,un,{copy(t){return Object.assign(new this.constructor,this,t)},displayable(){return this.rgb().displayable()},hex:on,formatHex:on,formatHex8:function(){return this.rgb().formatHex8()},formatHsl:function(){return vn(this).formatHsl()},formatRgb:an,toString:an}),$t(hn,cn,Bt(Ht,{brighter(t){return t=null==t?Xt:Math.pow(Xt,t),new hn(this.r*t,this.g*t,this.b*t,this.opacity)},darker(t){return t=null==t?Vt:Math.pow(Vt,t),new hn(this.r*t,this.g*t,this.b*t,this.opacity)},rgb(){return this},clamp(){return new hn(gn(this.r),gn(this.g),gn(this.b),dn(this.opacity))},displayable(){return-.5<=this.r&&this.r<255.5&&-.5<=this.g&&this.g<255.5&&-.5<=this.b&&this.b<255.5&&0<=this.opacity&&this.opacity<=1},hex:fn,formatHex:fn,formatHex8:function(){return\`#\${_n(this.r)}\${_n(this.g)}\${_n(this.b)}\${_n(255*(isNaN(this.opacity)?1:this.opacity))}\`},formatRgb:pn,toString:pn})),$t(mn,function(t,n,e,r){return 1===arguments.length?vn(t):new mn(t,n,e,null==r?1:r)},Bt(Ht,{brighter(t){return t=null==t?Xt:Math.pow(Xt,t),new mn(this.h,this.s,this.l*t,this.opacity)},darker(t){return t=null==t?Vt:Math.pow(Vt,t),new mn(this.h,this.s,this.l*t,this.opacity)},rgb(){var t=this.h%360+360*(this.h<0),n=isNaN(t)||isNaN(this.s)?0:this.s,e=this.l,r=e+(e<.5?e:1-e)*n,i=2*e-r;return new hn(wn(t>=240?t-240:t+120,i,r),wn(t,i,r),wn(t<120?t+240:t-120,i,r),this.opacity)},clamp(){return new mn(xn(this.h),bn(this.s),bn(this.l),dn(this.opacity))},displayable(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1},formatHsl(){const t=dn(this.opacity);return\`\${1===t?"hsl(":"hsla("}\${xn(this.h)}, \${100*bn(this.s)}%, \${100*bn(this.l)}%\${1===t?")":\`, \${t})\`}\`}}));var kn=t=>()=>t;function Mn(t){return 1===(t=+t)?An:function(n,e){return e-n?function(t,n,e){return t=Math.pow(t,e),n=Math.pow(n,e)-t,e=1/e,function(r){return Math.pow(t+r*n,e)}}(n,e,t):kn(isNaN(n)?e:n)}}function An(t,n){var e=n-t;return e?function(t,n){return function(e){return t+e*n}}(t,e):kn(isNaN(t)?n:t)}var zn=function t(n){var e=Mn(n);function r(t,n){var r=e((t=cn(t)).r,(n=cn(n)).r),i=e(t.g,n.g),o=e(t.b,n.b),a=An(t.opacity,n.opacity);return function(n){return t.r=r(n),t.g=i(n),t.b=o(n),t.opacity=a(n),t+""}}return r.gamma=t,r}(1);function Sn(t,n){return t=+t,n=+n,function(e){return t*(1-e)+n*e}}var Cn=/[-+]?(?:\\d+\\.?\\d*|\\.?\\d+)(?:[eE][-+]?\\d+)?/g,En=new RegExp(Cn.source,"g");function Pn(t,n){var e,r,i,o=Cn.lastIndex=En.lastIndex=0,a=-1,u=[],s=[];for(t+="",n+="";(e=Cn.exec(t))&&(r=En.exec(n));)(i=r.index)>o&&(i=n.slice(o,i),u[a]?u[a]+=i:u[++a]=i),(e=e[0])===(r=r[0])?u[a]?u[a]+=r:u[++a]=r:(u[++a]=null,s.push({i:a,x:Sn(e,r)})),o=En.lastIndex;return o<n.length&&(i=n.slice(o),u[a]?u[a]+=i:u[++a]=i),u.length<2?s[0]?function(t){return function(n){return t(n)+""}}(s[0].x):function(t){return function(){return t}}(n):(n=s.length,function(t){for(var e,r=0;r<n;++r)u[(e=s[r]).i]=e.x(t);return u.join("")})}var On,Nn=180/Math.PI,jn={translateX:0,translateY:0,rotate:0,skewX:0,scaleX:1,scaleY:1};function Tn(t,n,e,r,i,o){var a,u,s;return(a=Math.sqrt(t*t+n*n))&&(t/=a,n/=a),(s=t*e+n*r)&&(e-=t*s,r-=n*s),(u=Math.sqrt(e*e+r*r))&&(e/=u,r/=u,s/=u),t*r<n*e&&(t=-t,n=-n,s=-s,a=-a),{translateX:i,translateY:o,rotate:Math.atan2(n,t)*Nn,skewX:Math.atan(s)*Nn,scaleX:a,scaleY:u}}function Rn(t,n,e,r){function i(t){return t.length?t.pop()+" ":""}return function(o,a){var u=[],s=[];return o=t(o),a=t(a),function(t,r,i,o,a,u){if(t!==i||r!==o){var s=a.push("translate(",null,n,null,e);u.push({i:s-4,x:Sn(t,i)},{i:s-2,x:Sn(r,o)})}else(i||o)&&a.push("translate("+i+n+o+e)}(o.translateX,o.translateY,a.translateX,a.translateY,u,s),function(t,n,e,o){t!==n?(t-n>180?n+=360:n-t>180&&(t+=360),o.push({i:e.push(i(e)+"rotate(",null,r)-2,x:Sn(t,n)})):n&&e.push(i(e)+"rotate("+n+r)}(o.rotate,a.rotate,u,s),function(t,n,e,o){t!==n?o.push({i:e.push(i(e)+"skewX(",null,r)-2,x:Sn(t,n)}):n&&e.push(i(e)+"skewX("+n+r)}(o.skewX,a.skewX,u,s),function(t,n,e,r,o,a){if(t!==e||n!==r){var u=o.push(i(o)+"scale(",null,",",null,")");a.push({i:u-4,x:Sn(t,e)},{i:u-2,x:Sn(n,r)})}else 1===e&&1===r||o.push(i(o)+"scale("+e+","+r+")")}(o.scaleX,o.scaleY,a.scaleX,a.scaleY,u,s),o=a=null,function(t){for(var n,e=-1,r=s.length;++e<r;)u[(n=s[e]).i]=n.x(t);return u.join("")}}}var Dn=Rn(function(t){const n=new("function"==typeof DOMMatrix?DOMMatrix:WebKitCSSMatrix)(t+"");return n.isIdentity?jn:Tn(n.a,n.b,n.c,n.d,n.e,n.f)},"px, ","px)","deg)"),In=Rn(function(t){return null==t?jn:(On||(On=document.createElementNS("http://www.w3.org/2000/svg","g")),On.setAttribute("transform",t),(t=On.transform.baseVal.consolidate())?Tn((t=t.matrix).a,t.b,t.c,t.d,t.e,t.f):jn)},", ",")",")");function Un(t){return((t=Math.exp(t))+1/t)/2}var Fn,Ln,qn=function t(n,e,r){function i(t,i){var o,a,u=t[0],s=t[1],l=t[2],c=i[0],h=i[1],f=i[2],p=c-u,d=h-s,g=p*p+d*d;if(g<1e-12)a=Math.log(f/l)/n,o=function(t){return[u+t*p,s+t*d,l*Math.exp(n*t*a)]};else{var _=Math.sqrt(g),y=(f*f-l*l+r*g)/(2*l*e*_),v=(f*f-l*l-r*g)/(2*f*e*_),m=Math.log(Math.sqrt(y*y+1)-y),x=Math.log(Math.sqrt(v*v+1)-v);a=(x-m)/n,o=function(t){var r=t*a,i=Un(m),o=l/(e*_)*(i*function(t){return((t=Math.exp(2*t))-1)/(t+1)}(n*r+m)-function(t){return((t=Math.exp(t))-1/t)/2}(m));return[u+o*p,s+o*d,l*i/Un(n*r+m)]}}return o.duration=1e3*a*n/Math.SQRT2,o}return i.rho=function(n){var e=Math.max(.001,+n),r=e*e;return t(e,r,r*r)},i}(Math.SQRT2,2,4),$n=0,Bn=0,Hn=0,Vn=0,Xn=0,Gn=0,Yn="object"==typeof performance&&performance.now?performance:Date,Wn="object"==typeof window&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(t){setTimeout(t,17)};function Zn(){return Xn||(Wn(Qn),Xn=Yn.now()+Gn)}function Qn(){Xn=0}function Kn(){this._call=this._time=this._next=null}function Jn(t,n,e){var r=new Kn;return r.restart(t,n,e),r}function te(){Xn=(Vn=Yn.now())+Gn,$n=Bn=0;try{!function(){Zn(),++$n;for(var t,n=Fn;n;)(t=Xn-n._time)>=0&&n._call.call(void 0,t),n=n._next;--$n}()}finally{$n=0,function(){var t,n,e=Fn,r=1/0;for(;e;)e._call?(r>e._time&&(r=e._time),t=e,e=e._next):(n=e._next,e._next=null,e=t?t._next=n:Fn=n);Ln=t,ee(r)}(),Xn=0}}function ne(){var t=Yn.now(),n=t-Vn;n>1e3&&(Gn-=n,Vn=t)}function ee(t){$n||(Bn&&(Bn=clearTimeout(Bn)),t-Xn>24?(t<1/0&&(Bn=setTimeout(te,t-Yn.now()-Gn)),Hn&&(Hn=clearInterval(Hn))):(Hn||(Vn=Yn.now(),Hn=setInterval(ne,1e3)),$n=1,Wn(te)))}function re(t,n,e){var r=new Kn;return n=null==n?0:+n,r.restart(e=>{r.stop(),t(e+n)},n,e),r}Kn.prototype=Jn.prototype={constructor:Kn,restart:function(t,n,e){if("function"!=typeof t)throw new TypeError("callback is not a function");e=(null==e?Zn():+e)+(null==n?0:+n),this._next||Ln===this||(Ln?Ln._next=this:Fn=this,Ln=this),this._call=t,this._time=e,ee()},stop:function(){this._call&&(this._call=null,this._time=1/0,ee())}};var ie=zt("start","end","cancel","interrupt"),oe=[];function ae(t,n,e,r,i,o){var a=t.__transition;if(a){if(e in a)return}else t.__transition={};!function(t,n,e){var r,i=t.__transition;function o(t){e.state=1,e.timer.restart(a,e.delay,e.time),e.delay<=t&&a(t-e.delay)}function a(o){var l,c,h,f;if(1!==e.state)return s();for(l in i)if((f=i[l]).name===e.name){if(3===f.state)return re(a);4===f.state?(f.state=6,f.timer.stop(),f.on.call("interrupt",t,t.__data__,f.index,f.group),delete i[l]):+l<n&&(f.state=6,f.timer.stop(),f.on.call("cancel",t,t.__data__,f.index,f.group),delete i[l])}if(re(function(){3===e.state&&(e.state=4,e.timer.restart(u,e.delay,e.time),u(o))}),e.state=2,e.on.call("start",t,t.__data__,e.index,e.group),2===e.state){for(e.state=3,r=new Array(h=e.tween.length),l=0,c=-1;l<h;++l)(f=e.tween[l].value.call(t,t.__data__,e.index,e.group))&&(r[++c]=f);r.length=c+1}}function u(n){for(var i=n<e.duration?e.ease.call(null,n/e.duration):(e.timer.restart(s),e.state=5,1),o=-1,a=r.length;++o<a;)r[o].call(t,i);5===e.state&&(e.on.call("end",t,t.__data__,e.index,e.group),s())}function s(){for(var r in e.state=6,e.timer.stop(),delete i[n],i)return;delete t.__transition}i[n]=e,e.timer=Jn(o,0,e.time)}(t,e,{name:n,index:r,group:i,on:ie,tween:oe,time:o.time,delay:o.delay,duration:o.duration,ease:o.ease,timer:null,state:0})}function ue(t,n){var e=le(t,n);if(e.state>0)throw new Error("too late; already scheduled");return e}function se(t,n){var e=le(t,n);if(e.state>3)throw new Error("too late; already running");return e}function le(t,n){var e=t.__transition;if(!e||!(e=e[n]))throw new Error("transition not found");return e}function ce(t,n){var e,r,i,o=t.__transition,a=!0;if(o){for(i in n=null==n?null:n+"",o)(e=o[i]).name===n?(r=e.state>2&&e.state<5,e.state=6,e.timer.stop(),e.on.call(r?"interrupt":"cancel",t,t.__data__,e.index,e.group),delete o[i]):a=!1;a&&delete t.__transition}}function he(t,n){var e,r;return function(){var i=se(this,t),o=i.tween;if(o!==e)for(var a=0,u=(r=e=o).length;a<u;++a)if(r[a].name===n){(r=r.slice()).splice(a,1);break}i.tween=r}}function fe(t,n,e){var r,i;if("function"!=typeof e)throw new Error;return function(){var o=se(this,t),a=o.tween;if(a!==r){i=(r=a).slice();for(var u={name:n,value:e},s=0,l=i.length;s<l;++s)if(i[s].name===n){i[s]=u;break}s===l&&i.push(u)}o.tween=i}}function pe(t,n,e){var r=t._id;return t.each(function(){var t=se(this,r);(t.value||(t.value={}))[n]=e.apply(this,arguments)}),function(t){return le(t,r).value[n]}}function de(t,n){var e;return("number"==typeof n?Sn:n instanceof un?zn:(e=un(n))?(n=e,zn):Pn)(t,n)}function ge(t){return function(){this.removeAttribute(t)}}function _e(t){return function(){this.removeAttributeNS(t.space,t.local)}}function ye(t,n,e){var r,i,o=e+"";return function(){var a=this.getAttribute(t);return a===o?null:a===r?i:i=n(r=a,e)}}function ve(t,n,e){var r,i,o=e+"";return function(){var a=this.getAttributeNS(t.space,t.local);return a===o?null:a===r?i:i=n(r=a,e)}}function me(t,n,e){var r,i,o;return function(){var a,u,s=e(this);if(null!=s)return(a=this.getAttribute(t))===(u=s+"")?null:a===r&&u===i?o:(i=u,o=n(r=a,s));this.removeAttribute(t)}}function xe(t,n,e){var r,i,o;return function(){var a,u,s=e(this);if(null!=s)return(a=this.getAttributeNS(t.space,t.local))===(u=s+"")?null:a===r&&u===i?o:(i=u,o=n(r=a,s));this.removeAttributeNS(t.space,t.local)}}function be(t,n){var e,r;function i(){var i=n.apply(this,arguments);return i!==r&&(e=(r=i)&&function(t,n){return function(e){this.setAttributeNS(t.space,t.local,n.call(this,e))}}(t,i)),e}return i._value=n,i}function we(t,n){var e,r;function i(){var i=n.apply(this,arguments);return i!==r&&(e=(r=i)&&function(t,n){return function(e){this.setAttribute(t,n.call(this,e))}}(t,i)),e}return i._value=n,i}function ke(t,n){return function(){ue(this,t).delay=+n.apply(this,arguments)}}function Me(t,n){return n=+n,function(){ue(this,t).delay=n}}function Ae(t,n){return function(){se(this,t).duration=+n.apply(this,arguments)}}function ze(t,n){return n=+n,function(){se(this,t).duration=n}}var Se=wt.prototype.constructor;function Ce(t){return function(){this.style.removeProperty(t)}}var Ee=0;function Pe(t,n,e,r){this._groups=t,this._parents=n,this._name=e,this._id=r}function Oe(){return++Ee}var Ne=wt.prototype;Pe.prototype={constructor:Pe,select:function(t){var n=this._name,e=this._id;"function"!=typeof t&&(t=v(t));for(var r=this._groups,i=r.length,o=new Array(i),a=0;a<i;++a)for(var u,s,l=r[a],c=l.length,h=o[a]=new Array(c),f=0;f<c;++f)(u=l[f])&&(s=t.call(u,u.__data__,f,l))&&("__data__"in u&&(s.__data__=u.__data__),h[f]=s,ae(h[f],n,e,f,h,le(u,e)));return new Pe(o,this._parents,n,e)},selectAll:function(t){var n=this._name,e=this._id;"function"!=typeof t&&(t=x(t));for(var r=this._groups,i=r.length,o=[],a=[],u=0;u<i;++u)for(var s,l=r[u],c=l.length,h=0;h<c;++h)if(s=l[h]){for(var f,p=t.call(s,s.__data__,h,l),d=le(s,e),g=0,_=p.length;g<_;++g)(f=p[g])&&ae(f,n,e,g,p,d);o.push(p),a.push(s)}return new Pe(o,a,n,e)},selectChild:Ne.selectChild,selectChildren:Ne.selectChildren,filter:function(t){"function"!=typeof t&&(t=w(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,a=n[i],u=a.length,s=r[i]=[],l=0;l<u;++l)(o=a[l])&&t.call(o,o.__data__,l,a)&&s.push(o);return new Pe(r,this._parents,this._name,this._id)},merge:function(t){if(t._id!==this._id)throw new Error;for(var n=this._groups,e=t._groups,r=n.length,i=e.length,o=Math.min(r,i),a=new Array(r),u=0;u<o;++u)for(var s,l=n[u],c=e[u],h=l.length,f=a[u]=new Array(h),p=0;p<h;++p)(s=l[p]||c[p])&&(f[p]=s);for(;u<r;++u)a[u]=n[u];return new Pe(a,this._parents,this._name,this._id)},selection:function(){return new Se(this._groups,this._parents)},transition:function(){for(var t=this._name,n=this._id,e=Oe(),r=this._groups,i=r.length,o=0;o<i;++o)for(var a,u=r[o],s=u.length,l=0;l<s;++l)if(a=u[l]){var c=le(a,n);ae(a,t,e,l,u,{time:c.time+c.delay+c.duration,delay:0,duration:c.duration,ease:c.ease})}return new Pe(r,this._parents,t,e)},call:Ne.call,nodes:Ne.nodes,node:Ne.node,size:Ne.size,empty:Ne.empty,each:Ne.each,on:function(t,n){var e=this._id;return arguments.length<2?le(this.node(),e).on.on(t):this.each(function(t,n,e){var r,i,o=function(t){return(t+"").trim().split(/^|\\s+/).every(function(t){var n=t.indexOf(".");return n>=0&&(t=t.slice(0,n)),!t||"start"===t})}(n)?ue:se;return function(){var a=o(this,t),u=a.on;u!==r&&(i=(r=u).copy()).on(n,e),a.on=i}}(e,t,n))},attr:function(t,n){var e=p(t),r="transform"===e?In:de;return this.attrTween(t,"function"==typeof n?(e.local?xe:me)(e,r,pe(this,"attr."+t,n)):null==n?(e.local?_e:ge)(e):(e.local?ve:ye)(e,r,n))},attrTween:function(t,n){var e="attr."+t;if(arguments.length<2)return(e=this.tween(e))&&e._value;if(null==n)return this.tween(e,null);if("function"!=typeof n)throw new Error;var r=p(t);return this.tween(e,(r.local?be:we)(r,n))},style:function(t,n,e){var r="transform"==(t+="")?Dn:de;return null==n?this.styleTween(t,function(t,n){var e,r,i;return function(){var o=V(this,t),a=(this.style.removeProperty(t),V(this,t));return o===a?null:o===e&&a===r?i:i=n(e=o,r=a)}}(t,r)).on("end.style."+t,Ce(t)):"function"==typeof n?this.styleTween(t,function(t,n,e){var r,i,o;return function(){var a=V(this,t),u=e(this),s=u+"";return null==u&&(this.style.removeProperty(t),s=u=V(this,t)),a===s?null:a===r&&s===i?o:(i=s,o=n(r=a,u))}}(t,r,pe(this,"style."+t,n))).each(function(t,n){var e,r,i,o,a="style."+n,u="end."+a;return function(){var s=se(this,t),l=s.on,c=null==s.value[a]?o||(o=Ce(n)):void 0;l===e&&i===c||(r=(e=l).copy()).on(u,i=c),s.on=r}}(this._id,t)):this.styleTween(t,function(t,n,e){var r,i,o=e+"";return function(){var a=V(this,t);return a===o?null:a===r?i:i=n(r=a,e)}}(t,r,n),e).on("end.style."+t,null)},styleTween:function(t,n,e){var r="style."+(t+="");if(arguments.length<2)return(r=this.tween(r))&&r._value;if(null==n)return this.tween(r,null);if("function"!=typeof n)throw new Error;return this.tween(r,function(t,n,e){var r,i;function o(){var o=n.apply(this,arguments);return o!==i&&(r=(i=o)&&function(t,n,e){return function(r){this.style.setProperty(t,n.call(this,r),e)}}(t,o,e)),r}return o._value=n,o}(t,n,null==e?"":e))},text:function(t){return this.tween("text","function"==typeof t?function(t){return function(){var n=t(this);this.textContent=null==n?"":n}}(pe(this,"text",t)):function(t){return function(){this.textContent=t}}(null==t?"":t+""))},textTween:function(t){var n="text";if(arguments.length<1)return(n=this.tween(n))&&n._value;if(null==t)return this.tween(n,null);if("function"!=typeof t)throw new Error;return this.tween(n,function(t){var n,e;function r(){var r=t.apply(this,arguments);return r!==e&&(n=(e=r)&&function(t){return function(n){this.textContent=t.call(this,n)}}(r)),n}return r._value=t,r}(t))},remove:function(){return this.on("end.remove",function(t){return function(){var n=this.parentNode;for(var e in this.__transition)if(+e!==t)return;n&&n.removeChild(this)}}(this._id))},tween:function(t,n){var e=this._id;if(t+="",arguments.length<2){for(var r,i=le(this.node(),e).tween,o=0,a=i.length;o<a;++o)if((r=i[o]).name===t)return r.value;return null}return this.each((null==n?he:fe)(e,t,n))},delay:function(t){var n=this._id;return arguments.length?this.each(("function"==typeof t?ke:Me)(n,t)):le(this.node(),n).delay},duration:function(t){var n=this._id;return arguments.length?this.each(("function"==typeof t?Ae:ze)(n,t)):le(this.node(),n).duration},ease:function(t){var n=this._id;return arguments.length?this.each(function(t,n){if("function"!=typeof n)throw new Error;return function(){se(this,t).ease=n}}(n,t)):le(this.node(),n).ease},easeVarying:function(t){if("function"!=typeof t)throw new Error;return this.each(function(t,n){return function(){var e=n.apply(this,arguments);if("function"!=typeof e)throw new Error;se(this,t).ease=e}}(this._id,t))},end:function(){var t,n,e=this,r=e._id,i=e.size();return new Promise(function(o,a){var u={value:a},s={value:function(){0===--i&&o()}};e.each(function(){var e=se(this,r),i=e.on;i!==t&&((n=(t=i).copy())._.cancel.push(u),n._.interrupt.push(u),n._.end.push(s)),e.on=n}),0===i&&o()})},[Symbol.iterator]:Ne[Symbol.iterator]};var je={time:null,delay:0,duration:250,ease:function(t){return((t*=2)<=1?t*t*t:(t-=2)*t*t+2)/2}};function Te(t,n){for(var e;!(e=t.__transition)||!(e=e[n]);)if(!(t=t.parentNode))throw new Error(\`transition \${n} not found\`);return e}wt.prototype.interrupt=function(t){return this.each(function(){ce(this,t)})},wt.prototype.transition=function(t){var n,e;t instanceof Pe?(n=t._id,t=t._name):(n=Oe(),(e=je).time=Zn(),t=null==t?null:t+"");for(var r=this._groups,i=r.length,o=0;o<i;++o)for(var a,u=r[o],s=u.length,l=0;l<s;++l)(a=u[l])&&ae(a,t,n,l,u,e||Te(a,n));return new Pe(r,this._parents,t,n)};var Re=t=>()=>t;function De(t,{sourceEvent:n,target:e,transform:r,dispatch:i}){Object.defineProperties(this,{type:{value:t,enumerable:!0,configurable:!0},sourceEvent:{value:n,enumerable:!0,configurable:!0},target:{value:e,enumerable:!0,configurable:!0},transform:{value:r,enumerable:!0,configurable:!0},_:{value:i}})}function Ie(t,n,e){this.k=t,this.x=n,this.y=e}Ie.prototype={constructor:Ie,scale:function(t){return 1===t?this:new Ie(this.k*t,this.x,this.y)},translate:function(t,n){return 0===t&0===n?this:new Ie(this.k,this.x+this.k*t,this.y+this.k*n)},apply:function(t){return[t[0]*this.k+this.x,t[1]*this.k+this.y]},applyX:function(t){return t*this.k+this.x},applyY:function(t){return t*this.k+this.y},invert:function(t){return[(t[0]-this.x)/this.k,(t[1]-this.y)/this.k]},invertX:function(t){return(t-this.x)/this.k},invertY:function(t){return(t-this.y)/this.k},rescaleX:function(t){return t.copy().domain(t.range().map(this.invertX,this).map(t.invert,t))},rescaleY:function(t){return t.copy().domain(t.range().map(this.invertY,this).map(t.invert,t))},toString:function(){return"translate("+this.x+","+this.y+") scale("+this.k+")"}};var Ue=new Ie(1,0,0);function Fe(t){for(;!t.__zoom;)if(!(t=t.parentNode))return Ue;return t.__zoom}function Le(t){t.stopImmediatePropagation()}function qe(t){t.preventDefault(),t.stopImmediatePropagation()}function $e(t){return!(t.ctrlKey&&"wheel"!==t.type||t.button)}function Be(){var t=this;return t instanceof SVGElement?(t=t.ownerSVGElement||t).hasAttribute("viewBox")?[[(t=t.viewBox.baseVal).x,t.y],[t.x+t.width,t.y+t.height]]:[[0,0],[t.width.baseVal.value,t.height.baseVal.value]]:[[0,0],[t.clientWidth,t.clientHeight]]}function He(){return this.__zoom||Ue}function Ve(t){return-t.deltaY*(1===t.deltaMode?.05:t.deltaMode?1:.002)*(t.ctrlKey?10:1)}function Xe(){return navigator.maxTouchPoints||"ontouchstart"in this}function Ge(t,n,e){var r=t.invertX(n[0][0])-e[0][0],i=t.invertX(n[1][0])-e[1][0],o=t.invertY(n[0][1])-e[0][1],a=t.invertY(n[1][1])-e[1][1];return t.translate(i>r?(r+i)/2:Math.min(0,r)||Math.max(0,i),a>o?(o+a)/2:Math.min(0,o)||Math.max(0,a))}function Ye(){var t,n,e,r=$e,i=Be,o=Ge,a=Ve,u=Xe,s=[0,1/0],l=[[-1/0,-1/0],[1/0,1/0]],c=250,h=qn,f=zt("start","zoom","end"),p=0,d=10;function g(t){t.property("__zoom",He).on("wheel.zoom",w,{passive:!1}).on("mousedown.zoom",k).on("dblclick.zoom",M).filter(u).on("touchstart.zoom",A).on("touchmove.zoom",z).on("touchend.zoom touchcancel.zoom",S).style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function _(t,n){return(n=Math.max(s[0],Math.min(s[1],n)))===t.k?t:new Ie(n,t.x,t.y)}function y(t,n,e){var r=n[0]-e[0]*t.k,i=n[1]-e[1]*t.k;return r===t.x&&i===t.y?t:new Ie(t.k,r,i)}function v(t){return[(+t[0][0]+ +t[1][0])/2,(+t[0][1]+ +t[1][1])/2]}function m(t,n,e,r){t.on("start.zoom",function(){x(this,arguments).event(r).start()}).on("interrupt.zoom end.zoom",function(){x(this,arguments).event(r).end()}).tween("zoom",function(){var t=this,o=arguments,a=x(t,o).event(r),u=i.apply(t,o),s=null==e?v(u):"function"==typeof e?e.apply(t,o):e,l=Math.max(u[1][0]-u[0][0],u[1][1]-u[0][1]),c=t.__zoom,f="function"==typeof n?n.apply(t,o):n,p=h(c.invert(s).concat(l/c.k),f.invert(s).concat(l/f.k));return function(t){if(1===t)t=f;else{var n=p(t),e=l/n[2];t=new Ie(e,s[0]-n[0]*e,s[1]-n[1]*e)}a.zoom(null,t)}})}function x(t,n,e){return!e&&t.__zooming||new b(t,n)}function b(t,n){this.that=t,this.args=n,this.active=0,this.sourceEvent=null,this.extent=i.apply(t,n),this.taps=0}function w(t,...n){if(r.apply(this,arguments)){var e=x(this,n).event(t),i=this.__zoom,u=Math.max(s[0],Math.min(s[1],i.k*Math.pow(2,a.apply(this,arguments)))),c=Mt(t);if(e.wheel)e.mouse[0][0]===c[0]&&e.mouse[0][1]===c[1]||(e.mouse[1]=i.invert(e.mouse[0]=c)),clearTimeout(e.wheel);else{if(i.k===u)return;e.mouse=[c,i.invert(c)],ce(this),e.start()}qe(t),e.wheel=setTimeout(function(){e.wheel=null,e.end()},150),e.zoom("mouse",o(y(_(i,u),e.mouse[0],e.mouse[1]),e.extent,l))}}function k(t,...n){if(!e&&r.apply(this,arguments)){var i=t.currentTarget,a=x(this,n,!0).event(t),u=kt(t.view).on("mousemove.zoom",function(t){if(qe(t),!a.moved){var n=t.clientX-c,e=t.clientY-h;a.moved=n*n+e*e>p}a.event(t).zoom("mouse",o(y(a.that.__zoom,a.mouse[0]=Mt(t,i),a.mouse[1]),a.extent,l))},!0).on("mouseup.zoom",function(t){u.on("mousemove.zoom mouseup.zoom",null),Rt(t.view,a.moved),qe(t),a.event(t).end()},!0),s=Mt(t,i),c=t.clientX,h=t.clientY;Tt(t.view),Le(t),a.mouse=[s,this.__zoom.invert(s)],ce(this),a.start()}}function M(t,...n){if(r.apply(this,arguments)){var e=this.__zoom,a=Mt(t.changedTouches?t.changedTouches[0]:t,this),u=e.invert(a),s=e.k*(t.shiftKey?.5:2),h=o(y(_(e,s),a,u),i.apply(this,n),l);qe(t),c>0?kt(this).transition().duration(c).call(m,h,a,t):kt(this).call(g.transform,h,a,t)}}function A(e,...i){if(r.apply(this,arguments)){var o,a,u,s,l=e.touches,c=l.length,h=x(this,i,e.changedTouches.length===c).event(e);for(Le(e),a=0;a<c;++a)s=[s=Mt(u=l[a],this),this.__zoom.invert(s),u.identifier],h.touch0?h.touch1||h.touch0[2]===s[2]||(h.touch1=s,h.taps=0):(h.touch0=s,o=!0,h.taps=1+!!t);t&&(t=clearTimeout(t)),o&&(h.taps<2&&(n=s[0],t=setTimeout(function(){t=null},500)),ce(this),h.start())}}function z(t,...n){if(this.__zooming){var e,r,i,a,u=x(this,n).event(t),s=t.changedTouches,c=s.length;for(qe(t),e=0;e<c;++e)i=Mt(r=s[e],this),u.touch0&&u.touch0[2]===r.identifier?u.touch0[0]=i:u.touch1&&u.touch1[2]===r.identifier&&(u.touch1[0]=i);if(r=u.that.__zoom,u.touch1){var h=u.touch0[0],f=u.touch0[1],p=u.touch1[0],d=u.touch1[1],g=(g=p[0]-h[0])*g+(g=p[1]-h[1])*g,v=(v=d[0]-f[0])*v+(v=d[1]-f[1])*v;r=_(r,Math.sqrt(g/v)),i=[(h[0]+p[0])/2,(h[1]+p[1])/2],a=[(f[0]+d[0])/2,(f[1]+d[1])/2]}else{if(!u.touch0)return;i=u.touch0[0],a=u.touch0[1]}u.zoom("touch",o(y(r,i,a),u.extent,l))}}function S(t,...r){if(this.__zooming){var i,o,a=x(this,r).event(t),u=t.changedTouches,s=u.length;for(Le(t),e&&clearTimeout(e),e=setTimeout(function(){e=null},500),i=0;i<s;++i)o=u[i],a.touch0&&a.touch0[2]===o.identifier?delete a.touch0:a.touch1&&a.touch1[2]===o.identifier&&delete a.touch1;if(a.touch1&&!a.touch0&&(a.touch0=a.touch1,delete a.touch1),a.touch0)a.touch0[1]=this.__zoom.invert(a.touch0[0]);else if(a.end(),2===a.taps&&(o=Mt(o,this),Math.hypot(n[0]-o[0],n[1]-o[1])<d)){var l=kt(this).on("dblclick.zoom");l&&l.apply(this,arguments)}}}return g.transform=function(t,n,e,r){var i=t.selection?t.selection():t;i.property("__zoom",He),t!==i?m(t,n,e,r):i.interrupt().each(function(){x(this,arguments).event(r).start().zoom(null,"function"==typeof n?n.apply(this,arguments):n).end()})},g.scaleBy=function(t,n,e,r){g.scaleTo(t,function(){return this.__zoom.k*("function"==typeof n?n.apply(this,arguments):n)},e,r)},g.scaleTo=function(t,n,e,r){g.transform(t,function(){var t=i.apply(this,arguments),r=this.__zoom,a=null==e?v(t):"function"==typeof e?e.apply(this,arguments):e,u=r.invert(a),s="function"==typeof n?n.apply(this,arguments):n;return o(y(_(r,s),a,u),t,l)},e,r)},g.translateBy=function(t,n,e,r){g.transform(t,function(){return o(this.__zoom.translate("function"==typeof n?n.apply(this,arguments):n,"function"==typeof e?e.apply(this,arguments):e),i.apply(this,arguments),l)},null,r)},g.translateTo=function(t,n,e,r,a){g.transform(t,function(){var t=i.apply(this,arguments),a=this.__zoom,u=null==r?v(t):"function"==typeof r?r.apply(this,arguments):r;return o(Ue.translate(u[0],u[1]).scale(a.k).translate("function"==typeof n?-n.apply(this,arguments):-n,"function"==typeof e?-e.apply(this,arguments):-e),t,l)},r,a)},b.prototype={event:function(t){return t&&(this.sourceEvent=t),this},start:function(){return 1===++this.active&&(this.that.__zooming=this,this.emit("start")),this},zoom:function(t,n){return this.mouse&&"mouse"!==t&&(this.mouse[1]=n.invert(this.mouse[0])),this.touch0&&"touch"!==t&&(this.touch0[1]=n.invert(this.touch0[0])),this.touch1&&"touch"!==t&&(this.touch1[1]=n.invert(this.touch1[0])),this.that.__zoom=n,this.emit("zoom"),this},end:function(){return 0===--this.active&&(delete this.that.__zooming,this.emit("end")),this},emit:function(t){var n=kt(this.that).datum();f.call(t,this.that,new De(t,{sourceEvent:this.sourceEvent,target:g,transform:this.that.__zoom,dispatch:f}),n)}},g.wheelDelta=function(t){return arguments.length?(a="function"==typeof t?t:Re(+t),g):a},g.filter=function(t){return arguments.length?(r="function"==typeof t?t:Re(!!t),g):r},g.touchable=function(t){return arguments.length?(u="function"==typeof t?t:Re(!!t),g):u},g.extent=function(t){return arguments.length?(i="function"==typeof t?t:Re([[+t[0][0],+t[0][1]],[+t[1][0],+t[1][1]]]),g):i},g.scaleExtent=function(t){return arguments.length?(s[0]=+t[0],s[1]=+t[1],g):[s[0],s[1]]},g.translateExtent=function(t){return arguments.length?(l[0][0]=+t[0][0],l[1][0]=+t[1][0],l[0][1]=+t[0][1],l[1][1]=+t[1][1],g):[[l[0][0],l[0][1]],[l[1][0],l[1][1]]]},g.constrain=function(t){return arguments.length?(o=t,g):o},g.duration=function(t){return arguments.length?(c=+t,g):c},g.interpolate=function(t){return arguments.length?(h=t,g):h},g.on=function(){var t=f.on.apply(f,arguments);return t===f?g:t},g.clickDistance=function(t){return arguments.length?(p=(t=+t)*t,g):Math.sqrt(p)},g.tapDistance=function(t){return arguments.length?(d=+t,g):d},g}Fe.prototype=Ie.prototype;class We extends Map{constructor(t,n=Qe){if(super(),Object.defineProperties(this,{_intern:{value:new Map},_key:{value:n}}),null!=t)for(const[n,e]of t)this.set(n,e)}get(t){return super.get(Ze(this,t))}has(t){return super.has(Ze(this,t))}set(t,n){return super.set(function({_intern:t,_key:n},e){const r=n(e);return t.has(r)?t.get(r):(t.set(r,e),e)}(this,t),n)}delete(t){return super.delete(function({_intern:t,_key:n},e){const r=n(e);t.has(r)&&(e=t.get(r),t.delete(r));return e}(this,t))}}function Ze({_intern:t,_key:n},e){const r=n(e);return t.has(r)?t.get(r):e}function Qe(t){return null!==t&&"object"==typeof t?t.valueOf():t}function Ke(t,n){let e;if(void 0===n)for(const n of t)null!=n&&(e<n||void 0===e&&n>=n)&&(e=n);else{let r=-1;for(let i of t)null!=(i=n(i,++r,t))&&(e<i||void 0===e&&i>=i)&&(e=i)}return e}function Je(t,n){let e;if(void 0===n)for(const n of t)null!=n&&(e>n||void 0===e&&n>=n)&&(e=n);else{let r=-1;for(let i of t)null!=(i=n(i,++r,t))&&(e>i||void 0===e&&i>=i)&&(e=i)}return e}var tr="object"==typeof global&&global&&global.Object===Object&&global,nr="object"==typeof self&&self&&self.Object===Object&&self,er=tr||nr||Function("return this")(),rr=er.Symbol,ir=Object.prototype,or=ir.hasOwnProperty,ar=ir.toString,ur=rr?rr.toStringTag:void 0;var sr=Object.prototype.toString;var lr=rr?rr.toStringTag:void 0;function cr(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":lr&&lr in Object(t)?function(t){var n=or.call(t,ur),e=t[ur];try{t[ur]=void 0;var r=!0}catch(t){}var i=ar.call(t);return r&&(n?t[ur]=e:delete t[ur]),i}(t):function(t){return sr.call(t)}(t)}var hr=/\\s/;var fr=/^\\s+/;function pr(t){return t?t.slice(0,function(t){for(var n=t.length;n--&&hr.test(t.charAt(n)););return n}(t)+1).replace(fr,""):t}function dr(t){var n=typeof t;return null!=t&&("object"==n||"function"==n)}var gr=/^[-+]0x[0-9a-f]+$/i,_r=/^0b[01]+$/i,yr=/^0o[0-7]+$/i,vr=parseInt;function mr(t){if("number"==typeof t)return t;if(function(t){return"symbol"==typeof t||function(t){return null!=t&&"object"==typeof t}(t)&&"[object Symbol]"==cr(t)}(t))return NaN;if(dr(t)){var n="function"==typeof t.valueOf?t.valueOf():t;t=dr(n)?n+"":n}if("string"!=typeof t)return 0===t?t:+t;t=pr(t);var e=_r.test(t);return e||yr.test(t)?vr(t.slice(2),e?2:8):gr.test(t)?NaN:+t}var xr=function(){return er.Date.now()},br=Math.max,wr=Math.min;function kr(t,n,e){var r,i,o,a,u,s,l=0,c=!1,h=!1,f=!0;if("function"!=typeof t)throw new TypeError("Expected a function");function p(n){var e=r,o=i;return r=i=void 0,l=n,a=t.apply(o,e)}function d(t){var e=t-s;return void 0===s||e>=n||e<0||h&&t-l>=o}function g(){var t=xr();if(d(t))return _(t);u=setTimeout(g,function(t){var e=n-(t-s);return h?wr(e,o-(t-l)):e}(t))}function _(t){return u=void 0,f&&r?p(t):(r=i=void 0,a)}function y(){var t=xr(),e=d(t);if(r=arguments,i=this,s=t,e){if(void 0===u)return function(t){return l=t,u=setTimeout(g,n),c?p(t):a}(s);if(h)return clearTimeout(u),u=setTimeout(g,n),p(s)}return void 0===u&&(u=setTimeout(g,n)),a}return n=mr(n)||0,dr(e)&&(c=!!e.leading,o=(h="maxWait"in e)?br(mr(e.maxWait)||0,n):o,f="trailing"in e?!!e.trailing:f),y.cancel=function(){void 0!==u&&clearTimeout(u),l=0,r=s=i=u=void 0},y.flush=function(){return void 0===u?a:_(xr())},y}var Mr=Object.freeze({Linear:Object.freeze({None:function(t){return t},In:function(t){return t},Out:function(t){return t},InOut:function(t){return t}}),Quadratic:Object.freeze({In:function(t){return t*t},Out:function(t){return t*(2-t)},InOut:function(t){return(t*=2)<1?.5*t*t:-.5*(--t*(t-2)-1)}}),Cubic:Object.freeze({In:function(t){return t*t*t},Out:function(t){return--t*t*t+1},InOut:function(t){return(t*=2)<1?.5*t*t*t:.5*((t-=2)*t*t+2)}}),Quartic:Object.freeze({In:function(t){return t*t*t*t},Out:function(t){return 1- --t*t*t*t},InOut:function(t){return(t*=2)<1?.5*t*t*t*t:-.5*((t-=2)*t*t*t-2)}}),Quintic:Object.freeze({In:function(t){return t*t*t*t*t},Out:function(t){return--t*t*t*t*t+1},InOut:function(t){return(t*=2)<1?.5*t*t*t*t*t:.5*((t-=2)*t*t*t*t+2)}}),Sinusoidal:Object.freeze({In:function(t){return 1-Math.sin((1-t)*Math.PI/2)},Out:function(t){return Math.sin(t*Math.PI/2)},InOut:function(t){return.5*(1-Math.sin(Math.PI*(.5-t)))}}),Exponential:Object.freeze({In:function(t){return 0===t?0:Math.pow(1024,t-1)},Out:function(t){return 1===t?1:1-Math.pow(2,-10*t)},InOut:function(t){return 0===t?0:1===t?1:(t*=2)<1?.5*Math.pow(1024,t-1):.5*(2-Math.pow(2,-10*(t-1)))}}),Circular:Object.freeze({In:function(t){return 1-Math.sqrt(1-t*t)},Out:function(t){return Math.sqrt(1- --t*t)},InOut:function(t){return(t*=2)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)}}),Elastic:Object.freeze({In:function(t){return 0===t?0:1===t?1:-Math.pow(2,10*(t-1))*Math.sin(5*(t-1.1)*Math.PI)},Out:function(t){return 0===t?0:1===t?1:Math.pow(2,-10*t)*Math.sin(5*(t-.1)*Math.PI)+1},InOut:function(t){return 0===t?0:1===t?1:(t*=2)<1?-.5*Math.pow(2,10*(t-1))*Math.sin(5*(t-1.1)*Math.PI):.5*Math.pow(2,-10*(t-1))*Math.sin(5*(t-1.1)*Math.PI)+1}}),Back:Object.freeze({In:function(t){var n=1.70158;return 1===t?1:t*t*((n+1)*t-n)},Out:function(t){var n=1.70158;return 0===t?0:--t*t*((n+1)*t+n)+1},InOut:function(t){var n=2.5949095;return(t*=2)<1?t*t*((n+1)*t-n)*.5:.5*((t-=2)*t*((n+1)*t+n)+2)}}),Bounce:Object.freeze({In:function(t){return 1-Mr.Bounce.Out(1-t)},Out:function(t){return t<1/2.75?7.5625*t*t:t<2/2.75?7.5625*(t-=1.5/2.75)*t+.75:t<2.5/2.75?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375},InOut:function(t){return t<.5?.5*Mr.Bounce.In(2*t):.5*Mr.Bounce.Out(2*t-1)+.5}}),generatePow:function(t){return void 0===t&&(t=4),t=(t=t<Number.EPSILON?Number.EPSILON:t)>1e4?1e4:t,{In:function(n){return Math.pow(n,t)},Out:function(n){return 1-Math.pow(1-n,t)},InOut:function(n){return n<.5?Math.pow(2*n,t)/2:(1-Math.pow(2-2*n,t))/2+.5}}}}),Ar=function(){return performance.now()},zr=function(){function t(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];this._tweens={},this._tweensAddedDuringUpdate={},this.add.apply(this,t)}return t.prototype.getAll=function(){var t=this;return Object.keys(this._tweens).map(function(n){return t._tweens[n]})},t.prototype.removeAll=function(){this._tweens={}},t.prototype.add=function(){for(var t,n=[],e=0;e<arguments.length;e++)n[e]=arguments[e];for(var r=0,i=n;r<i.length;r++){var o=i[r];null===(t=o._group)||void 0===t||t.remove(o),o._group=this,this._tweens[o.getId()]=o,this._tweensAddedDuringUpdate[o.getId()]=o}},t.prototype.remove=function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];for(var e=0,r=t;e<r.length;e++){var i=r[e];i._group=void 0,delete this._tweens[i.getId()],delete this._tweensAddedDuringUpdate[i.getId()]}},t.prototype.allStopped=function(){return this.getAll().every(function(t){return!t.isPlaying()})},t.prototype.update=function(t,n){void 0===t&&(t=Ar()),void 0===n&&(n=!0);var e=Object.keys(this._tweens);if(0!==e.length)for(;e.length>0;){this._tweensAddedDuringUpdate={};for(var r=0;r<e.length;r++){var i=this._tweens[e[r]],o=!n;i&&!1===i.update(t,o)&&!n&&this.remove(i)}e=Object.keys(this._tweensAddedDuringUpdate)}},t}(),Sr={Linear:function(t,n){var e=t.length-1,r=e*n,i=Math.floor(r),o=Sr.Utils.Linear;return n<0?o(t[0],t[1],r):n>1?o(t[e],t[e-1],e-r):o(t[i],t[i+1>e?e:i+1],r-i)},Utils:{Linear:function(t,n,e){return(n-t)*e+t}}},Cr=function(){function t(){}return t.nextId=function(){return t._nextId++},t._nextId=0,t}(),Er=new zr,Pr=function(){function t(t,n){this._isPaused=!1,this._pauseStart=0,this._valuesStart={},this._valuesEnd={},this._valuesStartRepeat={},this._duration=1e3,this._isDynamic=!1,this._initialRepeat=0,this._repeat=0,this._yoyo=!1,this._isPlaying=!1,this._reversed=!1,this._delayTime=0,this._startTime=0,this._easingFunction=Mr.Linear.None,this._interpolationFunction=Sr.Linear,this._chainedTweens=[],this._onStartCallbackFired=!1,this._onEveryStartCallbackFired=!1,this._id=Cr.nextId(),this._isChainStopped=!1,this._propertiesAreSetUp=!1,this._goToEnd=!1,this._object=t,"object"==typeof n?(this._group=n,n.add(this)):!0===n&&(this._group=Er,Er.add(this))}return t.prototype.getId=function(){return this._id},t.prototype.isPlaying=function(){return this._isPlaying},t.prototype.isPaused=function(){return this._isPaused},t.prototype.getDuration=function(){return this._duration},t.prototype.to=function(t,n){if(void 0===n&&(n=1e3),this._isPlaying)throw new Error("Can not call Tween.to() while Tween is already started or paused. Stop the Tween first.");return this._valuesEnd=t,this._propertiesAreSetUp=!1,this._duration=n<0?0:n,this},t.prototype.duration=function(t){return void 0===t&&(t=1e3),this._duration=t<0?0:t,this},t.prototype.dynamic=function(t){return void 0===t&&(t=!1),this._isDynamic=t,this},t.prototype.start=function(t,n){if(void 0===t&&(t=Ar()),void 0===n&&(n=!1),this._isPlaying)return this;if(this._repeat=this._initialRepeat,this._reversed)for(var e in this._reversed=!1,this._valuesStartRepeat)this._swapEndStartRepeatValues(e),this._valuesStart[e]=this._valuesStartRepeat[e];if(this._isPlaying=!0,this._isPaused=!1,this._onStartCallbackFired=!1,this._onEveryStartCallbackFired=!1,this._isChainStopped=!1,this._startTime=t,this._startTime+=this._delayTime,!this._propertiesAreSetUp||n){if(this._propertiesAreSetUp=!0,!this._isDynamic){var r={};for(var i in this._valuesEnd)r[i]=this._valuesEnd[i];this._valuesEnd=r}this._setupProperties(this._object,this._valuesStart,this._valuesEnd,this._valuesStartRepeat,n)}return this},t.prototype.startFromCurrentValues=function(t){return this.start(t,!0)},t.prototype._setupProperties=function(t,n,e,r,i){for(var o in e){var a=t[o],u=Array.isArray(a),s=u?"array":typeof a,l=!u&&Array.isArray(e[o]);if("undefined"!==s&&"function"!==s){if(l){if(0===(_=e[o]).length)continue;for(var c=[a],h=0,f=_.length;h<f;h+=1){var p=this._handleRelativeValue(a,_[h]);if(isNaN(p)){l=!1,console.warn("Found invalid interpolation list. Skipping.");break}c.push(p)}l&&(e[o]=c)}if("object"!==s&&!u||!a||l)(void 0===n[o]||i)&&(n[o]=a),u||(n[o]*=1),r[o]=l?e[o].slice().reverse():n[o]||0;else{n[o]=u?[]:{};var d=a;for(var g in d)n[o][g]=d[g];r[o]=u?[]:{};var _=e[o];if(!this._isDynamic){var y={};for(var g in _)y[g]=_[g];e[o]=_=y}this._setupProperties(d,n[o],_,r[o],i)}}}},t.prototype.stop=function(){return this._isChainStopped||(this._isChainStopped=!0,this.stopChainedTweens()),this._isPlaying?(this._isPlaying=!1,this._isPaused=!1,this._onStopCallback&&this._onStopCallback(this._object),this):this},t.prototype.end=function(){return this._goToEnd=!0,this.update(this._startTime+this._duration),this},t.prototype.pause=function(t){return void 0===t&&(t=Ar()),this._isPaused||!this._isPlaying||(this._isPaused=!0,this._pauseStart=t),this},t.prototype.resume=function(t){return void 0===t&&(t=Ar()),this._isPaused&&this._isPlaying?(this._isPaused=!1,this._startTime+=t-this._pauseStart,this._pauseStart=0,this):this},t.prototype.stopChainedTweens=function(){for(var t=0,n=this._chainedTweens.length;t<n;t++)this._chainedTweens[t].stop();return this},t.prototype.group=function(t){return t?(t.add(this),this):(console.warn("tween.group() without args has been removed, use group.add(tween) instead."),this)},t.prototype.remove=function(){var t;return null===(t=this._group)||void 0===t||t.remove(this),this},t.prototype.delay=function(t){return void 0===t&&(t=0),this._delayTime=t,this},t.prototype.repeat=function(t){return void 0===t&&(t=0),this._initialRepeat=t,this._repeat=t,this},t.prototype.repeatDelay=function(t){return this._repeatDelayTime=t,this},t.prototype.yoyo=function(t){return void 0===t&&(t=!1),this._yoyo=t,this},t.prototype.easing=function(t){return void 0===t&&(t=Mr.Linear.None),this._easingFunction=t,this},t.prototype.interpolation=function(t){return void 0===t&&(t=Sr.Linear),this._interpolationFunction=t,this},t.prototype.chain=function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];return this._chainedTweens=t,this},t.prototype.onStart=function(t){return this._onStartCallback=t,this},t.prototype.onEveryStart=function(t){return this._onEveryStartCallback=t,this},t.prototype.onUpdate=function(t){return this._onUpdateCallback=t,this},t.prototype.onRepeat=function(t){return this._onRepeatCallback=t,this},t.prototype.onComplete=function(t){return this._onCompleteCallback=t,this},t.prototype.onStop=function(t){return this._onStopCallback=t,this},t.prototype.update=function(n,e){var r,i,o=this;if(void 0===n&&(n=Ar()),void 0===e&&(e=t.autoStartOnUpdate),this._isPaused)return!0;if(!this._goToEnd&&!this._isPlaying){if(!e)return!1;this.start(n,!0)}if(this._goToEnd=!1,n<this._startTime)return!0;!1===this._onStartCallbackFired&&(this._onStartCallback&&this._onStartCallback(this._object),this._onStartCallbackFired=!0),!1===this._onEveryStartCallbackFired&&(this._onEveryStartCallback&&this._onEveryStartCallback(this._object),this._onEveryStartCallbackFired=!0);var a=n-this._startTime,u=this._duration+(null!==(r=this._repeatDelayTime)&&void 0!==r?r:this._delayTime),s=this._duration+this._repeat*u,l=function(){if(0===o._duration)return 1;if(a>s)return 1;var t=Math.trunc(a/u),n=a-t*u,e=Math.min(n/o._duration,1);return 0===e&&a===o._duration?1:e}(),c=this._easingFunction(l);if(this._updateProperties(this._object,this._valuesStart,this._valuesEnd,c),this._onUpdateCallback&&this._onUpdateCallback(this._object,l),0===this._duration||a>=this._duration){if(this._repeat>0){var h=Math.min(Math.trunc((a-this._duration)/u)+1,this._repeat);for(i in isFinite(this._repeat)&&(this._repeat-=h),this._valuesStartRepeat)this._yoyo||"string"!=typeof this._valuesEnd[i]||(this._valuesStartRepeat[i]=this._valuesStartRepeat[i]+parseFloat(this._valuesEnd[i])),this._yoyo&&this._swapEndStartRepeatValues(i),this._valuesStart[i]=this._valuesStartRepeat[i];return this._yoyo&&(this._reversed=!this._reversed),this._startTime+=u*h,this._onRepeatCallback&&this._onRepeatCallback(this._object),this._onEveryStartCallbackFired=!1,!0}this._onCompleteCallback&&this._onCompleteCallback(this._object);for(var f=0,p=this._chainedTweens.length;f<p;f++)this._chainedTweens[f].start(this._startTime+this._duration,!1);return this._isPlaying=!1,!1}return!0},t.prototype._updateProperties=function(t,n,e,r){for(var i in e)if(void 0!==n[i]){var o=n[i]||0,a=e[i],u=Array.isArray(t[i]),s=Array.isArray(a);!u&&s?t[i]=this._interpolationFunction(a,r):"object"==typeof a&&a?this._updateProperties(t[i],o,a,r):"number"==typeof(a=this._handleRelativeValue(o,a))&&(t[i]=o+(a-o)*r)}},t.prototype._handleRelativeValue=function(t,n){return"string"!=typeof n?n:"+"===n.charAt(0)||"-"===n.charAt(0)?t+parseFloat(n):parseFloat(n)},t.prototype._swapEndStartRepeatValues=function(t){var n=this._valuesStartRepeat[t],e=this._valuesEnd[t];this._valuesStartRepeat[t]="string"==typeof e?this._valuesStartRepeat[t]+parseFloat(e):this._valuesEnd[t],this._valuesEnd[t]=n},t.autoStartOnUpdate=!1,t}();Cr.nextId;var Or=Er;function Nr(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=Array(n);e<n;e++)r[e]=t[e];return r}function jr(t,n,e){return Object.defineProperty(t,"prototype",{writable:!1}),t}function Tr(t,n){return function(t){if(Array.isArray(t))return t}(t)||function(t,n){var e=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=e){var r,i,o,a,u=[],s=!0,l=!1;try{if(o=(e=e.call(t)).next,0===n);else for(;!(s=(r=o.call(e)).done)&&(u.push(r.value),u.length!==n);s=!0);}catch(t){l=!0,i=t}finally{try{if(!s&&null!=e.return&&(a=e.return(),Object(a)!==a))return}finally{if(l)throw i}}return u}}(t,n)||function(t,n){if(t){if("string"==typeof t)return Nr(t,n);var e={}.toString.call(t).slice(8,-1);return"Object"===e&&t.constructor&&(e=t.constructor.name),"Map"===e||"Set"===e?Array.from(t):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?Nr(t,n):void 0}}(t,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}Or.getAll.bind(Or),Or.removeAll.bind(Or),Or.add.bind(Or),Or.remove.bind(Or),Or.update.bind(Or);var Rr=jr(function t(n,e){var r=e.default,i=void 0===r?null:r,o=e.triggerUpdate,a=void 0===o||o,u=e.onChange,s=void 0===u?function(t,n){}:u;!function(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}(this,t),this.name=n,this.defaultVal=i,this.triggerUpdate=a,this.onChange=s});function Dr(t){var n=t.stateInit,e=void 0===n?function(){return{}}:n,r=t.props,i=void 0===r?{}:r,o=t.methods,a=void 0===o?{}:o,u=t.aliases,s=void 0===u?{}:u,l=t.init,c=void 0===l?function(){}:l,h=t.update,f=void 0===h?function(){}:h,p=Object.keys(i).map(function(t){return new Rr(t,i[t])});return function t(){for(var n=arguments.length,r=new Array(n),i=0;i<n;i++)r[i]=arguments[i];var o=!!(this instanceof t?this.constructor:void 0),u=o?r.shift():void 0,l=r[0],h=void 0===l?{}:l,d=Object.assign({},e instanceof Function?e(h):e,{initialised:!1}),g={};function _(t){return y(t,h),v(),_}var y=function(t,n){c.call(_,t,d,n),d.initialised=!0},v=kr(function(){d.initialised&&(f.call(_,d,g),g={})},1);return p.forEach(function(t){_[t.name]=function(t){var n=t.name,e=t.triggerUpdate,r=void 0!==e&&e,i=t.onChange,o=void 0===i?function(t,n){}:i,a=t.defaultVal,u=void 0===a?null:a;return function(t){var e=d[n];if(!arguments.length)return e;var i=void 0===t?u:t;return d[n]=i,o.call(_,i,d,e),!g.hasOwnProperty(n)&&(g[n]=e),r&&v(),_}}(t)}),Object.keys(a).forEach(function(t){_[t]=function(){for(var n,e=arguments.length,r=new Array(e),i=0;i<e;i++)r[i]=arguments[i];return(n=a[t]).call.apply(n,[_,d].concat(r))}}),Object.entries(s).forEach(function(t){var n=Tr(t,2),e=n[0],r=n[1];return _[e]=_[r]}),_.resetProps=function(){return p.forEach(function(t){_[t.name](t.defaultVal)}),_},_.resetProps(),d._rerender=v,o&&u&&_(u),_}}var Ir=function(t){return"function"==typeof t?t:"string"==typeof t?function(n){return n[t]}:function(n){return t}};function Ur(t){return Ur="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},Ur(t)}var Fr=/^\\s+/,Lr=/\\s+$/;function qr(t,n){if(n=n||{},(t=t||"")instanceof qr)return t;if(!(this instanceof qr))return new qr(t,n);var e=function(t){var n={r:0,g:0,b:0},e=1,r=null,i=null,o=null,a=!1,u=!1;"string"==typeof t&&(t=function(t){t=t.replace(Fr,"").replace(Lr,"").toLowerCase();var n,e=!1;if(ii[t])t=ii[t],e=!0;else if("transparent"==t)return{r:0,g:0,b:0,a:0,format:"name"};if(n=yi.rgb.exec(t))return{r:n[1],g:n[2],b:n[3]};if(n=yi.rgba.exec(t))return{r:n[1],g:n[2],b:n[3],a:n[4]};if(n=yi.hsl.exec(t))return{h:n[1],s:n[2],l:n[3]};if(n=yi.hsla.exec(t))return{h:n[1],s:n[2],l:n[3],a:n[4]};if(n=yi.hsv.exec(t))return{h:n[1],s:n[2],v:n[3]};if(n=yi.hsva.exec(t))return{h:n[1],s:n[2],v:n[3],a:n[4]};if(n=yi.hex8.exec(t))return{r:li(n[1]),g:li(n[2]),b:li(n[3]),a:pi(n[4]),format:e?"name":"hex8"};if(n=yi.hex6.exec(t))return{r:li(n[1]),g:li(n[2]),b:li(n[3]),format:e?"name":"hex"};if(n=yi.hex4.exec(t))return{r:li(n[1]+""+n[1]),g:li(n[2]+""+n[2]),b:li(n[3]+""+n[3]),a:pi(n[4]+""+n[4]),format:e?"name":"hex8"};if(n=yi.hex3.exec(t))return{r:li(n[1]+""+n[1]),g:li(n[2]+""+n[2]),b:li(n[3]+""+n[3]),format:e?"name":"hex"};return!1}(t));"object"==Ur(t)&&(vi(t.r)&&vi(t.g)&&vi(t.b)?(n=function(t,n,e){return{r:255*ui(t,255),g:255*ui(n,255),b:255*ui(e,255)}}(t.r,t.g,t.b),a=!0,u="%"===String(t.r).substr(-1)?"prgb":"rgb"):vi(t.h)&&vi(t.s)&&vi(t.v)?(r=hi(t.s),i=hi(t.v),n=function(t,n,e){t=6*ui(t,360),n=ui(n,100),e=ui(e,100);var r=Math.floor(t),i=t-r,o=e*(1-n),a=e*(1-i*n),u=e*(1-(1-i)*n),s=r%6,l=[e,a,o,o,u,e][s],c=[u,e,e,a,o,o][s],h=[o,o,u,e,e,a][s];return{r:255*l,g:255*c,b:255*h}}(t.h,r,i),a=!0,u="hsv"):vi(t.h)&&vi(t.s)&&vi(t.l)&&(r=hi(t.s),o=hi(t.l),n=function(t,n,e){var r,i,o;function a(t,n,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?t+6*(n-t)*e:e<.5?n:e<2/3?t+(n-t)*(2/3-e)*6:t}if(t=ui(t,360),n=ui(n,100),e=ui(e,100),0===n)r=i=o=e;else{var u=e<.5?e*(1+n):e+n-e*n,s=2*e-u;r=a(s,u,t+1/3),i=a(s,u,t),o=a(s,u,t-1/3)}return{r:255*r,g:255*i,b:255*o}}(t.h,r,o),a=!0,u="hsl"),t.hasOwnProperty("a")&&(e=t.a));return e=ai(e),{ok:a,format:t.format||u,r:Math.min(255,Math.max(n.r,0)),g:Math.min(255,Math.max(n.g,0)),b:Math.min(255,Math.max(n.b,0)),a:e}}(t);this._originalInput=t,this._r=e.r,this._g=e.g,this._b=e.b,this._a=e.a,this._roundA=Math.round(100*this._a)/100,this._format=n.format||e.format,this._gradientType=n.gradientType,this._r<1&&(this._r=Math.round(this._r)),this._g<1&&(this._g=Math.round(this._g)),this._b<1&&(this._b=Math.round(this._b)),this._ok=e.ok}function $r(t,n,e){t=ui(t,255),n=ui(n,255),e=ui(e,255);var r,i,o=Math.max(t,n,e),a=Math.min(t,n,e),u=(o+a)/2;if(o==a)r=i=0;else{var s=o-a;switch(i=u>.5?s/(2-o-a):s/(o+a),o){case t:r=(n-e)/s+(n<e?6:0);break;case n:r=(e-t)/s+2;break;case e:r=(t-n)/s+4}r/=6}return{h:r,s:i,l:u}}function Br(t,n,e){t=ui(t,255),n=ui(n,255),e=ui(e,255);var r,i,o=Math.max(t,n,e),a=Math.min(t,n,e),u=o,s=o-a;if(i=0===o?0:s/o,o==a)r=0;else{switch(o){case t:r=(n-e)/s+(n<e?6:0);break;case n:r=(e-t)/s+2;break;case e:r=(t-n)/s+4}r/=6}return{h:r,s:i,v:u}}function Hr(t,n,e,r){var i=[ci(Math.round(t).toString(16)),ci(Math.round(n).toString(16)),ci(Math.round(e).toString(16))];return r&&i[0].charAt(0)==i[0].charAt(1)&&i[1].charAt(0)==i[1].charAt(1)&&i[2].charAt(0)==i[2].charAt(1)?i[0].charAt(0)+i[1].charAt(0)+i[2].charAt(0):i.join("")}function Vr(t,n,e,r){return[ci(fi(r)),ci(Math.round(t).toString(16)),ci(Math.round(n).toString(16)),ci(Math.round(e).toString(16))].join("")}function Xr(t,n){n=0===n?0:n||10;var e=qr(t).toHsl();return e.s-=n/100,e.s=si(e.s),qr(e)}function Gr(t,n){n=0===n?0:n||10;var e=qr(t).toHsl();return e.s+=n/100,e.s=si(e.s),qr(e)}function Yr(t){return qr(t).desaturate(100)}function Wr(t,n){n=0===n?0:n||10;var e=qr(t).toHsl();return e.l+=n/100,e.l=si(e.l),qr(e)}function Zr(t,n){n=0===n?0:n||10;var e=qr(t).toRgb();return e.r=Math.max(0,Math.min(255,e.r-Math.round(-n/100*255))),e.g=Math.max(0,Math.min(255,e.g-Math.round(-n/100*255))),e.b=Math.max(0,Math.min(255,e.b-Math.round(-n/100*255))),qr(e)}function Qr(t,n){n=0===n?0:n||10;var e=qr(t).toHsl();return e.l-=n/100,e.l=si(e.l),qr(e)}function Kr(t,n){var e=qr(t).toHsl(),r=(e.h+n)%360;return e.h=r<0?360+r:r,qr(e)}function Jr(t){var n=qr(t).toHsl();return n.h=(n.h+180)%360,qr(n)}function ti(t,n){if(isNaN(n)||n<=0)throw new Error("Argument to polyad must be a positive number");for(var e=qr(t).toHsl(),r=[qr(t)],i=360/n,o=1;o<n;o++)r.push(qr({h:(e.h+o*i)%360,s:e.s,l:e.l}));return r}function ni(t){var n=qr(t).toHsl(),e=n.h;return[qr(t),qr({h:(e+72)%360,s:n.s,l:n.l}),qr({h:(e+216)%360,s:n.s,l:n.l})]}function ei(t,n,e){n=n||6,e=e||30;var r=qr(t).toHsl(),i=360/e,o=[qr(t)];for(r.h=(r.h-(i*n>>1)+720)%360;--n;)r.h=(r.h+i)%360,o.push(qr(r));return o}function ri(t,n){n=n||6;for(var e=qr(t).toHsv(),r=e.h,i=e.s,o=e.v,a=[],u=1/n;n--;)a.push(qr({h:r,s:i,v:o})),o=(o+u)%1;return a}qr.prototype={isDark:function(){return this.getBrightness()<128},isLight:function(){return!this.isDark()},isValid:function(){return this._ok},getOriginalInput:function(){return this._originalInput},getFormat:function(){return this._format},getAlpha:function(){return this._a},getBrightness:function(){var t=this.toRgb();return(299*t.r+587*t.g+114*t.b)/1e3},getLuminance:function(){var t,n,e,r=this.toRgb();return t=r.r/255,n=r.g/255,e=r.b/255,.2126*(t<=.03928?t/12.92:Math.pow((t+.055)/1.055,2.4))+.7152*(n<=.03928?n/12.92:Math.pow((n+.055)/1.055,2.4))+.0722*(e<=.03928?e/12.92:Math.pow((e+.055)/1.055,2.4))},setAlpha:function(t){return this._a=ai(t),this._roundA=Math.round(100*this._a)/100,this},toHsv:function(){var t=Br(this._r,this._g,this._b);return{h:360*t.h,s:t.s,v:t.v,a:this._a}},toHsvString:function(){var t=Br(this._r,this._g,this._b),n=Math.round(360*t.h),e=Math.round(100*t.s),r=Math.round(100*t.v);return 1==this._a?"hsv("+n+", "+e+"%, "+r+"%)":"hsva("+n+", "+e+"%, "+r+"%, "+this._roundA+")"},toHsl:function(){var t=$r(this._r,this._g,this._b);return{h:360*t.h,s:t.s,l:t.l,a:this._a}},toHslString:function(){var t=$r(this._r,this._g,this._b),n=Math.round(360*t.h),e=Math.round(100*t.s),r=Math.round(100*t.l);return 1==this._a?"hsl("+n+", "+e+"%, "+r+"%)":"hsla("+n+", "+e+"%, "+r+"%, "+this._roundA+")"},toHex:function(t){return Hr(this._r,this._g,this._b,t)},toHexString:function(t){return"#"+this.toHex(t)},toHex8:function(t){return function(t,n,e,r,i){var o=[ci(Math.round(t).toString(16)),ci(Math.round(n).toString(16)),ci(Math.round(e).toString(16)),ci(fi(r))];if(i&&o[0].charAt(0)==o[0].charAt(1)&&o[1].charAt(0)==o[1].charAt(1)&&o[2].charAt(0)==o[2].charAt(1)&&o[3].charAt(0)==o[3].charAt(1))return o[0].charAt(0)+o[1].charAt(0)+o[2].charAt(0)+o[3].charAt(0);return o.join("")}(this._r,this._g,this._b,this._a,t)},toHex8String:function(t){return"#"+this.toHex8(t)},toRgb:function(){return{r:Math.round(this._r),g:Math.round(this._g),b:Math.round(this._b),a:this._a}},toRgbString:function(){return 1==this._a?"rgb("+Math.round(this._r)+", "+Math.round(this._g)+", "+Math.round(this._b)+")":"rgba("+Math.round(this._r)+", "+Math.round(this._g)+", "+Math.round(this._b)+", "+this._roundA+")"},toPercentageRgb:function(){return{r:Math.round(100*ui(this._r,255))+"%",g:Math.round(100*ui(this._g,255))+"%",b:Math.round(100*ui(this._b,255))+"%",a:this._a}},toPercentageRgbString:function(){return 1==this._a?"rgb("+Math.round(100*ui(this._r,255))+"%, "+Math.round(100*ui(this._g,255))+"%, "+Math.round(100*ui(this._b,255))+"%)":"rgba("+Math.round(100*ui(this._r,255))+"%, "+Math.round(100*ui(this._g,255))+"%, "+Math.round(100*ui(this._b,255))+"%, "+this._roundA+")"},toName:function(){return 0===this._a?"transparent":!(this._a<1)&&(oi[Hr(this._r,this._g,this._b,!0)]||!1)},toFilter:function(t){var n="#"+Vr(this._r,this._g,this._b,this._a),e=n,r=this._gradientType?"GradientType = 1, ":"";if(t){var i=qr(t);e="#"+Vr(i._r,i._g,i._b,i._a)}return"progid:DXImageTransform.Microsoft.gradient("+r+"startColorstr="+n+",endColorstr="+e+")"},toString:function(t){var n=!!t;t=t||this._format;var e=!1,r=this._a<1&&this._a>=0;return n||!r||"hex"!==t&&"hex6"!==t&&"hex3"!==t&&"hex4"!==t&&"hex8"!==t&&"name"!==t?("rgb"===t&&(e=this.toRgbString()),"prgb"===t&&(e=this.toPercentageRgbString()),"hex"!==t&&"hex6"!==t||(e=this.toHexString()),"hex3"===t&&(e=this.toHexString(!0)),"hex4"===t&&(e=this.toHex8String(!0)),"hex8"===t&&(e=this.toHex8String()),"name"===t&&(e=this.toName()),"hsl"===t&&(e=this.toHslString()),"hsv"===t&&(e=this.toHsvString()),e||this.toHexString()):"name"===t&&0===this._a?this.toName():this.toRgbString()},clone:function(){return qr(this.toString())},_applyModification:function(t,n){var e=t.apply(null,[this].concat([].slice.call(n)));return this._r=e._r,this._g=e._g,this._b=e._b,this.setAlpha(e._a),this},lighten:function(){return this._applyModification(Wr,arguments)},brighten:function(){return this._applyModification(Zr,arguments)},darken:function(){return this._applyModification(Qr,arguments)},desaturate:function(){return this._applyModification(Xr,arguments)},saturate:function(){return this._applyModification(Gr,arguments)},greyscale:function(){return this._applyModification(Yr,arguments)},spin:function(){return this._applyModification(Kr,arguments)},_applyCombination:function(t,n){return t.apply(null,[this].concat([].slice.call(n)))},analogous:function(){return this._applyCombination(ei,arguments)},complement:function(){return this._applyCombination(Jr,arguments)},monochromatic:function(){return this._applyCombination(ri,arguments)},splitcomplement:function(){return this._applyCombination(ni,arguments)},triad:function(){return this._applyCombination(ti,[3])},tetrad:function(){return this._applyCombination(ti,[4])}},qr.fromRatio=function(t,n){if("object"==Ur(t)){var e={};for(var r in t)t.hasOwnProperty(r)&&(e[r]="a"===r?t[r]:hi(t[r]));t=e}return qr(t,n)},qr.equals=function(t,n){return!(!t||!n)&&qr(t).toRgbString()==qr(n).toRgbString()},qr.random=function(){return qr.fromRatio({r:Math.random(),g:Math.random(),b:Math.random()})},qr.mix=function(t,n,e){e=0===e?0:e||50;var r=qr(t).toRgb(),i=qr(n).toRgb(),o=e/100;return qr({r:(i.r-r.r)*o+r.r,g:(i.g-r.g)*o+r.g,b:(i.b-r.b)*o+r.b,a:(i.a-r.a)*o+r.a})},
// <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)
// Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
qr.readability=function(t,n){var e=qr(t),r=qr(n);return(Math.max(e.getLuminance(),r.getLuminance())+.05)/(Math.min(e.getLuminance(),r.getLuminance())+.05)},qr.isReadable=function(t,n,e){var r,i,o=qr.readability(t,n);switch(i=!1,(r=function(t){var n,e;n=((t=t||{level:"AA",size:"small"}).level||"AA").toUpperCase(),e=(t.size||"small").toLowerCase(),"AA"!==n&&"AAA"!==n&&(n="AA");"small"!==e&&"large"!==e&&(e="small");return{level:n,size:e}}(e)).level+r.size){case"AAsmall":case"AAAlarge":i=o>=4.5;break;case"AAlarge":i=o>=3;break;case"AAAsmall":i=o>=7}return i},qr.mostReadable=function(t,n,e){var r,i,o,a,u=null,s=0;i=(e=e||{}).includeFallbackColors,o=e.level,a=e.size;for(var l=0;l<n.length;l++)(r=qr.readability(t,n[l]))>s&&(s=r,u=qr(n[l]));return qr.isReadable(t,u,{level:o,size:a})||!i?u:(e.includeFallbackColors=!1,qr.mostReadable(t,["#fff","#000"],e))};var ii=qr.names={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"0ff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000",blanchedalmond:"ffebcd",blue:"00f",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",burntsienna:"ea7e5d",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"0ff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkgrey:"a9a9a9",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkslategrey:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dimgrey:"696969",dodgerblue:"1e90ff",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"f0f",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",grey:"808080",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgray:"d3d3d3",lightgreen:"90ee90",lightgrey:"d3d3d3",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslategray:"789",lightslategrey:"789",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"0f0",limegreen:"32cd32",linen:"faf0e6",magenta:"f0f",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370db",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"db7093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",rebeccapurple:"663399",red:"f00",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",slategrey:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",wheat:"f5deb3",white:"fff",whitesmoke:"f5f5f5",yellow:"ff0",yellowgreen:"9acd32"},oi=qr.hexNames=function(t){var n={};for(var e in t)t.hasOwnProperty(e)&&(n[t[e]]=e);return n}(ii);function ai(t){return t=parseFloat(t),(isNaN(t)||t<0||t>1)&&(t=1),t}function ui(t,n){(function(t){return"string"==typeof t&&-1!=t.indexOf(".")&&1===parseFloat(t)})(t)&&(t="100%");var e=function(t){return"string"==typeof t&&-1!=t.indexOf("%")}(t);return t=Math.min(n,Math.max(0,parseFloat(t))),e&&(t=parseInt(t*n,10)/100),Math.abs(t-n)<1e-6?1:t%n/parseFloat(n)}function si(t){return Math.min(1,Math.max(0,t))}function li(t){return parseInt(t,16)}function ci(t){return 1==t.length?"0"+t:""+t}function hi(t){return t<=1&&(t=100*t+"%"),t}function fi(t){return Math.round(255*parseFloat(t)).toString(16)}function pi(t){return li(t)/255}var di,gi,_i,yi=(gi="[\\\\s|\\\\(]+("+(di="(?:[-\\\\+]?\\\\d*\\\\.\\\\d+%?)|(?:[-\\\\+]?\\\\d+%?)")+")[,|\\\\s]+("+di+")[,|\\\\s]+("+di+")\\\\s*\\\\)?",_i="[\\\\s|\\\\(]+("+di+")[,|\\\\s]+("+di+")[,|\\\\s]+("+di+")[,|\\\\s]+("+di+")\\\\s*\\\\)?",{CSS_UNIT:new RegExp(di),rgb:new RegExp("rgb"+gi),rgba:new RegExp("rgba"+_i),hsl:new RegExp("hsl"+gi),hsla:new RegExp("hsla"+_i),hsv:new RegExp("hsv"+gi),hsva:new RegExp("hsva"+_i),hex3:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex6:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,hex4:/^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,hex8:/^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/});function vi(t){return!!yi.CSS_UNIT.exec(t)}function mi(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=Array(n);e<n;e++)r[e]=t[e];return r}function xi(t,n,e){if("function"==typeof t?t===n:t.has(n))return arguments.length<3?n:e;throw new TypeError("Private element is not present on this object")}function bi(t,n){return t.get(xi(t,n))}function wi(t,n,e){(function(t,n){if(n.has(t))throw new TypeError("Cannot initialize the same private elements twice on an object")})(t,n),n.set(t,e)}function ki(t,n,e){return t.set(xi(t,n),e),e}function Mi(t,n,e){return n&&function(t,n){for(var e=0;e<n.length;e++){var r=n[e];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,zi(r.key),r)}}(t.prototype,n),Object.defineProperty(t,"prototype",{writable:!1}),t}function Ai(t){return function(t){if(Array.isArray(t))return mi(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||function(t,n){if(t){if("string"==typeof t)return mi(t,n);var e={}.toString.call(t).slice(8,-1);return"Object"===e&&t.constructor&&(e=t.constructor.name),"Map"===e||"Set"===e?Array.from(t):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?mi(t,n):void 0}}(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function zi(t){var n=function(t,n){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var r=e.call(t,n);if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t,"string");return"symbol"==typeof n?n:n+""}var Si,Ci,Ei,Pi,Oi,Ni,ji,Ti,Ri,Di,Ii,Ui,Fi,Li,qi,$i=function(t,n,e){return(t<<16)+(n<<8)+e},Bi=function(t,n){return 123*t%Math.pow(2,n)},Hi=new WeakMap,Vi=new WeakMap,Xi=function(){return Mi(function t(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:6;!function(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}(this,t),wi(this,Hi,void 0),wi(this,Vi,void 0),ki(Vi,this,n),this.reset()},[{key:"reset",value:function(){ki(Hi,this,["__reserved for background__"])}},{key:"register",value:function(t){if(bi(Hi,this).length>=Math.pow(2,24-bi(Vi,this)))return null;var n,e=bi(Hi,this).length,r=Bi(e,bi(Vi,this)),i=(n=e+(r<<24-bi(Vi,this)),"#".concat(Math.min(n,Math.pow(2,24)).toString(16).padStart(6,"0")));return bi(Hi,this).push(t),i}},{key:"lookup",value:function(t){if(!t)return null;var n="string"==typeof t?function(t){var n=qr(t).toRgb(),e=n.r,r=n.g,i=n.b;return $i(e,r,i)}(t):$i.apply(void 0,Ai(t));if(!n)return null;var e=n&Math.pow(2,24-bi(Vi,this))-1,r=n>>24-bi(Vi,this)&Math.pow(2,bi(Vi,this))-1;return Bi(e,bi(Vi,this))!==r||e>=bi(Hi,this).length?null:bi(Hi,this)[e]}}])}(),Gi={},Yi=[],Wi=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,Zi=Array.isArray;function Qi(t,n){for(var e in n)t[e]=n[e];return t}function Ki(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function Ji(t,n,e,r,i){var o={type:t,props:n,key:e,ref:r,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:null==i?++Ei:i,__i:-1,__u:0};return null==i&&null!=Ci.vnode&&Ci.vnode(o),o}function to(t){return t.children}function no(t,n){this.props=t,this.context=n}function eo(t,n){if(null==n)return t.__?eo(t.__,t.__i+1):null;for(var e;n<t.__k.length;n++)if(null!=(e=t.__k[n])&&null!=e.__e)return e.__e;return"function"==typeof t.type?eo(t):null}function ro(t){if(t.__P&&t.__d){var n=t.__v,e=n.__e,r=[],i=[],o=Qi({},n);o.__v=n.__v+1,Ci.vnode&&Ci.vnode(o),go(t.__P,o,n,t.__n,t.__P.namespaceURI,32&n.__u?[e]:null,r,null==e?eo(n):e,!!(32&n.__u),i),o.__v=n.__v,o.__.__k[o.__i]=o,yo(r,o,i),n.__e=n.__=null,o.__e!=e&&io(o)}}function io(t){if(null!=(t=t.__)&&null!=t.__c)return t.__e=t.__c.base=null,t.__k.some(function(n){if(null!=n&&null!=n.__e)return t.__e=t.__c.base=n.__e}),io(t)}function oo(t){(!t.__d&&(t.__d=!0)&&Oi.push(t)&&!ao.__r++||Ni!=Ci.debounceRendering)&&((Ni=Ci.debounceRendering)||ji)(ao)}function ao(){try{for(var t,n=1;Oi.length;)Oi.length>n&&Oi.sort(Ti),t=Oi.shift(),n=Oi.length,ro(t)}finally{Oi.length=ao.__r=0}}function uo(t,n,e,r,i,o,a,u,s,l,c){var h,f,p,d,g,_,y,v=r&&r.__k||Yi,m=n.length;for(s=so(e,n,v,s,m),h=0;h<m;h++)null!=(p=e.__k[h])&&(f=-1!=p.__i&&v[p.__i]||Gi,p.__i=h,_=go(t,p,f,i,o,a,u,s,l,c),d=p.__e,p.ref&&f.ref!=p.ref&&(f.ref&&xo(f.ref,null,p),c.push(p.ref,p.__c||d,p)),null==g&&null!=d&&(g=d),(y=!!(4&p.__u))||f.__k===p.__k?(s=lo(p,s,t,y),y&&f.__e&&(f.__e=null)):"function"==typeof p.type&&void 0!==_?s=_:d&&(s=d.nextSibling),p.__u&=-7);return e.__e=g,s}function so(t,n,e,r,i){var o,a,u,s,l,c=e.length,h=c,f=0;for(t.__k=new Array(i),o=0;o<i;o++)null!=(a=n[o])&&"boolean"!=typeof a&&"function"!=typeof a?("string"==typeof a||"number"==typeof a||"bigint"==typeof a||a.constructor==String?a=t.__k[o]=Ji(null,a,null,null,null):Zi(a)?a=t.__k[o]=Ji(to,{children:a},null,null,null):void 0===a.constructor&&a.__b>0?a=t.__k[o]=Ji(a.type,a.props,a.key,a.ref?a.ref:null,a.__v):t.__k[o]=a,s=o+f,a.__=t,a.__b=t.__b+1,u=null,-1!=(l=a.__i=co(a,e,s,h))&&(h--,(u=e[l])&&(u.__u|=2)),null==u||null==u.__v?(-1==l&&(i>c?f--:i<c&&f++),"function"!=typeof a.type&&(a.__u|=4)):l!=s&&(l==s-1?f--:l==s+1?f++:(l>s?f--:f++,a.__u|=4))):t.__k[o]=null;if(h)for(o=0;o<c;o++)null!=(u=e[o])&&!(2&u.__u)&&(u.__e==r&&(r=eo(u)),bo(u,u));return r}function lo(t,n,e,r){var i,o;if("function"==typeof t.type){for(i=t.__k,o=0;i&&o<i.length;o++)i[o]&&(i[o].__=t,n=lo(i[o],n,e,r));return n}t.__e!=n&&(r&&(n&&t.type&&!n.parentNode&&(n=eo(t)),e.insertBefore(t.__e,n||null)),n=t.__e);do{n=n&&n.nextSibling}while(null!=n&&8==n.nodeType);return n}function co(t,n,e,r){var i,o,a,u=t.key,s=t.type,l=n[e],c=null!=l&&!(2&l.__u);if(null===l&&null==u||c&&u==l.key&&s==l.type)return e;if(r>(c?1:0))for(i=e-1,o=e+1;i>=0||o<n.length;)if(null!=(l=n[a=i>=0?i--:o++])&&!(2&l.__u)&&u==l.key&&s==l.type)return a;return-1}function ho(t,n,e){"-"==n[0]?t.setProperty(n,null==e?"":e):t[n]=null==e?"":"number"!=typeof e||Wi.test(n)?e:e+"px"}function fo(t,n,e,r,i){var o,a;t:if("style"==n)if("string"==typeof e)t.style.cssText=e;else{if("string"==typeof r&&(t.style.cssText=r=""),r)for(n in r)e&&n in e||ho(t.style,n,"");if(e)for(n in e)r&&e[n]==r[n]||ho(t.style,n,e[n])}else if("o"==n[0]&&"n"==n[1])o=n!=(n=n.replace(Ui,"$1")),a=n.toLowerCase(),n=a in t||"onFocusOut"==n||"onFocusIn"==n?a.slice(2):n.slice(2),t.l||(t.l={}),t.l[n+o]=e,e?r?e[Ii]=r[Ii]:(e[Ii]=Fi,t.addEventListener(n,o?qi:Li,o)):t.removeEventListener(n,o?qi:Li,o);else{if("http://www.w3.org/2000/svg"==i)n=n.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("width"!=n&&"height"!=n&&"href"!=n&&"list"!=n&&"form"!=n&&"tabIndex"!=n&&"download"!=n&&"rowSpan"!=n&&"colSpan"!=n&&"role"!=n&&"popover"!=n&&n in t)try{t[n]=null==e?"":e;break t}catch(t){}"function"==typeof e||(null==e||!1===e&&"-"!=n[4]?t.removeAttribute(n):t.setAttribute(n,"popover"==n&&1==e?"":e))}}function po(t){return function(n){if(this.l){var e=this.l[n.type+t];if(null==n[Di])n[Di]=Fi++;else if(n[Di]<e[Ii])return;return e(Ci.event?Ci.event(n):n)}}}function go(t,n,e,r,i,o,a,u,s,l){var c,h,f,p,d,g,_,y,v,m,x,b,w,k,M,A=n.type;if(void 0!==n.constructor)return null;128&e.__u&&(s=!!(32&e.__u),o=[u=n.__e=e.__e]),(c=Ci.__b)&&c(n);t:if("function"==typeof A)try{if(y=n.props,v=A.prototype&&A.prototype.render,m=(c=A.contextType)&&r[c.__c],x=c?m?m.props.value:c.__:r,e.__c?_=(h=n.__c=e.__c).__=h.__E:(v?n.__c=h=new A(y,x):(n.__c=h=new no(y,x),h.constructor=A,h.render=wo),m&&m.sub(h),h.state||(h.state={}),h.__n=r,f=h.__d=!0,h.__h=[],h._sb=[]),v&&null==h.__s&&(h.__s=h.state),v&&null!=A.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=Qi({},h.__s)),Qi(h.__s,A.getDerivedStateFromProps(y,h.__s))),p=h.props,d=h.state,h.__v=n,f)v&&null==A.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),v&&null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else{if(v&&null==A.getDerivedStateFromProps&&y!==p&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(y,x),n.__v==e.__v||!h.__e&&null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(y,h.__s,x)){n.__v!=e.__v&&(h.props=y,h.state=h.__s,h.__d=!1),n.__e=e.__e,n.__k=e.__k,n.__k.some(function(t){t&&(t.__=n)}),Yi.push.apply(h.__h,h._sb),h._sb=[],h.__h.length&&a.push(h);break t}null!=h.componentWillUpdate&&h.componentWillUpdate(y,h.__s,x),v&&null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(p,d,g)})}if(h.context=x,h.props=y,h.__P=t,h.__e=!1,b=Ci.__r,w=0,v)h.state=h.__s,h.__d=!1,b&&b(n),c=h.render(h.props,h.state,h.context),Yi.push.apply(h.__h,h._sb),h._sb=[];else do{h.__d=!1,b&&b(n),c=h.render(h.props,h.state,h.context),h.state=h.__s}while(h.__d&&++w<25);h.state=h.__s,null!=h.getChildContext&&(r=Qi(Qi({},r),h.getChildContext())),v&&!f&&null!=h.getSnapshotBeforeUpdate&&(g=h.getSnapshotBeforeUpdate(p,d)),k=null!=c&&c.type===to&&null==c.key?vo(c.props.children):c,u=uo(t,Zi(k)?k:[k],n,e,r,i,o,a,u,s,l),h.base=n.__e,n.__u&=-161,h.__h.length&&a.push(h),_&&(h.__E=h.__=null)}catch(t){if(n.__v=null,s||null!=o)if(t.then){for(n.__u|=s?160:128;u&&8==u.nodeType&&u.nextSibling;)u=u.nextSibling;o[o.indexOf(u)]=null,n.__e=u}else{for(M=o.length;M--;)Ki(o[M]);_o(n)}else n.__e=e.__e,n.__k=e.__k,t.then||_o(n);Ci.__e(t,n,e)}else null==o&&n.__v==e.__v?(n.__k=e.__k,n.__e=e.__e):u=n.__e=mo(e.__e,n,e,r,i,o,a,s,l);return(c=Ci.diffed)&&c(n),128&n.__u?void 0:u}function _o(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(_o))}function yo(t,n,e){for(var r=0;r<e.length;r++)xo(e[r],e[++r],e[++r]);Ci.__c&&Ci.__c(n,t),t.some(function(n){try{t=n.__h,n.__h=[],t.some(function(t){t.call(n)})}catch(t){Ci.__e(t,n.__v)}})}function vo(t){return"object"!=typeof t||null==t||t.__b>0?t:Zi(t)?t.map(vo):Qi({},t)}function mo(t,n,e,r,i,o,a,u,s){var l,c,h,f,p,d,g,_=e.props||Gi,y=n.props,v=n.type;if("svg"==v?i="http://www.w3.org/2000/svg":"math"==v?i="http://www.w3.org/1998/Math/MathML":i||(i="http://www.w3.org/1999/xhtml"),null!=o)for(l=0;l<o.length;l++)if((p=o[l])&&"setAttribute"in p==!!v&&(v?p.localName==v:3==p.nodeType)){t=p,o[l]=null;break}if(null==t){if(null==v)return document.createTextNode(y);t=document.createElementNS(i,v,y.is&&y),u&&(Ci.__m&&Ci.__m(n,o),u=!1),o=null}if(null==v)_===y||u&&t.data==y||(t.data=y);else{if(o=o&&Si.call(t.childNodes),!u&&null!=o)for(_={},l=0;l<t.attributes.length;l++)_[(p=t.attributes[l]).name]=p.value;for(l in _)p=_[l],"dangerouslySetInnerHTML"==l?h=p:"children"==l||l in y||"value"==l&&"defaultValue"in y||"checked"==l&&"defaultChecked"in y||fo(t,l,null,p,i);for(l in y)p=y[l],"children"==l?f=p:"dangerouslySetInnerHTML"==l?c=p:"value"==l?d=p:"checked"==l?g=p:u&&"function"!=typeof p||_[l]===p||fo(t,l,p,_[l],i);if(c)u||h&&(c.__html==h.__html||c.__html==t.innerHTML)||(t.innerHTML=c.__html),n.__k=[];else if(h&&(t.innerHTML=""),uo("template"==n.type?t.content:t,Zi(f)?f:[f],n,e,r,"foreignObject"==v?"http://www.w3.org/1999/xhtml":i,o,a,o?o[0]:e.__k&&eo(e,0),u,s),null!=o)for(l=o.length;l--;)Ki(o[l]);u||(l="value","progress"==v&&null==d?t.removeAttribute("value"):null!=d&&(d!==t[l]||"progress"==v&&!d||"option"==v&&d!=_[l])&&fo(t,l,d,_[l],i),l="checked",null!=g&&g!=t[l]&&fo(t,l,g,_[l],i))}return t}function xo(t,n,e){try{if("function"==typeof t){var r="function"==typeof t.__u;r&&t.__u(),r&&null==n||(t.__u=t(n))}else t.current=n}catch(t){Ci.__e(t,e)}}function bo(t,n,e){var r,i;if(Ci.unmount&&Ci.unmount(t),(r=t.ref)&&(r.current&&r.current!=t.__e||xo(r,null,n)),null!=(r=t.__c)){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(t){Ci.__e(t,n)}r.base=r.__P=null}if(r=t.__k)for(i=0;i<r.length;i++)r[i]&&bo(r[i],n,e||"function"!=typeof t.type);e||Ki(t.__e),t.__c=t.__=t.__e=void 0}function wo(t,n,e){return this.constructor(t,e)}function ko(t,n,e){var r,i,o;n==document&&(n=document.documentElement),Ci.__&&Ci.__(t,n),r=!1?null:n.__k,i=[],o=[],go(n,t=n.__k=function(t,n,e){var r,i,o,a={};for(o in n)"key"==o?r=n[o]:"ref"==o?i=n[o]:a[o]=n[o];if(arguments.length>2&&(a.children=arguments.length>3?Si.call(arguments,2):e),"function"==typeof t&&null!=t.defaultProps)for(o in t.defaultProps)void 0===a[o]&&(a[o]=t.defaultProps[o]);return Ji(t,a,r,i,null)}(to,null,[t]),r||Gi,Gi,n.namespaceURI,r?null:n.firstChild?Si.call(n.childNodes):null,i,r?r.__e:n.firstChild,false,o),yo(i,t,o)}function Mo(t,n,e){var r,i,o,a,u=Qi({},t.props);for(o in t.type&&t.type.defaultProps&&(a=t.type.defaultProps),n)"key"==o?r=n[o]:"ref"==o?i=n[o]:u[o]=void 0===n[o]&&null!=a?a[o]:n[o];return arguments.length>2&&(u.children=arguments.length>3?Si.call(arguments,2):e),Ji(t.type,u,r||t.key,i||t.ref,null)}function Ao(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=Array(n);e<n;e++)r[e]=t[e];return r}function zo(t,n,e){return(n=function(t){var n=function(t,n){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var r=e.call(t,n);if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return("string"===n?String:Number)(t)}(t,"string");return"symbol"==typeof n?n:n+""}(n))in t?Object.defineProperty(t,n,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[n]=e,t}function So(t,n){var e=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);n&&(r=r.filter(function(n){return Object.getOwnPropertyDescriptor(t,n).enumerable})),e.push.apply(e,r)}return e}function Co(t,n){return function(t){if(Array.isArray(t))return t}(t)||function(t,n){var e=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=e){var r,i,o,a,u=[],s=!0,l=!1;try{if(o=(e=e.call(t)).next,0===n);else for(;!(s=(r=o.call(e)).done)&&(u.push(r.value),u.length!==n);s=!0);}catch(t){l=!0,i=t}finally{try{if(!s&&null!=e.return&&(a=e.return(),Object(a)!==a))return}finally{if(l)throw i}}return u}}(t,n)||function(t,n){if(t){if("string"==typeof t)return Ao(t,n);var e={}.toString.call(t).slice(8,-1);return"Object"===e&&t.constructor&&(e=t.constructor.name),"Map"===e||"Set"===e?Array.from(t):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?Ao(t,n):void 0}}(t,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function Eo(t){return Eo="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},Eo(t)}Si=Yi.slice,Ci={__e:function(t,n,e,r){for(var i,o,a;n=n.__;)if((i=n.__c)&&!i.__)try{if((o=i.constructor)&&null!=o.getDerivedStateFromError&&(i.setState(o.getDerivedStateFromError(t)),a=i.__d),null!=i.componentDidCatch&&(i.componentDidCatch(t,r||{}),a=i.__d),a)return i.__E=i}catch(n){t=n}throw t}},Ei=0,Pi=function(t){return null!=t&&void 0===t.constructor},no.prototype.setState=function(t,n){var e;e=null!=this.__s&&this.__s!=this.state?this.__s:this.__s=Qi({},this.state),"function"==typeof t&&(t=t(Qi({},e),this.props)),t&&Qi(e,t),null!=t&&this.__v&&(n&&this._sb.push(n),oo(this))},no.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),oo(this))},no.prototype.render=to,Oi=[],ji="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Ti=function(t,n){return t.__v.__b-n.__v.__b},ao.__r=0,Ri=Math.random().toString(8),Di="__d"+Ri,Ii="__a"+Ri,Ui=/(PointerCapture)$|Capture$/i,Fi=0,Li=po(!1),qi=po(!0);var Po=function(t){if("object"!==Eo(t))return t;var n,e=Mo(t);e.props&&(e.props=function(t){for(var n=1;n<arguments.length;n++){var e=null!=arguments[n]?arguments[n]:{};n%2?So(Object(e),!0).forEach(function(n){zo(t,n,e[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(e)):So(Object(e)).forEach(function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(e,n))})}return t}({},e.props),null!=e&&null!==(n=e.props)&&void 0!==n&&n.children&&(e.props.children=Array.isArray(e.props.children)?e.props.children.map(Po):Po(e.props.children)));return e};!function(t,n){void 0===n&&(n={});var e=n.insertAt;if("undefined"!=typeof document){var r=document.head||document.getElementsByTagName("head")[0],i=document.createElement("style");i.type="text/css","top"===e&&r.firstChild?r.insertBefore(i,r.firstChild):r.appendChild(i),i.styleSheet?i.styleSheet.cssText=t:i.appendChild(document.createTextNode(t))}}(".float-tooltip-kap {\\n  position: absolute;\\n  width: max-content; /* prevent shrinking near right edge */\\n  max-width: max(50%, 150px);\\n  padding: 3px 5px;\\n  border-radius: 3px;\\n  font: 12px sans-serif;\\n  color: #eee;\\n  background: rgba(0,0,0,0.6);\\n  pointer-events: none;\\n}\\n");var Oo=Dr({props:{content:{default:!1},offsetX:{triggerUpdate:!1},offsetY:{triggerUpdate:!1}},init:function(t,n){var e=(arguments.length>2&&void 0!==arguments[2]?arguments[2]:{}).style,r=void 0===e?{}:e,i=kt(!!t&&"object"===Eo(t)&&!!t.node&&"function"==typeof t.node?t.node():t);"static"===i.style("position")&&i.style("position","relative"),n.tooltipEl=i.append("div").attr("class","float-tooltip-kap"),Object.entries(r).forEach(function(t){var e=Co(t,2),r=e[0],i=e[1];return n.tooltipEl.style(r,i)}),n.tooltipEl.style("left","-10000px").style("display","none");var o="tooltip-".concat(Math.round(1e12*Math.random()));n.mouseInside=!1,i.on("mousemove.".concat(o),function(t){n.mouseInside=!0;var e=Mt(t),r=i.node(),o=r.offsetWidth,a=r.offsetHeight,u=[null===n.offsetX||void 0===n.offsetX?"-".concat(e[0]/o*100,"%"):"number"==typeof n.offsetX?"calc(-50% + ".concat(n.offsetX,"px)"):n.offsetX,null===n.offsetY||void 0===n.offsetY?a>130&&a-e[1]<100?"calc(-100% - 6px)":"21px":"number"==typeof n.offsetY?n.offsetY<0?"calc(-100% - ".concat(Math.abs(n.offsetY),"px)"):"".concat(n.offsetY,"px"):n.offsetY];n.tooltipEl.style("left",e[0]+"px").style("top",e[1]+"px").style("transform","translate(".concat(u.join(","),")")),n.content&&n.tooltipEl.style("display","inline")}),i.on("mouseover.".concat(o),function(){n.mouseInside=!0,n.content&&n.tooltipEl.style("display","inline")}),i.on("mouseout.".concat(o),function(){n.mouseInside=!1,n.tooltipEl.style("display","none")})},update:function(t){var n,e;t.tooltipEl.style("display",t.content&&t.mouseInside?"inline":"none"),t.content?t.content instanceof HTMLElement?(t.tooltipEl.text(""),t.tooltipEl.append(function(){return t.content})):"string"==typeof t.content?t.tooltipEl.html(t.content):!function(t){return Pi(Mo(t))}(t.content)?(t.tooltipEl.style("display","none"),console.warn("Tooltip content is invalid, skipping.",t.content,t.content.toString())):(t.tooltipEl.text(""),n=t.content,delete(e=t.tooltipEl.node()).__k,ko(Po(n),e)):t.tooltipEl.text("")}});function No(t,n,e){var r,i=1;function o(){var o,a,u=r.length,s=0,l=0,c=0;for(o=0;o<u;++o)s+=(a=r[o]).x||0,l+=a.y||0,c+=a.z||0;for(s=(s/u-t)*i,l=(l/u-n)*i,c=(c/u-e)*i,o=0;o<u;++o)a=r[o],s&&(a.x-=s),l&&(a.y-=l),c&&(a.z-=c)}return null==t&&(t=0),null==n&&(n=0),null==e&&(e=0),o.initialize=function(t){r=t},o.x=function(n){return arguments.length?(t=+n,o):t},o.y=function(t){return arguments.length?(n=+t,o):n},o.z=function(t){return arguments.length?(e=+t,o):e},o.strength=function(t){return arguments.length?(i=+t,o):i},o}function jo(t,n,e){if(isNaN(n))return t;var r,i,o,a,u,s,l=t._root,c={data:e},h=t._x0,f=t._x1;if(!l)return t._root=c,t;for(;l.length;)if((a=n>=(i=(h+f)/2))?h=i:f=i,r=l,!(l=l[u=+a]))return r[u]=c,t;if(n===(o=+t._x.call(null,l.data)))return c.next=l,r?r[u]=c:t._root=c,t;do{r=r?r[u]=new Array(2):t._root=new Array(2),(a=n>=(i=(h+f)/2))?h=i:f=i}while((u=+a)===(s=+(o>=i)));return r[s]=l,r[u]=c,t}function To(t,n,e){this.node=t,this.x0=n,this.x1=e}function Ro(t){return t[0]}function Do(t,n){var e=new Io(null==n?Ro:n,NaN,NaN);return null==t?e:e.addAll(t)}function Io(t,n,e){this._x=t,this._x0=n,this._x1=e,this._root=void 0}function Uo(t){for(var n={data:t.data},e=n;t=t.next;)e=e.next={data:t.data};return n}var Fo=Do.prototype=Io.prototype;function Lo(t,n,e,r){if(isNaN(n)||isNaN(e))return t;var i,o,a,u,s,l,c,h,f,p=t._root,d={data:r},g=t._x0,_=t._y0,y=t._x1,v=t._y1;if(!p)return t._root=d,t;for(;p.length;)if((l=n>=(o=(g+y)/2))?g=o:y=o,(c=e>=(a=(_+v)/2))?_=a:v=a,i=p,!(p=p[h=c<<1|l]))return i[h]=d,t;if(u=+t._x.call(null,p.data),s=+t._y.call(null,p.data),n===u&&e===s)return d.next=p,i?i[h]=d:t._root=d,t;do{i=i?i[h]=new Array(4):t._root=new Array(4),(l=n>=(o=(g+y)/2))?g=o:y=o,(c=e>=(a=(_+v)/2))?_=a:v=a}while((h=c<<1|l)==(f=(s>=a)<<1|u>=o));return i[f]=p,i[h]=d,t}function qo(t,n,e,r,i){this.node=t,this.x0=n,this.y0=e,this.x1=r,this.y1=i}function $o(t){return t[0]}function Bo(t){return t[1]}function Ho(t,n,e){var r=new Vo(null==n?$o:n,null==e?Bo:e,NaN,NaN,NaN,NaN);return null==t?r:r.addAll(t)}function Vo(t,n,e,r,i,o){this._x=t,this._y=n,this._x0=e,this._y0=r,this._x1=i,this._y1=o,this._root=void 0}function Xo(t){for(var n={data:t.data},e=n;t=t.next;)e=e.next={data:t.data};return n}Fo.copy=function(){var t,n,e=new Io(this._x,this._x0,this._x1),r=this._root;if(!r)return e;if(!r.length)return e._root=Uo(r),e;for(t=[{source:r,target:e._root=new Array(2)}];r=t.pop();)for(var i=0;i<2;++i)(n=r.source[i])&&(n.length?t.push({source:n,target:r.target[i]=new Array(2)}):r.target[i]=Uo(n));return e},Fo.add=function(t){const n=+this._x.call(null,t);return jo(this.cover(n),n,t)},Fo.addAll=function(t){Array.isArray(t)||(t=Array.from(t));const n=t.length,e=new Float64Array(n);let r=1/0,i=-1/0;for(let o,a=0;a<n;++a)isNaN(o=+this._x.call(null,t[a]))||(e[a]=o,o<r&&(r=o),o>i&&(i=o));if(r>i)return this;this.cover(r).cover(i);for(let r=0;r<n;++r)jo(this,e[r],t[r]);return this},Fo.cover=function(t){if(isNaN(t=+t))return this;var n=this._x0,e=this._x1;if(isNaN(n))e=(n=Math.floor(t))+1;else{for(var r,i,o=e-n||1,a=this._root;n>t||t>=e;)switch(i=+(t<n),(r=new Array(2))[i]=a,a=r,o*=2,i){case 0:e=n+o;break;case 1:n=e-o}this._root&&this._root.length&&(this._root=a)}return this._x0=n,this._x1=e,this},Fo.data=function(){var t=[];return this.visit(function(n){if(!n.length)do{t.push(n.data)}while(n=n.next)}),t},Fo.extent=function(t){return arguments.length?this.cover(+t[0][0]).cover(+t[1][0]):isNaN(this._x0)?void 0:[[this._x0],[this._x1]]},Fo.find=function(t,n){var e,r,i,o,a,u=this._x0,s=this._x1,l=[],c=this._root;for(c&&l.push(new To(c,u,s)),null==n?n=1/0:(u=t-n,s=t+n);o=l.pop();)if(!(!(c=o.node)||(r=o.x0)>s||(i=o.x1)<u))if(c.length){var h=(r+i)/2;l.push(new To(c[1],h,i),new To(c[0],r,h)),(a=+(t>=h))&&(o=l[l.length-1],l[l.length-1]=l[l.length-1-a],l[l.length-1-a]=o)}else{var f=Math.abs(t-+this._x.call(null,c.data));f<n&&(n=f,u=t-f,s=t+f,e=c.data)}return e},Fo.remove=function(t){if(isNaN(o=+this._x.call(null,t)))return this;var n,e,r,i,o,a,u,s,l,c=this._root,h=this._x0,f=this._x1;if(!c)return this;if(c.length)for(;;){if((u=o>=(a=(h+f)/2))?h=a:f=a,n=c,!(c=c[s=+u]))return this;if(!c.length)break;n[s+1&1]&&(e=n,l=s)}for(;c.data!==t;)if(r=c,!(c=c.next))return this;return(i=c.next)&&delete c.next,r?(i?r.next=i:delete r.next,this):n?(i?n[s]=i:delete n[s],(c=n[0]||n[1])&&c===(n[1]||n[0])&&!c.length&&(e?e[l]=c:this._root=c),this):(this._root=i,this)},Fo.removeAll=function(t){for(var n=0,e=t.length;n<e;++n)this.remove(t[n]);return this},Fo.root=function(){return this._root},Fo.size=function(){var t=0;return this.visit(function(n){if(!n.length)do{++t}while(n=n.next)}),t},Fo.visit=function(t){var n,e,r,i,o=[],a=this._root;for(a&&o.push(new To(a,this._x0,this._x1));n=o.pop();)if(!t(a=n.node,r=n.x0,i=n.x1)&&a.length){var u=(r+i)/2;(e=a[1])&&o.push(new To(e,u,i)),(e=a[0])&&o.push(new To(e,r,u))}return this},Fo.visitAfter=function(t){var n,e=[],r=[];for(this._root&&e.push(new To(this._root,this._x0,this._x1));n=e.pop();){var i=n.node;if(i.length){var o,a=n.x0,u=n.x1,s=(a+u)/2;(o=i[0])&&e.push(new To(o,a,s)),(o=i[1])&&e.push(new To(o,s,u))}r.push(n)}for(;n=r.pop();)t(n.node,n.x0,n.x1);return this},Fo.x=function(t){return arguments.length?(this._x=t,this):this._x};var Go=Ho.prototype=Vo.prototype;function Yo(t,n,e,r,i){if(isNaN(n)||isNaN(e)||isNaN(r))return t;var o,a,u,s,l,c,h,f,p,d,g,_,y=t._root,v={data:i},m=t._x0,x=t._y0,b=t._z0,w=t._x1,k=t._y1,M=t._z1;if(!y)return t._root=v,t;for(;y.length;)if((f=n>=(a=(m+w)/2))?m=a:w=a,(p=e>=(u=(x+k)/2))?x=u:k=u,(d=r>=(s=(b+M)/2))?b=s:M=s,o=y,!(y=y[g=d<<2|p<<1|f]))return o[g]=v,t;if(l=+t._x.call(null,y.data),c=+t._y.call(null,y.data),h=+t._z.call(null,y.data),n===l&&e===c&&r===h)return v.next=y,o?o[g]=v:t._root=v,t;do{o=o?o[g]=new Array(8):t._root=new Array(8),(f=n>=(a=(m+w)/2))?m=a:w=a,(p=e>=(u=(x+k)/2))?x=u:k=u,(d=r>=(s=(b+M)/2))?b=s:M=s}while((g=d<<2|p<<1|f)==(_=(h>=s)<<2|(c>=u)<<1|l>=a));return o[_]=y,o[g]=v,t}function Wo(t,n,e,r,i,o,a){this.node=t,this.x0=n,this.y0=e,this.z0=r,this.x1=i,this.y1=o,this.z1=a}Go.copy=function(){var t,n,e=new Vo(this._x,this._y,this._x0,this._y0,this._x1,this._y1),r=this._root;if(!r)return e;if(!r.length)return e._root=Xo(r),e;for(t=[{source:r,target:e._root=new Array(4)}];r=t.pop();)for(var i=0;i<4;++i)(n=r.source[i])&&(n.length?t.push({source:n,target:r.target[i]=new Array(4)}):r.target[i]=Xo(n));return e},Go.add=function(t){const n=+this._x.call(null,t),e=+this._y.call(null,t);return Lo(this.cover(n,e),n,e,t)},Go.addAll=function(t){var n,e,r,i,o=t.length,a=new Array(o),u=new Array(o),s=1/0,l=1/0,c=-1/0,h=-1/0;for(e=0;e<o;++e)isNaN(r=+this._x.call(null,n=t[e]))||isNaN(i=+this._y.call(null,n))||(a[e]=r,u[e]=i,r<s&&(s=r),r>c&&(c=r),i<l&&(l=i),i>h&&(h=i));if(s>c||l>h)return this;for(this.cover(s,l).cover(c,h),e=0;e<o;++e)Lo(this,a[e],u[e],t[e]);return this},Go.cover=function(t,n){if(isNaN(t=+t)||isNaN(n=+n))return this;var e=this._x0,r=this._y0,i=this._x1,o=this._y1;if(isNaN(e))i=(e=Math.floor(t))+1,o=(r=Math.floor(n))+1;else{for(var a,u,s=i-e||1,l=this._root;e>t||t>=i||r>n||n>=o;)switch(u=(n<r)<<1|t<e,(a=new Array(4))[u]=l,l=a,s*=2,u){case 0:i=e+s,o=r+s;break;case 1:e=i-s,o=r+s;break;case 2:i=e+s,r=o-s;break;case 3:e=i-s,r=o-s}this._root&&this._root.length&&(this._root=l)}return this._x0=e,this._y0=r,this._x1=i,this._y1=o,this},Go.data=function(){var t=[];return this.visit(function(n){if(!n.length)do{t.push(n.data)}while(n=n.next)}),t},Go.extent=function(t){return arguments.length?this.cover(+t[0][0],+t[0][1]).cover(+t[1][0],+t[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]},Go.find=function(t,n,e){var r,i,o,a,u,s,l,c=this._x0,h=this._y0,f=this._x1,p=this._y1,d=[],g=this._root;for(g&&d.push(new qo(g,c,h,f,p)),null==e?e=1/0:(c=t-e,h=n-e,f=t+e,p=n+e,e*=e);s=d.pop();)if(!(!(g=s.node)||(i=s.x0)>f||(o=s.y0)>p||(a=s.x1)<c||(u=s.y1)<h))if(g.length){var _=(i+a)/2,y=(o+u)/2;d.push(new qo(g[3],_,y,a,u),new qo(g[2],i,y,_,u),new qo(g[1],_,o,a,y),new qo(g[0],i,o,_,y)),(l=(n>=y)<<1|t>=_)&&(s=d[d.length-1],d[d.length-1]=d[d.length-1-l],d[d.length-1-l]=s)}else{var v=t-+this._x.call(null,g.data),m=n-+this._y.call(null,g.data),x=v*v+m*m;if(x<e){var b=Math.sqrt(e=x);c=t-b,h=n-b,f=t+b,p=n+b,r=g.data}}return r},Go.remove=function(t){if(isNaN(o=+this._x.call(null,t))||isNaN(a=+this._y.call(null,t)))return this;var n,e,r,i,o,a,u,s,l,c,h,f,p=this._root,d=this._x0,g=this._y0,_=this._x1,y=this._y1;if(!p)return this;if(p.length)for(;;){if((l=o>=(u=(d+_)/2))?d=u:_=u,(c=a>=(s=(g+y)/2))?g=s:y=s,n=p,!(p=p[h=c<<1|l]))return this;if(!p.length)break;(n[h+1&3]||n[h+2&3]||n[h+3&3])&&(e=n,f=h)}for(;p.data!==t;)if(r=p,!(p=p.next))return this;return(i=p.next)&&delete p.next,r?(i?r.next=i:delete r.next,this):n?(i?n[h]=i:delete n[h],(p=n[0]||n[1]||n[2]||n[3])&&p===(n[3]||n[2]||n[1]||n[0])&&!p.length&&(e?e[f]=p:this._root=p),this):(this._root=i,this)},Go.removeAll=function(t){for(var n=0,e=t.length;n<e;++n)this.remove(t[n]);return this},Go.root=function(){return this._root},Go.size=function(){var t=0;return this.visit(function(n){if(!n.length)do{++t}while(n=n.next)}),t},Go.visit=function(t){var n,e,r,i,o,a,u=[],s=this._root;for(s&&u.push(new qo(s,this._x0,this._y0,this._x1,this._y1));n=u.pop();)if(!t(s=n.node,r=n.x0,i=n.y0,o=n.x1,a=n.y1)&&s.length){var l=(r+o)/2,c=(i+a)/2;(e=s[3])&&u.push(new qo(e,l,c,o,a)),(e=s[2])&&u.push(new qo(e,r,c,l,a)),(e=s[1])&&u.push(new qo(e,l,i,o,c)),(e=s[0])&&u.push(new qo(e,r,i,l,c))}return this},Go.visitAfter=function(t){var n,e=[],r=[];for(this._root&&e.push(new qo(this._root,this._x0,this._y0,this._x1,this._y1));n=e.pop();){var i=n.node;if(i.length){var o,a=n.x0,u=n.y0,s=n.x1,l=n.y1,c=(a+s)/2,h=(u+l)/2;(o=i[0])&&e.push(new qo(o,a,u,c,h)),(o=i[1])&&e.push(new qo(o,c,u,s,h)),(o=i[2])&&e.push(new qo(o,a,h,c,l)),(o=i[3])&&e.push(new qo(o,c,h,s,l))}r.push(n)}for(;n=r.pop();)t(n.node,n.x0,n.y0,n.x1,n.y1);return this},Go.x=function(t){return arguments.length?(this._x=t,this):this._x},Go.y=function(t){return arguments.length?(this._y=t,this):this._y};const Zo=(t,n,e,r,i,o)=>Math.sqrt((t-r)**2+(n-i)**2+(e-o)**2);function Qo(t){return t[0]}function Ko(t){return t[1]}function Jo(t){return t[2]}function ta(t,n,e,r){var i=new na(null==n?Qo:n,null==e?Ko:e,null==r?Jo:r,NaN,NaN,NaN,NaN,NaN,NaN);return null==t?i:i.addAll(t)}function na(t,n,e,r,i,o,a,u,s){this._x=t,this._y=n,this._z=e,this._x0=r,this._y0=i,this._z0=o,this._x1=a,this._y1=u,this._z1=s,this._root=void 0}function ea(t){for(var n={data:t.data},e=n;t=t.next;)e=e.next={data:t.data};return n}var ra=ta.prototype=na.prototype;function ia(t){return function(){return t}}function oa(t){return 1e-6*(t()-.5)}function aa(t){return t.index}function ua(t,n){var e=t.get(n);if(!e)throw new Error("node not found: "+n);return e}function sa(t){var n,e,r,i,o,a,u,s=aa,l=function(t){return 1/Math.min(o[t.source.index],o[t.target.index])},c=ia(30),h=1;function f(r){for(var o=0,s=t.length;o<h;++o)for(var l,c,f,p,d,g=0,_=0,y=0,v=0;g<s;++g)c=(l=t[g]).source,_=(f=l.target).x+f.vx-c.x-c.vx||oa(u),i>1&&(y=f.y+f.vy-c.y-c.vy||oa(u)),i>2&&(v=f.z+f.vz-c.z-c.vz||oa(u)),_*=p=((p=Math.sqrt(_*_+y*y+v*v))-e[g])/p*r*n[g],y*=p,v*=p,f.vx-=_*(d=a[g]),i>1&&(f.vy-=y*d),i>2&&(f.vz-=v*d),c.vx+=_*(d=1-d),i>1&&(c.vy+=y*d),i>2&&(c.vz+=v*d)}function p(){if(r){var i,u,l=r.length,c=t.length,h=new Map(r.map((t,n)=>[s(t,n,r),t]));for(i=0,o=new Array(l);i<c;++i)(u=t[i]).index=i,"object"!=typeof u.source&&(u.source=ua(h,u.source)),"object"!=typeof u.target&&(u.target=ua(h,u.target)),o[u.source.index]=(o[u.source.index]||0)+1,o[u.target.index]=(o[u.target.index]||0)+1;for(i=0,a=new Array(c);i<c;++i)u=t[i],a[i]=o[u.source.index]/(o[u.source.index]+o[u.target.index]);n=new Array(c),d(),e=new Array(c),g()}}function d(){if(r)for(var e=0,i=t.length;e<i;++e)n[e]=+l(t[e],e,t)}function g(){if(r)for(var n=0,i=t.length;n<i;++n)e[n]=+c(t[n],n,t)}return null==t&&(t=[]),f.initialize=function(t,...n){r=t,u=n.find(t=>"function"==typeof t)||Math.random,i=n.find(t=>[1,2,3].includes(t))||2,p()},f.links=function(n){return arguments.length?(t=n,p(),f):t},f.id=function(t){return arguments.length?(s=t,f):s},f.iterations=function(t){return arguments.length?(h=+t,f):h},f.strength=function(t){return arguments.length?(l="function"==typeof t?t:ia(+t),d(),f):l},f.distance=function(t){return arguments.length?(c="function"==typeof t?t:ia(+t),g(),f):c},f}ra.copy=function(){var t,n,e=new na(this._x,this._y,this._z,this._x0,this._y0,this._z0,this._x1,this._y1,this._z1),r=this._root;if(!r)return e;if(!r.length)return e._root=ea(r),e;for(t=[{source:r,target:e._root=new Array(8)}];r=t.pop();)for(var i=0;i<8;++i)(n=r.source[i])&&(n.length?t.push({source:n,target:r.target[i]=new Array(8)}):r.target[i]=ea(n));return e},ra.add=function(t){const n=+this._x.call(null,t),e=+this._y.call(null,t),r=+this._z.call(null,t);return Yo(this.cover(n,e,r),n,e,r,t)},ra.addAll=function(t){Array.isArray(t)||(t=Array.from(t));const n=t.length,e=new Float64Array(n),r=new Float64Array(n),i=new Float64Array(n);let o=1/0,a=1/0,u=1/0,s=-1/0,l=-1/0,c=-1/0;for(let h,f,p,d,g=0;g<n;++g)isNaN(f=+this._x.call(null,h=t[g]))||isNaN(p=+this._y.call(null,h))||isNaN(d=+this._z.call(null,h))||(e[g]=f,r[g]=p,i[g]=d,f<o&&(o=f),f>s&&(s=f),p<a&&(a=p),p>l&&(l=p),d<u&&(u=d),d>c&&(c=d));if(o>s||a>l||u>c)return this;this.cover(o,a,u).cover(s,l,c);for(let o=0;o<n;++o)Yo(this,e[o],r[o],i[o],t[o]);return this},ra.cover=function(t,n,e){if(isNaN(t=+t)||isNaN(n=+n)||isNaN(e=+e))return this;var r=this._x0,i=this._y0,o=this._z0,a=this._x1,u=this._y1,s=this._z1;if(isNaN(r))a=(r=Math.floor(t))+1,u=(i=Math.floor(n))+1,s=(o=Math.floor(e))+1;else{for(var l,c,h=a-r||1,f=this._root;r>t||t>=a||i>n||n>=u||o>e||e>=s;)switch(c=(e<o)<<2|(n<i)<<1|t<r,(l=new Array(8))[c]=f,f=l,h*=2,c){case 0:a=r+h,u=i+h,s=o+h;break;case 1:r=a-h,u=i+h,s=o+h;break;case 2:a=r+h,i=u-h,s=o+h;break;case 3:r=a-h,i=u-h,s=o+h;break;case 4:a=r+h,u=i+h,o=s-h;break;case 5:r=a-h,u=i+h,o=s-h;break;case 6:a=r+h,i=u-h,o=s-h;break;case 7:r=a-h,i=u-h,o=s-h}this._root&&this._root.length&&(this._root=f)}return this._x0=r,this._y0=i,this._z0=o,this._x1=a,this._y1=u,this._z1=s,this},ra.data=function(){var t=[];return this.visit(function(n){if(!n.length)do{t.push(n.data)}while(n=n.next)}),t},ra.extent=function(t){return arguments.length?this.cover(+t[0][0],+t[0][1],+t[0][2]).cover(+t[1][0],+t[1][1],+t[1][2]):isNaN(this._x0)?void 0:[[this._x0,this._y0,this._z0],[this._x1,this._y1,this._z1]]},ra.find=function(t,n,e,r){var i,o,a,u,s,l,c,h,f,p=this._x0,d=this._y0,g=this._z0,_=this._x1,y=this._y1,v=this._z1,m=[],x=this._root;for(x&&m.push(new Wo(x,p,d,g,_,y,v)),null==r?r=1/0:(p=t-r,d=n-r,g=e-r,_=t+r,y=n+r,v=e+r,r*=r);h=m.pop();)if(!(!(x=h.node)||(o=h.x0)>_||(a=h.y0)>y||(u=h.z0)>v||(s=h.x1)<p||(l=h.y1)<d||(c=h.z1)<g))if(x.length){var b=(o+s)/2,w=(a+l)/2,k=(u+c)/2;m.push(new Wo(x[7],b,w,k,s,l,c),new Wo(x[6],o,w,k,b,l,c),new Wo(x[5],b,a,k,s,w,c),new Wo(x[4],o,a,k,b,w,c),new Wo(x[3],b,w,u,s,l,k),new Wo(x[2],o,w,u,b,l,k),new Wo(x[1],b,a,u,s,w,k),new Wo(x[0],o,a,u,b,w,k)),(f=(e>=k)<<2|(n>=w)<<1|t>=b)&&(h=m[m.length-1],m[m.length-1]=m[m.length-1-f],m[m.length-1-f]=h)}else{var M=t-+this._x.call(null,x.data),A=n-+this._y.call(null,x.data),z=e-+this._z.call(null,x.data),S=M*M+A*A+z*z;if(S<r){var C=Math.sqrt(r=S);p=t-C,d=n-C,g=e-C,_=t+C,y=n+C,v=e+C,i=x.data}}return i},ra.findAllWithinRadius=function(t,n,e,r){const i=[],o=t-r,a=n-r,u=e-r,s=t+r,l=n+r,c=e+r;return this.visit((h,f,p,d,g,_,y)=>{if(!h.length)do{const o=h.data;Zo(t,n,e,this._x(o),this._y(o),this._z(o))<=r&&i.push(o)}while(h=h.next);return f>s||p>l||d>c||g<o||_<a||y<u}),i},ra.remove=function(t){if(isNaN(o=+this._x.call(null,t))||isNaN(a=+this._y.call(null,t))||isNaN(u=+this._z.call(null,t)))return this;var n,e,r,i,o,a,u,s,l,c,h,f,p,d,g,_=this._root,y=this._x0,v=this._y0,m=this._z0,x=this._x1,b=this._y1,w=this._z1;if(!_)return this;if(_.length)for(;;){if((h=o>=(s=(y+x)/2))?y=s:x=s,(f=a>=(l=(v+b)/2))?v=l:b=l,(p=u>=(c=(m+w)/2))?m=c:w=c,n=_,!(_=_[d=p<<2|f<<1|h]))return this;if(!_.length)break;(n[d+1&7]||n[d+2&7]||n[d+3&7]||n[d+4&7]||n[d+5&7]||n[d+6&7]||n[d+7&7])&&(e=n,g=d)}for(;_.data!==t;)if(r=_,!(_=_.next))return this;return(i=_.next)&&delete _.next,r?(i?r.next=i:delete r.next,this):n?(i?n[d]=i:delete n[d],(_=n[0]||n[1]||n[2]||n[3]||n[4]||n[5]||n[6]||n[7])&&_===(n[7]||n[6]||n[5]||n[4]||n[3]||n[2]||n[1]||n[0])&&!_.length&&(e?e[g]=_:this._root=_),this):(this._root=i,this)},ra.removeAll=function(t){for(var n=0,e=t.length;n<e;++n)this.remove(t[n]);return this},ra.root=function(){return this._root},ra.size=function(){var t=0;return this.visit(function(n){if(!n.length)do{++t}while(n=n.next)}),t},ra.visit=function(t){var n,e,r,i,o,a,u,s,l=[],c=this._root;for(c&&l.push(new Wo(c,this._x0,this._y0,this._z0,this._x1,this._y1,this._z1));n=l.pop();)if(!t(c=n.node,r=n.x0,i=n.y0,o=n.z0,a=n.x1,u=n.y1,s=n.z1)&&c.length){var h=(r+a)/2,f=(i+u)/2,p=(o+s)/2;(e=c[7])&&l.push(new Wo(e,h,f,p,a,u,s)),(e=c[6])&&l.push(new Wo(e,r,f,p,h,u,s)),(e=c[5])&&l.push(new Wo(e,h,i,p,a,f,s)),(e=c[4])&&l.push(new Wo(e,r,i,p,h,f,s)),(e=c[3])&&l.push(new Wo(e,h,f,o,a,u,p)),(e=c[2])&&l.push(new Wo(e,r,f,o,h,u,p)),(e=c[1])&&l.push(new Wo(e,h,i,o,a,f,p)),(e=c[0])&&l.push(new Wo(e,r,i,o,h,f,p))}return this},ra.visitAfter=function(t){var n,e=[],r=[];for(this._root&&e.push(new Wo(this._root,this._x0,this._y0,this._z0,this._x1,this._y1,this._z1));n=e.pop();){var i=n.node;if(i.length){var o,a=n.x0,u=n.y0,s=n.z0,l=n.x1,c=n.y1,h=n.z1,f=(a+l)/2,p=(u+c)/2,d=(s+h)/2;(o=i[0])&&e.push(new Wo(o,a,u,s,f,p,d)),(o=i[1])&&e.push(new Wo(o,f,u,s,l,p,d)),(o=i[2])&&e.push(new Wo(o,a,p,s,f,c,d)),(o=i[3])&&e.push(new Wo(o,f,p,s,l,c,d)),(o=i[4])&&e.push(new Wo(o,a,u,d,f,p,h)),(o=i[5])&&e.push(new Wo(o,f,u,d,l,p,h)),(o=i[6])&&e.push(new Wo(o,a,p,d,f,c,h)),(o=i[7])&&e.push(new Wo(o,f,p,d,l,c,h))}r.push(n)}for(;n=r.pop();)t(n.node,n.x0,n.y0,n.z0,n.x1,n.y1,n.z1);return this},ra.x=function(t){return arguments.length?(this._x=t,this):this._x},ra.y=function(t){return arguments.length?(this._y=t,this):this._y},ra.z=function(t){return arguments.length?(this._z=t,this):this._z};const la=4294967296;function ca(t){return t.x}function ha(t){return t.y}function fa(t){return t.z}var pa=Math.PI*(3-Math.sqrt(5)),da=20*Math.PI/(9+Math.sqrt(221));function ga(t,n){n=n||2;var e,r=Math.min(3,Math.max(1,Math.round(n))),i=1,o=.001,a=1-Math.pow(o,1/300),u=0,s=.6,l=new Map,c=Jn(p),h=zt("tick","end"),f=function(){let t=1;return()=>(t=(1664525*t+1013904223)%la)/la}();function p(){d(),h.call("tick",e),i<o&&(c.stop(),h.call("end",e))}function d(n){var o,c,h=t.length;void 0===n&&(n=1);for(var f=0;f<n;++f)for(i+=(u-i)*a,l.forEach(function(t){t(i)}),o=0;o<h;++o)null==(c=t[o]).fx?c.x+=c.vx*=s:(c.x=c.fx,c.vx=0),r>1&&(null==c.fy?c.y+=c.vy*=s:(c.y=c.fy,c.vy=0)),r>2&&(null==c.fz?c.z+=c.vz*=s:(c.z=c.fz,c.vz=0));return e}function g(){for(var n,e=0,i=t.length;e<i;++e){if((n=t[e]).index=e,null!=n.fx&&(n.x=n.fx),null!=n.fy&&(n.y=n.fy),null!=n.fz&&(n.z=n.fz),isNaN(n.x)||r>1&&isNaN(n.y)||r>2&&isNaN(n.z)){var o=10*(r>2?Math.cbrt(.5+e):r>1?Math.sqrt(.5+e):e),a=e*pa,u=e*da;1===r?n.x=o:2===r?(n.x=o*Math.cos(a),n.y=o*Math.sin(a)):(n.x=o*Math.sin(a)*Math.cos(u),n.y=o*Math.cos(a),n.z=o*Math.sin(a)*Math.sin(u))}(isNaN(n.vx)||r>1&&isNaN(n.vy)||r>2&&isNaN(n.vz))&&(n.vx=0,r>1&&(n.vy=0),r>2&&(n.vz=0))}}function _(n){return n.initialize&&n.initialize(t,f,r),n}return null==t&&(t=[]),g(),e={tick:d,restart:function(){return c.restart(p),e},stop:function(){return c.stop(),e},numDimensions:function(t){return arguments.length?(r=Math.min(3,Math.max(1,Math.round(t))),l.forEach(_),e):r},nodes:function(n){return arguments.length?(t=n,g(),l.forEach(_),e):t},alpha:function(t){return arguments.length?(i=+t,e):i},alphaMin:function(t){return arguments.length?(o=+t,e):o},alphaDecay:function(t){return arguments.length?(a=+t,e):+a},alphaTarget:function(t){return arguments.length?(u=+t,e):u},velocityDecay:function(t){return arguments.length?(s=1-t,e):1-s},randomSource:function(t){return arguments.length?(f=t,l.forEach(_),e):f},force:function(t,n){return arguments.length>1?(null==n?l.delete(t):l.set(t,_(n)),e):l.get(t)},find:function(){var n,e,i,o,a,u,s=Array.prototype.slice.call(arguments),l=s.shift()||0,c=(r>1?s.shift():null)||0,h=(r>2?s.shift():null)||0,f=s.shift()||1/0,p=0,d=t.length;for(f*=f,p=0;p<d;++p)(o=(n=l-(a=t[p]).x)*n+(e=c-(a.y||0))*e+(i=h-(a.z||0))*i)<f&&(u=a,f=o);return u},on:function(t,n){return arguments.length>1?(h.on(t,n),e):h.on(t)}}}function _a(){var t,n,e,r,i,o,a=ia(-30),u=1,s=1/0,l=.81;function c(r){var o,a=t.length,u=(1===n?Do(t,ca):2===n?Ho(t,ca,ha):3===n?ta(t,ca,ha,fa):null).visitAfter(f);for(i=r,o=0;o<a;++o)e=t[o],u.visit(p)}function h(){if(t){var n,e,r=t.length;for(o=new Array(r),n=0;n<r;++n)e=t[n],o[e.index]=+a(e,n,t)}}function f(t){var e,r,i,a,u,s,l=0,c=0,h=t.length;if(h){for(i=a=u=s=0;s<h;++s)(e=t[s])&&(r=Math.abs(e.value))&&(l+=e.value,c+=r,i+=r*(e.x||0),a+=r*(e.y||0),u+=r*(e.z||0));l*=Math.sqrt(4/h),t.x=i/c,n>1&&(t.y=a/c),n>2&&(t.z=u/c)}else{(e=t).x=e.data.x,n>1&&(e.y=e.data.y),n>2&&(e.z=e.data.z);do{l+=o[e.data.index]}while(e=e.next)}t.value=l}function p(t,a,c,h,f){if(!t.value)return!0;var p=[c,h,f][n-1],d=t.x-e.x,g=n>1?t.y-e.y:0,_=n>2?t.z-e.z:0,y=p-a,v=d*d+g*g+_*_;if(y*y/l<v)return v<s&&(0===d&&(v+=(d=oa(r))*d),n>1&&0===g&&(v+=(g=oa(r))*g),n>2&&0===_&&(v+=(_=oa(r))*_),v<u&&(v=Math.sqrt(u*v)),e.vx+=d*t.value*i/v,n>1&&(e.vy+=g*t.value*i/v),n>2&&(e.vz+=_*t.value*i/v)),!0;if(!(t.length||v>=s)){(t.data!==e||t.next)&&(0===d&&(v+=(d=oa(r))*d),n>1&&0===g&&(v+=(g=oa(r))*g),n>2&&0===_&&(v+=(_=oa(r))*_),v<u&&(v=Math.sqrt(u*v)));do{t.data!==e&&(y=o[t.data.index]*i/v,e.vx+=d*y,n>1&&(e.vy+=g*y),n>2&&(e.vz+=_*y))}while(t=t.next)}}return c.initialize=function(e,...i){t=e,r=i.find(t=>"function"==typeof t)||Math.random,n=i.find(t=>[1,2,3].includes(t))||2,h()},c.strength=function(t){return arguments.length?(a="function"==typeof t?t:ia(+t),h(),c):a},c.distanceMin=function(t){return arguments.length?(u=t*t,c):Math.sqrt(u)},c.distanceMax=function(t){return arguments.length?(s=t*t,c):Math.sqrt(s)},c.theta=function(t){return arguments.length?(l=t*t,c):Math.sqrt(l)},c}const{abs:ya,cos:va,sin:ma,acos:xa,atan2:ba,sqrt:wa,pow:ka}=Math;function Ma(t){return t<0?-ka(-t,1/3):ka(t,1/3)}const Aa=Math.PI,za=2*Aa,Sa=Aa/2,Ca=Number.MAX_SAFE_INTEGER||9007199254740991,Ea=Number.MIN_SAFE_INTEGER||-9007199254740991,Pa={x:0,y:0,z:0},Oa={Tvalues:[-.06405689286260563,.06405689286260563,-.1911188674736163,.1911188674736163,-.3150426796961634,.3150426796961634,-.4337935076260451,.4337935076260451,-.5454214713888396,.5454214713888396,-.6480936519369755,.6480936519369755,-.7401241915785544,.7401241915785544,-.820001985973903,.820001985973903,-.8864155270044011,.8864155270044011,-.9382745520027328,.9382745520027328,-.9747285559713095,.9747285559713095,-.9951872199970213,.9951872199970213],Cvalues:[.12793819534675216,.12793819534675216,.1258374563468283,.1258374563468283,.12167047292780339,.12167047292780339,.1155056680537256,.1155056680537256,.10744427011596563,.10744427011596563,.09761865210411388,.09761865210411388,.08619016153195327,.08619016153195327,.0733464814110803,.0733464814110803,.05929858491543678,.05929858491543678,.04427743881741981,.04427743881741981,.028531388628933663,.028531388628933663,.0123412297999872,.0123412297999872],arcfn:function(t,n){const e=n(t);let r=e.x*e.x+e.y*e.y;return void 0!==e.z&&(r+=e.z*e.z),wa(r)},compute:function(t,n,e){if(0===t)return n[0].t=0,n[0];const r=n.length-1;if(1===t)return n[r].t=1,n[r];const i=1-t;let o=n;if(0===r)return n[0].t=t,n[0];if(1===r){const n={x:i*o[0].x+t*o[1].x,y:i*o[0].y+t*o[1].y,t:t};return e&&(n.z=i*o[0].z+t*o[1].z),n}if(r<4){let n,a,u,s=i*i,l=t*t,c=0;2===r?(o=[o[0],o[1],o[2],Pa],n=s,a=i*t*2,u=l):3===r&&(n=s*i,a=s*t*3,u=i*l*3,c=t*l);const h={x:n*o[0].x+a*o[1].x+u*o[2].x+c*o[3].x,y:n*o[0].y+a*o[1].y+u*o[2].y+c*o[3].y,t:t};return e&&(h.z=n*o[0].z+a*o[1].z+u*o[2].z+c*o[3].z),h}const a=JSON.parse(JSON.stringify(n));for(;a.length>1;){for(let n=0;n<a.length-1;n++)a[n]={x:a[n].x+(a[n+1].x-a[n].x)*t,y:a[n].y+(a[n+1].y-a[n].y)*t},void 0!==a[n].z&&(a[n].z=a[n].z+(a[n+1].z-a[n].z)*t);a.splice(a.length-1,1)}return a[0].t=t,a[0]},computeWithRatios:function(t,n,e,r){const i=1-t,o=e,a=n;let u,s=o[0],l=o[1],c=o[2],h=o[3];return s*=i,l*=t,2===a.length?(u=s+l,{x:(s*a[0].x+l*a[1].x)/u,y:(s*a[0].y+l*a[1].y)/u,z:!!r&&(s*a[0].z+l*a[1].z)/u,t:t}):(s*=i,l*=2*i,c*=t*t,3===a.length?(u=s+l+c,{x:(s*a[0].x+l*a[1].x+c*a[2].x)/u,y:(s*a[0].y+l*a[1].y+c*a[2].y)/u,z:!!r&&(s*a[0].z+l*a[1].z+c*a[2].z)/u,t:t}):(s*=i,l*=1.5*i,c*=3*i,h*=t*t*t,4===a.length?(u=s+l+c+h,{x:(s*a[0].x+l*a[1].x+c*a[2].x+h*a[3].x)/u,y:(s*a[0].y+l*a[1].y+c*a[2].y+h*a[3].y)/u,z:!!r&&(s*a[0].z+l*a[1].z+c*a[2].z+h*a[3].z)/u,t:t}):void 0))},derive:function(t,n){const e=[];for(let r=t,i=r.length,o=i-1;i>1;i--,o--){const t=[];for(let e,i=0;i<o;i++)e={x:o*(r[i+1].x-r[i].x),y:o*(r[i+1].y-r[i].y)},n&&(e.z=o*(r[i+1].z-r[i].z)),t.push(e);e.push(t),r=t}return e},between:function(t,n,e){return n<=t&&t<=e||Oa.approximately(t,n)||Oa.approximately(t,e)},approximately:function(t,n,e){return ya(t-n)<=(e||1e-6)},length:function(t){const n=Oa.Tvalues.length;let e=0;for(let r,i=0;i<n;i++)r=.5*Oa.Tvalues[i]+.5,e+=Oa.Cvalues[i]*Oa.arcfn(r,t);return.5*e},map:function(t,n,e,r,i){return r+(i-r)*((t-n)/(e-n))},lerp:function(t,n,e){const r={x:n.x+t*(e.x-n.x),y:n.y+t*(e.y-n.y)};return void 0!==n.z&&void 0!==e.z&&(r.z=n.z+t*(e.z-n.z)),r},pointToString:function(t){let n=t.x+"/"+t.y;return void 0!==t.z&&(n+="/"+t.z),n},pointsToString:function(t){return"["+t.map(Oa.pointToString).join(", ")+"]"},copy:function(t){return JSON.parse(JSON.stringify(t))},angle:function(t,n,e){const r=n.x-t.x,i=n.y-t.y,o=e.x-t.x,a=e.y-t.y;return ba(r*a-i*o,r*o+i*a)},round:function(t,n){const e=""+t,r=e.indexOf(".");return parseFloat(e.substring(0,r+1+n))},dist:function(t,n){const e=t.x-n.x,r=t.y-n.y;return wa(e*e+r*r)},closest:function(t,n){let e,r,i=ka(2,63);return t.forEach(function(t,o){r=Oa.dist(n,t),r<i&&(i=r,e=o)}),{mdist:i,mpos:e}},abcratio:function(t,n){if(2!==n&&3!==n)return!1;if(void 0===t)t=.5;else if(0===t||1===t)return t;const e=ka(t,n)+ka(1-t,n);return ya((e-1)/e)},projectionratio:function(t,n){if(2!==n&&3!==n)return!1;if(void 0===t)t=.5;else if(0===t||1===t)return t;const e=ka(1-t,n);return e/(ka(t,n)+e)},lli8:function(t,n,e,r,i,o,a,u){const s=(t-e)*(o-u)-(n-r)*(i-a);return 0!=s&&{x:((t*r-n*e)*(i-a)-(t-e)*(i*u-o*a))/s,y:((t*r-n*e)*(o-u)-(n-r)*(i*u-o*a))/s}},lli4:function(t,n,e,r){const i=t.x,o=t.y,a=n.x,u=n.y,s=e.x,l=e.y,c=r.x,h=r.y;return Oa.lli8(i,o,a,u,s,l,c,h)},lli:function(t,n){return Oa.lli4(t,t.c,n,n.c)},makeline:function(t,n){return new qa(t.x,t.y,(t.x+n.x)/2,(t.y+n.y)/2,n.x,n.y)},findbbox:function(t){let n=Ca,e=Ca,r=Ea,i=Ea;return t.forEach(function(t){const o=t.bbox();n>o.x.min&&(n=o.x.min),e>o.y.min&&(e=o.y.min),r<o.x.max&&(r=o.x.max),i<o.y.max&&(i=o.y.max)}),{x:{min:n,mid:(n+r)/2,max:r,size:r-n},y:{min:e,mid:(e+i)/2,max:i,size:i-e}}},shapeintersections:function(t,n,e,r,i){if(!Oa.bboxoverlap(n,r))return[];const o=[],a=[t.startcap,t.forward,t.back,t.endcap],u=[e.startcap,e.forward,e.back,e.endcap];return a.forEach(function(n){n.virtual||u.forEach(function(r){if(r.virtual)return;const a=n.intersects(r,i);a.length>0&&(a.c1=n,a.c2=r,a.s1=t,a.s2=e,o.push(a))})}),o},makeshape:function(t,n,e){const r=n.points.length,i=t.points.length,o=Oa.makeline(n.points[r-1],t.points[0]),a=Oa.makeline(t.points[i-1],n.points[0]),u={startcap:o,forward:t,back:n,endcap:a,bbox:Oa.findbbox([o,t,n,a]),intersections:function(t){return Oa.shapeintersections(u,u.bbox,t,t.bbox,e)}};return u},getminmax:function(t,n,e){if(!e)return{min:0,max:0};let r,i,o=Ca,a=Ea;-1===e.indexOf(0)&&(e=[0].concat(e)),-1===e.indexOf(1)&&e.push(1);for(let u=0,s=e.length;u<s;u++)r=e[u],i=t.get(r),i[n]<o&&(o=i[n]),i[n]>a&&(a=i[n]);return{min:o,mid:(o+a)/2,max:a,size:a-o}},align:function(t,n){const e=n.p1.x,r=n.p1.y,i=-ba(n.p2.y-r,n.p2.x-e);return t.map(function(t){return{x:(t.x-e)*va(i)-(t.y-r)*ma(i),y:(t.x-e)*ma(i)+(t.y-r)*va(i)}})},roots:function(t,n){n=n||{p1:{x:0,y:0},p2:{x:1,y:0}};const e=t.length-1,r=Oa.align(t,n),i=function(t){return 0<=t&&t<=1};if(2===e){const t=r[0].y,n=r[1].y,e=r[2].y,o=t-2*n+e;if(0!==o){const r=-wa(n*n-t*e),a=-t+n;return[-(r+a)/o,-(-r+a)/o].filter(i)}return n!==e&&0===o?[(2*n-e)/(2*n-2*e)].filter(i):[]}const o=r[0].y,a=r[1].y,u=r[2].y;let s=3*a-o-3*u+r[3].y,l=3*o-6*a+3*u,c=-3*o+3*a,h=o;if(Oa.approximately(s,0)){if(Oa.approximately(l,0))return Oa.approximately(c,0)?[]:[-h/c].filter(i);const t=wa(c*c-4*l*h),n=2*l;return[(t-c)/n,(-c-t)/n].filter(i)}l/=s,c/=s,h/=s;const f=(3*c-l*l)/3,p=f/3,d=(2*l*l*l-9*l*c+27*h)/27,g=d/2,_=g*g+p*p*p;let y,v,m,x,b;if(_<0){const t=-f/3,n=wa(t*t*t),e=-d/(2*n),r=xa(e<-1?-1:e>1?1:e),o=2*Ma(n);return m=o*va(r/3)-l/3,x=o*va((r+za)/3)-l/3,b=o*va((r+2*za)/3)-l/3,[m,x,b].filter(i)}if(0===_)return y=g<0?Ma(-g):-Ma(g),m=2*y-l/3,x=-y-l/3,[m,x].filter(i);{const t=wa(_);return y=Ma(-g+t),v=Ma(g+t),[y-v-l/3].filter(i)}},droots:function(t){if(3===t.length){const n=t[0],e=t[1],r=t[2],i=n-2*e+r;if(0!==i){const t=-wa(e*e-n*r),o=-n+e;return[-(t+o)/i,-(-t+o)/i]}return e!==r&&0===i?[(2*e-r)/(2*(e-r))]:[]}if(2===t.length){const n=t[0],e=t[1];return n!==e?[n/(n-e)]:[]}return[]},curvature:function(t,n,e,r,i){let o,a,u,s,l=0,c=0;const h=Oa.compute(t,n),f=Oa.compute(t,e),p=h.x*h.x+h.y*h.y;if(r?(o=wa(ka(h.y*f.z-f.y*h.z,2)+ka(h.z*f.x-f.z*h.x,2)+ka(h.x*f.y-f.x*h.y,2)),a=ka(p+h.z*h.z,1.5)):(o=h.x*f.y-h.y*f.x,a=ka(p,1.5)),0===o||0===a)return{k:0,r:0};if(l=o/a,c=a/o,!i){const i=Oa.curvature(t-.001,n,e,r,!0).k,o=Oa.curvature(t+.001,n,e,r,!0).k;s=(o-l+(l-i))/2,u=(ya(o-l)+ya(l-i))/2}return{k:l,r:c,dk:s,adk:u}},inflections:function(t){if(t.length<4)return[];const n=Oa.align(t,{p1:t[0],p2:t.slice(-1)[0]}),e=n[2].x*n[1].y,r=n[3].x*n[1].y,i=n[1].x*n[2].y,o=18*(-3*e+2*r+3*i-n[3].x*n[2].y),a=18*(3*e-r-3*i),u=18*(i-e);if(Oa.approximately(o,0)){if(!Oa.approximately(a,0)){let t=-u/a;if(0<=t&&t<=1)return[t]}return[]}const s=2*o;if(Oa.approximately(s,0))return[];const l=a*a-4*o*u;if(l<0)return[];const c=Math.sqrt(l);return[(c-a)/s,-(a+c)/s].filter(function(t){return 0<=t&&t<=1})},bboxoverlap:function(t,n){const e=["x","y"],r=e.length;for(let i,o,a,u,s=0;s<r;s++)if(i=e[s],o=t[i].mid,a=n[i].mid,u=(t[i].size+n[i].size)/2,ya(o-a)>=u)return!1;return!0},expandbox:function(t,n){n.x.min<t.x.min&&(t.x.min=n.x.min),n.y.min<t.y.min&&(t.y.min=n.y.min),n.z&&n.z.min<t.z.min&&(t.z.min=n.z.min),n.x.max>t.x.max&&(t.x.max=n.x.max),n.y.max>t.y.max&&(t.y.max=n.y.max),n.z&&n.z.max>t.z.max&&(t.z.max=n.z.max),t.x.mid=(t.x.min+t.x.max)/2,t.y.mid=(t.y.min+t.y.max)/2,t.z&&(t.z.mid=(t.z.min+t.z.max)/2),t.x.size=t.x.max-t.x.min,t.y.size=t.y.max-t.y.min,t.z&&(t.z.size=t.z.max-t.z.min)},pairiteration:function(t,n,e){const r=t.bbox(),i=n.bbox(),o=1e5,a=e||.5;if(r.x.size+r.y.size<a&&i.x.size+i.y.size<a)return[(o*(t._t1+t._t2)/2|0)/o+"/"+(o*(n._t1+n._t2)/2|0)/o];let u=t.split(.5),s=n.split(.5),l=[{left:u.left,right:s.left},{left:u.left,right:s.right},{left:u.right,right:s.right},{left:u.right,right:s.left}];l=l.filter(function(t){return Oa.bboxoverlap(t.left.bbox(),t.right.bbox())});let c=[];return 0===l.length||(l.forEach(function(t){c=c.concat(Oa.pairiteration(t.left,t.right,a))}),c=c.filter(function(t,n){return c.indexOf(t)===n})),c},getccenter:function(t,n,e){const r=n.x-t.x,i=n.y-t.y,o=e.x-n.x,a=e.y-n.y,u=r*va(Sa)-i*ma(Sa),s=r*ma(Sa)+i*va(Sa),l=o*va(Sa)-a*ma(Sa),c=o*ma(Sa)+a*va(Sa),h=(t.x+n.x)/2,f=(t.y+n.y)/2,p=(n.x+e.x)/2,d=(n.y+e.y)/2,g=h+u,_=f+s,y=p+l,v=d+c,m=Oa.lli8(h,f,g,_,p,d,y,v),x=Oa.dist(m,t);let b,w=ba(t.y-m.y,t.x-m.x),k=ba(n.y-m.y,n.x-m.x),M=ba(e.y-m.y,e.x-m.x);return w<M?((w>k||k>M)&&(w+=za),w>M&&(b=M,M=w,w=b)):M<k&&k<w?(b=M,M=w,w=b):M+=za,m.s=w,m.e=M,m.r=x,m},numberSort:function(t,n){return t-n}};class Na{constructor(t){this.curves=[],this._3d=!1,t&&(this.curves=t,this._3d=this.curves[0]._3d)}valueOf(){return this.toString()}toString(){return"["+this.curves.map(function(t){return Oa.pointsToString(t.points)}).join(", ")+"]"}addCurve(t){this.curves.push(t),this._3d=this._3d||t._3d}length(){return this.curves.map(function(t){return t.length()}).reduce(function(t,n){return t+n})}curve(t){return this.curves[t]}bbox(){const t=this.curves;for(var n=t[0].bbox(),e=1;e<t.length;e++)Oa.expandbox(n,t[e].bbox());return n}offset(t){const n=[];return this.curves.forEach(function(e){n.push(...e.offset(t))}),new Na(n)}}const{abs:ja,min:Ta,max:Ra,cos:Da,sin:Ia,acos:Ua,sqrt:Fa}=Math,La=Math.PI;class qa{constructor(t){let n=t&&t.forEach?t:Array.from(arguments).slice(),e=!1;if("object"==typeof n[0]){e=n.length;const t=[];n.forEach(function(n){["x","y","z"].forEach(function(e){void 0!==n[e]&&t.push(n[e])})}),n=t}let r=!1;const i=n.length;if(e){if(e>4){if(1!==arguments.length)throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");r=!0}}else if(6!==i&&8!==i&&9!==i&&12!==i&&1!==arguments.length)throw new Error("Only new Bezier(point[]) is accepted for 4th and higher order curves");const o=this._3d=!r&&(9===i||12===i)||t&&t[0]&&void 0!==t[0].z,a=this.points=[];for(let t=0,e=o?3:2;t<i;t+=e){var u={x:n[t],y:n[t+1]};o&&(u.z=n[t+2]),a.push(u)}const s=this.order=a.length-1,l=this.dims=["x","y"];o&&l.push("z"),this.dimlen=l.length;const c=Oa.align(a,{p1:a[0],p2:a[s]}),h=Oa.dist(a[0],a[s]);this._linear=c.reduce((t,n)=>t+ja(n.y),0)<h/50,this._lut=[],this._t1=0,this._t2=1,this.update()}static quadraticFromPoints(t,n,e,r){if(void 0===r&&(r=.5),0===r)return new qa(n,n,e);if(1===r)return new qa(t,n,n);const i=qa.getABC(2,t,n,e,r);return new qa(t,i.A,e)}static cubicFromPoints(t,n,e,r,i){void 0===r&&(r=.5);const o=qa.getABC(3,t,n,e,r);void 0===i&&(i=Oa.dist(n,o.C));const a=i*(1-r)/r,u=Oa.dist(t,e),s=(e.x-t.x)/u,l=(e.y-t.y)/u,c=i*s,h=i*l,f=a*s,p=a*l,d=n.x-c,g=n.y-h,_=n.x+f,y=n.y+p,v=o.A,m=v.x+(d-v.x)/(1-r),x=v.y+(g-v.y)/(1-r),b=v.x+(_-v.x)/r,w=v.y+(y-v.y)/r,k={x:t.x+(m-t.x)/r,y:t.y+(x-t.y)/r},M={x:e.x+(b-e.x)/(1-r),y:e.y+(w-e.y)/(1-r)};return new qa(t,k,M,e)}static getUtils(){return Oa}getUtils(){return qa.getUtils()}static get PolyBezier(){return Na}valueOf(){return this.toString()}toString(){return Oa.pointsToString(this.points)}toSVG(){if(this._3d)return!1;const t=this.points,n=["M",t[0].x,t[0].y,2===this.order?"Q":"C"];for(let e=1,r=t.length;e<r;e++)n.push(t[e].x),n.push(t[e].y);return n.join(" ")}setRatios(t){if(t.length!==this.points.length)throw new Error("incorrect number of ratio values");this.ratios=t,this._lut=[]}verify(){const t=this.coordDigest();t!==this._print&&(this._print=t,this.update())}coordDigest(){return this.points.map(function(t,n){return""+n+t.x+t.y+(t.z?t.z:0)}).join("")}update(){this._lut=[],this.dpoints=Oa.derive(this.points,this._3d),this.computedirection()}computedirection(){const t=this.points,n=Oa.angle(t[0],t[this.order],t[1]);this.clockwise=n>0}length(){return Oa.length(this.derivative.bind(this))}static getABC(t=2,n,e,r,i=.5){const o=Oa.projectionratio(i,t),a=1-o,u={x:o*n.x+a*r.x,y:o*n.y+a*r.y},s=Oa.abcratio(i,t);return{A:{x:e.x+(e.x-u.x)/s,y:e.y+(e.y-u.y)/s},B:e,C:u,S:n,E:r}}getABC(t,n){n=n||this.get(t);let e=this.points[0],r=this.points[this.order];return qa.getABC(this.order,e,n,r,t)}getLUT(t){if(this.verify(),t=t||100,this._lut.length===t+1)return this._lut;this._lut=[],t++,this._lut=[];for(let n,e,r=0;r<t;r++)e=r/(t-1),n=this.compute(e),n.t=e,this._lut.push(n);return this._lut}on(n,e){e=e||5;const r=this.getLUT(),i=[];for(let t,o=0,a=0;o<r.length;o++)t=r[o],Oa.dist(t,n)<e&&(i.push(t),a+=o/r.length);return!!i.length&&(t/=i.length)}project(t){const n=this.getLUT(),e=n.length-1,r=Oa.closest(n,t),i=r.mpos,o=(i-1)/e,a=(i+1)/e,u=.1/e;let s,l=r.mdist,c=o,h=c;l+=1;for(let n;c<a+u;c+=u)s=this.compute(c),n=Oa.dist(t,s),n<l&&(l=n,h=c);return h=h<0?0:h>1?1:h,s=this.compute(h),s.t=h,s.d=l,s}get(t){return this.compute(t)}point(t){return this.points[t]}compute(t){return this.ratios?Oa.computeWithRatios(t,this.points,this.ratios,this._3d):Oa.compute(t,this.points,this._3d,this.ratios)}raise(){const t=this.points,n=[t[0]],e=t.length;for(let r,i,o=1;o<e;o++)r=t[o],i=t[o-1],n[o]={x:(e-o)/e*r.x+o/e*i.x,y:(e-o)/e*r.y+o/e*i.y};return n[e]=t[e-1],new qa(n)}derivative(t){return Oa.compute(t,this.dpoints[0],this._3d)}dderivative(t){return Oa.compute(t,this.dpoints[1],this._3d)}align(){let t=this.points;return new qa(Oa.align(t,{p1:t[0],p2:t[t.length-1]}))}curvature(t){return Oa.curvature(t,this.dpoints[0],this.dpoints[1],this._3d)}inflections(){return Oa.inflections(this.points)}normal(t){return this._3d?this.__normal3(t):this.__normal2(t)}__normal2(t){const n=this.derivative(t),e=Fa(n.x*n.x+n.y*n.y);return{t:t,x:-n.y/e,y:n.x/e}}__normal3(t){const n=this.derivative(t),e=this.derivative(t+.01),r=Fa(n.x*n.x+n.y*n.y+n.z*n.z),i=Fa(e.x*e.x+e.y*e.y+e.z*e.z);n.x/=r,n.y/=r,n.z/=r,e.x/=i,e.y/=i,e.z/=i;const o={x:e.y*n.z-e.z*n.y,y:e.z*n.x-e.x*n.z,z:e.x*n.y-e.y*n.x},a=Fa(o.x*o.x+o.y*o.y+o.z*o.z);o.x/=a,o.y/=a,o.z/=a;const u=[o.x*o.x,o.x*o.y-o.z,o.x*o.z+o.y,o.x*o.y+o.z,o.y*o.y,o.y*o.z-o.x,o.x*o.z-o.y,o.y*o.z+o.x,o.z*o.z];return{t:t,x:u[0]*n.x+u[1]*n.y+u[2]*n.z,y:u[3]*n.x+u[4]*n.y+u[5]*n.z,z:u[6]*n.x+u[7]*n.y+u[8]*n.z}}hull(t){let n=this.points,e=[],r=[],i=0;for(r[i++]=n[0],r[i++]=n[1],r[i++]=n[2],3===this.order&&(r[i++]=n[3]);n.length>1;){e=[];for(let o,a=0,u=n.length-1;a<u;a++)o=Oa.lerp(t,n[a],n[a+1]),r[i++]=o,e.push(o);n=e}return r}split(t,n){if(0===t&&n)return this.split(n).left;if(1===n)return this.split(t).right;const e=this.hull(t),r={left:2===this.order?new qa([e[0],e[3],e[5]]):new qa([e[0],e[4],e[7],e[9]]),right:2===this.order?new qa([e[5],e[4],e[2]]):new qa([e[9],e[8],e[6],e[3]]),span:e};return r.left._t1=Oa.map(0,0,1,this._t1,this._t2),r.left._t2=Oa.map(t,0,1,this._t1,this._t2),r.right._t1=Oa.map(t,0,1,this._t1,this._t2),r.right._t2=Oa.map(1,0,1,this._t1,this._t2),n?(n=Oa.map(n,t,1,0,1),r.right.split(n).left):r}extrema(){const t={};let n=[];return this.dims.forEach(function(e){let r=function(t){return t[e]},i=this.dpoints[0].map(r);t[e]=Oa.droots(i),3===this.order&&(i=this.dpoints[1].map(r),t[e]=t[e].concat(Oa.droots(i))),t[e]=t[e].filter(function(t){return t>=0&&t<=1}),n=n.concat(t[e].sort(Oa.numberSort))}.bind(this)),t.values=n.sort(Oa.numberSort).filter(function(t,e){return n.indexOf(t)===e}),t}bbox(){const t=this.extrema(),n={};return this.dims.forEach(function(e){n[e]=Oa.getminmax(this,e,t[e])}.bind(this)),n}overlaps(t){const n=this.bbox(),e=t.bbox();return Oa.bboxoverlap(n,e)}offset(t,n){if(void 0!==n){const e=this.get(t),r=this.normal(t),i={c:e,n:r,x:e.x+r.x*n,y:e.y+r.y*n};return this._3d&&(i.z=e.z+r.z*n),i}if(this._linear){const n=this.normal(0),e=this.points.map(function(e){const r={x:e.x+t*n.x,y:e.y+t*n.y};return e.z&&n.z&&(r.z=e.z+t*n.z),r});return[new qa(e)]}return this.reduce().map(function(n){return n._linear?n.offset(t)[0]:n.scale(t)})}simple(){if(3===this.order){const t=Oa.angle(this.points[0],this.points[3],this.points[1]),n=Oa.angle(this.points[0],this.points[3],this.points[2]);if(t>0&&n<0||t<0&&n>0)return!1}const t=this.normal(0),n=this.normal(1);let e=t.x*n.x+t.y*n.y;return this._3d&&(e+=t.z*n.z),ja(Ua(e))<La/3}reduce(){let t,n,e=0,r=0,i=.01,o=[],a=[],u=this.extrema().values;for(-1===u.indexOf(0)&&(u=[0].concat(u)),-1===u.indexOf(1)&&u.push(1),e=u[0],t=1;t<u.length;t++)r=u[t],n=this.split(e,r),n._t1=e,n._t2=r,o.push(n),e=r;return o.forEach(function(t){for(e=0,r=0;r<=1;)for(r=e+i;r<=1.01;r+=i)if(n=t.split(e,r),!n.simple()){if(r-=i,ja(e-r)<i)return[];n=t.split(e,r),n._t1=Oa.map(e,0,1,t._t1,t._t2),n._t2=Oa.map(r,0,1,t._t1,t._t2),a.push(n),e=r;break}e<1&&(n=t.split(e,1),n._t1=Oa.map(e,0,1,t._t1,t._t2),n._t2=t._t2,a.push(n))}),a}translate(t,n,e){e="number"==typeof e?e:n;const r=this.order;let i=this.points.map((t,i)=>(1-i/r)*n+i/r*e);return new qa(this.points.map((n,e)=>({x:n.x+t.x*i[e],y:n.y+t.y*i[e]})))}scale(t){const n=this.order;let e=!1;if("function"==typeof t&&(e=t),e&&2===n)return this.raise().scale(e);const r=this.clockwise,i=this.points;if(this._linear)return this.translate(this.normal(0),e?e(0):t,e?e(1):t);const o=e?e(0):t,a=e?e(1):t,u=[this.offset(0,10),this.offset(1,10)],s=[],l=Oa.lli4(u[0],u[0].c,u[1],u[1].c);if(!l)throw new Error("cannot scale this curve. Try reducing it first.");return[0,1].forEach(function(t){const e=s[t*n]=Oa.copy(i[t*n]);e.x+=(t?a:o)*u[t].n.x,e.y+=(t?a:o)*u[t].n.y}),e?([0,1].forEach(function(o){if(2!==n||!o){var a=i[o+1],u={x:a.x-l.x,y:a.y-l.y},c=e?e((o+1)/n):t;e&&!r&&(c=-c);var h=Fa(u.x*u.x+u.y*u.y);u.x/=h,u.y/=h,s[o+1]={x:a.x+c*u.x,y:a.y+c*u.y}}}),new qa(s)):([0,1].forEach(t=>{if(2===n&&t)return;const e=s[t*n],r=this.derivative(t),o={x:e.x+r.x,y:e.y+r.y};s[t+1]=Oa.lli4(e,o,l,i[t+1])}),new qa(s))}outline(t,n,e,r){if(n=void 0===n?t:n,this._linear){const i=this.normal(0),o=this.points[0],a=this.points[this.points.length-1];let u,s,l;void 0===e&&(e=t,r=n),u={x:o.x+i.x*t,y:o.y+i.y*t},l={x:a.x+i.x*e,y:a.y+i.y*e},s={x:(u.x+l.x)/2,y:(u.y+l.y)/2};const c=[u,s,l];u={x:o.x-i.x*n,y:o.y-i.y*n},l={x:a.x-i.x*r,y:a.y-i.y*r},s={x:(u.x+l.x)/2,y:(u.y+l.y)/2};const h=[l,s,u],f=Oa.makeline(h[2],c[0]),p=Oa.makeline(c[2],h[0]),d=[f,new qa(c),p,new qa(h)];return new Na(d)}const i=this.reduce(),o=i.length,a=[];let u,s=[],l=0,c=this.length();const h=void 0!==e&&void 0!==r;function f(t,n,e,r,i){return function(o){const a=r/e,u=(r+i)/e,s=n-t;return Oa.map(o,0,1,t+a*s,t+u*s)}}i.forEach(function(i){const o=i.length();h?(a.push(i.scale(f(t,e,c,l,o))),s.push(i.scale(f(-n,-r,c,l,o)))):(a.push(i.scale(t)),s.push(i.scale(-n))),l+=o}),s=s.map(function(t){return u=t.points,u[3]?t.points=[u[3],u[2],u[1],u[0]]:t.points=[u[2],u[1],u[0]],t}).reverse();const p=a[0].points[0],d=a[o-1].points[a[o-1].points.length-1],g=s[o-1].points[s[o-1].points.length-1],_=s[0].points[0],y=Oa.makeline(g,p),v=Oa.makeline(d,_),m=[y].concat(a).concat([v]).concat(s);return new Na(m)}outlineshapes(t,n,e){n=n||t;const r=this.outline(t,n).curves,i=[];for(let t=1,n=r.length;t<n/2;t++){const o=Oa.makeshape(r[t],r[n-t],e);o.startcap.virtual=t>1,o.endcap.virtual=t<n/2-1,i.push(o)}return i}intersects(t,n){return t?t.p1&&t.p2?this.lineIntersects(t):(t instanceof qa&&(t=t.reduce()),this.curveintersects(this.reduce(),t,n)):this.selfintersects(n)}lineIntersects(t){const n=Ta(t.p1.x,t.p2.x),e=Ta(t.p1.y,t.p2.y),r=Ra(t.p1.x,t.p2.x),i=Ra(t.p1.y,t.p2.y);return Oa.roots(this.points,t).filter(t=>{var o=this.get(t);return Oa.between(o.x,n,r)&&Oa.between(o.y,e,i)})}selfintersects(t){const n=this.reduce(),e=n.length-2,r=[];for(let i,o,a,u=0;u<e;u++)o=n.slice(u,u+1),a=n.slice(u+2),i=this.curveintersects(o,a,t),r.push(...i);return r}curveintersects(t,n,e){const r=[];t.forEach(function(t){n.forEach(function(n){t.overlaps(n)&&r.push({left:t,right:n})})});let i=[];return r.forEach(function(t){const n=Oa.pairiteration(t.left,t.right,e);n.length>0&&(i=i.concat(n))}),i}arcs(t){return t=t||.5,this._iterate(t,[])}_error(t,n,e,r){const i=(r-e)/4,o=this.get(e+i),a=this.get(r-i),u=Oa.dist(t,n),s=Oa.dist(t,o),l=Oa.dist(t,a);return ja(s-u)+ja(l-u)}_iterate(t,n){let e,r=0,i=1;do{e=0,i=1;let o,a,u,s,l,c=this.get(r),h=!1,f=!1,p=i,d=1;do{if(f=h,s=u,p=(r+i)/2,o=this.get(p),a=this.get(i),u=Oa.getccenter(c,o,a),u.interval={start:r,end:i},h=this._error(u,c,r,i)<=t,l=f&&!h,l||(d=i),h){if(i>=1){if(u.interval.end=d=1,s=u,i>1){let t={x:u.x+u.r*Da(u.e),y:u.y+u.r*Ia(u.e)};u.e+=Oa.angle({x:u.x,y:u.y},t,this.get(1))}break}i+=(i-r)/2}else i=p}while(!l&&e++<100);if(e>=100)break;s=s||u,n.push(s),r=d}while(i<1);return n}}function $a(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=Array(n);e<n;e++)r[e]=t[e];return r}function Ba(t,n){return function(t){if(Array.isArray(t))return t}(t)||function(t,n){var e=null==t?null:"undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(null!=e){var r,i,o,a,u=[],s=!0,l=!1;try{if(o=(e=e.call(t)).next,0===n);else for(;!(s=(r=o.call(e)).done)&&(u.push(r.value),u.length!==n);s=!0);}catch(t){l=!0,i=t}finally{try{if(!s&&null!=e.return&&(a=e.return(),Object(a)!==a))return}finally{if(l)throw i}}return u}}(t,n)||Xa(t,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function Ha(t){return function(t){if(Array.isArray(t))return $a(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||Xa(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function Va(t){var n=function(t,n){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var r=e.call(t,n);if("object"!=typeof r)return r;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t,"string");return"symbol"==typeof n?n:n+""}function Xa(t,n){if(t){if("string"==typeof t)return $a(t,n);var e={}.toString.call(t).slice(8,-1);return"Object"===e&&t.constructor&&(e=t.constructor.name),"Map"===e||"Set"===e?Array.from(t):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?$a(t,n):void 0}}var Ga=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],e=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],r=arguments.length>3&&void 0!==arguments[3]&&arguments[3],i=(n instanceof Array?n.length?n:[void 0]:[n]).map(function(t){return{keyAccessor:t,isProp:!(t instanceof Function)}}),o=t.reduce(function(t,n){var r=t,o=n;return i.forEach(function(t,n){var a,u=t.keyAccessor;if(t.isProp){var s=o,l=s[u],c=function(t,n){if(null==t)return{};var e,r,i=function(t,n){if(null==t)return{};var e={};for(var r in t)if({}.hasOwnProperty.call(t,r)){if(n.includes(r))continue;e[r]=t[r]}return e}(t,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(t);for(r=0;r<o.length;r++)e=o[r],n.includes(e)||{}.propertyIsEnumerable.call(t,e)&&(i[e]=t[e])}return i}(s,[u].map(Va));a=l,o=c}else a=u(o,n);n+1<i.length?(r.hasOwnProperty(a)||(r[a]={}),r=r[a]):e?(r.hasOwnProperty(a)||(r[a]=[]),r[a].push(o)):r[a]=o}),t},{});e instanceof Function&&function t(n){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;r===i.length?Object.keys(n).forEach(function(t){return n[t]=e(n[t])}):Object.values(n).forEach(function(n){return t(n,r+1)})}(o);var a=o;return r&&(a=[],function t(n){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[];e.length===i.length?a.push({keys:e,vals:n}):Object.entries(n).forEach(function(n){var r=Ba(n,2),i=r[0],o=r[1];return t(o,[].concat(Ha(e),[i]))})}(o),n instanceof Array&&0===n.length&&1===a.length&&(a[0].keys=[])),a};function Ya(t,n){switch(arguments.length){case 0:break;case 1:this.range(t);break;default:this.range(n).domain(t)}return this}const Wa=Symbol("implicit");var Za=function(t){for(var n=t.length/6|0,e=new Array(n),r=0;r<n;)e[r]="#"+t.slice(6*r,6*++r);return e}("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928"),Qa=function t(){var n=new We,e=[],r=[],i=Wa;function o(t){let o=n.get(t);if(void 0===o){if(i!==Wa)return i;n.set(t,o=e.push(t)-1)}return r[o%r.length]}return o.domain=function(t){if(!arguments.length)return e.slice();e=[],n=new We;for(const r of t)n.has(r)||n.set(r,e.push(r)-1);return o},o.range=function(t){return arguments.length?(r=Array.from(t),o):r.slice()},o.unknown=function(t){return arguments.length?(i=t,o):i},o.copy=function(){return t(e,r).unknown(i)},Ya.apply(o,arguments),o}(Za);function Ka(t,n,e){n&&"string"==typeof e&&t.filter(function(t){return!t[e]}).forEach(function(t){t[e]=Qa(n(t))})}var Ja=function(t,n){return n.onNeedsRedraw&&n.onNeedsRedraw()},tu=function(t,n){if(!n.isShadow){var e=Ir(n.linkDirectionalParticles);n.graphData.links.forEach(function(t){var n=Math.round(Math.abs(e(t)));n?t.__photons=s(Array(n)).map(function(){return{}}):delete t.__photons})}},nu=Dr({props:{graphData:{default:{nodes:[],links:[]},onChange:function(t,n){n.engineRunning=!1,tu(0,n)}},dagMode:{onChange:function(t,n){!t&&(n.graphData.nodes||[]).forEach(function(t){return t.fx=t.fy=void 0})}},dagLevelDistance:{},dagNodeFilter:{default:function(t){return!0}},onDagError:{triggerUpdate:!1},nodeRelSize:{default:4,triggerUpdate:!1,onChange:Ja},nodeId:{default:"id"},nodeVal:{default:"val",triggerUpdate:!1,onChange:Ja},nodeColor:{default:"color",triggerUpdate:!1,onChange:Ja},nodeAutoColorBy:{},nodeCanvasObject:{triggerUpdate:!1,onChange:Ja},nodeCanvasObjectMode:{default:function(){return"replace"},triggerUpdate:!1,onChange:Ja},nodeVisibility:{default:!0,triggerUpdate:!1,onChange:Ja},linkSource:{default:"source"},linkTarget:{default:"target"},linkVisibility:{default:!0,triggerUpdate:!1,onChange:Ja},linkColor:{default:"color",triggerUpdate:!1,onChange:Ja},linkAutoColorBy:{},linkLineDash:{triggerUpdate:!1,onChange:Ja},linkWidth:{default:1,triggerUpdate:!1,onChange:Ja},linkCurvature:{default:0,triggerUpdate:!1,onChange:Ja},linkCanvasObject:{triggerUpdate:!1,onChange:Ja},linkCanvasObjectMode:{default:function(){return"replace"},triggerUpdate:!1,onChange:Ja},linkDirectionalArrowLength:{default:0,triggerUpdate:!1,onChange:Ja},linkDirectionalArrowColor:{triggerUpdate:!1,onChange:Ja},linkDirectionalArrowRelPos:{default:.5,triggerUpdate:!1,onChange:Ja},linkDirectionalParticles:{default:0,triggerUpdate:!1,onChange:tu},linkDirectionalParticleSpeed:{default:.01,triggerUpdate:!1},linkDirectionalParticleOffset:{default:0,triggerUpdate:!1},linkDirectionalParticleWidth:{default:4,triggerUpdate:!1},linkDirectionalParticleColor:{triggerUpdate:!1},linkDirectionalParticleCanvasObject:{triggerUpdate:!1},globalScale:{default:1,triggerUpdate:!1},d3AlphaMin:{default:0,triggerUpdate:!1},d3AlphaDecay:{default:.0228,triggerUpdate:!1,onChange:function(t,n){n.forceLayout.alphaDecay(t)}},d3AlphaTarget:{default:0,triggerUpdate:!1,onChange:function(t,n){n.forceLayout.alphaTarget(t)}},d3VelocityDecay:{default:.4,triggerUpdate:!1,onChange:function(t,n){n.forceLayout.velocityDecay(t)}},warmupTicks:{default:0,triggerUpdate:!1},cooldownTicks:{default:1/0,triggerUpdate:!1},cooldownTime:{default:15e3,triggerUpdate:!1},onUpdate:{default:function(){},triggerUpdate:!1},onFinishUpdate:{default:function(){},triggerUpdate:!1},onEngineTick:{default:function(){},triggerUpdate:!1},onEngineStop:{default:function(){},triggerUpdate:!1},onNeedsRedraw:{triggerUpdate:!1},isShadow:{default:!1,triggerUpdate:!1}},methods:{d3Force:function(t,n,e){return void 0===e?t.forceLayout.force(n):(t.forceLayout.force(n,e),this)},d3ReheatSimulation:function(t){return t.forceLayout.alpha(1),this.resetCountdown(),this},resetCountdown:function(t){return t.cntTicks=0,t.startTickTime=new Date,t.engineRunning=!0,this},isEngineRunning:function(t){return!!t.engineRunning},tickFrame:function(t){var n,r,i,o,a,l;return!t.isShadow&&t.engineRunning&&(++t.cntTicks>t.cooldownTicks||new Date-t.startTickTime>t.cooldownTime||t.d3AlphaMin>0&&t.forceLayout.alpha()<t.d3AlphaMin?(t.engineRunning=!1,t.onEngineStop()):(t.forceLayout.tick(),t.onEngineTick())),function(){var n=Ir(t.linkVisibility),e=Ir(t.linkColor),r=Ir(t.linkWidth),i=Ir(t.linkLineDash),o=Ir(t.linkCurvature),a=Ir(t.linkCanvasObjectMode),l=t.ctx,c=2*t.isShadow,h=t.graphData.links.filter(n);h.forEach(function(t){var n=o(t);if(!n)return void(t.__controlPoints=null);var e=t.source,r=t.target;if(!(e&&r&&e.hasOwnProperty("x")&&r.hasOwnProperty("x")))return;var i=Math.sqrt(Math.pow(r.x-e.x,2)+Math.pow(r.y-e.y,2));if(i>0){var a=Math.atan2(r.y-e.y,r.x-e.x),u=i*n,s={x:(e.x+r.x)/2+u*Math.cos(a-Math.PI/2),y:(e.y+r.y)/2+u*Math.sin(a-Math.PI/2)};t.__controlPoints=[s.x,s.y]}else{var l=70*n;t.__controlPoints=[r.x,r.y-l,r.x+l,r.y]}});var f=[],p=[],d=h;if(t.linkCanvasObject){var g=[],_=[];h.forEach(function(t){return({before:f,after:p,replace:g}[a(t)]||_).push(t)}),d=[].concat(s(f),p,_),f=f.concat(g)}l.save(),f.forEach(function(n){return t.linkCanvasObject(n,l,t.globalScale)}),l.restore();var y=Ga(d,[e,r,i]);l.save(),Object.entries(y).forEach(function(n){var e=u(n,2),r=e[0],o=e[1],a=r&&"undefined"!==r?r:"rgba(0,0,0,0.15)";Object.entries(o).forEach(function(n){var e=u(n,2),r=e[0],o=e[1],h=(r||1)/t.globalScale+c;Object.entries(o).forEach(function(t){var n=u(t,2);n[0];var e=n[1],r=i(e[0]);l.beginPath(),e.forEach(function(t){var n=t.source,e=t.target;if(n&&e&&n.hasOwnProperty("x")&&e.hasOwnProperty("x")){l.moveTo(n.x,n.y);var r=t.__controlPoints;r?l[2===r.length?"quadraticCurveTo":"bezierCurveTo"].apply(l,s(r).concat([e.x,e.y])):l.lineTo(e.x,e.y)}}),l.strokeStyle=a,l.lineWidth=h,l.setLineDash(r||[]),l.stroke()})})}),l.restore(),l.save(),p.forEach(function(n){return t.linkCanvasObject(n,l,t.globalScale)}),l.restore()}(),!t.isShadow&&(n=Ir(t.linkDirectionalArrowLength),r=Ir(t.linkDirectionalArrowRelPos),i=Ir(t.linkVisibility),o=Ir(t.linkDirectionalArrowColor||t.linkColor),a=Ir(t.nodeVal),(l=t.ctx).save(),t.graphData.links.filter(i).forEach(function(i){var u=n(i);if(u&&!(u<0)){var c=i.source,h=i.target;if(c&&h&&c.hasOwnProperty("x")&&h.hasOwnProperty("x")){var f=Math.sqrt(Math.max(0,a(c)||1))*t.nodeRelSize,p=Math.sqrt(Math.max(0,a(h)||1))*t.nodeRelSize,d=Math.min(1,Math.max(0,r(i))),g=o(i)||"rgba(0,0,0,0.28)",_=u/1.6/2,y=i.__controlPoints&&e(qa,[c.x,c.y].concat(s(i.__controlPoints),[h.x,h.y])),v=y?function(t){return y.get(t)}:function(t){return{x:c.x+(h.x-c.x)*t||0,y:c.y+(h.y-c.y)*t||0}},m=y?y.length():Math.sqrt(Math.pow(h.x-c.x,2)+Math.pow(h.y-c.y,2)),x=f+u+(m-f-p-u)*d,b=v(x/m),w=v((x-u)/m),k=v((x-.8*u)/m),M=Math.atan2(b.y-w.y,b.x-w.x)-Math.PI/2;l.beginPath(),l.moveTo(b.x,b.y),l.lineTo(w.x+_*Math.cos(M),w.y+_*Math.sin(M)),l.lineTo(k.x,k.y),l.lineTo(w.x-_*Math.cos(M),w.y-_*Math.sin(M)),l.fillStyle=g,l.fill()}}}),l.restore()),!t.isShadow&&function(){var n=Ir(t.linkDirectionalParticles),r=Ir(t.linkDirectionalParticleSpeed),i=Ir(t.linkDirectionalParticleOffset),o=Ir(t.linkDirectionalParticleWidth),a=Ir(t.linkVisibility),u=Ir(t.linkDirectionalParticleColor||t.linkColor),l=t.ctx;l.save(),t.graphData.links.filter(a).forEach(function(a){var c=n(a);if(a.hasOwnProperty("__photons")&&a.__photons.length){var h=a.source,f=a.target;if(h&&f&&h.hasOwnProperty("x")&&f.hasOwnProperty("x")){var p=r(a),d=Math.abs(i(a)),g=a.__photons||[],_=Math.max(0,o(a)/2)/Math.sqrt(t.globalScale),y=u(a)||"rgba(0,0,0,0.28)";l.fillStyle=y;var v=a.__controlPoints?e(qa,[h.x,h.y].concat(s(a.__controlPoints),[f.x,f.y])):null,m=0,x=!1;g.forEach(function(n){var e=!!n.__singleHop;if(n.hasOwnProperty("__progressRatio")||(n.__progressRatio=e?p<0?1:0:(m+d)/c),!e&&m++,n.__progressRatio+=p,n.__progressRatio>=1||n.__progressRatio<0){if(e)return void(x=!0);n.__progressRatio=n.__progressRatio%1,n.__progressRatio<0&&n.__progressRatio++}var r=n.__progressRatio,i=v?v.get(r):{x:h.x+(f.x-h.x)*r||0,y:h.y+(f.y-h.y)*r||0};t.linkDirectionalParticleCanvasObject?t.linkDirectionalParticleCanvasObject(i.x,i.y,a,l,t.globalScale):(l.beginPath(),l.arc(i.x,i.y,_,0,2*Math.PI,!1),l.fill())}),x&&(a.__photons=a.__photons.filter(function(t){return!t.__singleHop||t.__progressRatio<=1&&t.__progressRatio>=0}))}}}),l.restore()}(),function(){var n=Ir(t.nodeVisibility),e=Ir(t.nodeVal),r=Ir(t.nodeColor),i=Ir(t.nodeCanvasObjectMode),o=t.ctx,a=t.isShadow/t.globalScale,u=t.graphData.nodes.filter(n);o.save(),u.forEach(function(n){var u=i(n);if(!t.nodeCanvasObject||"before"!==u&&"replace"!==u||(t.nodeCanvasObject(n,o,t.globalScale),"replace"!==u)){var s=Math.sqrt(Math.max(0,e(n)||1))*t.nodeRelSize+a;o.beginPath(),o.arc(n.x,n.y,s,0,2*Math.PI,!1),o.fillStyle=r(n)||"rgba(31, 120, 180, 0.92)",o.fill(),t.nodeCanvasObject&&"after"===u&&t.nodeCanvasObject(n,t.ctx,t.globalScale)}else o.restore()}),o.restore()}(),this},emitParticle:function(t,n){return n&&(!n.__photons&&(n.__photons=[]),n.__photons.push({__singleHop:!0})),this}},stateInit:function(){return{forceLayout:ga().force("link",sa()).force("charge",_a()).force("center",No()).force("dagRadial",null).stop(),engineRunning:!1}},init:function(t,n){n.ctx=t},update:function(t,n){t.engineRunning=!1,t.onUpdate(),null!==t.nodeAutoColorBy&&Ka(t.graphData.nodes,Ir(t.nodeAutoColorBy),t.nodeColor),null!==t.linkAutoColorBy&&Ka(t.graphData.links,Ir(t.linkAutoColorBy),t.linkColor),t.graphData.links.forEach(function(n){n.source=n[t.linkSource],n.target=n[t.linkTarget]}),t.forceLayout.stop().alpha(1).nodes(t.graphData.nodes);var e=t.forceLayout.force("link");e&&e.id(function(n){return n[t.nodeId]}).links(t.graphData.links);var i=t.dagMode&&function(t,n){var e=t.nodes,i=t.links,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},a=o.nodeFilter,c=void 0===a?function(){return!0}:a,h=o.onLoopError,f=void 0===h?function(t){throw"Invalid DAG structure! Found cycle in node path: ".concat(t.join(" -> "),".")}:h,p={};e.forEach(function(t){return p[n(t)]={data:t,out:[],depth:-1,skip:!c(t)}}),i.forEach(function(t){var e=t.source,r=t.target,i=s(e),o=s(r);if(!p.hasOwnProperty(i))throw"Missing source node with id: ".concat(i);if(!p.hasOwnProperty(o))throw"Missing target node with id: ".concat(o);var a=p[i],u=p[o];function s(t){return"object"===l(t)?n(t):t}a.out.push(u)});var d=[];return function t(e){for(var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,o=function(){var o=e[a];if(-1!==r.indexOf(o)){var u=[].concat(s(r.slice(r.indexOf(o))),[o]).map(function(t){return n(t.data)});return d.some(function(t){return t.length===u.length&&t.every(function(t,n){return t===u[n]})})||(d.push(u),f(u)),1}i>o.depth&&(o.depth=i,t(o.out,[].concat(s(r),[o]),i+(o.skip?0:1)))},a=0,u=e.length;a<u;a++)o()}(Object.values(p)),Object.assign.apply(Object,[{}].concat(s(Object.entries(p).filter(function(t){return!u(t,2)[1].skip}).map(function(t){var n=u(t,2);return r({},n[0],n[1].depth)}))))}(t.graphData,function(n){return n[t.nodeId]},{nodeFilter:t.dagNodeFilter,onLoopError:t.onDagError||void 0}),o=Math.max.apply(Math,s(Object.values(i||[]))),a=t.dagLevelDistance||t.graphData.nodes.length/(o||1)*2*(-1!==["radialin","radialout"].indexOf(t.dagMode)?.7:1);if(["lr","rl","td","bu"].includes(n.dagMode)){var c=["lr","rl"].includes(n.dagMode)?"fx":"fy";t.graphData.nodes.filter(t.dagNodeFilter).forEach(function(t){return delete t[c]})}if(["lr","rl","td","bu"].includes(t.dagMode)){var h=["rl","bu"].includes(t.dagMode),f=["lr","rl"].includes(t.dagMode)?"fx":"fy";t.graphData.nodes.filter(t.dagNodeFilter).forEach(function(n){return n[f]=function(n){return(i[n[t.nodeId]]-o/2)*a*(h?-1:1)}(n)})}t.forceLayout.force("dagRadial",-1!==["radialin","radialout"].indexOf(t.dagMode)?function(t,n,e,r){var i,o,a,u,s=ia(.1);function l(t){for(var s=0,l=i.length;s<l;++s){var c=i[s],h=c.x-n||1e-6,f=(c.y||0)-e||1e-6,p=(c.z||0)-r||1e-6,d=Math.sqrt(h*h+f*f+p*p),g=(u[s]-d)*a[s]*t/d;c.vx+=h*g,o>1&&(c.vy+=f*g),o>2&&(c.vz+=p*g)}}function c(){if(i){var n,e=i.length;for(a=new Array(e),u=new Array(e),n=0;n<e;++n)u[n]=+t(i[n],n,i),a[n]=isNaN(u[n])?0:+s(i[n],n,i)}}return"function"!=typeof t&&(t=ia(+t)),null==n&&(n=0),null==e&&(e=0),null==r&&(r=0),l.initialize=function(t,...n){i=t,o=n.find(t=>[1,2,3].includes(t))||2,c()},l.strength=function(t){return arguments.length?(s="function"==typeof t?t:ia(+t),c(),l):s},l.radius=function(n){return arguments.length?(t="function"==typeof n?n:ia(+n),c(),l):t},l.x=function(t){return arguments.length?(n=+t,l):n},l.y=function(t){return arguments.length?(e=+t,l):e},l.z=function(t){return arguments.length?(r=+t,l):r},l}(function(n){var e=i[n[t.nodeId]]||-1;return("radialin"===t.dagMode?o-e:e)*a}).strength(function(n){return t.dagNodeFilter(n)?1:0}):null);for(var p=0;p<t.warmupTicks&&!(t.d3AlphaMin>0&&t.forceLayout.alpha()<t.d3AlphaMin);p++)t.forceLayout.tick();this.resetCountdown(),t.onFinishUpdate()}});function eu(t,n){var e=t instanceof Array?t:[t],r=new n;return r._destructor&&r._destructor(),{linkProp:function(t){return{default:r[t](),onChange:function(n,r){e.forEach(function(e){return r[e][t](n)})},triggerUpdate:!1}},linkMethod:function(t){return function(n){for(var r=arguments.length,i=new Array(r>1?r-1:0),o=1;o<r;o++)i[o-1]=arguments[o];var a=[];return e.forEach(function(e){var r=n[e],o=r[t].apply(r,i);o!==r&&a.push(o)}),a.length?a[0]:this}}}}var ru=eu("forceGraph",nu),iu=eu(["forceGraph","shadowGraph"],nu),ou=Object.assign.apply(Object,s(["nodeColor","nodeAutoColorBy","nodeCanvasObject","nodeCanvasObjectMode","linkColor","linkAutoColorBy","linkLineDash","linkWidth","linkCanvasObject","linkCanvasObjectMode","linkDirectionalArrowLength","linkDirectionalArrowColor","linkDirectionalArrowRelPos","linkDirectionalParticles","linkDirectionalParticleSpeed","linkDirectionalParticleOffset","linkDirectionalParticleWidth","linkDirectionalParticleColor","linkDirectionalParticleCanvasObject","dagMode","dagLevelDistance","dagNodeFilter","onDagError","d3AlphaMin","d3AlphaDecay","d3VelocityDecay","warmupTicks","cooldownTicks","cooldownTime","onEngineTick","onEngineStop"].map(function(t){return r({},t,ru.linkProp(t))})).concat(s(["nodeRelSize","nodeId","nodeVal","nodeVisibility","linkSource","linkTarget","linkVisibility","linkCurvature"].map(function(t){return r({},t,iu.linkProp(t))})))),au=Object.assign.apply(Object,s(["d3Force","d3ReheatSimulation","emitParticle"].map(function(t){return r({},t,ru.linkMethod(t))})));function uu(t){if(t.canvas){var n=t.canvas.width,e=t.canvas.height;300===n&&150===e&&(n=e=0);var r=window.devicePixelRatio;n/=r,e/=r,[t.canvas,t.shadowCanvas].forEach(function(i){i.style.width="".concat(t.width,"px"),i.style.height="".concat(t.height,"px"),i.width=t.width*r,i.height=t.height*r,n||e||i.getContext("2d").scale(r,r)});var i=Fe(t.canvas).k;t.zoom.translateBy(t.zoom.__baseElem,(t.width-n)/2/i,(t.height-e)/2/i),t.needsRedraw=!0}}function su(t){var n=window.devicePixelRatio;t.setTransform(n,0,0,n,0,0)}function lu(t,n,e){t.save(),su(t),t.clearRect(0,0,n,e),t.restore()}var cu=Dr({props:a({width:{default:window.innerWidth,onChange:function(t,n){return uu(n)},triggerUpdate:!1},height:{default:window.innerHeight,onChange:function(t,n){return uu(n)},triggerUpdate:!1},graphData:{default:{nodes:[],links:[]},onChange:function(t,n){[t.nodes,t.links].every(function(t){return(t||[]).every(function(t){return!t.hasOwnProperty("__indexColor")})})&&n.colorTracker.reset(),[{type:"Node",objs:t.nodes},{type:"Link",objs:t.links}].forEach(function(t){var e=t.type;t.objs.filter(function(t){if(!t.hasOwnProperty("__indexColor"))return!0;var e=n.colorTracker.lookup(t.__indexColor);return!e||!e.hasOwnProperty("d")||e.d!==t}).forEach(function(t){t.__indexColor=n.colorTracker.register({type:e,d:t})})}),n.forceGraph.graphData(t),n.shadowGraph.graphData(t)},triggerUpdate:!1},backgroundColor:{onChange:function(t,n){n.canvas&&t&&(n.canvas.style.background=t)},triggerUpdate:!1},nodeLabel:{default:"name",triggerUpdate:!1},nodePointerAreaPaint:{onChange:function(t,n){n.shadowGraph.nodeCanvasObject(t?function(n,e,r){return t(n,n.__indexColor,e,r)}:null),n.flushShadowCanvas&&n.flushShadowCanvas()},triggerUpdate:!1},linkPointerAreaPaint:{onChange:function(t,n){n.shadowGraph.linkCanvasObject(t?function(n,e,r){return t(n,n.__indexColor,e,r)}:null),n.flushShadowCanvas&&n.flushShadowCanvas()},triggerUpdate:!1},linkLabel:{default:"name",triggerUpdate:!1},linkHoverPrecision:{default:4,triggerUpdate:!1},minZoom:{default:.01,onChange:function(t,n){n.zoom.scaleExtent([t,n.zoom.scaleExtent()[1]])},triggerUpdate:!1},maxZoom:{default:1e3,onChange:function(t,n){n.zoom.scaleExtent([n.zoom.scaleExtent()[0],t])},triggerUpdate:!1},enableNodeDrag:{default:!0,triggerUpdate:!1},enableZoomInteraction:{default:!0,triggerUpdate:!1},enablePanInteraction:{default:!0,triggerUpdate:!1},enableZoomPanInteraction:{default:!0,triggerUpdate:!1},enablePointerInteraction:{default:!0,onChange:function(t,n){n.hoverObj=null},triggerUpdate:!1},autoPauseRedraw:{default:!0,triggerUpdate:!1},onNodeDrag:{default:function(){},triggerUpdate:!1},onNodeDragEnd:{default:function(){},triggerUpdate:!1},onNodeClick:{triggerUpdate:!1},onNodeRightClick:{triggerUpdate:!1},onNodeHover:{triggerUpdate:!1},onLinkClick:{triggerUpdate:!1},onLinkRightClick:{triggerUpdate:!1},onLinkHover:{triggerUpdate:!1},onBackgroundClick:{triggerUpdate:!1},onBackgroundRightClick:{triggerUpdate:!1},showPointerCursor:{default:!0,triggerUpdate:!1},onZoom:{triggerUpdate:!1},onZoomEnd:{triggerUpdate:!1},onRenderFramePre:{triggerUpdate:!1},onRenderFramePost:{triggerUpdate:!1}},ou),aliases:{stopAnimation:"pauseAnimation"},methods:a({graph2ScreenCoords:function(t,n,e){var r=Fe(t.canvas);return{x:n*r.k+r.x,y:e*r.k+r.y}},screen2GraphCoords:function(t,n,e){var r=Fe(t.canvas);return{x:(n-r.x)/r.k,y:(e-r.y)/r.k}},centerAt:function(t,n,e,r){if(!t.canvas)return null;if(void 0!==n||void 0!==e){var i=Object.assign({},void 0!==n?{x:n}:{},void 0!==e?{y:e}:{});return r?t.tweenGroup.add(new Pr(o()).to(i,r).easing(Mr.Quadratic.Out).onUpdate(a).onComplete(function(){t.tweenGroup.remove(this)}).start()):a(i),this}return o();function o(){var n=Fe(t.canvas);return{x:(t.width/2-n.x)/n.k,y:(t.height/2-n.y)/n.k}}function a(n){var e=n.x,r=n.y;t.zoom.translateTo(t.zoom.__baseElem,void 0===e?o().x:e,void 0===r?o().y:r),t.needsRedraw=!0}},zoom:function(t,n,e){return t.canvas?void 0!==n?(e?t.tweenGroup.add(new Pr({k:r()}).to({k:n},e).easing(Mr.Quadratic.Out).onUpdate(function(t){return i(t.k)}).onComplete(function(){t.tweenGroup.remove(this)}).start()):i(n),this):r():null;function r(){return Fe(t.canvas).k}function i(n){t.zoom.scaleTo(t.zoom.__baseElem,n),t.needsRedraw=!0}},zoomToFit:function(t){for(var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:10,r=arguments.length,i=new Array(r>3?r-3:0),o=3;o<r;o++)i[o-3]=arguments[o];var a=this.getGraphBbox.apply(this,i);if(a){var u={x:(a.x[0]+a.x[1])/2,y:(a.y[0]+a.y[1])/2},s=Math.max(1e-12,Math.min(1e12,(t.width-2*e)/(a.x[1]-a.x[0]),(t.height-2*e)/(a.y[1]-a.y[0])));this.centerAt(u.x,u.y,n),this.zoom(s,n)}return this},getGraphBbox:function(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){return!0},e=Ir(t.nodeVal),r=function(n){return Math.sqrt(Math.max(0,e(n)||1))*t.nodeRelSize},i=t.graphData.nodes.filter(n).map(function(t){return{x:t.x,y:t.y,r:r(t)}});return i.length?{x:[Je(i,function(t){return t.x-t.r}),Ke(i,function(t){return t.x+t.r})],y:[Je(i,function(t){return t.y-t.r}),Ke(i,function(t){return t.y+t.r})]}:null},pauseAnimation:function(t){return t.animationFrameRequestId&&(cancelAnimationFrame(t.animationFrameRequestId),t.animationFrameRequestId=null),this},resumeAnimation:function(t){return t.animationFrameRequestId||this._animationCycle(),this},_destructor:function(){this.pauseAnimation(),this.graphData({nodes:[],links:[]})}},au),stateInit:function(){return{lastSetZoom:1,zoom:Ye(),forceGraph:new nu,shadowGraph:(new nu).cooldownTicks(0).nodeColor("__indexColor").linkColor("__indexColor").isShadow(!0),colorTracker:new Xi,tweenGroup:new zr}},init:function(t,n){var e=this;t.innerHTML="";var r=document.createElement("div");r.classList.add("force-graph-container"),r.style.position="relative",t.appendChild(r),n.canvas=document.createElement("canvas"),n.backgroundColor&&(n.canvas.style.background=n.backgroundColor),r.appendChild(n.canvas),n.shadowCanvas=document.createElement("canvas");var i=n.canvas.getContext("2d"),o=n.shadowCanvas.getContext("2d",{willReadFrequently:!0}),u={x:-1e12,y:-1e12},s=function(){var t=null,e=window.devicePixelRatio,r=u.x>0&&u.y>0?o.getImageData(u.x*e,u.y*e,1,1):null;return r&&(t=n.colorTracker.lookup(r.data)),t};kt(n.canvas).call(function(){var t,n,e,r,i=Ut,o=Ft,a=Lt,u=qt,s={},l=zt("start","drag","end"),c=0,h=0;function f(t){t.on("mousedown.drag",p).filter(u).on("touchstart.drag",_).on("touchmove.drag",y,Pt).on("touchend.drag touchcancel.drag",v).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function p(a,u){if(!r&&i.call(this,a,u)){var s=m(this,o.call(this,a,u),a,u,"mouse");s&&(kt(a.view).on("mousemove.drag",d,Ot).on("mouseup.drag",g,Ot),Tt(a.view),Nt(a),e=!1,t=a.clientX,n=a.clientY,s("start",a))}}function d(r){if(jt(r),!e){var i=r.clientX-t,o=r.clientY-n;e=i*i+o*o>h}s.mouse("drag",r)}function g(t){kt(t.view).on("mousemove.drag mouseup.drag",null),Rt(t.view,e),jt(t),s.mouse("end",t)}function _(t,n){if(i.call(this,t,n)){var e,r,a=t.changedTouches,u=o.call(this,t,n),s=a.length;for(e=0;e<s;++e)(r=m(this,u,t,n,a[e].identifier,a[e]))&&(Nt(t),r("start",t,a[e]))}}function y(t){var n,e,r=t.changedTouches,i=r.length;for(n=0;n<i;++n)(e=s[r[n].identifier])&&(jt(t),e("drag",t,r[n]))}function v(t){var n,e,i=t.changedTouches,o=i.length;for(r&&clearTimeout(r),r=setTimeout(function(){r=null},500),n=0;n<o;++n)(e=s[i[n].identifier])&&(Nt(t),e("end",t,i[n]))}function m(t,n,e,r,i,o){var u,h,p,d=l.copy(),g=Mt(o||e,n);if(null!=(p=a.call(t,new It("beforestart",{sourceEvent:e,target:f,identifier:i,active:c,x:g[0],y:g[1],dx:0,dy:0,dispatch:d}),r)))return u=p.x-g[0]||0,h=p.y-g[1]||0,function e(o,a,l){var _,y=g;switch(o){case"start":s[i]=e,_=c++;break;case"end":delete s[i],--c;case"drag":g=Mt(l||a,n),_=c}d.call(o,t,new It(o,{sourceEvent:a,subject:p,target:f,identifier:i,active:_,x:g[0]+u,y:g[1]+h,dx:g[0]-y[0],dy:g[1]-y[1],dispatch:d}),r)}}return f.filter=function(t){return arguments.length?(i="function"==typeof t?t:Dt(!!t),f):i},f.container=function(t){return arguments.length?(o="function"==typeof t?t:Dt(t),f):o},f.subject=function(t){return arguments.length?(a="function"==typeof t?t:Dt(t),f):a},f.touchable=function(t){return arguments.length?(u="function"==typeof t?t:Dt(!!t),f):u},f.on=function(){var t=l.on.apply(l,arguments);return t===l?f:t},f.clickDistance=function(t){return arguments.length?(h=(t=+t)*t,f):Math.sqrt(h)},f}().subject(function(){if(!n.enableNodeDrag)return null;var t=s();return t&&"Node"===t.type?t.d:null}).on("start",function(t){var e=t.subject;e.__initialDragPos={x:e.x,y:e.y,fx:e.fx,fy:e.fy},t.active||(e.fx=e.x,e.fy=e.y),n.canvas.classList.add("grabbable")}).on("drag",function(t){var e=t.subject,r=e.__initialDragPos,i=t,o=Fe(n.canvas).k,a={x:r.x+(i.x-r.x)/o-e.x,y:r.y+(i.y-r.y)/o-e.y};["x","y"].forEach(function(t){return e["f".concat(t)]=e[t]=r[t]+(i[t]-r[t])/o}),!e.__dragged&&5>=Math.sqrt(function(t){let n=0;for(let e of t)(e=+e)&&(n+=e);return n}(["x","y"].map(function(n){return Math.pow(t[n]-r[n],2)})))||(n.forceGraph.d3AlphaTarget(.3).resetCountdown(),n.isPointerDragging=!0,e.__dragged=!0,n.onNodeDrag(e,a))}).on("end",function(t){var e=t.subject,r=e.__initialDragPos,i={x:e.x-r.x,y:e.y-r.y};void 0===r.fx&&(e.fx=void 0),void 0===r.fy&&(e.fy=void 0),delete e.__initialDragPos,n.forceGraph.d3AlphaTarget()&&n.forceGraph.d3AlphaTarget(0).resetCountdown(),n.canvas.classList.remove("grabbable"),n.isPointerDragging=!1,e.__dragged&&(delete e.__dragged,n.onNodeDragEnd(e,i))})),n.zoom(n.zoom.__baseElem=kt(n.canvas)),n.zoom.__baseElem.on("dblclick.zoom",null),n.zoom.filter(function(t){return!t.button&&n.enableZoomPanInteraction&&("wheel"!==t.type||Ir(n.enableZoomInteraction)(t))&&("wheel"===t.type||Ir(n.enablePanInteraction)(t))}).on("zoom",function(t){var r=t.transform;[i,o].forEach(function(t){su(t),t.translate(r.x,r.y),t.scale(r.k,r.k)}),n.isPointerDragging=!0,n.onZoom&&n.onZoom(a(a({},r),e.centerAt())),n.needsRedraw=!0}).on("end",function(t){n.isPointerDragging=!1,n.onZoomEnd&&n.onZoomEnd(a(a({},t.transform),e.centerAt()))}),uu(n),n.forceGraph.onNeedsRedraw(function(){return n.needsRedraw=!0}).onFinishUpdate(function(){Fe(n.canvas).k===n.lastSetZoom&&n.graphData.nodes.length&&(n.zoom.scaleTo(n.zoom.__baseElem,n.lastSetZoom=4/Math.cbrt(n.graphData.nodes.length)),n.needsRedraw=!0)}),n.tooltip=new Oo(r),["pointermove","pointerdown"].forEach(function(t){return r.addEventListener(t,function(e){"pointerdown"===t&&(n.isPointerPressed=!0,n.pointerDownEvent=e),!n.isPointerDragging&&"pointermove"===e.type&&n.onBackgroundClick&&(e.pressure>0||n.isPointerPressed)&&("mouse"===e.pointerType||void 0===e.movementX||[e.movementX,e.movementY].some(function(t){return Math.abs(t)>1}))&&(n.isPointerDragging=!0);var i,o,a,s=(i=r.getBoundingClientRect(),o=window.pageXOffset||document.documentElement.scrollLeft,a=window.pageYOffset||document.documentElement.scrollTop,{top:i.top+a,left:i.left+o});u.x=e.pageX-s.left,u.y=e.pageY-s.top},{passive:!0})}),r.addEventListener("pointerup",function(t){if(n.isPointerPressed)if(n.isPointerPressed=!1,n.isPointerDragging)n.isPointerDragging=!1;else{var e=[t,n.pointerDownEvent];requestAnimationFrame(function(){if(0===t.button)if(n.hoverObj){var r=n["on".concat(n.hoverObj.type,"Click")];r&&r.apply(void 0,[n.hoverObj.d].concat(e))}else n.onBackgroundClick&&n.onBackgroundClick.apply(n,e);if(2===t.button)if(n.hoverObj){var i=n["on".concat(n.hoverObj.type,"RightClick")];i&&i.apply(void 0,[n.hoverObj.d].concat(e))}else n.onBackgroundRightClick&&n.onBackgroundRightClick.apply(n,e)})}},{passive:!0}),r.addEventListener("contextmenu",function(t){return!(n.onBackgroundRightClick||n.onNodeRightClick||n.onLinkRightClick)||(t.preventDefault(),!1)}),n.forceGraph(i),n.shadowGraph(o);var l=function(t,n,e){var r=!0,i=!0;if("function"!=typeof t)throw new TypeError("Expected a function");return dr(e)&&(r="leading"in e?!!e.leading:r,i="trailing"in e?!!e.trailing:i),kr(t,n,{leading:r,maxWait:n,trailing:i})}(function(){lu(o,n.width,n.height),n.shadowGraph.linkWidth(function(t){return Ir(n.linkWidth)(t)+n.linkHoverPrecision});var t=Fe(n.canvas);n.shadowGraph.globalScale(t.k).tickFrame()},800);n.flushShadowCanvas=l.flush,(this._animationCycle=function t(){var e=!n.autoPauseRedraw||!!n.needsRedraw||n.forceGraph.isEngineRunning()||n.graphData.links.some(function(t){return t.__photons&&t.__photons.length});if(n.needsRedraw=!1,n.enablePointerInteraction){var r=n.isPointerDragging?null:s();if(r!==n.hoverObj){var o=n.hoverObj,a=o?o.type:null,u=r?r.type:null;if(a&&a!==u){var c=n["on".concat(a,"Hover")];c&&c(null,o.d)}if(u){var h=n["on".concat(u,"Hover")];h&&h(r.d,a===u?o.d:null)}n.tooltip.content(r&&Ir(n["".concat(r.type.toLowerCase(),"Label")])(r.d)||null),n.canvas.classList[(r&&n["on".concat(u,"Click")]||!r&&n.onBackgroundClick)&&Ir(n.showPointerCursor)(null==r?void 0:r.d)?"add":"remove"]("clickable"),n.hoverObj=r}e&&l()}if(e){lu(i,n.width,n.height);var f=Fe(n.canvas).k;n.onRenderFramePre&&n.onRenderFramePre(i,f),n.forceGraph.globalScale(f).tickFrame(),n.onRenderFramePost&&n.onRenderFramePost(i,f)}n.tweenGroup.update(),n.animationFrameRequestId=requestAnimationFrame(t)})()},update:function(t){}});return cu});
`;

// lib/knowledge-atlas/src/render/graph.ts
var NODE_STYLES = {
  capability: { color: "#7b1fa2", shape: "diamond", size: 10 },
  requirement: { color: "#1565c0", shape: "circle", size: 8 },
  nfr: { color: "#0277bd", shape: "circle", size: 7 },
  epic: { color: "#2e7d32", shape: "square", size: 12 },
  story: { color: "#00897b", shape: "circle", size: 8 },
  bug: { color: "#c62828", shape: "triangle", size: 9 },
  "arch-decision": { color: "#4527a0", shape: "diamond", size: 9 },
  retrospective: { color: "#e65100", shape: "square", size: 8 },
  // Story 29.8 — whole-document file node (prd/architecture/epics/report/…).
  // Muted gray hexagon so it reads as "container/document", distinct from the
  // brighter typed entity shapes above.
  document: { color: "#78909c", shape: "hexagon", size: 9 }
};
var EDGE_COLORS = {
  "implements": "#1565c0",
  "derives-from": "#2e7d32",
  "refines": "#6a1b9a",
  "blocks": "#c62828",
  "depends-on": "#e65100",
  "validates": "#00695c",
  "addressed-by": "#ad1457",
  "shipped-in": "#546e7a",
  // Story 29.8 — weak/structural "mentions" edge. Light gray so it visually
  // recedes behind the semantic (implements/derives-from/…) edges above.
  "references": "#b0bec5"
};
var NODE_KIND_LABELS = {
  capability: "Capability (F##)",
  requirement: "Requirement (FR###)",
  nfr: "Non-Functional Req (NFR##)",
  epic: "Epic",
  story: "Story",
  bug: "Bug",
  "arch-decision": "Architecture Decision",
  retrospective: "Retrospective",
  document: "Document"
};
var EDGE_KIND_LABELS = {
  "implements": "implements",
  "derives-from": "derives-from",
  "refines": "refines",
  "blocks": "blocks",
  "depends-on": "depends-on",
  "validates": "validates",
  "addressed-by": "addressed-by",
  "shipped-in": "shipped-in",
  "references": "references"
};
var ALL_NODE_KINDS = [
  "capability",
  "requirement",
  "nfr",
  "epic",
  "story",
  "bug",
  "arch-decision",
  "retrospective",
  "document"
];
var ALL_EDGE_KINDS = [
  "implements",
  "derives-from",
  "refines",
  "blocks",
  "depends-on",
  "validates",
  "addressed-by",
  "shipped-in",
  "references"
];
function esc7(s) {
  return (s ?? "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function safePath(p) {
  const s = (p ?? "").toString();
  if (/^[a-zA-Z][a-zA-Z0-9+.\-]*:/.test(s)) return "#invalid";
  if (/^\/\//.test(s)) return "#invalid";
  return s;
}
function buildGraphData(manifest) {
  const docPages = buildDocPageMap(manifest.files.map((f) => f.path));
  const nodes = manifest.nodes.map((n) => {
    const style = NODE_STYLES[n.kind] ?? NODE_STYLES.story;
    return {
      id: n.id,
      label: n.label,
      kind: n.kind,
      // Sanitize the navigation target server-side (finding #2). The runtime
      // click handler also guards, but a clean embedded value is defense-in-depth.
      fileId: safePath(n.fileId),
      anchor: n.anchor,
      color: style.color,
      shape: style.shape,
      size: style.size,
      status: n.status,
      // undefined when this fileId has no rendered doc page (KG-only node) —
      // the client's onNodeClick must no-op rather than navigate to a raw path.
      page: docPages.get(n.fileId)
    };
  });
  const edges = manifest.edges.map((e) => {
    const color = EDGE_COLORS[e.kind] ?? "#999";
    return {
      source: e.from,
      target: e.to,
      kind: e.kind,
      color,
      dangling: e.dangling === true,
      // Story 29.8 — `references` edges render DASHED (in addition to their
      // lighter color) so a weak "mentions" link is unmistakably distinct from
      // a strong semantic edge and never reads as a false `implements` claim.
      dashed: e.kind === "references"
    };
  });
  return { nodes, edges };
}
function buildLegendHtml() {
  const lines = [
    '<section class="legend" aria-label="Graph legend">',
    "<h2>Legend</h2>",
    '<div class="legend-grid">',
    '<div class="legend-section">',
    "<h3>Node Types</h3>",
    '<ul class="legend-list">'
  ];
  for (const kind of ALL_NODE_KINDS) {
    const style = NODE_STYLES[kind];
    const label = NODE_KIND_LABELS[kind];
    lines.push(
      `<li><span class="legend-swatch" style="background:${esc7(style.color)};--swatch-color:${esc7(style.color)}" aria-hidden="true" data-shape="${esc7(style.shape)}"></span>${esc7(label)}</li>`
    );
  }
  lines.push(
    "</ul>",
    "</div>",
    '<div class="legend-section">',
    "<h3>Edge Types</h3>",
    '<ul class="legend-list">'
  );
  for (const kind of ALL_EDGE_KINDS) {
    const color = EDGE_COLORS[kind];
    const label = EDGE_KIND_LABELS[kind];
    lines.push(
      `<li><span class="legend-edge" style="background:${esc7(color)}" aria-hidden="true"></span>${esc7(label)}</li>`
    );
  }
  lines.push(
    "</ul>",
    "</div>",
    "</div>",
    "</section>"
  );
  return lines.join("\n");
}
function buildFallbackHtml(manifest) {
  const counts = manifest.counts;
  const lines = [
    "<noscript>",
    '<div class="noscript-fallback" role="complementary" aria-label="Graph unavailable without JavaScript">',
    "<h2>Interactive Graph (JavaScript required)</h2>",
    '<p class="meta">The interactive graph requires JavaScript. Below is a summary and links to static views.</p>',
    '<div class="fallback-counts" aria-label="Project knowledge counts">',
    `<div class="count-chip"><strong>${counts["nodes"] ?? 0}</strong> nodes</div>`,
    `<div class="count-chip"><strong>${counts["edges"] ?? 0}</strong> edges</div>`
  ];
  for (const kind of ALL_NODE_KINDS) {
    const count = counts[`nodes.${kind}`];
    if (count != null && count > 0) {
      const style = NODE_STYLES[kind];
      lines.push(
        `<div class="count-chip" style="border-left:3px solid ${esc7(style.color)}"><strong>${count}</strong> ${esc7(NODE_KIND_LABELS[kind])}</div>`
      );
    }
  }
  lines.push(
    "</div>",
    '<div class="fallback-links">',
    '<a href="diagrams.html">Generated Diagrams</a>',
    '<a href="orphans.html">Orphan / Gap View</a>',
    '<a href="search.html">Search</a>',
    '<a href="index.html">Knowledge Atlas Home</a>',
    "</div>",
    "</div>",
    "</noscript>"
  );
  return lines.join("\n");
}
function renderGraphPage(manifest, outDir) {
  const { nodes, edges } = buildGraphData(manifest);
  const title = esc7(manifest.projectTitle);
  const graphDataJson = JSON.stringify({ nodes, edges }, null, 0).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const fallbackHtml = buildFallbackHtml(manifest);
  const legendHtml = buildLegendHtml();
  const usedKinds = [...new Set(manifest.nodes.map((n) => n.kind))].sort();
  const usedEdgeKinds = [...new Set(manifest.edges.map((e) => e.kind))].sort();
  const nodeKindOptions = usedKinds.map(
    (k) => `<option value="${esc7(k)}">${esc7(NODE_KIND_LABELS[k] ?? k)}</option>`
  ).join("\n        ");
  const edgeKindOptions = usedEdgeKinds.map(
    (k) => `<option value="${esc7(k)}">${esc7(EDGE_KIND_LABELS[k] ?? k)}</option>`
  ).join("\n        ");
  const html = [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${title} \u2014 Knowledge Graph</title>`,
    `<meta name="description" content="Interactive knowledge graph for ${title}">`,
    "<style>",
    DESIGN_SYSTEM_CSS.trimEnd(),
    `
/* Graph-page specific styles */
.graph-page main { max-width: none; padding: 0 var(--gap); }

.controls-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem var(--gap);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  margin-bottom: 0.75rem;
}

.controls-bar label { font-size: 0.85rem; color: var(--ink-wash); }
.controls-bar select {
  font-size: 0.82rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--ink);
}

.controls-bar button {
  font-size: 0.82rem;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--accent);
  color: #fff;
  cursor: pointer;
}
.controls-bar button:hover { background: var(--accent-dk); }

#graph-container {
  width: 100%;
  height: calc(100vh - 220px);
  min-height: 400px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
}

.legend {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--gap);
  margin-top: var(--gap);
}

.legend h2 { font-size: 0.95rem; font-weight: 600; color: var(--accent-dk); margin-bottom: 0.5rem; }
.legend h3 { font-size: 0.82rem; font-weight: 600; color: var(--ink-wash); margin-bottom: 0.35rem; }

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--gap);
}

.legend-list {
  list-style: none;
  font-size: 0.82rem;
}

.legend-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.legend-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* FR222: the legend swatch shape must match the canvas node shape for that
   kind (data-shape is emitted per NODE_STYLES) \u2014 previously data-shape was
   emitted but never styled, so every kind rendered as the same square. */
.legend-swatch[data-shape="circle"] {
  border-radius: 50%;
}
.legend-swatch[data-shape="square"] {
  border-radius: 2px; /* same as the base rule \u2014 explicit for clarity/symmetry */
}
.legend-swatch[data-shape="diamond"] {
  border-radius: 1px;
  transform: rotate(45deg);
}
.legend-swatch[data-shape="triangle"] {
  width: 0;
  height: 0;
  background: transparent !important;
  border-radius: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 11px solid var(--swatch-color, currentColor);
}
.legend-swatch[data-shape="hexagon"] {
  border-radius: 0;
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.legend-edge {
  display: inline-block;
  width: 20px;
  height: 3px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* No-JS fallback */
.noscript-fallback {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: calc(var(--gap) * 1.5);
  margin: var(--gap) 0;
}

.noscript-fallback h2 {
  font-size: 1.1rem;
  color: var(--accent-dk);
  margin-bottom: 0.5rem;
}

.fallback-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: var(--gap) 0;
}

.count-chip {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
}

.fallback-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: var(--gap);
}

.fallback-links a {
  color: var(--accent);
  text-decoration: underline;
  font-size: 0.9rem;
}

.tooltip {
  position: fixed;
  background: rgba(26,26,46,0.92);
  color: #fff;
  border-radius: 4px;
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  pointer-events: none;
  max-width: 240px;
  word-break: break-word;
  z-index: 10;
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  #graph-container canvas { animation: none !important; }
}
`,
    "</style>",
    "</head>",
    `<body class="graph-page">`,
    "<header>",
    `<h1>${title}</h1>`,
    '<p class="subtitle">Knowledge Graph \u2014 Interactive Navigation</p>',
    // SHOULD-FIX #2: same shared Home/Graph/Diagrams/Orphans/Search set as
    // every other page type (the old hand-rolled nav omitted Search, leaving
    // no way back to search from the graph view). graph.ts/diagrams.ts/
    // orphans.ts are always attempted together by generate.ts, so — matching
    // this page's pre-existing assumption that its siblings exist — the other
    // two 29.4 pages are always linked; only Graph itself is naturally
    // omitted (this IS graph.html).
    '<nav aria-label="Site navigation">',
    buildNavLinksHtml("", { hasGraphPage: false, hasDiagramsPage: true, hasOrphansPage: true }, "graph"),
    "</nav>",
    "</header>",
    "<main>",
    // No-JS fallback (hidden when JS is available, always visible in noscript)
    fallbackHtml,
    // Controls bar (JS only)
    '<div class="controls-bar" id="controls-bar" aria-label="Graph filter controls" style="display:none">',
    '<label for="filter-node-kind">Node kind:</label>',
    '<select id="filter-node-kind" aria-label="Filter by node kind">',
    '<option value="">All nodes</option>',
    nodeKindOptions,
    "</select>",
    '<label for="filter-edge-kind">Edge kind:</label>',
    '<select id="filter-edge-kind" aria-label="Filter by edge kind">',
    '<option value="">All edges</option>',
    edgeKindOptions,
    "</select>",
    '<button id="btn-reset-zoom" type="button" aria-label="Reset graph zoom">Reset zoom</button>',
    "</div>",
    // Graph container
    '<div id="graph-container" role="img" aria-label="Interactive knowledge graph" style="display:none"></div>',
    '<div class="tooltip" id="graph-tooltip" role="tooltip" aria-live="polite"></div>',
    legendHtml,
    "</main>",
    "<footer>",
    `Knowledge Atlas &bull; ${title} &bull; graph.html`,
    "</footer>",
    // Inline force-graph UMD bundle
    "<script>",
    "/* force-graph v1.51 (vendored, MIT) */",
    FORCE_GRAPH_UMD,
    "</script>",
    // Embed graph data (never fetched — FR234)
    "<script>",
    `window.__ATLAS_GRAPH__ = ${graphDataJson};`,
    "</script>",
    // Application script
    "<script>",
    buildAppScript(),
    "</script>",
    "</body>",
    "</html>",
    ""
    // trailing newline
  ].join("\n");
  const outPath = path9.join(outDir, "graph.html");
  fs9.mkdirSync(outDir, { recursive: true });
  fs9.writeFileSync(outPath, html.replace(/\r\n/g, "\n"), { encoding: "utf-8" });
  return ["graph.html"];
}
function buildAppScript() {
  return `
(function() {
  'use strict';

  // Show the interactive controls + container (hide was default for no-JS)
  var controlsBar = document.getElementById('controls-bar');
  var container = document.getElementById('graph-container');
  var tooltip = document.getElementById('graph-tooltip');
  if (controlsBar) controlsBar.style.display = '';
  if (container) container.style.display = '';

  var data = window.__ATLAS_GRAPH__;
  if (!data || !data.nodes || !data.edges) {
    if (container) container.textContent = 'Graph data unavailable.';
    return;
  }

  // Deep-copy working arrays so filters don't mutate originals
  var allNodes = data.nodes.slice();
  var allEdges = data.edges.slice();

  // Node kind filter
  var filterNodeKind = '';
  var filterEdgeKind = '';

  // Tracks the node currently under the cursor so the tooltip can follow the
  // mouse (finding #8: tooltip was shown with display:block but no left/top,
  // so it rendered at the bottom of <main>).
  var lastHoverNode = null;
  var selectedLink = null; // edge highlighted on click: drawn bold + its two endpoints ringed

  function getFilteredData() {
    var nodes = allNodes;
    var edges = allEdges;

    if (filterNodeKind) {
      var nodeIds = new Set(allNodes.filter(function(n) { return n.kind === filterNodeKind; }).map(function(n) { return n.id; }));
      nodes = allNodes.filter(function(n) { return nodeIds.has(n.id); });
      edges = edges.filter(function(e) { return nodeIds.has(e.source) && nodeIds.has(e.target); });
    }

    if (filterEdgeKind) {
      // Restrict to matching edges, then keep ONLY their endpoint nodes \u2014 an
      // edge filter must hide nodes that are not an endpoint of a matching edge
      // (finding #5: no short-circuit, so isolated nodes do not stay visible).
      edges = edges.filter(function(e) { return e.kind === filterEdgeKind; });
      var referencedIds = new Set();
      edges.forEach(function(e) { referencedIds.add(e.source); referencedIds.add(e.target); });
      nodes = nodes.filter(function(n) { return referencedIds.has(n.id); });
    }

    return { nodes: nodes, edges: edges };
  }

  // Initialize force-graph
  var ForceGraphLib = (typeof ForceGraph === 'function') ? ForceGraph : (window.ForceGraph);
  if (!ForceGraphLib) {
    if (container) container.textContent = 'force-graph library failed to load.';
    return;
  }

  var graph;
  try {
    graph = ForceGraphLib()(container);
  } catch(e) {
    if (container) container.textContent = 'Graph initialization failed: ' + e.message;
    return;
  }

  // Layout forces (fixes the overlapping-blob): stronger charge repulsion + a
  // larger link distance push nodes apart; a gentler velocity decay lets a
  // dragged node's neighbourhood follow it and settle rather than everything
  // snapping. The vendored force-graph exposes charge/link via d3Force but no
  // collide, so spacing comes from charge+distance. All best-effort.
  try {
    var _charge = graph.d3Force && graph.d3Force('charge');
    if (_charge && _charge.strength) _charge.strength(-160);
    var _link = graph.d3Force && graph.d3Force('link');
    if (_link && _link.distance) _link.distance(48);
    if (graph.d3VelocityDecay) graph.d3VelocityDecay(0.3);
    if (graph.warmupTicks) graph.warmupTicks(80); // pre-spread before first paint
  } catch (_e) { /* forces best-effort; graph still renders without them */ }

  // FR222: distinct shape per entity type (previously color+size only \u2014 the
  // canvas never read NODE_STYLES' shape/data-shape, so every node was a
  // circle regardless of kind). Traces the path for the node's shape
  // (embedded per-node from NODE_STYLES server-side) into the 2D canvas
  // context; shared by both the visible paint and the (invisible,
  // color-keyed) hit-test paint so click/hover keep working with the new
  // shapes.
  function traceNodeShapePath(ctx, shape, x, y, size) {
    ctx.beginPath();
    switch (shape) {
      case 'square': {
        var s = size;
        ctx.rect(x - s, y - s, s * 2, s * 2);
        break;
      }
      case 'diamond': {
        var d = size * 1.15;
        ctx.moveTo(x, y - d);
        ctx.lineTo(x + d, y);
        ctx.lineTo(x, y + d);
        ctx.lineTo(x - d, y);
        ctx.closePath();
        break;
      }
      case 'triangle': {
        var t = size * 1.3;
        ctx.moveTo(x, y - t);
        ctx.lineTo(x + t * 0.87, y + t * 0.5);
        ctx.lineTo(x - t * 0.87, y + t * 0.5);
        ctx.closePath();
        break;
      }
      case 'hexagon': {
        var h = size * 1.05;
        for (var i = 0; i < 6; i++) {
          var angle = (Math.PI / 3) * i - Math.PI / 6;
          var px = x + h * Math.cos(angle);
          var py = y + h * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        break;
      }
      case 'circle':
      default:
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        break;
    }
  }

  function applyGraphData() {
    var filtered = getFilteredData();
    // Deep-copy to avoid force-graph mutating shared objects
    var nodesCopy = filtered.nodes.map(function(n) { return Object.assign({}, n); });
    var edgesCopy = filtered.edges.map(function(e) { return Object.assign({}, e); });
    graph
      .graphData({ nodes: nodesCopy, links: edgesCopy })
      .nodeId('id')
      .nodeLabel(function(n) { return n.label + ' [' + n.kind + ']' + (n.status ? ' (' + n.status + ')' : ''); })
      .nodeColor(function(n) { return n.color || '#888'; })
      .nodeRelSize(1)
      .nodeVal(function(n) { return (n.size || 6) * (n.size || 6); })
      // FR222: paint the node as its per-kind shape (circle/square/diamond/
      // triangle) instead of force-graph's default circle-only rendering.
      .nodeCanvasObject(function(n, ctx) {
        var size = (n.size || 6) * 0.5; // smaller nodes (were visually oversized/overlapping)
        ctx.fillStyle = n.color || '#888';
        traceNodeShapePath(ctx, n.shape, n.x, n.y, size);
        ctx.fill();
        // Ring the two endpoints of the selected edge so both ends are easy to
        // find, however far apart they sit in the layout.
        if (selectedLink) {
          var s = selectedLink.source, t = selectedLink.target;
          if (n === s || n === t) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, size + 3.5, 0, 2 * Math.PI);
            ctx.strokeStyle = '#111827';
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }
      })
      // Matching hit-test paint: without this, force-graph's click/hover
      // detection falls back to a generic area that no longer matches the
      // custom shape drawn above (non-circle nodes would get unreliable
      // hover/click hit-boxes).
      .nodePointerAreaPaint(function(n, color, ctx) {
        var size = (n.size || 6) * 0.5 + 2; // match the smaller draw size, +2 to stay easy to hit
        ctx.fillStyle = color;
        traceNodeShapePath(ctx, n.shape, n.x, n.y, size);
        ctx.fill();
      })
      .linkSource('source')
      .linkTarget('target')
      // Selected edge is drawn dark + thick so you can trace it end to end.
      .linkColor(function(e) { return e === selectedLink ? '#111827' : (e.color || '#aaa'); })
      .linkWidth(function(e) { return e === selectedLink ? 3.5 : (e.dashed ? 0.5 : 1); })
      // Story 29.8 - dashed stroke for weak references edges; solid otherwise.
      .linkLineDash(function(e) { return e.dashed ? [4, 3] : null; })
      .linkDirectionalArrowLength(function(e) { return e === selectedLink ? 7 : 4; })
      .linkDirectionalArrowRelPos(1)
      .linkCurvature(0.1)
      // Click an edge to highlight it (bold + ringed endpoints); click it again
      // or click empty space to clear. Re-applying the accessors forces an
      // immediate repaint of the new selection state.
      .onLinkClick(function(e) {
        selectedLink = (selectedLink === e) ? null : e;
        graph.linkWidth(graph.linkWidth()).linkColor(graph.linkColor());
      })
      .onLinkHover(function(e) {
        if (container) container.style.cursor = e ? 'pointer' : 'default';
        if (!tooltip) return;
        if (!e) { tooltip.style.display = 'none'; return; }
        var s = (e.source && e.source.label) || e.source;
        var t = (e.target && e.target.label) || e.target;
        tooltip.style.display = 'block';
        tooltip.textContent = s + '  \u2192  ' + t + (e.kind ? '  [' + e.kind + ']' : '');
      })
      .onNodeClick(function(n) {
        // Navigate to the reading view via the server-resolved doc page (the
        // 'page' field, e.g. "docs/<slug>.html"), NOT the raw fileId \u2014 the
        // raw fileId is a '.md' source path in the project and does not exist
        // in the generated static site (Epic 29 bug fix). Nodes with no
        // resolvable page (e.g. a knowledge-graph-only node with no rendered
        // doc) must never navigate anywhere \u2014 no-op.
        var page = n.page || '';
        if (!page) { return; }
        // SECURITY (finding #2, kept as defense-in-depth): reject any URI
        // scheme (javascript:, data:, http:) and protocol-relative paths so a
        // hostile/malformed page value cannot execute or navigate off-origin.
        if (/^[a-zA-Z][a-zA-Z0-9+.\\-]*:/.test(page) || /^\\/\\//.test(page)) { return; }
        var href = page + (n.anchor ? '#' + n.anchor : '');
        window.location.href = href;
      })
      // Drag-to-pin (fixes the spring-back): keep the node exactly where it was
      // dropped (fx/fy). Because the simulation stays warm, its linked neighbours
      // follow the drag and nodes farther along the graph move progressively less.
      // Right-click a node to release its pin back into the layout.
      .onNodeDrag(function(n) { n.fx = n.x; n.fy = n.y; })
      .onNodeDragEnd(function(n) { n.fx = n.x; n.fy = n.y; })
      .onNodeRightClick(function(n) {
        n.fx = undefined; n.fy = undefined;
        if (graph.d3ReheatSimulation) graph.d3ReheatSimulation();
      })
      .onNodeHover(function(n) {
        // Distinct cursor hint: pointer only over nodes that actually
        // navigate somewhere (have a resolved page); default cursor otherwise
        // (secondary to correctness, but signals non-clickable nodes clearly).
        if (container) container.style.cursor = (n && n.page) ? 'pointer' : 'default';
        if (!tooltip) return;
        if (!n) { tooltip.style.display = 'none'; lastHoverNode = null; return; }
        lastHoverNode = n;
        tooltip.style.display = 'block';
        tooltip.textContent = n.label + (n.kind ? ' [' + n.kind + ']' : '') + (n.status ? ' (' + n.status + ')' : '');
      })
      .onBackgroundClick(function() {
        if (tooltip) tooltip.style.display = 'none';
        lastHoverNode = null;
        if (selectedLink) {
          selectedLink = null;
          graph.linkWidth(graph.linkWidth()).linkColor(graph.linkColor());
        }
      });
  }

  applyGraphData();

  // Filter controls
  var nodeKindSelect = document.getElementById('filter-node-kind');
  var edgeKindSelect = document.getElementById('filter-edge-kind');
  var resetBtn = document.getElementById('btn-reset-zoom');

  if (nodeKindSelect) {
    nodeKindSelect.addEventListener('change', function() {
      filterNodeKind = this.value;
      applyGraphData();
    });
  }
  if (edgeKindSelect) {
    edgeKindSelect.addEventListener('change', function() {
      filterEdgeKind = this.value;
      applyGraphData();
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      if (graph && graph.zoomToFit) graph.zoomToFit(400);
    });
  }

  // Position the tooltip next to the cursor while hovering a node (finding #8).
  if (container && tooltip) {
    container.addEventListener('mousemove', function(ev) {
      if (!lastHoverNode) { tooltip.style.display = 'none'; return; }
      // position:fixed \u2192 use viewport coordinates directly.
      tooltip.style.left = (ev.clientX + 12) + 'px';
      tooltip.style.top = (ev.clientY + 12) + 'px';
    });
    container.addEventListener('mouseleave', function() {
      tooltip.style.display = 'none';
      lastHoverNode = null;
    });
  }

  // Resize observer
  if (typeof ResizeObserver !== 'undefined' && container) {
    new ResizeObserver(function() {
      if (graph && container) {
        graph.width(container.clientWidth);
        graph.height(container.clientHeight);
      }
    }).observe(container);
  }

  // Initial fit
  setTimeout(function() {
    if (graph && graph.zoomToFit) graph.zoomToFit(400);
  }, 500);
})();
`;
}

// lib/knowledge-atlas/src/render/diagrams.ts
var fs10 = __toESM(require("fs"));
var path10 = __toESM(require("path"));
function esc8(s) {
  return (s ?? "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function safePath2(p) {
  const s = (p ?? "").toString();
  if (/^[a-zA-Z][a-zA-Z0-9+.\-]*:/.test(s)) return "#invalid";
  if (/^\/\//.test(s)) return "#invalid";
  return s;
}
var KIND_COLORS = {
  capability: "#7b1fa2",
  requirement: "#1565c0",
  nfr: "#0277bd",
  epic: "#2e7d32",
  story: "#00897b",
  bug: "#c62828",
  "arch-decision": "#4527a0",
  retrospective: "#e65100"
};
function nodeColor(kind) {
  return KIND_COLORS[kind] ?? "#546e7a";
}
var STATUS_COLORS = {
  done: "#2e7d32",
  review: "#1565c0",
  "in-progress": "#e65100",
  "ready-for-dev": "#7b1fa2",
  backlog: "#546e7a"
};
function statusBadge(status) {
  if (!status) return "";
  const color = STATUS_COLORS[status] ?? "#546e7a";
  return `<span class="status-badge" style="background:${esc8(color)}" aria-label="Status: ${esc8(status)}">${esc8(status)}</span>`;
}
function nodeLink(node, docPages) {
  const page = docPages.get(node.fileId);
  if (!page) {
    return `<span class="node-link node-link-nodoc" aria-disabled="true" aria-label="${esc8(node.label)} (${esc8(node.kind)}, no page)">${esc8(node.label)}</span>`;
  }
  const base = safePath2(page);
  if (base === "#invalid") {
    return `<span class="node-link node-link-nodoc" aria-disabled="true" aria-label="${esc8(node.label)} (${esc8(node.kind)}, no page)">${esc8(node.label)}</span>`;
  }
  const href = base + (node.anchor ? "#" + node.anchor : "");
  return `<a href="${esc8(href)}" class="node-link" aria-label="${esc8(node.label)} (${esc8(node.kind)})">${esc8(node.label)}</a>`;
}
function buildTraceabilitySpine(manifest, docPages) {
  const nodes = manifest.nodes;
  const edges = manifest.edges;
  const byKind = (kind) => nodes.filter((n) => n.kind === kind);
  const capabilities = byKind("capability");
  const requirements = byKind("requirement");
  const nfrs = byKind("nfr");
  const epics = byKind("epic");
  const stories = byKind("story");
  const bugs = byKind("bug");
  const retros = byKind("retrospective");
  const semanticEdges = edges.filter((e) => e.kind !== "references");
  const referenceEdges = edges.filter((e) => e.kind === "references");
  function buildDegreeMaps(edgeList) {
    const fwd = /* @__PURE__ */ new Map();
    const rev = /* @__PURE__ */ new Map();
    for (const e of edgeList) {
      if (!fwd.has(e.from)) fwd.set(e.from, []);
      fwd.get(e.from).push(e.to);
      if (!rev.has(e.to)) rev.set(e.to, []);
      rev.get(e.to).push(e.from);
    }
    return { fwd, rev };
  }
  const semanticMaps = buildDegreeMaps(semanticEdges);
  const referenceMaps = buildDegreeMaps(referenceEdges);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  function hasSemanticLink(id) {
    return (semanticMaps.fwd.get(id)?.length ?? 0) > 0 || (semanticMaps.rev.get(id)?.length ?? 0) > 0;
  }
  function outDegree(id) {
    if (hasSemanticLink(id)) return semanticMaps.fwd.get(id)?.length ?? 0;
    return referenceMaps.fwd.get(id)?.length ?? 0;
  }
  function inDegree(id) {
    if (hasSemanticLink(id)) return semanticMaps.rev.get(id)?.length ?? 0;
    return referenceMaps.rev.get(id)?.length ?? 0;
  }
  const colDefs = [
    { kind: "capability", label: "Capabilities", nodes: capabilities },
    { kind: "requirement", label: "Requirements (FR)", nodes: requirements },
    { kind: "nfr", label: "Non-Functional (NFR)", nodes: nfrs },
    { kind: "epic", label: "Epics", nodes: epics },
    { kind: "story", label: "Stories", nodes: stories },
    { kind: "bug", label: "Bugs", nodes: bugs },
    { kind: "retrospective", label: "Retrospectives", nodes: retros }
  ];
  function linkedTargetLabels(id) {
    const maps = hasSemanticLink(id) ? semanticMaps : referenceMaps;
    const tos = maps.fwd.get(id) ?? [];
    const labels = [];
    for (const to of tos) {
      const target = nodeById.get(to);
      if (target) labels.push(target.label);
    }
    return labels.sort();
  }
  const lines = [
    '<section class="diagram-section" aria-label="Traceability spine diagram">',
    "<h2>Traceability Spine</h2>",
    '<p class="diagram-desc">From capabilities through requirements, epics, stories, bugs, and retrospectives. The <span class="spine-connector" aria-hidden="true">&rarr;</span> glyph marks an entity with outgoing links; hover it to see the connected entities.</p>',
    '<div class="scroll-wrapper" role="region" aria-label="Traceability table (scroll horizontally if needed)">',
    '<table class="spine-table" aria-label="Traceability spine">',
    "<thead>",
    "<tr>"
  ];
  for (const col of colDefs) {
    const color = nodeColor(col.kind);
    lines.push(
      `<th class="spine-col-header" style="border-top:3px solid ${esc8(color)}" scope="col">${esc8(col.label)}<br><small>(${col.nodes.length})</small></th>`
    );
  }
  lines.push("</tr>", "</thead>", "<tbody>");
  const maxRows = Math.max(...colDefs.map((c) => c.nodes.length), 1);
  for (let i2 = 0; i2 < maxRows; i2++) {
    lines.push("<tr>");
    for (const col of colDefs) {
      const node = col.nodes[i2];
      if (!node) {
        lines.push('<td class="spine-cell spine-cell--empty" aria-hidden="true"></td>');
      } else {
        const badge = statusBadge(node.status);
        const out = outDegree(node.id);
        const deg = out + inDegree(node.id);
        let connector = "";
        if (out > 0) {
          const targets = linkedTargetLabels(node.id);
          const titleAttr = targets.length ? ` title="Links to: ${esc8(targets.join(", "))}"` : "";
          connector = `<span class="spine-connector" aria-label="${out} outgoing link${out === 1 ? "" : "s"}"${titleAttr}>&rarr;<span class="spine-connector-count">${out}</span></span>`;
        } else if (deg === 0) {
          connector = '<span class="spine-orphan-dot" aria-label="No links" title="No links">&deg;</span>';
        }
        lines.push(
          `<td class="spine-cell" style="border-left:2px solid ${esc8(nodeColor(node.kind))}">${nodeLink(node, docPages)}${badge}${connector}</td>`
        );
      }
    }
    lines.push("</tr>");
  }
  lines.push("</tbody>", "</table>", "</div>", "</section>");
  return lines.join("\n");
}
function buildEpicStoryTrees(manifest, docPages) {
  const nodes = manifest.nodes;
  const edges = manifest.edges;
  const epics = nodes.filter((n) => n.kind === "epic");
  if (epics.length === 0) {
    return '<section class="diagram-section" aria-label="Epic story trees"><h2>Epic \u2192 Story Trees</h2><p class="meta">No epics found.</p></section>';
  }
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const epicStories = /* @__PURE__ */ new Map();
  const epicStorySeen = /* @__PURE__ */ new Map();
  for (const epic of epics) {
    epicStories.set(epic.id, []);
    epicStorySeen.set(epic.id, /* @__PURE__ */ new Set());
  }
  function linkEpicStory(epicId, story) {
    const seen = epicStorySeen.get(epicId);
    const arr = epicStories.get(epicId);
    if (!seen || !arr || seen.has(story.id)) return;
    seen.add(story.id);
    arr.push(story);
  }
  for (const edge of edges) {
    if (edge.kind === "references") continue;
    const a = nodeById.get(edge.from);
    const b = nodeById.get(edge.to);
    if (!a || !b) continue;
    if (a.kind === "epic" && b.kind === "story" && epicStories.has(a.id)) {
      linkEpicStory(a.id, b);
    } else if (b.kind === "epic" && a.kind === "story" && epicStories.has(b.id)) {
      linkEpicStory(b.id, a);
    }
  }
  const lines = [
    '<section class="diagram-section" aria-label="Epic story trees">',
    "<h2>Epic \u2192 Story Trees</h2>",
    '<p class="diagram-desc">Each epic with its related stories.</p>',
    '<div class="epic-trees">'
  ];
  for (const epic of epics) {
    const epicStoryList = (epicStories.get(epic.id) ?? []).sort((a, b) => a.id < b.id ? -1 : 1);
    const color = nodeColor("epic");
    lines.push(
      `<div class="epic-tree" aria-label="Epic: ${esc8(epic.label)}">`,
      `<div class="epic-root" style="border-left:4px solid ${esc8(color)}">`,
      `<span class="epic-icon" aria-hidden="true">&#9733;</span>`,
      `${nodeLink(epic, docPages)}${statusBadge(epic.status)}`,
      "</div>"
    );
    if (epicStoryList.length > 0) {
      lines.push(
        '<ul class="story-list" aria-label="Stories in this epic">'
      );
      for (const story of epicStoryList) {
        lines.push(
          `<li class="story-item" style="border-left:2px solid ${esc8(nodeColor(story.kind))}">${nodeLink(story, docPages)}${statusBadge(story.status)}</li>`
        );
      }
      lines.push("</ul>");
    } else {
      lines.push('<p class="meta no-stories">No stories linked to this epic.</p>');
    }
    lines.push("</div>");
  }
  lines.push("</div>", "</section>");
  return lines.join("\n");
}
var LIFECYCLE_STATUSES = ["backlog", "ready-for-dev", "in-progress", "review", "done"];
var STATUS_LABELS = {
  backlog: "Backlog",
  "ready-for-dev": "Ready for Dev",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done"
};
function buildStatusBoard(manifest, docPages) {
  const nodes = manifest.nodes;
  const boardNodes = nodes.filter((n) => n.kind === "story" || n.kind === "bug");
  const columns = /* @__PURE__ */ new Map();
  for (const s of LIFECYCLE_STATUSES) {
    columns.set(s, []);
  }
  const unclassified = [];
  for (const node of boardNodes) {
    const status = node.status ?? "";
    if (LIFECYCLE_STATUSES.includes(status)) {
      columns.get(status).push(node);
    } else {
      unclassified.push(node);
    }
  }
  for (const [, arr] of columns) {
    arr.sort((a, b) => a.id < b.id ? -1 : 1);
  }
  unclassified.sort((a, b) => a.id < b.id ? -1 : 1);
  const lines = [
    '<section class="diagram-section" aria-label="Sprint status board">',
    "<h2>Sprint / Status Board</h2>",
    '<p class="diagram-desc">Stories and bugs grouped by lifecycle status.</p>',
    '<div class="scroll-wrapper" role="region" aria-label="Status board (scroll horizontally if needed)">',
    '<div class="status-board" aria-label="Status board">'
  ];
  for (const status of LIFECYCLE_STATUSES) {
    const col = columns.get(status);
    const color = STATUS_COLORS[status] ?? "#546e7a";
    const label = STATUS_LABELS[status];
    lines.push(
      `<div class="status-col" aria-label="Column: ${esc8(label)} (${col.length} items)">`,
      `<div class="status-col-header" style="background:${esc8(color)}" aria-hidden="false">`,
      `<span class="status-col-title">${esc8(label)}</span>`,
      `<span class="status-col-count" aria-label="${col.length} items">${col.length}</span>`,
      "</div>",
      '<ul class="status-col-items">'
    );
    if (col.length === 0) {
      lines.push('<li class="status-card status-card--empty" aria-label="No items"><span class="meta">\u2014</span></li>');
    } else {
      for (const node of col) {
        lines.push(
          `<li class="status-card" aria-label="${esc8(node.label)} (${esc8(node.kind)})">`,
          `<span class="card-kind" style="color:${esc8(nodeColor(node.kind))}" aria-hidden="true">${esc8(node.kind)}</span>`,
          nodeLink(node, docPages),
          "</li>"
        );
      }
    }
    lines.push("</ul>", "</div>");
  }
  if (unclassified.length > 0) {
    lines.push(
      `<div class="status-col" aria-label="Column: Unclassified (${unclassified.length} items)">`,
      `<div class="status-col-header" style="background:#78909c">`,
      '<span class="status-col-title">Unclassified</span>',
      `<span class="status-col-count">${unclassified.length}</span>`,
      "</div>",
      '<ul class="status-col-items">'
    );
    for (const node of unclassified) {
      lines.push(
        `<li class="status-card" aria-label="${esc8(node.label)} (${esc8(node.kind)})">`,
        `<span class="card-kind" style="color:${esc8(nodeColor(node.kind))}" aria-hidden="true">${esc8(node.kind)}</span>`,
        nodeLink(node, docPages),
        "</li>"
      );
    }
    lines.push("</ul>", "</div>");
  }
  lines.push("</div>", "</div>", "</section>");
  return lines.join("\n");
}
var DIAGRAMS_CSS = `
/* Diagrams page additional styles */
.diagram-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: calc(var(--gap) * 1.25);
  margin-bottom: calc(var(--gap) * 1.5);
}

.diagram-section h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent-dk);
  margin-bottom: 0.35rem;
}

.diagram-desc {
  font-size: 0.85rem;
  color: var(--ink-wash);
  margin-bottom: var(--gap);
}

/* Scroll wrapper for wide content */
.scroll-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
}

/* Traceability spine table */
.spine-table {
  border-collapse: collapse;
  min-width: 800px;
  width: 100%;
  table-layout: fixed;
}

.spine-col-header {
  background: var(--surface-alt);
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-wash);
}

.spine-col-header small {
  font-weight: 400;
  font-size: 0.78rem;
}

.spine-cell {
  padding: 0.4rem 0.65rem;
  vertical-align: top;
  font-size: 0.83rem;
  border-bottom: 1px solid var(--border);
}

.spine-cell--empty {
  background: var(--surface-alt);
}

.status-badge {
  display: inline-block;
  font-size: 0.7rem;
  color: #fff;
  border-radius: 3px;
  padding: 1px 5px;
  margin-left: 0.35rem;
  vertical-align: middle;
}

/* Traceability connectors (finding #7) */
.spine-connector {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  margin-left: 0.35rem;
  color: var(--accent-dk);
  font-weight: 700;
  cursor: help;
  vertical-align: middle;
}

.spine-connector-count {
  font-size: 0.65rem;
  font-weight: 600;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 4px;
  color: var(--ink-wash);
}

.spine-orphan-dot {
  margin-left: 0.35rem;
  color: var(--warn);
  font-weight: 700;
  cursor: help;
  vertical-align: middle;
}

.node-link {
  color: var(--accent-dk);
  text-decoration: none;
  font-size: 0.83rem;
}
.node-link:hover { text-decoration: underline; }

/* Epic trees */
.epic-trees {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--gap);
}

.epic-tree {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--gap);
}

.epic-root {
  padding: 0.5rem 0.75rem;
  background: var(--surface);
  border-radius: var(--radius);
  margin-bottom: 0.65rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.epic-icon {
  font-size: 0.9rem;
  flex-shrink: 0;
}

.story-list {
  list-style: none;
  padding-left: 1rem;
}

.story-item {
  padding: 0.3rem 0.5rem;
  margin-bottom: 0.35rem;
  background: var(--surface);
  border-radius: 3px;
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.no-stories {
  font-size: 0.8rem;
  padding-left: 1rem;
}

/* Status board */
.status-board {
  display: flex;
  gap: 0.75rem;
  min-width: 900px;
  padding-bottom: 0.5rem;
}

.status-col {
  flex: 1 0 160px;
  display: flex;
  flex-direction: column;
}

.status-col-header {
  color: #fff;
  border-radius: var(--radius) var(--radius) 0 0;
  padding: 0.4rem 0.65rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-col-title { font-size: 0.82rem; font-weight: 600; }
.status-col-count {
  font-size: 0.78rem;
  background: rgba(255,255,255,0.25);
  border-radius: 10px;
  padding: 1px 7px;
}

.status-col-items {
  list-style: none;
  flex: 1;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-top: none;
  border-radius: 0 0 var(--radius) var(--radius);
  padding: 0.5rem;
  min-height: 60px;
}

.status-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.35rem 0.5rem;
  margin-bottom: 0.4rem;
  font-size: 0.8rem;
}

.status-card--empty {
  background: transparent;
  border: none;
  color: var(--ink-wash);
  text-align: center;
}

.card-kind {
  font-size: 0.7rem;
  font-weight: 600;
  display: block;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-bottom: 2px;
}
`;
function renderDiagrams(manifest, outDir) {
  const title = esc8(manifest.projectTitle);
  const docPages = buildDocPageMap(manifest.files.map((f) => f.path));
  const spineHtml = buildTraceabilitySpine(manifest, docPages);
  const treesHtml = buildEpicStoryTrees(manifest, docPages);
  const boardHtml = buildStatusBoard(manifest, docPages);
  const html = [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${title} \u2014 Diagrams</title>`,
    `<meta name="description" content="Auto-generated diagrams for ${title}">`,
    "<style>",
    DESIGN_SYSTEM_CSS.trimEnd(),
    DIAGRAMS_CSS,
    "</style>",
    "</head>",
    "<body>",
    "<header>",
    `<h1>${title}</h1>`,
    '<p class="subtitle">Generated Diagrams</p>',
    // SHOULD-FIX #2: shared Home/Graph/Diagrams/Orphans/Search nav set (the
    // old hand-rolled nav omitted Search — a dead end back to search from here).
    '<nav aria-label="Site navigation">',
    buildNavLinksHtml("", { hasGraphPage: true, hasDiagramsPage: false, hasOrphansPage: true }, "diagrams"),
    "</nav>",
    "</header>",
    "<main>",
    spineHtml,
    treesHtml,
    boardHtml,
    "</main>",
    "<footer>",
    `Knowledge Atlas &bull; ${title} &bull; diagrams.html`,
    "</footer>",
    "</body>",
    "</html>",
    ""
    // trailing newline
  ].join("\n");
  const outPath = path10.join(outDir, "diagrams.html");
  fs10.mkdirSync(outDir, { recursive: true });
  fs10.writeFileSync(outPath, html.replace(/\r\n/g, "\n"), { encoding: "utf-8" });
  return ["diagrams.html"];
}

// lib/knowledge-atlas/src/render/orphan.ts
var fs11 = __toESM(require("fs"));
var path11 = __toESM(require("path"));
function esc9(s) {
  return (s ?? "").toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function safePath3(p) {
  const s = (p ?? "").toString();
  if (/^[a-zA-Z][a-zA-Z0-9+.\-]*:/.test(s)) return "#invalid";
  if (/^\/\//.test(s)) return "#invalid";
  return s;
}
var DOC_PAGE_MAP = /* @__PURE__ */ new Map();
function nodeLink2(node, extra) {
  const extraStr = extra ? ` ${esc9(extra)}` : "";
  const meta = `<span class="node-meta">[${esc9(node.kind)}${extraStr}]</span>`;
  const page = DOC_PAGE_MAP.get(node.fileId);
  if (!page) {
    return `<span class="node-link node-link-nodoc" aria-disabled="true" aria-label="${esc9(node.label)} (${esc9(node.kind)}, no page)">${esc9(node.label)}</span>${meta}`;
  }
  const base = safePath3(page);
  if (base === "#invalid") {
    return `<span class="node-link node-link-nodoc" aria-disabled="true" aria-label="${esc9(node.label)} (${esc9(node.kind)}, no page)">${esc9(node.label)}</span>${meta}`;
  }
  const href = base + (node.anchor ? "#" + node.anchor : "");
  return `<a href="${esc9(href)}" class="node-link" aria-label="${esc9(node.label)} (${esc9(node.kind)})">${esc9(node.label)}</a>${meta}`;
}
function computeOrphans(manifest) {
  const nodes = manifest.nodes;
  const edges = manifest.edges;
  const nodeIds = new Set(nodes.map((n) => n.id));
  const implementsEdges = edges.filter((e) => e.kind === "implements");
  const addressedByEdges = edges.filter((e) => e.kind === "addressed-by");
  const validatesEdges = edges.filter((e) => e.kind === "validates");
  const derivesFromEdges = edges.filter((e) => e.kind === "derives-from");
  const reqNfrNodes = nodes.filter((n) => n.kind === "requirement" || n.kind === "nfr");
  const implementedReqIds = new Set(implementsEdges.map((e) => e.to));
  const unreferencedRequirements = reqNfrNodes.filter((n) => !implementedReqIds.has(n.id)).sort((a, b) => a.id < b.id ? -1 : 1);
  const storyNodes = nodes.filter((n) => n.kind === "story");
  const reqNfrNodeIds = new Set(reqNfrNodes.map((n) => n.id));
  const storiesWithNoRequirement = storyNodes.filter((story) => {
    const outgoingImpl = implementsEdges.filter((e) => e.from === story.id);
    return !outgoingImpl.some((e) => reqNfrNodeIds.has(e.to));
  }).sort((a, b) => a.id < b.id ? -1 : 1);
  const bugNodes = nodes.filter((n) => n.kind === "bug");
  const addressedBugIds = new Set(addressedByEdges.map((e) => e.to));
  const bugsWithOutgoingLinks = new Set(
    [...addressedByEdges, ...implementsEdges].filter((e) => bugNodes.some((b) => b.id === e.from)).map((e) => e.from)
  );
  const bugsWithNoLink = bugNodes.filter((bug) => !addressedBugIds.has(bug.id) && !bugsWithOutgoingLinks.has(bug.id)).sort((a, b) => a.id < b.id ? -1 : 1);
  const epicNodes = nodes.filter((n) => n.kind === "epic");
  const validatedEpicIds = new Set(validatesEdges.map((e) => e.to));
  const retroNodes = nodes.filter((n) => n.kind === "retrospective");
  const retroLinkedEpicIds = new Set(
    edges.filter((e) => e.kind !== "references" && retroNodes.some((r) => r.id === e.from)).map((e) => e.to)
  );
  const epicsWithNoRetro = epicNodes.filter((epic) => !validatedEpicIds.has(epic.id) && !retroLinkedEpicIds.has(epic.id)).sort((a, b) => a.id < b.id ? -1 : 1);
  const danglingEdges = edges.filter((e) => e.dangling === true && e.kind !== "shipped-in").map((e) => ({ from: e.from, to: e.to, kind: e.kind })).sort((a, b) => {
    if (a.from !== b.from) return a.from < b.from ? -1 : 1;
    if (a.to !== b.to) return a.to < b.to ? -1 : 1;
    return a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0;
  });
  return {
    unreferencedRequirements,
    storiesWithNoRequirement,
    bugsWithNoLink,
    epicsWithNoRetro,
    danglingEdges
  };
}
function renderOrphanSection(id, title, description, nodes, emptyMessage) {
  const lines = [
    `<section class="orphan-section ${nodes.length > 0 ? "has-orphans" : "no-orphans"}" id="${esc9(id)}" aria-label="${esc9(title)}">`,
    `<h2>${esc9(title)} <span class="orphan-count" aria-label="${nodes.length} items">${nodes.length}</span></h2>`,
    `<p class="diagram-desc">${esc9(description)}</p>`
  ];
  if (nodes.length === 0) {
    lines.push(`<p class="orphan-empty" aria-label="${esc9(emptyMessage)}">${esc9(emptyMessage)}</p>`);
  } else {
    lines.push('<ul class="orphan-list" role="list">');
    for (const node of nodes) {
      lines.push(`<li class="orphan-item">${nodeLink2(node)}</li>`);
    }
    lines.push("</ul>");
  }
  lines.push("</section>");
  return lines.join("\n");
}
function renderDanglingSection(danglingEdges) {
  const lines = [
    `<section class="orphan-section ${danglingEdges.length > 0 ? "has-orphans" : "no-orphans"}" id="dangling-refs" aria-label="Dangling references">`,
    `<h2>Dangling References <span class="orphan-count" aria-label="${danglingEdges.length} items">${danglingEdges.length}</span></h2>`,
    '<p class="diagram-desc">Edges whose target node was not found in the manifest. Indicates a broken reference or a document that has not yet been created. shipped-in version targets are excluded (they are intentionally terminal).</p>'
  ];
  if (danglingEdges.length === 0) {
    lines.push('<p class="orphan-empty">No dangling references found.</p>');
  } else {
    lines.push(
      '<div class="scroll-wrapper" role="region" aria-label="Dangling references table">',
      '<table class="dangling-table" aria-label="Dangling references">',
      "<thead><tr>",
      '<th scope="col">From</th>',
      '<th scope="col">Edge kind</th>',
      '<th scope="col">To (unresolved)</th>',
      "</tr></thead>",
      "<tbody>"
    );
    for (const edge of danglingEdges) {
      lines.push(
        "<tr>",
        `<td class="dangling-cell"><code>${esc9(edge.from)}</code></td>`,
        `<td class="dangling-cell"><span class="edge-kind-badge">${esc9(edge.kind)}</span></td>`,
        `<td class="dangling-cell dangling-target"><code>${esc9(edge.to)}</code></td>`,
        "</tr>"
      );
    }
    lines.push("</tbody>", "</table>", "</div>");
  }
  lines.push("</section>");
  return lines.join("\n");
}
function renderSummary(report) {
  const totalIssues = report.unreferencedRequirements.length + report.storiesWithNoRequirement.length + report.bugsWithNoLink.length + report.epicsWithNoRetro.length + report.danglingEdges.length;
  const statusColor = totalIssues === 0 ? "#2e7d32" : "#e65100";
  const statusLabel = totalIssues === 0 ? "No gaps detected" : `${totalIssues} gaps detected`;
  const lines = [
    '<section class="orphan-summary card" aria-label="Orphan summary">',
    `<h2>Summary <span class="summary-status" style="color:${esc9(statusColor)}" aria-live="polite">${esc9(statusLabel)}</span></h2>`,
    '<ul class="summary-list">',
    `<li><a href="#unreferenced-requirements">Unreferenced requirements/NFRs:</a> <strong>${report.unreferencedRequirements.length}</strong></li>`,
    `<li><a href="#stories-no-requirement">Stories with no requirement:</a> <strong>${report.storiesWithNoRequirement.length}</strong></li>`,
    `<li><a href="#bugs-no-link">Bugs with no link:</a> <strong>${report.bugsWithNoLink.length}</strong></li>`,
    `<li><a href="#epics-no-retro">Epics with no retrospective:</a> <strong>${report.epicsWithNoRetro.length}</strong></li>`,
    `<li><a href="#dangling-refs">Dangling references:</a> <strong>${report.danglingEdges.length}</strong></li>`,
    "</ul>",
    "</section>"
  ];
  return lines.join("\n");
}
var ORPHAN_CSS = `
/* Orphan page additional styles */
.orphan-section {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: calc(var(--gap) * 1.25);
  margin-bottom: calc(var(--gap) * 1.25);
}

.orphan-section.has-orphans {
  border-left: 4px solid var(--warn);
}

.orphan-section.no-orphans {
  border-left: 4px solid var(--ok);
}

.orphan-section h2 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-dk);
  margin-bottom: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.orphan-count {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1px 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ink-wash);
}

.orphan-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.orphan-item {
  padding: 0.35rem 0.5rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.orphan-item:last-child { border-bottom: none; }

.orphan-empty {
  font-size: 0.85rem;
  color: var(--ok);
  font-style: italic;
}

.node-link {
  color: var(--accent-dk);
  text-decoration: none;
  font-size: 0.85rem;
}
.node-link:hover { text-decoration: underline; }

.node-meta {
  font-size: 0.75rem;
  color: var(--ink-wash);
  margin-left: 0.25rem;
}

/* Summary */
.orphan-summary h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--accent-dk);
  margin-bottom: 0.5rem;
}

.summary-status {
  font-size: 0.85rem;
  font-weight: 400;
  margin-left: 0.75rem;
}

.summary-list {
  list-style: none;
  padding: 0;
  font-size: 0.88rem;
}

.summary-list li {
  padding: 0.2rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-list a {
  color: var(--accent);
  text-decoration: underline;
}

.diagram-desc {
  font-size: 0.85rem;
  color: var(--ink-wash);
  margin-bottom: 0.75rem;
}

/* Dangling references table */
.scroll-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
}

.dangling-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.82rem;
}

.dangling-table th {
  text-align: left;
  background: var(--surface-alt);
  padding: 0.4rem 0.65rem;
  font-weight: 600;
  color: var(--ink-wash);
  border-bottom: 2px solid var(--border);
}

.dangling-cell {
  padding: 0.35rem 0.65rem;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

.dangling-target { color: var(--warn); }

.edge-kind-badge {
  display: inline-block;
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 6px;
  font-size: 0.78rem;
  font-family: monospace;
}
`;
function renderOrphanPage(manifest, outDir) {
  DOC_PAGE_MAP = buildDocPageMap(manifest.files.map((f) => f.path));
  const report = computeOrphans(manifest);
  const title = esc9(manifest.projectTitle);
  const summaryHtml = renderSummary(report);
  const unreferencedHtml = renderOrphanSection(
    "unreferenced-requirements",
    "Unreferenced Requirements / NFRs",
    "Requirements and non-functional requirements with no story implementing them.",
    report.unreferencedRequirements,
    "All requirements have at least one implementing story."
  );
  const storiesNoReqHtml = renderOrphanSection(
    "stories-no-requirement",
    "Stories with No Requirement",
    "Stories that have no outgoing implements edge to a requirement or NFR.",
    report.storiesWithNoRequirement,
    "All stories are linked to at least one requirement."
  );
  const bugsNoLinkHtml = renderOrphanSection(
    "bugs-no-link",
    "Bugs with No Link",
    "Bugs that have no addressed-by or implements edge connecting them to a story or requirement.",
    report.bugsWithNoLink,
    "All bugs are linked to a story or requirement."
  );
  const epicsNoRetroHtml = renderOrphanSection(
    "epics-no-retro",
    "Epics with No Retrospective",
    "Epics that have no retrospective node linked via a validates edge.",
    report.epicsWithNoRetro,
    "All epics have an associated retrospective."
  );
  const danglingHtml = renderDanglingSection(report.danglingEdges);
  const html = [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${title} \u2014 Orphans &amp; Gaps</title>`,
    `<meta name="description" content="Orphan and gap analysis for ${title}">`,
    "<style>",
    DESIGN_SYSTEM_CSS.trimEnd(),
    ORPHAN_CSS,
    "</style>",
    "</head>",
    "<body>",
    "<header>",
    `<h1>${title}</h1>`,
    '<p class="subtitle">Orphans &amp; Gaps</p>',
    // SHOULD-FIX #2: shared Home/Graph/Diagrams/Orphans/Search nav set (the
    // old hand-rolled nav omitted Search — a dead end back to search from here).
    '<nav aria-label="Site navigation">',
    buildNavLinksHtml("", { hasGraphPage: true, hasDiagramsPage: true, hasOrphansPage: false }, "orphans"),
    "</nav>",
    "</header>",
    "<main>",
    summaryHtml,
    unreferencedHtml,
    storiesNoReqHtml,
    bugsNoLinkHtml,
    epicsNoRetroHtml,
    danglingHtml,
    "</main>",
    "<footer>",
    `Knowledge Atlas &bull; ${title} &bull; orphans.html`,
    "</footer>",
    "</body>",
    "</html>",
    ""
    // trailing newline
  ].join("\n");
  const outPath = path11.join(outDir, "orphans.html");
  fs11.mkdirSync(outDir, { recursive: true });
  fs11.writeFileSync(outPath, html.replace(/\r\n/g, "\n"), { encoding: "utf-8" });
  return ["orphans.html"];
}

// lib/knowledge-atlas/src/generate.ts
var MANIFEST_VERSION = 3;
function normPath(p) {
  return path12.resolve(p).replace(/[\\/]+$/, "");
}
function pathsEqual(a, b) {
  return normPath(a) === normPath(b);
}
function isUnder(parent, child) {
  const p = normPath(parent);
  const c = normPath(child);
  return c.startsWith(p + path12.sep);
}
var MAX_TIME_VALUE_MS = 864e13;
function resolveTimestamp(now) {
  if (now !== void 0 && now !== null) {
    let d;
    if (now instanceof Date) {
      d = now;
    } else if (typeof now === "number") {
      d = new Date(now * 1e3);
    } else if (/^\d+$/.test(now.trim())) {
      d = new Date(parseInt(now.trim(), 10) * 1e3);
    } else {
      d = new Date(now);
    }
    if (!isValidDate(d)) {
      throw new Error(
        `generate: invalid \`now\` value: ${JSON.stringify(now)} \u2014 provide a Date, an ISO-8601 string, or Unix seconds.`
      );
    }
    return isoSecond(d);
  }
  const epoch = process.env["SOURCE_DATE_EPOCH"];
  if (epoch) {
    const secs = parseInt(epoch, 10);
    if (!isNaN(secs) && secs >= 0 && secs * 1e3 <= MAX_TIME_VALUE_MS) {
      const d = new Date(secs * 1e3);
      if (isValidDate(d)) {
        return isoSecond(d);
      }
    }
  }
  return isoSecond(/* @__PURE__ */ new Date());
}
function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime());
}
function isoSecond(d) {
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}
function deriveProjectTitle(projectRoot) {
  const pkgPath = path12.join(projectRoot, "package.json");
  try {
    if (fs12.existsSync(pkgPath)) {
      const raw = fs12.readFileSync(pkgPath, "utf-8");
      const pkg = JSON.parse(raw);
      if (typeof pkg["name"] === "string" && pkg["name"].trim()) {
        return pkg["name"].trim();
      }
    }
  } catch {
  }
  const base = path12.basename(projectRoot).trim();
  return base.length > 0 ? base : "Unknown Project";
}
function extractFileRecord(absPath, fileId, docType, contentHash2) {
  let content = "";
  try {
    content = fs12.readFileSync(absPath, "utf-8");
  } catch {
    return { path: fileId, contentHash: contentHash2, type: docType, entities: [], statuses: [], edges: [] };
  }
  const fm = parseFrontmatter(content, fileId);
  const { entities, statuses, edges } = extractEntities(content, fileId, docType, fm);
  return {
    path: fileId,
    contentHash: contentHash2,
    type: docType,
    entities,
    statuses,
    edges
  };
}
function buildManifest(scannedFiles, projectRoot, bmadOutputDir, outDir, generatedAt) {
  const projectTitle = deriveProjectTitle(projectRoot);
  const priorManifest = readManifest(outDir, MANIFEST_VERSION);
  const priorRecords = priorManifest?.files ?? [];
  const diff = computeDiff(
    priorRecords,
    scannedFiles.map((f) => ({ fileId: f.fileId, contentHash: f.contentHash }))
  );
  const toReprocessSet = new Set(diff.toReprocess);
  const reprocessed = [];
  for (const sf of scannedFiles) {
    if (toReprocessSet.has(sf.fileId)) {
      reprocessed.push(extractFileRecord(sf.absPath, sf.fileId, sf.type, sf.contentHash));
    }
  }
  const allRecords = mergeRecords(diff.unchanged, reprocessed, diff.removed);
  const nodes = buildNodes(allRecords);
  const edges = buildEdges(allRecords, nodes);
  const { nodes: mergedNodes, edges: mergedEdges } = reconcileWithKgJson(
    nodes,
    edges,
    bmadOutputDir
  );
  const counts = buildCounts(allRecords, mergedNodes, mergedEdges);
  return {
    projectTitle,
    generatedAt,
    projectRoot,
    bmadOutputDir,
    version: MANIFEST_VERSION,
    files: allRecords,
    nodes: mergedNodes,
    edges: mergedEdges,
    counts
  };
}
function generate(opts) {
  const { projectRoot, outDir: outDirOverride } = opts;
  if (!projectRoot || typeof projectRoot !== "string") {
    throw new Error("generate: projectRoot is required and must be a non-empty string");
  }
  if (!path12.isAbsolute(projectRoot)) {
    throw new Error(`generate: projectRoot must be an absolute path (got: ${projectRoot})`);
  }
  const rootStat = fs12.statSync(projectRoot, { throwIfNoEntry: false });
  if (!rootStat || !rootStat.isDirectory()) {
    throw new Error(`generate: projectRoot does not exist or is not a directory: ${projectRoot}`);
  }
  const { sources, outputFolder, outputOverlap } = resolveKnowledgeSources(projectRoot);
  const bmadOutputDir = path12.join(projectRoot, outputFolder);
  const defaultOutDir = path12.join(bmadOutputDir, "knowledge-site");
  const outDir = outDirOverride ?? defaultOutDir;
  const rel = path12.relative(projectRoot, outDir);
  if (rel.startsWith("..") || path12.isAbsolute(rel)) {
    throw new Error(`generate: outDir escapes projectRoot: ${outDir}`);
  }
  const generatedAt = resolveTimestamp(opts.now);
  const scannedFiles = scanSources(sources, outDir);
  const manifest = buildManifest(scannedFiles, projectRoot, bmadOutputDir, outDir, generatedAt);
  const absPathByFileId = new Map(scannedFiles.map((f) => [f.fileId, f.absPath]));
  const resolveAbsPath = (fileId) => absPathByFileId.get(fileId);
  const isDefaultOut = pathsEqual(outDir, defaultOutDir);
  const sourceAtOrUnderOut = sources.some((s) => pathsEqual(s.absPath, outDir) || isUnder(outDir, s.absPath));
  if (isDefaultOut && !outputOverlap && !sourceAtOrUnderOut) {
    fs12.rmSync(outDir, { recursive: true, force: true });
  } else if (isDefaultOut && (outputOverlap || sourceAtOrUnderOut)) {
    process.stderr.write(
      `[atlas] WARN: refusing to purge ${outDir} \u2014 a knowledge source resolves at or under it (data-loss guard)
`
    );
  }
  fs12.mkdirSync(outDir, { recursive: true });
  const safeRender = (label, fn) => {
    try {
      return fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`[atlas] WARN: ${label} failed to render \u2014 page omitted: ${msg}
`);
      return [];
    }
  };
  const graphFiles = safeRender("graph.html", () => renderGraphPage(manifest, outDir));
  const diagramFiles = safeRender("diagrams.html", () => renderDiagrams(manifest, outDir));
  const orphanFiles = safeRender("orphans.html", () => renderOrphanPage(manifest, outDir));
  const extraFileCount = graphFiles.length + diagramFiles.length + orphanFiles.length;
  const written = renderSite(manifest, outDir, resolveAbsPath);
  writeManifest(outDir, manifest);
  const indexPath = path12.join(outDir, "index.html");
  return {
    outDir,
    indexPath,
    // 29.3 pages/assets + 29.4 graph/diagram/orphan pages + manifest.json
    fileCount: written.length + extraFileCount + 1
  };
}

// lib/knowledge-atlas/src/cli.ts
function usage() {
  process.stderr.write(
    "Usage: node atlas.cjs <projectRoot> [--out <outDir>]\n"
  );
}
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    usage();
    process.exit(args.length === 0 ? 1 : 0);
  }
  const projectRoot = path13.resolve(args[0]);
  let outDir;
  const outIdx = args.indexOf("--out");
  if (outIdx !== -1) {
    if (outIdx + 1 >= args.length) {
      process.stderr.write("[atlas] ERROR: --out requires a directory argument\n");
      process.exit(1);
    }
    outDir = path13.resolve(args[outIdx + 1]);
  }
  try {
    const result = generate({ projectRoot, outDir });
    process.stdout.write(result.indexPath + "\n");
    process.stderr.write(`[atlas] generated: ${result.indexPath}
`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`[atlas] ERROR: ${msg}
`);
    process.exit(1);
  }
}
main();
/*! Bundled license information:

lunr/lunr.js:
  (**
   * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 2.3.9
   * Copyright (C) 2020 Oliver Nightingale
   * @license MIT
   *)
  (*!
   * lunr.utils
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Set
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.tokenizer
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Pipeline
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Vector
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.stemmer
   * Copyright (C) 2020 Oliver Nightingale
   * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
   *)
  (*!
   * lunr.stopWordFilter
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.trimmer
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.TokenSet
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Index
   * Copyright (C) 2020 Oliver Nightingale
   *)
  (*!
   * lunr.Builder
   * Copyright (C) 2020 Oliver Nightingale
   *)

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT *)
*/
