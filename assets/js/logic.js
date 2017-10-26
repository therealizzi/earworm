 $(window).on( "load", function() { //make sure window has finished loading

    var lyrics;
    var song;
    var songArray = [];


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

//            console.log(JSON.stringify(response));

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

    //event listener on the search button
    $("#search-button").on("click", function(event) {

        //prevent the search button from opening new page
        event.preventDefault();

        //get the lyrics from the text box entry
        lyrics = $("#search-input").val().trim();
        console.log(lyrics);

        callMusixMatch();
        callLastFM();

    });

//Need a function to display the map on the screen
function initMap() {

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

// Raf's Code: //

        function requestMapLatLon (artist) {

          if(artist.indexOf(" ") > -1) {
            artist = artist.split(" ").join("%20");
        }
          var queryURL = "https://rest.bandsintown.com/artists/"+artist+"/events?app_id=Test"

      $.ajax({
        url: queryURL,
        method: "GET"
      })

      // After the data from the AJAX request comes back
      .done(function(response) {
        for ( var i = 0; i < 10; i++){
            var lat = response[i].venue.latitude;
            var lon = response[i].venue.longitude;
            console.log(lat);
            console.log(lon);
        };
      });
  };

            requestMapLatLon ("Katy Perry");

});
