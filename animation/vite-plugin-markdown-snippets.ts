import fs from 'fs';
import { Plugin } from 'vite';

export default function markdownSnippets(): Plugin {
  return {
    name: 'markdown-snippets',
    load(id: string) {
      if (id.includes('?snippet=')) {
        const [mdPath, query] = id.split('?');
        const snippetName = new URLSearchParams('?' + query).get('snippet');

        const mdContent = fs.readFileSync(mdPath, 'utf8');
        let codeContent = null;

        // Use a simpler, non-catastrophic regex to find the specific snippet
        const safeSnippetName = snippetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const snippetRegex = new RegExp(`<!--[\\s\\S]*?\`CPP_COPY_SNIPPET\`\\s*${safeSnippetName}[\\s\\S]*?-->\\s*\`\`\`\\w+\\n([\\s\\S]*?)\`\`\``);
        const match = mdContent.match(snippetRegex);
        
        if (match) {
          codeContent = match[1].trim();
        }

        if (codeContent === null) {
          throw new Error(`Snippet "${snippetName}" not found in ${mdPath}`);
        }

        return `export default ${JSON.stringify(codeContent)};`;
      }
      return null;
    }
  };
}
