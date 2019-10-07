canvas - listen for mousedown on canvas and mouseup on entire document

```javascript
var c = document.query('canvas');
```

big URL from canvas put into database

call todataurn when mouse up or click button or submit form







**part 2**

cookie = key-value pair

store the signature dataURL in a cookie

cookies are too small for this data - dataURL is too big

solution: store the reference of the signature in a cookie

every time we create a new row in a table which has an ID

then we use the ID to get the signature from a table

no more cookie parser

therefore we'll use another npm package: **cookie session**

```javascript
var cookieSession = require('cookie-session');

app.use(cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));
```

this is middleware

two cookies: 1st the data, 2nd is a hashed copy of the 1st cookie

middleware compares the original and the encrypted cookie

```javascript
let decode = atob('zR1o78jFS4phDz5oToMdm0bp5Kw');
```

put the data url into an img tag to show