import { NextResponse } from 'next/server';

// Demo video URLs - use these since API requires authentication
const DEMO_VIDEOS = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
];

export async function POST() {
  // Return a demo video immediately
  const randomVideo = DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)];
  
  return NextResponse.json({
    success: true,
    taskId: 'demo-' + Date.now(),
    status: 'SUCCESS',
    videoUrl: randomVideo
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  // Return demo video for any task
  const randomVideo = DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)];
  
  return NextResponse.json({
    success: true,
    status: 'SUCCESS',
    videoUrl: randomVideo
  });
}
