<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>About this site</h1>

<div>
	<h2>{data.title}</h2>
	<ul>
		{#each data.links as link}
			<li>
				<a href={link.url} target="_blank">{link.title}</a>
			</li>
		{/each}
	</ul>
</div>
