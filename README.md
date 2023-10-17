# DOM2Object

This library converts a DOM tree to an object so that its named properties can be accessed using dot notation.

**Example**

```html
<div id="mydata">
    <input type="text" name="username" value="johndoe" />
    <input type="password" name="password" value="secret" />
    <button id="mybutton">Click me!</button>
</div>
```

```javascript
var data = DOM2Object("#mydata");
data.mybutton.onclick = function() {
    console.log(`Button clicked! ${data.username.value}:${data.password.value}`);
};
```

In this example, the `data` object can be seen somehow as the following object:

```javascript
data = {
    username: HTMLElement { ... },
    password: HTMLElement { ... },
    mybutton: HTMLElement { ... }
}
```

But `data` itself keeps the original attributes and methods of the DOM elements. So you can still get access to `data.children` or `data.innerHTML` attributes, or `data.onclick` event handlers, for example.

## Setup

### Serving from your servers

You can clone this repo and copy the main file into the appropriate folder, to serve using your server:

```console
$ git clone
$ cp dom2object/dist/dom2object.js /path/to/my/html/folder
```

### Using a CDN

You can use this library directly from jsdelivr CDN

```html
<script src="https://cdn.jsdelivr.net/gh/dealfonso/dom2object/dist/dom2object.js"></script>
```

## Use cases

### Basic use case

In an HTML fragment like the next one:

```html
<div id="mydata">
    <input type="text" name="username" value="johndoe" />
    <input type="password" name="password" value="secret" />
    <button id="mybutton">Click me!</button>
</div>
```

We can use `DOM2Object` to get an object with the DOM tree as properties:

```javascript
var data = DOM2Object("#mydata");
data.mybutton.onclick = function() {
    alert(`Button clicked! ${data.username.value}:${data.password.value}`);
};
```

In this case, we gained access to the button with id `mybutton` as a property of the `data` object. Have in mind that we are getting access to the raw HTMLElement, So we can access its `onclick` event handler and assign a new function to it.

Then we can use the `data` object to access the other elements in the DOM tree, like the `username` and `password` inputs. But, as they are also _HTMLElements_, we can access their attributes and methods (in the example, we are getting `value`).

The expression is equivalent to the following one:

```javascript
var data = {
    username: document.querySelector("#mydata input[name='username']"),
    password: document.querySelector("#mydata input[name='password']"),
    mybutton: document.querySelector("#mydata button[id='mybutton']")
};
```

But we also keep access to the root object's attributes and methods, like `data.children` or `data.innerHTML`.

### Nested objects

In case of nested objects, the library will create a new object for each named child. For example, in the following HTML fragment:

```html
<div id="mydata2">
  <div id="mainData">
    <input type="text" name="name" value="John">
    <input type="text" name="surname" value="Doe">
  </div>
  <div id="userData">
    <input type="text" name="username" value="johndoe">
    <input type="password" name="password" value="secret">
  </div>
  <button id="mybutton">Click me!</button>
</div>
```

If we execute `data = DOM2Object("#mydata2")` we will get an object with an structure like the next one (but keeping the access to the attributes and methods of `data`):

```javascript
data = {
    mainData: {
        name: HTMLElement { ... },
        surname: HTMLElement { ... }
    },
    userData: {
        username: HTMLElement { ... },
        password: HTMLElement { ... }
    },
    mybutton: HTMLElement { ... }
}
```

So it is possible to access the `name` input as `data.mainData.name` or `data["mainData"]["name"]` as in the following example:

```javascript
var data = DOM2Object("#mydata2");
data.mybutton.onclick = function() {
    alert(`Button clicked! ${data.mainData.name.value}:${data.userData.password.value}`);
};
```

### Anonymous elements

The default behaviour of the library is to ignore anonymous elements. Anonymous elements are those that don't have a name or an id. For example, in the following HTML fragment:

```html
<div id="mydata3">
  <div class="nameData">
    <input type="text" name="name" value="John">
    <input type="text" name="surname" value="Doe">
  </div>
  <div class="userData">
    <input type="text" name="username" value="johndoe">
    <input type="password" name="password" value="secret">
  </div>
  <button id="mybutton">Click me!</button>
</div>
```

If we execute `data = DOM2Object("#mydata3")` we will get an object with an structure like the next one:

