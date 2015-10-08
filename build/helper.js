/**
 * Auth Helper Service for AngularJS
 * @version v0.0.1
 * @link http://www.ambersive.com
 * @licence MIT License, http://www.opensource.org/licenses/MIT
 */

(function(window, document, undefined) {'use strict';

    angular.module('ambersive.auth',[]);

    angular.module('ambersive.auth').factory('AuthSrv',['$log',
        function($log){

            var AuthSrv = {};

            AuthSrv.authorize = function(){

            };

            return AuthSrv;

    }]);

})(window, document, undefined);