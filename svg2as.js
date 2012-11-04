var fs = require('fs');

var et = require('elementtree');
var packag = process.argv[3].split('/')[process.argv[3].split('/').length - 1];

var baseHeader = 	"package " + packag + " {\n",
	imports = 		"import flash.text.TextField;\n" + 
					"import flash.text.TextFormat;\n" + 
					"import flash.events.MouseEvent;\n" + 
					"import flash.display.Bitmap;\n" + 
					"import flash.display.Sprite;\n";
	baseFooter = 	'\n}';

fs.readFile(process.argv[2], function (err, data) {
	if (err) throw err;
	var doc = et.parse(data.toString());
	// fs.writeFile('./result.json', JSON.stringify(doc), function (err) {
	// 	if (err) throw err;
	// 	console.log('It\'s saved!');
	// });
	var classes = doc.findall('*/g'),
		offsetY = parseFloat(doc._root._children[doc._root._children.length - 1].attrib.transform.split(',')[1]),
		offsetX = parseFloat(doc._root._children[doc._root._children.length - 1].attrib.transform.split('(')[1]);

	for (var i = 0, len = classes.length; i < len; i++) {
		fs.writeFile(process.argv[3] + '/' + classes[i].attrib.id + '.as', createASFile(classes[i], offsetX, offsetY, process.argv[3]), function (err) {
			if (err) throw err;
			console.log('It\'s saved!');
		});
	}
});

var createASFile = function (classNode, offsetX, offsetY, path) {
	var ASFile = '';
	var cls = createSpriteClass(classNode, offsetX, offsetY, 'public', path)
	ASFile += baseHeader;
	ASFile += imports;
	ASFile += cls.baseClass;
	ASFile += baseFooter;
	ASFile += '\n';
	if (cls.internalClasses.length) {
		ASFile += imports;
		ASFile += '\n';
		ASFile += cls.internalClasses;
	}
	return ASFile;
}

var createSpriteClass = function (classNode, offsetX_, offsetY_, visible, path) {
	var mainClassName = classNode.attrib.id.split('');
	mainClassName[0] = mainClassName[0].toUpperCase();
	mainClassName = mainClassName.join('');
//	var className = classNode.attrib.id;
	var variables = '',
		internalClasses = '',
		constructor = 'public function ' + mainClassName + '() {\n';
		if (classNode.attrib.transform) {
			var offsetY = parseFloat(classNode.attrib.transform.split(',')[1]) + offsetY_,
				offsetX = parseFloat(classNode.attrib.transform.split('(')[1]) + offsetX_;
		} else {
			offsetY = offsetY_;
			offsetX = offsetX_;			
		}

	for (var i = 0; i < classNode._children.length; i++) {
		var varName, added;
		added = false;
		if (classNode._children[i]._children && classNode._children[i]._children.length && classNode._children[i]._children[0].tag == 'title' && classNode._children[i]._children[0].text) {
			varName = classNode._children[i]._children[0].text;
		} else {
			varName = classNode._children[i].attrib.id;			
		}
		varName = varName.split('');
		varName[0] = varName[0].toLowerCase();
		varName = varName.join('');
		if (classNode._children[i].tag == 'rect') {
			variables += ('public var ' + varName + ':Sprite = new Sprite();\n');
			added = true;
		}
		if (classNode._children[i].tag == 'text') {
			variables += ('public var ' + varName + ':TextField = new TextField();\n');
			added = true;
		}
		if (classNode._children[i].tag == 'g') {
			var className = classNode._children[i].attrib.id.split('');
			className[0] = className[0].toUpperCase();
			className = className.join('');
			variables += ('public var ' + varName + ':' + className + ' = new ' + className + '();\n');
			added = true;
		}
		if (classNode._children[i].tag == 'image') {
			var img64 = classNode._children[i].attrib['xlink:href'];
			img64 = img64.split(',')[1];
			fs.writeFileSync(path + '/' + classNode._children[i].attrib.id + '.png', new Buffer(img64, 'base64'));
			variables += '[Embed(source="' + classNode._children[i].attrib.id + '.png' + '")]\n';
			variables += "private var " + classNode._children[i].attrib.id.toUpperCase() + ":Class;\n";
			variables += ('public var ' + varName + ':Bitmap = new ' + classNode._children[i].attrib.id.toUpperCase() + '();\n');
			added = true;
		}
		if (added) {
			constructor += ('addChild(' + varName + ');\n');
			classNode._children[i].attrib.varName = varName;
		}
	};

	for (var i = 0; i < classNode._children.length; i++) {
		if (classNode._children[i].tag == 'rect') {
			constructor += createRect(classNode._children[i], offsetX, offsetY);
		}
		if (classNode._children[i].tag == 'text') {
			constructor += createDynamycText(classNode._children[i], offsetX, offsetY);		
		}
		if (classNode._children[i].tag == 'g') {
			var cls = createSpriteClass(classNode._children[i], offsetX, offsetY, "internal", path);
			internalClasses += cls.baseClass;
			internalClasses += cls.internalClasses;
		}
		if (classNode._children[i].tag == 'image') {
			constructor += createImage(classNode._children[i], offsetX, offsetY);		
		}
	};
	if (classNode.attrib.id.indexOf('Button') != -1) {
		constructor += 'over.visible = false;\n';
		constructor += 'hit.visible = false;\n';
		constructor += 'addEventListener(MouseEvent.MOUSE_OVER, function (e:MouseEvent):void {over.visible = true;normal.visible = false;})\n';
		constructor += 'addEventListener(MouseEvent.MOUSE_OUT, function (e:MouseEvent):void {over.visible = false;hit.visible = false;normal.visible = true;})\n';
		constructor += 'addEventListener(MouseEvent.MOUSE_DOWN, function (e:MouseEvent):void {hit.visible = true;normal.visible = false;})\n';
		constructor += 'addEventListener(MouseEvent.MOUSE_UP, function (e:MouseEvent):void {hit.visible = false;over.visible = true;})\n';
	}

	constructor += '}\n';
	return {
		baseClass : visible + ' class ' + mainClassName + ' extends Sprite {\n' + variables + "\n" + constructor + '\n}\n',
		internalClasses: internalClasses
	};
}