```javascript
data = {
    mybutton: HTMLElement { ... }
}
```

This is because both `div` elements don't have a name or an id. So they are ignored.

We can make that the library acquires the children of anonymous elements by passing `true` as second parameter to `DOM2Object`. In that case, the child elements will be associated to the first parent that has a name or an id. If we make the call `data = DOM2Object("#mydata3", true)` we will get an object with an structure like the next one:

```javascript
data = {
    name: HTMLElement { ... },
    surname: HTMLElement { ... },
    username: HTMLElement { ... },
    password: HTMLElement { ... },
    mybutton: HTMLElement { ... }
}
```

Both use cases may coexists. For example, in the following HTML fragment:

```html
<div id="mydata4">
  <div id="nameData">
    <input type="text" name="name" value="John">
    <input type="text" name="surname" value="Doe">
  </div>
  <div class="userData">
    <input type="text" name="username" value="johndoe">
    <input type="password" name="password" value="secret">
  </div>
  <button id="mybutton">Click me!</button>
```

If we execute `data = DOM2Object("#mydata4", true)` we will get an object with an structure like the next one:

```javascript
data = {
    nameData: {
        name: HTMLElement { ... },
        surname: HTMLElement { ... }
    },
    username: HTMLElement { ... },
    password: HTMLElement { ... },
    mybutton: HTMLElement { ... }
}
```

## Technical details

> **NOTE**: In a common use of the library all the details contained in this section can be ignored in most of cases, but it is important to know them in case you want to use the library in a more advanced way.

The object returned by `DOM2Object` is a proxy object. This means that the object itself is not the HTMLElement, but a proxy that will redirect the calls to the _HTMLElement_. This is done to avoid the problem of the _HTMLElements_ being updated in the DOM tree, but the object properties not being updated.

So it may occurr a conflict if you use _HTMLElements_ with an _id_ or a _name_ that is the same as the name of an attribute or method of the _HTMLElement_ (it is extrange, but it may happen). In that case, the named _HTMLElement_ will substitute the existing attribute or method in the proxy object.

e.g.:

```html
<div id="mydata">
    <input type="text" name="children" value="johndoe" />
    <input type="password" name="innerHTML" value="secret" />
</div>
<script>
    var data = DOM2Object("#mydata");
    console.log(data.children.value);
</script>
```

In this case, the `data.children` property will be the _HTMLElement_ with `name="children"`, and the `data.innerHTML` property will be the _HTMLElement_ with `name="innerHTML"`, instead of the legacy attributes of the `children` and `innerHTML` attributes from the `div` element.

> If this case happens and it is needed to access the legacy attributes, you can use the `data._el.children` and `data._el.innerHTML` attributes.

### Proxy object attributes

Appart from the standard _HTMLElement_ attributes and methods, the proxy object will also have the following attributes:

- **_el**: the original _HTMLElement_.
- **_children**: an object with the named children of the _HTMLElement_ (the keys are the name or id and the values are the raw objects).
- **_childrenNames**: an array with the names of the children of the _HTMLElement_. It is the same as `Object.keys(_children)`.

If an object has these properties, that means that it has named children and thus it will be a proxy. If it doesn't have these properties, it will be a raw _HTMLElement_.

## Documentation

The main function is `DOM2Object`, which receives a DOM element or a CSS selector and returns an object with the DOM tree as properties.

```javascript
DOM2Object(elementOrSelector, acquireChildrenFromAnonymous = false);
```

- **elementOrSelector**: a DOM element or a CSS selector.
- **acquireChildrenFromAnonymous**: a boolean value indicating if the children of anonymous elements should be acquired. Default: `false`.

The `DOM2Object` function also has the following attributes and methods:

- `DOM2Object.version`: contains the version of the library.
- `DOM2Object.multiple(elements, acquireChildrenFromAnonymous = false)`: a function that receives an array of DOM elements or CSS selectors and returns an array of objects with the DOM tree as properties.
    - **elements**: an array of DOM elements or CSS selectors, or a single selector may select multiple objects in the DOM (e.g. `div`). Even if associated, the result will be flattened to a single array.
    - **acquireChildrenFromAnonymous**: a boolean value indicating if the children of anonymous elements should be acquired. Default: `false`.