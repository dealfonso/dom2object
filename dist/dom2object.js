/**
    MIT License

    Copyright 2023 Carlos A. (https://github.com/dealfonso)

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/

(function (exports) {
	"use strict";

	function DOMToObject(el, acquireChildrenFromAnonymous = false) {
		if (typeof el === "string") {
			el = document.querySelector(el);
		}
		if (el.children !== undefined) {
			if (el.children.length === undefined || el.children.length == 0) {
				return el;
			}
		}
		const isAnonymous = el => (el.id === undefined || el.id == "" || el.id === null) && (el.name === undefined || el.name == "" || el.name === null);
		const empty = x => x === undefined || x == "" || x === null;
		let _childObjects = {};

		function acquireChildren(proxy) {
			_childObjects = {};
			let anonymousElements = [];
			for (let element of Array.from(el.children)) {
				if (!isAnonymous(element)) {
					if (!empty(element.id)) {
						if (element.id in _childObjects) {
							console.warn(`element already has a property named ${element.id}`);
						} else {
							_childObjects[element.id] = DOMToObject(element, acquireChildrenFromAnonymous);
						}
					}
					if (!empty(element.name) && element.name !== element.id) {
						if (element.name in _childObjects) {
							console.warn(`element already has a property named ${element.name}`);
						} else {
							_childObjects[element.name] = DOMToObject(element, acquireChildrenFromAnonymous);
						}
					}
				} else {
					if (acquireChildrenFromAnonymous) {
						anonymousElements.push(element);
					}
				}
			}
			if (acquireChildrenFromAnonymous) {
				for (let element of anonymousElements) {
					if (element.children.length > 0) {
						let x = DOMToObject(element, true);
						for (let childName of x._childrenNames) {
							if (childName in _childObjects) {
								console.warn(`element already has a property named ${childName}`);
								continue;
							}
							_childObjects[childName] = x[childName];
						}
					}
				}
			}
			proxy._el = el;
			proxy._children = Object.fromEntries(Object.entries(_childObjects).map(([k, v]) => [k, v._el]));
			proxy._childrenNames = Object.keys(_childObjects);
		}
		var proxy = new Proxy(el, {
			get: function (target, name) {
				if (name in _childObjects) {
					return _childObjects[name];
				}
				if (typeof target[name] === "function") {
					return target[name].bind(target);
				}
				return target[name];
			},
			set: function (target, name, value) {
				if (name in _childObjects) {
					_childObjects[name] = value;
				} else {
					target[name] = value;
					if (!proxy.hasOwnProperty(name)) {
						acquireChildren(proxy);
					}
				}
				return true;
			}
		});
		acquireChildren(proxy);
		return proxy;
	}
	DOMToObject.multiple = function (els, acquireChildrenFromAnonymous = false) {
		if (typeof els === "string") {
			els = document.querySelectorAll(els);
		}
		let objects = [];
		for (let el of els) {
			if (typeof el === "string") {
				objects = [...objects, ...DOMToObject.multiple(el, acquireChildrenFromAnonymous)];
			} else {
				objects.push(DOMToObject(el, acquireChildrenFromAnonymous));
			}
		}
		return objects;
	};
	DOMToObject.version = "0.9.0";
	window.DOM2Object = DOMToObject;
})(window);
