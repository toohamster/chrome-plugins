
/*
	json2.js
	2012-10-08

	Public Domain.

	NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

	See http://www.JSON.org/js.html


	This code should be minified before deployment.
	See http://javascript.crockford.com/jsmin.html

	USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	NOT CONTROL.


	This file creates a global JSON object containing two methods: stringify
	and parse.

		JSON.stringify(value, replacer, space)
			value       any JavaScript value, usually an object or array.

			replacer    an optional parameter that determines how object
						values are stringified for objects. It can be a
						function or an array of strings.

			space       an optional parameter that specifies the indentation
						of nested structures. If it is omitted, the text will
						be packed without extra whitespace. If it is a number,
						it will specify the number of spaces to indent at each
						level. If it is a string (such as '\t' or '&nbsp;'),
						it contains the characters used to indent at each level.

			This method produces a JSON text from a JavaScript value.

			When an object value is found, if the object contains a toJSON
			method, its toJSON method will be called and the result will be
			stringified. A toJSON method does not serialize: it returns the
			value represented by the name/value pair that should be serialized,
			or undefined if nothing should be serialized. The toJSON method
			will be passed the key associated with the value, and this will be
			bound to the value

			For example, this would serialize Dates as ISO strings.

				Date.prototype.toJSON = function (key) {
					function f(n) {
						// Format integers to have at least two digits.
						return n < 10 ? '0' + n : n;
					}

					return this.getUTCFullYear()   + '-' +
						 f(this.getUTCMonth() + 1) + '-' +
						 f(this.getUTCDate())      + 'T' +
						 f(this.getUTCHours())     + ':' +
						 f(this.getUTCMinutes())   + ':' +
						 f(this.getUTCSeconds())   + 'Z';
				};

			You can provide an optional replacer method. It will be passed the
			key and value of each member, with this bound to the containing
			object. The value that is returned from your method will be
			serialized. If your method returns undefined, then the member will
			be excluded from the serialization.

			If the replacer parameter is an array of strings, then it will be
			used to select the members to be serialized. It filters the results
			such that only members with keys listed in the replacer array are
			stringified.

			Values that do not have JSON representations, such as undefined or
			functions, will not be serialized. Such values in objects will be
			dropped; in arrays they will be replaced with null. You can use
			a replacer function to replace those with JSON values.
			JSON.stringify(undefined) returns undefined.

			The optional space parameter produces a stringification of the
			value that is filled with line breaks and indentation to make it
			easier to read.

			If the space parameter is a non-empty string, then that string will
			be used for indentation. If the space parameter is a number, then
			the indentation will be that many spaces.

			Example:

			text = JSON.stringify(['e', {pluribus: 'unum'}]);
			// text is '["e",{"pluribus":"unum"}]'


			text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
			// text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

			text = JSON.stringify([new Date()], function (key, value) {
				return this[key] instanceof Date ?
					'Date(' + this[key] + ')' : value;
			});
			// text is '["Date(---current time---)"]'


		JSON.parse(text, reviver)
			This method parses a JSON text to produce an object or array.
			It can throw a SyntaxError exception.

			The optional reviver parameter is a function that can filter and
			transform the results. It receives each of the keys and values,
			and its return value is used instead of the original value.
			If it returns what it received, then the structure is not modified.
			If it returns undefined then the member is deleted.

			Example:

			// Parse the text. Values that look like ISO date strings will
			// be converted to Date objects.

			myData = JSON.parse(text, function (key, value) {
				var a;
				if (typeof value === 'string') {
					a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
					if (a) {
						return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
							+a[5], +a[6]));
					}
				}
				return value;
			});

			myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
				var d;
				if (typeof value === 'string' &&
						value.slice(0, 5) === 'Date(' &&
						value.slice(-1) === ')') {
					d = new Date(value.slice(5, -1));
					if (d) {
						return d;
					}
				}
				return value;
			});


	This is a reference implementation. You are free to copy, modify, or
	redistribute.
	*/

	/*jslint evil: true, regexp: true */

	/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
		call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
		getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
		lastIndex, length, parse, prototype, push, replace, slice, stringify,
		test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
	JSON = {};

	(function () {
		'use strict';

		function f(n) {
			// Format integers to have at least two digits.
			return n < 10 ? '0' + n : n;
		}

		//if (typeof Date.prototype.toJSON !== 'function') {

			//Date.prototype.toJSON = function (key) {

				//return isFinite(this.valueOf())
					//? this.getUTCFullYear()     + '-' +
						//f(this.getUTCMonth() + 1) + '-' +
						//f(this.getUTCDate())      + 'T' +
						//f(this.getUTCHours())     + ':' +
						//f(this.getUTCMinutes())   + ':' +
						//f(this.getUTCSeconds())   + 'Z'
					//: null;
			//};

			//String.prototype.toJSON      =
				//Number.prototype.toJSON  =
				//Boolean.prototype.toJSON = function (key) {
					//return this.valueOf();
				//};
		//}

		var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			gap,
			indent,
			meta = {    // table of character substitutions
				'\b': '\\b',
				'\t': '\\t',
				'\n': '\\n',
				'\f': '\\f',
				'\r': '\\r',
				'"' : '\\"',
				'\\': '\\\\'
			},
			rep;


		function quote(string) {
			// If the string contains no control characters, no quote characters, and no
			// backslash characters, then we can safely slap some quotes around it.
			// Otherwise we must also replace the offending characters with safe escape
			// sequences.

			escapable.lastIndex = 0;
			return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
				var c = meta[a];
				return typeof c === 'string'
					? c
					: '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			}) + '"' : '"' + string + '"';
		}


		function str(key, holder) {
			// Produce a string from holder[key].

			var i,          // The loop counter.
				k,          // The member key.
				v,          // The member value.
				length,
				mind = gap,
				partial,
				value = holder[key];

				// If the value has a toJSON method, call it to obtain a replacement value.

			//if (value && typeof value === 'object' &&
					//typeof value.toJSON === 'function') {
				//value = value.toJSON(key);
			//}

			// If we were called with a replacer function, then call the replacer to
			// obtain a replacement value.

			if (typeof rep === 'function') {
				value = rep.call(holder, key, value);
			}

			// What happens next depends on the value's type.

			switch (typeof value) {
			case 'string':
				return quote(value);

			case 'number':

				// JSON numbers must be finite. Encode non-finite numbers as null.

				return isFinite(value) ? String(value) : 'null';

			case 'boolean':
			case 'null':

				// If the value is a boolean or null, convert it to a string. Note:
				// typeof null does not produce 'null'. The case is included here in
				// the remote chance that this gets fixed someday.

				return String(value);

				// If the type is 'object', we might be dealing with an object or an array or
				// null.

			case 'object':

				// Due to a specification blunder in ECMAScript, typeof null is 'object',
				// so watch out for that case.

				if (!value) {
					return 'null';
				}

				// Make an array to hold the partial results of stringifying this object value.

				gap += indent;
				partial = [];

				// Is the value an array?

				if (Object.prototype.toString.apply(value) === '[object Array]') {

					// The value is an array. Stringify every element. Use null as a placeholder
					// for non-JSON values.

					length = value.length;
					for (i = 0; i < length; i += 1) {
						partial[i] = str(i, value) || 'null';
					}

					// Join all of the elements together, separated with commas, and wrap them in
					// brackets.

					v = partial.length === 0
						? '[]'
						: gap
						? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
						: '[' + partial.join(',') + ']';
					gap = mind;
					return v;
				}

				// If the replacer is an array, use it to select the members to be stringified.

				if (rep && typeof rep === 'object') {
					length = rep.length;
					for (i = 0; i < length; i += 1) {
						if (typeof rep[i] === 'string') {
							k = rep[i];
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				} else {

					// Otherwise, iterate through all of the keys in the object.

					for (k in value) {
						if (Object.prototype.hasOwnProperty.call(value, k)) {
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				}

				// Join all of the member texts together, separated with commas,
				// and wrap them in braces.

				v = partial.length === 0
					? '{}'
					: gap
					? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
					: '{' + partial.join(',') + '}';
				gap = mind;
				return v;
			}
		}

		// If the JSON object does not yet have a stringify method, give it one.

		if (typeof JSON.stringify !== 'function') {
			JSON.stringify = function (value, replacer, space) {

				// The stringify method takes a value and an optional replacer, and an optional
				// space parameter, and returns a JSON text. The replacer can be a function
				// that can replace values, or an array of strings that will select the keys.
				// A default replacer method can be provided. Use of the space parameter can
				// produce text that is more easily readable.

				var i;
				gap = '';
				indent = '';

				// If the space parameter is a number, make an indent string containing that
				// many spaces.

				if (typeof space === 'number') {
					for (i = 0; i < space; i += 1) {
						indent += ' ';
					}

				// If the space parameter is a string, it will be used as the indent string.

				} else if (typeof space === 'string') {
					indent = space;
				}

				// If there is a replacer, it must be a function or an array.
				// Otherwise, throw an error.

				rep = replacer;
				if (replacer && typeof replacer !== 'function' &&
						(typeof replacer !== 'object' ||
						typeof replacer.length !== 'number')) {
					return 'JSON.stringify \u5bf9\u8c61\u65e0\u6cd5\u88ab\u8f6c\u4e3a\u004a\u0053\u004f\u004e\u5b57\u7b26\u4e32';
				}

				// Make a fake root object containing our value under the key of ''.
				// Return the result of stringifying the value.

				return str('', {'': value});
			};
		}


		// If the JSON object does not yet have a parse method, give it one.

		if (typeof JSON.parse !== 'function') {
			JSON.parse = function (text, reviver) {

				// The parse method takes a text and an optional reviver function, and returns
				// a JavaScript value if the text is a valid JSON text.

				var j;

				function walk(holder, key) {

					// The walk method is used to recursively walk the resulting structure so
					// that modifications can be made.

					var k, v, value = holder[key];
					if (value && typeof value === 'object') {
						for (k in value) {
							if (Object.prototype.hasOwnProperty.call(value, k)) {
								v = walk(value, k);
								if (v !== undefined) {
									value[k] = v;
								} else {
									delete value[k];
								}
							}
						}
					}
					return reviver.call(holder, key, value);
				}


				// Parsing happens in four stages. In the first stage, we replace certain
				// Unicode characters with escape sequences. JavaScript handles many characters
				// incorrectly, either silently deleting them, or treating them as line endings.

				text = String(text);
				cx.lastIndex = 0;
				if (cx.test(text)) {
					text = text.replace(cx, function (a) {
						return '\\u' +
							('0000' + a.charCodeAt(0).toString(16)).slice(-4);
					});
				}

				// In the second stage, we run the text against regular expressions that look
				// for non-JSON patterns. We are especially concerned with '()' and 'new'
				// because they can cause invocation, and '=' because it can cause mutation.
				// But just to be safe, we want to reject all unexpected forms.
				
				// We split the second stage into 4 regexp operations in order to work around
				// crippling inefficiencies in IE's and Safari's regexp engines. First we
				// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
				// replace all simple value tokens with ']' characters. Third, we delete all
				// open brackets that follow a colon or comma or that begin the text. Finally,
				// we look to see that the remaining characters are only whitespace or ']' or
				// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

				if (/^[\],:{}\s]*$/
						.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
							.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
							.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

					// In the third stage we use the eval function to compile the text into a
					// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
					// in JavaScript: it can begin a block or an object literal. We wrap the text
					// in parens to eliminate the ambiguity.


					if(text === '') {
						return text;
					}

					try{
						j = eval('(' + text + ')');
					}
					catch(e) {
						return text;
					}

					// In the optional fourth stage, we recursively walk the new structure, passing
					// each name/value pair to a reviver function for possible transformation.

					return typeof reviver === 'function'
						? walk({'': j}, '')
						: j;
				}

				// If the text is not JSON parseable, then a SyntaxError is thrown.

				throw new SyntaxError('JSON.parse');
				return text;
			};
		}
	}());

}

(function () {

	var buildJH = function () {





	(function () {

		"use strict";


		var root = window, $;

		//-----------------------------------------------------------------------
		// Array prototype extensions	  

		var $AP = Array.prototype;

		//-----------------------------------------------------------------------
		// Function.prototype extensions
		
		/**
		* Binds the function to a context and returns a wrapper function.
		* Practically it 'converts' a method to a function with remembering 
		* the context.
		* ECMAScript 5 Reference: 15.3.4.5
		* @param ctx {object} method's context
		* @returns {function} wrapped function
		* @example var flatFunction = obj.method.bind(obj);
		*/
		var __bind = function(ctx){
			if( typeof this !== 'function' )
				throw new TypeError( "'this' is not a function" );
			var fn = this, 
				args = $AP.slice.call(arguments,1);
				
			return function() {
				return fn.apply( ctx, args.concat($AP.slice.call(arguments)) );
			};
		};

		
		//-----------------------------------------------------------------------
		// String extensions
		
		/**
		* Trims left and right side of the string. Method removes spaces, tabulators
		* and new line characters.
		* Method implements probably the fastest algorithm of JavaScript trim operation
		* (see http://blog.stevenlevithan.com/archives/faster-trim-javascript)
		* ECMAScript 5 Reference: 15.5.4.20
		* @returns {string} trimmed string
		*/
		var __trim = function(){
			return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		};


		//-----------------------------------------------------------------------
		// Array extensions	
		
		/**
		*  ECMAScript 5 Reference: 15.4.3.2
		*  Tests if passed object is an Array
		*  @since 1.0.1, revision 9 (thanks to dudleyflanders)
		*  @param obj object to be tested
		*  @returns {boolean} true if input parameter is an object false in any other case
		*  @example Array.isArray([]) === true;
		*/
		var __isArray = function(obj) {
			return Object.prototype.toString.call(obj) === "[object Array]" || (obj instanceof Array);
		};	
		
		
		
		/**
		* ECMAScript 5 Reference: 15.4.4.14
		* According to specification Array.prototype.indexOf.length is 1
		* @param searchElement - 
		* @param fromIndex {number} - start index (optional)
		* @returns {number} index of found element or -1
		* @example ['a','b','c'].indexOf('b') === 1;
		*/
		var __indexOf = function(searchElement){
			var len = this.length,
				i = +arguments[1] || 0; // fromIndex
			
			if( len === 0 || isNaN(i) || i >= len )
				return -1;
			
			if( i < 0 ) {
				i = len + i;
				i < 0 && (i = 0);
			}
			
			for( ; i < len; ++i ) {
				if( __hasProperty(this, String(i)) && this[i] ===  searchElement )
					return i;
			}
			
			return -1;
		};

		
		/**
		* ECMAScript 5 Reference: 15.4.4.15
		* According to specification Array.prototype.lastIndexOf.length is 1
		* @param searchElement -
		* @param fromIndex {number} - start index (optional)
		* @returns {number} index of found element or -1
		* @example ['a','b','c'].lastIndexOf('b') === 1;
		*/
		var __lastIndexOf = function(searchElement){
			var len = this.length,
			i = +arguments[1] || len-1; // fromIndex
			
			if( len === 0 || isNaN(i) )
				return -1;
			
			if( i < 0 ) {
				i = len + i;
			} else if( i >= len ){
				i = len-1;
			}
			
			for( ; i >= 0; --i ) {
				if( __hasProperty(this, String(i)) && this[i] ===  searchElement )
					return i;
			}
			
			return -1;
		};
		

		/**
		* If given callback returns true for all elements of the array, the method
		* itself returns true as well; false otherwise. 
		* ECMAScript 5 Reference: 15.4.4.16
		* @param {function} callback a callback
		* @returns {boolean} true when callback returns true for all elements of 
		*			the array; false otherwise 
		* @throws {TypeError} when callback is not callable object
		* @see Array.prototype.some
		* @example var allEven = array.every(function(el){
		*			   return !(el & 1);
		*			});
		*/
		var __every = function(callback){
			if( !__isCallable(callback) )
				throw new TypeError( callback + " is not a callable object" );

			var thisArg = arguments[1]; 
			for(var i=0, len=this.length; i < len; ++i) {
				if( __hasProperty(this, String(i)) ) {
					if( !callback.call(thisArg, this[i], i, this) )
						return false;
				}
			}

			return true;
		};	
		
		
		/**
		* When callback returns true for at least one element of the array, then
		* the Array.prototype.some method returns true as well; false otherwise.
		* ECMAScript 5 Reference: 15.4.4.17
		* @param {function} callback a callback
		* @returns {boolean} true when the callback returns true for at least one
		*			array element
		* @throws {TypeError} when callback is not callable object
		* @see Array.prototype.every
		* @example var containsNull = array.some(function(el){ return el===null });
		*/
		var __some = function(callback){
			if( !__isCallable(callback) )
				throw new TypeError( callback + " is not a callable object" );

			var thisArg = arguments[1]; 
			for(var i=0, len=this.length; i < len; ++i) {
				if( __hasProperty(this, String(i)) ) {
					if( callback.call(thisArg, this[i], i, this) )
						return true;
				}
			}		
			
			return false;
		};
		

		/**
		* Invokes given callback function for each element of an array.
		* ECMAScript 5 Reference: 15.4.4.18
		* @param {function} callback a callback
		* @throws {TypeError} when callback is not callable object
		* @example [1,2,3].forEach(function(el){ console.log(el); });
		*/
		var __forEach = function(callback){
			if( !__isCallable(callback) )
				throw new TypeError( callback + " is not a callable object" );

			var thisArg = arguments[1]; 
			for(var i=0, len=this.length; i < len; ++i) {
				if( __hasProperty(this, String(i)) ) {
					callback.call(thisArg, this[i], i, this);
				}
			}		
		};


		/**
		* Invokes the callback for each element of an array and return the
		* array of callback results. The result array has the same length as 
		* input array.  
		* ECMAScript 5 Reference: 15.4.4.19
		* @param {function} callback a callback
		* @returns {Array} array of callback results
		* @throws {TypeError} when callback is not a callable object
		* @example var squares = [1,2,3].map(function(n){return n*n;});
		*/
		var __map = function(callback){
			if( !__isCallable(callback) )
				throw new TypeError( callback + " is not a callable object" );

			var thisArg = arguments[1],
				len = this.length,
				results = new Array(len);
			for(var i=0; i < len; ++i) {
				if( __hasProperty(this, String(i)) ) {
					results[i] = callback.call(thisArg, this[i], i, this);
				}
			}
			
			return results;
		};
		
		
		/**
		* Invokes callback for each element of an array (starting from first one)
		* and returns array of those elements for which the callback returned true.
		* ECMAScript 5 Reference: 15.4.4.20
		* @param {function} callback a callback
		* @return {Array} an array of results
		* @throws {TypeError} when callback is not callable object
		* @example var odds = [1,2,3,4].filter(function(n){return n & 1; });
		*/
		var __filter = function(callback){
			if( !__isCallable(callback) )
				throw new TypeError( callback + " is not a callable object" );

			var thisArg = arguments[1],
				len = this.length,
				results = [];
			for(var i=0; i < len; ++i) {
				if( __hasProperty(this, String(i)) ) {
					callback.call(thisArg, this[i], i, this) && results.push( this[i] );
				}
			}
			
			return results;
		};
		
		
		/**
		* Reduces an array to a single value. The callback is executed for each
		* element of an array starting from the first one. First argument of the
		* callback takes the result of previous callback invocation. For the first 
		* invocation either first element of an array is taken or the last (optional)
		* argument of the reduce method.
		* ECMAScript 5 Reference: 15.4.4.21
		* @param {function} callback a callback object
		* @returns {any} value of reduce algorithm; single value
		* @throws {TypeError} when callback is not a callable object
		* @see Array.prototype.reduceRight
		* @example var sum=[1,2,3].reduce(function(s,v){return s+v;}); 
		*/
		var __reduce = function(callback){
			if( !__isCallable(callback) )
				throw new TypeError( callback + " is not a callable object" );
			
			var len = this.length;
			if( len === 0 && arguments.length < 2 )
				throw new TypeError( "reduce of empty array with no initial value" );
			
			var initIdx = -1;
			if( arguments.length < 2 ) {
				if( (initIdx = __firstIndex(this)) === -1 )
					throw new TypeError( "reduce of empty array with no initial value" );			
			}
			
			var val = arguments.length > 1 ? arguments[1] : this[initIdx];
			
			for(var i=initIdx+1; i < len; ++i) {
				if( __hasProperty(this, String(i)) ) {
					val = callback(val, this[i], i, this);
				}
			}
			
			return val;
		};	
		
		
		/**
		* Works like Array.prototype.reduce, but starts from the end of an array.
		* ECMAScript 5 Reference: 15.4.4.22
		* @param {callable} callback function
		* @returns {any} value of reduce; single value
		* @throws {TypeError} when callback is not a callable object
		* @see Array.prototype.reduce
		* @example [10,20,30].reduceRight(function(a,b){return a-b;}) === 0
		*/
		var __reduceRight = function(callback){
			if( !__isCallable(callback) )
				throw new TypeError( callback + " is not a callable object" );
			
			var len = this.length;
			if( len === 0 && arguments.length < 2 )
				throw new TypeError( "reduce of empty array with no initial value" );
			
			var initIdx = len;
			if( arguments.length < 2 ) {
				for( var k=len-1; k >=0; --k ) {
					if( __hasProperty(this, String(k)) ) {
						initIdx = k;
						break;
					}
				}
				if( initIdx === len )
					throw new TypeError( "reduce of empty array with no initial value" );			
			}		
			
			var val = arguments.length > 1 ? arguments[1] : this[initIdx];
			
			for(var i=initIdx-1; i >= 0; --i) {
				if( __hasProperty(this, String(i)) ) {
					val = callback(val, this[i], i, this);
				}
			}
			
			return val;
		};		
		

		var forInAct = function (obj, fnF, bOwn, oContent) {
			oContent = oContent || obj;
			var i, l, bRF, err;
			if(!obj) {
				return false;
			}
			if(Object.prototype.toString.call(fnF) !== '[object Function]') {
				err = new Error('第二参数不为函数。');
				err.message += err.stack;
				throw err;
			}
			for (i in obj) {
				if(bOwn && !obj.hasOwnProperty(i)) {
					continue;
				}
				bRF = fnF.call(oContent, obj[i], i);
				if(bRF !== undefined) {
					return bRF;
				}
			}
		};
		
		/**
		* Returns first valid index of an array
		* @private
		*/
		var __firstIndex = function(arr) {
			for( var k=0, len=arr.length; k < len; ++k ) {
				if( arr.hasOwnProperty(String(k)) ) {
					return k;
				}
			}	
			return -1;
		};

		/**
		* Implementation of IsCallable internal ECMAScript function.
			* ECMAScript 5 reference: 9.11
			* @private
			* @param {object} obj An object to examine
			* @returns {boolean} true if object is callable false otherwise
			*/
		var __isCallable = (function() { 
		
			//var __sortCase = (function(){
				//try {
					//[].sort('abc');
					//return false;
				//} catch(ex) {
					//return true;
				//}
			//})();
			
			return function(obj) {
				if( typeof obj === 'function' )
					return true;
				if( typeof obj !== 'object' ) 
					return false;
				if( obj instanceof Function || obj instanceof RegExp )
					return true;
				//if( __sortCase ) {
					//try {
						//[].sort(obj);
						//return true;
					//} catch(ex){ /* nothing to do */ }
				//}
				return false;
			};
		})();



		/**
		* Implementation of [[HasProperty]] internal ECMAScript function.
			* Returns a Boolean value indicating whether the object already has a property with the given name.
			* ECMAScript 5 reference: 8.12.6
			* @private
			* @param {object} obj An object to examine
			* @param {property} property name
			* @returns {boolean} true if object is callable false otherwise
			*/
		var __hasProperty = function (obj, sProperty) {
			if(obj === null && obj === undefined) {
				return false;
			}
			if(obj[sProperty] !== undefined) {
				return true;
			}
			var i;
			for (i in obj) {
				if(i === sProperty) {
					return true;
				}
			}
			return false;
		};


		JH = $ = {
			"__ver_" : '4.0.0.1',
			/**
			* 继承一个对象 
				* @author gaoyuan
				* 
				* @return {object} 一个新对象
				* 
				* @param obj {object} 要继承的对象
				* @param property {object} 向新对象绑定属性
				* @example 
				<pre>
					var o = {
						a : {}
					};
					var oo = JH.extendObj(o, {
						b : 333
					});
					alert(oo.a === o.a); // true
					alert(oo.b === 333); // true
				</pre>
				*/
			"extendObj" : function (obj, property) {
				var c = function () {};
				c.prototype = obj;
				var o = new c();
				//o.constructor = c;
				if(property) {
					$.mergePropertyFrom(o, property);
				}
				return o;
			},

			"bind" : function (fn) {
				var args = $AP.slice.call(arguments, 1);
				return __bind.apply(fn, args);
			},
			"trim" : function (str) {
				return __trim.call(str);
			},
			"isArray" : function (obj) {
				return __isArray(obj);
			},
			"indexOf" : function (obj, searchElement) {
				return __indexOf.call(obj, searchElement);
			},
			"lastIndexOf" : function (obj, searchElement) {
				return __lastIndexOf.call(obj, searchElement);
			},
			"every" : function (obj, callback) {
				return __every.call(obj, callback);
			},
			"some" : function (obj, callback) {
				return __some.call(obj, callback);
			},
			"forEach" : function (obj, callback) {
				return __forEach.call(obj, callback);
			},
			"map" : function (obj, callback) {
				return __map.call(obj, callback);
			},
			"filter" : function (obj, callback) {
				return __filter.call(obj, callback);
			},
			"reduce" : function (obj, callback) {
				return __reduce.call(obj, callback);
			},
			"reduceRight" : function (obj, callback) {
				return __reduceRight.call(obj, callback);
			},


			/**
			* 合并对象属性 
				* @author gaoyuan
				* 
				* @return {object} 合并后的targetObj原对象
				* 
				* @param targetObj {object} 将 srcObj 属性合到 targetObj 里
				* @param srcObj {object} 
				* @param getPrototypeProperty {boolean} 是否合并srcObj原型链上的属性，默认为false
				* @example 
				<pre>
					var a = {};
					a.aa = {};
					var o = {};
					var oo = JH.mergePropertyFrom(o, a);
					alert(oo.aa === a.aa);
				</pre>
				*/
			"mergePropertyFrom" : function(targetObj, srcObj, getPrototypeProperty) {//debugger;
				var i;
				for (i in srcObj) {
					if(getPrototypeProperty || srcObj.hasOwnProperty(i)) {
						targetObj[i] = srcObj[i];
					}
				}
				return targetObj;
			},



			/**
			* 遍历对象 
				* @author gaoyuan
				* 
				* @name forIn
				* @param array {Array} 要遍历的数组
				* @param function {Function} 遍历时执行的操作函数
				* @param boolean 是否只遍历自有属性
				* @example 
				<pre>

					JH.forIn(a, function (oE) {
						b.push(oE+1)
					});


					JH.forIn(a, function (oE, i) {
						a[i] = oE+1;
					});

				</pre>
				*/
			"forIn" : function (obj, fnF, thisArg) {
				return forInAct(obj, fnF, false, thisArg);
			},

			"forInOwn" : function (obj, fnF, thisArg) {
				return forInAct(obj, fnF, true, thisArg);
			},
			"forEachIn" : function (obj, fnF, thisArg) {
				if(0 in obj && 'length' in obj) {
					$.forEach(obj, fnF, thisArg);
				}else{
					return JH.forIn(obj, fnF, thisArg);
				}
			},
			"throwLine" : function (sMsg, noThrow) {
				var err;
				err = new Error(sMsg);
				var sErrMsg = err.message;
				if(err.stack) {
					err.message += (err.stack.toString()).replace(sErrMsg, '');
				}
				if(!noThrow) {
					throw err;
				}
				return {
					log : err.message,
					message : sErrMsg,
					toString : function () {
						return err.message;
					}
				};
			},


			/**
			* 按w3c方式注册事件 
				* @author gaoyuan
				* 
				* @return {Function} 注册到事件监听的函数引用
				* 
				* @param obj {htmlElement} 注册事件的元素
				* @param type {String} 事件名称  注意：没有“on”前缀  正确写法为 ‘click’，‘mouseout’
				* @param fn {Function} 事件要响应的函数
				* 
				* @example 
				<pre>
				//给id为‘button1’的元素添加一个click事件监听，事件触发时输出元素的id值
				var fff = JH.addEvent(JH.$('#button1'),'click',function () {
					alert('我的id值为'+this.id);
				});

				//注销掉‘button1’的click事件响应的fff函数
				//JH.removeEvent(JH.$('#button1'),'click',fff);
				</pre>
				*/
			"addEvent" : function(obj, type, fn){
				if(obj.addEventListener){
					obj.addEventListener(type,fn,false);
				}else if(obj.attachEvent) {
					obj[type+fn] = function () {
						return fn.call(obj, root.event);
					};
					obj.attachEvent('on'+type,obj[type+fn]);
				}
				return fn;
			},

			"actOnce" : (function () {
				var _fun = function (fGo, sUUID) {
					if(sUUID ? !_fun.oIdList[sUUID] : !fGo.__hasRun_) {
						fGo();
						fGo.__hasRun_ = _fun.oIdList[sUUID] = true;
					}
				};
				_fun.oIdList = {};

				return _fun;
			}()),
			
			"fixEvent" : function (evt,o) {
				var ow = o || window;
				var e = evt || ow.event;
				if(!e) {
					return evt;
				}
				if(!e.target) {e.target = e.srcElement;}
				if(!e.relatedTarget) {e.relatedTarget = e.toElement;}
				if(!e.layerX) {e.layerX = e.offsetX;}
				if(!e.layerY) {e.layerY = e.offsetY;}
				if(!e.pageX) {
					e.pageX = e.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
				}
				if(!e.pageY) {
					e.pageY = e.clientY + document.documentElement.scrollTop + document.body.scrollTop;
				}
				if(!e.offsetX) {e.offsetX = e.pageX - IZZ.fnGetOffsetInDoc(e.target).left;}
				if(!e.offsetY) {e.offsetY = e.pageY - IZZ.fnGetOffsetInDoc(e.target).top;}
				if(!e.which) {
					switch(e.button) {
						case 1:e.which = 1;break;
						case 4:e.which = 2;break;
						case 2:e.which = 3;break;
					}
				}
				e.key = e.keyCode?e.keyCode:e.which;

				if(!e.preventDefault) {
					/**@inner*/
					e.preventDefault =function () {return false;};
				}
				if(!e.stopPropagation && e.cancelBubble) {
					e.stopPropagation = /**@ignore*/ function () {this.cancelBubble = true;};
				}
				return e;
			},


			/**
			* 按w3c方式注销事件 
				* @author gaoyuan
				* 
				* @param obj {htmlElement} 注销事件的元素
				* @param type {String} 事件名称
				* @param fn {Function} 事件要注销的函数
				* 
				* @example 
				<pre>
				//给id为‘button1’的元素添加一个click事件监听，事件触发时输出元素的id值
				var fff = JH.addEvent(JH.$('#button1'),'click',function () {
					alert('我的id值为'+this.id);
				});

				//注销掉‘button1’的click事件响应的fff函数
				//JH.removeEvent(JH.$('#button1'),'click',fff);
				</pre>
				*/
			"removeEvent" : function (obj, type, fn){
				if(obj.removeEventListener){
					if(fn !== null){
						obj.removeEventListener(type, fn, false);
					}
				}else if(obj.detachEvent) {
					if(obj[type+fn]) {
						obj.detachEvent('on'+type, obj[type+fn]);
						obj[type+fn] = null;
						//delete obj[type+fn];
					}
				}
				return obj;
			},

			"e" : function (s) {
				if(!s) {
					return null;
				}
				if(s.slice(0,1) !== '#') {
					return $.throwLine('如果选择元素ID必须用#开头。');
				}
				return root.document.getElementById( s.slice(1));
			},

			"setTo" : function (oValue, sPath, oRoot) {
				var pack, current = oRoot;
				var aPath = $.str.parseJsonPath(sPath);
				while(aPath.length) {
					pack = aPath.shift();
					if(aPath.length) {
						current[pack] = current[pack] || {};
						current = current[pack];
					}else{
						current[pack] = oValue;
					}
				}
				
			},

			"getFrom" : function (sPath, oRoot) {
				oRoot = oRoot || root;
				var mod;
				var aPath = $.str.parseJsonPath(sPath);
				mod = oRoot[aPath.shift()];
				while(mod && aPath.length) {
					mod = mod[aPath.shift()];
				}
				return mod;
			},
			"typeOf" : function (o) {
				return Object.prototype.toString.call(o);
			},
			//"isArray" : function (o) {
				//return $.typeOf(o) === '[object Array]';
			//},
			"isString" : function (o) {
				return $.typeOf(o) === '[object String]';
			},
			"isNumber" : function (o) {
				return $.typeOf(o) === '[object Number]';
			},
			"isFunction" : function (o) {
				return $.typeOf(o) === '[object Function]';
			},
			"goTest" : function (fn, l) {
				l = l || 1;
				var tS = new Date();
				var i;
				for(i=0; i<l; i++) {
					fn();
				}
				var tE = new Date();
				return tE - tS;
				
			},

			/**
				引入ECMAScript-5的新方法到原型: 

				Function.prototype:
					bind

				String.prototype:
					trim

				Array.prototype:
					indexOf
					lastIndexOf
					every
					some
					forEach
					map
					filter
					reduce
					reduceRight
			*/
			"prototypeForES5" : function () {
				var assignment = function (target, name, fn) {
					if(!target[name]) {
						target[name] = fn;
					}
				};

				assignment($AP, 'indexOf', __indexOf);
				assignment($AP, 'lastIndexOf', __lastIndexOf);
				assignment($AP, 'every', __every);
				assignment($AP, 'some', __some);
				assignment($AP, 'forEach', __forEach);
				assignment($AP, 'map', __map);
				assignment($AP, 'filter', __filter);
				assignment($AP, 'reduce', __reduce);
				assignment($AP, 'reduceRight', __reduceRight);
				assignment(Array, 'isArray', __isArray);
				assignment(Function.prototype, 'bind', __bind);
				assignment(String.prototype, 'trim', __trim);
			}

		};



		/**
		* 接口消息标准
		* @author gaoyuan
		* 
		* @return {object} 消息对象
		* 
		* @param id {string} 接口id，标示接口代码段位置的唯一uuid
		* @param code {number} 状态码， 大于0为成功，小于0为失败
		* @param msg {string} 消息说明简报
		* @param data {object} 接口返回的数据
		* @param prev {oApiMsg / array of oApiMsg} 消息栈
		* @example 
		<pre>
			var o = JH.apiMsg('afde912e-5e59-1e85-5b11-3c420d97af83');
			JH.apiMsg(o, 9, 'nani', 'goodData');
			var oR = JH.apiMsg('bd048520-061a-b03f-324e-cc29cfe739fe', 2, 'hehe', 'gege');
			oR.prev = o;
			var oR2 = JH.apiMsg('95d926a4-99bf-6ec1-4255-e2a525b72864', 3, 'haha', 'woo'); 
			var oRR = JH.apiMsg('2c07701b-1061-f751-5f69-66c540bd1543', 1, 'ok', 'data', [oR, oR2]);
			
			var_dump(JH.apiMsg.dump(oRR));

			JH.apiMsg.ignoreId();
			JH.apiMsg.ignoreNum();
			JH.apiMsg.debug = true;
			JH.apiMsg.debugCallback = function (oR) {
				var aLog = JH.apiMsg.dump(oR.prev);
				var_dump(aLog);
			};
		</pre>
		*/
		$["apiMsg"] = (function () {
			var iDumpTimes = 0;
			var _fun = {}['JH.apiMsg'] = function (id, code, msg, data, prev) {
				var oR;
				if(id && id.id) {//如果传入的是一个oApiMsg对象
					oR = id;
					id = oR.id;
				}else{
					oR = {};
				}
				oR.id = id || $.throwLine('apiMsg id 不能为空');
				oR.code = code || 0;
				oR.code = parseInt(oR.code, 10);
				oR.msg = msg || '';
				oR.data = data || null;

				if(prev) {
					oR.prev = prev;
				}
				if(oR.code < 0) {//debugger;
					_fun.number++;
					if(_fun.debug && !_fun.isIgnoreId(id) && !_fun.isIgnoreNum(_fun.number)) {
						_fun.debugCallback(oR);
						$.throwLine(_fun.number+'#'+id + '(code '+oR.code+'): ' + msg);
					}else{
						try{
							throw new Error('@');
						}catch(e) {
							oR.stack = e.stack;
						}
					}
				}
				return oR;
			};

			return $.mergePropertyFrom(_fun, {
				"number" : 0,
				"debugCallback" : function () {},
				"debug" : false,
				"dump" : function (oMsg, iDumpStartTimes) {
					var aPrev = [];
					if(!oMsg) {
						return aPrev;
					}
					if(!iDumpStartTimes) {
						iDumpTimes = 0;
					}
					if(iDumpTimes > 1000) {
						$.throwLine('apiMsg.dump 递归过多');//todo 递归判断严重缺陷
					}
					iDumpTimes++;
					var l = 0;
					var oPrev = oMsg;
					while(oPrev) {l++;if(l>1000) {alert('while dump too mach!');break;}
						//debugger;
						if($.isArray(oPrev)) {
							JH.forEach(oPrev, function (o) {
								var aT = $.apiMsg.dump(o, iDumpTimes);
								aPrev = aPrev.concat(aT);
							});
						}else{
							aPrev.push(['{'+oPrev.id+'}', oPrev.code, oPrev.msg, oPrev.data, oPrev.stack]);
						}
						oPrev = oPrev.prev;
					}

					return aPrev;
					//var_dump(this);
				},
				"ignoreId" : function (a) {
					if(!$.isArray(a)) {
						a = [a];
					}
					$.forEach(a, function (s) {
						_fun.ignoreId[s] = true;
					});
				},
				"ignoreNum" : function (a) {
					var arg = [];
					if(arguments.length > 1) {
						$.forEach(arguments, function (o) {
							arg.push(o);
						});
						a = arg;
					}
					if(!$.isArray(a)) {
						a = [a];
					}
					$.forEach(a, function (i) {
						_fun.ignoreNum[i] = true;
					});
				},
				"isIgnoreId" : function (sId) {
					return sId in _fun.ignoreId;
				},
				"isIgnoreNum" : function (iNum) {
					return iNum in _fun.ignoreNum;
				}
			});
		}());
		


	}());



	return JH;

	};

	var JH = buildJH();
/**
 * var_dump-js v2.0.1 - A JavaScript kit to output var in page.
 *
 * https://github.com/purplestone/var_dump-js
 *
 * Copyright 2014
 * Released under the MIT license.
 */

;(function () {
	var typeOf = function (o) {
		return Object.prototype.toString.call(o);
	};
	var mergePropertyFrom = function(targetObj, srcObj, getPrototypeProperty) {
		var i;
		for (i in srcObj) {
			if(getPrototypeProperty || srcObj.hasOwnProperty(i)) {
				targetObj[i] = srcObj[i];
			}
		}
		return targetObj;
	};
	var isArray = function (obj) {
		return typeOf(obj) === '[object Array]' || (obj instanceof Array);
	};
	var isString = function (o) {
		return typeOf(o) === '[object String]';
	};
	var o = {
		"print_r" : (function () {

			var _fun = {}['print_r'] = function (sValueOut, bHtml, iStack) {
				var ooTT, eT;
				if(_fun.bp){
					return;
				}
				var eDebugDiv = document.getElementById('DebugDiv');
				if(!eDebugDiv) {
					var dd=document.createElement('div');
					dd.id='DebugDiv';
					dd.innerHTML='<div style="color:#000;padding:4px 6px;"><input type="button" class="btn" onclick="print_r.clear();" value="Clear" /> '+
						'<input type="button" class="btn" onclick="print_r.hidden(this);" value="Hidden" /> '+
						'<input type="button" class="btn" onclick="print_r.stop(this);" value="Stop" /></div>'+
						'<div id="Debug_box" style="-float:left;"></div>';
					dd.style.position='absolute';
					dd.style.zIndex='32767';
					dd.style.right='0';
					try{
						dd.style.maxWidth='700px';
						dd.style.wordWrap='break-word';
					}catch(e) {}
					dd.style.top='0';
					dd.style.fontSize='16px';
					dd.style.color='#fff';
					dd.style.backgroundColor='#000';
					document.body.insertBefore(dd,document.body.firstChild);
					var db=document.getElementById('Debug_box');
					db.style.padding='20px';
					db.style.position='relative';
					dd.style.position='fixed';
					db.style.maxHeight='420px';
					db.style.overflow='auto';
					if(document.all && !window.XMLHttpRequest){
						ooTT = new (_fun.fb)(dd,50);
					}
					_fun.db = db;
					_fun.dd = dd;
				}
				_fun.dd.style.display = 'block';
				var oV = document.createElement('span');
				if(sValueOut+'' === '[object Object]') {
					sValueOut = typeOf(sValueOut);
				}
				if(bHtml){
					oV.innerHTML = '<b style="color:#ff9;">'+(++_fun.it)+'</b> : '+sValueOut;
				}else{
					eT = document.createElement('b');
					eT.innerHTML = ++_fun.it;
					eT.style.color = '#ff9';
					oV.appendChild(eT);
					oV.appendChild(document.createTextNode(' : '+sValueOut));
				}
				var sStack = '';
				try{
					var err = new Error('var_dump_js track line');
					sStack = err.stack;
					iStack = iStack || 1;
					var aStack = sStack.split('\n').map(function (s) {
						return s.trim();
					}).filter(function (s) {
						return /^(@|at)/.test(s);
					});
					if(aStack[0].indexOf('@') === 0 && iStack > 1) {
						iStack--;
					}
					sStack = aStack.slice(iStack, iStack+1);
					oV.title = sStack;
					throw err;
				}catch(e) {
					
				}
				_fun.db.appendChild(oV);
				_fun.db.appendChild(document.createElement('br'));
				_fun.db.scrollTop = _fun.db.scrollHeight;


			};

			return mergePropertyFrom(_fun, {
				it : 0,
				bp : false,
				gs : function(e,s){
					if(e.style[s]){
						return e.style[s];
					}
					else if(e.currentStyle){
						return e.currentStyle[s];
					}
					else if(document.defaultView&&document.defaultView.getComputedStyle){
						s=s.replace(/([A-Z])/g,"-$1");
						s=s.toLowerCase();
						var ss=document.defaultView.getComputedStyle(e,"");
						return ss&&ss.getPropertyValue(ss);
					}
					else{
						return null;
					}
				},
				fb : function(e,is){
					var iTop;
					is = is || 40;
					if(typeof(e) === 'string'){
						e=document.getElementById(e);
					}
					e.style.position='absolute';
					if(!isNaN(parseInt(_fun.gs(e,'top'), 10))){
						iTop=parseInt(_fun.gs(e,'top'), 10);
						_fun.fnInterval=setInterval(function(){
							if(e!==null){
								e.style.top=document.documentElement.scrollTop+iTop+'px';
							}
						}, is);
					}else{
						if(isNaN(parseInt(_fun.gs(e,'bottom'), 10))){
							iTop=0;
							_fun.fnInterval=setInterval(function(){
								if(e!==null){
									e.style.top=document.documentElement.scrollTop+iTop+'px';
								}
							}, is);
						}else{
							var iBottom=parseInt(_fun.gs(e,'bottom'), 10);
							_fun.fnInterval=setInterval(function() {
								if(e!==null){
									e.style.top=document.documentElement.scrollTop+document.documentElement.clientHeight-iBottom-e.offsetHeight+'px';
								}
							}, is);
						}
					}
				},
				clear : function (){
					_fun.it=0;
					_fun.db.innerHTML='';
					document.getElementById('DebugDiv').style.display = 'none';
				},
				hidden : function (e){
					if(_fun.db.style.display === 'none'){
						e.value = 'Hidden';
						_fun.db.style.display = '';
					}
					else{
						e.value = 'Show';
						_fun.db.style.display = 'none';
					}
				},
				stop : function (e){
					if(_fun.bp){
						e.value = 'Stop';
						_fun.bp = false;
					}
					else{
						e.value = 'Start';
						_fun.bp = true;
					}
				}

			});

		}()),
		"var_dump" : (function () {
			var _fun = {}['var_dump'] = function (o, fn) {
				var s = '<span style="color:#ff9;">&lt;'+typeOf(o)+'&gt;</span>'+(isArray(o) ? '' : o), i;
				var sL = '<b style="color:#2dd;">', sR = '</b>';
				if(!isString(o)) {
					s += '<br />';
					for (i in o) {
						if(o[i] && o[i].toString() !== undefined && o[i].toString() !== null) {
							s += sL+i+sR +' : '+(o[i].toString()).replace(/</g, '&lt;');
						}else{
							s += sL+i+sR+' : '+(o[i]);
						}
						
						s += '<br />';
					}
				}

				if(!fn) {
					_fun.alert(s);
				}else{
					fn(s);
				}

			};

			return mergePropertyFrom(_fun, {
				'alert': function (s) {
					if(window.print_r) {
						print_r(s, true, 3);
					}else{
						alert(s);
					}
				}
			});

		}())
	};

	if(!window.var_dump) {

		window.print_r = o.print_r;
		window.var_dump = o.var_dump;

	}

	
}());



	if(!this.define) {
		window.JH = JH;
	}else{
		define([],function () {return JH;});
	}


})();




