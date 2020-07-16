// Module for Flickr requests
// Requires
let nconf = require('nconf');

// Config files which contains API keys
nconf.argv()
  .env()
  .file({ file: 'config.json' });

// Function to generate the URL to query the Flickr API
function createFlickrOptions(tags, username, lat, lng) {
    const options = {
        hostname: 'api.flickr.com',
        path: '/services/rest/?'
    };
    const flickr = {
        method: 'flickr.photos.search',
        api_key: nconf.get("flickr.apikey"),
        geo: 1,
        format: "json",
        media: "photos",
        nojsoncallback: 1
    };
    // If not all are empty
    var str = 'method=' + flickr.method +
    '&api_key=' + flickr.api_key +
    '&has_geo=' + flickr.geo +
    '&extras=geo,description, date_taken, owner_name, tags';
    // Username
    if (username !== '') {
        str = str + '&username=' + username;
    }
    // Tags
    if (tags !== '') {
        str = str + '&tags=' + tags;
    }
    // Local
    if ( lat !== '' && lng !== '' ) {
        str = str + '&lat=' + lat +
        '&lon=' + lng  +
        '&radius=32';
    }
    str = str + '&format=' + flickr.format +
    '&media=' + flickr.media +
    '&nojsoncallback=' + flickr.nojsoncallback;
    options.path += str;
    return options;
  }
  
// Parse the photo response
function parsePhotoResponse(photos) {
    // Try and parse the returned data
    for (var i = 0; i < photos.length; i++) {
        let photo = photos[i];
        const keys_to_delete = ['context','accuracy', 'geo_is_contact','geo_is_family','geo_is_friend','isfamily','isfriend', 'ispublic', 'place_id','woeid']
        keys_to_delete.forEach(keys_to_delete => delete photo[keys_to_delete]);
        photo["photoURL"] = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_m.jpg`;
        photo["webURL"] = `https://www.flickr.com/photos/${photo.owner}/${photo.id}`;
    }
    return photos;
  };


module.exports = { parsePhotoResponse, createFlickrOptions };