package svg2as.libs {
    import flash.text.TextField;
    import flash.text.TextFormat;
    import flash.events.MouseEvent;
    import flash.display.Bitmap;
    import flash.filters.GlowFilter;
    import flash.text.TextFormatAlign;
    import flash.text.TextFieldType;
    import flash.display.Sprite;
    public class SomeText extends Sprite {
        public
        var rect3024: Sprite = new Sprite();
        public
        var center: TextField = new TextField();
        public
        var rect3032: Sprite = new Sprite();
        public
        var right: TextField = new TextField();
        public
        var close: RedButton = new RedButton();
        public
        var testInput: TextField = new TextField();
        public
        var violBut: VioletButton = new VioletButton();

        public
        function SomeText() {
            addChild(rect3024);
            addChild(center);
            addChild(rect3032);
            addChild(right);
            addChild(close);
            addChild(testInput);
            addChild(violBut);
            rect3024.graphics.beginFill(0xeeaaff, 1);
            rect3024.graphics.lineStyle(3, 0x800080, 1);
            rect3024.graphics.drawRoundRect(25.165642000000005, 72.89581999999996, 212.78557, 65, 10);
            rect3024.graphics.endFill();

            center.text = "Some";
            center.selectable = false;
            center.mouseEnabled = false;
            var centerStrokeGlow: GlowFilter = new GlowFilter(0x800080, 1, 4, 4, 10, 1);
            center.filters = [centerStrokeGlow];
            var tf: TextFormat = center.getTextFormat();
            tf.font = "Sans";
            tf.size = 74;
            tf.color = 0xeeaaff;
            tf.align = TextFormatAlign.LEFT;
            center.setTextFormat(tf);
            center.x = 23.040642000000005;
            center.y = 69.52081999999996 - center.getLineMetrics(0).height + center.getLineMetrics(0).descent;
            center.width = center.textWidth + 4;
            center.height = center.textHeight + center.getLineMetrics(0).descent;

            rect3032.graphics.beginFill(0x782167, 1);
            rect3032.graphics.lineStyle(4.55626678, 0xfce94f, 1);
            rect3032.graphics.drawRoundRect(21.034950000000002, 145.93946, 212.78557, 65, 0);
            rect3032.graphics.endFill();

            right.text = "Sometext";
            right.selectable = false;
            right.mouseEnabled = false;
            var tf: TextFormat = right.getTextFormat();
            tf.font = "Sans";
            tf.size = 40;
            tf.color = 0xfce94f;
            tf.align = TextFormatAlign.RIGHT;
            right.setTextFormat(tf);
            right.x = 220.80858999999998 - (right.textWidth + 4);
            right.y = 190.99999999999994 - right.getLineMetrics(0).height + right.getLineMetrics(0).descent;
            right.width = right.textWidth + 4;
            right.height = right.textHeight + right.getLineMetrics(0).descent;

            testInput.text = "Input text";
            testInput.type = TextFieldType.INPUT;
            var tf: TextFormat = testInput.getTextFormat();
            tf.font = "Sans";
            tf.size = 40;
            tf.color = 0x782167;
            tf.align = TextFormatAlign.CENTER;
            testInput.setTextFormat(tf);
            testInput.x = 128.08382 - ((testInput.textWidth + 4) / 2);
            testInput.y = 115.81573999999995 - testInput.getLineMetrics(0).height + testInput.getLineMetrics(0).descent;
            testInput.width = testInput.textWidth + 4;
            testInput.height = testInput.textHeight + testInput.getLineMetrics(0).descent;

        }

    }

}
import flash.text.TextField;
import flash.text.TextFormat;
import flash.events.MouseEvent;
import flash.display.Bitmap;
import flash.filters.GlowFilter;
import flash.text.TextFormatAlign;
import flash.text.TextFieldType;
import flash.display.Sprite;

internal class RedButton extends Sprite {
    public
    var normal: Sprite = new Sprite();
    public
    var over: Sprite = new Sprite();
    public
    var hit: Sprite = new Sprite();

    public
    function RedButton() {
        addChild(normal);
        addChild(over);
        addChild(hit);
        normal.graphics.beginFill(0xff0000, 1);
        normal.graphics.lineStyle(3, 0xfce94f, 1);
        normal.graphics.drawRoundRect(243, 143.49999999999994, 69, 69, 10);
        normal.graphics.endFill();

        over.graphics.beginFill(0xff8080, 1);
        over.graphics.lineStyle(3, 0xfce94f, 1);
        over.graphics.drawRoundRect(243, 143.49999999999994, 69, 69, 10);
        over.graphics.endFill();

        hit.graphics.beginFill(0x800000, 1);
        hit.graphics.lineStyle(3, 0xfce94f, 1);
        hit.graphics.drawRoundRect(243, 143.49999999999994, 69, 69, 10);
        hit.graphics.endFill();

        over.visible = false;
        hit.visible = false;
        addEventListener(MouseEvent.MOUSE_OVER, function (e: MouseEvent): void {
            over.visible = true;
            normal.visible = false;
        })
        addEventListener(MouseEvent.MOUSE_OUT, function (e: MouseEvent): void {
            over.visible = false;
            hit.visible = false;
            normal.visible = true;
        })
        addEventListener(MouseEvent.MOUSE_DOWN, function (e: MouseEvent): void {
            hit.visible = true;
            normal.visible = false;
        })
        addEventListener(MouseEvent.MOUSE_UP, function (e: MouseEvent): void {
            hit.visible = false;
            over.visible = true;
        })
    }

}
internal class VioletButton extends Sprite {
    [Embed(source = "image4158.png")]
    private
    var IMAGE4158: Class;
    public
    var normal: Bitmap = new IMAGE4158();
    [Embed(source = "image4112.png")]
    private
    var IMAGE4112: Class;
    public
    var over: Bitmap = new IMAGE4112();
    [Embed(source = "image4135.png")]
    private
    var IMAGE4135: Class;
    public
    var hit: Bitmap = new IMAGE4135();

    public
    function VioletButton() {
        addChild(normal);
        addChild(over);
        addChild(hit);
        normal.x = 260.27774;
        normal.y = 64.57556;
        over.x = 260.27774;
        over.y = 64.57556;
        hit.x = 260.27774;
        hit.y = 64.57556;
        over.visible = false;
        hit.visible = false;
        addEventListener(MouseEvent.MOUSE_OVER, function (e: MouseEvent): void {
            over.visible = true;
            normal.visible = false;
        })
        addEventListener(MouseEvent.MOUSE_OUT, function (e: MouseEvent): void {
            over.visible = false;
            hit.visible = false;
            normal.visible = true;
        })
        addEventListener(MouseEvent.MOUSE_DOWN, function (e: MouseEvent): void {
            hit.visible = true;
            normal.visible = false;
        })
        addEventListener(MouseEvent.MOUSE_UP, function (e: MouseEvent): void {
            hit.visible = false;
            over.visible = true;
        })
    }

}
