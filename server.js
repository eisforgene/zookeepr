const e = require('express');
const express = require('express');
const {animals} = require('./data/animals.json');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3001;
const app = express();

// parse incoming string or array data
app.use(express.urlencoded({ extended: true })); // app.use mounts a function to the server that our requests will pass through before getting to the endpoint (middleware)
// parse incoming JSON data
app.use(express.json()); 

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // Note that we save the animalsArray as filteredResults here:
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
      // Save personalityTraits as a dedicated array.
      // If personalityTraits is a string, place it into a new array and save.
      if (typeof query.personalityTraits === 'string') {
        personalityTraitsArray = [query.personalityTraits];
      } else {
        personalityTraitsArray = query.personalityTraits;
      }
      // Loop through each trait in the personalityTraits array:
      personalityTraitsArray.forEach(trait => {
        // Check the trait against each animal in the filteredResults array.
        // Remember, it is initially a copy of the animalsArray,
        // but here we're updating it for each trait in the .forEach() loop.
        // For each trait being targeted by the filter, the filteredResults
        // array will then contain only the entries that contain the trait,
        // so at the end we'll have an array of animals that have every one 
        // of the traits when the .forEach() loop is finished.
        filteredResults = filteredResults.filter(
          animal => animal.personalityTraits.indexOf(trait) !== -1
        );
      });
    }
    if (query.diet) {
      filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
      filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
      filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
  };

  function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
  };

function createNewAnimal(body, animalsArray) {
  const animal = body;
  animalsArray.push(animal);
  // write animals.json file in the data subdirectory, so we used method path.join() to join the value of __dirname, which represents the directory of the file we execute the code in, with the path to animals.json
  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'), 
    JSON.stringify({ animals: animalsArray }, null, 2) // convert to JSON, null (doesn't edit existing data) and 2 (create white space between values) are arguments used in the method to keep the data formatted
  );
  return animal;
}

function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
    return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
    return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }
  if (!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }
  return true;
}
  app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
      results = filterByQuery(req.query, results);
    }
    res.json(results);
  });

  app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
      res.json(result);
    } else { 
      res.send(404);
    }
  });

  app.post('/api/animals', (req, res) => {
    // // req.body is where our incoming content will be
    // console.log(req.body);
    // set id based on what the next index of the array will be
    req.body.id = animals.length.toString(); // length property will always be 1 number ahead of the last index

    // if any data in req.body is incorrect, send 400 error back
    if (!validateAnimal(req.body)) {
      res.status(400).send('The animal is not properly formatted.'); // a response method to relay a message to the client making the request '400 means user error'
    } else {
      const animal = createNewAnimal(req.body, animals);
      res.json(animal);
    }
  });

app.listen(3001, () => {
    console.log(`API server now on port ${PORT}!`);
});

