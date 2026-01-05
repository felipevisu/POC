import type { PageServerLoad } from './$types';
import { getAllPosts } from '$lib/services/postService';

export const load: PageServerLoad = () => {
	const posts = getAllPosts();
	
	return {
		posts
	};
};