var createRect = function (rectNode, offsetX, offsetY) {
	var name = rectNode.attrib.varName,
		style = getStyle(rectNode.attrib.style),
		fillColor = style.fill.split('').splice(1, style.fill.length).join(''),
		strokeColor = style.stroke.split('').splice(1, style.stroke.length).join('');
		if (rectNode.attrib.transform) {			
			selfOffsetX = parseFloat(rectNode.attrib.transform.split('(')[1]);
			selfOffsetY = parseFloat(rectNode.attrib.transform.split(',')[1]);
		} else {
			selfOffsetX = 0;
			selfOffsetY = 0;
		}
	var x = (+rectNode.attrib.x + offsetX + selfOffsetX),
		y = (+rectNode.attrib.y + offsetY + selfOffsetY),
		beginFill = name + '.graphics.beginFill(0x' + fillColor + ', ' + style['fill-opacity'] + ');\n',
		lineStyle = name + '.graphics.lineStyle(' + style['stroke-width'] + ', 0x' + strokeColor + ', '+style['stroke-opacity'] + ');\n';
		if (rectNode.attrib.ry) {
			var drawRect = name + '.graphics.drawRoundRect(' + x + ', ' + y  + ', ' + rectNode.attrib.width + ', ' + rectNode.attrib.height + ', ' +rectNode.attrib.ry + ');\n';
		} else {
			drawRect = name + '.graphics.drawRect(' + x + ', ' + y  + ', ' + rectNode.attrib.width + ', ' + rectNode.attrib.height + ');\n';
		}
		endFill = name + '.graphics.endFill();\n';
	return beginFill + lineStyle + drawRect + endFill + '\n';
}

var createDynamycText = function (textNode, offsetX, offsetY) {
	var name = textNode.attrib.varName,
		style = getStyle(textNode.attrib.style),
		fillColor = style.fill.split('').splice(1, style.fill.length).join(''),
		text = textNode._children[0].text.toString();

	if (textNode.attrib.transform) {			
		var selfOffsetX = parseFloat(textNode.attrib.transform.split('(')[1]);
		var selfOffsetY = parseFloat(textNode.attrib.transform.split(',')[1]);
	} else {
		selfOffsetX = 0;
		selfOffsetY = 0;
	}

	var x = (+textNode.attrib.x + offsetX + selfOffsetX),
		y = (+textNode.attrib.y + offsetY + selfOffsetY);

	var setText = name + '.text ="' + text + '";\n';
	var setParams = name + '.selectable = false;\n';
	var setPos = 	name + ".x = " + x + ';\n' + 
					name + ".y = " + y + ' - ' + name + '.textHeight;\n' +
					name + ".width = " + name + '.textWidth;\n'
	var setTf = 'var tf:TextFormat = ' + name + ".getTextFormat();\n" + 
				'tf.font = "' + style['font-family'] + '";\n' +
				'tf.size = ' + parseInt(style['font-size']) + ';\n' +  
				'tf.color = 0x' + fillColor + ';\n' +  
				name + '.setTextFormat(tf);\n';
	return setText + setParams + setTf + setPos + '\n';
}
var createImage = function (imageNode, offsetX, offsetY) {
	var name = imageNode.attrib.varName,
		x = (+imageNode.attrib.x + offsetX),
		y = (+imageNode.attrib.y + offsetY);

	return name + '.x = ' + x + ';\n' + name + '.y = ' + y + ';\n';	
}
var getStyle = function (styleString) {
	var styleArr = styleString.split(';');
	var style = {};
	for (var i = 0, len = styleArr.length; i < len; i++) {
		var curr = styleArr[i].split(':');
		style[curr[0]] = curr[1];
	}
	return style;
}