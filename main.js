//@program
//UI design question: which should dictate the interface, the text box or the slider? which one should be more authoritative and have control? Could have  text box update slider too though, ddeep integration
//is it intuitive to have temperatures adjust to the scale of the newly selected temperatures? maybe should reset to neutral...
var THEME = require('themes/flat/theme');
var BUTTONS = require('controls/buttons');
var KEYBOARD = require('mobile/keyboard');
var CONTROL = require('mobile/control');
var SLIDERS = require('controls/sliders');
var inputScale = "F";
var outputScale = "K";
var titleStyle = new Style({font:"bold 20px", color:"black"});
var tempLabel = new Label({left: 0, right: 0, string: "23", editable:true, style: titleStyle});
var convertLabel = new Label({left: 0, right: 0, string: "23", style: titleStyle});
var nameInputSkin = new Skin({ borders: { left:2, right:2, top:2, bottom:2 }, stroke: 'gray',});
var fieldStyle = new Style({ color: 'black', font: 'bold 24px', horizontal: 'left', vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5, });
var fieldHintStyle = new Style({ color: '#aaa', font: '24px', horizontal: 'left', vertical: 'middle', left: 5, right: 5, top: 5, bottom: 5, });
var whiteSkin = new Skin({fill:"white"});
var MyField = Container.template(function($) { return { 
  width: 100, height: 36, skin: nameInputSkin, contents: [
    Scroller($, { 
      left: 4, right: 4, top: 4, bottom: 4, active: true, 
      behavior: Object.create(CONTROL.FieldScrollerBehavior.prototype), clip: true, contents: [
        Label($, { 
          left: 0, top: 0, bottom: 0, style: fieldStyle, anchor: 'NAME',
          editable: true, string: $.name, name:"temperature",
         	behavior: Object.create( CONTROL.FieldLabelBehavior.prototype, {
         		onEdited: { value: function(label){
         			var data = this.data;
              data.name = label.string;
              //if(!isNaN(parseF)) {
              	updateLabelsNormal(data.name);
              //}
              label.container.hint.visible = ( data.name.length == 0 );	
         		}}
         	}),
         }),
         Label($, {
   			 	left:4, right:4, top:4, bottom:4, style:fieldHintStyle, string:"", name:"hint"
         })
      ]
    })
  ]
}});
var dataz = {name:""};
var field = new MyField(dataz);
trace(JSON.stringify(dataz));
scales = {}
/**
from: function that converts from the specified scale to Kelvin
to: function that converts from Kelvin to the specified scale
*/
function addScale(scale, from, to, long_name, lowest, highest) {
//how do I assert things lol and run tests
	//from_scales[scale] = from;
	//to_scales[to] = to;
	scales[scale] = {
		name: long_name,
		symbol: scale,
		convertBase: from,
		convertTo: to,
		low: lowest,
		high: highest
	}
}

function convert(val, inScale, outScale) {
	return Math.round(scales[outScale].convertTo(scales[inScale].convertBase(val)) * 100) / 100; 
}
//would be smarter if it could chain, like it knows F->C and C->K so then F->K
//lookup F converions for K, then pick one, check that one for conversions to K, pick random, keep going? no... only allow one conversion
//F->C maybe C->D D->K, follow chain, else throw error; have maps of what the scale transforms to? probably too complex, but it could have a object associated with all it's conversions? eh new Scale("F", {"C":function(val){ return 1.8*val/32;}})

addScale("D", function(val) {return (373.15 - (val*(2/3)))}, function(val) {return (373.15 - val)*1.5}, "Delisle", 0, 150);
addScale("C", function(val) {return val + 273.15;}, function(val) { return val - 273.15; }, "Celsius", -273.15, 100);
addScale("K", function(val) {return val;}, function(val) {return val;}, "Kelvin", 0, 300);
addScale("F", function(val) {return (val - 32)/1.8 + 273.15;}, function(val) {return (val - 273.15)*1.8 + 32;}, "Fahrenheit", 0, 100);

