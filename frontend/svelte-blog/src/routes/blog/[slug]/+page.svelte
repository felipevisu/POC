<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let index = $derived(data.posts.findIndex((post) => post.slug === page.params.slug));
	let next = $derived(data.posts[index + 1]);
</script>

<article class="mx-auto max-w-4xl px-4 py-8">
	<header class="mb-8">
		<h1 class="mb-4 text-4xl font-bold">{data.post.title}</h1>
		<div class="flex gap-4 text-gray-600">
			<span>By {data.post.author}</span>
			<span>•</span>
			<time>{new Date(data.post.published_date).toLocaleDateString()}</time>
		</div>
	</header>

	<div class="prose prose-lg max-w-none">
		{@html data.post.content}
	</div>

	{#if next}
		<hr class="my-6" />
		<p>Next post: <a href="/blog/{next.slug}">{next.title}</a></p>
	{/if}
</article>
