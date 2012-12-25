var fs = require('fs'),
	et = require('elementtree');

if (process.argv[2] === '--help') {
	console.log('usage:\nnode svg2as.js file.svg path/to/output/as/files [package]\n"libs" package will be add automaticly ');
	process.exit();
}

var outputPath = process.argv[3];
if (outputPath.charAt(outputPath.length - 1) === '/') {
	outputPath = outputPath.slice(0, outputPath.length - 1);
}

var ASPackage = process.argv[4] || outputPath.split('/')[outputPath.split('/').length - 1],

	baseHeader = "package " + ASPackage + ".libs {\n",
	imports = "import flash.text.TextField;\n" +
		"import flash.text.TextFormat;\n" +
		"import flash.events.MouseEvent;\n" +
		"import flash.display.Bitmap;\n" +
		"import flash.filters.GlowFilter;\n" +
		"import flash.text.TextFormatAlign;\n" +
		"import flash.text.TextFieldType;\n" +
		"import flash.display.Sprite;\n",
	baseFooter = '\n}';

var getStyle = function (styleString) {
	'use strict';
	var styleArr = styleString.split(';'),
		style = {},
		i,
		len,
		curr;
	for (i = 0, len = styleArr.length; i < len; i += 1) {
		curr = styleArr[i].split(':');
		style[curr[0]] = curr[1];
	}
	return style;
};

var createDynamycText = function (textNode, offsetX, offsetY) {
	'use strict';
	var name = textNode.attrib.varName,
		style = getStyle(textNode.attrib.style),
		fillColor = style.fill.split('').splice(1, style.fill.length).join(''),
		text = textNode._children[0].text.toString(),
		selfOffsetX,
		selfOffsetY,
		x,
		y,
		setText,
		setParams,
		setTf,
		setPos,
		len,
		i;

	if (textNode.attrib.transform) {
		selfOffsetX = parseFloat(textNode.attrib.transform.split('(')[1]);
		selfOffsetY = parseFloat(textNode.attrib.transform.split(',')[1]);
	} else {
		selfOffsetX = 0;
		selfOffsetY = 0;
	}
	x = (+textNode.attrib.x + offsetX + selfOffsetX - 2);
	y = (+textNode.attrib.y + offsetY + selfOffsetY - 2);
	setText = name + '.text ="';
	for (i = 0, len = textNode._children.length; i < len; i += 1) {
		if (textNode._children[i].tag === 'tspan') {
			if (setText === name + '.text ="') {
				setText = setText + textNode._children[i].text;
			} else {
				setText = setText + '\\n' + textNode._children[i].text;
			}
		}
	}
	if (setText === name + '.text ="') {
		setText = name + '.text ="' + text + '";\n';
	} else {
		setText = setText + '";\n';
	}
	if (textNode.attrib.id.indexOf('Input') !== -1) {
		setParams = name + '.type = TextFieldType.INPUT;\n';
	} else {
		setParams = name + '.selectable = false;\n';
		setParams = setParams + name + '.mouseEnabled = false;\n';
	}
	if (style.stroke !== 'none') {
		setParams = setParams + 'var ' + name + 'StrokeGlow:GlowFilter = new GlowFilter(0x' + style.stroke.split('').splice(1, style.stroke.length).join('') + ', ' + (style['stroke-opacity'] || 1) + ', ' + ((style['stroke-width'] || 1) * 2) + ', ' + ((style['stroke-width'] || 1) * 2) + ', 10, 1);\n';
		setParams = setParams + name + '.filters = [' + name + 'StrokeGlow];\n';
	}
	setTf = 'var tf:TextFormat = ' + name + ".getTextFormat();\n" +
		'tf.font = "' + style['font-family'] + '";\n' +
		'tf.size = ' + parseInt(style['font-size'], 10) + ';\n' +
		'tf.color = 0x' + fillColor + ';\n';
	if (style['text-anchor'] === 'end') {
		setPos = name + ".x = " + x + ' - (' + name + '.textWidth + 4);\n';
		setTf += 'tf.align = TextFormatAlign.RIGHT;\n';
	} else if (style['text-anchor'] === 'middle') {
		setPos = name + ".x = " + x + ' - ((' + name + '.textWidth + 4) / 2);\n';
		setTf += 'tf.align = TextFormatAlign.CENTER;\n';
	} else {
		setPos = name + ".x = " + x + ';\n';
		setTf += 'tf.align = TextFormatAlign.LEFT;\n';
	}
	setTf += name + '.setTextFormat(tf);\n';
	setPos += name + ".y = " + y + ' - ' + name + '.getLineMetrics(0).height + ' + name + ' .getLineMetrics(0).descent;\n' +
		name + ".width = " + name + '.textWidth + 4;\n' +
		name + ".height = " + name + '.textHeight + ' + name + '.getLineMetrics(0).descent;\n';
	return setText + setParams + setTf + setPos + '\n';
};

