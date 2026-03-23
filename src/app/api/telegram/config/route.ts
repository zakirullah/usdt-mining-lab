import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { testTelegramConnection } from '@/lib/telegram';

export async function GET() {
  try {
    const settings = await db.adminSettings.findFirst();
    
    return NextResponse.json({
      telegramEnabled: settings?.telegramEnabled || false,
      telegramBotToken: settings?.telegramBotToken ? '••••••••••••' : null,
      telegramChatId: settings?.telegramChatId || null,
      hasToken: !!settings?.telegramBotToken,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { botToken, chatId, enabled } = body;
    
    // Test the connection first
    if (botToken && chatId) {
      const testResult = await testTelegramConnection(botToken, chatId);
      if (!testResult.success) {
        return NextResponse.json({ error: testResult.message }, { status: 400 });
      }
    }
    
    // Update settings
    const settings = await db.adminSettings.findFirst();
    
    if (settings) {
      await db.adminSettings.update({
        where: { id: settings.id },
        data: {
          telegramBotToken: botToken || settings.telegramBotToken,
          telegramChatId: chatId || settings.telegramChatId,
          telegramEnabled: enabled !== undefined ? enabled : true,
        },
      });
    } else {
      await db.adminSettings.create({
        data: {
          telegramBotToken: botToken,
          telegramChatId: chatId,
          telegramEnabled: enabled !== undefined ? enabled : true,
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Telegram settings saved successfully!'
    });
  } catch (error) {
    console.error('Telegram config error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
