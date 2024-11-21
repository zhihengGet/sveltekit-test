import type { Plugin } from 'vite';
import shell from 'child_process';
const fileRegex = /\.(my-file-ext)$/;

export default function myPlugin(): Plugin {
	return {
		name: 'build cloudflare workers/durable objects',
		closeBundle() {
			console.log('build');
			let rest = shell.execSync('bash ./cmd/util.sh');
			console.log('update cf workers', rest);
		}
	};
}
