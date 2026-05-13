import { loadConfig } from '../commands/init.js';
import { loopsFetch, initSession } from '../loops/client.js';

async function main() {
  const email = process.argv[2];
  const campaignId = process.argv[3];

  const config = loadConfig();
  initSession(config.loopsSessionToken);

  const campRes = await loopsFetch(`/api/campaigns/${campaignId}`, 'GET');
  const campData = (await campRes.json()) as { campaign: { emailMessage: { id: string } } };
  const emailMessageId = campData.campaign.emailMessage.id;
  console.log('emailMessageId:', emailMessageId);

  const res = await loopsFetch(`/api/emailMessages/${emailMessageId}/send-test`, 'POST', { email });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
}

main();
