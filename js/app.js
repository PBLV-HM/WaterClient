var app = angular.module("myApp", ["ngRoute"]);

app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "templates/index.htm",
            controller: "indexCtrl"
        })
        .when("/config", {
            templateUrl: "templates/config.htm",
            controller: "configCtrl"
        })
        .when("/about", {
            templateUrl: "templates/about.htm",
            controller: "aboutCtrl"
        })
        .when("/registration", {
            templateUrl: "templates/registration.htm",
            controller: "registrationCtrl"
        })
        .when("/userdata", {
            templateUrl: "templates/userdata.htm",
            controller: "userdataCtrl"
        })
        .when("/login", {
            templateUrl: "templates/login.htm",
            controller: "authCtrl"
        });
});

app.controller("authCtrl", function($scope, $http) {


});

app.controller("registrationCtrl", function($scope, $http) {

});

app.controller("userdataCtrl", function($scope, $http, sharedProperties) {

});

app.controller("indexCtrl", function($scope, $http) {

});

app.controller("configCtrl", function($scope) {

});

app.controller("aboutCtrl", function($scope) {

});