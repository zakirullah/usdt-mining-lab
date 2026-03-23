import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

async function generateTeamImages() {
  const zai = await ZAI.create();
  const outputDir = './public/team';
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const teamMembers = [
    {
      name: 'James Mitchell',
      role: 'CEO & Founder',
      prompt: 'Professional portrait photo of a British man in his 40s, wearing a navy blue suit, confident smile, grey hair, blue eyes, corporate headshot style, white background, studio lighting, high quality professional photo'
    },
    {
      name: 'Charlotte Davies',
      role: 'Chief Financial Officer',
      prompt: 'Professional portrait photo of a British woman in her 30s, wearing a black business blazer, blonde hair, green eyes, warm smile, corporate headshot style, white background, studio lighting, high quality professional photo'
    },
    {
      name: 'Oliver Thompson',
      role: 'Chief Technology Officer',
      prompt: 'Professional portrait photo of a British man in his 35s, wearing a casual blazer, brown hair, brown eyes, friendly expression, tech industry look, corporate headshot style, white background, studio lighting, high quality professional photo'
    },
    {
      name: 'Emma Richardson',
      role: 'Head of Operations',
      prompt: 'Professional portrait photo of a British woman in her 30s, wearing a grey business suit, dark brown hair, hazel eyes, professional smile, corporate headshot style, white background, studio lighting, high quality professional photo'
    }
  ];

  for (let i = 0; i < teamMembers.length; i++) {
    const member = teamMembers[i];
    const filename = `member_${i + 1}.png`;
    const outputPath = path.join(outputDir, filename);

    console.log(`Generating image for ${member.name}...`);

    try {
      const response = await zai.images.generations.create({
        prompt: member.prompt,
        size: '1024x1024'
      });

      const imageBase64 = response.data[0].base64;
      const buffer = Buffer.from(imageBase64, 'base64');
      fs.writeFileSync(outputPath, buffer);

      console.log(`✓ Saved: ${outputPath}`);
    } catch (error) {
      console.error(`✗ Failed to generate image for ${member.name}:`, error);
    }
  }

  console.log('Team image generation complete!');
}

generateTeamImages().catch(console.error);
