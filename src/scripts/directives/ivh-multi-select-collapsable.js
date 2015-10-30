
/**
 * Listen for clicks outside the multi-select and collapse it if needed
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelectCollapsable', ['$document', function($document) {
    'use strict';
    return {
      restrict: 'A',
      require: ['?^ivhMultiSelect', '?^ivhMultiSelectAsync'],
      link: function(scope, element, attrs, ctrls) {

        /**
         * Clicks on the body should close this multiselect
         *
         * ... unless the element has been tagged with
         * ivh-multi-select-stay-open... ;)
         *
         * Be a good doobee and clean up this click handler when our scope is
         * destroyed
         */
        var $bod = $document.find('body');

        var collapseMe = function($event) {
          var evt = $event.originalEvent || $event;
          if(!evt.ivhMultiSelectIgnore) {
            // Only one of the required parent controllers will be defined
            angular.forEach(ctrls, function(ms) {
              if(ms) { ms.isOpen = false; }
            });
            scope.$digest();
          }
        };

        $bod.on('click', collapseMe);

        scope.$on('$destroy', function() {
          $bod.off('click', collapseMe);
        });
      }
    };
  }]);



