import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

async function generatePromoVideo() {
  console.log('🎬 Starting video generation for USDT Mining Lab...\n');

  const zai = await ZAI.create();

  // Create video generation task
  const task = await zai.video.generations.create({
    prompt: 'Professional cryptocurrency mining platform tutorial showing: Step 1 Register Account with wallet address animation, Step 2 Deposit USDT coins to platform wallet, Step 3 Activate Mining Plan with glowing effects, Step 4 Withdraw profits with success animation. Dark futuristic theme with cyan and gold accents, smooth transitions, Text overlays: How to Register, How to Deposit, Buy Mining Plan, How to Withdraw.',
    quality: 'quality',
    duration: 10,
    fps: 30,
    size: '1344x768'
  });

  console.log('📋 Task created!');
  console.log('Task ID:', task.id);
  console.log('Status:', task.task_status);

  // Poll for results
  let result = await zai.async.result.query(task.id);
  let pollCount = 0;
  const maxPolls = 120;
  const pollInterval = 5000;

  while (result.task_status === 'PROCESSING' && pollCount < maxPolls) {
    pollCount++;
    console.log(`⏳ Polling ${pollCount}/${maxPolls}: Status is ${result.task_status}`);
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    result = await zai.async.result.query(task.id);
  }

  if (result.task_status === 'SUCCESS') {
    const videoUrl = result.video_result?.[0]?.url ||
                    result.video_url ||
                    result.url ||
                    result.video;
    console.log('\n✅ Video generated successfully!');
    console.log('📹 Video URL:', videoUrl);
    
    // Save the result
    const outputPath = '/home/z/my-project/public/promo-video-result.json';
    fs.writeFileSync(outputPath, JSON.stringify({
      taskId: task.id,
      status: 'SUCCESS',
      videoUrl: videoUrl,
      fullResult: result
    }, null, 2));
    console.log('📁 Result saved to:', outputPath);
    
    return videoUrl;
  } else {
    console.log('❌ Task failed or timed out');
    console.log('Status:', result.task_status);
    return null;
  }
}

generatePromoVideo().then(url => {
  if (url) {
    console.log('\n🎉 Done! Video URL:', url);
  } else {
    console.log('\n❌ Video generation failed');
  }
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
