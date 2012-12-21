
var canvas;
var stage;

var player;
var boxesup;
var boxesdown;
var particles;
var coins;

var keyup = 38;		//usefull keycode
var keyleft = 37;		//usefull keycode
var keyright = 39;		//usefull keycode
var keyw = 87;			//usefull keycode
var keya = 65;			//usefull keycode
var keyd = 68;			//usefull keycode
var left = 0;
var right = 0;
var jump = 0;
var startButton = false;
var endButton = true;
var boxSpawn;
var diff;
var score;
var scoreTimer;
var endtimer;
var maincounter;

document.ontouchstart = handleTouchStart;
document.ontouchend = handleTouchEnd;
document.ontouchleave = handleTouchEnd;
document.onmousedown = handleMouseDown;
document.onmouseup = handleMouseUp;
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

function reset(){
	stage.removeAllChildren();
	boxesup = [];
	boxesdown = [];
	particles = [];
	coins = [];
	score = 0;
	scoreTimer = 0;
	boxSpawn = 0;
	diff = 0;
	endtimer = -1;
	maincounter=0;
}


function Player(x, y, stage){
	shape = new Shape();
	var s = 10;
	shape.isAlive=true;
	shape.graphics.beginFill('rgba(90,150,200,1)').rect(0,0,s,s);
	shape.s = s;
	shape.x = x;
	shape.y = y;
	shape.canjump = false;
	shape.jumping=0;
	shape.snapToPixel = true;
	shape.onfloor = false;
	shape.vspeed = 0;
	shape.hspeed = 0;
	shape.snapToPixel = true;
	stage.addChild(shape);
	return shape;
}

function Particle(x,y,s,vspeed,hspeed,color,stage, collider){
	shape = new Shape();//
	shape.graphics.beginFill(color).rect(0,0,s,s) ;
	shape.x=x;
	shape.y=y;
	shape.vspeed=vspeed;
	shape.hspeed=hspeed;
	shape.collider = collider;
	shape.timer=120;
	shape.snapToPixel = true;
	shape.cache(0,0,s,s);
	stage.addChild(shape)
	particles.push(shape);
}

function Coin(x,y,stage){
	shape = new Shape();
	shape.s = 10;
	shape.graphics.beginFill('rgba(200,170,30,1)').rect(0,0,shape.s,shape.s);
	shape.x = x;
	shape.y = y;
	shape.snapToPixel = true;
	shape.cache(0,0,shape.s,shape.s);
	stage.addChild(shape);
	coins.push(shape);
}

function Box(x, y, w, h, stage, type){
	var color;
	var speed;
	var boxes;
	switch(type){
		case "up":
		color = 'rgba(120,100,180,1)';
		speed = 1+Math.round(Math.random()*diff);
		boxes = boxesup;
		break;
		case "down":
		color = 'rgba(190,90,20,1)';
		speed = -1-Math.round(Math.random()*diff);
		boxes = boxesdown;
		break;
	}
	shape = new Shape();
	shape.graphics.beginFill(color).drawRoundRect(0,0,w,h,4);
	shape.color = color;
	shape.x = x;
	shape.y = y;
	shape.h = h;
	shape.w = w;
	shape.speed = speed;
	shape.snapToPixel = true;
	shape.cache(0,0,w,h);
	stage.addChild(shape);
	boxes.push(shape);

}

function init(){
	
	canvas = document.getElementById('canvas');
	stage = new Stage(canvas);
	stage.snapToPixelEnabled = true;
	stage.mouseEventsEnabled = true;
	canvas.addEventListener("touchstart",handleTouchStart,false);
	canvas.addEventListener("touchend",handleTouchEnd,false);
	Ticker.setFPS(60);
	Ticker.addListener(window);
	startMenu();
}

