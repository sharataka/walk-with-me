angular.module('starter.controllers', [])

.controller('SettingsCtrl', function($scope, $stateParams, $ionicLoading, Chats, $state) {
  

  //LOGOUT BUTTON
  $scope.logout = function(item,event){
    Parse.User.logOut();
    window.localStorage.clear();
    $state.go('login');
  };
  // END OF LOGUT BUTTON

})

.controller('FriendsCtrl', function($scope, $stateParams, $ionicLoading, Chats, $state, $http) {

 // REFRESH
  $scope.refresh = function () {
        setTimeout(function () {
          getFacebookScores();
          $scope.$broadcast('scroll.refreshComplete');
    }, 750);


  };
  // END OF REFRESH


var currentUser = Parse.User.current();
getFacebookScores();

function getFacebookScores() {

$ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

if (window.localStorage['sign_in_method'] == 'facebook') {
            
            $scope.fb_logged_in = 'true';
            var access_token = currentUser._serverData.authData.facebook.access_token;

            // friends 
            var fql_query_url = 'https://graph.facebook.com/me?fields=friends{picture{url},name,id}&access_token='+access_token;
            //$scope.friends_result_combined = [];

            $http.get(fql_query_url).then(function(resp) {
                $scope.friends = resp.data.friends.data;
                $scope.array_of_fb_ids = [];
                for (var i = 0; i < $scope.friends.length; i ++) {
                  $scope.array_of_fb_ids.push($scope.friends[i].id);
                }

                var Result = Parse.Object.extend("User");
                var result_lookup = new Parse.Query(Result);
                result_lookup.descending("numberOfGuesses");
                result_lookup.containedIn("facebookId", $scope.array_of_fb_ids);
                
                result_lookup.find({

                    success: function(friends_results) {

                      $scope.friends_leaderboard = [];
                      for (i = 0; i < $scope.friends.length; i++) {
                          
                          var name = $scope.friends[i].name;
                          var fb_picture = $scope.friends[i].picture.data.url;

                          for (j = 0; j < friends_results.length; j++) {
                            if ( $scope.friends[i].id == friends_results[j].attributes.facebookId ) {
                              
                              if (friends_results[j].attributes.numberOfGuesses == undefined) {
                                wins = 0;
                                number_of_guesses = 0;
                                win_percentage = 0;
                                losses = 0;
                              }
                              else {
                                var wins = friends_results[j].attributes.wins;
                                var number_of_guesses = friends_results[j].attributes.numberOfGuesses;
                                var losses = number_of_guesses - wins;
                                var win_percentage = ( Number(wins) / Number(number_of_guesses) * 100).toFixed(0);
                              }

                            } 
                          } 


                          var individual_friend_results = {name:name, fb_picture:fb_picture, win_percentage:win_percentage, number_of_guesses:number_of_guesses, wins:wins, losses:losses};
                          $scope.friends_leaderboard.push(individual_friend_results);
                      }


                      var User = Parse.Object.extend("User");
                      var query = new Parse.Query(User);
                      query.get(Parse.User.current().id, {
                        // The object was retrieved successfully.
                        success: function(retreive_user) {

                            var fb_prof_json_link = 'https://graph.facebook.com/me?fields=id,name,email,picture.height(961)&access_token='+access_token;
            

                           $http.get(fb_prof_json_link).then(function(resp) {
                            var profile_image = resp.data.picture.data.url;
                            var name = resp.data.name;
                            if (retreive_user.attributes.numberOfGuesses == undefined) {
                                wins = 0;
                                number_of_guesses = 0;
                                win_percentage = 0;
                                losses = 0;
                              }
                              else {
                                var wins = retreive_user.attributes.wins;
                                var number_of_guesses = retreive_user.attributes.numberOfGuesses;
                                var losses = number_of_guesses - wins;
                                var win_percentage = ( Number(wins) / Number(number_of_guesses) * 100).toFixed(0);
                              }

                          var individual_friend_results = {name:name, fb_picture:profile_image, win_percentage:win_percentage, number_of_guesses:number_of_guesses, wins:wins, losses:losses};
                          $scope.friends_leaderboard.push(individual_friend_results);

                          $scope.friends_leaderboard.sort(function(a, b){
                           return b.win_percentage-a.win_percentage
                          });

                          $ionicLoading.hide();

                          });

                        }
                      });
                      



                    }

                });


              });




          }

      else {
        $ionicLoading.hide();
      }
}

  

    
})

