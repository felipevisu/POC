<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Blog</h1>

<div>
	<h2>{data.user}</h2>
	<ul>
		{#each data.repos as repo}
			<li><a href={repo.html_url}>{repo.name}</a></li>
		{/each}
	</ul>
</div>
