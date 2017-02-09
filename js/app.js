var app = angular.module("myApp", ["ngRoute"]);

app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "templates/index.htm",
            controller: "indexCtrl"
        })
        .when("/devconfig", {
            templateUrl: "templates/devconfig.htm",
            controller: "devConfigCtrl"
        })
        .when("/groupconfig", {
            templateUrl: "templates/groupconfig.htm",
            controller: "groupConfigCtrl"
        })
        .when("/reporting", {
            templateUrl: "templates/reporting.htm",
            controller: "reportingCtrl"
        })
        .when("/registration", {
            templateUrl: "templates/registration.htm",
            controller: "registrationCtrl"
        })
        .when("/userdata", {
            templateUrl: "templates/userdata.htm",
            controller: "userdataCtrl"
        });
});

app.service('sharedProperties', function() {
    var user;

    return {
        getUser: function() {
            return user;
        },
        setUser: function(value) {
            user = value;
        }
    };

});

app.controller("authCtrl", function($scope, $http, sharedProperties, $window, $route) {

    if (getCockie("token")) {
        $scope.loggedIn = true;
    } else {
        $scope.loggedIn = false;
    }

    $scope.login = function() {
        // TODO: set session, token, cockie

        var loginData = $scope.loginUser;

        $http({
            url: 'http://www.hmpblv.markab.uberspace.de:63837/auth',
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + getBtoa($scope.loginUser.username, $scope.loginUser.password) }
        }).success(function(data, status, headers, config) {

            setCockie("token", data.token);
            setCockie("name", data.user.firstname);

            $scope.loginData = null;
            $scope.loggedIn = true;

            $('#login').modal("hide");

        }).error(function(data, status, headers, config) {
            if (loginData != null) {
                loginData.password = null;
            }
            $scope.loginMsg = "Fehler bei der Anmeldung - versuchen Sie es erneut.";
        });

    }

    if (getCockie("name")) {
        $scope.userFirstname = getCockie("name");
    }

    $scope.logout = function() {
        removeCockie("token");
        $scope.loggedIn = false;
    }
});

app.controller("registrationCtrl", function($scope, $http) {
    $scope.submitNewUser = function() {
        var userData = $scope.user;
        $scope.registrationMsg = '';

        $http({
            url: 'http://www.hmpblv.markab.uberspace.de:63837/user',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: userData
        }).success(function(data, status, headers, config) {
            $scope.user = null;
            $scope.registrationMsg = "Sie haben sich erfolgreich registriert.";
        }).error(function(data, status, headers, config) {
            $scope.registrationMsg = "Fehler beim registrieren - versuchen Sie es erneut.";
        });
    }
});

app.controller("userdataCtrl", function($scope, $http, sharedProperties) {

});

app.controller("indexCtrl", function($scope, $http) {

});

app.controller("devConfigCtrl", function($scope, $http) {

    $http({
        url: 'http://www.hmpblv.markab.uberspace.de:63837/device',
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + getBtoa(getCockie('token'), '') }
    }).success(function(data, status, headers, config) {
        $scope.devices = data;
    }).error(function(data, status, headers, config) {
        console.log(status);
    });

    $scope.select = function(device) {
        $scope.selectedDevice = device;
    };

    $scope.delete = function(device) {
        $http({
            url: 'http://www.hmpblv.markab.uberspace.de:63837/device/' + device.id,
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + getBtoa(getCockie('token'), '') }
        }).success(function(data, status, headers, config) {
            $scope.selectedDevice = false;
        }).error(function(data, status, headers, config) {
            console.log(status);
        });
    };

    $scope.save = function(device) {
        $http({
            url: 'http://www.hmpblv.markab.uberspace.de:63837/device/' + device.id,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + getBtoa(getCockie('token'), '') },
            data: { 'name': device.name, 'active': device.active }
        }).success(function(data, status, headers, config) {
            $scope.selectedDevice = false;
        }).error(function(data, status, headers, config) {
            console.log(status);
        });
    };

    $scope.add = function() {
        $scope.newDevice.active = false;
        $http({
            url: 'http://www.hmpblv.markab.uberspace.de:63837/device',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + getBtoa(getCockie('token'), '')
            },
            data: $scope.newDevice
        }).success(function(data, status, headers, config) {
            // TODO: refresh page to load all devices
            $('#addDevice').modal("hide");
        }).error(function(data, status, headers, config) {
            console.log(status);
        });
    };

    $scope.stop = function() {
        $scope.selectedDevice = false;
    };
});