.controller('DashCtrl', function($scope, $state, $ionicLoading, Chats, $ionicPopup, $ionicHistory) {

  $ionicHistory.nextViewOptions({
    disableAnimate: true
  });

  mixpanel.track("Home page view");

   

$scope.initialise = function() {

  $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          duration: 5000
        });

          var myLatlng = new google.maps.LatLng(37.758446, -122.411789);
          var markersArray = [];

          //Initial settings for the map
          var mapOptions = {
                  center: myLatlng,
                  zoom: 2,
                  mapTypeId: google.maps.MapTypeId.ROADMAP,
                  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }]}]

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

    $ionicLoading.hide(); 

    };
    // End of initialise
 
  google.maps.event.addDomListener(window, 'load', $scope.initialise());

  $scope.getMap = function(item_index) {
    
    $scope.active_page = 'map';
    $scope.active_location = $scope.locations[item_index];
    

    $scope.title_of_page = 'Guess';

    // Buttons
    $scope.pics_status = 'button-outline';
    $scope.map_status = '';
    $scope.result_status = 'button-outline';  


    $scope.locations_backup = $scope.locations;
    $scope.locations = '';

    // Height of map
    $scope.height_of_map = window.innerHeight*0.6;

    window.setTimeout(function(){
      google.maps.event.trigger(map, 'resize');
    },100);


  }



  $scope.getPics = function(source) {
    $scope.title_of_page = 'Tap to Guess';

    console.log(source);

    mainFunctionToLoadLocations();
    
    // Buttons
    $scope.pics_status = '';
    $scope.map_status = 'button-outline';
    $scope.result_status = 'button-outline';  

    $scope.refresh_message = "Answer the pictures above to get more...";
    
    // Height of map
    $scope.height_of_map = 0;

    
  }


$scope.getResult = function() {

    
    // No guess made 
    if ($scope.coordinates == null) {
      $ionicPopup.alert({
                        title: "You haven't made a guess",
                        content: "Tap on the map to drop a pin and make a guess."
                    })
    }
    // No guess made

    // Guess made
    else {
      $scope.title_of_page = 'Result';
      $scope.image = $scope.active_location.imageLink;
      $scope.answer = $scope.active_location.Answer;

      // Buttons
      $scope.pics_status = 'button-outline';
      $scope.map_status = 'button-outline';
      $scope.result_status = '';

      // Height of map
      $scope.height_of_map = window.innerHeight*0.3;

      // Resize the map
      window.setTimeout(function(){
        google.maps.event.trigger(map, 'resize');
      },100);

      // Add actual coordinates to map
      actualCoor = new google.maps.LatLng(Number($scope.active_location.Lat), Number($scope.active_location.Long));
      addMarker(actualCoor);

      
      // Resize the map
      window.setTimeout(function(){
        $scope.map.panTo($scope.coordinates);
      },100);

      // Add circle overlay to map
      var circle = new google.maps.Circle({
        map: $scope.map,
        center: actualCoor,
        radius: 500000,  //500km away
        strokeColor:"#0000FF",
        strokeOpacity:0.8,
        strokeWeight:2,
        fillColor:"#0000FF",
        fillOpacity:0.4
      });
      
      // Add line between points
      var flightPlanCoordinates = [$scope.coordinates, actualCoor];
      var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      flightPath.setMap($scope.map);


      // Show info window for user's guess 
      var infowindow = new google.maps.InfoWindow({
          content: 'Your guess'
      });

      var marker = new google.maps.Marker({
        position: $scope.coordinates,
        map: $scope.map,
        title: 'Uluru (Ayers Rock)'
      });

      infowindow.open($scope.map,marker);

      //Calc distance between 2 points
      var distance_number = google.maps.geometry.spherical.computeDistanceBetween(actualCoor, $scope.coordinates) / 1000;
      if (distance_number<501) {
        $scope.round_status = "Correct"
      } else {
        $scope.round_status = "Incorrect"
      }
      distance = distance_number.toFixed(0);
      distance = numberWithCommas(distance);
      $scope.distance = distance + ' km away';


    } 
    // Guess made

    //Format number with comma
    function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    // End of number with commas
}
// End of getResult

 function addMarker(location) {
    marker = new google.maps.Marker({
        position: location,
        map: $scope.map
    });
}


  $scope.windowWidth = window.innerWidth;
  
  var currentUser = Parse.User.current();
  $scope.refresh_message = "Answer the pictures above to get more...";
  $scope.locations = '';
  

  $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          duration: 5000
        });


  $scope.getPics();
  

  function mainFunctionToLoadLocations() {

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
          mixpanel.track("Home page: get locations feed");
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

  }





  // REFRESH
  $scope.refresh = function () {
        setTimeout(function () {
          mainFunctionToLoadLocations();
          $scope.$broadcast('scroll.refreshComplete'); 
    }, 750);


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
        query.ascending("createdAt");
        query.notContainedIn("objectId", user_result);
        query.limit(4);
        query.equalTo("Status", "live");
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
          $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "Swipe down to refresh"
                    })  
          // alert("Error: " + error.code + " " + error.message);
          $ionicLoading.hide();
        }

      });

      },
      error: function(error) {
        $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "Swipe down to refresh"
                    })  
        // alert("Error: " + error.code + " " + error.message);
        $ionicLoading.hide();
      }
    });
    // END OF PARSE DB QUERY

  }
  // End of getlocations



  
})
// END OF HOME CONTROLLER

