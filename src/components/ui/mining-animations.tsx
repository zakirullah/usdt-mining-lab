'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// ============================================
// PREMIUM USDT COIN with Tether Symbol
// ============================================
export function USDTCoin({ size = 60, delay = 0, className = '' }: { size?: number; delay?: number; className?: string }) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size,
        perspective: '1000px'
      }}
      animate={{ rotateY: 360 }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear', delay }}
    >
      {/* Glow Effect */}
      <motion.div
        className="absolute -inset-1 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(38, 161, 123, 0.6) 0%, transparent 70%)',
          filter: 'blur(6px)'
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
      
      {/* Main Coin */}
      <div 
        className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: 'conic-gradient(from 0deg, #1a7d5c 0%, #26a17b 25%, #2ecc71 50%, #26a17b 75%, #1a7d5c 100%)',
          boxShadow: `
            0 0 ${size/3}px rgba(38, 161, 123, 0.7),
            0 ${size/10}px ${size/5}px rgba(0, 0, 0, 0.4),
            inset 0 ${size/8}px ${size/4}px rgba(255, 255, 255, 0.3),
            inset 0 -${size/10}px ${size/5}px rgba(0, 0, 0, 0.3)
          `,
          border: `${size/15}px solid rgba(255, 255, 255, 0.2)`
        }}
      >
        {/* Inner ring */}
        <div 
          className="absolute rounded-full"
          style={{
            width: size * 0.85,
            height: size * 0.85,
            border: `${size/30}px solid rgba(255, 255, 255, 0.1)`
          }}
        />
        
        {/* Tether Symbol */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span 
            className="font-black text-white"
            style={{ 
              fontSize: size * 0.45,
              textShadow: '0 2px 4px rgba(0,0,0,0.4)'
            }}
          >
            ₮
          </span>
        </motion.div>
        
        {/* Shine */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%)',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

// ============================================
// PREMIUM USD COIN
// ============================================
export function PremiumUSDCoin({ size = 80, className = '' }: { size?: number; className?: string }) {
  const [glowIntensity, setGlowIntensity] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIntensity(prev => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ 
        width: size, 
        height: size,
        perspective: '1000px'
      }}
      animate={{ rotateY: 360 }}
      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
    >
      {/* Outer Glow Ring */}
      <motion.div
        className="absolute -inset-2 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(38, 161, 123, ${0.3 + Math.sin(glowIntensity * 0.1) * 0.2}) 0%, transparent 70%)`,
          filter: 'blur(8px)'
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Main Coin */}
      <div 
        className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle at 30% 30%, #3dd9a0 0%, #26a17b 30%, #1a7d5c 60%, #0d5c42 100%)`,
          boxShadow: `
            0 0 ${size/3}px rgba(38, 161, 123, 0.8),
            0 ${size/8}px ${size/4}px rgba(0, 0, 0, 0.5),
            inset 0 ${size/6}px ${size/3}px rgba(255, 255, 255, 0.4),
            inset 0 -${size/8}px ${size/4}px rgba(0, 0, 0, 0.4)
          `,
          border: `${size/12}px solid rgba(255, 255, 255, 0.2)`
        }}
      >
        {/* Inner decorative ring */}
        <div 
          className="absolute rounded-full"
          style={{
            width: size * 0.82,
            height: size * 0.82,
            border: `${size/30}px solid rgba(255, 255, 255, 0.12)`,
            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.1)'
          }}
        />
        
        {/* Dollar sign with glow */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span 
            className="font-black text-white"
            style={{ 
              fontSize: size * 0.55,
              textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)'
            }}
          >
            $
          </span>
        </motion.div>
        
        {/* Rotating shine effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(45deg, transparent 35%, rgba(255,255,255,0.6) 50%, transparent 65%)',
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

// ============================================
// FLOATING COINS BACKGROUND
// ============================================
export function FloatingCoinsBackground({ count = 12, isActive = true }: { count?: number; isActive?: boolean }) {
  if (!isActive) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${5 + (i * 8)}%`,
            top: `${10 + ((i * 17) % 80)}%`,
          }}
          animate={{
            y: [0, -40 - (i % 4) * 15, 0],
            x: [0, (i % 2 === 0 ? 15 : -15), 0],
            rotateY: [0, 180, 360],
            scale: [1, 1.1 + (i % 3) * 0.05, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 6 + i * 0.8,
            repeat: Infinity,
            delay: i * 0.3,
            ease: 'easeInOut'
          }}
        >
          <USDTCoin size={35 + (i % 4) * 10} delay={i * 0.2} />
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// PREMIUM GPU CARD - Enhanced Version
// ============================================
function PremiumGPUCard({ index, isMining = true, temperature = 65 }: { index: number; isMining?: boolean; temperature?: number }) {
  const fanSpeed = 0.4 + (index * 0.06);
  
  return (
    <motion.div
      className="relative"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2.5 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Card Container */}
      <div
        className="w-20 h-36 rounded-xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(180deg, #1e1e2e 0%, #0a0a15 100%)',
          boxShadow: `
            0 10px 40px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255,255,255,0.1),
            0 0 30px ${index % 2 === 0 ? 'rgba(0, 212, 255, 0.2)' : 'rgba(139, 92, 246, 0.2)'}
          `
        }}
      >
        {/* Brand Header */}
        <div 
          className="h-5 flex items-center justify-center font-bold"
          style={{ 
            background: 'linear-gradient(90deg, #252538, #1a1a28, #252538)',
            fontSize: '8px'
          }}
        >
          <span className="text-gray-400 tracking-wider">RTX 4090</span>
        </div>
        
        {/* Triple Fans */}
        <div className="flex justify-center gap-2 pt-2">
          {[0, 1, 2].map((fan) => (
            <motion.div
              key={fan}
              className="w-6 h-6 rounded-full relative flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle, #3a3a4e 0%, #2a2a3e 50%, #1a1a2e 100%)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              animate={isMining ? { rotate: 360 } : {}}
              transition={{ duration: fanSpeed, repeat: Infinity, ease: 'linear' }}
            >
              {/* Fan Blades */}
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-0.5 h-2 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.4)',
                    transform: `rotate(${deg}deg) translateY(-2px)`,
                    transformOrigin: 'center bottom'
                  }}
                />
              ))}
              {/* Fan Center */}
              <motion.div 
                className="w-2 h-2 rounded-full" 
                style={{ 
                  background: 'linear-gradient(135deg, #4a4a5e, #3a3a4e)',
                  boxShadow: '0 0 6px rgba(0,212,255,0.5)'
                }}
                animate={isMining ? { 
                  boxShadow: ['0 0 6px rgba(0,212,255,0.5)', '0 0 12px rgba(0,212,255,0.8)', '0 0 6px rgba(0,212,255,0.5)']
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.div>
          ))}
        </div>
        
        {/* GPU Body / Heatsink */}
        <div 
          className="mt-2 mx-1.5 h-14 rounded-lg relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #252538 0%, #1a1a28 100%)' }}
        >
          {/* Heat Fins */}
          <div className="absolute inset-0 flex justify-between px-0.5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-px h-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
            ))}
          </div>
          
          {/* Heat Pipes */}
          <div className="flex justify-center gap-1.5 pt-2">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-7 rounded-full"
                style={{
                  background: isMining 
                    ? `linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)`
                    : 'linear-gradient(180deg, #4a4a5e, #3a3a4e)',
                }}
                animate={isMining ? { 
                  opacity: [0.7, 1, 0.7],
                  boxShadow: ['0 0 8px rgba(251, 191, 36, 0.4)', '0 0 16px rgba(251, 191, 36, 0.7)', '0 0 8px rgba(251, 191, 36, 0.4)']
                } : {}}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
              />
            ))}
          </div>
          
          {/* GPU Die */}
          <motion.div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 h-4 rounded"
            style={{
              background: isMining 
                ? 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #00d4ff 100%)'
                : '#2a2a3e',
              boxShadow: isMining 
                ? '0 0 15px rgba(0, 212, 255, 0.6), inset 0 1px 0 rgba(255,255,255,0.3)'
                : 'none',
              backgroundSize: '200% 100%'
            }}
            animate={isMining ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
        
        {/* Temperature Indicator */}
        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold"
             style={{ 
               background: temperature > 75 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
               color: temperature > 75 ? '#ef4444' : '#10b981'
             }}>
          {temperature}°C
        </div>
        
        {/* RGB LED Strip */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-2"
          style={{
            background: `linear-gradient(90deg, 
              ${index % 3 === 0 ? '#00d4ff, #8b5cf6, #ec4899, #00d4ff' : 
                index % 3 === 1 ? '#10b981, #06b6d4, #3b82f6, #10b981' : 
                '#f59e0b, #ef4444, #f59e0b, #ef4444'})`,
            boxShadow: `0 0 20px ${index % 3 === 0 ? 'rgba(0, 212, 255, 0.8)' : 
              index % 3 === 1 ? 'rgba(16, 185, 129, 0.8)' : 
              'rgba(245, 158, 11, 0.8)'}`
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.15 }}
        />
      </div>
      
      {/* GPU Label */}
      <motion.p 
        className="text-center text-[9px] text-gray-500 mt-1.5 font-medium tracking-wide"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        GPU {index + 1}
      </motion.p>
    </motion.div>
  );
}

