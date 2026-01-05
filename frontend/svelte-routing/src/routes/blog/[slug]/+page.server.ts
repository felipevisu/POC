import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type GitHubRepo = {
	id: number;
	name: string;
	html_url: string;
};

export const load: PageServerLoad = async ({ params }) => {
	const response = await fetch(`https://api.github.com/users/${params.slug}/repos`);

	if (response.status === 200) {
		const data: GitHubRepo[] = await response.json();
		const repos = data.map((item) => ({
			id: item.id,
			name: item.name,
			html_url: item.html_url
		}));
		return {
			user: params.slug,
			repos: repos
		};
	}

	error(404, 'Not found');
};
