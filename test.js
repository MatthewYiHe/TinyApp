// const raw = {
//   item1: { key: 'sdfd', value:'sdfd' },
//   item2: { key: 'sdfd', value:'sdfd' },
//   item3: { key: 'sdfd', value:'sdfd' }
// };

// const allowed = ['item1', 'item3'];

// const filtered = Object.keys(raw)
//   .filter(key => allowed.includes(key))
//   .reduce((obj, key) => {
//     obj[key] = raw[key];
//     return obj;
//   }, {});

// console.log(filtered);



const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW"},
    b656xQ: { longURL: "https://www.fdsdfs.ca", userID: "aJ48lW" },
    i3BoGr: { longURL: "https://www.glllle.ca", userID: "aJ48lW"}
    };

const filteredURL = [ 'b6UTxQ', 'i3BoGr'];

const filtered = Object.keys(urlDatabase)
  .filter(longURL => filteredURL.includes(longURL))
  .reduce((obj, longURL) => {
    obj[longURL] = urlDatabase[longURL];
    return obj;
  }, {});

console.log(filtered);