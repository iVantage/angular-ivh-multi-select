
# ivh.multiSelect

[![Build Status](https://secure.travis-ci.org/iVantage/angular-ivh-multi-select.png?branch=master)](https://travis-ci.org/iVantage/angular-ivh-multi-select)

> An elegant and efficient multi select for AngularJS apps.

IVH Multi Select aims to provide a robust multiselect component while keeping a
careful eye on performance and minizing watch counts. While collapsed IVH Multi
Select will create just ~10 watchers, and only ~40 while expanded.

Note that IVH Multi Select assumes Bootstrap 3 styles.


## Installation

Install with bower:

```
bower install --save angular-ivh-multi-select
```


## Usage

Add this module as a dependency to your app:

```
angular.module('myApp', ['ivh.multiSelect']);
```

At a minimum you must provide a collection of items to select from:

```html
<div ivh-multi-select
     ivh-multi-select-items="myCollection">
  Choose some items!
</div>
```

IVH Multi Select will display a button that when clicked shows a menu of items
to select complete with checkboxes and pagination if availabe. 

We're using the [selection-model][sm] component to manage selections internally.
You can configure this directive's behavior by working with the
[selectionModelOptionsProvider][sm-opt]. Inline `selection-model-*` attributes
will also be forwarded to the underlying selection model:

```html
<div ivh-multi-select
     ivh-multi-select-items="myCollection"
     selection-model-selected-attribute="'customSelectedAttr'">
  Choose some items!
</div>
```

This includes `selection-model-on-change` with the notable exception that when
this expression is evaluated IVH Multi Select will provide a scope variable,
`item`, which will be a reference to the collection item whose selected status
has changed.


### Pagination

In keeping with our focus on performance, IVH Multi Select will paginate your
lists if you happen to have the [ivh.pager][pager] module included as a
dependency.

This is not a hard dependency, if you do not include IVH Pager your lists will
be displayed in full.


### Tracking Selected IDs

We're using selection-model internally to manage selections. As a convenience we
provide a filter, `ivhMultiSelectCollect`, to help convert these to arrays of
IDs if that is more in keeping with your use case. Note that this behavior is
only supported when using the `multi-additive` selection mode (the default).

```
<!--
  The array demo.selectedIds will be updated whenever an item is clicked on or
  the user hits the "All" or "None" buttons.
-->
<div ivh-multi-select
     ivh-multi-select-items="demo.items"
     selection-model-on-change="demo.selectedIds | ivhMultiSelectCollect:item">
</div>

<!--
  You may also provide an id attribute and selected attribute if needed.
-->
<div ivh-multi-select
     ivh-multi-select-items="demo.items"
     selection-model-on-change="demo.selectedIds | ivhMultiSelectCollect:item:'id':'selected'">
</div>
```

## Testing

Use `npm test` to run the full suite of linting, style checks, and unit tests.

Or, run each individually:

- Use `grunt jshint` for linting
- Use `grunt jscs` for coding style checks
- Use `grunt jasmine` to unit tests

For ease of development the `grunt watch` task will run each of the above as
needed when you make changes to source files.


## Changelog

- 2015-10-20 v0.2.0 Forward selection-model-on-change
- 2015-10-08 v0.2.0 Forward options to selection model
- 2015-10-07 v0.1.0 Initial release


## License

MIT

[sm]: https://github.com/jtrussell/angular-selection-model
[sm-opt]: https://github.com/jtrussell/angular-selection-model#the-selectionmodeloptionsprovider
[pager]: https://github.com/ivantage/angular-ivh-pager
