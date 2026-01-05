import type { PageServerLoad } from './$types';
import { getPostBySlug } from '$lib/services/postService';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = ({ params }) => {
	const post = getPostBySlug(params.slug);

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post
	};
};
