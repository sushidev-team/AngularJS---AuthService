/**
 * Auth Helper Service for AngularJS
 * @version v0.0.1
 * @link http://www.ambersive.com
 * @licence MIT License, http://www.opensource.org/licenses/MIT
 */

(function(window, document, undefined) {

    'use strict';

    angular.module('ambersive.auth',['ambersive.rest','ambersive.helper','ui.router']);

    angular.module('ambersive.auth').run(['$rootScope', '$state', '$stateParams', 'AuthSrv', 'IdentitySrv',
        function ($rootScope, $state, $stateParams, AuthSrv, IdentitySrv) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            $rootScope.toState = $state;
            $rootScope.toStateParams = $stateParams;

            $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
                $rootScope.toState = toState;
                $rootScope.toStateParams = toStateParams;
                AuthSrv.authorize();
            });
        }
    ]);

    angular.module('ambersive.auth').provider('$identitySettings',[function(){

        var identityAuthenticationUrl = 'auth/current',
            identityAuthenticationUrlDenied     = '/401',
            identityAuthenticationRouteDenied   = 'app.error',
            identityAuthenticationLoggedRedirectUrl    = '',
            identityAuthenticationLoggedRedirectRoute  = '',
            setAuthentificationUrl = function(url){
                identityAuthenticationUrl = url;
            },
            setRedirectUrlOnAccessDenied = function(url){
                identityAuthenticationUrlDenied = url;
            },
            setRedirectRouteOnAccessDenied = function(route){
                identityAuthenticationRouteDenied = route;
            },
            setRedirectUrlOnLogged = function(url){
                identityAuthenticationLoggedRedirectUrl = url;
            },
            setRedirectRouteOnLogged = function(route){
                identityAuthenticationLoggedRedirectRoute = route;
            };


        return {
            setAuthentificationUrl: setAuthentificationUrl,
            setRedirectUrlOnLogged: setRedirectUrlOnLogged,
            setRedirectRouteOnLogged: setRedirectRouteOnLogged,
            setRedirectUrlOnAccessDenied : setRedirectUrlOnAccessDenied,
            setRedirectRouteOnAccessDenied: setRedirectRouteOnAccessDenied,
            $get: function () {
                return {
                    authenticationUrl:identityAuthenticationUrl,
                    urlDenied:identityAuthenticationUrlDenied,
                    routeDenied:identityAuthenticationRouteDenied,
                    urlLogged:identityAuthenticationLoggedRedirectUrl,
                    routeLogged:identityAuthenticationLoggedRedirectRoute
                };
            }
        };
}]);

    angular.module('ambersive.auth').factory('IdentitySrv',['$q','$log','$rootScope','$identitySettings','RestSrv','HelperSrv',
        function($q,$log,$rootScope,$identitySettings,RestSrv,HelperSrv){

            var IdentitySrv = {},
                _Itentity,
                _ItentitySettings = $identitySettings;

            IdentitySrv.current = function(){
              return _Itentity;
            };

            IdentitySrv.isIdentityResolved = function () {
                return angular.isDefined(_identity);
            };
            IdentitySrv.isAuthenticated = function(){
              if(_Itentity !== undefined && _Itentity !== null && _Itentity !== ""){
                  return true;
              } else {
                  return false;
              }
            };
            IdentitySrv.isInRole = function(role){
                if (Itentity === undefined || !_Itentity === null) return false;
                if (!_Itentity.roles) return false;
                return _Itentity.roles.indexOf(role) != -1;
            };
            IdentitySrv.isInAnyRole = function(roles){
                if (!roles) return false;

                var rolesAmount = roles.length;

                if (rolesAmount === 0) return false;

                for (var i = 0; i < rolesAmount; i++) {
                    if (IdentitySrv.isInRole(roles[i])) return true;
                }
                return false;
            };
            IdentitySrv.isInAnyRoleGlobal = function(){
                if (!_Itentity.roles) return false;

                var roles = _Itentity.roles,
                    rolesAmount = roles.length;

                if (rolesAmount === 0) return false;

                for (var i = 0; i < rolesAmount; i++) {
                    if (IdentitySrv.isInRole(roles[i])) return true;
                }
                return false;
            };

            IdentitySrv.get = function(settings){

                if(settings === undefined){
                    settings = _ItentitySettings;
                }

                var deferred = $q.defer(),
                    authObj = {
                        'method': 'GET',
                        'url': settings.authenticationUrl
                    };

                HelperSrv.cookies.get('accessToken', function (accessToken) {
                    if(accessToken !== undefined && accessToken !== '') {
                        authObj.header[RestSrv.config.auth.tokenName] = accessToken;
                    }

                    RestSrv.call(authObj, function (result) {

                        if(result.status === 401){
                            _Itentity = null;
                        } else {
                            var data = result.data;
                            if(data.data !== undefined){
                                data = data.data;
                            }
                            _Itentity = data;
                        }

                        deferred.resolve(_Itentity);
                        $rootScope.idenity = _Itentity;
                        $rootScope.isAuthenticated = IdentitySrv.isAuthenticated();
                    });

                });

                return deferred.promise;
            };

            IdentitySrv.settings = {
                'get':function(name){
                    if(_ItentitySettings === undefined){ return null;}
                    if(_ItentitySettings[name] === undefined){ return null;}
                    return _ItentitySettings[name];
                },
                'set':function(name,value){
                    if(_ItentitySettings === undefined){
                        $log.error('_ItentitySettings is undefined');
                        return null;
                    }
                    _ItentitySettings[name] = value;
                }
            };

            return IdentitySrv;

        }]);

    angular.module('ambersive.auth').factory('AuthSrv',['$q','$log','$window','IdentitySrv','$identitySettings','$rootScope','$state',
        function($q,$log,$window,IdentitySrv,$identitySettings,$rootScope,$state){

            var AuthSrv = {};

            AuthSrv.isAuthenticated = function(){
                return IdentitySrv.isAuthenticated();
            };

            AuthSrv.getUrlOrRoute = function(mode){
                var _urlOrRoute     = '',
                    _isUrl          = true,
                    _nameUrl        = '',
                    _nameRoute      = '';

                switch(mode){
                    case 'logged':
                        _nameUrl    = 'urlLogged';
                        _nameRoute  = 'routeLogged';
                        break;
                    default:
                        _nameUrl    = 'urlDenied';
                        _nameRoute  = 'routeDenied';
                        break;
                }

                _urlOrRoute = $identitySettings[_nameUrl];
                if($identitySettings[_nameRoute] !== ''){
                    _urlOrRoute = $identitySettings[_nameRoute];
                    _isUrl = false;
                }

                return {path:_urlOrRoute,isUrl:_isUrl};
            };

            AuthSrv.authorize = function(settings){
                return IdentitySrv.get(settings)
                    .then(function (_identity) {

                        var _isAuthenticated = IdentitySrv.isAuthenticated(),
                            _userRoles = [],
                            _roles = [],
                            _rolesAmount = 0,
                            _redirectDenied = AuthSrv.getUrlOrRoute('denied'),
                            _redirectLogged = AuthSrv.getUrlOrRoute('logged'),
                            _redirectData = null,
                            _redirectFn = function(){

                                if(_redirectData === undefined){ return; }
                                if(_redirectData === null){ return; }

                                switch(typeof(_redirectData)){
                                    case 'object':
                                        if (_redirectData.route !== undefined && _redirectLogged.route !== '') {
                                            $state.go(_redirectData.route);
                                            return;
                                        }
                                        if (_redirectData.url !== undefined && _redirectData.url !== '') {
                                            $window.location.href = _redirectData.url;
                                        }
                                        break;
                                    case 'boolean':
                                        if(_redirectData === true){
                                            if(_redirectLogged.isUrl === true){
                                                if(_redirectLogged.path !== '') {
                                                    $window.location.href = _redirectLogged.path;
                                                }
                                            } else {
                                                if(_redirectLogged.path !== ''){
                                                    $state.go(_redirectLogged.path);
                                                }
                                            }
                                        }
                                        break;
                                }


                            };

                        // Get user and site roles

                        if(_identity !== null) {
                            if (_identity.roles !== undefined) {
                                _userRoles = _identity.roles;
                            }
                        }

                        if($rootScope.toState !== undefined){
                            if($rootScope.toState.data !== undefined){
                                if($rootScope.toState.data.roles !== undefined){
                                    _roles = $rootScope.toState.data.roles;
                                    _rolesAmount = _roles.length;
                                }
                                if($rootScope.toState.data.redirectOnLogged !== undefined){
                                    _redirectData = $rootScope.toState.data.redirectOnLogged;
                                }
                            }
                        }

                        if(_rolesAmount > 0 &&  !IdentitySrv.isInAnyRole(_roles)){

                            // Permission denied

                            if(_redirectDenied.isUrl === true){
                                if(_redirectDenied.path !== '') {
                                    $window.location.href = _redirectDenied.path;
                                }
                            } else {
                                if(_redirectDenied.path !== ''){
                                    $state.go(_redirectDenied.path);
                                }
                            }

                        } else {

                            // if permission for site is granted

                            if(_isAuthenticated === true){

                                if(_redirectData !== undefined){
                                    _redirectFn();
                                }

                            }


                        }

                    });
            };

            return AuthSrv;

    }]);

})(window, document, undefined);