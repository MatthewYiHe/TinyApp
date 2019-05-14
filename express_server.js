const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');



app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ["matthew"]
}));



const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};



// functions section

function emailLookup(email){ //a function to check if the user's email is already in the database. and if is, return the userID
  for (userId in users){
    if (email === users[userId].email){
      return userId;
    }
  }
}


function generateRandomString() {  //a function to generate a randomstring of 6 charactors
   let result = '';
   let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   let charactersLength = characters.length;
   for ( var i = 0; i < 6; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}



function urlsForUser(id){  // find all the urls from a specific user, and list them in a array
  let arrURL = [];
  for (let shortURL in urlDatabase){
    if(id === urlDatabase[shortURL].userID){
      arrURL.push(shortURL);
    }
  }
  return arrURL;
}



// get section

app.get("/",(req, res) => {
  res.redirect("/login");
});
app.get("/urls.json", (req, res) => {
  let templateVars = {user: users[req.session.user_id]};
  const userId = req.session.user_id;
    if (userId){
  res.json(urlDatabase);  // only let user log in and see the database if he is registered
  } else {
     res.redirect("/login");
  }
});
app.get("/urls", (req, res) => {
  let filteredURL = urlsForUser(req.session.user_id);
  const filtereDatabase = Object.keys(urlDatabase)      ////To let the page only display filtered urls
    .filter(longURL => filteredURL.includes(longURL))
    .reduce((obj, longURL) => {
      obj[longURL] = urlDatabase[longURL];
      return obj;
    }, {});
  let templateVars = { urls: filtereDatabase,
                       user: users[req.session.user_id]};
  const userId = req.session.user_id;
    if (userId){
     res.render("urls_index", templateVars);
  } else {
     res.redirect("/login");
  }
});
app.get("/urls/new", (req, res) => {
    let templateVars = {user: users[req.session.user_id]};
    const userId = req.session.user_id;
    if (userId){
     res.render("urls_new", templateVars);
  } else {
     res.redirect("/login");
  }
});
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { shortURL,
                       longURL: urlDatabase[req.params.shortURL].longURL,
                       user: users[req.session.user_id]};
  const userId = req.session.user_id;
    if (urlDatabase[shortURL].userID !== userId){ // shows 403 page if user is not the one who created the shortURL
      res.render("403");
    } else if (userId){
     res.render("urls_show", templateVars);
    } else {
     res.redirect("/login");
  }
});
app.get("/u/:shortURL", (req, res) => {
   let shortURL = req.params.shortURL;
   const longURL = urlDatabase[shortURL].longURL;
   console.log(shortURL)
   console.log(longURL)
   if (!longURL){
    res.render("403")
   }
   res.redirect(longURL);
});
app.get("/register", (req, res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("register", templateVars);
});
app.get("/login", (req, res) => {
  let templateVars = {user: users[req.session.user_id]};
  res.render("login", templateVars);
});
  app.get("/id", (req, res) => {
  res.json(users);
});




//post section

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = emailLookup(email);
  if (!emailLookup(email)){
    res.render("403");
  } else if (!bcrypt.compareSync(password, users[userId].password)){ // compare the input password with the encrypt password in the database
    res.render("403");
  } else {
    req.session.user_id = users[userId].id;
    res.redirect("/urls");
  }
});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls/");
});
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  if(req.session.user_id === urlDatabase[shortURL].userID){
    res.redirect("/urls/" + shortURL);
  } else {
    res.redirect("/urls/");
  }
});
app.post("/urls/:shortURL/delete", (req, res) => {  //delete and erease the cookie
  let shortURL = req.params.shortURL;
  if(req.session.user_id === urlDatabase[shortURL].userID){
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls/");
  } else {
    res.redirect("/urls/");
  }
});
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] ={ longURL: longURL,
                            userID: req.session.user_id
                          };
  res.redirect("/urls/");
});
app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL,
                            userID: req.session.user_id
                          };
  res.redirect("/urls/" + shortURL);
});
app.post("/register", (req, res) => { // registers the user and encrypt the password to harshedpassword
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userInfo = {
    id,
    email,
    password: hashedPassword
  };
  if (!email || !password){
    res.render("404");
  } else if (emailLookup(email)){
    res.render("404");
  } else {
    users[id] = userInfo;
    req.session.user_id = id;
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});