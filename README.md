# @nyteshade/ne-reflection

## Overview

This class provides tools for working with descriptors and proxies. In general when working with `Object.defineProperty/-ies` you need to get very familiar with object descriptors. These define how the property is bound to the object in question. Descriptors are responsible for, and the reason we can, have things like computed getters and setters and how transpilers make code like this work in ES5

```js
const obj = { name: 'Brielle', get age() { return 'none of your business' } }
```

To do this in ES5 you'd need to work with descriptors and see what happens

```js
const obj = { name: 'Brielle' }
Object.defineProperty(obj, 'age', {
  enumerable: true,
  configurable: true,
  get: function() { return 'none of your business' }
})
```

