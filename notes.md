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



**vulnerability**

pieces of code & cookies

--- any input from users should be prevented to be code that runs

--- strings that can become code that runs



danger: eval, setTimeout, function constructor



frames are like browsers in browsers

<iframe src="spiced-academy"> </iframe>




```

```

a way

```javascript
res.cookie('name', 'value', {
    sameSite: true
});
```

this still doesn't work on all browsers







if you're logged out only reg & login

reg route - insert a row in a table

selct from the sig table by usr id - find out if they have signed



**joining tables**

query runs through a temporary table



for the city the same template as for signers

we pull the id from registration (users)and insert it onto new table (userprofiles)

leave out the empty row if there's no input



in post profile - if it doesn't start with http or https or // -- throw it out

don't take link as is because it can be a javascript url



the query that is finding by email to 



**HEROKU**









if no info entered in the user table

better to make promise all for queries if password or without password

redirect back to get route so user can see the details or going to thank you page or sth



maybe use only upsert instead the insert for the profile



deletion should be a button element that is a form

<form action="/signature/delete" method="POST">
    <input type="hidden" name="_csrf"
</form>

after deletion make them sign again