import Database from 'better-sqlite3';
import { resolve } from 'path';

const dbPath = resolve('data', 'blog.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

export function initDatabase() {
	db.exec(`
		CREATE TABLE IF NOT EXISTS posts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			slug TEXT UNIQUE NOT NULL,
			title TEXT NOT NULL,
			content TEXT NOT NULL,
			excerpt TEXT,
			author TEXT NOT NULL,
			published_date TEXT NOT NULL,
			created_at TEXT DEFAULT CURRENT_TIMESTAMP
		)
	`);
}

export function seedDatabase() {
	const count = db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };

	if (count.count === 0) {
		const insert = db.prepare(`
			INSERT INTO posts (slug, title, content, excerpt, author, published_date)
			VALUES (@slug, @title, @content, @excerpt, @author, @published_date)
		`);

		const posts = [
			{
				slug: 'getting-started-with-sveltekit',
				title: 'Getting Started with SvelteKit',
				content:
					"<p>SvelteKit is an amazing framework for building web applications. It combines the simplicity of Svelte with powerful features like server-side rendering, routing, and more.</p><p>In this post, we'll explore the basics of SvelteKit and how to get started building your first application.</p>",
				excerpt: 'Learn the basics of SvelteKit and start building modern web applications.',
				author: 'John Doe',
				published_date: '2025-12-15'
			},
			{
				slug: 'understanding-sqlite-databases',
				title: 'Understanding SQLite Databases',
				content:
					"<p>SQLite is a lightweight, file-based database that's perfect for small to medium-sized applications. It requires no server setup and stores everything in a single file.</p><p>This makes it ideal for development, testing, and production use cases where you don't need a full database server.</p>",
				excerpt: 'Discover why SQLite is perfect for your next project.',
				author: 'Jane Smith',
				published_date: '2025-12-20'
			},
			{
				slug: 'building-modern-web-apps',
				title: 'Building Modern Web Applications',
				content:
					"<p>Modern web development has evolved dramatically. Today's applications need to be fast, responsive, and provide excellent user experiences.</p><p>Frameworks like SvelteKit, Next.js, and others help us achieve these goals with less effort and better results.</p>",
				excerpt: 'Explore best practices for building modern web applications.',
				author: 'Bob Johnson',
				published_date: '2025-12-28'
			},
			{
				slug: 'typescript-best-practices',
				title: 'TypeScript Best Practices',
				content:
					"<p>TypeScript adds static typing to JavaScript, helping catch errors early and improve code quality. But using it effectively requires following some best practices.</p><p>In this article, we'll cover essential TypeScript patterns and techniques that every developer should know.</p>",
				excerpt: 'Master TypeScript with these essential best practices.',
				author: 'Alice Williams',
				published_date: '2026-01-02'
			},
			{
				slug: 'responsive-design-tips',
				title: 'Responsive Design Tips and Tricks',
				content:
					"<p>Creating responsive websites that look great on all devices is crucial in today's multi-device world. From mobile phones to tablets to desktop computers, your site needs to adapt.</p><p>Let's explore some practical tips and CSS techniques to make your designs truly responsive.</p>",
				excerpt: 'Make your websites look amazing on any device.',
				author: 'Charlie Brown',
				published_date: '2026-01-04'
			}
		];

		const insertMany = db.transaction((posts) => {
			for (const post of posts) {
				insert.run(post);
			}
		});

		insertMany(posts);
		console.log('Database seeded with sample blog posts');
	}
}

initDatabase();
seedDatabase();

export default db;
