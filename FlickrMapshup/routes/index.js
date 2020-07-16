// Requires
let express = require('express');
const axios = require('axios');
let router = express.Router();
const {parsePhotoResponse, createFlickrOptions} = require('./flickr.js');
let nconf = require('nconf');

// Config files which contains API keys
nconf.argv()
  .env()
  .file({ file: 'config.json' });


/* 
* GET the index page. 
*/
router.get('/', (req, res) => {
  // Get the elements from the browser
  var tags = req.query.tags == undefined ? '' : req.query.tags;
  let username = req.query.username == undefined ? '' : req.query.username;
  let lat = req.query.lat  == undefined ? '' : req.query.lat;
  let lng = req.query.lng  == undefined ? '' : req.query.lng;

  // Determine what url to request from Flickr API
  const options = createFlickrOptions(tags, username, lat, lng);
  var url = `https://${options.hostname}${options.path}`;

  // If nothing has been entered, throw an error, do not fetch the photos
  if (tags == '' && username == '' && lat == '' && lng == '') {
    url = '';      
  }
  
  // Get photos from tags query in Flickr API
  axios.get(url)
    .then( (response) => {
      // Return Flickr query
      return response.data;
    })
    .then( (rsp) => {
      if (typeof rsp.photos !== 'undefined') {
        // Trim and parse the data
        var photos = parsePhotoResponse(rsp.photos.photo);
        // Render the index page
        res.render("index", {
          url: url,
          tags: tags,
          photos: photos,
          lat: lat,
          lng: lng,
          google: {
            maps: {
              apikey: nconf.get("google.maps.apikey")
            }
          }
        });
      } else {
        // Load base page
        res.render("index", {
          url: 0,
          tags: 0,
          photos: 0,
          lat: 0,
          lng: 0,
          google: {
            maps: {
              apikey: nconf.get("google.maps.apikey")
            }
          }
        });
      }
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        // TypeError expected on initialisation
          res.render("index", {
          url: 0,
          tags: 0,
          photos: 0,
          lat: 0,
          lng: 0,
          google: {
            maps: {
              apikey: nconf.get("google.maps.apikey")
            }
          }
        });
      } else {
        // Handle other errors appropriately
        res.render("index", {
          url: 0,
          tags: 0,
          photos: 0,
          lat: 0,
          lng: 0,
          google: {
            maps: {
              apikey: nconf.get("google.maps.apikey")
            }
          }
        });
        // Log the unknown error
        console.error(error);
      }
    }) 
});
  

module.exports = router;