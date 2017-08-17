const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');
const morgan = require('morgan');
nunjucks.configure('views', { noCache: true });
const models = require('./models');


const app = express();
app.set('view engine', 'html');
app.engine('html', nunjucks.render);

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));


app.use(morgan('dev'));

app.use(require('body-parser').json());

app.get('/', (req, res, next)=> {
  models.getEverything()
    .then((results)=> {
    console.log('THESE ARE THE RESULTS', results[2]);
      const hotels = [];
      const activities = [];
      const places = [];
      const restaurants = [];
    
      results[0].forEach( element => {
        hotels.push(element.name)
      });
      results[1].forEach( element => {
        activities.push(element.name)
      });
      results[2].forEach( element => {
        places.push(element.address)
      });
      results[3].forEach( element => {
        restaurants.push(element.name)
      });
     
      res.render('index', {
        hotels,
        activities,
        places,
        restaurants
      });
    })
    .catch( err => console.log(err.message));
  
});

app.use((req, res, next)=> {
  const error = new Error('page not found');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next)=> {
  res.status(err.status || 500).render('error', { error: err });
});

const port = process.env.PORT || 3000;
models.sync()
  .then( ()=> {
    return require('./seed'); //this is why we got the error: ConnectionManager.getConnection was called after the connection manager was closed!
   })
  .then(()=> {
    app.listen(port, ()=> {
      console.log(`listening on port ${port}`);
    });
  });
