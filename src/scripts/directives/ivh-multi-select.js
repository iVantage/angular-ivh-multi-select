
/**
 * The Multi Select directive
 *
 * @package ivh.multiSelect
 * @copyright 2015 iVantage Health Analytics, Inc.
 */

angular.module('ivh.multiSelect')
  .directive('ivhMultiSelect', function() {
    'use strict';
    return {
      scope: {
        labelAttr: '=ivhMultiSelectLabelAttribute',
        labelExpr: '=ivhMultiSelectLabelExpression',

        /**
         * The universe of items
         */
        items: '=ivhMultiSelectItems',

        /**
         * Options for selection model
         */
        selectionModelType: '=',
        selectionModelMode: '=',
        selectionModelSelectedAttribute: '=',
        selectionModelSelectedClass: '=',
        selectionModelCleanupStrategy: '=',
        selectionModelSelectedItems: '=',

        /**
         * Should be an angular expression in which `item` is the collection
         * item that has changed selected state
         */
        selOnChange: '&selectionModelOnChange'
      },
      restrict: 'AE',
      templateUrl: 'src/views/ivh-multi-select.html',
      transclude: true,
      controllerAs: 'ms',
      controller: ['$document', '$scope', 'ivhMultiSelectCore',
          function($document, $scope, ivhMultiSelectCore) {

        /**
         * Mixin core functionality
         */
        var ms = this;
        ivhMultiSelectCore.init(ms, $scope);

        /**
         * Attach the passed items to our controller for consistent interface
         *
         * Will be updated from the view as `$scope.items` changes
         */
        ms.items = $scope.items;

        /**
         * Select all (or deselect) *not filtered out* items
         *
         * Note that if paging is enabled items on other pages will still be
         * selected as normal.
         */
        ms.selectAllVisible = function(isSelected) {
          isSelected = angular.isDefined(isSelected) ?  isSelected : true;
          var selectedAttr = ms.sel.selectedAttribute;
          angular.forEach(ms.items, function(item) {
            item[selectedAttr] = isSelected;
            ms.sel.onChange(item);
          });
        };
      }]
    };
  });
