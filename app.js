let Snake = {}

Snake.equalCoordinates = (coord1, coord2)=> {
    return coord1[0] === coord2[0] && coord1[1] === coord2[1];
  }

Snake.checkCoordinateInArray = (coord, arr)=> {
    let isInArray = false;
    $.each(arr, (index, item) =>{
      if (Snake.equalCoordinates(coord, item)) {
        isInArray = true;
      }
    });
    return isInArray;
  };

//Game Module
Snake.game =(()=>{
    let canvas,ctx;
    let FrameLength;
    let Food;
    let score;
    let snake;
    let timeout;
    Snake.width = 600;
    Snake.height = 600;
    Snake.blockSize = 15;
    Snake.widthInBlocks = Snake.width/Snake.blockSize;
    Snake.heightInBlocks = Snake.height/Snake.blockSize;
    
    let init = ()=>{

        let $canvas = $('#MyCanvas');
        if ($canvas.length === 0) {
            $('body').append('<canvas id="MyCanvas">');
        }
        $canvas = $('#MyCanvas');
        $canvas.attr('width', Snake.width);
        $canvas.attr('height', Snake.height);
        canvas = $canvas[0];
        ctx = canvas.getContext('2d');
        score = 0;
        FrameLength = 100;
        snake = Snake.snake();
        Food = Snake.Food();
        bindEvents();
        gameLoop();
    }

    let gameLoop = () => {
        ctx.clearRect(0,0, Snake.width, Snake.height);
        snake.advance(Food);
        draw();

        if(snake.checkCollision()){
            snake.retreat();
            snake.draw(ctx);    
            gameOver();

        }
        else{
            timeout = setTimeout(gameLoop,FrameLength);
        }
    }

    let draw = ()=> {
        snake.draw(ctx);
        drawBorder();
        Food.draw(ctx);
        drawScore();
    }

    
    let drawScore =()=>{
        ctx.save();
        ctx.font = 'bold 102px sans-serif';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let centreX = Snake.width / 2;
        let centreY = Snake.width / 2;
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();
    }

    let gameOver = ()=>{
        ctx.save();
        ctx.font = 'bold 30px sans-serif';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        let centreX = Snake.width / 2;
        let centreY = Snake.width / 2;
        ctx.strokeText('Game Over', centreX, centreY - 10);
        ctx.fillText('Game Over', centreX, centreY - 10);
        ctx.font = 'bold 15px sans-serif';
        ctx.strokeText('Press space to restart', centreX, centreY + 15);
        ctx.fillText('Press Space to restart', centreX, centreY + 15);
        ctx.restore();
    }

    let drawBorder= () => {
        ctx.save();
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = Snake.blockSize;
        ctx.lineCap = 'square';
        let offset = ctx.lineWidth / 2;
        let corners = [
          [offset, offset],
          [Snake.width - offset, offset],
          [Snake.width - offset, Snake.height - offset],
          [offset, Snake.height - offset]
        ];
        ctx.beginPath();
        ctx.moveTo(corners[3][0], corners[3][1]);
        $.each(corners, (index, corner)=> {
          ctx.lineTo(corner[0], corner[1]);
        });
        ctx.stroke();
        ctx.restore();
      }

    let restart = ()=>{ 
        clearTimeout(timeout);
        $('body').off('keydown');
        $(Snake).off('FoodEaten');
        $(canvas).off('click');
        Snake.game.init();
    }

    

    let bindEvents = ()=>{
        let KeysforDirection = {
            37 : 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        $(document).keydown((event)=>{
            let key = event.which;
            console.log(key);
            let direction = KeysforDirection[key];

            if(direction){
                snake.setDirection(direction);
                event.preventDefault();
            }
            else if(key === 32){
                restart();
            }
        });

        $(Snake).on('FoodEaten',(event,snakePosition)=>{
            Food.setNewPosition(snakePosition);
            score++;
            FrameLength *= 0.95;
        });

        $(canvas).click(restart);
    }

   

    

    return{
        init 
    };
})();


//Points Module
Snake.Food = ()=>{
    let position = [15, 20];
    
    let draw = (ctx) =>{
        ctx.save();
        ctx.fillStyle = '#0a0'; //apple green
        ctx.beginPath();
        let radius = Snake.blockSize / 2;
        let x = position[0] * Snake.blockSize + radius;
        let y = position[1] * Snake.blockSize + radius;
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.restore();
      }
      
      let random = (low,high)=>{
          return Math.floor(Math.random() * (high-low+1)+ low);
      }

      let getRandomPosition = ()=>{
          let x = random(1,Snake.widthInBlocks -2);
          let y = random(1,Snake.heightInBlocks -2);

          return [x,y];
      }
      
      let setNewPosition = (snakeArray)=> {
        let newPosition = getRandomPosition();
        //if new position is already covered by the snake, try again
        if (Snake.checkCoordinateInArray(newPosition, snakeArray)) {
          return setNewPosition(snakeArray);
        }
        //otherwise set position to the new position
        else {
          position = newPosition;
        }
      }

      let getPosition = () => {
        return position;
        }

      return {
          draw,
          setNewPosition,
          getPosition
        }
}  


//Snake Module 
Snake.snake = ()=>{
    let positions = [];
    positions.push([7,5]);
    positions.push([8,5]);
    let direction = 'right';
    let nextDirection = direction;
    let previousPosArray;

    let setDirection = (newDirection)=>{
        let allowedDirections;

        switch(direction){
            case 'left':
            case 'right': 
                allowedDirections = ['up','down'];
                break;
            case 'up':
            case 'down':
                allowedDirections = ['left','right'];
                break;
            default:
                throw('Invalid Direction');            
        }

        if(allowedDirections.indexOf(newDirection) > -1){
            nextDirection = newDirection;
        }
    }


    let draw = (ctx)=>{
        ctx.save();
        ctx.fillStyle = '#33a';
        for(let i = 0; i< positions.length; i++){
            drawSection(ctx,positions[i]);
        }
        ctx.restore();
    }

    let drawSection = (ctx,position)=>{
        ctx.beginPath();
        let radius = Snake.blockSize/2;
        let x = position[0] * Snake.blockSize + radius;
        let y = position[1] * Snake.blockSize + radius;
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fill();
    }

    let checkCollision = ()=>{
        let wallCollision = false;
        let selfCollision = false;
        let head = positions[0];
        let rest = positions.slice(1);
        let snakeX = head[0];
        let snakeY = head[1];
        let minX = 1;
        let minY = 1;
        let maxX = Snake.widthInBlocks - 1;
        let maxY = Snake.heightInBlocks - 1;
        let outsideHorizontalBounds = snakeX < minX || snakeX >= maxX;
        let outsideVerticalBounds = snakeY < minY || snakeY >= maxY;
        
        if(outsideHorizontalBounds || outsideVerticalBounds){
            wallCollision = true;
        }
        console.log(head);
        selfCollision = Snake.checkCoordinateInArray(head, rest);
        return wallCollision || selfCollision;
    }

    let advance = (Food)=>{
        let nextPosition = positions[0].slice();
        direction = nextDirection;
        switch(direction){
            case 'left':
                nextPosition[0] -= 1;
                break;
            case 'up':
                nextPosition[1] -= 1;
                break;
            case 'right':
                nextPosition[0] += 1;
                break;
            case 'down':
                nextPosition[1] += 1;
                break;
            default:
                throw('Invalid direction');
            }

            previousPosArray = positions.slice();
            positions.unshift(nextPosition);
            if(isEatingFood(positions[0],Food)){
                $(Snake).trigger('FoodEaten',[positions]);
            }
            else{
                positions.pop();
            }
    }

    let isEatingFood = (head, Food)=>{
        return Snake.equalCoordinates(head, Food.getPosition());
    } 

    let retreat = ()=>{
        positions = previousPosArray;
    }

    return {
        draw,
        advance,
        retreat,
        checkCollision,
        setDirection
    }
}
    Snake.game.init();