// ============================================
// PREMIUM MINING RIG
// ============================================
export function PremiumMiningRig({ gpuCount = 4, isMining = true }: { gpuCount?: number; isMining?: boolean }) {
  return (
    <div 
      className="relative p-8 rounded-3xl overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 20, 40, 0.7) 50%, rgba(5, 5, 20, 0.9) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 60px rgba(0,0,0,0.5), 0 0 100px rgba(0,212,255,0.08)'
      }}
    >
      {/* Animated Grid Background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }} 
      />
      
      {/* Scanning Line Effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        style={{ boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' }}
      />
      
      {/* Power Supply */}
      <motion.div
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-12 h-32 rounded-l-xl"
        style={{
          background: 'linear-gradient(90deg, #0a0a15 0%, #15152a 100%)',
          boxShadow: 'inset -4px 0 20px rgba(0,0,0,0.7), 0 0 30px rgba(0,212,255,0.1)'
        }}
        animate={{ opacity: [0.9, 1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="h-full flex flex-col justify-center items-center gap-2 py-3">
          {['#10b981', '#00d4ff', '#00d4ff', '#fbbf24'].map((color, i) => (
            <motion.div
              key={i}
              className="w-4 h-4 rounded-full"
              style={{ 
                background: isMining ? color : '#4a4a5e',
                boxShadow: isMining ? `0 0 12px ${color}` : 'none'
              }}
              animate={isMining ? { opacity: [0.4, 1, 0.4] } : {}}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
      
      {/* GPU Cards */}
      <div className="flex justify-center gap-5 mb-6 ml-8">
        {[...Array(gpuCount)].map((_, i) => (
          <PremiumGPUCard key={i} index={i} isMining={isMining} temperature={60 + (i % 3) * 8} />
        ))}
      </div>
      
      {/* Motherboard Base */}
      <div 
        className="relative h-12 rounded-xl overflow-hidden ml-8"
        style={{ 
          background: 'linear-gradient(180deg, #15152a 0%, #0a0a15 100%)',
          boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)'
        }}
      >
        {/* PCB Traces */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px"
              style={{
                background: i % 2 === 0 ? 'linear-gradient(90deg, transparent, #00d4ff, transparent)' : 'linear-gradient(90deg, transparent, #10b981, transparent)',
                width: `${20 + Math.random() * 35}%`,
                left: `${Math.random() * 50}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>
        
        {/* Status Indicators */}
        <div className="absolute inset-0 flex items-center justify-around px-8">
          {['PWR', 'GPU', 'MEM', 'NET', 'ERR'].map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <motion.div
                className="w-3 h-3 rounded-full"
                style={{
                  background: isMining ? 
                    (i === 4 ? '#6b7280' : i % 2 === 0 ? '#10b981' : '#00d4ff') : 
                    (i === 4 ? '#ef4444' : '#6b7280'),
                  boxShadow: `0 0 10px ${isMining ? 
                    (i === 4 ? 'rgba(107, 114, 128, 0.5)' : i % 2 === 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(0, 212, 255, 0.8)') : 
                    'rgba(107, 114, 128, 0.3)'}`
                }}
                animate={isMining && i !== 4 ? { opacity: [0.5, 1, 0.5] } : {}}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
              <span className="text-[8px] text-gray-600 font-medium">{label}</span>
            </div>
          ))}
        </div>
        
        {/* Air Flow Indicator */}
        <motion.div
          className="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1 text-cyan-500/40"
          animate={{ x: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-xl">››</span>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// LIVE PARTICLES BACKGROUND
// ============================================
export function LiveParticles({ count = 40 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 4,
            height: 2 + Math.random() * 4,
            background: i % 3 === 0 ? '#00d4ff' : i % 3 === 1 ? '#8b5cf6' : '#10b981',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 ${8 + Math.random() * 10}px ${i % 3 === 0 ? '#00d4ff' : i % 3 === 1 ? '#8b5cf6' : '#10b981'}`
          }}
          animate={{
            y: [0, -80 - Math.random() * 50, 0],
            x: [0, (Math.random() - 0.5) * 50, 0],
            opacity: [0.1, 0.8, 0.1],
            scale: [1, 2, 1]
          }}
          transition={{
            duration: 6 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// NETWORK PULSE INDICATOR
// ============================================
export function NetworkPulseIndicator() {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-cyan-500/40"
        animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-1 rounded-full border border-purple-500/30"
        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="absolute inset-2 rounded-full border border-green-500/30"
        animate={{ scale: [1, 2.3], opacity: [0.4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className="w-6 h-6 rounded-full"
        style={{ 
          background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
          boxShadow: '0 0 30px rgba(0, 212, 255, 0.8), 0 0 60px rgba(139, 92, 246, 0.5)'
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}

// ============================================
// HASH RATE BAR
// ============================================
export function HashRateBar({ value = 0, max = 200, label = '' }: { value: number; max?: number; label?: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="relative">
      {label && <p className="text-xs text-gray-500 mb-2">{label}</p>}
      <div className="relative h-3 w-full rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #00d4ff, #8b5cf6, #ec4899, #00d4ff)',
            backgroundSize: '300% 100%'
          }}
          animate={{ backgroundPosition: ['0% 0%', '300% 0%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute top-0 bottom-0 w-16 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)'
          }}
          animate={{ left: ['-20%', '120%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}

// ============================================
// LIVE STAT CARD
// ============================================
export function LiveStatCard({ 
  label, 
  value, 
  prefix = '', 
  suffix = '',
  color = 'cyan',
  icon: Icon
}: { 
  label: string; 
  value: string | number; 
  prefix?: string;
  suffix?: string;
  color?: 'cyan' | 'green' | 'purple' | 'amber' | 'pink';
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const colorMap = {
    cyan: { bg: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'rgba(0, 212, 255, 0.3)' },
    green: { bg: 'from-green-500/20 to-green-500/5', border: 'border-green-500/30', text: 'text-green-400', glow: 'rgba(34, 197, 94, 0.3)' },
    purple: { bg: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'rgba(139, 92, 246, 0.3)' },
    amber: { bg: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'rgba(245, 158, 11, 0.3)' },
    pink: { bg: 'from-pink-500/20 to-pink-500/5', border: 'border-pink-500/30', text: 'text-pink-400', glow: 'rgba(236, 72, 153, 0.3)' },
  };
  
  const c = colorMap[color];
  
  return (
    <motion.div
      className={`relative overflow-hidden bg-gradient-to-br ${c.bg} rounded-xl p-4 border ${c.border}`}
      whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${c.glow}` }}
    >
      {/* Animated top bar */}
      <motion.div
        className="absolute top-0 left-0 w-full h-0.5"
        style={{
          background: `linear-gradient(90deg, transparent, ${c.text === 'text-cyan-400' ? '#00d4ff' : c.text === 'text-green-400' ? '#22c55e' : c.text === 'text-purple-400' ? '#8b5cf6' : c.text === 'text-amber-400' ? '#f59e0b' : '#ec4899'}, transparent)`
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center ${c.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <p className="text-gray-500 text-xs mb-1">{label}</p>
          <p className={`${c.text} font-bold text-xl`}>
            {prefix}{value}{suffix}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// PROFIT COUNTER
// ============================================
export function ProfitCounter({ value, decimals = 6 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);
  
  return (
    <motion.div
      key={displayValue.toFixed(decimals)}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      className="font-mono font-bold"
    >
      ${displayValue.toFixed(decimals)}
    </motion.div>
  );
}

// ============================================
// NEW: PREMIUM MINING PLAN CARD
// ============================================
export function PremiumMiningPlanCard({ 
  plan, 
  onSelect,
  isActive,
  balance 
}: { 
  plan: {
    type: 'starter' | 'pro';
    name: string;
    daily: number;
    minInvestment: number;
    totalReturn: number;
    duration: number;
    features: string[];
  };
  onSelect: () => void;
  isActive: boolean;
  balance: number;
}) {
  const isPro = plan.type === 'pro';
  const canAfford = balance >= plan.minInvestment;
  
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02, 
        boxShadow: isPro 
          ? '0 0 40px rgba(139, 92, 246, 0.4)' 
          : '0 0 40px rgba(0, 212, 255, 0.4)'
      }}
      className={`relative overflow-hidden rounded-2xl border-2 p-5 ${
        isPro 
          ? 'bg-gradient-to-br from-purple-900/30 to-slate-900 border-purple-500/40' 
          : 'bg-gradient-to-br from-cyan-900/30 to-slate-900 border-cyan-500/40'
      }`}
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${isPro ? '#8b5cf6' : '#00d4ff'}, transparent 70%)`
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* PRO Badge */}
      {isPro && (
        <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-bold shadow-lg">
          PRO
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${
            isPro ? 'bg-purple-500/20' : 'bg-cyan-500/20'
          }`}
          animate={{ 
            boxShadow: [
              `0 0 10px ${isPro ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0, 212, 255, 0.3)'}`,
              `0 0 25px ${isPro ? 'rgba(139, 92, 246, 0.6)' : 'rgba(0, 212, 255, 0.6)'}`,
              `0 0 10px ${isPro ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0, 212, 255, 0.3)'}`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isPro ? (
            <svg className="w-7 h-7 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
            </svg>
          ) : (
            <svg className="w-7 h-7 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
            </svg>
          )}
        </motion.div>
        <div>
          <h3 className="text-white font-bold text-xl">{plan.name}</h3>
          <p className="text-gray-400 text-sm">{plan.duration} days duration</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 rounded-xl bg-black/30">
          <p className="text-gray-500 text-xs mb-1">Daily Profit</p>
          <p className={`font-bold text-lg ${isPro ? 'text-purple-400' : 'text-cyan-400'}`}>{plan.daily}%</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-black/30">
          <p className="text-gray-500 text-xs mb-1">Min Investment</p>
          <p className="text-white font-bold text-lg">${plan.minInvestment}</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-black/30">
          <p className="text-gray-500 text-xs mb-1">Total Return</p>
          <p className="text-green-400 font-bold text-lg">{plan.totalReturn}%</p>
        </div>
      </div>
      
      {/* Features */}
      <div className="space-y-2 mb-4">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <svg className={`w-4 h-4 ${isPro ? 'text-purple-400' : 'text-cyan-400'}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
      </div>
      
      {/* Button */}
      <motion.button
        onClick={onSelect}
        disabled={!canAfford}
        whileHover={{ scale: canAfford ? 1.03 : 1 }}
        whileTap={{ scale: canAfford ? 0.98 : 1 }}
        className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
          canAfford
            ? isPro 
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500'
              : 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500'
            : 'bg-gray-700 cursor-not-allowed opacity-50'
        }`}
      >
        {canAfford ? 'Invest Now' : `Min $${plan.minInvestment} Required`}
      </motion.button>
    </motion.div>
  );
}

// ============================================
// NEW: LIVE PROFIT CHART
// ============================================
export function LiveProfitChart({ data }: { data: Array<{ time: string; profit: number }> }) {
  const maxProfit = Math.max(...data.map(d => d.profit), 0.001);
  
  return (
    <div className="relative h-32 w-full overflow-hidden rounded-xl bg-black/30 border border-white/5">
      {/* Grid Lines */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute w-full h-px bg-white" style={{ top: `${i * 25}%` }} />
        ))}
      </div>
      
      {/* Chart Bars */}
      <div className="absolute inset-0 flex items-end gap-0.5 px-1 pb-2">
        {data.slice(-30).map((d, i) => {
          const height = (d.profit / maxProfit) * 100;
          return (
            <motion.div
              key={i}
              className="flex-1 rounded-t"
              style={{
                background: 'linear-gradient(180deg, #10b981, #059669)',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
              }}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </div>
      
      {/* Y-Axis Labels */}
      <div className="absolute left-2 inset-y-0 flex flex-col justify-between py-2 text-[8px] text-gray-500">
        <span>${maxProfit.toFixed(4)}</span>
        <span>$0</span>
      </div>
    </div>
  );
}

// ============================================
// NEW: TEMPERATURE GAUGE
// ============================================
export function TemperatureGauge({ temperature, max = 100 }: { temperature: number; max?: number }) {
  const percentage = Math.min((temperature / max) * 100, 100);
  const isHot = temperature > 75;
  const color = isHot ? '#ef4444' : temperature > 60 ? '#f59e0b' : '#10b981';
  
  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        {/* Background Circle */}
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 0.94} 100`}
          animate={{ strokeDasharray: [`${percentage * 0.94} 100`] }}
          transition={{ duration: 0.5 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className={`text-xs font-bold ${isHot ? 'text-red-400' : 'text-green-400'}`}>
          {temperature}°
        </span>
      </div>
    </div>
  );
}

// ============================================
// NEW: MINING STAT ITEM
// ============================================
export function MiningStatItem({ 
  icon: Icon, 
  label, 
  value, 
  suffix = '', 
  color = 'cyan' 
}: { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  suffix?: string;
  color?: 'cyan' | 'green' | 'purple' | 'amber' | 'red';
}) {
  const colorClasses = {
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };
  
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${colorClasses[color]}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-black/30`}>
        <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[0]}`} />
      </div>
      <div>
        <p className="text-gray-500 text-xs">{label}</p>
        <p className={`font-bold text-lg ${colorClasses[color].split(' ')[0]}`}>
          {value}{suffix}
        </p>
      </div>
    </div>
  );
}

// ============================================
// NEW: MINING SESSION CARD - Enhanced
// ============================================
export function MiningSessionCard({ 
  session,
  liveProfit,
  timer,
  index
}: { 
  session: {
    id: string;
    planType: string;
    planName: string;
    investment: number;
    dailyPercent: number;
    dailyProfit: number;
    totalEarned: number;
    progressPercent: number;
  };
  liveProfit: number;
  timer: { days: number; hours: number; minutes: number; seconds: number };
  index: number;
}) {
  const isPro = session.planType === 'pro';
  const profitPerSecond = session.dailyProfit / 86400;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-2xl border p-5 ${
        isPro 
          ? 'bg-gradient-to-br from-purple-900/20 to-slate-900 border-purple-500/30' 
          : 'bg-gradient-to-br from-cyan-900/20 to-slate-900 border-cyan-500/30'
      }`}
    >
      {/* Animated Border Glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow: `inset 0 0 30px ${isPro ? 'rgba(139, 92, 246, 0.15)' : 'rgba(0, 212, 255, 0.15)'}`
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      
      {/* Floating Coins */}
      <div className="absolute right-4 top-4 opacity-30">
        <USDTCoin size={40} delay={index * 0.2} />
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isPro ? 'bg-purple-500/20' : 'bg-cyan-500/20'
            }`}
            animate={{
              boxShadow: [
                `0 0 10px ${isPro ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0, 212, 255, 0.3)'}`,
                `0 0 25px ${isPro ? 'rgba(139, 92, 246, 0.6)' : 'rgba(0, 212, 255, 0.6)'}`,
                `0 0 10px ${isPro ? 'rgba(139, 92, 246, 0.3)' : 'rgba(0, 212, 255, 0.3)'}`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isPro ? (
              <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
              </svg>
            )}
          </motion.div>
          <div>
            <h4 className="text-white font-bold text-lg">{session.planName}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isPro ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {session.dailyPercent}% Daily
              </span>
            </div>
          </div>
        </div>
        
        {/* Live Earned */}
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <motion.p
              key={(session.totalEarned + liveProfit).toFixed(4)}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              className={`text-2xl font-bold ${isPro ? 'text-purple-400' : 'text-cyan-400'}`}
            >
              +${(session.totalEarned + liveProfit).toFixed(4)}
            </motion.p>
          </div>
          <p className="text-gray-500 text-xs">total earned</p>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-black/30">
          <p className="text-gray-500 text-xs">Investment</p>
          <p className="text-white font-bold">${session.investment}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-black/30">
          <p className="text-gray-500 text-xs">Daily</p>
          <p className="text-green-400 font-bold">${session.dailyProfit.toFixed(2)}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-black/30">
          <p className="text-gray-500 text-xs">Per Sec</p>
          <p className="text-cyan-400 font-bold">${profitPerSecond.toFixed(6)}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-black/30">
          <p className="text-gray-500 text-xs">Progress</p>
          <p className="text-amber-400 font-bold">{Math.round(session.progressPercent)}%</p>
        </div>
      </div>
      
      {/* Countdown Timer */}
      <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-black/30 mb-3">
        {[
          { value: timer.days, label: 'D' },
          { value: timer.hours, label: 'H' },
          { value: timer.minutes, label: 'M' },
          { value: timer.seconds, label: 'S' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1">
            <motion.div
              className="rounded-lg px-2 py-1 text-center min-w-[36px] bg-slate-800 border border-white/10"
              animate={item.label === 'S' ? { scale: [1, 0.95, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className={`font-bold text-sm ${isPro ? 'text-purple-400' : 'text-cyan-400'}`}>
                {String(item.value).padStart(2, '0')}
              </span>
            </motion.div>
            {i < 3 && <span className="text-gray-600 font-bold">:</span>}
          </div>
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="relative h-2 rounded-full overflow-hidden bg-slate-800">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${session.progressPercent}%`,
            background: isPro
              ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)'
              : 'linear-gradient(90deg, #00d4ff, #22d3ee)'
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}