var RadioGroup2 = Line.template(function($) { return {
	active: true,
	behavior: BUTTONS.RadioGroupBehavior
}});
var MySlider = SLIDERS.HorizontalSlider.template(function($){ return{
   left:50, right:50,top:0, bottom:0,
  behavior: Object.create(SLIDERS.HorizontalSliderBehavior.prototype, {
    onValueChanged: { value: function(container){
      SLIDERS.HorizontalSliderBehavior.prototype.onValueChanged.call(this, container);
		updateLabels(this.data.value);
      trace("Value is: " + this.data.value + "\n");
  }}})
}});

function updateLabels(val) {
      var realValue = scales[inputScale].low + val* (scales[inputScale].high-scales[inputScale].low);
      tempLabel.string = (Math.round(realValue*100)/100).toString();
      dataz.NAME.string = (Math.round(realValue*100)/100).toString();
      convertLabel.string = convert(realValue, inputScale, outputScale).toString();
}
function updateLabelsNormal(val) {
	convertLabel.string = convert(parseFloat(val), inputScale, outputScale).toString();
}
var slider = new MySlider({ min:0, max:1, value:.5, });
//figure out this template vs object.create model, look at tech notes, where are properties from, and why does data work, what calls oncreate, where is waga, how create own button based off container and using $.top $.bottom $.behavior $.handler $.whatever 
//buttno group would be preferable to radio group, implemeement that if have time

var MyRadioGroup = RadioGroup2.template(function($) { return {
	top:0, bottom:0, left:0, right:0, waga:$.id,
	behavior: Object.create(BUTTONS.RadioGroupBehavior.prototype, {
	//what does this object with value do, why can't i do this without it
		onGroupButtonSelected: {value:function(column, labeledButton)  {
		//too much work to implemement for now, need to change radio button behavior too
		//difference between just calling behavior object vs new behavior object vs template vs object.create, how does template even work!!! with function as param, and where waga is, and how data is there
		BUTTONS.RadioGroupBehavior.prototype.onGroupButtonSelected.call(this, column, labeledButton);
		
		}},
		onRadioButtonSelected: {value:function(buttonName) {
			
			trace("Radio button with name " + buttonName + " was selected.\n");
			trace(this.data.id);
			if (this.data.id == 1) {
				//if (buttonName != outputScale) {
					inputScale = buttonName;
				//}
			} else if (this.data.id == 2) {
				//if (buttonName != inputScale) {
					outputScale = buttonName;
				//}
			}
			//updateLabelsNormal(dataz.NAME.string);
			updateLabels(slider.behavior.data.value);
		}
	}})
}});

//how did that guy get qUnit working??



//figure out coordinate system and when left right top bottom width height are required
//figure out grid system, read docs more in depth on how platform work
//coordinates seem to be relative to it's layout position in the parent


var options = [];
for (var key in scales) {
	if (scales.hasOwnProperty(key)) {
		options.push(key);
	}
}


var radioGroup = new MyRadioGroup({id:1, buttonNames: options.join()});
var radioGroup2 = new MyRadioGroup({id:2, buttonNames: options.join(), selected:"K"});



var columns = new Column({
	left:0, right:0, top:0, bottom:0, skin:whiteSkin, contents: [
	new Line({top:0, bottom:0, left:0, right:0, skin:new Skin({fill:"#d8e7f3"}), contents: [new Label({left:0, top:0, right:0, bottom:0, string:"Temperature Converter", style:new Style({font:"bold 30px", color:"black"})})]}),
	new Line({top:0, bottom:0, left:0, right:0, skin:new Skin({fill:"#b2cee6"}), contents: [new Container({top:0, left:0, right:0, bottom:0, contents: [radioGroup]}),
		field]}),
	new Line({ left:0, right:0, top:0, bottom:0, skin:new Skin({fill:"#8db6d8"}), contents:[slider]}),
	new Line({top:0, bottom:0, left:0, right:0, skin:new Skin({fill:"#689dca"}),contents: [new Container({top:0, left:0, right:0, bottom:0, contents:[radioGroup2]}), convertLabel]}) //obscure error message thrown when including same object twice
	], behavior:Object.create(Column.prototype, {
    onTouchEnded: { value: function(content){
      KEYBOARD.hide();
      content.focus();
    }}
  }), active:true
	
});
application.add(columns);
