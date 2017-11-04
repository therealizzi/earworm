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

//make sure window has finished loading
$(window).on( "load", function() { 


  var lyrics;
  var searchString;
  var song;
  var songArray = [];
  var globalArtist;
  var trackLyrics; 
  var mxmCopyright; 
  var lat =[];
  var lon = [];
  var date = [];
  var city = [];
  var venue = [];
  var lineUp = [];
  var response;
  var activeResult;

// Laura's Code //

//object constructor for song Objects
  function songObject(song, album, artist, id, genre) { 
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

        var albumTitle = songList.message.body.track_list[i].track.album_name;

        var artistName = songList.message.body.track_list[i].track.artist_name;

        var trackID = songList.message.body.track_list[i].track.track_id;

        //check if track has genre info, if so collect, if not set as "none"
        if (songList.message.body.track_list[i].track.primary_genres.music_genre_list[0] != null) {
          var trackGenre = songList.message.body.track_list[i].track.primary_genres.music_genre_list[0].music_genre.music_genre_name;
        }
        else {
          var trackGenre = "none";
        }
        

        //creating a song object to hold data
        var tempSongObj = new songObject(songTitle,albumTitle,artistName,trackID,trackGenre);

        //adding song object to array
        songArray.push(tempSongObj);
      }

      displaySongResults();

      //delay 2nd call to Musixmatch API to prevent server 429 error (too many, too fast)
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
 
  //pass clean artist data to Raf for BiT search
  function getMatch(index) {

    var choice = index;
    var tempMatch = songArray[choice].getArtist();

    //remove "/" from band names because BiT doesn't like those
    tempMatch = tempMatch.replace(/\//g," ");

    //remove featured artists, trim down to main artist
    tempMatch = (tempMatch.split(" feat.", 1));

    return tempMatch;

  }


  function displaySongResults() {

    //clear prior search result
    $("#song-list").empty();

    //reset table headers
    $("#song-list-hdr").empty();
    $("#song-list-hdr").append("<tr class='table-header'><th>Song</th><th>Album</th><th>Artist</th></tr>");

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

  //reset variables 
  function resetLyrics() {

    trackLyrics = " ";
    mxmCopyright = " ";

  }


  function getLyrics(index) {
    
    resetLyrics();
    var tempIndex = index;

    var track_id = songArray[tempIndex].getID();

    var apiKey = "67f5c5bdc18e9c5135509283dad3eab1";
    var queryURL = "https://api.musixmatch.com/ws/1.1/track.lyrics.get?format=json&callback=callback&track_id="
                    + track_id + "&apikey=" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).done(function(mxmresponse) {

        var lyricSearch = JSON.parse(mxmresponse);

        trackLyrics = lyricSearch.message.body.lyrics.lyrics_body;
        mxmCopyright = lyricSearch.message.body.lyrics.lyrics_copyright;

        //replace newline chars with breaks for display
        if(trackLyrics.indexOf("\n") > -1) {
            trackLyrics = trackLyrics.split("\n").join("<br>");
        }

        //cuts off lyrics before end of file warning
        trackLyrics = trackLyrics.split("*", 1);

        displayLyrics(songArray[tempIndex].getGenre());

        //must include copyright per terms of API
        $("#copyright-data").html(mxmCopyright);

    });

  }

  //change lyrics display font and graphics based on track genre
  function displayLyrics(genre) {

    var tempGenre = genre;

    switch (tempGenre) {

      case "Alternative":
        $("#lyric-box").css("background-image", "url('assets/images/hip-square.png')");
        $("#lyric-sample").css({"font":"bold 18px 'Waiting for the Sunrise', cursive","transform":"rotate(345deg)"});
        break;

      case "Blues":
        $("#lyric-box").css("background-image", "url('assets/images/cheap_diagonal_fabric.png')");
        $("#lyric-sample").css({"font":"14px 'Special Elite', cursive","transform":"rotate(355deg)"});
        break;

      case "Children's Music":
        $("#lyric-box").css("background-image", "url('assets/images/tree_bark.png')");
        $("#lyric-sample").css({"font":"20px 'Fredericka the Great', cursive","transform":"rotate(357deg)"});
        break;

      case "Christian & Gospel":
        $("#lyric-box").css("background-image", "url('assets/images/ep_naturalwhite.png')");
        $("#lyric-sample").css({"font":"22px 'Tangerine', cursive","transform":"rotate(358deg)"});
        break;

      case "Country":
        $("#lyric-box").css("background-image", "url('assets/images/straws_@2X.png')");
        $("#lyric-sample").css({"font":"22px 'Smokum', cursive","transform":"rotate(357deg)"});
        break;

      case "Dance":
        $("#lyric-box").css("background-image", "url('assets/images/ignasi_pattern_s.png')");
        $("#lyric-sample").css({"font":"12px 'Warnes', cursive","transform":"rotate(346deg)"});
        break;

      case "Easy Listening":
        $("#lyric-box").css("background-image", "url('assets/images/foggy_birds_@2X.png')");
        $("#lyric-sample").css({"font":"14px 'Lekton', sans-serif","transform":"rotate(350deg)"});
        break;

      case "Electronic":
        $("#lyric-box").css("background-image", "url('assets/images/skulls.png')");
        $("#lyric-sample").css({"font":"16px 'Baumans', cursive","transform":"rotate(348deg)"});
        break;

      case "Folk":
        $("#lyric-box").css("background-image", "url('assets/images/knitting250px.png')");
        $("#lyric-sample").css({"font":"18px 'Reenie Beanie', cursive","transform":"rotate(347deg)"});
        break;

      case "Hip Hop/Rap":
        $("#lyric-box").css("background-image", "url('assets/images/wall4_@2X.png')");
        $("#lyric-sample").css({"font":"bold 16px 'Shadows Into Light', cursive","transform":"rotate(353deg)"});
        break;

      case "Heavy Metal":
        $("#lyric-box").css("background-image", "url('assets/images/stonehaven.png')");
        $("#lyric-sample").css({"font":"16px 'New Rocker', cursive","transform":"rotate(355deg)"});
        break;

      case "Holiday":
        $("#lyric-box").css("background-image", "url('assets/images/new_year_background.png')");
        $("#lyric-sample").css({"font":"bold 16px 'Spirax', cursive","transform":"rotate(355deg)"});
        break;

       case "Jazz":
        $("#lyric-box").css("background-image", "url('assets/images/round.png')");
        $("#lyric-sample").css({"font":"bold 22px 'Ruthie', cursive","transform":"rotate(350deg)"});
        break;

      case "Pop":
        $("#lyric-box").css("background-image", "url('assets/images/memphis-colorful.png')");
        $("#lyric-sample").css({"font":"16px 'Henny Penny', cursive","transform":"rotate(355deg)"});
        break;

      case "R&B/Soul":
        $("#lyric-box").css("background-image", "url('assets/images/leather_1_@2X.png')");
        $("#lyric-sample").css({"font":"18px 'Seaweed Script', cursive","transform":"rotate(352deg)"});
        break;

      case "Reggae":
        $("#lyric-box").css("background-image", "url('assets/images/arches_@2X.png')");
        $("#lyric-sample").css({"font":"bold 16px 'Give You Glory', cursive","transform":"rotate(351deg)"});
        break;

      case "Rock":
        $("#lyric-box").css("background-image", "url('assets/images/brickwall_@2X.png')");
        $("#lyric-sample").css({"font":"16px 'Love Ya Like A Sister', cursive","transform":"rotate(347deg)"});
        break;

      case "Singer/Songwriter":
        $("#lyric-box").css("background-image", "url('assets/images/roughcloth_@2X.png')");
        $("#lyric-sample").css({"font":"bold 18px 'Dawning of a New Day', cursive","transform":"rotate(347deg)"});
        break;

      case "Soundtrack":
        $("#lyric-box").css("background-image", "url('assets/images/old_map.png')");
        $("#lyric-sample").css({"font":"bold 18px 'Jim Nightshade', cursive","transform":"rotate(356deg)"});
        break;

      case "World":
        $("#lyric-box").css("background-image", "url('assets/images/ravenna_@2X.png')");
        $("#lyric-sample").css({"font":"18px 'Almendra SC', serif","transform":"rotate(355deg)"});
        break;

      default:
        $("#lyric-box").css("background-image", "url('assets/images/ricepaper_v3_@2X.png')");
        $("#lyric-sample").css({"font":"bold 18px 'Waiting for the Sunrise', cursive","transform":"rotate(355deg)"});

    }

      // display lyrics
      $("#lyric-sample").html(trackLyrics);

  }

  //remove special characters from user input (validation)
  //this regexp is sufficient for our app because we are only searching english language lyrics
  function removeSpecialChars(string) {

    var tempString = string;
    tempString = tempString.replace(/(?!\w|\s)./g, " ").replace(/_/g," ");
    
    return tempString.trim();

  }

  //event listener on the search button -- in search bar (main and mobile)
  $(".search-button").on("click", function(event) {

      //prevent the search button from opening new page
      event.preventDefault();

      //get the search string from the text box entry
      $.each($(".search-input"),function(){
        //validate user input, make sure something was entered
        if($(this).val().trim() !== ""){
          //remove extra spaces
          searchString = $(this).val().trim();
          //clear search box
          $(this).val("");
        }
      });

      //validate user input, remove any special characters
      removeSpecialChars(searchString);

      callMusixMatch();

  });

  // Event listener for 'enter' keypress
  $(".search-input").keypress(function(e){

    if(e.keyCode == 13){

      //prevent the search button from opening new page
      event.preventDefault();

      //get the search string from the text box entry
      $.each($(".search-input"),function(){
        //validate user input, make sure something was entered
        if($(this).val().trim() !== ""){
          //remove extra spaces
          searchString = $(this).val().trim();
          //clear search box
          $(this).val("");
        }

      });

      //validate user input, remove any special characters
      removeSpecialChars(searchString);

      callMusixMatch();

    }
  })

  //event listener on the search button -- on initial search page
  $("#search-button-init").on("click", function(event) {

      //prevent the search button from opening new page
      event.preventDefault();

      //get the search string from the text box entry
      searchString = $("#search-initial").val().trim();

      //validate user input, remove any special characters
      removeSpecialChars(searchString);

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
    $('#venues-and-dates').empty();
  }

  function requestMapLatLon (bInTownSearch) {
    
    //reset table headers
    $("#ticket-header").empty();

    // Append Headers to table //
    $("#ticket-header").append("<tr class='table-header'><th>Show Date</th><th>Venue Name</th><th>Ticket Link</th></tr>")

    // Calls the function above to reset previous search results //
    resetBITSearch();
    //Variable that enters the first search result into Bands In Town API hyperlink //
    var queryURL = "https://rest.bandsintown.com/artists/"+ bInTownSearch +"/events?app_id=Test"

    $.ajax({
      url: queryURL,
      method: "GET"
    })

    // After the data from the AJAX request comes back //
    .done(function(response) {
      // Created a variable to count the number of responses that come back from the BIT API Call //
      latLonResults = response.length

      // Created a for loop
      for ( var i = 0; i < latLonResults; i++){

        // Set variable for venue latitude from API response //
        var venueLat = response[i].venue.latitude;

        // Set variable for venue longitude from API response //
        var venueLon = response[i].venue.longitude;

        // Set variable for venue name from API response //
        var venueName = response[i].venue.name;

        // Set variable for city name from API response //
        var cityName = response[i].venue.city;

        // Set variable for city to fill array //
        var city = [];

        // Set variable for concert date //
        var concertDate = response[i].datetime;

        // Set variable for performing artists //
        var performingArtists = response[i].lineup;

        // Created a variable with url for ticket purchase //
        tickets = response[i].url;

        // Set variable fpr date from API response to convert later into MM-DD-YYYY //
        var tmpDate = new Date(concertDate)

        //Created variable for short date conversion //
        var shortDate = convertDate(tmpDate);

        // Push venue latitutude into lat Array and make Global Variable //
        lat.push(Number(venueLat));

        // Push venue longitude into lon Array and make Global Variable //
        lon.push(Number(venueLon));

        // Push string See "artist" live "listing venue name and date" //
        contentString.push("See "+response[i].lineup["0"]+ " LIVE <br>"+response[i].venue.name+"<br>"+response[i].datetime);

        // Push venue name into global venue array //
        venue.push(venueName);

        // Push venue name into global venue array //
        lineUp.push(performingArtists);

        // Push cityname into global city array //
        city.push(cityName);

        // Push date into global date array //
        date.push(shortDate);

        // Function taking the venue date and converting it to MM-DD-YYYY //
        function convertDate(inputFormat) {

        // Function to arrange date from ISO date into correct format //
        function pad(s) { return (s < 10) ? '0' + s : s; }

        // Creating a variable that stores the passed input date from API //
        var d = new Date(inputFormat);

        // Returns the date with padding (0 in from of 1 digit number) into MM-DD-YYYY format //
        return [pad(d.getMonth()+1), pad(d.getDate()), d.getFullYear()].join('/');
        };

        // Creating a variable  to store ticket hyperlink //
        var showConcertTicket = `<div class='col-md-12'> <a href="${tickets}" target='_blank'>Get Tickets</a></div>`;


        // Appends date, venue name, and tickets to table on results page //
        $("#venues-and-dates").append("<tr class='venues-date-tickets' value='" + i + "'><td>" +
                              shortDate + "</td><td>" + venueName + "</td><td>" +
                              showConcertTicket + "</td></tr");
      };
      initMap()
    });
  };

  // Function that provides Related information for selected artist
  var mySearch = function(myArtist) {

    // checks document width and assigns the appropriate number to variable
    var myLen = $(document).width() <= 600 ? 2 : 3;

    // Request URL for ajax call
    var myUrl = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch="+ myArtist +" music&utf8=&format=json"

    // ajax call
    $.ajax({
      url: myUrl,
      method: "GET"

    // if ajax call is successful then the window populates with related info
    }).done(function(response){

      // append info to container with artist_info id
      $("#artist_info").append("<div id='artist_info_cards' class='row'></div>");
      
      // loop the number of cards based on width of document
      for (var i = 0; i < myLen; i++){

        // Assigns search object to myLookup
        var myLookup = response.query.search[i];

        // Assigns title of wiki page to myTitle
        var myTitle = myLookup.title;

        // Replaces all spaces within the title with underscores
        var link = (myTitle).replace(/ /g,"_");

        // Appends related info to DOM
        $("#artist_info_cards").append("<div class='col s6 m4 l4'>"
          +  "<div class='card cardColor'>"
          +    "<div class='card-content white-text cardHeight'>"
          +      "<span id='myCard-0"+ i +"' class='card-title'>"
          +         myTitle
          +      "</span>"
          +      "<p>" 
          +        myLookup.snippet + "..." 
          +      "</p>"
          +    "</div>"
          +    "<div class='card-action'>"
          +      "<a href='https://en.wikipedia.org/wiki/" + link +"' target='_blank'>"
          +        "Click for Wiki Info"
          +      "</a>"
          +    "</div>"
          +  "</div>"
          +"</div>"
        );  
      }
    });
  }

  // Function to provide DOM with image of artist / band
  var artistInfoSearch = function(myArtist) {

    // removes related info for each call
    $("#artist_info").empty();

    // Appends Header tag
    $("#artist_info").append("<h3 class='header pull-l4'>Related Information</h3>");
    
    // assigning base URL to baseURL variable
    var baseURL =  "http://ws.audioscrobbler.com/2.0/"; // add ?method=artist.getinfo&artist=
    
    // assigns api key to api_key variable
    var api_key = "c3e14eca8563f82a1805f30ced79d395"; //param: &api_key=

    // assigns necessary information for request
    var queryURL = baseURL + "?method=artist.search&artist=" + globalArtist + "&api_key=" + api_key+
      "&format=json";
    
    // ajax call
    $.ajax({
      url: queryURL,
      method: 'GET',

      // callback function executed if request was successful
      success: function(response){

        // Name of the artist
        var artName = response.results.artistmatches.artist[0].name;
        
        // assigns the last image in the JSON file
        var lastImgIndex = response.results.artistmatches.artist[0].image.length - 1;
        
        // assigns image URL
        var artImg = response.results.artistmatches.artist[0].image[lastImgIndex]["#text"];
        
        // Sets the SRC attribute with the artist image in the container with artists_img id
        $("#artists_img").attr("src",artImg);
        $('.parallax').parallax();
      }
    });
  }

  // Event Listener for click on brand logo 'EarWorm'
  $(".brand-logo").on("click", function(){
    
    //hide search page
    $("#wrapper-init").css("display", "block");

    //show main page
    $("#wrapper-main").css("display", "none");
  });
});