.controller('LoginFormCtrl', function($scope, $state, $cordovaFacebook, $ionicPopup) {
$scope.data = {
    'username' : '',
    'password' : ''
  };
  

  //Click button to login
  $scope.login = function(item,event){

    $scope.data.username = angular.lowercase($scope.data.username);

    Parse.User.logIn($scope.data.username, $scope.data.password, {
      success: function(user) {
        window.localStorage['sign_in_method'] = 'username';
        $state.go('dash');
        
      },
      error: function(user, error) {
        $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "Make sure you enter the right username and password"
                    })  
        // alert(error.message + '. Make sure you enter the right username and password!');

      }
    });

  };
})

.controller('LoginCtrl', function($scope, $state, $cordovaFacebook, $ionicPopup, $ionicLoading) {

mixpanel.track("Walkthrough view");

// Calculate left margin on buttons
var buttonlength = .7 * window.innerWidth;
$scope.left_margin = (window.innerWidth - buttonlength) / 2;

$scope.height = window.innerHeight;


// Data bind the username and password fields
$scope.data = {
    'username' : '',
    'password' : ''
  };
  

  //Click button to login
  $scope.login = function(item,event){

    Parse.User.logIn('sharataka', 'goldengun', {
      success: function(user) {
        window.localStorage['sign_in_method'] = 'username';
        $state.go('dash');
      },
      error: function(user, error) {
        $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "Make sure you enter the right username and password!"
                    })  
        // alert(error.message + '. Make sure you enter the right username and password!');

      }
    });

  };
  
  


$scope.loginFacebook = function(){
 

      $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          duration: 5000
        });

  //Browser Login
  if(!(ionic.Platform.isIOS() || ionic.Platform.isAndroid())){
    



    Parse.FacebookUtils.logIn("user_friends,email", {
      success: function(user) {
        if (!user.existed()) {
          window.localStorage['sign_in_method'] = 'facebook';
          mixpanel.track("Login: facebook");
          
          var User = Parse.Object.extend("User");
          var query = new Parse.Query(User);
          query.get(Parse.User.current().id, {
            // The object was retrieved successfully.
            success: function(retreive_user) {

                // Update object
                retreive_user.save(null, {
                  success: function(update_user) {
                    // Now let's update it with some new data. In this case, only cheatMode and score
                    // will get sent to the cloud. playerName hasn't changed.
                    update_user.set("facebookId", retreive_user._serverData.authData.facebook.id);
                    update_user.save();
                  }
                });
            },
            error: function(object, error) {
              // The object was not retrieved successfully.
              // error is a Parse.Error with an error code and message.
            }
          });

          $state.go('dash');
          
        } 

        else {
          window.localStorage['sign_in_method'] = 'facebook';
          mixpanel.track("Login: facebook");
          var User = Parse.Object.extend("User");
          var query = new Parse.Query(User);
          query.get(Parse.User.current().id, {
            // The object was retrieved successfully.
            success: function(retreive_user) {

                // Update object
                retreive_user.save(null, {
                  success: function(update_user) {
                    // Now let's update it with some new data. In this case, only cheatMode and score
                    // will get sent to the cloud. playerName hasn't changed.
                    console.log(retreive_user._serverData.authData.facebook);
                    update_user.set("facebookId", retreive_user._serverData.authData.facebook.id);
                    update_user.save();
                  }
                });
            },
            error: function(object, error) {
              // The object was not retrieved successfully.
              // error is a Parse.Error with an error code and message.
            }
          });


          $state.go('dash');
          
        }
      },
      error: function(user, error) {
        mixpanel.track("Login error: facebook");
        $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "You cancelled the Facebook login or it didn't work."
                    })  
        // alert("User cancelled the Facebook login or did not fully authorize.");
      }
    });
 
  }

  //Native Login
  else {
  
    $cordovaFacebook.login(["public_profile", "email", "user_friends"]).then(function(success){
 
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
          if (!user.existed()) {
            mixpanel.track("Login: facebook");
            window.localStorage['sign_in_method'] = 'facebook';


var User = Parse.Object.extend("User");
var query = new Parse.Query(User);
query.get(Parse.User.current().id, {
  // The object was retrieved successfully.
  success: function(retreive_user) {

      // Update object
      retreive_user.save(null, {
        success: function(update_user) {
          // Now let's update it with some new data. In this case, only cheatMode and score
          // will get sent to the cloud. playerName hasn't changed.
          update_user.set("facebookId", retreive_user._serverData.authData.facebook.id);
          update_user.save();
        }
      });
  },
  error: function(object, error) {
    // The object was not retrieved successfully.
    // error is a Parse.Error with an error code and message.
  }
});


            $state.go('dash');
          } else {
            window.localStorage['sign_in_method'] = 'facebook';

var User = Parse.Object.extend("User");
var query = new Parse.Query(User);
query.get(Parse.User.current().id, {
  // The object was retrieved successfully.
  success: function(retreive_user) {

      // Update object
      retreive_user.save(null, {
        success: function(update_user) {
          // Now let's update it with some new data. In this case, only cheatMode and score
          // will get sent to the cloud. playerName hasn't changed.
          update_user.set("facebookId", retreive_user._serverData.authData.facebook.id);
          update_user.save();
        }
      });
  },
  error: function(object, error) {
    // The object was not retrieved successfully.
    // error is a Parse.Error with an error code and message.
  }
});


            $state.go('dash');
          }
        },
        error: function(user, error) {
          $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "You cancelled the login or it didn't work"
                    })  
          // alert("User cancelled the login or did not fully authorize.");
        }
      });
 
    }, function(error){
      $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "Swipe down to refresh"
                    })  
                    // alert('error');
    });
 
  }
 
};



})

