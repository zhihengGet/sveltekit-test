<script>
	let uniqueId = 1;
	let styles = {
		rotate: 30,
		rotateHover: 5,
		perspective: 600,
		transitionDuration: 1,
		radius: 2,
		thickness: 50,
		bgColor: '#01060f',
		shadowColor: '#aaaaaa',
		width: 200,
		height: 300,
		pagesOffset: 3
	};
	let cssVars = Object.entries(styles)
		.map(([key, value]) => `--${key}:${value}`)
		.join(';');
</script>

<div class="book-container" style={cssVars}>
	<div class="book"><slot /></div>
</div>

<style>
	.book-container {
		display: flex;
		align-items: center;
		justify-content: center;
		perspective: var(--perspective);
	}

	@keyframes initAnimation {
		0% {
			transform: rotateY(5deg);
		}
		100% {
			transform: rotateY(30deg);
		}
	}

	.book-container .book {
		width: 200px;
		height: 300px;
		position: relative;
		transform-style: preserve-3d;
		transform: rotateY(30deg);
		transition: transform 1s ease;
		animation: 1s ease 0s 1 initAnimation;
	}

	.book-container .book:hover {
		transform: rotateY(5deg);
	}

	.book-container .book > :global(:first-child) {
		position: absolute;
		top: 0%;
		left: 0%;
		color: red;

		font-size: 100px;
		width: 200px;
		height: 300px;
		transform: translateZ(20px);
		border-radius: 0 2px 2px 0;
		box-shadow: 5px 5px 20px #aaaaaa;
		background-color: #01060f;
	}

	.book-container .book::before {
		position: absolute;
		content: ' ';
		left: 0;
		top: 3px;
		width: calc(50px - 2px);
		height: 294px;
		transform: translateX(calc(172px)) rotateY(90deg);
		background: linear-gradient(
			90deg,
			#fff 0%,
			#f9f9f9 5%,
			#fff 10%,
			#f9f9f9 15%,
			#fff 20%,
			#f9f9f9 25%,
			#fff 30%,
			#f9f9f9 35%,
			#fff 40%,
			#f9f9f9 45%,
			#fff 50%,
			#f9f9f9 55%,
			#fff 60%,
			#f9f9f9 65%,
			#fff 70%,
			#f9f9f9 75%,
			#fff 80%,
			#f9f9f9 85%,
			#fff 90%,
			#f9f9f9 95%,
			#fff 100%
		);
	}

	.book-container .book::after {
		position: absolute;
		top: 0;
		left: 0;
		content: ' ';
		width: 200px;
		height: 300px;
		transform: translateZ(12.5px);
		background-color: #01060f;
		border-radius: 0 2px 2px 0;
		box-shadow: -10px 0 50px 10px #01060f;
	}
</style>
