import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
const processor = unified()
	.use(remarkParse)
	.use(remarkRehype, { allowDangerousHtml: true })
	.use(rehypeStringify);

export async function toHTML(value: string) {
	const file = await processor.process(value);
	console.log(String(file));
	return file;
}
export const emojis = Array.from(
	`   😊 😂 ❤️ 😍 🤔 😘 😎 😅 🙏
		😢 😭 😆 😉 🤗 👍 👏 🎉 😇
		🔥 😜 🤩 💔 😑 💯 😬 👀 😳
		🙈 😏 🙄 😱 🤪 🤡 👌 💪 💥
		💗 💘 🥰 😍 ✨ 😌 💕 😍 😎
		😤 💯 😢 🎶 😴 💀 🥳 💪 💫
		💕 🎶 🐶 ✌️ 🤩 🎊 😚 😴 😭
		😱 🙊 🤗 💃 🕺 😯 🙃 😤 🍕
		💬 🌙 💥 💫 💜 🥇 ✨ 💃 🧡
		💓 🎂 ✊ 💜 🥂 😍 🎶 💀 🥳
		🐱 🍕 💪 ✌️ 🎉 👍 🙏 🤪 👏
		🕺 🎶 📚 🎮 🍀 🌈 😇 🎥 🌟
		🐶 ✨ 😍 🎂 🌞 ✊ 🎊 🌙 🎉
		💯`
).filter((v) => v.trim().length > 0 && v.charCodeAt(0) != 65039);

export const connectionCache = new Map<string, WebSocket>();
