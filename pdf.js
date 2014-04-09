var getAcrobatInfo = function (callback) {

    var getBrowserName = function () {
        return this.name = this.name || function () {
            var userAgent = navigator ? navigator.userAgent.toLowerCase() : "other";

            if (userAgent.indexOf("chrome") > -1) return "chrome";
            else if (userAgent.indexOf("safari") > -1) return "safari";
            else if (userAgent.indexOf("msie") > -1) return "ie";
            else if (userAgent.indexOf("firefox") > -1) return "firefox";
            return userAgent;
        } ();
    };

    var getActiveXObject = function (name) {
        try { return new ActiveXObject(name); } catch (e) { }
    };

    var getNavigatorPlugin = function (name) {
        for (key in navigator.plugins) {
            var plugin = navigator.plugins[key];
            if (plugin.name == name) return plugin;
        }
    };

    var getPDFPlugin = function () {
        return this.plugin = this.plugin || function () {
            if (getBrowserName() == 'ie') {
                //
                // load the activeX control
                // AcroPDF.PDF is used by version 7 and later
                // PDF.PdfCtrl is used by version 6 and earlier
                return getActiveXObject('AcroPDF.PDF') || getActiveXObject('PDF.PdfCtrl');
            }
            else {
                return getNavigatorPlugin('Adobe Acrobat') || getNavigatorPlugin('Chrome PDF Viewer') || getNavigatorPlugin('WebKit built-in PDF');
            }
        } ();
    };

    var isAcrobatInstalled = function () {
        return !!getPDFPlugin();
    };

    var plugin = getPDFPlugin(), browser = getBrowserName();

    var getAcrobatVersion = function () {
        try {
            if (browser == 'ie') {
                var versions = plugin.GetVersions().split(',');
                var latest = versions[0].split('=');
                return parseFloat(latest[1]);
            }

            if (plugin.version) return parseInt(plugin.version);
            return plugin.name

        }
        catch (e) {
            if (browser == 'ie' && cnt < 4) return -1; // when the plugin (IE10) is not fully loaded yet you get an error
            return null;
        }
    }

    var cnt = 0, timer = function () {
        var info = {
            browser: browser,
            acrobat: isAcrobatInstalled() ? 'installed' : false,
            acrobatVersion: getAcrobatVersion(),
            count: cnt
        };
        if (info.acrobatVersion == -1 && cnt < 4) {
            cnt++; window.setTimeout(timer, 200);
        }
        else callback(info);
    }

    if (callback) {
        /*
            on my machine with IE10:
            - when I call timer without the setTimeout, plugin.GetVersions is undefined
            - a call to the timer function with the setTimeout and zero milliseconds is enough to get the versions the first time
            - when this is to fast I wait some milliseconds and try it again
        */
        window.setTimeout(timer, 0); // on my machine IE10 a timeout of zero is enough
    } else {

        //
        // The returned object
        // 
        return {
            browser: browser,
            acrobat: isAcrobatInstalled() ? 'installed' : false,
            acrobatVersion: getAcrobatVersion()
        };
    }
};
