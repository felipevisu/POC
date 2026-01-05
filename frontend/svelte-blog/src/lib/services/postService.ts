import db from '$lib/db/database';

export interface Post {
	id: number;
	slug: string;
	title: string;
	content: string;
	excerpt: string | null;
	author: string;
	published_date: string;
	created_at: string;
}

export function getPostById(id: number): Post | undefined {
	const stmt = db.prepare('SELECT * FROM posts WHERE id = ?');
	const post = stmt.get(id) as Post | undefined;
	return post;
}

export function getPostBySlug(slug: string): Post | undefined {
	const stmt = db.prepare('SELECT * FROM posts WHERE slug = ?');
	const post = stmt.get(slug) as Post | undefined;
	return post;
}

export function getAllPosts(): Post[] {
	const stmt = db.prepare('SELECT * FROM posts ORDER BY published_date DESC');
	const posts = stmt.all() as Post[];
	return posts;
}
