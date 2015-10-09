# ROUTER-UI AUTH - AngularJS Service

### Version
0.0.4.2

### Installation

#### Step 1

```sh
$ bower install ambersive-auth
```
#### Step 2
You first have to declare the 'ambersive.auth' module dependency inside your app module (perhaps inside your app main module).
Please be aware, that you need ambersive.helper, ambersive.rest and ui.router!

```sh
angular.module('app', ['ambersive.auth']);
```
### Useage

```sh

angular.module('app', ['ambersive.auth','ui.router']) .config(['$identitySettingsProvider','$stateProvider',function ($identitySettingsProvider,$stateProvider) {
     $identitySettingsProvider.setAuthentificationUrl('data/response.json');
     $identitySettingsProvider.setRedirectUrlOnLogged('http://google.at');

     $stateProvider
        .state('app', {
            abstract: true,
            resolve: {
                authorize: ['AuthSrv', function (AuthSrv) {
                    AuthSrv.authorize();
                    return AuthSrv.isAuthenticated();
                }]
            },
            data: {
                 roles: ['User']
            },
            views: {
                'app': {
                    template: '<div ui-view="main"></div>'
                }
            }
        })
        .state('app.state1', {
                 parent: 'app',
                 url:'state1',
                 views: {
                     'main@app': {
                         template: '<div>state1</div>'
                     }
                 }
             })
        .state('app.state2', {
            parent: 'app',
            url:'state2',
            data: {
                roles: []
            },
            views: {
                'main@app': {
                    template: '<div>state2</div>'
                }
            }
        })
        .state('app.state3', {
            parent: 'app',
            url:'state3',
            data: {
                roles: ['Admin']
            },
            views: {
                'main@app': {
                    template: '<div>state 3</div>'
                }
            }
        })
        .state('app.state4', {
            parent: 'app',
            url:'state4',
            data: {
                roles: [],
                redirectOnLogged:true
            },
            views: {
                'main@app': {
                    template: '<div>state 4</div>'
                }
            }
        })
        .state('app.state5', {
            parent: 'app',
            url:'state5',
            data: {
                roles: [],
                redirectOnLogged:{
                    route:'app.state1'
                }
            },
            views: {
                'main@app': {
                    template: '<div>state 5</div>'
                }
            }
        })
        .state('app.error', {
            parent: 'app',
            url:'error',
            data: {
                roles: []
            },
            views: {
                'main@app': {
                    template: '<div>error</div>'
                }
            }
        });
     }])
    .controller('DemoController',function($scope,$log,AuthSrv,$rootScope){
         $scope.simulateLogged = true;

         $scope.get = function($event){
           if(!$scope.simulateLogged){
               AuthSrv.authorize({'authenticationUrl':'data/responseEmpty.json'});
           }
           else {
               AuthSrv.authorize();
           }
         };

         $scope.get();
    });

});
```

License
----
MIT