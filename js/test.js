var config = {
	player: "flash",
	url: "http://wams.edgesuite.net/media/SintelTrailer_MP4_from_WAME/sintel_trailer-1080p.ism/manifest",
	mp4url: "http://wams.edgesuite.net/media/SintelTrailer_MP4_from_WAME/sintel_trailer-1080p_3400.mp4",
	format: "smooth"
};
// put function into jQuery namespace
jQuery.redirect = function (url, params) {

	url = url || window.location.href || '';
	url = url.match(/\?/) ? url : url + '?';

	for (var key in params) {
		var re = RegExp(';?' + key + '=?[^&;]*', 'g');
		url = url.replace(re, '');
		url += ';' + key + '=' + params[key];
	}
	// cleanup url 
	url = url.replace(/[;&]$/, '');
	url = url.replace(/\?[;&]/, '?');
	url = url.replace(/[;&]{2}/g, ';');
	// $(location).attr('href', url);
	window.location.replace(url);
};

var queryString = function () {
	// This function is anonymous, is executed immediately and 
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [query_string[pair[0]], pair[1]];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	}
	return query_string;
}();

var initialize = function () {
	//reset any state
	// reset();

	//read query strings
	if (queryString.url) {
		config.url = queryString.url;
	}
	if (queryString.player) {
		config.player = queryString.player;
	}
	if (queryString.format) {
		config.format = queryString.format;
	}
	if (queryString.mp4url) {
		config.mp4url = queryString.mp4url;
	}
	console.log("Config chosen is: Player - " + config.player + ", Format - " + config.format + ", url - " + config.url);

	//get ther right format specific url
	var url = getUrl(config);
	switch (config.player) {
		case "flash":
			setFlashUrl(url);
			$('#embed-url').show();
			$('.config-body .adaptive').show();
			$('.config-body .mp4').hide();
			break;
		case "silverlight":
			setSilverlightUrl(url);
			$('#embed-url').show();
			$('.config-body .adaptive').show();
			$('.config-body .mp4').hide();
			break;
		case "html5":
			setHtml5Url(url);
			$('#embed-url').hide();
			$('.config-body .adaptive').hide();
			$('.config-body .mp4').show();
			break;
	}

	//setup modal dialog
	$(".config-body #adaptive-url").val(config.url);
	$(".config-body #ss-url").val(config.url);
	$(".config-body #mp4-url").val(config.mp4url);

	//setup UI
	$("." + config.player).show();
	$("[data-player='" + config.player + "']").toggleClass("active");
	$("[data-format='" + config.format + "']").toggleClass("btn-default");
	$("[data-format='" + config.format + "']").toggleClass("btn-primary");
};

var reset = function () {
	//Hide all the players and show just the one we need
	$("section").hide();
	//reset ui elements
	$("[data-player='*']").removeClass("active");
	$("[data-format='*']").removeClass("btn-primary").addClass("btn-default");
}

var getUrl = function (config) {
	switch (config.format) {
		case "smooth":
			return config.url;
			break;
		case "mpeg-dash":
			return config.url + "(format=mpd-time-csf)";
			break;
		case "mp4":
			return config.mp4url;
			break
		default:
			return null;
	}
};

var setFlashUrl = function (url) {
	var flashvars = {};
	flashvars.src = url;
	flashvars.autoPlay = 'true';
	flashvars.plugin_AdaptiveStreamingPlugin = 'http://D28C.wpc.azureedge.net/80D28C/amsplayer/assets/MSAdaptiveStreamingPlugin-v1.0.13-osmf2.0.swf';
	flashvars.AdaptiveStreamingPlugin_retryLive = 'true';
	flashvars.AdaptiveStreamingPlugin_retryInterval = '10';
	var parameters = { allowfullscreen: 'true' };
	parameters.wmode = 'direct';
	var attributes = {};
	swfobject.embedSWF('http://D28C.wpc.azureedge.net/80D28C/amsplayer/assets/StrobeMediaPlayback.2.0.swf', 'flashPlayer', "100%", "100%", '10.1.0', false, flashvars, parameters, attributes, null);
};

var setSilverlightUrl = function (url) {
	$("param[name='InitParams']").attr("value", "mediaurl=" + url);
};

var setHtml5Url = function (url) {
	$("video source").attr("src", url);
};

$(document).ready(function () {
	initialize();

	$("button[data-format]").click(function (e) {
		config.format = $(e.currentTarget).attr("data-format");
		window.location.search = "?player=" + config.player + "&format=" + config.format + "&url=" + config.url + "&mp4url=" + config.mp4url;
	});

	$("li[data-player] a").click(function (e) {
		config.player = $(e.currentTarget).parent().attr("data-player");
		if (config.player === "html5") {
			config.format = "mp4";
		} else {
			if (config.format === "mp4") {
				config.format = "smooth";
			}
		}
		window.location.search = "?player=" + config.player + "&format=" + config.format + "&url=" + config.url + "&mp4url=" + config.mp4url;
		return false;
	});

	/*$('#ss-url').editable({
		success: function(response, newValue) {
			config.url = newValue;
			window.location.search="?player="+config.player+"&format="+config.format+"&url="+config.url+"&mp4url="+config.mp4url;
		}
	});*/

	$('#embed-url').click(function (e) {
		//alert("Almost there!");
		$('.embed-code-box textarea').val($('.' + config.player + ' object')[0].outerHTML);
		$('.embed-code-box').toggle();
	});

	$('.embed-code-box .close').click(function (e) {
		$('.embed-code-box').hide();
	});

	$(".config-body #config-save").click(function (e) {
		config.url = $("#adaptive-url").val();
		config.mp4url = $("#mp4-url").val();
		window.location.search = "?player=" + config.player + "&format=" + config.format + "&url=" + config.url + "&mp4url=" + config.mp4url;
	});
});