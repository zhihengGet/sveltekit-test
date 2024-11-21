<div class="w-screen h-screen absolute top-0 left-0 z-0">
	<svg id="noice" width="100%" height="100%">
		<filter id="noise-filter">
			<feTurbulence
				type="fractalNoise"
				baseFrequency="1.82"
				numOctaves="14"
				stitchTiles="stitch"
			/>
			<feColorMatrix type="saturate" values="0" />
			<feComponentTransfer>
				<feFuncR type="linear" slope="0.25" />
				<feFuncG type="linear" slope="0.25" />
				<feFuncB type="linear" slope="0.25" />
				<feFuncA type="linear" slope="0.29" />
			</feComponentTransfer>
			<feComponentTransfer>
				<feFuncR type="linear" slope="0.6" intercept="0.20" />
				<feFuncG type="linear" slope="0.6" intercept="0.20" />
				<feFuncB type="linear" slope="0.6" intercept="0.20" />
			</feComponentTransfer>
		</filter>
		<rect width="100%" height="100%" filter="url(#noise-filter)" />
	</svg>
</div>
