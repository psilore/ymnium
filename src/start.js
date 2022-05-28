 
require('dotenv').config();
import fetch from "cross-fetch";
const express = require('express');
const serverless = require("serverless-http");
const app = express();
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
let serverURL;
fetch(".netlify/functions/api")
  .then((response) => response.json())
  .then((json) => {
    serverURL = json.api;
  });
const port = process.env.PORT || 8080;
//const omdb = new (require("omdbapi"))(process.env.OMDB_APIKEY);
const omdb = new (require("omdbapi"))(serverURL);
const util = require('util');
const humanize = require('humanize-plus');
var convert = require('xml-js');
const { on } = require('events');
let movies = [];

let xml_string = fs.readFileSync('./src/static/movies.xml', 'utf8');



const template = {
  movies: {
    movie: ['/movies/movie[@name="movie"]', {
      title: '@title',
      description: 'property[@name="description"]/@value',
      length: 'property[@name="length"]/@value',
      year: 'property[@name="year"]/@value',
      genre: 'property[@name="genre"]/@value',
      hasSeen: 'property[@name="hasSeen"]/@value',
      isFavourite: 'property[@name="isFavourite"]/@value',
    }]
  }
}

function parseXml(xml) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser({ explicitArray: false, explicitRoot : false })
    parser.parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function processResult(result) {
  movies = result.movie;

  for (let index = 0; index < movies.length; index++) {
    omdb.get({
      title: movies[index].title,   // optionnal (requires imdbid or title)
      }).then(res => {
        Object.assign(movies[index], {poster: res.poster})
      }).catch(console.error);
  }

  return movies
}

function nameToUpperCase(name){
    return name.toUpperCase();
}

async function testXmlParse(xml) {
  try {
      let result = await parseXml(xml);
      processResult(result);
  } catch (err) {
      console.error("parseXml failed: ", err);
  }
}

testXmlParse(xml_string);

app.use('/static', express.static(path.join(__dirname, 'static')))
app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'ejs');



app.get('/', function(req, res) {

  testXmlParse(xml_string);

  res.render('pages/index', {
    movies: movies,
    title: "Ymnium",
    description: "A register, that transcends reality."
  });

});

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(`/.netlify/functions/start`, router);

module.exports = app;
module.exports.handler = serverless(app);

// Maybe a endpoint? Dont know
// GET All movies
/* app.get('/movies', function(req, res) {
  res.json(movies);
}); */

//GET Movie by name
app.get('/movies/:name', function(req, res) {

  var path = req.params.name.replace(/-/g, ' ');
  var titleCaseMovieName = humanize.titleCase(path);
  var capitalizedMovieName = humanize.capitalize(path);

  console.log(`No hyphens: ${path}, Titlecase: ${titleCaseMovieName}, Capcase: ${capitalizedMovieName}`)
  try {
    new Promise((resolve, reject) => {
      const parser = new xml2js.Parser({ explicitArray: false, explicitRoot : false })
      parser.parseString(xml_string, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
          var movies = result.movie;
          for (let index = 0; index < movies.length; index++) {
            if (movies[index].title === titleCaseMovieName || movies[index].title === capitalizedMovieName )  {
              console.log('123:Got movie by name: ')
              console.log(movies[index])
              var data = movies[index];
              res.json(data);
            }
          }
        }
      });
    });
  } catch (error) {
    return res.status(400).json({ error: error.toString() });
  }
  
});

//PUT Movie byt id (Modify)
app.post('/movies/update', function (req, res) {
  // Handle post

  var title = req.body.data.formTitle;

  xml2js.parseString(xml_string, (err, result) => {

    
    console.log(title);

    //console.log(xml)
    var description = req.body.data.formDescription.replace(/\+/g,' ');
    var length = req.body.data.formLength;
    var year = req.body.data.formYear;
    var genre = req.body.data.formGenre.replace(/\+/g,' ');
    var hasSeen = req.body.data.formHasSeen.toString();
    var isFavourite = req.body.data.formIsFavourite.toString();

    
    var xml = require('fs').readFileSync('./src/static/movies.xml', 'utf8');
    var options = { 
        trim: true, 
        compact: true,
        parentKey: true,
        ignoreDeclaration: true
    };
    var result = convert.xml2js(xml, options); 
    //console.log(typeof result)
    //console.log(result)
    var movies = result.movies.movie;

    /* function iterate(o) {
      Object.keys(o).forEach(function (k) {
        if (o[k] !== null && typeof o[k] === 'object') {
          //iterate(o[k]); 
          if(o.title == title){
            obj.description = [description.trim()];
            obj.length = [length.trim()];
            obj.year = [year.trim()];
            obj.genre = [genre.trim()];
            obj.hasSeen = [hasSeen.trim()];
            obj.isFavourite = [isFavourite.trim()];
          }
          //console.log(o)

          console.log(JSON.stringify(o))
          return o;
        }
      });
    }
    iterate(result); */
    let modifiedMovies = movie.map((obj) => {
      if(obj.title == title){
        obj.description = [description.trim()],
        obj.length = [length.trim()],
        obj.year = [year.trim()],
        obj.genre = [genre.trim()],
        obj.hasSeen = [hasSeen.trim()],
        obj.isFavourite = [isFavourite.trim()]
      }
    }) 

  /*   var options = {compact: true, ignoreComment: true, spaces: 4};
    var result = convert.json2xml(xml, options);
    
    fs.writeFile('./src/static/movies.xml', JSON.stringify(movies), function (err) {
      if (err) throw err;
      res.status(200).send('OK')
      console.log('It\'s saved!');
    });
 */
  });
});

app.listen(port, "127.0.0.1", function(req, res) {
  console.log(`Ymnium is listening on http://localhost:${port}`);
});


