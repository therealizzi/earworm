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

function initMap() {};
// life saving code above ----- DO NOT DELETE //


// Laura's Code //

$(window).on( "load", function() { //make sure window has finished loading

    var lyrics;
    var song;
    var songArray = [];
    var globalArtist;
    var lat =[];
    var lon = [];
    var date = [];
    var city = [];
    var response;

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

            //reset variables prior to new search;
            resetSearch();

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
            globalArtist = getFirstMatch();

            // Added function call to pull information for Global Arist Raf //
            requestMapLatLon(globalArtist);

            mySearch(globalArtist);
        });
    }

    //empty prior search results array and globalArtist
    function resetSearch() {
      
      songArray = [];
      globalArtist = "";

    }
    
    // Added function call to pull information for Global Arist Raf //
    function getFirstMatch() {

      var index = 0;

      return songArray[index].artist;

    }

    function displaySongResults() {

        //clear prior search result
        $("#song-list").empty();
 
        //loop through array of song objects
        for (var i = 0; i < songArray.length; i++) {

            //getting data from song objects
            var tempSong = songArray[i].getSong();
            var tempAlbum = songArray[i].getAlbum();
            var tempArtist = songArray[i].getArtist();

            //add a row to display table for each song retrived
            $("#song-list").append("<tr class='result-list' value='" + i + "'><td>" + 
                                    tempSong + "</td><td>" + tempAlbum + "</td><td>" + 
                                    tempArtist + "</td></tr");
        }

        // event listener for the results table
        $(".result-list").on("click", function(event) {

            //get the value(index) of the table row selected
            var choice = $(this).attr("value");

            //get the artist and make it global
            globalArtist = songArray[choice].getArtist();

            //call other functions
            requestMapLatLon(globalArtist);
            
            mySearch(globalArtist);
            
        });
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

// Israel's Code //

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

    for (i = 0; i < lat.length; i++){
      console.log(lat[i])
      console.log(lon[i])

      var icon = {
        url: 'http://www.clker.com/cliparts/U/T/s/x/w/E/mic-md.png',
        scaledSize: new google.maps.Size(30,30)
      };

      var marker = new google.maps.Marker({
        position: {lat:lat[i], lng:lon[i]},
        map: map,
        icon: icon,
        title: city[i]+" "+date[i],
        animation: google.maps.Animation.DROP
  });
  };
};

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
        lat.push(Number(venueLat));
        lon.push(Number(venueLon));
        city.push(response[i].venue.city)
        date.push(response[i].datetime);
        var tickets;
        var showConcertTicket = `<div class='col-md-12'> <a href="${tickets}" target='_blank'>${tickets ? "show " + i : "No Offers Found" } </a></div>`;
        if (response[i].offers.length !== 0) {
          tickets = response[i].offers[0].url;
          $("#tickets").append(showConcertTicket);
        } else {
          tickets = false;
        }
    };
        initMap()
  });
};

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