.controller('SignupCtrl', function($scope, $state, $ionicPopup) {

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
        window.localStorage['sign_in_method'] = 'username';
        $state.go('dash');

      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        $ionicPopup.alert({
                        title: "Uh oh!",
                        content: error.message
                    })  
        // alert("Error: " + error.code + " " + error.message);
      }
    });

  };

})

.controller('GuessCtrl', function($scope, $state, $stateParams, $ionicPopup, $ionicLoading, $ionicHistory) {

          $ionicHistory.nextViewOptions({
            disableAnimate: true
          });
        
        mixpanel.track("Guess page view");

        // Calculate left margin on buttons
        var buttonlength = .7 * window.innerWidth;
        $scope.left_margin = (window.innerWidth - buttonlength) / 2;
        $scope.heightWidth = window.innerHeight;

        //Click button to make a guess
        $scope.onTouch = function(item,event){
          if ($scope.coordinates == null) {
            $ionicPopup.alert({
                              title: "You haven't made a guess",
                              content: "Tap on the map to drop a pin and make a guess."
                          })
          }
          else {
            $state.go('result', { location_id: $stateParams.location_id, actual_lat:$stateParams.actual_lat, actual_lng:$stateParams.actual_lng });
          } 
        };

        $scope.initialise = function() {
          var myLatlng = new google.maps.LatLng(37.758446, -122.411789);
          var markersArray = [];

          //Initial settings for the map
          var mapOptions = {
                  center: myLatlng,
                  zoom: 2,
                  mapTypeId: google.maps.MapTypeId.ROADMAP,
                  styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }]}]

              };

          //Load the initial map
          
          
            map = new google.maps.Map(document.getElementById("map"), mapOptions);

           
          


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


        };

        google.maps.event.addDomListener(document.getElementById("map"), 'load', $scope.initialise());

      // DISPLAY IMAGE AGAIN
        
        $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0
        });

      var CoorList = Parse.Object.extend("CoorList");
      var query = new Parse.Query(CoorList);
      query.equalTo("objectId", $stateParams.location_id);
      query.find({
        success: function(results) {

          localStorage.image = results[0].attributes.imageLink;
          localStorage.answer = results[0].attributes.Answer;

          $ionicLoading.hide();

        },
        error: function(error) {
          $ionicPopup.alert({
                        title: "Error",
                        content: "Swipe down to refresh"
                    })
          $ionicLoading.hide();
          // alert("Error: " + error.code + " " + error.message);
        }
      });
      // END OF DISPLAY IMAGE

})