var createImage = function (imageNode, offsetX, offsetY) {
	'use strict';
	var name = imageNode.attrib.varName,
		x = (+imageNode.attrib.x + offsetX),
		y = (+imageNode.attrib.y + offsetY);

	return name + '.x = ' + x + ';\n' + name + '.y = ' + y + ';\n';
};


var createRect = function (rectNode, offsetX, offsetY) {
	'use strict';
	var name = rectNode.attrib.varName,
		style = getStyle(rectNode.attrib.style),
		fillColor = style.fill.split('').splice(1, style.fill.length).join(''),
		strokeColor = style.stroke.split('').splice(1, style.stroke.length).join(''),
		selfOffsetX,
		selfOffsetY,
		x,
		y,
		beginFill,
		lineStyle,
		drawRect,
		endFill;

	if (rectNode.attrib.transform) {
		selfOffsetX = parseFloat(rectNode.attrib.transform.split('(')[1]);
		selfOffsetY = parseFloat(rectNode.attrib.transform.split(',')[1]);
	} else {
		selfOffsetX = 0;
		selfOffsetY = 0;
	}
	x = (+rectNode.attrib.x + offsetX + selfOffsetX);
	y = (+rectNode.attrib.y + offsetY + selfOffsetY);
	beginFill = name + '.graphics.beginFill(0x' + fillColor + ', ' + style['fill-opacity'] + ');\n';
	lineStyle = '';
	if (style['stroke-width']) {
		lineStyle = name + '.graphics.lineStyle(' + style['stroke-width'] + ', 0x' + strokeColor + ', ' + (style['stroke-opacity'] || 1) + ');\n';
	}
	if (rectNode.attrib.ry) {
		drawRect = name + '.graphics.drawRoundRect(' + x + ', ' + y  + ', ' + rectNode.attrib.width + ', ' + rectNode.attrib.height + ', ' + rectNode.attrib.ry + ');\n';
	} else {
		drawRect = name + '.graphics.drawRect(' + x + ', ' + y  + ', ' + rectNode.attrib.width + ', ' + rectNode.attrib.height + ');\n';
	}
	endFill = name + '.graphics.endFill();\n';
	return beginFill + lineStyle + drawRect + endFill + '\n';
};

