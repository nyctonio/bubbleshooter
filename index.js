const canvas=document.getElementById('game-screen');
const c=canvas.getContext('2d');
let ele=document.getElementById('score');
let score=0;
ele.innerHTML=score;
const startgame=document.getElementById("start-game");
const result=document.getElementById("modalEl")
const displaypoints=document.getElementById('display-points');

let shootsound= new sound("shoot.wav");
let hit= new sound("hit.wav");


console.log(c);


// scr.innerHTML=score;
canvas.width=innerWidth;
canvas.height=innerHeight;

class Player{
    constructor(x,y,radius,color) {
        this.x=x
        this.y=y
        this.radius=radius
        this.color=color
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2 , false);
        c.fillStyle=this.color; 
        c.fill();
    }
} 

class Projectile{
    constructor(x,y,radius,color,velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2 , false);
        c.fillStyle=this.color; 
        c.fill();
    }
    update(){
        this.draw();
        this.x=this.x+this.velocity.x;
        this.y=this.y+this.velocity.y;
    }
}

class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
    }
    draw(){
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2 , false);
        c.fillStyle=this.color; 
        c.fill();
    }
    update(){
        this.draw();
        this.x=this.x+this.velocity.x;
        this.y=this.y+this.velocity.y;
    }
}

const friction=.99;
class Particle{
    constructor(x,y,radius,color,velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
        this.alpha=1
    }
    draw(){
        c.save();
        c.globalAlpha=this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2 , false);
        c.fillStyle=this.color; 
        c.fill();
        c.restore();
    }
    update(){
        this.draw();
        this.velocity.x*=friction;
        this.velocity.y*=friction;
        this.x=this.x+this.velocity.x;
        this.y=this.y+this.velocity.y;
        this.alpha-=.01;
    }
}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}



const player= new Player(innerWidth/2,innerHeight/2,30,'white');
player.draw();

let projectiles=[];
let enemies=[];
let particles=[];
var endspawn="";
function spawnEnemies(){
    endspawn=setInterval(()=>{
        const radius=Math.random()*(30-10)+10;
        let x,y;
        if(Math.random() < 0.5){
            x=Math.random()<.5?0-radius:canvas.width+radius;
            y=Math.random()*canvas.height;
        }else{
            x=Math.random()*canvas.width;
            y=Math.random()<.5?0-radius:canvas.height+radius;
        }
        // console.log(x+" "+y);
        const color=`hsl(${Math.random()*360},50%,50%)`;
        const angle=Math.atan2(
            canvas.height/2-y,
            canvas.width/2-x
        );
        const velocity={
            x:Math.cos(angle)*1.7,
            y:Math.sin(angle)*1.7
        };
        enemies.push(new Enemy(x,y,radius,color,velocity))
    },3000);
}



let animationID;
function animate(){
    ele.innerHTML=score;
    animationID= requestAnimationFrame(animate);
    c.fillStyle="rgba(0,0,0,0.3)"
    c.fillRect(0,0,canvas.width,canvas.height);
    player.draw();
    particles.forEach((particle,index)=>{
        if(particle.alpha<0){
            particles.splice(index,1);
        }else{
            particle.update();
        }
    })
    projectiles.forEach((projectile,index)=>{
        projectile.update();
        // removing projectiles
        if(projectile.x+projectile.radius<0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 ||  projectile.y -projectile.radius > canvas.height){
            setTimeout(()=>{
                projectiles.splice(index,1);
            },0);
        }
    })
    enemies.forEach((enemy,index1)=>{
        enemy.update();
        // end-game
        const dist=Math.hypot(player.x-enemy.x,player.y-enemy.y);
        if(dist-enemy.radius-player.radius<1){
            enemies.splice(index1,1);
            cancelAnimationFrame(animationID);
            displaypoints.innerHTML=score;
            startgame.innerHTML="Play again";
            result.style.display='flex';
            score=0;
            projectiles=[];
            enemies=[];
            particles=[];
            clearInterval(endspawn);
        }
        projectiles.forEach((projectile,index2)=>{
            const dist=Math.hypot(projectile.x-enemy.x,projectile.y-enemy.y);
            // when projectiles hits the enemy
            if(dist-enemy.radius-projectile.radius<1){
                // particles explosion
                for(let i=0;i<(enemy.radius);i++){
                    particles.push(new Particle(projectile.x,projectile.y,Math.random()*2,enemy.color,{
                     x:(Math.random()-0.5)*1.5,
                     y:(Math.random()-0.5)*1.5
                     }))
                 }
                if(enemy.radius-10>10){
                    // gsap is used
                    gsap.to(enemy,{
                        radius: enemy.radius-10
                    });
                    score+=2;
                    setTimeout(()=>{
                        projectiles.splice(index2,1);
                    },0);
                    hit.stop();
                    hit.play();
                }else{
                    setTimeout(()=>{
                        enemies.splice(index1,1);
                        projectiles.splice(index2,1);
                        score+=5;
                    },0);
                    hit.stop();
                    hit.play();
                }
            }
        })
    })
}


window.addEventListener('click',(event)=>{
    console.log(event)
    console.log(projectiles);
    const angle=Math.atan2(
        event.clientY-canvas.height/2,
        event.clientX-canvas.width/2
    );
    const velocity={
        x:Math.cos(angle)*6,
        y:Math.sin(angle)*6
    };
    let projectile=new Projectile(
        canvas.width/2,
        canvas.height/2,
        5,'white',velocity);
    projectiles.push(projectile);
    shootsound.play();
});

startgame.addEventListener('click',(event)=>{
    animate();
    spawnEnemies();
    result.style.display='none';
})