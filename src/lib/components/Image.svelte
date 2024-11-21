<img
	class="object-cover w-full book"
	{...$$props}
	onerror={(e) => {
		console.error('failed to load');
		if (e.target.getAttribute('data-failed')) {
			return;
		}
		console.log('update src', e.target);
		e.target.setAttribute('data-failed', 'true');
		//e.target.setAttribute('data-url', e.target.getAttribute('src'));
		e.target.setAttribute('src', '/book_placeholder/cover.png');
	}}
/>
