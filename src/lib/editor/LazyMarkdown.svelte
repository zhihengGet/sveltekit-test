<script>
	import { Crepe } from '@milkdown/crepe';
	import '@milkdown/crepe/theme/common/style.css';

	// We have some themes for you to choose
	// available themes: frame, classic, nord, frame-dark, classic-dark, nord-dark
	import '@milkdown/crepe/theme/frame.css';
	$effect.pre(() => {
		const crepe = new Crepe({
			root: document.getElementById('lazy-md'),
			defaultValue: 'Hello, Milkdown!'
		});

		crepe.create().then(() => {
			console.log('Editor created');
		});
		return crepe.destroy;
	});
</script>

<span id="lazy-md"></span>
