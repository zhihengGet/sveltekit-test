let normalizedData = [];
let bookQuery = {
	data: [
		{ id: 2, customUserTags: [] },
		{ id: 12, customUserTags: [] },
		{ id: 3, customUserTags: [] },
		{ id: 4, customUserTags: [] }
	]
};
$effect(() => {
	let books = bookQuery.data.books;
	let temp = {};
	for (let x of books) {
		temp[x.id] = x;
	}
	normalizedData = { books: temp, tagList: bookQuery.data?.customUserTags };
});
$effect(() => {
	curr_data = $state.snapshot(
		bookQuery.data ?? { books: [], customUserTags: [] }
	);
});
// tag to books for remove and
// book id to tags for update book tags
let utils = $derived.by(() => {
	if (bookQuery.data) {
		let book_id_tags: any = {};
		let tag_to_books: any = {};
		let book_id_to_idx: any = {};
		let all_tags = new Set(bookQuery.data.customUserTags);
		let index = 0;
		for (let x of bookQuery.data.books) {
			book_id_to_idx[x.id] = index++;
			book_id_tags[x.id] = [];
			for (let y of x.customUserTags) {
				book_id_tags[x.id].push(y);
				tag_to_books[y] = (tag_to_books[y] || []).push(x);
			}
		}
		for (let x in tag_to_books) {
			tag_to_books[x] = uniqBy(tag_to_books[x], (v) => v.id);
		}
		return { book_id_tags, tag_to_books, all_tags, book_id_to_idx };
	}
	return {};
});

$effect(() => {
	if (darkMode) {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
});

let filteredBooks = $derived(
	books.filter(
		(book) =>
			(selectedBucket === 'default' ||
				book.customUserTags.includes(selectedBucket)) &&
			(searchQuery === '' ||
				book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				book.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				book.tags.some((tag) =>
					tag.toLowerCase().includes(searchQuery.toLowerCase())
				) ||
				book.created_at.includes(searchQuery))
	) || []
);
function addBucket(tag: string) {
	if (!curr_data || utils.all_tags?.has(tag)) {
		return;
	}
	curr_data.customUserTags.push(tag);
}
function removeBucket(tag: string) {
	curr_data.customUserTags = new Set(curr_data.customUserTags);
	curr_data.customUserTags.delete(tag);
	// remove from all tags
	const books_temp = utils.tag_to_books[tag];
	const ids = new Set(books_temp.map((v) => v.id));
	for (let x of ids) {
		const goal = normalizedData?.books[x];
		const idx = goal.tagList.findIndex((v) => v == tag);
		if (idx >= 0) {
			// found it
			goal.tagList.splice(idx, 1);
		}
	}
}
function addTagToBook(bookId: string, tag: string) {
	addBucket(tag);
	for (let x of curr_data.books) {
		if (x.id == bookId) {
			x.customUserTags = Array.from(new Set(x.customUserTags.concat([tag])));
		}
	}
}

function removeTagFromBook(bookId, tagToRemove) {
	const index = curr_data.bookId.findIndex((v) => v);
	curr_data.customUserTags.splice();
	for (let x of curr_data.books) {
		if (x.id == bookId) {
			x.customUserTags = Array.from(new Set(x.customUserTags.concat([tag])));
		}
	}
}

function toggleBookSelection(bookId) {}
const CreateNewTag = (tag: string) => {};
function bulkAddTag(tag) {}
const refreshShelvedBooks = () => {
	shouldRefresh = true;
	flushSync(() => {
		bookQuery.refetch();
	});
};
function setSearchQuery(search: string) {
	searchQuery = search;
}
