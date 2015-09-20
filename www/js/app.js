// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'ionicLazyLoad', 'ngCordovaOauth'])



.run(function($ionicPlatform, $ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })

    .state('settings', {
      url: '/settings',
      templateUrl: 'templates/settings.html',
      controller: 'SettingsCtrl'
    })

    .state('offline', {
      url: '/offline',
      templateUrl: 'templates/offline.html',
      controller: 'OfflineCtrl'
    })

    .state('fullscreen', {
      url: '/fullscreen/{objectId}/{actual_lat}/{actual_lng}/{image_Link}',
      templateUrl: 'templates/fullscreen.html',
      controller: 'FullscreenCtrl'
    })

    .state('resultfullscreen', {
      url: '/resultfullscreen/{answer}/{image_Link}/{distance}/{icon}/{objectId}',
      templateUrl: 'templates/resultfullscreen.html',
      controller: 'ResultfullscreenCtrl'
    })

    .state('loginform', {
      url: '/loginform',
      templateUrl: 'templates/loginform.html',
      controller: 'LoginFormCtrl'
    })
    
    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: 'SignupCtrl'
    })

    .state('result', {
      url: '/result/{location_id}/{actual_lat}/{actual_lng}',
      templateUrl: 'templates/result.html',
      controller: 'ResultCtrl'
    })

    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.guess', {
    url: '/guess/{location_id}/{actual_lat}/{actual_lng}',
    views: {
      'tab-dash': {
        templateUrl: 'templates/guess.html',
        controller: 'GuessCtrl'
      }
    }
  })

  .state('tab.friends', {
    url: '/friends',
    views: {
      'tab-friends': {
        templateUrl: 'templates/friends.html',
        controller: 'FriendsCtrl'
      }
    }
  })

  .state('tab.result', {
    url: '/result/{location_id}/{actual_lat}/{actual_lng}',
    views: {
      'tab-dash': {
        templateUrl: 'templates/result.html',
        controller: 'ResultCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
