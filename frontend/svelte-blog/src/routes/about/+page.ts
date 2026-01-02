import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return {
		title: 'Social Links',
		links: [{ title: 'Github', url: 'https://github.com/felipevisu' }]
	};
};
