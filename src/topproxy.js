KISSY.add('topproxy',function(S, Node, Json, Uri) {
	//TopProxyConfig.url 设置代理地址
	function setDomain()
	{
		var localUrl = new Uri(location.href);
		var host = localUrl.hostname;
		host = host.split('.');
		if (host.length > 2)
		{
			host = host.slice(host.length - 2, host.length);
		}
		host = host.join('.');
		document.domain = host;
	}
	setDomain();

	var TopProxy = {};
	var proxyUrl = (TopProxyConfig && TopProxyConfig.url) ? new Uri(TopProxyConfig.url) : null;
	var iframe;
	var iframeComplete;
	var waitingList = [];
	var processMark;
	var rcount = 0;
	function winCall()
	{
		var test;
		try{test = window.top.location.href;}catch(e){}
		if (test)
		{
			var method = arguments[0];
			method = method.split(".");
			var args = [];
			for (var i = 1; i < arguments.length; i++)
			{
				args.push(arguments[i]);
			}
			var methodObj = window.top;
			try
			{
				for (i = 0; i < method.length - 1; i++)
				{
					methodObj = methodObj[method[i]];
				}
				methodObj[method[method.length - 1]].apply(methodObj, args);
			}
			catch(e){}
		}
	}
	function iframeCall()
	{
		if (!iframe)
		{
			startLoad();
		}
		waitingList.push(arguments);
		proccessWaitingList();
	}
	function proxyCall()
	{
		var method = arguments[0];
		var args = [];
		for (var i = 1; i < arguments.length; i++)
		{
			args.push(arguments[i]);
		}
		var post = {method:method, args:args, t:rcount++};
		post = Json.stringify(post);
		proxyUrl.setFragment(post);
		iframe.attr('src', proxyUrl);
	}
	function proccessWaitingList()
	{
		if (!processMark && iframeComplete)
		{
			proccessInnerWaitingList();
		}
	}
	function proccessInnerWaitingList()
	{
		if (waitingList.length)
		{
			processMark = true;
			(function(waitingList){
				setTimeout(function()
				{
					proxyCall.apply(null, waitingList.shift());
					processMark = false;
					proccessInnerWaitingList();
				}, 0);
			})(waitingList);
		}
	}
	function startLoad()
	{
		iframe = new Node('<iframe src="' + proxyUrl.toString() + '"></iframe>');
		iframe.on('load', function()
		{
			iframeComplete = true;
			proccessWaitingList();
		});
		iframe.hide();
		Node.one('body').append(iframe);
	}
	TopProxy.call = function()
	{
		if (proxyUrl)
		{
			iframeCall.apply(null, arguments);
		}
		else
		{
			winCall.apply(null, arguments);
		}
	};
	return TopProxy;
}, {requires:['node', 'json', 'uri']});