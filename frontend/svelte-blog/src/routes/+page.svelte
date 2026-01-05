<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
	<h1 class="mb-8 text-4xl font-bold">Blog Posts</h1>

	<div class="space-y-6">
		{#each data.posts as post}
			<article class="rounded-lg border p-6 transition-shadow hover:shadow-lg">
				<a href="/blog/{post.slug}" class="block">
					<h2 class="mb-2 text-2xl font-bold hover:text-blue-600">{post.title}</h2>
					<p class="mb-4 text-gray-600">{post.excerpt}</p>
					<div class="flex gap-4 text-sm text-gray-500">
						<span>By {post.author}</span>
						<span>•</span>
						<time>{new Date(post.published_date).toLocaleDateString()}</time>
					</div>
				</a>
			</article>
		{/each}
	</div>
</div>
