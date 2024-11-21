<script lang="ts">
	import { createChapterSchema } from '$lib/schema';
	import { Input } from '$components/ui/input';
	import { Button } from '$lib/components';
	import { useCreateChapter, useUpdateChapter } from '$lib/queries';
	import { InkStore } from '../../store.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import FormError from '$components/form/FormError.svelte';
	import { zod } from 'sveltekit-superforms/adapters';
	import { defaults } from 'sveltekit-superforms';
	let { showDescription = true, isNewChapter = false } = $props();
	const create = useCreateChapter();
	const update = useUpdateChapter();

	const { form, enhance, delayed, errors } = superForm(
		defaults(zod(createChapterSchema)),
		{
			onUpdate: () => {
				submit();
			},
			SPA: true,
			invalidateAll: false,
			//clearOnSubmit: 'none',
			dataType: 'json',
			validators: zod(createChapterSchema),
			resetForm: false,
			taintedMessage: null
		}
	);
	$effect(() => {
		if (
			InkStore.openCreateDialog == false &&
			InkStore.chapter &&
			isNewChapter == false
		) {
			const b = { ...InkStore.chapter, content: null };
			delete b.content;
			$form = $state.snapshot(b);
		}
	});
	let errMsg = $state('');
	async function submit() {
		const { success } = await createChapterSchema.safeParseAsync($form);
		if (!$form.title || typeof $form.sequence !== 'number') {
			errMsg = 'Missing title or sequence! These are required!';
			return;
		}
		if (!success) return;
		errMsg = '';
		const c = InkStore.chapter;
		if (InkStore.chapter && c && isNewChapter === false) {
			// update
			update.mutate(
				{
					...$form,
					action: 'UPDATE',
					book_id: InkStore.book.id,
					id: c.id
				},
				{
					onSuccess: () => {
						if (InkStore.chapter) {
							InkStore.chapter.title = $form.title;
							InkStore.chapter.sequence = $form.sequence;
							InkStore.chapter.authors_words = $form.authors_words;
						}
					}
				}
			);
		} else {
			create.mutate(
				{ ...$form, status: 'draft', content: '', book_id: InkStore.book.id },
				{
					onSuccess: () => {
						console.log('on success called ?');
						InkStore.openCreateDialog = false;
					}
				}
			);
		}
	}
</script>

<form class="flex flex-col gap-1 p-2" use:enhance method="post">
	<!-- 	{JSON.stringify(data)} -->
	<labe>Title</labe>
	<Input required bind:value={$form.title} />

	<em class="text-red"><FormError error={errors} key={'title'} /></em>

	<labe>Sequence</labe>
	<span class="text-sm text-gray" class:hidden={showDescription == false}>
		Sequence Number can be decimal and they will be grouped under parent
		sequence; i.e sequence 1.1 will be under sequence 1; You can use this to
		create new versions, min-chapters..etc
	</span>

	<!-- sequence -->
	<Input
		bind:value={$form.sequence}
		required
		step={0.0001}
		type="number"
		class="border-2 border-blue-200"
	/>
	<em class="text-red"><FormError error={errors} key={'sequence'} /></em>

	<!-- authors words -->
	<labe>Authors Words</labe>
	<Input bind:value={$form.authors_words} />
	<em class="text-red"><FormError error={errors} key={'authors_words'} /></em>
	<em class="text-red">{errMsg}</em>
	<Button type="submit" class="w-20" isLoading={create.isPending}>
		Submit
	</Button>
</form>
