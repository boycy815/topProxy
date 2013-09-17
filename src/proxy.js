KISSY.use('node, json, uri', function(S, Node, Json, Uri){
	Node.one(window).on('hashchange', function(e)
	{
		var uri = new Uri(location.href);
		var hash = uri.getFragment();
		var json = Json.parse(hash);
		var method = json.method;
		method = method.split(".");
		var args = json.args;
		var methodObj = window.top;
		for (i = 0; i < method.length - 1; i++)
		{
			methodObj = methodObj[method[i]];
		}
		methodObj[method[method.length - 1]].apply(methodObj, args);
	});
});