requirejs.config({
	paths: {
		'angular-filter': 'lib/angular-1.4.0-beta.6/modules/angular-filter'
		, 'angular-context-menu' : 'lib/angular-1.4.0-beta.6/modules/angular-context-menu'
		, 'lodash2' : 'lib/lodash/lodash_2.4.1'
	},
	map: {
		'*': {
			'lib/jquery/1_11': 'jquery'
		}
	}
});
