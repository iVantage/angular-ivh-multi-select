/*jshint node:true */

module.exports = function(grunt) {
  'use strict';

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: 'gruntfile.js',
      src: 'src/**/*.js',
      spec: {
        options: {
          jshintrc: 'test/spec/.jshintrc'
        },
        src: 'test/spec/**/*.js'
      }
    },

    jscs: {
      options: {
        config: '.jscsrc'
      },
      gruntfile: {
        files: {
          src: [
            'Gruntfile.js'
          ]
        }
      },
      spec: {
        files: {
          src: [
            'test/spec/**/*.js'
          ]
        }
      },
      scripts: {
        files: {
          src: [
            'src/scripts/**/*.js'
          ]
        }
      }
    },

    clean: {
      dist: 'dist'
    },

    concat: {
      options: {separator: '\n'},
      dist: {
        src: ['src/scripts/module.js', 'src/scripts/**/*.js'],
        dest: 'dist/ivh-multi-select.js'
      }
    },

    uglify: {
      dist: {
        src: 'dist/ivh-multi-select.js',
        dest: 'dist/ivh-multi-select.min.js'
      }
    },

    less: {
      dist: {
        files: {
          'dist/ivh-multi-select.css': 'src/styles/**/*.less'
        }
      }
    },

    cssmin: {
      dist: {
        files: {
          'dist/ivh-multi-select.min.css': 'dist/ivh-multi-select.css'
        }
      }
    },

    jasmine: {
      spec: {
        // Load dist files to have external templates inlined
        src: ['dist/ivh-multi-select.js'],
        options: {
          specs: 'test/spec/**/*.js',
          summary: true,
          vendor: [
            'bower_components/jquery/dist/jquery.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-ivh-pager/dist/ivh-pager.js',
            'bower_components/selection-model/dist/selection-model.js',
            'test/helpers/count-watchers.js'
          ]
        }
      }
    },

    watch: {
      scripts: {
        files: 'src/scripts/**/*.js',
        tasks: ['test'] // builds scripts
      },
      styles: {
        files: 'src/styles/**/*.less',
        tasks: ['build:styles']
      },
      tests: {
        files: 'test/spec/**/*.js',
        tasks: ['testlte']
      }
    },

    bump: {
      options: {
        commitMessage: 'chore: Bump for release (v%VERSION%)',
        files: ['package.json', 'bower.json'],
        commitFiles: ['package.json', 'bower.json'],
        push: false
      }
    }
  });

  grunt.registerTask('ng-inline', function() {
    // Look for "templateUrl"s in concat:dist and swap them out for "template"
    // with the template's contents.
    var s = grunt.file.read('dist/ivh-multi-select.js');
    s = s.replace(/templateUrl: '([^']+)'/g, function(match, $1) {
      var c = grunt.file.read($1)
        .replace(/\s*\r?\n\s*/g, '\\n')
        .replace(/'/g, '\\\'');
      return 'template: \'' + c + '\'';
    });
    grunt.file.write('dist/ivh-multi-select.js', s);
  });

  // Load plugins
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('test', [
    'build:scripts',
    'jshint',
    'jscs',
    'build:scripts',
    'jasmine'
  ]);

  grunt.registerTask('testlte', [
    'build:scripts',
    'jshint',
    'jscs',
    'jasmine'
  ]);

  grunt.registerTask('build:scripts', [
    'concat',
    'ng-inline',
    'uglify'
  ]);

  grunt.registerTask('build:styles', [
    'less',
    'cssmin'
  ]);

  grunt.registerTask('build', [
    'build:scripts',
    'build:styles'
  ]);

  grunt.registerTask('default', [
    'clean',
    'test', // builds scripts
    'build:styles'
  ]);

};
