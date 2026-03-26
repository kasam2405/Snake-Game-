import React, { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const TILE_COUNT = 20; // 20x20 grid
const CANVAS_SIZE = GRID_SIZE * TILE_COUNT;

type Point = { x: number; y: number };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAME_OVER'>('IDLE');
  
  // Game state refs for rAF
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const velocityRef = useRef<Point>({ x: 0, y: -1 });
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const lastRenderTimeRef = useRef<number>(0);
  const speedRef = useRef<number>(8); // moves per second
  const glitchFramesRef = useRef<number>(0);

  const resetGame = () => {
    snakeRef.current = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    velocityRef.current = { x: 0, y: -1 };
    foodRef.current = { x: Math.floor(Math.random() * TILE_COUNT), y: Math.floor(Math.random() * TILE_COUNT) };
    setScore(0);
    speedRef.current = 8;
    setGameState('PLAYING');
    glitchFramesRef.current = 10;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      if (e.key === ' ' && gameState !== 'PLAYING') {
        resetGame();
        return;
      }

      const v = velocityRef.current;
      switch (e.key) {
        case 'ArrowUp': case 'w': if (v.y === 0) velocityRef.current = { x: 0, y: -1 }; break;
        case 'ArrowDown': case 's': if (v.y === 0) velocityRef.current = { x: 0, y: 1 }; break;
        case 'ArrowLeft': case 'a': if (v.x === 0) velocityRef.current = { x: -1, y: 0 }; break;
        case 'ArrowRight': case 'd': if (v.x === 0) velocityRef.current = { x: 1, y: 0 }; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      // Clear canvas with slight trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Glitch effect offset
      let offsetX = 0;
      let offsetY = 0;
      if (glitchFramesRef.current > 0) {
        offsetX = (Math.random() - 0.5) * 10;
        offsetY = (Math.random() - 0.5) * 10;
        glitchFramesRef.current--;
        
        // Random cyan/magenta horizontal lines
        ctx.fillStyle = Math.random() > 0.5 ? '#00ffff' : '#ff00ff';
        ctx.fillRect(0, Math.random() * CANVAS_SIZE, CANVAS_SIZE, Math.random() * 5);
      }

      ctx.save();
      ctx.translate(offsetX, offsetY);

      // Draw Grid (subtle)
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
        ctx.stroke();
      }

      // Draw Food
      ctx.fillStyle = '#ff00ff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff00ff';
      ctx.fillRect(foodRef.current.x * GRID_SIZE + 2, foodRef.current.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
      ctx.shadowBlur = 0; // reset

      // Draw Snake
      const snake = snakeRef.current;
      snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#ffffff' : '#00ffff';
        if (index === 0) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#00ffff';
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      });

      ctx.restore();
    };

    const update = (time: number) => {
      animationFrameId = requestAnimationFrame(update);

      if (gameState !== 'PLAYING') {
        draw();
        return;
      }

      const secondsSinceLastRender = (time - lastRenderTimeRef.current) / 1000;
      if (secondsSinceLastRender < 1 / speedRef.current) {
        draw();
        return;
      }

      lastRenderTimeRef.current = time;

      // Move Snake
      const snake = [...snakeRef.current];
      const head = { ...snake[0] };
      head.x += velocityRef.current.x;
      head.y += velocityRef.current.y;

      // Wall Collision
      if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        setGameState('GAME_OVER');
        glitchFramesRef.current = 30;
        return;
      }

      // Self Collision
      if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('GAME_OVER');
        glitchFramesRef.current = 30;
        return;
      }

      snake.unshift(head);

      // Food Collision
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore(s => {
          const newScore = s + 10;
          speedRef.current = 8 + Math.floor(newScore / 50) * 2;
          return newScore;
        });
        glitchFramesRef.current = 5; // small glitch on eat
        
        // Generate new food
        let newFood: Point;
        while (true) {
          newFood = { x: Math.floor(Math.random() * TILE_COUNT), y: Math.floor(Math.random() * TILE_COUNT) };
          if (!snake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
        }
        foodRef.current = newFood;
      } else {
        snake.pop();
      }

      snakeRef.current = snake;
      draw();
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg z-20">
      <div className="w-full flex justify-between items-end border-b-2 border-[#00ffff] pb-2">
        <div>
          <span className="text-[#ff00ff] text-sm uppercase tracking-widest block">&gt;&gt; SCORE_DATA</span>
          <span className="text-4xl font-black text-[#00ffff]">{score.toString().padStart(4, '0')}</span>
        </div>
        <div className="text-right">
          <span className="text-[#ff00ff] text-sm uppercase tracking-widest block">&gt;&gt; STATUS</span>
          <span className="text-xl text-[#00ffff] uppercase tracking-widest glitch" data-text={gameState}>
            {gameState}
          </span>
        </div>
      </div>

      <div className="relative border-4 border-[#ff00ff] shadow-[8px_8px_0px_#00ffff] bg-black p-1">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block bg-black"
        />
        
        {gameState !== 'PLAYING' && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
            <h2 className="text-5xl font-black text-[#ff00ff] mb-4 uppercase tracking-widest glitch" data-text={gameState === 'IDLE' ? 'SYSTEM_READY' : 'FATAL_ERROR'}>
              {gameState === 'IDLE' ? 'SYSTEM_READY' : 'FATAL_ERROR'}
            </h2>
            <p className="text-[#00ffff] mb-8 uppercase tracking-widest animate-pulse">
              &gt;&gt; PRESS [SPACE] TO INITIALIZE
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
