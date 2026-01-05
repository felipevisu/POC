import type { LayoutServerLoad } from './$types';
import { getAllPosts } from '$lib/services/postService';

export const load: LayoutServerLoad = () => {
	return {
		posts: getAllPosts()
	};
};