function startMenu(){
	reset();
	Ticker.setPaused(true);
	var startBox = new Shape();
	startBox.graphics.beginFill('rgba(120,180,250,1)').rect(0,-8,640,86).beginFill('rgba(220,120,10,0.9)').rect(0,0,640,70);
	startBox.x=0;
	startBox.y=150;
	stage.addChild(startBox);
	var startText = new Text("SHUMP", "45px Arial", "#EEF");
	startText.textAlign = "center";
	startText.x = 320;
	startText.y = 160;
	stage.addChild(startText);
	var startText2 = new Text("press any key to continue", "10px Arial", "#EEF");
	startText2.textAlign = "center";
	startText2.x = 320;
	startText2.y = 400;
	stage.addChild(startText2);
	stage.update();
	
}

function startLevel(){
	reset();
	Ticker.setPaused(false);
	player = new Player(320, 100, stage);
	player.vspeed=0;
	scoreText = new Text("SCORE: ", "20px Arial", "#AAF");
	scoreText.x = 10;
	scoreText.y = 10;
	stage.addChild(scoreText);
	Box(300,120,60,15,stage,"up");
}

function tick(){
	maincounter++;
	if (endtimer > 0)endtimer--;
	if (scoreTimer == 0){
		diff+=0.01;
		score++;
		scoreTimer = 60;
	}
	else scoreTimer--;
	
	for(i in boxesup){
		var box = boxesup[i];
		box.y+=box.speed; //move the box
		for(j in boxesdown){
			var b = boxesdown[j]; 
			if(box.x < b.x+b.w && box.x+box.w > b.x && box.y<b.y+b.h && box.y+box.h>b.y ){
				boxExplosion(box,b);
				
				boxesup.splice(i,1);
				boxesdown.splice(j,1);
				stage.removeChild(b, box);
				break;
			}	
		}
		if(box.y>480+box.h){
			stage.removeChild(box);
			boxesup.splice(i,1);//delete the box when out of screen
		}
	}
	for(i in boxesdown){
		var box = boxesdown[i];
		box.y+=box.speed; //move the box	
		if(box.y<0-box.h){
			stage.removeChild(box);
			boxesdown.splice(i,1);//delete the box when out of screen
		}
	}
	
	for(i in particles){
		var part = particles[i];
		part.x+=part.hspeed;
		part.y+=part.vspeed;
		part.hspeed*=0.9;
		part.vspeed+=0.1;
		part.vspeed*=0.9;
		part.alpha-=1/120;
		part.timer--;
		if(part.timer<=0){
			particles.splice(i,1);
			stage.removeChild(part);
		}
		if(part.collider && part.hspeed + part.vspeed > 0){
			if(part.x>player.x && part.x<player.x+player.s && part.y>player.y && part.y<player.y+player.s ){
				part.timer=0;
				player.hspeed+=part.hspeed;
				player.vspeed+=part.vspeed;
			}
		}
	}
	for(i in coins){
		var c = coins[i];
		c.y++;
		if(player.x < c.x+c.s && player.x+player.s > c.x && player.y<c.y+c.s && player.y+player.s>c.y  ){
			score+=5;
			coinExplosion(c.x,c.y);
			coins.splice(i,1);
			stage.removeChild(c);
		}		
	}
	if(player.isAlive){
		scoreText.text = "SCORE: " + score;
		if(player.vspeed<10 && !player.onfloor)
			player.vspeed += 0.5;
		
		player.onfloor = false; //by default supposed to be on air
		player.canjump = false; //by default supposed to be on 
		
		for(i in boxesdown ){
			b = boxesdown[i];	
			preciseColllision(player, b);
		}
		for(i in boxesup ){
			b = boxesup[i];	
			preciseColllision(player, b);
		}
		
		if(player.canjump)player.jumping=7;
		if(player.x+player.s<0 || player.x-player.s>640 || player.y+player.s<0 || player.y-player.s>480)
			death();
		player.y += player.vspeed;
		player.x += player.hspeed;
		if(left && player.hspeed>-4)player.hspeed -= 0.5;
		if(right  && player.hspeed<4)player.hspeed += 0.5;
		if(!(left || right)) player.hspeed/=2;
		if(jump){
			if(player.jumping > 0){
				player.vspeed -= 1.5
				player.jumping--;
			}		
		}
	}
	if(boxSpawn<=0){
		platformSpawner();
		boxSpawn=20-10*(Math.sin(diff));
	}
	else
		boxSpawn--;
	
	stage.update();
	
}

