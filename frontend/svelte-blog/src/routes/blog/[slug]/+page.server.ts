import type { PageServerLoad } from './$types';
import { getPostBySlug } from '$lib/services/postService';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, parent }) => {
	const post = getPostBySlug(params.slug);

	if (!post) {
		throw error(404, 'Post not found');
	}

	const { posts } = await parent();

	return {
		post,
		posts
	};
};