.controller('ResultCtrl', function($scope, $state, $stateParams, $ionicPopup, $http, $ionicLoading, $ionicHistory) {

    $ionicHistory.clearHistory();
    $ionicHistory.nextViewOptions({
      disableAnimate: true,
      disableBack: true
    });

    var currentUser = Parse.User.current();

      // //Calc user's score
      // var maxScore = 500;
      // var earthCircumference = 40075;
      // var maxDistance = earthCircumference / 2;
      // var distance = google.maps.geometry.spherical.computeDistanceBetween(actualGoogCoor, userGoogCor) / 1000;
      // var score = (-1 * maxScore / maxDistance) * distance + maxScore;
      // score = score.toFixed(0);
      // score = numberWithCommas(score);    
      // $scope.score = score;
    $scope.windowWidth = window.innerWidth;
    
    $scope.initialise = function() {
      var guessCoor = new google.maps.LatLng(localStorage.userLat, localStorage.userLong);
      var actualCoor = new google.maps.LatLng($stateParams.actual_lat, $stateParams.actual_lng);

      //Initial settings for the map
      var mapOptions = {
              center: guessCoor,
              zoom: 2,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }]}]
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
      if (window.localStorage['sign_in_method'] == 'facebook') {
        result.set("facebookId", Parse.User.current()._serverData.authData.facebook.id);
      }
      
      result.save(null, {
        success: function(result) {

          get_community_results();
          
          var User = Parse.Object.extend("User");
          var query = new Parse.Query(User);
          query.get(Parse.User.current().id, {
            // The object was retrieved successfully.
            success: function(retreive_user) {

                if (retreive_user.attributes.numberOfGuesses == undefined) {
                  var numberofGuesses = 0; 
                } else {
                  var numberofGuesses = Number(retreive_user.attributes.numberOfGuesses);
                }

                if (retreive_user.attributes.wins == undefined) {
                  var numberofWins = 0; 
                } else {
                  var numberofWins = Number(retreive_user.attributes.wins);
                }
                

                // Update object
                retreive_user.save(null, {
                  success: function(update_user) {
                    
                    numberofGuesses++;
                    
                    if ($scope.round_status == "Correct") {
                      numberofWins++;
                      update_user.set("wins", numberofWins);
                      update_user.set("numberOfGuesses", numberofGuesses);
                      update_user.save();
                    }
                    else {
                      update_user.set("numberOfGuesses", numberofGuesses);
                      update_user.save();
                    }

                    
                  }
                });
            },
            error: function(object, error) {
              // The object was not retrieved successfully.
              // error is a Parse.Error with an error code and message.
            }
          });

          
        },
        error: function(result, error) {
          $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "Swipe down to refresh"
                    })  
          // alert('Failed to create new object, with error code: ' + error.message);
        }
      });
      // END OF SAVING SCORE TO DATABASE

      $scope.image = localStorage.image;
      $scope.answer = localStorage.answer;

       $scope.morePictures = function () {
          mixpanel.track("Results page: view more pictures");
          window.open('https://www.google.com/images?q=' + $scope.answer +'', 'blank');
        }

        $scope.moreInfo = function () {
          mixpanel.track("Results page: view more info");
          window.open('https://www.google.com/search?q=' + $scope.answer +'', 'blank');
        }



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

    

    function get_community_results() {
      
      $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0
        });

      var Result = Parse.Object.extend("Result");
      var result_query = new Parse.Query(Result);
      result_query.equalTo("locationId", $stateParams.location_id);
      result_query.ascending("distance");
      result_query.find({

    success: function(results) {
        

        // Total number of guesses
        $scope.total_guesses = results.length;
        
        // Avg guess
        var index_of_median = $scope.total_guesses / 2;
        if ($scope.total_guesses % 2 == 0) {
          $scope.avg_guess = ( Number(results[index_of_median - 1].get('distance').toFixed(0)) + Number(results[index_of_median].get('distance').toFixed(0)) ) / 2;
        }
        else {
          $scope.avg_guess = results[index_of_median - 0.5].get('distance').toFixed(0);
        }
        
        
        // Best guess
        $scope.best_guess = results[0].get('distance').toFixed(0);

        // Get the user's guess
        for (var i = 0; i < results.length; i++) {
          current_object = results[i];
          if (current_object.attributes.user == currentUser.id) {
            $scope.distance = Number(current_object.attributes.distance).toFixed(0);
              if (Number($scope.distance) < 501) {
                $scope.answer_text = "Correct!";
                $scope.icon = "checkmark";
              }
              else {
                $scope.answer_text = "Incorrect"; 
                $scope.icon = "close";
              }
          }
        }
        // End of getting user's guess

        // Get user's rank
        for (var i = 0; i < results.length; i++) {
          current_object = results[i];
          if ( current_object.get('distance').toFixed(0) == $scope.distance) {
            var current_rank = i;
          }

        }
        $scope.rank = current_rank + 1;
        $scope.rank = ordinal_suffix_of($scope.rank);
        // End of getting user's rank


        $ionicLoading.hide();







    // FACEBOOK FRIENDS RESULTS
      if (window.localStorage['sign_in_method'] == 'facebook') {
        

      $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          duration: 5000
        });

            var access_token = currentUser._serverData.authData.facebook.access_token;

            // friends 
            var fql_query_url = 'https://graph.facebook.com/me?fields=friends{picture{url,height=961},name,id}&access_token='+access_token;

            $http.get(fql_query_url).then(function(resp) {
                $scope.friends = resp.data.friends.data;
                var array_of_fb_ids = [];
                for (var i = 0; i < $scope.friends.length; i ++) {
                  array_of_fb_ids.push($scope.friends[i].id);
                }


                
                var Result = Parse.Object.extend("Result");
                var result_lookup = new Parse.Query(Result);
                result_lookup.equalTo("locationId", $stateParams.location_id);
                result_lookup.containedIn("facebookId", array_of_fb_ids);
                result_lookup.descending("distance");
                
                result_lookup.find({

                    // Start of db success query
                    success: function(friends_results) {
                      $scope.friends_result_combined = [];
                      
                      $scope.friends_text = "Your friends";
                      if (friends_results.length == 0) {
                        $ionicLoading.hide();
                        $scope.friends_text = "Your friends haven't played this yet!"
                      }
                      for (var i = 0; i < friends_results.length; i++) {

                        current_result = friends_results[i];
                        var distance = current_result.attributes.distance.toFixed(0);
                        var facebookId = current_result.attributes.facebookId;
                        
                        for (var i = 0; i < $scope.friends.length; i++) {
                          current = $scope.friends[i];
                          if (current.id == facebookId) {

                            var name = current.name;
                            var fb_picture = current.picture.data.url;
                            
                          }
                        }
                        
                        var result_object = {distance: distance, name: name, fb_picture: fb_picture}
                        $scope.friends_result_combined.push(result_object);
                        $ionicLoading.hide();
                      } 
                          
                    },
                    // End of db success query
                    
                    // Beginning of error
                    error: function(error) {
                        $ionicPopup.alert({
                          title: "Uh oh!",
                          content: "Swipe down to refresh"
                        })          
                      $ionicLoading.hide();
                    }
                    // End of error
                });
              
            }, function(err) {
              console.error('ERR', err);
              $ionicLoading.hide();
            })
 
      }
      // END OF FACEBOOK FRIENDS RESULTS

      else {
        $scope.friends_text = "Sign in with Facebook";
        $scope.friends_text_subheader = "Logout and sign up with Facebook to play with your friends!";
        $ionicLoading.hide();
      }

      },
      error: function(error) {
        $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "Swipe down to refresh"
                    })  
        // alert("Error: " + error.code + " " + error.message);
        $ionicLoading.hide();
      }
      
    });
  
    }
    
    //Format number with comma
    function numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    // End of number with commas

    // Add ordinal suffix
    function ordinal_suffix_of(i) {
      var j = i % 10,
          k = i % 100;
      if (j == 1 && k != 11) {
          return i + "st";
      }
      if (j == 2 && k != 12) {
          return i + "nd";
      }
      if (j == 3 && k != 13) {
          return i + "rd";
      }
      return i + "th";
    }
    // End of ordinal suffix

})