function platformSpawner(){
	var x,y,w,h;
	if(Math.round(Math.random()*5)==0){
		Coin(Math.round(Math.random()*640),-10,stage);
	}
	var type = Math.round(Math.random());
	type=0;
	if(type==0){
		h = Math.round(Math.random()*30+8);
		y = -h;
		w = Math.round(Math.random()*(40*(8*diff/(1+diff)))+20-(16*(diff/(1+diff))));
		x = Math.round(320+Math.sin(maincounter*diff)*320) - w/2;
		//Box(Math.round(Math.random()*640),-h,Math.round(Math.random()*120+8),h, stage, "up");
		Box(x,y,w,h, stage, "up");
	}
	type=1;
	if(type==1)	
		y = 480;
		w = Math.round(Math.random()*(120/(1+diff))+20-(16*(diff/(1+diff))));
		x = Math.round(320+Math.cos(maincounter*diff)*320) - w/2;
		h = Math.round(Math.random()*30+8);
		//Box(Math.round(Math.random()*640),480,Math.round(Math.random()*120+8),Math.round(Math.random()*30+8), stage, "down");
		Box(x,y,w,h, stage, "down");
	Math.random();
}

function preciseColllision(player, b){
	var choque="none"; //by default
	var div = Math.max(Math.abs(player.hspeed), Math.abs(player.vspeed));
	if(div==0)div=1;
	for(var i=0; i<div; i++){
		px = player.x + i*player.hspeed/div;
		py = player.y + i*player.vspeed/div;
		if(player.x+i*player.hspeed/div < b.x+b.w && player.x+player.s+i*player.hspeed/div > b.x && player.y+i*player.vspeed/div<b.y+b.h && player.y+player.s+i*player.vspeed/div>b.y ){
			if(player.y<b.y)
				choque = "floor";
			if(player.x+player.s*0.5<b.x) 
				choque = "lwall";
			if(player.x+player.s*0.5>b.x+b.w)
				choque = "rwall";
			if(player.y+player.s>b.y+b.h && b.speed-player.vspeed>0)
				choque = "ceiling";
			break;
		}
	}
	
	switch(choque){
		case "floor":
			player.canjump = true;
			player.onfloor = true;
			player.vspeed = b.speed;
			player.y = b.y-player.s;
			break;
		case "ceiling":
			player.vspeed = b.speed;//*1.1
			player.jumping=0;
			if(player.onfloor)death();
			break;
		case "lwall":
			if(player.hspeed>0)
				player.hspeed = 0;
			//player.canjump = false;
			break;
		case "rwall":
			if(player.hspeed<0)
				player.hspeed = 0;
			//player.canjump = false;
			break;
	}
}

function death(){//player dies, score screen displayed
	player.isAlive = false;
	endtimer = 30;
	stage.removeChild(player);
	for(var i=0;i<10;i++){
		Particle(player.x+i,player.y+Math.random()*10,10,Math.random()*20-10,Math.random()*30-15,'rgba(180,40,40,1)',stage);
	}
	
	var deathBox = new Shape();
	deathBox.graphics.beginFill('rgba(10,10,10,0.8)').rect(0,-6,640,53).beginFill('rgba(200,50,50,0.7)').rect(0,0,640,50);
	deathBox.x=0;
	deathBox.y=150;
	stage.addChild(deathBox);
	var deathText = new Text("YOR DED!.... SCORE: " + score, "30px Arial", "#FFF");
	deathText.textAlign = "center";
	deathText.x = 320;
	deathText.y = 160;
	stage.addChild(deathText);
	stage.update();
	endButton = false;
}

function coinExplosion(x,y){
	for(var i=0;i<10;i++){
		Particle(x+i,y+Math.random()*10,3,Math.random()*20-10,Math.random()*20-10,'rgba(200,170,30,1)',stage, false);
	}
}

