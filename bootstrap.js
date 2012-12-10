const { classes: Cc, interfaces: Ci } = Components;

ObserverService		= Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);
IOService		= Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
DirectoryService	= Cc['@mozilla.org/file/directory_service;1'].getService(Components.interfaces.nsIProperties)
FileOutputStream	= Cc['@mozilla.org/network/file-output-stream;1'].createInstance(Components.interfaces.nsIFileOutputStream);
ConverterOutputStream	= Cc['@mozilla.org/intl/converter-output-stream;1'].createInstance(Components.interfaces.nsIConverterOutputStream);

var LoggerObj = {
	file: null,
	foStream: null,
	converter: null,
		
	init: function() {
		LoggerObj.file = DirectoryService.get('Home', Components.interfaces.nsIFile);
		LoggerObj.file.append('fox.log');

		LoggerObj.foStream = FileOutputStream; 
		LoggerObj.foStream.init(LoggerObj.file, 
			0x02 | 0x08 | 0x10, // WRONLY | CREATE_FILE | APPEND
			0666, 0); 

		LoggerObj.converter = ConverterOutputStream;
		LoggerObj.converter.init(LoggerObj.foStream, 'UTF-8', 0, 0);
	},

	log: function(msg){
		var d = new Date();
		LoggerObj.converter.writeString('[' + d.toLocaleTimeString() + '] ' + msg + '\n');
	},

	release: function(){
		if (LoggerObj.converter) {
			LoggerObj.converter.close();
		}
	},
};

var ObserverObj = {
	init: function() {
		ObserverService.addObserver(this, 'http-on-modify-request', false);
	},

	observe: function(subject, topic, data) {
    		var httpChannel = subject.QueryInterface(Ci.nsIHttpChannel);
		var requestURI	= httpChannel.URI, 
		    refererURI;
		
		try { 
			refererURI = IOService.newURI(httpChannel.getRequestHeader('referer'), null, null); 
		} catch(e) {}

		// TODO: implement custom uri filters
		str = (refererURI ? refererURI.asciiSpec + ' -> ' :  '') + requestURI.asciiSpec;
		LoggerObj.log(str);
	}
};

var TestLogger = { 
	start: function () {
		LoggerObj.init();
		ObserverObj.init();
	},

	stop: function () {
		LoggerObj.dispose();
	}
}

function startup(data, reason) {
	TestLogger.start();
	LoggerObj.log(" #### Starting logging");
}

function shutdown(data, reason) {
	LoggerObj.log(" #### Stopping logging");
	TestLogger.stop();
}

function install(data, reason) {}

