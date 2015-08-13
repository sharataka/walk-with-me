angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state, $ionicLoading, Chats) {
  
  // window.localStorage.removeItem('locations');
  
  
  $scope.windowWidth = window.innerWidth;
  var currentUser = Parse.User.current();
  $scope.locations = '';
  $scope.refresh_message = "Answer the pictures above to get more...";
  $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          duration: 5000
        });



  if (currentUser) {

    if ( (window.localStorage['locations']) == undefined ) {
      $scope.locations = getlocations(currentUser);
    }

    else {
        var testObject = JSON.parse(window.localStorage['locations']);

        // If there are still items in localstorage
        if (testObject.length > 0) {
          $scope.locations = testObject;
          $ionicLoading.hide();
        }

        // If there aren't items in localstorage, make a db call
        else {
          $scope.locations == getlocations(currentUser);
        }
        
      }

  } 
  // END OF IF CURRENTUSER EXISTS


  // IF THERE IS NO CURRENT USER
  else {
      // show the signup or login page
      $ionicLoading.hide();
      $state.go('login');
  }
  // END OF IF NO CURRENT USER


  //LOGOUT BUTTON
  $scope.logout = function(item,event){
    Parse.User.logOut();
    window.localStorage.clear();
    $state.go('login');
  };
  // END OF LOGUT BUTTON

  // REFRESH
  $scope.refresh = function () {
    window.location.reload(true);  
  };
  // END OF REFRESH


  // Make db call to get locations
  function getlocations(currentUser){
    var Result = Parse.Object.extend("Result");
    var result_query = new Parse.Query(Result);
    result_query.equalTo("user", currentUser.id);
    result_query.find({

    success: function(results) {

        user_result = [];
        for (var i = 0; i < results.length; i++) {
          var object = results[i];
          user_result.push(object.get('locationId'));
        }


        var CoorList = Parse.Object.extend("CoorList");
        var query = new Parse.Query(CoorList);
        query.descending("createdAt");
        query.notContainedIn("objectId", user_result);
        query.limit(2);
        query.find({
                  
        success: function(locations) {
          
          window.localStorage['locations'] = JSON.stringify(locations);
          var testObject = JSON.parse(window.localStorage['locations']);
          $scope.locations = testObject;

            
          if (locations.length == 0){
            $scope.refresh_message = "You've played all of our pictures. But we'll have more tomorrow so come back...";
          }

          $ionicLoading.hide();
            
        },

        error: function(error){
          alert("Error: " + error.code + " " + error.message);
          $ionicLoading.hide();
        }

      });

      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
        $ionicLoading.hide();
      }
    });
    // END OF PARSE DB QUERY

  }
  // End of getlocations
  
})
// END OF HOME CONTROLLER

.controller('LoginFormCtrl', function($scope, $state, $cordovaFacebook) {
$scope.data = {
    'username' : '',
    'password' : ''
  };
  

  //Click button to login
  $scope.login = function(item,event){

    Parse.User.logIn('sharataka', 'goldengun', {
      success: function(user) {
        $state.go('tab.dash');
      },
      error: function(user, error) {
        alert(error.message + '. Make sure you enter the right username and password!');

      }
    });

  };
})

.controller('LoginCtrl', function($scope, $state, $cordovaFacebook) {

// var auth = $firebaseAuth(fb);

// Data bind the username and password fields
$scope.data = {
    'username' : '',
    'password' : ''
  };
  

  //Click button to login
  $scope.login = function(item,event){

    Parse.User.logIn('sharataka', 'goldengun', {
      success: function(user) {
        $state.go('tab.dash');
      },
      error: function(user, error) {
        alert(error.message + '. Make sure you enter the right username and password!');

      }
    });

  };
  
  


$scope.loginFacebook = function(){
 
  //Browser Login
  if(!(ionic.Platform.isIOS() || ionic.Platform.isAndroid())){
 
    Parse.FacebookUtils.logIn(null, {
      success: function(user) {
        console.log(user);
        if (!user.existed()) {
          $state.go('tab.dash');
        } else {
          $state.go('tab.dash');
        }
      },
      error: function(user, error) {
        alert("User cancelled the Facebook login or did not fully authorize.");
      }
    });
 
  } 
  //Native Login
  else {
 
    $cordovaFacebook.login(["public_profile", "email"]).then(function(success){
 
      console.log(success);
 
      //Need to convert expiresIn format from FB to date
      var expiration_date = new Date();
      expiration_date.setSeconds(expiration_date.getSeconds() + success.authResponse.expiresIn);
      expiration_date = expiration_date.toISOString();
 
      var facebookAuthData = {
        "id": success.authResponse.userID,
        "access_token": success.authResponse.accessToken,
        "expiration_date": expiration_date
      };
 
      Parse.FacebookUtils.logIn(facebookAuthData, {
        success: function(user) {
          console.log(user);
          if (!user.existed()) {
            $state.go('tab.dash');
          } else {
            $state.go('tab.dash');
          }
        },
        error: function(user, error) {
          alert("User cancelled the Facebook login or did not fully authorize.");
        }
      });
 
    }, function(error){
      console.log(error);
    });
 
  }
 
};



})

