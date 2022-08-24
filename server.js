// librairies
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');
const cors = require('cors');


// recipes data
const recipes = require('./list.json');

// vars
const app = express();
const port = 3001;
const jwtSecret = 'OurSuperLongRandomSecretToSignOurJWTgre5ezg4jyt5j4ui64gn56bd4sfs5qe4erg5t5yjh46yu6knsw4q';

// users data
const db = {
  users: [
    {
      id: 32,
      password: 'jennifer',
      username: 'John',
      color: '#c23616',
      favorites: [21453, 462],
      email: 'bouclierman@herocorp.io',
    },
    {
      id: 55,
      password: 'fructis',
      email: 'acidman@herocorp.io',
      first_name: 'Burns',
      last_name: 'Montgomery',
      street_number: '10',
      street: 'Rue de la Centrale',
      zip_code: '75210',
      city: 'Springfield',
      department: '99',
      phone_number: '06 10 14 13 60',
      licence: 'Permis Z',
      role: 4,
      color: '#009432',
      favorites: [8965, 11],
    },
    {
      id: 123,
      password: 'pingpong',
      username: 'Karin',
      color: '#f0f',
      favorites: [8762],
      email: 'captain.sportsextremes@herocorp.io',
    }, 
  ]
};

/* Middlewares */
// parse request body
app.use(bodyParser.json());

// app.use(cors(process.env.CORS_DOMAIN ?? '*'));

// cors
app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'https://reactrecipeskamel.herokuapp.com/');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');

  // response to preflight request
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  }
  else {
    next();
  }
});

// prepare authorization middleware
const authorizationMiddleware = jwt({ secret: jwtSecret, algorithms: ['HS256'] });

/* Routes */
// Page d'accueil du serveur : GET /
app.get('/', (req, res) => {
  console.log('>> GET /');
  res.sendFile( __dirname + '/index.html');
});

// Liste des recettes : GET /recipes
app.get('/recipes', (req, res) => {
  console.log('>> GET /recipes');
  res.json(recipes);
});


// Login : POST /login
app.post('/user/login', (req, res) => {
  console.log('>> POST /login', req.body);
  const { email, password } = req.body;

  // authentication
  const user = db.users.find(user => user.email === email && user.password === password);

  // http response
  if (user) {
    const jwtContent = { userId: user.id };
    const jwtOptions = { 
      algorithm: 'HS256', 
      expiresIn: '3h' 
    };
    console.log('<< 200', user.first_name);
    res.json({ 
      accessToken: jsonwebtoken.sign(jwtContent, jwtSecret, jwtOptions),
      pseudo: user.first_name,
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      street_number: user.street_number,
      street: user.street,
      zip_code: user.zip_code,
      city: user.city,
      department: user.department,
      phone_number: user.phone_number,
      licence: user.licence,
      role: user.role,
      color: user.color,
      favorites: user.favorites,
    });
  }
  else {
    console.log('<< 401 UNAUTHORIZED');
    res.sendStatus(401);
  }
});

app.post('/user/register', (req, res) => {
  console.log('dans la fonction', req.body);
  
  //Destructuration du req.body
  const { email,  password } = req.body;
  // On match password avec passwordConfirm
  console.log('req.body', email);
  
  // if(password !== passwordConfirm )throw new Error('password must match passwordConfirm.')    
  // hashage du password avec un salt à 12
  // const hashedPassword = hashSync(password, 12)
  // si tout est ok, on stock les valeur pour l'INSERT INTO
  const newUserDataVerified = {email,  password}
  //Qu'on passe en paramettre de la fonction insert() puis on stock le retour dans une autre variable
  //Qu'on retourne au format json pour le front
  console.log('newUserDataVerified', newUserDataVerified);
  console.log('newUserDataVerified.email', json(newUserDataVerified))
  
  
  return res.json(newUserDataVerified)
},

// Favorites recipes : GET /favorites
app.get('/favorites', authorizationMiddleware, (req, res) => {
  console.log('>> GET /favorites', req.user);

  const user = db.users.find(user => user.id === req.user.userId);
  console.log('<< 200');
  res.json({ 
    favorites: recipes.filter((recipe) => user.favorites.includes(recipe.id)), 
  });
}));



// Error middleware
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    console.log('<< 401 UNAUTHORIZED - Invalid Token');
    res.status(401).send('Invalid token');
  }
});



/*
 * Server
 */
app.listen(port, () => {
  console.log(`listening on *:${port}`);
});