.controller('ChatsCtrl', function($scope, Chats, $ionicPopup) {
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

.controller('OfflineCtrl', function($scope, $stateParams, $ionicPopup) {
    
    mixpanel.track("Offline page view");
    $ionicPopup.alert({
                    title: "You're offlne!",
                    content: "Make sure you're connected to the internet and then tap the button to get going again!"
                })

    $scope.tryAgain = function(item,event){
     if(navigator.onLine){
        window.location.href = '#/dash';
     } 
     else {
      $ionicPopup.alert({
                      title: "You're still not connected!",
                      content: "Make sure you're connected to the internet and then tap the button to get going again!"
                  })

     }

    }

})

.controller('FullscreenCtrl', function($scope, $stateParams, $ionicLoading, $ionicPopup) {
  // Calculate left margin on buttons
  var buttonlength = .7 * window.innerWidth;
  $scope.left_margin = (window.innerWidth - buttonlength) / 2;

  $scope.height = window.innerHeight;
  $scope.width = window.innerWidth;

  $scope.objectId = $stateParams.objectId;
  $scope.actual_lat = $stateParams.actual_lat;
  $scope.actual_lng = $stateParams.actual_lng;
  $scope.imageLink = $stateParams.image_Link;

})

.controller('ResultfullscreenCtrl', function($state, $scope, $stateParams, $ionicLoading, $ionicHistory, $http, $ionicPopup) {
  
  
  // // HEART PICTURE
  // $scope.is_hearted = 'false';
  
  // $scope.heart = function() {
  //   $scope.is_hearted = 'true';
  //   console.log('heart');
  // };

  // $scope.unheart = function() {
  //   $scope.is_hearted = 'false';
  //   console.log('unheart');
  // };
  // // END OF HEART PICTURE

  mixpanel.track("Detail page view from account page");

  var currentUser = Parse.User.current();

    $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0
          // duration: 5000
        });


  $scope.height = window.innerWidth;

  $scope.objectId = $stateParams.objectId;
  $scope.imageLink = $stateParams.image_Link;
  $scope.answer = $stateParams.answer;

  // $scope.goToAccount = function(item,event) {
  //   $state.go('tab.account');
  // }

  
    var Result = Parse.Object.extend("Result");
    var result_query = new Parse.Query(Result);
    result_query.equalTo("locationId", $scope.objectId);
    result_query.ascending("distance");
    result_query.find({

    success: function(results) {
        
        // Total number of guesses
        $scope.total_guesses = results.length;
        
        // Avg guess
        var index_of_median = $scope.total_guesses / 2;
        if ($scope.total_guesses % 2 == 0) {
          $scope.avg_guess = ( Number(results[index_of_median - 1].get('distance').toFixed(0)) + Number(results[index_of_median].get('distance').toFixed(0)) ) / 2;
        }
        else {
          $scope.avg_guess = results[index_of_median - 0.5].get('distance').toFixed(0);
        }
        
        
        // Best guess
        $scope.best_guess = results[0].get('distance').toFixed(0);

        // Get the user's guess
        for (var i = 0; i < results.length; i++) {
          current_object = results[i];
          if (current_object.attributes.user == currentUser.id) {
            $scope.distance = Number(current_object.attributes.distance).toFixed(0);
              if (Number($scope.distance) < 501) {
                $scope.answer_text = "Correct!";
                $scope.icon = "checkmark";
              }
              else {
                $scope.answer_text = "Incorrect"; 
                $scope.icon = "close";
              }
          }
        }
        // End of getting user's guess

        // Get user's rank
        for (var i = 0; i < results.length; i++) {
          current_object = results[i];
          if ( current_object.get('distance').toFixed(0) == $scope.distance) {
            var current_rank = i;
          }

        }
        $scope.rank = current_rank + 1;
        $scope.rank = ordinal_suffix_of($scope.rank);
        // End of getting user's rank

    // FACEBOOK FRIENDS RESULTS
      if (window.localStorage['sign_in_method'] == 'facebook') {
        
            var access_token = currentUser._serverData.authData.facebook.access_token;

            // friends 
            var fql_query_url = 'https://graph.facebook.com/me?fields=friends{picture{url},name,id}&access_token='+access_token;

            $http.get(fql_query_url).then(function(resp) {
                $scope.friends = resp.data.friends.data;
                var array_of_fb_ids = [];
                for (var i = 0; i < $scope.friends.length; i ++) {
                  array_of_fb_ids.push($scope.friends[i].id);
                }

                
                var Result = Parse.Object.extend("Result");
                var result_lookup = new Parse.Query(Result);
                result_lookup.equalTo("locationId", $scope.objectId);
                result_lookup.containedIn("facebookId", array_of_fb_ids);
                result_lookup.descending("distance");
                
                result_lookup.find({


                    success: function(friends_results) {
                      $scope.friends_result_combined = [];
                      
                      $scope.friends_text = "Your friends";
                      if (friends_results.length == 0) {
                        $ionicLoading.hide();
                        $scope.friends_text = "Your friends haven't played this yet!"
                      }
                      for (var i = 0; i < friends_results.length; i++) {

                        current_result = friends_results[i];
                        var distance = current_result.attributes.distance.toFixed(0);
                        var facebookId = current_result.attributes.facebookId;
                        
                        for (var i = 0; i < $scope.friends.length; i++) {
                          current = $scope.friends[i];
                          if (current.id == facebookId) {

                            var name = current.name;
                            var fb_picture = current.picture.data.url;
                            
                          }
                        }
                        
                        var result_object = {distance: distance, name: name, fb_picture: fb_picture}
                        $scope.friends_result_combined.push(result_object);
                        $ionicLoading.hide();
                      } 
                            


                    },
                    error: function(error) {
                              $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "Swipe down to refresh"
                    })  
                              // alert("Error: " + error.code + " " + error.message);
                              $ionicLoading.hide();
                            }
                });
              
            }, function(err) {
              console.error('ERR', err);
              // err.status will contain the status code
            })
        
      }
      // END OF FACEBOOK FRIENDS RESULTS

      else {
        $scope.friends_text = "Sign in with Facebook";
        $scope.friends_text_subheader = "Logout and sign up with Facebook to play with your friends!";
        $ionicLoading.hide();
      }

        
        

      },
      error: function(error) {
        $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "Swipe down to refresh"
                    })  
        // alert("Error: " + error.code + " " + error.message);
        $ionicLoading.hide();
      }
    });



      


