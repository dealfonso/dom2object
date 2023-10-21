"use strict";

/**
 * Builds a Proxy for the given DOM element, so that it can be accessed as an object, but if each of the HTML elements has an id, it can be accessed by that id.
 *      e.g.
 *              <form id="myForm">
 *                  <input type="text" name="myInput1">
 *                  <input type="text" name="myInput2">
 *              </form>, 
 * 
 *          using: x = DOMToObject("#myForm");
 * 
 *              then the inputs could be accessed as x.myInput1 and x.myInput2
 * 
 * @param {HTMLElement|String} el, the DOM element to be converted to an object or the selector for the element (only the first one will be used)
 * @param {boolean} acquireChildrenFromAnonymous, if true, the children from the anonymous elements will be acquired and added to its parent
 * @returns {Proxy|HTMLElement} the proxy object or the element itself if it has no children
 */
function DOMToObject(el, acquireChildrenFromAnonymous = false) {
    // If it is a string, we'll assume it is a selector, and we'll get the element from the DOM
    if (typeof el === 'string') {
        el = document.querySelector(el);
    }

    // If the element has no children, we'll return the element itself (it does not need further processing)
    if (el.children !== undefined) {
        if (el.children.length === undefined || el.children.length == 0) {
            return el;
        }
    }

    const isAnonymous = (el) => (el.id === undefined || el.id == '' || el.id === null) && (el.name === undefined || el.name == '' || el.name === null);
    const empty = (x) => (x === undefined || x == '' || x === null);

    // The child objects 
    let _childObjects = {};

    /**
     * Acquires the children from the DOM element, and adds them to the object
     * @param {Proxy} proxy, the proxy object that holds the objects
     */
    function acquireChildren(proxy) {
        // Clear the object
        _childObjects = {};

        // We are deferring the acquisition of the children from the anonymous elements, because we want to acquire the children from the named elements first
        let anonymousElements = [];

        // Acquire the children from the named elements, and add them to the object
        for (let element of Array.from(el.children)) {
            if (! isAnonymous(element)) {
                if (!empty(element.id)) {
                    if (element.id in _childObjects) {
                        console.warn(`element already has a property named ${element.id}`);
                    } else {
                        _childObjects[element.id] = DOMToObject(element, acquireChildrenFromAnonymous);
                    }
                }
                if ((!empty(element.name)) && (element.name !== element.id)) {
                    if (element.name in _childObjects) {
                        console.warn(`element already has a property named ${element.name}`);
                    } else {
                        _childObjects[element.name] = DOMToObject(element, acquireChildrenFromAnonymous);
                    }
                }
            }
            else {
                if (acquireChildrenFromAnonymous) {
                    anonymousElements.push(element);
                }
            }
        }

        // Acquire the children from the anonymous elements, and add them to the object
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

        // Now reassign the children to the proxy object
        proxy._el = el;
        proxy._children = Object.fromEntries(Object.entries(_childObjects).map(([k, v]) => [k, v._el]));
        proxy._childrenNames = Object.keys(_childObjects);
    }

    // Build the proxy object
    var proxy = new Proxy(el, {
        get: function(target, name) {
            // If it is a named object, return it
            if (name in _childObjects) {
                return _childObjects[name];
            }
            // If not, return the property of the element
            if (typeof target[name] === 'function') {
                return target[name].bind(target);
            }
            return target[name];
        },
        set: function(target, name, value) {
            if (name in _childObjects) {
                _childObjects[name] = value;
            } else {
                target[name] = value;

                // If it is not a property from the proxy, we'll need to reevaluate the children, because the DOM may change
                if (! proxy.hasOwnProperty(name)) {
                    acquireChildren(proxy);
                }
            }
            return true;
        }
    });    

    // Acquire the children for the first time and return the proxy object
    acquireChildren(proxy);
    return proxy;
}

/**
 * Builds proxies for the given DOM elements, so that they can be accessed as objects, but if each of the HTML elements has an id, it can be accessed by that id.
 *     e.g.
 *              <div class="item"><input type="text" name="myInput1"></div>,
 *              <div class="item"><input type="text" name="myInput2"></div>,
 * 
 *          using:  x = DOMToObject.multiple(".item");
 * 
 *          the inputs could be accessed as x[0].myInput1 and x[1].myInput2
 * 
 * @param {HTMLElement[]|String[]|String} els, the DOM elements to be converted to an object, or a selector
 * @param {boolean} acquireChildrenFromAnonymous, if true, the children from the anonymous elements will be acquired and added to its parent
 * @returns {Proxy[]} the proxy objects
 */
 DOMToObject.multiple = function(els, acquireChildrenFromAnonymous = false) {
    if (typeof els === "string") {
        els = document.querySelectorAll(els);
    }

    let objects = [];
    for (let el of els) {
        if (typeof el === "string") {
            objects = [ ...objects, ...DOMToObject.multiple(el, acquireChildrenFromAnonymous) ]
        } else {
            objects.push(DOMToObject(el, acquireChildrenFromAnonymous));
        }
    }
    return objects;
}

// The version for the library
DOMToObject.version = "0.9.0";

// Export to the window object
window.DOM2Object = DOMToObject;