function boxExplosion(a,b){ //platform explosion
	for(var i=0;i<Math.ceil(a.w*0.1);i++){
		Particle(a.x+i*10,a.y+Math.random()*a.h,5,Math.random()*20-10,Math.random()*30-15,a.color,stage, true);
	}
	for(var i=0;i<Math.ceil(b.w*0.1);i++){
		Particle(b.x+i*10,b.y+Math.random()*b.h,5,Math.random()*20-10,Math.random()*30-15,b.color,stage, true);
	}
}

function handleKeyDown(e){
	if(!startButton){
		startButton = true;
		startLevel();
	}
	if(!endButton && endtimer == 0){
		endButton = true;
		startLevel();
		/*startButton = false;
		startMenu();*/
	}
	switch(e.keyCode){
		case keyup:
		case keyw:
			jump = true;
			player.canjump = false;return false;
		case keyleft:
		case keya:
			left = true;return false;
		case keyright:
		case keyd:
			right = true;break;
	}
}

function handleKeyUp(e){
	switch(e.keyCode){
		case keyup:
		case keyw:
			jump = false;
			player.jumping=0;return false;
		case keyleft:
		case keya:
			left = false;return false;
		case keyright:
		case keyd:
			right = false;break;
	}
}

// TOUCH
function handleTouchStart(e){
	e.preventDefault();
	var canvasx = canvas.offsetLeft;
	var canvasY = canvas.offsetTop;
	var	touches = e.changedTouches;
	for(i in touches){
		var touch = touches[i];
		if(!startButton){
		startButton = true;
			startLevel();
		}
		if(!endButton && endtimer ==0){
			endButton = true;
			startLevel();
			/*startButton = false;
			startMenu();*/
		}
		if(touch.pageX  <200+canvasx)left = true;
		if((touch.pageX  >=200+canvasx && touch.pageX  <=440+canvasx) || touch.pageY<300+canvasY){
			jump = true;
			player.canjump = false;
		}
		if(touch.pageX  >440+canvasx)right = true;

	}
}

function handleTouchEnd(e){
	e.preventDefault();
	var canvasx = canvas.offsetLeft;
	var canvasY = canvas.offsetTop;
	var	touches = e.changedTouches;
	for(i in touches){
		var touch = touches[i];
		if(touch.pageX  <200+canvasx)left = false;
		if((touch.pageX  >=200+canvasx && touch.pageX  <=440+canvasx) || touch.pageY<300+canvasY){
			jump = false;
			player.jumping=0;
		}
		if(touch.pageX  >440+canvasx)right = false;
	}
}

//COPY OF KEYBOARD EVENTS, UPDATE IF KEYBOARD EVENTS CHANGE
function handleMouseDown(e){
	var canvasx = canvas.offsetLeft;
	var canvasY = canvas.offsetTop;
	if(!startButton){
		startButton = true;
		startLevel();
	}
	if(!endButton && endtimer == 0){                                                                                                                                                                                                                                                                                                                
		endButton = true;
		startLevel();
		/*startButton = false;
		startMenu();*/
	}
	if(e.clientX  <200+canvasx)left = true;
	if((e.clientX  >=200+canvasx && e.clientX  <=440+canvasx) || e.clientY<300+canvasY){
		jump = true;
		player.canjump = false;
	}
	if(e.clientX  >440+canvasx)right = true;
}

function handleMouseUp(e){
	var canvasx = canvas.offsetLeft;
	var canvasY = canvas.offsetTop;
	if(e.clientX  <200+canvasx)left = false;
	if((e.clientX  >=200+canvasx && e.clientX  <=440+canvasx) || e.clientY<300+canvasY){
		jump = false;
		player.jumping=0;
	}
	if(e.clientX  >440+canvasx)right = false;

}


/*Array.prototype.remove = function(from, to) {
   var rest = this.slice((to || from) + 1 || this.length);
   this.length = from < 0 ? this.length + from : from;
   return this.push.apply(this, rest);
   };*/
