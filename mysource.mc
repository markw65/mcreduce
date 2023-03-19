import Toybox.WatchUi;
import Toybox.Graphics;
import Toybox.Lang;
import Toybox.Activity;
import Toybox.UserProfile;

const DebugBackgroundHR = false;

class TestView extends WatchUi.DataField {


    var mGaugeH as Number = 64;
    var mGaugeY as Number = 32;
    var mGaugeX as Number = 32;
    hidden function drawHrGaugeHand(
        dc as Graphics.Dc,
        heartRate as Number,
        triangleColor as Graphics.ColorType,
        foregroundColor as Graphics.ColorType,
        triangleHeight as Number,
        z1 as Number,
        z5 as Number,
        pixelsPerHr as Float,
        gaugeOnTop as Boolean
    ) as Void {
        var one = 1;
        var y = mGaugeY;
        var gaugeHeight1 = mGaugeH - one;
        var hrd = heartRate - z1;
        var hrx = (
            mGaugeX +
            (hrd < 0 ? -1 : heartRate <= z5 ? hrd : z5 - z1 + one) * pixelsPerHr
        ).toNumber();
        dc.setColor(foregroundColor, foregroundColor);
        dc.drawLine(hrx, y, hrx, y + gaugeHeight1);

        dc.setColor(triangleColor, foregroundColor);
        var dy = gaugeOnTop ? one : -1;

        // old, working:
        // var ly = y + (gaugeOnTop ? gaugeHeight1 : 0);

        // new, doesn't work:
        var ly = y;
        if (gaugeOnTop) {
            ly += gaugeHeight1;
        }

        var i = one;
        do {
            dc.drawLine(hrx - i, ly, hrx + i, ly);
            ly += dy;
            i++;
        } while (i <= triangleHeight);
    }

    // Display the value you computed here. This will be called
    // once a second when the data field is visible.
    function onUpdate(dc as Graphics.Dc) as Void {
        drawHrGaugeHand(dc, 42, 0, 0xffffff, 42, 42, 42, 42.0, true);
    }
}
