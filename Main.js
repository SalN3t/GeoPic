var mymap =undefined;
var radius_circle = new L.circle([24.52609, 46.801119],20);
let element ;

// Your web app's Firebase configuration
  // Initialize Firebase
  firebase.initializeApp(config["firebaseConfig"]);

  var messageAppReference = firebase.database();
  var pictureRating = messageAppReference.ref('pictureRating');


        function RateIt(id, rating,modelElem, oldElement) {
          
          // update votes property
          if(oldElement != undefined){
            
            // find message whose objectId is equal to the id we're searching with

            var pRating = firebase.database().ref('pictureRating/' + id);
            let newRating = (((parseFloat(oldElement[id].rating) * parseFloat(oldElement[id].totalPeople) )) + rating )/ (parseInt(oldElement[id].totalPeople)+1);
          pRating.update({
            rating: newRating,
            totalPeople: parseInt(oldElement[id].totalPeople)+1,
            orderScore: -5 * (parseInt(oldElement[id].totalPeople)+1 * newRating)
          })
        }else{
          console.log("Creating a new record");
          // create new record
          pictureRating.push({
          url: modelElem["url"],
          rating: rating,
           totalPeople:1,
           lat:modelElem["lat"],
           lon:modelElem["lon"],
           orderScore: -1*(1 * rating)
        });
        }
        }

$(function() {
  initSettings();
  
  // With JQuery
$("#radius").slider();
$("#radius").on("slide", function(slideEvt) {
  //searchOptions.radius = slideEvt.value;
	$("#ex6SliderVal").text(slideEvt.value);
});

    var tags_txt = 'landscape';
$("#btnTxt").on('click',function(){
  
  searchOptions.radius =  $("#radius").val();
  searchOptions.tags =  $("#txtArea1").val().split("#").filter(function(el){return el != null && el != ""}).join(",");
});

    function handleResponseSuccess(response) {
      
        // // Clear
        $('.images').html("");
        let allData = response.photos.photo; // not a jQuery object, so we have to use $.each below
        $("#totalFoundPictures").html(allData.length);
        $.each(allData, function() {
          // photos without titles may not be carefully tagged, so exclude them 
          let url = this.url_n;

          let title = this.title;
          if (this.title !== '') {
            element = $('<img>').attr('src', this.url_n).addClass('image').css("height",'80px').css("width",'80px');
            element.click(function(){
              $("#myModal").css('display', "block");              
              $("#rateYoModel").val(url);
              $("#rateYoModel").rateYo.rating = 0.0;
              $("#coord").val(searchOptions.lat+","+searchOptions.lon);
              
            $("#img01").attr('src',url);
            $("#caption").html(title);
            });
            $('.images').append(element);
          }
        });
      }
      function initSettings(){
        searchOptions = {
          method: 'flickr.photos.search', // endpoint
          api_key: config.flicker["api_key"], // stored in js/keys.js
          tags:'landscape',
          media: 'photos',
          lat: "24.342",
          lon: "43.454",
          radius: 10,
          radius_units: 'mi',
          format: 'json',
          nojsoncallback: 1,

          extras: 'url_n',
          content_type: 1,
          safe_search: 1,
          sort: 'relevance',
        };
      }

      // ----
      function picture_based_on_location(position){
          // Update the circle on map
      mymap.removeLayer(radius_circle);
      if(marker != undefined)mymap.removeLayer(marker);
      radius_circle = new L.circle([position.coords.latitude, position.coords.longitude],parseInt(searchOptions.radius)).addTo(mymap);


        // Now that we have the user's location, let's search the API for landscape photos nearby
        let url = 'https://api.flickr.com/services/rest/?'; // base URL

        searchOptions.lat= position.coords.latitude;
        searchOptions.lon = position.coords.longitude;

        for (let key in searchOptions) {
          url += '&' + key + '=' + searchOptions[key];
        }   
        // Now that we've built our URL, we can send our GET request
        $.get(url).done(function(response) {
          if (response.stat === 'fail') {
        // way of seeing if there's an error while we're building the app
          } else if (response.photos.photo.length === 0) {
            $("#totalFoundPictures").html(0); // reset
            $('.images').html("No Photos Found Try Another Location!"); // Reset
          } else {
            // Handle the successful response here
            // to make sure our code is working to this point
            handleResponseSuccess(response);
          }
        });
   
   
    }



   // check if navigator geolocation is available from the browser
   if (navigator.geolocation) {
    // if it is use the getCurrentPosition method to retrieve the Window's location
    navigator.geolocation.getCurrentPosition(function(position) {
      // console.log('lat: ' + position.coords.latitude);
      // console.log('lon: ' + position.coords.longitude);
 
 // All code from here on down is new code, including the closing });
picture_based_on_location(position);
})
  } else {
    $('.images').append('Sorry, the browser does not support geolocation');
  }



  // Geo 
  mymap = L.map('mapid', {attributionControl: false}).setView([24.221919, 44.917603], 5);

  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      id: 'mapbox/streets-v11'
  }).addTo(mymap);


  var popup = L.popup();

  function onMapClick(e) {
      var position={
        "coords":{
            "latitude":e.latlng.lat,
            "longitude":e.latlng.lng,
        }
      }
    picture_based_on_location(position);
      popup
          .setLatLng(e.latlng)
          .setContent("You clicked the map at " + e.latlng.toString())
          .openOn(mymap);
  }

  mymap.on('click', onMapClick);




  });