/**
 * FileDrop.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

define('file/FileDrop', ['o', 'file/File', 'runtime/RuntimeClient'], function(o, File, RuntimeClient) {	

	var x = o.Exceptions;

	var dispatches = ['ready', 'dragleave', 'dragenter', 'drop', 'error'];

	function FileDrop(options) {
		var self = this, defaults; 
	
		// if flat argument passed it should be drop_zone id	
		if (typeof(options) === 'string') {
			options = { drop_zone : options };
		}

		// figure out the options	
		defaults = {
			accept: [{
				title: o.translate('All Files'),	
				extensions: '*'
			}],
			required_caps: {
				drag_and_drop: true
			}
		};
		
		options = typeof(options) === 'object' ? o.extend({}, defaults, options) : defaults;

		// this will help us to find proper default container
		options.container = o(options.drop_zone) || document.body;

		// make container relative, if they're not
		if (o.getStyle(options.container, 'position') === 'static') {
			options.container.style.position = 'relative';
		}
					
		// normalize accept option (could be list of mime types or array of title/extensions pairs)
		if (typeof(options.accept) === 'string') {
			options.accept = o.mimes2extList(options.accept);
		}
						
		RuntimeClient.call(self);
		
		o.extend(self, {
			
			uid: o.guid('uid_'),
			
			ruid: null,
			
			files: null,

			init: function() {
	
				self.convertEventPropsToHandlers(dispatches);	
		
				self.bind('RuntimeInit', function(e, runtime) {	
					self.ruid = runtime.uid;	

					self.bind("Drop", function(e) {	
						var files = runtime.exec.call(self, 'FileDrop', 'getFiles');

						self.files = [];

						o.each(files, function(file) {	
							self.files.push(new File(self.ruid, file));
						});						
					}, 999);	
					
					runtime.exec.call(self, 'FileDrop', 'init');
								
					self.dispatchEvent('ready');
				});
							
				// runtime needs: options.required_features, options.runtime_order and options.container
				self.connectRuntime(options); // throws RuntimeError
			}
		});
	}
	
	FileDrop.prototype = o.eventTarget;
			
	return FileDrop;
});