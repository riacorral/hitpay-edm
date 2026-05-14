import { LoopsClient } from 'loops';
import { loadConfig } from '../src/commands/init.js';

const config = loadConfig();
const client = new LoopsClient(config.loopsApiKey!);

const result = await client.testApiKey();
console.log('API Key test:', JSON.stringify(result));

const lists = await client.getMailingLists();
console.log('Mailing lists:', JSON.stringify(lists, null, 2));

const templates = await client.getTransactionalEmails();
console.log('Transactional templates:', JSON.stringify(templates, null, 2));
