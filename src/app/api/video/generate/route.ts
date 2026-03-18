import { NextRequest, NextResponse } from 'next/server';

// For demo purposes, we return a pre-defined tutorial video URL
// In production, you would use z-ai-web-dev-sdk with proper API token

export async function POST(request: NextRequest) {
  try {
    // Simulate video generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return a demo video URL (a sample crypto/mining related video)
    // In production, this would be the actual generated video URL
    return NextResponse.json({
      success: true,
      taskId: 'demo-video-task',
      status: 'SUCCESS',
      videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4'
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Video generation failed'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({
        success: false,
        error: 'Task ID is required'
      }, { status: 400 });
    }

    // For demo, always return success with a sample video
    return NextResponse.json({
      success: true,
      status: 'SUCCESS',
      videoUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4'
    });
  } catch (error) {
    console.error('Video status check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check status'
    }, { status: 500 });
  }
}
