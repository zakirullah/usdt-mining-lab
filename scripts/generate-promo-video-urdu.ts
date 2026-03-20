import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = '/home/z/my-project/public/videos';
const AUDIO_DIR = '/home/z/my-project/public/videos/audio';

// Video Script - Urdu
const SCENES = [
  {
    id: 1,
    title: "Welcome to USDT Mining Lab",
    voiceover: "Assalamualaikum. USDT Mining Lab ek online crypto mining platform hai jahan aap investment karke daily profit kama sakte hain.",
    videoPrompt: "Dark futuristic crypto mining platform introduction, neon cyan and purple glow, welcome text animation 'USDT Mining Lab', professional dark background with blockchain particles floating, modern tech style"
  },
  {
    id: 2,
    title: "Account Create",
    voiceover: "Sab se pehle apna account create karein. Register page par jaa kar apna wallet address aur pin code enter karein.",
    videoPrompt: "Mobile screen showing crypto registration form, wallet address input field animation, PIN code entry, dark theme with green accent colors, clean UI animation"
  },
  {
    id: 3,
    title: "Deposit",
    voiceover: "Account create karne ke baad deposit karein. Minimum deposit 10 USDT hai. USDT BEP20 wallet par payment bhejne ke baad transaction hash submit karein.",
    videoPrompt: "Crypto deposit interface, USDT coins falling into digital wallet, BEP20 network visualization, transaction hash being entered, dark theme with golden USDT coins glowing"
  },
  {
    id: 4,
    title: "Plan Purchase",
    voiceover: "Deposit approve hone ke baad dashboard par jaa kar mining plan buy karein. Plan buy karte hi mining automatically start ho jati hai.",
    videoPrompt: "Mining plans comparison card, Starter Plan and Pro Plan glowing cards, purchase button being clicked, activation animation with power surge effect"
  },
  {
    id: 5,
    title: "Mining Earnings",
    voiceover: "Aapka profit har second increase hota rahega aur dashboard par live dikhega.",
    videoPrompt: "Live mining dashboard, profit counter increasing in real-time, green numbers going up, progress bar filling, cryptocurrency coins multiplying, satisfying growth animation"
  },
  {
    id: 6,
    title: "Withdrawal",
    voiceover: "Jab aapka balance 10 USDT ho jaye to withdrawal request bhej sakte hain. Admin approval ke baad payment directly aapke wallet me bhej di jati hai.",
    videoPrompt: "Withdrawal form on screen, amount being entered, submit button clicked, approval stamp animation, USDT coins transferring to wallet, success checkmark"
  },
  {
    id: 7,
    title: "Final Message",
    voiceover: "USDT Mining Lab join karein aur apni crypto earning start karein.",
    videoPrompt: "USDT Mining Lab logo animation with glow effect, call to action text 'Join Now', professional ending, dark background with neon highlights, website URL display"
  }
];

// Short 30-second version script
const SHORT_SCENES = [
  {
    id: 1,
    voiceover: "USDT Mining Lab mein account create karein aur daily profit kamaein.",
    videoPrompt: "USDT Mining Lab logo with registration animation"
  },
  {
    id: 2,
    voiceover: "Deposit karein, plan buy karein, aur mining shuru karein.",
    videoPrompt: "Quick deposit and plan purchase animation"
  },
  {
    id: 3,
    voiceover: "Har second profit barhta rahega. Withdrawal kabhi bhi.",
    videoPrompt: "Growing profit numbers and withdrawal success"
  },
  {
    id: 4,
    voiceover: "USDT Mining Lab join karein, aaj hi shuru karein!",
    videoPrompt: "Final logo with call to action"
  }
];

