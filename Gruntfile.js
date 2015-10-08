module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'src/*.js'],
            options: {
                globals: {
                    angular: true
                }
            }
        },
        concat:{
            'build':{
                src  : [
                    'src/*.js',
                ],
                dest : 'build/auth.js',
                filter: 'isFile'
            }
        },
        uglify:{
            build:{
                options: {
                    compress: {
                        drop_console: true
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: ['*.js', '!*.min.js'],
                    dest: 'build',
                    ext: '.min.js'
                }]
            }
        },
        watch: {
            files: ['src/*.js'],
            tasks: ['jshint','build']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['concat','uglify']);

};