function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

})

.controller('AccountCtrl', function($state, $scope, $http, $ionicLoading, $stateParams, $ionicPopup, $ionicScrollDelegate) {
mixpanel.track("Account page view");
var currentUser = Parse.User.current();

  // REFRESH
  $scope.refresh = function (){
    $scope.page = 0;
    $scope.skip = 15 * ($scope.page);
    setTimeout(function () {
          getlocations(currentUser);
          $scope.$broadcast('scroll.refreshComplete'); 
    }, 750);

  };
  // end of refresh

  $scope.windowWidth = window.innerWidth;
  $scope.leftMarginProfilePicture = window.innerWidth / 2 - 25;
  $scope.windowDividedBy3 = $scope.windowWidth / 3;

  $scope.page = 0;
  $scope.skip = 15 * ($scope.page);
  $scope.loadMore = function() {
      
      $scope.page++;
      $scope.skip = 15 * ($scope.page);
      getlocations(currentUser,$scope.skip);
      
  };


  getlocations(currentUser,$scope.skip);
  



  // Make db call to get locations played
  function getlocations(currentUser, skip){
  
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0,
      duration: 5000
    });

    var Result = Parse.Object.extend("Result");
    var result_query = new Parse.Query(Result);
    result_query.equalTo("user", currentUser.id);
    result_query.limit(15);
    result_query.skip(skip);
    result_query.descending('createdAt');
    result_query.find({

    success: function(results) {

        user_result = [];
        $scope.distances = [];
        for (var i = 0; i < results.length; i++) {
          var object = results[i];
          user_result.push(object.get('locationId'));
          
        }
        
        var CoorList = Parse.Object.extend("CoorList");
        var query = new Parse.Query(CoorList);
        query.containedIn("objectId", user_result);
        query.descending("createdAt");
        query.find({
                  
        success: function(locations) {
          
          window.localStorage['played_locations'] = JSON.stringify(locations);
          var testObject = JSON.parse(window.localStorage['played_locations']);
          if ($scope.page == 0) {
            $scope.played_locations = testObject;
          }
          else {
            $scope.played_locations = $scope.played_locations.concat(testObject);  
          }
          
          getUserStats();

          $ionicLoading.hide();
            
        },

        error: function(error){
          $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "Swipe down to refresh"
                    })  
          // alert("Error: " + error.code + " " + error.message);

          getUserStats();

          $ionicLoading.hide();
        }

      });

      },
      error: function(error) {
        $ionicPopup.alert({
                        title: "Uh oh!",
                        content: "Swipe down to refresh"
                    })  
        // alert("Error: " + error.code + " " + error.message);
        $ionicLoading.hide();
      }
    });
    // END OF PARSE DB QUERY

  }
  // End of getlocations

  function getUserStats() {

    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0,
      duration: 5000
    });

    var User = Parse.Object.extend("User");
    var query = new Parse.Query(User);
    query.get(Parse.User.current().id, {
      // The object was retrieved successfully.
      success: function(retreive_user) {


        if (retreive_user.attributes.fbName == undefined) {
          $scope.username = retreive_user.attributes.username;
        } else {
          $scope.username = retreive_user.attributes.fbName;
        }
        
        if (retreive_user.attributes.wins == undefined) {
          $scope.correct = 0;
        } else {
          $scope.correct = Number(retreive_user.attributes.wins);
        }

        if (retreive_user.attributes.numberOfGuesses == undefined) {
          total_played = 0;
        } else {
          total_played = Number(retreive_user.attributes.numberOfGuesses);
        }

        $scope.incorrect = total_played - $scope.correct;

        $ionicLoading.hide();
      }
    });
  }

  // TAP TO GO TO FULLSCREEN
  $scope.fullscreenImage = function (item) {
    var imageObject = $scope.played_locations[item];
    var distance = $scope.distances[item];
    if (distance < 501) {
      var icon = 'checkmark';
    } else {
      var icon = 'close';
    }
    $state.go('resultfullscreen', {objectId: imageObject.objectId, image_Link: encodeURI(imageObject.imageLink), answer: imageObject.Answer, distance: distance, icon: icon }) 
  }
  // END OF BUTTON TO GO FULLSCREEN

  

      if (window.localStorage['sign_in_method'] == 'facebook') {
            var access_token = currentUser._serverData.authData.facebook.access_token;
            var fb_prof_json_link = 'https://graph.facebook.com/me?fields=id,name,email,picture.height(961)&access_token='+access_token;
            

             $http.get(fb_prof_json_link).then(function(resp) {
              $scope.profile_image = resp.data.picture.data.url;
              $scope.username = resp.data.name;

              // Save email in database if not stored already
              var email = resp.data.email;
              if ( window.localStorage['email'] == undefined) {
                          var User = Parse.Object.extend("User");
                          var query = new Parse.Query(User);
                          query.get(Parse.User.current().id, {
                            // The object was retrieved successfully.
                            success: function(retreive_user) {

                                // Update object
                                retreive_user.save(null, {
                                  success: function(update_user) {
                                    // Now let's update it with some new data. In this case, only cheatMode and score
                                    // will get sent to the cloud. playerName hasn't changed.
                                    update_user.set("email", email);
                                    update_user.set("fbName", $scope.username);
                                    update_user.save();
                                    window.localStorage['email'] = email;
                                  }
                                });
                            },
                            error: function(object, error) {
                              // The object was not retrieved successfully.
                              // error is a Parse.Error with an error code and message.
                            }
                          });
              }
              // End of saving email in database

            })


      }

      else {
          $scope.username = currentUser.attributes.username;
          $scope.profile_image = 'http://crec.unl.edu/images/Icons/OA_Tent_red.png';

      }

        
  // End of facebook stuff


});