.controller('SignupCtrl', function($scope, $state) {

    // Data bind the username and password fields
    $scope.data = {
        'username' : '',
        'password' : '',
        'email'    : ''
      };

  //Click button to signup
  $scope.signup = function(item,event){

    var user = new Parse.User();
    user.set("username", $scope.data.username);
    user.set("password", $scope.data.password);
    
    // IF EMAIL IS BLANK, LEAVE EMAIL AS UNDEFINED. IF YOU DON'T HAVE THIS, EMAIL IS ''
    if ($scope.data.email == ''){
    } else {
      user.set("email", $scope.data.email);  
    }
    

    // other fields can be set just like with Parse.Object
    // user.set("phone", "415-392-0202");

    user.signUp(null, {
      success: function(user) {
        // Hooray! Let them use the app now.
        $state.go('tab.dash');
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
    });

  };

})

.controller('GuessCtrl', function($scope, $state, $stateParams) {

  //Click button to make a guess
  $scope.onTouch = function(item,event){
    if ($scope.coordinates == null) {
      alert('Please tap on the map to make a guess');
    }
    else {
      $state.go('tab.result', { location_id: $stateParams.location_id, actual_lat:$stateParams.actual_lat, actual_lng:$stateParams.actual_lng });
    } 
  };

  $scope.initialise = function() {
    var myLatlng = new google.maps.LatLng(37.758446, -122.411789);
    var markersArray = [];

    //Initial settings for the map
    var mapOptions = {
            center: myLatlng,
            zoom: 2,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

    //Load the initial map
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    //Event listener to add a marker      
    google.maps.event.addListener(map, 'click', function(e) {
      clearOverlays();
      placeMarker(e.latLng, map);
      $scope.coordinates = e.latLng;
      localStorage.userLat = $scope.coordinates.lat();
      localStorage.userLong = $scope.coordinates.lng();
    });

    //Actual function to add a marker
    function placeMarker(position, map) {
      var marker = new google.maps.Marker({
        position: position,
        map: map
      });
      map.panTo(position);
      markersArray.push(marker);
    }

    function clearOverlays() {
      for (var i = 0; i < markersArray.length; i++ ) {
        markersArray[i].setMap(null);
      }
      markersArray.length = 0;
    }

    $scope.map=map;

  };

  google.maps.event.addDomListener(document.getElementById("map"), 'load', $scope.initialise());

      // DISPLAY IMAGE AGAIN
      
      var CoorList = Parse.Object.extend("CoorList");
      var query = new Parse.Query(CoorList);
      query.equalTo("objectId", $stateParams.location_id);
      query.find({
        success: function(results) {

          localStorage.image = results[0].attributes.imageLink;
          localStorage.answer = results[0].attributes.Answer;

        },
        error: function(error) {
          alert("Error: " + error.code + " " + error.message);
        }
      });
      // END OF DISPLAY IMAGE

})

.controller('ResultCtrl', function($scope, $state, $stateParams) {


      // //Calc user's score
      // var maxScore = 500;
      // var earthCircumference = 40075;
      // var maxDistance = earthCircumference / 2;
      // var distance = google.maps.geometry.spherical.computeDistanceBetween(actualGoogCoor, userGoogCor) / 1000;
      // var score = (-1 * maxScore / maxDistance) * distance + maxScore;
      // score = score.toFixed(0);
      // score = numberWithCommas(score);    
      // $scope.score = score;

    $scope.initialise = function() {
      var guessCoor = new google.maps.LatLng(localStorage.userLat, localStorage.userLong);
      var actualCoor = new google.maps.LatLng($stateParams.actual_lat, $stateParams.actual_lng);

      //Initial settings for the map
      var mapOptions = {
              center: guessCoor,
              zoom: 2,
              mapTypeId: google.maps.MapTypeId.ROADMAP
          };

      //Load the initial map
      var map = new google.maps.Map(document.getElementById("map_result"), mapOptions);

      var marker = new google.maps.Marker({
          position: guessCoor,
          map: map,
          title: 'Your guess'
        });

      var marker2 = new google.maps.Marker({
        position: actualCoor,
        map: map,
      });


      // Add circle overlay
      var circle = new google.maps.Circle({
        map: map,
        center: actualCoor,
        radius: 500000,  //500km away
        strokeColor:"#0000FF",
        strokeOpacity:0.8,
        strokeWeight:2,
        fillColor:"#0000FF",
        fillOpacity:0.4
      });


      var infowindow = new google.maps.InfoWindow({
          content: 'Your guess'
      });

      google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
      });


      var flightPlanCoordinates = [guessCoor, actualCoor];
      var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      flightPath.setMap(map);

      $scope.map=map;



      //Calc distance between 2 points
      var actualGoogCoor = new google.maps.LatLng($stateParams.actual_lat, $stateParams.actual_lng);
      var userGoogCor = new google.maps.LatLng(localStorage.userLat, localStorage.userLong);
      var distance_number = google.maps.geometry.spherical.computeDistanceBetween(actualGoogCoor, userGoogCor) / 1000;
      if (distance_number<501) {
        $scope.round_status = "Correct"
      } else {
        $scope.round_status = "Incorrect"
      }
      distance = distance_number.toFixed(0);
      distance = numberWithCommas(distance);
      $scope.distance = distance;

      // SAVE SCORE TO DATABASE
      var Result = Parse.Object.extend("Result");
      var result = new Result();
      
      result.set("distance", distance_number);
      result.set("user", Parse.User.current().id);
      result.set("locationId", $stateParams.location_id);
      result.set("guessLat", Number(localStorage.userLat));
      result.set("guessLong", Number(localStorage.userLong));
      
      result.save(null, {
        success: function(result) {
          
        },
        error: function(result, error) {
          alert('Failed to create new object, with error code: ' + error.message);
        }
      });
      // END OF SAVING SCORE TO DATABASE

      $scope.image = localStorage.image;
      $scope.answer = localStorage.answer;


      // Remove object from locations localstorage, for use on home feed
      var testObject = JSON.parse(window.localStorage['locations']);
      for (var i = 0; i < testObject.length; i++) {
        if ( testObject[i].objectId == $stateParams.location_id ) {
          testObject.splice(i,1);
        }
      }
      window.localStorage['locations'] = JSON.stringify(testObject);



    };
    
    google.maps.event.addDomListener(document.getElementById("map_result"), 'load', $scope.initialise());


    
    //Format number with comma
    function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, $ionicLoading, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, $http, $ionicLoading) {


  $scope.windowWidth = window.innerWidth;
  $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          duration: 5000
        });


  // $scope.moreDataCanBeLoaded = 'false';
  // $scope.played_locations = [{imageLink: 'http://i.imgur.com/9lDdLYR.jpg'}, {imageLink: 'http://i.imgur.com/9lDdLYR.jpg'}];

  var currentUser = Parse.User.current();
  getlocations(currentUser);
  
  
  $scope.loadMore = function () {
    getlocations(currentUser);
    // $scope.$broadcast('scroll.infiniteScrollComplete');
  }

  $scope.$on('$stateChangeSuccess', function() {
    $scope.loadMore();
  });



  // Make db call to get locations played
  function getlocations(currentUser){
    var Result = Parse.Object.extend("Result");
    var result_query = new Parse.Query(Result);
    result_query.equalTo("user", currentUser.id);
    result_query.find({

    success: function(results) {

        user_result = [];
        for (var i = 0; i < results.length; i++) {
          var object = results[i];
          user_result.push(object.get('locationId'));
        }


        var CoorList = Parse.Object.extend("CoorList");
        var query = new Parse.Query(CoorList);
        query.containedIn("objectId", user_result);
        query.ascending("createdAt");
        query.find({
                  
        success: function(locations) {
          
          window.localStorage['played_locations'] = JSON.stringify(locations);
          var testObject = JSON.parse(window.localStorage['played_locations']);
          $scope.played_locations = testObject;
      
          $ionicLoading.hide();
            
        },

        error: function(error){
          alert("Error: " + error.code + " " + error.message);
          $ionicLoading.hide();
        }

      });

      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
        $ionicLoading.hide();
      }
    });
    // END OF PARSE DB QUERY

  }
  // End of getlocations


  // FACEBOOK STUFF
  var access_token = currentUser._serverData.authData.facebook.access_token;
  var fb_prof_json_link = 'https://graph.facebook.com/me?fields=id,name,email,picture{url,height,is_silhouette,width}&access_token='+access_token;

   $http.get(fb_prof_json_link).then(function(resp) {
    // For JSON responses, resp.data contains the result
    $scope.profile_image = resp.data.picture.data.url;
    $scope.username = resp.data.name;

  }, function(err) {
    console.error('ERR', err);
    // err.status will contain the status code
  })
  // End of facebook stuff

});
