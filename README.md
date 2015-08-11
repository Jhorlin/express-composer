# express-composer

A composition library built by extending [express](http://expressjs.com/)

[![Build Status](https://travis-ci.org/Jhorlin/express-composer.svg?branch=master)](https://travis-ci.org/Jhorlin/express-composer)
[![Coverage Status](https://coveralls.io/repos/Jhorlin/express-composer/badge.svg?branch=master&service=github)](https://coveralls.io/github/Jhorlin/express-composer?branch=master)
[![Dependency Status](https://david-dm.org/jhorlin/express-composer.svg)](https://david-dm.org/jhorlin/express-composer)
[![devDependency Status](https://david-dm.org/jhorlin/express-composer/dev-status.svg)](https://david-dm.org/jhorlin/express-composer#info=devDependencies)

## Modules
<table>
  <thead>
    <tr>
      <th>Module</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td><a href="#module_app">app</a></td>
    <td><p>Extension module for an express app</p>
<pre><code class="lang-javascript">var app = require(&#39;express-composer&#39;)();
</code></pre>
</td>
    </tr>
<tr>
    <td><a href="#module_express-composer">express-composer</a></td>
    <td><p>Exports createApplication</p>
</td>
    </tr>
</tbody>
</table>

    <a name="module_express-composer"></a>
## express-composer
Exports createApplication

**Example**  
```javascriptvar expressComposer = require('express-composer');```

* [express-composer](#module_express-composer)
  * [expressComposer()](#exp_module_express-composer--expressComposer) ⇒ <code>app</code> ⏏
    * [.extend(app)](#module_express-composer--expressComposer.extend) ⇒ <code>app</code>
    * [.handle(handlers, scope)](#module_express-composer--expressComposer.handle) ⇒ <code>function</code>
    * [.error(handlers, scope)](#module_express-composer--expressComposer.error) ⇒ <code>function</code>
    * [.validate(schema, scope)](#module_express-composer--expressComposer.validate) ⇒ <code>function</code>
    * [.destroy(scope)](#module_express-composer--expressComposer.destroy) ⇒ <code>function</code>

<a name="exp_module_express-composer--expressComposer"></a>
### expressComposer() ⇒ <code>app</code> ⏏
Creates an extended express app

**Kind**: Exported function  
**Example**  
```javascriptvar express = require('expressComposer'),    app = express();```
<a name="module_express-composer--expressComposer.extend"></a>
#### expressComposer.extend(app) ⇒ <code>app</code>
Extends an express app

**Kind**: static method of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>function</code> | express app |

<a name="module_express-composer--expressComposer.handle"></a>
#### expressComposer.handle(handlers, scope) ⇒ <code>function</code>
Creates an express middle ware handler that will iterate through composers handlers

**Kind**: static method of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  

| Param | Type |
| --- | --- |
| handlers | <code>Array.&lt;function()&gt;</code> | 
| scope | <code>Scope</code> | 

<a name="module_express-composer--expressComposer.error"></a>
#### expressComposer.error(handlers, scope) ⇒ <code>function</code>
Creates an express middle ware error handler that will iterate through composers error handlers

**Kind**: static method of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  

| Param | Type |
| --- | --- |
| handlers | <code>Array.&lt;function()&gt;</code> | 
| scope | <code>Scope</code> | 

<a name="module_express-composer--expressComposer.validate"></a>
#### expressComposer.validate(schema, scope) ⇒ <code>function</code>
Create an express middle ware that validates an incoming request

**Kind**: static method of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  

| Param | Type |
| --- | --- |
| schema | <code>object</code> | 
| scope | <code>Scope</code> | 

<a name="module_express-composer--expressComposer.destroy"></a>
#### expressComposer.destroy(scope) ⇒ <code>function</code>
Cleans up memory for a scope

**Kind**: static method of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| scope | <code>object</code> | the scope to destroy |

    <a name="module_app"></a>
## app
Extension module for an express app```javascriptvar app = require('express-composer')();```