var createSpriteClass = function (classNode, offsetXglobal, offsetYglobal, visible, path) {
	'use strict';
	var mainClassName = classNode.attrib.id.split(''),
		offsetX,
		offsetY,
		variables = '',
		internalClasses = '',
		constructor = '',
		i,
		len,
		varName,
		added,
		className,
		img64,
		cls;

	mainClassName[0] = mainClassName[0].toUpperCase();
	mainClassName = mainClassName.join('');
	constructor = 'public function ' + mainClassName + '() {\n';
	if (classNode.attrib.transform) {
		offsetX = parseFloat(classNode.attrib.transform.split('(')[1]) + offsetXglobal;
		offsetY = parseFloat(classNode.attrib.transform.split(',')[1]) + offsetYglobal;
	} else {
		offsetX = offsetXglobal;
		offsetY = offsetYglobal;
	}

	for (i = 0, len = classNode._children.length; i < len; i += 1) {
		added = false;
		if (classNode._children[i]._children && classNode._children[i]._children.length && classNode._children[i]._children[0].tag === 'title' && classNode._children[i]._children[0].text) {
			varName = classNode._children[i]._children[0].text;
		} else {
			varName = classNode._children[i].attrib.id;
		}
		varName = varName.split('');
		varName[0] = varName[0].toLowerCase();
		varName = varName.join('');
		if (classNode._children[i].tag === 'rect') {
			variables += ('public var ' + varName + ':Sprite = new Sprite();\n');
			added = true;
		}
		if (classNode._children[i].tag === 'text') {
			variables += ('public var ' + varName + ':TextField = new TextField();\n');
			added = true;
		}
		if (classNode._children[i].tag === 'g') {
			className = classNode._children[i].attrib.id.split('');
			className[0] = className[0].toUpperCase();
			className = className.join('');
			variables += ('public var ' + varName + ':' + className + ' = new ' + className + '();\n');
			added = true;
		}
		if (classNode._children[i].tag === 'image') {
			img64 = classNode._children[i].attrib['xlink:href'];
			img64 = img64.split(',')[1];
			fs.writeFileSync(path + '/libs/' + classNode._children[i].attrib.id + '.png', new Buffer(img64, 'base64'));
			variables += '[Embed(source="' + classNode._children[i].attrib.id + '.png' + '")]\n';
			variables += "private var " + classNode._children[i].attrib.id.toUpperCase() + ":Class;\n";
			variables += ('public var ' + varName + ':Bitmap = new ' + classNode._children[i].attrib.id.toUpperCase() + '();\n');
			added = true;
		}
		if (added) {
			constructor += ('addChild(' + varName + ');\n');
			classNode._children[i].attrib.varName = varName;
		}
	}

	for (i = 0, len = classNode._children.length; i < len; i += 1) {
		if (classNode._children[i].tag === 'rect') {
			constructor += createRect(classNode._children[i], offsetX, offsetY);
		}
		if (classNode._children[i].tag === 'text') {
			constructor += createDynamycText(classNode._children[i], offsetX, offsetY);
		}
		if (classNode._children[i].tag === 'g') {
			cls = createSpriteClass(classNode._children[i], offsetX, offsetY, "internal", path);
			internalClasses += cls.baseClass;
			internalClasses += cls.internalClasses;
		}
		if (classNode._children[i].tag === 'image') {
			constructor += createImage(classNode._children[i], offsetX, offsetY);
		}
	}

	if (classNode.attrib.id.indexOf('Button') !== -1) {
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
};


var createASFile = function (classNode, offsetX, offsetY, path) {
	'use strict';
	var ASFile = '',
		cls = createSpriteClass(classNode, offsetX, offsetY, 'public', path);
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
};

fs.readFile(process.argv[2], function (err, data) {
	'use strict';
	if (err) {
		throw err;
	}
	var doc = et.parse(data.toString()),
		classes = doc.findall('*/g'),
		offsetY,
		offsetX,
		i,
		len,
		onFileWrite = function (err) {
			if (err) {
				throw err;
			}
			console.log('It\'s saved!');
		};

	if (doc._root._children[doc._root._children.length - 1].attrib && doc._root._children[doc._root._children.length - 1].attrib.transform) {
		offsetY = parseFloat(doc._root._children[doc._root._children.length - 1].attrib.transform.split(',')[1]);
		offsetX = parseFloat(doc._root._children[doc._root._children.length - 1].attrib.transform.split('(')[1]);
	} else {
		offsetY = 0;
		offsetX = 0;
	}
	//TODO Make unexcist dirs!!
	fs.mkdir(outputPath + '/libs/', function (err) {
		if (err) {
			console.log(err.message);
		}
	});
	for (i = 0, len = classes.length; i < len; i += 1) {
		fs.writeFile(outputPath + '/libs/' + classes[i].attrib.id + '.as', createASFile(classes[i], offsetX, offsetY, process.argv[3]), onFileWrite);
	}
});






