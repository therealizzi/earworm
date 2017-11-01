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

// //google has to initiate maps prior to page load

// function initMap() {};

// life saving code above ----- DO NOT DELETE //


// Laura's Code //

$(window).on("load", function() { //make sure window has finished loading

  var lyrics;
  var searchString;
  var song;
  var songArray = [];
  var globalArtist;
  var lat =[];
  var lon = [];
  var date = [];
  var city = [];
  var venue = [];
  var lineUp = [];
  var response;
  var activeResult;

  function songObject(song, album, artist, id, genre) { //object constructor for song Objects
    this.song = song;
    this.album = album;
    this.artist = artist;
    this.id = id;
    this.genre = genre;

    this.getSong = function() {
       return this.song;
    };

    this.getAlbum = function () {
       return this.album;
    };

    this.getArtist = function() {
       return this.artist;
    };
    
    this.getID = function() {
       return this.id;
    };
    this.getGenre = function() {
       return this.genre;
    };
  };

  function callMusixMatch() {

    //replace spaces with + for API query string
    if(searchString.indexOf(" ") > -1) {
        searchString = searchString.split(" ").join("+");
    }

    var apiKey = "67f5c5bdc18e9c5135509283dad3eab1";
    // var queryURL = "https://api.musixmatch.com/ws/1.1/track.search?format=json&q_lyrics=" +
    //                  lyrics + "&quorum_factor=1&apikey=" + apiKey;
    var queryURL = "https://api.musixmatch.com/ws/1.1/track.search?format=json&q=" + searchString + 
        "&f_lyrics_language=en&f_has_lyrics=1&s_track_rating=desc&quorum_factor=1&apikey=" + apiKey;



    $.ajax({
        url: queryURL,
        method: "GET"
    }).done(function(mxmresponse) {

      //reset variables prior to new search;
      resetSearch();
      
      //parse response so it is readable
      var songList = JSON.parse(mxmresponse);

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

        var trackID = songList.message.body.track_list[i].track.track_id;
        console.log("Track ID-" + i + ":" + trackID);

        if (songList.message.body.track_list[i].track.primary_genres.music_genre_list[0] != null) {
          var trackGenre = songList.message.body.track_list[i].track.primary_genres.music_genre_list[0].music_genre.music_genre_name;
        } 
        else {
          var trackGenre = "none";
        }
        console.log("Track Genre-" + i + ":" + trackGenre);

        //creating a song object to hold data
        var tempSongObj = new songObject(songTitle,albumTitle,artistName,trackID,trackGenre);

        //adding song object to array
        songArray.push(tempSongObj);
      }

      displaySongResults();

      //delay call to prevent server 429 error (too many, too fast)
      setTimeout(getLyrics, 1000, 0);

      // Added this to make variable Global for Artist - Raf 
      globalArtist = getMatch(0); // first result

      requestMapLatLon(globalArtist);

      artistInfoSearch(globalArtist);

      mySearch(globalArtist);

    });

  }

  //empty prior search results array and globalArtist
  function resetSearch() {
    
    songArray = [];
    globalArtist = "";

  }
  
  // Added function call to pull information for Global Arist Raf //
  function getMatch(index) {

    var choice = index;

    return songArray[choice].getArtist();

  }

  function displaySongResults() {

    //clear prior search result
    $("#song-list").empty();
    $("#song-list-hdr").empty()
    $("#song-list-hdr").append("<tr><th>Song</th><th>Album</th><th>Artist</th></tr>")
    //show table header
    // $("#song-list-hdr").css("visibility", "visible");

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
      if (i === 0) {
        
        //show first result as active in table
        $(".result-list").addClass("active");
        
        //saving the value of active element in global variable so can reset later
        activeResult = i;
      }
    }
          
      // event listener for the results table
      $(".result-list").on("click", function(event) {

        //get the value(index) of the table row selected
        var choice = $(this).attr("value");

        //set the table row as active
        $(this).addClass("active");

        //get the current active row and make inactive
        $(".result-list[value=" + activeResult + "]").removeClass("active");

        //saving the value of active element in global variable so can reset later
        activeResult = choice;

        //get the artist and make it global
        globalArtist = getMatch(choice);

        //call to get lyrics for new selection
        getLyrics(choice);

        requestMapLatLon(globalArtist);
        
        artistInfoSearch(globalArtist);

        mySearch(globalArtist);
        
      });
  }

  function getLyrics(index) {
    
    var track_id = songArray[index].getID();
    var apiKey = "67f5c5bdc18e9c5135509283dad3eab1";
    var queryURL = "https://api.musixmatch.com/ws/1.1/track.lyrics.get?format=json&callback=callback&track_id="  
                    + track_id + "&apikey=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).done(function(mxmresponse) {

    var lyricSearch = JSON.parse(mxmresponse);

    var trackLyrics = lyricSearch.message.body.lyrics.lyrics_body;
    var mxmCopyright = lyricSearch.message.body.lyrics.lyrics_copyright;

    //replace newline chars with breaks for display
    if(trackLyrics.indexOf("\n") > -1) {
        trackLyrics = trackLyrics.split("\n").join("<br>");
    }

    //cuts off lyrics before end of file warning
    trackLyrics = trackLyrics.split("*", 1);

    // display lyrics
    $("#lyric-sample").html(trackLyrics);

    });

  }


  //event listener on the search button -- in search bar
  $(".search-button").on("click", function(event) {

      //prevent the search button from opening new page
      event.preventDefault();

      //get the search string from the text box entry
      // this method can be found in one of the solutions to the homework assignment
      //   this is in essence the same as for each, which is a loop that 
      $.each($(".search-input"),function(){
        if($(this).val().trim() !== ""){
          searchString = $(this).val().trim();
          $(this).val("");  
        }
      });
      
      callMusixMatch();
      
      //clear search box
      $("#search-input").val("");

  });

  // Event listener for 'enter' keypress
  $(".search-input").keypress(function(e){
    console.log(e);
    if(e.keyCode == 13){
      //prevent the search button from opening new page
      event.preventDefault();

      //get the search string from the text box entry
      $.each($(".search-input"),function(){
        if($(this).val().trim() !== ""){
          searchString = $(this).val().trim();  
          $(this).val("");
        }

      });

      callMusixMatch();
      
      //clear search box
      $("#search-input").val("");
    }
  })

  //event listener on the search button -- on initial search page
  $("#search-button-init").on("click", function(event) {

      //prevent the search button from opening new page
      event.preventDefault();

      //get the search string from the text box entry
      searchString = $("#search-initial").val().trim();

      callMusixMatch();
      
      //clear search box
      $("#search-initial").val("");

      //hide initial search page, reveal main page
      toggleWrappers();

  });

  function toggleWrappers() {

    //hide search page
    $("#wrapper-init").css("display", "none");

    //show main page
    $("#wrapper-main").css("display", "block");

  }

  // Israel's Code //

  //Need a function to display the map on the screen
  var map;
  var markers = [];
  var infowindows = [];
  var contentString = [];

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

    // Asks user for permission to plot their location on the map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Sets an InfoWindow for the user's Location
        var userWindow = new google.maps.InfoWindow;
        userWindow.setPosition(pos);
        userWindow.setContent('<h4>You</h4>');
        userWindow.open(map);
        map.setCenter(pos);

        // Sets a click-listener to remove the InfoWindow
        map.addListener('click', function() {
        userWindow.close(map, marker);
        });

        // Handle's errors if location can't be found
      }, function() {
            handleLocationError(true, userWindow, map.getCenter());
         });
    } else {

      // If the browser doesn't support Geolocation
      handleLocationError(false, userWindow, map.getCenter());
    }

    // Loops through the concert Lat/Lon and plots markers on the map
    for (i = 0; i < lat.length; i++){

      // Sets the marker "icon"
      var icon = {
        url: 'http://www.clker.com/cliparts/U/T/s/x/w/E/mic-md.png',
        scaledSize: new google.maps.Size(30,30)
      };

      // Sets the marker position
      var infowindow = new google.maps.InfoWindow();

      // Generates a marker, assigning position, icon, title and animation
      var marker = new google.maps.Marker({
        position: {lat:lat[i], lng:lon[i]},
        map: map,
        icon: icon,
        title: "See "+lineUp[i]+" live at "+venue[i],
        animation: google.maps.Animation.DROP
      });

      // Creates an "infoWindow" click event and assigns content to the window
      google.maps.event.addListener(marker, 'click', (function (marker, i) {
        return function () {
          map.setCenter(marker.position);
          infowindow.setContent(contentString[i]);
          infowindow.open(map, marker);


          //PUT HTML MANIPULATORS HERE - LINK MAP TO TICKETS::

          $("#tickets").html(contentString[i])


          //PUT HTML MANIPULATORS HERE - LINK MAP TO TICKETS::

        }  
      })(marker, i));
    };
  };

  // If browser errors, this notifies the user and loads the map
  function handleLocationError(browserHasGeolocation, infowindow, pos) {
  infowindow.setPosition(pos);
  infowindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infowindow.open(map);
  }

  // Raf's Code: //

  //empty prior search results array
  function resetBITSearch() {
    
    lat = [];
    lon = [];
    date = [];
    city = [];
    venue = [];
    lineUp = [];
    contentString = [];
    // $("#tickets").empty();
    $('#venues-and-dates').empty();

    console.log(venue);
    console.log(lineUp);

  }

  function requestMapLatLon (bInTownSearch) {

    resetBITSearch();

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
        var venueName = response[i].venue.name;
        var city = [];
        var concertDate = response[i].datetime;
        var tmpDate = new Date(concertDate)

        lat.push(Number(venueLat));
        lon.push(Number(venueLon));
        contentString.push("See "+response[i].lineup["0"]+ " LIVE <br>"+response[i].venue.name+"<br>"+response[i].datetime);
        venue.push(response[i].venue.name);
        lineUp.push(response[i].lineup);
        city.push(response[i].venue.city);
        date.push(response[i].datetime);

        function convertDate(inputFormat) {
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        return [pad(d.getMonth()+1), pad(d.getDate()), d.getFullYear()].join('/');
        };

        var shortDate = convertDate(tmpDate);

        tickets = response[i].url;
        var showConcertTicket = `<div class='col-md-12'> <a href="${tickets}" target='_blank'>${tickets ? "Get Tickets" : "Sold Out Show" } </a></div>`;

      $("#venues-and-dates").append("<tr class='venue-list' value='" + i + "'><td>" +
                              shortDate + "</td><td>" + venueName + "</td><td>" +
                              showConcertTicket + "</td></tr");
      };
      initMap()
    });
  };

  // bryan's code
  var mySearch = function(myArtist) {

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
        $("#artist_info").append(tempAnchor);
        $("#artist_info").append("<br />");
        $("#artist_info").append(myLookup.snippet + "<br />");
      }
    });
  }

  var artistInfoSearch = function(myArtist) {
    $("#artist_info").empty();
    $("#artist_info").append("<h3 class='header pull-l4'>Artist Information</h3>");
    var baseURL =  "http://ws.audioscrobbler.com/2.0/"; // add ?method=artist.getinfo&artist=
    var api_key = "c3e14eca8563f82a1805f30ced79d395"; //param: &api_key=
    //&format=json
    var queryURL = baseURL + "?method=artist.search&artist=" + globalArtist + "&api_key=" + api_key+
      "&format=json"; 
    $.ajax({
      url: queryURL,
      method: 'GET',
      success: function(response){
        console.log(response);
        var artName = response.results.artistmatches.artist[0].name;
        var lastImgIndex = response.results.artistmatches.artist[0].image.length - 1;
        var artImg = response.results.artistmatches.artist[0].image[lastImgIndex]["#text"];
        $("#artist_info").append("<h5>Name: " + artName + "</h5><br>");
        $("#artists_img").attr("src",artImg);
        $('.parallax').parallax();
      }
    })
  }
  $(".brand-logo").on("click", function(){
        //hide search page
    $("#wrapper-init").css("display", "block");

    //show main page
    $("#wrapper-main").css("display", "none");
  })
});
