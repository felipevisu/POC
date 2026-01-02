<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1>Blog</h1>

<div>
	<h2>{data.title}</h2>
</div>
