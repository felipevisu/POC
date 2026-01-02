import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return {
		title: 'This is the ' + params.slug + ' page'
	};
};
