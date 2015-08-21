# express-composer

A composition library built by extending [express](http://expressjs.com/)

[![Build Status](https://travis-ci.org/Jhorlin/express-composer.svg?branch=master)](https://travis-ci.org/Jhorlin/express-composer)
[![Coverage Status](https://coveralls.io/repos/Jhorlin/express-composer/badge.svg?branch=master&service=github)](https://coveralls.io/github/Jhorlin/express-composer?branch=master)
[![Dependency Status](https://david-dm.org/jhorlin/express-composer.svg)](https://david-dm.org/jhorlin/express-composer)
[![devDependency Status](https://david-dm.org/jhorlin/express-composer/dev-status.svg)](https://david-dm.org/jhorlin/express-composer#info=devDependencies)

##[Coverage Report](http://htmlpreview.github.io/?https://github.com/Jhorlin/express-composer/blob/master/reports/coverage.html)

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
    <td><p>method for creating an express application with express-compose mixin</p>
</td>
    </tr>
<tr>
    <td><a href="#module_Scope">Scope</a></td>
    <td></td>
    </tr>
</tbody>
</table>

    <a name="module_express-composer"></a>
## express-composer
method for creating an express application with express-compose mixin

**Example**  
```javascript
var expressComposer = require('express-composer');
```

* [express-composer](#module_express-composer)
  * [expressComposer()](#exp_module_express-composer--expressComposer) ⇒ <code>app</code> ⏏
    * _static_
      * [.extend(app)](#module_express-composer--expressComposer.extend) ⇒ <code>app</code>
      * [.handle(handlers, scopeProvider)](#module_express-composer--expressComposer.handle) ⇒ <code>function</code>
      * [.error(handlers, scopeProvider)](#module_express-composer--expressComposer.error) ⇒ <code>function</code>
      * [.validate(validate, scopeProvider)](#module_express-composer--expressComposer.validate) ⇒ <code>function</code>
    * _inner_
      * [~scopeArg](#module_express-composer--expressComposer..scopeArg) : <code>Object</code> &#124; <code>function</code> &#124; <code>Promise.&lt;Object&gt;</code>
      * [~requestHandlers](#module_express-composer--expressComposer..requestHandlers) : <code>function</code> &#124; <code>Array.&lt;function()&gt;</code>
      * [~pathArg](#module_express-composer--expressComposer..pathArg) : <code>String</code>
      * [~appOptions](#module_express-composer--expressComposer..appOptions) : <code>Object</code>
      * [~routerOptions](#module_express-composer--expressComposer..routerOptions) : <code>Object</code>
      * [~requestMethod](#module_express-composer--expressComposer..requestMethod) : <code>object</code>
      * [~requestMethods](#module_express-composer--expressComposer..requestMethods) : <code>object</code>
      * [~routeScore](#module_express-composer--expressComposer..routeScore) : <code>Object</code>
      * [~routerScore](#module_express-composer--expressComposer..routerScore) : <code>Object</code>
      * [~appScore](#module_express-composer--expressComposer..appScore) : <code>Object</code>

<a name="exp_module_express-composer--expressComposer"></a>
### expressComposer() ⇒ <code>app</code> ⏏
Creates an extended express app

**Kind**: Exported function  
**Example**  
```javascript
var express = require('expressComposer'),
    app = express();
```
<a name="module_express-composer--expressComposer.extend"></a>
#### expressComposer.extend(app) ⇒ <code>app</code>
Extends an express app if it was not created with express-compose

**Kind**: static method of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| app | <code>function</code> | express app |

**Example**  
```javascript
var express = require('express'),
    expressComposer = require('express-composer'),
    app = express();
expressComposer.extend(app);
```
<a name="module_express-composer--expressComposer.handle"></a>
#### expressComposer.handle(handlers, scopeProvider) ⇒ <code>function</code>
Creates an express middle ware handler that will iterate through composers handlers

**Kind**: static method of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handlers | <code>Array.&lt;function()&gt;</code> &#124; <code>function</code> |  |
| scopeProvider | <code>ScopeProvider</code> | the scope of these handlers |

<a name="module_express-composer--expressComposer.error"></a>
#### expressComposer.error(handlers, scopeProvider) ⇒ <code>function</code>
Creates an express middle ware error handler that will iterate through composers error handlers

**Kind**: static method of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| handlers | <code>Array.&lt;function()&gt;</code> &#124; <code>function</code> |  |
| scopeProvider | <code>ScopeProvider</code> | the scope for these handlers |

<a name="module_express-composer--expressComposer.validate"></a>
#### expressComposer.validate(validate, scopeProvider) ⇒ <code>function</code>
Create an express middle ware that validates an incoming request

**Kind**: static method of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  

| Param | Type | Description |
| --- | --- | --- |
| validate | <code>function</code> | validation function |
| scopeProvider | <code>ScopeProvider</code> | scope variable |

<a name="module_express-composer--expressComposer..scopeArg"></a>
#### expressComposer~scopeArg : <code>Object</code> &#124; <code>function</code> &#124; <code>Promise.&lt;Object&gt;</code>
**Kind**: inner typedef of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  
<a name="module_express-composer--expressComposer..requestHandlers"></a>
#### expressComposer~requestHandlers : <code>function</code> &#124; <code>Array.&lt;function()&gt;</code>
**Kind**: inner typedef of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  
<a name="module_express-composer--expressComposer..pathArg"></a>
#### expressComposer~pathArg : <code>String</code>
**Kind**: inner typedef of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  
<a name="module_express-composer--expressComposer..appOptions"></a>
#### expressComposer~appOptions : <code>Object</code>
Express application options passed into [express](http://expressjs.com/api.html)

**Kind**: inner typedef of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| dotFiles | <code>String</code> | Option for serving dotfiles. Possible values are �allow�, �deny�, and �ignore� |
| etag | <code>Boolean</code> | Enable or disable etag generation |
| extentions | <code>Boolean</code> | Sets file extension fallbacks. |
| index | <code>Object</code> &#124; <code>String</code> | Sends directory index file. Set false to disable directory indexing. |
| lastModified | <code>Boolean</code> | Set the Last-Modified header to the last modified date of the file on the OS. Possible values are true or false. |
| maxAge | <code>Boolean</code> | Set the max-age property of the Cache-Control header in milliseconds or a string in ms format |
| redirect | <code>Number</code> | Redirect to trailing �/� when the pathname is a directory. |
| setHeaders | <code>function</code> | Function for setting HTTP headers to serve with the file. |

<a name="module_express-composer--expressComposer..routerOptions"></a>
#### expressComposer~routerOptions : <code>Object</code>
Options passed into express [Router]{http://expressjs.com/api.html#router}

**Kind**: inner typedef of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| caseSensitive | <code>Boolean</code> | Enable case sensitivity. |
| mergeParams | <code>Boolean</code> | Preserve the req.params values from the parent router. If the parent and the child have conflicting param names, the child�s value take precedence. |
| strict | <code>Boolean</code> | Enable strict routing. |

<a name="module_express-composer--expressComposer..requestMethod"></a>
#### expressComposer~requestMethod : <code>object</code>
**Kind**: inner typedef of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| validator | <code>function</code> | function used to validate the request |
| preHandlers | <code>requestHandlers</code> | handlers that will be called during execution of the route |
| scope | <code>scopeArg</code> | scope values to inject into the context of the handlers |
| errorHandlers | <code>requestHandlers</code> | handlers called if there is an error during the request |
| name | <code>String</code> | name of the method |
| description | <code>String</code> | description about what this method does |

<a name="module_express-composer--expressComposer..requestMethods"></a>
#### expressComposer~requestMethods : <code>object</code>
**Kind**: inner typedef of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| checkout | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles checkout requests |
| connect | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles connect requests |
| copy | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles copy requests |
| delete | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles delete requests |
| get | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles get requests |
| head | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles head requests |
| lock | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles lock requests |
| m-search | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles m-search requests |
| merge | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles merge requests |
| mkactivity | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles mkactivity requests |
| mkcol | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles mkcol requests |
| move | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles move requests |
| notify | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles notify requests |
| options | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles options requests |
| patch | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles patch requests |
| post | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles post requests |
| propfind | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles propfind requests |
| proppatch | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles proppatch requests |
| purge | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles purge requests |
| put | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles put requests |
| report | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles report requests |
| search | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles search requests |
| subscribe | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles subscribe requests |
| trace | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles trace requests |
| unlock | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles unlock requests |
| unsubscribe | <code>requestMethod</code> &#124; <code>requestHandlers</code> | handles unsubscribe requests |

<a name="module_express-composer--expressComposer..routeScore"></a>
#### expressComposer~routeScore : <code>Object</code>
**Kind**: inner typedef of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| methods | <code>requestMethods</code> | methods for this route |
| preHandlers | <code>requestHandlers</code> | handlers that are executed before a route method |
| errorHandlers | <code>requestHandlers</code> | handlers for errors within this route |
| scope | <code>scopeArg</code> | scope argument for this route |
| name | <code>String</code> | the name of the route |
| description | <code>String</code> | a description of the route |
| path | <code>pathArg</code> | the path for the route |

<a name="module_express-composer--expressComposer..routerScore"></a>
#### expressComposer~routerScore : <code>Object</code>
**Kind**: inner typedef of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| preHandlers | <code>requestHandlers</code> | handlers that are executed during this route |
| routes | <code>routeScore</code> &#124; <code>Array.&lt;routeScore&gt;</code> | routes for this router |
| errorHandlers | <code>requestHandlers</code> | handles errors tha occurred in this route |
| scope | <code>scopeArg</code> | scope options to include in this scope |
| routers | <code>routerScore</code> | nested routers |
| name | <code>String</code> | name of this route |
| description | <code>String</code> | a description of this route |
| path | <code>pathArg</code> | the path to this route |
|  | <code>routerOptions</code> | options for the router |

<a name="module_express-composer--expressComposer..appScore"></a>
#### expressComposer~appScore : <code>Object</code>
**Kind**: inner typedef of <code>[expressComposer](#exp_module_express-composer--expressComposer)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| preHandlers | <code>requestHandlers</code> | handlers that are executed for this app |
| errorHandlers | <code>requestHandlers</code> | handles errors tha occurred in this route |
| scope | <code>scopeArg</code> | scope options to include in this scope |
| routers | <code>routerScore</code> &#124; <code>Array.&lt;routerScore&gt;</code> | nested routers |
| name | <code>String</code> | name of this route |
| description | <code>String</code> | a description of this route |
|  | <code>appOptions</code> | options for the router |
|  | <code>appScore</code> &#124; <code>Array.&lt;appScore&gt;</code> | apps for this app |
| path | <code>pathArg</code> | the path for the app |
| vhost | <code>String</code> | a vhost routing string |
| properties | <code>Object</code> | an object used to [set express options](http://expressjs.com/api.html#app.set) |