app.controller("reportingCtrl", function($scope, $http) {

    $http({
        url: 'http://www.hmpblv.markab.uberspace.de:63837/group',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + getBtoa(getCockie('token'), '')
        }
    }).success(function(data, status, headers, config) {
        $scope.groupList = data;
    }).error(function(data, status, headers, config) {
        console.log(status);
    });

    $scope.selectedGroupChanged = function() {
        var d;
        $http({
            url: 'http://www.hmpblv.markab.uberspace.de:63837/group/' + $scope.selectedGroup.id + '/2',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + getBtoa(getCockie('token'), '')
            }
        }).success(function(data, status, headers, config) {

            FusionCharts.ready(function() {
                var degreeChart = new FusionCharts({
                    "type": "line",
                    "renderAt": "degreeChart",
                    "width": "100%",
                    "height": "400",
                    "dataFormat": "json",
                    "dataSource": {
                        "chart": {
                            "xAxisName": "Zeit",
                            "yAxisName": "Temperatur (in °C)",
                            "theme": "fint",
                            "labeldisplay": "rotate",
                            "slantlabels": "1"
                        },
                        "data": data.degree
                    }
                });

                var wetChart = new FusionCharts({
                    "type": "line",
                    "renderAt": "wetChart",
                    "width": "100%",
                    "height": "400",
                    "dataFormat": "json",
                    "dataSource": {
                        "chart": {
                            "xAxisName": "Zeit",
                            "yAxisName": "Luftfeuchtigkeit (in %)",
                            "theme": "fint",
                            "labeldisplay": "rotate",
                            "slantlabels": "1"
                        },
                        "data": data.wet
                    }
                });

                var distChart = new FusionCharts({
                    "type": "line",
                    "renderAt": "distChart",
                    "width": "100%",
                    "height": "400",
                    "dataFormat": "json",
                    "dataSource": {
                        "chart": {
                            "xAxisName": "Zeit",
                            "yAxisName": "Abstand (in cm)",
                            "theme": "fint",
                            "labeldisplay": "rotate",
                            "slantlabels": "1"
                        },
                        "data": data.dist
                    }
                });

                degreeChart.render();
                wetChart.render();
                distChart.render();

            });
        }).error(function(data, status, headers, config) {
            console.log(status);
        });
    }


    /*$http({
        method: "GET",
        url: "data/chart.json"
    }).success(function(data, status, headers, config) {
        FusionCharts.ready(function() {
            var revenueChart = new FusionCharts({
                "type": "line",
                "renderAt": "chartContainer",
                "width": "100%",
                "height": "300",
                "dataFormat": "json",
                "dataSource": data
            });

            revenueChart.render();
        });
    }).error(function(data, status, headers, config) {
        console.log(status);
    });*/
});

app.controller("groupConfigCtrl", function($scope, $http) {
    $http({
        url: 'http://www.hmpblv.markab.uberspace.de:63837/group',
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + getBtoa(getCockie('token'), '') }
    }).success(function(data, status, headers, config) {
        $scope.groups = data;
    }).error(function(data, status, headers, config) {
        console.log(status);
    });

    $scope.selectGroup = function(group) {
        $scope.selectedGroup = group;
        $scope.devices = group.devices;
        $scope.devsNotInGroup = group.devsNotInGroup;
    };

    $scope.deleteGroup = function() {
        $http({
            url: 'http://www.hmpblv.markab.uberspace.de:63837/group/' + $scope.selectedGroup.id,
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + getBtoa(getCockie('token'), '') }
        }).success(function(data, status, headers, config) {
            $scope.selectedGroup = false;
        }).error(function(data, status, headers, config) {
            console.log(status);
        });
    };

    $scope.saveGroup = function() {

        $http({
            url: 'http://www.hmpblv.markab.uberspace.de:63837/group/' + $scope.selectedGroup.id,
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + getBtoa(getCockie('token'), '') },
            data: { 'name': $scope.selectedGroup.name, 'state': $scope.selectedGroup.state }
        }).success(function(data, status, headers, config) {
            $scope.selectedGroup = false;
        }).error(function(data, status, headers, config) {
            console.log(data, status);
        });
    };

    $scope.addGroup = function() {
        $scope.newGroup.state = false;

        $http({
            url: 'http://www.hmpblv.markab.uberspace.de:63837/group',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + getBtoa(getCockie('token'), '')
            },
            data: $scope.newGroup
        }).success(function(data, status, headers, config) {
            $('#addGroup').modal("hide");
            // reset field
            $scope.newGroupName = "";
        }).error(function(data, status, headers, config) {
            console.log(status);
        });

    };

    $scope.stopGroup = function() {
        $scope.selectedGroup = false;
    };

    $scope.addDevice = function(device) {
        $http({
            url: 'http://www.hmpblv.markab.uberspace.de:63837/device/join/' + device.id,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + getBtoa(getCockie('token'), '')
            },
            // TODO edit normal pegel
            data: { 'grpId': $scope.selectedGroup.id, 'normPeg': '60' }
        }).success(function(data, status, headers, config) {
            $('#addDevice').modal("hide");
            $scope.devices.push(device);
        }).error(function(data, status, headers, config) {
            console.log(status);
        });
    };

    $scope.removeDevice = function(device, index) {
        $http({
            url: 'http://www.hmpblv.markab.uberspace.de:63837/device/join/' + device.id,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + getBtoa(getCockie('token'), '')
            }
        }).success(function(data, status, headers, config) {
            $scope.devices.splice(index, 1);
        }).error(function(data, status, headers, config) {
            console.log(data, status);
        });
    }
});

function setCockie(name, data) {
    $.cookie(name, data);
}

function getCockie(name) {
    return $.cookie(name);
}

function removeCockie(name) {
    $.removeCookie(name);
}

function getBtoa(username, password) {
    return window.btoa(username + ":" + password);
}