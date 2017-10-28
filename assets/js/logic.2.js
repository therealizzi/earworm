(function() {
  var cors_api_host = 'cors-anywhere.herokuapp.com';
  var cors_api_url = 'https://' + cors_api_host + '/';
  var slice = [].slice;
  var origin = window.location.protocol + '//' + window.location.host;
  var open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    var args = slice.call(arguments);
    var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
    if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
      targetOrigin[1] !== cors_api_host) {
      args[1] = cors_api_url + args[1];
    }
    return open.apply(this, args);
  };
})();

// life saving code above ----- DO NOT DELETE //

function initMap() {};

// Laura's Code //

$(window).on( "load", function() { //make sure window has finished loading

    var lyrics;
    var song;
    var songArray = [];
    var globalArtist;
    var lat =[];
    var lon = [];

    function songObject(song, album, artist) { //object constructor for song Objects
        this.song = song;
        this.album = album;
        this.artist = artist;

        this.getSong = function() {
           return this.song;
        };

        this.getAlbum = function () {
           return this.album;
        };

        this.getArtist = function() {
           return this.artist;
        };
    };


    function callMusixMatch() {

        //replace spaces with + for API query string
        if(lyrics.indexOf(" ") > -1) {
            lyrics = lyrics.split(" ").join("+");
        }

        var apiKey = "67f5c5bdc18e9c5135509283dad3eab1";
        var queryURL = "https://api.musixmatch.com/ws/1.1/track.search?format=json&q_lyrics=" +
                         lyrics + "&quorum_factor=1&apikey=" + apiKey;

//        console.log(queryURL);

        $.ajax({
            url: queryURL,
            method: "GET"
        }).done(function(response) {

           // console.log(JSON.stringify(response));

            //parse response so it is readable
            var songList = JSON.parse(response);

            //set result count to the number of results returned (API returns max 10)
            var resultCount = (songList.message.body.track_list).length;

            //loop through the array of results returned
            for (i = 0; i < resultCount; i++) {

            //getting the info from API JSON and assigning to variables
                var songTitle = songList.message.body.track_list[i].track.track_name;
                console.log("Song Title-" + i + ":" + songTitle);

                var albumTitle = songList.message.body.track_list[i].track.album_name;
                console.log("Album Title-" + i + ":" + albumTitle);

                var artistName = songList.message.body.track_list[i].track.artist_name;
                console.log("Artist name-" + i + ":" + artistName);

                //creating a song object to hold data
                var tempSongObj = new songObject(songTitle,albumTitle,artistName);

                //adding song object to array
                songArray.push(tempSongObj);
            }

            displaySongResults();
            // Added this to make variable Global for Artist - Raf //
            globalArtist = songArray[0].artist;
            // Added function call to pull information for Global Arist Raf //
            requestMapLatLon(globalArtist);
            mySearch(globalArtist);
        });

    }

    function displaySongResults() {

        //loop through array of song objects
        for (i = 0; i < songArray.length; i++) {

            //getting data from song objects
            var tempSong = songArray[i].getSong();
            var tempAlbum = songArray[i].getAlbum();
            var tempArtist = songArray[i].getArtist();

            //add a row to display table for each song retrived
            $("#song-list").append("<div class='row'><div class='col-md-4'>" + tempSong + "</div><div class='col-md-4'>" +
                                    tempAlbum + "</div><div class='col-md-4'>" + tempArtist + "</div></div");
        }

    }

// Raf's Code: //
    function requestMapLatLon (bInTownSearch) {

          var queryURL = "https://rest.bandsintown.com/artists/"+ bInTownSearch +"/events?app_id=Test"

      $.ajax({
        url: queryURL,
        method: "GET"
      })

      // After the data from the AJAX request comes back
      .done(function(response) {
        console.log(response, "response from Raf's");
        latLonResults = response.length
        for ( var i = 0; i < latLonResults; i++){

            var venueLat = response[i].venue.latitude;
            var venueLon = response[i].venue.longitude;
            lat.push(venueLat);
            lon.push(venueLon);
            var tickets;
            var showConcertTicket = `<div class='col-md-12'> <a href="${tickets}" target='_blank'>${tickets ? "show " + i : "No Offers Found" } </a></div>`;
            if (response[i].offers.length !== 0) {
              tickets = response[i].offers[0].url;
              $("#tickets").append(showConcertTicket);
            } else {
              tickets = false;
            }

    console.log(lat);
    console.log(lon);

        };
      });
    };

// Israel's Code //

//Need a function to display the map on the screen
function initMap() {
    console.log(lat);
    console.log(lon);

  // Styles a map in night mode.
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.674, lng: -93.945},
    zoom: 3,
    styles: [
      {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
      {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{color: '#263c3f'}]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{color: '#6b9a76'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{color: '#38414e'}]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{color: '#212a37'}]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{color: '#9ca5b3'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{color: '#746855'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{color: '#1f2835'}]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{color: '#f3d19c'}]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{color: '#2f3948'}]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{color: '#d59563'}]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{color: '#17263c'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{color: '#515c6d'}]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{color: '#17263c'}]
      }
    ]
  });

  var concert1 = {lat: 41.87, lng: -87.63};

  var marker = new google.maps.Marker({
    position: concert1,
    map: map,
    label: "12",
    animation: google.maps.Animation.DROP
  })

}

    //event listener on the search button
    $("#search-button").on("click", function(event) {

        //prevent the search button from opening new page
        event.preventDefault();

        //get the lyrics from the text box entry
        lyrics = $("#search-input").val().trim();

        callMusixMatch();
        requestMapLatLon();
        initMap();
    });

// bryan's code

    var mySearch = function(myArtist) {
      $("#myInfo").html("");
      // myArtist = myArtist.replace(/ /g, "%20");
      var myUrl = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch="+ myArtist +" music&utf8=&format=json"

      $.ajax({
        url: myUrl,
        method: "GET"
      }).done(function(response){
        console.log(response);
        var myLen = response.query.search.length; //not necessary
        for (var i = 0; i < myLen; i++){
          var myLookup = response.query.search[i];
          var myTitle = myLookup.title;
          var link = (myTitle).replace(/ /g,"_");
          var tempAnchor = $("<a>");
          tempAnchor.attr({
            href: "https://en.wikipedia.org/wiki/"+link,
            target: "_blank"
          });
          tempAnchor.html(myTitle);
          $("#myInfo").append(tempAnchor);
          $("#myInfo").append("<br />");
          $("#myInfo").append(myLookup.snippet + "<br />");
        }
      });
    }

});

