using Toybox.Application;
import Toybox.WatchUi;
import Toybox.Lang;

class TestApp extends Application.AppBase {

    function initialize() {
        AppBase.initialize();
        condAdd(24, false, true);
    }

    function onSettingsChanged() {
    }

    //! Return the initial view of your application here
    function getInitialView() {
        mView = new TestView();
        return [mView] as Array<Views>;
    }

    function getSettingsView() {
        var d = new TestSettingsDelegate();
        return (
            [d.push(:TopSettings, null), d] as Array<Views or InputDelegates>
        );
    }
}

var gaugeHeight1 as Number = 42;

function condAdd(
    y as Number,
    gaugeOnTop as Boolean,
    other as Boolean
) as Number {
    var ly = y;
    if (gaugeOnTop) {
        ly += gaugeHeight1;
    }
    if (other) {
        return ly;
    }
    return 0;
}