async function generateAudio(zai: Awaited<ReturnType<typeof ZAI.create>>, text: string, filename: string): Promise<string> {
  console.log(`🎤 Generating audio: ${filename}`);
  
  const response = await zai.audio.tts.create({
    input: text,
    voice: 'tongtong',
    speed: 0.9, // Slightly slower for clarity
    response_format: 'wav',
    stream: false
  });

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(new Uint8Array(arrayBuffer));
  
  const outputPath = path.join(AUDIO_DIR, filename);
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✅ Audio saved: ${outputPath}`);
  return outputPath;
}

async function generateVideo(zai: Awaited<ReturnType<typeof ZAI.create>>, prompt: string, filename: string): Promise<{ taskId: string; status: string }> {
  console.log(`🎬 Creating video task: ${filename}`);
  
  const task = await zai.video.generations.create({
    prompt: prompt,
    quality: 'quality',
    duration: 10,
    fps: 30,
    size: '1344x768'
  });

  console.log(`📋 Task created: ${task.id}`);
  return { taskId: task.id, status: task.task_status };
}

async function pollVideoResult(zai: Awaited<ReturnType<typeof ZAI.create>>, taskId: string): Promise<string | null> {
  console.log(`⏳ Polling for video: ${taskId}`);
  
  let attempts = 0;
  const maxAttempts = 180; // 15 minutes max
  
  while (attempts < maxAttempts) {
    attempts++;
    const result = await zai.async.result.query(taskId);
    
    console.log(`Poll ${attempts}/${maxAttempts}: Status = ${result.task_status}`);
    
    if (result.task_status === 'SUCCESS') {
      const videoUrl = result.video_result?.[0]?.url ||
                      result.video_url ||
                      result.url ||
                      result.video;
      console.log(`✅ Video ready: ${videoUrl}`);
      return videoUrl;
    } else if (result.task_status === 'FAIL') {
      console.log(`❌ Video generation failed`);
      return null;
    }
    
    // Wait 5 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  console.log(`⏰ Timeout waiting for video`);
  return null;
}

async function main() {
  console.log('🚀 Starting USDT Mining Lab Video Generation...\n');
  
  // Create directories
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }
  
  const zai = await ZAI.create();
  
  // Generate all audio files first
  console.log('\n📊 PHASE 1: Generating Audio Files\n');
  console.log('='.repeat(50));
  
  const audioFiles: { sceneId: number; path: string }[] = [];
  
  for (const scene of SCENES) {
    const filename = `scene_${scene.id}_urdu.wav`;
    const audioPath = await generateAudio(zai, scene.voiceover, filename);
    audioFiles.push({ sceneId: scene.id, path: audioPath });
  }
  
  // Generate short version audio
  console.log('\n📊 Generating Short Version Audio\n');
  for (const scene of SHORT_SCENES) {
    const filename = `short_scene_${scene.id}_urdu.wav`;
    await generateAudio(zai, scene.voiceover, filename);
  }
  
  // Generate videos
  console.log('\n📊 PHASE 2: Creating Video Tasks\n');
  console.log('='.repeat(50));
  
  const videoTasks: { sceneId: number; taskId: string }[] = [];
  
  for (const scene of SCENES) {
    const result = await generateVideo(zai, scene.videoPrompt, `scene_${scene.id}`);
    videoTasks.push({ sceneId: scene.id, taskId: result.taskId });
  }
  
  // Save task IDs for later polling
  const taskInfo = {
    createdAt: new Date().toISOString(),
    videoTasks: videoTasks,
    audioFiles: audioFiles
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'video_tasks.json'),
    JSON.stringify(taskInfo, null, 2)
  );
  
  console.log('\n📋 Video tasks created! Task IDs saved to video_tasks.json');
  console.log('Videos will be ready in approximately 5-10 minutes.');
  console.log('\n📊 PHASE 3: Polling for Video Results\n');
  console.log('='.repeat(50));
  
  // Poll for all videos
  const videoResults: { sceneId: number; videoUrl: string }[] = [];
  
  for (const task of videoTasks) {
    const videoUrl = await pollVideoResult(zai, task.taskId);
    if (videoUrl) {
      videoResults.push({ sceneId: task.sceneId, videoUrl });
    }
  }
  
  // Save final results
  const finalResults = {
    createdAt: new Date().toISOString(),
    videos: videoResults,
    audioFiles: audioFiles,
    totalScenes: SCENES.length
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'final_results.json'),
    JSON.stringify(finalResults, null, 2)
  );
  
  console.log('\n✅ Video Generation Complete!');
  console.log(`📹 Generated ${videoResults.length} videos`);
  console.log(`🎤 Generated ${audioFiles.length} audio files`);
  console.log(`📁 Results saved to: ${OUTPUT_DIR}`);
  
  return finalResults;
}

main().then(results => {
  console.log('\n🎉 All done!');
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
