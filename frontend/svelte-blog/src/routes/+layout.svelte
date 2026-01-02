<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav>
	<a href="/">Home</a>
	<a href="/about">About</a>
	<a href="/blog">blog</a>
</nav>

{@render children()}
