
# ivh.multiSelect

[![Build Status](https://secure.travis-ci.org/iVantage/angular-ivh-multi-select.png?branch=master)](https://travis-ci.org/iVantage/angular-ivh-multi-select)

> An elegant and efficient multi select for AngularJS apps.

IVH Mutli Select aims to provide a robust mutliselect component while keeping a
careful eye on performance and minizing watch counts. While collapsed IVH Multi
Select will create just 4 watchers, and only ~40 while expanded.

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
[selectionModelOptionsProvider][sm-opt]. Note that at the moment we are forcing
checkboxes and a "multi-additive" selection model.

Eventually we hope to make this directive configurable to forward along
parameters to selection model.


### Pagination

In keeping with our focus on performance, IVH Multi Select will paginate your
lists if you happen to have the [ivh.pager][pager] module included as a
dependency.

This is not a hard dependency, if you do not include IVH Pager your lists will
be displayed in full.


## Testing

Use `npm test` to run the full suite of linting, style checks, and unit tests.

Or, run each individually:

- Use `grunt jshint` for linting
- Use `grunt jscs` for coding style checks
- Use `grunt jasmine` to unit tests

For ease of development the `grunt watch` task will run each of the above as
needed when you make changes to source files.


## Changelog

2015-10-07 v0.1.0 Initial release


## License

MIT

[sm]: https://github.com/jtrussell/angular-selection-model
[sm-opt]: https://github.com/jtrussell/angular-selection-model#the-selectionmodeloptionsprovider
[pager]: https://github.com/ivantage/angular-ivh-pager
